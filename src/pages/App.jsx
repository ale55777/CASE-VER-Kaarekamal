import { ArrowRight, BriefcaseBusiness, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function App() {
  return (
    <main className="home-shell">
      <section className="home-hero">
        <div className="brand-row">
          <div className="brand-mark">
            <img src="/reference/image header.jpg" alt="Kaar-e-Kamal logo" />
          </div>
          <div>
            <p>Kaar-e-Kamal Welfare Foundation</p>
            <h1>Verification Forms</h1>
          </div>
        </div>
        <p className="hero-copy">
          Fill the foundation verification forms step by step, review the details, and generate printable PDFs in the original paper format.
        </p>
      </section>

      <section className="form-cards" aria-label="Available forms">
        <Link className="form-card" to="/forms/rozgar">
          <BriefcaseBusiness size={34} />
          <span>
            <strong>Rozgar Verification</strong>
            <small>Fill and generate the Rozgar Verification Form</small>
          </span>
          <ArrowRight />
        </Link>
        <Link className="form-card" to="/forms/case">
          <ClipboardCheck size={34} />
          <span>
            <strong>Case Verification</strong>
            <small>Fill and generate the Case Verification Form</small>
          </span>
          <ArrowRight />
        </Link>
      </section>
    </main>
  );
}
