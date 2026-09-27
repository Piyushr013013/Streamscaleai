import { motion } from "framer-motion";
import { Link } from "react-router";
import { NyrNav, NyrFooter } from "@/components/NyrLayout";

const suggestions = [
  { label: "How it works", href: "/#protocol", description: "Find. Score. Send." },
  { label: "Benchmarks", href: "/benchmarks", description: "Pass rates by industry" },
  { label: "Careers", href: "/jobs", description: "Open positions" },
  { label: "Start hiring", href: "/partner", description: "Meet only the 90+" },
];

export default function NotFound() {
  return (
    <div className="nyr min-h-screen bg-white text-foreground">
      <NyrNav />

      <section className="nyr-hero">
        <div className="nyr-grid" />
        <div className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:px-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="nyr-eyebrow justify-center"
          >
            <span className="nyr-status-dot" />
            Error 404
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="nyr-display-md mt-6"
          >
            This page <em>doesn't exist.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="nyr-lede mx-auto mt-5 max-w-[46ch]"
          >
            The link may be outdated or mistyped. Here's where you might have
            been heading instead.
          </motion.p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div className="border-t border-[rgba(37,99,235,0.2)]">
            {suggestions.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 + i * 0.06 }}
                className="border-b border-[rgba(37,99,235,0.2)]"
              >
                <Link
                  to={item.href}
                  className="group flex items-baseline justify-between gap-4 py-6"
                >
                  <div>
                    <span className="nyr-step mr-4">{`0${i + 1}`}</span>
                    <span className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-[var(--nyr-blue)]">
                      {item.label}
                    </span>
                  </div>
                  <span className="nyr-signal">{item.description} →</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <NyrFooter />
    </div>
  );
}
