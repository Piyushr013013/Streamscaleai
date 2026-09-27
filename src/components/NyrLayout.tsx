import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";

const navLinks = [
  { label: "How it works", to: "/#protocol" },
  { label: "Scoring", to: "/#scoring" },
  { label: "Who it's for", to: "/#who" },
  { label: "Benchmarks", to: "/benchmarks" },
  { label: "Job board", to: "/jobs" },
];

export function NyrNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[var(--nyr-ink)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-base font-semibold tracking-tight text-white">
          Streamscale
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[#93b4f5] transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/login" className="text-sm text-[#93b4f5] transition-colors hover:text-white">
            Sign in
          </Link>
          <Link to="/partner" className="nyr-btn nyr-btn-ghost nyr-btn-sm">
            Start hiring <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function NyrFooter() {
  return (
    <footer className="nyr-hero border-t border-white/10">
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold text-white">Streamscale</p>
            <p className="nyr-signal mt-3 max-w-[30ch]">
              We find the best people for the job. And we build & test
              enterprise AI systems.
            </p>
          </div>

          <div>
            <p className="nyr-eyebrow mb-4 !text-[0.65rem]">Company</p>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link className="hover:text-white" to="/#protocol">How it works</Link></li>
              <li><Link className="hover:text-white" to="/benchmarks">Benchmarks</Link></li>
              <li><Link className="hover:text-white" to="/jobs">Job board</Link></li>
            </ul>
          </div>

          <div>
            <p className="nyr-eyebrow mb-4 !text-[0.65rem]">Get started</p>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link className="hover:text-white" to="/partner">Start hiring</Link></li>
              <li><Link className="hover:text-white" to="/jobs">Post a job</Link></li>
            </ul>
          </div>

          <div>
            <p className="nyr-eyebrow mb-4 !text-[0.65rem]">Account</p>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link className="hover:text-white" to="/login">Sign in</Link></li>
              <li><Link className="hover:text-white" to="/admin">Admin</Link></li>
              <li><Link className="hover:text-white" to="/privacy">Privacy</Link></li>
              <li><Link className="hover:text-white" to="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-6">
          <p className="nyr-signal">
            © {new Date().getFullYear()} Streamscale · Find the best. Send the 90+.
          </p>
        </div>
      </div>
    </footer>
  );
}
