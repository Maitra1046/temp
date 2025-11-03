import { Type, Table2, Image, BarChart3, Minus, Box, Braces } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { CanvasComponent } from "@shared/schema";

interface ComponentLibraryProps {
  onAddComponent: (type: CanvasComponent['type']) => void;
}

const componentCategories = [
  {
    name: "Text",
    components: [
      { type: 'text' as const, name: 'Text Block', icon: Type, description: 'Static text' },
      { type: 'dynamic-field' as const, name: 'Dynamic Field', icon: Braces, description: 'Data binding' },
    ],
  },
  {
    name: "Data",
    components: [
      { type: 'table' as const, name: 'Table', icon: Table2, description: 'Data table' },
    ],
  },
  {
    name: "Media",
    components: [
      { type: 'image' as const, name: 'Image', icon: Image, description: 'Image/Logo' },
      { type: 'chart' as const, name: 'Chart', icon: BarChart3, description: 'Visualization' },
    ],
  },
  {
    name: "Layout",
    components: [
      { type: 'divider' as const, name: 'Divider', icon: Minus, description: 'Horizontal line' },
      { type: 'container' as const, name: 'Container', icon: Box, description: 'Group items' },
    ],
  },
];

export function ComponentLibrary({ onAddComponent }: ComponentLibraryProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {componentCategories.map((category, categoryIdx) => (
          <div key={category.name}>
            {categoryIdx > 0 && <Separator className="my-4" />}
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {category.name}
            </h4>
            <div className="space-y-2">
              {category.components.map((component) => {
                const Icon = component.icon;
                return (
                  <Card
                    key={component.type}
                    className="p-3 hover-elevate active-elevate-2 cursor-pointer group"
                    onClick={() => onAddComponent(component.type)}
                    data-testid={`component-library-${component.type}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{component.name}</p>
                        <p className="text-xs text-muted-foreground">{component.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
