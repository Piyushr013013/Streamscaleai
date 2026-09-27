import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowUpRight, CheckCircle, Check } from "lucide-react";
import { NyrNav, NyrFooter } from "@/components/NyrLayout";

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
  const steps = [
    { title: "Tell us what you need", desc: "Pick a service and share your requirements." },
    { title: "We review and scope", desc: "Our team follows up within 1–2 business days." },
    { title: "We deliver", desc: "You get a benchmark, deployed agent, or placed candidate." },
  ];
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
      <div className="nyr min-h-screen bg-white text-foreground">
        <NyrNav />
        <section className="nyr-hero">
          <div className="nyr-grid" />
          <div className="relative mx-auto max-w-2xl px-4 py-28 text-center sm:px-6">
            <div className="nyr-halo mx-auto mb-8 size-20" />
            <CheckCircle className="mx-auto mb-6 size-14 text-[var(--nyr-blue)]" />
            <h1 className="nyr-display-md">
              Request <em>received.</em>
            </h1>
            <p className="nyr-lede mx-auto mt-5 max-w-[46ch]">
              We got it. We'll follow up at{" "}
              <span className="font-semibold text-foreground">{email}</span>{" "}
              within 1–2 business days to scope what you need.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Link to="/" className="nyr-btn nyr-btn-primary">
                Back to home <ArrowRight className="size-4" />
              </Link>
              <Link to="/jobs" className="nyr-link ">
                View open jobs <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
        <NyrFooter />
      </div>
    );
  }

  return (
    <div className="nyr min-h-screen bg-white text-foreground">
      <NyrNav />

      {/* Hero */}
      <section className="nyr-hero">
        <div className="nyr-grid" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="nyr-eyebrow mb-4">
              <span className="nyr-status-dot" />
              Partner with Streamscale
            </p>
            <h1 className="nyr-display-md">
              Tell us what to build, <em>test, or hire for.</em>
            </h1>
            <p className="nyr-lede mx-auto mt-5 max-w-[52ch]">
              We run real benchmarks, deploy custom agents, and find the people
              who make AI work in the real world. Pick what you need and we'll
              follow up to scope it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form (light) */}
      <section className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {/* Steps preview */}
        <div className="mb-10 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-white">
          {steps.map((step, i) => (
            <div key={i} className="bg-white p-5 text-center">
              <span className="nyr-step">0{i + 1}</span>
              <p className="mt-1 text-sm font-semibold">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
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
                className="nyr-btn nyr-btn-primary !min-h-12 w-full text-base"
              >
                {submitting ? "Sending request…" : "Send request"}
                {!submitting && <ArrowRight className="size-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          Your request goes directly to the Streamscale team. We'll reply within 1–2 business days.
        </p>
      </div>
      </section>

      <NyrFooter />
    </div>
  );
}
