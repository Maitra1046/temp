import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Template schema - stores report templates created by users
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'quotation', 'invoice', 'purchase-order', 'gst-invoice', 'custom'
  components: jsonb("components").notNull().default('[]'), // Array of component definitions
  canvasSettings: jsonb("canvas_settings").notNull().default('{"width": 794, "height": 1123, "unit": "px"}'), // A4 default
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isTemplate: boolean("is_template").default(false).notNull(), // true for pre-built templates
  previewImage: text("preview_image"),
});

// Component library - reusable components for templates
export const componentTypes = pgTable("component_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'text', 'table', 'image', 'chart', 'divider', 'container', 'dynamic-field'
  icon: text("icon").notNull(),
  defaultProps: jsonb("default_props").notNull().default('{}'),
  category: text("category").notNull(), // 'text', 'layout', 'data', 'media'
});

// Template versions for version control
export const templateVersions = pgTable("template_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => templates.id, { onDelete: 'cascade' }),
  versionNumber: integer("version_number").notNull(),
  components: jsonb("components").notNull(),
  canvasSettings: jsonb("canvas_settings").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  notes: text("notes"),
});

// Generated reports - stores metadata for generated PDFs
export const generatedReports = pgTable("generated_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => templates.id),
  fileName: text("file_name").notNull(),
  format: text("format").notNull(), // 'pdf', 'excel', 'html'
  fileUrl: text("file_url"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  data: jsonb("data"), // Sample data used for generation
});

// Insert schemas with validation
export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComponentTypeSchema = createInsertSchema(componentTypes).omit({
  id: true,
});

export const insertTemplateVersionSchema = createInsertSchema(templateVersions).omit({
  id: true,
  createdAt: true,
});

export const insertGeneratedReportSchema = createInsertSchema(generatedReports).omit({
  id: true,
  generatedAt: true,
});

// AI template generation request schema
export const aiTemplateRequestSchema = z.object({
  prompt: z.string().min(10, "Please provide a more detailed description"),
  category: z.enum(['quotation', 'invoice', 'purchase-order', 'gst-invoice', 'custom']).optional(),
  additionalContext: z.string().optional(),
});

// PDF generation request schema
export const pdfGenerationRequestSchema = z.object({
  templateId: z.string().uuid(),
  data: z.record(z.any()),
  format: z.enum(['pdf', 'excel', 'html']).default('pdf'),
});

// Sample data upload schema
export const sampleDataUploadSchema = z.object({
  format: z.enum(['json', 'csv']),
  content: z.string(),
});

// Type exports
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type ComponentType = typeof componentTypes.$inferSelect;
export type InsertComponentType = z.infer<typeof insertComponentTypeSchema>;

export type TemplateVersion = typeof templateVersions.$inferSelect;
export type InsertTemplateVersion = z.infer<typeof insertTemplateVersionSchema>;

export type GeneratedReport = typeof generatedReports.$inferSelect;
export type InsertGeneratedReport = z.infer<typeof insertGeneratedReportSchema>;

export type AITemplateRequest = z.infer<typeof aiTemplateRequestSchema>;
export type PDFGenerationRequest = z.infer<typeof pdfGenerationRequestSchema>;
export type SampleDataUpload = z.infer<typeof sampleDataUploadSchema>;

// Component definition interface for canvas
export interface CanvasComponent {
  id: string;
  type: 'text' | 'table' | 'image' | 'chart' | 'divider' | 'container' | 'dynamic-field';
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    padding?: number;
    margin?: number;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
  };
  content?: string;
  dataBinding?: string; // e.g., "{{customer.name}}" or "{{order.total}}"
  tableConfig?: {
    columns: Array<{ header: string; dataKey: string; width?: number }>;
    rowHeight?: number;
  };
  imageUrl?: string;
  children?: string[]; // IDs of child components for containers
}

// Canvas settings interface
export interface CanvasSettings {
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'in';
  backgroundColor?: string;
  padding?: number;
  showGrid?: boolean;
  gridSize?: number;
}
