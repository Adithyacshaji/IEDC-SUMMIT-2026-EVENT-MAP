import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  MapPin, Flame, X, Clock, Users, Wrench, Sparkles,
  Rocket, Trophy, Award, Music, Building2, ChevronLeft,
  ChevronRight, TrendingUp, UserCheck, FileText
} from 'lucide-react';
import { getIndianDateTime, isEventLiveInIST } from '../../utils/istTime';
import './LiveEventsModal.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const KNOWN_CATEGORIES = [
  "workshops and clinics","panel discussions and fireside chats","panel discussions & chats",
  "activity hub","startup exhibitions","hackathons and quiz","hackathons & quiz",
  "formal function","formal functions","proshow","pro show","check in",
];

function sanitizeSpeaker(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return KNOWN_CATEGORIES.includes(raw.trim().toLowerCase()) ? '' : raw.trim();
}

function getSpeakerDisplay(event) {
  if (Array.isArray(event.speakers) && event.speakers.length > 0)
    return event.speakers.map(sanitizeSpeaker).filter(Boolean).join(', ');
  return sanitizeSpeaker(event.speaker || event.speaker_name || event["Speaker's name"] || '');
}

function getTimeString(e) {
  if (!e) return '';
  if (e.time_slot && String(e.time_slot).trim()) return String(e.time_slot).trim();
  if (e.time && String(e.time).trim()) return String(e.time).trim();
  if (e.time_start && e.time_end) return `${e.time_start.substring(0, 5)} – ${e.time_end.substring(0, 5)}`;
  if (e.time_start) return e.time_start.substring(0, 5);
  return '';
}

function getCategoryTheme(categoryName) {
  const n = (categoryName || '').toLowerCase();
  if (n.includes('hackathon') || n.includes('quiz')) {
    return {
      bg: '#eef5ff', border: '#d4e5ff',
      iconBg: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', iconColor: '#ffffff',
      titleColor: '#0b2545', countColor: '#2563eb', chevronColor: '#2563eb',
      Icon: Trophy
    };
  }
  if (n.includes('pitch') || n.includes('expo') || n.includes('startup')) {
    return {
      bg: '#eef9f2', border: '#c8eed5',
      iconBg: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', iconColor: '#ffffff',
      titleColor: '#064e3b', countColor: '#059669', chevronColor: '#059669',
      Icon: TrendingUp
    };
  }
  if (n.includes('invited') || n.includes('talk')) {
    return {
      bg: '#f5f0ff', border: '#e2d2fe',
      iconBg: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)', iconColor: '#ffffff',
      titleColor: '#3b0764', countColor: '#9333ea', chevronColor: '#9333ea',
      Icon: UserCheck
    };
  }
  if (n.includes('key') || n.includes('note')) {
    return {
      bg: '#fff8ed', border: '#fee4c2',
      iconBg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', iconColor: '#ffffff',
      titleColor: '#451a03', countColor: '#d97706', chevronColor: '#d97706',
      Icon: FileText
    };
  }
  if (n.includes('workshop') || n.includes('clinic')) {
    return {
      bg: '#fefce8', border: '#fef08a',
      iconBg: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)', iconColor: '#ffffff',
      titleColor: '#422006', countColor: '#ca8a04', chevronColor: '#ca8a04',
      Icon: Wrench
    };
  }
  if (n.includes('formal') || n.includes('function') || n.includes('session')) {
    return {
      bg: '#e0f2fe', border: '#bae6fd',
      iconBg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', iconColor: '#ffffff',
      titleColor: '#0c4a6e', countColor: '#0284c7', chevronColor: '#0284c7',
      Icon: Award
    };
  }
  if (n.includes('panel') || n.includes('chat') || n.includes('fireside')) {
    return {
      bg: '#fff1f2', border: '#fecdd3',
      iconBg: 'linear-gradient(135deg, #f472b6 0%, #e11d48 100%)', iconColor: '#ffffff',
      titleColor: '#4c0519', countColor: '#e11d48', chevronColor: '#e11d48',
      Icon: Users
    };
  }
  if (n.includes('activity') || n.includes('hub')) {
    return {
      bg: '#f0f5ff', border: '#c7d2fe',
      iconBg: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)', iconColor: '#ffffff',
      titleColor: '#1e1b4b', countColor: '#4f46e5', chevronColor: '#4f46e5',
      Icon: Sparkles
    };
  }
  if (n.includes('pro')) {
    return {
      bg: '#fff1f2', border: '#fecdd3',
      iconBg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', iconColor: '#ffffff',
      titleColor: '#4c0519', countColor: '#e11d48', chevronColor: '#e11d48',
      Icon: Music
    };
  }
  return {
    bg: '#f8fafc', border: '#e2e8f0',
    iconBg: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', iconColor: '#ffffff',
    titleColor: '#0f172a', countColor: '#64748b', chevronColor: '#64748b',
    Icon: Building2
  };
}

// ─── Reusable Event Card ───────────────────────────────────────────────────────
function EventCard({ event, onNavigate, onClose, live, index = 0 }) {
  const timeDisp    = getTimeString(event);
  const bldgDisp    = event.building || event.block_name || '';
  const roomDisp    = event.room || event.room_name || event.room_number || '';
  const floorDisp   = event.floor || event.floor_number || '';
  const speakerDisp = getSpeakerDisplay(event);
  const categoryDisp = event.event_category || event.category || '';

  return (
    <div
      className={`lem-event-card${live ? ' lem-event-card--live' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {live && (
        <div className="lem-live-badge">
          <span className="lem-live-dot" />
          LIVE
        </div>
      )}
      {categoryDisp && !live && (
        <div className="lem-event-category">{categoryDisp}</div>
      )}
      <h3 className="lem-event-title">{event.event_name}</h3>
      <div className="lem-event-meta">
        {speakerDisp && (
          <div className="lem-meta-row">
            <Users size={13} className="lem-meta-icon lem-purple" />
            <span className="lem-purple">{speakerDisp}</span>
          </div>
        )}
        {timeDisp && (
          <div className="lem-meta-row">
            <Clock size={13} className="lem-meta-icon" />
            <span>{timeDisp}</span>
          </div>
        )}
        {bldgDisp && (
          <div className="lem-meta-row">
            <MapPin size={13} className="lem-meta-icon lem-blue" />
            <span className="lem-blue">
              {bldgDisp}{floorDisp ? ` · ${floorDisp}` : ''}{roomDisp ? ` · ${roomDisp}` : ''}
            </span>
          </div>
        )}
      </div>
      <button className="lem-nav-btn" onClick={() => { onNavigate(event); onClose(); }}>
        <MapPin size={14} /> Take me there
      </button>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
const LiveEventsModal = forwardRef(function LiveEventsModal({ events = [], onNavigate, onClose }, ref) {
  const [tab, setTab]               = useState('all');
  const [selectedCat, setSelectedCat] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => getIndianDateTime());

  useImperativeHandle(ref, () => ({
    handleBack() {
      if (selectedCat) {
        setSelectedCat(null);
        return true;
      }
      return false;
    }
  }), [selectedCat]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getIndianDateTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  const isLive = (e) => isEventLiveInIST(e, currentTime);

  const categories = useMemo(() => {
    const counts = {};
    events.forEach(e => {
      const cat = e.event_category || e.category || 'Check In';
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  }, [events]);

  const categoryEvents = useMemo(() =>
    !selectedCat ? [] : events.filter(e => (e.event_category || e.category || 'Check In') === selectedCat),
  [events, selectedCat]);

  const liveEvents = useMemo(() => events.filter(isLive), [events, currentTime]);
  const hasLive = liveEvents.length > 0;

  return (
    <div className="lem-overlay">
      <div className="lem-card">

        {/* Header with Mockup Branding & Map Illustration */}
        <div className="lem-header">
          {selectedCat ? (
            <div className="lem-header-left">
              <button className="lem-back-btn" onClick={() => setSelectedCat(null)}>
                <ChevronLeft size={18} />
              </button>
              <h2 className="lem-title">{selectedCat}</h2>
            </div>
          ) : (
            <>
              <div className="lem-header-branding">
                <div className="lem-brand-logo-frame">
                  <img src="/campus compass.jpeg" alt="Logo" className="lem-brand-logo-img" />
                </div>
                <div className="lem-brand-info">
                  <div className="lem-brand-title">
                    <span className="lem-title-navy">CAMPUS </span>
                    <span className="lem-title-teal">COMPASS</span>
                  </div>
                  <div className="lem-brand-sub">IEDC CCE</div>
                  <div className="lem-brand-tagline">Navigate &nbsp;·&nbsp; Discover &nbsp;·&nbsp; Engage</div>
                </div>
              </div>
            </>
          )}

          {!selectedCat && (
            <button className="lem-close-btn" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tabs Bar */}
        <div className="lem-tabs-wrapper">
          <div className="lem-tabs">
            <button
              className={`lem-tab${tab === 'all' ? ' lem-tab--active' : ''}`}
              onClick={() => { setTab('all'); setSelectedCat(null); }}
            >
              <span className="lem-tab-text">All Events</span>
              {tab === 'all' && <span className="lem-tab-underline" />}
            </button>
            <button
              className={`lem-tab${tab === 'live' ? ' lem-tab--active' : ''}`}
              onClick={() => { setTab('live'); setSelectedCat(null); }}
            >
              {hasLive && <span className="lem-tab-live-dot" />}
              <span className="lem-tab-text">Live Events</span>
              {hasLive && <span className="lem-tab-count">{liveEvents.length}</span>}
              {tab === 'live' && <span className="lem-tab-underline" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lem-content">
          {/* ALL: Category Grid */}
          {tab === 'all' && !selectedCat && (
            <div className="lem-cat-grid">
              {categories.map((cat, index) => {
                const theme = getCategoryTheme(cat);
                const Icon  = theme.Icon;
                const count = events.filter(e => (e.event_category || e.category || 'Check In') === cat).length;
                const catHasLive = events.some(e => (e.event_category || e.category || 'Check In') === cat && isLive(e));

                return (
                  <button
                    key={cat}
                    className="lem-cat-card"
                    style={{ background: theme.bg, borderColor: theme.border, animationDelay: `${index * 0.045}s` }}
                    onClick={() => setSelectedCat(cat)}
                  >
                    {catHasLive && <span className="lem-cat-live-dot" />}
                    
                    <div className="lem-cat-card-header">
                      <div className="lem-cat-icon-badge" style={{ background: theme.iconBg }}>
                        <Icon size={20} color={theme.iconColor} strokeWidth={2.2} />
                      </div>

                      <div className="lem-cat-chevron">
                        <ChevronRight size={14} color={theme.chevronColor} strokeWidth={2.5} />
                      </div>
                    </div>

                    <div className="lem-cat-text-stack">
                      <span className="lem-cat-name" style={{ color: theme.titleColor }}>{cat}</span>
                      <span className="lem-cat-count" style={{ color: theme.countColor }}>
                        {count} {count === 1 ? 'event' : 'events'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ALL: Category drill-down */}
          {tab === 'all' && selectedCat && (
            <div className="lem-event-list">
              {categoryEvents.length === 0
                ? <div className="lem-empty">No events in this category.</div>
                : categoryEvents.map((ev, index) => (
                  <EventCard key={ev.id || ev.event_name} event={ev} index={index}
                    live={isLive(ev)} onNavigate={onNavigate} onClose={onClose} />
                ))}
            </div>
          )}

          {/* LIVE tab */}
          {tab === 'live' && (
            <div className="lem-event-list">
              {liveEvents.length === 0
                ? (
                  <div className="lem-empty">
                    <Flame size={32} style={{ color: '#ef4444', marginBottom: 8 }} />
                    <p style={{ fontWeight: 700, color: '#374151' }}>No live events right now</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Check back soon!</p>
                  </div>
                )
                : liveEvents.map((ev, index) => (
                  <EventCard key={ev.id || ev.event_name} event={ev} index={index}
                    live={true} onNavigate={onNavigate} onClose={onClose} />
                ))}
            </div>
          )}
        </div>

        {/* Footer Button ("Locate Events") */}
        <div className="lem-footer">
          <button className="lem-locate-btn" onClick={onClose}>
            <div className="lem-locate-left">
              <MapPin size={20} className="lem-locate-pin" />
              <span>Locate Events</span>
            </div>
            <div className="lem-locate-arrow">
              <ChevronRight size={16} color="#ffffff" strokeWidth={3} />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
});

export default LiveEventsModal;
