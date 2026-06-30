import { useEffect, useState } from "react";
import { listAppointments, cancelAppointment } from "../../api/appointmentApi";
import { getErrorMessage } from "../../utils/error";
import StatusBadge from "../../components/StatusBadge";

export default function MyAppointments() {
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

  const onCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const cancellable = (s) => s !== "COMPLETED" && s !== "CANCELLED";

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Patient</p>
          <h1>My appointments</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : items.length === 0 ? (
        <div className="card empty">No appointments yet. Browse hospitals to book your first visit.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hospital</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.appointmentId}>
                  <td>{a.hospitalName}</td>
                  <td>{a.doctorName}</td>
                  <td>{a.appointmentDate}</td>
                  <td>{a.appointmentTime}</td>
                  <td>{a.reason}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    {cancellable(a.status) && (
                      <button className="btn btn-danger btn-sm" onClick={() => onCancel(a.appointmentId)}>Cancel</button>
                    )}
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
