import React from 'react';

function PropertyCard({ property }) {
  // L_Photos is stored as a JSON string in the database, so we need to parse it
  // if parsing fails for any reason, fall back to an empty array
  let photos = [];
  try {
    photos = JSON.parse(property.L_Photos);
  } catch {
    photos = [];
  }

  // grab just the first photo, or use a placeholder if there aren't any
  const firstPhoto = photos[0] || null;

  return (
    <div className="property-card">
      {/* photo */}
      {firstPhoto ? (
        <img
          src={firstPhoto}
          alt={property.L_Address}
          className="property-card__image"
        />
      ) : (
        <div className="property-card__no-image">No photo available</div>
      )}

      {/* price */}
      <div className="property-card__price">
        ${property.L_SystemPrice?.toLocaleString()}
      </div>

      {/* address */}
      <div className="property-card__address">
        {property.L_Address}
      </div>

      {/* city and state */}
      <div className="property-card__location">
        {property.L_City}, {property.L_State}
      </div>

      {/* beds, baths, sqft */}
      <div className="property-card__details">
        <span>{property.L_Keyword2} beds</span>
        <span>{property.LM_Dec_3 ?? 'N/A'} baths</span>
        <span>{property.LM_Int2_3?.toLocaleString() ?? 'N/A'} sqft</span>
      </div>
    </div>
  );
}

export default PropertyCard;