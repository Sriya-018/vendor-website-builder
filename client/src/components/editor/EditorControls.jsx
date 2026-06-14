import React, { useState } from 'react';
import { 
  FaChevronDown, FaChevronUp, FaPalette, FaFont, FaBars, FaImage, FaGripHorizontal, 
  FaMousePointer, FaMobileAlt, FaListAlt, FaShieldAlt, FaBullhorn, FaSearch, FaUniversalAccess, FaHistory
} from 'react-icons/fa';

const THEMES = [
  { name: 'Blue', color: '#2563eb' },
  { name: 'Red', color: '#dc2626' },
  { name: 'Green', color: '#16a34a' },
  { name: 'Purple', color: '#9333ea' },
  { name: 'Orange', color: '#ea580c' },
  { name: 'Dark', color: '#1f2937' },
];

const TEMPLATES = [
  { id: 't1', name: 'Aurora', desc: 'Clean fashion, light, minimal' },
  { id: 't2', name: 'Slate', desc: 'Dark, tech, electronics' },
  { id: 't3', name: 'Bloom', desc: 'Soft pink, beauty, cosmetics' },
  { id: 't4', name: 'Crave', desc: 'Warm, food, restaurant' },
  { id: 't5', name: 'Haven', desc: 'Home, cozy, interior' },
  { id: 't6', name: 'Nexus', desc: 'Modern, corporate, bold' },
  { id: 't7', name: 'Vogue', desc: 'High-end fashion, luxury' },
  { id: 't8', name: 'Pixel', desc: 'Tech, retro, gaming' },
  { id: 't9', name: 'Glow', desc: 'Neon, nightlife, fitness' }
];

function EditorControls({ config, setConfig, website }) {
  const [openSection, setOpenSection] = useState('template'); // default open

  const updateConfig = (category, field, value) => {
    setConfig(prev => {
      // If it's a top-level flat value
      if (typeof prev[category] !== 'object') {
        return { ...prev, [category]: value };
      }
      // If it's nested
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      };
    });
  };

  const Section = ({ id, title, icon: Icon, children }) => {
    const isOpen = openSection === id;
    return (
      <div className="border-b border-gray-100 last:border-b-0">
        <button 
          onClick={() => setOpenSection(isOpen ? null : id)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 font-bold text-gray-800">
            {Icon && <Icon className="text-gray-400 text-lg" />}
            {title}
          </div>
          {isOpen ? <FaChevronUp className="text-gray-400 text-sm" /> : <FaChevronDown className="text-gray-400 text-sm" />}
        </button>
        {isOpen && (
          <div className="p-5 pt-0 bg-white animate-fade-in space-y-5">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white text-sm">
      <div className="p-5 border-b border-gray-200 bg-gray-50 sticky top-0 z-10 shadow-sm">
        <h2 className="font-black text-gray-900 text-lg">Design Controls</h2>
        <p className="text-gray-500 text-xs mt-1">Configure your storefront appearance</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        
        {/* 1. Layout Template */}
        <Section id="template" title="1. Layout Template" icon={FaGripHorizontal}>
          <div className="space-y-3">
            {TEMPLATES.map(t => (
              <div 
                key={t.id}
                onClick={() => setConfig(prev => ({ ...prev, template: t.id }))}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${config.template === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="font-bold text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-500">{t.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 2. Theme Color */}
        <Section id="themeColor" title="2. Theme Color" icon={FaPalette}>
          <div className="flex flex-wrap gap-3">
            {THEMES.map(t => (
              <button
                key={t.name}
                onClick={() => setConfig(prev => ({ ...prev, themeColor: t.color }))}
                className={`w-12 h-12 rounded-full border-4 shadow-sm transition-transform ${config.themeColor === t.color ? 'border-blue-200 scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: t.color }}
                title={t.name}
              />
            ))}
          </div>
        </Section>

        {/* 3. Typography */}
        <Section id="typography" title="3. Typography" icon={FaFont}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Heading Font</label>
              <select 
                value={config.typography.headingFont} 
                onChange={(e) => updateConfig('typography', 'headingFont', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border"
              >
                <option value="sans">Sans-serif (Inter, Roboto)</option>
                <option value="serif">Serif (Merriweather, Playfair)</option>
                <option value="mono">Monospace (Fira Code)</option>
                <option value="display">Display (Oswald, Righteous)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Body Font</label>
              <select 
                value={config.typography.bodyFont} 
                onChange={(e) => updateConfig('typography', 'bodyFont', e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border"
              >
                <option value="sans">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Base Font Size: {config.typography.baseSize}px</label>
              <input 
                type="range" min="12" max="20" 
                value={config.typography.baseSize} 
                onChange={(e) => updateConfig('typography', 'baseSize', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Line Height</label>
                <select value={config.typography.lineHeight} onChange={(e) => updateConfig('typography', 'lineHeight', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md">
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="relaxed">Relaxed</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Letter Spacing</label>
                <select value={config.typography.letterSpacing} onChange={(e) => updateConfig('typography', 'letterSpacing', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md">
                  <option value="tight">Tight</option>
                  <option value="normal">Normal</option>
                  <option value="wide">Wide</option>
                </select>
              </div>
            </div>
          </div>
        </Section>

        {/* 4. Navbar */}
        <Section id="navbar" title="4. Navigation Bar" icon={FaBars}>
           <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Logo Text</label>
              <input 
                type="text" value={config.navbar.logoText} 
                onChange={(e) => updateConfig('navbar', 'logoText', e.target.value)}
                className="w-full p-2 bg-gray-50 border rounded-md"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.navbar.backgroundColor} onChange={(e) => updateConfig('navbar', 'backgroundColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <span className="text-xs uppercase">{config.navbar.backgroundColor}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.navbar.textColor} onChange={(e) => updateConfig('navbar', 'textColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  <span className="text-xs uppercase">{config.navbar.textColor}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Position</label>
              <select value={config.navbar.position} onChange={(e) => updateConfig('navbar', 'position', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md">
                <option value="top">Top Header</option>
                <option value="side">Side Menu</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="font-bold text-gray-700">Show Search Bar</span>
              <input type="checkbox" checked={config.navbar.showSearch} onChange={(e) => updateConfig('navbar', 'showSearch', e.target.checked)} className="w-4 h-4 accent-blue-600" />
            </div>
          </div>
        </Section>

        {/* 5. Header / Hero */}
        <Section id="header" title="5. Header & Hero" icon={FaImage}>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">Announcement Bar</span>
                <input type="checkbox" checked={config.header.announcement.show} onChange={(e) => updateConfig('header', 'announcement', {...config.header.announcement, show: e.target.checked})} className="w-4 h-4 accent-blue-600" />
              </div>
              {config.header.announcement.show && (
                <>
                  <input type="text" value={config.header.announcement.text} onChange={(e) => updateConfig('header', 'announcement', {...config.header.announcement, text: e.target.value})} className="w-full p-2 bg-white border rounded-md text-xs" />
                  <div className="flex items-center gap-2 mt-2">
                    <input type="color" value={config.header.announcement.color} onChange={(e) => updateConfig('header', 'announcement', {...config.header.announcement, color: e.target.value})} className="w-6 h-6" />
                    <span className="text-xs">Bar Color</span>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Hero Heading</label>
              <input type="text" value={config.header.heroHeading} onChange={(e) => updateConfig('header', 'heroHeading', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Hero Subheading</label>
              <textarea value={config.header.heroSubheading} onChange={(e) => updateConfig('header', 'heroSubheading', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md text-xs" rows={2} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">CTA Label</label>
              <input type="text" value={config.header.ctaLabel} onChange={(e) => updateConfig('header', 'ctaLabel', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Alignment</label>
              <select value={config.header.heroAlign} onChange={(e) => updateConfig('header', 'heroAlign', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </Section>

        {/* 6. Spacing & Layout */}
        <Section id="spacing" title="6. Spacing & Layout" icon={FaGripHorizontal}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Border Radius</label>
              <select value={config.spacing.borderRadius} onChange={(e) => updateConfig('spacing', 'borderRadius', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md">
                <option value="sharp">Sharp (0px)</option>
                <option value="rounded">Rounded (8px)</option>
                <option value="pill">Pill (Fully rounded)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Container Width</label>
              <select value={config.spacing.maxWidth} onChange={(e) => updateConfig('spacing', 'maxWidth', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md">
                <option value="narrow">Narrow (960px)</option>
                <option value="normal">Normal (1200px)</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Section Padding</label>
              <select value={config.spacing.padding} onChange={(e) => updateConfig('spacing', 'padding', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md">
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="airy">Airy</option>
              </select>
            </div>
          </div>
        </Section>

        {/* 8. Product Cards */}
        <Section id="products" title="8. Product Cards" icon={FaMousePointer}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Grid Columns (Desktop)</label>
              <select value={config.products.columnsDesktop} onChange={(e) => updateConfig('products', 'columnsDesktop', Number(e.target.value))} className="w-full p-2 bg-gray-50 border rounded-md">
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
              </select>
            </div>
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span>Show Prices</span>
                <input type="checkbox" checked={config.products.showPrices} onChange={(e) => updateConfig('products', 'showPrices', e.target.checked)} className="w-4 h-4 accent-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <span>Show Add to Cart</span>
                <input type="checkbox" checked={config.products.showAddToCart} onChange={(e) => updateConfig('products', 'showAddToCart', e.target.checked)} className="w-4 h-4 accent-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <span>Show Wishlist Icon</span>
                <input type="checkbox" checked={config.products.showWishlist} onChange={(e) => updateConfig('products', 'showWishlist', e.target.checked)} className="w-4 h-4 accent-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <span>Show Star Ratings</span>
                <input type="checkbox" checked={config.products.showStars} onChange={(e) => updateConfig('products', 'showStars', e.target.checked)} className="w-4 h-4 accent-blue-600" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Hover Effect</label>
              <select value={config.products.hoverEffect} onChange={(e) => updateConfig('products', 'hoverEffect', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md">
                <option value="none">None</option>
                <option value="zoom">Zoom Image</option>
                <option value="second-image">Show Second Image</option>
              </select>
            </div>
          </div>
        </Section>

        {/* 9. Buttons */}
        <Section id="buttons" title="9. Buttons" icon={FaMousePointer}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Primary Style</label>
              <select value={config.buttons.primaryStyle} onChange={(e) => updateConfig('buttons', 'primaryStyle', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md">
                <option value="filled">Filled Solid</option>
                <option value="outlined">Outlined</option>
                <option value="ghost">Ghost / Subtle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Size</label>
              <select value={config.buttons.size} onChange={(e) => updateConfig('buttons', 'size', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </Section>

        {/* 12. Footer */}
        <Section id="footer" title="12. Footer" icon={FaListAlt}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tagline</label>
              <input type="text" value={config.footer.tagline} onChange={(e) => updateConfig('footer', 'tagline', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Background</label>
                <input type="color" value={config.footer.bgColor} onChange={(e) => updateConfig('footer', 'bgColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Text Color</label>
                <input type="color" value={config.footer.textColor} onChange={(e) => updateConfig('footer', 'textColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              </div>
            </div>
          </div>
        </Section>

        {/* 13. Trust */}
        <Section id="trust" title="13. Trust & Social Proof" icon={FaShieldAlt}>
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700">Secure Checkout Badge</span>
              <input type="checkbox" checked={config.trust.badges.secure} onChange={(e) => updateConfig('trust', 'badges', {...config.trust.badges, secure: e.target.checked})} className="w-4 h-4 accent-blue-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700">Free Returns Badge</span>
              <input type="checkbox" checked={config.trust.badges.returns} onChange={(e) => updateConfig('trust', 'badges', {...config.trust.badges, returns: e.target.checked})} className="w-4 h-4 accent-blue-600" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700">Live Viewer Counter</span>
              <input type="checkbox" checked={config.trust.liveCounter} onChange={(e) => updateConfig('trust', 'liveCounter', e.target.checked)} className="w-4 h-4 accent-blue-600" />
            </div>
          </div>
        </Section>
        
        {/* 15. SEO */}
        <Section id="seo" title="15. SEO & Metadata" icon={FaSearch}>
           <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-700">Meta Title</label>
                <span className={`text-xs ${config.seo.title.length > 60 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{config.seo.title.length}/60</span>
              </div>
              <input type="text" value={config.seo.title} onChange={(e) => updateConfig('seo', 'title', e.target.value)} className="w-full p-2 bg-gray-50 border rounded-md" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-700">Meta Description</label>
                <span className={`text-xs ${config.seo.description.length > 160 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{config.seo.description.length}/160</span>
              </div>
              <textarea value={config.seo.description} onChange={(e) => updateConfig('seo', 'description', e.target.value)} rows={3} className="w-full p-2 bg-gray-50 border rounded-md" />
            </div>
          </div>
        </Section>
        
        {/* Placeholder for others */}
        <div className="p-6 text-center text-gray-400 text-xs italic">
          Additional sections omitted for brevity in demo...
        </div>

      </div>
    </div>
  );
}

export default EditorControls;
