import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowRight, ChevronRight, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router";

const navLinks = [
  {
    title: "How it works",
    items: [
      {
        title: "The process",
        href: "#how-it-works",
        description: "How a benchmark actually runs",
      },
      {
        title: "What we test",
        href: "#industries",
        description: "The industries we cover",
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        title: "AI Work Diagnostics",
        href: "/services/ai-work-diagnostics",
        description: "Map what's automatable",
      },
      {
        title: "Custom Agent Deployment",
        href: "/services/custom-agent-deployment",
        description: "Build and deploy agents",
      },
      {
        title: "Data Monetization",
        href: "/services/data-monetization",
        description: "Broker your data to labs",
      },
      {
        title: "Talent & Recruitment",
        href: "/jobs",
        description: "Find the people who make AI work",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "Benchmarks",
        href: "/industries/software-engineering",
        description: "See pass rates by industry",
      },
      {
        title: "FAQ",
        href: "#faq",
        description: "Common questions",
      },
    ],
  },
];

export function Navigation() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  // Anchor links ("#section") need manual scrolling: React Router does not
  // scroll for hash-only paths, and the fixed header would cover the target.
  const goTo = (href: string) => {
    setOpenMenu(null);
    if (href.startsWith("#")) {
      const el = document.getElementById(href.slice(1));
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      navigate(href);
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="64" height="64" rx="14" fill="#1E293B" />
                <path
                  d="M14 46L32 20L50 46H14Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M32 20L32 52"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M24 30H40"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-base font-medium tracking-tight text-foreground">
              Streamscale
            </span>
          </Link>

          {/* Desktop Navigation — Staples-style full-width hover mega-menu */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((linkGroup) => (
              <div key={linkGroup.title} onMouseEnter={() => setOpenMenu(linkGroup.title)}>
                <button
                  type="button"
                  onClick={() => setOpenMenu((current) => (current === linkGroup.title ? null : linkGroup.title))}
                  className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    openMenu === linkGroup.title
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  }`}
                  aria-expanded={openMenu === linkGroup.title}
                >
                  {linkGroup.title}
                  <ChevronDown
                    className={`size-3.5 transition-transform duration-200 ${
                      openMenu === linkGroup.title ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            ))}
          </nav>

          {/* Full-width mega-menu panel, spans the entire top of the screen */}
          <AnimatePresence>
            {openMenu && (
              <motion.div
                key={openMenu}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute inset-x-0 top-full hidden md:block border-b border-border/40 bg-background/98 shadow-xl backdrop-blur-xl"
                onMouseEnter={() => setOpenMenu(openMenu)}
              >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="py-8">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {openMenu}
                    </p>
                    <div
                      className={`grid gap-x-8 gap-y-2 ${
                        (navLinks.find((g) => g.title === openMenu)?.items.length ?? 0) >= 4
                          ? "grid-cols-2 lg:grid-cols-4"
                          : "grid-cols-2 lg:grid-cols-3"
                      }`}
                    >
                      {navLinks
                        .find((g) => g.title === openMenu)
                        ?.items.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              goTo(item.href);
                            }}
                            className="group rounded-xl px-4 py-3 transition-colors hover:bg-accent"
                          >
                            <span className="block text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </span>
                            <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
                              {item.description}
                            </span>
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Button
              asChild
              size="sm"
              className="hidden md:inline-flex gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link to="/partner">
                Partner with us
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden border-border hover:bg-accent h-9 w-9 rounded-xl"
                >
                  <Menu className="size-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[340px] pt-0 px-6 overflow-y-auto">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="64" height="64" rx="14" fill="#1E293B" />
                          <path d="M14 46L32 20L50 46H14Z" fill="#FFFFFF" />
                          <path d="M32 20L32 52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                          <path d="M24 30H40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-base font-medium tracking-tight">Streamscale</span>
                    </div>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl -mr-3">
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetTrigger>
                  </div>

                  <nav className="flex flex-col gap-6 flex-1">
                    {navLinks.map((linkGroup) => (
                      <div key={linkGroup.title}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                          {linkGroup.title}
                        </h4>
                        <div className="flex flex-col gap-0.5">
                          {linkGroup.items.map((item) => (
                            <Link
                              key={item.title}
                              to={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                goTo(item.href);
                              }}
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent"
                            >
                              <span>{item.title}</span>
                              <ChevronRight className="size-3.5 ml-auto" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>

                  <div className="border-t border-border/40 pt-5 mt-auto">
                    <div className="flex flex-col gap-2.5">
                      <Button
                        asChild
                        className="w-full gap-2 bg-white hover:bg-slate-50 text-slate-900 border-border rounded-xl h-11 text-sm font-medium"
                      >
                        <Link to="/jobs">
                          View open jobs
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                      <Link
                        to="/login"
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        <span>Sign in</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                      <Button
                        asChild
                        className="mt-3 w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 text-sm font-medium"
                      >
                        <Link to="/partner">
                          Partner with us
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
