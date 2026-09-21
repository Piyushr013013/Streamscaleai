import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle, Mail, Phone, UserRound } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const services = [
  { value: "ai", label: "Build or deploy AI", description: "Explore an AI solution for your team." },
  { value: "testing_ai", label: "Test an AI system", description: "Evaluate an agent against real work." },
  { value: "recruitment", label: "Recruitment", description: "Find the people needed to scale your AI work." },
] as const;

export default function BookDemo() {
  const createPartnerRequest = useMutation(api.bookings.createPartnerRequest);
  const [service, setService] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requirements, setRequirements] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!service) { setError("Choose a service to continue."); return; }
    try {
      await createPartnerRequest({ name, email, phone, requirements, service: service as "ai" | "testing_ai" | "recruitment" });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your request could not be sent.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-10 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="size-4" /> Back to home</Link>
        <div className="mb-10 max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Streamscale</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Partner with us</h1><p className="mt-3 text-lg text-slate-500">Tell us what you are building, testing, or hiring for. Our team will follow up with the right next step.</p></div>
        {submitted ? <Card className="border-slate-200 bg-white"><CardContent className="flex flex-col items-center py-16 text-center"><CheckCircle className="size-12 text-emerald-600" /><h2 className="mt-5 text-2xl font-semibold">Thanks — your request is with our team.</h2><p className="mt-2 max-w-md text-slate-500">A member of Streamscale will contact you using the details you provided.</p><Button asChild className="mt-7 bg-slate-900 hover:bg-slate-800"><Link to="/">Return home</Link></Button></CardContent></Card> : <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/40"><CardHeader><CardTitle>Start a conversation</CardTitle><CardDescription>All fields are kept with your partner request so the team can respond with context.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-6">{error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}<RadioGroup value={service} onValueChange={setService} className="grid gap-3 md:grid-cols-3">{services.map((item) => <label key={item.value} className={`cursor-pointer rounded-xl border p-4 transition ${service === item.value ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}><RadioGroupItem value={item.value} className="sr-only" /><span className="font-medium">{item.label}</span><span className="mt-1 block text-sm text-slate-500">{item.description}</span></label>)}</RadioGroup><div className="grid gap-5 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="partner-name">Name</Label><div className="relative"><UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input id="partner-name" value={name} onChange={(event) => setName(event.target.value)} className="pl-10" required /></div></div><div className="space-y-2"><Label htmlFor="partner-email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input id="partner-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="pl-10" required /></div></div></div><div className="space-y-2"><Label htmlFor="partner-phone">Phone number</Label><div className="relative"><Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input id="partner-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="pl-10" required /></div></div><div className="space-y-2"><Label htmlFor="requirements">What do you need help with?</Label><Textarea id="requirements" value={requirements} onChange={(event) => setRequirements(event.target.value)} placeholder="Share your goals, timeline, current tools, or hiring needs." rows={6} required /></div><Button type="submit" className="h-11 w-full bg-slate-900 hover:bg-slate-800">Send partner request</Button></form></CardContent></Card>}
      </div>
    </main>
  );
}
