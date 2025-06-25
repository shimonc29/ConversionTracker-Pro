import React from 'react';

interface ConversionsTableProps {
  conversions: any[];
}

export const ConversionsTable: React.FC<ConversionsTableProps> = ({ conversions }) => {
  if (!conversions || conversions.length === 0) {
    return <div>No conversions found.</div>;
  }
  return (
    <table className="conversions-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Conversion ID</th>
          <th>User ID</th>
          <th>Type</th>
          <th>Value</th>
          <th>Currency</th>
          <th>Timestamp</th>
          <th>Source</th>
          <th>Attribution Model</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody>
        {conversions.map((c) => (
          <tr key={c.conversionId}>
            <td>{c.conversionId}</td>
            <td>{c.userId}</td>
            <td>{c.conversionType}</td>
            <td>{c.value}</td>
            <td>{c.currency}</td>
            <td>{c.timestamp}</td>
            <td>{c.attributedSource}</td>
            <td>{c.attributionModel}</td>
            <td>{c.confidence}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}; 