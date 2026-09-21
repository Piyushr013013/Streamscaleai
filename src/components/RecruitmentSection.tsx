import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PhoneCall, UserRound, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const stages = [
  { label: "Applied", detail: "Profile received", icon: UserRound },
  { label: "Reviewed", detail: "AI-assisted fit signal", icon: Sparkles },
  { label: "Interviewing", detail: "Human conversation", icon: PhoneCall },
  { label: "Hired", detail: "Direct next steps", icon: CheckCircle2 },
];

export function RecruitmentSection() {
  return (
    <section id="recruitment" className="overflow-hidden border-y border-border/30 bg-sky-50 py-24 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Talent & recruitment</p>
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">The right people make AI work in the real world.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Streamscale helps startups and companies find people who can build, test, operate, and improve AI systems. We review the full profile—not just a resume—and connect strong candidates directly with the teams that need them.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-100 bg-white p-5"><p className="text-2xl font-semibold text-slate-900">Full-profile review</p><p className="mt-2 text-sm leading-6 text-slate-500">Background, skills, communication, portfolio, references, and fit for the role.</p></div>
              <div className="rounded-2xl border border-sky-100 bg-white p-5"><p className="text-2xl font-semibold text-slate-900">Contingency based</p><p className="mt-2 text-sm leading-6 text-slate-500">Startups pay when someone we place actually starts—not just because we made an introduction.</p></div>
            </div>
            <Button asChild className="mt-8 gap-2 bg-white text-slate-950 hover:bg-slate-100"><Link to="/partner">Talk to us about recruitment <ArrowRight className="size-4" /></Link></Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} className="relative rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100 sm:p-8">
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-sky-200/50 blur-3xl" />
            <div className="relative"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">Candidate pipeline</p><p className="mt-1 text-xl font-semibold">From application to fit</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Human + AI review</span></div><div className="mt-8 space-y-3">{stages.map((stage, index) => { const Icon = stage.icon; return <motion.div key={stage.label} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 + index * 0.12 }} className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-slate-50 p-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200"><Icon className="size-5" /></div><div className="min-w-0 flex-1"><p className="font-medium">{stage.label}</p><p className="text-sm text-slate-500">{stage.detail}</p></div><span className="text-sm text-slate-500">0{index + 1}</span></motion.div>; })}</div><p className="mt-6 text-sm leading-6 text-slate-500">New opportunities can be published regularly. When a candidate is hired, we call them directly to explain the next steps and help the transition start well.</p></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
