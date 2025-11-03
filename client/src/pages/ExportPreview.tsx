import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, ArrowLeft, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function ExportPreview() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [sampleData, setSampleData] = useState(JSON.stringify({
    customer: {
      name: "Acme Corp",
      address: "123 Business St, Mumbai, Maharashtra"
    },
    invoice: {
      number: "INV-2024-001"
    },
    quote: {
      number: "QT-2024-001",
      subtotal: "₹50,000.00",
      total: "₹59,000.00"
    },
    items: [
      { description: "Professional Services", quantity: 10, rate: "₹5,000", amount: "₹50,000" }
    ]
  }, null, 2));

  const { data: template } = useQuery<Template>({
    queryKey: ['/api/templates', id],
    enabled: !!id,
  });

  const generateMutation = useMutation({
    mutationFn: async (format: 'pdf' | 'excel' | 'html') => {
      return apiRequest('POST', '/api/generate-report', {
        templateId: id,
        data: JSON.parse(sampleData),
        format,
      });
    },
    onSuccess: (data: any, format) => {
      // Create a blob and download
      const blob = new Blob([data.content], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'html' ? 'text/html' : 
              'application/vnd.ms-excel' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.fileName;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report generated",
        description: `${format.toUpperCase()} file downloaded successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please check your sample data.",
        variant: "destructive",
      });
    },
  });

  if (!template) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/designer/${id}`)}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold" data-testid="text-export-title">Export: {template.name}</h1>
            <p className="text-sm text-muted-foreground">Generate and download reports</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => generateMutation.mutate('html')}
            disabled={generateMutation.isPending}
            variant="outline"
            className="gap-2"
            data-testid="button-export-html"
          >
            <Download className="h-4 w-4" />
            HTML
          </Button>
          <Button
            onClick={() => generateMutation.mutate('pdf')}
            disabled={generateMutation.isPending}
            className="gap-2"
            data-testid="button-export-pdf"
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Sample Data */}
          <Card>
            <CardHeader>
              <CardTitle>Sample Data</CardTitle>
              <CardDescription>
                Provide sample data in JSON format to preview the report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sampleData}
                onChange={(e) => setSampleData(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
                placeholder='{\n  "customer": {\n    "name": "...",\n    "address": "..."\n  }\n}'
                data-testid="textarea-sample-data"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Match the data keys to your template's dynamic field bindings
              </p>
            </CardContent>
          </Card>

          {/* Right: Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Prepare Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Structure your JSON data to match the field bindings in your template. For example, if you have a field binding like <code className="text-primary">customer.name</code>, provide data with that structure.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Choose Format</h4>
                  <p className="text-sm text-muted-foreground">
                    Select PDF for print-ready documents or HTML for web display
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Generate & Download</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the export button and your file will download automatically
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Framework Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Use our API to generate reports programmatically:
                </p>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`POST /api/generate-report
{
  "templateId": "${id}",
  "data": { ... },
  "format": "pdf"
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
