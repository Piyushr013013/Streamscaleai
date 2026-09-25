import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

export default function Landing() {
  return (
    <div className="nyr min-h-screen bg-background">
      {/* ============ NAV ============ */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#171827]/90 text-[#faf8f1] backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-base font-semibold tracking-tight">
            Streamscale
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-[#9fa5c8] md:flex">
            <a href="#protocol" className="transition-colors hover:text-[#faf8f1]">How it works</a>
            <Link to="/benchmarks" className="transition-colors hover:text-[#faf8f1]">Benchmarks</Link>
            <Link to="/jobs" className="transition-colors hover:text-[#faf8f1]">Careers</Link>
          </nav>
          <Link to="/partner" className="nyr-ghost-btn !py-1.5 !text-[0.8rem]">
            Start hiring <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </header>

      {/* ============ HERO (dark) ============ */}
      <section className="relative overflow-hidden bg-[#171827] text-[#faf8f1]">
        <div className="nyr-grid-noise absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 78% 12%, rgba(159,165,200,.22), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid min-h-[calc(100svh-68px)] max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_.75fr] lg:py-16">
          <div>
            <motion.div {...reveal} className="nyr-eyebrow mb-6">
              <span className="nyr-status-dot" />
              Recruitment for the AI era
            </motion.div>

            <motion.h1
              {...reveal}
              transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
              className="nyr-display mb-6"
            >
              We find the best people <em>for the job.</em>
            </motion.h1>

            <motion.p
              {...reveal}
              transition={{ duration: 0.55, delay: 0.14, ease: "easeOut" }}
              className="nyr-lede max-w-[52ch]"
            >
              Streamscale hunts down top candidates, scores every one on a
              100-point scale — resume, experience, technical skills — and only
              sends you the 90+. We also build and test enterprise AI systems,
              so we know exactly what great looks like.
            </motion.p>

            <motion.div
              {...reveal}
              transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
              className="mt-8 flex flex-wrap items-center gap-6"
            >
              <Link to="/partner" className="nyr-primary-btn">
                Find your next hire <ArrowRight className="size-4" />
              </Link>
              <Link to="/benchmarks" className="nyr-text-link">
                See how we score <span aria-hidden>↓</span>
              </Link>
            </motion.div>

            <motion.div
              {...reveal}
              transition={{ duration: 0.55, delay: 0.26, ease: "easeOut" }}
              className="nyr-signal mt-12 flex flex-wrap gap-x-8 gap-y-2"
            >
              <span>Humans placed by humans.</span>
              <span>Only 90+ scorers reach your team.</span>
            </motion.div>
          </div>

          {/* Stage visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative hidden min-h-[480px] place-items-center lg:grid"
          >
            <div className="nyr-halo" />
            <div className="relative w-full max-w-xs rounded-2xl border border-[#d9dced]/20 bg-[#171827]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between text-[0.63rem] text-[#faf8f1]/60">
                <span>9:41</span>
                <span>● ● ●</span>
              </div>
              <p className="mt-6 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#9fa5c8]">
                Candidate scorecard
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-snug text-[#faf8f1]">
                Senior AI Engineer
              </h3>
              <div className="mt-4 space-y-2.5">
                {[
                  ["Resume", 94],
                  ["Experience", 92],
                  ["Technical", 96],
                ].map(([label, score]) => (
                  <div key={label as string}>
                    <div className="mb-1 flex justify-between text-[0.68rem] text-[#faf8f1]/70">
                      <span>{label}</span>
                      <span className="font-semibold text-[#9fa5c8]">
                        {score}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#d9dced]/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.4 }}
                        className="h-full rounded-full bg-[#9fa5c8]"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#d9dced]/10 px-3 py-2.5 text-[0.72rem] text-[#faf8f1]/80">
                <span>Overall</span>
                <span className="font-bold text-[#9fa5c8]">94 · sent</span>
              </div>
              <p className="mt-3 text-[0.62rem] text-[#faf8f1]/45">
                Candidates below 90 never reach your inbox.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ HOW IT WORKS (light) ============ */}
      <section id="protocol" className="nyr-light bg-[#f0f0ea] text-[#171827]">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <motion.div
            {...reveal}
            className="grid items-end gap-6 md:grid-cols-[1.1fr_.6fr]"
          >
            <div>
              <p className="nyr-eyebrow mb-4">The process</p>
              <h2 className="nyr-display">
                Find. Score. <em>Send.</em>
              </h2>
            </div>
            <p className="text-[0.95rem] leading-relaxed text-[#383a57]">
              Three steps. No noise. You meet only the candidates worth your
              time.
            </p>
          </motion.div>

          <div className="mt-14 border-t border-[rgba(75,84,139,0.28)]">
            {[
              {
                n: "01",
                title: "Find",
                body: "We post the role and hunt down candidates ourselves — human recruiters doing real sourcing, not keyword filters.",
              },
              {
                n: "02",
                title: "Score",
                body: "Every candidate gets a score on our comprehensive 100-point scale: resume, work experience, and technical skills.",
              },
              {
                n: "03",
                title: "Send",
                body: "Only candidates scoring 90+ reach your team. Everyone else never makes it past us — and if AI can do part of the work, we build that too.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                {...reveal}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className="grid gap-3 border-b border-[rgba(75,84,139,0.28)] py-8 md:grid-cols-[80px_220px_1fr] md:items-baseline md:gap-8"
              >
                <span className="nyr-step-number">{step.n}</span>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="max-w-[58ch] text-[0.95rem] leading-relaxed text-[#383a57]">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CREDIBILITY QUOTE (dark, short) ============ */}
      <section className="nyr-dark-section relative overflow-hidden">
        <div className="nyr-grid-noise absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <motion.div {...reveal} className="nyr-quote">
            <p className="text-xl font-medium leading-relaxed text-[#faf8f1] sm:text-2xl">
              The best recruiting firms don't send you more candidates. They
              send you fewer — and every one is right.
            </p>
            <p className="nyr-signal mt-4">The Streamscale standard · 90+</p>
          </motion.div>

          <motion.div
            {...reveal}
            className="mt-12 grid gap-4 sm:grid-cols-3"
          >
            {[
              { v: "90+", l: "The only score we send" },
              { v: "100", l: "Points. Resume, experience, skills" },
              { v: "AI", l: "Built & tested in-house" },
            ].map((s) => (
              <div key={s.l} className="nyr-card p-5">
                <p className="text-3xl font-semibold text-[#9fa5c8]">{s.v}</p>
                <p className="nyr-signal mt-1">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ AI SYSTEMS (light, short) ============ */}
      <section className="nyr-light bg-[#f0f0ea] text-[#171827]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-24 sm:px-6 md:grid-cols-2">
          <motion.div {...reveal}>
            <p className="nyr-eyebrow mb-4">Beyond recruiting</p>
            <h2 className="nyr-display">
              We build and test <em>enterprise AI.</em>
            </h2>
          </motion.div>
          <motion.div {...reveal}>
            <p className="text-[0.95rem] leading-relaxed text-[#383a57]">
              Our other half is building and testing enterprise AI systems —
              real simulations, honest scoring, no demos. It's why our 90+
              means something: we evaluate people the same way we evaluate
              machines.
            </p>
            <Link to="/benchmarks" className="nyr-text-link mt-5">
              See the benchmarks <ArrowUpRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============ FINAL CTA (dark) ============ */}
      <section className="nyr-dark-section relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 110%, rgba(159,165,200,.18), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-6">
          <motion.h2
            {...reveal}
            className="nyr-display mx-auto max-w-[12ch] text-[#faf8f1]"
          >
            A better way <em>to hire.</em>
          </motion.h2>
          <motion.div
            {...reveal}
            className="mt-9 flex flex-wrap items-center justify-center gap-6"
          >
            <Link to="/partner" className="nyr-primary-btn">
              Start hiring <ArrowRight className="size-4" />
            </Link>
            <Link to="/jobs" className="nyr-text-link">
              View open jobs <ArrowUpRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="nyr-dark-section border-t border-[#d9dced]/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <p className="text-sm font-semibold text-[#faf8f1]">Streamscale</p>
          <p className="nyr-signal">
            © {new Date().getFullYear()} · Find the best. Send the 90+.
          </p>
        </div>
      </footer>
    </div>
  );
}
