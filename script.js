// script.js
const map = L.map('map').setView([51.505, -0.09], 2); // Set initial view to the center of the world

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// script.js (continued)
async function addLocation(placeName) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${placeName}&format=json`);
  const data = await response.json();
  if (data.length > 0) {
    const { lat, lon, display_name } = data[0];
    L.marker([lat, lon])
      .addTo(map)
      .bindPopup(display_name)
      .openPopup();
  } else {
    alert('Location not found');
  }
}

// Example usage
addLocation('Porto, Portugal');
