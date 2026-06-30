import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../api/adminApi";
import { getErrorMessage } from "../../utils/error";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await deleteUser(id);
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
          <h1>Patients</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : users.length === 0 ? (
        <div className="card empty">No patients registered yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Age</th><th>Gender</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.patientId}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber}</td>
                  <td>{u.age}</td>
                  <td>{u.gender || "—"}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(u.patientId)}>Delete</button>
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
