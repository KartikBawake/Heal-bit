import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginPatient } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/error";

export default function PatientLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const { data } = await loginPatient(form);
      login(data);
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
        <h1>Welcome back</h1>
        <p className="muted mt-2">Sign in to manage your appointments.</p>

        {error && <div className="alert alert-error mt-3">{error}</div>}

        <form onSubmit={onSubmit} className="mt-3">
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={onChange} required />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/patient/register">Create a patient account</Link>
        </p>
      </div>
    </div>
  );
}
