import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  // Only show role links when there is a valid, authenticated session.
  const links = isAuthenticated && role ? LINKS[role] || [] : [];

  const handleLogout = () => {
    logout();
    navigate("/");
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
            <Link to="/" className="nav-link">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
