// fetches a list of properties with optional filters
export async function fetchProperties(params = {}) {
  // turn the params object into a query string like ?city=Cupertino&limit=20
  const queryString = new URLSearchParams(params).toString();
  const url = `/api/properties${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  // if the server returned an error status, throw so the caller can handle it
  if (!response.ok) {
    throw new Error(`Failed to fetch properties: ${response.status}`);
  }

  return response.json();
}

// fetches a single property by its listing ID
export async function fetchPropertyById(id) {
  const response = await fetch(`/api/properties/${id}`);

  if (!response.ok) {
    throw new Error(`Property not found: ${response.status}`);
  }

  return response.json();
}