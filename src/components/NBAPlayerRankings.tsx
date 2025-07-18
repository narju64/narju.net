import React, { useState, useEffect } from 'react';
import './NBAPlayerRankings.css';

interface Player {
  rank: number;
  name: string;
  era: string;
  photo: string;
  height: string;
  weight: string;
  wingspan: string;
  stats: {
    ppg: number;
    apg: number;
    rpg: number;
    fgp: number;
    threeptp: number | string;
    ftp: number;
  };
  achievements: {
    championships: number;
    mvps: number;
    allStar: number;
    allNba: number;
    allDefense: number;
    dpoy: number;
    scoringChampion: number;
    stealChampion: number;
    assistChampion: number;
    reboundChampion: number;
    blockChampion: number;
  };
  teams: string[];
}

const NBAPlayerRankings: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/data/nba-players.json');
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Error loading NBA players data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) {
    return (
      <div className="nba-rankings-page">
        <div className="container">
          <h1 className="page-title">NBA Player Rankings</h1>
          <p className="page-description">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nba-rankings-page">
      <div className="container">
        <h1 className="page-title">NBA Player Rankings</h1>
        <p className="page-description">The greatest basketball players of all time, ranked by impact, achievements, and legacy</p>
        
        <div className="rankings-list">
          {players.map((player) => (
            <div key={player.rank} className="player-card">
              <div className="player-left">
                <div className="player-photo">
                  <img src={player.photo} alt={player.name} />
                </div>
                <div className="player-physical">
                  <div className="physical-stat">
                    <span className="physical-label">Height:</span>
                    <span className="physical-value">{player.height}</span>
                  </div>
                  <div className="physical-stat">
                    <span className="physical-label">Weight:</span>
                    <span className="physical-value">{player.weight}</span>
                  </div>
                  <div className="physical-stat">
                    <span className="physical-label">Wingspan:</span>
                    <span className="physical-value">{player.wingspan}</span>
                  </div>
                </div>
              </div>
              <div className="player-info">
                <div className="player-header">
                  <div className="name-and-years">
                    <h2 className="player-name">#{player.rank} {player.name}</h2>
                    <div className="player-years">({player.era})</div>
                  </div>
                  <div className="player-teams">{player.teams.join(" • ")}</div>
                </div>
                <div className="stats-section">
                  <h3 className="stats-category-title">Stats</h3>
                  <div className="player-stats">
                    <div className="stat">
                      <span className="stat-label">PPG:</span>
                      <span className="stat-value">{player.stats.ppg}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">APG:</span>
                      <span className="stat-value">{player.stats.apg}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">RPG:</span>
                      <span className="stat-value">{player.stats.rpg}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">FG%:</span>
                      <span className="stat-value">{player.stats.fgp}%</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">3PT%:</span>
                      <span className="stat-value">
                        {typeof player.stats.threeptp === 'string' ? player.stats.threeptp : `${player.stats.threeptp}%`}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">FT%:</span>
                      <span className="stat-value">{player.stats.ftp}%</span>
                    </div>
                  </div>
                </div>
                <div className="achievements-section">
                  <h3 className="stats-category-title">Special Achievements</h3>
                  <div className="achievements-list">
                    <span className="achievement-item">Championships ({player.achievements.championships}x)</span>
                    <span className="achievement-item">MVP ({player.achievements.mvps}x)</span>
                    <span className="achievement-item">All-Star ({player.achievements.allStar}x)</span>
                    <span className="achievement-item">All-NBA ({player.achievements.allNba}x)</span>
                    <span className="achievement-item">All-Defense ({player.achievements.allDefense}x)</span>
                    {player.achievements.dpoy > 0 && (
                      <span className="achievement-item">DPOY ({player.achievements.dpoy}x)</span>
                    )}
                    {player.achievements.scoringChampion > 0 && (
                      <span className="achievement-item">Scoring Champion ({player.achievements.scoringChampion}x)</span>
                    )}
                    {player.achievements.stealChampion > 0 && (
                      <span className="achievement-item">Steal Champion ({player.achievements.stealChampion}x)</span>
                    )}
                    {player.achievements.assistChampion > 0 && (
                      <span className="achievement-item">Assist Champion ({player.achievements.assistChampion}x)</span>
                    )}
                    {player.achievements.reboundChampion > 0 && (
                      <span className="achievement-item">Rebound Champion ({player.achievements.reboundChampion}x)</span>
                    )}
                    {player.achievements.blockChampion > 0 && (
                      <span className="achievement-item">Block Champion ({player.achievements.blockChampion}x)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NBAPlayerRankings; 