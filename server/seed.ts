import { db } from "./db";
import { templates } from "@shared/schema";
import type { CanvasComponent } from "@shared/schema";

async function seedPrebuiltTemplates() {
  console.log("Seeding pre-built templates...");

  // Professional Quotation Template
  const quotationComponents: CanvasComponent[] = [
    {
      id: "logo-1",
      type: "image",
      position: { x: 50, y: 50 },
      size: { width: 150, height: 60 },
      style: { padding: 0 },
      imageUrl: "{{company.logo}}",
    },
    {
      id: "title-1",
      type: "text",
      position: { x: 50, y: 130 },
      size: { width: 700, height: 50 },
      style: {
        fontSize: 32,
        fontFamily: "Inter",
        fontWeight: "bold",
        color: "#1a1a1a",
        textAlign: "left",
      },
      content: "QUOTATION",
    },
    {
      id: "customer-section",
      type: "text",
      position: { x: 50, y: 200 },
      size: { width: 300, height: 30 },
      style: {
        fontSize: 14,
        fontFamily: "Inter",
        fontWeight: "600",
        color: "#666666",
      },
      content: "Customer Details",
    },
    {
      id: "customer-name",
      type: "dynamic-field",
      position: { x: 50, y: 240 },
      size: { width: 300, height: 25 },
      style: { fontSize: 16, fontWeight: "normal", color: "#000000" },
      dataBinding: "{{customer.name}}",
    },
    {
      id: "customer-address",
      type: "dynamic-field",
      position: { x: 50, y: 270 },
      size: { width: 300, height: 60 },
      style: { fontSize: 14, color: "#666666" },
      dataBinding: "{{customer.address}}",
    },
    {
      id: "quote-number",
      type: "text",
      position: { x: 500, y: 200 },
      size: { width: 250, height: 25 },
      style: { fontSize: 14, textAlign: "right", color: "#666666" },
      content: "Quote #:",
    },
    {
      id: "quote-number-value",
      type: "dynamic-field",
      position: { x: 500, y: 230 },
      size: { width: 250, height: 25 },
      style: { fontSize: 16, fontWeight: "600", textAlign: "right" },
      dataBinding: "{{quote.number}}",
    },
    {
      id: "items-table",
      type: "table",
      position: { x: 50, y: 360 },
      size: { width: 700, height: 300 },
      style: {},
      tableConfig: {
        columns: [
          { header: "Item Description", dataKey: "description", width: 350 },
          { header: "Quantity", dataKey: "quantity", width: 100 },
          { header: "Rate", dataKey: "rate", width: 125 },
          { header: "Amount", dataKey: "amount", width: 125 },
        ],
        rowHeight: 40,
      },
    },
    {
      id: "subtotal",
      type: "text",
      position: { x: 500, y: 680 },
      size: { width: 150, height: 25 },
      style: { fontSize: 14, textAlign: "right", fontWeight: "600" },
      content: "Subtotal:",
    },
    {
      id: "subtotal-value",
      type: "dynamic-field",
      position: { x: 660, y: 680 },
      size: { width: 90, height: 25 },
      style: { fontSize: 14, textAlign: "right" },
      dataBinding: "{{quote.subtotal}}",
    },
    {
      id: "total",
      type: "text",
      position: { x: 500, y: 720 },
      size: { width: 150, height: 30 },
      style: { fontSize: 18, textAlign: "right", fontWeight: "bold" },
      content: "Total:",
    },
    {
      id: "total-value",
      type: "dynamic-field",
      position: { x: 660, y: 720 },
      size: { width: 90, height: 30 },
      style: { fontSize: 18, textAlign: "right", fontWeight: "bold" },
      dataBinding: "{{quote.total}}",
    },
    {
      id: "footer",
      type: "text",
      position: { x: 50, y: 1000 },
      size: { width: 700, height: 80 },
      style: { fontSize: 11, color: "#999999", textAlign: "center" },
      content: "Thank you for your business!\nQuote valid for 30 days from date of issue.",
    },
  ];

  const prebuiltTemplates = [
    {
      name: "Professional Quotation",
      description: "Clean quotation template for services and products",
      category: "quotation",
      components: quotationComponents,
      canvasSettings: { width: 794, height: 1123, unit: "px" },
      isTemplate: true,
    },
    {
      name: "Standard Invoice",
      description: "Professional invoice template with item details",
      category: "invoice",
      components: [],
      canvasSettings: { width: 794, height: 1123, unit: "px" },
      isTemplate: true,
    },
    {
      name: "Purchase Order",
      description: "Vendor purchase order with approval workflow",
      category: "purchase-order",
      components: [],
      canvasSettings: { width: 794, height: 1123, unit: "px" },
      isTemplate: true,
    },
    {
      name: "GST B2B Invoice",
      description: "GST-compliant invoice for interstate B2B transactions",
      category: "gst-invoice",
      components: [],
      canvasSettings: { width: 794, height: 1123, unit: "px" },
      isTemplate: true,
    },
  ];

  for (const template of prebuiltTemplates) {
    await db.insert(templates).values(template);
    console.log(`  ✓ Created: ${template.name}`);
  }

  console.log("Seeding complete!");
}

seedPrebuiltTemplates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
