# Templify - Universal Report Generator

## Overview

Templify is a professional document template builder and report generation platform that enables users to create customized business documents (quotations, invoices, purchase orders, GST-compliant documents) through a visual drag-and-drop designer or AI-powered template generation. The application provides a canvas-based editor similar to design tools like Figma, with data binding capabilities to generate PDF, Excel, and HTML outputs from dynamic data sources.

The platform targets business users who need to create professional financial documents quickly, competing against outdated enterprise software by offering an intuitive, modern interface with AI assistance for template creation and GST validation features for Indian tax compliance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite for fast development and optimized production builds
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state with aggressive caching (staleTime: Infinity)
- **UI Components:** Radix UI primitives with shadcn/ui design system
- **Styling:** Tailwind CSS with custom design tokens following the "New York" style variant

**Design System:**
The application implements a professional design system inspired by Linear and Figma:
- Typography: Inter (UI/headings) and JetBrains Mono (technical/code elements)
- Spacing: Consistent Tailwind scale (2, 3, 4, 6, 8, 12, 16)
- Canvas-first approach where the report designer is the primary interface
- Progressive disclosure pattern for advanced features

**Key Pages:**
1. **Dashboard** (`/`): Template library with search/filter, quick actions for creating templates
2. **Designer** (`/designer/:id?`): Visual canvas editor with component library sidebar and properties panel
3. **AI Generate** (`/ai-generate`): Conversational interface for AI-powered template creation
4. **Export Preview** (`/export/:id`): Data binding and export format selection (PDF/Excel/HTML)
5. **GST Validator** (`/gst-validator`): Indian tax compliance tools for GSTIN/HSN validation

**Component Architecture:**
- **CanvasEditor**: Handles drag-and-drop positioning, component selection, zoom/grid controls
- **ComponentLibrary**: Categorized library (Text, Data, Media, Layout) with drag-to-add functionality
- **PropertiesPanel**: Tabbed interface (Style, Data, Settings) for component configuration

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript with ES modules
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Database Driver:** Neon Serverless (PostgreSQL with WebSocket support)
- **Session Management:** express-session with connect-pg-simple for PostgreSQL-backed sessions

**API Structure:**
RESTful endpoints organized by resource:
- `/api/templates` - CRUD operations for templates
- `/api/ai/generate-template` - AI-powered template generation
- `/api/generate-report` - Document generation (PDF/Excel/HTML)
- `/api/validate/gstin` - GST identification number validation
- `/api/validate/hsn` - HSN code validation
- `/api/calculate-gst` - GST tax calculations (IGST/CGST/SGST)

**Data Flow:**
1. Client requests validated with Zod schemas (drizzle-zod integration)
2. Business logic in route handlers
3. Storage layer abstraction (`IStorage` interface) for database operations
4. Response serialization with JSON

### Database Schema

**Core Tables:**

1. **templates**: Stores user-created and pre-built templates
   - `id` (UUID, primary key)
   - `name`, `description`, `category` (quotation/invoice/purchase-order/gst-invoice/custom)
   - `components` (JSONB): Array of canvas component definitions with position, size, style, content
   - `canvasSettings` (JSONB): Canvas dimensions, background, padding (default: A4 size 794x1123px)
   - `isTemplate` (boolean): Distinguishes pre-built from user templates
   - `previewImage`, `createdAt`, `updatedAt`

2. **componentTypes**: Reusable component library
   - Component types: text, table, image, chart, divider, container, dynamic-field
   - `defaultProps` (JSONB): Default configuration for each component type
   - Categorized: text, layout, data, media

3. **templateVersions**: Version control for templates
   - Linked to parent template via `templateId` (cascade delete)
   - Stores complete component snapshot per version
   - `versionNumber`, `notes` for changelog

4. **generatedReports**: Metadata for exported documents
   - Links to source template
   - Tracks format (pdf/excel/html), file URL, generation timestamp
   - Stores sample data used for generation (JSONB)

**Design Decisions:**
- **JSONB for flexibility**: Component definitions stored as JSON to support dynamic schemas without migrations for new component properties
- **Neon Serverless**: Chosen for PostgreSQL compatibility with WebSocket support (low-latency connections) and serverless deployment model
- **UUID primary keys**: Enable distributed generation and avoid sequential ID exposure
- **Cascade deletes**: Automatic cleanup of template versions when parent template deleted

### Component Data Model

Components are stored as JSON objects with this structure:
```typescript
{
  id: string,
  type: "text" | "table" | "image" | "dynamic-field" | "divider" | "container",
  position: { x: number, y: number },
  size: { width: number, height: number },
  style: {
    fontSize?, fontFamily?, fontWeight?, color?,
    textAlign?, padding?
  },
  content?: string,              // For static text
  dataBinding?: string,          // For dynamic fields: "{{field.path}}"
  imageUrl?: string,             // For images
  tableConfig?: {                // For tables
    columns: Array<{ header, dataKey, width }>,
    dataSource: string
  }
}
```

## External Dependencies

### Third-Party Services

**OpenAI API:**
- **Purpose:** AI-powered template generation from natural language prompts
- **Model:** GPT-5 (as of August 2025 per code comments)
- **Integration:** Template structure generation with positioned components, GST validation logic
- **Configuration:** API key via `OPENAI_API_KEY` environment variable

**Neon Database:**
- **Purpose:** Managed PostgreSQL database with serverless architecture
- **Configuration:** Connection via `DATABASE_URL` environment variable
- **Features:** WebSocket support for low-latency queries, automatic scaling

### UI Component Libraries

**Radix UI:** Unstyled, accessible component primitives
- 25+ components imported: Dialog, Dropdown, Popover, Select, Tabs, Toast, etc.
- Provides keyboard navigation, ARIA attributes, focus management

**shadcn/ui:** Pre-styled Radix components following "New York" design system
- Custom configuration in `components.json`
- Tailwind-based styling with CSS variables for theming
- Path aliases: `@/components`, `@/lib`, `@/hooks`

### Development Tools

**Drizzle Kit:** Database migration and schema management
- Schema defined in `shared/schema.ts`
- Migration output to `./migrations` directory
- Command: `npm run db:push` for schema synchronization

**TypeScript:** Strict mode enabled with path aliases
- Shared types between client/server via `@shared/*`
- No emit mode (handled by Vite/esbuild)

**Vite Plugins (Development Only):**
- `@replit/vite-plugin-runtime-error-modal`: Error overlay
- `@replit/vite-plugin-cartographer`: Code navigation
- `@replit/vite-plugin-dev-banner`: Development indicator

### PDF Generation Strategy

**Current Implementation:**
- HTML generation from template components
- Simple positioning with absolute CSS
- Dynamic data binding resolution via path traversal

**Production Recommendation (noted in code):**
- Puppeteer for HTML-to-PDF conversion
- WeasyPrint as alternative for server-side rendering
- Excel generation via libraries like ExcelJS (referenced but not implemented)

### Fonts

**Google Fonts:**
- Inter: Primary UI font (variable weight 100-900)
- JetBrains Mono: Monospace for code/technical elements
- Loaded via `<link>` in HTML head with preconnect optimization

### Build & Deployment

**Build Process:**
- Frontend: Vite builds to `dist/public`
- Backend: esbuild bundles server to `dist/index.js` (ESM format, external packages)
- Single production command: `npm start` runs bundled server

**Environment Variables Required:**
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `OPENAI_API_KEY`: OpenAI API authentication
- `NODE_ENV`: production/development mode switch