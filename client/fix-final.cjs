const fs = require('fs');
const path = require('path');

// 1. Clean index.css
const indexCssPath = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(indexCssPath, 'utf8');
cssContent = cssContent.replace(/\/\* Custom dashboard light mode override sheet \*\/[\s\S]*$/g, '');
fs.writeFileSync(indexCssPath, cssContent, 'utf8');
console.log('Cleaned index.css');

// 2. Fix Landing.jsx features background
const landingPath = path.join(__dirname, 'src', 'pages', 'Landing.jsx');
let landingContent = fs.readFileSync(landingPath, 'utf8');
landingContent = landingContent.replace(/bg-gradient-to-b from-\[\#161424\]\/90 to-\[\#0D0C14\]\/90/g, 'bg-white dark:bg-gradient-to-b dark:from-[#161424]/90 dark:to-[#0D0C14]/90');
landingContent = landingContent.replace(/tracking-tight text-white/g, 'tracking-tight text-slate-900 dark:text-white');
fs.writeFileSync(landingPath, landingContent, 'utf8');
console.log('Fixed Landing.jsx');

// 3. Fix BrandAssetsTab.jsx
const brandAssetsPath = path.join(__dirname, 'src', 'components', 'dashboard', 'BrandAssetsTab.jsx');
let brandAssetsContent = fs.readFileSync(brandAssetsPath, 'utf8');
// Fix Brand Settings heading text
brandAssetsContent = brandAssetsContent.replace(/text-base font-black text-white/g, 'text-base font-black text-slate-900 dark:text-white');
// Fix Typography preset buttons text
brandAssetsContent = brandAssetsContent.replace(/bg-indigo-500\/10 text-white font-bold/g, 'bg-indigo-500/10 text-indigo-700 dark:text-white font-bold');
// Fix Synchronize heading
brandAssetsContent = brandAssetsContent.replace(/font-black text-white text-sm/g, 'font-black text-slate-900 dark:text-white text-sm');
// Fix Download buttons
brandAssetsContent = brandAssetsContent.replace(/bg-slate-900/g, 'bg-slate-100 dark:bg-slate-900');
// Fix SVG wrappers bg-slate-950 to bg-[#0F172A] (so it works without slate-950)
brandAssetsContent = brandAssetsContent.replace(/bg-slate-950/g, 'bg-[#0F172A]');
brandAssetsContent = brandAssetsContent.replace(/text-slate-200"/g, 'text-slate-800 dark:text-slate-200"'); // wrapper div text color
fs.writeFileSync(brandAssetsPath, brandAssetsContent, 'utf8');
console.log('Fixed BrandAssetsTab.jsx');

// 4. Fix Setup drawer inputs in Templates.jsx
const templatesPath = path.join(__dirname, 'src', 'pages', 'Templates.jsx');
let templatesContent = fs.readFileSync(templatesPath, 'utf8');
templatesContent = templatesContent.replace(/bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/g, 'bg-slate-100 dark:bg-slate-800');
fs.writeFileSync(templatesPath, templatesContent, 'utf8');
console.log('Fixed Templates.jsx');

