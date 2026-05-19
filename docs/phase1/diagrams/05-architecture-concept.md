# Architecture Concept & Technology Justification

**Project:** Solar Energy Calculator  
**Version:** 1.0  
**Date:** February 2026

---

## Executive Summary

The Solar Energy Calculator is a modern, client-focused web application built using a **serverless architecture** with **Next.js** as the core framework. The system integrates external APIs (Google Maps and PVGIS) to provide accurate, real-time solar energy estimates while maintaining high performance, security, and user privacy.

---

## Architecture Overview

### Architecture Pattern: **JAMstack + Serverless**

The application follows the JAMstack (JavaScript, APIs, Markup) architecture pattern combined with serverless computing:

- **Frontend**: React-based Single Page Application (SPA)
- **Backend**: Serverless API routes (Functions-as-a-Service)
- **Data**: External APIs (no database required)
- **Hosting**: Cloud platform with global CDN

### Core Principles

1. **Separation of Concerns**: Clear boundaries between presentation, business logic, and data access
2. **Stateless Design**: No server-side session management; each request is independent
3. **Privacy-First**: No user data collection or storage
4. **Performance-Optimized**: Static generation where possible, dynamic only when necessary
5. **Scalable by Default**: Serverless functions scale automatically with demand

---

## Technology Stack Justification

### Frontend Technologies

#### **Next.js 15** (React Framework)
**Why Chosen:**
- **Hybrid Rendering**: Supports both static and server-side rendering for optimal performance
- **API Routes**: Built-in serverless functions eliminate need for separate backend
- **Developer Experience**: Hot reload, TypeScript support, automatic code splitting
- **SEO Optimization**: Server-side rendering capabilities for better search engine visibility
- **Production Ready**: Battle-tested framework used by major companies

**Alternatives Considered:**
- ❌ **Create React App**: Lacks built-in API routes and optimization features
- ❌ **Vue.js/Nuxt**: Less ecosystem maturity for our specific requirements
- ❌ **Angular**: Steeper learning curve, heavier bundle size

---

#### **TypeScript** (Type-Safe JavaScript)
**Why Chosen:**
- **Type Safety**: Catch errors at compile-time rather than runtime
- **Better IDE Support**: Autocomplete, refactoring, inline documentation
- **Maintainability**: Self-documenting code with interfaces and types
- **Scalability**: Easier to refactor and extend as project grows

**Benefit Example:**
```typescript
interface SolarData {
  yearlyIrradiance: number;  // Compiler ensures this is always a number
  location: Location;         // Enforces required structure
}
```

**Alternatives Considered:**
- ❌ **Plain JavaScript**: Higher risk of runtime errors, harder to maintain
- ✅ **TypeScript**: Clear winner for medium-to-large projects

---

#### **Tailwind CSS** (Utility-First CSS Framework)
**Why Chosen:**
- **Rapid Development**: Pre-built utility classes speed up styling
- **Consistency**: Design system built-in (spacing, colors, breakpoints)
- **Performance**: Purges unused CSS in production (smaller bundle size)
- **Responsive Design**: Mobile-first approach with intuitive breakpoint system
- **No Naming Conflicts**: Utility classes eliminate CSS specificity issues

**Alternatives Considered:**
- ❌ **Bootstrap**: More opinionated, harder to customize, larger bundle
- ❌ **Plain CSS**: Time-consuming, harder to maintain consistency
- ❌ **CSS-in-JS**: Runtime overhead, complexity not needed for this project

---

#### **React 19** (UI Library)
**Why Chosen:**
- **Component-Based**: Reusable, testable UI components
- **Large Ecosystem**: Extensive libraries for maps, charts, utilities
- **Virtual DOM**: Efficient UI updates and rendering
- **Industry Standard**: Most popular UI framework with strong community

**Key Libraries:**
- **Recharts**: Declarative charting library for monthly production visualization
- **Lucide React**: Modern, lightweight icon set
- **Axios**: Promise-based HTTP client for API requests

---

### Backend Technologies

#### **Next.js API Routes** (Serverless Functions)
**Why Chosen:**
- **Integrated Solution**: No need for separate backend infrastructure
- **Automatic Scaling**: Functions scale independently based on demand
- **Cost-Effective**: Pay-per-invocation pricing (vs. always-on server)
- **Security**: API keys protected on server-side, not exposed to client
- **Simplified Deployment**: Single codebase for frontend and backend

**Use Cases:**
1. **`/api/solar`**: Proxies PVGIS requests, handles errors, provides fallbacks
2. **`/api/calculate`**: Performs complex calculations with regional data

**Alternatives Considered:**
- ❌ **Express.js Server**: Requires always-on infrastructure, manual scaling
- ❌ **AWS Lambda (separate)**: More complex deployment, separate repos
- ✅ **Next.js API Routes**: Seamless integration, optimal for our needs

---

### External Service Integrations

#### **Google Maps JavaScript API**
**Why Chosen:**
- **Satellite Imagery**: Essential for visualizing roof space and solar potential
- **Geocoding**: Converts addresses to coordinates and vice versa
- **Places Autocomplete**: Professional address search experience
- **Reliability**: Industry-leading uptime and performance
- **Documentation**: Comprehensive guides and examples

**Configuration:**
- API Key restricted by domain (security)
- Loaded dynamically to reduce initial page load
- Satellite view prioritized for roof assessment

**Alternatives Considered:**
- ❌ **OpenStreetMap**: Lacks satellite imagery quality
- ❌ **Mapbox**: More expensive, less familiar API
- ✅ **Google Maps**: Best satellite imagery and user experience

---

#### **PVGIS API** (Solar Irradiance Data)
**Why Chosen:**
- **Authority**: Operated by European Commission, scientifically validated
- **Free & Open**: No API key required, no usage limits
- **Global Coverage**: Multiple regional databases (Europe, Americas, World)
- **Historical Data**: 5 years of weather data (2016-2020)
- **Comprehensive**: Returns yearly, monthly, and optimal angle data

**Data Quality:**
- PVGIS-SARAH2: High-resolution satellite data for Europe
- Validated against ground measurements
- Industry-standard for solar assessment

**Alternatives Considered:**
- ❌ **NREL API**: Requires API key, US-focused, usage limits
- ❌ **OpenWeather**: Less comprehensive solar data
- ✅ **PVGIS**: Best balance of quality, coverage, and accessibility

---

## Architecture Diagrams

### System Layers

```
┌─────────────────────────────────────────┐
│     Presentation Layer (Browser)         │
│  - React Components                      │
│  - Tailwind CSS Styling                  │
│  - Client-Side State Management          │
└─────────────────┬───────────────────────┘
                  │ HTTPS / JSON
┌─────────────────▼───────────────────────┐
│     API Layer (Serverless Functions)     │
│  - /api/solar (PVGIS proxy)              │
│  - /api/calculate (calculations)         │
└─────────────────┬───────────────────────┘
                  │ HTTPS / REST
┌─────────────────▼───────────────────────┐
│     External Services                    │
│  - PVGIS API (solar data)                │
│  - Google Maps API (maps/geocoding)      │
└─────────────────────────────────────────┘
```

### Request Flow Example

```
User clicks location on map
    ↓
GoogleMap component captures coordinates
    ↓
User enters system specs and clicks Calculate
    ↓
GET /api/solar?lat=50.85&lng=4.35
    ↓
API route fetches from PVGIS
    ↓
Returns {yearlyIrradiance: 1200, monthlyData: [...], ...}
    ↓
POST /api/calculate {solarData, systemSpecs}
    ↓
API route performs calculations
    ↓
Returns {yearlyEnergyKwh: 26400, co2SavingsKg: 7286, ...}
    ↓
Results component renders charts and metrics
    ↓
User views detailed analysis
```

---

## Design Decisions & Rationale

### Decision 1: No Database
**Rationale:**
- No user accounts or persistent data required
- All calculations are stateless and immediate
- Reduces infrastructure complexity and costs
- Enhances privacy (no data storage)
- Eliminates data backup/security concerns

**Trade-off:** Users cannot save calculations (acceptable for MVP)

---

### Decision 2: Client-Side Rendering for Main App
**Rationale:**
- Interactive components (map, charts) require client-side JavaScript
- Better user experience with immediate interactions
- Reduced server load (processing happens in browser)
- Easier to implement dynamic features

**SEO Consideration:** Not critical for this tool (users find via direct links, not search)

---

### Decision 3: API Routes as Backend Proxy
**Rationale:**
- **Security**: API keys protected on server, never exposed to client
- **Error Handling**: Centralized error handling and fallbacks
- **Flexibility**: Can add caching, rate limiting, or switch providers without client changes
- **Consistency**: Normalize different API response formats

---

### Decision 4: TypeScript for Entire Codebase
**Rationale:**
- Type safety prevents many common bugs
- Interfaces document data structures (SolarData, SystemSpecs, etc.)
- Better refactoring support as project evolves
- Improved collaboration (clear contracts between components)

---

### Decision 5: Tailwind CSS over Component Libraries
**Rationale:**
- Full design control (no "Bootstrap look")
- Smaller bundle size (only used utilities included)
- Faster development for custom designs
- Easy to make responsive without writing media queries

---

### Decision 6: Recharts for Data Visualization
**Rationale:**
- React-native (better integration than D3.js)
- Declarative API (easier to maintain)
- Responsive out-of-the-box
- Sufficient for our charting needs

**Alternatives:**
- ❌ **D3.js**: More powerful but overly complex for bar/line charts
- ❌ **Chart.js**: Imperative API, harder to integrate with React

---

## Performance Optimization Strategies

### 1. Code Splitting
- Next.js automatically splits code by route
- Dynamic imports for heavy components (GoogleMap, SolarResults)
- Lazy loading reduces initial bundle size

### 2. Image Optimization
- Next.js Image component for optimized images
- WebP format with fallbacks
- Responsive images for different screen sizes

### 3. API Optimization
- 10-second timeout on PVGIS requests
- Fallback calculations when API unavailable
- Error boundaries prevent full app crashes

### 4. Static Asset Optimization
- CSS purging removes unused Tailwind classes
- JavaScript minification and compression
- CDN caching for static assets

---

## Security Architecture

### Security Layers

1. **Environment Variables**
   - API keys stored in `.env.local`
   - Not committed to version control
   - Server-side only access

2. **API Route Proxy**
   - Client never directly calls external APIs with keys
   - Rate limiting possible at proxy level
   - Input validation on all endpoints

3. **HTTPS Enforcement**
   - All traffic encrypted (handled by Vercel)
   - Secure cookie settings
   - HSTS headers enabled

4. **Input Validation**
   - TypeScript type checking
   - Runtime validation on API routes
   - Sanitization of user inputs

5. **No Data Storage**
   - Zero attack surface for data breaches
   - GDPR compliant by design
   - No PII collection

---

## Scalability Considerations

### Current Scale (MVP)
- **Target**: 100 concurrent users
- **Architecture**: Serverless auto-scaling
- **Sufficient for**: Course project, portfolio demo, small user base

### Future Scale (If Deployed Widely)

**Horizontal Scaling:**
- Serverless functions scale automatically
- No code changes needed
- Pay-per-use pricing model

**Potential Bottlenecks:**
1. **PVGIS API**: Free service, unknown rate limits
   - **Mitigation**: Implement caching layer (Redis)
   - **Mitigation**: Request pooling for same locations

2. **Google Maps API**: Quota limits based on plan
   - **Mitigation**: Monitor usage, upgrade plan if needed
   - **Mitigation**: Restrict API key by domain

**Optimization Opportunities:**
- Cache PVGIS responses (1 year TTL for historical data)
- Implement CDN caching for common locations
- Add service worker for offline fallback

---

## Deployment Architecture

### Platform: **Vercel**

**Why Vercel:**
- **Optimized for Next.js**: Built by Next.js creators
- **Zero Configuration**: Push to deploy
- **Automatic Scaling**: No manual configuration
- **Global CDN**: Edge locations worldwide
- **Free Tier**: Sufficient for this project
- **HTTPS Automatic**: SSL certificates managed
- **Preview Deployments**: Every PR gets a URL

### Deployment Process

```
Developer commits to GitHub
    ↓
GitHub webhook triggers Vercel
    ↓
Vercel builds project (next build)
    ↓
Static assets → Global CDN
Serverless functions → Compute layer
    ↓
Deployment live at: solar-calculator.vercel.app
    ↓
Environment variables injected
```

### Environments

- **Development**: `npm run dev` (local)
- **Preview**: Automatic on pull requests
- **Production**: Main branch auto-deploys

---

## Alternative Architectures Considered

### Alternative 1: Traditional LAMP Stack
**Why Rejected:**
- ❌ Requires always-on server (higher cost)
- ❌ Manual scaling configuration
- ❌ Slower development cycle
- ❌ Not aligned with modern best practices

### Alternative 2: Full Microservices
**Why Rejected:**
- ❌ Overcomplicated for project scope
- ❌ Multiple deployment pipelines
- ❌ Service orchestration overhead
- ❌ Not justified for 2 API endpoints

### Alternative 3: Pure Static Site + Client-Side API Calls
**Why Rejected:**
- ❌ API keys exposed in client code
- ❌ CORS issues with external APIs
- ❌ No error handling/fallback layer
- ❌ Less control over data flow

**✅ Current Architecture: Optimal Balance**
- Simple enough to develop and maintain alone
- Sophisticated enough to be production-ready
- Scalable without infrastructure management
- Secure by design (API keys protected)

---

## Technology Risk Assessment

| Technology | Risk Level | Mitigation |
|------------|-----------|------------|
| Next.js | Low | Mature framework, excellent documentation |
| Vercel Hosting | Low | Reliable platform, 99.9% uptime SLA |
| PVGIS API | Medium | Free service, implement fallback calculations |
| Google Maps API | Low | Enterprise-grade reliability, quota monitoring |
| TypeScript | Low | Catch errors at compile-time |
| Tailwind CSS | Low | Proven framework, large community |

---

## Future Enhancement Opportunities

### Technical Improvements
1. **Caching Layer**: Redis for PVGIS responses
2. **Progressive Web App**: Offline functionality
3. **Internationalization**: Multi-language support
4. **Advanced Charts**: 3D visualizations, interactive projections
5. **PDF Export**: Downloadable reports

### Architecture Evolution
1. **Microservices**: If calculator types multiply (wind, hydro)
2. **Database**: If user accounts/project saving added
3. **Real-time Updates**: WebSockets for live monitoring (future feature)

---

## Conclusion

The selected architecture and technology stack provide an optimal foundation for the Solar Energy Calculator:

✅ **Simplicity**: Single codebase, unified deployment  
✅ **Performance**: Fast load times, responsive interactions  
✅ **Scalability**: Automatic scaling without configuration  
✅ **Security**: API keys protected, no data storage risks  
✅ **Maintainability**: Type-safe code, clear structure  
✅ **Cost-Effective**: Serverless pricing, free tier sufficient  

This architecture successfully balances academic requirements, technical best practices, and practical constraints while remaining extensible for future enhancements.

---

**Document Status:** Final  
**Architecture Review:** February 2026  
**Architect:** Enis Berisha
