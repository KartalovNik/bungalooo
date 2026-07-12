// Комплект прости линейни икони (наследяват currentColor).
const P = {
  bath: <><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" /><path d="M6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2" /><path d="M6 19l-1 2M18 19l1 2" /></>,
  ac: <><rect x="2.5" y="5" width="19" height="9" rx="2" /><path d="M6 18v.5M9 18.5V19M12 18v1M15 18.5V19M18 18v.5" /><path d="M5.5 10.5h13" /></>,
  parking: <><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M9 16V8h3.2a2.4 2.4 0 0 1 0 4.8H9" /></>,
  kitchen: <><path d="M7 2v7a3 3 0 0 0 6 0V2M10 2v20M17 2c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v11" /></>,
  kids: <><circle cx="12" cy="5" r="2.2" /><path d="M12 7.5V15M12 15l-3.5 5M12 15l3.5 5M7 11h10" /></>,
  beach: <><path d="M3 20h18" /><path d="M13 20V9M13 9c3-3 7-1 8 1-3-1.5-6 .5-8-1Z" /><path d="M13 9C10 6 6 8 5 10c3-1.5 6 .5 8-1Z" /></>,
  heart: <><path d="M12 20s-7-4.5-9.3-9C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.3 6.5C19 15.5 12 20 12 20Z" /></>,
  heartFilled: <><path d="M12 20s-7-4.5-9.3-9C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.3 6.5C19 15.5 12 20 12 20Z" fill="currentColor" stroke="none" /></>,
  phone: <><path d="M6.5 3.5 4 6c0 8 6 14 14 14l2.5-2.5-3.5-3-2 1.5c-2.5-1-4-2.5-5-5l1.5-2-3-3.5Z" /></>,
  share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8 15.8 6.5M8.2 13.2l7.6 4.3" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" /></>,
  link: <><path d="M10 13a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5" /><path d="M14 11a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.5-1.5" /></>,
  map: <><path d="M9 3 3 5.5v15L9 18l6 3 6-2.5v-15L15 6 9 3Z" /><path d="M9 3v15M15 6v15" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  filter: <><path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" /></>,
  sort: <><path d="M4 7h11M4 12h7M4 17h4" /><path d="M17 5v14M17 19l3-3M17 19l-3-3" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  edit: <><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="M13.5 6.5l3 3" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  archive: <><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" /></>,
  duplicate: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M4 16V6a2 2 0 0 1 2-2h10" /></>,
  check: <><path d="M5 12l5 5L20 6" /></>,
  chevron: <><path d="M6 9l6 6 6-6" /></>,
  external: <><path d="M14 4h6v6M20 4l-8 8" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
  download: <><path d="M12 3v12M8 11l4 4 4-4" /><path d="M4 19h16" /></>,
  upload: <><path d="M12 17V5M8 9l4-4 4 4" /><path d="M4 19h16" /></>,
  print: <><path d="M7 8V3h10v5" /><rect x="4" y="8" width="16" height="8" rx="2" /><path d="M7 14h10v6H7z" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  dots: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
  warning: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 9v5M12 17v.5" /></>,
  cloud: <><path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A3.5 3.5 0 0 1 18 18H7Z" /></>,
  cloudOff: <><path d="M7 18a4 4 0 0 1-.9-7.9M9 5.5A5 5 0 0 1 16.6 8.5 3.5 3.5 0 0 1 19 15" /><path d="M3 3l18 18" /></>,
  star: <><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8L12 3.5Z" /></>,
  logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 12h10M17 9l3 3-3 3" /></>,
  login: <><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M14 12H4M11 9l3 3-3 3" /><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8v.5" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="M4 17l5-5 4 4 3-3 4 4" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7M3 4v3.5h3.5" /><path d="M12 8v4l3 2" /></>,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 5.5a3 3 0 0 1 0 5M17 20a5.5 5.5 0 0 0-2-4.3" /></>,
}

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.9, ...rest }) {
  const paths = P[name]
  if (!paths) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths}
    </svg>
  )
}
