import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FeaturesSection } from "@/components/FeatureSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Users,
  Code,
  Layers,
  ArrowRightCircle,
} from "lucide-react";
import { useState } from "react";

const stats = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "50M+", label: "Events/Second" },
  { value: "10K+", label: "Developers" },
  { value: "150+", label: "Countries" },
];

const testimonials = [
  {
    quote:
      "Streamscale transformed how we handle real-time data. The latency is incredible and the developer experience is unmatched.",
    name: "Sarah Chen",
    role: "VP of Engineering, DataFlow",
    avatar: "SC",
  },
  {
    quote:
      "We migrated our entire streaming infrastructure to Streamscale in under a week. The SDKs are beautifully designed and the docs are excellent.",
    name: "Marcus Johnson",
    role: "CTO, StreamLine Technologies",
    avatar: "MJ",
  },
  {
    quote:
      "The auto-scaling features alone saved us months of DevOps work. We can now focus on building features instead of managing infrastructure.",
    name: "Emily Rodriguez",
    role: "Lead Developer, ScaleUp Inc",
    avatar: "ER",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for small projects and prototyping",
    price: "0",
    period: "forever",
    features: [
      "Up to 10K events/second",
      "1GB storage",
      "Community support",
      "Basic analytics",
      "Single region",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    description: "For growing teams with production workloads",
    price: "49",
    period: "/month",
    features: [
      "Up to 100K events/second",
      "100GB storage",
      "Priority support",
      "Advanced analytics",
      "Multi-region deployment",
      "Custom domains",
      "Webhooks & integrations",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large-scale deployments with advanced needs",
    price: "Custom",
    period: "",
    features: [
      "Unlimited events/second",
      "Unlimited storage",
      "Dedicated support",
      "Custom analytics",
      "Global deployment",
      "SSO & SAML",
      "SLA guarantee",
      "Dedicated instance",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "How does Streamscale handle data persistence?",
    answer:
      "Streamscale offers flexible persistence options including in-memory caching for ultra-low latency, SSD-backed storage for durability, and archive storage for long-term retention. You can configure retention policies per stream to balance performance and cost.",
  },
  {
    question: "What kind of SLA do you offer?",
    answer:
      "Our Pro and Enterprise plans include a 99.99% uptime SLA with financial penalties for violations. Our global infrastructure with automatic failover ensures your streams remain available even during regional outages.",
  },
  {
    question: "Can I integrate Streamscale with my existing systems?",
    answer:
      "Yes, Streamscale provides native integrations with popular data sources and sinks including Kafka, PostgreSQL, Redis, and HTTP endpoints. Our REST and WebSocket APIs make it easy to build custom integrations.",
  },
  {
    question: "How do you handle security and compliance?",
    answer:
      "Streamscale is SOC 2 Type II certified and supports encryption at rest and in transit. We offer role-based access control, audit logging, and can deploy in your VPC for additional isolation. Enterprise plans include advanced security features.",
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer:
      "We'll notify you when you're approaching your limits. Pro plans can burst beyond their limits with pay-as-you-go pricing. Enterprise plans offer unlimited scaling with predictable monthly costs.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/50 pb-6 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
          {question}
        </span>
        <ChevronRight
          className={`size-5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>
      {isOpen && (
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

function PricingCard({
  plan,
}: {
  plan: (typeof pricingPlans)[0];
}) {
  return (
    <div
      className={`relative rounded-xl border p-8 ${
        plan.popular
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border/50 bg-card/50"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            Most Popular
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {plan.name}
        </h3>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </div>
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">
          {typeof plan.price === "number" ? `$${plan.price}` : plan.price}
        </span>
        {plan.period && (
          <span className="text-muted-foreground text-sm ml-1">
            {plan.period}
          </span>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle2 className="size-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        variant={plan.popular ? "default" : "outline"}
        className={`w-full ${
          plan.popular
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "border-border hover:bg-accent"
        }`}
      >
        <Link to="/auth">{plan.cta}</Link>
      </Button>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/[0.02]" />
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 0%, var(--primary) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Now in Public Beta
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
          >
            Build streaming apps{" "}
            <span className="text-primary">that scale</span>
            <br />
            without the complexity
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Streamscale makes it easy to build, deploy, and scale real-time
            data streaming infrastructure. Focus on your product, not your
            pipeline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-4"
            >
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 text-base px-8 py-4 border-border hover:bg-accent"
            >
              <Link to="#demo">
                Watch Demo
                <Globe className="size-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Trusted By */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              {["Vercel", "Linear", "Notion", "Figma", "Raycast"].map(
                (company) => (
                  <span
                    key={company}
                    className="text-xl font-semibold text-foreground"
                  >
                    {company}
                  </span>
                )
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/50">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="py-8 md:py-10 text-center md:text-left"
              >
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24 bg-card/20 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by developers
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of developers who've made the switch to Streamscale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-border/50 bg-card/50"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-primary fill-current"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-24 bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">Monthly</span>
            <div className="relative w-12 h-6">
              <input
                type="checkbox"
                className="sr-only"
              />
              <div className="absolute inset-0 rounded-full bg-secondary cursor-pointer transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-foreground shadow transition-transform" />
            </div>
            <span className="text-sm text-muted-foreground">Annual</span>
            <span className="text-sm text-primary font-medium">Save 20%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="py-24 bg-card/20 border-y border-border/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Streamscale.
          </p>
        </div>

        <div className="space-y-1">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-12 md:p-16 text-center">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/20 blur-3xl -translate-y-1/2 translate-x-1/2"
            />
            <div
              className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl translate-y-1/2 -translate-x-1/2"
            />
          </div>

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to scale your streams?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of developers building with Streamscale. Start free,
              upgrade when you need more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-4"
              >
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 text-base px-8 py-4 border-border hover:bg-accent"
              >
                <Link to="#contact">
                  Talk to Sales
                  <Users className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CallToAction />
      <Footer />
    </div>
  );
}
