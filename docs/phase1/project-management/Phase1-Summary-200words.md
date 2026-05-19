# Phase 1: Conception Phase Summary
**Solar Energy Calculator Web Application**  
**Student:** Enis Berisha | **Course:** DLMCSPSE01 | **Date:** February 2026

---

## Project Profile & Methodology

The Solar Energy Calculator is a web-based application designed to help property owners, businesses, and solar consultants estimate solar panel installation potential. The primary objective is to provide accurate, instant solar energy assessments using real-time data from authoritative sources (PVGIS API) combined with interactive location selection via Google Maps.

**Target Audience:** Residential property owners, commercial property managers, solar energy consultants, and real estate developers seeking quick, reliable solar potential estimates without expensive professional consultations.

**Software Development Methodology:** The project follows an **iterative Agile approach** with 1-2 week sprints. This methodology was selected for its flexibility in responding to external API dependencies and technical uncertainties, allowing incremental feature development with continuous testing and refinement. Each sprint delivers working functionality, enabling early validation and adaptation based on technical discoveries.

**Key Technologies:** Next.js 15 (React framework), TypeScript for type safety, Tailwind CSS for responsive design, and serverless architecture via Vercel cloud hosting. This stack ensures scalability, security (API keys protected server-side), and optimal performance through automatic code splitting and CDN distribution.

**Risk Mitigation:** Fallback calculations compensate for API unavailability; domain-restricted API keys prevent misuse; comprehensive error handling ensures graceful degradation.

---

**Word Count:** 198 words
