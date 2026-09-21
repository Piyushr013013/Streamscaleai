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
import { Label } from "@/components/ui/label";
import { Briefcase, Link2, LogOut, Shield, Trash2, UserPlus, Users } from "lucide-react";

const permissions = ["manage_jobs", "view_applications", "view_partner_requests", "manage_notifications"];

function formatSalary(value: string) {
  const cleaned = value.replace(/[^0-9kKmM$.,\-–— ]/g, "");
  return cleaned.replace(/\d[\d,]*(?:\.\d+)?/g, (part) => {
    const numeric = part.replace(/,/g, "");
    if (!/^\d+(?:\.\d+)?$/.test(numeric)) return part;
    return Number(numeric).toLocaleString("en-US");
  }).replace(/\s*[-–—]\s*/g, " - ");
}

const emptyJob = {
  title: "", role: "", jobType: "Full-time", companyName: "", salary: "",
  requirements: "", benefits: "", extraInfo: "",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, userId, role, signOut } = useAuth();
  const isAdmin = Boolean(role === "admin" || (user && "role" in user && user.role === "admin"));
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
  const notificationSettings = useQuery(api.notifications.getSettings, userId ? { viewerId: userId as any } : "skip");
  const updateNotificationSettings = useMutation(api.notifications.updateSettings);

  const [tab, setTab] = useState<"accounts" | "jobs" | "applications" | "requests">("accounts");
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState({ name: "", email: "", password: "", role: "user" as "user" | "admin", permissions: [] as string[], linkedin: "", twitter: "", website: "" });
  const [profile, setProfile] = useState({ email: "", password: "", linkedin: "", twitter: "", website: "" });
  const [managedEdit, setManagedEdit] = useState({ id: "", email: "", password: "", name: "" });
  const [notificationForm, setNotificationForm] = useState({ partner: "", applications: "", accounts: "" });
  const [job, setJob] = useState(emptyJob);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!notificationSettings) return;
    setNotificationForm({
      partner: notificationSettings.partnerRequestRecipients.join("\\n"),
      applications: notificationSettings.jobApplicationRecipients.join("\\n"),
      accounts: notificationSettings.accountRecipients.join("\\n"),
    });
  }, [notificationSettings]);

  if (!isAdmin) return <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6"><Card className="max-w-md"><CardContent className="pt-8 text-center"><Shield className="mx-auto size-10 text-slate-400" /><h1 className="mt-4 text-xl font-semibold">Admin access required</h1><p className="mt-2 text-sm text-slate-500">Sign in with an administrator account to continue.</p><Button className="mt-6" onClick={() => navigate("/login")}>Sign in</Button></CardContent></Card></main>;

  const submitAccount = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await createUser({ ...account, creatorId: userId as any });
      setMessage("Account created. The person can now sign in with the assigned credentials.");
      setAccount({ name: "", email: "", password: "", role: "user", permissions: [], linkedin: "", twitter: "", website: "" });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to create account."); }
  };

  const submitJob = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const values = { ...job, salary: formatSalary(job.salary), benefits: job.benefits || undefined, extraInfo: job.extraInfo || undefined };
      if (editingJobId) {
        await updateJob({ jobId: editingJobId as any, ...values, editorId: userId as any });
        setMessage("Job posting updated.");
      } else {
        await createJob({ ...values, createdBy: userId as any });
        setMessage("Job published to the public jobs board.");
      }
      setJob(emptyJob);
      setEditingJobId(null);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save job."); }
  };

  const startEditingJob = (item: any) => {
    setEditingJobId(item._id);
    setJob({ title: item.title, role: item.role, jobType: item.jobType, companyName: item.companyName, salary: item.salary, requirements: item.requirements, benefits: item.benefits ?? "", extraInfo: item.extraInfo ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeJob = async (jobId: string) => {
    if (!window.confirm("Delete this job posting? It will disappear from the public jobs board.")) return;
    try { await deleteJob({ jobId: jobId as any, editorId: userId as any }); setMessage("Job posting deleted."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to delete job."); }
  };

  const togglePermission = (permission: string) => setAccount((current) => ({ ...current, permissions: current.permissions.includes(permission) ? current.permissions.filter((item) => item !== permission) : [...current.permissions, permission] }));
  const submitProfile = async (event: FormEvent) => { event.preventDefault(); try { await updateUser({ userId: userId as any, editorId: userId as any, email: profile.email || undefined, password: profile.password || undefined, linkedin: profile.linkedin || undefined, twitter: profile.twitter || undefined, website: profile.website || undefined }); setMessage("Your admin account was updated."); setProfile({ email: "", password: "", linkedin: "", twitter: "", website: "" }); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update your account."); } };
  const submitManagedEdit = async (event: FormEvent) => { event.preventDefault(); try { await updateUser({ userId: managedEdit.id as any, editorId: userId as any, email: managedEdit.email || undefined, password: managedEdit.password || undefined, name: managedEdit.name || undefined }); setMessage("Account updated."); setManagedEdit({ id: "", email: "", password: "", name: "" }); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update account."); } };
  const submitNotificationSettings = async (event: FormEvent) => { event.preventDefault(); try { await updateNotificationSettings({ editorId: userId as any, partnerRequestRecipients: notificationForm.partner.split(/[\\n,]/), jobApplicationRecipients: notificationForm.applications.split(/[\\n,]/), accountRecipients: notificationForm.accounts.split(/[\\n,]/) }); setMessage("Notification recipients updated securely."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update notification recipients."); } };

  const tabs = [["accounts", "Accounts", Users], ["jobs", "Jobs", Briefcase], ["applications", "Applications", Link2], ["requests", "Partner requests", UserPlus]] as const;

  return <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"><div><Link to="/" className="text-sm text-slate-500 hover:text-slate-900">← Back home</Link><h1 className="mt-1 text-xl font-semibold">Streamscale admin</h1></div><div className="flex items-center gap-3"><span className="hidden text-sm text-slate-500 sm:inline">{user && "email" in user ? user.email : ""}</span><Button variant="outline" onClick={signOut}><LogOut className="mr-2 size-4" />Sign out</Button></div></div></header>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex flex-wrap gap-2">{tabs.map(([value, label, Icon]) => <Button key={value} variant={tab === value ? "default" : "outline"} onClick={() => setTab(value)}><Icon className="mr-2 size-4" />{label}</Button>)}</div>
      {message && <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}

      {tab === "accounts" && <>
        <Card className="mb-6"><CardHeader><CardTitle>My admin profile</CardTitle><CardDescription>Change your email, password, and social links.</CardDescription></CardHeader><CardContent><form onSubmit={submitProfile} className="grid gap-4 md:grid-cols-5"><Input type="email" placeholder="New email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /><Input type="password" placeholder="New password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} /><Input placeholder="LinkedIn URL" value={profile.linkedin} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} /><Input placeholder="X / Twitter URL" value={profile.twitter} onChange={(e) => setProfile({ ...profile, twitter: e.target.value })} /><Button type="submit">Save profile</Button></form></CardContent></Card>
        <Card className="mb-6"><CardHeader><CardTitle>Notification recipients</CardTitle><CardDescription>Choose which verified team addresses receive each type of notification. Enter one email per line or separate addresses with commas.</CardDescription></CardHeader><CardContent><form onSubmit={submitNotificationSettings} className="grid gap-4 md:grid-cols-3"><div><Label>Partner requests</Label><Textarea className="mt-2 min-h-28" value={notificationForm.partner} onChange={(e) => setNotificationForm({ ...notificationForm, partner: e.target.value })} placeholder="partnerships@streamscale.com" /></div><div><Label>Job applications</Label><Textarea className="mt-2 min-h-28" value={notificationForm.applications} onChange={(e) => setNotificationForm({ ...notificationForm, applications: e.target.value })} placeholder="talent@streamscale.com" /></div><div><Label>Account and security alerts</Label><Textarea className="mt-2 min-h-28" value={notificationForm.accounts} onChange={(e) => setNotificationForm({ ...notificationForm, accounts: e.target.value })} placeholder="admin@streamscale.com" /></div><Button type="submit" className="md:col-span-3">Save notification recipients</Button></form></CardContent></Card>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]"><Card><CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="size-5" />Create an account</CardTitle><CardDescription>Only admins can create accounts and assign permissions.</CardDescription></CardHeader><CardContent><form onSubmit={submitAccount} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div><Label>Name</Label><Input value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} required /></div><div><Label>Email</Label><Input type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} required /></div></div><div><Label>Temporary password</Label><Input type="password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} minLength={6} required /></div><div><Label>Role</Label><select value={account.role} onChange={(e) => setAccount({ ...account, role: e.target.value as "user" | "admin" })} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="user">Team member</option><option value="admin">Administrator</option></select></div><div><Label>Permissions</Label><div className="mt-2 space-y-2">{permissions.map((permission) => <label key={permission} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={account.permissions.includes(permission)} onChange={() => togglePermission(permission)} />{permission === "manage_jobs" ? "Create and manage job listings" : permission === "view_applications" ? "View applications" : permission === "view_partner_requests" ? "View partner requests" : "Manage email recipients"}</label>)}</div></div><div className="grid gap-4 sm:grid-cols-3"><Input placeholder="LinkedIn URL" value={account.linkedin} onChange={(e) => setAccount({ ...account, linkedin: e.target.value })} /><Input placeholder="X / Twitter URL" value={account.twitter} onChange={(e) => setAccount({ ...account, twitter: e.target.value })} /><Input placeholder="Website URL" value={account.website} onChange={(e) => setAccount({ ...account, website: e.target.value })} /></div><Button type="submit" className="w-full">Create account</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Managed accounts</CardTitle><CardDescription>Update account credentials when needed.</CardDescription></CardHeader><CardContent className="space-y-3">{users?.map((item: any) => <div key={item._id} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between"><div><p className="font-medium">{item.name}</p><p className="text-sm text-slate-500">{item.email}</p></div><Badge variant="outline">{item.role}</Badge></div><Button variant="link" className="mt-2 h-auto px-0" onClick={() => setManagedEdit({ id: item._id, email: item.email, password: "", name: item.name })}>Edit email, password, or name</Button>{managedEdit.id === item._id && <form onSubmit={submitManagedEdit} className="mt-3 grid gap-2 sm:grid-cols-3"><Input value={managedEdit.name} onChange={(e) => setManagedEdit({ ...managedEdit, name: e.target.value })} placeholder="Name" /><Input type="email" value={managedEdit.email} onChange={(e) => setManagedEdit({ ...managedEdit, email: e.target.value })} placeholder="Email" /><Input type="password" value={managedEdit.password} onChange={(e) => setManagedEdit({ ...managedEdit, password: e.target.value })} placeholder="New password" /><Button type="submit" className="sm:col-span-3">Save account changes</Button></form>}</div>)}</CardContent></Card></div>
      </>}

      {tab === "jobs" && <Card><CardHeader><CardTitle>{editingJobId ? "Edit job posting" : "Publish a job"}</CardTitle><CardDescription>Salary supports ranges. Type numbers such as 100000-150000 and commas are added automatically.</CardDescription></CardHeader><CardContent><form onSubmit={submitJob} className="grid gap-4 md:grid-cols-2"><Input placeholder="Job title" value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} required /><Input placeholder="Role / department" value={job.role} onChange={(e) => setJob({ ...job, role: e.target.value })} required /><Input placeholder="Company name" value={job.companyName} onChange={(e) => setJob({ ...job, companyName: e.target.value })} required /><Input placeholder="Job type (Full-time, Contract...)" value={job.jobType} onChange={(e) => setJob({ ...job, jobType: e.target.value })} required /><Input placeholder="Salary or range, e.g. 100000-150000" value={job.salary} onChange={(e) => setJob({ ...job, salary: formatSalary(e.target.value) })} required /><Input placeholder="Benefits" value={job.benefits} onChange={(e) => setJob({ ...job, benefits: e.target.value })} /><Textarea className="md:col-span-2" placeholder="Requirements" value={job.requirements} onChange={(e) => setJob({ ...job, requirements: e.target.value })} required /><Textarea className="md:col-span-2" placeholder="Extra information" value={job.extraInfo} onChange={(e) => setJob({ ...job, extraInfo: e.target.value })} /><div className="flex gap-3 md:col-span-2"><Button type="submit">{editingJobId ? "Save changes" : "Publish job"}</Button>{editingJobId && <Button type="button" variant="outline" onClick={() => { setEditingJobId(null); setJob(emptyJob); }}>Cancel edit</Button>}</div></form><div className="mt-8 grid gap-3 md:grid-cols-2">{jobs?.map((item: any) => <div key={item._id} className="rounded-lg border border-slate-200 p-4"><div className="flex justify-between gap-3"><h3 className="font-semibold">{item.title}</h3><Badge variant="outline">{item.jobType}</Badge></div><p className="mt-1 text-sm text-slate-500">{item.companyName} · {item.salary}</p><p className="mt-3 text-sm text-slate-600">{item.requirements}</p>{item.benefits && <p className="mt-2 text-sm text-emerald-700">Benefits: {item.benefits}</p>}<div className="mt-4 flex gap-2 border-t border-slate-100 pt-3"><Button size="sm" variant="outline" onClick={() => startEditingJob(item)}>Edit</Button><Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => removeJob(item._id)}><Trash2 className="mr-1 size-4" />Delete</Button></div></div>)}</div></CardContent></Card>}

      {tab === "applications" && <Card><CardHeader><CardTitle>Applications</CardTitle><CardDescription>Applications submitted from the public jobs board.</CardDescription></CardHeader><CardContent className="space-y-3">{applications?.map((item: any) => <div key={item._id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{item.applicantName} · {item.applicantEmail}</p><Badge>{item.status}</Badge></div><p className="mt-2 text-sm text-slate-500">{item.applicantPhone || "No phone provided"}</p>{item.message && <p className="mt-2 text-sm text-slate-700">{item.message}</p>}</div>)}</CardContent></Card>}
      {tab === "requests" && <Card><CardHeader><CardTitle>Partner requests</CardTitle><CardDescription>Requests are visible to the admin team for follow-up.</CardDescription></CardHeader><CardContent className="space-y-3">{requests?.map((item: any) => <div key={item._id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-medium">{item.name} · {item.email}</p><p className="text-sm text-slate-500">{item.phone} · {item.service}</p></div><Button size="sm" variant="outline" onClick={() => updateRequest({ requestId: item._id, status: "contacted", editorId: userId as any })}>{item.status === "new" ? "Mark contacted" : "Contacted"}</Button></div><p className="mt-3 text-sm text-slate-700">{item.requirements}</p></div>)}</CardContent></Card>}
    </div>
  </main>;
}
