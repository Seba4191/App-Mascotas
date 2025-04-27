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
    const state = document.getElementById('stateSelect').value;
    
    if (!query) {
        alert('Por favor, ingresa una ubicación para buscar.');
        return;
    }

    if (!countryCode) {
        alert('Por favor, selecciona un país.');
        return;
    }

    let searchQuery = query;
    if (state) {
        searchQuery = `${query}, ${state}`;
    }

    // Llamada a la API de Nominatim con el código de país seleccionado
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=${countryCode}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                map.setView([lat, lon], 14);
            } else {
                alert(`No se encontró la ubicación. Intenta con otro término.`);
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
            map.setView([markerData.lat, markerData.lng], 14);
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

// Mapeo de países a sus provincias/estados
const countryStates = {
    'AR': ['Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'],
    'BR': ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'],
    'CL': ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble', 'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'],
    'UY': ['Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'],
    'PY': ['Asunción', 'Concepción', 'San Pedro', 'Cordillera', 'Guairá', 'Caaguazú', 'Caazapá', 'Itapúa', 'Misiones', 'Paraguarí', 'Alto Paraná', 'Central', 'Ñeembucú', 'Amambay', 'Canindeyú', 'Presidente Hayes', 'Boquerón', 'Alto Paraguay'],
    'BO': ['Chuquisaca', 'Cochabamba', 'Beni', 'La Paz', 'Oruro', 'Pando', 'Potosí', 'Santa Cruz', 'Tarija'],
    'PE': ['Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'],
    'EC': ['Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'],
    'CO': ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'],
    'VE': ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia']
};

// Manejar el cambio de país
document.getElementById('countrySelect').addEventListener('change', function() {
    const stateSelectContainer = document.getElementById('stateSelectContainer');
    const stateSelect = document.getElementById('stateSelect');
    const selectedCountry = this.value;
    
    // Ocultar el contenedor del selector de estado si no hay país seleccionado
    if (!selectedCountry) {
        stateSelectContainer.style.display = 'none';
        return;
    }
    
    // Mostrar el contenedor y cargar las provincias/estados
    stateSelectContainer.style.display = 'block';
    stateSelect.innerHTML = '<option value="">Seleccione una provincia</option>';
    
    // Agregar las provincias/estados del país seleccionado
    countryStates[selectedCountry].forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
});
