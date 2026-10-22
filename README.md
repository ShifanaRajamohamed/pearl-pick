# PEARL PICK! 👗✨
### AI-Powered Bespoke Dress Design & Tailor Marketplace

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-GenAI_SDK-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**PEARL PICK!** is a next-generation bespoke fashion marketplace that bridges the gap between imagination and reality. Customers can design custom dresses with Google Gemini AI, generate detailed technical tailoring specifications, discover verified master tailors, request and compare quotations, securely place custom orders with UPI payments, and track the progress of their outfits from fabric cutting to door delivery.

---

## 🌟 Key Features

### 🎨 AI Dress Generator & Design Studio
- **Generative Fashion AI**: Prompt custom dress silhouettes, fabrics, necklines, sleeves, patterns, and embellishments powered by Google's Gemini API.
- **Specification Sheet Export**: Automatically generates precise technical measurement charts, fabric requirement estimations, stitch blueprints, and PDF-ready spec sheets.
- **Interactive Design Viewer**: High-definition previews with fabric swatches, color variants, and styling details.

### 🧵 Tailor Marketplace & Verification
- **Curated Artisan Network**: Browse verified tailors categorized by specialties (bridal, ethnic, contemporary, haute couture).
- **Ratings & Portfolios**: View customer reviews, real crafted garments, verification badges, and turnaround time estimates.
- **Quotation Comparison**: Submit design requests to multiple tailors simultaneously and compare pricing, fabric recommendations, and delivery dates.

### 📐 Smart Measurement Sheets
- **Digital Measurement Studio**: Step-by-step interactive body measurement guides for accurate bespoke fitting.
- **Measurement Profiles**: Store and reuse multiple profiles (Self, Family, Wedding party).

### 💬 AI Style Assistant & Real-Time Chat
- **Personal Fashion Stylist**: Ask for event-specific styling advice, seasonal fabric recommendations, color palette pairings, and accessory recommendations.
- **Direct Tailor Communication**: Discuss stitching nuances, fit preferences, and status updates directly with the artisan.

### 📦 Seamless Orders & UPI Payments
- **Transparent Milestones**: Track progress through each crafting phase: *Order Confirmed*, *Fabric Sourced*, *Cutting & Stitching*, *Quality Check*, and *Out for Delivery*.
- **Integrated UPI Payment Simulation**: Built-in payment modal supporting standard UPI flows and QR codes.

### 🛡️ Multi-Role Portals
- **Customer Portal**: Discover, generate, request quotes, and manage wardrobe orders.
- **Tailor Dashboard**: Manage incoming quotation requests, update active garment statuses, and submit verification credentials.
- **Admin Dashboard**: Platform-wide metrics, tailor KYC verification approvals, revenue analytics, and dispute resolution.

### 📱 Progressive Web App (PWA)
- **Installable**: Installable directly on Android, iOS, Windows, and macOS as a standalone native-like app.
- **Offline Capable**: Service worker caching with Workbox for fast load times and reliable offline experiences.
- **Device Frame Toggle**: Test and preview mobile and desktop views directly within the browser.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Lucide Icons, Canvas Confetti, Motion animations
- **Styling**: Tailwind CSS v4, custom glassmorphism and modern UI components
- **Backend**: Express.js server, TypeScript, tsx, esbuild
- **AI Engine**: Google GenAI SDK (`@google/genai`) with Gemini models
- **Bundler & Tooling**: Vite 6, TypeScript Compiler (`tsc`), `vite-plugin-pwa`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x, 20.x, or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- A **Google Gemini API Key** (Get free access from [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/pearl-pick.git
cd pearl-pick
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the sample environment file:

```bash
# On Linux / macOS
cp .env.example .env

# On Windows PowerShell
Copy-Item .env.example .env
```

Open `.env` and add your Gemini API Key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
APP_URL=http://localhost:3000
```

> **Note**: The application includes fallback mock generation data if no API key is supplied, enabling smooth local development and UI testing without an active API key!

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the full-stack development server with hot-reload via `tsx server.ts` |
| `npm run build` | Compiles the Vite frontend and bundles the Express backend into `dist/` |
| `npm run start` | Runs the compiled production server from `dist/server.cjs` |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run preview` | Previews the compiled Vite build locally |
| `npm run clean` | Cleans up the `dist/` directory |

---

## 📁 Project Structure

```text
pearl-pick/
├── .github/
│   └── workflows/
│       └── ci.yml            # Automated GitHub Actions CI workflow
├── public/
│   ├── assets/               # Static icons and assets
│   ├── manifest.json         # PWA Web App Manifest
│   └── sw.js                 # Service worker
├── scripts/
│   └── generate-icons.js     # Script to generate PWA icons
├── src/
│   ├── components/
│   │   ├── Admin/            # Admin dashboard and analytics
│   │   ├── Auth/             # Authentication modals and flows
│   │   ├── Common/           # Shared UI buttons, badges, modals
│   │   ├── Customer/         # Customer design generator, marketplace, profile, viewer
│   │   ├── Documentation/    # Platform guide and API documentation
│   │   ├── Tailor/           # Tailor workspace, order management, verification
│   │   └── Navbar.tsx        # Responsive navigation bar
│   ├── data/                 # Sample datasets (tailors, orders, designs)
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API client and Gemini AI services
│   ├── types/                # TypeScript interface and type definitions
│   ├── App.tsx               # Primary application orchestrator
│   └── main.tsx              # React DOM entrypoint
├── .env.example              # Template for environment variables
├── .gitattributes            # Git line ending normalization rules
├── .gitignore                # Comprehensive Git ignore rules
├── package.json              # Project dependencies & scripts
├── server.ts                 # Full-stack Express server & Gemini proxy
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite & Tailwind & PWA configuration
```

---

## 🚀 Production Deployment

### Build the project:
```bash
npm run build
```

### Start the production server:
```bash
npm run start
```

### Deploying to Cloud Providers:
This project is container-ready and can be deployed directly to:
- **Render / Railway / Fly.io**: Connect your GitHub repository, set `GEMINI_API_KEY` in environment variables, set the build command to `npm run build`, and start command to `npm run start`.
- **Google Cloud Run**: Build with Docker or Google Cloud Buildpacks and configure the Cloud Run service port to the container port.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/YOUR_USERNAME/pearl-pick/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more details.
