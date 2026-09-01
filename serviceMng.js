/* =========================================================
   PROFESSIONAL STUDIO
   SERVICES & PACKAGES
   JavaScript
========================================================= */

"use strict";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "professionalStudio.services";

let services = [];
let currentServiceId = null;
let isCreatingService = false;


/* =========================================================
   DEFAULT SERVICES
========================================================= */

const defaultServices = [
    {
        id: createId(),
        name: "Wedding Photography",
        description: "Professional wedding photography covering the important moments of your special day.",
        coverageDuration: "8 hours",
        deliveryTime: "14 days",
        coverageType: "Local / On-location",
        active: true,

        packages: {
            basic: {
                price: 25000,
                coverage: "4 hours",
                photos: "150 edited photos",
                delivery: "14 days",
                description: "Essential wedding coverage for intimate celebrations."
            },

            premium: {
                price: 45000,
                coverage: "8 hours",
                photos: "350 edited photos",
                delivery: "12 days",
                description: "Complete wedding coverage with more moments and portraits."
            },

            luxury: {
                price: 70000,
                coverage: "12 hours",
                photos: "600 edited photos",
                delivery: "10 days",
                description: "Full-day premium coverage for a complete wedding experience."
            }
        }
    },

    {
        id: createId(),
        name: "Portrait Photography",
        description: "Professional portrait sessions for individuals, couples, creators and personal branding.",
        coverageDuration: "2 hours",
        deliveryTime: "7 days",
        coverageType: "Studio / On-location",
        active: true,

        packages: {
            basic: {
                price: 5000,
                coverage: "1 hour",
                photos: "20 edited photos",
                delivery: "7 days",
                description: "A simple portrait session with essential edited photographs."
            },

            premium: {
                price: 9000,
                coverage: "2 hours",
                photos: "40 edited photos",
                delivery: "5 days",
                description: "Extended portrait session with more variety and edited photos."
            },

            luxury: {
                price: 15000,
                coverage: "3 hours",
                photos: "70 edited photos",
                delivery: "4 days",
                description: "Premium portrait experience with extended coverage."
            }
        }
    }
];


/* =========================================================
   DOM ELEMENTS
========================================================= */

const servicesList = document.getElementById("servicesList");
const servicesEmpty = document.getElementById("servicesEmpty");
const serviceCount = document.getElementById("serviceCount");

const serviceEditor = document.getElementById("serviceEditor");
const servicesOverview = document.querySelector(".services-overview");

const addServiceBtn = document.getElementById("addServiceBtn");
const backToServicesBtn = document.getElementById("backToServicesBtn");

const editorTitle = document.getElementById("editorTitle");
const editorSubtitle = document.getElementById("editorSubtitle");
const editorBreadcrumb = document.getElementById("editorBreadcrumb");
const editorStatus = document.getElementById("editorStatus");

const serviceName = document.getElementById("serviceName");
const serviceDescription = document.getElementById("serviceDescription");
const coverageDuration = document.getElementById("coverageDuration");
const deliveryTime = document.getElementById("deliveryTime");
const coverageType = document.getElementById("coverageType");
const serviceActive = document.getElementById("serviceActive");

const saveServiceBtn = document.getElementById("saveServiceBtn");
const cancelServiceBtn = document.getElementById("cancelServiceBtn");
const deleteServiceBtn = document.getElementById("deleteServiceBtn");

const previewServiceBtn = document.getElementById("previewServiceBtn");

const deleteDialog = document.getElementById("deleteDialog");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const notification = document.getElementById("notification");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", init);

function init() {
    loadServices();
    renderServices();
    setupEvents();
}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    if (addServiceBtn) {
        addServiceBtn.addEventListener("click", createService);
    }

    if (backToServicesBtn) {
        backToServicesBtn.addEventListener("click", backToServices);
    }

    if (saveServiceBtn) {
        saveServiceBtn.addEventListener("click", saveService);
    }

    if (cancelServiceBtn) {
        cancelServiceBtn.addEventListener("click", cancelEditing);
    }

    if (deleteServiceBtn) {
        deleteServiceBtn.addEventListener("click", requestDelete);
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", closeDeleteDialog);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", confirmDelete);
    }

    if (previewServiceBtn) {
        previewServiceBtn.addEventListener("click", openClientPreview);
    }

    if (serviceActive) {
        serviceActive.addEventListener("change", updateEditorStatus);
    }

    if (deleteDialog) {
        deleteDialog.addEventListener("click", function (event) {
            if (event.target === deleteDialog) {
                closeDeleteDialog();
            }
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeDeleteDialog();
        }
    });
}


/* =========================================================
   LOAD SERVICES
========================================================= */

function loadServices() {

    try {
        const storedServices = localStorage.getItem(STORAGE_KEY);

        if (!storedServices) {
            services = defaultServices;
            saveServices();
            return;
        }

        const parsedServices = JSON.parse(storedServices);

        if (!Array.isArray(parsedServices)) {
            services = defaultServices;
            saveServices();
            return;
        }

        services = normalizeServices(parsedServices);

    } catch (error) {
        console.error("Unable to load services:", error);

        services = defaultServices;
        saveServices();
    }
}


/* =========================================================
   NORMALIZE DATA
========================================================= */

function normalizeServices(serviceList) {

    return serviceList.map(function (service) {

        return {
            id: service.id || createId(),

            name: service.name || "Untitled Service",

            description: service.description || "",

            coverageDuration: service.coverageDuration || "",

            deliveryTime: service.deliveryTime || "",

            coverageType: service.coverageType || "",

            active: service.active !== false,

            packages: {
                basic: normalizePackage(service.packages?.basic),

                premium: normalizePackage(service.packages?.premium),

                luxury: normalizePackage(service.packages?.luxury)
            }
        };
    });
}


function normalizePackage(packageData) {

    return {
        price: packageData?.price ?? "",

        coverage: packageData?.coverage || "",

        photos: packageData?.photos || "",

        delivery: packageData?.delivery || "",

        description: packageData?.description || ""
    };
}


/* =========================================================
   SAVE SERVICES
========================================================= */

function saveServices() {

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(services)
        );
    } catch (error) {
        console.error("Unable to save services:", error);

        showNotification(
            "Unable to save your changes.",
            "error"
        );
    }
}


/* =========================================================
   RENDER SERVICE LIST
========================================================= */

function renderServices() {

    if (!servicesList) {
        return;
    }

    servicesList.innerHTML = "";

    serviceCount.textContent = services.length;

    if (services.length === 0) {

        servicesEmpty.hidden = false;

        return;
    }

    servicesEmpty.hidden = true;

    services.forEach(function (service) {

        const card = document.createElement("article");

        card.className = "service-summary-card";

        card.innerHTML = `
            <div class="service-summary-main">

                <div class="service-summary-top">

                    <h3>${escapeHTML(service.name)}</h3>

                    <span class="status-badge ${service.active ? "active" : "inactive"}">
                        ${service.active ? "Active" : "Inactive"}
                    </span>

                </div>

                <p class="service-summary-description">
                    ${escapeHTML(
                        service.description || "No description added yet."
                    )}
                </p>

                <div class="service-summary-details">

                    <span>
                        <strong>Starting from</strong>
                        ${formatCurrency(getStartingPrice(service))}
                    </span>

                    <span>
                        <strong>Packages</strong>
                        3
                    </span>

                    ${
                        service.coverageDuration
                            ? `<span>
                                <strong>Coverage</strong>
                                ${escapeHTML(service.coverageDuration)}
                               </span>`
                            : ""
                    }

                </div>

            </div>

            <div class="service-summary-actions">

                <button
                    type="button"
                    class="btn-secondary edit-service-btn"
                    data-service-id="${service.id}"
                >
                    Edit Service
                </button>

            </div>
        `;

        servicesList.appendChild(card);
    });

    const editButtons = document.querySelectorAll(".edit-service-btn");

    editButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const serviceId = button.dataset.serviceId;

            openService(serviceId);
        });
    });
}


/* =========================================================
   OPEN SERVICE
========================================================= */

function openService(serviceId) {

    const service = services.find(function (item) {
        return item.id === serviceId;
    });

    if (!service) {
        showNotification(
            "Service could not be found.",
            "error"
        );

        return;
    }

    currentServiceId = serviceId;
    isCreatingService = false;

    populateEditor(service);

    showEditor();
}


/* =========================================================
   CREATE NEW SERVICE
========================================================= */

function createService() {

    const newService = {
        id: createId(),

        name: "",

        description: "",

        coverageDuration: "",

        deliveryTime: "",

        coverageType: "",

        active: true,

        packages: {
            basic: createEmptyPackage(),
            premium: createEmptyPackage(),
            luxury: createEmptyPackage()
        }
    };

    services.push(newService);

    currentServiceId = newService.id;

    isCreatingService = true;

    populateEditor(newService);

    showEditor();

    setTimeout(function () {

        if (serviceName) {
            serviceName.focus();
        }

    }, 100);
}


/* =========================================================
   EMPTY PACKAGE
========================================================= */

function createEmptyPackage() {

    return {
        price: "",
        coverage: "",
        photos: "",
        delivery: "",
        description: ""
    };
}


/* =========================================================
   POPULATE EDITOR
========================================================= */

function populateEditor(service) {

    if (!service) {
        return;
    }

    if (serviceName) {
        serviceName.value = service.name || "";
    }

    if (serviceDescription) {
        serviceDescription.value = service.description || "";
    }

    if (coverageDuration) {
        coverageDuration.value = service.coverageDuration || "";
    }

    if (deliveryTime) {
        deliveryTime.value = service.deliveryTime || "";
    }

    if (coverageType) {
        coverageType.value = service.coverageType || "";
    }

    if (serviceActive) {
        serviceActive.checked = service.active !== false;
    }

    populatePackage("basic", service.packages.basic);
    populatePackage("premium", service.packages.premium);
    populatePackage("luxury", service.packages.luxury);

    if (editorTitle) {
        editorTitle.textContent = isCreatingService
            ? "Add New Service"
            : "Edit Service";
    }

    if (editorSubtitle) {
        editorSubtitle.textContent = isCreatingService
            ? "Add the information your clients will see."
            : "Update the information your clients will see.";
    }

    if (editorBreadcrumb) {
        editorBreadcrumb.textContent =
            service.name || "New Service";
    }

    updateEditorStatus();
}


/* =========================================================
   POPULATE PACKAGE
========================================================= */

function populatePackage(type, packageData) {

    if (!packageData) {
        packageData = createEmptyPackage();
    }

    const priceInput = document.getElementById(`${type}Price`);
    const coverageInput = document.getElementById(`${type}Coverage`);
    const photosInput = document.getElementById(`${type}Photos`);
    const deliveryInput = document.getElementById(`${type}Delivery`);
    const descriptionInput = document.getElementById(`${type}Description`);

    if (priceInput) {
        priceInput.value = packageData.price ?? "";
    }

    if (coverageInput) {
        coverageInput.value = packageData.coverage || "";
    }

    if (photosInput) {
        photosInput.value = packageData.photos || "";
    }

    if (deliveryInput) {
        deliveryInput.value = packageData.delivery || "";
    }

    if (descriptionInput) {
        descriptionInput.value = packageData.description || "";
    }
}


/* =========================================================
   EDITOR STATUS
========================================================= */

function updateEditorStatus() {

    if (!editorStatus) {
        return;
    }

    const active =
        serviceActive ? serviceActive.checked : true;

    editorStatus.innerHTML = `
        <span class="status-badge ${active ? "active" : "inactive"}">
            ${active ? "Active" : "Inactive"}
        </span>
    `;
}


/* =========================================================
   SHOW EDITOR
========================================================= */

function showEditor() {

    if (servicesOverview) {
        servicesOverview.hidden = true;
    }

    if (serviceEditor) {
        serviceEditor.hidden = false;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   HIDE EDITOR
========================================================= */

function hideEditor() {

    if (serviceEditor) {
        serviceEditor.hidden = true;
    }

    if (servicesOverview) {
        servicesOverview.hidden = false;
    }

    currentServiceId = null;
    isCreatingService = false;
}


/* =========================================================
   COLLECT SERVICE DATA
========================================================= */

function collectServiceData() {

    return {
        name: serviceName
            ? serviceName.value.trim()
            : "",

        description: serviceDescription
            ? serviceDescription.value.trim()
            : "",

        coverageDuration: coverageDuration
            ? coverageDuration.value.trim()
            : "",

        deliveryTime: deliveryTime
            ? deliveryTime.value.trim()
            : "",

        coverageType: coverageType
            ? coverageType.value.trim()
            : "",

        active: serviceActive
            ? serviceActive.checked
            : true,

        packages: {
            basic: collectPackage("basic"),
            premium: collectPackage("premium"),
            luxury: collectPackage("luxury")
        }
    };
}


/* =========================================================
   COLLECT PACKAGE
========================================================= */

function collectPackage(type) {

    const priceInput = document.getElementById(`${type}Price`);
    const coverageInput = document.getElementById(`${type}Coverage`);
    const photosInput = document.getElementById(`${type}Photos`);
    const deliveryInput = document.getElementById(`${type}Delivery`);
    const descriptionInput = document.getElementById(`${type}Description`);

    return {
        price: priceInput
            ? parsePrice(priceInput.value)
            : "",

        coverage: coverageInput
            ? coverageInput.value.trim()
            : "",

        photos: photosInput
            ? photosInput.value.trim()
            : "",

        delivery: deliveryInput
            ? deliveryInput.value.trim()
            : "",

        description: descriptionInput
            ? descriptionInput.value.trim()
            : ""
    };
}


/* =========================================================
   SAVE SERVICE
========================================================= */

function saveService() {

    if (!currentServiceId) {
        showNotification(
            "No service selected.",
            "error"
        );

        return;
    }

    const serviceData = collectServiceData();

    const validationResult = validateService(serviceData);

    if (!validationResult.valid) {

        showNotification(
            validationResult.message,
            "error"
        );

        return;
    }

    const serviceIndex = services.findIndex(function (service) {
        return service.id === currentServiceId;
    });

    if (serviceIndex === -1) {
        showNotification(
            "Unable to find this service.",
            "error"
        );

        return;
    }

    services[serviceIndex] = {
        id: currentServiceId,
        ...serviceData
    };

    saveServices();

    renderServices();

    hideEditor();

    showNotification(
        isCreatingService
            ? "Service added successfully."
            : "Service updated successfully.",
        "success"
    );
}


/* =========================================================
   VALIDATE SERVICE
========================================================= */

function validateService(service) {

    if (!service.name) {

        if (serviceName) {
            serviceName.focus();
        }

        return {
            valid: false,
            message: "Please enter a service name."
        };
    }

    if (!service.description) {

        if (serviceDescription) {
            serviceDescription.focus();
        }

        return {
            valid: false,
            message: "Please add a short description."
        };
    }

    const packageTypes = [
        "basic",
        "premium",
        "luxury"
    ];

    for (const type of packageTypes) {

        const packageData = service.packages[type];

        if (
            packageData.price === "" ||
            Number.isNaN(Number(packageData.price))
        ) {

            const priceInput =
                document.getElementById(`${type}Price`);

            if (priceInput) {
                priceInput.focus();
            }

            return {
                valid: false,
                message: `Please enter a price for the ${capitalize(type)} package.`
            };
        }

        if (Number(packageData.price) < 0) {

            const priceInput =
                document.getElementById(`${type}Price`);

            if (priceInput) {
                priceInput.focus();
            }

            return {
                valid: false,
                message: `The ${capitalize(type)} package price cannot be negative.`
            };
        }
    }

    return {
        valid: true,
        message: ""
    };
}


/* =========================================================
   CANCEL EDITING
========================================================= */

function cancelEditing() {

    if (isCreatingService) {

        const serviceIndex = services.findIndex(function (service) {
            return service.id === currentServiceId;
        });

        if (serviceIndex !== -1) {
            services.splice(serviceIndex, 1);
        }
    }

    hideEditor();

    renderServices();
}


/* =========================================================
   BACK TO SERVICES
========================================================= */

function backToServices() {

    if (isCreatingService) {

        const serviceIndex = services.findIndex(function (service) {
            return service.id === currentServiceId;
        });

        if (serviceIndex !== -1) {
            services.splice(serviceIndex, 1);
        }
    }

    hideEditor();

    renderServices();
}


/* =========================================================
   DELETE SERVICE
========================================================= */

function requestDelete() {

    if (!currentServiceId) {
        return;
    }

    const service = services.find(function (item) {
        return item.id === currentServiceId;
    });

    if (!service) {
        return;
    }

    if (deleteDialog) {
        deleteDialog.hidden = false;
    }
}


function confirmDelete() {

    if (!currentServiceId) {
        return;
    }

    const serviceIndex = services.findIndex(function (service) {
        return service.id === currentServiceId;
    });

    if (serviceIndex === -1) {
        closeDeleteDialog();
        return;
    }

    services.splice(serviceIndex, 1);

    saveServices();

    closeDeleteDialog();

    hideEditor();

    renderServices();

    showNotification(
        "Service deleted successfully.",
        "success"
    );
}


function closeDeleteDialog() {

    if (deleteDialog) {
        deleteDialog.hidden = true;
    }
}


/* =========================================================
   CLIENT PREVIEW
========================================================= */

function openClientPreview() {

    if (!currentServiceId) {
        return;
    }

    const serviceData = collectServiceData();

    const validationResult = validatePreviewData(serviceData);

    if (!validationResult.valid) {

        showNotification(
            validationResult.message,
            "error"
        );

        return;
    }

    const previewWindow = window.open(
        "",
        "_blank",
        "width=1000,height=800"
    );

    if (!previewWindow) {

        showNotification(
            "Please allow pop-ups to view the preview.",
            "error"
        );

        return;
    }

    const packageHTML = createPreviewPackages(
        serviceData.packages
    );

    previewWindow.document.write(`
        <!DOCTYPE html>

        <html lang="en">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                ${escapeHTML(serviceData.name)}
                | Professional Studio
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background: #f8f8f8;
                    color: #111;
                    line-height: 1.6;
                }

                .preview {
                    width: 100%;
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 60px 24px;
                }

                .hero {
                    background: #fff;
                    border: 1px solid #e8e8e8;
                    border-radius: 16px;
                    padding: 45px;
                    margin-bottom: 30px;
                }

                .label {
                    display: inline-block;
                    margin-bottom: 12px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    color: #666;
                }

                h1 {
                    margin: 0 0 14px;
                    font-size: 40px;
                    line-height: 1.15;
                }

                .description {
                    max-width: 700px;
                    color: #666;
                    margin: 0;
                }

                .details {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 14px;
                    margin-top: 30px;
                }

                .detail {
                    padding: 18px;
                    background: #fafafa;
                    border: 1px solid #e8e8e8;
                    border-radius: 12px;
                }

                .detail strong {
                    display: block;
                    margin-bottom: 5px;
                    font-size: 13px;
                    color: #666;
                }

                .detail span {
                    font-weight: 600;
                }

                h2 {
                    margin: 0 0 20px;
                    font-size: 28px;
                }

                .packages {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 18px;
                }

                .package {
                    background: #fff;
                    border: 1px solid #e5e5e5;
                    border-radius: 14px;
                    padding: 25px;
                }

                .package h3 {
                    margin: 0 0 10px;
                    font-size: 20px;
                }

                .price {
                    margin-bottom: 20px;
                    font-size: 28px;
                    font-weight: 700;
                }

                .package p {
                    color: #666;
                }

                .package ul {
                    margin: 20px 0;
                    padding-left: 20px;
                }

                .package li {
                    margin-bottom: 8px;
                }

                .button {
                    width: 100%;
                    padding: 12px 18px;
                    border: 0;
                    border-radius: 10px;
                    background: #111;
                    color: #fff;
                    font-size: 15px;
                    cursor: pointer;
                }

                @media (max-width: 768px) {

                    .preview {
                        padding: 30px 15px;
                    }

                    .hero {
                        padding: 25px;
                    }

                    h1 {
                        font-size: 30px;
                    }

                    .details,
                    .packages {
                        grid-template-columns: 1fr;
                    }

                }

            </style>

        </head>

        <body>

            <main class="preview">

                <section class="hero">

                    <span class="label">
                        ${serviceData.active ? "AVAILABLE FOR BOOKING" : "CURRENTLY UNAVAILABLE"}
                    </span>

                    <h1>
                        ${escapeHTML(serviceData.name)}
                    </h1>

                    <p class="description">
                        ${escapeHTML(serviceData.description)}
                    </p>

                    <div class="details">

                        <div class="detail">
                            <strong>Coverage</strong>
                            <span>
                                ${escapeHTML(
                                    serviceData.coverageDuration || "Not specified"
                                )}
                            </span>
                        </div>

                        <div class="detail">
                            <strong>Delivery</strong>
                            <span>
                                ${escapeHTML(
                                    serviceData.deliveryTime || "Not specified"
                                )}
                            </span>
                        </div>

                        <div class="detail">
                            <strong>Location</strong>
                            <span>
                                ${escapeHTML(
                                    serviceData.coverageType || "Not specified"
                                )}
                            </span>
                        </div>

                    </div>

                </section>

                <section>

                    <h2>
                        Packages
                    </h2>

                    <div class="packages">
                        ${packageHTML}
                    </div>

                </section>

            </main>

        </body>

        </html>
    `);

    previewWindow.document.close();
}


/* =========================================================
   PREVIEW VALIDATION
========================================================= */

function validatePreviewData(service) {

    if (!service.name) {
        return {
            valid: false,
            message: "Add a service name before opening the preview."
        };
    }

    return {
        valid: true,
        message: ""
    };
}


/* =========================================================
   PREVIEW PACKAGES
========================================================= */

function createPreviewPackages(packages) {

    const packageNames = {
        basic: "Basic",
        premium: "Premium",
        luxury: "Luxury"
    };

    return Object.keys(packageNames)
        .map(function (type) {

            const packageData = packages[type];

            const features = [];

            if (packageData.coverage) {
                features.push(
                    escapeHTML(packageData.coverage)
                );
            }

            if (packageData.photos) {
                features.push(
                    escapeHTML(packageData.photos)
                );
            }

            if (packageData.delivery) {
                features.push(
                    escapeHTML(packageData.delivery)
                );
            }

            return `
                <article class="package">

                    <h3>
                        ${packageNames[type]}
                    </h3>

                    <div class="price">
                        ${formatCurrency(packageData.price)}
                    </div>

                    ${
                        packageData.description
                            ? `<p>
                                ${escapeHTML(packageData.description)}
                               </p>`
                            : ""
                    }

                    ${
                        features.length
                            ? `
                                <ul>
                                    ${features
                                        .map(
                                            feature =>
                                                `<li>${feature}</li>`
                                        )
                                        .join("")}
                                </ul>
                              `
                            : ""
                    }

                    <button
                        type="button"
                        class="button"
                    >
                        Choose ${packageNames[type]}
                    </button>

                </article>
            `;
        })
        .join("");
}


/* =========================================================
   STARTING PRICE
========================================================= */

function getStartingPrice(service) {

    const prices = [
        service.packages?.basic?.price,
        service.packages?.premium?.price,
        service.packages?.luxury?.price
    ]
        .map(Number)
        .filter(function (price) {
            return Number.isFinite(price) && price >= 0;
        });

    if (prices.length === 0) {
        return 0;
    }

    return Math.min(...prices);
}


/* =========================================================
   PRICE HELPERS
========================================================= */

function parsePrice(value) {

    if (value === null || value === undefined) {
        return "";
    }

    const cleanedValue = String(value)
        .replace(/,/g, "")
        .replace(/[^\d.]/g, "");

    if (!cleanedValue) {
        return "";
    }

    const number = Number(cleanedValue);

    return Number.isFinite(number)
        ? number
        : "";
}


function formatCurrency(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(number);
}


/* =========================================================
   CREATE ID
========================================================= */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* =========================================================
   TEXT HELPERS
========================================================= */

function capitalize(value) {

    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}


function truncate(text, length) {

    if (!text) {
        return "";
    }

    if (text.length <= length) {
        return text;
    }

    return text.substring(0, length).trim() + "...";
}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function showNotification(message, type = "success") {

    if (!notification) {
        return;
    }

    notification.textContent = message;

    notification.className =
        `notification ${type}`;

    notification.hidden = false;

    clearTimeout(showNotification.timeout);

    showNotification.timeout = setTimeout(function () {

        notification.hidden = true;

    }, 3500);
}