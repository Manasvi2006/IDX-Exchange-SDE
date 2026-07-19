import React, { useState, useEffect } from 'react';
import PropertyCard from '../components/PropertyCard';
import { fetchProperties } from '../api/properties';

function ListingsPage() {
  // holds the list of properties once they load
  const [properties, setProperties] = useState([]);
  // tracks whether we're still waiting on the API
  const [loading, setLoading] = useState(true);
  // holds any error message if something goes wrong
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await fetchProperties({ limit: 20, offset: 0 });
        setProperties(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        // whether it succeeded or failed, we're no longer loading
        setLoading(false);
      }
    }

    loadProperties();
  }, []); // empty array means this only runs once when the page first loads

  // show a loading message while waiting for the API
  if (loading) return <div className="loading">Loading properties...</div>;

  // show an error message if something went wrong
  if (error) return <div className="error">Error: {error}</div>;

  // show a message if no properties came back
  if (properties.length === 0) return <div>No properties found.</div>;

  return (
    <div>
      <h1>Property Listings</h1>
      <div className="grid">
        {properties.map((property) => (
          <PropertyCard key={property.L_ListingID} property={property} />
        ))}
      </div>
    </div>
  );
}

export default ListingsPage;