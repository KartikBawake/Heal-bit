import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerHospital } from "../../api/authApi";
import { getErrorMessage } from "../../utils/error";

const initial = {
  hospitalName: "", registrationNumber: "", email: "", password: "",
  phone: "", address: "", city: "", state: "", pincode: "", description: "",
};

export default function HospitalRegister() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerHospital(form); // returns token=null; approval required before login
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <p className="eyebrow">Hospital</p>
          <h1>Registration received</h1>
          <div className="alert alert-success mt-3">
            Your hospital is now pending administrator approval. You can sign in once it is approved.
          </div>
          <button className="btn btn-primary btn-block" onClick={() => navigate("/hospital/login")}>
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <p className="eyebrow">Hospital</p>
        <h1>Register your hospital</h1>

        {error && <div className="alert alert-error mt-3">{error}</div>}

        <form onSubmit={onSubmit} className="mt-3">
          <div className="field">
            <label>Hospital name</label>
            <input className="input" name="hospitalName" value={form.hospitalName} onChange={onChange} required />
          </div>
          <div className="row">
            <div className="field">
              <label>Registration number</label>
              <input className="input" name="registrationNumber" value={form.registrationNumber} onChange={onChange} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" name="phone" value={form.phone} onChange={onChange} placeholder="10 digits" required />
            </div>
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={onChange} required />
            <p className="hint">Min 8 characters, with one uppercase, one lowercase, and one number.</p>
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
          <div className="row">
            <div className="field">
              <label>Pincode</label>
              <input className="input" name="pincode" value={form.pincode} onChange={onChange} placeholder="6 digits" />
            </div>
            <div className="field">
              <label>Description</label>
              <input className="input" name="description" value={form.description} onChange={onChange} />
            </div>
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Submitting..." : "Register hospital"}
          </button>
        </form>

        <p className="auth-switch">
          Already approved? <Link to="/hospital/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
