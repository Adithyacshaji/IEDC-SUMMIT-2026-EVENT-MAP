import React, { useMemo } from "react";
import { useDatabase } from "../../context/DatabaseContext";
import { Wrench, Users, Sparkles, Rocket, Trophy, Award, Music, Building2 } from "lucide-react";

function getCategoryIcon(categoryName) {
  const n = (categoryName || '').toLowerCase();
  if (n.includes('workshop') || n.includes('clinic')) return Wrench;
  if (n.includes('panel') || n.includes('chat') || n.includes('fireside') || n.includes('talk')) return Users;
  if (n.includes('startup') || n.includes('exhibition') || n.includes('expo') || n.includes('pitch')) return Rocket;
  if (n.includes('activity') || n.includes('hub')) return Sparkles;
  if (n.includes('hackathon') || n.includes('quiz') || n.includes('competition')) return Trophy;
  if (n.includes('formal') || n.includes('function') || n.includes('session')) return Award;
  if (n.includes('pro')) return Music;
  return Building2;
}

function SearchChips({ onSelectCategory, activeCategory }) {
  const { events } = useDatabase();

  const categories = useMemo(() => {
    if (!events || events.length === 0) return [];
    const counts = {};
    events.forEach(e => {
      const cat = (e.event_category || e.category || '').trim();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .map(catName => ({
        id: catName,
        label: catName,
        count: counts[catName],
        icon: getCategoryIcon(catName)
      }));
  }, [events]);

  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full mx-auto overflow-x-auto custom-scrollbar pointer-events-auto mt-3 pb-2 -mb-2 hide-scrollbar">
      <div className="flex items-center gap-3 px-4 pb-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat.id)}
              className={'flex items-center gap-2 shrink-0 px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200 border whitespace-nowrap cursor-pointer ' + 
                (isActive 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md font-semibold' 
                  : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50 shadow-sm'
                )
              }
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SearchChips;
