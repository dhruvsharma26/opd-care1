import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { doctorAPI } from "../../services/api";

const filters = ["all", "pending", "approved", "rejected"];

const toneMap = {
  pending: "bg-accent/15 text-accent border-accent/30",
  approved: "bg-sage/15 text-sage border-sage/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminAuthorize() {
  const [doctors, setDoctors] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [reviewerNote, setReviewerNote] = useState("");
  const [reviewerNoteDirty, setReviewerNoteDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await doctorAPI.getAll();
        if (!mounted) return;
        const doctorList = response.data || [];
        setDoctors(doctorList);
        setSelectedId((current) => current || doctorList[0]?._id || null);
      } catch (error) {
        toast.error("Failed to load authorization queue");
      }
    };

    load();
    const intervalId = window.setInterval(load, 5000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    if (filter === "all") return doctors;
    return doctors.filter(
      (doctor) => (doctor.authorization?.status || "pending") === filter,
    );
  }, [doctors, filter]);

  useEffect(() => {
    if (filteredDoctors.some((doctor) => doctor._id === selectedId)) return;
    setSelectedId(filteredDoctors[0]?._id || doctors[0]?._id || null);
  }, [doctors, filteredDoctors, selectedId]);

  const selectedDoctor =
    filteredDoctors.find((doctor) => doctor._id === selectedId)
    || doctors.find((doctor) => doctor._id === selectedId)
    || null;

  useEffect(() => {
    if (reviewerNoteDirty) return;
    setReviewerNote(selectedDoctor?.authorization?.reviewerNote || "");
  }, [reviewerNoteDirty, selectedDoctor]);

  useEffect(() => {
    setReviewerNoteDirty(false);
  }, [selectedDoctor?._id]);

  const submitReview = async (status) => {
    if (!selectedDoctor) return;

    setSubmitting(true);
    try {
      const response = await doctorAPI.reviewAuthorization(selectedDoctor._id, {
        status,
        reviewerNote,
      });
      const updatedDoctor = response.data.doctor;
      setReviewerNoteDirty(false);
      setReviewerNote(updatedDoctor.authorization?.reviewerNote || "");
      setDoctors((current) =>
        current.map((doctor) =>
          doctor._id === updatedDoctor._id ? updatedDoctor : doctor,
        ),
      );
      toast.success(`Doctor marked ${status}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update authorization");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = doctors.filter(
    (doctor) => (doctor.authorization?.status || "pending") === "pending",
  ).length;

  return (
    <div className="space-y-6 animate-enter">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Admin verification
          </p>
          <h2 className="font-display text-3xl">Authorize clinicians</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Review doctor eligibility forms, inspect uploaded credentials, and control
            who can confirm appointments.
          </p>
        </div>
        <div className="card-elev px-4 py-3 min-w-[180px]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Pending reviews
          </p>
          <p className="font-display text-3xl">{pendingCount}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <div className="card-elev overflow-hidden">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl">Verification queue</h3>
                <p className="text-xs text-muted-foreground">
                  Doctors waiting for eligibility clearance
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {filters.map((entry) => (
                <button
                  key={entry}
                  onClick={() => setFilter(entry)}
                  className={`chip capitalize ${
                    filter === entry ? "bg-primary text-primary-foreground border-primary" : ""
                  }`}
                >
                  {entry}
                </button>
              ))}
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No doctors match the current filter.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filteredDoctors.map((doctor) => (
                <li key={doctor._id}>
                  <button
                    onClick={() => setSelectedId(doctor._id)}
                    className={`w-full text-left p-5 transition ${
                      selectedId === doctor._id ? "bg-muted/50" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {doctor.specialty || "Specialty pending"} · {doctor.email}
                        </p>
                      </div>
                      <span
                        className={`chip text-[10px] uppercase tracking-wider ${
                          toneMap[doctor.authorization?.status || "pending"]
                        }`}
                      >
                        {doctor.authorization?.status || "pending"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {doctor.authorization?.documents?.length || 0} document(s) uploaded
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-elev p-6">
          {!selectedDoctor ? (
            <div className="text-sm text-muted-foreground">
              Select a doctor to review authorization details.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Doctor profile
                  </p>
                  <h3 className="font-display text-3xl">{selectedDoctor.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedDoctor.authorization?.highestQualification || "Qualification pending"} ·{" "}
                    {selectedDoctor.specialty || "Specialty pending"}
                  </p>
                </div>
                <span
                  className={`chip text-[10px] uppercase tracking-wider ${
                    toneMap[selectedDoctor.authorization?.status || "pending"]
                  }`}
                >
                  {selectedDoctor.authorization?.status || "pending"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {[
                  ["Full name", selectedDoctor.authorization?.fullName || selectedDoctor.name],
                  ["Specialty", selectedDoctor.authorization?.specialty || selectedDoctor.specialty],
                  ["License number", selectedDoctor.authorization?.licenseNumber || selectedDoctor.license_number],
                  ["Council", selectedDoctor.authorization?.councilName || "-"],
                  ["Registration year", selectedDoctor.authorization?.registrationYear || "-"],
                  ["Experience", `${selectedDoctor.authorization?.yearsOfExperience ?? selectedDoctor.experience ?? 0} years`],
                  ["Institution", selectedDoctor.authorization?.institutionName || "-"],
                  ["Government ID", selectedDoctor.authorization?.governmentIdNumber || "-"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-muted/40 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-2">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Practice address
                </p>
                <p className="mt-2 text-sm">
                  {selectedDoctor.authorization?.practiceAddress || "Not provided"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-4">
                  Professional summary
                </p>
                <p className="mt-2 text-sm">
                  {selectedDoctor.authorization?.bio || "Not provided"}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="font-display text-xl">Uploaded credentials</h4>
                  <span className="text-xs text-muted-foreground">
                    {(selectedDoctor.authorization?.documents || []).length} file(s)
                  </span>
                </div>
                {(selectedDoctor.authorization?.documents || []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                    No credentials uploaded yet.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {(selectedDoctor.authorization?.documents || []).map((document) => (
                      <li
                        key={document._id || document.name}
                        className="rounded-2xl border border-border p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-medium">{document.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {document.type || "Document"} ·{" "}
                            {Math.max(1, Math.round((document.size || 0) / 1024))} KB
                          </p>
                        </div>
                        <a
                          href={document.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost text-xs"
                        >
                          View file
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-3">
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Reviewer note
                  </span>
                  <textarea
                    rows={4}
                    value={reviewerNote}
                    onChange={(event) => {
                      setReviewerNoteDirty(true);
                      setReviewerNote(event.target.value);
                    }}
                    className="input-base resize-none"
                    placeholder="Add an approval note or describe what needs correction."
                  />
                </label>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => submitReview("approved")}
                    disabled={submitting}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => submitReview("rejected")}
                    disabled={submitting}
                    className="btn-accent text-sm flex items-center gap-2"
                  >
                    <ShieldX className="w-4 h-4" />
                    Reject
                  </button>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock3 className="w-3.5 h-3.5" />
                    Updates reflect on the doctor dashboard automatically.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
