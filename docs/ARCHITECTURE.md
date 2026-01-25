# Architecture Documentation

This document describes the architecture, design decisions, and technical implementation of the Budgeting App.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Patterns](#architecture-patterns)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Deployment Architectures](#deployment-architectures)
- [Security Architecture](#security-architecture)
- [Performance Considerations](#performance-considerations)
- [Design Decisions](#design-decisions)

## System Overview

The Budgeting App is a client-side financial planning application that calculates take-home pay after taxes and expenses. It's designed to be deployed in multiple environments (web, desktop, edge) with a focus on simplicity, accuracy, and user privacy.

### Core Principles

1. **Client-Side First**: All calculations happen in the browser for privacy and performance
2. **Static Assets**: No database or server-side computation required
3. **Multi-Platform**: Single codebase for web, desktop, and edge deployments
4. **Data Privacy**: No user data leaves the device (localStorage only)
5. **Accuracy**: Based on official IRS and state tax data
6. **Maintainability**: Easy to update with new tax data annually

## Architecture Patterns

### 1. Single Page Application (SPA)

**Pattern**: All functionality in a single HTML page with dynamic updates

**Benefits**:
- Fast user experience (no page reloads)
- Simple deployment
- Easy to maintain
- No routing complexity

**Implementation**:
- `index.html`: Single entry point
- `app.js`: All application logic
- `taxBrackets.js`: Static data store
- Dynamic DOM manipulation for interactions

### 2. Client-Side MVC Pattern

```
Model (Data)          Controller (Logic)      View (UI)
┌─────────────┐      ┌──────────────┐       ┌──────────┐
│ taxData     │◄─────┤ app.js       │──────►│index.html│
│ localStorage│      │ calculateTax │       │ Bootstrap│
│ taxBrackets │      │ validateInput│       │ Forms    │
└─────────────┘      └──────────────┘       └──────────┘
```

**Components**:
- **Model**: Tax data (`taxBrackets.js`), user data (localStorage)
- **Controller**: Calculation logic, validation, data management (`app.js`)
- **View**: HTML structure, Bootstrap styling (`index.html`)

### 3. Progressive Enhancement

**Strategy**: Core functionality works without JavaScript, enhanced with JS

**Levels**:
1. **Base**: HTML structure and content
2. **Enhanced**: CSS styling with Bootstrap
3. **Interactive**: JavaScript calculations and persistence

## Component Architecture

### Frontend Components

```
┌─────────────────────────────────────────────┐
│           index.html (UI Layer)             │
│  ┌────────┐ ┌────────┐ ┌─────────────────┐ │
│  │ Income │ │ Taxes  │ │ Expenses        │ │
│  │ Form   │ │ Config │ │ Tracking        │ │
│  └────────┘ └────────┘ └─────────────────┘ │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│        app.js (Business Logic Layer)        │
│  ┌──────────────┐  ┌──────────────────────┐│
│  │ Calculation  │  │ Data Management      ││
│  │ Engine       │  │ (Save/Load/Export)   ││
│  └──────────────┘  └──────────────────────┘│
│  ┌──────────────┐  ┌──────────────────────┐│
│  │ Validation   │  │ UI Updates           ││
│  │ System       │  │ (Toast, Results)     ││
│  └──────────────┘  └──────────────────────┘│
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│       taxBrackets.js (Data Layer)           │
│  ┌──────────────────────────────────────┐  │
│  │ Federal Brackets | FICA | Standard   │  │
│  │ State Brackets   | Deductions        │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Module Breakdown

#### 1. **app.js** - Core Application Logic

**Responsibilities**:
- Tax calculations (federal, state, FICA)
- Input validation
- Data persistence (localStorage)
- Excel export
- UI updates and event handling

**Key Functions**:
```javascript
calculateTakeHomeSalary()  // Main calculation orchestrator
calculateTax()             // Progressive tax calculation
calculateFICA()            // FICA tax calculation
validateFinancialInput()   // Input validation
saveData() / loadData()    // Persistence
exportToExcel()            // Export functionality
```

#### 2. **taxBrackets.js** - Tax Data Store

**Responsibilities**:
- Store all tax bracket data
- Federal tax brackets for all filing statuses
- State tax brackets for all states
- FICA rates and limits
- Standard deductions

**Structure**:
```javascript
taxData = {
  lastUpdated: "date",
  years: {
    2026: {
      federalBrackets: {...},
      standardDeduction: {...},
      fica: {...},
      stateBrackets: {...}
    }
  }
}
```

#### 3. **errorHandler.js** - Error Management

**Responsibilities**:
- Centralized error code definitions
- Toast notification system
- User-friendly error messages

**Features**:
- Error code mapping
- Consistent error display
- Success notifications

#### 4. **index.html** - User Interface

**Responsibilities**:
- Form structure
- Result display
- Bootstrap layout
- Accessibility

**Sections**:
- Income information form
- Tax configuration selectors
- Fixed expenses inputs
- Dynamic expense management
- Results display
- Action buttons

## Data Flow

### 1. User Input Flow

```
User Input → Validation → Calculation → Display Results
    │            │             │              │
    └────────────┴─────────────┴──────────────┴─→ localStorage
```

**Steps**:
1. User enters income, deductions, expenses
2. Input validation on each field
3. Click "Calculate" button
4. Retrieve tax data for selected year/status
5. Calculate federal tax
6. Calculate state tax
7. Calculate FICA
8. Sum expenses
9. Compute take-home pay
10. Display results
11. Auto-save to localStorage

### 2. Tax Calculation Flow

```
Annual Salary
      │
      ▼
Apply Pre-tax Deductions (401k, HSA)
      │
      ▼
Taxable Income
      │
      ├─→ Federal Tax (Progressive)
      │
      ├─→ State Tax (Progressive/Flat)
      │
      └─→ FICA (Social Security + Medicare)
            │
            ▼
      Total Tax
            │
            ▼
After-Tax Income
            │
            ▼
Subtract Expenses (Monthly × 12)
            │
            ▼
Annual Surplus/Deficit
            │
            ▼
Monthly Take-Home
```

### 3. Data Persistence Flow

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌─────────────┐
│ Save to      │────►│ localStorage│
│ localStorage │     │  "financial-│
└──────────────┘     │  Data"      │
                     └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ Page Reload │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ Load from   │
                     │ localStorage│
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ Populate    │
                     │ Form Fields │
                     └─────────────┘
```

## Technology Stack

### Frontend Technologies

#### Core
- **HTML5**: Semantic markup, form inputs
- **CSS3**: Custom styling, animations
- **JavaScript (ES6+)**: Application logic
  - Arrow functions
  - Template literals
  - Destructuring
  - Array methods (map, filter, reduce)
  - Async/await (for export)

#### Frameworks & Libraries
- **Bootstrap 5.3**: 
  - Responsive grid system
  - Form components
  - Toast notifications
  - Utility classes
- **ExcelJS**: Excel file generation

### Backend/Runtime Technologies

#### Web Server
- **Express.js**: Simple static file server
- **Node.js**: Runtime environment

#### Desktop
- **Electron**: Desktop application framework
  - Main process (main.js)
  - Renderer process (browser)
  - Preload scripts (security)

#### Edge Computing
- **Cloudflare Workers**: Edge runtime
- **@cloudflare/kv-asset-handler**: Static asset serving

#### Containerization
- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration

### Development Tools

- **npm**: Package management
- **electron-builder**: Desktop app packaging
- **Wrangler**: Cloudflare Workers CLI
- **Git**: Version control

## Deployment Architectures

### 1. Express Web Server

```
┌─────────┐      HTTP      ┌─────────────┐
│ Browser │ ◄──────────► │ Express     │
│         │              │ Server      │
└─────────┘              │ :3000       │
                         └──────┬──────┘
                                │
                                ▼
                         ┌─────────────┐
                         │ Static      │
                         │ Files       │
                         │ (public/)   │
                         └─────────────┘
```

**Pros**: Simple, easy to deploy, full control
**Cons**: Requires server maintenance, not globally distributed

### 2. Cloudflare Workers (Edge)

```
┌─────────┐              ┌──────────────────┐
│ Browser │ ◄─────────► │ CF Edge Network  │
│ (Global)│              │ (Global)         │
└─────────┘              │ ┌──────────────┐ │
                         │ │ Worker       │ │
                         │ │ (src/worker) │ │
                         │ └──────┬───────┘ │
                         │        │         │
                         │        ▼         │
                         │ ┌──────────────┐ │
                         │ │ Static Files │ │
                         │ │ (KV Storage) │ │
                         │ └──────────────┘ │
                         └──────────────────┘
```

**Pros**: Global CDN, fast, scalable, free tier
**Cons**: Limited runtime, vendor lock-in

### 3. Electron Desktop

```
┌──────────────────────────┐
│ Electron App             │
│ ┌──────────────────────┐ │
│ │ Main Process         │ │
│ │ (main.js)            │ │
│ └──────────┬───────────┘ │
│            │             │
│            ▼             │
│ ┌──────────────────────┐ │
│ │ Renderer Process     │ │
│ │ (Browser Window)     │ │
│ │ ┌──────────────────┐ │ │
│ │ │ index.html       │ │ │
│ │ │ app.js           │ │ │
│ │ │ taxBrackets.js   │ │ │
│ │ └──────────────────┘ │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

**Pros**: Native experience, offline capable, OS integration
**Cons**: Large download size, platform-specific builds

### 4. Docker Container

```
┌────────────────────────┐
│ Docker Container       │
│ ┌────────────────────┐ │
│ │ Node.js 16         │ │
│ │ ┌────────────────┐ │ │
│ │ │ Express Server │ │ │
│ │ └────────┬───────┘ │ │
│ │          │         │ │
│ │          ▼         │ │
│ │ ┌────────────────┐ │ │
│ │ │ Static Files   │ │ │
│ │ └────────────────┘ │ │
│ └────────────────────┘ │
└────────────────────────┘
         │
         ▼
    Port Mapping
    (3001:3000)
```

**Pros**: Consistent environment, easy deployment, portable
**Cons**: Requires Docker knowledge, resource overhead

## Security Architecture

### Client-Side Security

1. **Input Validation**
   - All numeric inputs validated
   - Range checks (min/max)
   - Type checking
   - Sanitization of user inputs

2. **XSS Protection**
   - No `eval()` usage
   - Safe DOM manipulation
   - Controlled innerHTML usage
   - Bootstrap components (XSS-safe)

3. **Data Privacy**
   - All data stays client-side
   - No external API calls
   - No tracking or analytics
   - localStorage only (user's browser)

4. **localStorage Security**
   - Availability checks
   - Try-catch error handling
   - No sensitive data stored
   - User can clear data

### Server-Side Security (Express)

1. **Static File Serving**
   - Express.static middleware
   - No directory listing
   - Path traversal protection

2. **Headers**
   - Consider adding security headers:
     - X-Content-Type-Options
     - X-Frame-Options
     - Content-Security-Policy

### Electron Security

1. **Context Isolation**
   - Preload scripts
   - No nodeIntegration in renderer
   - Controlled IPC

2. **Content Security**
   - Sandboxed renderer
   - Limited Node.js access

## Performance Considerations

### Optimization Strategies

1. **Calculation Performance**
   - O(n) tax bracket algorithm (n = number of brackets)
   - Minimal DOM manipulation
   - Efficient event listeners

2. **Data Loading**
   - Static tax data (no API calls)
   - localStorage caching
   - No external dependencies at runtime

3. **Asset Optimization**
   - Bootstrap from CDN (cached globally)
   - Minimal custom CSS
   - No build step required

4. **Memory Management**
   - No memory leaks (clean event listeners)
   - localStorage size monitoring
   - Efficient data structures

### Performance Metrics

**Target Metrics**:
- Page load: < 1 second
- Calculation time: < 100ms
- localStorage save: < 50ms
- Excel export: < 2 seconds

## Design Decisions

### 1. Why Client-Side Only?

**Decision**: All calculations happen in the browser

**Rationale**:
- **Privacy**: User data never leaves their device
- **Performance**: No server round-trips
- **Scalability**: No server infrastructure needed
- **Simplicity**: Easier to deploy and maintain
- **Cost**: No server costs

**Trade-offs**:
- No cross-device sync
- No server-side validation
- Tax data embedded in client

### 2. Why Multiple Deployment Options?

**Decision**: Support web, desktop, edge, and container deployments

**Rationale**:
- **Flexibility**: Users choose deployment method
- **Reach**: Desktop for offline, web for accessibility
- **Performance**: Edge for global distribution
- **Portability**: Docker for consistent deployment

**Trade-offs**:
- More complex project structure
- Multiple build configurations
- More documentation needed

### 3. Why Bootstrap?

**Decision**: Use Bootstrap instead of custom CSS framework

**Rationale**:
- **Speed**: Rapid development
- **Responsive**: Built-in mobile support
- **Components**: Toast, forms, buttons
- **Familiar**: Well-documented, widely known
- **Accessible**: ARIA labels, keyboard navigation

**Trade-offs**:
- Larger CSS bundle
- Bootstrap styling constraints
- CDN dependency

### 4. Why localStorage?

**Decision**: Use localStorage instead of database

**Rationale**:
- **Privacy**: Data stays on device
- **Simplicity**: No backend needed
- **Fast**: Synchronous access
- **Availability**: Works offline

**Trade-offs**:
- No multi-device sync
- Limited storage (5-10MB)
- User can clear data
- No backup/recovery

### 5. Why ExcelJS?

**Decision**: Use ExcelJS for export instead of CSV

**Rationale**:
- **Rich formatting**: Headers, styles, formulas
- **Multiple sheets**: Organize data better
- **User expectation**: Users prefer Excel
- **Professional**: Better for sharing with advisors

**Trade-offs**:
- Larger library size
- More complex than CSV
- Async operation

## Future Architecture Considerations

### Potential Enhancements

1. **IndexedDB**: For larger data storage
2. **Service Workers**: For offline capability
3. **Web Workers**: For heavy calculations
4. **Progressive Web App**: For mobile experience
5. **State Management**: Redux/Zustand for complex state
6. **Type Safety**: Convert to TypeScript
7. **Testing**: Jest, Cypress for automated tests
8. **Build Process**: Webpack/Vite for optimization

### Scalability Path

1. **Phase 1** (Current): Single-page client app
2. **Phase 2**: Add user accounts and cloud sync
3. **Phase 3**: Multi-user features (families, advisors)
4. **Phase 4**: Advanced features (investment planning, etc.)

---

**Last Updated**: January 24, 2026

For questions about architecture decisions or implementation details, open an issue on GitHub.
