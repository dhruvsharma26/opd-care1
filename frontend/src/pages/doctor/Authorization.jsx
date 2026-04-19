import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileBadge2, Hourglass, ShieldAlert, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import useDoctorAuthorization from "../../hooks/useDoctorAuthorization";
import { doctorAPI } from "../../services/api";

const statusTone = {
  approved: {
    icon: CheckCircle2,
    title: "Approved",
    className: "bg-sage/15 text-sage border-sage/30",
    description: "Your credentials are verified. Appointment actions are fully enabled.",
  },
  rejected: {
    icon: ShieldAlert,
    title: "Needs changes",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    description: "Please review the admin feedback, update your form, and resubmit.",
  },
  pending: {
    icon: Hourglass,
    title: "Pending approval",
    className: "bg-accent/15 text-accent border-accent/30",
    description: "Your eligibility form is waiting for admin verification.",
  },
};

const emptyForm = {
  fullName: "",
  specialty: "",
  highestQualification: "",
  licenseNumber: "",
  councilName: "",
  registrationYear: "",
  yearsOfExperience: "",
  institutionName: "",
  governmentIdNumber: "",
  practiceAddress: "",
  bio: "",
};

const buildFormFromDoctor = (doctor) => ({
  fullName: doctor?.authorization?.fullName || doctor?.name || "",
  specialty: doctor?.authorization?.specialty || doctor?.specialty || "",
  highestQualification: doctor?.authorization?.highestQualification || "",
  licenseNumber: doctor?.authorization?.licenseNumber || doctor?.license_number || "",
  councilName: doctor?.authorization?.councilName || "",
  registrationYear: doctor?.authorization?.registrationYear || "",
  yearsOfExperience: String(
    doctor?.authorization?.yearsOfExperience ?? doctor?.experience ?? "",
  ),
  institutionName: doctor?.authorization?.institutionName || "",
  governmentIdNumber: doctor?.authorization?.governmentIdNumber || "",
  practiceAddress: doctor?.authorization?.practiceAddress || "",
  bio: doctor?.authorization?.bio || "",
});

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
      });
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

export default function DoctorAuthorization() {
  const { user } = useAuth();
  const { doctor, setDoctor, loading, authorizationStatus, isApproved, reviewerNote } =
    useDoctorAuthorization(user?.doctorId);
  const [form, setForm] = useState(emptyForm);
  const [documents, setDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!doctor) return;
    if (isDirty) return;

    setForm(buildFormFromDoctor(doctor));
    setDocuments(doctor.authorization?.documents || []);
  }, [doctor, isDirty]);

  useEffect(() => {
    setIsDirty(false);
  }, [doctor?._id]);

  const statusMeta = statusTone[authorizationStatus] || statusTone.pending;
  const StatusIcon = statusMeta.icon;
  const hasSubmission = useMemo(
    () => Boolean(doctor?.authorization?.submittedAt && documents.length > 0),
    [doctor?.authorization?.submittedAt, documents.length],
  );

  const handleDocumentSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      const oversized = files.find((file) => file.size > 2 * 1024 * 1024);
      if (oversized) {
        toast.error(`${oversized.name} is larger than 2 MB`);
        return;
      }

      const nextDocuments = await Promise.all(files.map(readFileAsDataUrl));
      setIsDirty(true);
      setDocuments((current) => [...current, ...nextDocuments]);
      toast.success(`${nextDocuments.length} document${nextDocuments.length > 1 ? "s" : ""} added`);
    } catch (error) {
      toast.error(error.message || "Failed to process documents");
    } finally {
      event.target.value = "";
    }
  };

  const removeDocument = (name) => {
    setIsDirty(true);
    setDocuments((current) => current.filter((document) => document.name !== name));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.doctorId) return;

    setSubmitting(true);
    try {
      const response = await doctorAPI.submitAuthorization(user.doctorId, {
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        documents,
      });
      setIsDirty(false);
      setForm(buildFormFromDoctor(response.data.doctor));
      setDocuments(response.data.doctor?.authorization?.documents || []);
      setDoctor(response.data.doctor);
      toast.success("Authorization form submitted for review");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to submit authorization form",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-enter">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Clinician verification
          </p>
          <h2 className="font-display text-3xl">Authorization</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Complete your eligibility form and upload valid credentials so the admin
            team can verify your profile.
          </p>
        </div>
      </section>

      <section className={`card-elev p-5 border ${statusMeta.className}`}>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-background/70 grid place-items-center shrink-0">
            <StatusIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-display text-2xl">{statusMeta.title}</p>
              <span className="chip text-[10px] uppercase tracking-wider">
                {authorizationStatus}
              </span>
            </div>
            <p className="text-sm mt-1">{statusMeta.description}</p>
            {!hasSubmission && !loading && (
              <p className="text-xs mt-2 opacity-90">
                Submit your form once to move into the admin review queue.
              </p>
            )}
            {reviewerNote && (
              <p className="text-xs mt-3 rounded-xl bg-background/60 px-3 py-2">
                Admin note: {reviewerNote}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6">
        <form onSubmit={handleSubmit} className="card-elev p-6 space-y-5">
          <div>
            <h3 className="font-display text-2xl">Eligibility form</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Keep these details aligned with your certificates and registration documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["fullName", "Full name"],
              ["specialty", "Specialty"],
              ["highestQualification", "Highest qualification"],
              ["licenseNumber", "License number"],
              ["councilName", "Council / licensing authority"],
              ["registrationYear", "Registration year"],
              ["yearsOfExperience", "Years of experience"],
              ["institutionName", "Medical college / institution"],
              ["governmentIdNumber", "Government ID number"],
            ].map(([key, label]) => (
              <label key={key} className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
                <input
                  value={form[key]}
                  onChange={(event) => {
                    setIsDirty(true);
                    setForm((current) => ({ ...current, [key]: event.target.value }));
                  }}
                  className="input-base"
                  disabled={loading || submitting}
                  required
                />
              </label>
            ))}
          </div>

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Practice address
            </span>
            <textarea
              value={form.practiceAddress}
              onChange={(event) => {
                setIsDirty(true);
                setForm((current) => ({
                  ...current,
                  practiceAddress: event.target.value,
                }));
              }}
              rows={3}
              className="input-base resize-none"
              disabled={loading || submitting}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Professional summary
            </span>
            <textarea
              value={form.bio}
              onChange={(event) => {
                setIsDirty(true);
                setForm((current) => ({ ...current, bio: event.target.value }));
              }}
              rows={4}
              className="input-base resize-none"
              disabled={loading || submitting}
              placeholder="Share your clinical focus, departments served, and relevant expertise."
            />
          </label>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground">
              Approval controls on the queue unlock automatically once admin marks you approved.
            </p>
            <button
              type="submit"
              className="btn-primary text-sm"
              disabled={submitting || loading}
            >
              {submitting ? "Submitting..." : isApproved ? "Update authorization" : "Submit for review"}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <section className="card-elev p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl">Credentials</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload degree certificates, registration proof, or hospital credentials.
                </p>
              </div>
              <label className="btn-accent text-sm cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Add files
                <input
                  type="file"
                  accept=".pdf,image/*"
                  multiple
                  className="hidden"
                  onChange={handleDocumentSelect}
                  disabled={submitting}
                />
              </label>
            </div>

            {documents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No files uploaded yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {documents.map((document) => (
                  <li
                    key={`${document.name}-${document.size}`}
                    className="rounded-2xl border border-border p-4 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
                      <FileBadge2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{document.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {document.type || "Document"} ·{" "}
                        {Math.max(1, Math.round((document.size || 0) / 1024))} KB
                      </p>
                      {document.dataUrl && (
                        <a
                          href={document.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-accent link-underline mt-2 inline-block"
                        >
                          Preview file
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(document.name)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card-elev p-6">
            <h3 className="font-display text-xl">What happens next</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>1. Submit the form with at least one valid credential document.</li>
              <li>2. Admin reviews your eligibility details inside the Authorize panel.</li>
              <li>3. Once approved, your queue actions unlock automatically.</li>
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
