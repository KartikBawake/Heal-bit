import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HospitalDashboard() {
  const { auth } = useAuth();
  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>{auth.user.name}</h1>
          <p className="sub">Manage your doctors and appointment requests.</p>
        </div>
      </div>

      <div className="grid grid-3">
        <Link to="/hospital/doctors" className="tile">
          <h3>Manage doctors</h3>
          <p>Add, edit, or remove the doctors at your hospital.</p>
        </Link>
        <Link to="/hospital/appointments" className="tile">
          <h3>Appointments</h3>
          <p>Confirm, complete, or reject incoming requests.</p>
        </Link>
        <Link to="/hospital/profile" className="tile">
          <h3>Hospital profile</h3>
          <p>Update your details and review approval status.</p>
        </Link>
      </div>
    </div>
  );
}
