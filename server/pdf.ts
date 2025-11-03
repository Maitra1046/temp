import type { Template, CanvasComponent } from "@shared/schema";

// Simple HTML-based PDF generation
// In production, this would use libraries like Puppeteer or WeasyPrint
export async function generatePDF(template: Template, data: Record<string, any>): Promise<string> {
  const html = generateHTMLFromTemplate(template, data);
  
  // For MVP, we'll return the HTML
  // In production, convert this to PDF using Puppeteer
  return html;
}

function generateHTMLFromTemplate(template: Template, data: Record<string, any>): string {
  const components = template.components as CanvasComponent[];
  const settings = template.canvasSettings as any;
  
  const componentHTML = components.map(component => {
    const style = `
      position: absolute;
      left: ${component.position.x}px;
      top: ${component.position.y}px;
      width: ${component.size.width}px;
      height: ${component.size.height}px;
      font-size: ${component.style.fontSize || 14}px;
      font-family: ${component.style.fontFamily || 'Inter'};
      font-weight: ${component.style.fontWeight || 'normal'};
      color: ${component.style.color || '#000000'};
      text-align: ${component.style.textAlign || 'left'};
      padding: ${component.style.padding || 0}px;
    `;

    switch (component.type) {
      case 'text':
        return `<div style="${style}">${component.content || ''}</div>`;
      
      case 'dynamic-field':
        const value = resolvePath(data, component.dataBinding || '');
        return `<div style="${style}">${value}</div>`;
      
      case 'table':
        const tableHTML = generateTableHTML(component, data);
        return `<div style="${style}">${tableHTML}</div>`;
      
      case 'image':
        if (component.imageUrl) {
          const imgUrl = component.imageUrl.startsWith('{{') 
            ? resolvePath(data, component.imageUrl)
            : component.imageUrl;
          return `<img src="${imgUrl}" style="${style} object-fit: contain;" />`;
        }
        return '';
      
      case 'divider':
        return `<hr style="${style} border: none; background-color: ${component.style.borderColor || '#e0e0e0'};" />`;
      
      default:
        return '';
    }
  }).join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Inter, Arial, sans-serif;
        }
        .canvas {
          position: relative;
          width: ${settings.width || 794}px;
          height: ${settings.height || 1123}px;
          background-color: ${settings.backgroundColor || '#ffffff'};
          margin: 0 auto;
        }
      </style>
    </head>
    <body>
      <div class="canvas">
        ${componentHTML}
      </div>
    </body>
    </html>
  `;
}

function generateTableHTML(component: CanvasComponent, data: Record<string, any>): string {
  if (!component.tableConfig) return '';
  
  const { columns } = component.tableConfig;
  const tableData = data.items || [];
  
  const headerRow = columns.map(col => 
    `<th style="padding: 8px; text-align: left; border-bottom: 2px solid #e0e0e0; font-weight: 600;">${col.header}</th>`
  ).join('');
  
  const dataRows = tableData.map((row: any) => {
    const cells = columns.map(col => 
      `<td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${row[col.dataKey] || ''}</td>`
    ).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  return `
    <table style="width: 100%; border-collapse: collapse;">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${dataRows}</tbody>
    </table>
  `;
}

function resolvePath(obj: any, path: string): string {
  // Remove {{ }} if present
  const cleanPath = path.replace(/{{|}}/g, '').trim();
  
  try {
    const value = cleanPath.split('.').reduce((acc, part) => acc?.[part], obj);
    return value !== undefined ? String(value) : '';
  } catch {
    return '';
  }
}

export async function generateExcel(template: Template, data: Record<string, any>): Promise<string> {
  // Placeholder for Excel generation
  // In production, use libraries like ExcelJS
  return 'Excel generation not yet implemented';
}

export async function generateHTML(template: Template, data: Record<string, any>): Promise<string> {
  return generateHTMLFromTemplate(template, data);
}
