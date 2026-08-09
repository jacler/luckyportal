type Props = { className?: string }

export function LogoMark({ className = '' }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="2" y="2" width="44" height="8" rx="2" fill="currentColor" />
      <rect x="2" y="16" width="30" height="8" rx="2" fill="currentColor" />
      <rect x="2" y="30" width="18" height="8" rx="2" fill="currentColor" />
    </svg>
  )
}
