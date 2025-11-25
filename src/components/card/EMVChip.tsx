interface EMVChipProps {
  variant: 'gold' | 'silver';
  size?: 'sm' | 'md';
}

export const EMVChip = ({ variant, size = 'md' }: EMVChipProps) => {
  const sizeClasses = size === 'sm' ? 'w-10 h-7' : 'w-12 h-10';
  const chipStyles = {
    gold: {
      background: 'linear-gradient(145deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%)',
    },
    silver: {
      background: 'linear-gradient(145deg, #C0C0C0 0%, #E8E8E8 50%, #A8A8A8 100%)',
    },
  };

  return (
    <div
      className={`${sizeClasses} rounded-md relative overflow-hidden`}
      style={{
        background: chipStyles[variant].background,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      {/* Chip contact lines - simulating real EMV chip contacts */}
      <div className="absolute inset-1 border border-black/20 rounded-sm">
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/15" />
        {/* Horizontal line */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-black/15" />
        {/* Grid pattern for authenticity */}
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-black/10" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-black/10" />
        <div className="absolute left-0 right-0 top-1/4 h-px bg-black/10" />
        <div className="absolute left-0 right-0 top-3/4 h-px bg-black/10" />
      </div>
    </div>
  );
};
