// Property Details Page
let currentProperty = null;

document.addEventListener('DOMContentLoaded', async () => {
    updateAuthUI();
    await loadPropertyDetails();
});

async function loadPropertyDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');

        if (!propertyId) {
            window.location.href = '../index.html';
            return;
        }

        const property = await propertyAPI.getById(propertyId);
        currentProperty = property;

        displayPropertyDetails(property);
        displayImages(property.images || []);
        displayAmenities(property.amenities || []);
        displayReviews(property.reviews || []);

    } catch (error) {
        console.error('Error loading property:', error);
        showToast('Failed to load property details', 'error');
    }
}

function displayPropertyDetails(property) {
    document.getElementById('propertyTitle').textContent = sanitizeInput(property.title);
    document.getElementById('propertyPrice').textContent = formatCurrency(property.price, property.currency);
    document.getElementById('propertyCategory').textContent = property.category_name || 'Property';
    document.getElementById('propertyStatus').textContent = property.status.replace('_', ' ').toUpperCase();
    
    document.getElementById('bedrooms').textContent = property.bedrooms || '-';
    document.getElementById('bathrooms').textContent = property.bathrooms || '-';
    document.getElementById('area').textContent = property.total_area ? 
        `${formatNumber(property.total_area)} ${property.area_unit}` : '-';
    document.getElementById('parking').textContent = property.parking_spaces || '0';

    document.getElementById('description').textContent = sanitizeInput(property.description || 'No description available');
    document.getElementById('location').textContent = sanitizeInput(property.location);

    // Agent info
    document.getElementById('agentName').textContent = property.agent_name || 'Agent';
    document.getElementById('agentContact').innerHTML = `
        <p><i class="fas fa-phone"></i> ${property.agent_phone}</p>
        <p><i class="fas fa-envelope"></i> ${property.agent_email}</p>
    `;

    // Pre-fill inquiry form with agent
    document.getElementById('inquiryEmail').value = property.agent_email || '';
}

function displayImages(images) {
    if (images.length === 0) {
        document.getElementById('mainImage').src = 'https://via.placeholder.com/600x400';
        return;
    }

    const mainImage = document.getElementById('mainImage');
    mainImage.src = images[0].image_url;

    const thumbnailContainer = document.getElementById('thumbnailImages');
    thumbnailContainer.innerHTML = images.map((image, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${image.image_url}', this)">
            <img src="${image.image_url}" alt="${image.image_alt_text || 'Property image'}"
                 onerror="this.src='https://via.placeholder.com/100x100'">
        </div>
    `).join('');
}

function changeMainImage(imageUrl, element) {
    document.getElementById('mainImage').src = imageUrl;
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    element.classList.add('active');
}

function displayAmenities(amenities) {
    const amenitiesList = document.getElementById('amenitiesList');
    
    if (amenities.length === 0) {
        amenitiesList.innerHTML = '<p>No amenities listed</p>';
        return;
    }

    amenitiesList.innerHTML = amenities.map(amenity => `
        <div class="amenity-item">
            <i class="fas ${amenity.icon_class || 'fa-check'}"></i>
            <span>${sanitizeInput(amenity.amenity_name)}</span>
        </div>
    `).join('');
}

function displayReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');

    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews yet</p>';
        return;
    }

    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div>
                    <p class="review-author">${sanitizeInput(review.reviewer_name)}</p>
                    <p class="review-rating">
                        ${'⭐'.repeat(review.rating)}<span style="color: #ccc">${'⭐'.repeat(5 - review.rating)}</span>
                    </p>
                </div>
                <span style="color: #999; font-size: 0.9rem">${formatDate(review.created_at)}</span>
            </div>
            <p class="review-content">${sanitizeInput(review.comment)}</p>
        </div>
    `).join('');
}

function openInquiryModal() {
    const modal = document.getElementById('inquiryModal');
    modal.style.display = 'block';

    // Pre-fill logged in user's info
    if (isLoggedIn()) {
        const user = getCurrentUser();
        document.getElementById('inquiryName').value = user.fullName || '';
        document.getElementById('inquiryEmail').value = user.email || '';
    }
}

function closeInquiryModal() {
    document.getElementById('inquiryModal').style.display = 'none';
}

async function submitInquiry(event) {
    event.preventDefault();

    const name = document.getElementById('inquiryName').value.trim();
    const email = document.getElementById('inquiryEmail').value.trim();
    const phone = document.getElementById('inquiryPhone').value.trim();
    const type = document.getElementById('inquiryType').value;
    const message = document.getElementById('inquiryMessage').value.trim();

    if (!name || !email || !type) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    try {
        await inquiryAPI.create({
            property_id: currentProperty.property_id,
            inquirer_name: name,
            inquirer_email: email,
            inquirer_phone: phone || null,
            inquiry_type: type,
            message: message || null
        });

        showToast('Inquiry submitted successfully!', 'success');
        closeInquiryModal();
        document.getElementById('inquiryForm').reset();

    } catch (error) {
        showToast(error.message || 'Failed to submit inquiry', 'error');
    }
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('inquiryModal');
    if (event.target === modal) {
        closeInquiryModal();
    }
});
