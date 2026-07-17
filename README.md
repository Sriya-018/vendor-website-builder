# Vendor Website Builder

Vendor Website Builder is a full-stack platform that empowers vendors and small businesses to automatically generate, customize, and manage their online stores using AI. 

## 🚀 Features

### 🤖 AI Capabilities
- **AI-Powered Generation:** Instantly generate a fully functional website tailored to your business category with a single click.
- **AI Web Scraper & Importer:** Paste any existing website URL to automatically crawl, analyze, and recreate the layout and content in our builder.
- **AI Copilot Editor:** Inline AI assistant in the design panel to instantly generate catchy headlines, descriptions, and FAQs.
- **AI Logo Maker:** Generate professional logos and brand assets natively inside the dashboard.
- **Intelligent Assistant:** Built-in AI Chatbot to guide users, recommend templates, and answer queries.

### 🎨 Design & Customization
- **35+ Premium Templates:** Beautifully crafted, industry-specific templates spanning Fashion, Food & Beverage, Tech, Beauty, Home Decor, and Services.
- **Dynamic Content Sourcing:** Automatically injects relevant high-quality stock photography (Unsplash) and default content matching your chosen theme.
- **Live Preview Editor:** Edit your store and see layout, typography, and color palette changes update instantly across Mobile, Tablet, and Desktop views.
- **Full Dark Mode:** Complete dark theme support for both the builder dashboard and generated stores.

### 💼 Store Management
- **Product Management:** Upload products, set prices, and categorize items. Includes **automatic background removal** for clean product imagery.
- **Order Tracking:** Comprehensive order lifecycle management (Pending -> Processing -> Dispatched -> Delivered) with SMS tracking links.
- **Dashboard & Live Analytics:** Track daily views, revenue, active orders, and visitor metrics in real-time.
- **Customer Inquiries:** Built-in messaging center to read and respond to direct messages submitted from your store's contact form.
- **Global Settings:** Manage business information centrally and cascade it down to multiple stores.

### 🛡️ Admin & Security
- **Super Admin Panel:** Dedicated pin-protected dashboard to manage all vendors, review businesses, and track platform-wide revenue.
- **Multi-factor Auth:** Secure login flows utilizing OTP SMS (via Message Central) and Email (via Nodemailer).

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
```

**Environment Variables Configuration:**
You must create a `.env` file inside the `server/` directory and configure the following variables for all features to work correctly.

Create `server/.env` with the following contents:
```env
# Server Configuration
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vendorDB

# Admin Panel Authentication
ADMIN_PIN=12345

# AI Features (Chatbot, Recommendations, Website Generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Image Processing
REMOVE_BG_API_KEY=your_remove_bg_api_key_here

# Email Notifications (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS OTP Authentication (Message Central - Optional)
MESSAGE_CENTRAL_CUSTOMER_ID=your_customer_id
MESSAGE_CENTRAL_PASSWORD=your_password
```

After setting up the `.env` file, start the backend server:
```bash
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


