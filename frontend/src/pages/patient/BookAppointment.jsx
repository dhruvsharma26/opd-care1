import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  Clock,
  Check,
  MapPin,
  Filter,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useDoctors } from "../../hooks/useDoctors";
import { useAppointments } from "../../hooks/useAppointments";
import { useAuth } from "../../context/AuthContext";

const SPECIALTIES = [
  "All",
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pulmonologist",
  "Ophthalmologist",
  "Dentist",
];
const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

export default function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { doctors, isLoading: loadingDoctors } = useDoctors();
  const {
    createAppointment,
    isLoading: bookingLoading,
    error: bookingError,
  } = useAppointments();

  const preselect = location.state?.doctorId;

  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("All");
  const [availToday, setAvailToday] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(preselect || null);
  const [slot, setSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [selectedDoctorData, setSelectedDoctorData] = useState(null);
  const [appointmentError, setAppointmentError] = useState("");

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      if (
        q &&
        !d.name.toLowerCase().includes(q.toLowerCase()) &&
        !d.specialty.toLowerCase().includes(q.toLowerCase())
      )
        return false;
      if (spec !== "All" && d.specialty !== spec) return false;
      if (availToday && !d.availableToday) return false;
      return true;
    });
  }, [q, spec, availToday, doctors]);

  const doc = selectedDoctorData || filtered.find((d) => d._id === selectedDoc);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoc(doctor._id);
    setSelectedDoctorData(doctor);
    setSlot(null);
  };

  const confirm = async () => {
    if (!doc || !slot || !user) {
      setAppointmentError("Please select a doctor and time slot");
      return;
    }

    setAppointmentError("");
    try {
      await createAppointment({
        patientId: user.id,
        patientName: user.name,
        doctorId: doc._id,
        doctorName: doc.name,
        specialty: doc.specialty,
        date: new Date().toISOString().split("T")[0],
        time: slot,
        complaint: "General checkup",
        age: user.age || 30,
        gender: user.gender || "Not specified",
        severity: "mild",
      });

      setConfirmed(true);
      setTimeout(() => navigate("/patient"), 1600);
    } catch (err) {
      setAppointmentError("Failed to book appointment. Please try again.");
    }
  };

  if (confirmed) {
    return (
      <div className="max-w-xl mx-auto">
        <div
          className="card-elev p-10 text-center animate-enter"
          data-testid="book-success"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sage/20 text-sage grid place-items-center mb-4">
            <Check className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl">You're booked!</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {doc?.name} · Today · {slot}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Care discovery
          </p>
          <h2 className="font-display text-3xl">Find the right clinician</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loadingDoctors
              ? "Loading..."
              : `${filtered.length} doctors match your filters`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search doctors or specialties…"
              className="input-base pl-9 w-64"
              data-testid="search-doctor"
              disabled={loadingDoctors}
            />
          </div>
          <button
            onClick={() => setAvailToday((a) => !a)}
            data-testid="filter-today"
            className={`btn-ghost text-sm flex items-center gap-2 ${availToday ? "bg-accent/10 border-accent/40 text-accent" : ""}`}
            disabled={loadingDoctors}
          >
            <Filter className="w-3.5 h-3.5" /> Today only
          </button>
        </div>
      </header>

      {appointmentError && (
        <div className="card-elev p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{appointmentError}</p>
        </div>
      )}

      {/* Specialty tabs */}
      <div className="flex flex-wrap gap-2" data-testid="specialty-tabs">
        {SPECIALTIES.map((s) => (
          <button
            key={s}
            onClick={() => setSpec(s)}
            data-testid={`spec-${s}`}
            disabled={loadingDoctors}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              spec === s
                ? "bg-primary text-primary-foreground border-primary shadow-soft"
                : "bg-card border-border hover:border-ring/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctors grid */}
        <div
          className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4"
          data-testid="doctors-grid"
        >
          {loadingDoctors ? (
            <div className="md:col-span-2 card-elev p-10 text-center text-sm text-muted-foreground">
              Loading doctors...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="md:col-span-2 card-elev p-10 text-center text-sm text-muted-foreground"
              data-testid="no-doctors"
            >
              No doctors match your filters.
            </div>
          ) : (
            filtered.map((d) => {
              const active = selectedDoc === d._id;
              return (
                <button
                  key={d._id}
                  onClick={() => handleSelectDoctor(d)}
                  data-testid={`doc-card-${d._id}`}
                  className={`text-left card-elev p-5 transition-all hover:-translate-y-0.5 ${
                    active ? "border-ring shadow-lift ring-2 ring-ring/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl grid place-items-center font-display text-xl shrink-0 bg-accent/15 text-accent">
                      {d.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-display text-lg leading-tight truncate">
                          {d.name}
                        </p>
                        <span className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-[hsl(var(--sand))] text-[hsl(var(--sand))]" />
                          {d.rating || "4.5"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {d.specialty} · {d.experience || "5"} yrs
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          {d.availableToday ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-sage" />{" "}
                              Today · {d.nextSlot || "11:00 AM"}
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />{" "}
                              {d.nextSlot || "11:00 AM"}
                            </>
                          )}
                        </span>
                        <span className="font-mono text-foreground">
                          ₹{d.fee || "500"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right — Selected doctor + slot picker */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="card-elev p-6" data-testid="booking-panel">
            {!doc ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-muted grid place-items-center mb-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="font-display text-lg">Pick a doctor to begin</p>
                <p className="text-xs text-muted-foreground">
                  We'll show their live slots here.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Selected
                </p>
                <p className="font-display text-xl leading-tight mt-1">
                  {doc.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doc.specialty} · ₹{doc.fee || "500"}
                </p>

                <p className="text-xs uppercase tracking-wider text-muted-foreground mt-5 mb-2">
                  Pick a slot · Today
                </p>
                <div
                  className="grid grid-cols-3 gap-2"
                  data-testid="slots-grid"
                >
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSlot(t)}
                      data-testid={`slot-${t}`}
                      disabled={bookingLoading}
                      className={`py-2 rounded-xl text-xs font-mono border transition ${
                        slot === t
                          ? "bg-accent text-accent-foreground border-accent shadow-soft"
                          : "bg-card border-border hover:border-ring/60"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  disabled={!slot || bookingLoading}
                  onClick={confirm}
                  data-testid="confirm-booking"
                  className="mt-6 w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? "Booking..." : "Confirm"} · Today ·{" "}
                  {slot || "pick a slot"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
