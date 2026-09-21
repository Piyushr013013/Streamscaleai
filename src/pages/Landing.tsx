import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { RecruitmentSection } from "@/components/RecruitmentSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useState } from "react";
import {
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const stats = [
  { value: "247", label: "Agents Benchmarked" },
  { value: "38", label: "Companies Partnered" },
  { value: "5", label: "Industries Covered" },
  { value: "$410K", label: "Sandbox Placement Revenue" },
];

const industries = [
  {
    name: "Software Engineering",
    passRate: "83%",
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
    passRate: "77%",
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
    passRate: "69%",
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
    passRate: "79%",
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
    passRate: "85%",
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

const workflowData = [
  { department: "Support", automatable: "76%" },
  { department: "Operations", automatable: "58%" },
  { department: "Sales", automatable: "41%" },
  { department: "Legal & Compliance", automatable: "29%" },
];

const dataValues = [
  { category: "Support transcripts", value: "$280K" },
  { category: "Code repositories", value: "$400K" },
  { category: "Sales call logs", value: "$180K" },
  { category: "Ops & workflow logs", value: "$130K" },
];

const faqs = [
  {
    question: "What exactly are you testing?",
    answer:
      "We take the AI agent you're evaluating and run it against real prompts drawn from the actual role. We record where it holds up and where it breaks — you get the specific flaws we found, not a slide deck of recommendations.",
  },
  {
    question: "What's the difference between this and consulting?",
    answer:
      "We don't give advice and we don't consult. This is the test itself, and what we build off the back of it. If you want the flaws fixed, that becomes the basis for what we deploy.",
  },
  {
    question: "What industries do you cover?",
    answer:
      "We currently benchmark across five industries: software engineering, legal and big law, medicine and healthcare, management consulting, and finance and banking. Each Scoutly Axis is a model we run against real work in that industry.",
  },
  {
    question: "How long does it take to get results?",
    answer:
      "Once we partner with a company, we scope the benchmark within four days on average. From there, the testing timeline depends on the role and the number of tasks we're evaluating.",
  },
  {
    question: "What happens after the benchmark?",
    answer:
      "You get a detailed report with specific flaws and strengths. If you want to move forward, we can build and deploy the agent into that workflow, or help you monetize your operational data with AI labs.",
  },
];

function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/[0.015]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Now accepting new partners
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-6"
          >
            We test AI before your company{" "}
            <span className="text-primary">bets on it</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Streamscale runs real prompts against real agents to find out
            whether they can actually take over a role — then hands back
            exactly what we found.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-4"
            >
              <Link to="/partner">
                Partner with us
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8 py-4 border-border hover:bg-accent"
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-base px-5 py-4 text-muted-foreground hover:text-foreground">
              <Link to="/jobs">View open jobs</Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center md:text-left p-6 rounded-xl border border-border/30 bg-card/30"
            >
              <div className="text-3xl md:text-4xl font-semibold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Illustrative figures for planning purposes
        </p>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-16 bg-card/30 border-y border-border/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "247", label: "Agents Benchmarked" },
            { value: "38", label: "Companies Partnered" },
            { value: "5", label: "Industries Covered" },
            { value: "$410K", label: "Sandbox Placement Revenue" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl border border-border/30 bg-card/30"
            >
              <div className="text-3xl font-semibold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">
          Illustrative figures for planning purposes
        </p>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            How a benchmark actually runs
          </h2>
          <p className="text-lg text-muted-foreground">
            When we partner with a company or startup, we don't hand over a
            slide deck of recommendations. We take the agent you're evaluating,
            run it against real prompts drawn from the actual role, and record
            where it holds up and where it breaks.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-6 rounded-xl border border-border/30 bg-card/30 text-center">
          <p className="text-muted-foreground text-sm">
            This isn't consulting. It's the test itself, and what we build off
            the back of it.
          </p>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    title: "We scope the role",
    description:
      "You tell us about the role or process you want tested. We follow up to scope the benchmark and understand what the agent would actually be doing day to day.",
  },
  {
    title: "We run real prompts",
    description:
      "We take the agent you're evaluating and run it against real prompts drawn from the actual work in that role. No hypothetical scenarios — just the actual tasks.",
  },
  {
    title: "We record where it holds up",
    description:
      "Every test produces specific results: what the agent got right, what it got wrong, and where it broke. We document the exact flaws we found.",
  },
  {
    title: "You get the report",
    description:
      "We hand back exactly what we found — not a deck of recommendations, but the actual performance data and the specific issues we identified.",
  },
  {
    title: "We build off the results",
    description:
      "If you want the flaws fixed, that becomes the basis for what we deploy. If you'd rather monetize your data, we can broker that too.",
  },
];

function IndustriesSection() {
  return (
    <section
      id="industries"
      className="py-24 bg-card/30 border-y border-border/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            What we test
          </h2>
          <p className="text-lg text-muted-foreground">
            Each Scoutly Axis is a model we run against real work in that
            industry. Open one to see what we test.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-xl border border-border/30 bg-card/50 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">
                  {industry.name}
                </h3>
                <span className="text-2xl font-semibold text-primary">
                  {industry.passRate}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {industry.description}
              </p>

              <div className="pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Sample scores across agent versions
                </p>
                <div className="space-y-2">
                  {industry.scores.map((score, scoreIndex) => (
                    <div
                      key={scoreIndex}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {score.label}
                      </span>
                      <span
                        className={`font-medium ${
                          score.label === "Human baseline"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {score.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Illustrative data to show the shape of a report. Not a live or real
          result.
        </p>
      </div>
    </section>
  );
}

function EnterpriseSection() {
  return (
    <section
      id="enterprise"
      className="py-24 bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Enterprise
          </h2>
          <p className="text-lg text-muted-foreground">
            For companies deciding how much of their operation an agent can
            actually run — not just one role, but the workflow around it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Work Diagnostics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-1 rounded-xl border border-border/30 bg-card/50 p-6"
          >
            <h3 className="text-lg font-medium text-foreground mb-2">
              AI Work Diagnostics
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              We look at how the work actually gets done — the tools, the
              tickets, the day-to-day handoffs — and map out which parts of it
              an agent could take on today.
            </p>
            <div className="space-y-3">
              {pipelineData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.task}</span>
                  <span className="text-foreground font-medium">
                    {item.automation}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                Share of workflow automatable, by department
              </p>
              <div className="space-y-3">
                {workflowData.map((dept, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-32 truncate">
                      {dept.department}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: dept.automatable }}
                      />
                    </div>
                    <span className="text-sm text-foreground font-medium w-12 text-right">
                      {dept.automatable}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Illustrative — output shape of a diagnostic, not a real
                client's results
              </p>
            </div>
          </motion.div>

          {/* Custom AI Agent Deployment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-1 rounded-xl border border-border/30 bg-card/50 p-6"
          >
            <h3 className="text-lg font-medium text-foreground mb-2">
              Custom AI Agent Deployment
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Once we know what's automatable, we build the agent, place it into
              that workflow, and keep testing it against the job it's
              replacing.
            </p>
            <div className="space-y-3">
              {deploymentData.map((week, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{week.week}</span>
                  <span className="text-foreground font-medium">
                    {week.accuracy}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                Accuracy climbing across deployment weeks
              </p>
              <div className="space-y-3">
                {deploymentData.map((week, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-16">
                      {week.week}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: week.accuracyValue }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Illustrative — a typical improvement curve after deployment,
                not a real client's data
              </p>
            </div>
          </motion.div>

          {/* Data Monetization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-1 rounded-xl border border-border/30 bg-card/50 p-6"
          >
            <h3 className="text-lg font-medium text-foreground mb-2">
              Data Monetization
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Your operational data is worth something to the labs training the
              next generation of models. We clean it, strip anything
              identifying, and broker the sale — you keep a cut.
            </p>
            <div className="space-y-3">
              {dataValues.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.category}</span>
                  <span className="text-foreground font-medium">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-8">
              Illustrative estimates — actual value depends on volume and
              quality
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const pipelineData = [
  { task: "Tier-1 support tickets", automation: "High automation" },
  { task: "Contract redlining", automation: "Partial automation" },
  { task: "Client escalations", automation: "Low automation" },
];

const deploymentData = [
  { week: "Week 1", accuracy: "54%", accuracyValue: 54 },
  { week: "Week 2", accuracy: "68%", accuracyValue: 68 },
  { week: "Week 3", accuracy: "79%", accuracyValue: 79 },
  { week: "Week 4", accuracy: "88%", accuracyValue: 88 },
];

function CTA() {
  return (
    <section
      id="partner"
      className="py-24 bg-card/30 border-y border-border/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Partner with us with Streamscale
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Tell us about the role or process you want tested, and we'll follow
            up to scope the benchmark.
          </p>

          <Button
            asChild
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-4 mx-auto"
          >
            <Link to="/partner">
              Partner with us
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: "4 days", label: "Avg. time to scope a benchmark" },
              { value: "5", label: "Industries actively covered" },
              { value: "12", label: "Active benchmark partners" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-semibold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Illustrative figures for planning purposes
          </p>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-1">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/30 pb-6 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors pr-8">
          {question}
        </span>
        <ChevronRight
          className={`size-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>
      {isOpen && (
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed pl-8">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <RecruitmentSection />
      <StatsSection />
      <HowItWorksSection />
      <IndustriesSection />
      <EnterpriseSection />
      <CTA />
      <FaqSection />
      <Footer />
    </div>
  );
}
