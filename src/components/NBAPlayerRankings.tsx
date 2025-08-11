import React, { useState, useEffect } from 'react';
import './NBAPlayerRankings.css';
import { buildApiUrl } from '../utils/api';

interface Player {
  id?: number;
  rank: number;
  name: string;
  era: string;
  nationality: string;
  position: string;
  photo: string;
  height: string;
  weight: string;
  wingspan: string;
  peak_season?: {
    year: string;
    stats: {
      ppg: number;
      apg: number;
      rpg: number;
      fgp: number;
      threeptp: number | string;
      ftp: number;
    };
    achievements: string;
    context: string;
  };
  personal_notes?: string;
  created_at?: string;
  updated_at?: string;
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

interface ApiResponse {
  players: Player[];
}

const NBAPlayerRankings: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    const loggedIn = !!(storedUser && storedToken);
    setIsLoggedIn(loggedIn);
    
    // If logged in, fetch from API
    if (loggedIn) {
      fetchPlayersFromApi();
    }
  }, []);

  const fetchPlayersFromApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(buildApiUrl('/api/nba-players'), {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      // Use API data if available
      if (data.players && data.players.length > 0) {
        setPlayers(data.players);
      } else {
        setError('No players data available');
      }
    } catch (err) {
      console.error('Error fetching players from API:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };



  const getFlagColor = (nationality: string): string => {
    const colors: { [key: string]: string } = {
      'American': '#B22234',
      'Nigerian': '#008751',
      'Canadian': '#FF0000',
      'German': '#000000',
      'French': '#002395',
      'Spanish': '#AA151B',
      'Italian': '#009246',
      'Greek': '#0D5EAF',
      'Serbian': '#C6363C',
      'Croatian': '#171796',
      'Slovenian': '#FFFFFF',
      'Lithuanian': '#FDB913',
      'Latvian': '#9E3039',
      'Estonian': '#4891D9',
      'Russian': '#FFFFFF',
      'Ukrainian': '#005BBB',
      'Turkish': '#E30A17',
      'Brazilian': '#009C3B',
      'Argentine': '#75AADB',
      'Venezuelan': '#FFD700',
      'Dominican': '#CE1126',
      'Puerto Rican': '#FFFFFF',
      'Mexican': '#006847',
      'Australian': '#012169',
      'Chinese': '#DE2910',
      'Japanese': '#FFFFFF',
      'Korean': '#CD2E3A',
      'Filipino': '#0038A8',
      'Indian': '#FF9933',
      'Iranian': '#239F40',
      'Lebanese': '#EE161F',
      'Egyptian': '#CE1126',
      'Senegalese': '#00853F',
      'Congolese': '#007FFF',
      'Cameroonian': '#007C5B',
      'Ghanaian': '#CE1126',
      'Ivorian': '#F77F00',
      'Malian': '#CE1126',
      'Angolan': '#CC0000',
      'South African': '#007A4D',
      'Tunisian': '#E70013',
      'Algerian': '#006233',
      'Moroccan': '#C1272D'
    };
    return colors[nationality] || '#666666';
  };

  // Show login required message if not logged in
  if (!isLoggedIn) {
    return (
      <div className="nba-rankings-page">
        <div className="container">
          <h1 className="page-title">NBA Player Rankings</h1>
          <p className="page-description">Please log in to view the NBA player rankings.</p>
        </div>
      </div>
    );
  }

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

  if (error) {
    return (
      <div className="nba-rankings-page">
        <div className="container">
          <h1 className="page-title">NBA Player Rankings</h1>
          <p className="page-description">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nba-rankings-page">
      <div className="container">
        <h1 className="page-title">NBA Player Rankings</h1>
        <p className="page-description">
          The greatest basketball players of all time, ranked by impact, achievements, and legacy
          {loading && (
            <span style={{ color: '#e67e22', fontWeight: 'bold' }}>
              {' '}(Loading from database)
            </span>
          )}
        </p>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#e67e22' }}>
            Loading players from database...
          </div>
        )}
        
        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#e53e3e' }}>
            Error loading from database: {error}. Using hardcoded data.
          </div>
        )}
        
        <div className="rankings-list">
          {players.map((player) => (
            <div key={player.rank} className="player-card">
              <div 
                className="player-nationality"
                style={{
                  backgroundImage: `url(/images/flags/${player.nationality.toLowerCase().replace(/\s+/g, '-')}.png)`,
                  backgroundColor: getFlagColor(player.nationality)
                }}
              >
                {player.nationality}
              </div>
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
                      <div className="player-position">{player.position || 'N/A'}</div>
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
                {player.peak_season && player.peak_season.stats && (
                  <div className="peak-season-section">
                    <h3 className="stats-category-title">Peak Season: {player.peak_season.year}</h3>
                    <div className="peak-season-stats">
                      <div className="peak-stats-grid">
                        <div className="stat">
                          <span className="stat-label">PPG:</span>
                          <span className="stat-value">{player.peak_season.stats.ppg}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">APG:</span>
                          <span className="stat-value">{player.peak_season.stats.apg}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">RPG:</span>
                          <span className="stat-value">{player.peak_season.stats.rpg}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">FG%:</span>
                          <span className="stat-value">{player.peak_season.stats.fgp}%</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">3PT%:</span>
                          <span className="stat-value">
                            {typeof player.peak_season.stats.threeptp === 'string' ? player.peak_season.stats.threeptp : `${player.peak_season.stats.threeptp}%`}
                          </span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">FT%:</span>
                          <span className="stat-value">{player.peak_season.stats.ftp}%</span>
                        </div>
                      </div>
                      <div className="peak-achievements">
                        <strong>Achievements:</strong> {player.peak_season.achievements}
                      </div>
                      <div className="peak-context">
                        {player.peak_season.context}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NBAPlayerRankings; 