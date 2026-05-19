# Phase 1: Conception Phase Documentation

**Project:** Solar Energy Calculator  
**Course:** DLMCSPSE01 - Project: Software Engineering  
**Student:** Enis Berisha  
**Date:** February 2026

---

## Overview

This folder contains all Phase 1 (Conception Phase) deliverables for the Software Engineering Portfolio assignment. The documentation covers project planning, requirements analysis, system design, and technology decisions.

---

## Document Structure

```
phase1/
├── project-management/
│   └── 01-project-profile-summary.md
├── requirements/
│   ├── 02-functional-requirements.md
│   ├── 03-non-functional-requirements.md
│   └── 04-glossary.md
├── diagrams/
│   ├── system-context.puml
│   ├── component-diagram.puml
│   ├── deployment-diagram.puml
│   ├── data-flow-diagram.puml
│   └── 05-architecture-concept.md
└── README.md (this file)
```

---

## Contents

### 1. Project Management (`/project-management/`)

#### **01-project-profile-summary.md**
- Project objectives and scope definition
- Target audience identification
- Software development methodology (Iterative Agile)
- Risk analysis (technical, project, data quality)
- Project plan with timeline and milestones
- Success criteria and business value proposition

**Key Sections:**
- Why this project? What problem does it solve?
- Who are the users?
- How will we build it? (Agile approach)
- What can go wrong? (Risk mitigation)

---

### 2. Requirements (`/requirements/`)

#### **02-functional-requirements.md**
Complete functional requirements specification organized by feature modules:

- **FR-1**: Location Selection (map, search, geocoding)
- **FR-2**: System Configuration (area, efficiency, specs)
- **FR-3**: Solar Data Retrieval (PVGIS integration)
- **FR-4**: Energy Calculations (production, capacity)
- **FR-5**: Financial Analysis (savings, regional rates)
- **FR-6**: Environmental Impact (CO₂ calculations)
- **FR-7**: Results Visualization (charts, dashboard)
- **FR-8**: User Interface (responsive, accessible)
- **FR-9**: Data Persistence (optional)

**Includes:**
- User stories and use cases
- Acceptance criteria for each requirement
- Requirements traceability matrix
- Priority levels (Must/Should/Could Have)

#### **03-non-functional-requirements.md**
Non-functional requirements covering system qualities:

- **Performance**: Load time, API response, concurrent users
- **Usability**: Ease of use, mobile experience, feedback
- **Reliability**: Uptime, error handling, fallbacks
- **Security**: API protection, HTTPS, privacy
- **Maintainability**: Code quality, documentation
- **Portability**: Browser compatibility, deployment
- **Scalability**: Horizontal scaling, rate limiting
- **Accessibility**: WCAG compliance, keyboard navigation
- **Compliance**: GDPR, web standards

**Status Matrix:**
- Each NFR marked as Met/Partial/In Progress
- Testing requirements specified
- Known limitations documented

#### **04-glossary.md**
Comprehensive glossary defining:

- Technical terms (API, REST, JSON, Docker, etc.)
- Solar energy domain terms (kWh, irradiance, azimuth, etc.)
- Project-specific terminology
- Acronyms quick reference table

**Purpose:** Ensures common understanding across all stakeholders

---

### 3. Diagrams (`/diagrams/`)

#### **system-context.puml**
C4 Model Context Diagram showing:
- User (property owner, consultant)
- Solar Energy Calculator system
- External systems (Google Maps API, PVGIS API)
- Relationships and data flows

**Format:** PlantUML with C4 notation

#### **component-diagram.puml**
C4 Model Component Diagram detailing:
- React components (GoogleMap, SolarResults, etc.)
- API routes (/api/solar, /api/calculate)
- Type definitions and utilities
- Component interactions and dependencies

**Shows:** Internal architecture of the Next.js application

#### **deployment-diagram.puml**
C4 Model Deployment Diagram illustrating:
- User devices (desktop, mobile)
- Vercel cloud infrastructure
- CDN and serverless functions
- External services (Google, PVGIS)
- GitHub integration

**Shows:** Production deployment architecture

#### **data-flow-diagram.puml**
Detailed data flow diagram showing:
- User interaction steps (1-20)
- Data passed between components
- API request/response payloads
- Calculation flow from input to results

**Shows:** Step-by-step user workflow with data transformation

#### **05-architecture-concept.md**
Comprehensive architecture documentation including:
- Technology stack justification (Next.js, TypeScript, Tailwind)
- Architecture patterns (JAMstack, Serverless)
- Design decisions and rationale
- Performance optimization strategies
- Security architecture
- Scalability considerations
- Alternative architectures considered

**Purpose:** Explains "why" behind every technology choice

---

## How to View PlantUML Diagrams

### Option 1: PlantUML Online Viewer
1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy the contents of any `.puml` file
3. Paste into the web editor
4. View rendered diagram

### Option 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt+D` to preview

### Option 3: Command Line (requires Java and GraphViz)
```bash
brew install plantuml  # macOS
plantuml diagrams/*.puml  # Generates PNG files
```

### Option 4: Export to Images (for submission)
The diagrams will be exported as PNG/SVG and included in the composite presentation PDF for Phase 1 submission.

---

## Phase 1 Submission Checklist

### Required Documents:
- [x] Project profile summary (0.5 page written summary)
- [x] Software development methodology explanation
- [x] Functional requirements specification
- [x] Non-functional requirements specification
- [x] Glossary of terms
- [x] System context diagram (UML)
- [x] Component/building block diagram (UML)
- [x] Technology justification document

### Composite Presentation PDF will include:
1. Project profile (from 01-project-profile-summary.md)
2. Methodology explanation (from 01-project-profile-summary.md)
3. Requirements overview (from 02 & 03)
4. Glossary highlights (from 04-glossary.md)
5. System Context Diagram (rendered from system-context.puml)
6. Component Diagram (rendered from component-diagram.puml)
7. Deployment Diagram (rendered from deployment-diagram.puml)
8. Architecture concept summary (from 05-architecture-concept.md)

### File Naming Convention:
```
Berisha-Enis_[MatriculationNumber]_PSE_P1_S.pdf
```

---

## Key Highlights for Evaluators

### 1. Clear Business Value
- Solves real problem: expensive solar consultations
- Target audience: property owners, businesses, consultants
- Quantifiable benefits: Free instant assessments, scientific accuracy

### 2. Comprehensive Requirements
- 30+ functional requirements with acceptance criteria
- 25+ non-functional requirements covering all quality attributes
- Complete traceability matrix showing implementation status

### 3. Thoughtful Architecture
- Modern JAMstack + Serverless approach
- Every technology choice justified with alternatives considered
- Security-by-design (no data collection, API keys protected)
- Scalable without configuration

### 4. Risk Management
- Technical risks identified with mitigation strategies
- Fallback mechanisms for API failures
- Testing approach documented

### 5. Professional Documentation
- Industry-standard UML diagrams (C4 Model)
- Comprehensive glossary (350+ terms)
- Clear, structured presentation
- Follows software engineering best practices

---

## Next Steps (Phase 2)

Phase 2 will focus on:
- Implementation details and code walkthrough
- Updated architecture documentation
- Design decision rationale (why X over Y)
- Library and framework references with justification
- Testing approach and results

---

## Questions or Feedback

For tutor feedback or questions:
- Review documents in order: Project Profile → Requirements → Diagrams → Architecture
- All documents are interconnected and reference each other
- Use glossary for any unfamiliar terms
- Diagrams visualize what requirements describe

---

**Status:** Ready for Phase 1 Submission  
**Last Updated:** February 2026  
**Prepared by:** Enis Berisha
