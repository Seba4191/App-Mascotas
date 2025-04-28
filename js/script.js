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

document.getElementById('contactOption').addEventListener('click', function() {
    document.getElementById('contactModal').style.display = 'block';
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
    const location = document.getElementById('searchPetLocation').value;
    
    // Buscar en los marcadores guardados
    const savedMarkers = JSON.parse(localStorage.getItem('petMarkers')) || [];
    const results = savedMarkers.filter(marker => {
        const nameMatch = !name || marker.name.toLowerCase().includes(name.toLowerCase());
        const locationMatch = !location || marker.description.toLowerCase().includes(location.toLowerCase());
        return nameMatch && locationMatch;
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
            map.setView([marker.lat, marker.lng], 15);
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
            map.setView([markerData.lat, markerData.lng], 15);
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
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const contactData = {
        type: document.getElementById('contactType').value,
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        message: document.getElementById('contactMessage').value
    };
    
    // Aquí puedes agregar la lógica para enviar el formulario
    console.log('Datos de contacto:', contactData);
    alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
    
    // Cerrar el modal y limpiar el formulario
    document.getElementById('contactModal').style.display = 'none';
    this.reset();
});
