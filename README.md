# Vendor Website Builder

Vendor Website Builder is a full-stack platform that empowers vendors and small businesses to automatically generate, customize, and manage their online stores using AI. 

## 🚀 Features

- **AI-Powered Generation:** Instantly generate a fully functional website tailored to a business category with a single click.
- **Dynamic Themes & Templates:** Choose from beautifully crafted templates (Aurora, Slate, Bloom, Crave, Haven, Nexus, Pixel, Glow, Vogue) with customizable primary, secondary, and accent colors.
- **Live Preview Editor:** See your changes in real-time as you tweak your business information, store name, theme, and logo.
- **Global & Store-Specific Settings:** Manage global defaults for your business and seamlessly cascade them down to individual stores, or override them per store.
- **Product Management:** Upload product images with automatic background removal, set prices, and categorize items.
- **Dashboard & Analytics:** Track website views, recent orders, and overall revenue directly from the central dashboard.

## 🛠️ Technology Stack

**Frontend (Client):**
- React 18 + Vite
- Tailwind CSS for modern, responsive styling
- React Router DOM for navigation
- React Icons

**Backend (Server):**
- Node.js & Express.js
- MongoDB & Mongoose (Database)
- Multer (Image handling & uploads)
- External AI/Background Removal APIs

## 📁 Project Structure

```
vendor-website-builder/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # UI Components (Dashboard, Editor, Templates)
│   │   ├── pages/          # Main application views (Dashboard, Templates, etc.)
│   │   └── index.css       # Tailwind entry and global styles
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js Express backend
│   ├── models/             # Mongoose schemas (Business, Website, Product, Order)
│   ├── routes/             # API routes (aiRoutes, businessRoutes, websiteRoutes)
│   ├── uploads/            # Local storage for user-uploaded images and logos
│   ├── server.js           # Express server entry point
│   └── .env                # Environment variables
└── README.md
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally or a MongoDB URI
- Environment variables configured (e.g., API keys for background removal, AI, and Gmail SMTP if used)

### 1. Setup the Backend
```bash
cd server
npm install

# Create a .env file and add your MongoDB URI and port
# MONGO_URI=mongodb://127.0.0.1:27017/vendorDB
# PORT=5000

node server.js
```

### 2. Setup the Frontend
```bash
cd client
npm install

# Run the Vite development server
npm run dev
```

### 3. Usage
- Open your browser and navigate to `http://localhost:5173`.
- Create a new business profile.
- Navigate to the **Design & Theme** page to generate a new store website.
- Use the **Dashboard** to manage your store logo, products, and incoming orders!

## 📝 License
This project is proprietary and built for the VendorBuild platform.
