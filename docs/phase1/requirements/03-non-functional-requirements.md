# Non-Functional Requirements

**Project:** Solar Energy Calculator  
**Version:** 1.0  
**Date:** February 2026

---

## 1. Overview

This document specifies the non-functional requirements (NFRs) for the Solar Energy Calculator web application. These requirements define system qualities, constraints, and attributes that are essential for acceptable system performance and user experience.

---

## 2. Performance Requirements

### NFR-PERF-1: Page Load Time
**Category:** Performance  
**Priority:** Must Have

**Requirement:**  
The initial page load shall complete within 3 seconds on a standard broadband connection (10 Mbps).

**Rationale:**  
Users expect web applications to load quickly. Research shows 40% of users abandon sites that take more than 3 seconds to load.

**Measurement:**
- Measured using Chrome DevTools Performance tab
- Test on 10 Mbps connection with 50ms latency
- Includes Time to First Contentful Paint (FCP)

**Acceptance Criteria:**
- FCP < 1.5 seconds
- Time to Interactive (TTI) < 3 seconds
- Largest Contentful Paint (LCP) < 2.5 seconds

---

### NFR-PERF-2: API Response Time
**Category:** Performance  
**Priority:** Must Have

**Requirement:**  
Solar data retrieval and calculation operations shall complete within 5 seconds under normal conditions.

**Rationale:**  
Users should receive results quickly to maintain engagement and trust in the application.

**Acceptance Criteria:**
- PVGIS API response time < 3 seconds (95th percentile)
- Calculation processing time < 500ms
- Total time from click to results < 5 seconds
- Loading indicators shown for operations > 500ms

---

### NFR-PERF-3: Concurrent Users
**Category:** Performance  
**Priority:** Should Have

**Requirement:**  
The system shall support at least 100 concurrent users without performance degradation.

**Rationale:**  
Application should handle reasonable traffic loads, especially during peak interest periods (e.g., after solar incentive announcements).

**Acceptance Criteria:**
- Response times remain within specified limits under load
- No server errors under 100 concurrent requests
- Graceful degradation beyond capacity

**Technical Approach:**
- Serverless architecture (Vercel) for automatic scaling
- Static page rendering where possible
- Efficient API route handling

---

### NFR-PERF-4: Map Rendering Performance
**Category:** Performance  
**Priority:** Must Have

**Requirement:**  
Google Maps shall render smoothly with no lag during pan and zoom operations.

**Acceptance Criteria:**
- Map tiles load within 1 second
- 60 FPS during pan/zoom animations
- Marker placement updates in real-time

---

## 3. Usability Requirements

### NFR-USE-1: Ease of Use
**Category:** Usability  
**Priority:** Must Have

**Requirement:**  
The application shall be usable by non-technical users with no prior training or documentation.

**Rationale:**  
Target audience includes general homeowners who may not be technically sophisticated.

**Acceptance Criteria:**
- User can complete full workflow in under 5 minutes
- No user manual required for basic operations
- Clear visual hierarchy guides users through steps
- Intuitive icons and labels

**Testing Method:**
- Usability testing with 5 representative users
- Success rate > 90% for completing calculation
- Average time to result < 3 minutes

---

### NFR-USE-2: User Interface Clarity
**Category:** Usability  
**Priority:** Must Have

**Requirement:**  
All interface elements shall be clearly labeled with tooltips or helper text where needed.

**Acceptance Criteria:**
- Input fields have descriptive labels
- Technical terms have explanatory tooltips
- Error messages provide actionable guidance
- Units of measurement clearly displayed (m², kWh, etc.)

---

### NFR-USE-3: Mobile Usability
**Category:** Usability  
**Priority:** Must Have

**Requirement:**  
The application shall be fully usable on mobile devices with touch interfaces.

**Acceptance Criteria:**
- Touch targets minimum 44×44 pixels
- Forms are easy to fill on mobile keyboards
- Map interactions work with touch gestures
- No horizontal scrolling required

---

### NFR-USE-4: Feedback and Confirmation
**Category:** Usability  
**Priority:** Must Have

**Requirement:**  
The system shall provide immediate feedback for all user actions.

**Acceptance Criteria:**
- Button clicks show visual response (hover, active states)
- Loading states displayed for async operations
- Success/error messages appear for critical actions
- Form validation messages appear inline

---

## 4. Reliability Requirements

### NFR-REL-1: System Availability
**Category:** Reliability  
**Priority:** Should Have

**Requirement:**  
The application shall maintain 99% uptime excluding scheduled maintenance.

**Rationale:**  
Users should be able to access the tool whenever needed, though some downtime is acceptable for a non-critical application.

**Measurement:**
- Uptime monitoring via Vercel dashboard
- Monthly availability reports
- Planned maintenance windows communicated in advance

**Acceptance Criteria:**
- < 7.2 hours downtime per month
- Graceful degradation during partial outages
- Clear error messages during maintenance

---

### NFR-REL-2: Error Handling
**Category:** Reliability  
**Priority:** Must Have

**Requirement:**  
The system shall handle all errors gracefully without crashing or exposing technical details to users.

**Acceptance Criteria:**
- All API failures caught and handled
- User-friendly error messages (no stack traces)
- Application remains functional after errors
- Error logging for debugging (server-side only)

**Error Scenarios Covered:**
- PVGIS API timeout or unavailability
- Google Maps API failure
- Invalid user inputs
- Network connectivity issues
- Browser compatibility problems

---

### NFR-REL-3: Data Validation
**Category:** Reliability  
**Priority:** Must Have

**Requirement:**  
All user inputs and API responses shall be validated before processing.

**Acceptance Criteria:**
- Client-side validation for immediate feedback
- Server-side validation for security
- Range checks on numeric inputs
- Type checking on all data
- Sanitization of text inputs

---

### NFR-REL-4: Fallback Mechanisms
**Category:** Reliability  
**Priority:** Should Have

**Requirement:**  
The system shall provide fallback calculation methods when primary data sources are unavailable.

**Acceptance Criteria:**
- Latitude-based estimation when PVGIS fails
- Calculation proceeds with estimated values
- User notified of reduced accuracy
- Disclaimer displayed on results

---

## 5. Security Requirements

### NFR-SEC-1: API Key Protection
**Category:** Security  
**Priority:** Must Have

**Requirement:**  
API keys shall not be exposed in client-side code or version control.

**Rationale:**  
Exposed API keys can be stolen and misused, leading to quota exhaustion and potential costs.

**Implementation:**
- Google Maps API key in environment variables
- Next.js API routes act as proxy for sensitive operations
- API keys restricted by domain/referrer
- `.env` files excluded from Git via `.gitignore`

**Acceptance Criteria:**
- No API keys visible in browser DevTools
- No API keys in Git repository history
- Environment-specific configuration
- Keys rotatable without code changes

---

### NFR-SEC-2: Input Sanitization
**Category:** Security  
**Priority:** Must Have

**Requirement:**  
All user inputs shall be sanitized to prevent injection attacks.

**Acceptance Criteria:**
- No executable code accepted in text fields
- Numeric inputs validated as numbers
- Type-safe operations via TypeScript
- No direct DOM manipulation from user input

---

### NFR-SEC-3: HTTPS Encryption
**Category:** Security  
**Priority:** Must Have

**Requirement:**  
All data transmission shall be encrypted using HTTPS.

**Rationale:**  
Protects user privacy and prevents man-in-the-middle attacks.

**Acceptance Criteria:**
- TLS 1.2 or higher
- Valid SSL certificate
- Automatic HTTP to HTTPS redirect
- No mixed content warnings

---

### NFR-SEC-4: No Personal Data Collection
**Category:** Security/Privacy  
**Priority:** Must Have

**Requirement:**  
The application shall not collect, store, or transmit personal user information.

**Rationale:**  
Privacy-focused design reduces legal obligations and builds user trust.

**Acceptance Criteria:**
- No user accounts or authentication
- No cookies beyond essential session management
- No analytics tracking personal information
- Location data not stored on server
- GDPR compliant by design

---

## 6. Maintainability Requirements

### NFR-MAIN-1: Code Documentation
**Category:** Maintainability  
**Priority:** Must Have

**Requirement:**  
All code shall be documented with clear comments explaining purpose and logic.

**Acceptance Criteria:**
- Function-level JSDoc comments for all exported functions
- Inline comments for complex algorithms
- README files in all major directories
- API documentation for all endpoints

---

### NFR-MAIN-2: Code Quality Standards
**Category:** Maintainability  
**Priority:** Must Have

**Requirement:**  
Code shall follow consistent style guidelines and best practices.

**Implementation:**
- TypeScript for type safety
- ESLint for style enforcement
- Prettier for formatting (optional)
- Meaningful variable and function names

**Acceptance Criteria:**
- No ESLint errors in production code
- Type coverage > 95%
- Functions < 50 lines (guideline)
- Cyclomatic complexity < 10

---

### NFR-MAIN-3: Modular Architecture
**Category:** Maintainability  
**Priority:** Should Have

**Requirement:**  
The application shall be organized into clear, reusable modules with separation of concerns.

**Acceptance Criteria:**
- Components are single-responsibility
- Business logic separated from UI
- Reusable utility functions extracted
- Clear folder structure

**Architecture Layers:**
- Presentation: React components
- Business Logic: API routes, calculation functions
- Data: Type definitions, constants
- Integration: External API clients

---

### NFR-MAIN-4: Version Control
**Category:** Maintainability  
**Priority:** Must Have

**Requirement:**  
All code and documentation shall be version controlled with meaningful commit messages.

**Acceptance Criteria:**
- Git repository with complete history
- Commit messages follow conventional format
- Branches for features/fixes
- No sensitive data in history

---

## 7. Portability Requirements

### NFR-PORT-1: Browser Compatibility
**Category:** Portability  
**Priority:** Must Have

**Requirement:**  
The application shall work on all modern browsers released within the last 2 years.

**Supported Browsers:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile Safari (iOS 14+) ✅
- Chrome Mobile (Android) ✅

**Not Supported:**
- Internet Explorer (any version)
- Browsers with JavaScript disabled

**Acceptance Criteria:**
- Core functionality works on all supported browsers
- Visual consistency across browsers (minor variations acceptable)
- Progressive enhancement approach
- Graceful degradation for unsupported features

---

### NFR-PORT-2: Platform Independence
**Category:** Portability  
**Priority:** Must Have

**Requirement:**  
The application shall work on desktop, tablet, and mobile platforms.

**Acceptance Criteria:**
- Responsive design adapts to screen sizes
- Touch and mouse inputs supported
- Works on Windows, macOS, Linux, iOS, Android
- No platform-specific code required

---

### NFR-PORT-3: Deployment Portability
**Category:** Portability  
**Priority:** Should Have

**Requirement:**  
The application shall be deployable to multiple hosting platforms with minimal configuration.

**Supported Platforms:**
- Vercel (primary) ✅
- Netlify (compatible)
- AWS Amplify (compatible)
- Docker container (planned)

**Acceptance Criteria:**
- Standard Node.js/Next.js stack
- Environment variable configuration
- No platform-specific dependencies
- Docker configuration provided

---

## 8. Scalability Requirements

### NFR-SCALE-1: Horizontal Scalability
**Category:** Scalability  
**Priority:** Should Have

**Requirement:**  
The application architecture shall support horizontal scaling to handle increased load.

**Implementation:**
- Serverless functions (auto-scaling)
- Stateless API routes
- Client-side rendering where possible
- CDN for static assets

**Acceptance Criteria:**
- No server-side session state
- Each request is independent
- Can add compute resources without code changes

---

### NFR-SCALE-2: API Rate Limiting
**Category:** Scalability  
**Priority:** Could Have

**Requirement:**  
The system should implement rate limiting to prevent API quota exhaustion.

**Rationale:**  
Protects against accidental or malicious overuse of external APIs.

**Acceptance Criteria:**
- Rate limits configurable per user/IP (future)
- Caching of repeated requests (future)
- Clear error messages when limits exceeded

---

## 9. Accessibility Requirements

### NFR-ACC-1: WCAG Compliance
**Category:** Accessibility  
**Priority:** Should Have

**Requirement:**  
The application shall meet WCAG 2.1 Level AA accessibility standards.

**Acceptance Criteria:**
- Keyboard navigation for all functions
- Screen reader compatible
- Color contrast ratio ≥ 4.5:1 for text
- Alt text for images and icons
- ARIA labels on interactive elements
- Focus indicators visible
- No keyboard traps

---

### NFR-ACC-2: Text Scaling
**Category:** Accessibility  
**Priority:** Should Have

**Requirement:**  
The application shall remain functional when browser text size is increased up to 200%.

**Acceptance Criteria:**
- Layout doesn't break with text scaling
- No horizontal scrolling required
- All content remains accessible
- Relative units (rem, em) used for sizing

---

## 10. Localization and Internationalization

### NFR-LOC-1: Multi-Region Support
**Category:** Localization  
**Priority:** Must Have

**Requirement:**  
The application shall provide accurate calculations for multiple geographical regions.

**Acceptance Criteria:**
- Works for all European countries
- Regional electricity rates
- Regional CO₂ factors
- Appropriate solar databases by region

---

### NFR-LOC-2: Unit Display
**Category:** Localization  
**Priority:** Must Have

**Requirement:**  
The application shall clearly display units of measurement for all values.

**Acceptance Criteria:**
- Energy in kWh or MWh
- Area in m²
- Power in kW or kWp
- Currency with appropriate symbol ($, €, etc.)
- CO₂ in kg or metric tons

---

## 11. Compliance and Standards

### NFR-COMP-1: GDPR Compliance
**Category:** Compliance  
**Priority:** Must Have

**Requirement:**  
The application shall comply with GDPR requirements for EU users.

**Implementation:**
- No personal data collection
- No tracking cookies
- No data storage on servers
- Privacy-by-design approach

**Acceptance Criteria:**
- No personal data processed
- Cookie banner not required (no cookies)
- Privacy policy available (if needed)

---

### NFR-COMP-2: Web Standards
**Category:** Compliance  
**Priority:** Should Have

**Requirement:**  
The application shall follow W3C web standards and HTML5 specifications.

**Acceptance Criteria:**
- Valid HTML5 markup
- Semantic HTML elements
- CSS3 standards
- Modern JavaScript (ES6+)

---

## 12. Technical Debt and Limitations

### Known Limitations

1. **Limited Historical Data**
   - PVGIS data covers 2016-2020
   - May not reflect recent climate changes
   - Documented in disclaimers

2. **Simplified Financial Model**
   - Assumes 100% self-consumption
   - Doesn't account for battery storage
   - No net metering calculations
   - Listed as technical debt

3. **Generic CO₂ Factors**
   - Regional averages, not utility-specific
   - May not reflect renewable energy contracts
   - Future enhancement opportunity

4. **No User Accounts**
   - Cannot save calculations
   - No project history
   - Intentional design choice for privacy

5. **English Language Only**
   - UI in English only (Phase 1)
   - Internationalization deferred to Phase 2

---

## 13. Testing Requirements

### NFR-TEST-1: Browser Testing
**Category:** Testing  
**Priority:** Must Have

**Requirement:**  
The application shall be tested on all supported browsers and devices.

**Test Matrix:**
- Chrome Desktop (Windows, macOS)
- Firefox Desktop
- Safari Desktop (macOS)
- Edge Desktop (Windows)
- Safari Mobile (iOS)
- Chrome Mobile (Android)

---

### NFR-TEST-2: Manual Testing Checklist
**Category:** Testing  
**Priority:** Must Have

**Test Scenarios:**
- [ ] Map loads correctly
- [ ] Location search works
- [ ] Marker placement and dragging
- [ ] Input validation
- [ ] Calculation accuracy
- [ ] Chart rendering
- [ ] Error handling
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Loading states

---

## 14. NFR Summary Matrix

| NFR ID | Category | Priority | Status |
|--------|----------|----------|--------|
| NFR-PERF-1 | Performance | Must Have | ✅ Met |
| NFR-PERF-2 | Performance | Must Have | ✅ Met |
| NFR-PERF-3 | Performance | Should Have | ✅ Met |
| NFR-PERF-4 | Performance | Must Have | ✅ Met |
| NFR-USE-1 | Usability | Must Have | ✅ Met |
| NFR-USE-2 | Usability | Must Have | ✅ Met |
| NFR-USE-3 | Usability | Must Have | ✅ Met |
| NFR-USE-4 | Usability | Must Have | ✅ Met |
| NFR-REL-1 | Reliability | Should Have | 🔄 Monitoring |
| NFR-REL-2 | Reliability | Must Have | ✅ Met |
| NFR-REL-3 | Reliability | Must Have | ✅ Met |
| NFR-REL-4 | Reliability | Should Have | ✅ Met |
| NFR-SEC-1 | Security | Must Have | ✅ Met |
| NFR-SEC-2 | Security | Must Have | ✅ Met |
| NFR-SEC-3 | Security | Must Have | 🔄 Deployment |
| NFR-SEC-4 | Security | Must Have | ✅ Met |
| NFR-MAIN-1 | Maintainability | Must Have | ✅ Met |
| NFR-MAIN-2 | Maintainability | Must Have | ✅ Met |
| NFR-MAIN-3 | Maintainability | Should Have | ✅ Met |
| NFR-MAIN-4 | Maintainability | Must Have | ✅ Met |
| NFR-PORT-1 | Portability | Must Have | ✅ Met |
| NFR-PORT-2 | Portability | Must Have | ✅ Met |
| NFR-PORT-3 | Portability | Should Have | 🔄 Docker Pending |
| NFR-ACC-1 | Accessibility | Should Have | ⚠️ Partial |
| NFR-ACC-2 | Accessibility | Should Have | ✅ Met |
| NFR-COMP-1 | Compliance | Must Have | ✅ Met |
| NFR-COMP-2 | Compliance | Should Have | ✅ Met |

**Legend:**  
✅ Met | ⚠️ Partial | ❌ Not Met | 🔄 In Progress

---

**Document Status:** Final  
**Last Review:** February 2026  
**Approved By:** Enis Berisha
