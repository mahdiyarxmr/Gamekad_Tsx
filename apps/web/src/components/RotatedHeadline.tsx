const ROT = [-3, 1.5, -1.5, 2.5, 0, 3];

export default function RotatedHeadline({
  text,
  as: Tag = 'h1',
  className = '',
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline">
        {words.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className="inline-block mx-[0.12em]"
            style={{ transform: `rotate(${ROT[i % ROT.length]}deg)` }}
          >
            {w}
          </span>
        ))}
      </span>
    </Tag>
  );
}
