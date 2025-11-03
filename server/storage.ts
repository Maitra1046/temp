// Reference: javascript_database blueprint
import { templates, componentTypes, templateVersions, generatedReports, type Template, type InsertTemplate, type ComponentType, type InsertComponentType, type TemplateVersion, type InsertTemplateVersion, type GeneratedReport, type InsertGeneratedReport } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface with all CRUD operations
export interface IStorage {
  // Template operations
  getAllTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;

  // Component type operations
  getAllComponentTypes(): Promise<ComponentType[]>;
  getComponentType(id: string): Promise<ComponentType | undefined>;
  createComponentType(componentType: InsertComponentType): Promise<ComponentType>;

  // Template version operations
  getTemplateVersions(templateId: string): Promise<TemplateVersion[]>;
  createTemplateVersion(version: InsertTemplateVersion): Promise<TemplateVersion>;

  // Generated report operations
  getGeneratedReports(templateId: string): Promise<GeneratedReport[]>;
  createGeneratedReport(report: InsertGeneratedReport): Promise<GeneratedReport>;
}

export class DatabaseStorage implements IStorage {
  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<Template | undefined> {
    const [template] = await db
      .update(templates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return template || undefined;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await db.delete(templates).where(eq(templates.id, id));
    return true;
  }

  async getAllComponentTypes(): Promise<ComponentType[]> {
    return await db.select().from(componentTypes);
  }

  async getComponentType(id: string): Promise<ComponentType | undefined> {
    const [componentType] = await db.select().from(componentTypes).where(eq(componentTypes.id, id));
    return componentType || undefined;
  }

  async createComponentType(insertComponentType: InsertComponentType): Promise<ComponentType> {
    const [componentType] = await db
      .insert(componentTypes)
      .values(insertComponentType)
      .returning();
    return componentType;
  }

  async getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
    return await db.select().from(templateVersions).where(eq(templateVersions.templateId, templateId));
  }

  async createTemplateVersion(insertVersion: InsertTemplateVersion): Promise<TemplateVersion> {
    const [version] = await db
      .insert(templateVersions)
      .values(insertVersion)
      .returning();
    return version;
  }

  async getGeneratedReports(templateId: string): Promise<GeneratedReport[]> {
    return await db.select().from(generatedReports).where(eq(generatedReports.templateId, templateId));
  }

  async createGeneratedReport(insertReport: InsertGeneratedReport): Promise<GeneratedReport> {
    const [report] = await db
      .insert(generatedReports)
      .values(insertReport)
      .returning();
    return report;
  }
}

export const storage = new DatabaseStorage();
