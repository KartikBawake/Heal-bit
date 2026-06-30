import { useState } from "react";
import { updateHospital } from "../../api/hospitalApi";
import { getErrorMessage } from "../../utils/error";

const initial = {
  hospitalName: "", phone: "", address: "", city: "", state: "", pincode: "", description: "",
};

export default function HospitalProfile() {
  const [form, setForm] = useState(initial);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: "", msg: "" });
    // Send only the fields the user actually filled in (all are optional on update).
    const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
    try {
      await updateHospital(payload);
      setFeedback({ type: "success", msg: "Hospital profile updated." });
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Hospital profile</h1>
          <p className="sub">Update the details below. Leave a field blank to keep it unchanged.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        {feedback.msg && (
          <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
        )}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Hospital name</label>
            <input className="input" name="hospitalName" value={form.hospitalName} onChange={onChange} />
          </div>
          <div className="row">
            <div className="field">
              <label>Phone</label>
              <input className="input" name="phone" value={form.phone} onChange={onChange} placeholder="10 digits" />
            </div>
            <div className="field">
              <label>Pincode</label>
              <input className="input" name="pincode" value={form.pincode} onChange={onChange} placeholder="6 digits" />
            </div>
          </div>
          <div className="field">
            <label>Address</label>
            <input className="input" name="address" value={form.address} onChange={onChange} />
          </div>
          <div className="row">
            <div className="field">
              <label>City</label>
              <input className="input" name="city" value={form.city} onChange={onChange} />
            </div>
            <div className="field">
              <label>State</label>
              <input className="input" name="state" value={form.state} onChange={onChange} />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={onChange} />
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
