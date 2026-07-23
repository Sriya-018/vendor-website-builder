import React, { useState } from 'react';
import TemplateLayoutBase from './TemplateLayoutBase';
import { FaHeartbeat, FaInfoCircle, FaCalculator, FaBookOpen, FaBriefcase } from 'react-icons/fa';

export default function TemplateServicesNew(props) {
 const { config } = props;
 const templateId = config.template || 't33';

 // Niche preset images for AI bg overlays
 const presets = [
 { name: 'Fitness Gym Cardio', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80' },
 { name: 'Financial Consultation', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80' },
 { name: 'Creative Design Mockups', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80' },
 { name: 'Medical Counselor Table', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80' }
 ];

 // Unique layout configuration depending on the template ID
 let themeConfig = {};
 if (templateId === 't33') {
 // Pulse - Fitness Trainer
 themeConfig = {
 layoutClass: 'bg-black text-white',
 fontClass: 'font-sans font-extrabold tracking-tight italic',
 logoTextClass: 'text-white tracking-normal font-black text-2xl uppercase italic bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent',
 navbarClass: 'bg-black border-b border-neutral-900 py-4 shadow-none',
 heroClass: 'min-h-[80vh] bg-black text-white italic',
 heroHeadingClass: 'font-black text-6xl md:text-8xl tracking-tighter uppercase leading-none text-white',
 ctaButtonClass: 'bg-theme-primary text-white text-white hover:bg-theme-primary text-white rounded-none uppercase py-4 px-10 border-2 border-black font-black',
 catalogSectionClass: 'bg-neutral-950 text-white',
 sectionHeadingClass: 'font-black text-5xl uppercase tracking-tighter text-white',
 productCardClass: 'bg-neutral-900 rounded-none border border-neutral-800 hover:border-red-600 shadow-theme duration-200',
 gallerySectionClass: 'bg-black border-t border-neutral-900',
 faqSectionClass: 'bg-[#111] border-t border-[#111]',
 testimonialsSectionClass: 'bg-black border-t border-neutral-900',
 hoursSectionClass: 'bg-[#111] border-t border-[#111]',
 contactSectionClass: 'bg-black border-t border-neutral-900',
 primaryColor: '#DC2626',
 accentColor: '#EF4444',
 defaultHeroImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80'
 };
 } else if (templateId === 't34') {
 // Scale - Corporate Consulting
 themeConfig = {
 layoutClass: 'bg-theme-surface text-theme-text',
 fontClass: 'font-sans font-light',
 logoTextClass: 'text-theme-text font-extrabold text-xl tracking-tight uppercase',
 navbarClass: 'bg-theme-surface border-b border-theme-border py-4 shadow-theme',
 heroClass: 'min-h-[80vh] bg-slate-900 text-white',
 heroHeadingClass: 'font-light text-5xl md:text-7xl leading-tight text-white',
 ctaButtonClass: 'bg-theme-primary text-white text-white hover:bg-theme-primary text-white rounded-theme py-3 px-8 font-bold uppercase text-xs tracking-wider',
 catalogSectionClass: 'bg-theme-surface text-theme-text',
 sectionHeadingClass: 'font-bold text-3xl tracking-tight text-theme-text uppercase',
 productCardClass: 'bg-theme-surface border border-theme-border shadow-theme hover:shadow-theme hover:border-blue-500/20 duration-200',
 gallerySectionClass: 'bg-theme-bg border-t border-theme-border',
 faqSectionClass: 'bg-theme-surface border-t border-theme-border',
 testimonialsSectionClass: 'bg-theme-bg border-t border-theme-border',
 hoursSectionClass: 'bg-theme-surface border-t border-theme-border',
 contactSectionClass: 'bg-theme-bg border-t border-theme-border',
 primaryColor: '#1E3A8A',
 accentColor: '#3B82F6',
 defaultHeroImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'
 };
 } else if (templateId === 't35') {
 // PixelCraft - Design Studio
 themeConfig = {
 layoutClass: 'bg-[#0A0015] text-white',
 fontClass: 'font-sans',
 logoTextClass: 'text-white font-black text-2xl uppercase tracking-widest',
 navbarClass: 'bg-[#0A0015]/95 border-b border-purple-900/10 shadow-theme py-5',
 heroClass: 'min-h-[85vh] bg-[#0A0015] text-white',
 heroHeadingClass: 'font-extrabold text-5xl md:text-7xl leading-none tracking-tight text-white bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent',
 ctaButtonClass: 'bg-theme-primary text-white text-white hover:bg-theme-primary text-white rounded-theme py-3 px-8 shadow-[0_0_20px_rgba(139,92,246,0.35)]',
 catalogSectionClass: 'bg-[#0A0015] text-white border-t border-purple-900/10',
 sectionHeadingClass: 'font-bold text-3xl tracking-tight text-white',
 productCardClass: 'bg-[#150C24] border border-purple-950 rounded-theme hover:border-purple-500 duration-300',
 gallerySectionClass: 'bg-[#0A0015] border-t border-purple-950',
 faqSectionClass: 'bg-[#150C24] border-t border-[#111]',
 testimonialsSectionClass: 'bg-[#0A0015] border-t border-purple-950',
 hoursSectionClass: 'bg-[#150C24] border-t border-[#111]',
 contactSectionClass: 'bg-[#0A0015] border-t border-purple-950',
 primaryColor: '#0A0015',
 accentColor: '#8B5CF6',
 defaultHeroImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80'
 };
 } else {
 // Care - Counseling & Therapy
 themeConfig = {
 layoutClass: 'bg-[#FAF9F6] text-[#0F766E]',
 fontClass: 'font-serif',
 logoTextClass: 'text-[#0F766E] font-bold text-lg uppercase tracking-[0.25em]',
 navbarClass: 'bg-[#FAF9F6]/95 border-b border-[#14B8A6]/15 shadow-theme py-4',
 heroClass: 'min-h-[75vh] bg-[#0F766E] text-white',
 heroHeadingClass: 'font-serif text-5xl md:text-7xl font-light leading-normal text-white',
 ctaButtonClass: 'bg-[#14B8A6] text-white hover:bg-[#0D9488] rounded-full py-3.5 px-8 font-bold uppercase text-xs tracking-wider shadow-theme',
 catalogSectionClass: 'bg-[#FAF9F6] text-[#0F766E]',
 sectionHeadingClass: 'font-serif text-3xl font-bold text-[#0F766E] uppercase tracking-widest',
 productCardClass: 'bg-theme-surface border border-[#14B8A6]/15 rounded-theme shadow-theme hover:shadow-theme hover:border-[#14B8A6]/30 duration-200',
 gallerySectionClass: 'bg-[#FAF9F6] border-t border-[#14B8A6]/10',
 faqSectionClass: 'bg-theme-surface border-t border-[#14B8A6]/10',
 testimonialsSectionClass: 'bg-[#FAF9F6] border-t border-[#14B8A6]/10',
 hoursSectionClass: 'bg-theme-surface border-t border-[#14B8A6]/10',
 contactSectionClass: 'bg-[#FAF9F6] border-t border-[#14B8A6]/10',
 primaryColor: '#0F766E',
 accentColor: '#14B8A6',
 defaultHeroImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80'
 };
 }

 // State and Render for Custom Widgets depending on Template ID
 return (
 <TemplateLayoutBase
 {...props}
 templateId={templateId}
 theme={themeConfig}
 presets={presets}
 nicheSectionKey="servicesWidget"
 renderNicheWidget={({ primaryColor, accentColor }) => {
 if (templateId === 't33') {
 return <PulseCalorieEstimator accentColor={accentColor} />;
 } else if (templateId === 't34') {
 return <ScaleRoiEstimator accentColor={accentColor} />;
 } else if (templateId === 't35') {
 return <PixelCraftPortfolio accentColor={accentColor} />;
 } else {
 return <CarePlanner accentColor={accentColor} />;
 }
 }}
 />
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 1: Pulse Fitness Calorie Estimator
// ----------------------------------------------------
function PulseCalorieEstimator({ accentColor }) {
 const [workouts, setWorkouts] = useState(3);
 const [goal, setGoal] = useState('lose');

 const getCalorieDetails = () => {
 let base = 2200;
 let coachingType = 'Active Shred Program';
 let details = 'Recommended for cutting excess body fat index while building dense, lean muscle tissue.';

 if (goal === 'gain') {
 base = 2800;
 coachingType = 'Bulking & Power Core Program';
 details = 'Optimized for high protein calorie thresholds and progressive overload muscle loading.';
 }

 const calculated = base + (workouts * 150);
 return { calculated, coachingType, details };
 };

 const cal = getCalorieDetails();

 return (
 <section className="py-20 px-8 bg-neutral-950 border-t border-b border-neutral-900 text-slate-900 dark:text-white text-left font-sans italic tracking-tight">
 <div className="max-w-xl mx-auto border border-neutral-800 p-8 bg-neutral-900 rounded-none shadow-theme">
 <div className="text-center mb-8 uppercase font-black">
 <FaHeartbeat size={30} className="mx-auto mb-3 text-theme-primary animate-pulse" />
 <h2 className="text-3xl text-slate-900 dark:text-white">Daily Target Calorie Guide</h2>
 <p className="text-[10px] tracking-wider text-neutral-500 mt-2 font-bold uppercase">Configure metrics to calculate coaching pack</p>
 </div>

 <div className="space-y-6">
 <div>
 <div className="flex justify-between font-black text-xs uppercase mb-2">
 <span>Workouts per Week</span>
 <span>{workouts} sessions</span>
 </div>
 <input 
 type="range" 
 min="1" 
 max="7" 
 value={workouts} 
 onChange={(e) => setWorkouts(parseInt(e.target.value))}
 className="w-full accent-red-600 cursor-pointer"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <button
 onClick={() => setGoal('lose')}
 className={`py-3 text-xs uppercase font-black tracking-wider border-2 transition-all ${
 goal === 'lose' 
 ? 'border-red-600 bg-theme-primary text-white text-white' 
 : 'border-neutral-800 text-neutral-400 bg-neutral-950 hover:border-neutral-750'
 }`}
 >
 Fat Loss Mode
 </button>
 <button
 onClick={() => setGoal('gain')}
 className={`py-3 text-xs uppercase font-black tracking-wider border-2 transition-all ${
 goal === 'gain' 
 ? 'border-red-600 bg-theme-primary text-white text-white' 
 : 'border-neutral-800 text-neutral-400 bg-neutral-950 hover:border-neutral-750'
 }`}
 >
 Hypertrophy Mode
 </button>
 </div>

 <div className="mt-8 p-6 bg-black border border-neutral-800">
 <span className="text-[10px] uppercase tracking-widest font-black text-theme-primary">Daily Target: {cal.calculated} kCal</span>
 <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 uppercase">{cal.coachingType}</h4>
 <p className="text-xs text-neutral-400 leading-relaxed mt-2">{cal.details}</p>
 </div>
 </div>
 </div>
 </section>
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 2: Scale consulting ROI Estimator
// ----------------------------------------------------
function ScaleRoiEstimator({ accentColor }) {
 const [revenue, setRevenue] = useState(300000);

 const getRoiData = () => {
 const profitLift = Math.floor(revenue * 0.15);
 const efficiency = 35;
 return { profitLift, efficiency };
 };

 const r = getRoiData();

 return (
 <section className="py-20 px-8 bg-theme-bg border-t border-b border-theme-border text-theme-text text-left font-sans font-light">
 <div className="max-w-xl mx-auto border border-slate-150 p-8 rounded-theme bg-theme-surface shadow-theme">
 <div className="text-center mb-8 uppercase font-bold">
 <FaCalculator size={30} className="mx-auto mb-3 text-theme-primary" />
 <h2 className="text-2xl text-theme-text tracking-tight">Consulting Impact Calculator</h2>
 <p className="text-xs font-light text-theme-muted mt-1.5 lowercase">Slide revenue to project consulting value enhancements</p>
 </div>

 <div className="space-y-6">
 <div>
 <div className="flex justify-between font-bold text-xs mb-2">
 <span>Current Monthly Revenue</span>
 <span>₹{revenue.toLocaleString()}</span>
 </div>
 <input 
 type="range" 
 min="100000" 
 max="1000000" 
 step="50000"
 value={revenue} 
 onChange={(e) => setRevenue(parseInt(e.target.value))}
 className="w-full accent-blue-600 cursor-pointer"
 />
 </div>

 <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-theme-border">
 <div className="p-4 border border-slate-50 bg-theme-bg/50 rounded-theme text-center">
 <span className="text-xl font-bold text-theme-primary">₹{r.profitLift.toLocaleString()}</span>
 <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-1">Est. Profit Lift</p>
 </div>
 <div className="p-4 border border-slate-50 bg-theme-bg/50 rounded-theme text-center">
 <span className="text-xl font-bold text-theme-text">+{r.efficiency}%</span>
 <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-1">Process Savings</p>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 3: PixelCraft Agency Portfolio Tab
// ----------------------------------------------------
function PixelCraftPortfolio({ accentColor }) {
 const [activeScreen, setActiveScreen] = useState('web');

 const portfolios = {
 web: {
 title: 'Full Stack eCommerce Portal',
 desc: 'Finished with React, NextJS, Node, and tailwind. Implements headless CMS nodes, real-time sync catalog databases, and microsecond load bounds.',
 features: ['99.9% uptime deployment', 'Page load speed sub-0.5s', 'Headless CMS node arrays']
 },
 mobile: {
 title: 'Active Fitness Mobile App',
 desc: 'Coded with React Native and Swift. Supports live bluetooth heart monitors, local offline sqlite caching, and push sync notifications.',
 features: ['Apple HealthKit sync integration', 'Offline data sync', 'Custom charts rendering Engine']
 },
 brand: {
 title: 'Aero Brand Identity Rebrand',
 desc: 'Complete digital branding kit including responsive SVG asset vectors, color system guides, and strict font type rulesheets.',
 features: ['SVG corporate logos sheets', 'Curated HSL visual colors system', 'Brand voice guidelines PDF']
 }
 };

 const p = portfolios[activeScreen];

 return (
 <section className="py-20 px-8 bg-[#0A0015] border-t border-b border-purple-950 text-slate-900 dark:text-white font-sans text-left">
 <div className="max-w-4xl mx-auto">
 <div className="text-center mb-12">
 <FaBriefcase size={28} className="mx-auto mb-3 text-purple-400" />
 <h2 className="text-3xl font-black uppercase tracking-wide">Featured Design Portfolio</h2>
 <div className="w-16 h-1 bg-[#8B5CF6] mx-auto mt-4 rounded-full"></div>
 </div>

 <div className="grid md:grid-cols-3 gap-3 mb-8">
 {Object.keys(portfolios).map(key => (
 <button
 key={key}
 onClick={() => setActiveScreen(key)}
 className={`p-4 border border-purple-900 rounded-theme text-xs font-bold uppercase tracking-wider transition-all ${
 activeScreen === key 
 ? 'border-[#8B5CF6] bg-[#150C24] text-white shadow-theme' 
 : 'border-purple-950 hover:border-purple-900 text-purple-300'
 }`}
 >
 {key} mockup
 </button>
 ))}
 </div>

 <div className="bg-[#150C24] p-8 border border-purple-950 rounded-theme shadow-theme">
 <h4 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white border-b border-purple-900 pb-3 mb-4 uppercase">
 {p.title}
 </h4>
 <p className="text-xs leading-relaxed text-slate-350 mb-5">{p.desc}</p>
 <ul className="space-y-2 text-xs text-purple-300">
 {p.features.map((f, idx) => (
 <li key={idx} className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
 {f}
 </li>
 ))}
 </ul>
 </div>
 </div>
 </section>
 );
}

// ----------------------------------------------------
// UNIQUE WIDGET 4: Care Medical appointment planner
// ----------------------------------------------------
function CarePlanner({ accentColor }) {
 const [session, setSession] = useState('counseling');

 const plans = {
 counseling: {
 title: 'Individual Mental Health Counseling',
 duration: '50 Minutes Session',
 format: 'Video Call / In-Person Clinic',
 therapist: 'Licensed Clinical Psychologist, MHC'
 },
 physio: {
 title: 'Physical Rehab & Motion Therapy',
 duration: '60 Minutes Assessment',
 format: 'In-Clinic Active Exercise Gym',
 therapist: 'Registered Physiotherapist, PT'
 },
 medical: {
 title: 'General Wellness Medical Checkup',
 duration: '30 Minutes consultation',
 format: 'Video consultation / In-Clinic',
 therapist: 'Board Certified Family Physician, MD'
 }
 };

 const pl = plans[session];

 return (
 <section className="py-20 px-8 bg-[#FAF9F6] border-t border-b border-[#14B8A6]/15 text-[#0F766E] text-left font-serif">
 <div className="max-w-xl mx-auto border border-[#14B8A6]/15 p-8 bg-theme-surface rounded-theme shadow-theme">
 <div className="text-center mb-8">
 <FaBookOpen size={28} className="mx-auto mb-3 text-[#14B8A6]" />
 <h2 className="text-2xl font-bold uppercase tracking-widest">Therapy Sessional Selector</h2>
 <p className="text-xs text-theme-muted leading-relaxed mt-2 lowercase font-sans">Select category to inspect session parameters</p>
 </div>

 <div className="flex border-b border-theme-border mb-8 text-xs font-bold text-center font-sans">
 {Object.keys(plans).map(key => (
 <button
 key={key}
 onClick={() => setSession(key)}
 className={`flex-1 py-3 border-b-2 transition-all ${
 session === key 
 ? 'border-[#14B8A6] text-black font-bold' 
 : 'border-transparent text-slate-400 hover:text-slate-650'
 }`}
 >
 {key === 'counseling' ? 'Psychology' : key === 'physio' ? 'Physio' : 'General'}
 </button>
 ))}
 </div>

 <div className="bg-[#FAF9F6] p-6 border border-[#14B8A6]/10 rounded-theme font-sans">
 <span className="text-[9px] uppercase tracking-widest font-bold text-[#14B8A6] block mb-1">Session Spec Sheet</span>
 <h4 className="text-base font-bold text-theme-text leading-snug">{pl.title}</h4>
 <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400 mt-4 border-t border-theme-border pt-4 uppercase">
 <div>
 <span>Duration</span>
 <p className="text-theme-text mt-1 font-bold">{pl.duration}</p>
 </div>
 <div>
 <span>Format</span>
 <p className="text-theme-text mt-1 font-bold">{pl.format}</p>
 </div>
 <div className="col-span-2">
 <span>Practitioner</span>
 <p className="text-theme-text mt-1 font-bold">{pl.therapist}</p>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
}
