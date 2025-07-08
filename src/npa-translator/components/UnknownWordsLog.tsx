import React, { useState, useEffect } from 'react';
import { 
  getFailedTranslations, 
  getFailedTranslationStats, 
  clearFailedTranslations,
  getFailedTranslationsCSV,
  removeFailedTranslation,
  cleanupOldFailedTranslations
} from '../utils/translationLogger';
import { FailedTranslation } from '../types/phonetic';
import './UnknownWordsLog.css';

export function UnknownWordsLog() {
  const [failedTranslations, setFailedTranslations] = useState<FailedTranslation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState<'word' | 'attempts' | 'timestamp'>('attempts');

  useEffect(() => {
    loadFailedTranslations();
  }, []);

  const loadFailedTranslations = () => {
    const translations = getFailedTranslations();
    const translationStats = getFailedTranslationStats();
    setFailedTranslations(translations);
    setStats(translationStats);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all failed translation logs? This cannot be undone.')) {
      clearFailedTranslations();
      loadFailedTranslations();
    }
  };

  const handleCleanupOld = () => {
    const days = 30;
    const removed = cleanupOldFailedTranslations(days);
    if (removed > 0) {
      alert(`Cleaned up ${removed} old entries (older than ${days} days)`);
      loadFailedTranslations();
    } else {
      alert('No old entries to clean up');
    }
  };

  const handleExportCSV = () => {
    const csv = getFailedTranslationsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `npa-failed-translations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRemoveWord = (word: string) => {
    if (window.confirm(`Remove "${word}" from the failed translations log?`)) {
      removeFailedTranslation(word);
      loadFailedTranslations();
    }
  };

  const filteredTranslations = failedTranslations
    .filter(entry => 
      entry.word.toLowerCase().includes(filterText.toLowerCase()) ||
      (entry.context && entry.context.toLowerCase().includes(filterText.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'word':
          return a.word.localeCompare(b.word);
        case 'attempts':
          return b.attempts - a.attempts;
        case 'timestamp':
          return b.timestamp - a.timestamp;
        default:
          return 0;
      }
    });

  if (!showDetails) {
    return (
      <div className="unknown-words-log">
        <div className="log-header">
          <h3>Unknown Words Log</h3>
          <button 
            className="log-toggle-button"
            onClick={() => setShowDetails(true)}
          >
            View Details ({stats?.uniqueWords || 0} words)
          </button>
        </div>
        {stats && (
          <div className="log-summary">
            <span>Total attempts: {stats.totalFailed}</span>
            <span>Unique words: {stats.uniqueWords}</span>
            <span>Recent failures: {stats.recentFailures.length}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="unknown-words-log expanded">
      <div className="log-header">
        <h3>Unknown Words Log</h3>
        <button 
          className="log-toggle-button"
          onClick={() => setShowDetails(false)}
        >
          Hide Details
        </button>
      </div>

      {stats && (
        <div className="log-summary">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Attempts:</span>
              <span className="stat-value">{stats.totalFailed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unique Words:</span>
              <span className="stat-value">{stats.uniqueWords}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Recent (24h):</span>
              <span className="stat-value">{stats.recentFailures.length}</span>
            </div>
          </div>
        </div>
      )}

      <div className="log-controls">
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Filter words or context..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="filter-input"
          />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="attempts">Sort by Attempts</option>
            <option value="word">Sort by Word</option>
            <option value="timestamp">Sort by Recent</option>
          </select>
        </div>
        
        <div className="action-buttons">
          <button onClick={handleExportCSV} className="action-button export">
            Export CSV
          </button>
          <button onClick={handleCleanupOld} className="action-button cleanup">
            Clean Old
          </button>
          <button onClick={handleClearAll} className="action-button clear">
            Clear All
          </button>
        </div>
      </div>

      <div className="log-content">
        {filteredTranslations.length === 0 ? (
          <div className="no-entries">
            {filterText ? 'No words match your filter.' : 'No failed translations logged yet.'}
          </div>
        ) : (
          <div className="translations-list">
            {filteredTranslations.map((entry, index) => (
              <div key={`${entry.word}-${index}`} className="translation-entry">
                <div className="entry-main">
                  <span className="entry-word">{entry.word}</span>
                  <span className="entry-attempts">{entry.attempts} attempts</span>
                  <span className="entry-date">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {entry.context && (
                  <div className="entry-context">
                    Context: {entry.context}
                  </div>
                )}
                <button 
                  onClick={() => handleRemoveWord(entry.word)}
                  className="remove-word-button"
                  title="Remove from log"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats?.mostAttempted && stats.mostAttempted.length > 0 && (
        <div className="most-attempted">
          <h4>Most Attempted Words</h4>
          <div className="attempted-list">
            {stats.mostAttempted.slice(0, 5).map((entry: FailedTranslation) => (
              <span key={entry.word} className="attempted-word">
                {entry.word} ({entry.attempts})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 