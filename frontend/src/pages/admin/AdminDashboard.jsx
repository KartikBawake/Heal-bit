import { useEffect, useState } from "react";
import { getDashboard } from "../../api/adminApi";
import { getErrorMessage } from "../../utils/error";

const Stat = ({ value, label }) => (
  <div className="stat-card">
    <div className="stat-value">{value ?? 0}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getDashboard();
        setStats(data);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    })();
  }, []);

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1>Dashboard</h1>
          <p className="sub">Platform activity at a glance.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!stats ? (
        <p className="muted">Loading statistics...</p>
      ) : (
        <>
          <div className="grid grid-4">
            <Stat value={stats.totalPatients} label="Patients" />
            <Stat value={stats.totalHospitals} label="Hospitals" />
            <Stat value={stats.totalDoctors} label="Doctors" />
            <Stat value={stats.totalAppointments} label="Appointments" />
          </div>

          <h2 className="mt-3">Hospitals by status</h2>
          <div className="grid grid-3 mt-2">
            <Stat value={stats.pendingHospitals} label="Pending approval" />
            <Stat value={stats.activeHospitals} label="Active" />
            <Stat value={stats.rejectedHospitals} label="Rejected" />
          </div>

          <h2 className="mt-3">Appointments by status</h2>
          <div className="grid grid-4 mt-2">
            <Stat value={stats.pendingAppointments} label="Pending" />
            <Stat value={stats.confirmedAppointments} label="Confirmed" />
            <Stat value={stats.completedAppointments} label="Completed" />
            <Stat value={stats.cancelledAppointments} label="Cancelled" />
          </div>
        </>
      )}
    </div>
  );
}
