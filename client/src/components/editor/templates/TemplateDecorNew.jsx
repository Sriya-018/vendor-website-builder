import React, { useState } from 'react';
import TemplateLayoutBase from './TemplateLayoutBase';
import { FaHome, FaInfoCircle, FaSun, FaCloudRain, FaWind, FaPalette, FaCheckSquare } from 'react-icons/fa';

export default function TemplateDecorNew(props) {
  const { config } = props;
  const templateId = config.template || 't29';

  // Niche preset images for AI bg overlays
  const presets = [
    { name: 'Mahogany Living Room', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80' },
    { name: 'Sunlit Outdoor Patio', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80' },
    { name: 'Industrial Concrete Desk', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80' },
    { name: 'Minimalist Zen Corner', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80' }
  ];

  // Unique layout configuration depending on the template ID
  let themeConfig = {};
  if (templateId === 't29') {
    // Manor - Classic Luxury
    themeConfig = {
      layoutClass: 'bg-[#FAF6F0] text-[#3E2723]',
      fontClass: 'font-serif',
      logoTextClass: 'text-[#3E2723] font-bold text-xl uppercase tracking-[0.2em]',
      navbarClass: 'bg-[#FAF6F0]/95 border-b border-[#3E2723]/10 shadow-theme py-4',
      heroClass: 'min-h-[85vh] bg-[#3E2723] text-white',
      heroHeadingClass: 'font-serif text-5xl md:text-7xl leading-tight font-light uppercase tracking-wider text-white',
      ctaButtonClass: 'border border-[#B78A62] text-[#B78A62] hover:bg-[#B78A62] hover:text-white rounded-none py-3 px-8 uppercase font-bold text-xs tracking-wider transition-all',
      catalogSectionClass: 'bg-[#FAF6F0] text-[#3E2723]',
      sectionHeadingClass: 'font-serif text-3xl font-light uppercase tracking-widest text-[#3E2723]',
      productCardClass: 'bg-theme-surface rounded-none border border-[#3E2723]/10 hover:border-[#B78A62] shadow-theme duration-200',
      gallerySectionClass: 'bg-[#FAF6F0] border-t border-[#3E2723]/10',
      faqSectionClass: 'bg-theme-surface border-t border-[#3E2723]/10',
      testimonialsSectionClass: 'bg-[#FAF6F0] border-t border-[#3E2723]/10',
      hoursSectionClass: 'bg-theme-surface border-t border-[#3E2723]/10',
      contactSectionClass: 'bg-[#FAF6F0] border-t border-[#3E2723]/10',
      primaryColor: '#3E2723',
      accentColor: '#B78A62',
      defaultHeroImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
    };
  } else if (templateId === 't30') {
    // Patio - Garden
    themeConfig = {
      layoutClass: 'bg-theme-surface text-theme-text',
      fontClass: 'font-sans',
      logoTextClass: 'text-[#1B4D3E] font-extrabold text-xl tracking-tight uppercase',
      navbarClass: 'bg-theme-surface/95 border-b border-theme-border py-4 shadow-theme',
      heroClass: 'min-h-[80vh] bg-[#1B4D3E] text-white',
      heroHeadingClass: 'font-bold text-5xl md:text-7xl leading-none text-white uppercase',
      ctaButtonClass: 'bg-[#2E8B57] text-white hover:bg-[#1E5E3A] rounded-theme py-3 px-8 font-bold uppercase text-xs tracking-wider',
      catalogSectionClass: 'bg-theme-surface text-theme-text',
      sectionHeadingClass: 'font-extrabold text-3xl tracking-tight text-[#1B4D3E] uppercase',
      productCardClass: 'bg-theme-surface border border-slate-150 rounded-theme shadow-theme hover:shadow-theme hover:border-[#2E8B57]/30 duration-200',
      gallerySectionClass: 'bg-theme-bg border-t border-theme-border',
      faqSectionClass: 'bg-theme-surface border-t border-theme-border',
      testimonialsSectionClass: 'bg-theme-bg border-t border-theme-border',
      hoursSectionClass: 'bg-theme-surface border-t border-theme-border',
      contactSectionClass: 'bg-theme-bg border-t border-theme-border',
      primaryColor: '#1B4D3E',
      accentColor: '#2E8B57',
      defaultHeroImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'
    };
  } else if (templateId === 't31') {
    // Urban - Steel Industrial
    themeConfig = {
      layoutClass: 'bg-[#F9FAFB] text-theme-text',
      fontClass: 'font-sans font-bold',
      logoTextClass: 'text-theme-text font-black text-2xl uppercase tracking-tighter italic',
      navbarClass: 'bg-theme-surface border-b-2 border-theme-border py-4',
      heroClass: 'min-h-[80vh] bg-slate-900 text-white italic',
      heroHeadingClass: 'font-black text-6xl md:text-8xl tracking-tight uppercase text-white',
      ctaButtonClass: 'bg-slate-800 text-white hover:bg-slate-700 rounded-none py-4 px-10 font-bold border-2 border-slate-900 uppercase text-xs',
      catalogSectionClass: 'bg-[#F9FAFB] text-theme-text border-t border-theme-border',
      sectionHeadingClass: 'font-black text-4xl uppercase tracking-tight text-theme-text',
      productCardClass: 'bg-theme-surface rounded-none border border-slate-250 hover:shadow-theme hover:border-slate-800 duration-250',
      gallerySectionClass: 'bg-theme-bg border-t border-slate-250',
      faqSectionClass: 'bg-theme-surface border-t border-slate-250',
      testimonialsSectionClass: 'bg-theme-bg border-t border-slate-250',
      hoursSectionClass: 'bg-theme-surface border-t border-slate-250',
      contactSectionClass: 'bg-[#F9FAFB] border-t border-slate-250',
      primaryColor: '#374151',
      accentColor: '#4B5563',
      defaultHeroImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80'
    };
  } else {
    // Zen - Japanese Minimalist
    themeConfig = {
      layoutClass: 'bg-[#FAF9F6] text-[#2C3539]',
      fontClass: 'font-serif',
      logoTextClass: 'text-[#2C3539] font-bold text-lg uppercase tracking-[0.25em]',
      navbarClass: 'bg-[#FAF9F6]/95 border-b border-[#C2B280]/15 shadow-theme py-4',
      heroClass: 'min-h-[75vh] bg-[#2C3539] text-[#FAF9F6]',
      heroHeadingClass: 'font-serif text-5xl md:text-7xl font-light leading-normal text-white',
      ctaButtonClass: 'bg-[#C2B280] text-black hover:bg-[#B7A57A] rounded-none py-3.5 px-8 font-bold uppercase text-xs tracking-wider',
      catalogSectionClass: 'bg-[#FAF9F6] text-[#2C3539]',
      sectionHeadingClass: 'font-serif text-3xl font-bold text-[#2C3539] uppercase tracking-widest',
      productCardClass: 'bg-theme-surface border border-[#C2B280]/15 hover:border-[#C2B280] shadow-theme duration-200',
      gallerySectionClass: 'bg-[#FAF9F6] border-t border-[#C2B280]/10',
      faqSectionClass: 'bg-theme-surface border-t border-[#C2B280]/10',
      testimonialsSectionClass: 'bg-[#FAF9F6] border-t border-[#C2B280]/10',
      hoursSectionClass: 'bg-theme-surface border-t border-[#C2B280]/10',
      contactSectionClass: 'bg-[#FAF9F6] border-t border-[#C2B280]/10',
      primaryColor: '#2C3539',
      accentColor: '#C2B280',
      defaultHeroImage: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
    };
  }

  // State and Render for Custom Widgets depending on Template ID
  return (
    <TemplateLayoutBase
      {...props}
      templateId={templateId}
      theme={themeConfig}
      presets={presets}
      nicheSectionKey="decorWidget"
      renderNicheWidget={({ primaryColor, accentColor }) => {
        if (templateId === 't29') {
          return <ManorRoomPlanner accentColor={accentColor} />;
        } else if (templateId === 't30') {
          return <PatioWeatherRating accentColor={accentColor} />;
        } else if (templateId === 't31') {
          return <UrbanSwatchSelector accentColor={accentColor} />;
        } else {
          return <ZenFengShuiSteps accentColor={accentColor} />;
        }
      }}
    />
  );
}

// ----------------------------------------------------
// UNIQUE WIDGET 1: Manor Room Scale Estimator
// ----------------------------------------------------
function ManorRoomPlanner({ accentColor }) {
  const [length, setLength] = useState(6);
  const [width, setWidth] = useState(5);

  const getPlannerOutput = () => {
    const area = length * width;
    let recommendation = 'Luxury Armchair and Side Table Set';
    let details = 'Perfect scaling for library alcoves and cozy study setups. Leaves 65% floor workspace clearance.';
    
    if (area > 35) {
      recommendation = 'Grand Suite King Sofa & Dual Chaise Set';
      details = 'Fits spacious lounges and master parlor suites. Optimal scaling for active room aesthetics.';
    } else if (area >= 18 && area <= 35) {
      recommendation = 'Classic Mahogany Chesterfield & Armchair Trio';
      details = 'Perfect sizing for formal studies and mid-sized family reception parlors.';
    }

    return { area, recommendation, details };
  };

  const p = getPlannerOutput();

  return (
    <section className="py-20 px-8 bg-[#FAF6F0] border-t border-b border-[#3E2723]/10 text-[#3E2723] text-left font-serif">
      <div className="max-w-xl mx-auto border border-[#3E2723]/15 p-8 bg-theme-surface rounded-none shadow-theme">
        <div className="text-center mb-8 uppercase">
          <FaHome size={30} className="mx-auto mb-3 text-[#B78A62]" />
          <h2 className="text-2xl font-bold">Classic Room Scale Estimator</h2>
          <p className="text-xs text-theme-muted lowercase mt-1.5 font-sans">Input room dimensions to check layout compatibility</p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between font-bold text-xs mb-2">
              <span>Room Length</span>
              <span>{length} meters</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="10" 
              value={length} 
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full accent-[#3E2723] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold text-xs mb-2">
              <span>Room Width</span>
              <span>{width} meters</span>
            </div>
            <input 
              type="range" 
              min="3" 
              max="8" 
              value={width} 
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="w-full accent-[#3E2723] cursor-pointer"
            />
          </div>

          <div className="mt-8 p-6 bg-[#FAF6F0] border border-[#3E2723]/10">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#B78A62] font-sans">Sizing Match ({p.area} m²)</span>
            <h4 className="text-base font-bold text-[#3E2723] mt-1">{p.recommendation}</h4>
            <p className="text-xs font-light leading-relaxed mt-2 text-slate-650 font-sans">{p.details}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// UNIQUE WIDGET 2: Patio Weather Proofing Rating
// ----------------------------------------------------
function PatioWeatherRating({ accentColor }) {
  const [selectedFurniture, setSelectedFurniture] = useState('teak');

  const assets = {
    teak: {
      name: 'Classique Teak Lounge Chair',
      rain: 'Excellent (Natural oils block moisture)',
      sun: 'Highly Resistant (Resists sun cracking)',
      wind: 'Solid Weight (Heavy natural hardwood)'
    },
    wicker: {
      name: 'All-Weather Wicker Sofa Set',
      rain: 'Good (Synthetic PE weaves repel water)',
      sun: 'UV Protected (Engineered against fading)',
      wind: 'Lightweight (Requires strap anchoring in storms)'
    },
    metal: {
      name: 'Powder-Coated Aluminum Table',
      rain: 'Prone to Rust (Requires dry wipedown)',
      sun: 'Retains Heat (Gets warm under heavy sun)',
      wind: 'Immobile (Heavy wrought layout)'
    }
  };

  const a = assets[selectedFurniture];

  return (
    <section className="py-20 px-8 bg-theme-surface border-t border-b border-theme-border text-theme-text text-left font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-bold text-[#2E8B57]">Material Diagnostics</span>
          <h2 className="text-3xl font-extrabold text-[#1B4D3E] uppercase mt-2">Outdoor Weather Proof Index</h2>
          <div className="w-16 h-1 bg-[#2E8B57] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-10">
          {Object.keys(assets).map(key => (
            <button
              key={key}
              onClick={() => setSelectedFurniture(key)}
              className={`p-4 border rounded-theme transition-all text-center text-xs font-bold uppercase tracking-wider ${
                selectedFurniture === key 
                  ? 'border-[#2E8B57] bg-[#F0FFF4] text-[#2E8B57]' 
                  : 'border-theme-border text-theme-muted bg-theme-surface hover:border-slate-350'
              }`}
            >
              {assets[key].name}
            </button>
          ))}
        </div>

        <div className="p-8 border border-slate-150 rounded-theme bg-theme-surface shadow-theme grid md:grid-cols-3 gap-6">
          <div className="space-y-2 text-center p-4 border border-slate-50 rounded-theme bg-theme-bg/50">
            <FaCloudRain className="mx-auto text-xl text-theme-primary" />
            <h4 className="font-bold text-xs uppercase text-slate-400">Rain & Rust</h4>
            <p className="text-xs font-bold text-theme-text">{a.rain}</p>
          </div>
          <div className="space-y-2 text-center p-4 border border-slate-50 rounded-theme bg-theme-bg/50">
            <FaSun className="mx-auto text-xl text-theme-primary" />
            <h4 className="font-bold text-xs uppercase text-slate-400">Sun & UV Fade</h4>
            <p className="text-xs font-bold text-theme-text">{a.sun}</p>
          </div>
          <div className="space-y-2 text-center p-4 border border-slate-50 rounded-theme bg-theme-bg/50">
            <FaWind className="mx-auto text-xl text-theme-muted" />
            <h4 className="font-bold text-xs uppercase text-slate-400">Wind & Weight</h4>
            <p className="text-xs font-bold text-theme-text">{a.wind}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// UNIQUE WIDGET 3: Urban Industrial Material Swatch
// ----------------------------------------------------
function UrbanSwatchSelector({ accentColor }) {
  const [activeSwatch, setActiveSwatch] = useState('concrete');

  const swatches = {
    concrete: {
      title: 'Polished micro-concrete panels',
      desc: 'Finished with sealant protection. Provides a raw, matte-grey industrial surface texture.',
      density: '2400 kg/m³, high compressive load strength',
      finish: 'Matte non-porous glaze coating'
    },
    oak: {
      title: 'Distressed Smoked Oak Planks',
      desc: 'Wire-brushed oak displaying natural wood grain cracks. Smoked deep brown colors.',
      density: '720 kg/m³, flexible architectural backing',
      finish: 'Water-based natural organic wax sealer'
    },
    slate: {
      title: 'Natural Charcoal Slate Tiles',
      desc: 'Cleaved slate panels featuring unique layer splitting patterns and dark grey highlights.',
      density: '2750 kg/m³, waterproof and anti-scratch surface',
      finish: 'Natural matte cleft cut edges'
    }
  };

  const s = swatches[activeSwatch];

  return (
    <section className="py-20 px-8 bg-[#F9FAFB] border-t border-b border-slate-250 text-slate-850 text-left font-sans tracking-tight">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <FaPalette size={28} className="mx-auto mb-3 text-theme-text" />
          <h2 className="text-3xl font-black uppercase text-theme-text">Industrial Material Swatches</h2>
          <div className="w-16 h-1 bg-slate-950 mx-auto mt-4"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {Object.keys(swatches).map(key => (
            <button
              key={key}
              onClick={() => setActiveSwatch(key)}
              className={`p-4 border-2 border-slate-900 rounded-none text-xs font-black uppercase tracking-wider transition-colors ${
                activeSwatch === key 
                  ? 'bg-slate-900 text-white shadow-none' 
                  : 'bg-theme-surface hover:bg-theme-bg text-theme-text'
              }`}
            >
              {key} swatches
            </button>
          ))}
        </div>

        <div className="bg-theme-surface p-8 rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_#000]">
          <h4 className="font-bold text-sm tracking-wide text-theme-text border-b border-theme-border pb-3 mb-4 uppercase">
            {s.title}
          </h4>
          <p className="text-xs leading-relaxed text-slate-550 mb-5">{s.desc}</p>
          <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-4 uppercase">
            <div>
              <span>Density Weight</span>
              <p className="text-slate-850 mt-1 font-black">{s.density}</p>
            </div>
            <div>
              <span>Coating Finish</span>
              <p className="text-slate-850 mt-1 font-black">{s.finish}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// UNIQUE WIDGET 4: Zen Feng Shui Placement Steps
// ----------------------------------------------------
function ZenFengShuiSteps({ accentColor }) {
  const [activeStep, setActiveStep] = useState(1);

  const steps = {
    1: {
      title: 'Commanding Position Siting',
      desc: 'Set main furniture (bed/sofa) diagonally from the entry doorway. This preserves a full view of room entrants while maintaining clean safety margins.'
    },
    2: {
      title: 'Five Element Balance Check',
      desc: 'Integrate earth tones (sand/bamboo) and wood textures to anchor rooms, adding soft glass accents (water elements) to filter energy flows.'
    },
    3: {
      title: 'Passage Clearance Pathing',
      desc: 'Preserve at least 3 feet of empty pathway margins between large decor objects. Restricts grid crowding to support fluid air currents.'
    }
  };

  const st = steps[activeStep];

  return (
    <section className="py-20 px-8 bg-[#FAF9F6] border-t border-b border-[#C2B280]/15 text-[#2C3539] text-left font-serif">
      <div className="max-w-xl mx-auto border border-[#C2B280]/15 p-8 bg-theme-surface rounded-none shadow-theme">
        <div className="text-center mb-8">
          <FaCheckSquare size={28} className="mx-auto mb-3 text-[#C2B280]" />
          <h2 className="text-2xl font-bold uppercase tracking-widest">Feng Shui Alignment</h2>
          <p className="text-xs text-theme-muted leading-relaxed mt-2 lowercase">Step-by-step layout guide for interior harmony</p>
        </div>

        <div className="flex border-b border-theme-border mb-8 text-xs font-bold text-center">
          {[1, 2, 3].map(num => (
            <button
              key={num}
              onClick={() => setActiveStep(num)}
              className={`flex-1 py-3 border-b-2 transition-all ${
                activeStep === num 
                  ? 'border-[#C2B280] text-black font-bold' 
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              Principle 0{num}
            </button>
          ))}
        </div>

        <div className="bg-[#FAF9F6] p-6 border border-[#C2B280]/10">
          <span className="text-[9px] uppercase tracking-widest font-bold text-[#C2B280] font-sans">Principle 0{activeStep}</span>
          <h4 className="text-base font-bold mt-1">{st.title}</h4>
          <p className="text-xs font-light leading-relaxed mt-2 text-theme-muted font-sans">{st.desc}</p>
        </div>
      </div>
    </section>
  );
}
