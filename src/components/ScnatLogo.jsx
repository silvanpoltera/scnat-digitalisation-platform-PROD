export function ScnatMark({ size = 24, className = '' }) {
  return (
    <img
      src="/scnat-icon.png"
      alt="SCNAT"
      width={size}
      height={size}
      className={`rounded-sm ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

export default function ScnatLogo({ size = 24, subtitle = 'Digitalisierung', className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ScnatMark size={size} />
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-heading font-bold tracking-wide text-txt-primary uppercase">
          SCNAT
        </span>
        <span className="text-[9px] text-txt-tertiary">{subtitle}</span>
      </div>
    </div>
  );
}
