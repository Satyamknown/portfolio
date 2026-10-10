import { Sk, SkLines } from './Skeleton.jsx';

// Generic fallback for anything without a page-specific skeleton.
export default function Loading() {
  return (
    <div className="sk-wrap sk-lines" style={{ gap: 14, padding: '48px 0' }} aria-busy="true" role="status">
      <span className="sk-sr">Loading content</span>
      <Sk w="40%" h={24} r={8} />
      <SkLines lines={3} last="55%" h={14} />
    </div>
  );
}
