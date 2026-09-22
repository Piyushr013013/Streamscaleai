import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Briefcase, Link2, LogOut, Shield, Trash2, UserPlus, Users, UserX, Edit2, Plus, Loader2 } from "lucide-react";

const permissionDefinitions = [
  { key: "manage_jobs", label: "Create and manage job listings" },
  { key: "view_applications", label: "View applications" },
  { key: "view_partner_requests", label: "View partner requests" },
  { key: "manage_notifications", label: "Manage email recipients" },
];

const permissionLabels: Record<string, string> = {
  manage_jobs: "Create and manage job listings",
  view_applications: "View applications",
  view_partner_requests: "View partner requests",
  manage_notifications: "Manage email recipients",
};

function formatSalary(value: string) {
  const cleaned = value.replace(/[^0-9kKmM$.,\\-–— ]/g, "");
  return cleaned.replace(/\d[\d,]*(?:\.\d+)?/g, (part) => {
    const numeric = part.replace(/,/g, "");
    if (!/^\d+(?:\.\d+)?$/.test(numeric)) return part;
    return Number(numeric).toLocaleString("en-US");
  }).replace(/\s*[-–—]\s*/g, " - ");
}

const emptyJob = {
  title: "",
  role: "",
  jobType: "Full-time",
  companyName: "",
  salary: "",
  requirements: "",
  benefits: "",
  extraInfo: "",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, userId, role, signOut } = useAuth();
  const isMasterAdmin = Boolean(user && "isMasterAdmin" in user && user.isMasterAdmin === true);
  const users = useQuery(api.auth.adminGetUsers, userId ? { viewerId: userId as any } : "skip");
  const jobs = useQuery(api.jobs.listJobs);
  const applications = useQuery(api.jobs.listApplications, { viewerId: userId as any });
  const requests = useQuery(api.bookings.listPartnerRequests);
  const createUser = useMutation(api.auth.adminCreateUser);
  const updateUser = useMutation(api.auth.adminUpdateUser);
  const createJob = useMutation(api.jobs.createJob);
  const updateJob = useMutation(api.jobs.updateJob);
  const deleteJob = useMutation(api.jobs.deleteJob);
  const updateRequest = useMutation(api.bookings.updatePartnerRequestStatus);
  const deleteUser = useMutation(api.auth.adminDeleteUser);
  const deleteAllUsers = useMutation(api.auth.adminDeleteAllNonMasterUsers);
  const notificationSettings = useQuery(
    api.notifications.getSettings,
    userId ? { viewerId: userId as any } : "skip"
  );
  const updateNotificationSettings = useMutation(api.notifications.updateSettings);
  const teamMembers = useQuery(api.team.getTeamMembers);
  const addTeamMember = useMutation(api.team.addTeamMember);
  const updateTeamMember = useMutation(api.team.updateTeamMember);
  const deleteTeamMember = useMutation(api.team.deleteTeamMember);

  const defaultTeamMembers = [
    { _id: "default-ceo", name: "Vivikth Mantha", role: "CEO", bio: "Leading Streamscale's vision and strategy.", linkedin: "", avatarColor: "#10b981", order: 0 },
    { _id: "default-jaiveer", name: "Jaiveer", role: "IT Manager & Board Member", bio: "Oversees technology infrastructure and serves on the board.", linkedin: "", avatarColor: "#1E293B", order: 1 },
    { _id: "default-akash", name: "Akash", role: "Chairman of Board", bio: "Chairman of the board, guiding long-term direction.", linkedin: "", avatarColor: "#3b82f6", order: 2 },
    { _id: "default-piyush", name: "Piyush", role: "CTO", bio: "Builds the agents, benchmarks, and infrastructure.", linkedin: "", avatarColor: "#8b5cf6", order: 3 },
    { _id: "default-zain", name: "Zain", role: "Candidate Outreach", bio: "Finds and connects with strong candidates.", linkedin: "", avatarColor: "#ec4899", order: 4 },
    { _id: "default-roni", name: "Roni", role: "General Demo Leader", bio: "Leads demos of Streamscale's platform.", linkedin: "", avatarColor: "#f59e0b", order: 5 },
    { _id: "default-pranit", name: "Pranit", role: "Client Relations Manager", bio: "Manages relationships with partner companies.", linkedin: "", avatarColor: "#10b981", order: 6 },
    { _id: "default-yuva", name: "Yuva", role: "Recruitment and Demos", bio: "Handles recruitment outreach and runs demos.", linkedin: "", avatarColor: "#06b6d4", order: 7 },
  ];

  const [activeTab, setActiveTab] = useState<"accounts" | "jobs" | "applications" | "requests" | "team">("accounts");
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin",
    permissions: [] as string[],
    linkedin: "",
    twitter: "",
    website: "",
  });
  const [profileForm, setProfileForm] = useState({ email: "", password: "", linkedin: "", twitter: "", website: "" });
  const [managedEdit, setManagedEdit] = useState({ id: "", email: "", password: "", name: "" });
  const [notificationForm, setNotificationForm] = useState({ partner: "", applications: "", accounts: "" });
  const [jobForm, setJobForm] = useState(emptyJob);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [teamTab, setTeamTab] = useState<"list" | "add" | "edit">("list");
  const [newMember, setNewMember] = useState({ name: "", role: "", bio: "", linkedin: "", avatarColor: "#1E293B" });
  const [editingMember, setEditingMember] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ memberId: string; name: string } | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!notificationSettings) return;
    setNotificationForm({
      partner: notificationSettings.partnerRequestRecipients.join("\n"),
      applications: notificationSettings.jobApplicationRecipients.join("\n"),
      accounts: notificationSettings.accountRecipients.join("\n"),
    });
  }, [notificationSettings]);

  useEffect(() => {
    if (activeTab === "accounts") {
      setManagedEdit({ id: "", email: "", password: "", name: "" });
      setMessage("");
    }
  }, [activeTab]);

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

  const submitAccount = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await createUser({ ...accountForm, creatorId: userId as any });
      setMessage("Account created. The person can now sign in with the assigned credentials.");
      setAccountForm({ name: "", email: "", password: "", role: "user", permissions: [], linkedin: "", twitter: "", website: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitJob = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      const values = {
        ...jobForm,
        salary: formatSalary(jobForm.salary),
        benefits: jobForm.benefits || undefined,
        extraInfo: jobForm.extraInfo || undefined,
      };
      if (editingJobId) {
        await updateJob({ jobId: editingJobId as any, ...values, editorId: userId as any });
        setMessage("Job posting updated.");
      } else {
        await createJob({ ...values, createdBy: userId as any });
        setMessage("Job published to the public jobs board.");
      }
      setJobForm(emptyJob);
      setEditingJobId(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingJob = (item: any) => {
    setEditingJobId(item._id);
    setJobForm({
      title: item.title,
      role: item.role,
      jobType: item.jobType,
      companyName: item.companyName,
      salary: item.salary,
      requirements: item.requirements,
      benefits: item.benefits ?? "",
      extraInfo: item.extraInfo ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeJob = async (jobId: string) => {
    if (!window.confirm("Delete this job posting? It will disappear from the public jobs board.")) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await deleteJob({ jobId: jobId as any, editorId: userId as any });
      setMessage("Job posting deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permission: string) => {
    setAccountForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  };

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    if (!profileForm.email && !profileForm.password && !profileForm.linkedin && !profileForm.twitter && !profileForm.website) {
      setMessage("Nothing to update. Enter at least one field.");
      setIsSubmitting(false);
      return;
    }
    try {
      const changedCredentials = Boolean(profileForm.email || profileForm.password);
      await updateUser({
        userId: userId as any,
        editorId: userId as any,
        email: profileForm.email || undefined,
        password: profileForm.password || undefined,
        linkedin: profileForm.linkedin || undefined,
        twitter: profileForm.twitter || undefined,
        website: profileForm.website || undefined,
      });
      if (changedCredentials) {
        localStorage.removeItem("streamscale_user_id");
        localStorage.removeItem("streamscale_user_role");
        window.location.replace("/login");
        return;
      }
      setMessage("Your account has been updated successfully.");
      setProfileForm({ email: "", password: "", linkedin: "", twitter: "", website: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitManagedEdit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await updateUser({
        userId: managedEdit.id as any,
        editorId: userId as any,
        email: managedEdit.email || undefined,
        password: managedEdit.password || undefined,
        name: managedEdit.name || undefined,
      });
      setMessage("Account updated. The user must sign in with their new credentials.");
      setManagedEdit({ id: "", email: "", password: "", name: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitNotificationSettings = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await updateNotificationSettings({
        editorId: userId as any,
        partnerRequestRecipients: notificationForm.partner.split(/[\n,]/),
        jobApplicationRecipients: notificationForm.applications.split(/[\n,]/),
        accountRecipients: notificationForm.accounts.split(/[\n,]/),
      });
      setMessage("Notification recipients updated securely.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update notification recipients.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (targetUserId: string, userName: string) => {
    if (!window.confirm(`Delete ${userName}'s account? This permanently removes the account and cannot be undone.`)) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await deleteUser({ userId: targetUserId as any, deletedBy: userId as any });
      setMessage(`${userName}'s account has been deleted.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAllAccounts = async () => {
    if (!window.confirm("Delete ALL non-admin accounts? This will permanently remove every team member account, all job postings, all applications, and all partner requests. This cannot be undone.")) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      const result = await deleteAllUsers({ deletedBy: userId as any });
      setMessage(`Deleted ${result.deletedCount} account(s) and all associated data.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete accounts.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await addTeamMember({ ...newMember, order: teamMembers?.length ?? 0, addedBy: userId as any });
      setMessage(`${newMember.name} added to the team.`);
      setNewMember({ name: "", role: "", bio: "", linkedin: "", avatarColor: "#1E293B" });
      setTeamTab("list");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to add member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDeleteMember = (member: any) => {
    setDeleteConfirm({ memberId: member._id, name: member.name });
  };

  const confirmDeleteMember = async () => {
    if (!deleteConfirm) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await deleteTeamMember({ memberId: deleteConfirm.memberId as any, deletedBy: userId as any });
      setMessage(`${deleteConfirm.name} removed from the team.`);
      setDeleteConfirm(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to remove member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelDeleteMember = () => {
    setDeleteConfirm(null);
  };

  const handleUpdateMember = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await updateTeamMember({
        memberId: editingMember._id,
        name: editingMember.name,
        role: editingMember.role,
        bio: editingMember.bio || undefined,
        linkedin: editingMember.linkedin || undefined,
        avatarColor: editingMember.avatarColor || undefined,
        updatedBy: userId as any,
      });
      setMessage(`${editingMember.name} updated.`);
      setEditingMember(null);
      setTeamTab("list");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingMember = (member: any) => {
    setEditingMember({ ...member });
    setTeamTab("edit");
  };

  const tabs = [
    ["accounts", "Accounts", Users],
    ["jobs", "Jobs", Briefcase],
    ["applications", "Applications", Link2],
    ["requests", "Partner requests", UserPlus],
    ["team", "Team", UserX],
  ] as const;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
              ← Back home
            </Link>
            <h1 className="mt-1 text-xl font-semibold">Streamscale admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user && "email" in user ? user.email : ""}
            </span>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-7 flex flex-wrap gap-2">
          {tabs.map(([value, label, Icon]) => (
            <Button
              key={value}
              variant={activeTab === value ? "default" : "outline"}
              onClick={() => setActiveTab(value as any)}
            >
              <Icon className="mr-2 size-4" />
              {label}
            </Button>
          ))}
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            {message}
          </div>
        )}

        {activeTab === "accounts" && (
          <>
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
                  . Change your email or password below. After saving, your old credentials will no longer work —
                  you must sign in with the new ones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitProfile} className="grid gap-4 md:grid-cols-5">
                  <Input
                    type="email"
                    placeholder="New email address (leave blank to keep current)"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Input
                    type="password"
                    placeholder="New password (min 6 characters, leave blank to keep current)"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={profileForm.linkedin}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Input
                    placeholder="X / Twitter URL"
                    value={profileForm.twitter}
                    onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Button type="submit" className="md:col-span-5" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      "Update my account"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Notification recipients</CardTitle>
                <CardDescription>
                  Choose which verified team addresses receive each type of notification. Enter one email per line or
                  separate addresses with commas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitNotificationSettings} className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Partner requests</Label>
                    <Textarea
                      className="mt-2 min-h-28"
                      value={notificationForm.partner}
                      onChange={(e) => setNotificationForm({ ...notificationForm, partner: e.target.value })}
                      placeholder="partnerships@streamscale.com"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label>Job applications</Label>
                    <Textarea
                      className="mt-2 min-h-28"
                      value={notificationForm.applications}
                      onChange={(e) => setNotificationForm({ ...notificationForm, applications: e.target.value })}
                      placeholder="talent@streamscale.com"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label>Account and security alerts</Label>
                    <Textarea
                      className="mt-2 min-h-28"
                      value={notificationForm.accounts}
                      onChange={(e) => setNotificationForm({ ...notificationForm, accounts: e.target.value })}
                      placeholder="admin@streamscale.com"
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" className="md:col-span-3" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save notification recipients"
                    )}
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
                  <form onSubmit={submitAccount} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={accountForm.name}
                          onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={accountForm.email}
                          onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Temporary password</Label>
                      <Input
                        type="password"
                        value={accountForm.password}
                        onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                        minLength={6}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <select
                        value={accountForm.role}
                        onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value as "user" | "admin" })}
                        className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                        disabled={isSubmitting}
                      >
                        <option value="user">Team member</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div>
                      <Label>Permissions</Label>
                      <div className="mt-2 space-y-2">
                        {permissionDefinitions.map((permission) => (
                          <label key={permission.key} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              id={permission.key}
                              checked={accountForm.permissions.includes(permission.key)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  togglePermission(permission.key);
                                } else {
                                  togglePermission(permission.key);
                                }
                              }}
                              disabled={isSubmitting}
                            />
                            <span htmlFor={permission.key}>{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Input
                        placeholder="LinkedIn URL"
                        value={accountForm.linkedin}
                        onChange={(e) => setAccountForm({ ...accountForm, linkedin: e.target.value })}
                        disabled={isSubmitting}
                      />
                      <Input
                        placeholder="X / Twitter URL"
                        value={accountForm.twitter}
                        onChange={(e) => setAccountForm({ ...accountForm, twitter: e.target.value })}
                        disabled={isSubmitting}
                      />
                      <Input
                        placeholder="Website URL"
                        value={accountForm.website}
                        onChange={(e) => setAccountForm({ ...accountForm, website: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Creating…
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Managed accounts</CardTitle>
                  <CardDescription>Update account credentials when needed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users?.map((item: any) => (
                    <div key={item._id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.email}</p>
                        </div>
                        <Badge
                          variant={item.role === "admin" ? "default" : "outline"}
                          className={item.role === "admin" ? "bg-slate-900 text-white border-slate-900" : ""}
                        >
                          {item.role === "admin" ? "Admin" : "Member"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          className="h-auto px-0"
                          onClick={() => setManagedEdit({ id: item._id, email: item.email, password: "", name: item.name })}
                          disabled={isSubmitting}
                        >
                          Edit
                        </Button>
                        {item._id === userId || item.isMasterAdmin ? (
                          <span className="text-xs text-slate-400">Protected account</span>
                        ) : (
                          <Button
                            variant="link"
                            className="h-auto px-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(item._id, item.name)}
                            disabled={isSubmitting}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                      {managedEdit.id === item._id && (
                        <form onSubmit={submitManagedEdit} className="mt-3 grid gap-2 sm:grid-cols-3">
                          <Input
                            value={managedEdit.name}
                            onChange={(e) => setManagedEdit({ ...managedEdit, name: e.target.value })}
                            placeholder="Name"
                            disabled={isSubmitting}
                          />
                          <Input
                            type="email"
                            value={managedEdit.email}
                            onChange={(e) => setManagedEdit({ ...managedEdit, email: e.target.value })}
                            placeholder="Email"
                            disabled={isSubmitting}
                          />
                          <Input
                            type="password"
                            value={managedEdit.password}
                            onChange={(e) => setManagedEdit({ ...managedEdit, password: e.target.value })}
                            placeholder="New password"
                            disabled={isSubmitting}
                          />
                          <Button type="submit" className="sm:col-span-3" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Saving…
                              </>
                            ) : (
                              "Save account changes"
                            )}
                          </Button>
                        </form>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="size-5" />
                    Danger zone
                  </CardTitle>
                  <CardDescription>
                    Permanently delete all non-admin accounts and associated data.
                  </CardDescription>
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
          </>
        )}

        {activeTab === "jobs" && (
          <Card>
            <CardHeader>
              <CardTitle>{editingJobId ? "Edit job posting" : "Publish a job"}</CardTitle>
              <CardDescription>
                Salary supports ranges. Type numbers such as 100000-150000 and commas are added automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitJob} className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Job title"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Role / department"
                  value={jobForm.role}
                  onChange={(e) => setJobForm({ ...jobForm, role: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Company name"
                  value={jobForm.companyName}
                  onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Job type (Full-time, Contract...)"
                  value={jobForm.jobType}
                  onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Salary or range, e.g. 100000-150000"
                  value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: formatSalary(e.target.value) })}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Benefits"
                  value={jobForm.benefits}
                  onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                  disabled={isSubmitting}
                />
                <Textarea
                  className="md:col-span-2"
                  placeholder="Requirements"
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
                <Textarea
                  className="md:col-span-2"
                  placeholder="Extra information"
                  value={jobForm.extraInfo}
                  onChange={(e) => setJobForm({ ...jobForm, extraInfo: e.target.value })}
                  disabled={isSubmitting}
                />
                <div className="flex gap-3 md:col-span-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        {editingJobId ? "Saving…" : "Publishing…"}
                      </>
                    ) : editingJobId ? (
                      "Save changes"
                    ) : (
                      "Publish job"
                    )}
                  </Button>
                  {editingJobId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingJobId(null);
                        setJobForm(emptyJob);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel edit
                    </Button>
                  )}
                </div>
              </form>
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {jobs?.map((item: any) => (
                  <div key={item._id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex justify-between gap-3">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Badge variant="outline">{item.jobType}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.companyName} · {item.salary}</p>
                    <p className="mt-3 text-sm text-slate-600">{item.requirements}</p>
                    {item.benefits && (
                      <p className="mt-2 text-sm text-emerald-700">Benefits: {item.benefits}</p>
                    )}
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                      <Button size="sm" variant="outline" onClick={() => startEditingJob(item)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => removeJob(item._id)}
                      >
                        <Trash2 className="mr-1 size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "applications" && (
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Applications submitted from the public jobs board.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {applications?.map((item: any) => (
                <div key={item._id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="font-medium">{item.applicantName} · {item.applicantEmail}</p>
                    <Badge>{item.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.applicantPhone || "No phone provided"}</p>
                  {item.message && (
                    <p className="mt-2 text-sm text-slate-700">{item.message}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "requests" && (
          <Card>
            <CardHeader>
              <CardTitle>Partner requests</CardTitle>
              <CardDescription>Requests are visible to the admin team for follow-up.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests?.map((item: any) => (
                <div key={item._id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-medium">{item.name} · {item.email}</p>
                      <p className="text-sm text-slate-500">{item.phone} · {item.service}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateRequest({ requestId: item._id, status: "contacted", editorId: userId as any })
                      }
                    >
                      {item.status === "new" ? "Mark contacted" : "Contacted"}
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{item.requirements}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "team" && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={teamTab === "list" ? "default" : "outline"}
                onClick={() => setTeamTab("list")}
                className="gap-1"
              >
                <Users className="size-4" />
                View team
              </Button>
              <Button
                variant={teamTab === "add" ? "default" : "outline"}
                onClick={() => setTeamTab("add")}
                className="gap-1"
              >
                <Plus className="size-4" />
                Add member
              </Button>
            </div>

            {teamTab === "add" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="size-5" />
                    Add a team member
                  </CardTitle>
                  <CardDescription>Add people to the public team page. Only the master admin can manage the team.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMember} className="grid gap-4 max-w-lg">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={newMember.name}
                          onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                          required
                          placeholder="Vivikth Mantha"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input
                          value={newMember.role}
                          onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                          required
                          placeholder="CEO"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Bio <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Textarea
                        value={newMember.bio}
                        onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                        rows={2}
                        placeholder="Leading Streamscale's vision and strategy..."
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label>LinkedIn URL <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Input
                        value={newMember.linkedin}
                        onChange={(e) => setNewMember({ ...newMember, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label>Avatar color</Label>
                      <div className="flex gap-2 flex-wrap">
                        {["#1E293B", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f43f5e"].map(
                          (c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setNewMember({ ...newMember, avatarColor: c })}
                              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                                newMember.avatarColor === c ? "border-white scale-110" : "border-transparent"
                              }`}
                              style={{ backgroundColor: c }}
                              disabled={isSubmitting}
                            />
                          )
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setTeamTab("list")}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-slate-900 hover:bg-slate-800"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Adding…
                          </>
                        ) : (
                          "Add member"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {teamTab === "list" && (
              <Card>
                <CardHeader>
                  <CardTitle>Team members</CardTitle>
                  <CardDescription>Edit or remove people from the public team page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(teamMembers && teamMembers.length > 0 ? teamMembers : defaultTeamMembers).map(
                    (member: any) => (
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
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditingMember(member)}
                              className="gap-1"
                              disabled={isSubmitting}
                            >
                              <Edit2 className="size-3.5" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => requestDeleteMember(member)}
                              className="gap-1 text-red-600 hover:bg-red-50"
                              disabled={isSubmitting}
                            >
                              <Trash2 className="size-3.5" />
                              Remove
                            </Button>
                          </div>
                        </div>
                        {member.bio && (
                          <p className="mt-2 text-sm text-slate-600">{member.bio}</p>
                        )}
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                          >
                            <Link2 className="size-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}

            {teamTab === "edit" && editingMember && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit2 className="size-5" />
                    Edit {editingMember.name}
                  </CardTitle>
                  <CardDescription>Update this team member's details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateMember} className="grid gap-4 max-w-lg">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editingMember.name}
                          onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input
                          value={editingMember.role}
                          onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Bio <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Textarea
                        value={editingMember.bio || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                        rows={2}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label>LinkedIn URL <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Input
                        value={editingMember.linkedin || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, linkedin: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label>Avatar color</Label>
                      <div className="flex gap-2 flex-wrap">
                        {["#1E293B", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f43f5e"].map(
                          (c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditingMember({ ...editingMember, avatarColor: c })}
                              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                                editingMember.avatarColor === c ? "border-white scale-110" : "border-transparent"
                              }`}
                              style={{ backgroundColor: c }}
                              disabled={isSubmitting}
                            />
                          )
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingMember(null);
                          setTeamTab("list");
                        }}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-slate-900 hover:bg-slate-800"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          "Save changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {deleteConfirm && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-red-700">Remove team member?</p>
                      <p className="mt-1 text-sm text-red-600">
                        This will permanently remove <strong>{deleteConfirm.name}</strong> from the team page.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={cancelDeleteMember} disabled={isSubmitting}>
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={confirmDeleteMember}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Removing…
                          </>
                        ) : (
                          "Remove member"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
