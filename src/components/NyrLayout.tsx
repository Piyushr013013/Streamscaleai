import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";

const navAnchors = [
  { label: "How it works", href: "/#protocol" },
  { label: "Scoring", href: "/#scoring" },
  { label: "Who it's for", href: "/#who" },
  { label: "Benchmarks", href: "/benchmarks" },
  { label: "Careers", href: "/jobs" },
];

export function NyrNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#171827]/90 text-[#faf8f1] backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-base font-semibold tracking-tight">
          Streamscale
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[#9fa5c8] md:flex">
          {navAnchors.map((a) =>
            a.href.startsWith("/#") ? (
              <Link key={a.label} to={a.href} className="transition-colors hover:text-[#faf8f1]">
                {a.label}
              </Link>
            ) : (
              <Link key={a.label} to={a.href} className="transition-colors hover:text-[#faf8f1]">
                {a.label}
              </Link>
            )
          )}
        </nav>
        <Link to="/partner" className="nyr-ghost-btn !py-1.5 !text-[0.8rem]">
          Start hiring <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </header>
  );
}

export function NyrFooter() {
  return (
    <footer className="nyr-dark-section border-t border-[#d9dced]/10">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold text-[#faf8f1]">Streamscale</p>
            <p className="nyr-signal mt-2 max-w-[30ch]">
              We find the best people for the job. And we build & test
              enterprise AI systems.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#9fa5c8]">
              Company
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#faf8f1]/65">
              <Link to="/#protocol" className="hover:text-[#faf8f1]">How it works</Link>
              <Link to="/benchmarks" className="hover:text-[#faf8f1]">Benchmarks</Link>
              <Link to="/jobs" className="hover:text-[#faf8f1]">Careers</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#9fa5c8]">
              Get started
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#faf8f1]/65">
              <Link to="/partner" className="hover:text-[#faf8f1]">Start hiring</Link>
              <Link to="/jobs" className="hover:text-[#faf8f1]">Join the bench</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#9fa5c8]">
              Legal
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#faf8f1]/65">
              <Link to="/privacy" className="hover:text-[#faf8f1]">Privacy</Link>
              <Link to="/terms" className="hover:text-[#faf8f1]">Terms</Link>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-[#d9dced]/10 pt-6">
          <p className="nyr-signal">
            © {new Date().getFullYear()} Streamscale · Find the best. Send the 90+.
          </p>
        </div>
      </div>
    </footer>
  );
}
