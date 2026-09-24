import { Link } from "react-router";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart3, CheckCircle2, FileText, ShieldCheck } from "lucide-react";

const benchmarkStats = [
  { value: "247", label: "Agents Benchmarked" },
  { value: "38", label: "Companies Partnered" },
  { value: "5", label: "Industries Covered" },
  { value: "$410K", label: "Sandbox Placement Revenue" },
];

const benchmarks = [
  {
    name: "Software Engineering",
    href: "/industries/software-engineering",
    passRate: "83%",
    tasksRun: "4,120",
    description:
      "We hand the agent real tickets and bug reports and check whether it reproduces the issue, ships a correct fix, and writes tests that actually cover it.",
    scores: [
      { label: "Human baseline", value: "91%" },
      { label: "Agent v1", value: "58%" },
      { label: "Agent v2", value: "74%" },
      { label: "Agent v3", value: "83%" },
    ],
  },
  {
    name: "Legal & Big Law",
    href: "/industries/legal-big-law",
    passRate: "77%",
    tasksRun: "2,860",
    description:
      "We run it against real contract review and redlining work and measure precision against the clauses a human reviewer flagged.",
    scores: [
      { label: "Human baseline", value: "95%" },
      { label: "Agent v1", value: "41%" },
      { label: "Agent v2", value: "62%" },
      { label: "Agent v3", value: "77%" },
    ],
  },
  {
    name: "Medicine & Healthcare",
    href: "/industries/medicine-healthcare",
    passRate: "69%",
    tasksRun: "1,940",
    description:
      "We test it against real case documentation and triage-style tasks and score it against outcomes a clinician already reviewed.",
    scores: [
      { label: "Human baseline", value: "97%" },
      { label: "Agent v1", value: "33%" },
      { label: "Agent v2", value: "55%" },
      { label: "Agent v3", value: "69%" },
    ],
  },
  {
    name: "Management Consulting",
    href: "/industries/management-consulting",
    passRate: "79%",
    tasksRun: "2,310",
    description:
      "We give it real client deliverables — analysis decks, frameworks, recommendations — and compare its output against what a consulting team actually delivered.",
    scores: [
      { label: "Human baseline", value: "88%" },
      { label: "Agent v1", value: "47%" },
      { label: "Agent v2", value: "66%" },
      { label: "Agent v3", value: "79%" },
    ],
  },
  {
    name: "Finance & Banking",
    href: "/industries/finance-banking",
    passRate: "85%",
    tasksRun: "3,470",
    description:
      "We run it against real modeling, reconciliation, or diligence tasks and track its error rate against a human analyst's baseline.",
    scores: [
      { label: "Human baseline", value: "93%" },
      { label: "Agent v1", value: "52%" },
      { label: "Agent v2", value: "71%" },
      { label: "Agent v3", value: "85%" },
    ],
  },
];

const methodology = [
  {
    icon: FileText,
    title: "We scope the role",
    description:
      "You tell us the role or process to test. We follow up to scope the benchmark around what the agent would actually do day to day.",
  },
  {
    icon: BarChart3,
    title: "We run real prompts",
    description:
      "The agent runs against real prompts drawn from actual work in that role — no hypothetical scenarios, just the actual tasks.",
  },
  {
    icon: CheckCircle2,
    title: "We record where it holds up",
    description:
      "Every test produces specific results: what the agent got right, what it got wrong, and where it broke. We document the exact flaws.",
  },
  {
    icon: ShieldCheck,
    title: "You get the report",
    description:
      "We hand back the actual performance data and specific issues we identified — not a deck of recommendations.",
  },
];

const topAgents = [
  { name: "Scoutly Axis — Software", score: "83%", trend: "+9 pts vs last quarter" },
  { name: "Scoutly Axis — Finance", score: "85%", trend: "+14 pts vs last quarter" },
  { name: "Scoutly Axis — Consulting", score: "79%", trend: "+12 pts vs last quarter" },
  { name: "Scoutly Axis — Legal", score: "77%", trend: "+15 pts vs last quarter" },
  { name: "Scoutly Axis — Medicine", score: "69%", trend: "+11 pts vs last quarter" },
];

const contextStats = [
  {
    value: "95%",
    source: "of enterprise generative-AI pilots produce zero measurable P&L return",
    sourceDetail: "MIT NANDA, The GenAI Divide: State of AI in Business 2025",
  },
  {
    value: "67%",
    source: "success rate when buying from specialist vendors vs. building internally",
    sourceDetail: "MIT NANDA, The GenAI Divide: State of AI in Business 2025 — internal builds succeed one-third as often",
  },
  {
    value: "1.96%",
    source: "of real GitHub issues the best model could resolve when SWE-bench launched",
    sourceDetail: "SWE-bench (Jimenez et al., ICLR 2024) — scores have improved since, but on curated, generic tasks",
  },
];

function ScoreBar({ label, value }: { label: string; value: string }) {
  const pct = parseInt(value, 10);
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`h-full rounded-full ${label === "Human baseline" ? "bg-foreground/60" : "bg-primary"}`}
        />
      </div>
      <span
        className={`w-10 shrink-0 text-right text-sm font-medium ${
          label === "Human baseline" ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function Benchmarks() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/[0.03]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-sm font-semibold uppercase tracking-[0.18em] text-primary"
            >
              Benchmarks
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
            >
              How AI agents actually perform, industry by industry
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="mt-5 text-lg leading-relaxed text-muted-foreground"
            >
              Each Scoutly Axis is a model we run against real work in that
              industry — real tickets, real contracts, real models. Below is
              where agents hold up, where they break, and how far they still
              have to go to reach a human baseline.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="mt-3 text-sm leading-relaxed text-muted-foreground/80"
            >
              Context for why this matters: MIT's 2025 NANDA study found 95% of
              enterprise generative-AI pilots deliver no measurable return —
              and when SWE-bench launched, the best model resolved under 2% of
              real GitHub issues. Benchmarks are how you find out which kind of
              agent you're looking at before the money is spent.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {benchmarkStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/30 bg-card/30 p-6"
              >
                <div className="text-3xl font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Real-world context band */}
      <section className="border-y border-border/30 bg-primary/[0.04] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {contextStats.map((item, index) => (
              <motion.div
                key={item.value}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-xl border border-border/30 bg-card/50 p-6"
              >
                <div className="text-3xl font-semibold text-primary">{item.value}</div>
                <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
                  {item.source}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.sourceDetail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benchmark cards by industry */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              Results by industry
            </h2>
            <p className="mt-2 text-muted-foreground">
              The headline number is the latest agent pass rate in that
              industry. Open an industry to see what we test in detail.
            </p>
          </div>

          <div className="space-y-6">
            {benchmarks.map((b, index) => (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="border-border/40 bg-card/50 transition-colors hover:border-primary/30">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-xl">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-foreground">
                            {b.name}
                          </h3>
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            Latest pass rate {b.passRate}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {b.description}
                        </p>
                        <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                          {b.tasksRun} tasks run in this industry
                        </p>
                        <Link
                          to={b.href}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          Explore what we test in {b.name}
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>

                      <div className="w-full space-y-3 lg:max-w-md">
                        {b.scores.map((score) => (
                          <ScoreBar key={score.label} label={score.label} value={score.value} />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Illustrative data to show the shape of a report. Not a live or real
            result.
          </p>
        </div>
      </section>

      {/* Methodology */}
      <section className="border-y border-border/30 bg-card/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              How a benchmark actually runs
            </h2>
            <p className="mt-3 text-muted-foreground">
              When we partner with a company, we don't hand over a slide deck
              of recommendations. We run the agent against real prompts from
              the actual role and record exactly where it holds up and where it
              breaks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {methodology.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-xl border border-border/30 bg-card/50 p-6"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </div>
                <h3 className="font-medium text-foreground">
                  <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
                Scoutly Axis leaderboard
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Each Scoutly Axis is the leading model we run in that industry.
                Scores climb as agent versions improve — the gap to the human
                baseline is exactly what our reports quantify.
              </p>
              <div className="mt-6 rounded-xl border border-border/30 bg-card/50 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  What you get in a benchmark report
                </p>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Pass rate per task category, with the human baseline beside it
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Specific failure cases: where the agent broke and why
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Version-over-version comparison as fixes are made
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    A clear recommendation on what to test or deploy next
                  </li>
                </ul>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/30 bg-card/50">
              <div className="border-b border-border/30 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current scores by industry
              </div>
              <div className="divide-y divide-border/30">
                {topAgents.map((agent) => (
                  <div
                    key={agent.name}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.trend}</p>
                    </div>
                    <span className="text-lg font-semibold text-primary">{agent.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/30 bg-card/30 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
            Want your agent tested?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Tell us the role or process you want benchmarked and we'll follow
            up to scope it — usually within four days.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-primary px-8 py-4 text-base text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/partner">
                Partner with us
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 text-base">
              <Link to="/jobs">View open jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
