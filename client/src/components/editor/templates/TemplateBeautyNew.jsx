import React, { useState } from 'react';
import TemplateLayoutBase from './TemplateLayoutBase';
import { FaLeaf, FaTint, FaWind, FaInfoCircle } from 'react-icons/fa';

export default function TemplateBeautyNew(props) {
  const { config } = props;
  const templateId = config.template || 't22';

  // Niche preset images for AI bg overlays
  const presets = [
    { name: 'Onyx Black Elixir', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
    { name: 'Pure Botanical Spa', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80' },
    { name: 'Rose Petal Aromas', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80' }
  ];

  // Unique layout configuration depending on the template ID
  let themeConfig = {};
  if (templateId === 't22') {
    // Onyx - Luxury Cosmetics
    themeConfig = {
      layoutClass: 'bg-[#0D0D0D] text-white',
      fontClass: 'font-serif',
      logoTextClass: 'text-white font-normal text-2xl uppercase tracking-[0.25em] font-serif',
      navbarClass: 'bg-[#0D0D0D]/95 border-b border-yellow-900/10 shadow-lg py-5',
      heroClass: 'min-h-[85vh] bg-[#0D0D0D] text-white',
      heroHeadingClass: 'font-serif text-5xl md:text-7xl leading-tight font-light uppercase tracking-wider text-white',
      ctaButtonClass: 'border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-[#0D0D0D] rounded-none py-3 px-8 uppercase font-bold tracking-widest transition-all',
      catalogSectionClass: 'bg-[#0D0D0D] text-white border-t border-yellow-900/10',
      sectionHeadingClass: 'font-serif text-3xl font-light uppercase tracking-widest text-[#C5A880]',
      productCardClass: 'bg-black border border-yellow-900/10 rounded-none hover:border-[#C5A880]/40 shadow-sm hover:shadow-[0_0_20px_rgba(197,168,128,0.05)] duration-300',
      gallerySectionClass: 'bg-[#0D0D0D] border-t border-yellow-900/10',
      faqSectionClass: 'bg-black border-t border-[#111]',
      testimonialsSectionClass: 'bg-[#0D0D0D] border-t border-yellow-900/10',
      hoursSectionClass: 'bg-black border-t border-[#111]',
      contactSectionClass: 'bg-[#0D0D0D] border-t border-yellow-900/10',
      primaryColor: '#0D0D0D',
      accentColor: '#C5A880',
      defaultHeroImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80'
    };
  } else if (templateId === 't23') {
    // Mist - Spa Hydration
    themeConfig = {
      layoutClass: 'bg-[#F0F8FF] text-[#0A2540]',
      fontClass: 'font-sans font-light',
      logoTextClass: 'text-[#0A2540] font-bold text-xl tracking-wide',
      navbarClass: 'bg-[#F0F8FF]/95 border-b border-[#0A2540]/10 shadow-sm py-4',
      heroClass: 'min-h-[80vh] bg-[#0A2540] text-white',
      heroHeadingClass: 'font-light text-5xl md:text-7xl leading-tight text-white',
      ctaButtonClass: 'bg-[#00D2FF] text-[#0A2540] hover:bg-[#00E5FF] rounded-full py-3 px-8 shadow-sm font-bold uppercase tracking-wider text-xs',
      catalogSectionClass: 'bg-[#F0F8FF] text-[#0A2540]',
      sectionHeadingClass: 'font-bold text-3xl tracking-tight text-[#0A2540]',
      productCardClass: 'bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-cyan-500/20 duration-200',
      gallerySectionClass: 'bg-[#F0F8FF] border-t border-slate-100',
      faqSectionClass: 'bg-white border-t border-slate-100',
      testimonialsSectionClass: 'bg-[#F0F8FF] border-t border-slate-100',
      hoursSectionClass: 'bg-white border-t border-slate-100',
      contactSectionClass: 'bg-[#F0F8FF] border-t border-slate-100',
      primaryColor: '#0A2540',
      accentColor: '#00D2FF',
      defaultHeroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
    };
  } else {
    // Petal - Perfumery Rose
    themeConfig = {
      layoutClass: 'bg-[#FDF2F8] text-[#4C1D95]',
      fontClass: 'font-serif',
      logoTextClass: 'text-[#4C1D95] font-black text-xl italic tracking-tight',
      navbarClass: 'bg-[#FDF2F8]/95 border-b border-[#EC4899]/10 shadow-sm py-4',
      heroClass: 'min-h-[75vh] bg-[#4C1D95] text-white',
      heroHeadingClass: 'font-serif text-5xl md:text-7xl font-bold leading-normal text-white',
      ctaButtonClass: 'bg-[#EC4899] text-white hover:bg-[#DB2777] rounded-none py-3.5 px-8 font-bold',
      catalogSectionClass: 'bg-[#FDF2F8] text-[#4C1D95]',
      sectionHeadingClass: 'font-serif text-3xl font-bold text-[#4C1D95]',
      productCardClass: 'bg-white border border-[#EC4899]/10 rounded-xl shadow-sm hover:shadow-md hover:border-[#EC4899]/30 duration-200',
      gallerySectionClass: 'bg-[#FDF2F8] border-t border-[#EC4899]/10',
      faqSectionClass: 'bg-white border-t border-[#EC4899]/10',
      testimonialsSectionClass: 'bg-[#FDF2F8] border-t border-[#EC4899]/10',
      hoursSectionClass: 'bg-white border-t border-[#EC4899]/10',
      contactSectionClass: 'bg-[#FDF2F8] border-t border-[#EC4899]/10',
      primaryColor: '#4C1D95',
      accentColor: '#EC4899',
      defaultHeroImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80'
    };
  }

  // State and Render for Custom Widgets depending on Template ID
  return (
    <TemplateLayoutBase
      {...props}
      templateId={templateId}
      theme={themeConfig}
      presets={presets}
      nicheSectionKey="beautyWidget"
      renderNicheWidget={({ primaryColor, accentColor }) => {
        if (templateId === 't22') {
          return <OnyxIngredientMeter accentColor={accentColor} />;
        } else if (templateId === 't23') {
          return <MistHydrationAssessment accentColor={accentColor} />;
        } else {
          return <PetalScentRadar accentColor={accentColor} />;
        }
      }}
    />
  );
}

// ----------------------------------------------------
// UNIQUE WIDGET 1: Onyx Ingredient safety & purity
// ----------------------------------------------------
function OnyxIngredientMeter({ accentColor }) {
  const [selectedItem, setSelectedItem] = useState('squalane');

  const ingredients = {
    squalane: {
      name: 'Vegan Olive Squalane',
      purity: '99.8%',
      safety: 'Clean-Green Rated',
      origin: 'Farmed organically in Spain, cold-filtered to retain lipids.'
    },
    prickly_pear: {
      name: 'Prickly Pear Seed Extract',
      purity: '100% Cold-Pressed',
      safety: 'EWG Skin-Deep Level 1',
      origin: 'Hand harvested from Moroccan desert succulents.'
    },
    centella: {
      name: 'Centella Asiatica (Cica)',
      purity: '95% Active Fraction',
      safety: 'Hypoallergenic Tested',
      origin: 'Wild crafted from wetlands in Madagascar, water extracted.'
    }
  };

  const ing = ingredients[selectedItem];

  return (
    <section className="py-20 px-8 bg-black border-t border-b border-yellow-900/10 text-white font-serif text-left">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880]">Clinical Organic Standard</span>
          <h2 className="text-3xl font-light uppercase tracking-widest mt-2">Active Ingredients Purity</h2>
          <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-4"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-10">
          {Object.keys(ingredients).map(key => (
            <button
              key={key}
              onClick={() => setSelectedItem(key)}
              className={`p-4 border transition-all text-center uppercase tracking-widest text-[10px] font-semibold ${
                selectedItem === key 
                  ? 'border-[#C5A880] bg-[#0D0D0D]' 
                  : 'border-yellow-900/15 hover:border-yellow-900/30'
              }`}
            >
              <FaLeaf className="mx-auto mb-2 text-sm text-[#C5A880]" />
              {ingredients[key].name}
            </button>
          ))}
        </div>

        <div className="p-8 border border-yellow-900/10 bg-[#0D0D0D] grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h4 className="font-semibold text-xs tracking-widest uppercase text-[#C5A880]">Organic Sourcing</h4>
            <p className="text-sm font-light text-slate-300 leading-relaxed">{ing.origin}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-yellow-900/15 text-center">
              <span className="text-3xl font-light text-[#C5A880]">{ing.purity}</span>
              <p className="text-[9px] uppercase tracking-widest text-slate-450 mt-1">Purity Rating</p>
            </div>
            <div className="p-4 border border-yellow-900/15 text-center">
              <span className="text-xs font-semibold uppercase text-slate-350 block mt-3">{ing.safety}</span>
              <p className="text-[9px] uppercase tracking-widest text-slate-450 mt-1.5">Safety Index</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// UNIQUE WIDGET 2: Mist Hydration Assessment Tool
// ----------------------------------------------------
function MistHydrationAssessment({ accentColor }) {
  const [moisture, setMoisture] = useState(30);

  const getRecommendation = () => {
    if (moisture < 25) {
      return {
        level: 'Extremely Dehydrated',
        product: 'Deep Ceramide Mist',
        desc: 'Skin barrier requires urgent lipid restoration. Spray generously twice daily.'
      };
    } else if (moisture >= 25 && moisture < 65) {
      return {
        level: 'Mildly Dry Skin',
        product: 'Hyaluronic Acid Tonic',
        desc: 'Maintains optimal moisture level. Use after washing for lightweight balancing hydration.'
      };
    } else {
      return {
        level: 'Healthy Dewy Hydration',
        product: 'Light Balancing Mist',
        desc: 'Skin is highly hydrated. Mist lightly as a refreshing top-up during the day.'
      };
    }
  };

  const rec = getRecommendation();

  return (
    <section className="py-20 px-8 bg-white border-t border-b border-slate-100 text-[#0A2540] text-left font-sans">
      <div className="max-w-xl mx-auto border border-slate-150 p-8 rounded-2xl bg-[#F0F8FF]/40 shadow-sm">
        <div className="text-center mb-8 uppercase font-bold">
          <FaTint size={30} className="mx-auto mb-3 text-[#00D2FF]" />
          <h2 className="text-2xl tracking-tight">Hydration Level Assessment</h2>
          <p className="text-xs font-light text-slate-500 lowercase mt-1">Adjust slider to map your skin moisture index</p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between font-bold text-xs mb-2">
              <span>Current Moisture Index</span>
              <span>{moisture}%</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="95" 
              value={moisture} 
              onChange={(e) => setMoisture(parseInt(e.target.value))}
              className="w-full accent-[#0A2540] cursor-pointer"
            />
          </div>

          <div className="mt-8 p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00D2FF]">{rec.level}</span>
            <h4 className="text-lg font-bold text-[#0A2540] mt-1">{rec.product}</h4>
            <p className="text-xs font-light text-slate-500 leading-relaxed mt-2">{rec.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// UNIQUE WIDGET 3: Petal Scent Profile Radar
// ----------------------------------------------------
function PetalScentRadar({ accentColor }) {
  const [floral, setFloral] = useState(50);
  const [citrus, setCitrus] = useState(30);
  const [woody, setWoody] = useState(20);

  const getProfile = () => {
    const total = floral + citrus + woody;
    const fPct = floral / total;
    const cPct = citrus / total;
    const wPct = woody / total;

    if (fPct > 0.5) {
      return {
        name: 'Sensual Velvet Rose',
        notes: 'Top notes of red damask rose petals, with a warm jasmine heart.'
      };
    } else if (cPct > 0.4) {
      return {
        name: 'Fresh Neroli Citrus',
        notes: 'Zesty orange blossom, sparkling mandarin zest, clean lavender.'
      };
    } else if (wPct > 0.4) {
      return {
        name: 'Earthy Sandalwood Cedar',
        notes: 'Deep cedarwood chips, raw vetiver roots, and a warm amber accord.'
      };
    } else {
      return {
        name: 'Harmonious Botanical Accord',
        notes: 'Balanced blend of herbal chamomile, light citrus, and soft dry wood.'
      };
    }
  };

  const p = getProfile();

  return (
    <section className="py-20 px-8 bg-[#FDF2F8] border-t border-b border-[#EC4899]/10 text-[#4C1D95] text-left font-serif">
      <div className="max-w-xl mx-auto border border-[#EC4899]/10 p-8 rounded-2xl bg-white shadow-sm">
        <div className="text-center mb-8">
          <FaWind size={28} className="mx-auto mb-3 text-[#EC4899]" />
          <h2 className="text-2xl font-bold">Interactive Scent Profile</h2>
          <p className="text-xs font-light text-slate-500 leading-relaxed mt-1">Blend note components to generate your matching fragrance</p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span>Floral Accords</span>
              <span>{floral}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={floral} 
              onChange={(e) => setFloral(parseInt(e.target.value))}
              className="w-full accent-[#EC4899] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span>Citrus Zest</span>
              <span>{citrus}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={citrus} 
              onChange={(e) => setCitrus(parseInt(e.target.value))}
              className="w-full accent-[#EC4899] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span>Woody Depth</span>
              <span>{woody}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={woody} 
              onChange={(e) => setWoody(parseInt(e.target.value))}
              className="w-full accent-[#EC4899] cursor-pointer"
            />
          </div>

          <div className="mt-8 p-6 bg-[#FDF2F8] border border-[#EC4899]/10 rounded-xl">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#EC4899]">Scent Profile Match</span>
            <h4 className="text-base font-bold text-[#4C1D95] mt-1">{p.name}</h4>
            <p className="text-xs font-light text-slate-500 leading-relaxed mt-2">{p.notes}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
