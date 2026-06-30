import { useEffect, useState } from "react";
import { listDoctors, addDoctor, updateDoctor, deleteDoctor } from "../../api/doctorApi";
import { getErrorMessage } from "../../utils/error";

const empty = {
  doctorId: null, doctorName: "", qualification: "", specialization: "",
  experience: "", consultationFee: "", availableDays: "", availableTime: "",
};

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listDoctors({ mine: true });
      setDoctors(data);
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startAdd = () => { setForm(empty); setShowForm(true); setFeedback({ type: "", msg: "" }); };
  const startEdit = (d) => {
    setForm({
      doctorId: d.doctorId, doctorName: d.doctorName, qualification: d.qualification || "",
      specialization: d.specialization || "", experience: d.experience ?? "",
      consultationFee: d.consultationFee ?? "", availableDays: d.availableDays || "",
      availableTime: d.availableTime || "",
    });
    setShowForm(true);
    setFeedback({ type: "", msg: "" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: "", msg: "" });
    const payload = {
      ...form,
      experience: Number(form.experience),
      consultationFee: form.consultationFee === "" ? null : Number(form.consultationFee),
    };
    try {
      if (form.doctorId) {
        await updateDoctor(payload);
        setFeedback({ type: "success", msg: "Doctor updated." });
      } else {
        const { doctorId, ...rest } = payload;
        await addDoctor(rest);
        setFeedback({ type: "success", msg: "Doctor added." });
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Remove this doctor?")) return;
    try {
      await deleteDoctor(id);
      load();
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Doctors</h1>
        </div>
        {!showForm && <button className="btn btn-primary" onClick={startAdd}>Add doctor</button>}
      </div>

      {feedback.msg && (
        <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
      )}

      {showForm && (
        <div className="card mt-2">
          <h3>{form.doctorId ? "Edit doctor" : "New doctor"}</h3>
          <form onSubmit={onSubmit} className="mt-2">
            <div className="row">
              <div className="field">
                <label>Name</label>
                <input className="input" name="doctorName" value={form.doctorName} onChange={onChange} required />
              </div>
              <div className="field">
                <label>Specialization</label>
                <input className="input" name="specialization" value={form.specialization} onChange={onChange} />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Qualification</label>
                <input className="input" name="qualification" value={form.qualification} onChange={onChange} />
              </div>
              <div className="field">
                <label>Experience (years)</label>
                <input className="input" type="number" name="experience" value={form.experience} onChange={onChange} min="0" max="50" required />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Consultation fee (₹)</label>
                <input className="input" type="number" name="consultationFee" value={form.consultationFee} onChange={onChange} min="0" />
              </div>
              <div className="field">
                <label>Available days</label>
                <input className="input" name="availableDays" value={form.availableDays} onChange={onChange} placeholder="e.g. Mon-Fri" />
              </div>
            </div>
            <div className="field">
              <label>Available time</label>
              <input className="input" name="availableTime" value={form.availableTime} onChange={onChange} placeholder="e.g. 09:00-17:00" />
              <p className="hint">Use the HH:mm-HH:mm format so appointment times can be validated against it.</p>
            </div>
            <div className="actions">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : form.doctorId ? "Update doctor" : "Add doctor"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-3">
        {loading ? (
          <p className="muted">Loading...</p>
        ) : doctors.length === 0 ? (
          <div className="card empty">No doctors yet. Add your first doctor above.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Fee</th><th>Availability</th><th></th></tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.doctorId}>
                    <td>{d.doctorName}</td>
                    <td>{d.specialization}</td>
                    <td>{d.experience} yrs</td>
                    <td>₹{d.consultationFee}</td>
                    <td>{d.availableDays} · {d.availableTime}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-outline btn-sm" onClick={() => startEdit(d)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => onDelete(d.doctorId)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
