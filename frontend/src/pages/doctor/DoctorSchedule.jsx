import { useEffect, useMemo, useState } from "react";
import { getMyDoctorProfile, updateMySchedule } from "../../api/doctorApi";
import { getErrorMessage } from "../../utils/error";
import { WEEK_DAYS } from "../../constants";

function countSlots(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? Math.floor(mins / 30) : 0;
}

export default function DoctorSchedule() {
  const [profile, setProfile] = useState(null);
  const [days, setDays] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [fee, setFee] = useState("");
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyDoctorProfile()
      .then(({ data }) => {
        setProfile(data);
        setDays(data.workingDays || []);
        setStart(data.startTime || "");
        setEnd(data.endTime || "");
        setFee(data.consultationFee ?? "");
      })
      .catch((e) => setFeedback({ type: "error", msg: getErrorMessage(e) }));
  }, []);

  const toggleDay = (value) =>
    setDays((d) => (d.includes(value) ? d.filter((x) => x !== value) : [...d, value]));

  const slots = useMemo(() => countSlots(start, end), [start, end]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", msg: "" });
    if (days.length === 0) return setFeedback({ type: "error", msg: "Pick at least one working day." });
    if (!start || !end) return setFeedback({ type: "error", msg: "Set both start and end times." });
    if (start >= end) return setFeedback({ type: "error", msg: "Start time must be before end time." });

    setSaving(true);
    try {
      const { data } = await updateMySchedule({
        workingDays: days,
        startTime: start,
        endTime: end,
        consultationFee: fee === "" ? null : Number(fee),
      });
      setProfile(data);
      setFeedback({ type: "success", msg: "Schedule saved. Patients can now book your open 30-minute slots." });
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Doctor</p>
          <h1>My schedule</h1>
          <p className="sub">Appointments run in fixed 30-minute slots within your working window.</p>
        </div>
        <span className={`avail-tag ${profile.available ? "on" : "off"}`}>
          <span className="dot-ind" /> {profile.available ? "Available" : "Not available"}
        </span>
      </div>

      {feedback.msg && (
        <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
      )}

      <form onSubmit={onSubmit} className="card" style={{ maxWidth: 620 }}>
        <div className="field">
          <label>Working days</label>
          <div className="day-picker">
            {WEEK_DAYS.map((d) => (
              <button
                type="button"
                key={d.value}
                className={`day-chip${days.includes(d.value) ? " active" : ""}`}
                onClick={() => toggleDay(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label>Start time</label>
            <input className="input" type="time" step="1800" value={start} onChange={(e) => setStart(e.target.value)} required />
          </div>
          <div className="field">
            <label>End time</label>
            <input className="input" type="time" step="1800" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </div>
        </div>

        <div className="field">
          <label>Consultation fee (₹)</label>
          <input className="input" type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} />
        </div>

        {slots > 0 && (
          <p className="hint">That’s <strong>{slots}</strong> slots of 30 minutes per working day.</p>
        )}

        <div className="actions mt-2">
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save schedule"}</button>
        </div>
      </form>
    </div>
  );
}
