# Functional Requirements

**Project:** Solar Energy Calculator  
**Version:** 1.0  
**Date:** February 2026

---

## 1. Overview

This document specifies the functional requirements for the Solar Energy Calculator web application. Requirements are organized by feature area and prioritized using MoSCoW method (Must have, Should have, Could have, Won't have).

---

## 2. User Stories

### Epic 1: Location Selection
**As a** property owner  
**I want to** select my property location on an interactive map  
**So that** I can get solar calculations specific to my geographical area

### Epic 2: Solar Calculations
**As a** user  
**I want to** input my available roof space and see energy production estimates  
**So that** I can understand the potential output of a solar installation

### Epic 3: Financial Analysis
**As a** property owner  
**I want to** see estimated cost savings and payback period  
**So that** I can make an informed investment decision

### Epic 4: Results Visualization
**As a** user  
**I want to** view my results in charts and graphs  
**So that** I can easily understand the data and seasonal variations

---

## 3. Detailed Functional Requirements

### FR-1: Location Selection Module

#### FR-1.1: Interactive Map Display
**Priority:** Must Have  
**Description:** The system shall display an interactive Google Maps interface with satellite imagery.

**Acceptance Criteria:**
- Map loads within 3 seconds on standard broadband connection
- Satellite view is available and selectable
- Map supports zoom levels from 1 (world) to 20 (building detail)
- Map is responsive and works on desktop and mobile devices

#### FR-1.2: Location Search
**Priority:** Must Have  
**Description:** The system shall provide a search box for users to find locations by address.

**Acceptance Criteria:**
- Search box accepts text input for addresses, cities, or landmarks
- Autocomplete suggestions appear while typing
- Selecting a suggestion centers the map on that location
- Search works for all European countries

#### FR-1.3: Manual Location Selection
**Priority:** Must Have  
**Description:** Users shall be able to select a location by clicking on the map.

**Acceptance Criteria:**
- Clicking on the map places a marker at that location
- Marker position displays latitude and longitude coordinates
- Subsequent clicks move the marker to the new location
- Marker is visible and clearly distinguishable

#### FR-1.4: Marker Dragging
**Priority:** Should Have  
**Description:** Users shall be able to adjust the marker position by dragging it.

**Acceptance Criteria:**
- Marker is draggable by mouse or touch
- Coordinates update in real-time during dragging
- Smooth drag animation without lag
- Final position updates location data for calculations

#### FR-1.5: Address Geocoding
**Priority:** Should Have  
**Description:** The system shall display a human-readable address for selected coordinates.

**Acceptance Criteria:**
- Address is retrieved via reverse geocoding API
- Address displays below the map or in a dedicated section
- Includes street, city, postal code, and country when available
- Falls back to coordinates if address is unavailable

---

### FR-2: System Configuration Module

#### FR-2.1: Available Area Input
**Priority:** Must Have  
**Description:** Users shall input the available area for solar panel installation in square meters.

**Acceptance Criteria:**
- Input field accepts numeric values from 1 to 10,000 m²
- Input validation prevents negative or zero values
- Clear label explains the measurement unit
- Helper text guides users on how to estimate area

#### FR-2.2: Panel Efficiency Selection
**Priority:** Should Have  
**Description:** Users shall be able to adjust panel efficiency percentage.

**Acceptance Criteria:**
- Default value is 22% (modern panel standard)
- Accepts values between 15% and 25%
- Input includes helper text explaining typical ranges
- Changes immediately affect subsequent calculations

#### FR-2.3: System Losses Configuration
**Priority:** Should Have  
**Description:** Users shall be able to configure system loss percentage.

**Acceptance Criteria:**
- Default value is 14% (industry standard)
- Accepts values between 10% and 20%
- Helper text explains what losses include (inverter, wiring, soiling)
- Pre-filled with recommended value to reduce user burden

#### FR-2.4: Panel Specifications
**Priority:** Should Have  
**Description:** Users shall be able to specify individual panel power and area.

**Acceptance Criteria:**
- Panel power input (default 400W, range 300-600W)
- Panel area input (default 2.0 m², range 1.5-3.0 m²)
- Inputs are used to calculate number of panels
- Values reflect modern panel specifications

---

### FR-3: Solar Data Retrieval Module

#### FR-3.1: PVGIS API Integration
**Priority:** Must Have  
**Description:** The system shall retrieve solar irradiance data from the PVGIS API.

**Acceptance Criteria:**
- API called with latitude, longitude, and configuration parameters
- Response includes yearly irradiance (kWh/m²/year)
- Response includes monthly irradiance data
- Response includes optimal tilt and azimuth angles
- API timeout is handled gracefully (10 second timeout)

#### FR-3.2: Data Validation
**Priority:** Must Have  
**Description:** The system shall validate retrieved solar data before using it in calculations.

**Acceptance Criteria:**
- Verify irradiance values are within reasonable ranges (0-3000 kWh/m²/year)
- Verify monthly data array has exactly 12 values
- Verify tilt angle is between 0° and 90°
- Verify azimuth is between 0° and 360°

#### FR-3.3: Fallback Estimation
**Priority:** Should Have  
**Description:** The system shall provide estimated values if API is unavailable.

**Acceptance Criteria:**
- Fallback calculates estimate based on latitude
- User is notified that estimates are being used
- Warning message indicates reduced accuracy
- Calculation still produces reasonable results

#### FR-3.4: Regional Database Selection
**Priority:** Could Have  
**Description:** The system shall automatically select the appropriate PVGIS database based on location.

**Acceptance Criteria:**
- PVGIS-SARAH2 used for Europe
- PVGIS-NSRDB used for Americas
- PVGIS-ERA5 used for rest of world
- Selection is automatic and transparent to user

---

### FR-4: Energy Calculation Module

#### FR-4.1: Yearly Energy Production
**Priority:** Must Have  
**Description:** The system shall calculate total yearly energy production in kWh.

**Acceptance Criteria:**
- Formula: Energy = Area × Irradiance × Panel Efficiency × System Efficiency
- Result is displayed in kWh/year
- Result is rounded to nearest whole number
- Calculation completes in less than 1 second

#### FR-4.2: Monthly Energy Production
**Priority:** Should Have  
**Description:** The system shall calculate monthly energy production for all 12 months.

**Acceptance Criteria:**
- Individual calculation for each month using monthly irradiance
- Results displayed in array format
- Total of monthly values approximately equals yearly value
- Used for seasonal visualization

#### FR-4.3: System Capacity Calculation
**Priority:** Must Have  
**Description:** The system shall calculate total system capacity in kilowatts peak (kWp).

**Acceptance Criteria:**
- Formula: Capacity = (Number of Panels × Panel Power) / 1000
- Result displayed in kWp with 2 decimal places
- Reflects actual system size that would be installed

#### FR-4.4: Panel Count Calculation
**Priority:** Must Have  
**Description:** The system shall calculate the number of solar panels that fit in the available area.

**Acceptance Criteria:**
- Formula: Panels = Floor(Available Area / Panel Area)
- Result is whole number (no partial panels)
- Accounts for panel dimensions and spacing
- Displayed prominently in results

---

### FR-5: Financial Analysis Module

#### FR-5.1: Regional Electricity Rates
**Priority:** Must Have  
**Description:** The system shall use region-specific electricity rates based on location.

**Acceptance Criteria:**
- Rates stored for major regions (EU, US, Asia, etc.)
- Rate selected automatically based on latitude/longitude
- Rate displayed in local currency equivalent (USD baseline)
- Source of rates documented in code comments

#### FR-5.2: Yearly Savings Calculation
**Priority:** Must Have  
**Description:** The system shall calculate estimated yearly monetary savings.

**Acceptance Criteria:**
- Formula: Savings = Yearly Energy × Electricity Rate
- Result displayed in USD or local currency
- Assumes 100% self-consumption (conservative estimate)
- Displayed with 2 decimal places

#### FR-5.3: Savings Display
**Priority:** Should Have  
**Description:** The system shall display financial savings prominently in results.

**Acceptance Criteria:**
- Yearly savings shown in large, clear text
- Electricity rate used is displayed for transparency
- Currency symbol is included
- Comparison to average household consumption (optional)

---

### FR-6: Environmental Impact Module

#### FR-6.1: CO₂ Savings Calculation
**Priority:** Must Have  
**Description:** The system shall calculate estimated CO₂ emissions avoided.

**Acceptance Criteria:**
- Formula: CO₂ = Yearly Energy × Regional CO₂ Factor
- Regional factors based on grid emission intensity
- Result displayed in kilograms per year
- Also converted to metric tons for large systems

#### FR-6.2: Regional CO₂ Factors
**Priority:** Must Have  
**Description:** The system shall use region-specific CO₂ emission factors.

**Acceptance Criteria:**
- Factors for major regions (EU: 0.276, US: 0.386, etc.)
- Based on grid electricity generation mix
- Automatically selected based on coordinates
- Source documented in code

#### FR-6.3: Tree Equivalence
**Priority:** Should Have  
**Description:** The system shall convert CO₂ savings to equivalent trees planted.

**Acceptance Criteria:**
- Conversion factor: 1 tree absorbs ~21 kg CO₂/year
- Result displayed as whole number of trees
- Provides relatable environmental context
- Optional display (not critical to core functionality)

---

### FR-7: Results Visualization Module

#### FR-7.1: Key Metrics Dashboard
**Priority:** Must Have  
**Description:** The system shall display key results in a clear, visual dashboard.

**Acceptance Criteria:**
- Cards or panels for each major metric
- Large, readable numbers with appropriate units
- Icons to aid quick recognition
- Responsive layout for mobile and desktop

#### FR-7.2: Monthly Production Chart
**Priority:** Should Have  
**Description:** The system shall display a bar chart showing monthly energy production.

**Acceptance Criteria:**
- 12 bars representing each month
- Y-axis shows energy in kWh
- X-axis shows month names
- Clear labels and legend
- Interactive tooltips on hover

#### FR-7.3: Irradiance Visualization
**Priority:** Should Have  
**Description:** The system shall visualize solar irradiance data over the year.

**Acceptance Criteria:**
- Line or area chart showing monthly irradiance
- Y-axis shows kWh/m²
- Seasonal patterns clearly visible
- Synchronized with production chart (same time scale)

#### FR-7.4: System Information Display
**Priority:** Must Have  
**Description:** The system shall display technical system specifications in results.

**Acceptance Criteria:**
- Number of panels
- System capacity (kWp)
- Optimal tilt angle
- Optimal azimuth
- Panel efficiency and system losses used
- Available area

---

### FR-8: User Interface Module

#### FR-8.1: Responsive Design
**Priority:** Must Have  
**Description:** The application shall be fully functional on desktop, tablet, and mobile devices.

**Acceptance Criteria:**
- Layout adapts to screen sizes from 320px to 2560px width
- Touch interactions work on mobile devices
- Text is readable without zooming on all devices
- Maps and charts scale appropriately

#### FR-8.2: Navigation Flow
**Priority:** Must Have  
**Description:** Users shall follow a clear, intuitive flow from input to results.

**Acceptance Criteria:**
- Step-by-step progression (Location → Specs → Calculate → Results)
- Clear calls-to-action for each step
- "Back" functionality to revise inputs
- Progress indication for multi-step process

#### FR-8.3: Loading States
**Priority:** Must Have  
**Description:** The system shall display loading indicators during data fetching and calculations.

**Acceptance Criteria:**
- Spinner or progress indicator during API calls
- Calculate button disabled while processing
- Loading text describes current action
- User cannot double-submit requests

#### FR-8.4: Error Handling and Messages
**Priority:** Must Have  
**Description:** The system shall display clear error messages for all error conditions.

**Acceptance Criteria:**
- API errors show user-friendly messages
- Input validation errors appear near relevant fields
- Error messages are dismissible
- Suggested actions provided where possible

#### FR-8.5: Accessibility
**Priority:** Should Have  
**Description:** The application shall be accessible to users with disabilities.

**Acceptance Criteria:**
- Keyboard navigation supported throughout
- ARIA labels on interactive elements
- Sufficient color contrast (WCAG AA)
- Screen reader compatible
- Alt text on images and icons

---

### FR-9: Data Persistence Module

#### FR-9.1: Browser Session Storage
**Priority:** Could Have  
**Description:** The system could store user inputs in browser session storage.

**Acceptance Criteria:**
- Selected location persists during session
- System specifications persist during session
- Data cleared when browser tab is closed
- Privacy-focused (no server storage)

---

## 4. Use Case Diagram

```
Actor: Property Owner

Use Cases:
- Search Location by Address
- Select Location on Map
- Enter System Specifications
- Calculate Solar Potential
- View Energy Production
- View Financial Savings
- View Environmental Impact
- View Technical Specifications
- Export Results (future)

Actor: PVGIS API
- Provide Solar Irradiance Data

Actor: Google Maps API
- Provide Map Display
- Provide Geocoding Services
```

---

## 5. Requirements Traceability

| Requirement ID | Implemented | Tested | Sprint |
|----------------|-------------|--------|--------|
| FR-1.1 | ✅ | ✅ | Sprint 1 |
| FR-1.2 | ✅ | ✅ | Sprint 1 |
| FR-1.3 | ✅ | ✅ | Sprint 1 |
| FR-1.4 | ✅ | ✅ | Sprint 1 |
| FR-1.5 | ✅ | ✅ | Sprint 1 |
| FR-2.1 | ✅ | ✅ | Sprint 2 |
| FR-2.2 | ✅ | ✅ | Sprint 2 |
| FR-2.3 | ✅ | ✅ | Sprint 2 |
| FR-2.4 | ✅ | ✅ | Sprint 2 |
| FR-3.1 | ✅ | ✅ | Sprint 2 |
| FR-3.2 | ✅ | ✅ | Sprint 2 |
| FR-3.3 | ✅ | ✅ | Sprint 2 |
| FR-4.1 | ✅ | ✅ | Sprint 3 |
| FR-4.2 | ✅ | ✅ | Sprint 3 |
| FR-4.3 | ✅ | ✅ | Sprint 3 |
| FR-4.4 | ✅ | ✅ | Sprint 3 |
| FR-5.1 | ✅ | ✅ | Sprint 4 |
| FR-5.2 | ✅ | ✅ | Sprint 4 |
| FR-5.3 | ✅ | ✅ | Sprint 4 |
| FR-6.1 | ✅ | ✅ | Sprint 4 |
| FR-6.2 | ✅ | ✅ | Sprint 4 |
| FR-6.3 | ✅ | ✅ | Sprint 4 |
| FR-7.1 | ✅ | ✅ | Sprint 3 |
| FR-7.2 | ✅ | ✅ | Sprint 3 |
| FR-7.3 | ✅ | ✅ | Sprint 3 |
| FR-7.4 | ✅ | ✅ | Sprint 3 |
| FR-8.1 | ✅ | ✅ | All Sprints |
| FR-8.2 | ✅ | ✅ | Sprint 1 |
| FR-8.3 | ✅ | ✅ | Sprint 2 |
| FR-8.4 | ✅ | ✅ | All Sprints |
| FR-8.5 | ⚠️ | 🔄 | Sprint 5 |
| FR-9.1 | ❌ | ❌ | Deferred |

**Legend:**  
✅ Complete | ⚠️ Partial | ❌ Not Started | 🔄 In Progress

---

**Document Status:** Final  
**Last Review:** February 2026  
**Approved By:** Enis Berisha
