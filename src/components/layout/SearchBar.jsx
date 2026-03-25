import { useState } from 'react';

export default function SearchBar({ searchQuery, setSearchQuery, location, setLocation, theme }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const cities = ['Gharuan', 'Ludhiana', 'Delhi', 'Chandigarh'];

  const colors = {
    bg: theme === 'dark' ? 'bg-white/[0.04]' : 'bg-white/90',
    border: theme === 'dark' ? 'border-white/10' : 'border-black/10',
    text: theme === 'dark' ? 'text-white' : 'text-[#1d1d1f]',
    placeholder: theme === 'dark' ? 'placeholder-white/40' : 'placeholder-black/40',
    dropdownBg: theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10',
    hover: theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5',
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto flex items-center p-2 rounded-full border ${colors.border} ${colors.bg} shadow-2xl transition-all focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 backdrop-blur-xl mb-12`}>
      <div className="pl-5 pr-2 text-xl opacity-50">🔍</div>
      <input
        type="text"
        placeholder="Search plumbing, carpentry, painting..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`flex-1 bg-transparent border-none outline-none text-[15px] font-medium ${colors.text} ${colors.placeholder} h-12 px-2 w-full min-w-[200px]`}
      />
      
      <div className="relative">
        <div className={`hidden sm:flex items-center gap-2 px-4 py-2 mx-2 rounded-full border transition-colors cursor-pointer ${theme === 'dark' ? 'border-white/10 hover:bg-white/10' : 'border-black/10 hover:bg-black/5'} whitespace-nowrap`} onClick={() => setShowDropdown(!showDropdown)}>
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className={`text-[12px] font-bold ${colors.text}`}>{location || 'Location'}</span>
        </div>
        
        {showDropdown && (
          <div className={`absolute top-full mt-2 w-40 right-0 z-50 rounded-xl shadow-2xl border py-2 ${colors.dropdownBg}`}>
            {cities.map(c => (
              <button key={c} onClick={() => { if(setLocation) setLocation(c); setShowDropdown(false); }} className={`w-full text-left px-4 py-2 text-sm font-bold ${colors.text} ${colors.hover} transition-colors`}>{c}</button>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
