import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="hero">
        <p className="eyebrow">Unified healthcare system</p>
        <h1>Care, coordinated in one place.</h1>
        <svg className="hero-ecg" viewBox="0 0 420 70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 35 H120 L140 35 L150 12 L165 58 L178 35 L195 35 L205 22 L214 35 H420" />
        </svg>
        <p className="lead">
          Heal-Bit connects patients, hospitals, and administrators on a single platform —
          browse hospitals, book appointments, and manage care without the back-and-forth.
        </p>
      </section>

      <section className="role-grid">
        <div className="role-card">
          <h3>For patients</h3>
          <p>Find hospitals, view doctors, and book appointments in a few taps.</p>
          <div className="links">
            <Link to="/patient/login" className="btn btn-primary btn-sm">Sign in</Link>
            <Link to="/patient/register" className="btn btn-outline btn-sm">Create account</Link>
          </div>
        </div>

        <div className="role-card">
          <h3>For hospitals</h3>
          <p>Register, manage your doctors, and respond to appointment requests.</p>
          <div className="links">
            <Link to="/hospital/login" className="btn btn-primary btn-sm">Sign in</Link>
            <Link to="/hospital/register" className="btn btn-outline btn-sm">Register hospital</Link>
          </div>
        </div>

        <div className="role-card">
          <h3>For administrators</h3>
          <p>Approve hospitals, oversee users, and monitor platform activity.</p>
          <div className="links">
            <Link to="/admin/login" className="btn btn-primary btn-sm">Sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
