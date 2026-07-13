const fs = require('fs');

const targetFile = 'src/components/editor/EditorControls.jsx';
let content = fs.readFileSync(targetFile, 'utf8');

const missingSectionsJSX = `
        {/* Footer */}
        <Section id="footerSettings" title="Footer" icon={FaDesktop}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Tagline</label>
              <input type="text" value={config.footer?.tagline || ''} onChange={(e) => updateConfig('footer', 'tagline', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Layout</label>
              <select value={config.footer?.layout || 'standard'} onChange={(e) => updateConfig('footer', 'layout', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
                <option value="standard">Standard</option>
                <option value="minimal">Minimal</option>
                <option value="centered">Centered</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Forms */}
        <Section id="formSettings" title="Forms" icon={FaDesktop}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Input Border Radius</label>
              <select value={config.forms?.inputRadius || '8px'} onChange={(e) => updateConfig('forms', 'inputRadius', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
                <option value="0px">Sharp</option>
                <option value="8px">Rounded</option>
                <option value="9999px">Pill</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.forms?.border === 'true'} onChange={(e) => updateConfig('forms', 'border', e.target.checked ? 'true' : 'false')} className="accent-blue-600" />
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Show Borders</span>
            </label>
          </div>
        </Section>

        {/* Sections Visibility */}
        <Section id="sectionsVisibility" title="Sections" icon={FaDesktop}>
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-3">Toggle visibility of store sections.</p>
            {Object.keys(config.sections || {}).map(sec => (
              <label key={sec} className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-150 dark:border-slate-800 rounded">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300 capitalize">{sec}</span>
                <input type="checkbox" checked={!!config.sections[sec]} onChange={(e) => updateConfig('sections', sec, e.target.checked)} className="accent-blue-600" />
              </label>
            ))}
          </div>
        </Section>

        {/* Animations */}
        <Section id="animations" title="Animations" icon={FaDesktop}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Page Transition</label>
              <select value={config.animations?.pageAnimation || 'fade'} onChange={(e) => updateConfig('animations', 'pageAnimation', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
                <option value="fade">Fade In</option>
                <option value="slide">Slide Up</option>
                <option value="zoom">Zoom</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Border Radius Global */}
        <Section id="borderRadius" title="Border Radius" icon={FaDesktop}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Global Radius</label>
              <select value={config.spacing?.borderRadius || '8px'} onChange={(e) => updateConfig('spacing', 'borderRadius', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
                <option value="0px">Sharp</option>
                <option value="4px">Slightly Rounded</option>
                <option value="8px">Rounded</option>
                <option value="16px">Extra Rounded</option>
                <option value="9999px">Pill</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Shadows */}
        <Section id="shadows" title="Shadows" icon={FaDesktop}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Global Shadow Style</label>
              <select value={config.shadows?.globalStyle || 'medium'} onChange={(e) => updateConfig('shadows', 'globalStyle', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
                <option value="none">None</option>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Icons */}
        <Section id="icons" title="Icons" icon={FaDesktop}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Icon Style</label>
              <select value={config.icons?.style || 'outlined'} onChange={(e) => updateConfig('icons', 'style', e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-[#13121A] border border-gray-200 dark:border-slate-700/60 rounded-md outline-none">
                <option value="outlined">Outlined</option>
                <option value="filled">Filled</option>
                <option value="rounded">Rounded</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Images */}
        <Section id="images" title="Images" icon={FaDesktop}>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.images?.overlay || false} onChange={(e) => updateConfig('images', 'overlay', e.target.checked)} className="accent-blue-600" />
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Darken Overlays</span>
            </label>
          </div>
        </Section>

        {/* Custom CSS */}
        <Section id="customCss" title="Custom CSS" icon={FaDesktop}>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Inject Custom Styles</label>
            <textarea 
              value={config.customCss || ''} 
              onChange={(e) => setConfig(p => ({ ...p, customCss: e.target.value }))}
              placeholder="/* Add CSS here */"
              rows={8}
              className="w-full p-3 font-mono text-xs bg-gray-900 text-green-400 rounded-md outline-none"
            />
          </div>
        </Section>
`;

const anchor = '{/* 18. Business Hours */}';
if (content.includes(anchor)) {
  content = content.replace(anchor, missingSectionsJSX + '\\n\\n        ' + anchor);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Successfully injected missing sections into EditorControls.jsx');
} else {
  console.log('Anchor not found!');
}
