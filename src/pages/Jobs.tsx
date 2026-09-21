import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Paperclip, Upload, FileText, Phone, Mail } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Link } from "react-router";

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
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = 10 * 1024 * 1024;

  const handleApply = async (job: any) => {
    setApplyingTo(job);
    setShowApplyForm(job._id);
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setApplyError("Please upload a PDF resume.");
      event.target.value = "";
      return;
    }
    if (file.size > maxFileSize) {
      setApplyError("Resume must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setResumeFile(file);
    setResumePreview({ name: file.name, size: file.size });
    setApplyError("");
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError("");

    if (!applicantName || !applicantEmail) {
      setApplyError("Please fill in all required fields.");
      return;
    }

    setApplying(true);
    try {
      let resumePdf: { storageId: string; name: string; contentType: string; size: number } | null = null;
      if (resumeFile) {
        const stored = await applyMutation(api.storage.put as any)(
          { storageId: resumeFile.name, file: resumeFile, contentType: "application/pdf", name: resumeFile.name },
          { strict: false }
        );
        resumePdf = { storageId: stored.storageId as string, name: resumeFile.name, contentType: "application/pdf", size: resumeFile.size };
      }

      await applyMutation({
        jobId: applyingTo._id,
        name: applicantName,
        email: applicantEmail,
        phone: applicantPhone || undefined,
        message: applyMessage || undefined,
        resumePdf,
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-900 hover:text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">              <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="14" fill="#09090B" />
                <path d="M14 46L32 20L50 46H14Z" fill="#FFFFFF" />
                <path d="M32 20L32 52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                <path d="M24 30H40" stroke="#09090B" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="text-base font-medium text-gray-900">Streamscale</span>
            </div>
          </div>
        </div>
      </header>

      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
              Open Positions
            </h1>
            <p className="text-lg text-gray-500">
              Join our team and help us build the future of AI testing
            </p>
          </div>

          {/* Jobs List */}
          {!jobs || jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No open positions</h3>
              <p className="text-gray-500">
                Check back later for new opportunities
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job: any, index: number) => (
                <Card
                  key={job._id}
                  className="border-gray-200 bg-white hover:border-gray-300 transition-all group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getRoleBadgeClass(job.role)}>
                        {job.role}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {new Date(job._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-gray-900 group-hover:text-primary transition-colors">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="text-gray-500 mt-1">
                      {job.companyName} · {job.jobType} · {job.salary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {job.requirements}
                    </p>
                    {job.benefits && <p className="text-xs text-emerald-700 mb-2">Benefits: {job.benefits}</p>}
                    {job.extraInfo && (
                      <p className="text-xs text-gray-400 mb-4">
                        {job.extraInfo}
                      </p>
                    )}
                    <Button
                      onClick={() => handleApply(job)}
                      className="w-full"
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>          {/* Apply Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-slate-200 pb-4">
              <CardTitle className="text-lg">Apply for {applyingTo?.title}</CardTitle>
              <CardDescription>
                Share your details and a PDF resume so the team can review your fit.
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
                    <Label htmlFor="resume">Resume <span className="text-slate-400 text-xs font-normal">(PDF, optional)</span></Label>
                    {resumePreview ? (
                      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                        <FileText className="flex-shrink-0 size-5 text-slate-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">{resumePreview.name}</p>
                          <p className="truncate text-xs text-slate-500">{(resumePreview.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setResumeFile(null); setResumePreview(null); resumeInputRef.current?.value = ""; }}>
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3 transition hover:border-slate-400 hover:bg-slate-50">
                        <Upload className="size-5 text-slate-400" />
                        <span className="text-sm text-slate-600">Attach a PDF resume</span>
                        <Input
                          ref={resumeInputRef}
                          id="resume-input"
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleResumeChange}
                          className="sr-only"
                        />
                      </div>
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

                  <div className="flex gap-3 pt-1">
                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowApplyForm(null); setApplied(false); }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={applying}
                      className="flex-1 bg-slate-900 hover:bg-slate-800"
                    >
                      {applying ? "Submitting application..." : "Submit application"}
                    </Button>
                  </div>
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
