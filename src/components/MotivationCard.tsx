import { asset } from '../lib/assets';
import { Ornament } from './Marks';

export default function MotivationCard() {
  return (
    <section className="motivation-card panel">
      <img
        className="motivation-serpent"
        src={asset('images/serpent.webp')}
        alt=""
        width="92"
        height="115"
        loading="lazy"
      />
      <p>
        <strong>Disciplina</strong>
        <br />é o que transforma
        <br />
        planos em conquistas.
      </p>
      <Ornament />
    </section>
  );
}
