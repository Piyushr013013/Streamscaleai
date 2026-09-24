import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowLeft, Compass, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const suggestions = [
  { label: "Benchmarks", href: "/benchmarks", description: "Pass rates by industry" },
  { label: "Services", href: "/services/ai-work-diagnostics", description: "What we do" },
  { label: "Jobs", href: "/jobs", description: "Open positions" },
  { label: "Partner with us", href: "/partner", description: "Start a conversation" },
];

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-24">
        <div className="max-w-xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10"
          >
            <Compass className="size-8 text-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-6xl font-semibold tracking-tight text-foreground"
          >
            404
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-3 text-xl font-medium text-foreground"
          >
            This page doesn't exist.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-2 text-muted-foreground leading-relaxed"
          >
            The link may be outdated or mistyped. Here are some places you
            might have been heading instead.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left"
          >
            {suggestions.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group rounded-xl border border-border/40 bg-card/50 p-4 transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild className="gap-2 bg-slate-900 hover:bg-slate-800">
              <Link to="/">
                <Home className="size-4" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/benchmarks">
                <Search className="size-4" />
                Explore benchmarks
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="border-t border-border/30 py-4 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          Streamscale — We test AI before your company bets on it
        </Link>
      </div>
    </motion.div>
  );
}
