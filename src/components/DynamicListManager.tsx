import React, { useState, useEffect } from 'react';
import GenericList from './GenericList';

interface ListConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  hardcodedData: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderFilters?: () => React.ReactNode;
}

interface DynamicListManagerProps {
  listConfigs: ListConfig[];
  defaultCategory?: string;
}

const DynamicListManager: React.FC<DynamicListManagerProps> = ({
  listConfigs,
  defaultCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || listConfigs[0]?.category || '');

  useEffect(() => {
    // Check if user is logged in - can be used for future features
    // const loggedIn = !!(localStorage.getItem('currentUser') && localStorage.getItem('authToken'));
  }, []);

  const selectedConfig = listConfigs.find(config => config.category === selectedCategory);

  if (!selectedConfig) {
    return (
      <div className="dynamic-list-manager">
        <div className="container">
          <h1>List Manager</h1>
          <p>No list configuration found for category: {selectedCategory}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-list-manager">
      {/* Category Selector */}
      <div className="category-selector">
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {listConfigs.map(config => (
            <option key={config.id} value={config.category}>
              {config.name}
            </option>
          ))}
        </select>
      </div>

      {/* Generic List Component */}
      <GenericList
        category={selectedConfig.category}
        title={selectedConfig.name}
        description={selectedConfig.description}
        hardcodedData={selectedConfig.hardcodedData}
        renderItem={selectedConfig.renderItem}
        renderHeader={selectedConfig.renderHeader}
        renderFilters={selectedConfig.renderFilters}
      />
    </div>
  );
};

export default DynamicListManager;
