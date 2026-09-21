import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Phone, Mail, MapPin } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Link } from "react-router";

export default function Jobs() {
  const navigate = useNavigate();
  const jobs = useQuery(api.jobs.listJobs);
  const applyMutation = useMutation(api.jobs.applyToJob);

  const [showApplyForm, setShowApplyForm] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<any>(null);

  // Apply form state
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applied, setApplied] = useState(false);

  const handleApply = async (job: any) => {
    setApplyingTo(job);
    setShowApplyForm(job._id);
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError("");

    if (!applicantName || !applicantEmail) {
      setApplyError("Please fill in all required fields");
      return;
    }

    try {
      await applyMutation({
        jobId: applyingTo._id,
        name: applicantName,
        email: applicantEmail,
        phone: applicantPhone || undefined,
        message: applyMessage || undefined,
        resumeUrl: resumeUrl || undefined,
      });

      setApplied(true);
      // In production, send confirmation email here
      console.log("Application submitted:", {
        jobId: applyingTo._id,
        name: applicantName,
        email: applicantEmail,
        phone: applicantPhone,
        message: applyMessage,
      });
    } catch (err: any) {
      setApplyError(err.message);
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
            <div className="flex items-center gap-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Apply for {applyingTo?.title}</CardTitle>
              <CardDescription>
                Fill out this form to apply for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applied ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Application Submitted</h3>
                  <p className="text-gray-500 mb-6">
                    Thank you for your application. We'll review it and get back to you soon.
                  </p>
                  <Button onClick={() => { setShowApplyForm(null); setApplied(false); }} className="bg-gray-900 hover:bg-gray-800">
                    Apply to Another Position
                  </Button>
                </div>
              ) : (
                <form onSubmit={submitApplication} className="space-y-4">
                  {applyError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                      {applyError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="border-gray-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        className="pl-10 border-gray-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">Phone (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="pl-10 border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume" className="text-gray-700">Resume link (Optional)</Label>
                    <Input id="resume" type="url" placeholder="https://drive.google.com/..." value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} className="border-gray-300" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700">Message (Optional)</Label>
                    <textarea
                      id="message"
                      placeholder="Tell us about yourself and why you're interested in this role..."
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowApplyForm(null); setApplied(false); }}
                      className="flex-1 border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gray-900 hover:bg-gray-800"
                    >
                      Submit Application
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
