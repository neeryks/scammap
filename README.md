# 🛡️ ScamMap

**A comprehensive platform for reporting, tracking, and analyzing scam incidents across India**

ScamMap is a modern web application built to help travelers and consumers report, share, and learn about various types of scams and fraudulent activities. The platform provides a transparent, community-driven database of incidents with professional moderation and evidence-based verification.

![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

### 📊 Comprehensive Scam Categories
- **Dating/Romance Scams** - Online relationship fraud and emotional manipulation
- **Investment/Crypto Scams** - Fraudulent investment schemes and cryptocurrency fraud
- **Employment Scams** - Fake job offers and employment-related fraud
- **Tech Support Scams** - Fake technical support calls and remote access fraud
- **Online Shopping Fraud** - E-commerce and marketplace scams
- **Phishing/Identity Theft** - Data theft and identity fraud
- **Harassment/Extortion** - Threats, blackmail, and coercion
- **Real Estate/Rental Fraud** - Property and accommodation scams
- **And 15+ more categories**

### 🎯 Multi-Dimensional Impact Tracking
- **Financial Losses** - Traditional monetary damage tracking
- **Emotional Impact** - Stress, anxiety, depression, trust issues
- **Time Investment** - Hours, days, weeks, or months lost
- **Data Compromise** - Personal information, documents, photos theft
- **Harassment** - Threats, coercion, and ongoing abuse
- **Reputation Damage** - Professional and personal reputation impact
- **Privacy Violations** - Personal privacy breaches

### 🗺️ Interactive Features
- **Live Map View** - Geographic visualization of incidents across India
- **Risk Scoring** - AI-powered scam meter scoring (0-100)
- **Evidence Upload** - Support for photos, documents, and chat screenshots
- **Advanced Search** - Filter by location, category, and impact type
- **Community Verification** - Peer review and moderation system

### 🔒 Privacy & Security
- **Data Protection** - Automatic PII redaction and face blurring
- **Anonymous Reporting** - Multiple privacy levels for reporters
- **Moderation System** - Professional content review and verification
- **Evidence Security** - Secure file handling and storage

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.4.6** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **shadcn/ui** - Modern component library with Radix UI
- **Lucide React** - Beautiful icon library

### Backend
- **Next.js API Routes** - Serverless API functions
- **LowDB** - Lightweight JSON database
- **Zod** - Runtime type validation
- **Formidable** - File upload handling

### Maps & Visualization
- **MapLibre GL** - Interactive maps
- **React Map GL** - React map components
- **Chart.js** - Data visualization

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Turbopack** - Fast bundler for development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/scammap.git
cd scammap
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Add other environment variables as needed
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
scammap/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── reports/       # Reports API
│   │   │   └── venues/        # Venues API
│   │   ├── incidents/         # Incident pages
│   │   ├── report/            # Report submission
│   │   ├── map/               # Interactive map
│   │   ├── education/         # Educational content
│   │   ├── data/              # Data & research
│   │   └── search/            # Search functionality
│   ├── components/            # Reusable components
│   │   └── ui/                # shadcn/ui components
│   └── lib/                   # Utilities and types
│       ├── types.ts           # TypeScript definitions
│       ├── schemas.ts         # Zod validation schemas
│       ├── db.ts              # Database utilities
│       └── utils.ts           # Helper functions
├── public/                    # Static assets
├── data/                      # JSON database files
└── docs/                      # Documentation
```

## 🎨 Design System

### Color Palette
- **Primary**: Slate (50, 100, 600, 900)
- **Success**: Green (50, 600, 800)
- **Warning**: Amber (50, 600, 800)  
- **Error**: Red (50, 600, 800)
- **Info**: Blue (50, 600, 800)

### Typography
- **Headings**: Font weights 700-900
- **Body**: Font weight 400-500
- **Captions**: Font weight 400, smaller sizes

### Components
- **Cards**: Clean shadows with hover effects
- **Buttons**: Consistent sizing and states
- **Forms**: Professional input styling
- **Badges**: Color-coded category indicators

## 🔧 Configuration

### Environment Variables
```env
# Base URL for the application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database configuration (if using external DB)
DATABASE_URL=your_database_url

# File upload settings
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/*,application/pdf

# Moderation settings
AUTO_MODERATION=true
REQUIRE_APPROVAL=false
```

### Custom Configuration
The app uses a flexible configuration system. Modify `src/lib/config.ts` for:
- Scam categories
- Risk scoring algorithms
- Moderation rules
- UI preferences

## 📊 API Documentation

### Reports API

#### GET `/api/reports`
Get all reports with optional filtering
```javascript
// Query parameters
?category=dating-romance&limit=10&offset=0
```

#### POST `/api/reports`
Submit a new report
```javascript
{
  "venue": "Business Name",
  "address": "Full Address",
  "scamType": "dating-romance",
  "lossType": "emotional",
  "description": "Detailed description",
  "evidence": File // Optional
}
```

### Venues API

#### GET `/api/venues`
Get all venues with incident counts
```javascript
[
  {
    "id": "uuid",
    "name": "Venue Name", 
    "address": "Address",
    "incident_count": 5,
    "avg_risk_score": 85
  }
]
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Coding Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Write descriptive commit messages
- Add proper error handling
- Include appropriate comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** - For the beautiful component library
- **Radix UI** - For accessible component primitives  
- **MapLibre** - For open-source mapping
- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For utility-first styling

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/scammap/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/scammap/discussions)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy!

### Other Platforms
- **Netlify**: Use `npm run build` and deploy `out/` folder
- **Railway**: Connect GitHub and auto-deploy
- **DigitalOcean**: Use App Platform with Node.js

## 🔄 Changelog

### v0.1.0 (Current)
- ✅ Initial release
- ✅ Comprehensive scam reporting
- ✅ Multi-dimensional impact tracking  
- ✅ Interactive map visualization
- ✅ Professional design system
- ✅ Evidence upload system
- ✅ Advanced search and filtering

### Upcoming Features
- 🔄 User authentication system
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app (React Native)
- 🔄 AI-powered scam detection
- 🔄 Integration with law enforcement APIs
- 🔄 Multi-language support

---

**Built with ❤️ for safer communities across India**

*Help us build a safer digital world by reporting and sharing information about scams and fraudulent activities.*
