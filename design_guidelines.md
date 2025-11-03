# FinReport AI / ReportForge - Design Guidelines

## Design Approach

**Selected Approach:** Design System with Creative Tool Inspiration

**Rationale:** This is a professional productivity tool competing against outdated enterprise software. We'll combine the precision of **Linear's** typography and spacing with **Figma's** canvas-based interaction patterns and **Notion's** component organization. The goal is to make complex report generation feel intuitive and modern.

**Core Design Principles:**
1. **Canvas-First Thinking:** The report designer is the hero - everything else supports it
2. **Information Clarity:** Dense functionality organized with clear visual hierarchy
3. **Professional Confidence:** Polish and precision that builds trust for financial documents
4. **Progressive Disclosure:** Advanced features available but not overwhelming

---

## Typography System

**Font Stack:**
- **Primary:** Inter (headings, UI labels, buttons) - Clean, professional, excellent at small sizes
- **Secondary:** JetBrains Mono (code snippets, data field mappings) - For technical elements
- **Canvas Content:** System fonts for report preview to match final output

**Type Scale:**
- **Display (Dashboard Headers):** text-3xl font-semibold (30px)
- **Page Titles:** text-2xl font-semibold (24px)
- **Section Headers:** text-lg font-semibold (18px)
- **Body/Labels:** text-sm font-medium (14px)
- **Metadata/Captions:** text-xs font-normal (12px)
- **Code/Technical:** text-sm font-mono (14px monospace)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 3, 4, 6, 8, 12, 16** consistently

**Common Patterns:**
- Component padding: p-4 or p-6
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-4
- Icon-to-label spacing: gap-2
- Panel margins: m-8 or m-12

**Grid System:**
- Dashboard: 12-column responsive grid
- Template library: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Component panels: Fixed widths (w-80 for sidebars, w-96 for properties)

---

## Application Structure

### Primary Layout (Editor View)

**Three-Panel Design:**
```
┌─────────────────────────────────────────────────────────┐
│  Top Navigation Bar (h-16)                              │
├────────┬────────────────────────────────┬───────────────┤
│ Left   │                                │ Right         │
│ Panel  │   Canvas Area                  │ Properties    │
│ (w-64) │   (flex-1, centered content)   │ Panel (w-80)  │
│        │                                │               │
│ Compo- │   Report Preview               │ Styling &     │
│ nents  │   with zoom controls           │ Data Mapping  │
│ Library│                                │               │
└────────┴────────────────────────────────┴───────────────┘
```

**Top Navigation:**
- Logo/Home: Left-aligned, h-8 w-auto
- Template name input: Center (editable, text-lg)
- Actions: Right-aligned (Preview, Export, Save buttons with gap-3)
- Height: h-16 with border-b

**Left Panel - Component Library:**
- Collapsible sections (Text, Tables, Charts, Media, Layout)
- Each component: Draggable card with icon + label
- Search bar at top (sticky)
- Scrollable content area

**Canvas Area:**
- Centered artboard with shadow and border
- Zoom controls: Bottom-right floating (z-50)
- Rulers: Optional top/left edges
- Grid overlay toggle
- Background: Subtle texture or pattern

**Right Panel - Properties:**
- Context-sensitive (shows selected component properties)
- Tabbed interface: Style, Data, Settings
- Collapsible sections with clear labels
- Live preview of changes

### Dashboard/Home View

**Hero Section:**
- Full-width banner: py-12 px-8
- Headline: text-4xl font-bold
- Subheadline: text-xl with max-w-2xl
- CTA buttons: Primary + Secondary with gap-4
- Stats bar below: 3-4 metric cards (grid-cols-4, text-center)

**Template Gallery:**
- Section header: text-2xl font-semibold mb-8
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Each card:
  - Preview thumbnail (aspect-[3/4])
  - Template name: text-lg font-semibold mt-4
  - Metadata: text-sm (last modified, format tags)
  - Hover actions: Edit, Duplicate, Delete icons

**Recent Activity:**
- Two-column layout (lg:grid-cols-2)
- Left: Recent templates list
- Right: Quick actions + AI chat preview

### AI Chat Interface

**Modal/Slide-over Design:**
- Full-height slide-over from right (w-96 or w-1/3)
- Header: "AI Template Assistant" with close button
- Chat messages: space-y-4 with clear sender identification
- Message bubbles:
  - User: Right-aligned, max-w-[80%]
  - AI: Left-aligned, max-w-[80%]
- Input area: Sticky bottom, h-24
  - Textarea with send button
  - File upload option
  - Suggested prompts (pills layout)

---

## Component Library

### Navigation & Controls

**Top Bar:**
- Logo height: h-8
- Navigation items: px-4 py-2 text-sm
- User menu: Avatar (h-10 w-10 rounded-full) + dropdown

**Sidebar:**
- Width: w-64 fixed
- Section headers: px-4 py-2 text-xs uppercase tracking-wide font-semibold
- Menu items: px-4 py-2 rounded-md with hover state
- Icons: h-5 w-5 with mr-3

### Buttons

**Sizes:**
- Large (CTAs): px-6 py-3 text-base
- Medium (Primary actions): px-4 py-2 text-sm
- Small (Secondary): px-3 py-1.5 text-xs
- Icon-only: p-2 with h-9 w-9

**Variants:**
- Primary: Solid background, font-semibold
- Secondary: Border with transparent background
- Ghost: No border, subtle hover state
- Danger: For destructive actions

### Cards

**Template Card:**
- Border with rounded-lg
- Padding: p-6
- Preview area: aspect-[3/4] with object-cover
- Content area: space-y-3
- Footer: flex justify-between items-center

**Component Draggable Card:**
- Compact: p-3 rounded-md
- Icon + Label: flex items-center gap-2
- Drag handle indicator
- Hover: Slight elevation (shadow-md)

### Forms & Inputs

**Text Input:**
- Height: h-10 for standard, h-12 for large
- Padding: px-4
- Border: rounded-md with focus ring
- Labels: text-sm font-medium mb-2

**Select/Dropdown:**
- Same dimensions as text input
- Custom chevron icon (right-aligned)

**Checkbox/Radio:**
- Size: h-5 w-5
- Label spacing: ml-2

**Color Picker:**
- Preview swatch: h-10 w-10 rounded-md
- Hex input adjacent

**Slider:**
- Height: h-2
- Track width: w-full
- Thumb: h-4 w-4

### Data Display

**Table:**
- Header: bg-subtle with font-semibold text-sm
- Rows: border-b with hover state
- Cell padding: px-4 py-3
- Alternating rows for large tables

**Property Panel Sections:**
- Collapsible header: flex items-center justify-between p-4
- Content: p-4 space-y-4
- Dividers: border-t between sections

### Canvas Elements

**Artboard:**
- Shadow: shadow-2xl
- Border: border-2
- Background: White or custom
- Padding for bleed: p-8
- Max width: Container based on paper size

**Component Handles:**
- Selection box: Dashed border
- Resize handles: Corner/edge circles (h-3 w-3)
- Position: Absolute with z-index layering

**Zoom Controls:**
- Floating toolbar: Fixed bottom-right
- Buttons: Icon-only, compact (gap-1)
- Values: 25%, 50%, 100%, 200%, Fit

### Modals & Overlays

**Modal:**
- Backdrop: bg-black/50
- Container: max-w-2xl rounded-lg p-8
- Header: text-2xl font-semibold mb-6
- Footer: flex justify-end gap-3

**Toast Notifications:**
- Position: Fixed top-right
- Width: w-96
- Padding: p-4
- Auto-dismiss after 5s
- Icon + message + close button

---

## Spacing & Layout Patterns

**Container Widths:**
- Full app: max-w-screen-2xl mx-auto
- Content sections: max-w-6xl mx-auto
- Text content: max-w-prose
- Canvas workspace: Centered with max-w-fit

**Vertical Rhythm:**
- Page sections: py-12 or py-16
- Component spacing: space-y-6 or space-y-8
- Tight grouping: space-y-2 or space-y-3

**Responsive Breakpoints:**
- Mobile-first approach
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px (large desktop)
- 2xl: 1536px (extra large)

---

## Images & Media

**Hero Image:**
- None for this application - it's a dashboard/tool interface

**Template Previews:**
- Thumbnails: aspect-[3/4] with object-cover
- Full preview: Scale to fit canvas with zoom
- Image placeholders: Subtle pattern or icon

**Icons:**
- Primary library: Heroicons (outline for UI, solid for emphasis)
- Size: h-5 w-5 standard, h-6 w-6 for emphasis
- Consistent stroke-width throughout

**Illustrations:**
- Empty states: Centered illustrations (max-w-xs)
- Onboarding: Feature explanations with visual aids
- Style: Line-art, minimal, professional

---

## Accessibility & Interaction

**Focus States:**
- Visible ring on all interactive elements
- ring-2 with offset for clarity
- Skip to main content link

**Hover States:**
- Subtle background change
- Cursor: pointer for clickable elements
- Transition: transition-colors duration-150

**Loading States:**
- Skeleton loaders matching component structure
- Spinners: h-6 w-6 centered
- Progress bars for long operations

**Error States:**
- Inline validation messages (text-sm)
- Border highlight on invalid inputs
- Clear error icons (h-5 w-5)

---

## Animations

**Minimal and Purposeful:**
- Page transitions: None (instant navigation)
- Modal entry: Fade in backdrop + slide up content (duration-200)
- Dropdown menus: Fade + slight translate (duration-150)
- Drag feedback: Opacity change + cursor indication
- Save success: Brief checkmark animation
- NO scroll animations, parallax, or decorative effects

**Critical Rule:** Animations only for user-triggered actions, never automatic/looping