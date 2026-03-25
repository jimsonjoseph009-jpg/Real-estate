// Main Page Functionality
let currentPage = 1;
const itemsPerPage = 10;
let allProperties = [];
let filteredProperties = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    updateAuthUI();
    setupEventListeners();
    await loadCategories();
    await loadProperties();
});

function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Filter listeners
    document.getElementById('categoryFilter')?.addEventListener('change', filterProperties);
    document.getElementById('priceFilter')?.addEventListener('change', filterProperties);
    document.getElementById('bedroomFilter')?.addEventListener('change', filterProperties);

    // Search
    document.getElementById('heroSearch')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/properties`);
        const data = await response.json();
        
        // Categories would come from backend - for now, hardcoded options exist
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadProperties(page = 1) {
    try {
        const propertiesGrid = document.getElementById('propertiesGrid');
        propertiesGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading properties...</div>';

        const response = await propertyAPI.getAll({
            page,
            limit: itemsPerPage
        });

        allProperties = response.properties || [];
        filteredProperties = allProperties;

        // Update total count
        const totalPropertiesEl = document.getElementById('totalProperties');
        if (totalPropertiesEl) {
            totalPropertiesEl.textContent = formatNumber(response.pagination.total);
        }

        renderProperties(filteredProperties);
        renderPagination(response.pagination);

    } catch (error) {
        console.error('Error loading properties:', error);
        const propertiesGrid = document.getElementById('propertiesGrid');
        propertiesGrid.innerHTML = `<div class="error"><p>Failed to load properties. ${error.message}</p></div>`;
    }
}

function renderProperties(properties) {
    const propertiesGrid = document.getElementById('propertiesGrid');

    if (properties.length === 0) {
        propertiesGrid.innerHTML = '<div class="loading"><p>No properties found</p></div>';
        return;
    }

    propertiesGrid.innerHTML = properties.map(property => `
        <div class="property-card">
            <img src="${property.images?.[0]?.image_url || 'https://via.placeholder.com/300x250'}" 
                 alt="${property.title}" class="property-image" 
                 onerror="this.src='https://via.placeholder.com/300x250'">
            
            <div class="property-card-body">
                <h3 class="property-card-title">${sanitizeInput(property.title)}</h3>
                
                <div class="property-card-meta">
                    <span>${property.city}</span>
                    <span>${property.category_name || 'Property'}</span>
                </div>

                <div class="property-price">
                    ${formatCurrency(property.price, property.currency)}
                </div>

                <div class="property-features">
                    ${property.bedrooms ? `<div><i class="fas fa-bed"></i> ${property.bedrooms} Bed</div>` : ''}
                    ${property.bathrooms ? `<div><i class="fas fa-bath"></i> ${property.bathrooms} Bath</div>` : ''}
                    ${property.total_area ? `<div><i class="fas fa-ruler-combined"></i> ${formatNumber(property.total_area)} ${property.area_unit}</div>` : ''}
                </div>

                <div class="property-card-footer">
                    <button class="btn btn-primary" onclick="viewProperty(${property.property_id})">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPagination(pagination) {
    const paginationEl = document.getElementById('pagination');
    
    if (!paginationEl || pagination.pages <= 1) return;

    let html = '';

    // Previous button
    if (pagination.page > 1) {
        html += `<button onclick="loadProperties(${pagination.page - 1})">← Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.page) {
            html += `<button class="active">${i}</button>`;
        } else if (i <= 3 || i > pagination.pages - 3 || Math.abs(i - pagination.page) <= 1) {
            html += `<button onclick="loadProperties(${i})">${i}</button>`;
        } else if (i === 4 || i === pagination.pages - 3) {
            html += `<span>...</span>`;
        }
    }

    // Next button
    if (pagination.page < pagination.pages) {
        html += `<button onclick="loadProperties(${pagination.page + 1})">Next →</button>`;
    }

    paginationEl.innerHTML = html;
}

function filterProperties() {
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    const bedrooms = document.getElementById('bedroomFilter').value;

    filteredProperties = allProperties.filter(property => {
        // Category filter
        if (category && property.category_id != category) return false;

        // Price filter
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            if (property.price < min || property.price > max) return false;
        }

        // Bedrooms filter
        if (bedrooms && property.bedrooms != bedrooms) return false;

        return true;
    });

    renderProperties(filteredProperties);
}

function clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('bedroomFilter').value = '';
    filteredProperties = allProperties;
    renderProperties(filteredProperties);
}

function performSearch() {
    const searchTerm = document.getElementById('heroSearch').value.trim();
    if (!searchTerm) {
        showToast('Please enter a search term', 'info');
        return;
    }
    openAdvancedSearch(searchTerm);
}

function performAdvancedSearch() {
    const location = document.getElementById('searchLocation').value.trim();
    const minPrice = document.getElementById('searchMinPrice').value;
    const maxPrice = document.getElementById('searchMaxPrice').value;
    const bedrooms = document.getElementById('searchBedrooms').value;

    filteredProperties = allProperties.filter(property => {
        if (location && !property.city.toLowerCase().includes(location.toLowerCase())) return false;
        if (minPrice && property.price < parseFloat(minPrice)) return false;
        if (maxPrice && property.price > parseFloat(maxPrice)) return false;
        if (bedrooms && property.bedrooms != parseInt(bedrooms)) return false;
        return true;
    });

    renderProperties(filteredProperties);
    document.getElementById('searchModal').style.display = 'none';
    showToast(`Found ${filteredProperties.length} properties`, 'success');
}

function viewProperty(propertyId) {
    window.location.href = `pages/property-details.html?id=${propertyId}`;
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('searchModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
