import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listDoctors } from "../../api/doctorApi";
import { listAppointments } from "../../api/appointmentApi";
import Icon from "../../components/icons";

export default function HospitalDashboard() {
  const { auth } = useAuth();
  const [doctorCount, setDoctorCount] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);

  useEffect(() => {
    listDoctors({ mine: true }).then(({ data }) => setDoctorCount(data.length)).catch(() => setDoctorCount(0));
    listAppointments()
      .then(({ data }) => setPendingCount(data.filter((a) => a.status === "PENDING").length))
      .catch(() => setPendingCount(0));
  }, []);

  return (
    <div>
      <div className="dash-hero">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>{auth.user.name}</h1>
          <p className="sub">Manage your doctors and appointment requests.</p>
        </div>
        <div className="chips">
          <div className="chip">
            <span className="chip-icon"><Icon name="care" /></span>
            <span className="chip-meta"><b>{doctorCount ?? "—"}</b><span>doctors</span></span>
          </div>
          <div className="chip">
            <span className="chip-icon"><Icon name="calendar" /></span>
            <span className="chip-meta"><b>{pendingCount ?? "—"}</b><span>pending requests</span></span>
          </div>
        </div>
      </div>

      <h2 className="mt-3">Quick actions</h2>
      <div className="tiles mt-2">
        <Link to="/hospital/doctors" className="tile">
          <span className="tile-icon"><Icon name="care" /></span>
          <div className="tile-body">
            <h3>Manage doctors</h3>
            <p>Add, edit, or remove the doctors at your hospital.</p>
          </div>
        </Link>
        <Link to="/hospital/appointments" className="tile">
          <span className="tile-icon"><Icon name="clipboard" /></span>
          <div className="tile-body">
            <h3>Appointments</h3>
            <p>Confirm, complete, or reject incoming requests.</p>
          </div>
        </Link>
        <Link to="/hospital/profile" className="tile">
          <span className="tile-icon"><Icon name="hospital" /></span>
          <div className="tile-body">
            <h3>Hospital profile</h3>
            <p>Update your details and contact information.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
