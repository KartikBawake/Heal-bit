import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../api/patientApi";
import { getErrorMessage } from "../../utils/error";

export default function PatientProfile() {
  const [form, setForm] = useState(null);
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getProfile();
        setEmail(data.email);
        setForm({
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          age: data.age ?? "",
          gender: data.gender || "",
          address: data.address || "",
        });
      } catch (err) {
        setFeedback({ type: "error", msg: getErrorMessage(err) });
      }
    })();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: "", msg: "" });
    try {
      await updateProfile({ ...form, age: Number(form.age) });
      setFeedback({ type: "success", msg: "Profile updated." });
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p className="muted">Loading...</p>;

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Patient</p>
          <h1>My profile</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        {feedback.msg && (
          <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
        )}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email (read-only)</label>
            <input className="input" value={email} disabled />
          </div>
          <div className="field">
            <label>Full name</label>
            <input className="input" name="fullName" value={form.fullName} onChange={onChange} required />
          </div>
          <div className="row">
            <div className="field">
              <label>Phone</label>
              <input className="input" name="phoneNumber" value={form.phoneNumber} onChange={onChange} required />
            </div>
            <div className="field">
              <label>Age</label>
              <input className="input" type="number" name="age" value={form.age} onChange={onChange} min="1" max="120" />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={onChange}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label>Address</label>
              <input className="input" name="address" value={form.address} onChange={onChange} />
            </div>
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
