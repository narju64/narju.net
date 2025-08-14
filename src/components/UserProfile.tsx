import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../utils/api';
import './UserProfile.css';

interface UserProfileData {
  id: number;
  username: string;
  created_at: string;
}

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, currentUser } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (!username) {
      setError('No username provided');
      setLoading(false);
      return;
    }

    // Check if this is the current user's profile
    if (isLoggedIn && currentUser && currentUser.username === username) {
      setIsOwnProfile(true);
    }

    fetchUserProfile();
  }, [username, isLoggedIn, currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile data from backend
      const response = await fetch(buildApiUrl(`/api/users/${username}/profile`));

      if (!response.ok) {
        if (response.status === 404) {
          setError('Profile not found');
        } else {
          setError('Failed to load profile');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')} className="back-btn">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="user-profile-page">
        <div className="profile-container">
          <div className="error-message">
            <h2>Profile Not Found</h2>
            <p>The requested profile could not be found.</p>
            <button onClick={() => navigate('/')} className="back-btn">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>{profileData.username}'s Profile</h1>
          <div className="header-right">
            <div className="member-since">
              Member since {new Date(profileData.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
                         {isOwnProfile && (
               <button 
                 className="settings-btn"
               >
                 Settings
               </button>
               )}
          </div>
        </div>

        <div className="profile-content">

          <div className="profile-section">
            <h2>Lists</h2>
            <div className="lists-panel">
              <div className="list-category">
                <h3>Music</h3>
                <div className="list-links">
                  <a href={`/lists/music/favorite-albums/${username}`} className="list-link">
                    Favorite Albums
                  </a>
                  <a href={`/lists/music/top-artists/${username}`} className="list-link">
                    Top Artists
                  </a>
                  <a href={`/lists/music/best-hiphop-albums/${username}`} className="list-link">
                    Best Hip-hop Albums
                  </a>
                </div>
              </div>
              
              <div className="list-category">
                <h3>Sports</h3>
                <div className="list-links">
                  <a href={`/lists/sports/nba-player-rankings/${username}`} className="list-link">
                    NBA Player Rankings
                  </a>
                  <a href={`/lists/sports/all-time-athletes/${username}`} className="list-link">
                    All-time Athletes
                  </a>
                </div>
              </div>
              
              <div className="list-category">
                <h3>Film & TV</h3>
                <div className="list-links">
                  <a href={`/lists/film-tv/top-movies/${username}`} className="list-link">
                    Top Movies
                  </a>
                  <a href={`/lists/film-tv/tv-show-rankings/${username}`} className="list-link">
                    TV Show Rankings
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
