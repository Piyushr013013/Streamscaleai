import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, Shield, Wallet } from "lucide-react";
import { useNavigate } from "react-router";
import { NyrNav, NyrFooter } from "@/components/NyrLayout";
import {
  FileText, Mail, Trash2
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
    <div className="nyr nyr-admin min-h-screen bg-[#f5f8ff] text-[#0a1f44]">
      <NyrNav />
      <main className="pb-16">
        {/* Page hero (dark, matches admin + benchmarks heroes) */}
        <section className="relative overflow-hidden bg-[#0a1f44] text-[#ffffff]">
          <div className="nyr-grid-noise absolute inset-0" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 50% at 80% 0%, rgba(46,107,239,.16), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="nyr-eyebrow mb-4">
              <span className="nyr-status-dot" />
              Dashboard
            </p>
            <h1 className="nyr-display !text-[clamp(2.2rem,5vw,3.6rem)]">
              {user && "name" in user && user.name ? (
                <>Welcome, <em>{user.name}</em></>
              ) : (
                <>Your <em>workspace.</em></>
              )}
            </h1>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {showBillingLink && (
                <Button
                  className="h-9 gap-2 rounded-full border border-[#c9d9f2]/20 bg-transparent px-4 text-sm font-bold text-[#ffffff]/80 shadow-none hover:bg-[#c9d9f2]/10 hover:text-[#ffffff]"
                  onClick={() => navigate("/billing")}
                >
                  <Wallet className="size-4" />
                  {billingAccess?.access === "person" ? "My earnings" : "Accounting"}
                </Button>
              )}
              {isMasterAdmin && (
                <Button
                  className="h-9 gap-2 rounded-full border border-[#c9d9f2]/20 bg-transparent px-4 text-sm font-bold text-[#ffffff]/80 shadow-none hover:bg-[#c9d9f2]/10 hover:text-[#ffffff]"
                  onClick={() => navigate("/admin")}
                >
                  <Shield className="size-4" />
                  Admin workspace
                </Button>
              )}
              <Button
                className="h-9 gap-2 rounded-full border border-[#c9d9f2]/20 bg-transparent px-4 text-sm font-bold text-[#ffffff]/80 shadow-none hover:bg-[#c9d9f2]/10 hover:text-[#ffffff]"
                onClick={() => navigate("/profile")}
              >
                <Settings className="size-4" />
                Profile
              </Button>
              <Button
                className="h-9 gap-2 rounded-full bg-[#2e6bef] px-4 text-sm font-bold text-[#0a1f44] shadow-[0_8px_22px_rgba(46,107,239,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#5589f3]"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          {!isMasterAdmin && !canViewPartnerRequests && !canViewApplications ? (
            <Card>
              <CardHeader>
                <CardTitle>Your workspace</CardTitle>
                <CardDescription>
                  You're signed in. Team members manage jobs and applications from here; administrative
                  tools are available to administrators.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Need access to partnership requests, resumes, or account management? Ask a
                  Streamscale administrator to grant your account admin permissions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {/* Partnership requests */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="size-4" />
                    Partnership requests
                  </CardTitle>
                  <Badge variant="secondary">{requestList.length}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {requestList.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-muted-foreground">No partnership requests yet.</p>
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
                            <TableCell className="text-muted-foreground">{request.email}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {request.services?.length
                                  ? request.services.map((service: string) => (
                                      <Badge key={service} variant="outline">{service}</Badge>
                                    ))
                                  : request.service
                                    ? <Badge variant="outline">{request.service}</Badge>
                                    : <span className="text-xs text-muted-foreground">—</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  request.status === "contacted"
                                    ? "border-[#1d4ed8] text-[#12296b]"
                                    : "border-[rgba(29,78,216,0.3)] text-[#6a7099]"
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
                                    className="font-bold text-[#1d4ed8] hover:text-[#12296b]"
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
                                    className="text-red-700 hover:text-red-900"
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="size-4" />
                    Applications received
                  </CardTitle>
                  <Badge variant="secondary">{applicationList.length}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {applicationList.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-muted-foreground">No applications yet.</p>
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
                            <TableCell className="text-muted-foreground">{application.applicantEmail}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{application.status}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="size-4" />
                    Resumes received
                  </CardTitle>
                  <Badge variant="secondary">{resumes?.length ?? 0}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {!resumes || resumes.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-muted-foreground">No resumes received yet.</p>
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
                            <TableCell className="text-muted-foreground">
                              {resume.applicantEmail ?? "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{resume.originalName}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {(resume.sizeBytes / 1024).toFixed(1)} KB
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-700 hover:text-red-900"
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
      <NyrFooter />
    </div>
  );
}
