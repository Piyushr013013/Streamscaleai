import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PhoneCall, UserRound, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const stages = [
  { label: "Job posted", detail: "Role published on our site + sourcing begins", icon: Sparkles },
  { label: "Sourced", detail: "Candidates hunted down and screened", icon: UserRound },
  { label: "Built & tested", detail: "Real-world simulation scoring", icon: CheckCircle2 },
  { label: "Scored 90+", detail: "Only top scorers sent to you", icon: CheckCircle2 },
];

export function RecruitmentSection() {
  return (
    <section id="recruitment" className="overflow-hidden border-y border-border/30 bg-sky-50 py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Talent & recruitment</p>
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">We recruit the AI worker, prove it can do the job, then send it to you.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">For every role, we post the job on our site and hunt down candidates ourselves. Each AI worker is built, tested against real work scenarios, and scored on our scale — only those scoring above 90 are ever sent to your team.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-100 bg-white p-5"><p className="text-2xl font-semibold text-slate-900">90+ score threshold</p><p className="mt-2 text-sm leading-6 text-slate-500">Every candidate is scored on real work scenarios. Only those above 90 on our scale reach you.</p></div>
              <div className="rounded-2xl border border-sky-100 bg-white p-5"><p className="text-2xl font-semibold text-slate-900">Contingency based</p><p className="mt-2 text-sm leading-6 text-slate-500">Startups pay when someone we place actually starts—not just because we made an introduction.</p></div>
            </div>
            <Button asChild className="mt-8 gap-2 bg-white text-slate-950 hover:bg-slate-100"><Link to="/partner">Talk to us about recruitment <ArrowRight className="size-4" /></Link></Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="relative rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100 sm:p-8">
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-sky-200/50 blur-3xl" />
            <div className="relative"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Candidate pipeline</p><p className="mt-1 text-xl font-semibold">From job post to 90+ score</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Human + AI review</span></div><div className="mt-8 space-y-3">{stages.map((stage, index) => { const Icon = stage.icon; return <motion.div key={stage.label} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 + index * 0.12 }} className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-slate-50 p-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200"><Icon className="size-5" /></div><div className="min-w-0 flex-1"><p className="font-medium">{stage.label}</p><p className="text-sm text-slate-500">{stage.detail}</p></div><span className="text-sm text-slate-500">0{index + 1}</span></motion.div>; })}</div>                <p className="mt-6 text-sm leading-6 text-slate-500">Jobs are posted regularly on our site while we source candidates in parallel. Every candidate is tested in real scenarios and scored — nothing under 90 gets sent.</p></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
