import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CanvasComponent } from "@shared/schema";

interface PropertiesPanelProps {
  component: CanvasComponent | null;
  onUpdate: (updates: Partial<CanvasComponent>) => void;
}

export function PropertiesPanel({ component, onUpdate }: PropertiesPanelProps) {
  if (!component) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No component selected</p>
          <p className="text-xs mt-1">Click on a component to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="style" data-testid="tab-style">Style</TabsTrigger>
            <TabsTrigger value="data" data-testid="tab-data">Data</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-4 mt-4">
            {/* Position & Size */}
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3">Position & Size</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X Position</Label>
                    <Input
                      type="number"
                      value={component.position.x}
                      onChange={(e) => onUpdate({
                        position: { ...component.position, x: parseInt(e.target.value) || 0 }
                      })}
                      className="h-8"
                      data-testid="input-position-x"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y Position</Label>
                    <Input
                      type="number"
                      value={component.position.y}
                      onChange={(e) => onUpdate({
                        position: { ...component.position, y: parseInt(e.target.value) || 0 }
                      })}
                      className="h-8"
                      data-testid="input-position-y"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      value={component.size.width}
                      onChange={(e) => onUpdate({
                        size: { ...component.size, width: parseInt(e.target.value) || 0 }
                      })}
                      className="h-8"
                      data-testid="input-size-width"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={component.size.height}
                      onChange={(e) => onUpdate({
                        size: { ...component.size, height: parseInt(e.target.value) || 0 }
                      })}
                      className="h-8"
                      data-testid="input-size-height"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Typography */}
            {(component.type === 'text' || component.type === 'dynamic-field') && (
              <Card className="p-4">
                <h4 className="text-sm font-semibold mb-3">Typography</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Font Family</Label>
                    <Select 
                      value={component.style.fontFamily} 
                      onValueChange={(value) => onUpdate({
                        style: { ...component.style, fontFamily: value }
                      })}
                    >
                      <SelectTrigger className="h-8" data-testid="select-font-family">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Font Size: {component.style.fontSize}px</Label>
                    <Slider
                      value={[component.style.fontSize || 14]}
                      onValueChange={([value]) => onUpdate({
                        style: { ...component.style, fontSize: value }
                      })}
                      min={8}
                      max={72}
                      step={1}
                      className="mt-2"
                      data-testid="slider-font-size"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Font Weight</Label>
                    <Select 
                      value={component.style.fontWeight} 
                      onValueChange={(value) => onUpdate({
                        style: { ...component.style, fontWeight: value }
                      })}
                    >
                      <SelectTrigger className="h-8" data-testid="select-font-weight">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Semibold</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Text Align</Label>
                    <Select 
                      value={component.style.textAlign} 
                      onValueChange={(value: any) => onUpdate({
                        style: { ...component.style, textAlign: value }
                      })}
                    >
                      <SelectTrigger className="h-8" data-testid="select-text-align">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={component.style.color}
                        onChange={(e) => onUpdate({
                          style: { ...component.style, color: e.target.value }
                        })}
                        className="h-8 w-16"
                        data-testid="input-color"
                      />
                      <Input
                        type="text"
                        value={component.style.color}
                        onChange={(e) => onUpdate({
                          style: { ...component.style, color: e.target.value }
                        })}
                        className="h-8 flex-1 font-mono text-xs"
                        data-testid="input-color-text"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Spacing */}
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3">Spacing</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Padding: {component.style.padding || 0}px</Label>
                  <Slider
                    value={[component.style.padding || 0]}
                    onValueChange={([value]) => onUpdate({
                      style: { ...component.style, padding: value }
                    })}
                    min={0}
                    max={48}
                    step={4}
                    className="mt-2"
                    data-testid="slider-padding"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4 mt-4">
            {component.type === 'text' && (
              <Card className="p-4">
                <h4 className="text-sm font-semibold mb-3">Content</h4>
                <Textarea
                  value={component.content || ''}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder="Enter text content..."
                  className="min-h-[120px]"
                  data-testid="textarea-content"
                />
              </Card>
            )}

            {component.type === 'dynamic-field' && (
              <Card className="p-4">
                <h4 className="text-sm font-semibold mb-3">Data Binding</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Field Path</Label>
                    <Input
                      value={component.dataBinding || ''}
                      onChange={(e) => onUpdate({ dataBinding: e.target.value })}
                      placeholder="{{customer.name}}"
                      className="font-mono"
                      data-testid="input-data-binding"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use double curly braces to bind data: {'{{field.name}}'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {component.type === 'table' && component.tableConfig && (
              <Card className="p-4">
                <h4 className="text-sm font-semibold mb-3">Table Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Columns</Label>
                    <div className="space-y-2 mt-2">
                      {component.tableConfig.columns.map((col, idx) => (
                        <div key={idx} className="p-3 border rounded-md space-y-2">
                          <Input
                            value={col.header}
                            onChange={(e) => {
                              const newColumns = [...component.tableConfig!.columns];
                              newColumns[idx] = { ...col, header: e.target.value };
                              onUpdate({
                                tableConfig: { ...component.tableConfig!, columns: newColumns }
                              });
                            }}
                            placeholder="Column Header"
                            className="h-8 text-sm"
                            data-testid={`input-column-header-${idx}`}
                          />
                          <Input
                            value={col.dataKey}
                            onChange={(e) => {
                              const newColumns = [...component.tableConfig!.columns];
                              newColumns[idx] = { ...col, dataKey: e.target.value };
                              onUpdate({
                                tableConfig: { ...component.tableConfig!, columns: newColumns }
                              });
                            }}
                            placeholder="Data Key"
                            className="h-8 text-sm font-mono"
                            data-testid={`input-column-datakey-${idx}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {component.type === 'image' && (
              <Card className="p-4">
                <h4 className="text-sm font-semibold mb-3">Image Source</h4>
                <Input
                  value={component.imageUrl || ''}
                  onChange={(e) => onUpdate({ imageUrl: e.target.value })}
                  placeholder="https://... or {{data.logoUrl}}"
                  className="font-mono text-sm"
                  data-testid="input-image-url"
                />
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3">Component Info</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium capitalize">{component.type.replace('-', ' ')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <span className="ml-2 font-mono text-xs">{component.id}</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
