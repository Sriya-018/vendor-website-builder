import React from 'react';
import { FaDesktop, FaPalette } from 'react-icons/fa';

function EditWebsiteTab({ websites, routerNavigate }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select a Store to Design</h2>
          <p className="text-sm text-gray-500">Choose which store you want to open in the Advanced Website Editor.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websites && websites.length > 0 ? websites.map((website, index) => (
          <div key={website._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col" onClick={() => routerNavigate(`/editor/${website._id}`)}>
            <div className="flex justify-between items-start mb-3">
              <div className="font-bold text-gray-900 truncate">{website.storeName || `Store ${index + 1}`}</div>
              <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-full">{website.views || 0} views</span>
            </div>
            <div className="text-sm text-gray-500 mb-4 line-clamp-2">
              Template: <span className="font-medium capitalize">{website.template}</span><br/>
              Slug: <span className="font-medium text-gray-700">{website.slug}</span>
            </div>
            <div className="mt-auto">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  routerNavigate(`/editor/${website._id}`);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2 shadow-sm"
              >
                <FaPalette /> Open Editor
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-12 text-center">
            <FaDesktop className="text-5xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Stores Found</h2>
            <p className="text-gray-500 mb-6">You don't have any stores yet. Create one to edit its design.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditWebsiteTab;
