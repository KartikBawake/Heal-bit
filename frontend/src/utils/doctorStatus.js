// Maps a doctor's real-time `currentStatus` (from DoctorResponse) to a display tag.
// currentStatus is computed server-side from working hours + break windows compared against
// the current time — see ScheduleUtil#computeCurrentStatus on the backend.
export function doctorStatusTag(doctor) {
  switch (doctor?.currentStatus) {
    case "ON_BREAK":
      return { cls: "break", label: "On break" };
    case "AVAILABLE":
      return { cls: "on", label: "Available" };
    case "UNAVAILABLE":
    default:
      return { cls: "off", label: "Unavailable" };
  }
}
