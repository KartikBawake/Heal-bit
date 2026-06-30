import { useEffect, useState } from "react";
import { getAllHospitals, approveHospital, rejectHospital, removeHospital } from "../../api/adminApi";
import { getErrorMessage } from "../../utils/error";
import StatusBadge from "../../components/StatusBadge";

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllHospitals();
      setHospitals(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const run = async (fn, id, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    try {
      await fn(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1>Hospitals</h1>
          <p className="sub">Approve or reject registrations and remove hospitals.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : hospitals.length === 0 ? (
        <div className="card empty">No hospitals registered yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Reg. no.</th><th>Email</th><th>City</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h.hospitalId}>
                  <td>{h.hospitalName}</td>
                  <td>{h.registrationNumber}</td>
                  <td>{h.email}</td>
                  <td>{h.city || "—"}</td>
                  <td><StatusBadge status={h.status} /></td>
                  <td>
                    <div className="actions">
                      {h.status !== "ACTIVE" && (
                        <button className="btn btn-primary btn-sm" onClick={() => run(approveHospital, h.hospitalId)}>Approve</button>
                      )}
                      {h.status !== "REJECTED" && (
                        <button className="btn btn-outline btn-sm" onClick={() => run(rejectHospital, h.hospitalId)}>Reject</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => run(removeHospital, h.hospitalId, "Remove this hospital?")}>Remove</button>
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
