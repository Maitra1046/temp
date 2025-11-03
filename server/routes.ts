import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTemplateFromPrompt, validateGSTIN, validateHSNCode, calculateGST } from "./ai";
import { generatePDF, generateExcel, generateHTML } from "./pdf";
import { 
  insertTemplateSchema, 
  aiTemplateRequestSchema, 
  pdfGenerationRequestSchema,
  sampleDataUploadSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ============ Template Routes ============
  
  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single template
  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create template
  app.post("/api/templates", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update template
  app.patch("/api/templates/:id", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.partial().parse(req.body);
      const template = await storage.updateTemplate(req.params.id, validatedData);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete template
  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ AI Template Generation ============
  
  app.post("/api/ai/generate-template", async (req, res) => {
    try {
      const validatedRequest = aiTemplateRequestSchema.parse(req.body);
      
      // Generate template using AI
      const generatedTemplate = await generateTemplateFromPrompt(validatedRequest);
      
      // Save the generated template
      const template = await storage.createTemplate({
        name: generatedTemplate.name,
        description: generatedTemplate.description,
        category: generatedTemplate.category,
        components: generatedTemplate.components,
        canvasSettings: { width: 794, height: 1123, unit: 'px' },
      });
      
      res.status(201).json({
        templateId: template.id,
        template: template,
        message: `I've created a "${generatedTemplate.name}" template for you. It includes all the essential components based on your requirements.`,
      });
    } catch (error: any) {
      console.error('AI generation error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate template',
      });
    }
  });

  // ============ PDF/Report Generation ============
  
  app.post("/api/generate-report", async (req, res) => {
    try {
      const validatedRequest = pdfGenerationRequestSchema.parse(req.body);
      
      const template = await storage.getTemplate(validatedRequest.templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      let output: string;
      switch (validatedRequest.format) {
        case 'pdf':
          output = await generatePDF(template, validatedRequest.data);
          break;
        case 'excel':
          output = await generateExcel(template, validatedRequest.data);
          break;
        case 'html':
          output = await generateHTML(template, validatedRequest.data);
          break;
        default:
          return res.status(400).json({ error: "Invalid format" });
      }

      // Save generated report metadata
      const report = await storage.createGeneratedReport({
        templateId: template.id,
        fileName: `${template.name}-${Date.now()}.${validatedRequest.format}`,
        format: validatedRequest.format,
        data: validatedRequest.data,
      });

      res.json({
        reportId: report.id,
        content: output,
        fileName: report.fileName,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ GST Validation ============
  
  app.post("/api/validate/gstin", async (req, res) => {
    try {
      const { gstin } = req.body;
      if (!gstin) {
        return res.status(400).json({ error: "GSTIN is required" });
      }
      
      const isValid = await validateGSTIN(gstin);
      res.json({ valid: isValid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/validate/hsn", async (req, res) => {
    try {
      const { hsn } = req.body;
      if (!hsn) {
        return res.status(400).json({ error: "HSN code is required" });
      }
      
      const isValid = await validateHSNCode(hsn);
      res.json({ valid: isValid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/calculate-gst", async (req, res) => {
    try {
      const { amount, gstRate, type } = req.body;
      
      if (!amount || !gstRate || !type) {
        return res.status(400).json({ error: "Amount, GST rate, and type are required" });
      }
      
      const calculation = calculateGST(
        parseFloat(amount),
        parseFloat(gstRate),
        type
      );
      
      res.json(calculation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Sample Data Upload ============
  
  app.post("/api/upload-sample-data", async (req, res) => {
    try {
      const validatedData = sampleDataUploadSchema.parse(req.body);
      
      let parsedData: any;
      if (validatedData.format === 'json') {
        parsedData = JSON.parse(validatedData.content);
      } else {
        // Simple CSV parsing for MVP
        const lines = validatedData.content.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        parsedData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, idx) => {
            obj[header] = values[idx] || '';
            return obj;
          }, {} as Record<string, string>);
        });
      }
      
      res.json({ 
        success: true, 
        data: parsedData,
        message: `Parsed ${Array.isArray(parsedData) ? parsedData.length : 1} record(s)`,
      });
    } catch (error: any) {
      res.status(400).json({ error: `Failed to parse data: ${error.message}` });
    }
  });

  // ============ Template Versions ============
  
  app.get("/api/templates/:id/versions", async (req, res) => {
    try {
      const versions = await storage.getTemplateVersions(req.params.id);
      res.json(versions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/templates/:id/versions", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const existingVersions = await storage.getTemplateVersions(req.params.id);
      const versionNumber = existingVersions.length + 1;

      const version = await storage.createTemplateVersion({
        templateId: req.params.id,
        versionNumber,
        components: template.components,
        canvasSettings: template.canvasSettings,
        notes: req.body.notes,
      });

      res.status(201).json(version);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Generated Reports History ============
  
  app.get("/api/templates/:id/reports", async (req, res) => {
    try {
      const reports = await storage.getGeneratedReports(req.params.id);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
