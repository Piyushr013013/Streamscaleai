import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Banknote,
  Briefcase,
  Building2,
  CircleCheck,
  Coins,
  Loader2,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type TabId = "contracts" | "people" | "earnings" | "settings";

export default function Billing() {
  const navigate = useNavigate();
  const { user, userId, signOut } = useAuth();
  const access = useQuery(
    api.billing.getBillingAccess,
    userId ? { userId: userId as any } : "skip"
  );

  const isCfo = access?.access === "cfo";
  const isMaster = access?.access === "master";
  const isPerson = access?.access === "person";

  // Personal earnings view for linked people.
  const myEarnings = useQuery(
    api.billing.getMyEarnings,
    userId ? { userId: userId as any } : "skip"
  );

  const people = useQuery(
    api.billing.listPeople,
    isCfo || isMaster ? { viewerId: userId as any } : "skip"
  );
  const clients = useQuery(
    api.billing.listClients,
    isCfo || isMaster ? { viewerId: userId as any } : "skip"
  );
  const contracts = useQuery(
    api.billing.listContracts,
    isCfo || isMaster ? { viewerId: userId as any } : "skip"
  );
  const linkableUsers = useQuery(
    api.billing.listLinkableUsers,
    isCfo ? { viewerId: userId as any } : "skip"
  );

  const createPerson = useMutation(api.billing.createPerson);
  const deletePerson = useMutation(api.billing.deletePerson);
  const createClient = useMutation(api.billing.createClient);
  const deleteClient = useMutation(api.billing.deleteClient);
  const createContract = useMutation(api.billing.createContract);
  const updateStatus = useMutation(api.billing.updateContractStatus);
  const deleteContract = useMutation(api.billing.deleteContract);
  const recordPayment = useMutation(api.billing.recordPayment);
  const createViewer = useMutation(api.billing.createViewerAccount);
  const changeCreds = useMutation(api.billing.changeCfoCredentials);

  const [activeTab, setActiveTab] = useState<TabId>("contracts");
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [busy, setBusy] = useState(false);

  // Settings form (email/password change)
  const [curPassword, setCurPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Client form
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // Person form
  const [personName, setPersonName] = useState("");
  const [personType, setPersonType] = useState<"percent" | "fixed">("percent");
  const [personPercent, setPersonPercent] = useState("");
  const [personFixed, setPersonFixed] = useState("");

  // Contract form
  const [contractCompanyName, setContractCompanyName] = useState("");
  const [contractFeeType, setContractFeeType] = useState<"percent_of_salaries" | "flat">("percent_of_salaries");
  const [contractFeePercent, setContractFeePercent] = useState("");
  const [contractFlatFee, setContractFlatFee] = useState("");
  const [workers, setWorkers] = useState<Array<{ name: string; salary: string }>>([{ name: "", salary: "" }]);
  const [contractNote, setContractNote] = useState("");

  // Payment form
  const [paymentContractId, setPaymentContractId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  // Viewer account form
  const [viewerMode, setViewerMode] = useState<"new" | "link">("new");
  const [viewerName, setViewerName] = useState("");
  const [viewerEmail, setViewerEmail] = useState("");
  const [viewerPassword, setViewerPassword] = useState("");
  const [viewerLinkUserId, setViewerLinkUserId] = useState("");
  const [viewerType, setViewerType] = useState<"percent" | "fixed">("percent");
  const [viewerPercent, setViewerPercent] = useState("");
  const [viewerFixed, setViewerFixed] = useState("");

  // Seed the CFO account once on mount.
  const initCfo = useMutation(api.billing.initCfoAccount);
  useEffect(() => {
    initCfo({}).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const combinedSalaries = useMemo(
    () => workers.reduce((sum, w) => sum + (parseFloat(w.salary) || 0), 0),
    [workers]
  );
  const previewFee =
    contractFeeType === "percent_of_salaries"
      ? Math.round(combinedSalaries * ((parseFloat(contractFeePercent) || 0) / 100))
      : parseFloat(contractFlatFee) || 0;

  if (access === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </main>
    );
  }

  if (isPerson && myEarnings) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-40">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">S</div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Streamscale</p>
                <h1 className="text-base font-semibold leading-tight">Your earnings</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-500">Total paid to you</p>
                <p className="mt-1 text-3xl font-semibold">{money(myEarnings.totalPaid)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-500">Pay type</p>
                <p className="mt-1 text-xl font-semibold">
                  {myEarnings.compType === "percent"
                    ? `${myEarnings.percent}% of each fulfilled contract`
                    : `${money(myEarnings.fixedAmount ?? 0)} per fulfilled contract`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-500">Payments received</p>
                <p className="mt-1 text-3xl font-semibold">{myEarnings.payouts.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment history</CardTitle>
              <CardDescription>Every payout recorded for you by the CFO.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {myEarnings.payouts.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-slate-400">No payments recorded yet. Once a contract is fulfilled and paid, your share shows up here.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myEarnings.payouts.map((p: any) => (
                      <TableRow key={p._id}>
                        <TableCell className="text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{p.clientName}</TableCell>
                        <TableCell className="font-semibold text-emerald-700">{money(p.amount)}</TableCell>
                        <TableCell className="text-slate-500">{p.note ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!isCfo && !isMaster) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6">
        <Card className="max-w-md">
          <CardContent className="pt-8 text-center">
            <Shield className="mx-auto size-10 text-slate-400" />
            <h1 className="mt-4 text-xl font-semibold">Billing access required</h1>
            <p className="mt-2 text-sm text-slate-500">
              This area is only available to the CFO and administrators. If you should have access, ask the CFO to connect your account.
            </p>
            <Button className="mt-6" onClick={() => navigate("/login")}>Sign in</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const flash = (text: string, isError = false) => {
    setMessage(text);
    setMessageError(isError);
  };

  const submitClient = async (e: FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return flash("Enter the company name.", true);
    setBusy(true);
    try {
      await createClient({
        companyName: clientName,
        contactName: clientContact || undefined,
        contactEmail: clientEmail || undefined,
        actorId: userId as any,
      });
      flash(`${clientName.trim()} added.`);
      setClientName(""); setClientContact(""); setClientEmail("");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not add the company.", true);
    } finally { setBusy(false); }
  };

  const submitPerson = async (e: FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return flash("Enter the person's name.", true);
    setBusy(true);
    try {
      await createPerson({
        name: personName,
        compType: personType,
        percent: personType === "percent" ? parseFloat(personPercent) || 0 : undefined,
        fixedAmount: personType === "fixed" ? parseFloat(personFixed) || 0 : undefined,
        actorId: userId as any,
      });
      flash(`${personName.trim()} added to the payout plan.`);
      setPersonName(""); setPersonPercent(""); setPersonFixed("");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not add the person.", true);
    } finally { setBusy(false); }
  };

  const submitContract = async (e: FormEvent) => {
    e.preventDefault();
    if (!contractCompanyName.trim()) return flash("Enter the company name for this contract.", true);
    const cleanWorkers = workers
      .map((w) => ({ name: w.name.trim(), salary: parseFloat(w.salary) || 0 }))
      .filter((w) => w.name);
    if (cleanWorkers.length === 0) return flash("Add at least one worker with a name and first-year salary.", true);
    setBusy(true);
    try {
      // Find or create the company by name so contracts can be entered fast.
      const name = contractCompanyName.trim();
      const existing = (clients ?? []).find((c: any) => c.companyName.toLowerCase() === name.toLowerCase());
      const clientId = existing?._id ?? (await createClient({ companyName: name, actorId: userId as any }));
      await createContract({
        clientId: clientId as any,
        feeType: contractFeeType,
        feePercent: contractFeeType === "percent_of_salaries" ? parseFloat(contractFeePercent) || 0 : undefined,
        flatFee: contractFeeType === "flat" ? parseFloat(contractFlatFee) || 0 : undefined,
        workers: cleanWorkers,
        note: contractNote || undefined,
        actorId: userId as any,
      });
      flash("Contract created. It starts as in progress.");
      setContractCompanyName(""); setContractFeePercent(""); setContractFlatFee("");
      setWorkers([{ name: "", salary: "" }]); setContractNote("");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not create the contract.", true);
    } finally { setBusy(false); }
  };

  const submitPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!paymentContractId) return flash("Pick the fulfilled contract this payment belongs to.", true);
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return flash("Enter the payment amount received.", true);
    setBusy(true);
    try {
      await recordPayment({
        contractId: paymentContractId as any,
        amount,
        note: paymentNote || undefined,
        actorId: userId as any,
      });
      flash(`${money(amount)} recorded and split across payout plans.`);
      setPaymentAmount(""); setPaymentNote(""); setPaymentContractId("");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not record the payment.", true);
    } finally { setBusy(false); }
  };

  const submitSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!curPassword) return flash("Enter your current password to confirm the change.", true);
    if (!newEmail.trim() && !newPassword) return flash("Enter a new email or a new password.", true);
    setBusy(true);
    try {
      await changeCreds({
        currentPassword: curPassword,
        newEmail: newEmail.trim() || undefined,
        newPassword: newPassword || undefined,
        actorId: userId as any,
      });
      flash("Account updated. Use the new credentials next time you sign in.");
      setCurPassword(""); setNewEmail(""); setNewPassword("");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not update the account.", true);
    } finally { setBusy(false); }
  };

  const submitViewer = async (e: FormEvent) => {
    e.preventDefault();
    if (!viewerName.trim()) return flash("Enter the person's name.", true);
    if (viewerMode === "new" && (!viewerEmail.trim() || (viewerPassword || "").length < 6)) {
      return flash("New accounts need an email and a password of at least 6 characters.", true);
    }
    if (viewerMode === "link" && !viewerLinkUserId) {
      return flash("Pick the existing account to connect.", true);
    }
    setBusy(true);
    try {
      await createViewer({
        name: viewerName,
        email: viewerEmail || "unused@streamscale.internal",
        password: viewerPassword || undefined,
        linkExistingUserId: viewerMode === "link" ? (viewerLinkUserId as any) : undefined,
        compType: viewerType,
        percent: viewerType === "percent" ? parseFloat(viewerPercent) || 0 : undefined,
        fixedAmount: viewerType === "fixed" ? parseFloat(viewerFixed) || 0 : undefined,
        actorId: userId as any,
      });
      flash(viewerMode === "new" ? "Account created. Share the credentials with them." : "Account connected. They can now see their earnings.");
      setViewerName(""); setViewerEmail(""); setViewerPassword(""); setViewerLinkUserId("");
      setViewerPercent(""); setViewerFixed("");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Could not create the account.", true);
    } finally { setBusy(false); }
  };

  const fulfilledContracts = (contracts ?? []).filter((c: any) => c.status === "fulfilled");
  const statusBadge = (status: string) => {
    if (status === "fulfilled") return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Fulfilled</Badge>;
    if (status === "cancelled") return <Badge className="bg-red-50 text-red-700 border border-red-200">Cancelled</Badge>;
    return <Badge className="bg-amber-50 text-amber-700 border border-amber-200">In progress</Badge>;
  };

  const tabs: Array<[TabId, string, React.ReactNode, number | null]> = [
    ["contracts", "Contracts", <Briefcase className="size-3.5" />, contracts?.length ?? 0],
    ["people", "People", <Users className="size-3.5" />, people?.length ?? 0],
    ["earnings", "Earnings", <Coins className="size-3.5" />, fulfilledContracts.length],
    ["settings", "Settings", <Shield className="size-3.5" />, null],
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">S</div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Streamscale</p>
              <h1 className="text-base font-semibold leading-tight">
                Accounting {isCfo ? "" : "· read-only"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
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
                activeTab === value ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {icon}
              {label}
              {(count ?? 0) > 0 && (
                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${activeTab === value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {message && (
          <div className={`mb-6 flex items-start gap-2 rounded-xl border p-3.5 text-sm shadow-sm ${messageError ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
            {messageError ? <X className="mt-0.5 size-4 shrink-0" /> : <CircleCheck className="mt-0.5 size-4 shrink-0" />}
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} className="ml-auto" aria-label="Dismiss message">×</button>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total contract fees (fulfilled)", value: money(fulfilledContracts.reduce((s: number, c: any) => s + c.fee, 0)), icon: <Coins className="size-4" /> },
            { label: "Client payments received", value: money((contracts ?? []).reduce((s: number, c: any) => s + (c.amountPaid ?? 0), 0)), icon: <Banknote className="size-4" /> },
            { label: "Paid out to the team", value: money((contracts ?? []).reduce((s: number, c: any) => s + (c.totalPaidOut ?? 0), 0)), icon: <Wallet className="size-4" /> },
            { label: "Active contracts", value: String((contracts ?? []).filter((c: any) => c.status === "in_progress").length), icon: <Briefcase className="size-4" /> },
          ].map((stat) => (
            <Card key={stat.label} className="border-slate-200/80 shadow-sm">
              <CardContent className="flex items-center gap-3 pt-5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">{stat.icon}</div>
                <div>
                  <p className="text-xl font-semibold leading-none">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contracts */}
        {activeTab === "contracts" && (
          <div className="space-y-6">
            {isCfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Plus className="size-4" /> New contract</CardTitle>
                  <CardDescription>
                    Pick the company, add each placed worker and their first-year salary, and set the fee — a custom percent of the combined salaries or a flat fee.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitContract} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Company name</Label>
                        <Input
                          value={contractCompanyName}
                          onChange={(e) => setContractCompanyName(e.target.value)}
                          placeholder="Acme Corp"
                          disabled={busy}
                          className="mt-2"
                        />
                        <p className="mt-1 text-xs text-slate-400">The company is created automatically if it doesn't exist yet.</p>
                      </div>
                      <div>
                        <Label>Fee basis</Label>
                        <select
                          value={contractFeeType}
                          onChange={(e) => setContractFeeType(e.target.value as any)}
                          className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                          disabled={busy}
                        >
                          <option value="percent_of_salaries">% of combined first-year salaries</option>
                          <option value="flat">Flat fee</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {contractFeeType === "percent_of_salaries" ? (
                        <div>
                          <Label>Fee percent of combined salaries</Label>
                          <Input type="number" min="0" max="100" step="0.5" value={contractFeePercent} onChange={(e) => setContractFeePercent(e.target.value)} placeholder="e.g. 20" disabled={busy} className="mt-2" />
                        </div>
                      ) : (
                        <div>
                          <Label>Flat fee ($)</Label>
                          <Input type="number" min="0" value={contractFlatFee} onChange={(e) => setContractFlatFee(e.target.value)} placeholder="e.g. 25000" disabled={busy} className="mt-2" />
                        </div>
                      )}
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                        <p className="text-slate-500">Combined first-year salaries: <span className="font-medium text-slate-900">{money(combinedSalaries)}</span></p>
                        <p className="mt-1 text-slate-500">Contract fee: <span className="font-semibold text-emerald-700">{money(previewFee)}</span></p>
                      </div>
                    </div>

                    <div>
                      <Label className="block mb-2">Placed workers &amp; first-year salaries</Label>
                      <div className="space-y-2">
                        {workers.map((w, i) => (
                          <div key={i} className="flex gap-2">
                            <Input value={w.name} onChange={(e) => setWorkers((cur) => cur.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Worker name" disabled={busy} />
                            <Input type="number" min="0" value={w.salary} onChange={(e) => setWorkers((cur) => cur.map((x, j) => (j === i ? { ...x, salary: e.target.value } : x)))} placeholder="First-year salary ($)" disabled={busy} />
                            <Button type="button" variant="outline" size="icon" onClick={() => setWorkers((cur) => cur.filter((_, j) => j !== i))} disabled={busy || workers.length === 1} aria-label="Remove worker">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => setWorkers((cur) => [...cur, { name: "", salary: "" }])} disabled={busy}>
                        <Plus className="size-3.5" /> Add worker
                      </Button>
                    </div>

                    <div>
                      <Label>Note <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Textarea value={contractNote} onChange={(e) => setContractNote(e.target.value)} rows={2} placeholder="Role, terms, anything worth remembering…" disabled={busy} />
                    </div>

                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={busy}>
                      {busy ? "Creating…" : "Create contract"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">All contracts</CardTitle>
                <CardDescription>
                  Fulfilling a contract locks in the fee and makes it available for payments. Each contract shows every person's share next to their name.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(contracts ?? []).length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No contracts yet.</p>
                ) : (
                  (contracts ?? []).map((c: any) => (
                    <div key={c._id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{c.clientName}</p>
                          <p className="text-sm text-slate-500">
                            {c.feeType === "percent_of_salaries"
                              ? `${c.feePercent}% of ${money(c.totalSalaries)} combined salaries`
                              : "Flat fee"}{" "}
                            · Fee: <span className="font-semibold text-slate-900">{money(c.fee)}</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {statusBadge(c.status)}
                          {isCfo && (
                            <>
                              {c.status !== "fulfilled" && (
                                <Button size="sm" variant="outline" className="gap-1 text-emerald-700 hover:bg-emerald-50" disabled={busy} onClick={async () => {
                                  try { await updateStatus({ contractId: c._id, status: "fulfilled", actorId: userId as any }); flash("Contract marked fulfilled."); }
                                  catch (err) { flash(err instanceof Error ? err.message : "Could not update.", true); }
                                }}>
                                  <CircleCheck className="size-3.5" /> Mark fulfilled
                                </Button>
                              )}
                              {c.status !== "in_progress" && (
                                <Button size="sm" variant="outline" className="gap-1" disabled={busy} onClick={async () => {
                                  try { await updateStatus({ contractId: c._id, status: "in_progress", actorId: userId as any }); flash("Contract marked in progress."); }
                                  catch (err) { flash(err instanceof Error ? err.message : "Could not update.", true); }
                                }}>
                                  In progress
                                </Button>
                              )}
                              {c.status !== "cancelled" && (
                                <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:bg-red-50" disabled={busy} onClick={async () => {
                                  try { await updateStatus({ contractId: c._id, status: "cancelled", actorId: userId as any }); flash("Contract marked cancelled."); }
                                  catch (err) { flash(err instanceof Error ? err.message : "Could not update.", true); }
                                }}>
                                  <X className="size-3.5" /> Cancel
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" disabled={busy} onClick={async () => {
                                if (!window.confirm(`Delete the ${c.clientName} contract? Recorded payouts on it are removed too.`)) return;
                                try { await deleteContract({ contractId: c._id, actorId: userId as any }); flash("Contract deleted."); }
                                catch (err) { flash(err instanceof Error ? err.message : "Could not delete.", true); }
                              }}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
                        <p className="text-slate-500">Client paid: <span className="font-medium text-slate-900">{money(c.amountPaid ?? 0)}</span></p>
                        <p className="text-slate-500">Paid out: <span className="font-medium text-slate-900">{money(c.totalPaidOut ?? 0)}</span></p>
                        <p className="text-slate-500">Workers: <span className="font-medium text-slate-900">{c.workers.length}</span></p>
                      </div>

                      {c.workers.length > 0 && (
                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Workers placed</p>
                          <div className="flex flex-wrap gap-2">
                            {c.workers.map((w: any, i: number) => (
                              <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
                                {w.name} · {money(w.salary)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Payout split</p>
                        {(c.splits ?? []).length === 0 ? (
                          <p className="text-xs text-slate-400">No payout plans yet — add people in the Payout plans tab.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {c.splits.map((s: any) => (
                              <div key={s.personId} className="flex items-center justify-between text-sm">
                                <span className="text-slate-700">
                                  {s.name}
                                  <span className="ml-2 text-xs text-slate-400">
                                    {s.compType === "percent" ? "percent share" : "fixed"}
                                  </span>
                                </span>
                                <span className="font-medium">
                                  {money(s.share)}
                                  <span className="ml-2 text-xs font-normal text-slate-400">paid: {money(s.paid)}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Earnings: record payments + payout summary */}
        {activeTab === "earnings" && (
          <div className="space-y-6">
            {isCfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Banknote className="size-4" /> Record a client payment</CardTitle>
                  <CardDescription>
                    Enter how much the client paid on a fulfilled contract. It's automatically split across everyone's payout plan, and each person's "paid" updates instantly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitPayment} className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <Label>Fulfilled contract</Label>
                      <select
                        value={paymentContractId}
                        onChange={(e) => setPaymentContractId(e.target.value)}
                        className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                        disabled={busy}
                      >
                        <option value="">Select a contract…</option>
                        {fulfilledContracts.map((c: any) => (
                          <option key={c._id} value={c._id}>{c.clientName} — fee {money(c.fee)}</option>
                        ))}
                      </select>
                      {fulfilledContracts.length === 0 && (
                        <p className="mt-1 text-xs text-amber-600">Mark a contract fulfilled first — payments only apply to fulfilled contracts.</p>
                      )}
                    </div>
                    <div>
                      <Label>Amount received ($)</Label>
                      <Input type="number" min="0" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="e.g. 50000" disabled={busy} className="mt-2" />
                    </div>
                    <div>
                      <Label>Note <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Input value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="e.g. Q3 payment" disabled={busy} className="mt-2" />
                    </div>
                    <div className="sm:col-span-3">
                      <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={busy}>
                        {busy ? "Recording…" : "Record payment & split"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payout summary by person</CardTitle>
                <CardDescription>What each person has earned across all fulfilled, paid contracts.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {(people ?? []).length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-slate-400">No payout plans yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Pay type</TableHead>
                        <TableHead>Share per fulfilled contract</TableHead>
                        <TableHead>Total paid to date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(people ?? []).map((p: any) => (
                        <TableRow key={p._id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-slate-500">
                            {p.compType === "percent" ? `${p.percent}% of fee` : `${money(p.fixedAmount ?? 0)} fixed`}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {money(
                              fulfilledContracts.reduce((sum: number, c: any) => {
                                const split = c.splits.find((s: any) => s.personId.toString() === p._id.toString());
                                return sum + (split?.share ?? 0);
                              }, 0)
                            )}
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-700">{money(p.totalPaid ?? 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* People / payout plans */}
        {activeTab === "people" && (
          <div className="space-y-6">
            {isCfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Users className="size-4" /> Add a person to the payout plan</CardTitle>
                  <CardDescription>Choose a percent of every fulfilled contract fee, or a fixed amount per contract.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitPerson} className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="Full name" disabled={busy} className="mt-2" />
                    </div>
                    <div>
                      <Label>Pay type</Label>
                      <select value={personType} onChange={(e) => setPersonType(e.target.value as any)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" disabled={busy}>
                        <option value="percent">Percent of fee</option>
                        <option value="fixed">Fixed per contract</option>
                      </select>
                    </div>
                    {personType === "percent" ? (
                      <div>
                        <Label>Percent (%)</Label>
                        <Input type="number" min="0" max="100" step="0.5" value={personPercent} onChange={(e) => setPersonPercent(e.target.value)} placeholder="e.g. 10" disabled={busy} className="mt-2" />
                      </div>
                    ) : (
                      <div>
                        <Label>Fixed amount ($)</Label>
                        <Input type="number" min="0" value={personFixed} onChange={(e) => setPersonFixed(e.target.value)} placeholder="e.g. 5000" disabled={busy} className="mt-2" />
                      </div>
                    )}
                    <div className="flex items-end">
                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={busy}>Add person</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payout plans</CardTitle>
                <CardDescription>Everyone who shares in contract revenue, and what they've been paid so far.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(people ?? []).length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No payout plans yet.</p>
                ) : (
                  (people ?? []).map((p: any) => (
                    <div key={p._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-slate-500">
                          {p.compType === "percent" ? `${p.percent}% of each fulfilled contract` : `${money(p.fixedAmount ?? 0)} per fulfilled contract`}
                          {p.userId ? " · linked account ✓" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-emerald-700">{money(p.totalPaid ?? 0)} paid</span>
                        {isCfo && (
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" disabled={busy} onClick={async () => {
                            if (!window.confirm(`Remove ${p.name} from the payout plan? Past payout records stay.`)) return;
                            try { await deletePerson({ personId: p._id, actorId: userId as any }); flash(`${p.name} removed.`); }
                            catch (err) { flash(err instanceof Error ? err.message : "Could not remove.", true); }
                          }}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Clients — part of Contracts view */}
        {activeTab === "contracts" && (
          <div className="space-y-6">
            {isCfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Building2 className="size-4" /> Companies booked with us</CardTitle>
                  <CardDescription>Add each company that booked with Streamscale, then create contracts for them above.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitClient} className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <Label>Company name</Label>
                      <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme AI Labs" disabled={busy} className="mt-2" />
                    </div>
                    <div>
                      <Label>Contact <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Input value={clientContact} onChange={(e) => setClientContact(e.target.value)} placeholder="Contact name" disabled={busy} className="mt-2" />
                    </div>
                    <div>
                      <Label>Email <span className="text-slate-400 text-xs font-normal">(optional)</span></Label>
                      <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Contact email" disabled={busy} className="mt-2" />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={busy}>Add company</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">All companies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(clients ?? []).length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No companies added yet.</p>
                ) : (
                  (clients ?? []).map((c: any) => (
                    <div key={c._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
                      <div>
                        <p className="font-medium">{c.companyName}</p>
                        <p className="text-sm text-slate-500">
                          {[c.contactName, c.contactEmail].filter(Boolean).join(" · ") || "No contact info"}
                        </p>
                      </div>
                      {isCfo && (
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" disabled={busy} onClick={async () => {
                          if (!window.confirm(`Remove ${c.companyName}?`)) return;
                          try { await deleteClient({ clientId: c._id, actorId: userId as any }); flash("Company removed."); }
                          catch (err) { flash(err instanceof Error ? err.message : "Could not remove.", true); }
                        }}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {isCfo && (
              <Card className="max-w-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Shield className="size-4" /> Account settings</CardTitle>
                  <CardDescription>
                    Signed in as <span className="font-medium text-slate-900">{user && "email" in user ? user.email : ""}</span>. Change your email or password here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitSettings} className="space-y-4">
                    <div>
                      <Label>Current password (required)</Label>
                      <Input type="password" value={curPassword} onChange={(e) => setCurPassword(e.target.value)} disabled={busy} className="mt-2" />
                    </div>
                    <div>
                      <Label>New email (optional)</Label>
                      <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={(user as any)?.email ?? ""} disabled={busy} className="mt-2" />
                    </div>
                    <div>
                      <Label>New password (optional, min 6 chars)</Label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={busy} className="mt-2" />
                    </div>
                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={busy}>
                      {busy ? "Saving…" : "Save changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {isCfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><UserPlus className="size-4" /> Create a person account</CardTitle>
                  <CardDescription>
                    Create a brand-new login, or connect billing to an account the master admin already made. They'll see their own earnings when they sign in.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitViewer} className="space-y-4">
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant={viewerMode === "new" ? "default" : "outline"} onClick={() => setViewerMode("new")} className={viewerMode === "new" ? "bg-slate-900" : ""}>
                        New account
                      </Button>
                      <Button type="button" size="sm" variant={viewerMode === "link" ? "default" : "outline"} onClick={() => setViewerMode("link")} className={viewerMode === "link" ? "bg-slate-900" : ""}>
                        Connect existing account
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Name</Label>
                        <Input value={viewerName} onChange={(e) => setViewerName(e.target.value)} placeholder="Full name" disabled={busy} className="mt-2" />
                      </div>
                      {viewerMode === "new" ? (
                        <>
                          <div>
                            <Label>Email</Label>
                            <Input type="email" value={viewerEmail} onChange={(e) => setViewerEmail(e.target.value)} placeholder="their@email.com" disabled={busy} className="mt-2" />
                          </div>
                          <div>
                            <Label>Temporary password (min 6 chars)</Label>
                            <Input type="password" value={viewerPassword} onChange={(e) => setViewerPassword(e.target.value)} disabled={busy} className="mt-2" />
                          </div>
                        </>
                      ) : (
                        <div>
                          <Label>Existing account</Label>
                          <select value={viewerLinkUserId} onChange={(e) => setViewerLinkUserId(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" disabled={busy}>
                            <option value="">Select an account…</option>
                            {(linkableUsers ?? []).map((u: any) => (
                              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label>Pay type</Label>
                        <select value={viewerType} onChange={(e) => setViewerType(e.target.value as any)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" disabled={busy}>
                          <option value="percent">Percent of fee</option>
                          <option value="fixed">Fixed per contract</option>
                        </select>
                      </div>
                      {viewerType === "percent" ? (
                        <div>
                          <Label>Percent (%)</Label>
                          <Input type="number" min="0" max="100" step="0.5" value={viewerPercent} onChange={(e) => setViewerPercent(e.target.value)} placeholder="e.g. 10" disabled={busy} className="mt-2" />
                        </div>
                      ) : (
                        <div>
                          <Label>Fixed amount ($)</Label>
                          <Input type="number" min="0" value={viewerFixed} onChange={(e) => setViewerFixed(e.target.value)} placeholder="e.g. 5000" disabled={busy} className="mt-2" />
                        </div>
                      )}
                      <div className="flex items-end">
                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={busy}>
                          {busy ? "Saving…" : viewerMode === "new" ? "Create account" : "Connect account"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Viewer accounts (CFO only) — legacy block kept hidden */}
        {false && isCfo && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><UserPlus className="size-4" /> Give someone access to their earnings</CardTitle>
                <CardDescription>
                  Create a brand-new login, or connect billing to an account the master admin already made. They'll see how much they're making and every payment they've received.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitViewer} className="space-y-4">
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant={viewerMode === "new" ? "default" : "outline"} onClick={() => setViewerMode("new")} className={viewerMode === "new" ? "bg-slate-900" : ""}>
                      New account
                    </Button>
                    <Button type="button" size="sm" variant={viewerMode === "link" ? "default" : "outline"} onClick={() => setViewerMode("link")} className={viewerMode === "link" ? "bg-slate-900" : ""}>
                      Connect existing account
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Name</Label>
                      <Input value={viewerName} onChange={(e) => setViewerName(e.target.value)} placeholder="Full name" disabled={busy} className="mt-2" />
                    </div>
                    {viewerMode === "new" ? (
                      <>
                        <div>
                          <Label>Email</Label>
                          <Input type="email" value={viewerEmail} onChange={(e) => setViewerEmail(e.target.value)} placeholder="their@email.com" disabled={busy} className="mt-2" />
                        </div>
                        <div>
                          <Label>Temporary password (min 6 chars)</Label>
                          <Input type="password" value={viewerPassword} onChange={(e) => setViewerPassword(e.target.value)} disabled={busy} className="mt-2" />
                        </div>
                      </>
                    ) : (
                      <div>
                        <Label>Existing account</Label>
                        <select value={viewerLinkUserId} onChange={(e) => setViewerLinkUserId(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" disabled={busy}>
                          <option value="">Select an account…</option>
                          {(linkableUsers ?? []).map((u: any) => (
                            <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label>Pay type</Label>
                      <select value={viewerType} onChange={(e) => setViewerType(e.target.value as any)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" disabled={busy}>
                        <option value="percent">Percent of fee</option>
                        <option value="fixed">Fixed per contract</option>
                      </select>
                    </div>
                    {viewerType === "percent" ? (
                      <div>
                        <Label>Percent (%)</Label>
                        <Input type="number" min="0" max="100" step="0.5" value={viewerPercent} onChange={(e) => setViewerPercent(e.target.value)} placeholder="e.g. 10" disabled={busy} className="mt-2" />
                      </div>
                    ) : (
                      <div>
                        <Label>Fixed amount ($)</Label>
                        <Input type="number" min="0" value={viewerFixed} onChange={(e) => setViewerFixed(e.target.value)} placeholder="e.g. 5000" disabled={busy} className="mt-2" />
                      </div>
                    )}
                    <div className="flex items-end">
                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={busy}>
                        {busy ? "Saving…" : viewerMode === "new" ? "Create account" : "Connect account"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Accounts</CardTitle>
                <CardDescription>Existing accounts you can connect billing to.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(linkableUsers ?? []).length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No accounts yet.</p>
                ) : (
                  (linkableUsers ?? []).map((u: any) => (
                    <div key={u._id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => { setViewerMode("link"); setViewerLinkUserId(u._id); setViewerName(u.name); }}>
                        Connect
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
