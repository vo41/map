// script.js

// Initialize the map
const map = L.map('map', {
  dragging: true, // Enable dragging
  zoomControl: false, // Disable zoom controls
  scrollWheelZoom: true, // Enable zooming with scroll wheel
  doubleClickZoom: true, // Enable zoom on double-click
  boxZoom: true, // Enable box zooming
  keyboard: true, // Enable keyboard navigation
  touchZoom: true, // Enable touch zooming
  maxBounds: [[-90, -180], [90, 180]], // Limit panning to map edges
  maxBoundsViscosity: 1.0, // Prevent panning outside the map
  worldCopyJump: true, // Enable map looping (world wrapping)
  continuousWorld: true // Allow continuous panning across world edges
});

// Add a dark tile layer with minimal delay
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '', // No attribution text
  noWrap: true // Prevent map wrapping
}).addTo(map);

// Define a smaller square icon
const squareIcon = L.icon({
  iconUrl: 'square.png', // Path to your square flag image
  iconSize: [15, 15], // Decreased size
  iconAnchor: [7.5, 7.5], // Adjust anchor point
  popupAnchor: [0, -15] // Popup position
});

// Function to get location data from OpenStreetMap API
async function getLocationData(query) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&accept-language=en`);
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon, display_name } = data[0];
      const parts = display_name.split(', ');
      const city = parts[0] || 'Unknown';
      const country = parts[parts.length - 1] || 'Unknown';
      return { lat, lon, city, country };
    } else {
      console.warn('Location not found:', query);
      return null;
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
}

// Locations to add to the map
const locations = [
  'Porto, Portugal',
  'Lisbon, Portugal',
  'Faro, Portugal',
  'Campina Grande, Brazil'
];

// Array to hold the markers
const markerPromises = locations.map(getLocationData);

Promise.all(markerPromises).then(results => {
  const markers = results.filter(location => location).map(location => {
    const { lat, lon, city, country } = location;
    return L.marker([lat, lon], { icon: squareIcon })
      .bindPopup(`<strong>${city}, ${country}</strong>`, { className: 'custom-popup' })
      .addTo(map);
  });

  // Cluster overlapping markers
  const markerClusters = L.featureGroup(markers).addTo(map);

  // Center the map based on the markers
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.5)); // Center and pad the view to include all markers
  } else {
    map.setView([0, 0], 2); // Fallback view if no markers are found
  }
});
