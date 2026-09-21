import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, Briefcase, Edit, Trash2, Plus, Eye, EyeOff, Shield, UserCog } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "jobs" | "applications">("users");

  // Admin check
  const isAdmin = user && !('isAnonymous' in user) && (user as any).role === "admin";
  const adminEmail = (user as any)?.email || "";

  // Users - useMutation since adminGetUsers is a mutation not query
  const usersData = useQuery(api.auth.adminGetUsers);
  const users = usersData;
  const updateUserMutation = useMutation(api.auth.adminUpdateUser);

  // Jobs
  const jobs = useQuery(api.jobs.listJobs);
  const createJobMutation = useMutation(api.jobs.createJob);
  const updateJobMutation = useMutation(api.jobs.updateJob);
  const deleteJobMutation = useMutation(api.jobs.deleteJob);

  // Type-safe job ID helper
  const jobId = (id: string) => id as any;

  // Applications
  const applications = useQuery(api.jobs.listApplications);
  const updateAppStatusMutation = useMutation(api.jobs.updateApplicationStatus);

  // Dialog states
  const [showAddJob, setShowAddJob] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Form states
  const [newJob, setNewJob] = useState({ title: "", role: "", requirements: "", salary: "", extraInfo: "" });
  const [editingJob, setEditingJob] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUserForm, setEditUserForm] = useState({ email: "", password: "", name: "" });

  // New Job handlers
  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    createJobMutation(newJob);
    setShowAddJob(false);
    setNewJob({ title: "", role: "", requirements: "", salary: "", extraInfo: "" });
  };

  const handleEditJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      updateJobMutation({
        jobId: editingJob._id as any,
        title: editingJob.title,
        role: editingJob.role,
        requirements: editingJob.requirements,
        salary: editingJob.salary,
        extraInfo: editingJob.extraInfo || undefined,
      });
      setShowEditJob(false);
      setEditingJob(null);
    }
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJobMutation({ jobId: jobId as any });
    }
  };

  // Edit User handlers
  const openEditUser = (u: any) => {
    setEditingUser(u);
    setEditUserForm({
      email: u.email || "",
      password: "",
      name: u.name || "",
    });
    setShowEditUser(true);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation({
        userId: editingUser._id,
        email: editUserForm.email || undefined,
        password: editUserForm.password || undefined,
        name: editUserForm.name || undefined,
      });
      setShowEditUser(false);
      setEditingUser(null);
    }
  };

  // Applications
  const getJobTitle = (jobId: string) => {
    const job = jobs?.find((j: any) => j._id === jobId);
    return job?.title || "Unknown Job";
  };

  const getApplicationJob = (app: any) => {
    return jobs?.find((j: any) => j._id === app.jobId);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md w-full border-gray-200">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-6">
              You don't have permission to access the admin dashboard.
            </p>
            <Button onClick={() => navigate("/")} className="bg-gray-900 hover:bg-gray-800">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-900 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
              <div className="hidden md:flex items-center gap-2">
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
                <span className="text-base font-medium text-gray-900">Streamscale Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {adminEmail}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  Admin
                </span>
              </span>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="border-gray-300 hover:bg-gray-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex gap-1 mb-8 p-1 bg-gray-100 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "jobs"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Jobs
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "applications"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <UserCog className="w-4 h-4" />
              Applications
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === "users" && (
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">All Users</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!users || users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u: any) => (
                        <TableRow key={u._id}>
                          <TableCell className="font-medium">{u.name || "N/A"}</TableCell>
                          <TableCell className="text-gray-500">{u.email}</TableCell>
                          <TableCell>
                            <Badge className={u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {u.emailVerified ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <Eye className="w-4 h-4" />
                                Yes
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-400">
                                <EyeOff className="w-4 h-4" />
                                No
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditUser(u)}
                              className="mr-2 border-gray-300 hover:bg-gray-50"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Job Listings</h2>
                  <p className="text-gray-500">Manage job postings</p>
                </div>
                <Button
                  onClick={() => setShowAddJob(true)}
                  className="gap-2 bg-gray-900 hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4" />
                  Add Job
                </Button>
              </div>

              {!jobs || jobs.length === 0 ? (
                <Card className="border-gray-200">
                  <CardContent className="pt-8 text-center">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No jobs posted yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job: any) => (
                    <Card key={job._id} className="border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <Badge className="bg-gray-100 text-gray-700">{job.role}</Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(job._creationTime).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="text-lg mt-2">{job.title}</CardTitle>
                        <CardDescription>{job.salary}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.requirements}</p>
                        {job.extraInfo && (
                          <p className="text-xs text-gray-400 mb-4">{job.extraInfo}</p>
                        )}
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingJob(job);
                              setShowEditJob(true);
                            }}
                            className="flex-1 border-gray-300 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteJob(job._id)}
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Job Applications</CardTitle>
                <CardDescription>View and manage job applications</CardDescription>
              </CardHeader>
              <CardContent>
                {!applications || applications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No applications yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app: any) => (
                        <TableRow key={app._id}>
                          <TableCell className="font-medium">{app.applicantName}</TableCell>
                          <TableCell className="text-gray-500">{app.applicantEmail}</TableCell>
                          <TableCell className="text-gray-500">{getJobTitle(app.jobId)}</TableCell>
                          <TableCell className="text-gray-400">{app.applicantPhone || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                app.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : app.status === "reviewed"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }
                            >
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {new Date(app._creationTime).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <select
                              value={app.status}
                              onChange={(e) => {
                                updateAppStatusMutation({
                                  applicationId: app._id,
                                  status: e.target.value as "pending" | "reviewed" | "contacted",
                                });
                              }}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-gray-900"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="contacted">Contacted</option>
                            </select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Add Job Dialog */}
      <Dialog open={showAddJob} onOpenChange={setShowAddJob}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Job</DialogTitle>
            <DialogDescription>Fill in the details for the new job posting</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddJob} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title *</Label>
              <Input
                id="job-title"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                placeholder="Senior Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-role">Role *</Label>
              <Input
                id="job-role"
                value={newJob.role}
                onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                placeholder="Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-requirements">Requirements *</Label>
              <Textarea
                id="job-requirements"
                value={newJob.requirements}
                onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                placeholder="5+ years of experience in..."
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-salary">Salary *</Label>
              <Input
                id="job-salary"
                value={newJob.salary}
                onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                placeholder="$100,000 - $150,000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-extra">Extra Info (Optional)</Label>
              <Textarea
                id="job-extra"
                value={newJob.extraInfo}
                onChange={(e) => setNewJob({ ...newJob, extraInfo: e.target.value })}
                placeholder="Any additional information..."
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddJob(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                Add Job
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={showEditJob} onOpenChange={setShowEditJob}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update the job posting details</DialogDescription>
          </DialogHeader>
          {editingJob && (
            <form onSubmit={handleEditJob} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Job Title *</Label>
                <Input
                  id="edit-title"
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Input
                  id="edit-role"
                  value={editingJob.role}
                  onChange={(e) => setEditingJob({ ...editingJob, role: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-requirements">Requirements *</Label>
                <Textarea
                  id="edit-requirements"
                  value={editingJob.requirements}
                  onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary">Salary *</Label>
                <Input
                  id="edit-salary"
                  value={editingJob.salary}
                  onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-extra">Extra Info (Optional)</Label>
                <Textarea
                  id="edit-extra"
                  value={editingJob.extraInfo || ""}
                  onChange={(e) => setEditingJob({ ...editingJob, extraInfo: e.target.value })}
                  rows={2}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditJob(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details. Leave fields empty to keep current values.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-user-name">Name</Label>
              <Input
                id="edit-user-name"
                value={editUserForm.name}
                onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                placeholder={editingUser?.name || "Current name"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-email">Email</Label>
              <Input
                id="edit-user-email"
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                placeholder={editingUser?.email || "Current email"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-password">New Password (leave empty to keep current)</Label>
              <Input
                id="edit-user-password"
                type="password"
                value={editUserForm.password}
                onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                placeholder="New password"
              />
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
              Changing the password will reset email verification status.
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditUser(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
