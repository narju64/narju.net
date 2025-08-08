import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../utils/api';

interface ListItem {
  id?: number;
  [key: string]: any; // Allow any properties
}

interface ApiResponse {
  list: {
    id: number;
    name: string;
    category: string;
    items_json: ListItem[];
  };
}

interface GenericListProps {
  category: string;
  title: string;
  description?: string;
  hardcodedData?: ListItem[];
  renderItem: (item: ListItem, index: number) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderFilters?: () => React.ReactNode;
}

const GenericList: React.FC<GenericListProps> = ({
  category,
  title,
  description,
  hardcodedData = [],
  renderItem,
  renderHeader,
  renderFilters
}) => {
  const [items, setItems] = useState<ListItem[]>(hardcodedData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('adminToken');
    const loggedIn = !!(storedUser && storedToken);

    // If logged in, fetch from API
    if (loggedIn) {
      fetchFromApi();
    } else {
      // Load hardcoded data
      setItems(hardcodedData);
    }
  }, [category, hardcodedData]);

  const fetchFromApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(buildApiUrl(`/api/lists/${category}`));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('API Response:', data);
      
      // Use API data if available, otherwise fall back to hardcoded
      if (data.list && data.list.items_json && data.list.items_json.length > 0) {
        setItems(data.list.items_json);
      } else {
        console.log('No API data available, using hardcoded data');
        setItems(hardcodedData);
      }
    } catch (err) {
      console.error(`Error fetching ${category} from API:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fall back to hardcoded data on error
      setItems(hardcodedData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generic-list-page">
      <div className="container">
        <h1 className="page-title">{title}</h1>
        <p className="page-description">
          {description}
          {loading && (
            <span style={{ color: '#e67e22', fontWeight: 'bold' }}>
              {' '}(Loading from database)
            </span>
          )}
        </p>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#e67e22' }}>
            Loading {category} from database...
          </div>
        )}
        
        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#e53e3e' }}>
            Error loading from database: {error}. Using hardcoded data.
          </div>
        )}

        {renderHeader && renderHeader()}
        {renderFilters && renderFilters()}
        
        <div className="list-container">
          {items.map((item, index) => renderItem(item, index))}
        </div>
      </div>
    </div>
  );
};

export default GenericList;
