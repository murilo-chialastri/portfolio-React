const paths = {
  arrow: 'M7 17 17 7M7 7h10v10',
  right: 'm9 5 7 7-7 7',
  left: 'm15 5-7 7 7 7',
  down: 'M12 4v16m-6-6 6 6 6-6',
  sun: 'M12 3v1m0 16v1M3 12h1m16 0h1M5.6 5.6l.7.7m11.4 11.4.7.7M5.6 18.4l.7-.7M17.7 6.3l.7-.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon: 'M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'm6 6 12 12M6 18 18 6',
  github:
    'M9 19c-5 1-5-2-7-2m14 5v-4a3.5 3.5 0 0 0-1-2.7c3.3-.4 6.8-1.6 6.8-7.3A5.7 5.7 0 0 0 20 4c.2-1.3-.1-2.6-.5-3 0 0-1.2-.4-4 1.5a13.7 13.7 0 0 0-7 0C5.7.6 4.5 1 4.5 1 4.1 1.4 3.8 2.7 4 4a5.7 5.7 0 0 0-1.8 4c0 5.7 3.5 6.9 6.8 7.3A3.5 3.5 0 0 0 8 18v4',
  mail: 'M3 5h18v14H3zM3 5l9 7 9-7',
  check: 'm5 12 4 4L19 6',
}

export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.arrow} />
    </svg>
  )
}
