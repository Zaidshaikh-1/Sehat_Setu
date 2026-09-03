import { useState, useMemo } from "react";
import drugsData from "../data/indianDrugList.json";

function fuzzyScore(query, text) {
  if (!query || !text) return 0;
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();

  // Exact match
  if (t === q) return 100;
  // Prefix match
  if (t.startsWith(q)) return 80 + (q.length / t.length) * 15;
  // Substring match
  const idx = t.indexOf(q);
  if (idx !== -1) return 60 - idx;

  // Word token matching (e.g. "amox clav" matching "Amoxicillin + Clavulanate")
  const queryTokens = q.split(/\s+/).filter(Boolean);
  let matchedTokens = 0;
  for (const token of queryTokens) {
    if (t.includes(token)) {
      matchedTokens++;
    }
  }
  if (matchedTokens > 0) {
    return (matchedTokens / queryTokens.length) * 40;
  }

  // Character-level sequential match
  let qIdx = 0;
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      qIdx++;
    }
  }
  if (qIdx === q.length) {
    return 20 + (q.length / t.length) * 10;
  }

  return 0;
}

export function searchDrugs(query, maxResults = 8) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const scored = drugsData.map((drug) => {
    const nameScore = fuzzyScore(query, drug.name);
    const genericScore = fuzzyScore(query, drug.genericName || "");
    const categoryScore = fuzzyScore(query, drug.category || "");
    const maxScore = Math.max(nameScore * 1.2, genericScore, categoryScore * 0.8);

    return {
      ...drug,
      score: maxScore,
    };
  });

  return scored
    .filter((d) => d.score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

export function useDrugSearch() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    return searchDrugs(query);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    allDrugs: drugsData,
  };
}
