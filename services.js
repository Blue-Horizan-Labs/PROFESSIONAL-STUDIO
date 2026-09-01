/* =========================================================
PROFESSIONAL STUDIO
SERVICES MANAGEMENT
COMPLETE JAVASCRIPT
========================================================= */

/* =========================================================
SHARED SERVICE DATA CONFIGURATION
========================================================= */

const SERVICE_STORAGE_KEY = "professionalStudioServices";

const DEFAULT_PACKAGE_NAMES = {
basic: "Basic",
premium: "Premium",
luxury: "Luxury"
};

/* =========================================================
APPLICATION STATE
========================================================= */

const state = {
services: [],
editingServiceId: null,
deletingServiceId: null
};

/* =========================================================
DOM REFERENCES
========================================================= */

const elements = {
servicesList: document.getElementById("servicesList"),
emptyState: document.getElementById("emptyState"),
serviceCount: document.getElementById("serviceCount"),
servicesStatus: document.getElementById("servicesStatus"),


serviceEditorSection: document.getElementById("serviceEditorSection"),
editorTitle: document.getElementById("editorTitle"),
editorStatusText: document.getElementById("editorStatusText"),

serviceForm: document.getElementById("serviceForm"),

newServiceButton: document.getElementById("newServiceButton"),
emptyAddServiceButton: document.getElementById("emptyAddServiceButton"),
cancelEditButton: document.getElementById("cancelEditButton"),
formCancelButton: document.getElementById("formCancelButton"),

saveServiceButton: document.getElementById("saveServiceButton"),

deleteModal: document.getElementById("deleteModal"),
deleteCancelButton: document.getElementById("deleteCancelButton"),
deleteConfirmButton: document.getElementById("deleteConfirmButton"),

toastContainer: document.getElementById("toastContainer")


};

/* =========================================================
FORM FIELD REFERENCES
========================================================= */

const fields = {
serviceName: document.getElementById("serviceName"),
serviceDescription: document.getElementById("serviceDescription"),
serviceCoverage: document.getElementById("serviceCoverage"),
serviceDelivery: document.getElementById("serviceDelivery"),
serviceLocation: document.getElementById("serviceLocation"),
serviceEnabled: document.getElementById("serviceEnabled"),


basicName: document.getElementById("basicName"),
basicPrice: document.getElementById("basicPrice"),
basicHours: document.getElementById("basicHours"),
basicPhotos: document.getElementById("basicPhotos"),
basicDelivery: document.getElementById("basicDelivery"),
basicDescription: document.getElementById("basicDescription"),

premiumName: document.getElementById("premiumName"),
premiumPrice: document.getElementById("premiumPrice"),
premiumHours: document.getElementById("premiumHours"),
premiumPhotos: document.getElementById("premiumPhotos"),
premiumDelivery: document.getElementById("premiumDelivery"),
premiumDescription: document.getElementById("premiumDescription"),

luxuryName: document.getElementById("luxuryName"),
luxuryPrice: document.getElementById("luxuryPrice"),
luxuryHours: document.getElementById("luxuryHours"),
luxuryPhotos: document.getElementById("luxuryPhotos"),
luxuryDelivery: document.getElementById("luxuryDelivery"),
luxuryDescription: document.getElementById("luxuryDescription")


};

/* =========================================================
INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", initializeServicesPage);

function initializeServicesPage() {


loadServices();

bindEvents();

renderServices();


}

/* =========================================================
EVENT LISTENERS
========================================================= */

function bindEvents() {


elements.newServiceButton.addEventListener(
    "click",
    openNewServiceEditor
);

elements.emptyAddServiceButton.addEventListener(
    "click",
    openNewServiceEditor
);

elements.cancelEditButton.addEventListener(
    "click",
    closeServiceEditor
);

elements.formCancelButton.addEventListener(
    "click",
    closeServiceEditor
);

elements.serviceForm.addEventListener(
    "submit",
    handleServiceSubmit
);

elements.deleteCancelButton.addEventListener(
    "click",
    closeDeleteModal
);

elements.deleteConfirmButton.addEventListener(
    "click",
    confirmDeleteService
);

elements.deleteModal.addEventListener(
    "click",
    handleModalBackgroundClick
);

document.addEventListener(
    "keydown",
    handleKeyboardShortcuts
);


}

/* =========================================================
STORAGE LAYER
========================================================= */

/*
All service persistence is isolated here.

Dashboard, portfolio and booking pages should eventually
consume this same storage structure instead of creating
their own service data.
*/

function loadServices() {


try {

    const savedServices =
        localStorage.getItem(SERVICE_STORAGE_KEY);

    if (!savedServices) {

        state.services = [];

        return;
    }

    const parsedServices = JSON.parse(savedServices);

    if (!Array.isArray(parsedServices)) {

        state.services = [];

        return;
    }

    state.services = parsedServices.map(
        normalizeService
    );

} catch (error) {

    console.error(
        "Unable to load Professional Studio services.",
        error
    );

    state.services = [];

    showToast(
        "Unable to load saved services.",
        "error"
    );

}


}

function saveServices() {


try {

    localStorage.setItem(
        SERVICE_STORAGE_KEY,
        JSON.stringify(state.services)
    );

    return true;

} catch (error) {

    console.error(
        "Unable to save Professional Studio services.",
        error
    );

    showToast(
        "Unable to save the service.",
        "error"
    );

    return false;
}


}

/* =========================================================
SERVICE NORMALIZATION
========================================================= */

function normalizeService(service) {


const source = service || {};

return {
    id: source.id || createServiceId(),

    name: source.name || "",
    description: source.description || "",
    coverage: source.coverage || "",
    delivery: source.delivery || "",
    location: source.location || "",

    enabled:
        typeof source.enabled === "boolean"
            ? source.enabled
            : true,

    packages: {
        basic: normalizePackage(
            source.packages?.basic,
            "basic"
        ),

        premium: normalizePackage(
            source.packages?.premium,
            "premium"
        ),

        luxury: normalizePackage(
            source.packages?.luxury,
            "luxury"
        )
    },

    createdAt:
        source.createdAt ||
        new Date().toISOString(),

    updatedAt:
        source.updatedAt ||
        new Date().toISOString()
};


}

function normalizePackage(packageData, packageType) {


const source = packageData || {};

return {
    name:
        source.name ||
        DEFAULT_PACKAGE_NAMES[packageType],

    price:
        source.price !== undefined &&
        source.price !== null
            ? source.price
            : "",

    description:
        source.description || "",

    hours:
        source.hours || "",

    photos:
        source.photos || "",

    delivery:
        source.delivery || ""
};


}

/* =========================================================
ID GENERATION
========================================================= */

function createServiceId() {


return (
    "service_" +
    Date.now().toString(36) +
    "_" +
    Math.random()
        .toString(36)
        .slice(2, 9)
);


}

/* =========================================================
RENDER SERVICES
========================================================= */

function renderServices() {


const services = state.services;

elements.servicesList.innerHTML = "";

updateServiceCount(services);

if (!services.length) {

    elements.servicesList.hidden = true;
    elements.emptyState.hidden = false;

    elements.servicesStatus.textContent =
        "No services yet";

    return;
}

elements.servicesList.hidden = false;
elements.emptyState.hidden = true;

const enabledCount =
    services.filter(
        service => service.enabled
    ).length;

elements.servicesStatus.textContent =
    enabledCount +
    " available · " +
    services.length +
    " total";


services.forEach(service => {

    const card = createServiceCard(service);

    elements.servicesList.appendChild(card);

});


}

function updateServiceCount(services) {


elements.serviceCount.textContent =
    services.length;


}

/* =========================================================
SERVICE CARD CREATION
========================================================= */

function createServiceCard(service) {


const card = document.createElement("article");

card.className = "service-card";

const statusClass =
    service.enabled
        ? "enabled"
        : "disabled";

const statusText =
    service.enabled
        ? "Enabled"
        : "Disabled";

card.innerHTML = `

    <div class="service-card-header">

        <div class="service-card-title">

            <h3>
                ${escapeHTML(
                    service.name ||
                    "Untitled Service"
                )}
            </h3>

            <p class="service-card-description">
                ${escapeHTML(
                    service.description ||
                    "No service description added yet."
                )}
            </p>

        </div>

        <span class="service-card-status ${statusClass}">
            ${statusText}
        </span>

    </div>


    <div class="service-meta">

        <div class="service-meta-item">

            <span class="service-meta-label">
                Coverage
            </span>

            <span class="service-meta-value">
                ${escapeHTML(
                    service.coverage || "Not specified"
                )}
            </span>

        </div>


        <div class="service-meta-item">

            <span class="service-meta-label">
                Delivery
            </span>

            <span class="service-meta-value">
                ${escapeHTML(
                    service.delivery || "Not specified"
                )}
            </span>

        </div>


        <div class="service-meta-item">

            <span class="service-meta-label">
                Location
            </span>

            <span class="service-meta-value">
                ${escapeHTML(
                    service.location || "Not specified"
                )}
            </span>

        </div>

    </div>


    <div class="package-preview">

        <div class="package-preview-heading">
            Packages
        </div>

        <div class="package-preview-list">

            ${createPackagePreview(
                service.packages.basic
            )}

            ${createPackagePreview(
                service.packages.premium
            )}

            ${createPackagePreview(
                service.packages.luxury
            )}

        </div>

    </div>


    <div class="service-card-actions">

        <div class="service-card-main-actions">

            <button
                type="button"
                class="card-action-button edit-action"
                data-action="edit"
                data-service-id="${service.id}"
            >
                Edit
            </button>

            <button
                type="button"
                class="card-action-button delete-action"
                data-action="delete"
                data-service-id="${service.id}"
            >
                Delete
            </button>

        </div>


        <div class="card-toggle-wrapper">

            <span class="card-toggle-label">
                ${service.enabled ? "Visible" : "Hidden"}
            </span>

            <label class="toggle-control">

                <input
                    type="checkbox"
                    data-action="toggle"
                    data-service-id="${service.id}"
                    ${service.enabled ? "checked" : ""}
                    aria-label="Toggle ${escapeHTML(
                        service.name || "service"
                    )}"
                >

                <span class="toggle-slider"></span>

            </label>

        </div>

    </div>

`;


const editButton =
    card.querySelector(
        '[data-action="edit"]'
    );

const deleteButton =
    card.querySelector(
        '[data-action="delete"]'
    );

const toggleInput =
    card.querySelector(
        '[data-action="toggle"]'
    );


editButton.addEventListener(
    "click",
    () => editService(service.id)
);


deleteButton.addEventListener(
    "click",
    () => openDeleteModal(service.id)
);


toggleInput.addEventListener(
    "change",
    () => toggleService(service.id)
);


return card;


}

function createPackagePreview(packageData) {


const packageName =
    packageData?.name ||
    "Package";

const price =
    packageData?.price !== undefined &&
    packageData?.price !== null &&
    packageData?.price !== ""
        ? formatPrice(packageData.price)
        : "Price not set";


return 

    <div class="package-preview-item">

        <span class="package-preview-name">
            ${escapeHTML(packageName)}
        </span>

        <span class="package-preview-price">
            ${escapeHTML(price)}
        </span>

    </div>

;


}

/* =========================================================
CREATE NEW SERVICE
========================================================= */

function openNewServiceEditor() {


state.editingServiceId = null;

clearForm();

elements.editorTitle.textContent =
    "Create New Service";

elements.editorStatusText.textContent =
    "Draft";

elements.cancelEditButton.hidden = false;

elements.serviceEditorSection.hidden = false;

scrollToEditor();

window.setTimeout(() => {

    fields.serviceName.focus();

}, 100);


}

/* =========================================================
EDIT EXISTING SERVICE
========================================================= */

function editService(serviceId) {


const service =
    state.services.find(
        item => item.id === serviceId
    );

if (!service) {

    showToast(
        "Service could not be found.",
        "error"
    );

    return;
}

state.editingServiceId = serviceId;

populateForm(service);

elements.editorTitle.textContent =
    "Edit Service";

elements.editorStatusText.textContent =
    service.enabled
        ? "Active"
        : "Hidden";

elements.cancelEditButton.hidden = false;

elements.serviceEditorSection.hidden = false;

scrollToEditor();


}

/* =========================================================
FORM POPULATION
========================================================= */

function populateForm(service) {


fields.serviceName.value =
    service.name || "";

fields.serviceDescription.value =
    service.description || "";

fields.serviceCoverage.value =
    service.coverage || "";

fields.serviceDelivery.value =
    service.delivery || "";

fields.serviceLocation.value =
    service.location || "";

fields.serviceEnabled.checked =
    service.enabled !== false;


populatePackageFields(
    "basic",
    service.packages.basic
);

populatePackageFields(
    "premium",
    service.packages.premium
);

populatePackageFields(
    "luxury",
    service.packages.luxury
);


clearValidationErrors();


}

function populatePackageFields(
packageType,
packageData
) {


const source =
    normalizePackage(
        packageData,
        packageType
    );


fields[
    packageType + "Name"
].value = source.name;

fields[
    packageType + "Price"
].value = source.price;

fields[
    packageType + "Hours"
].value = source.hours;

fields[
    packageType + "Photos"
].value = source.photos;

fields[
    packageType + "Delivery"
].value = source.delivery;

fields[
    packageType + "Description"
].value = source.description;


}

/* =========================================================
CLEAR FORM
========================================================= */

function clearForm() {


elements.serviceForm.reset();

fields.basicName.value =
    DEFAULT_PACKAGE_NAMES.basic;

fields.premiumName.value =
    DEFAULT_PACKAGE_NAMES.premium;

fields.luxuryName.value =
    DEFAULT_PACKAGE_NAMES.luxury;

fields.serviceEnabled.checked = true;

clearValidationErrors();


}

/* =========================================================
CLOSE EDITOR
========================================================= */

function closeServiceEditor() {


state.editingServiceId = null;

elements.serviceEditorSection.hidden = true;

elements.cancelEditButton.hidden = true;

clearForm();

window.setTimeout(() => {

    elements.servicesListSection?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}, 50);

}

/* =========================================================
FORM SUBMISSION
========================================================= */

function handleServiceSubmit(event) {


event.preventDefault();

clearValidationErrors();

const validation =
    validateServiceForm();

if (!validation.valid) {

    showToast(
        "Please complete the required service information.",
        "error"
    );

    return;
}


const serviceData =
    collectServiceFormData();


if (state.editingServiceId) {

    updateExistingService(
        state.editingServiceId,
        serviceData
    );

} else {

    createNewService(serviceData);

}


}

/* =========================================================
VALIDATION
========================================================= */

function validateServiceForm() {


let valid = true;


if (!fields.serviceName.value.trim()) {

    showFieldError(
        fields.serviceName,
        "Service name is required."
    );

    valid = false;

}


if (!fields.serviceDescription.value.trim()) {

    showFieldError(
        fields.serviceDescription,
        "Service description is required."
    );

    valid = false;

}


return {
    valid
};


}

function showFieldError(
inputElement,
message
) {


const group =
    inputElement.closest(".form-group");

if (!group) {
    return;
}

group.classList.add("has-error");

const errorElement =
    group.querySelector(".field-error");

if (errorElement) {

    errorElement.textContent =
        message;

}


}

function clearValidationErrors() {


const errorGroups =
    elements.serviceForm.querySelectorAll(
        ".form-group.has-error"
    );

errorGroups.forEach(group => {

    group.classList.remove(
        "has-error"
    );

});


const errorElements =
    elements.serviceForm.querySelectorAll(
        ".field-error"
    );

errorElements.forEach(element => {

    element.textContent = "";

});


}

/* =========================================================
COLLECT FORM DATA
========================================================= */

function collectServiceFormData() {


return {

    name:
        fields.serviceName.value.trim(),

    description:
        fields.serviceDescription.value.trim(),

    coverage:
        fields.serviceCoverage.value.trim(),

    delivery:
        fields.serviceDelivery.value.trim(),

    location:
        fields.serviceLocation.value.trim(),

    enabled:
        fields.serviceEnabled.checked,

    packages: {

        basic:
            collectPackageFormData("basic"),

        premium:
            collectPackageFormData("premium"),

        luxury:
            collectPackageFormData("luxury")

    }

};


}

function collectPackageFormData(packageType) {


const priceValue =
    fields[
        packageType + "Price"
    ].value.trim();


return {

    name:
        fields[
            packageType + "Name"
        ].value.trim() ||
        DEFAULT_PACKAGE_NAMES[
            packageType
        ],

    price:
        priceValue !== ""
            ? Number(priceValue)
            : "",

    hours:
        fields[
            packageType + "Hours"
        ].value.trim(),

    photos:
        fields[
            packageType + "Photos"
        ].value.trim(),

    delivery:
        fields[
            packageType + "Delivery"
        ].value.trim(),

    description:
        fields[
            packageType + "Description"
        ].value.trim()

};


}

/* =========================================================
CREATE SERVICE
========================================================= */

function createNewService(serviceData) {


const now =
    new Date().toISOString();


const newService = {

    id: createServiceId(),

    ...serviceData,

    createdAt: now,
    updatedAt: now

};


state.services.push(
    newService
);


const saved = 
    saveServices();


if (!saved) {

    state.services =
        state.services.filter(
            service =>
                service.id !== newService.id
        );

    return;
}


renderServices();

closeServiceEditor();

showToast(
    "Service created successfully.",
    "success"
);


}

/* =========================================================
UPDATE SERVICE
========================================================= */

function updateExistingService(
serviceId,
serviceData
) {


const index =
    state.services.findIndex(
        service =>
            service.id === serviceId
    );


if (index === -1) {

    showToast(
        "Service could not be found.",
        "error"
    );

    return;
}


const previousService =
    state.services[index];


const updatedService = {

    ...previousService,

    ...serviceData,

    id: previousService.id,

    createdAt:
        previousService.createdAt ||
        new Date().toISOString(),

    updatedAt:
        new Date().toISOString()

};


state.services[index] =
    updatedService;


const saved =
    saveServices();


if (!saved) {

    state.services[index] =
        previousService;

    return;
}


renderServices();

closeServiceEditor();

showToast(
    "Service updated successfully.",
    "success"
);


}

/* =========================================================
ENABLE / DISABLE SERVICE
========================================================= */

function toggleService(serviceId) {


const service =
    state.services.find(
        item => item.id === serviceId
    );


if (!service) {

    showToast(
        "Service could not be found.",
        "error"
    );

    renderServices();

    return;
}


const previousValue =
    service.enabled;


service.enabled =
    !service.enabled;

service.updatedAt =
    new Date().toISOString();


const saved =
    saveServices();


if (!saved) {

    service.enabled =
        previousValue;

    return;
}


renderServices();


showToast(
    service.enabled
        ? "Service is now visible."
        : "Service has been hidden.",
    "success"
);


}

/* =========================================================
DELETE SERVICE
========================================================= */

function openDeleteModal(serviceId) {


const service =
    state.services.find(
        item => item.id === serviceId
    );


if (!service) {

    showToast(
        "Service could not be found.",
        "error"
    );

    return;
}


state.deletingServiceId =
    serviceId;


elements.deleteModal.hidden =
    false;


document.body.style.overflow =
    "hidden";


window.setTimeout(() => {

    elements.deleteConfirmButton.focus();

}, 50);


}

function closeDeleteModal() {


state.deletingServiceId =
    null;

elements.deleteModal.hidden =
    true;

document.body.style.overflow =
    "";


}

function confirmDeleteService() {


const serviceId =
    state.deletingServiceId;


if (!serviceId) {

    closeDeleteModal();

    return;
}


const serviceIndex =
    state.services.findIndex(
        service =>
            service.id === serviceId
    );


if (serviceIndex === -1) {

    closeDeleteModal();

    return;
}


const deletedService =
    state.services[serviceIndex];


state.services.splice(
    serviceIndex,
    1
);


const saved =
    saveServices();


if (!saved) {

    state.services.splice(
        serviceIndex,
        0,
        deletedService
    );

    closeDeleteModal();

    return;
}


if (
    state.editingServiceId ===
    serviceId
) {

    closeServiceEditor();

}


closeDeleteModal();

renderServices();

showToast(
    "Service deleted successfully.",
    "success"
);


}

function handleModalBackgroundClick(event) {


if (
    event.target ===
    elements.deleteModal
) {

    closeDeleteModal();

}


}

/* =========================================================
PRICE FORMATTING
========================================================= */

function formatPrice(price) {


if (
    price === "" ||
    price === null ||
    price === undefined
) {

    return "Price not set";

}


const numericPrice =
    Number(price);


if (
    Number.isNaN(
        numericPrice
    )
) {

    return String(price);

}


return (
    "₹" +
    numericPrice.toLocaleString(
        "en-IN"
    )
);


}

/* =========================================================
SCROLL TO EDITOR
========================================================= */

function scrollToEditor() {


window.setTimeout(() => {

    elements.serviceEditorSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}, 50);

}

/* =========================================================
TOAST NOTIFICATIONS
========================================================= */

function showToast(
message,
type = "success"
) {


if (!elements.toastContainer) {
    return;
}


const toast =
    document.createElement("div");


toast.className =
    "toast " +
    type;


toast.innerHTML = `

    <span class="toast-icon">  
        ${type === "success" ? "✓" : "!"}
    </span>

    <span>
        ${escapeHTML(message)}
    </span>

`;


elements.toastContainer.appendChild(
    toast
);


window.setTimeout(() => {

    toast.classList.add(
        "removing"
    );

    window.setTimeout(() => {

        toast.remove();

    }, 220);

}, 2800);


}

/* =========================================================
KEYBOARD SHORTCUTS
========================================================= */

function handleKeyboardShortcuts(event) {


if (
    event.key === "Escape"
) {

    if (
        !elements.deleteModal.hidden
    ) {

        closeDeleteModal();

        return;
    }


    if (
        !elements.serviceEditorSection.hidden
    ) {

        closeServiceEditor();

    }

}


}

/* =========================================================
HTML ESCAPING
========================================================= */

function escapeHTML(value) {


return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");


}

/* =========================================================
GLOBAL SERVICE DATA ACCESS
========================================================= */

/*
These helper functions intentionally use the same storage
key as the Services Manager.

Later, dashboard, portfolio and booking scripts can use
the same interface or a shared service-data module.
*/

function getAllServices() {


try {

    const savedServices =
        localStorage.getItem(
            SERVICE_STORAGE_KEY
        );


    if (!savedServices) {
        return [];
    }


    const parsedServices =
        JSON.parse(savedServices);


    if (!Array.isArray(parsedServices)) {
        return [];
    }


    return parsedServices.map(
        normalizeService
    );

} catch (error) {

    console.error(
        "Unable to read services.",
        error
    );

    return [];

}


}

function getEnabledServices() {


return getAllServices()
    .filter(
        service =>
            service.enabled === true
    );


}

function getServiceById(serviceId) {


return getAllServices()
    .find(
        service =>
            service.id === serviceId
    ) || null;


}

/* =========================================================
OPTIONAL GLOBAL API
========================================================= */

/*
Exposing read-only service helpers makes the same service
source easy to consume from other frontend pages during
the prototype stage.

The dashboard, portfolio and booking pages can later call:

window.ProfessionalStudioServices.getAll()
window.ProfessionalStudioServices.getEnabled()
window.ProfessionalStudioServices.getById(id)

No page should create its own service database.
*/

window.ProfessionalStudioServices = {


storageKey:
    SERVICE_STORAGE_KEY,

getAll:
    getAllServices,

getEnabled:
    getEnabledServices,

getById:
    getServiceById


};
