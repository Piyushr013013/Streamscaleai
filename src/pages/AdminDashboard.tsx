import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

/**
 * Auto-formats a salary string like "50-150k", "50k - 150k", "$50,000 to 150000"
 * into "$50,000 - $150,000". Falls back to the raw input when it can't parse it.
 */
export function formatSalary(raw: string): string {
  const cleaned = raw.replace(/[$,\s]/g, "").toLowerCase();
  const range = cleaned.match(/^(\d+(?:\.\d+)?)(k|m)?\s*(?:-|–|—|to|through)\s*(\d+(?:\.\d+)?)(k|m)?$/);
  if (range) {
    const toNumber = (value: string, suffix?: string) => {
      let num = parseFloat(value);
      if (suffix === "k") num *= 1_000;
      if (suffix === "m") num *= 1_000_000;
      return Math.round(num).toLocaleString("en-US");
    };
    return `$${toNumber(range[1], range[2])} - $${toNumber(range[3], range[4])}`;
  }
  const single = cleaned.match(/^(\d+(?:\.\d+)?)(k|m)?$/);
  if (single) {
    let num = parseFloat(single[1]);
    if (single[2] === "k") num *= 1_000;
    if (single[2] === "m") num *= 1_000_000;
    return `$${Math.round(num).toLocaleString("en-US")}`;
  }
  return raw.trim();
}

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Trash2,
  UserPlus,
  Users,
  UserX,
  Edit2,
  Plus,
  Mail,
  FileText,
  Bell,
  Briefcase,
  Inbox,
  CircleCheck,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TabId = "overview" | "accounts" | "team" | "jobs" | "applications" | "partnerships" | "resumes" | "notifications";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, userId, signOut } = useAuth();
  const isMasterAdmin = Boolean(user && "isMasterAdmin" in user && user.isMasterAdmin === true);

  const users = useQuery(api.auth.adminGetUsers, userId ? { viewerId: userId as any } : "skip");
  const createUser = useMutation(api.auth.adminCreateUser);
  const updateUser = useMutation(api.auth.adminUpdateUser);
  const deleteUser = useMutation(api.auth.adminDeleteUser);
  const promoteToMaster = useMutation(api.auth.adminPromoteToMasterAdmin);
  const demoteMaster = useMutation(api.auth.adminDemoteMasterAdmin);
  const deleteAllUsers = useMutation(api.auth.adminDeleteAllNonMasterUsers);

  const teamMembers = useQuery(api.team.getTeamMembers);
  const addTeamMember = useMutation(api.team.addTeamMember);
  const updateTeamMember = useMutation(api.team.updateTeamMember);
  const deleteTeamMember = useMutation(api.team.deleteTeamMember);

  const partnerNotifications = useQuery(
    api.partnerAdmin.adminGetNotifications,
    isMasterAdmin && userId ? { viewerId: userId as any } : "skip",
  );
  const partnerRequestMarkContacted = useMutation(
    api.partnerAdmin.adminMarkPartnerRequestContacted,
  );
  const partnerRequestDelete = useMutation(
    api.partnerAdmin.adminDeletePartnerRequest,
  );
  const partnerRequestCreate = useMutation(
    api.partnerAdmin.adminCreatePartnerRequest,
  );

  const resumes = useQuery(
    api.resumeAdmin.adminGetResumes,
    isMasterAdmin && userId ? { viewerId: userId as any } : "skip",
  );
  const resumeDelete = useMutation(api.resumeAdmin.adminDeleteResume);
  const resumeAddManual = useMutation(api.resumeAdmin.adminAddManualResume);

  // Jobs & applications management
  const adminJobs = useQuery(
    api.jobs.adminListJobs,
    isMasterAdmin && userId ? { viewerId: userId as any } : "skip",
  );
  const adminApplications = useQuery(
    api.jobs.adminListApplications,
    isMasterAdmin && userId ? { viewerId: userId as any } : "skip",
  );
  const createJob = useMutation(api.jobs.createJob);
  const updateJob = useMutation(api.jobs.updateJob);
  const deleteJob = useMutation(api.jobs.deleteJob);
  const deleteApplication = useMutation(api.jobs.deleteApplication);

  // Every hook must run on every render — declared before the early return
  // below so the hook count never changes between renders.
  const [editingMember, setEditingMember] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabId>("accounts");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [newServices, setNewServices] = useState<string[]>([]);
  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  const [managedId, setManagedId] = useState("");
  const [managedName, setManagedName] = useState("");
  const [managedEmail, setManagedEmail] = useState("");
  const [managedPassword, setManagedPassword] = useState("");

  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");

  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberBio, setMemberBio] = useState("");

  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerRequirements, setPartnerRequirements] = useState("");
  const [partnerServiceFilter, setPartnerServiceFilter] = useState<string | null>(null);

  const [resumeApplicantEmail, setResumeApplicantEmail] = useState("");
  const [resumeApplicantName, setResumeApplicantName] = useState("");
  const [resumeJobTitle, setResumeJobTitle] = useState("");

  const [jobTitle, setJobTitle] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [jobRequirements, setJobRequirements] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobBenefits, setJobBenefits] = useState("");
  const [jobExtraInfo, setJobExtraInfo] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  const defaultTeamMembers = [
    { _id: "default-ceo", name: "Vivikth Mantha", role: "CEO", bio: "Leading Streamscale's vision and strategy.", avatarColor: "#10b981" },
    { _id: "default-jaiveer", name: "Jaiveer", role: "IT Manager & Board Member", bio: "Oversees technology infrastructure and serves on the board.", avatarColor: "#1E293B" },
    { _id: "default-akash", name: "Akash", role: "Chairman of Board", bio: "Chairman of the board, guiding long-term direction.", avatarColor: "#3b82f6" },
    { _id: "default-piyush", name: "Piyush", role: "CTO", bio: "Builds the agents, benchmarks, and infrastructure.", avatarColor: "#8b5cf6" },
    { _id: "default-zain", name: "Zain", role: "Candidate Outreach", bio: "Finds and connects with strong candidates.", avatarColor: "#ec4899" },
    { _id: "default-roni", name: "Roni", role: "General Demo Leader", bio: "Leads demos of Streamscale's platform.", avatarColor: "#f59e0b" },
    { _id: "default-pranit", name: "Pranit", role: "Client Relations Manager", bio: "Manages relationships with partner companies.", avatarColor: "#10b981" },
    { _id: "default-yuva", name: "Yuva", role: "Recruitment and Demos", bio: "Handles recruitment outreach and runs demos.", avatarColor: "#06b6d4" },
  ];

  if (!isMasterAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6">
        <Card className="max-w-md">
          <CardContent className="pt-8 text-center">
            <Shield className="mx-auto size-10 text-slate-400" />
            <h1 className="mt-4 text-xl font-semibold">Admin access required</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in with the master administrator account to continue.</p>
            <Button className="mt-6" onClick={() => navigate("/login")}>
              Sign in
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!profileEmail.trim() && !profilePassword.trim()) {
      setMessage("Enter your new email or password.");
      return;
    }
    if (profilePassword.trim().length > 0 && profilePassword.trim().length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      await updateUser({
        userId: userId as any,
        editorId: userId as any,
        email: profileEmail.trim() || undefined,
        password: profilePassword.trim() || undefined,
      });
      localStorage.removeItem("streamscale_user_id");
      localStorage.removeItem("streamscale_user_role");
      window.location.replace("/login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitNewAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setMessage("Enter name, email, and a temporary password.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Temporary password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      await createUser({
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        name: newName.trim(),
        role: newRole,
        permissions: newPermissions,
        creatorId: userId as any,
      });
      setMessage("Account created. Share the credentials with the user.");
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      setNewPermissions([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitManagedEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!managedId || (!managedName.trim() && !managedEmail.trim() && !managedPassword.trim())) {
      setMessage("Enter at least one field to update.");
      return;
    }
    if (managedPassword.trim().length > 0 && managedPassword.trim().length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      await updateUser({
        userId: managedId as any,
        editorId: userId as any,
        name: managedName.trim() || undefined,
        email: managedEmail.trim() || undefined,
        password: managedPassword || undefined,
      });
      setMessage("Account updated. The user must sign in with the new credentials.");
      setManagedId("");
      setManagedName("");
      setManagedEmail("");
      setManagedPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (targetUserId: string, userName: string) => {
    if (!window.confirm(`Delete ${userName}'s account?`)) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await deleteUser({ userId: targetUserId as any, deletedBy: userId as any });
      setMessage(`${userName}'s account deleted.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete account.";
      if (message.toLowerCase().includes("master")) {
        setMessage("You cannot delete a master admin account.");
      } else {
        setMessage(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAllAccounts = async () => {
    if (!window.confirm("Delete all non-master accounts and associated data?")) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      const result = await deleteAllUsers({ deletedBy: userId as any });
      setMessage(`Deleted ${result.deletedCount} account(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete accounts.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPartnerNotification = async (e: FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerEmail.trim() || !partnerRequirements.trim()) {
      setMessage("Enter name, email, and requirements.");
      return;
    }
    if (newServices.length === 0) {
      setMessage("Select at least one service.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {        await partnerRequestCreate({
          name: partnerName.trim(),
          email: partnerEmail.trim().toLowerCase(),
          phone: partnerPhone.trim(),
          services: newServices as Array<"ai" | "testing_ai" | "recruitment">,
          requirements: partnerRequirements.trim(),
          creatorId: userId as any,
        });
      setMessage("Partnership request added.");
      setPartnerName("");
      setPartnerEmail("");
      setPartnerPhone("");
      setPartnerRequirements("");
      setNewServices([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create partnership request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePartnerRequest = async (requestId: string) => {
    if (!window.confirm("Delete this partnership request?")) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await partnerRequestDelete({ requestId: requestId as any, editorId: userId as any });
      setMessage("Partnership request deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete partnership request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkPartnerContacted = async (requestId: string) => {
    setIsSubmitting(true);
    setMessage("");
    try {
      await partnerRequestMarkContacted({ requestId: requestId as any, editorId: userId as any });
      setMessage("Marked as contacted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDeleteMember = async (member: any) => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await deleteTeamMember({ memberId: member._id as any, deletedBy: userId as any });
      setMessage(`${member.name} removed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to remove team member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingMember = (member: any) => {
    setMemberName(member.name || "");
    setMemberEmail(member.email || "");
    setMemberRole(member.role || "");
    setMemberBio(member.bio || "");
    setEditingMember(member);
  };

  const startAddingMember = () => {
    setMemberName("");
    setMemberEmail("");
    setMemberRole("");
    setMemberBio("");
    setEditingMember({ _id: "" });
  };

  const submitEditMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberRole.trim()) {
      setMessage("Enter a name and position for this team member.");
      return;
    }
    const email = memberEmail.trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Enter a valid email address (or leave it blank).");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      if (editingMember._id) {
        await updateTeamMember({
          memberId: editingMember._id as any,
          name: memberName.trim(),
          role: memberRole.trim(),
          email: email || undefined,
          bio: memberBio.trim() || undefined,
          updatedBy: userId as any,
        });
        setMessage("Team member updated.");
      } else {
        await addTeamMember({
          name: memberName.trim(),
          role: memberRole.trim(),
          email: email || undefined,
          bio: memberBio.trim() || undefined,
          avatarColor: "#1E293B",
          order: (teamMembers?.length ?? 0) + 1,
          addedBy: userId as any,
        });
        setMessage("Team member added. They now appear on the public team page.");
      }
      setEditingMember(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save team member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!window.confirm("Delete this resume?")) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await resumeDelete({ resumeId: resumeId as any, editorId: userId as any });
      setMessage("Resume deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete resume.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddManualResume = async (e: FormEvent) => {
    e.preventDefault();
    if (!resumeApplicantEmail.trim() || !resumeApplicantName.trim()) {
      setMessage("Enter applicant email and name.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      await resumeAddManual({
        applicantEmail: resumeApplicantEmail.trim().toLowerCase(),
        applicantName: resumeApplicantName.trim(),
        jobTitle: resumeJobTitle.trim() || undefined,
        editorId: userId as any,
      });
      setMessage("Resume added.");
      setResumeApplicantEmail("");
      setResumeApplicantName("");
      setResumeJobTitle("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add resume.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingJob = (job: any) => {
    setEditingJob(job);
    setJobTitle(job.title ?? "");
    setJobRole(job.role ?? "");
    setJobType(job.jobType ?? "Full-time");
    setJobRequirements(job.requirements ?? "");
    setJobSalary(job.salary ?? "");
    setJobBenefits(job.benefits ?? "");
    setJobExtraInfo(job.extraInfo ?? "");
    setShowJobForm(true);
  };

  const startPostingJob = () => {
    setEditingJob(null);
    setJobTitle("");
    setJobRole("");
    setJobType("Full-time");
    setJobRequirements("");
    setJobSalary("");
    setJobBenefits("");
    setJobExtraInfo("");
    setShowJobForm(true);
  };

  const handleSalaryChange = (value: string) => {
    setJobSalary(value);
  };

  const handleSalaryBlur = () => {
    if (jobSalary.trim()) {
      setJobSalary(formatSalary(jobSalary));
    }
  };

  const handlePostJob = async (e: FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobRole.trim() || !jobRequirements.trim() || !jobSalary.trim()) {
      setMessage("Fill in the job title, role, requirements, and salary.");
      return;
    }
    const formattedSalary = formatSalary(jobSalary);
    setIsSubmitting(true);
    setMessage("");
    try {
      if (editingJob?._id) {
        await updateJob({
          jobId: editingJob._id as any,
          title: jobTitle.trim(),
          role: jobRole.trim(),
          jobType: jobType,
          requirements: jobRequirements.trim(),
          salary: formattedSalary,
          benefits: jobBenefits.trim() || undefined,
          extraInfo: jobExtraInfo.trim() || undefined,
          editorId: userId as any,
        });
        setMessage("Job posting updated. The public jobs page reflects the change immediately.");
      } else {
        await createJob({
          title: jobTitle.trim(),
          role: jobRole.trim(),
          jobType: jobType,
          requirements: jobRequirements.trim(),
          salary: formattedSalary,
          benefits: jobBenefits.trim() || undefined,
          extraInfo: jobExtraInfo.trim() || undefined,
          createdBy: userId as any,
        });
        setMessage("Job posted. It is now visible on the public jobs page.");
      }
      setEditingJob(null);
      setJobTitle("");
      setJobRole("");
      setJobType("Full-time");
      setJobRequirements("");
      setJobSalary("");
      setJobBenefits("");
      setJobExtraInfo("");
      setShowJobForm(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (job: any) => {
    if (!window.confirm(`Delete the "${job.title}" posting? Applications tied to it stay in the Applications tab.`)) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await deleteJob({ jobId: job._id as any, editorId: userId as any });
      setMessage("Job posting deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteApplication = async (application: any) => {
    if (!window.confirm(`Delete ${application.applicantName}'s application? Their attached resume is deleted too.`)) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await deleteApplication({ applicationId: application._id as any, editorId: userId as any });
      setMessage("Application deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentUsers = users ?? [];
  const currentTeam = teamMembers && teamMembers.length > 0 ? teamMembers : defaultTeamMembers;
  const currentPartnerNotifications = partnerNotifications ?? { partnerRequests: [], applications: [] };
  const currentResumes = resumes ?? [];
  const currentJobs = adminJobs ?? [];
  const currentApplications = adminApplications ?? [];

  const tabs: Array<[TabId, string, React.ReactNode, number | null]> = [
    ["overview", "Overview", <Bell className="size-3.5" />, null],
    ["jobs", "Jobs", <Briefcase className="size-3.5" />, currentJobs.length],
    ["applications", "Applications", <Inbox className="size-3.5" />, currentApplications.length],
    ["partnerships", "Partnerships", <Mail className="size-3.5" />, currentPartnerNotifications.partnerRequests.length],
    ["resumes", "Resumes", <FileText className="size-3.5" />, currentResumes.length],
    ["team", "Team", <Users className="size-3.5" />, null],
    ["accounts", "Accounts", <UserX className="size-3.5" />, currentUsers.length],
  ];
  const serviceOptions = [
    { value: "ai", label: "AI Work Diagnostics" },
    { value: "testing_ai", label: "Custom Agent Deployment" },
    { value: "recruitment", label: "Talent & Recruitment" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">S</div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Streamscale</p>
              <h1 className="text-base font-semibold leading-tight">Admin workspace</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden text-sm text-slate-500 transition hover:text-slate-900 sm:inline">
              View site
            </Link>
            <span className="hidden max-w-[220px] truncate rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500 md:inline">
              {user && "email" in user ? user.email : ""}
            </span>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 16v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1"/>
                <path d="M16 12H8"/>
                <path d="M14 16H6"/>
              </svg>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
          {tabs.map(([value, label, icon, count]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                activeTab === value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {icon}
              {label}
              {count !== null && count > 0 && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    activeTab === value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 shadow-sm">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              className="ml-auto text-emerald-600 hover:text-emerald-800"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Open jobs", value: currentJobs.length, icon: <Briefcase className="size-4" /> },
                { label: "Applications", value: currentApplications.length, icon: <Inbox className="size-4" /> },
                { label: "Partner requests", value: currentPartnerNotifications.partnerRequests.length, icon: <Mail className="size-4" /> },
                { label: "Resumes", value: currentResumes.length, icon: <FileText className="size-4" /> },
              ].map((stat) => (
                <Card key={stat.label} className="border-slate-200/80 shadow-sm">
                  <CardContent className="flex items-center gap-3 pt-5">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-semibold leading-none">{stat.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Latest applications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentApplications.length === 0 ? (
                    <p className="py-4 text-sm text-slate-400">Nothing yet — applications show up here as they come in.</p>
                  ) : (
                    currentApplications.slice(0, 4).map((application: any) => (
                      <button
                        key={application._id}
                        type="button"
                        onClick={() => setActiveTab("applications")}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-left transition hover:border-slate-200 hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{application.applicantName}</p>
                          <p className="truncate text-xs text-slate-500">{application.jobTitle ?? "General application"}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0">{application.status}</Badge>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Latest partner requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentPartnerNotifications.partnerRequests.length === 0 ? (
                    <p className="py-4 text-sm text-slate-400">Nothing yet — partnership requests show up here.</p>
                  ) : (
                    currentPartnerNotifications.partnerRequests.slice(0, 4).map((request: any) => (
                      <button
                        key={request._id}
                        type="button"
                        onClick={() => setActiveTab("partnerships")}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-left transition hover:border-slate-200 hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{request.name}</p>
                          <p className="truncate text-xs text-slate-500">
                            {request.services?.length ? request.services.join(", ") : request.service}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">{request.status}</Badge>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Job postings</h2>
                <p className="text-sm text-slate-500">Jobs you post here appear immediately on the public jobs page.</p>
              </div>
              <Button
                onClick={() => (showJobForm ? (setShowJobForm(false), setEditingJob(null)) : startPostingJob())}
                className="gap-1.5 bg-slate-900 hover:bg-slate-800"
              >
                {showJobForm ? "Close form" : (
                  <>
                    <Plus className="size-4" />
                    Post a job
                  </>
                )}
              </Button>
            </div>

            {showJobForm && (
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Briefcase className="size-4 text-slate-500" />
                    {editingJob?._id ? "Edit job posting" : "New job posting"}
                  </CardTitle>
                  <CardDescription>Applicants see everything except the internal notes field. Salary auto-formats — type 50-150k and it becomes $50,000 - $150,000.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePostJob} className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Job title</Label>
                      <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Senior AI Engineer" disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label>Role category</Label>
                      <Input value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="Software Engineer" disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label>Job type</Label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                        disabled={isSubmitting}
                      >
                        {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Salary / compensation</Label>
                      <Input
                        value={jobSalary}
                        onChange={(e) => handleSalaryChange(e.target.value)}
                        onBlur={handleSalaryBlur}
                        placeholder="$50,000 - $150,000 (or 50-150k)"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Requirements</Label>
                      <Textarea value={jobRequirements} onChange={(e) => setJobRequirements(e.target.value)} rows={4} placeholder="What the day-to-day looks like and what you're looking for..." disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label>Benefits <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Input value={jobBenefits} onChange={(e) => setJobBenefits(e.target.value)} placeholder="Health, equity, remote-friendly" disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label>Extra info <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Input value={jobExtraInfo} onChange={(e) => setJobExtraInfo(e.target.value)} placeholder="Internal notes or hiring timeline" disabled={isSubmitting} />
                    </div>
                    <div className="flex gap-2 sm:col-span-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setShowJobForm(false)} disabled={isSubmitting}>
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : editingJob?._id ? "Save changes" : "Post job"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-200/80 shadow-sm">
              <CardContent className="p-0">
                {currentJobs.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-slate-400">No jobs posted yet. Click “Post a job” above to create the first one.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[26%]">Title</TableHead>
                        <TableHead className="w-[16%]">Role</TableHead>
                        <TableHead className="w-[12%]">Type</TableHead>
                        <TableHead className="w-[16%]">Salary</TableHead>
                        <TableHead className="w-[12%]">Applicants</TableHead>
                        <TableHead className="w-[10%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentJobs.map((job: any) => (
                        <TableRow key={job._id}>
                          <TableCell>
                            <p className="font-medium">{job.title}</p>
                            <p className="line-clamp-1 text-xs text-slate-400">{job.requirements}</p>
                          </TableCell>
                          <TableCell><Badge variant="outline">{job.role}</Badge></TableCell>
                          <TableCell className="text-slate-500">{job.jobType}</TableCell>
                          <TableCell className="text-slate-500">{job.salary}</TableCell>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => setActiveTab("applications")}
                              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                            >
                              <Users className="size-3" />
                              {job.applicationCount}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-slate-900"
                                onClick={() => startEditingJob(job)}
                                disabled={isSubmitting}
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteJob(job)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "applications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Job applications</h2>
              <p className="text-sm text-slate-500">Every application submitted through the public jobs page. Deleting one removes its attached resume too.</p>
            </div>

            <Card className="border-slate-200/80 shadow-sm">
              <CardContent className="p-0">
                {currentApplications.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-slate-400">No applications yet. They'll appear here as candidates apply.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[22%]">Applicant</TableHead>
                        <TableHead className="w-[20%]">Email</TableHead>
                        <TableHead className="w-[18%]">Applied for</TableHead>
                        <TableHead className="w-[10%]">Status</TableHead>
                        <TableHead className="w-[20%]">Message</TableHead>
                        <TableHead className="w-[10%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentApplications.map((application: any) => (
                        <TableRow key={application._id}>
                          <TableCell>
                            <p className="font-medium">{application.applicantName}</p>
                            {application.applicantPhone && (
                              <p className="text-xs text-slate-400">{application.applicantPhone}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-500">{application.applicantEmail}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{application.jobTitle ?? "—"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={application.status === "contacted" ? "border-emerald-600 text-emerald-700" : ""}
                            >
                              {application.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="line-clamp-2 max-w-[240px] text-xs text-slate-500">{application.message ?? "—"}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteApplication(application)}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "accounts" && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Update your account
                </CardTitle>
                <CardDescription>
                  Current email:{" "}
                  <span className="font-medium text-slate-900">
                    {user && "email" in user ? user.email : "unknown"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitProfile} className="grid gap-4 md:grid-cols-5">
                  <Input
                    type="email"
                    placeholder="New email (leave blank to keep current)"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <Input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="md:col-span-3"/>
                  <Button type="submit" className="md:col-span-5" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update my account"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="size-5" />
                    Create an account
                  </CardTitle>
                  <CardDescription>Only the master admin can create accounts and assign permissions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitNewAccount} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Name</Label>
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)} disabled={isSubmitting}/>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={isSubmitting}/>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Temporary password</Label>
                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} disabled={isSubmitting}/>
                      </div>
                      <div>
                        <Label>Role</Label>
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
                          className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                          disabled={isSubmitting}
                        >
                          <option value="user">Team member</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="block">Permissions</Label>
                        <div className="mt-1 space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                              type="checkbox"
                              checked={newPermissions.length === 4}
                              onChange={(e) => {
                                setNewPermissions(
                                  e.target.checked
                                    ? ["manage_jobs", "view_applications", "view_partner_requests", "manage_notifications"]
                                    : []
                                );
                              }}
                              disabled={isSubmitting}
                            />
                            All permissions
                          </label>
                          {[
                            ["manage_jobs", "Manage jobs"],
                            ["view_applications", "View applications"],
                            ["view_partner_requests", "View partner requests"],
                            ["manage_notifications", "Manage notifications"],
                          ].map(([key, label]) => (
                            <label key={key} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={newPermissions.includes(key)}
                                onChange={(e) => {
                                  setNewPermissions((current) =>
                                    e.target.checked && !current.includes(key)
                                      ? [...current, key]
                                      : !e.target.checked
                                        ? current.filter((p) => p !== key)
                                        : current
                                  );
                                }}
                                disabled={isSubmitting}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div/>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Managed accounts</CardTitle>
                  <CardDescription>
                    Update account credentials, or grant master admin access. Master admin accounts can only be deleted by the original master admin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentUsers.map((item: any) => (
                    <div key={item._id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.email}</p>
                        </div>
                        <Badge variant={item.role === "admin" ? "default" : "outline"} className={item.role === "admin" ? "bg-slate-900 text-white border-slate-900" : ""}>
                          {item.isMasterAdmin ? "Master admin" : item.role === "admin" ? "Admin" : "Member"}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Button
                          variant="link"
                          className="h-auto px-0"
                          onClick={() => {
                            setManagedId(item._id);
                            setManagedName(item.name);
                            setManagedEmail(item.email);
                          }}
                          disabled={isSubmitting}
                        >
                          Edit
                        </Button>
                        {item.isMasterAdmin ? (
                          item._id === userId ? (
                            <span className="text-xs text-slate-400">This is your account</span>
                          ) : (
                            <>
                              <Button
                                variant="link"
                                className="h-auto px-0"
                                onClick={async () => {
                                  if (!window.confirm(`Remove master admin access from ${item.name}?`)) return;
                                  setIsSubmitting(true);
                                  try {
                                    await demoteMaster({ userId: item._id, demoterId: userId as any });
                                    setMessage(`${item.name} is no longer a master admin.`);
                                  } catch (error) {
                                    setMessage(error instanceof Error ? error.message : "Unable to update account.");
                                  } finally {
                                    setIsSubmitting(false);
                                  }
                                }}
                                disabled={isSubmitting}
                              >
                                Remove master admin
                              </Button>
                              <Button
                                variant="link"
                                className="h-auto px-0 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteUser(item._id, item.name)}
                                disabled={isSubmitting}
                              >
                                Delete
                              </Button>
                            </>
                          )
                        ) : (
                          <>
                            <Button
                              variant="link"
                              className="h-auto px-0"
                              onClick={async () => {
                                if (!window.confirm(`Give ${item.name} full master admin access?`)) return;
                                setIsSubmitting(true);
                                try {
                                  await promoteToMaster({ userId: item._id, promoterId: userId as any });
                                  setMessage(`${item.name} is now a master admin.`);
                                } catch (error) {
                                  setMessage(error instanceof Error ? error.message : "Unable to update account.");
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              disabled={isSubmitting}
                            >
                              Make master admin
                            </Button>
                            <Button
                              variant="link"
                              className="h-auto px-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteUser(item._id, item.name)}
                              disabled={isSubmitting}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                      {managedId === item._id && (
                        <form onSubmit={submitManagedEdit} className="mt-2 grid gap-2 sm:grid-cols-3">
                          <Input value={managedName} onChange={(e) => setManagedName(e.target.value)} placeholder="Name" disabled={isSubmitting}/>
                          <Input type="email" value={managedEmail} onChange={(e) => setManagedEmail(e.target.value)} placeholder="Email" disabled={isSubmitting}/>
                          <Input type="password" value={managedPassword} onChange={(e) => setManagedPassword(e.target.value)} placeholder="New password" disabled={isSubmitting}/>
                          <Button type="submit" className="sm:col-span-3" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save account changes"}
                          </Button>
                        </form>
                      )}
                    </div>
                  ))}
                  {currentUsers.length === 0 && (
                    <p className="text-sm text-slate-500">No accounts created yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="size-5" />
                    Danger zone
                  </CardTitle>
                  <CardDescription>Permanently delete all non-admin accounts and associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleDeleteAllAccounts}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete all accounts and data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <div>
            <div className="mb-6 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setEditingMember(null)} className="gap-1" disabled={isSubmitting}>
                <Users className="size-4" />
                View team
              </Button>
              <Button variant="default" onClick={startAddingMember} className="gap-1" disabled={isSubmitting}>
                <Plus className="size-4" />
                Add member
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team members</CardTitle>
                <CardDescription>Change the team shown on the public team page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentTeam.map((member: any) => (
                  <div key={member._id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-10 items-center justify-center rounded-full text-white text-sm font-semibold"
                          style={{ backgroundColor: member.avatarColor || "#1E293B" }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-slate-500">{member.role}</p>
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="text-xs text-slate-400 hover:text-slate-600"
                            >
                              {member.email}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEditingMember(member)} className="gap-1" disabled={isSubmitting}>
                          <Edit2 className="size-3.5" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => requestDeleteMember(member)} className="gap-1 text-red-600 hover:bg-red-50" disabled={isSubmitting}>
                          <Trash2 className="size-3.5" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    {member.bio && <p className="mt-2 text-sm text-slate-600">{member.bio}</p>}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                      >
                        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {editingMember && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit2 className="size-5" />
                    {editingMember._id ? "Edit team member" : "Add team member"}
                  </CardTitle>
                  <CardDescription>
                    {editingMember._id
                      ? "Update this team member's details."
                      : "This person will appear on the public team page."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitEditMember} className="grid gap-4 max-w-lg">
                    <div>
                      <Label>Name</Label>
                      <Input value={memberName || ""} onChange={(e) => setMemberName(e.target.value)} placeholder="Full name" disabled={isSubmitting}/>
                    </div>
                    <div>
                      <Label>Email address <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Input type="email" value={memberEmail || ""} onChange={(e) => setMemberEmail(e.target.value)} placeholder="name@streamscale.com" disabled={isSubmitting}/>
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input value={memberRole || ""} onChange={(e) => setMemberRole(e.target.value)} placeholder="e.g. Candidate Outreach" disabled={isSubmitting}/>
                    </div>
                    <div>
                      <Label>Extra info <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Textarea value={memberBio || ""} onChange={(e) => setMemberBio(e.target.value)} rows={3} placeholder="A short bio shown under their name on the team page" disabled={isSubmitting}/>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setEditingMember(null)} className="flex-1" disabled={isSubmitting}>
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "partnerships" && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="size-5" />
                  Add partnership request
                </CardTitle>
                <CardDescription>Add partnership requests manually with multiple service selections.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPartnerNotification} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Name</Label>
                      <Input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} disabled={isSubmitting}/>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} disabled={isSubmitting}/>
                    </div>
                  </div>
                  <div>
                    <Label>Phone <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                    <Input value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} disabled={isSubmitting}/>
                  </div>
                  <div>
                    <Label className="block">Services <span className="text-slate-400 text-xs font-normal">(select all that apply)</span></Label>
                    <div className="mt-1 space-y-2">
                      {serviceOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newServices.includes(option.value)}
                            onChange={(e) => {
                              setNewServices((current) =>
                                e.target.checked && !current.includes(option.value)
                                  ? [...current, option.value]
                                  : !e.target.checked
                                    ? current.filter((s) => s !== option.value)
                                    : current
                              );
                            }}
                            disabled={isSubmitting}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Requirements</Label>
                    <Textarea
                      value={partnerRequirements}
                      onChange={(e) => setPartnerRequirements(e.target.value)}
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Add partnership request"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Partnership requests</CardTitle>
                  <CardDescription>
                    Filter by service. Each request shows the services the partner selected, their resume if attached, and extra info.
                  </CardDescription>
                  <div className="flex items-center gap-2 pt-2">
                    <select
                      value={partnerServiceFilter ?? ""}
                      onChange={(e) => setPartnerServiceFilter(e.target.value || null)}
                      className="h-9 w-[160px] rounded-md border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="">All services</option>
                      {serviceOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(currentPartnerNotifications.partnerRequests.length === 0) ? (
                    <p className="px-4 py-6 text-sm text-slate-500">No partnership requests yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[22%]">Name</TableHead>
                          <TableHead className="w-[20%]">Email</TableHead>
                          <TableHead className="w-[18%]">Services</TableHead>
                          <TableHead className="w-[14%]">Status</TableHead>
                          <TableHead className="w-[26%]">Extra info</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPartnerNotifications.partnerRequests
                          .filter((request: any) => !partnerServiceFilter || request.services?.includes(partnerServiceFilter))
                          .map((request: any) => (
                            <TableRow key={request._id}>
                              <TableCell className="font-medium"><span>{request.name}</span>{request.companyName && <span className="block text-xs font-normal text-slate-500">{request.companyName}</span>}</TableCell>
                              <TableCell className="text-slate-500"><span>{request.email}</span>{request.website && <a href={request.website} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">{request.website}</a>}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {request.services?.length ? (
                                    request.services.map((s: string) => {
                                      const option = serviceOptions.find((o) => o.value === s);
                                      return (
                                        <Badge key={s} variant="outline">{option?.label ?? s}</Badge>
                                      );
                                    })
                                  ) : (
                                    <Badge variant="outline">{request.service}</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={request.status === "contacted" ? "border-emerald-600 text-emerald-700" : ""}>
                                  {request.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-slate-500 line-clamp-2 max-w-[200px]">{request.requirements}</span>
{request.aboutCompany && (
  <span className="block text-xs text-slate-400 line-clamp-1 max-w-[200px]">
    About: {request.aboutCompany}
  </span>
)}
                                  {request.status !== "contacted" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-emerald-600 hover:text-emerald-700"
                                      onClick={() => handleMarkPartnerContacted(request._id)}
                                      disabled={isSubmitting}
                                    >
                                      Mark contacted
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleDeletePartnerRequest(request._id)}
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "resumes" && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5" />
                  Add resume manually
                </CardTitle>
                <CardDescription>Attach a resume to an applicant record so it appears in the resumes list.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddManualResume} className="grid gap-4 max-w-lg">
                  <div>
                    <Label>Applicant email</Label>
                    <Input
                      type="email"
                      value={resumeApplicantEmail}
                      onChange={(e) => setResumeApplicantEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label>Applicant name</Label>
                    <Input
                      value={resumeApplicantName}
                      onChange={(e) => setResumeApplicantName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label>Job title <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                    <Input
                      value={resumeJobTitle}
                      onChange={(e) => setResumeJobTitle(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add resume"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumes received</CardTitle>
                <CardDescription>
                  Each resume includes the applicant email, name, job applied for, file type, size, security status, and scan summary.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {(currentResumes.length === 0) ? (
                  <p className="px-4 py-6 text-sm text-slate-500">No resumes received yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[20%]">Applicant</TableHead>
                        <TableHead className="w-[18%]">Email</TableHead>
                        <TableHead className="w-[16%]">Job</TableHead>
                        <TableHead className="w-[16%]">File</TableHead>
                        <TableHead className="w-[12%]">Size</TableHead>
                        <TableHead className="w-[12%]">Status</TableHead>
                        <TableHead className="w-[6%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentResumes.map((resume: any) => (
                        <TableRow key={resume._id}>
                          <TableCell className="font-medium">{resume.applicantName ?? "—"}</TableCell>
                          <TableCell className="text-slate-500">{resume.applicantEmail ?? resume.originalName ?? "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{resume.jobTitle ?? "—"}</Badge>
                          </TableCell>
                          <TableCell className="text-slate-500">{resume.originalName ?? "—"}</TableCell>
                          <TableCell className="text-slate-500">{(resume.sizeBytes / 1024).toFixed(1)} KB</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                resume.sanitizerStatus === "clean"
                                  ? "border-emerald-600 text-emerald-700"
                                  : resume.sanitizerStatus === "blocked"
                                  ? "border-red-600 text-red-700"
                                  : "border-amber-600 text-amber-700"
                              }
                            >
                              {resume.sanitizerStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteResume(resume._id)}
                              disabled={isSubmitting}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>Recent partnership requests and applications with service details, resumes, and extra info.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="size-4" />
                    Partnership requests
                  </CardTitle>
                  <CardContent className="p-0">
                    {(currentPartnerNotifications.partnerRequests.length === 0) ? (
                      <p className="px-4 py-6 text-sm text-slate-500">No partnership requests yet.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[22%]">Name</TableHead>
                            <TableHead className="w-[20%]">Email</TableHead>
                            <TableHead className="w-[18%]">Services</TableHead>
                            <TableHead className="w-[14%]">Status</TableHead>
                            <TableHead className="w-[26%]">Requirements</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentPartnerNotifications.partnerRequests.map((request: any) => (
                            <TableRow key={request._id}>
                              <TableCell className="font-medium"><span>{request.name}</span>{request.companyName && <span className="block text-xs font-normal text-slate-500">{request.companyName}</span>}</TableCell>
                              <TableCell className="text-slate-500"><span>{request.email}</span>{request.website && <a href={request.website} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline">{request.website}</a>}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {request.services?.length ? (
                                    request.services.map((s: string) => {
                                      const option = serviceOptions.find((o) => o.value === s);
                                      return (
                                        <Badge key={s} variant="outline">{option?.label ?? s}</Badge>
                                      );
                                    })
                                  ) : (
                                    <Badge variant="outline">{request.service}</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={request.status === "contacted" ? "border-emerald-600 text-emerald-700" : ""}>
                                  {request.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-600">{request.requirements}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </div>

                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4" />
                    Applications
                  </CardTitle>
                  <CardContent className="p-0">
                    {(currentPartnerNotifications.applications.length === 0) ? (
                      <p className="px-4 py-6 text-sm text-slate-500">No applications yet.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[20%]">Applicant</TableHead>
                            <TableHead className="w-[20%]">Email</TableHead>
                            <TableHead className="w-[16%]">Status</TableHead>
                            <TableHead className="w-[24%]">Message</TableHead>
                            <TableHead className="w-[20%]">Resume</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentPartnerNotifications.applications.map((application: any) => (
                            <TableRow key={application._id}>
                              <TableCell className="font-medium">{application.applicantName}</TableCell>
                              <TableCell className="text-slate-500">{application.applicantEmail}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{application.status}</Badge>
                              </TableCell>
                              <TableCell className="text-slate-600">{application.message ?? "—"}</TableCell>
                              <TableCell className="text-slate-500">
                                {application.resumeStorageId ? (
                                  <Badge variant="outline" className="text-emerald-700 border-emerald-600">Resume attached</Badge>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
