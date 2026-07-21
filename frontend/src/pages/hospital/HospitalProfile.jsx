import { useEffect, useState } from "react";
import { updateHospital, getHospital } from "../../api/hospitalApi";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/error";
import { useFormValidation } from "../../hooks/useFormValidation";
import { vRequired, isPhone10, isPincode6 } from "../../utils/validators";
import ImagePicker from "../../components/ImagePicker";

const initial = {
  hospitalName: "", phone: "", address: "", city: "", state: "", pincode: "", description: "", image: "",
};

const validate = (v) => {
  const e = {};
  const put = (k, msg) => { if (msg) e[k] = msg; };
  put("hospitalName", vRequired(v.hospitalName, "Hospital name"));
  if (v.phone && !isPhone10(v.phone)) put("phone", "Phone must be exactly 10 digits.");
  if (v.pincode && !isPincode6(v.pincode)) put("pincode", "Pincode must be exactly 6 digits.");
  return e;
};

export default function HospitalProfile() {
  const { auth } = useAuth();
  const { values, errors, field, setValue, reset, handleSubmit } = useFormValidation(initial, validate);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth?.user?.id) return;
    getHospital(auth.user.id)
      .then(({ data }) => reset({
        hospitalName: data.hospitalName || "", phone: data.phone || "", address: data.address || "",
        city: data.city || "", state: data.state || "", pincode: data.pincode || "",
        description: data.description || "", image: data.imageUrl || "",
      }))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const submit = async (v) => {
    setSaving(true);
    setFeedback({ type: "", msg: "" });
    // Send only non-empty text fields (so blank optional fields don't fail pattern checks),
    // but always send image so it can be updated or cleared.
    const payload = Object.fromEntries(Object.entries(v).filter(([k, val]) => k !== "image" && val !== ""));
    payload.image = v.image;
    try {
      await updateHospital(payload);
      setFeedback({ type: "success", msg: "Hospital profile updated." });
    } catch (err) {
      setFeedback({ type: "error", msg: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const cls = (name) => `input${errors[name] ? " input-error" : ""}`;

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Hospital profile</h1>
          <p className="sub">Update your details and photo. Patients see these when browsing.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        {feedback.msg && (
          <div className={`alert alert-${feedback.type === "success" ? "success" : "error"}`}>{feedback.msg}</div>
        )}
        <form onSubmit={handleSubmit(submit)} noValidate>
          <ImagePicker
            value={values.image}
            onChange={(dataUrl) => setValue("image", dataUrl)}
            onError={(msg) => msg && setFeedback({ type: "error", msg })}
          />
          <div className="field">
            <label>Hospital name</label>
            <input className={cls("hospitalName")} {...field("hospitalName")} />
            {errors.hospitalName && <p className="err">{errors.hospitalName}</p>}
          </div>
          <div className="row">
            <div className="field">
              <label>Phone</label>
              <input className={cls("phone")} {...field("phone")} placeholder="10 digits" />
              {errors.phone && <p className="err">{errors.phone}</p>}
            </div>
            <div className="field">
              <label>Pincode</label>
              <input className={cls("pincode")} {...field("pincode")} placeholder="6 digits" />
              {errors.pincode && <p className="err">{errors.pincode}</p>}
            </div>
          </div>
          <div className="field">
            <label>Address</label>
            <input className="input" {...field("address")} />
          </div>
          <div className="row">
            <div className="field">
              <label>City</label>
              <input className="input" {...field("city")} />
            </div>
            <div className="field">
              <label>State</label>
              <input className="input" {...field("state")} />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea {...field("description")} />
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
