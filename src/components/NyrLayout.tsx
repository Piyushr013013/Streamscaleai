import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";

const navAnchors = [
  { label: "How it works", href: "/#protocol" },
  { label: "Scoring", href: "/#scoring" },
  { label: "Who it's for", href: "/#who" },
  { label: "Benchmarks", href: "/benchmarks" },
  { label: "Job board", href: "/jobs" },
];

export function NyrNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a1f44]/90 text-[#ffffff] backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-base font-semibold tracking-tight">
          Streamscale
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[#2e6bef] md:flex">
          {navAnchors.map((a) => (
            <Link key={a.label} to={a.href} className="transition-colors hover:text-[#ffffff]">
              {a.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm text-[#2e6bef] transition-colors hover:text-[#ffffff]"
          >
            Sign in
          </Link>
          <Link to="/partner" className="nyr-ghost-btn nyr-sm">
            Start hiring <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function NyrFooter() {
  return (
    <footer className="nyr-dark-section border-t border-[#dbe3ef]/10">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold text-[#ffffff]">Streamscale</p>
            <p className="nyr-signal mt-2 max-w-[30ch]">
              We find the best people for the job. And we build & test
              enterprise AI systems.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#2e6bef]">
              Company
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#ffffff]/65">
              <Link to="/#protocol" className="hover:text-[#ffffff]">How it works</Link>
              <Link to="/benchmarks" className="hover:text-[#ffffff]">Benchmarks</Link>
              <Link to="/jobs" className="hover:text-[#ffffff]">Job board</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#2e6bef]">
              Get started
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#ffffff]/65">
              <Link to="/partner" className="hover:text-[#ffffff]">Start hiring</Link>
              <Link to="/jobs" className="hover:text-[#ffffff]">Post a job</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#2e6bef]">
              Legal
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#ffffff]/65">
              <Link to="/privacy" className="hover:text-[#ffffff]">Privacy</Link>
              <Link to="/terms" className="hover:text-[#ffffff]">Terms</Link>
              <Link to="/login" className="hover:text-[#ffffff]">Sign in</Link>
              <Link to="/admin" className="hover:text-[#ffffff]">Admin</Link>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-[#dbe3ef]/10 pt-6">
          <p className="nyr-signal">
            © {new Date().getFullYear()} Streamscale · Find the best. Send the 90+.
          </p>
        </div>
      </div>
    </footer>
  );
}
