import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/icons";
import Modal from "../components/Modal";
import Footer from "../components/Footer";

const CONTACT = {
  email: "support@healbit.com",
  phone: "+91 98765 43210",
  hours: "Mon–Sat, 9:00–18:00 IST",
};

export default function Home() {
  const [modal, setModal] = useState(null); // "about" | "contact" | null
  const close = () => setModal(null);

  return (
    <div className="home">
      {/* ---------------- HERO ---------------- */}
      <section className="hero2">
        <div className="hero2-copy fade-up">
          <p className="eyebrow">Unified healthcare system</p>
          <h1 className="hero2-title">
            Care, <span className="accent-word">coordinated</span> in one place.
          </h1>
          <p className="lead">
            Heal-Bit brings patients and hospitals onto a single platform —
            browse hospitals, book appointments, and manage care without the back-and-forth.
          </p>
          <div className="hero2-cta">
            <Link to="/patient/register" className="btn btn-primary btn-lg">Get started</Link>
            <Link to="/patient/login" className="btn btn-outline btn-lg">Sign in</Link>
          </div>
          <div className="hero2-links">
            <button className="link-btn" onClick={() => setModal("about")}>About Heal-Bit</button>
            <span className="sep">·</span>
            <button className="link-btn" onClick={() => setModal("contact")}>Contact us</button>
          </div>
        </div>

        <div className="hero2-visual fade-up delay-1" aria-hidden="true">
          <div className="visual-frame">
            <svg className="visual-ecg" viewBox="0 0 320 90" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M0 46 H96 L112 46 L122 20 L138 74 L150 46 L168 46 L178 30 L188 46 H320" />
            </svg>
            <div className="float-card fc-appt">
              <span className="badge badge-confirmed">Confirmed</span>
              <div className="fc-title">Cardiology · Dr. Asha Rao</div>
              <div className="fc-sub">Tomorrow · 11:00</div>
            </div>
            <div className="float-card fc-hosp">
              <span className="tile-icon sm"><Icon name="hospital" size={18} /></span>
              <div>
                <div className="fc-title">City Care Hospital</div>
                <div className="fc-sub">Pune · Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- ROLE CARDS ---------------- */}
      <section className="section">
        <div className="section-head">
          <h2>Choose your space</h2>
          <p className="muted">Three tailored experiences, one platform.</p>
        </div>
        <div className="role-grid">
          <div className="role-card">
            <span className="role-icon"><Icon name="user" size={24} /></span>
            <h3>For patients</h3>
            <p>Find hospitals, view doctors, and book appointments in a few taps.</p>
            <div className="links">
              <Link to="/patient/login" className="btn btn-primary btn-sm">Sign in</Link>
              <Link to="/patient/register" className="btn btn-outline btn-sm">Create account</Link>
            </div>
          </div>
          <div className="role-card">
            <span className="role-icon"><Icon name="hospital" size={24} /></span>
            <h3>For hospitals</h3>
            <p>Register, manage your doctors, and respond to appointment requests.</p>
            <div className="links">
              <Link to="/hospital/login" className="btn btn-primary btn-sm">Sign in</Link>
              <Link to="/hospital/register" className="btn btn-outline btn-sm">Register</Link>
            </div>
          </div>
          <div className="role-card">
            <span className="role-icon"><Icon name="chart" size={24} /></span>
            <h3>For administrators</h3>
            <p>Approve hospitals, oversee users, and monitor platform activity.</p>
            <div className="links">
              <Link to="/admin/login" className="btn btn-primary btn-sm">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="section">
        <div className="section-head">
          <h2>How it works</h2>
          <p className="muted">From sign-up to seen, in three steps.</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-no">01</span>
            <h3>Create your account</h3>
            <p className="muted">Register as a patient in under a minute — no paperwork.</p>
          </div>
          <div className="step">
            <span className="step-no">02</span>
            <h3>Find a hospital &amp; doctor</h3>
            <p className="muted">Search by city, compare specialists, and check availability.</p>
          </div>
          <div className="step">
            <span className="step-no">03</span>
            <h3>Book and manage</h3>
            <p className="muted">Request an appointment and track its status end to end.</p>
          </div>
        </div>
      </section>

      <Footer onAbout={() => setModal("about")} onContact={() => setModal("contact")} />

      {/* ---------------- MODALS ---------------- */}
      <Modal open={modal === "about"} onClose={close} title="About Heal-Bit">
        <p>
          Heal-Bit is a unified healthcare platform built to remove the friction between people and care.
          Patients discover hospitals and book appointments in one place, hospitals manage their doctors and
          requests without spreadsheets, and administrators keep the whole network trustworthy.
        </p>
        <p className="mt-2">
          Our aim is simple: make finding and receiving care feel calm, clear, and quick — for everyone
          on either side of the appointment.
        </p>
        <ul className="about-list">
          <li><Icon name="user" size={18} /> Patient-first booking and appointment history</li>
          <li><Icon name="hospital" size={18} /> Verified hospitals, approved by administrators</li>
          <li><Icon name="care" size={18} /> Doctors, specialities, and availability at a glance</li>
        </ul>
      </Modal>

      <Modal open={modal === "contact"} onClose={close} title="Contact us">
        <p className="muted">We usually respond within one business day.</p>
        <div className="contact-list">
          <a className="contact-row" href={`mailto:${CONTACT.email}`}>
            <span className="contact-icon"><Icon name="clipboard" size={20} /></span>
            <span>
              <span className="contact-label">Email</span>
              <span className="contact-value">{CONTACT.email}</span>
            </span>
          </a>
          <a className="contact-row" href={`tel:${CONTACT.phone.replace(/\s+/g, "")}`}>
            <span className="contact-icon"><Icon name="calendar" size={20} /></span>
            <span>
              <span className="contact-label">Phone</span>
              <span className="contact-value">{CONTACT.phone}</span>
            </span>
          </a>
          <div className="contact-row static">
            <span className="contact-icon"><Icon name="care" size={20} /></span>
            <span>
              <span className="contact-label">Hours</span>
              <span className="contact-value">{CONTACT.hours}</span>
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
