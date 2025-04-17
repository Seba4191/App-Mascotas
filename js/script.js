// Inicializar el mapa centrado en el centro de Argentina (Buenos Aires)
const map = L.map('map').setView([-38.4161, -63.6167], 5); // Coordenadas aproximadas al centro geográfico de Argentina

// Añadir capa de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// **Eliminar los límites de maxBounds para permitir mayor visibilidad**
// Ahora puedes moverte libremente sin los límites restrictivos previos.
map.setMaxBounds(null);  // Eliminar los límites

// Limitar el zoom hacia afuera (solo se puede hacer zoom hasta el nivel 5)
map.setMinZoom(5);  // Nivel de zoom mínimo

// Variable para almacenar el marcador
let marker = null;

// Manejar clics en el mapa
map.on('click', function (e) {
    // Eliminar marcador anterior, si existe
    if (marker) {
        map.removeLayer(marker);
    }
    // Añadir nuevo marcador
    marker = L.marker(e.latlng).addTo(map)
        .bindPopup('Última ubicación de la mascota')
        .openPopup();

    // Abrir el modal
    document.getElementById('petModal').style.display = 'block';
});

// Manejar el buscador
document.getElementById('searchButton').addEventListener('click', function () {
    const query = document.getElementById('searchInput').value;
    if (!query) {
        alert('Por favor, ingresa una ubicación para buscar.');
        return;
    }

    // Llamada a la API de Nominatim (solo localidades argentinas)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=AR`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([lat, lon], 15); // Mover el mapa a la ubicación encontrada
                // Opcional: añadir un marcador en la ubicación buscada
                if (marker) {
                    map.removeLayer(marker);
                }
                marker = L.marker([lat, lon]).addTo(map)
                    .bindPopup('Ubicación buscada')
                    .openPopup();
            } else {
                alert('No se encontró la ubicación. Intenta con otro término.');
            }
        })
        .catch(error => {
            console.error('Error en la búsqueda:', error);
            alert('Hubo un error al buscar la ubicación. Por favor, intenta de nuevo.');
        });
});

// Manejar el cierre del modal
document.getElementById('closeModal').addEventListener('click', function () {
    document.getElementById('petModal').style.display = 'none';
    if (marker) {
        map.removeLayer(marker);
        marker = null;
    }
});

// Cerrar el modal si se hace clic fuera
window.addEventListener('click', function (e) {
    const modal = document.getElementById('petModal');
    if (e.target === modal) {
        modal.style.display = 'none';
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
    }
});

// Manejar el envío del formulario
document.getElementById('petForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const petName = document.getElementById('petName').value;
    const petDescription = document.getElementById('petDescription').value;
    const contactInfo = document.getElementById('contactInfo').value;
    const petPhoto = document.getElementById('petPhoto').files[0];

    if (!marker) {
        alert('Por favor, selecciona una ubicación en el mapa.');
        return;
    }

    const location = marker.getLatLng();
    alert(`Mascota reportada:\nNombre: ${petName}\nDescripción: ${petDescription}\nUbicación: ${location.lat}, ${location.lng}\nContacto: ${contactInfo}`);

    // Cerrar el modal y limpiar
    document.getElementById('petModal').style.display = 'none';
    this.reset();
    map.removeLayer(marker);
    marker = null;
});
