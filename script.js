// script.js

// Initialize the map
const map = L.map('map', {
  dragging: true, // Enable dragging
  zoomControl: true, // Enable zoom controls
  scrollWheelZoom: true, // Enable zooming with scroll wheel
  doubleClickZoom: true, // Enable zoom on double-click
  boxZoom: true, // Enable box zooming
  keyboard: true, // Enable keyboard navigation
  touchZoom: true // Enable touch zooming
}).setView([0, 0], 1); // Center the map and set zoom to show the whole world

// Add a dark tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '' // No attribution text
}).addTo(map);

// Restrict panning to the bounds
const bounds = L.latLngBounds(
  L.latLng(-85, -180), // South-West corner
  L.latLng(85, 180)    // North-East corner
);
map.setMaxBounds(bounds);

// Ensure the map is centered and zoomed out to show all continents
map.on('zoomend', function() {
  if (map.getZoom() !== 1) {
    map.setZoom(1); // Set zoom level to fully zoomed out
  }
});

map.on('moveend', function() {
  if (!map.getBounds().intersects(bounds)) {
    map.setView([0, 0], 1); // Center the map if bounds are exceeded
  }
});

// Define a square icon with adjusted size
const squareIcon = L.icon({
  iconUrl: 'square.png', // Path to your square flag image
  iconSize: [15, 15], // Adjusted size
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

Promise.all(locations.map(getLocationData)).then(results => {
  results.forEach(location => {
    if (location) {
      const { lat, lon, city, country } = location;
      L.marker([lat, lon], { icon: squareIcon })
        .bindPopup(`<strong>${city}</strong><br>${country}`)
        .addTo(map);
    }
  });
});
