# Solar Energy Calculator

A comprehensive single-page application (SPA) for estimating solar energy potential based on location and system specifications. Built with Next.js, TypeScript, and Google Maps integration.

## ✨ Features

- **Interactive Location Selection**: Click or drag pins on Google Maps (satellite view)
- **Real-time Solar Data**: Fetches solar irradiance data from PVGIS API
- **Comprehensive Calculations**: Energy production, system sizing, CO₂ savings
- **Visual Analytics**: Charts for monthly production and irradiance patterns
- **Financial Analysis**: Estimated savings based on regional electricity rates
- **Environmental Impact**: CO₂ reduction and tree equivalent calculations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Google Maps API** for location selection
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend API Routes
- `/api/solar` - Fetches solar irradiance data from PVGIS
- `/api/calculate` - Performs energy calculations and financial analysis

### Data Flow
```
User Selects Location → Google Maps → API/Solar → PVGIS Data → 
API/Calculate → Energy Formulas → Results Dashboard
```

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd solar-system-fe
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the project root:

```bash
# Required: Google Maps API Key
# Get yours at: https://console.cloud.google.com/
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Optional: NREL API Key (PVGIS is used by default, no key required)
# Get yours at: https://developer.nrel.gov/signup/
NREL_API_KEY=your_nrel_api_key_here
```

### 3. Google Maps API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional)
4. Create credentials (API Key)
5. Add the API key to your `.env.local` file

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 5. Build for Production
```bash
npm run build
npm start
```

## 📊 How It Works

### Solar Calculations
The application uses industry-standard formulas:

```
Yearly Energy (kWh) = Area (m²) × Solar Irradiance (kWh/m²/year) × Panel Efficiency × System Efficiency

Number of Panels = Area (m²) / Panel Area (typically 2m²)

CO₂ Savings (kg) = Yearly Energy (kWh) × CO₂ Factor (region-specific)

Financial Savings = Yearly Energy (kWh) × Electricity Rate ($/kWh)
```

### Data Sources
- **PVGIS (Primary)**: European Commission's Photovoltaic Geographical Information System
  - Free, no API key required
  - Global coverage with high accuracy
  - Historical weather data (2016-2020)

### System Assumptions
- **Panel Efficiency**: 22% (modern crystalline silicon)
- **System Losses**: 14% (wiring, inverter, soiling)
- **Panel Power**: 400W per panel
- **Panel Area**: 2.0 m² per panel
- **Mounting**: Fixed, optimal tilt and azimuth

## 🗺️ Supported Regions

The application works globally, with optimized support for:
- **Europe**: PVGIS-SARAH2 database (highest accuracy)
- **Americas**: PVGIS-NSRDB database
- **Asia/Africa**: PVGIS-ERA5 database

Regional customizations include:
- Local electricity rates
- Grid CO₂ emission factors
- Climate-based estimates

## 🔧 Customization

### Adding New Solar Data Providers
Extend `/src/app/api/solar/route.ts` to support additional APIs:
- NREL (National Renewable Energy Laboratory)
- OpenWeather Solar API
- Global Solar Atlas
- Local weather services

### Modifying Calculations
Update `/src/app/api/calculate/route.ts` to adjust:
- Panel efficiency assumptions
- System loss factors
- Financial calculations
- Environmental impact factors

### UI Customization
- Components are in `/src/components/`
- Styling uses Tailwind CSS utility classes
- Charts built with Recharts library

## 📱 Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile browsers ✅

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
- **Netlify**: Configure build command as `npm run build`
- **AWS Amplify**: Use the build settings in `next.config.ts`
- **Docker**: Create Dockerfile with Node.js base image

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimers

- Estimates are for reference only
- Actual solar system performance may vary
- Consult with solar professionals for accurate system design
- Local regulations and incentives not included
- Weather patterns may differ from historical data

## 🔗 Resources

- [PVGIS Documentation](https://re.jrc.ec.europa.eu/pvg_tools/en/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Next.js Documentation](https://nextjs.org/docs)
- [Solar Panel Efficiency Guide](https://www.solarreviews.com/blog/solar-panel-efficiency)

## 📧 Support

For questions or issues:
1. Check the [Issues](../../issues) page
2. Review the documentation above
3. Create a new issue with detailed information

---

Built with ☀️ by the Solar Energy Calculator team