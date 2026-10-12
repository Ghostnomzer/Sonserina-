import { Ornament, SerpentMark } from './Marks';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-signature">
        <span className="footer-line" />
        <div>
          <SerpentMark animated />
          <span>Sonserina</span>
        </div>
        <span className="footer-line" />
      </div>
      <p>Mais que uma casa. Uma mentalidade.</p>
      <Ornament />
    </footer>
  );
}
