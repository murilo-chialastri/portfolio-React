begin;

-- Only SQL administrators may enroll owners. Auth user_metadata is never trusted.
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table public.messages (
  id uuid primary key,
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) between 3 and 254),
  subject text not null check (char_length(subject) between 3 and 160),
  message text not null check (char_length(message) between 20 and 5000),
  responded boolean not null default false,
  email_status text not null default 'pending'
    check (email_status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now()
);
create index messages_created_at_idx on public.messages (created_at desc);

create table public.featured_projects (
  repo_id bigint primary key check (repo_id > 0),
  full_name text not null check (
    char_length(full_name) <= 200
    and full_name ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'
  ),
  position integer not null default 0 check (position >= 0)
);

alter table public.admin_users enable row level security;
alter table public.messages enable row level security;
alter table public.featured_projects enable row level security;

-- Supabase defaults can grant broad table access: explicitly replace them.
revoke all on table public.admin_users, public.messages, public.featured_projects
  from public, anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
grant select (user_id) on public.admin_users to authenticated;
grant select on public.messages to authenticated;
grant update (responded) on public.messages to authenticated;
grant select on public.featured_projects to anon, authenticated;
grant insert (repo_id, full_name, position), update (repo_id, full_name, position), delete
  on public.featured_projects to authenticated;

create policy admin_reads_own_membership on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create policy admin_reads_messages on public.messages
  for select to authenticated using (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
create policy admin_marks_messages_responded on public.messages
  for update to authenticated using (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );

create policy everyone_reads_featured_projects on public.featured_projects
  for select to anon, authenticated using (true);
create policy admin_inserts_featured_projects on public.featured_projects
  for insert to authenticated with check (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
create policy admin_updates_featured_projects on public.featured_projects
  for update to authenticated using (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
create policy admin_deletes_featured_projects on public.featured_projects
  for delete to authenticated using (
    exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );

-- Do NOT add this schema to the Data API exposed schemas.
create schema contact_private;
revoke all on schema contact_private from public, anon, authenticated, service_role;

create table contact_private.deliveries (
  message_id uuid primary key references public.messages(id) on delete restrict,
  fingerprint bytea not null,
  mail_payload jsonb not null,
  attempts integer not null default 0,
  lease_token uuid,
  lease_until timestamptz,
  retry_until timestamptz not null,
  next_attempt_at timestamptz not null,
  provider_id text,
  last_error text check (last_error in ('provider_rejected', 'provider_unavailable', 'retry_exhausted'))
);
create table contact_private.attempts (
  email_key bytea not null,
  created_at timestamptz not null
);
create index contact_attempts_created_idx on contact_private.attempts (created_at);
create index contact_attempts_email_idx on contact_private.attempts (email_key, created_at);
alter table contact_private.deliveries enable row level security;
alter table contact_private.attempts enable row level security;
revoke all on all tables in schema contact_private from public, anon, authenticated, service_role;

-- All reservations share a transaction lock. The sliding quotas, UUID check,
-- durable message insert and delivery lease therefore commit together.
create function contact_private.reserve(
  p_submission_id uuid, p_name text, p_email text, p_subject text,
  p_message text, p_from text
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_now timestamptz;
  v_fingerprint bytea;
  v_email_key bytea;
  v_delivery contact_private.deliveries%rowtype;
  v_status text;
  v_token uuid;
begin
  if p_submission_id is null
     or p_submission_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
     or p_name is null or char_length(p_name) not between 2 and 100
     or p_email is null or char_length(p_email) > 254
     or p_email !~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)+$'
     or p_email <> lower(btrim(p_email))
     or p_subject is null or char_length(p_subject) not between 3 and 160
     or p_message is null or char_length(p_message) not between 20 and 5000
     or p_name ~ '[[:cntrl:]]' or p_subject ~ '[[:cntrl:]]'
     or p_message ~ '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]'
     or p_name <> btrim(p_name) or p_subject <> btrim(p_subject)
     or p_message <> btrim(p_message)
     or p_from is null or char_length(p_from) not between 3 and 320
     or p_from ~ '[[:cntrl:]]'
  then
    return jsonb_build_object('state', 'invalid');
  end if;

  v_fingerprint := sha256(convert_to(jsonb_build_array(p_name, p_email, p_subject, p_message)::text, 'UTF8'));
  v_email_key := sha256(convert_to(p_email, 'UTF8'));
  perform pg_advisory_xact_lock(20261029, 1);
  v_now := clock_timestamp();

  select * into v_delivery from contact_private.deliveries
    where message_id = p_submission_id for update;
  if found then
    if v_delivery.fingerprint <> v_fingerprint then
      return jsonb_build_object('state', 'conflict');
    end if;
    select email_status into v_status from public.messages where id = p_submission_id;
    if v_status = 'sent' then
      return jsonb_build_object('state', 'sent');
    end if;
    if v_delivery.lease_until > v_now then
      return jsonb_build_object('state', 'busy', 'retry_after', 90);
    end if;
    if v_delivery.retry_until <= v_now or v_delivery.attempts >= 5 then
      update public.messages set email_status = 'failed' where id = p_submission_id;
      update contact_private.deliveries set last_error = 'retry_exhausted' where message_id = p_submission_id;
      return jsonb_build_object('state', 'expired');
    end if;
    if v_delivery.next_attempt_at > v_now then
      return jsonb_build_object('state', 'busy', 'retry_after', 30);
    end if;
  end if;

  -- Count retries too. Neither forged Origin/IP nor random submission IDs bypass
  -- the global quotas. Rejections never create a message or consume a send lease.
  delete from contact_private.attempts where created_at < v_now - interval '1 day';
  if (select count(*) from contact_private.attempts where created_at > v_now - interval '1 minute') >= 10
     or (select count(*) from contact_private.attempts where created_at > v_now - interval '1 hour') >= 100
     or (select count(*) from contact_private.attempts
         where email_key = v_email_key and created_at > v_now - interval '15 minutes') >= 3
  then
    return jsonb_build_object('state', 'limited', 'retry_after', 900);
  end if;

  insert into contact_private.attempts (email_key, created_at) values (v_email_key, v_now);
  if v_delivery.message_id is null then
    insert into public.messages (id, name, email, subject, message)
      values (p_submission_id, p_name, p_email, p_subject, p_message);
    insert into contact_private.deliveries (
      message_id, fingerprint, mail_payload, retry_until, next_attempt_at
    ) values (
      p_submission_id, v_fingerprint,
      jsonb_build_object(
        'from', p_from,
        'to', jsonb_build_array('murilocastro233@gmail.com'),
        'reply_to', p_email,
        'subject', '[CP3] ' || p_subject,
        'text', 'Nome: ' || p_name || E'\nEmail: ' || p_email || E'\n\n' || p_message
          || E'\n\nProtocolo: ' || p_submission_id::text
      ),
      v_now + interval '23 hours', v_now
    );
  end if;

  v_token := gen_random_uuid();
  update contact_private.deliveries
    set attempts = attempts + 1, lease_token = v_token,
        lease_until = v_now + interval '90 seconds',
        next_attempt_at = v_now + interval '30 seconds', last_error = null
    where message_id = p_submission_id returning * into v_delivery;
  update public.messages set email_status = 'pending' where id = p_submission_id;
  return jsonb_build_object(
    'state', 'send', 'lease_token', v_token, 'lease_until', v_delivery.lease_until,
    'retry_until', v_delivery.retry_until, 'mail_payload', v_delivery.mail_payload
  );
end;
$$;

create function contact_private.finish(
  p_submission_id uuid, p_lease_token uuid, p_status text,
  p_provider_id text default null, p_error text default null
) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_delivery contact_private.deliveries%rowtype;
begin
  if p_status is null or p_status not in ('sent', 'failed')
     or (p_status = 'sent' and (p_provider_id is null or char_length(p_provider_id) not between 1 and 200))
     or (p_status = 'failed' and (p_error is null or p_error not in ('provider_rejected', 'provider_unavailable')))
  then
    return false;
  end if;
  select * into v_delivery from contact_private.deliveries
    where message_id = p_submission_id for update;
  if not found or p_lease_token is null or v_delivery.lease_token is distinct from p_lease_token then
    return false;
  end if;
  update public.messages set email_status = p_status where id = p_submission_id;
  update contact_private.deliveries
    set lease_token = null, lease_until = null, provider_id = p_provider_id, last_error = p_error
    where message_id = p_submission_id;
  return true;
end;
$$;

-- Exposed RPCs are invokers; only their private implementations elevate rights.
create function public.contact_reserve(
  p_submission_id uuid, p_name text, p_email text, p_subject text, p_message text, p_from text
) returns jsonb language sql security invoker set search_path = ''
as $$ select contact_private.reserve(p_submission_id, p_name, p_email, p_subject, p_message, p_from); $$;
create function public.contact_finish(
  p_submission_id uuid, p_lease_token uuid, p_status text,
  p_provider_id text default null, p_error text default null
) returns boolean language sql security invoker set search_path = ''
as $$ select contact_private.finish(p_submission_id, p_lease_token, p_status, p_provider_id, p_error); $$;

revoke all on function contact_private.reserve(uuid, text, text, text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function contact_private.finish(uuid, uuid, text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.contact_reserve(uuid, text, text, text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.contact_finish(uuid, uuid, text, text, text)
  from public, anon, authenticated, service_role;
grant usage on schema contact_private to service_role;
grant execute on function contact_private.reserve(uuid, text, text, text, text, text) to service_role;
grant execute on function contact_private.finish(uuid, uuid, text, text, text) to service_role;
grant execute on function public.contact_reserve(uuid, text, text, text, text, text) to service_role;
grant execute on function public.contact_finish(uuid, uuid, text, text, text) to service_role;

commit;
