import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./icons";

const SIGN_IN_OPTIONS = [
  { path: "/patient/login", label: "Patient", description: "Book appointments and manage your care", icon: "user" },
  { path: "/hospital/login", label: "Hospital", description: "Manage doctors and appointment requests", icon: "hospital" },
  { path: "/admin/login", label: "Administrator", description: "Approve hospitals and oversee the platform", icon: "chart" },
];

const LINKS = {
  PATIENT: [
    { to: "/patient", label: "Dashboard", end: true },
    { to: "/patient/hospitals", label: "Hospitals" },
    { to: "/patient/appointments", label: "Appointments" },
    { to: "/patient/profile", label: "Profile" },
  ],
  HOSPITAL: [
    { to: "/hospital", label: "Dashboard", end: true },
    { to: "/hospital/doctors", label: "Doctors" },
    { to: "/hospital/appointments", label: "Appointments" },
    { to: "/hospital/profile", label: "Profile" },
  ],
  ADMIN: [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/hospitals", label: "Hospitals" },
    { to: "/admin/users", label: "Patients" },
  ],
};

export default function Navbar() {
  const { auth, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [signInOpen, setSignInOpen] = useState(false);
  const signInRef = useRef(null);

  // Only show role links when there is a valid, authenticated session.
  const links = isAuthenticated && role ? LINKS[role] || [] : [];

  useEffect(() => {
    if (!signInOpen) return;

    const onKey = (e) => e.key === "Escape" && setSignInOpen(false);
    const onClickOutside = (e) => {
      if (signInRef.current && !signInRef.current.contains(e.target)) {
        setSignInOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [signInOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSignInChoice = (path) => {
    setSignInOpen(false);
    navigate(path);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <svg className="nav-ecg" viewBox="0 0 52 36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18 H14 L19 8 L27 28 L33 18 H50" />
          </svg>
          Heal<span className="dot">·</span>Bit
        </Link>

        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-right">
          {isAuthenticated ? (
            <>
              <span className="nav-user">
                <strong>{auth.user.name}</strong>
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <div className="nav-signin-wrap" ref={signInRef}>
              <button
                type="button"
                className={`nav-link nav-signin-btn${signInOpen ? " open" : ""}`}
                aria-expanded={signInOpen}
                aria-haspopup="true"
                onClick={() => setSignInOpen((open) => !open)}
              >
                Sign in
              </button>

              {signInOpen && (
                <div className="signin-dropdown" role="menu" aria-label="Sign in as">
                  <p className="signin-dropdown-title">Sign in as</p>
                  <div className="signin-options">
                    {SIGN_IN_OPTIONS.map((opt) => (
                      <button
                        key={opt.path}
                        type="button"
                        role="menuitem"
                        className="signin-option"
                        onClick={() => handleSignInChoice(opt.path)}
                      >
                        <span className="signin-option-icon">
                          <Icon name={opt.icon} size={20} />
                        </span>
                        <span className="signin-option-body">
                          <strong>{opt.label}</strong>
                          <span>{opt.description}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
