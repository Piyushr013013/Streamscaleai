import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Link } from "react-router";
import { NyrNav, NyrFooter } from "@/components/NyrLayout";

export default function Jobs() {
  const navigate = useNavigate();
  const jobs = useQuery(api.jobs.listJobs);
  const applyMutation = useMutation(api.jobs.applyToJob);

  const [showApplyForm, setShowApplyForm] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<any>(null);

  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<{ name: string; size: number } | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applied, setApplied] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const uploadUrlMutation = useMutation(api.jobs.generateUploadUrl);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  // Security limits (mirrored on the server — the client check is only for
  // fast feedback; the server is the real gatekeeper):
  // - 5MB max to prevent oversized uploads
  // - only .pdf and .docx, verified by extension, browser type, AND file
  //   signature so a renamed executable is rejected
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const [resumeError, setResumeError] = useState("");

  /** Read the first bytes of a file to confirm it really is what it claims. */
  const checkFileSignature = async (file: File): Promise<boolean> => {
    try {
      const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
      if (header.length >= 4 && header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
        return true; // "%PDF" — real PDF
      }
      if (header.length >= 4 && header[0] === 0x50 && header[1] === 0x4b) {
        return true; // "PK" — ZIP container, which is what a .docx is
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleResumeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setResumeError("No file chosen. Please select your resume.");
      return;
    }

    const lowerName = file.name.toLowerCase();
    const hasValidExtension = lowerName.endsWith(".pdf") || lowerName.endsWith(".docx");
    const hasValidType =
      file.type === "application/pdf" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === ""; // some browsers report empty type for docx

    if (!hasValidExtension || !hasValidType) {
      setResumeError("Resumes must be a PDF or Word (.docx) document. Other file types are not accepted.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setResumeError("Your resume is too large. Please upload a file that is 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setResumeError("That file appears to be empty. Please choose your resume again.");
      event.target.value = "";
      return;
    }

    if (!(await checkFileSignature(file))) {
      setResumeError("This file is not a real PDF or Word document. Please upload your actual resume.");
      event.target.value = "";
      return;
    }

    setResumeFile(file);
    setResumePreview({ name: file.name, size: file.size });
    setResumeError("");
  };

  const handleApply = async (job: any) => {
    setApplyingTo(job);
    setShowApplyForm(job._id);
  };



  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError("");

    if (!applicantName || !applicantEmail) {
      setApplyError("Please fill in all required fields.");
      return;
    }
    if (!resumeFile) {
      setResumeError("Please attach your resume (PDF or Word document) to apply.");
      return;
    }

    setApplying(true);
    try {
      let resumeStorageId: string | undefined;
      if (resumeFile) {
        setUploadingResume(true);
        try {
          const { uploadUrl } = await uploadUrlMutation({});
          const response = await fetch(uploadUrl, {
            method: "POST",
            body: resumeFile,
            headers: { "Content-Type": resumeFile.type || "application/pdf" },
          });
          if (!response.ok) {
            throw new Error("Upload rejected");
          }
          const data = await response.json();
          resumeStorageId = data.storageId;
        } catch (uploadErr) {
          setApplyError("Your resume couldn't be uploaded. Check your connection and try again.");
          setApplying(false);
          setUploadingResume(false);
          return;
        } finally {
          setUploadingResume(false);
        }
      }

      await applyMutation({
        jobId: applyingTo._id,
        name: applicantName,
        email: applicantEmail,
        phone: applicantPhone || undefined,
        message: applyMessage || undefined,
        resumeStorageId,
      });

      setApplied(true);
    } catch (err: any) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    const roleClass: Record<string, string> = {
      "Software Engineer": "bg-blue-100 text-blue-700",
      "Senior Software Engineer": "bg-blue-100 text-blue-700",
      "Frontend Developer": "bg-purple-100 text-purple-700",
      "Backend Developer": "bg-green-100 text-green-700",
      "Full Stack Developer": "bg-indigo-100 text-indigo-700",
      "DevOps Engineer": "bg-orange-100 text-orange-700",
      "Data Scientist": "bg-pink-100 text-pink-700",
      "AI/ML Engineer": "bg-cyan-100 text-cyan-700",
      "QA Engineer": "bg-yellow-100 text-yellow-700",
      "Product Manager": "bg-red-100 text-red-700",
      "Designer": "bg-pink-100 text-pink-700",
    };
    return roleClass[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="nyr min-h-screen bg-[#171827] text-[#faf8f1]">
      <NyrNav />

      {/* Hero band */}
      <section className="relative overflow-hidden bg-[#171827]">
        <div className="nyr-grid-noise absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 50% at 80% 0%, rgba(159,165,200,.16), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="nyr-eyebrow mb-4">
              <span className="nyr-status-dot" />
              Careers
            </p>
            <h1 className="nyr-display">
              Join the <em>bench.</em>
            </h1>
            <p className="nyr-lede mt-5 max-w-[56ch]">
              Help us benchmark agents, deploy them into real workflows, and
              place the people who make AI work. Every application is reviewed
              by a person — attach a PDF or Word resume and we'll be in touch if
              there's a fit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Jobs list (light) */}
      <section className="nyr-light bg-[#f0f0ea] text-[#171827]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          {!jobs || jobs.length === 0 ? (
            <div className="border-y border-[rgba(75,84,139,0.28)] py-16 text-center">
              <h3 className="text-2xl font-semibold tracking-tight">No open positions</h3>
              <p className="mt-2 text-[0.95rem] text-[#383a57]">
                Check back later for new opportunities.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job: any, index: number) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
                >
                <Card
                  className="border border-[rgba(75,84,139,0.28)] bg-white/70 shadow-[0_20px_60px_rgba(23,24,39,0.06)] transition-all hover:border-[#4b548b]/50 group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="border border-[#4b548b]/30 bg-[#4b548b]/10 text-[#30375f] hover:bg-[#4b548b]/15">
                        {job.role}
                      </Badge>
                      <span className="text-sm text-[#383a57]/60">
                        {new Date(job._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-[#171827] transition-colors group-hover:text-[#4b548b]">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-[#383a57]">
                      {job.companyName} · {job.jobType} · {job.salary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 line-clamp-2 text-sm text-[#383a57]/80">
                      {job.requirements}
                    </p>
                    {job.benefits && <p className="mb-2 text-xs text-[#4b548b]">Benefits: {job.benefits}</p>}
                    {job.extraInfo && (
                      <p className="mb-4 text-xs text-[#383a57]/60">
                        {job.extraInfo}
                      </p>
                    )}
                    <Button
                      onClick={() => handleApply(job)}
                      className="h-11 w-full gap-2 rounded-full bg-[#171827] text-[0.9rem] font-bold text-[#faf8f1] shadow-[0_10px_30px_rgba(23,24,39,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#30375f]"
                    >
                      Apply now <ArrowRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <NyrFooter />

      {/* Apply Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 z-50 bg-[#171827]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#171827]">Apply for {applyingTo?.title}</CardTitle>
              <CardDescription>
                Share your details and a PDF or Word (.docx) resume so the team can review your fit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {applied ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-50">
                    <svg className="size-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">Application submitted</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Thanks for applying. We reviewed your details and will follow up if there is a next step.
                  </p>
                  <Button onClick={() => { setShowApplyForm(null); setApplied(false); }} className="mt-5">
                    Apply to another position
                  </Button>
                </div>
              ) : (
                <form onSubmit={submitApplication} className="space-y-5">
                  {applyError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {applyError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Full name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jordan Rivera"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume <span className="text-red-500 text-xs font-normal">*</span></Label>
                    {resumePreview ? (
                      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                        <FileText className="flex-shrink-0 size-5 text-slate-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">{resumePreview.name}</p>
                          <p className="truncate text-xs text-slate-500">{(resumePreview.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setResumeFile(null);
                            setResumePreview(null);
                            setResumeError("");
                            if (resumeInputRef.current) resumeInputRef.current.value = "";
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start gap-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50 text-slate-700"
                        onClick={() => resumeInputRef.current?.click()}
                      >
                        <Upload className="size-4 text-slate-500" />
                        <span className="text-sm">Choose a PDF or Word (.docx) resume — max 5 MB</span>
                        <Input
                          ref={resumeInputRef}
                          id="resume-input"
                          type="file"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleResumeChange}
                          className="sr-only"
                        />
                      </Button>
                    )}
                    {resumeError && (
                      <p className="text-xs text-red-600">{resumeError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                    <textarea
                      id="message"
                      placeholder="Tell us about yourself and why you're interested in this role..."
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 resize-none"
                    />
                  </div>

                  {uploadingResume && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Uploading resume…</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowApplyForm(null); setApplied(false); }}
                      className="h-11 flex-1 rounded-full border-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={applying}
                      className="h-11 flex-1 rounded-full bg-[#171827] font-bold text-[#faf8f1] hover:bg-[#30375f]"
                    >
                      {applying ? "Submitting..." : "Submit application"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
