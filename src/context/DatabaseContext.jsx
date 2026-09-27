import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { findMatchingBuildingNode } from '../utils/buildingMatcher';

export const DatabaseContext = createContext({});

export const DatabaseProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents]   = useState([]);
  const [nodes, setNodes]     = useState([]);
  const [edges, setEdges]     = useState([]);

  // ── Fetch functions ────────────────────────────────────────────────────────
  // events table columns (new schema):
  //   id, event_name, building, floor, room, event_date,
  //   time_start, time_end, speakers, event_category, time_slot
  const fetchEvents = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('events')
      .select('*');
    if (error) {
      console.error('Error fetching events:', error);
    } else {
      console.log(`Fetched ${(data || []).length} events from DB`);
      setEvents(data || []);
    }
  };

  const fetchNodes = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('outdoor_nodes').select('*');
    if (error) console.error('Error fetching nodes:', error);
    else setNodes(data || []);
  };

  const fetchEdges = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase.from('outdoor_edges').select('*');
    if (error) console.error('Error fetching edges:', error);
    else setEdges(data || []);
  };

  const loadAllData = async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    await Promise.all([fetchEvents(), fetchNodes(), fetchEdges()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();

    if (!isSupabaseConfigured) return;

    // Set up real-time listener for events, outdoor_nodes, and outdoor_edges
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outdoor_nodes' }, () => {
        fetchNodes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'outdoor_edges' }, () => {
        fetchEdges();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── searchItems ─────────────────────────────────────────────────────────────
  // Merges events + outdoor_nodes into one unified list for the search bar.
  // Maps every event to our standard shape, resolving the outdoor node for routing.
  const searchItems = useMemo(() => {

    // ── Event items ──────────────────────────────────────────────────────────
    const eventItems = events.map(e => {
      // Direct column reads (new schema — no legacy fallbacks needed)
      const building  = e.building       || '';
      const floor     = e.floor          || '';
      const room      = e.room           || '';
      const timeSlot  = e.time_slot      || (e.time_start && e.time_end
                          ? `${e.time_start} \u2013 ${e.time_end}`
                          : e.time_start || '');
      const category  = e.event_category || 'General';

      // Speakers: stored as semicolon-separated text in DB
      // e.g. "Alice; Bob; Dr. Carol" -> ['Alice', 'Bob', 'Dr. Carol']
      const speakersArr = (typeof e.speakers === 'string' && e.speakers.trim())
        ? e.speakers.split(';').map(s => s.trim()).filter(Boolean)
        : [];
      const speakerStr = speakersArr.join(', ');

      // Resolve outdoor node for map routing
      const bNode = findMatchingBuildingNode(building, nodes);
      const lat = bNode ? parseFloat(bNode.latitude) : NaN;
      const lng = bNode ? parseFloat(bNode.longitude) : NaN;
      const pos = !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;

      return {
        // Raw DB fields kept intact
        ...e,
        // Normalised shape used by SearchBar, LiveEventsModal, YDCard, etc.
        id:             e.id,
        name:           e.event_name,
        type:           'event',
        building,
        floor,
        room,
        event_date:     e.event_date    || null,
        time_start:     e.time_start    || null,
        time_end:       e.time_end      || null,
        time_slot:      timeSlot,
        time:           timeSlot,        // alias consumed by some components
        speakers:       speakersArr,     // array form
        speaker:        speakerStr,      // joined string form
        event_category: category,
        category,                        // alias
        eventCategory:  category,        // alias
        routeNode:      bNode ? bNode.id : null,
        position:       pos,
      };
    });

    // ── Location items (entrance outdoor nodes only) ─────────────────────────
    const nodeItems = nodes
      .filter(n => {
        if (!n || (!n.building_name && !n.name)) return false;
        if (isNaN(parseFloat(n.latitude)) || isNaN(parseFloat(n.longitude))) return false;
        // Only include entrance nodes in location search results
        const isEntrance = n.is_entrance === true ||
          n.is_entrance === 'true' ||
          (typeof n.type === 'string' && n.type.toLowerCase() === 'entrance') ||
          ((n.building_name || n.name || '').toLowerCase().includes('entrance')) ||
          ((n.building_name || n.name || '').toLowerCase().includes('gate'));
        return isEntrance;
      })
      .map(n => ({
        id:        n.id,
        name:      n.building_name || n.name,
        type:      'location',
        building:  n.building_name || n.name,
        routeNode: n.id,
        position:  [parseFloat(n.latitude), parseFloat(n.longitude)],
      }));

    // ── Deduplicate ──────────────────────────────────────────────────────────
    const seenKeys = new Set();
    return [...eventItems, ...nodeItems].filter(item => {
      const idKey      = item.id ? `${item.type}:id:${item.id}` : null;
      const contentKey = `${item.type}:${(item.name || '').trim().toLowerCase()}:${(item.building || '').trim().toLowerCase()}:${(item.room || '').trim().toLowerCase()}`;
      if (idKey && seenKeys.has(idKey)) return false;
      if (seenKeys.has(contentKey))      return false;
      if (idKey) seenKeys.add(idKey);
      seenKeys.add(contentKey);
      return true;
    });

  }, [events, nodes]);

  return (
    <DatabaseContext.Provider value={{
      loading,
      events,
      nodes,
      edges,
      searchItems,
      refetchEvents: fetchEvents,
      refetchNodes: fetchNodes,
      refetchEdges: fetchEdges,
      refetchAll: loadAllData
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
