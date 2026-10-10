import { asset } from '../lib/assets';

export default function WelcomeBanner() {
  return (
    <section
      className="welcome-banner"
      style={{ backgroundImage: `url('${asset('images/castle.webp')}')` }}
      aria-labelledby="welcome-title"
    >
      <div className="welcome-content">
        <p className="eyebrow">Bem-vindo ao</p>
        <h1 id="welcome-title">Portal da Sonserina</h1>
        <p className="welcome-description">
          Aqui você encontra todas as atividades em aberto,
          <br className="desktop-break" /> seus prazos e as disciplinas correspondentes.
          <br className="desktop-break" /> Mantenha-se organizado e não deixe nada passar!
        </p>
      </div>
    </section>
  );
}
