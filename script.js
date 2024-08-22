// script.js
const map = L.map('map', {
  attributionControl: false, // Disable default attribution control
  dragging: true, // Enable dragging (to handle restrictions)
  zoomControl: true // Enable zoom controls
}).setView([0, 0], 1); // Set initial view completely zoomed out

// Add a dark tile layer with minimal attribution
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '' // Leave attribution empty or put minimal attribution if needed
}).addTo(map);

// Set the map bounds to restrict panning
const bounds = L.latLngBounds(
  L.latLng(-85, -180), // South-West corner
  L.latLng(85, 180)    // North-East corner
);
map.setMaxBounds(bounds);

// Restrict panning within the defined bounds
map.on('moveend', function() {
  if (map.getBounds().intersects(bounds)) return;
  map.setView([0, 0], 1); // Center the map if bounds are exceeded
});

// Define a square icon
const squareIcon = L.icon({
  iconUrl: 'square.png', // Path to your square flag image
  iconSize: [20, 20], // Size of the icon in pixels
  iconAnchor: [10, 10], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -10] // Point from which the popup should open relative to the iconAnchor
});

async function addLocation(placeName) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${placeName}&format=json`);
  const data = await response.json();
  if (data.length > 0) {
    const { lat, lon, display_name } = data[0];
    L.marker([lat, lon], { icon: squareIcon })
      .addTo(map)
      .bindPopup(display_name)
      .openPopup();
  } else {
    alert('Location not found');
  }
}

// Example usage
addLocation('Porto, Portugal');
