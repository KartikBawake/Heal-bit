import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerPatient } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/error";

const initial = {
  fullName: "", email: "", password: "", phoneNumber: "",
  age: "", gender: "", address: "",
};

export default function PatientRegister() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, age: Number(form.age) };
      const { data } = await registerPatient(payload);
      login(data); // backend auto-logs in (returns a token)
      navigate("/patient");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <p className="eyebrow">Patient</p>
        <h1>Create your account</h1>

        {error && <div className="alert alert-error mt-3">{error}</div>}

        <form onSubmit={onSubmit} className="mt-3">
          <div className="field">
            <label>Full name</label>
            <input className="input" name="fullName" value={form.fullName} onChange={onChange} required />
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
          <div className="row">
            <div className="field">
              <label>Phone</label>
              <input className="input" name="phoneNumber" value={form.phoneNumber} onChange={onChange} placeholder="10 digits" required />
            </div>
            <div className="field">
              <label>Age</label>
              <input className="input" type="number" name="age" value={form.age} onChange={onChange} min="1" max="120" required />
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
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/patient/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
