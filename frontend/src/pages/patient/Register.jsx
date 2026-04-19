import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Check,
  ChevronRight,
  FileText,
  LoaderCircle,
  Mic,
  Stethoscope,
  Square,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePatients } from "../../hooks/usePatients";
import { aiAPI } from "../../services/api";

export default function PatientRegister() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { createPatient, isLoading } = usePatients();
  const recognitionRef = useRef(null);

  const [form, setForm] = useState({
    age: user?.age || "",
    gender: user?.gender || "",
    bloodGroup: user?.bloodGroup || "",
    complaint: user?.latestComplaint || "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [patientToken, setPatientToken] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [complaintAnalysis, setComplaintAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisSource, setAnalysisSource] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      setForm((current) => ({
        ...current,
        complaint: transcript || current.complaint,
      }));
    };

    recognition.onerror = (event) => {
      setSpeechError(
        event.error === "not-allowed"
          ? "Microphone permission denied. Please allow mic access."
          : "Voice transcription failed. Please try again.",
      );
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const setField = (key) => (e) =>
    setForm((current) => ({ ...current, [key]: e.target.value }));

  useEffect(() => {
    const complaint = form.complaint.trim();
    if (complaint.length < 8) {
      setComplaintAnalysis(null);
      setAnalysisError("");
      setAnalysisSource("");
      setAnalysisLoading(false);
      return undefined;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setAnalysisLoading(true);
      setAnalysisError("");
      try {
        const response = await aiAPI.analyzeComplaint({ complaint });
        if (!active) return;
        setComplaintAnalysis(response.data.analysis || null);
        setAnalysisSource(response.data.source || "");
      } catch (error) {
        if (!active) return;
        setComplaintAnalysis(null);
        setAnalysisSource("");
        setAnalysisError(
          error.response?.data?.error || "AI symptom analysis is unavailable right now.",
        );
      } finally {
        if (active) {
          setAnalysisLoading(false);
        }
      }
    }, 900);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [form.complaint]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    setSpeechError("");
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    recognitionRef.current.start();
    setIsRecording(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      const result = await createPatient({
        age: Number(form.age),
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        complaint: form.complaint,
        medicalHistory: [],
        currentMedications: [],
        allergies: user?.allergies || "No known drug allergies",
      });

      updateUser({
        patientId: result.patientId,
        patient: {
          ...result.patient,
          id: result.patientId,
        },
        age: result.patient.age,
        gender: result.patient.gender,
        bloodGroup: result.patient.bloodGroup,
        latestComplaint: result.patient.latestComplaint,
        allergies: result.patient.allergies,
      });

      setPatientToken(result.token);
      setSubmitted(true);
      setTimeout(() => navigate("/patient"), 1400);
    } catch (err) {
      setSubmitError(
        err.response?.data?.error || "Failed to save intake. Please try again.",
      );
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card-elev p-10 text-center animate-enter">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sage/20 text-sage grid place-items-center mb-4">
            <Check className="w-7 h-7" />
          </div>
          <h2 className="font-display text-2xl">Intake saved</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Token <span className="font-mono text-accent">{patientToken}</span> is
            now linked to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-enter">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Patient intake
        </p>
        <h2 className="font-display text-3xl">Complete your visit details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          These details are saved to your patient profile and reused when you book
          with a doctor.
        </p>
      </header>

      {submitError && (
        <div className="card-elev p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{submitError}</p>
        </div>
      )}

      <form onSubmit={submit} className="card-elev p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Name
            </label>
            <input
              disabled
              value={user?.name || ""}
              className="input-base mt-1 opacity-70 cursor-not-allowed"
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
              min="0"
              value={form.age}
              onChange={setField("age")}
              className="input-base mt-1"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Gender
            </label>
            <select
              required
              value={form.gender}
              onChange={setField("gender")}
              className="input-base mt-1"
            >
              <option value="">Select</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Blood group
            </label>
            <select
              value={form.bloodGroup}
              onChange={setField("bloodGroup")}
              className="input-base mt-1"
            >
              <option value="">Select</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Chief complaint
            </label>
            {speechSupported && (
              <button
                type="button"
                onClick={toggleRecording}
                className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-2 transition ${
                  isRecording
                    ? "bg-destructive/10 text-destructive border-destructive/40"
                    : "bg-card border-border hover:border-ring/60"
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-3.5 h-3.5" /> Stop recording
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" /> Speak symptoms
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            required
            rows={5}
            value={form.complaint}
            onChange={setField("complaint")}
            placeholder="Describe your symptoms in your own words..."
            className="input-base mt-1 resize-none"
          />
          {speechSupported ? (
            <p className="text-xs text-muted-foreground mt-2">
              Use the microphone to speak symptoms and they will be converted to
              text automatically.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">
              Speech-to-text is not supported in this browser yet.
            </p>
          )}
          {speechError && (
            <p className="text-xs text-destructive mt-2">{speechError}</p>
          )}
        </div>

        {(analysisLoading || complaintAnalysis || analysisError) && (
          <section className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  AI symptom stats
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Spoken and typed symptoms are analyzed through the same intake path.
                </p>
              </div>
              {analysisLoading ? (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                  Analyzing symptoms...
                </div>
              ) : analysisSource ? (
                <span className="chip capitalize">{analysisSource}</span>
              ) : null}
            </div>

            {analysisError && (
              <p className="text-xs text-destructive">{analysisError}</p>
            )}

            {complaintAnalysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ["Urgency", complaintAnalysis.urgency],
                    ["Urgency score", complaintAnalysis.urgencyScore],
                    ["Likely department", complaintAnalysis.likelyDepartment],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-background/70 border border-border p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <p className="text-sm mt-2 capitalize">{value || "-"}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Intake summary
                  </p>
                  <p className="text-sm mt-2">{complaintAnalysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Key symptoms
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(complaintAnalysis.keySymptoms || []).length === 0 ? (
                        <span className="text-sm text-muted-foreground">No symptom tags yet.</span>
                      ) : (
                        complaintAnalysis.keySymptoms.map((symptom) => (
                          <span key={symptom} className="chip capitalize">
                            {symptom}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Risk flags
                    </p>
                    <div className="mt-2 space-y-2">
                      {(complaintAnalysis.riskFlags || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No immediate risk flags detected.</p>
                      ) : (
                        complaintAnalysis.riskFlags.map((flag) => (
                          <p key={flag} className="text-sm">
                            {flag}
                          </p>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Suggested next details to mention
                  </p>
                  <div className="mt-2 space-y-2">
                    {(complaintAnalysis.recommendations || []).map((item) => (
                      <p key={item} className="text-sm">{item}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Recommended doctors for these symptoms
                  </p>
                  {(complaintAnalysis.recommendedDoctors || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">
                      Doctor recommendations will appear once a suitable match is found.
                    </p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {complaintAnalysis.recommendedDoctors.map((doctor) => (
                        <div
                          key={doctor.id || doctor.name}
                          className="rounded-2xl bg-background/70 border border-border p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
                                <Stethoscope className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{doctor.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {doctor.specialty}
                                </p>
                              </div>
                            </div>
                            {doctor.availableToday && (
                              <span className="chip text-[10px]">Today</span>
                            )}
                          </div>
                          <p className="text-sm mt-3">{doctor.reason}</p>
                          <div className="mt-3 text-xs text-muted-foreground space-y-1">
                            {doctor.nextSlot && <p>Next slot: {doctor.nextSlot}</p>}
                            {doctor.experience !== undefined && <p>Experience: {doctor.experience} years</p>}
                            {doctor.fee !== undefined && <p>Consultation fee: Rs. {doctor.fee}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-ghost text-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary text-sm flex items-center gap-2"
            disabled={isLoading}
          >
            <FileText className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save intake"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
