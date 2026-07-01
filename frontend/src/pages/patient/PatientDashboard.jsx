import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listAppointments } from "../../api/appointmentApi";
import Icon from "../../components/icons";
import StatusBadge from "../../components/StatusBadge";

const today = new Date().toISOString().split("T")[0];

export default function PatientDashboard() {
  const { auth } = useAuth();
  const [appts, setAppts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listAppointments()
      .then(({ data }) => setAppts(data))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const upcoming = appts
    .filter((a) => (a.status === "PENDING" || a.status === "CONFIRMED") && a.appointmentDate >= today)
    .sort((a, b) => (a.appointmentDate + a.appointmentTime).localeCompare(b.appointmentDate + b.appointmentTime));
  const next = upcoming[0];

  return (
    <div>
      <div className="dash-hero">
        <div>
          <p className="eyebrow">Patient</p>
          <h1>Hi, {auth.user.name}</h1>
          <p className="sub">Your care, all in one place.</p>
        </div>
        <div className="chips">
          <div className="chip">
            <span className="chip-icon"><Icon name="calendar" /></span>
            <span className="chip-meta"><b>{loaded ? upcoming.length : "—"}</b><span>upcoming</span></span>
          </div>
          <div className="chip">
            <span className="chip-icon"><Icon name="clipboard" /></span>
            <span className="chip-meta"><b>{loaded ? appts.length : "—"}</b><span>total</span></span>
          </div>
        </div>
      </div>

      {next && (
        <div className="card highlight">
          <div>
            <p className="eyebrow">Next appointment</p>
            <div className="when">{next.appointmentDate} · {next.appointmentTime}</div>
            <p className="muted mt-2">{next.doctorName} · {next.hospitalName}</p>
          </div>
          <div className="actions">
            <StatusBadge status={next.status} />
            <Link to="/patient/appointments" className="btn btn-outline btn-sm">View all</Link>
          </div>
        </div>
      )}

      <h2 className="mt-3">Quick actions</h2>
      <div className="tiles mt-2">
        <Link to="/patient/hospitals" className="tile">
          <span className="tile-icon"><Icon name="hospital" /></span>
          <div className="tile-body">
            <h3>Browse hospitals</h3>
            <p>Search by city and view available doctors.</p>
          </div>
        </Link>
        <Link to="/patient/appointments" className="tile">
          <span className="tile-icon"><Icon name="clipboard" /></span>
          <div className="tile-body">
            <h3>My appointments</h3>
            <p>Track your bookings and cancel if plans change.</p>
          </div>
        </Link>
        <Link to="/patient/profile" className="tile">
          <span className="tile-icon"><Icon name="user" /></span>
          <div className="tile-body">
            <h3>My profile</h3>
            <p>Keep your contact details up to date.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
