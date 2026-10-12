import { useId } from 'react';
import { Menu, Pause, Play } from 'lucide-react';
import { asset } from '../lib/assets';
import type { Profile } from '../types/portal';
import { SerpentMark } from './Marks';

export default function Header({
  profile,
  menuOpen,
  onToggleMenu,
  motionEnabled,
  onToggleMotion,
}: {
  profile: Profile;
  menuOpen: boolean;
  onToggleMenu: () => void;
  motionEnabled: boolean;
  onToggleMotion: () => void;
}) {
  const id = useId();
  const maskId = `${id}-serpent-mask`;
  const blurId = `${id}-serpent-blur`;
  return (
    <header
      className="site-header"
      style={{ backgroundImage: `url('${asset('images/header.webp')}')` }}
    >
      <svg
        className="header-serpent-scene"
        viewBox="0 0 2160 720"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="2160" height="720">
            <rect
              x="1280"
              y="-80"
              width="740"
              height="880"
              rx="140"
              fill="white"
              filter={`url(#${blurId})`}
            />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          <image
            className="header-serpent-image"
            href={asset('images/header.webp')}
            width="2160"
            height="720"
          />
        </g>
      </svg>
      <div className="header-inner">
        <a className="brand" href="#inicio" aria-label="Portal da Sonserina — início">
          <img
            className="brand-crest"
            src={asset('images/crest.webp')}
            alt=""
            width="106"
            height="134"
            fetchPriority="high"
          />
          <div className="brand-text">
            <span className="brand-eyebrow">Portal da</span>
            <span className="brand-title">Sonserina</span>
            <span className="brand-values">
              Ambição <b>·</b> Disciplina <b>·</b> Estratégia <b>·</b> Lealdade
            </span>
          </div>
        </a>
        <div className="header-greeting">
          <span>Olá, {profile.name.trim() || 'membro da Sonserina'}!</span>
          <p>Que sua disciplina te leve longe.</p>
          <SerpentMark animated />
        </div>
        <button className="motion-toggle" onClick={onToggleMotion}>
          {motionEnabled ? (
            <Pause size={13} aria-hidden="true" />
          ) : (
            <Play size={13} aria-hidden="true" />
          )}
          {motionEnabled ? 'Pausar animações' : 'Ativar animações'}
        </button>
        <button
          id="menu-toggle"
          className="icon-button mobile-menu-toggle"
          onClick={onToggleMenu}
          aria-controls="portal-sidebar"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <Menu size={25} />
        </button>
      </div>
    </header>
  );
}
