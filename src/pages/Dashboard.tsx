import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isMasterAdmin = Boolean(
    user && "isMasterAdmin" in user && user.isMasterAdmin === true
  );

  const partnerRequests = isMasterAdmin ? useQuery(api.auth.adminGetPartnerRequests) ?? [] : [];
  const deletePartnerRequestMutation = isMasterAdmin ? useMutation(api.auth.adminDeletePartnerRequest) : (null as any);

  const resumes = isMasterAdmin ? useQuery(api.auth.adminGetResumes) ?? [] : [];
  const deleteResumeMutation = isMasterAdmin ? useMutation(api.auth.adminDeleteResume) : (null as any);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navigation />
      <main className="pt-8 pb-16">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Dashboard</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
                {user && "name" in user
                  ? `Welcome, ${user.name}`
                  : "Welcome"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isMasterAdmin && (
                <Button variant="outline" className="gap-2" onClick={() => navigate("/admin")}>
                  <Shield className="size-4" />
                  Admin
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

          {isMasterAdmin && (
            <div className="space-y-6">
              {/* Partnerships */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="size-4" />
                    Partnership requests
                  </CardTitle>
                  <Badge variant="secondary">{partnerRequests.length}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {partnerRequests.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500">No partnership requests yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30%]">Name</TableHead>
                          <TableHead className="w-[22%]">Email</TableHead>
                          <TableHead className="w-[18%]">Service</TableHead>
                          <TableHead className="w-[18%]">Status</TableHead>
                          <TableHead className="w-[12%]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {partnerRequests.map((request: any) => (
                          <TableRow key={request._id}>
                            <TableCell className="font-medium">{request.name}</TableCell>
                            <TableCell className="text-slate-500">{request.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{request.service}</Badge>
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
                              {request.status !== "contacted" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-emerald-600 hover:text-emerald-700"
                                  onClick={() =>
                                    deletePartnerRequestMutation.mutate({
                                      id: request._id,
                                    })
                                  }
                                >
                                  Mark contacted
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  deletePartnerRequestMutation.mutate({
                                    id: request._id,
                                  })
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

              {/* Resumes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4" />
                    Resumes received
                  </CardTitle>
                  <Badge variant="secondary">{resumes.length}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  {resumes.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500">No resumes received yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[34%]">Applicant</TableHead>
                          <TableHead className="w-[24%]">Email</TableHead>
                          <TableHead className="w-[20%]">Applied for</TableHead>
                          <TableHead className="w-[22%]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resumes.map((resume: any) => (
                          <TableRow key={resume._id}>
                            <TableCell className="font-medium">{resume.applicantName}</TableCell>
                            <TableCell className="text-slate-500">{resume.applicantEmail}</TableCell>
                            <TableCell className="text-slate-500">
                              <Badge variant="outline">{resume.jobTitle ?? "job"}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  deleteResumeMutation.mutate({
                                    id: resume._id,
                                  })
                                }
                              >
                                <Trash2 className="size-3.5" />
                                Delete
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
