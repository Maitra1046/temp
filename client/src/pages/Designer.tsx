import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Save, Download, Eye, Undo, Redo, ZoomIn, ZoomOut, Grid3x3,
  Type, Table2, Image as ImageIcon, BarChart3, Minus, Box, Braces, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { CanvasEditor } from "@/components/CanvasEditor";
import { ComponentLibrary } from "@/components/ComponentLibrary";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import type { Template, CanvasComponent } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Designer() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [selectedComponent, setSelectedComponent] = useState<CanvasComponent | null>(null);
  const [components, setComponents] = useState<CanvasComponent[]>([]);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [canvasSettings, setCanvasSettings] = useState({
    width: 794,
    height: 1123,
    unit: 'px' as const,
    backgroundColor: '#ffffff',
    padding: 40
  });

  // Load template if editing existing one
  const { data: template } = useQuery<Template>({
    queryKey: ['/api/templates', id],
    enabled: !!id,
  });

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setComponents(template.components as CanvasComponent[]);
      setCanvasSettings(template.canvasSettings as any);
    }
  }, [template]);

  // Save template mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        name: templateName,
        category: 'custom',
        components: components,
        canvasSettings: canvasSettings,
      };
      
      if (id) {
        return apiRequest('PATCH', `/api/templates/${id}`, data);
      } else {
        return apiRequest('POST', '/api/templates', data);
      }
    },
    onSuccess: (data: any) => {
      toast({
        title: "Template saved",
        description: "Your template has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      if (!id && data.id) {
        navigate(`/designer/${data.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddComponent = useCallback((type: CanvasComponent['type']) => {
    const newComponent: CanvasComponent = {
      id: `component-${Date.now()}`,
      type,
      position: { x: 50, y: 50 },
      size: { width: 200, height: type === 'divider' ? 2 : type === 'table' ? 400 : 100 },
      style: {
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left',
        padding: 8,
      },
      content: type === 'text' ? 'Double-click to edit' : undefined,
      dataBinding: type === 'dynamic-field' ? '{{field.name}}' : undefined,
      tableConfig: type === 'table' ? {
        columns: [
          { header: 'Item', dataKey: 'item', width: 200 },
          { header: 'Quantity', dataKey: 'quantity', width: 100 },
          { header: 'Price', dataKey: 'price', width: 100 },
        ],
        rowHeight: 40,
      } : undefined,
    };
    
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent);
  }, []);

  const handleUpdateComponent = useCallback((id: string, updates: Partial<CanvasComponent>) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (selectedComponent?.id === id) {
      setSelectedComponent(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedComponent]);

  const handleDeleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b flex items-center justify-between px-4 gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            data-testid="button-home"
          >
            <Home className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-80 text-lg font-medium border-0 focus-visible:ring-0 px-2"
            placeholder="Template name"
            data-testid="input-template-name"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled data-testid="button-undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled data-testid="button-redo">
            <Redo className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => id && navigate(`/export/${id}`)}
            disabled={!id}
            data-testid="button-preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => id && navigate(`/export/${id}`)}
            disabled={!id}
            data-testid="button-export"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            className="gap-2" 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid="button-save"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Library */}
        <aside className="w-64 border-r bg-card/50 flex flex-col shrink-0">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">Components</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Drag to add to canvas
            </p>
          </div>
          <ComponentLibrary onAddComponent={handleAddComponent} />
        </aside>

        {/* Center - Canvas Area */}
        <main className="flex-1 bg-muted/30 overflow-auto relative">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-background border rounded-lg p-2 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center" data-testid="text-zoom">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant={showGrid ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowGrid(!showGrid)}
              data-testid="button-toggle-grid"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>

          <CanvasEditor
            components={components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
            zoom={zoom}
            showGrid={showGrid}
            canvasSettings={canvasSettings}
          />
        </main>

        {/* Right Sidebar - Properties Panel */}
        <aside className="w-80 border-l bg-card/50 flex flex-col shrink-0">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">Properties</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedComponent ? 'Edit component' : 'Select a component'}
            </p>
          </div>
          <PropertiesPanel
            component={selectedComponent}
            onUpdate={(updates) => {
              if (selectedComponent) {
                handleUpdateComponent(selectedComponent.id, updates);
              }
            }}
          />
        </aside>
      </div>
    </div>
  );
}
