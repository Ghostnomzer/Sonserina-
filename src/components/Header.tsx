import { Menu } from 'lucide-react';
import { asset } from '../lib/assets';
import type { Profile } from '../types/portal';
import { SerpentMark } from './Marks';

export default function Header({
  profile,
  menuOpen,
  onToggleMenu,
}: {
  profile: Profile;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <header
      className="site-header"
      style={{ backgroundImage: `url('${asset('images/header.webp')}')` }}
    >
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
