import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  FileText, Mail, Trash2, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

export default function Dashboard() {
  const { user, userId, signOut } = useAuth();
  const navigate = useNavigate();

  const isMasterAdmin = Boolean(
    user && "isMasterAdmin" in user && user.isMasterAdmin === true
  );
  const permissions = user && "permissions" in user ? (user as any).permissions ?? [] : [];
  const canViewPartnerRequests = isMasterAdmin || permissions.includes("view_partner_requests");
  const canViewApplications = isMasterAdmin || permissions.includes("view_applications");
  const canManagePartnerRequests = isMasterAdmin || permissions.includes("manage_notifications");

  // Hooks must run unconditionally on every render. When the viewer is not a
  // master admin we pass "skip" so no data is fetched, instead of calling the
  // hook conditionally (which crashes React's hook-order rules).
  const partnerRequests = useQuery(
    api.partnerAdmin.adminGetNotifications,
    (isMasterAdmin || canViewPartnerRequests || canViewApplications) && userId
      ? { viewerId: userId as Id<"users"> }
      : "skip"
  );
  const markContacted = useMutation(api.partnerAdmin.adminMarkPartnerRequestContacted);
  const deletePartnerRequest = useMutation(api.partnerAdmin.adminDeletePartnerRequest);

  const resumes = useQuery(
    api.resumeAdmin.adminGetResumes,
    (isMasterAdmin || canViewApplications) && userId ? { viewerId: userId as Id<"users"> } : "skip"
  );
  const deleteResume = useMutation(api.resumeAdmin.adminDeleteResume);

  const billingAccess = useQuery(
    api.billing.getBillingAccess,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );
  const showBillingLink =
    billingAccess !== undefined &&
    billingAccess !== null &&
    (billingAccess.access === "cfo" ||
      billingAccess.access === "master" ||
      billingAccess.access === "person");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const requestList = partnerRequests?.partnerRequests ?? [];
  const applicationList = partnerRequests?.applications ?? [];

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navigation />
      <main className="pt-8 pb-16">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Dashboard</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
                {user && "name" in user
                  ? `Welcome, ${user.name}`
                  : "Welcome"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {showBillingLink && (
                <Button variant="outline" className="gap-2" onClick={() => navigate("/billing")}>
                  <Wallet className="size-4" />
                  {billingAccess?.access === "person" ? "My earnings" : "Accounting"}
                </Button>
              )}
              {isMasterAdmin && (
                <Button variant="outline" className="gap-2" onClick={() => navigate("/admin")}>
                  <Shield className="size-4" />
                  Admin workspace
                </Button>
              )}
              <Button variant="outline" className="gap-2" onClick={() => navigate("/profile")}>
                <Settings className="size-4" />
                Profile
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleSignOut}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          </div>

          {!isMasterAdmin && !canViewPartnerRequests && !canViewApplications ? (
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Your workspace</CardTitle>
                <CardDescription>
                  You're signed in. Team members manage jobs and applications from here; administrative
                  tools are available to administrators.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                <p>
                  Need access to partnership requests, resumes, or account management? Ask a
                  Streamscale administrator to grant your account admin permissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Partnership requests */}
              <Card className="border-slate-200 bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="size-4" />
                    Partnership requests
                  </CardTitle>
                  <Badge variant="secondary">{requestList.length}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {requestList.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500">No partnership requests yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[26%]">Name</TableHead>
                          <TableHead className="w-[24%]">Email</TableHead>
                          <TableHead className="w-[26%]">Services</TableHead>
                          <TableHead className="w-[14%]">Status</TableHead>
                          <TableHead className="w-[10%]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requestList.map((request) => (
                          <TableRow key={request._id}>
                            <TableCell className="font-medium">{request.name}</TableCell>
                            <TableCell className="text-slate-500">{request.email}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {request.services?.length
                                  ? request.services.map((service: string) => (
                                      <Badge key={service} variant="outline">{service}</Badge>
                                    ))
                                  : request.service
                                    ? <Badge variant="outline">{request.service}</Badge>
                                    : <span className="text-xs text-slate-400">—</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  request.status === "contacted"
                                    ? "border-emerald-600 text-emerald-700"
                                    : "border-slate-300 text-slate-600"
                                }
                              >
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {request.status !== "contacted" && canManagePartnerRequests && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-emerald-600 hover:text-emerald-700"
                                    onClick={() =>
                                      markContacted({ requestId: request._id, editorId: userId as Id<"users"> })
                                    }
                                  >
                                    Mark contacted
                                  </Button>
                                )}
                                {canManagePartnerRequests && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() =>
                                      deletePartnerRequest({ requestId: request._id, editorId: userId as Id<"users"> })
                                    }
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Applications */}
              <Card className="border-slate-200 bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4" />
                    Applications received
                  </CardTitle>
                  <Badge variant="secondary">{applicationList.length}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {applicationList.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500">No applications yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[28%]">Applicant</TableHead>
                          <TableHead className="w-[28%]">Email</TableHead>
                          <TableHead className="w-[18%]">Status</TableHead>
                          <TableHead className="w-[26%]">Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applicationList.map((application) => (
                          <TableRow key={application._id}>
                            <TableCell className="font-medium">{application.applicantName}</TableCell>
                            <TableCell className="text-slate-500">{application.applicantEmail}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{application.status}</Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {application.message ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Resumes */}
              <Card className="border-slate-200 bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4" />
                    Resumes received
                  </CardTitle>
                  <Badge variant="secondary">{resumes?.length ?? 0}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {!resumes || resumes.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500">No resumes received yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[24%]">Applicant</TableHead>
                          <TableHead className="w-[28%]">Email</TableHead>
                          <TableHead className="w-[22%]">File</TableHead>
                          <TableHead className="w-[14%]">Size</TableHead>
                          <TableHead className="w-[12%]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resumes.map((resume) => (
                          <TableRow key={resume._id}>
                            <TableCell className="font-medium">
                              {resume.applicantName ?? "—"}
                            </TableCell>
                            <TableCell className="text-slate-500">
                              {resume.applicantEmail ?? "—"}
                            </TableCell>
                            <TableCell className="text-slate-500">{resume.originalName}</TableCell>
                            <TableCell className="text-slate-500">
                              {(resume.sizeBytes / 1024).toFixed(1)} KB
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  deleteResume({ resumeId: resume._id, editorId: userId as Id<"users"> })
                                }
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
