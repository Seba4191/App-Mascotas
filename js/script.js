// Inicializar el mapa centrado en el centro de Argentina (Buenos Aires)
const map = L.map('map', {
    zoomControl: false
}).setView([-38.4161, -63.6167], 5); // Coordenadas aproximadas al centro geográfico de Argentina

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

// Objeto con las provincias/estados por país
const statesByCountry = {
    'AR': ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Entre Ríos', 'Salta', 'Misiones', 'Chaco', 'Corrientes', 'Santiago del Estero', 'San Juan', 'Jujuy', 'Río Negro', 'Neuquén', 'Formosa', 'Chubut', 'San Luis', 'Catamarca', 'La Rioja', 'La Pampa', 'Santa Cruz', 'Tierra del Fuego'],
    'BR': ['São Paulo', 'Río de Janeiro', 'Minas Gerais', 'Bahía', 'Paraná', 'Río Grande do Sul', 'Pernambuco', 'Ceará', 'Pará', 'Santa Catarina', 'Maranhão', 'Goiás', 'Amazonas', 'Espírito Santo', 'Paraíba', 'Río Grande do Norte', 'Mato Grosso', 'Alagoas', 'Piauí', 'Distrito Federal', 'Mato Grosso do Sul', 'Sergipe', 'Rondônia', 'Tocantins', 'Acre', 'Amapá', 'Roraima'],
    'CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Puerto Montt', 'Chillán', 'Calama', 'Valdivia', 'Quillota', 'Osorno', 'Copiapó', 'Los Ángeles', 'Punta Arenas', 'Curicó', 'Villa Alemana', 'Coronel', 'San Antonio', 'Chiguayante', 'Ovalle', 'Linares', 'Quilpué', 'Melipilla'],
    'UY': ['Montevideo', 'Canelones', 'Maldonado', 'Rocha', 'Treinta y Tres', 'Cerro Largo', 'Rivera', 'Artigas', 'Salto', 'Paysandú', 'Río Negro', 'Soriano', 'Colonia', 'San José', 'Flores', 'Florida', 'Lavalleja', 'Durazno', 'Tacuarembó'],
    'PY': ['Asunción', 'Central', 'Alto Paraná', 'Itapúa', 'San Pedro', 'Cordillera', 'Guairá', 'Caaguazú', 'Caazapá', 'Paraguarí', 'Concepción', 'Amambay', 'Canindeyú', 'Presidente Hayes', 'Boquerón', 'Alto Paraguay', 'Ñeembucú', 'Misiones'],
    'BO': ['La Paz', 'Santa Cruz', 'Cochabamba', 'Potosí', 'Oruro', 'Tarija', 'Chuquisaca', 'Beni', 'Pando'],
    'PE': ['Lima', 'Arequipa', 'La Libertad', 'Piura', 'Lambayeque', 'Junín', 'Cusco', 'Ancash', 'Ica', 'Tacna', 'Moquegua', 'Huánuco', 'Ayacucho', 'Amazonas', 'Cajamarca', 'San Martín', 'Huancavelica', 'Pasco', 'Tumbes', 'Madre de Dios', 'Ucayali', 'Loreto'],
    'EC': ['Pichincha', 'Guayas', 'Azuay', 'Manabí', 'El Oro', 'Loja', 'Tungurahua', 'Imbabura', 'Esmeraldas', 'Santo Domingo', 'Los Ríos', 'Chimborazo', 'Cotopaxi', 'Bolívar', 'Carchi', 'Cañar', 'Morona Santiago', 'Napo', 'Pastaza', 'Zamora Chinchipe', 'Sucumbíos', 'Orellana', 'Galápagos'],
    'CO': ['Bogotá', 'Antioquia', 'Valle del Cauca', 'Cundinamarca', 'Santander', 'Atlántico', 'Bolívar', 'Nariño', 'Córdoba', 'Boyacá', 'Caldas', 'Tolima', 'Huila', 'Cauca', 'Magdalena', 'Meta', 'Risaralda', 'Quindío', 'Cesar', 'Sucre', 'Norte de Santander', 'Casanare', 'La Guajira', 'Chocó', 'Arauca', 'Putumayo', 'San Andrés y Providencia', 'Amazonas', 'Guainía', 'Guaviare', 'Vaupés', 'Vichada'],
    'VE': ['Distrito Capital', 'Miranda', 'Zulia', 'Carabobo', 'Lara', 'Aragua', 'Bolívar', 'Anzoátegui', 'Táchira', 'Mérida', 'Monagas', 'Falcón', 'Sucre', 'Portuguesa', 'Guárico', 'Barinas', 'Trujillo', 'Yaracuy', 'Apure', 'Vargas', 'Cojedes', 'Delta Amacuro', 'Nueva Esparta', 'Amazonas']
};

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
    // Verificar si el clic fue en el menú o sus elementos
    const menuDesplegable = document.getElementById('menuDesplegable');
    const menuButton = document.getElementById('showMenu');
    const clickedElement = e.originalEvent.target;
    
    // Si el clic fue en el menú o sus elementos, no hacer nada
    if (menuDesplegable.contains(clickedElement) || menuButton.contains(clickedElement)) {
        return;
    }
    
    // Si el menú está abierto, cerrarlo y no hacer nada más
    if (menuDesplegable.classList.contains('active')) {
        menuDesplegable.classList.remove('active');
        return;
    }
    
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

// Manejar el cambio de país
document.getElementById('countrySelect').addEventListener('change', function() {
    const stateSelect = document.getElementById('stateSelect');
    const selectedCountry = this.value;
    
    // Limpiar y ocultar el selector de estados si no hay país seleccionado
    if (!selectedCountry) {
        stateSelect.style.display = 'none';
        stateSelect.innerHTML = '<option value="">Seleccione una provincia</option>';
        return;
    }
    
    // Mostrar y llenar el selector de estados
    stateSelect.style.display = 'block';
    stateSelect.innerHTML = '<option value="">Seleccione una provincia</option>';
    
    // Agregar las provincias/estados del país seleccionado
    statesByCountry[selectedCountry].forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
});

// Función para realizar la búsqueda
function performSearch() {
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

    // Construir la consulta de búsqueda
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
                map.setView([lat, lon], 13);
            } else {
                alert(`No se encontró la ubicación en ${document.getElementById('countrySelect').options[document.getElementById('countrySelect').selectedIndex].text}. Intenta con otro término.`);
            }
        })
        .catch(error => {
            console.error('Error en la búsqueda:', error);
            alert('Hubo un error al buscar la ubicación. Por favor, intenta de nuevo.');
        });
}

// Manejar el botón de búsqueda
document.getElementById('searchButton').addEventListener('click', performSearch);

// Manejar la tecla Enter en el campo de búsqueda
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
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
    const contactEmail = document.getElementById('contactEmail').value;
    const contactPhone = document.getElementById('contactPhone').value;
    const petPhoto = document.getElementById('petPhoto').files[0];

    if (!currentMarker) {
        alert('Por favor, selecciona una ubicación en el mapa.');
        return;
    }

    if (!contactEmail && !contactPhone) {
        alert('Por favor, ingresa al menos un email o un teléfono de contacto.');
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
            ${contactEmail ? `Email: ${contactEmail}<br>` : ''}
            ${contactPhone ? `Teléfono: ${contactPhone}<br>` : ''}
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
        contactEmail: contactEmail,
        contactPhone: contactPhone,
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
            map.setView([markerData.lat, markerData.lng], 12);
            const marker = markers.find(m => m.id === markerData.id);
            if (marker) {
                marker.marker.openPopup();
            }
        });
        
        petsListContent.appendChild(petItem);
    });
}

// Manejar el botón de mostrar lista
document.getElementById('showMenu').addEventListener('click', function() {
    document.getElementById('menuDesplegable').classList.add('active');
    updatePetsList();
});

// Manejar el botón de cerrar lista
document.getElementById('closeMenu').addEventListener('click', function() {
    document.getElementById('menuDesplegable').classList.remove('active');
});

// Cerrar la lista si se hace clic fuera
window.addEventListener('click', function(e) {
    const petsList = document.getElementById('petsList');
    const showPetsListBtn = document.getElementById('showPetsList');
    if (e.target !== showPetsListBtn && !petsList.contains(e.target)) {
        petsList.classList.remove('active');
    }
});

// Manejar los clics en las opciones del menú
document.getElementById('searchPetOption').addEventListener('click', function() {
    document.getElementById('searchPetModal').style.display = 'block';
    document.getElementById('menuDesplegable').classList.remove('active');
});

document.getElementById('lostPetsOption').addEventListener('click', function() {
    document.getElementById('lostPetsModal').style.display = 'block';
    document.getElementById('menuDesplegable').classList.remove('active');
    updateLostPetsList();
});

document.getElementById('settingsOption').addEventListener('click', function() {
    document.getElementById('settingsModal').style.display = 'block';
    document.getElementById('menuDesplegable').classList.remove('active');
});

// Cerrar todos los modales
document.querySelectorAll('.modal .close').forEach(function(closeBtn) {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Cerrar modales al hacer clic fuera
window.addEventListener('click', function(e) {
    document.querySelectorAll('.modal').forEach(function(modal) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Manejar el formulario de búsqueda
document.getElementById('searchPetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('searchPetName').value;
    
    // Buscar en los marcadores guardados
    const savedMarkers = JSON.parse(localStorage.getItem('petMarkers')) || [];
    const results = savedMarkers.filter(marker => {
        return !name || marker.name.toLowerCase().includes(name.toLowerCase());
    });
    
    // Mostrar resultados
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No se encontraron mascotas que coincidan con la búsqueda.</p>';
        return;
    }
    
    results.forEach(marker => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <h3>${marker.name}</h3>
            <p>${marker.description}</p>
            <p>Contacto: ${marker.contact}</p>
        `;
        
        resultItem.addEventListener('click', () => {
            map.setView([marker.lat, marker.lng], 12);
            const markerObj = markers.find(m => m.id === marker.id);
            if (markerObj) {
                markerObj.marker.openPopup();
            }
            document.getElementById('searchPetModal').style.display = 'none';
        });
        
        searchResults.appendChild(resultItem);
    });
});

// Manejar el formulario de ajustes
document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const settings = {
        notifications: document.getElementById('notifications').checked,
        darkMode: document.getElementById('darkMode').checked,
        language: document.getElementById('language').value
    };
    
    // Guardar ajustes en localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Aplicar ajustes
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Cerrar el modal
    document.getElementById('settingsModal').style.display = 'none';
});

// Cargar ajustes guardados
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('appSettings')) || {
        notifications: true,
        darkMode: false,
        language: 'es'
    };
    
    document.getElementById('notifications').checked = settings.notifications;
    document.getElementById('darkMode').checked = settings.darkMode;
    document.getElementById('language').value = settings.language;
    
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Cargar ajustes al iniciar
loadSettings();

// Cargar marcadores guardados al iniciar
loadSavedMarkers();

// Cerrar el menú desplegable al hacer clic fuera
document.addEventListener('click', function(e) {
    const menuDesplegable = document.getElementById('menuDesplegable');
    const menuButton = document.getElementById('showMenu');
    
    // Si el clic fue fuera del menú y del botón, cerrar el menú
    if (!menuDesplegable.contains(e.target) && !menuButton.contains(e.target)) {
        menuDesplegable.classList.remove('active');
    }
});

// Función para actualizar la lista de mascotas perdidas
function updateLostPetsList() {
    const lostPetsList = document.getElementById('lostPetsList');
    lostPetsList.innerHTML = '';
    
    const savedMarkers = JSON.parse(localStorage.getItem('petMarkers')) || [];
    savedMarkers.forEach(markerData => {
        const petItem = document.createElement('div');
        petItem.className = 'pet-item';
        petItem.innerHTML = `
            <h3>${markerData.name}</h3>
            <p>${markerData.description}</p>
            <p>Contacto: ${markerData.contact}</p>
        `;
        
        petItem.addEventListener('click', () => {
            map.setView([markerData.lat, markerData.lng], 12);
            const marker = markers.find(m => m.id === markerData.id);
            if (marker) {
                marker.marker.openPopup();
            }
            document.getElementById('lostPetsModal').style.display = 'none';
        });
        
        lostPetsList.appendChild(petItem);
    });
}

// Manejar el formulario de contacto
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const contactData = {
                type: document.getElementById('contactType').value,
                name: document.getElementById('contactName').value,
                lastName: document.getElementById('contactLastName').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                message: document.getElementById('contactMessage').value
            };
            
            // Aquí puedes agregar la lógica para enviar el formulario
            console.log('Datos de contacto:', contactData);
            alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
            
            // Limpiar el formulario
            this.reset();
        });
    }
});
