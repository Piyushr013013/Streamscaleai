import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ArrowRightCircle,
  Layers,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Users,
  Code,
} from "lucide-react";
import { Link, useLocation } from "react-router";

const navLinks = [
  {
    title: "Platform",
    items: [
      {
        title: "Overview",
        href: "#overview",
        description: "See how Streamscale transforms your workflow",
      },
      {
        title: "Features",
        href: "#features",
        description: "Everything you need to scale your streams",
      },
      {
        title: "Integrations",
        href: "#integrations",
        description: "Connect with your favorite tools",
      },
      {
        title: "Pricing",
        href: "#pricing",
        description: "Simple, transparent pricing",
      },
    ],
  },
  {
    title: "Solutions",
    items: [
      {
        title: "Developers",
        href: "#developers",
        description: "Built for engineering teams",
      },
      {
        title: "Enterprises",
        href: "#enterprises",
        description: "Scale with confidence",
      },
      {
        title: "Startups",
        href: "#startups",
        description: "Grow faster with Streamscale",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "Documentation",
        href: "#docs",
        description: "Learn how to use Streamscale",
      },
      {
        title: "API Reference",
        href: "#api",
        description: "Integrate with our REST API",
      },
      {
        title: "Blog",
        href: "#blog",
        description: "Latest updates and insights",
      },
    ],
  },
];

const footerLinks = [
  {
    title: "Platform",
    links: [
      { title: "Overview", href: "#overview" },
      { title: "Features", href: "#features" },
      { title: "Integrations", href: "#integrations" },
      { title: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { title: "Developers", href: "#developers" },
      { title: "Enterprises", href: "#enterprises" },
      { title: "Startups", href: "#startups" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "Documentation", href: "#docs" },
      { title: "API Reference", href: "#api" },
      { title: "Blog", href: "#blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "#about" },
      { title: "Careers", href: "#careers" },
      { title: "Contact", href: "#contact" },
      { title: "Legal", href: "#legal" },
    ],
  },
];

export function Navigation() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="64" height="64" rx="14" fill="#09090B" />
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
                  stroke="#09090B"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Streamscale
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navLinks.map((linkGroup) => (
                <NavigationMenuItem key={linkGroup.title}>
                  <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                    {linkGroup.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-1 py-2 px-3">
                      {linkGroup.items.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink
                            asChild
                            className="block select-none space-y-1 rounded-md px-3 py-2 text-sm/6 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <Link
                              to={item.href}
                              className="flex items-center gap-2"
                            >
                              {item.title}
                              <ChevronRight className="size-4 opacity-50" />
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex">
              <Link
                to="#login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
            </nav>
            <Button
              asChild
              size="sm"
              className="hidden md:inline-flex gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link to="/auth">
                Get Started
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden border-border hover:bg-accent"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <nav className="flex flex-col gap-6 mt-8">
                  {navLinks.map((linkGroup) => (
                    <div key={linkGroup.title}>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        {linkGroup.title}
                      </h4>
                      <div className="flex flex-col gap-2">
                        {linkGroup.items.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-border/50">
                    <Link
                      to="#login"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Log in
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
