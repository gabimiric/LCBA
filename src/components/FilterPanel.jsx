import { useState, useEffect, useMemo } from 'react';
import styles from '../styles/FilterPanel.module.css';

// Levenshtein distance - measures how different two strings are
function levenshteinDistance(a, b) {
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[b.length][a.length];
}

// Improved fuzzy search with edit distance tolerance
function fuzzyMatch(searchTerm, text) {
  const term = searchTerm.toLowerCase();
  const txtLower = text.toLowerCase();

  // Exact substring match
  if (txtLower.includes(term)) {
    return true;
  }

  // Check each word with edit distance tolerance
  const words = txtLower.split(/\s+/);
  for (const word of words) {
    // Allow 1-2 character differences (typos, transpositions)
    const distance = levenshteinDistance(term, word);
    if (distance <= 2) {
      return true;
    }
  }

  return false;
}

export default function FilterPanel({ achievements, onFilterChange }) {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectionRangeMin, setProjectionRangeMin] = useState(0);
  const [projectionRangeMax, setProjectionRangeMax] = useState(100);
  const [completedFilter, setCompletedFilter] = useState('all'); // all, first, last, hide
  const [sortBy, setSortBy] = useState('name'); // name, projectionAsc, projectionDesc

  // Get unique groups from achievements
  const groups = useMemo(
    () => [...new Set(achievements.map((a) => a.group))].sort(),
    [achievements]
  );

  // Find max projection rate
  const maxProjection = useMemo(
    () => Math.max(...achievements.map((a) => a.projectionRate), 100),
    [achievements]
  );

  // Apply filters and sorting
  useEffect(() => {
    let filtered = achievements.filter((achievement) => {
      // Group filter
      if (selectedGroups.length > 0 && !selectedGroups.includes(achievement.group)) {
        return false;
      }

      // Projection rate filter
      if (
        achievement.projectionRate < projectionRangeMin ||
        achievement.projectionRate > projectionRangeMax
      ) {
        return false;
      }

      // Fuzzy search filter
      if (searchTerm.trim()) {
        const term = searchTerm.trim();
        const matchesName = fuzzyMatch(term, achievement.name);
        const matchesKeyword = achievement.keywords.some((k) => fuzzyMatch(term, k));
        if (!matchesName && !matchesKeyword) return false;
      }

      return true;
    });

    // Sort
    if (sortBy === 'projectionAsc') {
      filtered.sort((a, b) => a.projectionRate - b.projectionRate);
    } else if (sortBy === 'projectionDesc') {
      filtered.sort((a, b) => b.projectionRate - a.projectionRate);
    } else {
      // Default sort by name
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Handle completed filter
    const completed = filtered.filter((a) => a.completed);
    const incomplete = filtered.filter((a) => !a.completed);

    if (completedFilter === 'last') {
      filtered = [...incomplete, ...completed];
    } else if (completedFilter === 'first') {
      filtered = [...completed, ...incomplete];
    } else if (completedFilter === 'hide') {
      filtered = incomplete;
    }
    // else 'all' - keep as is

    onFilterChange(filtered);
  }, [
    selectedGroups,
    projectionRangeMin,
    projectionRangeMax,
    searchTerm,
    completedFilter,
    sortBy,
    achievements,
    onFilterChange,
  ]);

  const handleGroupToggle = (group) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const handleClearFilters = () => {
    setSelectedGroups([]);
    setProjectionRangeMin(0);
    setProjectionRangeMax(maxProjection);
    setSearchTerm('');
    setCompletedFilter('all');
    setSortBy('name');
  };

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterSection}>
        <h3>Search</h3>
        <input
          type="text"
          placeholder="Search by name or keyword (fuzzy)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.filterSection}>
        <h3>Groups</h3>
        <div className={styles.filterOptions}>
          {groups.map((group) => (
            <label key={group} className={styles.filterLabel}>
              <input
                type="checkbox"
                checked={selectedGroups.includes(group)}
                onChange={() => handleGroupToggle(group)}
              />
              {group}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3>Projection Rate</h3>
        <div className={styles.rangeContainer}>
          <div className={styles.rangeRow}>
            <label>Min:</label>
            <input
              type="number"
              min="0"
              max={maxProjection}
              value={projectionRangeMin}
              onChange={(e) => setProjectionRangeMin(Number(e.target.value))}
              className={styles.rangeInput}
            />
          </div>
          <div className={styles.rangeRow}>
            <label>Max:</label>
            <input
              type="number"
              min="0"
              max={maxProjection}
              value={projectionRangeMax}
              onChange={(e) => setProjectionRangeMax(Number(e.target.value))}
              className={styles.rangeInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3>Completed Achievements</h3>
        <select
          value={completedFilter}
          onChange={(e) => setCompletedFilter(e.target.value)}
          className={styles.selectInput}
        >
          <option value="all">Show All</option>
          <option value="first">Show First</option>
          <option value="last">Show Last</option>
          <option value="hide">Hide</option>
        </select>
      </div>

      <div className={styles.filterSection}>
        <h3>Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.selectInput}
        >
          <option value="name">Name (A-Z)</option>
          <option value="projectionAsc">Projection Rate (Low to High)</option>
          <option value="projectionDesc">Projection Rate (High to Low)</option>
        </select>
      </div>

      <button className={styles.clearButton} onClick={handleClearFilters}>
        Clear All Filters
      </button>
    </div>
  );
}
