import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, Trash2, UserPlus, Users, UserX, Edit2, Plus, Briefcase, Link2 } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, userId, signOut } = useAuth();
  const isMasterAdmin = Boolean(user && "isMasterAdmin" in user && user.isMasterAdmin === true);

  const users = useQuery(api.auth.adminGetUsers, userId ? { viewerId: userId as any } : "skip");
  const jobs = useQuery(api.jobs.listJobs);
  const applications = useQuery(api.jobs.listApplications, { viewerId: userId as any });
  const requests = useQuery(api.bookings.listPartnerRequests);
  const createUser = useMutation(api.auth.adminCreateUser);
  const updateUser = useMutation(api.auth.adminUpdateUser);
  const createJob = useMutation(api.jobs.createJob);
  const deleteJob = useMutation(api.jobs.deleteJob);
  const updateRequest = useMutation(api.bookings.updatePartnerRequestStatus);
  const deleteUser = useMutation(api.auth.adminDeleteUser);
  const deleteAllUsers = useMutation(api.auth.adminDeleteAllNonMasterUsers);
  const teamMembers = useQuery(api.team.getTeamMembers);
  const addTeamMember = useMutation(api.team.addTeamMember);
  const updateTeamMember = useMutation(api.team.updateTeamMember);
  const deleteTeamMember = useMutation(api.team.deleteTeamMember);

  const [activeTab, setActiveTab] = useState<"accounts" | "jobs" | "applications" | "requests" | "team">("accounts");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [managedId, setManagedId] = useState("");
  const [managedEmail, setManagedEmail] = useState("");
  const [managedPassword, setManagedPassword] = useState("");
  const [managedName, setManagedName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [editingMember, setEditingMember] = useState<any>(null);

  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobRole, setNewJobRole] = useState("");
  const [newJobType, setNewJobType] = useState("Full-time");
  const [newJobCompany, setNewJobCompany] = useState("");
  const [newJobSalary, setNewJobSalary] = useState("");

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
      setMessage("Account created. Share the temporary password with the user.");
      setNewEmail("");
      setNewName("");
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
    if (!managedId || (!managedEmail.trim() && !managedPassword.trim() && !managedName.trim())) {
      setMessage("Enter at least one field to update.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      await updateUser({
        userId: managedId as any,
        editorId: userId as any,
        email: managedEmail.trim() || undefined,
        password: managedPassword || undefined,
        name: managedName.trim() || undefined,
      });
      setMessage("Account updated. The user must sign in with the new credentials.");
      setManagedId("");
      setManagedEmail("");
      setManagedPassword("");
      setManagedName("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update account.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const submitNewJob = async (event: FormEvent) => {
    event.preventDefault();
    if (!newJobTitle.trim() || !newJobRole.trim() || !newJobCompany.trim() || !newJobSalary.trim()) {
      setMessage("Enter job title, role, company, and salary.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");
    try {
      await createJob({
        title: newJobTitle.trim(),
        role: newJobRole.trim(),
        jobType: newJobType,
        companyName: newJobCompany.trim(),
        salary: newJobSalary.trim(),
        requirements: "No requirements listed.",
        createdBy: userId as any,
      });
      setMessage("Job published.");
      setNewJobTitle("");
      setNewJobRole("");
      setNewJobCompany("");
      setNewJobSalary("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to publish job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeJob = async (jobId: string, jobTitle: string) => {
    if (!window.confirm(`Delete “${jobTitle}”?`)) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await deleteJob({ jobId: jobId as any, editorId: userId as any });
      setMessage("Job deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete job.");
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

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await addTeamMember({
        name: "New Member",
        role: "Team Member",
        bio: "",
        avatarColor: "#1E293B",
        order: (teamMembers?.length ?? 0) + 1,
        addedBy: userId as any,
      });
      setMessage("Member added to the team.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add member.");
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
      setMessage(error instanceof Error ? error.message : "Unable to remove member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await updateTeamMember({
        memberId: editingMember._id as any,
        name: editingMember.name || "Team Member",
        role: editingMember.role || "Team Member",
        updatedBy: userId as any,
      });
      setMessage("Member updated.");
      setEditingMember(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    ["accounts", "Accounts", Users],
    ["jobs", "Jobs", Briefcase],
    ["applications", "Applications", Link2],
    ["requests", "Partner requests", UserPlus],
    ["team", "Team", UserX],
  ] as const;

  const currentUsers = users ?? [];
  const currentJobs = jobs ?? [];
  const currentApplications = applications ?? [];
  const currentRequests = requests ?? [];
  const currentTeam = teamMembers && teamMembers.length > 0 ? teamMembers : defaultTeamMembers;

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
            <span className="hidden text-sm text-slate-500 sm:inline">{user && "email" in user ? user.email : ""}</span>
            <Button variant="outline" onClick={signOut}>
              <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 16v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1" />
                <path d="M10 8H4" />
                <path d="M16 12H8" />
                <path d="M14 16H6" />
              </svg>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-7 flex flex-wrap gap-2">
          {tabs.map(([value, label, Icon]) => (
            <Button key={value} variant={activeTab === value ? "default" : "outline"} onClick={() => setActiveTab(value as any)}>
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
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Update your account
                </CardTitle>
                <CardDescription>
                  Current email:{" "}
                  <span className="font-medium text-slate-900">{user && "email" in user ? user.email : "unknown"}</span>
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
                  <div className="md:col-span-3" />
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
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)} disabled={isSubmitting} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={isSubmitting} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Temporary password</Label>
                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} disabled={isSubmitting} />
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
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={newPermissions.includes("manage_jobs")} onChange={(e) => {
                              e.preventDefault();
                              setNewPermissions((current) => current.includes("manage_jobs") ? current.filter((p) => p !== "manage_jobs") : [...current, "manage_jobs"]);
                            }} disabled={isSubmitting} />
                            Manage jobs
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={newPermissions.includes("view_applications")} onChange={(e) => {
                              e.preventDefault();
                              setNewPermissions((current) => current.includes("view_applications") ? current.filter((p) => p !== "view_applications") : [...current, "view_applications"]);
                            }} disabled={isSubmitting} />
                            View applications
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={newPermissions.includes("view_partner_requests")} onChange={(e) => {
                              e.preventDefault();
                              setNewPermissions((current) => current.includes("view_partner_requests") ? current.filter((p) => p !== "view_partner_requests") : [...current, "view_partner_requests"]);
                            }} disabled={isSubmitting} />
                            View partner requests
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={newPermissions.includes("manage_notifications")} onChange={(e) => {
                              e.preventDefault();
                              setNewPermissions((current) => current.includes("manage_notifications") ? current.filter((p) => p !== "manage_notifications") : [...current, "manage_notifications"]);
                            }} disabled={isSubmitting} />
                            Manage notifications
                          </label>
                        </div>
                      </div>
                      <div />
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
                  <CardDescription>Update account credentials when needed.</CardDescription>
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
                          {item.role === "admin" ? "Admin" : "Member"}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button variant="link" className="h-auto px-0" onClick={() => {
                          setManagedId(item._id);
                          setManagedEmail(item.email);
                          setManagedName(item.name);
                        }} disabled={isSubmitting}>
                          Edit
                        </Button>
                        {item._id === userId || item.isMasterAdmin ? (
                          <span className="text-xs text-slate-400">Protected account</span>
                        ) : (
                          <Button variant="link" className="h-auto px-0 text-red-600 hover:text-red-700" onClick={() => handleDeleteUser(item._id, item.name)} disabled={isSubmitting}>
                            Delete
                          </Button>
                        )}
                      </div>
                      {managedId === item._id && (
                        <form onSubmit={submitManagedEdit} className="mt-2 grid gap-2 sm:grid-cols-3">
                          <Input value={managedName} onChange={(e) => setManagedName(e.target.value)} placeholder="Name" disabled={isSubmitting} />
                          <Input type="email" value={managedEmail} onChange={(e) => setManagedEmail(e.target.value)} placeholder="Email" disabled={isSubmitting} />
                          <Input type="password" value={managedPassword} onChange={(e) => setManagedPassword(e.target.value)} placeholder="New password" disabled={isSubmitting} />
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
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeleteAllAccounts} disabled={isSubmitting}>
                    <Trash2 className="mr-2 size-4" />
                    Delete all accounts and data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <Card>
            <CardHeader>
              <CardTitle>Jobs</CardTitle>
              <CardDescription>Publish and manage job postings.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitNewJob} className="mb-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Job title</Label>
                    <Input value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input value={newJobRole} onChange={(e) => setNewJobRole(e.target.value)} disabled={isSubmitting} />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Company</Label>
                    <Input value={newJobCompany} onChange={(e) => setNewJobCompany(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <div>
                    <Label>Salary</Label>
                    <Input value={newJobSalary} onChange={(e) => setNewJobSalary(e.target.value)} disabled={isSubmitting} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Publishing..." : "Publish job"}
                  </Button>
                </div>
              </form>

              {currentJobs.length === 0 ? (
                <p className="text-sm text-slate-500">No jobs published yet.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {currentJobs.map((item: any) => (
                    <div key={item._id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex justify-between gap-3">
                        <h3 className="font-semibold">{item.title}</h3>
                        <Badge variant="outline">{item.jobType}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.companyName} · {item.salary}</p>
                      <p className="mt-3 text-sm text-slate-600">{item.requirements}</p>
                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                        <Button size="sm" variant="outline" onClick={() => removeJob(item._id, item.title)} className="text-red-600 hover:bg-red-50" disabled={isSubmitting}>
                          <Trash2 className="mr-1 size-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "applications" && (
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Applications submitted from the public jobs board.</CardDescription>
            </CardHeader>
            <CardContent>
              {currentApplications.length === 0 ? (
                <p className="text-sm text-slate-500">No applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {currentApplications.map((item: any) => (
                    <div key={item._id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-wrap justify-between gap-2">
                        <p className="font-medium">{item.applicantName} · {item.applicantEmail}</p>
                        <Badge>{item.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{item.applicantPhone || "No phone provided"}</p>
                      {item.message && <p className="mt-2 text-sm text-slate-700">{item.message}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "requests" && (
          <Card>
            <CardHeader>
              <CardTitle>Partner requests</CardTitle>
              <CardDescription>Requests are visible to the admin team for follow-up.</CardDescription>
            </CardHeader>
            <CardContent>
              {currentRequests.length === 0 ? (
                <p className="text-sm text-slate-500">No partner requests yet.</p>
              ) : (
                <div className="space-y-3">
                  {currentRequests.map((item: any) => (
                    <div key={item._id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-wrap justify-between gap-2">
                        <div>
                          <p className="font-medium">{item.name} · {item.email}</p>
                          <p className="text-sm text-slate-500">{item.phone} · {item.service}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateRequest({ requestId: item._id, status: "contacted", editorId: userId as any })}
                        >
                          {item.status === "new" ? "Mark contacted" : "Contacted"}
                        </Button>
                      </div>
                      <p className="mt-3 text-sm text-slate-700">{item.requirements}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "team" && (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { setEditingMember(null); }} className="gap-1">
                <Users className="size-4" />
                View team
              </Button>
              <Button variant="default" onClick={handleAddMember} className="gap-1" disabled={isSubmitting}>
                <Plus className="size-4" />
                Add member
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team members</CardTitle>
                <CardDescription>Edit or remove people from the public team page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentTeam.map((member: any) => (
                  <div key={member._id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full text-white text-sm font-semibold" style={{ backgroundColor: member.avatarColor || "#1E293B" }}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-slate-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingMember({ ...member }); }} className="gap-1" disabled={isSubmitting}>
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
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                        <Link2 className="size-3" />
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
                    Edit {editingMember.name || "team member"}
                  </CardTitle>
                  <CardDescription>Update this team member's details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateMember} className="grid gap-4 max-w-lg">
                    <div>
                      <Label>Name</Label>
                      <Input value={editingMember.name || ""} onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input value={editingMember.role || "Team Member"} onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })} disabled={isSubmitting} />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800">
                      {isSubmitting ? "Saving..." : "Save changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
