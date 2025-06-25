import React from 'react';

interface FilterPanelProps {
  filters: {
    dateRange: { start: string; end: string };
    type: string;
  };
  onFiltersChange: (filters: FilterPanelProps['filters']) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFiltersChange({
      ...filters,
      dateRange: { ...filters.dateRange, [name]: value },
    });
  };
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, type: e.target.value });
  };
  return (
    <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
      <div>
        <label>Start Date: </label>
        <input type="date" name="start" value={filters.dateRange.start} onChange={handleDateChange} />
      </div>
      <div>
        <label>End Date: </label>
        <input type="date" name="end" value={filters.dateRange.end} onChange={handleDateChange} />
      </div>
      <div>
        <label>Type: </label>
        <select value={filters.type} onChange={handleTypeChange}>
          <option value="">All</option>
          <option value="custom">Custom</option>
          <option value="page_view">Page View</option>
          <option value="conversion">Conversion</option>
          <option value="purchase">Purchase</option>
          <option value="signup">Signup</option>
        </select>
      </div>
    </div>
  );
}; 