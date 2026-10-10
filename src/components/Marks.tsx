import { BookOpen, FlaskConical, Leaf, ShieldHalf, Skull, WandSparkles } from 'lucide-react';
import type { SubjectIcon as IconType } from '../types/portal';

const subjectIcons = {
  flask: FlaskConical,
  shield: ShieldHalf,
  wand: WandSparkles,
  book: BookOpen,
  plant: Leaf,
  skull: Skull,
};

export function SubjectIcon({ type, size = 22 }: { type: IconType; size?: number }) {
  const Icon = subjectIcons[type];
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />;
}

export function SerpentMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`serpent-mark ${className}`} viewBox="0 0 40 48" fill="none" aria-hidden="true">
      <path
        d="M25 7c-9-4-18 5-14 12 3 5 15 2 18 8 5 10-8 19-17 13-7-5-3-12 3-12 5 0 8 5 4 8"
        stroke="currentColor"
        strokeWidth="3.3"
        strokeLinecap="round"
      />
      <path d="m24 3 6 6-9 4 2-5Z" fill="currentColor" />
      <circle cx="25.5" cy="7.7" r=".8" fill="#07120e" />
      <path d="m29 9 5 1m-2-1 2-1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function Ornament() {
  return (
    <span className="ornament" aria-hidden="true">
      <span />
      <svg viewBox="0 0 22 22">
        <path d="m11 2 4 6 5 3-5 3-4 6-4-6-5-3 5-3Z" fill="none" stroke="currentColor" />
        <path d="M11 6v10M6 11h10" stroke="currentColor" />
      </svg>
      <span />
    </span>
  );
}
