"use strict";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "professionalStudio.services";

let services = [];
let currentServiceId = null;

let editingPackageId = null;
let isCreatingService = false;


/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_SERVICES = [
    {
        id: "wedding-photography",
        name: "Wedding Photography",
        description:
            "Professional wedding photography covering ceremonies, portraits and receptions.",
        coverageDuration: "8 hours",
        deliveryTime: "14 days",
        coverageType: "Local / On-location",
        active: true,

        packages: [
            {
                id: "basic",
                name: "Basic",
                price: 25000,
                coverage: "4 hours",
                photos: "150 edited photos",
                delivery: "14 days",
                description:
                    "Essential wedding coverage for smaller celebrations."
            },
            {
                id: "premium",
                name: "Premium",
                price: 45000,
                coverage: "8 hours",
                photos: "350 edited photos",
                delivery: "12 days",
                description:
                    "Extended wedding coverage for a complete photography experience."
            },
            {
                id: "luxury",
                name: "Luxury",
                price: 70000,
                coverage: "12 hours",
                photos: "600 edited photos",
                delivery: "10 days",
                description:
                    "Full-day premium coverage for large and detailed celebrations."
            }
        ]
    },

    {
        id: "portrait-photography",
        name: "Portrait Photography",
        description:
            "Professional portrait sessions for individuals, couples and personal branding.",
        coverageDuration: "2 hours",
        deliveryTime: "7 days",
        coverageType: "Studio / On-location",
        active: true,

        packages: [
            {
                id: "basic",
                name: "Basic",
                price: 5000,
                coverage: "1 hour",
                photos: "20 edited photos",
                delivery: "7 days",
                description:
                    "A simple portrait session for a small set of final images."
            },
            {
                id: "premium",
                name: "Premium",
                price: 9000,
                coverage: "2 hours",
                photos: "40 edited photos",
                delivery: "5 days",
                description:
                    "Extended portrait session with more variety and final images."
            },
            {
                id: "luxury",
                name: "Luxury",
                price: 15000,
                coverage: "3 hours",
                photos: "70 edited photos",
                delivery: "4 days",
                description:
                    "Complete portrait experience with extended shooting time and more images."
            }
        ]
    }
];


/* =========================================================
   DOM
========================================================= */

const servicesView = document.getElementById("servicesView");
const editorView = document.getElementById("editorView");

const servicesList = document.getElementById("servicesList");
const serviceCount = document.getElementById("serviceCount");
const emptyState = document.getElementById("emptyState");

const addServiceBtn = document.getElementById("addServiceBtn");
const emptyAddServiceBtn = document.getElementById("emptyAddServiceBtn");
const backBtn = document.getElementById("backBtn");

const editorTitle = document.getElementById("editorTitle");
const editorSubtitle = document.getElementById("editorSubtitle");
const editorBreadcrumb = document.getElementById("editorBreadcrumb");
const statusIndicator = document.getElementById("statusIndicator");

const serviceName = document.getElementById("serviceName");
const serviceDescription = document.getElementById("serviceDescription");
const coverageDuration = document.getElementById("coverageDuration");
const deliveryTime = document.getElementById("deliveryTime");
const coverageType = document.getElementById("coverageType");

const packagesList = document.getElementById("packagesList");
const packageEmpty = document.getElementById("packageEmpty");

const packageEditorSection =
    document.getElementById("packageEditorSection");

const packageEditorTitle =
    document.getElementById("packageEditorTitle");

const packageName = document.getElementById("packageName");
const packagePrice = document.getElementById("packagePrice");
const packageCoverage = document.getElementById("packageCoverage");
const packagePhotos = document.getElementById("packagePhotos");
const packageDelivery = document.getElementById("packageDelivery");
const packageDescription =
    document.getElementById("packageDescription");

const addPackageBtn = document.getElementById("addPackageBtn");
const closePackageEditorBtn =
    document.getElementById("closePackageEditorBtn");

const cancelPackageBtn =
    document.getElementById("cancelPackageBtn");

const savePackageBtn =
    document.getElementById("savePackageBtn");

const saveServiceBtn =
    document.getElementById("saveServiceBtn");

const cancelServiceBtn =
    document.getElementById("cancelServiceBtn");

const deleteServiceBtn =
    document.getElementById("deleteServiceBtn");

const deleteDialog =
    document.getElementById("deleteDialog");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");

const notification =
    document.getElementById("notification");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", init);

function init() {

    loadServices();

    renderServices();

    bindEvents();
}


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    addServiceBtn.addEventListener("click", createService);

    emptyAddServiceBtn.addEventListener(
        "click",
        createService
    );

    backBtn.addEventListener(
        "click",
        backToServices
    );

    cancelServiceBtn.addEventListener(
        "click",
        cancelEditing
    );

    saveServiceBtn.addEventListener(
        "click",
        saveService
    );

    deleteServiceBtn.addEventListener(
        "click",
        openDeleteDialog
    );

    cancelDeleteBtn.addEventListener(
        "click",
        closeDeleteDialog
    );

    confirmDeleteBtn.addEventListener(
        "click",
        deleteService
    );

    addPackageBtn.addEventListener(
        "click",
        createPackage
    );

    closePackageEditorBtn.addEventListener(
        "click",
        closePackageEditor
    );

    cancelPackageBtn.addEventListener(
        "click",
        closePackageEditor
    );

    savePackageBtn.addEventListener(
        "click",
        savePackage
    );

    deleteDialog.addEventListener(
        "click",
        function (event) {

            if (event.target === deleteDialog) {
                closeDeleteDialog();
            }

        }
    );

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                if (!deleteDialog.hidden) {
                    closeDeleteDialog();
                }

                if (!packageEditorSection.hidden) {
                    closePackageEditor();
                }

            }

        }
    );
}


/* =========================================================
   STORAGE
========================================================= */

function loadServices() {

    const storedServices =
        localStorage.getItem(STORAGE_KEY);

    if (!storedServices) {

        services = structuredClone(DEFAULT_SERVICES);

        saveServices();

        return;
    }

    try {

        const parsed =
            JSON.parse(storedServices);

        if (!Array.isArray(parsed)) {
            throw new Error("Invalid service data.");
        }

        services = normalizeServices(parsed);

    } catch (error) {

        console.error(
            "Unable to load services:",
            error
        );

        services = structuredClone(DEFAULT_SERVICES);

        saveServices();
    }
}


function saveServices() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(services)
    );
}


/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeServices(list) {

    return list.map(function (service) {

        return {
            id: service.id || createId(),

            name: service.name || "Untitled Service",

            description:
                service.description || "",

            coverageDuration:
                service.coverageDuration || "",

            deliveryTime:
                service.deliveryTime || "",

            coverageType:
                service.coverageType || "",

            active:
                service.active !== false,

            packages:
                Array.isArray(service.packages)
                    ? service.packages.map(normalizePackage)
                    : []
        };

    });
}


function normalizePackage(pkg) {

    return {
        id: pkg.id || createId(),

        name:
            pkg.name || "Package",

        price:
            Number(pkg.price) || 0,

        coverage:
            pkg.coverage || "",

        photos:
            pkg.photos || "",

        delivery:
            pkg.delivery || "",

        description:
            pkg.description || ""
    };
}


/* =========================================================
   SERVICES LIST
========================================================= */

function renderServices() {

    servicesList.innerHTML = "";

    serviceCount.textContent = services.length;

    if (services.length === 0) {

        emptyState.hidden = false;

        return;
    }

    emptyState.hidden = true;

    services.forEach(function (service) {

        const card =
            document.createElement("article");

        card.className = "service-card";

        const startingPrice =
            getStartingPrice(service);

        card.innerHTML = `
            <div class="service-card-main">

                <div class="service-card-top">

                    <h3>
                        ${escapeHTML(service.name)}
                    </h3>

                    <span class="service-status ${
                        service.active ? "active" : ""
                    }">
                        ${service.active ? "Active" : "Inactive"}
                    </span>

                </div>

                <p class="service-description">
                    ${escapeHTML(
                        service.description ||
                        "No description added yet."
                    )}
                </p>

                <div class="service-meta">

                    <div class="service-meta-item">

                        <span class="service-meta-label">
                            Starting from
                        </span>

                        <span class="service-meta-value">
                            ${formatCurrency(startingPrice)}
                        </span>

                    </div>

                    <div class="service-meta-item">

                        <span class="service-meta-label">
                            Packages
                        </span>

                        <span class="service-meta-value">
                            ${service.packages.length}
                        </span>

                    </div>

                    <div class="service-meta-item">

                        <span class="service-meta-label">
                            Coverage
                        </span>

                        <span class="service-meta-value">
                            ${escapeHTML(
                                service.coverageDuration || "Not set"
                            )}
                        </span>

                    </div>

                </div>

            </div>

            <div class="service-card-action">

                <button
                    type="button"
                    class="text-button"
                    data-action="edit"
                    data-service-id="${escapeHTML(service.id)}"
                >
                    Edit Service →
                </button>

            </div>
        `;

        servicesList.appendChild(card);
    });

    servicesList
        .querySelectorAll('[data-action="edit"]')
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    openService(
                        button.dataset.serviceId
                    );

                }
            );

        });
}


/* =========================================================
   OPEN SERVICE
========================================================= */

function openService(serviceId) {

    const service =
        services.find(function (item) {
            return item.id === serviceId;
        });

    if (!service) {
        return;
    }

    currentServiceId = serviceId;
    isCreatingService = false;

    populateEditor(service);

    showEditor();
}


/* =========================================================
   CREATE SERVICE
========================================================= */

function createService() {

    const service = {
        id: createId(),

        name: "",

        description: "",

        coverageDuration: "",

        deliveryTime: "",

        coverageType: "",

        active: true,

        packages: []
    };

    currentServiceId = service.id;
    isCreatingService = true;

    services.push(service);

    populateEditor(service);

    showEditor();

    serviceName.focus();
}


/* =========================================================
   POPULATE EDITOR
========================================================= */

function populateEditor(service) {

    editorTitle.textContent =
        isCreatingService
            ? "Add New Service"
            : "Edit Service";

    editorSubtitle.textContent =
        isCreatingService
            ? "Add the information clients will see."
            : "Update the information your clients will see.";

    editorBreadcrumb.textContent =
        service.name || "New Service";

    serviceName.value =
        service.name || "";

    serviceDescription.value =
        service.description || "";

    coverageDuration.value =
        service.coverageDuration || "";

    deliveryTime.value =
        service.deliveryTime || "";

    coverageType.value =
        service.coverageType || "";

    updateStatusIndicator(service);

    closePackageEditor();

    renderPackages(service);
}


/* =========================================================
   STATUS
========================================================= */

function updateStatusIndicator(service) {

    statusIndicator.className =
        "status-indicator " +
        (service.active ? "active" : "inactive");

    statusIndicator.textContent =
        service.active
            ? "Active"
            : "Inactive";
}


/* =========================================================
   SHOW / HIDE EDITOR
========================================================= */

function showEditor() {

    servicesView.hidden = true;
    editorView.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function hideEditor() {

    editorView.hidden = true;
    servicesView.hidden = false;

    currentServiceId = null;
    isCreatingService = false;

    closePackageEditor();

    renderServices();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   SERVICE DATA
========================================================= */

function collectServiceData() {

    return {
        name: serviceName.value.trim(),

        description:
            serviceDescription.value.trim(),

        coverageDuration:
            coverageDuration.value.trim(),

        deliveryTime:
            deliveryTime.value.trim(),

        coverageType:
            coverageType.value.trim()
    };
}


/* =========================================================
   SAVE SERVICE
========================================================= */

function saveService() {

    const service =
        services.find(function (item) {
            return item.id === currentServiceId;
        });

    if (!service) {
        return;
    }

    const data =
        collectServiceData();

    const validation =
        validateService(data);

    if (!validation.valid) {

        showNotification(
            validation.message
        );

        return;
    }

    service.name =
        data.name;

    service.description =
        data.description;

    service.coverageDuration =
        data.coverageDuration;

    service.deliveryTime =
        data.deliveryTime;

    service.coverageType =
        data.coverageType;

    saveServices();

    editorBreadcrumb.textContent =
        service.name;

    isCreatingService = false;

    showNotification(
        "Service saved successfully."
    );

    setTimeout(function () {

        hideEditor();

    }, 500);
}


/* =========================================================
   VALIDATE SERVICE
========================================================= */

function validateService(data) {

    if (!data.name) {

        return {
            valid: false,
            message: "Please enter a service name."
        };

    }

    if (!data.description) {

        return {
            valid: false,
            message: "Please add a service description."
        };

    }

    if (!data.coverageDuration) {

        return {
            valid: false,
            message: "Please enter the coverage duration."
        };

    }

    if (!data.deliveryTime) {

        return {
            valid: false,
            message: "Please enter the delivery time."
        };

    }

    if (!data.coverageType) {

        return {
            valid: false,
            message: "Please enter the location or coverage type."
        };

    }

    return {
        valid: true
    };
}


/* =========================================================
   CANCEL SERVICE
========================================================= */

function cancelEditing() {

    if (isCreatingService) {

        services =
            services.filter(function (service) {
                return service.id !== currentServiceId;
            });

    }

    hideEditor();
}


function backToServices() {

    cancelEditing();
}


/* =========================================================
   PACKAGES
========================================================= */

function renderPackages(service) {

    packagesList.innerHTML = "";

    const packages =
        service.packages || [];

    packageEmpty.hidden =
        packages.length !== 0;

    packages.forEach(function (pkg) {

        const card =
            document.createElement("article");

        card.className = "package-card";

        card.innerHTML = `
            <div class="package-card-content">

                <div class="package-card-top">

                    <h3>
                        ${escapeHTML(pkg.name)}
                    </h3>

                </div>

                <div class="package-price">
                    ${formatCurrency(pkg.price)}
                </div>

                <div class="package-details">

                    <span class="package-detail">
                        ${escapeHTML(
                            pkg.coverage || "Coverage not set"
                        )}
                    </span>

                    <span class="package-detail">
                        ${escapeHTML(
                            pkg.photos || "Photos not set"
                        )}
                    </span>

                    <span class="package-detail">
                        ${escapeHTML(
                            pkg.delivery || "Delivery not set"
                        )}
                    </span>

                </div>

                ${
                    pkg.description
                        ? `
                            <p class="package-description">
                                ${escapeHTML(pkg.description)}
                            </p>
                        `
                        : ""
                }

            </div>

            <div class="package-actions">

                <button
                    type="button"
                    class="text-button"
                    data-package-action="edit"
                    data-package-id="${escapeHTML(pkg.id)}"
                >
                    Edit Package
                </button>

                <button
                    type="button"
                    class="text-button"
                    data-package-action="delete"
                    data-package-id="${escapeHTML(pkg.id)}"
                >
                    Delete
                </button>

            </div>
        `;

        packagesList.appendChild(card);
    });

    packagesList
        .querySelectorAll('[data-package-action="edit"]')
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    openPackageEditor(
                        button.dataset.packageId
                    );

                }
            );

        });

    packagesList
        .querySelectorAll('[data-package-action="delete"]')
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    deletePackage(
                        button.dataset.packageId
                    );

                }
            );

        });
}


/* =========================================================
   CREATE PACKAGE
========================================================= */

function createPackage() {

    const service =
        getCurrentService();

    if (!service) {
        return;
    }

    const pkg = {
        id: createId(),

        name: "New Package",

        price: 0,

        coverage: "",

        photos: "",

        delivery: "",

        description: ""
    };

    service.packages.push(pkg);

    renderPackages(service);

    openPackageEditor(pkg.id);
}


/* =========================================================
   OPEN PACKAGE EDITOR
========================================================= */

function openPackageEditor(packageId) {

    const service =
        getCurrentService();

    if (!service) {
        return;
    }

    const pkg =
        service.packages.find(function (item) {
            return item.id === packageId;
        });

    if (!pkg) {
        return;
    }

    editingPackageId = packageId;

    packageEditorTitle.textContent =
        pkg.name || "Edit Package";

    packageName.value =
        pkg.name || "";

    packagePrice.value =
        pkg.price || "";

    packageCoverage.value =
        pkg.coverage || "";

    packagePhotos.value =
        pkg.photos || "";

    packageDelivery.value =
        pkg.delivery || "";

    packageDescription.value =
        pkg.description || "";

    packageEditorSection.hidden = false;

    packageEditorSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    setTimeout(function () {
        packageName.focus();
    }, 250);
}


/* =========================================================
   SAVE PACKAGE
========================================================= */

function savePackage() {

    const service =
        getCurrentService();

    if (!service) {
        return;
    }

    const pkg =
        service.packages.find(function (item) {
            return item.id === editingPackageId;
        });

    if (!pkg) {
        return;
    }

    const name =
        packageName.value.trim();

    const price =
        Number(packagePrice.value);

    const coverage =
        packageCoverage.value.trim();

    const photos =
        packagePhotos.value.trim();

    const delivery =
        packageDelivery.value.trim();

    const description =
        packageDescription.value.trim();

    if (!name) {

        showNotification(
            "Please enter a package name."
        );

        return;
    }

    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        showNotification(
            "Please enter a valid package price."
        );

        return;
    }

    if (!coverage) {

        showNotification(
            "Please enter the package coverage."
        );

        return;
    }

    if (!photos) {

        showNotification(
            "Please enter the number of edited photos."
        );

        return;
    }

    if (!delivery) {

        showNotification(
            "Please enter the delivery time."
        );

        return;
    }

    pkg.name =
        name;

    pkg.price =
        price;

    pkg.coverage =
        coverage;

    pkg.photos =
        photos;

    pkg.delivery =
        delivery;

    pkg.description =
        description;

    saveServices();

    renderPackages(service);

    closePackageEditor();

    showNotification(
        "Package saved successfully."
    );
}


/* =========================================================
   CLOSE PACKAGE EDITOR
========================================================= */

function closePackageEditor() {

    packageEditorSection.hidden = true;

    editingPackageId = null;

    packageName.value = "";
    packagePrice.value = "";
    packageCoverage.value = "";
    packagePhotos.value = "";
    packageDelivery.value = "";
    packageDescription.value = "";
}


/* =========================================================
   DELETE PACKAGE
========================================================= */

function deletePackage(packageId) {

    const service =
        getCurrentService();

    if (!service) {
        return;
    }

    const pkg =
        service.packages.find(function (item) {
            return item.id === packageId;
        });

    if (!pkg) {
        return;
    }

    const confirmed =
        window.confirm(
            `Delete the "${pkg.name}" package?`
        );

    if (!confirmed) {
        return;
    }

    service.packages =
        service.packages.filter(function (item) {
            return item.id !== packageId;
        });

    saveServices();

    renderPackages(service);

    closePackageEditor();

    showNotification(
        "Package deleted."
    );
}


/* =========================================================
   DELETE SERVICE
========================================================= */

function openDeleteDialog() {

    if (!currentServiceId) {
        return;
    }

    deleteDialog.hidden = false;
}


function closeDeleteDialog() {

    deleteDialog.hidden = true;
}


function deleteService() {

    if (!currentServiceId) {
        return;
    }

    services =
        services.filter(function (service) {
            return service.id !== currentServiceId;
        });

    saveServices();

    closeDeleteDialog();

    hideEditor();

    showNotification(
        "Service deleted."
    );
}


/* =========================================================
   HELPERS
========================================================= */

function getCurrentService() {

    return services.find(function (service) {
        return service.id === currentServiceId;
    });
}


function getStartingPrice(service) {

    if (
        !service.packages ||
        service.packages.length === 0
    ) {
        return 0;
    }

    const prices =
        service.packages
            .map(function (pkg) {
                return Number(pkg.price);
            })
            .filter(function (price) {
                return Number.isFinite(price) &&
                    price >= 0;
            });

    if (prices.length === 0) {
        return 0;
    }

    return Math.min.apply(null, prices);
}


function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(amount || 0);
}


function createId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   NOTIFICATION
========================================================= */

let notificationTimer = null;

function showNotification(message) {

    notification.textContent = message;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer =
        setTimeout(function () {

            notification.classList.remove(
                "show"
            );

        }, 2500);
}