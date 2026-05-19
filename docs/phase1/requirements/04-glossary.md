# Glossary

**Project:** Solar Energy Calculator  
**Version:** 1.0  
**Date:** February 2026

---

## Purpose

This glossary defines technical terms, domain-specific terminology, and acronyms used throughout the Solar Energy Calculator project documentation and implementation. It ensures common understanding among stakeholders, developers, and evaluators.

---

## A

### API (Application Programming Interface)
A set of protocols and tools that allows different software applications to communicate with each other. In this project, APIs are used to access Google Maps and PVGIS solar data.

### Azimuth
The compass direction that a solar panel faces, measured in degrees from north. 180° indicates south (optimal in Northern Hemisphere), 0° indicates north. Optimal azimuth maximizes solar energy capture.

### AWS (Amazon Web Services)
A cloud computing platform that provides hosting and infrastructure services. One potential deployment target for the application.

---

## B

### Backend
The server-side logic and data processing layer of the application. In Next.js, this includes API routes that handle solar calculations and external API requests.

### Browser
A software application (Chrome, Firefox, Safari, Edge) used to access and view web pages. The Solar Energy Calculator runs entirely in the user's browser.

---

## C

### Client-Side Rendering (CSR)
Web page rendering that occurs in the user's browser using JavaScript. Used for interactive components like the map and charts.

### CO₂ Emissions Factor
The amount of carbon dioxide (in kilograms) produced per kilowatt-hour of electricity from the regional power grid. Used to calculate environmental impact. Values vary by region based on energy mix (coal, gas, renewable).

### Component
A reusable, self-contained piece of user interface in React. Examples: GoogleMap, SolarResults, input forms.

### CSS (Cascading Style Sheets)
A stylesheet language used to describe the presentation and layout of HTML elements. This project uses Tailwind CSS framework.

---

## D

### Deployment
The process of making the application available on the internet for public access. Involves building, configuring, and hosting on a cloud platform.

### Docker
A platform for developing, shipping, and running applications in containers. Containers package the application with all dependencies for consistent deployment across environments.

### Docker Compose
A tool for defining and running multi-container Docker applications using a YAML configuration file (docker-compose.yml).

---

## E

### Environment Variable
Configuration values stored outside the code, such as API keys. Kept in `.env.local` file and not committed to version control for security.

### ESLint
A static code analysis tool for identifying problematic patterns in JavaScript/TypeScript code. Enforces code quality and consistency.

---

## F

### Frontend
The user-facing part of the application that runs in the browser. Includes the visual interface, map, forms, and charts.

### Functional Requirement
A specification of what the system should do. Example: "The system shall calculate yearly energy production."

---

## G

### Geocoding
The process of converting addresses ("123 Main St, Berlin") into geographic coordinates (latitude/longitude). Used when users search for locations.

### GitHub
A web-based platform for version control and collaboration. Hosts the project's source code repository.

### Google Maps API
Google's service for embedding interactive maps into web applications. Provides map display, location search, and geocoding services.

---

## I

### Irradiance (Solar)
The amount of solar energy (sunlight) received per unit area, typically measured in kilowatt-hours per square meter per year (kWh/m²/year). Key input for solar energy calculations.

---

## J

### JavaScript
The programming language that runs in web browsers, enabling interactive web pages. This project uses JavaScript via TypeScript.

### JSX
JavaScript XML - a syntax extension for JavaScript that allows writing HTML-like code in React components.

---

## K

### kW (Kilowatt)
A unit of power equal to 1,000 watts. Used to measure instantaneous electrical power.

### kWh (Kilowatt-hour)
A unit of energy equal to using one kilowatt of power for one hour. Electric bills are measured in kWh. Solar production is measured in kWh per year.

### kWp (Kilowatt Peak)
The peak power output of a solar panel system under standard test conditions (1000 W/m² irradiance, 25°C cell temperature). Used to specify solar system capacity.

---

## L

### Latitude
The north-south position of a point on Earth's surface, measured in degrees from the equator (0°). Range: -90° (South Pole) to +90° (North Pole).

### Longitude
The east-west position of a point on Earth's surface, measured in degrees from the Prime Meridian (0°). Range: -180° to +180°.

---

## M

### MoSCoW Prioritization
A technique for prioritizing requirements: Must have, Should have, Could have, Won't have. Used to manage scope.

### Module
A self-contained unit of code that performs a specific function. Examples: Solar Data Retrieval Module, Calculation Module.

---

## N

### Next.js
A React framework for building web applications with server-side rendering, API routes, and optimized performance. The foundation of this project.

### NFR (Non-Functional Requirement)
A specification of how the system should behave. Example: "Page load time shall be under 3 seconds." Covers performance, security, usability, etc.

### Node.js
A JavaScript runtime environment that allows JavaScript to run on servers. Next.js is built on Node.js.

### npm (Node Package Manager)
A package manager for JavaScript that handles project dependencies and scripts.

---

## P

### Panel Efficiency
The percentage of solar energy (sunlight) that a solar panel converts into electricity. Modern crystalline silicon panels: 20-22%. Higher efficiency means more power from same area.

### PVGIS (Photovoltaic Geographical Information System)
A free, European Commission-operated service providing solar irradiance data and calculations for locations worldwide. Primary data source for this application.

---

## R

### React
A JavaScript library for building user interfaces using reusable components. Next.js is built on React.

### Recharts
A charting library for React used to create the monthly production and irradiance visualizations.

### Responsive Design
Web design approach where layouts adapt to different screen sizes (mobile, tablet, desktop) for optimal viewing experience.

### REST API
Representational State Transfer - an architectural style for web APIs where requests are made via HTTP methods (GET, POST) to specific endpoints.

---

## S

### SPA (Single Page Application)
A web application that loads a single HTML page and dynamically updates content without full page reloads. Provides faster, more app-like experience.

### Sprint
A fixed time period (typically 1-2 weeks) in Agile development during which specific features are implemented and tested.

### SSL/TLS
Secure Sockets Layer / Transport Layer Security - protocols for encrypting data transmitted over the internet. Enables HTTPS.

### System Efficiency
The overall efficiency of a solar installation after accounting for losses from inverters, wiring, soiling, temperature, and shading. Typically 85-90% (10-15% losses).

### System Losses
Energy losses in a solar installation from factors like inverter conversion, wiring resistance, dust/dirt on panels, and temperature effects. Typically 14% total loss.

---

## T

### Tailwind CSS
A utility-first CSS framework that provides pre-built classes for styling. Used throughout the project for consistent, responsive design.

### Technical Debt
Aspects of the software that are intentionally simplified or incomplete, requiring future improvement. Examples: simplified financial model, single language support.

### Tilt Angle (Slope)
The angle between a solar panel and the horizontal ground, measured in degrees. 0° is flat, 90° is vertical. Optimal tilt maximizes annual energy capture and varies by latitude.

### TypeScript
A superset of JavaScript that adds static type checking. Helps catch errors during development and improves code maintainability.

---

## U

### UML (Unified Modeling Language)
A standardized visual language for modeling software systems. Used to create architecture diagrams (component diagrams, context diagrams).

### UI (User Interface)
The visual elements through which users interact with the application (buttons, forms, maps, charts).

### Use Case
A description of how a user interacts with the system to achieve a specific goal. Example: "User selects location on map to get solar estimate."

### UX (User Experience)
The overall experience and satisfaction a user has when using the application. Includes usability, accessibility, and design quality.

---

## V

### Vercel
A cloud platform optimized for deploying Next.js applications with automatic scaling, HTTPS, and global CDN. Primary deployment target for this project.

### Version Control
The management of changes to code over time using tools like Git. Allows tracking history, reverting changes, and collaborating.

---

## W

### WCAG (Web Content Accessibility Guidelines)
International standards for making web content accessible to people with disabilities. This project targets WCAG 2.1 Level AA compliance.

### Web Application
A software application accessed through a web browser over the internet, as opposed to desktop or mobile apps.

---

## Domain-Specific Solar Energy Terms

### Crystalline Silicon (c-Si)
The most common type of solar panel material, offering good efficiency (20-22%) and reliability. Default panel type assumed in calculations.

### Grid CO₂ Intensity
The amount of CO₂ emissions per kWh of electricity from the regional electrical grid. Depends on energy sources (coal, gas, renewable). Used to calculate environmental impact.

### Monthly Irradiance
Solar energy received per square meter during a specific month. Varies by season - higher in summer, lower in winter in most regions.

### Peak Sun Hours
The equivalent number of hours per day when solar irradiance is at 1000 W/m² (standard test condition). Simplifies solar calculations.

### Photovoltaic (PV)
The technology that converts sunlight directly into electricity using solar cells. "Photovoltaic system" = solar panel system.

### Self-Consumption
The percentage of solar energy produced that is used immediately on-site rather than exported to the grid. This project assumes 100% self-consumption for simplicity.

### Solar Database
Historical weather and solar irradiance data collections. Examples: PVGIS-SARAH2 (Europe), PVGIS-NSRDB (Americas), PVGIS-ERA5 (global).

### Watt Peak (Wp)
The power output of a solar panel under standard test conditions. A 400Wp panel produces 400W under ideal conditions.

### Yearly Irradiance
Total solar energy received per square meter over an entire year, measured in kWh/m²/year. Ranges from ~600 (Arctic) to ~2400 (deserts) globally.

---

## Acronyms Quick Reference

| Acronym | Full Form |
|---------|-----------|
| API | Application Programming Interface |
| AWS | Amazon Web Services |
| CDN | Content Delivery Network |
| CO₂ | Carbon Dioxide |
| CSS | Cascading Style Sheets |
| CSR | Client-Side Rendering |
| FCP | First Contentful Paint |
| GDPR | General Data Protection Regulation |
| HTML | HyperText Markup Language |
| HTTPS | HyperText Transfer Protocol Secure |
| IDE | Integrated Development Environment |
| JSON | JavaScript Object Notation |
| JSX | JavaScript XML |
| kW | Kilowatt |
| kWh | Kilowatt-hour |
| kWp | Kilowatt Peak |
| LCP | Largest Contentful Paint |
| MVP | Minimum Viable Product |
| NFR | Non-Functional Requirement |
| npm | Node Package Manager |
| PV | Photovoltaic |
| PVGIS | Photovoltaic Geographical Information System |
| REST | Representational State Transfer |
| SOLID | Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion |
| SPA | Single Page Application |
| SSL | Secure Sockets Layer |
| TLS | Transport Layer Security |
| TTI | Time to Interactive |
| TypeScript | Typed JavaScript |
| UI | User Interface |
| UML | Unified Modeling Language |
| URL | Uniform Resource Locator |
| UX | User Experience |
| WCAG | Web Content Accessibility Guidelines |
| Wp | Watt Peak |
| YAML | YAML Ain't Markup Language |

---

## References

- **PVGIS Documentation**: https://re.jrc.ec.europa.eu/pvg_tools/en/
- **Google Maps JavaScript API**: https://developers.google.com/maps/documentation/javascript
- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

**Document Status:** Final  
**Last Review:** February 2026  
**Maintained By:** Enis Berisha
