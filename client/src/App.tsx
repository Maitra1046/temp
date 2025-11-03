import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Designer from "@/pages/Designer";
import AIGenerate from "@/pages/AIGenerate";
import ExportPreview from "@/pages/ExportPreview";
import GSTValidator from "@/pages/GSTValidator";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/designer" component={Designer} />
      <Route path="/designer/:id" component={Designer} />
      <Route path="/export/:id" component={ExportPreview} />
      <Route path="/gst-validator" component={GSTValidator} />
      <Route path="/ai-generate" component={AIGenerate} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
