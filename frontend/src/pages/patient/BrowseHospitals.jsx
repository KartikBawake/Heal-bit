import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { browseHospitals } from "../../api/hospitalApi";
import { getErrorMessage } from "../../utils/error";
import StatusBadge from "../../components/StatusBadge";

export default function BrowseHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (params) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await browseHospitals(params);
      setHospitals(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load(city ? { city } : undefined);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <p className="eyebrow">Patient</p>
          <h1>Browse hospitals</h1>
        </div>
        <form onSubmit={onSearch} className="actions">
          <input className="input" placeholder="Search by city" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: 220 }} />
          <button className="btn btn-primary">Search</button>
          {city && (
            <button type="button" className="btn btn-outline" onClick={() => { setCity(""); load(); }}>
              Clear
            </button>
          )}
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <p className="muted">Loading hospitals...</p>
      ) : hospitals.length === 0 ? (
        <div className="card empty">No hospitals found. Try a different city.</div>
      ) : (
        <div className="grid grid-2">
          {hospitals.map((h) => (
            <div key={h.hospitalId} className="card">
              <div className="flex-between">
                <h3>{h.hospitalName}</h3>
                <StatusBadge status={h.status} />
              </div>
              <p className="muted mt-2">
                {[h.city, h.state].filter(Boolean).join(", ") || "Location not specified"}
              </p>
              {h.description && <p className="mt-2">{h.description}</p>}
              <div className="actions mt-3">
                <Link to={`/patient/hospitals/${h.hospitalId}`} className="btn btn-primary btn-sm">
                  View doctors &amp; book
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
