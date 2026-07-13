import React, { useState } from 'react';
import TemplateLayoutBase from './TemplateLayoutBase';
import { FaExchangeAlt, FaGamepad, FaInfoCircle, FaMicrochip, FaVolumeUp } from 'react-icons/fa';

export default function TemplateElectronicsNew(props) {
  const { config } = props;
  const templateId = config.template || 't19';

  // Niche preset images for AI bg overlays
  const presets = [
    { name: 'Quantum Core', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Minimal Workspace', url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=600&q=80' },
    { name: 'Classic Console Tech', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80' }
  ];

  // Unique layout configuration depending on the template ID
  let themeConfig = {};
  if (templateId === 't19') {
    // Quantum - Cyber Purple
    themeConfig = {
      layoutClass: 'bg-[#0F0926] text-white',
      fontClass: 'font-sans',
      logoTextClass: 'text-white font-extrabold text-2xl uppercase tracking-widest bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent',
      navbarClass: 'bg-[#0F0926]/90 backdrop-blur-md border-b border-purple-900/40 shadow-theme',
      heroClass: 'min-h-[85vh] bg-[#0F0926] text-white',
      heroHeadingClass: 'font-extrabold text-5xl md:text-7xl leading-none tracking-tight text-white bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text',
      ctaButtonClass: 'bg-theme-primary text-white text-white hover:bg-theme-primary text-white rounded-theme py-3 px-8 shadow-[0_0_20px_rgba(192,132,252,0.3)]',
      catalogSectionClass: 'bg-[#0F0926] text-white',
      sectionHeadingClass: 'font-extrabold text-3xl tracking-tight text-white',
      productCardClass: 'bg-[#1A123C] rounded-theme border border-purple-950 shadow-theme hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(192,132,252,0.1)] duration-300',
      gallerySectionClass: 'bg-[#0F0926] border-t border-purple-950',
      faqSectionClass: 'bg-[#1A123C] border-t border-[#1A123C]',
      testimonialsSectionClass: 'bg-[#0F0926] border-t border-purple-950',
      hoursSectionClass: 'bg-[#1A123C] border-t border-[#1A123C]',
      contactSectionClass: 'bg-[#0F0926] border-t border-purple-950',
      primaryColor: '#0F0926',
      accentColor: '#C084FC',
      defaultHeroImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80'
    };
  } else if (templateId === 't20') {
    // Aero - Clean Hardware
    themeConfig = {
      layoutClass: 'bg-theme-surface text-theme-text',
      fontClass: 'font-sans font-light',
      logoTextClass: 'text-theme-text font-extrabold text-xl tracking-tight',
      navbarClass: 'bg-theme-surface/95 border-b border-theme-border py-4 shadow-theme',
      heroClass: 'min-h-[80vh] bg-slate-900 text-white',
      heroHeadingClass: 'font-light text-5xl md:text-7xl leading-tight text-white',
      ctaButtonClass: 'bg-theme-primary text-white text-white hover:bg-theme-primary text-white rounded-theme py-3 px-8 shadow-theme',
      catalogSectionClass: 'bg-theme-surface text-theme-text',
      sectionHeadingClass: 'font-bold text-3xl tracking-tight text-theme-text',
      productCardClass: 'bg-theme-surface rounded-theme border border-theme-border shadow-theme hover:shadow-theme hover:border-blue-500/20 duration-200',
      gallerySectionClass: 'bg-theme-bg border-t border-theme-border',
      faqSectionClass: 'bg-theme-surface border-t border-theme-border',
      testimonialsSectionClass: 'bg-theme-bg border-t border-theme-border',
      hoursSectionClass: 'bg-theme-surface border-t border-theme-border',
      contactSectionClass: 'bg-theme-bg border-t border-theme-border',
      primaryColor: '#0F172A',
      accentColor: '#3B82F6',
      defaultHeroImage: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=1200&q=80'
    };
  } else {
    // RetroTech - Console Monospace
    themeConfig = {
      layoutClass: 'bg-[#ECEFF1] text-[#242526]',
      fontClass: 'font-mono',
      logoTextClass: 'text-[#4CAF50] font-black text-2xl tracking-tighter',
      navbarClass: 'bg-[#242526] text-white border-b-4 border-[#4CAF50] py-4',
      heroClass: 'min-h-[75vh] bg-[#242526] text-white font-mono border-b-4 border-black',
      heroHeadingClass: 'font-black text-4xl md:text-6xl text-[#4CAF50] leading-normal',
      ctaButtonClass: 'bg-[#4CAF50] text-black hover:bg-[#43A047] rounded-none py-3.5 px-8 font-bold border-2 border-black shadow-[4px_4px_0px_#000] transition-transform',
      catalogSectionClass: 'bg-[#ECEFF1] text-[#242526]',
      sectionHeadingClass: 'font-black text-3xl text-[#242526]',
      productCardClass: 'bg-theme-surface border-4 border-black rounded-none shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 duration-200',
      gallerySectionClass: 'bg-[#ECEFF1] border-t-4 border-black',
      faqSectionClass: 'bg-theme-surface border-t-4 border-black',
      testimonialsSectionClass: 'bg-[#ECEFF1] border-t-4 border-black',
      hoursSectionClass: 'bg-theme-surface border-t-4 border-black',
      contactSectionClass: 'bg-[#ECEFF1] border-t-4 border-black',
      primaryColor: '#242526',
      accentColor: '#4CAF50',
      defaultHeroImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
    };
  }

  // State and Render for Custom Widgets depending on Template ID
  return (
    <TemplateLayoutBase
      {...props}
      templateId={templateId}
      theme={themeConfig}
      presets={presets}
      nicheSectionKey="electronicsWidget"
      renderNicheWidget={({ primaryColor, accentColor }) => {
        if (templateId === 't19') {
          return <QuantumComparisonMatrix accentColor={accentColor} />;
        } else if (templateId === 't20') {
          return <AeroSpecDrawer accentColor={accentColor} />;
        } else {
          return <RetroTechSynth accentColor={accentColor} />;
        }
      }}
    />
  );
}

// ----------------------------------------------------
// UNIQUE WIDGET 1: Quantum GPU / CPU Spec Matrix
// ----------------------------------------------------
function QuantumComparisonMatrix({ accentColor }) {
  const [deviceA, setDeviceA] = useState('quantum_gpu');
  const [deviceB, setDeviceB] = useState('core_cpu');

  const components = {
    quantum_gpu: {
      name: 'Quantum Core GPU',
      clock: '12.8 GHz (Entangled)',
      power: '45 Watts',
      bandwidth: '5.2 TB/s',
      memory: '256GB Holographic'
    },
    core_cpu: {
      name: 'Entropic CPU V4',
      clock: '8.4 GHz',
      power: '95 Watts',
      bandwidth: '1.8 TB/s',
      memory: '64GB Cache RAM'
    },
    motherboard: {
      name: 'N-Dimension Mainboard',
      clock: 'PCI-e Gen 10 Support',
      power: '12 Watts (idle)',
      bandwidth: '10.5 TB/s Bus',
      memory: 'Expandable Node Sockets'
    }
  };

  const a = components[deviceA];
  const b = components[deviceB];

  return (
    <section className="py-20 px-8 bg-[#1A123C] border-t border-b border-purple-950 text-white font-sans text-left">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <FaExchangeAlt size={30} className="mx-auto mb-3 text-[#C084FC]" />
          <h2 className="text-3xl font-extrabold uppercase">Specs Comparison Matrix</h2>
          <div className="w-16 h-1 bg-[#C084FC] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-450 mb-3">Device A</label>
            <select
              value={deviceA}
              onChange={(e) => setDeviceA(e.target.value)}
              className="w-full bg-[#0F0926] border border-purple-900/40 rounded-theme px-4 py-3 text-sm focus:outline-none text-white font-bold"
            >
              {Object.keys(components).map(k => (
                <option key={k} value={k}>{components[k].name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase font-extrabold tracking-wider text-slate-450 mb-3">Device B</label>
            <select
              value={deviceB}
              onChange={(e) => setDeviceB(e.target.value)}
              className="w-full bg-[#0F0926] border border-purple-900/40 rounded-theme px-4 py-3 text-sm focus:outline-none text-white font-bold"
            >
              {Object.keys(components).map(k => (
                <option key={k} value={k}>{components[k].name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-purple-900/40 rounded-theme overflow-hidden bg-[#0F0926]">
          <table className="w-full text-xs md:text-sm text-left">
            <thead>
              <tr className="bg-purple-950/40 text-slate-350 border-b border-purple-900/20 uppercase tracking-wider font-extrabold text-[10px]">
                <th className="p-5">Parameter</th>
                <th className="p-5">{a.name}</th>
                <th className="p-5">{b.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/25">
              <tr>
                <td className="p-5 font-bold text-slate-400">Processing Speed</td>
                <td className="p-5 text-white">{a.clock}</td>
                <td className="p-5 text-white">{b.clock}</td>
              </tr>
              <tr>
                <td className="p-5 font-bold text-slate-400">Thermal Draw (TDP)</td>
                <td className="p-5 text-white">{a.power}</td>
                <td className="p-5 text-white">{b.power}</td>
              </tr>
              <tr>
                <td className="p-5 font-bold text-slate-400">Memory Allocation</td>
                <td className="p-5 text-white">{a.memory}</td>
                <td className="p-5 text-white">{b.memory}</td>
              </tr>
              <tr>
                <td className="p-5 font-bold text-slate-400">Total System Bandwidth</td>
                <td className="p-5 text-white">{a.bandwidth}</td>
                <td className="p-5 text-white">{b.bandwidth}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// UNIQUE WIDGET 2: Aero Clean Specifications Drawer
// ----------------------------------------------------
function AeroSpecDrawer({ accentColor }) {
  const [activeTab, setActiveTab] = useState('ports');

  const specs = {
    ports: {
      title: 'I/O Interface Layout',
      items: [
        { label: 'Thunderbolt 4', value: '4x ports, 40 Gb/s transfer speeds' },
        { label: 'HDMI 2.1', value: '1x port, supports up to 8K @ 60Hz or 4K @ 144Hz' },
        { label: 'PCIe Slots', value: '2x M.2 NVMe Gen 4 connectors' }
      ]
    },
    chassis: {
      title: 'Minimal CNC Chassis Design',
      items: [
        { label: 'Enclosure Material', value: 'Aerospace-grade sandblasted 6000 series aluminum' },
        { label: 'Weight & Thickness', value: '1.2 kg, 12.9 mm at the thinnest profile' },
        { label: 'Heat Dissipation', value: 'CNC drilled micro-perforation exhaust vents' }
      ]
    },
    cooling: {
      title: 'Dual Vent Cooling system',
      items: [
        { label: 'Fan System', value: 'Dual ultra-thin 0.2mm composite steel fan blades' },
        { label: 'Fluid Flow', value: 'Direct copper heat pipes with fluid-phase dynamics' },
        { label: 'Acoustic Sound Limit', value: 'Silent operation, sub-22dB at full load' }
      ]
    }
  };

  const s = specs[activeTab];

  return (
    <section className="py-20 px-8 bg-theme-bg border-t border-b border-theme-border text-theme-text text-left font-sans font-light">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <FaMicrochip size={28} className="mx-auto mb-3 text-theme-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-theme-text">Advanced Specifications Panel</h2>
          <div className="w-12 h-0.5 bg-theme-primary text-white mx-auto mt-4"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {Object.keys(specs).map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`p-4 border rounded-theme transition-all text-center text-xs font-bold uppercase tracking-wider ${
                activeTab === key 
                  ? 'border-blue-500 bg-theme-surface text-theme-primary shadow-theme' 
                  : 'border-theme-border hover:border-theme-border text-theme-muted bg-theme-surface'
              }`}
            >
              {specs[key].title}
            </button>
          ))}
        </div>

        <div className="bg-theme-surface p-8 rounded-theme border border-slate-150 shadow-theme">
          <h4 className="font-bold text-sm tracking-wide text-theme-text border-b border-theme-border pb-3 mb-5 uppercase flex items-center gap-2">
            <FaInfoCircle className="text-theme-primary" /> {s.title} Overview
          </h4>
          <div className="space-y-4">
            {s.items.map((item, idx) => (
              <div key={idx} className="flex justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0 text-xs md:text-sm">
                <span className="font-bold text-theme-text">{item.label}</span>
                <span className="text-theme-muted text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// UNIQUE WIDGET 3: RetroTech Beep Synthesizer Keypad
// ----------------------------------------------------
function RetroTechSynth({ accentColor }) {
  const [activeNote, setActiveNote] = useState(null);

  const notes = [
    { label: 'C4', freq: 261.63 },
    { label: 'D4', freq: 293.66 },
    { label: 'E4', freq: 329.63 },
    { label: 'F4', freq: 349.23 },
    { label: 'G4', freq: 392.00 },
    { label: 'A4', freq: 440.00 },
    { label: 'B4', freq: 493.88 },
    { label: 'C5', freq: 523.25 }
  ];

  const playBeep = (freq, note) => {
    try {
      setActiveNote(note);
      setTimeout(() => setActiveNote(null), 250);
      
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square'; // 8-bit chip sound is square wave
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (err) {
      console.warn("AudioContext failed or blocked by browser gesture.", err);
    }
  };

  return (
    <section className="py-20 px-8 bg-[#ECEFF1] border-t-4 border-b-4 border-black text-[#242526] text-left font-mono">
      <div className="max-w-xl mx-auto border-4 border-black p-8 bg-theme-surface shadow-[4px_4px_0px_#000]">
        <div className="text-center mb-8 font-black uppercase">
          <FaGamepad size={32} className="mx-auto mb-3 text-[#4CAF50]" />
          <h2 className="text-2xl">8-Bit Sound Synthesizer</h2>
          <p className="text-[10px] tracking-wider text-theme-muted mt-2">Keypad tone generator. Click notes to play sound.</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {notes.map(note => (
            <button
              key={note.label}
              onClick={() => playBeep(note.freq, note.label)}
              className={`py-4 border-4 border-black text-center font-bold text-xs uppercase ${
                activeNote === note.label 
                  ? 'bg-[#4CAF50] text-black shadow-none translate-x-0.5 translate-y-0.5' 
                  : 'bg-theme-surface text-black hover:bg-neutral-50 shadow-[2px_2px_0px_#000]'
              }`}
            >
              <FaVolumeUp className="mx-auto mb-1 text-[10px]" />
              {note.label}
            </button>
          ))}
        </div>

        {activeNote && (
          <div className="p-4 border-2 border-black bg-[#4CAF50]/15 text-center text-xs font-bold text-[#4CAF50] tracking-widest uppercase">
            PLAYING FREQUENCY: {notes.find(n => n.label === activeNote)?.freq} HZ
          </div>
        )}
      </div>
    </section>
  );
}
