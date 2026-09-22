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
import { Shield, Trash2, UserPlus, Users, UserX, Edit2, Plus } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, userId, signOut } = useAuth();
  const isMasterAdmin = Boolean(user && "isMasterAdmin" in user && user.isMasterAdmin === true);

  const users = useQuery(api.auth.adminGetUsers, userId ? { viewerId: userId as any } : "skip");
  const createUser = useMutation(api.auth.adminCreateUser);
  const updateUser = useMutation(api.auth.adminUpdateUser);
  const deleteUser = useMutation(api.auth.adminDeleteUser);
  const deleteAllUsers = useMutation(api.auth.adminDeleteAllNonMasterUsers);
  const teamMembers = useQuery(api.team.getTeamMembers);
  const addTeamMember = useMutation(api.team.addTeamMember);
  const updateTeamMember = useMutation(api.team.updateTeamMember);
  const deleteTeamMember = useMutation(api.team.deleteTeamMember);

  const [activeTab, setActiveTab] = useState<"accounts" | "team">("accounts");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  const [managedId, setManagedId] = useState("");
  const [managedName, setManagedName] = useState("");
  const [managedEmail, setManagedEmail] = useState("");
  const [managedPassword, setManagedPassword] = useState("");

  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");

  const [memberName, setMemberName] = useState("New Member");
  const [memberRole, setMemberRole] = useState("Team Member");
  const [memberBio, setMemberBio] = useState("");

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

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    try {
      await addTeamMember({
        name: memberName.trim() || "New Member",
        role: memberRole.trim() || "Team Member",
        bio: memberBio.trim() || undefined,
        avatarColor: "#1E293B",
        order: (teamMembers?.length ?? 0) + 1,
        addedBy: userId as any,
      });
      setMessage("Team member added.");
      setMemberName("");
      setMemberRole("");
      setMemberBio("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add team member.");
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
    setMemberRole(member.role || "Team Member");
    setMemberBio(member.bio || "");
    setEditingMember(member);
  };

  const [editingMember, setEditingMember] = useState<any>(null);

  const submitEditMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingMember._id) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      await updateTeamMember({
        memberId: editingMember._id as any,
        name: memberName.trim() || "Team Member",
        role: memberRole.trim() || "Team Member",
        bio: memberBio.trim() || undefined,
        updatedBy: userId as any,
      });
      setMessage("Team member updated.");
      setEditingMember(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update team member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    ["accounts", "Accounts", UserX],
    ["team", "Team", Users],
  ] as const;

  const currentUsers = users ?? [];
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
          <div>
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
                          setManagedName(item.name);
                          setManagedEmail(item.email);
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

        {activeTab === "team" && (
          <div>
            <div className="mb-6 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setEditingMember(null)} className="gap-1" disabled={isSubmitting}>
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
                <CardDescription>Change the team shown on the public team page.</CardDescription>
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
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
                    Edit team member
                  </CardTitle>
                  <CardDescription>Update this team member's details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitEditMember} className="grid gap-4 max-w-lg">
                    <div>
                      <Label>Name</Label>
                      <Input value={memberName || ""} onChange={(e) => setMemberName(e.target.value)} disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input value={memberRole || "Team Member"} onChange={(e) => setMemberRole(e.target.value)} disabled={isSubmitting} />
                    </div>
                    <div>
                      <Label>Bio <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Textarea value={memberBio || ""} onChange={(e) => setMemberBio(e.target.value)} rows={3} disabled={isSubmitting} />
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
      </div>
    </main>
  );
}
