import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Send, Loader2, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  templateId?: string;
}

export default function AIGenerate() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI template assistant. I can help you create professional report templates. Tell me what kind of document you need, and I'll generate a compliant template structure for you.\n\nFor example:\n• \"Create a GST B2B invoice for interstate sale with IGST\"\n• \"Generate a professional quotation template for my consulting business\"\n• \"Build a purchase order form with vendor details and item table\""
    }
  ]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState<string>("custom");

  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return apiRequest('POST', '/api/ai/generate-template', {
        prompt,
        category: category !== 'custom' ? category : undefined,
      });
    },
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || "I've created a template based on your requirements. You can now edit it in the designer or generate a PDF with your data.",
        templateId: data.templateId
      }]);
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Template generated",
        description: "Your AI-generated template is ready!",
      });
    },
    onError: (error: any) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Failed to generate template'}. Please try again with a different description.`
      }]);
      toast({
        title: "Error",
        description: "Failed to generate template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput("");
    generateMutation.mutate(userMessage);
  };

  const suggestedPrompts = [
    "Create a GST B2B invoice for interstate sale",
    "Generate a professional quotation template",
    "Build a purchase order with approval workflow",
    "Create a sales receipt with payment details",
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold" data-testid="text-ai-title">AI Template Generator</h1>
              <p className="text-xs text-muted-foreground">Powered by GPT-5</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground">Category:</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48" data-testid="select-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="quotation">Quotation</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="purchase-order">Purchase Order</SelectItem>
              <SelectItem value="gst-invoice">GST Invoice</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${message.role}-${index}`}
                >
                  {message.role === 'assistant' && (
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <Card className={message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}>
                      <CardContent className="p-4">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                        {message.templateId && (
                          <div className="mt-4 pt-4 border-t flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/designer/${message.templateId}`)}
                              data-testid={`button-edit-template-${index}`}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Edit in Designer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate('/')}
                              data-testid={`button-view-all-${index}`}
                            >
                              View All Templates
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {message.role === 'user' && (
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        U
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {generateMutation.isPending && (
                <div className="flex gap-4 justify-start">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Generating your template...
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-card/50 p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(prompt)}
                      className="text-xs"
                      data-testid={`button-suggestion-${index}`}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Describe the template you need... (e.g., 'Create a GST B2B invoice for interstate sale with IGST')"
                  className="resize-none min-h-[80px]"
                  disabled={generateMutation.isPending}
                  data-testid="textarea-prompt"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || generateMutation.isPending}
                  className="h-20 px-6"
                  data-testid="button-send"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar - Info */}
        <aside className="w-80 border-l bg-card/50 p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">How it works</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Describe your needs</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tell me what kind of report or document you need
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">AI generates template</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    I'll create a compliant structure with all required fields
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Customize & use</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Edit in the designer or generate PDFs right away
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">Compliance validation (GST, TDS formats)</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">Smart field mapping suggestions</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">Professional layout optimization</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">Multi-format export ready</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-primary">Pro Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Be specific about your requirements. Mention things like "interstate sale", "B2B transaction", "IGST", "vendor approval workflow" for better results.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
