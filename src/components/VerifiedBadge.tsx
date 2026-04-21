export default function VerifiedBadge({
  className = 'w-[18px] h-[18px]',
  color = '#1d9bf0',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" fill={color} />
      <path
        fill="#fff"
        d="m10.08 15.52-2.9-2.9 1.42-1.42 1.48 1.48 5.32-5.32 1.42 1.42-6.74 6.74Z"
      />
    </svg>
  );
}
