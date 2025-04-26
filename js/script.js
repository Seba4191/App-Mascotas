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

// Array para almacenar los marcadores
let markers = [];
let currentMarker = null;

// Cargar marcadores guardados al iniciar
function loadSavedMarkers() {
    const savedMarkers = JSON.parse(localStorage.getItem('petMarkers')) || [];
    savedMarkers.forEach(markerData => {
        const marker = L.marker([markerData.lat, markerData.lng])
            .addTo(map)
            .bindPopup(`
                <strong>${markerData.name}</strong><br>
                ${markerData.description}<br>
                Contacto: ${markerData.contact}<br>
                <button onclick="deleteMarker(${markerData.id})">Eliminar</button>
            `);
        markers.push({ id: markerData.id, marker: marker });
    });
    updatePetsList();
}

// Función para eliminar un marcador
function deleteMarker(id) {
    const markerIndex = markers.findIndex(m => m.id === id);
    if (markerIndex !== -1) {
        map.removeLayer(markers[markerIndex].marker);
        markers.splice(markerIndex, 1);
        
        // Actualizar localStorage
        const savedMarkers = JSON.parse(localStorage.getItem('petMarkers')) || [];
        const updatedMarkers = savedMarkers.filter(m => m.id !== id);
        localStorage.setItem('petMarkers', JSON.stringify(updatedMarkers));
        
        // Actualizar la lista
        updatePetsList();
    }
}

// Manejar clics en el mapa
map.on('click', function (e) {
    // Eliminar marcador actual, si existe
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    // Añadir nuevo marcador
    currentMarker = L.marker(e.latlng).addTo(map)
        .bindPopup('Última ubicación de la mascota')
        .openPopup();

    // Abrir el modal
    document.getElementById('petModal').style.display = 'block';
});

// Manejar el buscador
document.getElementById('searchButton').addEventListener('click', function () {
    const query = document.getElementById('searchInput').value;
    const countryCode = document.getElementById('countrySelect').value;
    
    if (!query) {
        alert('Por favor, ingresa una ubicación para buscar.');
        return;
    }

    // Llamada a la API de Nominatim con el código de país seleccionado
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${countryCode}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([lat, lon], 15);
                if (currentMarker) {
                    map.removeLayer(currentMarker);
                }
                currentMarker = L.marker([lat, lon]).addTo(map)
                    .bindPopup('Ubicación buscada')
                    .openPopup();
            } else {
                alert(`No se encontró la ubicación en ${document.getElementById('countrySelect').options[document.getElementById('countrySelect').selectedIndex].text}. Intenta con otro término.`);
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
    if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
    }
});

// Cerrar el modal si se hace clic fuera
window.addEventListener('click', function (e) {
    const modal = document.getElementById('petModal');
    if (e.target === modal) {
        modal.style.display = 'none';
        if (currentMarker) {
            map.removeLayer(currentMarker);
            currentMarker = null;
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

    if (!currentMarker) {
        alert('Por favor, selecciona una ubicación en el mapa.');
        return;
    }

    const location = currentMarker.getLatLng();
    const markerId = Date.now(); // ID único para el marcador

    // Crear nuevo marcador con popup
    const newMarker = L.marker([location.lat, location.lng])
        .addTo(map)
        .bindPopup(`
            <strong>${petName}</strong><br>
            ${petDescription}<br>
            Contacto: ${contactInfo}<br>
            <button onclick="deleteMarker(${markerId})">Eliminar</button>
        `);

    // Guardar en el array de marcadores
    markers.push({ id: markerId, marker: newMarker });

    // Guardar en localStorage
    const savedMarkers = JSON.parse(localStorage.getItem('petMarkers')) || [];
    savedMarkers.push({
        id: markerId,
        name: petName,
        description: petDescription,
        contact: contactInfo,
        lat: location.lat,
        lng: location.lng
    });
    localStorage.setItem('petMarkers', JSON.stringify(savedMarkers));

    // Cerrar el modal y limpiar
    document.getElementById('petModal').style.display = 'none';
    this.reset();
    map.removeLayer(currentMarker);
    currentMarker = null;
});

// Función para actualizar la lista de mascotas
function updatePetsList() {
    const petsListContent = document.getElementById('petsListContent');
    petsListContent.innerHTML = '';
    
    const savedMarkers = JSON.parse(localStorage.getItem('petMarkers')) || [];
    savedMarkers.forEach(markerData => {
        const petItem = document.createElement('div');
        petItem.className = 'pet-item';
        petItem.innerHTML = `
            <h3>${markerData.name}</h3>
            <p>${markerData.description}</p>
            <p>Contacto: ${markerData.contact}</p>
            <button class="delete-btn" onclick="deleteMarker(${markerData.id})">Eliminar</button>
        `;
        
        // Agregar evento para centrar el mapa en la ubicación de la mascota
        petItem.addEventListener('click', () => {
            map.setView([markerData.lat, markerData.lng], 15);
            const marker = markers.find(m => m.id === markerData.id);
            if (marker) {
                marker.marker.openPopup();
            }
        });
        
        petsListContent.appendChild(petItem);
    });
}

// Manejar el botón de mostrar lista
document.getElementById('showPetsList').addEventListener('click', function() {
    document.getElementById('petsList').classList.add('active');
    updatePetsList();
});

// Manejar el botón de cerrar lista
document.getElementById('closePetsList').addEventListener('click', function() {
    document.getElementById('petsList').classList.remove('active');
});

// Cerrar la lista si se hace clic fuera
window.addEventListener('click', function(e) {
    const petsList = document.getElementById('petsList');
    const showPetsListBtn = document.getElementById('showPetsList');
    if (e.target !== showPetsListBtn && !petsList.contains(e.target)) {
        petsList.classList.remove('active');
    }
});

// Cargar marcadores guardados al iniciar
loadSavedMarkers();
