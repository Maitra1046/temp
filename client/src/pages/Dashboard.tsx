import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, FileText, ShoppingCart, FileSpreadsheet, Receipt, Sparkles, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Template } from "@shared/schema";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });

  const filteredTemplates = templates?.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryIcons = {
    'quotation': FileText,
    'invoice': Receipt,
    'purchase-order': ShoppingCart,
    'gst-invoice': FileSpreadsheet,
    'custom': Sparkles
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-3 tracking-tight" data-testid="text-dashboard-title">
                Welcome to Templify
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl" data-testid="text-dashboard-subtitle">
                Create professional reports in minutes, not hours. Build with our visual designer or let AI generate templates for you.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/designer">
                <Button size="lg" className="gap-2" data-testid="button-new-template">
                  <Plus className="h-5 w-5" />
                  New Template
                </Button>
              </Link>
              <Link href="/ai-generate">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-ai-generate">
                  <Sparkles className="h-5 w-5" />
                  AI Generate
                </Button>
              </Link>
              <Link href="/gst-validator">
                <Button size="lg" variant="outline" className="gap-2" data-testid="button-gst-validator">
                  <Shield className="h-5 w-5" />
                  GST Tools
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <CardDescription>Total Templates</CardDescription>
                <CardTitle className="text-3xl" data-testid="text-stats-total">{templates?.length || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <CardDescription>Pre-built Templates</CardDescription>
                <CardTitle className="text-3xl" data-testid="text-stats-prebuilt">
                  {templates?.filter(t => t.isTemplate).length || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <CardDescription>Custom Templates</CardDescription>
                <CardTitle className="text-3xl" data-testid="text-stats-custom">
                  {templates?.filter(t => !t.isTemplate).length || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <CardDescription>Reports Generated</CardDescription>
                <CardTitle className="text-3xl" data-testid="text-stats-generated">0</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Template Gallery */}
      <section className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Template Library</h2>
            <p className="text-muted-foreground">
              Choose from pre-built templates or create your own from scratch
            </p>
          </div>
          
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredTemplates && filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => {
              const Icon = categoryIcons[template.category as keyof typeof categoryIcons] || FileText;
              return (
                <Card 
                  key={template.id} 
                  className="overflow-hidden hover-elevate group transition-all"
                  data-testid={`card-template-${template.id}`}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center border-b">
                    <Icon className="h-24 w-24 text-primary/30" />
                  </div>
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight" data-testid={`text-template-name-${template.id}`}>
                        {template.name}
                      </CardTitle>
                      {template.isTemplate && (
                        <Badge variant="secondary" className="shrink-0">Pre-built</Badge>
                      )}
                    </div>
                    {template.description && (
                      <CardDescription className="line-clamp-2">
                        {template.description}
                      </CardDescription>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="gap-2">
                    <Link href={`/designer/${template.id}`} className="flex-1">
                      <Button variant="default" className="w-full" data-testid={`button-edit-${template.id}`}>
                        Edit Template
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center max-w-md mx-auto space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No templates found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try adjusting your search query or create a new template"
                  : "Get started by creating your first template or using AI to generate one"
                }
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Link href="/designer">
                  <Button data-testid="button-create-first">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </Link>
                <Link href="/ai-generate">
                  <Button variant="outline" data-testid="button-ai-first">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Use AI
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
