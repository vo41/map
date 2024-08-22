// script.js
const map = L.map('map', {
  attributionControl: false, // Disable default attribution control
  dragging: false, // Disable dragging
  zoomControl: false, // Disable zoom controls
  scrollWheelZoom: false, // Disable zooming with scroll wheel
  doubleClickZoom: false, // Disable zoom on double-click
  boxZoom: false, // Disable box zooming
  keyboard: false, // Disable keyboard navigation
  touchZoom: false, // Disable touch zooming
  bounceAtZoomLimits: false // Disable bounce at zoom limits
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

// Ensure the map is centered and zoomed out to show all continents
map.on('zoomend', function() {
  if (map.getZoom() !== 1) {
    map.setZoom(1); // Set zoom level to fully zoomed out
  }
});

map.on('moveend', function() {
  if (map.getBounds().intersects(bounds)) return;
  map.setView([0, 0], 1); // Center the map if bounds are exceeded
});

// Define a square icon with increased size
const squareIcon = L.icon({
  iconUrl: 'square.png', // Path to your square flag image
  iconSize: [11.4375, 11.4375], // Increased size by 15%
  iconAnchor: [5.71875, 5.71875], // Adjust anchor point
  popupAnchor: [0, -15] // Popup position
});

// Define a click event to show popups
function onMarkerMouseOver(e) {
  e.target.openPopup();
}

function onMarkerMouseOut(e) {
  e.target.closePopup(); // Close the popup on mouse out
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
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${placeName}&format=json&accept-language=en`);
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
        .on('mouseover', onMarkerMouseOver)
        .on('mouseout', onMarkerMouseOu
