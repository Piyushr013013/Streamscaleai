import { Link, useLocation } from "react-router";
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
    ],
  },
  "services/ai-work-diagnostics": {
    eyebrow: "Service",
    title: "AI Work Diagnostics",
    intro: "Understand where AI can genuinely improve a workflow before committing to a large deployment.",
    sections: [
      { title: "What we examine", body: "We map the tools, handoffs, tickets, decisions, and recurring work that make up a role or operating process. We then identify which parts are strong candidates for automation and which still need human judgment." },
      { title: "What you receive", body: "You receive a practical view of the workflow, automation opportunities, risks, and the next tests worth running. The goal is a clear operating decision, not a generic AI strategy deck." },
    ],
  },
  "services/custom-agent-deployment": {
    eyebrow: "Service",
    title: "Custom Agent Deployment",
    intro: "Move from an encouraging benchmark to an agent that can operate inside the tools your team already uses.",
    sections: [
      { title: "From test to workflow", body: "We use benchmark findings to shape the agent’s scope, guardrails, integrations, and escalation paths. Deployment is measured against the real job rather than a collection of abstract demos." },
      { title: "Continuous evaluation", body: "After launch, the workflow remains testable. We help track failure modes, review quality, and identify where the agent needs better instructions, data, or human oversight." },
    ],
  },
  "services/data-monetization": {
    eyebrow: "Service",
    title: "Data Monetization",
    intro: "Turn valuable operational data into a carefully governed opportunity without losing sight of privacy or quality.",
    sections: [
      { title: "What can be valuable", body: "Support transcripts, code repositories, workflow records, sales calls, and other operational data can help AI teams understand real work. Value depends on relevance, volume, quality, rights, and the ability to remove sensitive information." },
      { title: "Our role", body: "We help assess the dataset, identify privacy and permission requirements, prepare a clear data brief, and connect the opportunity with appropriate AI or research partners." },
    ],
  },
  "industries/software-engineering": { eyebrow: "Industry", title: "Software Engineering", intro: "Test agents on real tickets, bug reports, code changes, and tests—not toy coding prompts.", sections: [{ title: "What matters", body: "We look at whether an agent can understand an unfamiliar codebase, reproduce an issue, make a correct change, write useful tests, and communicate the tradeoffs a human engineer would need to review." }] },
  "industries/legal-big-law": { eyebrow: "Industry", title: "Legal & Big Law", intro: "Evaluate AI against the precision, context, and judgment required in legal work.", sections: [{ title: "What matters", body: "Relevant evaluations can include contract review, clause comparison, redlining, research support, and structured legal analysis with clear review points for attorneys." }] },
  "industries/medicine-healthcare": { eyebrow: "Industry", title: "Medicine & Healthcare", intro: "Explore AI opportunities where accuracy, traceability, and clinical oversight are non-negotiable.", sections: [{ title: "What matters", body: "Healthcare evaluations focus on documentation, triage support, information retrieval, and other bounded tasks with appropriate safeguards. Streamscale does not replace clinical judgment or required professional review." }] },
  "industries/management-consulting": { eyebrow: "Industry", title: "Management Consulting", intro: "See whether AI can contribute to the analysis and deliverables consultants produce every day.", sections: [{ title: "What matters", body: "We can evaluate research synthesis, analysis, structured recommendations, frameworks, and presentation-ready work against a human-reviewed standard." }] },
  "industries/finance-banking": { eyebrow: "Industry", title: "Finance & Banking", intro: "Measure AI on the detail, consistency, and controls financial workflows demand.", sections: [{ title: "What matters", body: "Potential benchmarks include reconciliation, financial analysis, diligence support, document review, and modeling assistance with clear controls around sensitive information." }] },
  about: { eyebrow: "Company", title: "Streamscale makes AI decisions more concrete.", intro: "We help companies and AI teams move past impressive demos and understand how systems perform on the work that actually matters.", sections: [{ title: "Our approach", body: "We scope real work, run real prompts, document where an agent holds up or breaks, and use those findings to guide diagnostics, deployment, or responsible data partnerships." }] },
  contact: { eyebrow: "Company", title: "Talk with the Streamscale team.", intro: "Tell us what you are building, testing, or hiring for and we will route your request to the right person.", sections: [{ title: "Email", body: "Reach us at hello@streamscale.com. For a structured request, use the Partner with us form so we have your service area, contact details, and requirements in one place." }] },
};

export default function Info() {
  const { pathname } = useLocation();
  const key = pathname.replace(/^\//, "");
  const page = pages[key] ?? pages.about;
  return <main className="min-h-screen bg-[#f7f8fa] px-4 py-12 text-slate-900 sm:py-20"><div className="mx-auto max-w-3xl"><Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="size-4" /> Back home</Link><div className="mt-14"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{page.eyebrow}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{page.title}</h1><p className="mt-5 text-xl leading-8 text-slate-600">{page.intro}</p></div><div className="mt-12 space-y-8">{page.sections.map((section) => <section key={section.title} className="border-t border-slate-200 pt-6"><h2 className="text-xl font-semibold">{section.title}</h2><p className="mt-3 leading-7 text-slate-600">{section.body}</p></section>)}</div><div className="mt-12 flex flex-wrap gap-3"><Button asChild className="bg-slate-900 hover:bg-slate-800"><Link to="/partner">Partner with us <ArrowRight className="ml-2 size-4" /></Link></Button><Button asChild variant="outline"><a href="mailto:hello@streamscale.com"><Mail className="mr-2 size-4" />Email Streamscale</a></Button></div></div></main>;
}
