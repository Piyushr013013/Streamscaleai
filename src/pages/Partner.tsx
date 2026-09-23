import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Send, CheckCircle, Sparkles, Check } from "lucide-react";

const services = [
  {
    value: "ai",
    label: "AI Work Diagnostics",
    description: "Find out what your AI agent can and can't do before you bet on it.",
  },
  {
    value: "testing_ai",
    label: "Custom Agent Deployment",
    description: "Build and deploy an agent into your workflow, then keep testing it.",
  },
  {
    value: "recruitment",
    label: "Talent & Recruitment",
    description: "Find the people who make AI work in your company.",
  },
];

export default function Partner() {
  const navigate = useNavigate();
  const partnerMutation = useMutation(api.bookings.createPartnerRequest);
  const [steps] = useState([
    { icon: Sparkles, title: "Tell us what you need", desc: "Pick a service and share your requirements." },
    { icon: Sparkles, title: "We review and scope", desc: "Our team follows up within 1-2 business days." },
    { icon: Sparkles, title: "We deliver", desc: "You get a benchmark, deployed agent, or placed candidate." },
  ]);
  const [selectedServices, setSelectedServices] = useState<string[]>(["ai"]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [requirements, setRequirements] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !requirements) {
      setError("Please fill in your name, email, and requirements.");
      return;
    }
    if (selectedServices.length === 0) {
      setError("Select at least one service you're interested in.");
      return;
    }
    setSubmitting(true);
    try {
      await partnerMutation({
        name,
        email,
        phone: phone || "",
        companyName: companyName.trim() || undefined,
        website: website.trim() || undefined,
        aboutCompany: aboutCompany.trim() || undefined,
        services: selectedServices as ("ai" | "testing_ai" | "recruitment")[],
        requirements,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b border-border/30 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-1">
              <ArrowLeft className="size-4" />
              Back to home
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
                  <rect width="64" height="64" rx="14" fill="#1E293B" />
                  <path d="M14 46L32 20L50 46H14Z" fill="#FFFFFF" />
                  <path d="M32 20L32 52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                  <path d="M24 30H40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-base font-medium">Streamscale</span>
            </div>
            <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
          </div>
        </header>
        <div className="mx-auto max-w-2xl px-4 py-20 sm:py-28 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold mb-3">Thanks for reaching out</h1>
          <p className="text-muted-foreground mb-8">
            We received your request and will follow up at <span className="font-medium text-foreground">{email}</span>
            to scope what you need.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild variant="outline" className="border-border">
              <Link to="/">Back to home</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/jobs">View open jobs</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-1">
            <ArrowLeft className="size-4" />
            Back to home
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="14" fill="#1E293B" />
                <path d="M14 46L32 20L50 46H14Z" fill="#FFFFFF" />
                <path d="M32 20L32 52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                <path d="M24 30H40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-base font-medium">Streamscale</span>
          </div>
          <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="size-3.5" />
            Partner with Streamscale
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
            Tell us what you want to build, test, or hire for.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            We run real benchmarks, deploy custom agents, and find the people who make AI work in the real world.
            Pick what you need and we'll follow up to scope it.
          </p>
        </div>

        {/* Steps preview */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center mx-auto mb-2">
                <step.icon className="size-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <Card className="border-border/40 bg-card/50 shadow-xl shadow-slate-200/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">What do you need?</CardTitle>
            <CardDescription>Select every service you're interested in — you can pick more than one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3">
              {services.map((s) => {
                const isSelected = selectedServices.includes(s.value);
                return (
                  <label
                    key={s.value}
                    className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary/60 bg-primary/5"
                        : "border-border/40 bg-background/50 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        setSelectedServices((prev) =>
                          e.target.checked ? [...prev, s.value] : prev.filter((v) => v !== s.value)
                        )
                      }
                      className="sr-only"
                    />
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                      }`}
                    >
                      {isSelected && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{s.label}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Rivera"
                    required
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="companyName">Company name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme AI Labs"
                    required
                    className="h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Company website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://acme-ai.com"
                    className="h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="h-11"
                />
              </div>

              <div>
                <Label htmlFor="aboutCompany">What does your company do?</Label>
                <Textarea
                  id="aboutCompany"
                  value={aboutCompany}
                  onChange={(e) => setAboutCompany(e.target.value)}
                  placeholder="A quick summary of your business, industry, and team size..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="requirements">What do you need?</Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Tell us about the role, the team, the agents you're evaluating, or the data you want to monetize..."
                  rows={5}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
              >
                {submitting ? "Sending request…" : "Send request"}
                {!submitting && <ArrowRight className="size-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your request goes directly to the Streamscale team. We'll reply within 1-2 business days.
        </p>
      </div>
    </main>
  );
}
