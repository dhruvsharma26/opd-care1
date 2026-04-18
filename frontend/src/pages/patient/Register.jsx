import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  Square,
  Check,
  Sparkles,
  ChevronRight,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePatients } from "../../hooks/usePatients";

export default function PatientRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createPatient, isLoading, error } = usePatients();

  const [form, setForm] = useState({
    age: "",
    gender: "",
    bloodGroup: "",
    complaint: "",
  });
  const [mode, setMode] = useState("manual");
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [patientToken, setPatientToken] = useState("");
  const [submitError, setSubmitError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleRec = () => {
    if (!recording) {
      setRecording(true);
      setTranscript("");
      setAnalysis(null);
    } else {
      setRecording(false);
      // Simulate transcription + analysis
      setTimeout(() => {
        setTranscript(
          "I've had a persistent dry cough for about four days with mild fever in the evenings and some chest tightness when breathing deeply.",
        );
        setAnalysis({
          severity: "moderate",
          confidence: 92,
          specialties: ["General Physician", "Pulmonology"],
          tags: ["fever", "dry cough", "chest tightness"],
        });
      }, 700);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      const result = await createPatient({
        name: user?.name || "Patient",
        email: user?.email || `patient-${Date.now()}@hospital.local`,
        phone: user?.phone || "0000000000",
        age: parseInt(form.age),
        gender: form.gender,
        bloodGroup: form.bloodGroup || "O+",
        medicalHistory: [],
        allergies: "No known drug allergies",
      });

      setPatientToken(result.token);
      setSubmitted(true);
      setTimeout(() => {
        localStorage.setItem("patient_token", result.token);
        localStorage.setItem("patient_id", result.patientId);
        navigate("/patient");
      }, 1400);
    } catch (err) {
      setSubmitError(
        err.response?.data?.error || "Failed to register. Please try again.",
      );
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto">
        <div
          className="card-elev p-10 text-center animate-enter"
          data-testid="register-success"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sage/20 text-sage grid place-items-center mb-4">
            <Check className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl">Intake recorded</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Token{" "}
            <span className="font-mono text-accent">
              {patientToken || "#OPD-0247"}
            </span>{" "}
            · You'll be called in ~6 min.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-enter">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          New visit
        </p>
        <h2 className="font-display text-3xl">Tell us what's going on</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Type or speak — we'll route you to the right clinician.
        </p>
      </header>

      {submitError && (
        <div className="card-elev p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{submitError}</p>
        </div>
      )}

      <form
        onSubmit={submit}
        className="card-elev p-6 space-y-6"
        data-testid="register-form"
      >
        {/* Readonly identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Name
            </label>
            <input
              disabled
              value={user?.name || ""}
              className="input-base mt-1 opacity-70 cursor-not-allowed"
              data-testid="readonly-name"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Phone
            </label>
            <input
              disabled
              value={user?.phone || ""}
              className="input-base mt-1 opacity-70 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Age
            </label>
            <input
              required
              type="number"
              value={form.age}
              onChange={set("age")}
              className="input-base mt-1"
              placeholder="29"
              data-testid="input-age"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Gender
            </label>
            <select
              required
              value={form.gender}
              onChange={set("gender")}
              className="input-base mt-1"
              data-testid="select-gender"
            >
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Non-binary</option>
              <option>Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Blood group
            </label>
            <select
              value={form.bloodGroup}
              onChange={set("bloodGroup")}
              className="input-base mt-1"
              data-testid="select-blood"
            >
              <option value="">Select</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode switch */}
        <div
          className="grid grid-cols-2 gap-2 bg-muted/60 p-1 rounded-full w-fit mx-auto sm:mx-0"
          data-testid="mode-switch"
        >
          {["manual", "voice"].map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMode(m)}
              data-testid={`mode-${m}`}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                mode === m
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {m === "manual" ? "Type it" : "Speak it"}
            </button>
          ))}
        </div>

        {mode === "manual" ? (
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Chief complaint
            </label>
            <textarea
              required
              rows={4}
              value={form.complaint}
              onChange={set("complaint")}
              placeholder="Describe your symptoms in your own words…"
              className="input-base mt-1 resize-none"
              data-testid="textarea-complaint"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6">
            <div className="flex flex-col items-center text-center">
              <button
                type="button"
                onClick={toggleRec}
                data-testid="record-btn"
                className={`relative w-20 h-20 rounded-full grid place-items-center transition ${
                  recording
                    ? "bg-destructive text-destructive-foreground animate-pulse-ring"
                    : "bg-accent text-accent-foreground hover:scale-105"
                }`}
              >
                {recording ? (
                  <Square className="w-7 h-7" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
              <p className="font-display text-lg mt-4">
                {recording ? "Listening…" : "Tap to speak"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll transcribe & suggest a specialty (demo)
              </p>
            </div>

            {transcript && (
              <div className="mt-6 animate-enter">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Transcript
                </p>
                <p className="italic text-sm leading-relaxed bg-muted/40 p-4 rounded-xl border border-border">
                  "{transcript}"
                </p>

                {analysis && (
                  <div
                    className="mt-4 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-sage/10 border border-accent/20"
                    data-testid="analysis-card"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <p className="text-sm font-medium">
                        AI triage · {analysis.confidence}% confidence
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground uppercase tracking-wider">
                          Severity
                        </p>
                        <p className="font-display text-lg capitalize">
                          {analysis.severity}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground uppercase tracking-wider">
                          Suggested
                        </p>
                        <p className="font-display text-lg leading-tight">
                          {analysis.specialties[0]}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground uppercase tracking-wider">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.tags.map((t) => (
                            <span key={t} className="chip text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-ghost text-sm"
            data-testid="register-back"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary text-sm flex items-center gap-2"
            data-testid="register-submit"
            disabled={isLoading}
          >
            <FileText className="w-4 h-4" />
            {isLoading ? "Registering..." : "Submit intake"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
