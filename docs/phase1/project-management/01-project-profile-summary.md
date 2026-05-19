# Project Profile & Methodology Summary

**Project Name:** Solar Energy Calculator Web Application  
**Student:** Enis Berisha  
**Course:** Project: Software Engineering (DLMCSPSE01)  
**Date:** February 2026

---

## 1. Project Objectives and Scope

### Primary Objective
Develop a comprehensive web-based solar energy calculator that enables property owners, businesses, and solar energy consultants to accurately estimate solar panel installation potential based on geographical location and available space.

### Scope
The application provides:
- **Interactive location selection** via Google Maps integration with satellite imagery
- **Real-time solar irradiance data** from authoritative sources (PVGIS API)
- **Comprehensive energy calculations** including yearly/monthly production estimates
- **Financial analysis** with regional electricity rates and savings projections
- **Environmental impact assessment** showing CO₂ reduction and tree-planting equivalents
- **Visual data presentation** through interactive charts and dashboards

### Out of Scope
- Detailed structural engineering assessments
- Local regulatory compliance checking
- Real-time system monitoring for installed panels
- Direct purchase/installation services
- Multi-user accounts or project saving functionality

---

## 2. Target Audience

### Primary Users
1. **Residential Property Owners** - Homeowners exploring solar installation feasibility
2. **Commercial Property Managers** - Business owners evaluating solar investments
3. **Solar Energy Consultants** - Professionals conducting preliminary site assessments
4. **Real Estate Developers** - Developers planning sustainable building projects

### User Needs
- Quick, accurate solar potential estimates without specialized knowledge
- Location-specific calculations based on actual solar irradiance data
- Clear financial and environmental impact projections
- Professional-quality reports for decision-making

---

## 3. Software Development Methodology

### Selected Methodology: **Iterative Agile Approach**

### Justification
The project follows an **iterative agile methodology** with the following characteristics:

1. **Incremental Development**
   - Core features (map selection, basic calculations) implemented first
   - Advanced features (charts, financial analysis) added iteratively
   - Continuous testing and refinement at each stage

2. **Flexibility and Adaptation**
   - Ability to adjust requirements based on API capabilities discovered during development
   - Quick response to technical challenges (e.g., Google Maps configuration issues)
   - User feedback incorporation during development cycles

3. **Short Development Cycles**
   - 1-2 week sprints focusing on specific features
   - Regular integration and testing
   - Continuous deployment capability

4. **Why Not Waterfall?**
   - External API dependencies (Google Maps, PVGIS) require exploratory testing
   - User interface design benefits from iterative refinement
   - Technical uncertainties require flexible approach

5. **Individual Project Adaptations**
   - Daily stand-ups replaced with self-reflection and progress tracking
   - Sprint reviews conducted through tutor feedback sessions
   - Documentation maintained continuously in Git repository

### Development Phases
1. **Sprint 0** - Project setup, technology selection, environment configuration
2. **Sprint 1** - Google Maps integration and location selection
3. **Sprint 2** - Solar data API integration and basic calculations
4. **Sprint 3** - Results visualization and user interface refinement
5. **Sprint 4** - Financial/environmental calculations and testing
6. **Sprint 5** - Documentation, deployment, and finalization

---

## 4. Risk Analysis

### Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Google Maps API quota limits | Medium | High | Implement usage monitoring; fallback to OpenStreetMap if needed |
| PVGIS API availability/downtime | Medium | High | Implement fallback calculations based on latitude; cache previous requests |
| Browser compatibility issues | Low | Medium | Use modern, well-supported libraries; progressive enhancement approach |
| Calculation accuracy concerns | Medium | High | Validate against industry standards; use conservative estimates; add disclaimers |
| API key exposure in client code | Low | High | Use Next.js API routes as proxy; restrict API keys by domain |

### Project Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Scope creep | Medium | Medium | Clear requirements definition; prioritized feature list; time-boxing |
| Time constraints | Medium | High | MVP-first approach; focus on core functionality; defer nice-to-have features |
| Insufficient testing | Low | High | Write tests alongside development; manual testing checklist; peer review |
| Documentation delays | Low | Medium | Continuous documentation; track decisions in Git commits |

### Data Quality Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Regional data gaps in PVGIS | Low | Medium | Multiple database support; estimation fallbacks |
| Outdated electricity rates | High | Low | Use recent averages; add user override capability (future enhancement) |
| Incorrect regional boundaries | Low | Low | Use generous geographical bounds; validate with sample locations |

---

## 5. Project Plan Overview

### Timeline: 6-8 Weeks

**Week 1-2: Conception & Setup**
- Requirements gathering and documentation
- Technology stack finalization
- Development environment setup
- Initial architecture design

**Week 3-4: Core Development**
- Google Maps integration
- Location selection functionality
- PVGIS API integration
- Basic calculation engine

**Week 5-6: Feature Enhancement**
- Results visualization (charts)
- Financial calculations
- Environmental impact metrics
- UI/UX refinement

**Week 7: Testing & Documentation**
- Comprehensive testing
- Bug fixes and optimization
- API documentation
- User guide creation

**Week 8: Deployment & Finalization**
- Docker containerization
- Cloud deployment (Vercel)
- Final documentation
- Submission preparation

### Milestones
- ✅ **M1**: Project setup and architecture design complete
- ✅ **M2**: Location selection working with Google Maps
- ✅ **M3**: Solar data retrieval and basic calculations functional
- ✅ **M4**: Results dashboard with visualizations complete
- 🔄 **M5**: Docker deployment configuration ready
- 🔄 **M6**: Cloud hosting active and accessible
- 🔄 **M7**: Complete documentation and submission package ready

---

## 6. Project Organization

### Roles (Individual Project)
- **Developer/Engineer**: Full-stack implementation
- **Architect**: System design and technology decisions
- **Tester**: Quality assurance and validation
- **Technical Writer**: Documentation and user guides
- **DevOps**: Deployment and infrastructure

### Tools & Infrastructure
- **Version Control**: Git + GitHub (public repository)
- **IDE**: VS Code with Cursor AI assistance
- **Project Management**: GitHub Projects / Issues
- **Documentation**: Markdown + PlantUML
- **Communication**: Tutor feedback sessions

### Quality Standards
- **Code Quality**: TypeScript for type safety, ESLint for code standards
- **Testing**: Manual testing with documented test cases; automated API validation
- **Documentation**: Inline code comments, README, architecture docs
- **Performance**: Target < 3s load time, responsive on mobile devices
- **Accessibility**: WCAG 2.1 AA compliance for UI elements

---

## 7. Success Criteria

The project will be considered successful when:

1. ✅ Application accurately retrieves solar irradiance data for any European location
2. ✅ Calculations produce results within ±10% of industry-standard tools
3. ✅ User interface is intuitive with minimal learning curve
4. ✅ Application loads and responds within 3 seconds on standard broadband
5. 🔄 Application is accessible via public URL (cloud-hosted)
6. 🔄 Complete documentation package meets course requirements
7. ✅ Code is properly versioned in public GitHub repository

---

## 8. Business Value Proposition

### Problem Solved
Currently, homeowners and small businesses face barriers in assessing solar potential:
- Professional consultations are expensive (€200-500 per assessment)
- Online calculators are simplistic and inaccurate
- Complex solar modeling tools require specialized training
- Decision-making delayed due to information gaps

### Solution Benefits
- **Free, instant assessments** reducing barrier to entry
- **Scientific accuracy** using EU-backed PVGIS data
- **Visual, intuitive interface** requiring no technical expertise
- **Financial transparency** enabling informed investment decisions
- **Environmental awareness** highlighting climate impact

### Market Differentiation
- Real satellite imagery for accurate area assessment
- Region-specific electricity rates and CO₂ factors
- Professional-grade calculations in consumer-friendly format
- No registration or data collection required
- Open-source transparency

---

**Prepared by:** Enis Berisha  
**Last Updated:** February 2026  
**Version:** 1.0
