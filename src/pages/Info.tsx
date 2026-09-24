import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const pages: Record<string, { eyebrow: string; title: string; intro: string; sections: { title: string; body: string }[] }> = {
  privacy: {
    eyebrow: "Privacy",
    title: "Your work data deserves careful handling.",
    intro: "Streamscale uses information shared through our website, partner requests, and job applications to respond to inquiries, operate our services, and improve the way we evaluate AI systems.",
    sections: [
      { title: "What we collect", body: "We may collect contact details, company context, job application information, and the requirements you choose to share with us. We only request information needed to respond or deliver the relevant service." },
      { title: "How we use it", body: "We use submitted information to scope AI testing, diagnostics, recruitment, or deployment work; communicate with you; manage authorized team access; and protect the service from misuse." },
      { title: "Engagement data stays scoped", body: "Prompts, agent outputs, and datasets shared for a benchmark stay within that engagement. We do not use your data to train models for other clients, and we never publish benchmark results without written permission." },
      { title: "Resume handling", body: "Resumes submitted through the careers page are stored in a restricted area accessible only to authorized Streamscale staff reviewing applications. Uploads are limited to PDF and Word documents, scanned for malicious content, and deleted when an application is closed or on request." },
      { title: "Security practices", body: "Accounts are created by Streamscale administrators rather than open sign-up, passwords are stored using modern one-way hashing, sign-in attempts are rate-limited, and uploads pass through content-type verification. We apply defense-in-depth measures across the site — but no system is perfect, so we treat every report of a vulnerability seriously." },
      { title: "Cookies and tracking", body: "This website does not run advertising trackers or sell behavioral data. We use only what is necessary to operate the site and remember your signed-in session." },
      { title: "Your choices", body: "You can ask us to review, correct, or remove information you submitted by contacting hello@streamscale.com. We do not sell personal information submitted through this website." },
    ],
  },
  terms: {
    eyebrow: "Terms",
    title: "Clear expectations for working together.",
    intro: "These terms describe the basic rules for using Streamscale’s website, submitting a partner request, applying for a role, or accessing an administrator-managed account.",
    sections: [
      { title: "Use of the site", body: "Use the website lawfully and provide accurate information. Do not attempt to access another person’s account, interfere with the service, or submit content you do not have the right to share." },
      { title: "AI evaluation work", body: "Benchmark results are based on the tasks, data, and systems agreed for a particular engagement. Results are decision support, not a guarantee that an AI system will perform identically in every production environment." },
      { title: "Accounts and applications", body: "Workspace accounts are created by Streamscale administrators. Job applicants are responsible for the accuracy of their application and any resume or portfolio link they provide." },
      { title: "Intellectual property", body: "You keep ownership of the data and materials you share with us for an engagement. We keep ownership of our benchmark methodology, tooling, and reports until delivered; delivered reports are licensed to you for internal decision-making." },
      { title: "Confidentiality", body: "Anything you mark confidential — or that reasonably appears confidential — is treated as such. We are happy to sign your NDA before receiving sensitive materials, and we ask the same courtesy for our methodology and pricing." },
      { title: "No automated abuse", body: "Automated scraping, credential stuffing, vulnerability probing without permission, or submitting generated or spam applications is prohibited. We reserve the right to rate-limit or block traffic that threatens the service or other users." },
      { title: "Changes to these terms", body: "If these terms change materially, we will update this page before the change takes effect. Continued use of the site after an update means you accept the revised terms." },
    ],
  },
  "services/ai-work-diagnostics": {
    eyebrow: "Service",
    title: "AI Work Diagnostics",
    intro: "Understand where AI can genuinely improve a workflow before committing to a large deployment.",
    sections: [
      { title: "What we examine", body: "We map the tools, handoffs, tickets, decisions, and recurring work that make up a role or operating process. We then identify which parts are strong candidates for automation and which still need human judgment." },
      { title: "How the diagnostic runs", body: "A diagnostic typically takes one to two weeks. We observe the actual workflow, quantify how time is spent per task, and score each task family on data availability, error tolerance, and judgment required. The output is a ranked view of what an agent could take on today versus what needs rework first." },
      { title: "Why it comes first", body: "MIT's 2025 NANDA research found that most failed enterprise AI pilots trace back to poor workflow fit rather than weak models. The diagnostic exists to catch that mismatch before it costs you a quarter of budget and credibility." },
      { title: "What you receive", body: "You receive a practical view of the workflow, automation opportunities, risks, and the next tests worth running. The goal is a clear operating decision, not a generic AI strategy deck." },
      { title: "Good fit if", body: "Your team is drowning in a specific process (support queues, contract review, reconciliation), you have already tried a generic AI tool, and you want evidence about what would actually work inside your stack before buying or building anything." },
    ],
  },
  "services/custom-agent-deployment": {
    eyebrow: "Service",
    title: "Custom Agent Deployment",
    intro: "Move from an encouraging benchmark to an agent that can operate inside the tools your team already uses.",
    sections: [
      { title: "From test to workflow", body: "We use benchmark findings to shape the agent’s scope, guardrails, integrations, and escalation paths. Deployment is measured against the real job rather than a collection of abstract demos." },
      { title: "How deployment works", body: "We start with the narrowest slice of the workflow the benchmark proved the agent can handle, place it live with a human review loop, and expand scope only as accuracy holds. You see accuracy by week, not a launch-day screenshot." },
      { title: "Guardrails by default", body: "Every deployment ships with escalation paths to humans, audit logs of agent actions, and hard boundaries on what the agent can touch. High-stakes actions require human confirmation until the benchmark says otherwise." },
      { title: "Continuous evaluation", body: "After launch, the workflow remains testable. We help track failure modes, review quality, and identify where the agent needs better instructions, data, or human oversight." },
      { title: "What success looks like", body: "The MIT NANDA study found purchased, specialist-built solutions succeed roughly twice as often as internal builds. Deployment with us means the agent that goes live is the one that already passed your benchmark — not a rebuilt guess." },
    ],
  },
  "services/data-monetization": {
    eyebrow: "Service",
    title: "Data Monetization",
    intro: "Turn valuable operational data into a carefully governed opportunity without losing sight of privacy or quality.",
    sections: [
      { title: "What can be valuable", body: "Support transcripts, code repositories, workflow records, sales calls, and other operational data can help AI teams understand real work. Value depends on relevance, volume, quality, rights, and the ability to remove sensitive information." },
      { title: "The licensing landscape", body: "AI labs and enterprises increasingly license real operational data because public web data is running out and synthetic data has limits. Domain-specific, human-verified datasets — exactly the kind companies generate daily — command meaningful premiums." },
      { title: "How we prepare a dataset", body: "We start with a rights audit: who owns the data, what consent exists, and what regulations apply. Then we clean it, strip personally identifiable and commercially sensitive information, and document provenance so a buyer can trust what they are licensing." },
      { title: "Our role", body: "We help assess the dataset, identify privacy and permission requirements, prepare a clear data brief, and connect the opportunity with appropriate AI or research partners." },
      { title: "What you keep", body: "You keep ownership and a recurring share of any license. Nothing is sold without your sign-off, and revocation terms are written into the agreement before anything ships." },
    ],
  },
  "industries/software-engineering": {
    eyebrow: "Industry",
    title: "Software Engineering",
    intro: "Test agents on real tickets, bug reports, code changes, and tests—not toy coding prompts.",
    sections: [
      { title: "Latest benchmark", body: "Current pass rate: 83% against a 91% human baseline (Agent v3), up from 58% at v1. 4,120 tasks run in this industry so far." },
      { title: "Why public scores mislead", body: "When SWE-bench launched in 2023, the best model resolved 1.96% of real GitHub issues; leaderboard leaders now clear most of that curated set. The catch: it is still generic Python repos. Your codebase, your conventions, and your definition of done are different — and that gap is exactly what our benchmark measures." },
      { title: "What matters", body: "We look at whether an agent can understand an unfamiliar codebase, reproduce an issue, make a correct change, write useful tests, and communicate the tradeoffs a human engineer would need to review." },
      { title: "How we score it", body: "Every fix is validated by actually running the test suite, not by asking another model if it looks right. Failures are categorized: wrong diagnosis, incomplete fix, broken adjacent behavior, or tests that pass while missing the point." },
      { title: "Sample scores across agent versions", body: "Human baseline: 91%. Agent v1: 58%. Agent v2: 74%. Agent v3: 83%. The report shows exactly which task categories each version failed and why." },
    ],
  },
  "industries/legal-big-law": {
    eyebrow: "Industry",
    title: "Legal & Big Law",
    intro: "Evaluate AI against the precision, context, and judgment required in legal work.",
    sections: [
      { title: "Latest benchmark", body: "Current pass rate: 77% against a 95% human baseline (Agent v3), up from 41% at v1. 2,860 tasks run in this industry so far." },
      { title: "What matters", body: "Relevant evaluations can include contract review, clause comparison, redlining, research support, and structured legal analysis with clear review points for attorneys." },
      { title: "Where agents fail", body: "The most common failures we see are confident-but-wrong clause interpretations, missed definitions that change meaning mid-document, and jurisdiction-specific assumptions imported from training data. Each is invisible in a demo and expensive in production." },
      { title: "How we score it", body: "We measure the agent's precision against the clauses a human reviewer actually flagged, and separately score anything the agent invented that was not in the document. Both numbers go in the report." },
      { title: "Sample scores across agent versions", body: "Human baseline: 95%. Agent v1: 41%. Agent v2: 62%. Agent v3: 77%." },
    ],
  },
  "industries/medicine-healthcare": {
    eyebrow: "Industry",
    title: "Medicine & Healthcare",
    intro: "Explore AI opportunities where accuracy, traceability, and clinical oversight are non-negotiable.",
    sections: [
      { title: "Latest benchmark", body: "Current pass rate: 69% against a 97% human baseline (Agent v3), up from 33% at v1. 1,940 tasks run in this industry so far." },
      { title: "What matters", body: "Healthcare evaluations focus on documentation, triage support, information retrieval, and other bounded tasks with appropriate safeguards. Streamscale does not replace clinical judgment or required professional review." },
      { title: "Where agents fail", body: "The gap between 69% and a 97% human baseline concentrates in tasks with rare presentations, ambiguous documentation, and multi-step reasoning across records. Those are precisely the cases where a failure costs the most — which is why we report them by category, not averaged away." },
      { title: "Compliance first", body: "Any healthcare engagement starts with the privacy and regulatory review your context requires. Benchmarks are designed so no patient-identifying data leaves your controlled environment unencrypted." },
      { title: "Sample scores across agent versions", body: "Human baseline: 97%. Agent v1: 33%. Agent v2: 55%. Agent v3: 69%. Every test is scored against outcomes a clinician already reviewed." },
    ],
  },
  "industries/management-consulting": {
    eyebrow: "Industry",
    title: "Management Consulting",
    intro: "See whether AI can contribute to the analysis and deliverables consultants produce every day.",
    sections: [
      { title: "Latest benchmark", body: "Current pass rate: 79% against an 88% human baseline (Agent v3), up from 47% at v1. 2,310 tasks run in this industry so far." },
      { title: "What matters", body: "We can evaluate research synthesis, analysis, structured recommendations, frameworks, and presentation-ready work against a human-reviewed standard." },
      { title: "Where agents fail", body: "Plausible-but-unsupported claims are the signature failure: the analysis reads well and the numbers are invented or stale. We verify every quantitative claim in the agent's output against source materials, and report the unsupported-claim rate separately from writing quality." },
      { title: "What this enables", body: "Firms use these results to decide which deliverable components an agent can draft — data pulls, first-pass research, deck structure — and which remain human-led, with evidence rather than instinct." },
      { title: "Sample scores across agent versions", body: "Human baseline: 88%. Agent v1: 47%. Agent v2: 66%. Agent v3: 79%. Output is compared against what a consulting team actually delivered." },
    ],
  },
  "industries/finance-banking": {
    eyebrow: "Industry",
    title: "Finance & Banking",
    intro: "Measure AI on the detail, consistency, and controls financial workflows demand.",
    sections: [
      { title: "Latest benchmark", body: "Current pass rate: 85% against a 93% human baseline (Agent v3), up from 52% at v1. 3,470 tasks run in this industry so far." },
      { title: "What matters", body: "Potential benchmarks include reconciliation, financial analysis, diligence support, document review, and modeling assistance with clear controls around sensitive information." },
      { title: "Where agents fail", body: "Silent arithmetic drift and inconsistent treatment of edge cases across periods are the recurring failure modes. A reconciliation agent that is 99% accurate per line can still be unusable if the 1% is always in the same material account." },
      { title: "How we score it", body: "We track error rates against a human analyst's baseline on real tasks, and report where every discrepancy came from — so controls can be designed around the agent's actual weakness profile rather than a generic risk list." },
      { title: "Sample scores across agent versions", body: "Human baseline: 93%. Agent v1: 52%. Agent v2: 71%. Agent v3: 85%." },
    ],
  },
  recruitment: {
    eyebrow: "Service",
    title: "Talent & Recruitment",
    intro: "Find the people who can make AI work in the real world.",
    sections: [
      { title: "A full-profile review", body: "We review candidates beyond a resume: background, technical skills, communication, portfolio, references, and fit for the role. That gives hiring teams a stronger signal before a human interview." },
      { title: "A practical candidate pipeline", body: "New opportunities can be published regularly. We receive the candidate’s name, phone, email, and residency, run an AI-assisted first pass, and then bring strong matches into human review and interviewing." },
      { title: "Aligned with startup hiring", body: "We work on a contingency-fee basis for startup recruiting: the company pays after a candidate we place actually starts. When someone is hired, we call them directly and walk them through next steps." },
      { title: "Why AI hiring is different", body: "The roles that make AI succeed inside a company — evaluators, agent operators, domain experts who can test outputs — barely existed two years ago. Generic recruiters screen for keywords; we screen for the judgment to tell a working AI system from a demo." },
      { title: "What the MIT data says", body: "The same NANDA research that found 95% of pilots stalling found the winners invest in people close to the workflow, not just central AI labs. We build you that bench." },
    ],
  },
  about: {
    eyebrow: "Company",
    title: "Streamscale makes AI decisions more concrete.",
    intro: "We help companies and AI teams move past impressive demos and understand how systems perform on the work that actually matters.",
    sections: [
      { title: "Our approach", body: "We scope real work, run real prompts, document where an agent holds up or breaks, and use those findings to guide diagnostics, deployment, or responsible data partnerships." },
      { title: "Why we exist", body: "In 2025, MIT's NANDA initiative found that 95% of enterprise generative-AI pilots delivered no measurable P&L impact — not because the models are weak, but because nobody tested whether they fit the workflow before rollout. Streamscale exists to run that test." },
      { title: "What we are not", body: "We are not a consultancy that leaves you a deck. We are not a vendor that demos on cherry-picked examples. The benchmark report is evidence: pass rates, failure cases, and the agent's actual outputs beside the human answer." },
      { title: "How engagements start", body: "Most begin with a single role. You tell us the workflow you are considering handing to an agent; we scope the benchmark within about four days, run the tests, and deliver the report. From there you decide: fix the flaws, deploy what works, or walk away with evidence instead of a hunch." },
      { title: "Principles we work by", body: "Measure before betting. Report failures first. Keep client data scoped to its engagement. Never average away the failure cases that matter most." },
    ],
  },
  contact: {
    eyebrow: "Company",
    title: "Talk with the Streamscale team.",
    intro: "Tell us what you are building, testing, or hiring for and we will route your request to the right person.",
    sections: [
      { title: "Email", body: "Reach us at hello@streamscale.com. For a structured request, use the Partner with us form so we have your service area, contact details, and requirements in one place." },
      { title: "What happens after you reach out", body: "A person — not an autoresponder — reads every request. We reply within 1-2 business days, ask the two or three questions that matter for scoping, and if it is a fit, schedule a scoping call. If we are not the right fit, we will say so and point you somewhere better." },
      { title: "Partnerships and data licensing", body: "If you are an AI lab or research group interested in licensed datasets, mention it in your note and we will route you to the data team directly." },
      { title: "Careers", body: "We are always interested in people who can evaluate AI systems critically. See open roles on the Jobs page." },
    ],
  },
};

export default function Info() {
  const { pathname } = useLocation();
  const key = pathname.replace(/^\//, "");
  const page = pages[key] ?? pages.about;
  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-12 text-slate-900 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4" /> Back home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-14"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{page.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{page.title}</h1>
          <p className="mt-5 text-xl leading-8 text-slate-600">{page.intro}</p>
        </motion.div>
        <div className="mt-12 space-y-8">
          {page.sections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
              className="border-t border-slate-200 pt-6"
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{section.body}</p>
            </motion.section>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild className="bg-slate-900 hover:bg-slate-800">
            <Link to="/partner">Partner with us <ArrowRight className="ml-2 size-4" /></Link>
          </Button>
          <Button asChild variant="outline">
            <a href="mailto:hello@streamscale.com"><Mail className="mr-2 size-4" />Email Streamscale</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
