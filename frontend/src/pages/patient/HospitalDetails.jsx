import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getHospital } from "../../api/hospitalApi";
import { listDoctors } from "../../api/doctorApi";
import { bookAppointment } from "../../api/appointmentApi";
import { getErrorMessage } from "../../utils/error";

const today = new Date().toISOString().split("T")[0];

export default function HospitalDetails() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [bookingFor, setBookingFor] = useState(null); // doctor object
  const [form, setForm] = useState({ appointmentDate: "", appointmentTime: "", reason: "" });
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [hRes, dRes] = await Promise.all([getHospital(id), listDoctors({ hospitalId: id })]);
        setHospital(hRes.data);
        setDoctors(dRes.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const openBooking = (doctor) => {
    setBookingFor(doctor);
    setForm({ appointmentDate: "", appointmentTime: "", reason: "" });
    setFeedback({ type: "", msg: "" });
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: "", msg: "" });
    try {
      await bookAppointment({ doctorId: bookingFor.doctorId, ...form });
      setFeedback({ type: "success", msg: `Appointment requested with ${bookingFor.doctorName}.` });
      setBookingFor(null);
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="muted">Loading...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>{hospital.hospitalName}</h1>
          <p className="sub">{[hospital.city, hospital.state].filter(Boolean).join(", ")}</p>
        </div>
        <Link to="/patient/hospitals" className="btn btn-outline btn-sm">Back to list</Link>
      </div>

      {feedback.msg && (
        <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
      )}

      <h2 className="mt-2">Doctors</h2>
      {doctors.length === 0 ? (
        <div className="card empty mt-2">This hospital has not listed any doctors yet.</div>
      ) : (
        <div className="grid grid-2 mt-2">
          {doctors.map((d) => (
            <div key={d.doctorId} className="card">
              <h3>{d.doctorName}</h3>
              <p className="muted mt-2">{d.specialization} · {d.qualification}</p>
              <p className="mt-2">
                {d.experience} yrs experience · Fee ₹{d.consultationFee}
              </p>
              <p className="muted">{d.availableDays} · {d.availableTime}</p>

              {bookingFor?.doctorId === d.doctorId ? (
                <form onSubmit={submitBooking} className="mt-3">
                  <div className="row">
                    <div className="field">
                      <label>Date</label>
                      <input className="input" type="date" min={today} value={form.appointmentDate}
                        onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} required />
                    </div>
                    <div className="field">
                      <label>Time</label>
                      <input className="input" type="time" value={form.appointmentTime}
                        onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} required />
                    </div>
                  </div>
                  <div className="field">
                    <label>Reason</label>
                    <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
                  </div>
                  <div className="actions">
                    <button className="btn btn-primary btn-sm" disabled={saving}>
                      {saving ? "Booking..." : "Confirm booking"}
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setBookingFor(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="actions mt-3">
                  <button className="btn btn-primary btn-sm" onClick={() => openBooking(d)}>Book appointment</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
