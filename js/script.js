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

// Icono genérico para cuando no haya foto de mascota
const defaultIcon = L.divIcon({
    html: '<div class="marker-icon-wrapper"><img src="https://cdn-icons-png.flaticon.com/512/3047/3047928.png" alt="Mascota" width="30" height="30"></div>',
    className: 'pet-marker-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

// Array para almacenar los marcadores
let markers = [];
let currentMarker = null;

// Variables globales para la ubicación seleccionada
let selectedLocation = null;

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

// Función para crear un icono personalizado con la imagen de la mascota
function createPetIcon(imageUrl) {
    const icon = L.divIcon({
        html: `<div class="marker-icon-wrapper"><img src="${imageUrl}" alt="Mascota" width="40" height="40"></div>`,
        className: 'pet-marker-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
    return icon;
}

// Cargar marcadores guardados al iniciar
function loadSavedMarkers() {
    const savedMarkers = JSON.parse(localStorage.getItem('petMarkers')) || [];
    savedMarkers.forEach(markerData => {
        // Crear contacto con teléfono y/o email (para compatibilidad con marcadores antiguos)
        let contactInfo = "";
        if (markerData.contactPhone) {
            contactInfo += `<p><i class="fas fa-phone"></i> ${markerData.contactPhone}</p>`;
        }
        // Para compatibilidad con marcadores antiguos que podrían tener email
        if (markerData.contactEmail) {
            contactInfo += `<p><i class="fas fa-envelope"></i> ${markerData.contactEmail}</p>`;
        }

        // Usar siempre el icono por defecto
        const marker = L.marker([markerData.lat, markerData.lng], {icon: defaultIcon})
            .addTo(map)
            .bindPopup(`
                <div class="pet-popup">
                    <h3>${markerData.name}</h3>
                    <div class="pet-image">
                        ${markerData.imageUrl 
                            ? `<img src="${markerData.imageUrl}" alt="${markerData.name}">`
                            : `<img src="https://cdn-icons-png.flaticon.com/512/3047/3047928.png" alt="Sin imagen">`}
                    </div>
                    <div class="pet-description">
                        <p>${markerData.description}</p>
                    </div>
                    <div class="pet-contact">
                        ${contactInfo}
                    </div>
                    <button onclick="deleteMarker(${markerData.id})" class="delete-marker-btn">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            `);
        
        // Agregar evento de doble clic para zoom máximo
        marker.on('dblclick', function(e) {
            // Detener la propagación para evitar que el mapa también haga zoom
            L.DomEvent.stopPropagation(e);
            
            // Hacer zoom máximo en la ubicación del marcador
            map.setView(marker.getLatLng(), 18); // 18 es un nivel de zoom muy alto
        });
        
        markers.push({ id: markerData.id, marker: marker });
    });
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
    const addPetPanel = document.getElementById('addPetPanel');
    const clickedElement = e.originalEvent.target;
    
    // Si el clic fue en el menú o sus elementos, no hacer nada
    if (menuDesplegable.contains(clickedElement) || menuButton.contains(clickedElement) || 
        addPetPanel.contains(clickedElement)) {
        return;
    }
    
    // Si el menú está abierto, cerrarlo y no hacer nada más
    if (menuDesplegable.classList.contains('active')) {
        menuDesplegable.classList.remove('active');
        return;
    }
    
    // Guardar la ubicación seleccionada
    selectedLocation = e.latlng;
    
    // Eliminar marcador actual, si existe
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    
    // Añadir nuevo marcador usando el icono predeterminado pero sin popup
    currentMarker = L.marker(selectedLocation, {icon: defaultIcon}).addTo(map);

    // Mostrar el panel para agregar mascota
    addPetPanel.classList.add('active');
});

// Manejar el cierre del panel de agregar mascota
document.getElementById('closePetPanel').addEventListener('click', function() {
    const addPetPanel = document.getElementById('addPetPanel');
    addPetPanel.classList.remove('active');
    
    // Eliminar el marcador si se cierra el panel sin guardar
    if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
    }
    
    // Resetear el formulario
    document.getElementById('petForm').reset();
    document.getElementById('photoPreview').style.display = 'none';
});

// Manejar el envío del formulario
document.getElementById('petForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const petName = document.getElementById('petName').value;
    const lostDate = document.getElementById('lostDate').value;
    const petType = document.getElementById('petType').value;
    const petBreed = document.getElementById('petBreed').value;
    const hasCollar = document.querySelector('input[name="hasCollar"]:checked').value;
    const contactPhone = document.getElementById('contactPhone').value;
    const petPhoto = document.getElementById('petPhoto').files[0];

    if (!selectedLocation) {
        alert('Por favor, selecciona una ubicación en el mapa.');
        return;
    }

    if (!contactPhone) {
        alert('Por favor, ingresa un teléfono de contacto.');
        return;
    }

    if (!petPhoto) {
        alert('Por favor, sube una imagen de tu mascota.');
        return;
    }

    const markerId = Date.now(); // ID único para el marcador

    // Crear descripción con la información proporcionada
    const description = `
        <p><strong>Fecha perdido:</strong> ${lostDate}</p>
        <p><strong>Tipo:</strong> ${petType}</p>
        <p><strong>Raza:</strong> ${petBreed}</p>
        <p><strong>Collar:</strong> ${hasCollar === 'si' ? 'Sí' : 'No'}</p>
    `;

    // Crear contacto con información proporcionada
    let contactInfo = "";
    if (contactPhone) {
        contactInfo += `<p><i class="fas fa-phone"></i> ${contactPhone}</p>`;
    }
    
    // Procesar la imagen
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        
        // Crear nuevo marcador con popup y usando el icono predeterminado
        createPetMarker(markerId, petName, description, contactInfo, selectedLocation, imageUrl);
        
        // Cerrar el panel y limpiar
        document.getElementById('addPetPanel').classList.remove('active');
        document.getElementById('petForm').reset();
        document.getElementById('photoPreview').style.display = 'none';
        
        // Eliminar el marcador temporal
        if (currentMarker) {
            map.removeLayer(currentMarker);
            currentMarker = null;
        }
        
        // Resetear la ubicación seleccionada
        selectedLocation = null;
    };
    
    reader.readAsDataURL(petPhoto);
});

// Función para crear un marcador de mascota y guardarlo
function createPetMarker(id, name, description, contactInfo, location, imageUrl) {
    // Crear nuevo marcador con popup y usando SIEMPRE el icono por defecto
    const newMarker = L.marker([location.lat, location.lng], {icon: defaultIcon})
        .addTo(map)
        .bindPopup(`
            <div class="pet-popup">
                <h3>${name}</h3>
                <div class="pet-image">
                    <img src="${imageUrl}" alt="${name}">
                </div>
                <div class="pet-description">
                    <p>${description}</p>
                </div>
                <div class="pet-contact">
                    ${contactInfo}
                </div>
                <button onclick="deleteMarker(${id})" class="delete-marker-btn">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `);
    
    // Agregar evento de doble clic para zoom máximo
    newMarker.on('dblclick', function(e) {
        // Detener la propagación para evitar que el mapa también haga zoom
        L.DomEvent.stopPropagation(e);
        
        // Hacer zoom máximo en la ubicación del marcador
        map.setView(newMarker.getLatLng(), 18); // 18 es un nivel de zoom muy alto
    });

    // Guardar en el array de marcadores
    markers.push({ id: id, marker: newMarker });

    // Guardar en localStorage
    const savedMarkers = JSON.parse(localStorage.getItem('petMarkers')) || [];
    savedMarkers.push({
        id: id,
        name: name,
        description: description,
        contactPhone: document.getElementById('contactPhone').value,
        imageUrl: imageUrl,
        lat: location.lat,
        lng: location.lng
    });
    localStorage.setItem('petMarkers', JSON.stringify(savedMarkers));
}

// Manejar el botón desplegable del buscador
document.addEventListener('DOMContentLoaded', function() {
    const searchToggle = document.getElementById('searchToggle');
    const searchContent = document.getElementById('searchContainer');
    
    // Inicialmente oculto
    searchContent.style.display = 'none';
    
    // Toggle del contenido al hacer clic en el botón
    searchToggle.addEventListener('click', function() {
        if (searchContent.style.display === 'none') {
            searchContent.style.display = 'block';
        } else {
            searchContent.style.display = 'none';
        }
    });
    
    // Cerrar el buscador al hacer clic fuera
    document.addEventListener('click', function(e) {
        const isClickInsideSearch = searchToggle.contains(e.target) || searchContent.contains(e.target);
        if (!isClickInsideSearch && searchContent.style.display === 'block') {
            searchContent.style.display = 'none';
        }
    });

    // Mostrar vista previa de la imagen cuando se selecciona
    const petPhotoInput = document.getElementById('petPhoto');
    const photoPreview = document.getElementById('photoPreview');
    const previewImage = document.getElementById('previewImage');
    
    if (petPhotoInput) {
        petPhotoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    photoPreview.style.display = 'block';
                };
                
                reader.readAsDataURL(this.files[0]);
            } else {
                photoPreview.style.display = 'none';
                previewImage.src = '#';
            }
        });
    }
});

// Manejar el botón de mostrar lista
document.getElementById('showMenu').addEventListener('click', function() {
    document.getElementById('menuDesplegable').classList.add('active');
});

// Manejar el botón de cerrar lista
document.getElementById('closeMenu').addEventListener('click', function() {
    document.getElementById('menuDesplegable').classList.remove('active');
});

// Cerrar la lista si se hace clic fuera
window.addEventListener('click', function(e) {
    const petsList = document.getElementById('petsList');
    const showPetsListBtn = document.getElementById('showPetsList');
    if (e.target !== showPetsListBtn && !petsList && !petsList?.contains(e.target)) {
        if (petsList) {
            petsList.classList.remove('active');
        }
    }
});

// Manejar el clic en la opción de ajustes
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
