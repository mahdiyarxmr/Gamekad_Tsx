type Variant = 'wordmark' | 'emblem' | 'membership-mark' | 'light' | 'dark';

const SRC: Record<Variant, string> = {
  wordmark: '/assets/brand/wordmark.png',
  emblem: '/assets/brand/logo-emblem.png',
  'membership-mark': '/assets/brand/mark-teal.png',
  light: '/assets/brand/mark-black.png',
  dark: '/assets/brand/mark-white.png',
};

export default function BrandLogo({
  variant = 'wordmark',
  className = '',
  alt,
}: {
  variant?: Variant;
  className?: string;
  alt?: string;
}) {
  const label = alt ?? (variant === 'membership-mark' ? 'عضو رکاد' : 'رکاد');
  if (variant === 'membership-mark') {
    const large = className.includes('rokad-mark-lg');
    return (
      <img
        src={SRC[variant]}
        alt={label}
        title="هنرستان رکاد"
        className={`rokad-mark ${className}`}
        width={large ? 16 : 13}
        height={large ? 16 : 13}
        draggable={false}
      />
    );
  }
  return (
    <img
      src={SRC[variant]}
      alt={label}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}
