-- Regression suite for a disposable Supabase test database, never production.
-- All fixtures and state changes roll back. psql must use ON_ERROR_STOP=1.
begin;

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'owner@example.test', '{}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'outsider@example.test', '{"role":"admin","is_admin":true}'::jsonb);
insert into public.admin_users values ('11111111-1111-4111-8111-111111111111');
insert into public.messages (id, name, email, subject, message) values
  ('33333333-3333-4333-8333-333333333333', 'Pessoa Teste', 'test@example.test', 'Assunto', 'Mensagem de teste com mais de vinte caracteres.');
insert into public.featured_projects values (999999999999999, 'owner/project', 0);

do $$
begin
  if has_table_privilege('anon', 'public.messages', 'SELECT')
    or has_table_privilege('authenticated', 'public.admin_users', 'INSERT')
    or has_column_privilege('authenticated', 'public.messages', 'email_status', 'UPDATE')
    or has_table_privilege('authenticated', 'public.messages', 'INSERT')
    or has_table_privilege('authenticated', 'public.messages', 'DELETE')
    or has_table_privilege('service_role', 'public.messages', 'INSERT')
    or has_function_privilege('anon', 'public.contact_reserve(uuid,text,text,text,text,text)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.contact_finish(uuid,uuid,text,text,text)', 'EXECUTE')
    or has_schema_privilege('authenticated', 'contact_private', 'USAGE')
  then raise exception 'Unexpected privilege'; end if;
end;
$$;

set local role anon;
do $$ begin
  if not exists (select 1 from public.featured_projects where repo_id = 999999999999999)
  then raise exception 'Public projects invisible'; end if;
  begin
    perform * from public.messages;
    raise exception 'Anonymous messages exposed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.contact_reserve(gen_random_uuid(), 'Teste', 'anon@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
    raise exception 'Anonymous RPC allowed';
  exception when insufficient_privilege then null;
  end;
end; $$;
reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","user_metadata":{"role":"admin","is_admin":true}}';
do $$ declare changed integer; begin
  if exists (select 1 from public.admin_users) or exists (select 1 from public.messages)
  then raise exception 'Non-admin read private data'; end if;
  update public.messages set responded = true where id = '33333333-3333-4333-8333-333333333333';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Non-admin changed responded'; end if;
  update public.featured_projects set position = 99 where repo_id = 999999999999999;
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Non-admin changed projects'; end if;
  begin
    insert into public.featured_projects values (999999999999998, 'bad/project', 0);
    raise exception 'Non-admin inserted a project';
  exception when insufficient_privilege then null;
  end;
end; $$;
reset role;

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';
do $$ declare changed integer; begin
  if not exists (select 1 from public.admin_users) or not exists (select 1 from public.messages where id = '33333333-3333-4333-8333-333333333333')
  then raise exception 'Admin cannot read'; end if;
  update public.messages set responded = true where id = '33333333-3333-4333-8333-333333333333';
  get diagnostics changed = row_count;
  if changed <> 1 then raise exception 'Admin cannot mark responded'; end if;
  begin
    update public.messages set email_status = 'sent';
    raise exception 'Admin forged delivery status';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.admin_users values ('22222222-2222-4222-8222-222222222222');
    raise exception 'Admin elevated another user through Data API';
  exception when insufficient_privilege then null;
  end;
  insert into public.featured_projects values (999999999999998, 'admin/project', 1);
  update public.featured_projects set position = 2 where repo_id = 999999999999998;
  delete from public.featured_projects where repo_id = 999999999999998;
end; $$;
reset role;

-- Only disposable test data: reset counters within the rolled-back transaction.
delete from contact_private.attempts;
do $$
declare
  submission uuid := gen_random_uuid();
  result jsonb;
  first_payload jsonb;
  old_token uuid;
  retry_token uuid;
  other_id uuid;
begin
  result := public.contact_reserve(submission, 'Teste', 'rpc@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  if result->>'state' <> 'send' then raise exception 'Initial reserve failed: %', result; end if;
  first_payload := result->'mail_payload';
  old_token := (result->>'lease_token')::uuid;
  if not exists (select 1 from public.messages where id = submission and email_status = 'pending')
  then raise exception 'Message not saved before sending'; end if;
  result := public.contact_reserve(submission, 'Teste', 'rpc@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  if result->>'state' <> 'busy' then raise exception 'Concurrent retry acquired live lease'; end if;
  result := public.contact_reserve(submission, 'Teste', 'rpc@example.test', 'Outro assunto', repeat('a', 20), 'from@example.test');
  if result->>'state' <> 'conflict' then raise exception 'UUID accepted different payload'; end if;
  if public.contact_finish(submission, gen_random_uuid(), 'sent', 'fake')
  then raise exception 'Wrong lease token accepted'; end if;
  if not public.contact_finish(submission, old_token, 'failed', null, 'provider_unavailable')
  then raise exception 'Failed status not saved'; end if;
  update contact_private.deliveries set next_attempt_at = now() - interval '1 minute' where message_id = submission;
  result := public.contact_reserve(submission, 'Teste', 'rpc@example.test', 'Assunto', repeat('a', 20), 'changed@example.test');
  if result->>'state' <> 'send' or result->'mail_payload' <> first_payload
  then raise exception 'Retry payload changed'; end if;
  retry_token := (result->>'lease_token')::uuid;
  if public.contact_finish(submission, old_token, 'sent', 'stale')
  then raise exception 'Stale worker finalized newer lease'; end if;
  if not public.contact_finish(submission, retry_token, 'sent', 'provider-id')
  then raise exception 'Sent status not saved'; end if;
  result := public.contact_reserve(submission, 'Teste', 'rpc@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  if result->>'state' <> 'sent' or (select count(*) from public.messages where id = submission) <> 1
  then raise exception 'Successful replay not idempotent'; end if;

  for counter in 1..4 loop
    other_id := gen_random_uuid();
    result := public.contact_reserve(other_id, 'Teste', 'limited@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
    if counter <= 3 and result->>'state' <> 'send' then raise exception 'Quota rejected too soon'; end if;
    if counter = 4 and (result->>'state' <> 'limited' or exists (select 1 from public.messages where id = other_id))
    then raise exception 'Quota bypassed or rejected message inserted'; end if;
  end loop;

  other_id := gen_random_uuid();
  result := public.contact_reserve(other_id, 'Teste', 'expired@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  update contact_private.deliveries set lease_until = now() - interval '1 minute', retry_until = now() - interval '1 minute' where message_id = other_id;
  result := public.contact_reserve(other_id, 'Teste', 'expired@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  if result->>'state' <> 'expired' then raise exception 'Expired key was resent'; end if;
end;
$$;

-- Exercise the global sliding windows and the per-submission attempt ceiling.
delete from contact_private.attempts;
do $$
declare
  submission uuid;
  result jsonb;
  lease uuid;
begin
  -- Previous attempts can belong to any sender; global budgets still apply.
  insert into contact_private.attempts (email_key, created_at)
    select sha256(convert_to('previous-' || counter, 'UTF8')), clock_timestamp()
    from generate_series(1, 10) as counter;
  submission := gen_random_uuid();
  result := public.contact_reserve(submission, 'Teste', 'global@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  if result->>'state' <> 'limited' or exists (select 1 from public.messages where id = submission)
  then raise exception 'Global minute budget bypassed'; end if;

  delete from contact_private.attempts;
  insert into contact_private.attempts (email_key, created_at)
    select sha256(convert_to('previous-' || counter, 'UTF8')), clock_timestamp() - interval '2 minutes'
    from generate_series(1, 100) as counter;
  result := public.contact_reserve(submission, 'Teste', 'global@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  if result->>'state' <> 'limited' then raise exception 'Global hour budget bypassed'; end if;

  delete from contact_private.attempts;
  result := public.contact_reserve(submission, 'Teste', 'global@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  -- Simulate a terminated worker: its lease expires without finalization.
  lease := (result->>'lease_token')::uuid;
  update contact_private.deliveries set lease_until = now() - interval '1 minute', next_attempt_at = now() - interval '1 minute'
    where message_id = submission;
  result := public.contact_reserve(submission, 'Teste', 'global@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  if result->>'state' <> 'send' or (result->>'lease_token')::uuid = lease
  then raise exception 'Abandoned lease not reclaimed'; end if;
  update contact_private.deliveries set attempts = 5, lease_until = now() - interval '1 minute'
    where message_id = submission;
  result := public.contact_reserve(submission, 'Teste', 'global@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  if result->>'state' <> 'expired' then raise exception 'Attempt ceiling bypassed'; end if;
end;
$$;

set local role service_role;
do $$ declare result jsonb; begin
  result := public.contact_reserve(gen_random_uuid(), 'Service', 'service@example.test', 'Assunto', repeat('a', 20), 'from@example.test');
  if result->>'state' <> 'send' then raise exception 'Service RPC denied'; end if;
end; $$;
reset role;

rollback;
