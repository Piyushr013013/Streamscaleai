import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, Send, CheckCircle } from "lucide-react";

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
  const [service, setService] = useState("ai");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
    setSubmitting(true);
    try {
      await partnerMutation({
        name,
        email,
        phone: phone || "",
        service: service as "ai" | "testing_ai" | "recruitment",
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
      <main className="min-h-screen bg-background px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold mb-3">Thanks for reaching out</h1>
          <p className="text-muted-foreground mb-8">
            We received your request and will follow up at <span className="font-medium text-foreground">{email}</span>
            to scope what you need.
          </p>
          <Button asChild variant="outline" className="border-border">
            <a href="/">Back to home</a>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-3">Partner with us</h1>
          <p className="text-muted-foreground text-lg">
            Tell us what you want to test, deploy, or recruit for, and we'll follow up to scope it.
          </p>
        </div>

        <Card className="border-border/40 bg-card/50">
          <CardHeader>
            <CardTitle>What do you need?</CardTitle>
            <CardDescription>Choose the service you're interested in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={service} onValueChange={(v) => setService(v)} className="grid gap-3">
              {services.map((s) => (
                <label
                  key={s.value}
                  className="flex items-start gap-4 rounded-xl border border-border/40 bg-background/50 p-4 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <RadioGroupItem value={s.value} className="mt-0.5" />
                  <div>
                    <p className="font-medium">{s.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>

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
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              >
                {submitting ? "Sending request…" : "Send request"}
                {!submitting && <ArrowRight className="size-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your request goes to the Streamscale team. We'll reply from the email you provide.
        </p>
      </div>
    </main>
  );
}
