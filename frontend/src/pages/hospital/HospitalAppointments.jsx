import { useEffect, useState } from "react";
import { listAppointments, updateAppointmentStatus } from "../../api/appointmentApi";
import { getErrorMessage } from "../../utils/error";
import StatusBadge from "../../components/StatusBadge";

export default function HospitalAppointments() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listAppointments();
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (appointmentId, status) => {
    try {
      await updateAppointmentStatus({ appointmentId, status });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Appointment requests</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : items.length === 0 ? (
        <div className="card empty">No appointments yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.appointmentId}>
                  <td>{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td>{a.appointmentDate}</td>
                  <td>{a.appointmentTime}</td>
                  <td>{a.reason}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <div className="actions">
                      {a.status === "PENDING" && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => setStatus(a.appointmentId, "CONFIRMED")}>Confirm</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setStatus(a.appointmentId, "CANCELLED")}>Reject</button>
                        </>
                      )}
                      {a.status === "CONFIRMED" && (
                        <button className="btn btn-outline btn-sm" onClick={() => setStatus(a.appointmentId, "COMPLETED")}>Mark completed</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
