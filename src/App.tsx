
import React, { lazy, Suspense } from 'react'; // Import lazy and Suspense
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
// import Analytics from "./pages/Analytics"; // Remove direct import
import Portfolio from "./pages/Portfolio";
import Alerts from "./pages/Alerts";
import { Skeleton } from "@/components/ui/skeleton"; // For Suspense fallback

const queryClient = new QueryClient();

// Lazy load Analytics page
const Analytics = lazy(() => import("./pages/Analytics"));

const AnalyticsPageFallback = () => (
  <div className="min-h-screen bg-background p-4 md:p-8">
    <div className="max-w-7xl mx-auto">
      {/* You might want a minimal Navigation here or just a loading skeleton */}
      <Skeleton className="h-12 w-full mb-4" />
      <Skeleton className="h-8 w-1/4 mb-8" />
      <div className="space-y-8">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route 
            path="/analytics" 
            element={
              <Suspense fallback={<AnalyticsPageFallback />}>
                <Analytics />
              </Suspense>
            } 
          />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
