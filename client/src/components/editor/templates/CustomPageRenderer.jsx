import React from 'react';

function CustomPageRenderer({ page, primaryColor, accentColor, isEditable, onUpdateConfig, config }) {
  if (!page) return null;

  const deletePageItem = (itemId) => {
    const updatedItems = (page.items || []).filter(item => item.id !== itemId);
    const updatedPages = config.customPages.map(p => 
      p.id === page.id ? { ...p, items: updatedItems } : p
    );
    onUpdateConfig('customPages', null, updatedPages);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 animate-fade-in text-slate-800">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 
          className="text-3xl md:text-5xl font-black mb-3 tracking-tight"
          style={{ color: primaryColor, fontFamily: 'var(--heading-font)' }}
        >
          {page.title}
        </h1>
        <div className="w-16 h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: accentColor }}></div>
      </div>

      {/* Menu Layout */}
      {page.layout === 'menu' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(page.items || []).map((item, idx) => (
              <div key={item.id || idx} className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm relative flex gap-4 hover:shadow-md transition-shadow">
                {isEditable && (
                  <button 
                    type="button"
                    onClick={() => deletePageItem(item.id)}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center font-bold text-xs transition-colors"
                  >
                    ×
                  </button>
                )}
                <div className="text-3xl flex items-center shrink-0">
                  {item.icon || '🍽️'}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex justify-between items-baseline mb-1 gap-2">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{item.name}</h3>
                    <span className="font-extrabold text-xs shrink-0" style={{ color: accentColor }}>₹{item.price}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {(page.items || []).length === 0 && (
            <p className="text-center text-slate-400 italic py-8 text-xs">No menu items configured. Customize this page in the sidebar editor panel.</p>
          )}
        </div>
      )}

      {/* Specials Layout */}
      {page.layout === 'specials' && (
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(page.items || []).map((item, idx) => (
              <div key={item.id || idx} className="bg-white rounded-3xl overflow-hidden border border-slate-150 shadow-sm relative flex flex-col hover:shadow-md transition-shadow">
                {isEditable && (
                  <button 
                    type="button"
                    onClick={() => deletePageItem(item.id)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center font-bold text-xs z-10"
                  >
                    ×
                  </button>
                )}
                <div className="h-48 bg-slate-100 relative">
                  {item.image ? (
                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl font-bold bg-slate-50">
                      🎁 Special Deal
                    </div>
                  )}
                  {item.badge && (
                    <span 
                      className="absolute top-3 left-3 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm"
                      style={{ backgroundColor: accentColor }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg mb-2">{item.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.desc}</p>
                  </div>
                  {item.btnLabel && (
                    <button 
                      type="button" 
                      className="w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-xl text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: accentColor }}
                    >
                      {item.btnLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {(page.items || []).length === 0 && (
            <p className="text-center text-slate-400 italic py-8 text-xs">No deals configured. Customize this page in the sidebar editor panel.</p>
          )}
        </div>
      )}

      {/* Features Layout */}
      {page.layout === 'features' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(page.items || []).map((item, idx) => (
              <div key={item.id || idx} className="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm relative text-center hover:shadow-md transition-shadow">
                {isEditable && (
                  <button 
                    type="button"
                    onClick={() => deletePageItem(item.id)}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center font-bold text-xs"
                  >
                    ×
                  </button>
                )}
                <div className="text-4xl mx-auto mb-4 w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {item.icon || '🌟'}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{item.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          {(page.items || []).length === 0 && (
            <p className="text-center text-slate-400 italic py-8 text-xs">No features configured. Customize this page in the sidebar editor panel.</p>
          )}
        </div>
      )}

      {/* Text Layout */}
      {page.layout === 'text' && (
        <div className="max-w-3xl mx-auto space-y-6 bg-white rounded-3xl p-6 md:p-8 border border-slate-150 shadow-sm">
          {page.image && (
            <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
              <img src={page.image} className="w-full h-full object-cover" alt="Banner" />
            </div>
          )}
          <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
            {page.desc || 'Welcome to this custom page. Edit this text and add a banner inside the sidebar editor panel.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default CustomPageRenderer;
