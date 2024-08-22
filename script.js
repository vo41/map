// script.js
const map = L.map('map', {
  attributionControl: false, // Disable default attribution control
  dragging: true, // Enable dragging
  zoomControl: true // Enable zoom controls
}).setView([0, 0], 1); // Initial view zoomed out

// Add a dark tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '' // Minimal attribution
}).addTo(map);

// Restrict panning to the bounds
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
  iconSize: [9.375, 9.375], // Increased size
  iconAnchor: [4.6875, 4.6875], // Adjust anchor point
  popupAnchor: [0, -15] // Popup position
});

// Define a click event to show popups
function onMarkerClick(e) {
  e.target.openPopup();
}

// Simplify popup content to show only city and country
function getPopupContent(display_name) {
  const parts = display_name.split(', ');
  const city = parts.length > 0 ? parts[0] : 'Unknown';
  const country = parts.length > 1 ? parts[parts.length - 1] : 'Unknown';
  return `${city}, ${country}`;
}

// Add markers without clustering
async function addLocation(placeName) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${placeName}&format=json`);
  const data = await response.json();
  if (data.length > 0) {
    const { lat, lon, display_name } = data[0];
    return { lat, lon, display_name };
  } else {
    alert('Location not found');
    return null;
  }
}

Promise.all([
  addLocation('Porto, Portugal'),
  addLocation('Lisbon, Portugal'),
  addLocation('Faro, Portugal'),
  addLocation('Campina Grande, Brazil')
]).then(locations => {
  locations.forEach(location => {
    if (location) {
      const { lat, lon, display_name } = location;
      const marker = L.marker([lat, lon], { icon: squareIcon })
        .bindPopup(getPopupContent(display_name))
        .on('mouseover', onMarkerClick)
        .on('click', onMarkerClick);
      marker.addTo(map); // Add markers directly to the map
    }
  });
});
