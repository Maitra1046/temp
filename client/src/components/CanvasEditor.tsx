import { useEffect, useRef } from "react";
import type { CanvasComponent, CanvasSettings } from "@shared/schema";

interface CanvasEditorProps {
  components: CanvasComponent[];
  selectedComponent: CanvasComponent | null;
  onSelectComponent: (component: CanvasComponent | null) => void;
  onUpdateComponent: (id: string, updates: Partial<CanvasComponent>) => void;
  onDeleteComponent: (id: string) => void;
  zoom: number;
  showGrid: boolean;
  canvasSettings: CanvasSettings;
}

export function CanvasEditor({
  components,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  zoom,
  showGrid,
  canvasSettings,
}: CanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; componentId: string } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, component: CanvasComponent) => {
    e.stopPropagation();
    onSelectComponent(component);
    
    if (e.button === 0) { // Left click
      dragStartRef.current = {
        x: e.clientX - component.position.x,
        y: e.clientY - component.position.y,
        componentId: component.id,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current) return;

    const component = components.find(c => c.id === dragStartRef.current!.componentId);
    if (!component) return;

    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;

    onUpdateComponent(component.id, {
      position: {
        x: Math.max(0, Math.min(canvasSettings.width - component.size.width, newX)),
        y: Math.max(0, Math.min(canvasSettings.height - component.size.height, newY)),
      },
    });
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [components, canvasSettings]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedComponent) {
      onDeleteComponent(selectedComponent.id);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent]);

  const renderComponent = (component: CanvasComponent) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: component.position.x,
      top: component.position.y,
      width: component.size.width,
      height: component.size.height,
      ...component.style,
      cursor: 'move',
      border: selectedComponent?.id === component.id 
        ? '2px dashed hsl(var(--primary))' 
        : '1px solid transparent',
      boxShadow: selectedComponent?.id === component.id 
        ? '0 0 0 1px hsl(var(--primary) / 0.2)' 
        : 'none',
    };

    switch (component.type) {
      case 'text':
        return (
          <div
            key={component.id}
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, component)}
            className="hover:border-primary/50"
            data-testid={`component-${component.id}`}
          >
            <div style={{ 
              fontSize: component.style.fontSize,
              fontFamily: component.style.fontFamily,
              fontWeight: component.style.fontWeight,
              color: component.style.color,
              textAlign: component.style.textAlign,
              padding: component.style.padding,
            }}>
              {component.content || 'Text'}
            </div>
          </div>
        );

      case 'dynamic-field':
        return (
          <div
            key={component.id}
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, component)}
            className="hover:border-primary/50 bg-primary/5"
            data-testid={`component-${component.id}`}
          >
            <div style={{ 
              fontSize: component.style.fontSize,
              fontFamily: component.style.fontFamily,
              fontWeight: component.style.fontWeight,
              color: component.style.color,
              textAlign: component.style.textAlign,
              padding: component.style.padding,
            }}>
              <code className="text-primary font-mono text-sm">
                {component.dataBinding || '{{field}}'}
              </code>
            </div>
          </div>
        );

      case 'table':
        return (
          <div
            key={component.id}
            style={{ ...baseStyle, overflow: 'auto' }}
            onMouseDown={(e) => handleMouseDown(e, component)}
            className="hover:border-primary/50"
            data-testid={`component-${component.id}`}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'hsl(var(--muted))', height: 40 }}>
                  {component.tableConfig?.columns.map((col, idx) => (
                    <th key={idx} style={{ 
                      padding: 8, 
                      textAlign: 'left',
                      borderBottom: '2px solid hsl(var(--border))',
                      fontSize: 14,
                      fontWeight: 600,
                    }}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ height: component.tableConfig?.rowHeight || 40 }}>
                  {component.tableConfig?.columns.map((col, idx) => (
                    <td key={idx} style={{ 
                      padding: 8,
                      borderBottom: '1px solid hsl(var(--border))',
                      fontSize: 14,
                    }}>
                      <code className="text-primary font-mono text-xs">
                        {`{{${col.dataKey}}}`}
                      </code>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'image':
        return (
          <div
            key={component.id}
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, component)}
            className="hover:border-primary/50 bg-muted flex items-center justify-center"
            data-testid={`component-${component.id}`}
          >
            {component.imageUrl ? (
              <img src={component.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="text-muted-foreground text-sm">Image placeholder</div>
            )}
          </div>
        );

      case 'divider':
        return (
          <div
            key={component.id}
            style={{ 
              ...baseStyle, 
              height: 2, 
              backgroundColor: component.style.borderColor || 'hsl(var(--border))',
            }}
            onMouseDown={(e) => handleMouseDown(e, component)}
            className="hover:border-primary/50"
            data-testid={`component-${component.id}`}
          />
        );

      case 'container':
        return (
          <div
            key={component.id}
            style={{ ...baseStyle, border: '1px dashed hsl(var(--border))' }}
            onMouseDown={(e) => handleMouseDown(e, component)}
            className="hover:border-primary/50 bg-card/50"
            data-testid={`component-${component.id}`}
          >
            <div className="text-xs text-muted-foreground p-2">Container</div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-8"
      onClick={() => onSelectComponent(null)}
    >
      <div
        ref={canvasRef}
        className="relative bg-white shadow-2xl"
        style={{
          width: canvasSettings.width * (zoom / 100),
          height: canvasSettings.height * (zoom / 100),
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center',
          backgroundColor: canvasSettings.backgroundColor || '#ffffff',
          backgroundImage: showGrid
            ? `repeating-linear-gradient(0deg, transparent, transparent ${canvasSettings.gridSize || 10}px, hsl(var(--border) / 0.1) ${canvasSettings.gridSize || 10}px, hsl(var(--border) / 0.1) ${(canvasSettings.gridSize || 10) + 1}px),
               repeating-linear-gradient(90deg, transparent, transparent ${canvasSettings.gridSize || 10}px, hsl(var(--border) / 0.1) ${canvasSettings.gridSize || 10}px, hsl(var(--border) / 0.1) ${(canvasSettings.gridSize || 10) + 1}px)`
            : 'none',
        }}
        data-testid="canvas-editor"
      >
        {components.map(renderComponent)}
      </div>
    </div>
  );
}
