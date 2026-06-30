import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PatientDashboard() {
  const { auth } = useAuth();
  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Patient</p>
          <h1>Hi, {auth.user.name}</h1>
          <p className="sub">What would you like to do today?</p>
        </div>
      </div>

      <div className="grid grid-3">
        <Link to="/patient/hospitals" className="tile">
          <h3>Browse hospitals</h3>
          <p>Search by city or name and view available doctors.</p>
        </Link>
        <Link to="/patient/appointments" className="tile">
          <h3>My appointments</h3>
          <p>Track your bookings and cancel if plans change.</p>
        </Link>
        <Link to="/patient/profile" className="tile">
          <h3>My profile</h3>
          <p>Keep your contact details up to date.</p>
        </Link>
      </div>
    </div>
  );
}
