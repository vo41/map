// script.js
const map = L.map('map', {
  attributionControl: false, // Disable default attribution control
  dragging: true, // Enable dragging (to handle restrictions)
  zoomControl: true // Enable zoom controls
}).setView([0, 0], 1); // Set initial view completely zoomed out

// Add a dark tile layer for a night-time appearance
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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

// Define a square icon with increased size (50% larger than before)
const squareIcon = L.icon({
  iconUrl: 'square.png', // Path to your square flag image
  iconSize: [9.375, 9.375], // Size of the icon in pixels (50% larger than 6.25x6.25)
  iconAnchor: [4.6875, 4.6875], // Adjust anchor point
  popupAnchor: [0, -15] // Point from which the popup should open relative to the iconAnchor
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

// Add markers with clustering
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

// Marker clustering setup
const markers = L.layerGroup().addTo(map);
const markerClusterGroup = L.markerClusterGroup().addTo(markers);

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
      markerClusterGroup.addLayer(marker);
    }
  });
});
