import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import AdminDashboard from "./pages/AdminDashboard.tsx";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const Benchmarks = lazy(() => import("./pages/Benchmarks.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings.tsx"));
const Jobs = lazy(() => import("./pages/Jobs.tsx"));
const BookDemo = lazy(() => import("./pages/BookDemo.tsx"));
const Partner = lazy(() => import("./pages/Partner.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Team = lazy(() => import("./pages/Team.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Info = lazy(() => import("./pages/Info.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    // Full details stay in the browser console for debugging; the screen the
    // visitor sees stays plain and actionable.
    console.error("Streamscale ran into a problem:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="size-6 text-amber-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This page hit an unexpected problem and couldn't finish loading.
              Reloading usually fixes it. If it keeps happening, sign out and
              sign back in, or try again in a few minutes.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="h-11 w-full rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Reload the page
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem("streamscale_user_id");
                    localStorage.removeItem("streamscale_user_role");
                  } catch {
                    // ignore storage failures
                  }
                  window.location.replace("/");
                }}
                className="h-11 w-full rounded-lg border border-border text-sm font-medium text-foreground transition hover:bg-accent"
              >
                Sign out and start fresh
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/benchmarks" element={<Benchmarks />} />
              <Route path="/auth" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/partner" element={<Partner />} />
              <Route path="/privacy" element={<Info />} />
              <Route path="/terms" element={<Info />} />
              <Route path="/about" element={<Info />} />
              <Route path="/contact" element={<Info />} />
              <Route path="/services/:service" element={<Info />} />
              <Route path="/industries/:industry" element={<Info />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
