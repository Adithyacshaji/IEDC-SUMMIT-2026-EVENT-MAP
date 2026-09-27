/**
 * Utility function to find the best matching outdoor map node for a building name.
 * Prevents false-positive partial matches (e.g., "Auditorium" matching "SIIMS Auditorium",
 * or "Main Block" matching "Main Block 2").
 */

const cleanStr = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function findMatchingBuildingNode(targetName, nodes = []) {
  if (!targetName || !nodes || !Array.isArray(nodes) || nodes.length === 0) return null;
  const cleanTarget = cleanStr(targetName);
  if (!cleanTarget) return null;

  const getNodeStrings = (n) => [
    n.building_name,
    n.building,
    n.name,
    n.id,
    n.alias,
    n.label
  ].filter(Boolean);

  const isEntrance = (n) => n.is_entrance === true || n.is_entrance === 'true';

  // 1. Exact clean match
  const exactMatch = nodes.find(n => {
    return getNodeStrings(n).some(s => cleanStr(s) === cleanTarget);
  });
  if (exactMatch) return exactMatch;

  // 2. Exact word token match
  const targetWords = String(targetName).toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const wordMatch = nodes.find(n => {
    return getNodeStrings(n).some(str => {
      const words = String(str).toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
      return targetWords.length === words.length && targetWords.every((w, i) => w === words[i]);
    });
  });
  if (wordMatch) return wordMatch;

  // 3. Substring match prioritized by entrance flag and closest length difference
  const candidates = [];
  for (const n of nodes) {
    const strs = getNodeStrings(n);
    for (const str of strs) {
      const clean = cleanStr(str);
      if (clean && (clean.includes(cleanTarget) || cleanTarget.includes(clean))) {
        candidates.push({ node: n, strClean: clean, entrance: isEntrance(n) });
        break;
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (a.entrance !== b.entrance) return a.entrance ? -1 : 1;
    return Math.abs(a.strClean.length - cleanTarget.length) - Math.abs(b.strClean.length - cleanTarget.length);
  });

  return candidates[0].node;
}
