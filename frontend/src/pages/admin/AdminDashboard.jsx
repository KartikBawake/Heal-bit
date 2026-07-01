import { useEffect, useState } from "react";
import { getDashboard } from "../../api/adminApi";
import { getErrorMessage } from "../../utils/error";
import DonutChart from "../../components/DonutChart";
import BarChart from "../../components/BarChart";

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

          <div className="chart-grid mt-3">
            <div className="card chart-card">
              <h3>Hospitals by status</h3>
              <DonutChart
                segments={[
                  { label: "Pending", value: stats.pendingHospitals, color: "#b45309" },
                  { label: "Active", value: stats.activeHospitals, color: "#15803d" },
                  { label: "Rejected", value: stats.rejectedHospitals, color: "#b91c1c" },
                ]}
              />
            </div>

            <div className="card chart-card">
              <h3>Appointments by status</h3>
              <BarChart
                rows={[
                  { label: "Pending", value: stats.pendingAppointments, color: "#b45309" },
                  { label: "Confirmed", value: stats.confirmedAppointments, color: "#15803d" },
                  { label: "Completed", value: stats.completedAppointments, color: "#0f766e" },
                  { label: "Cancelled", value: stats.cancelledAppointments, color: "#b91c1c" },
                ]}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
