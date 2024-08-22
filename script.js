// script.js

// Initialize the map
const map = L.map('map', {
  attributionControl: false, // Disable default attribution control
  dragging: true, // Enable dragging
  zoomControl: true, // Enable zoom controls
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
  if (!map.getBounds().intersects(bounds)) {
    map.setView([0, 0], 1); // Center the map if bounds are exceeded
  }
});

// Define a square icon with increased size
const squareIcon = L.icon({
  iconUrl: 'square.png', // Path to your square flag image
  iconSize: [15.9375, 15.9375], // Increased size by 50%
  iconAnchor: [7.96875, 7.96875], // Adjust anchor point
  popupAnchor: [0, -20] // Popup position
});

// Define a mouseover event to show popups
function onMarkerMouseOver(e) {
  e.target.openPopup();
}

// Define a mouseout event to hide popups
function onMarkerMouseOut(e) {
  e.target.closePopup(); // Close the popup on mouse out
}

// Simplify popup content to show only city and country
function getPopupContent(locations) {
  return locations.map(loc => `${loc.city}, ${loc.country}`).join('<br>');
}

// Create a cluster group
const markers = L.markerClusterGroup({
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
});

// Add markers to the cluster group
async function addLocation(placeName) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${placeName}&format=json&accept-language=en`);
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon, display_name } = data[0];
      const parts = display_name.split(', ');
      const city = parts.length > 0 ? parts[0] : 'Unknown';
      const country = parts.length > 1 ? parts[parts.length - 1] : 'Unknown';
      return { lat, lon, city, country };
    } else {
      console.warn('Location not found:', placeName);
      return null;
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
}

Promise.all([
  addLocation('Porto, Portugal'),
  addLocation('Lisbon, Portugal'),
  addLocation('Faro, Portugal'),
  addLocation('Campina Grande, Brazil')
]).then(locations => {
  const locationMap = new Map();
  locations.forEach(location => {
    if (location) {
      const { lat, lon, city, country } = location;
      const key = `${lat}-${lon}`;
      if (!locationMap.has(key)) {
        locationMap.set(key, []);
      }
      locationMap.get(key).push({ city, country });
    }
  });

  locationMap.forEach((locs, key) => {
    const [lat, lon] = key.split('-').map(Number);
    const marker = L.marker([lat, lon], { icon: squareIcon })
      .bindPopup(getPopupContent(locs))
      .on('mouseover', onMarkerMouseOver)
      .on('mouseout', onMarkerMouseOut);
    markers.addLayer(marker);
  });

  map.addLayer(markers); // Add the cluster group to the map
});
