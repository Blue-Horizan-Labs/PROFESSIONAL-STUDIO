"use strict";

/* =========================================================
   PROFESSIONAL STUDIO
   Services & Packages Management
   ========================================================= */

const SERVICES_STORAGE_KEY = "professionalStudio.services";

let services = [];
let currentServiceId = null;
let editingPackageId = null;
let creatingPackageId = null;
let isCreatingService = false;

/* =========================================================
   DEFAULT SERVICES
   ========================================================= */

const DEFAULT_SERVICES = [
    {
        id: "wedding-photography",
        name: "Wedding Photography",
        description:
            "Complete wedding photography coverage for ceremonies, portraits and celebrations.",
        coverageDuration: "8 Hours",
        deliveryTime: "15-20 Days",
        coverageType: "Full Day",
        active: true,
        packages: [
            {
                id: "wedding-basic",
                name: "Basic",
                price: 25000,
                coverage: "6 Hours",
                photos: "300+ Edited Photos",
                delivery: "15 Days",
                album: "No",
                description: "Essential wedding photography coverage.",
                paymentPlan: {
                    type: "full"
                }
            },
            {
                id: "wedding-premium",
                name: "Premium",
                price: 45000,
                coverage: "10 Hours",
                photos: "600+ Edited Photos",
                delivery: "15 Days",
                album: "1 Premium Album",
                description: "Extended wedding coverage with album.",
                paymentPlan: {
                    type: "advance",
                    advanceType: "percentage",
                    advanceValue: 30
                }
            },
            {
                id: "wedding-luxury",
                name: "Luxury",
                price: 75000,
                coverage: "Full Day",
                photos: "1000+ Edited Photos",
                delivery: "12 Days",
                album: "2 Premium Albums",
                description: "Complete premium wedding photography experience.",
                paymentPlan: {
                    type: "installments",
                    installments: [
                        {
                            name: "Booking",
                            type: "percentage",
                            value: 30,
                            due: "At Booking"
                        },
                        {
                            name: "Event",
                            type: "percentage",
                            value: 40,
                            due: "Event Day"
                        },
                        {
                            name: "Delivery",
                            type: "percentage",
                            value: 30,
                            due: "Before Delivery"
                        }
                    ]
                }
            }
        ]
    },

    {
        id: "portrait-photography",
        name: "Portrait Photography",
        description:
            "Professional portrait sessions for individuals, couples and personal branding.",
        coverageDuration: "2 Hours",
        deliveryTime: "7-10 Days",
        coverageType: "Session",
        active: true,
        packages: [
            {
                id: "portrait-basic",
                name: "Basic",
                price: 5000,
                coverage: "1 Hour",
                photos: "15 Edited Photos",
                delivery: "7 Days",
                album: "No",
                description: "Simple portrait session.",
                paymentPlan: {
                    type: "full"
                }
            },
            {
                id: "portrait-premium",
                name: "Premium",
                price: 9000,
                coverage: "2 Hours",
                photos: "30 Edited Photos",
                delivery: "7 Days",
                album: "No",
                description: "Extended portrait session with additional edited photos.",
                paymentPlan: {
                    type: "advance",
                    advanceType: "percentage",
                    advanceValue: 50
                }
            },
            {
                id: "portrait-luxury",
                name: "Luxury",
                price: 15000,
                coverage: "3 Hours",
                photos: "50 Edited Photos",
                delivery: "5 Days",
                album: "1 Premium Album",
                description: "Premium portrait experience.",
                paymentPlan: {
                    type: "full"
                }
            }
        ]
    }
];

/* =========================================================
   DOM REFERENCES
   ========================================================= */

const servicesView = document.getElementById("servicesView");
const editorView = document.getElementById("editorView");

const addServiceBtn = document.getElementById("addServiceBtn");
const emptyAddServiceBtn = document.getElementById("emptyAddServiceBtn");

const serviceCount = document.getElementById("serviceCount");
const servicesList = document.getElementById("servicesList");
const emptyState = document.getElementById("emptyState");

const backBtn = document.getElementById("backBtn");
const editorBreadcrumb = document.getElementById("editorBreadcrumb");
const editorTitle = document.getElementById("editorTitle");
const editorSubtitle = document.getElementById("editorSubtitle");

const statusIndicator = document.getElementById("statusIndicator");

const serviceName = document.getElementById("serviceName");
const serviceDescription = document.getElementById("serviceDescription");
const coverageDuration = document.getElementById("coverageDuration");
const deliveryTime = document.getElementById("deliveryTime");
const coverageType = document.getElementById("coverageType");

const addPackageBtn = document.getElementById("addPackageBtn");
const packagesList = document.getElementById("packagesList");
const packageEmpty = document.getElementById("packageEmpty");

const packageEditorSection = document.getElementById("packageEditorSection");
const packageEditorTitle = document.getElementById("packageEditorTitle");
const closePackageEditorBtn = document.getElementById(
    "closePackageEditorBtn"
);

const packageName = document.getElementById("packageName");
const packagePrice = document.getElementById("packagePrice");
const packageCoverage = document.getElementById("packageCoverage");
const packagePhotos = document.getElementById("packagePhotos");
const packageDelivery = document.getElementById("packageDelivery");
const packageAlbum = document.getElementById("packageAlbum");
const packageDescription = document.getElementById("packageDescription");

const paymentPlanType = document.getElementById("paymentPlanType");

const advancePaymentFields = document.getElementById(
    "advancePaymentFields"
);
const advancePaymentType = document.getElementById("advancePaymentType");
const advancePaymentValue = document.getElementById("advancePaymentValue");
const advancePaymentInputWrap = document.getElementById(
    "advancePaymentInputWrap"
);
const advancePaymentPrefix = document.getElementById("advancePaymentPrefix");

const installmentPaymentFields = document.getElementById(
    "installmentPaymentFields"
);
const installmentList = document.getElementById("installmentList");
const addInstallmentBtn = document.getElementById("addInstallmentBtn");
const installmentTotal = document.getElementById("installmentTotal");

const cancelPackageBtn = document.getElementById("cancelPackageBtn");
const savePackageBtn = document.getElementById("savePackageBtn");

const deleteServiceBtn = document.getElementById("deleteServiceBtn");
const cancelServiceBtn = document.getElementById("cancelServiceBtn");
const saveServiceBtn = document.getElementById("saveServiceBtn");

const deleteDialog = document.getElementById("deleteDialog");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const notification = document.getElementById("notification");

/* =========================================================
   INITIALIZATION
   ========================================================= */

function init() {
    loadServices();
    bindEvents();
    renderServices();
}

/*
 * Handles both normal script loading and DOMContentLoaded.
 * This prevents initialization problems if the script is moved
 * into <head> later.
 */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

/* =========================================================
   STORAGE
   ========================================================= */

/*
 * IMPORTANT:
 * This function is intentionally called persistServices().
 *
 * Do NOT rename this to saveServices().
 * The public window.saveServices compatibility function below
 * uses the name saveServices, and having both caused recursive
 * calls in the previous version.
 */
function persistServices(dispatchEvent = true) {
    try {
        localStorage.setItem(
            SERVICES_STORAGE_KEY,
            JSON.stringify(services)
        );

        if (dispatchEvent) {
            window.dispatchEvent(
                new CustomEvent("professionalStudioServicesUpdated", {
                    detail: {
                        services: cloneData(services)
                    }
                })
            );
        }

        return true;
    } catch (error) {
        console.error("Unable to save services:", error);
        showNotification(
            "Unable to save services. Please try again.",
            "error"
        );
        return false;
    }
}

function loadServices() {
    const stored = localStorage.getItem(SERVICES_STORAGE_KEY);

    if (!stored) {
        services = cloneData(DEFAULT_SERVICES);
        persistServices(false);
        return;
    }

    try {
        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
            throw new Error("Invalid services data");
        }

        services = normalizeServices(parsed);

        /*
         * Save normalized data so newly-created IDs and missing
         * optional fields become permanent.
         */
        persistServices(false);
    } catch (error) {
        console.error("Unable to load services:", error);

        services = cloneData(DEFAULT_SERVICES);
        persistServices(false);

        showNotification(
            "Saved service data was invalid. Default services were restored.",
            "error"
        );
    }
}

function normalizeServices(list) {
    return list.map((service) => ({
        id: service.id || createId("service"),
        name: String(service.name || "").trim(),
        description: String(service.description || "").trim(),
        coverageDuration: String(service.coverageDuration || "").trim(),
        deliveryTime: String(service.deliveryTime || "").trim(),
        coverageType: String(service.coverageType || "").trim(),
        active: service.active !== false,
        packages: Array.isArray(service.packages)
            ? service.packages.map(normalizePackage)
            : []
    }));
}

function normalizePackage(pkg) {
    const paymentPlan = normalizePaymentPlan(pkg.paymentPlan);

    return {
        id: pkg.id || createId("package"),
        name: String(pkg.name || "").trim(),
        price: Number(pkg.price) || 0,
        coverage: String(pkg.coverage || "").trim(),
        photos: String(pkg.photos || "").trim(),
        delivery: String(pkg.delivery || "").trim(),
        album: String(pkg.album || "").trim(),
        description: String(pkg.description || "").trim(),
        paymentPlan
    };
}

function normalizePaymentPlan(plan) {
    if (!plan || typeof plan !== "object") {
        return {
            type: "full"
        };
    }

    const type = ["full", "advance", "installments"].includes(plan.type)
        ? plan.type
        : "full";

    if (type === "advance") {
        return {
            type: "advance",
            advanceType:
                plan.advanceType === "fixed"
                    ? "fixed"
                    : "percentage",
            advanceValue: Number(plan.advanceValue) || 0
        };
    }

    if (type === "installments") {
        return {
            type: "installments",
            installments: Array.isArray(plan.installments)
                ? plan.installments.map((item) => ({
                      name: String(item.name || "").trim(),
                      type:
                          item.type === "fixed"
                              ? "fixed"
                              : "percentage",
                      value: Number(item.value) || 0,
                      due: String(item.due || "").trim()
                  }))
                : []
        };
    }

    return {
        type: "full"
    };
}

/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {
    if (addServiceBtn) {
        addServiceBtn.addEventListener("click", createService);
    }

    if (emptyAddServiceBtn) {
        emptyAddServiceBtn.addEventListener("click", createService);
    }

    if (backBtn) {
        backBtn.addEventListener("click", closeEditor);
    }

    if (cancelServiceBtn) {
        cancelServiceBtn.addEventListener("click", cancelServiceEdit);
    }

    if (saveServiceBtn) {
        saveServiceBtn.addEventListener("click", saveCurrentService);
    }

    if (deleteServiceBtn) {
        deleteServiceBtn.addEventListener("click", openDeleteDialog);
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", closeDeleteDialog);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", deleteCurrentService);
    }

    if (statusIndicator) {
        statusIndicator.addEventListener("click", toggleServiceStatus);

        statusIndicator.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleServiceStatus();
            }
        });
    }

    if (addPackageBtn) {
        addPackageBtn.addEventListener("click", createPackage);
    }

    if (closePackageEditorBtn) {
        closePackageEditorBtn.addEventListener(
            "click",
            cancelPackageEdit
        );
    }

    if (cancelPackageBtn) {
        cancelPackageBtn.addEventListener("click", cancelPackageEdit);
    }

    if (savePackageBtn) {
        savePackageBtn.addEventListener("click", saveCurrentPackage);
    }

    if (paymentPlanType) {
        paymentPlanType.addEventListener(
            "change",
            updatePaymentPlanVisibility
        );
    }

    if (advancePaymentType) {
        advancePaymentType.addEventListener(
            "change",
            updateAdvancePaymentUI
        );
    }

    if (advancePaymentValue) {
        advancePaymentValue.addEventListener(
            "input",
            updateAdvancePaymentUI
        );
    }

    if (packagePrice) {
        packagePrice.addEventListener("input", () => {
            updateAdvancePaymentUI();
            updateInstallmentTotal();
        });
    }

    if (addInstallmentBtn) {
        addInstallmentBtn.addEventListener(
            "click",
            addInstallmentRow
        );
    }

    if (installmentList) {
        installmentList.addEventListener(
            "input",
            handleInstallmentInput
        );

        installmentList.addEventListener(
            "change",
            handleInstallmentInput
        );

        installmentList.addEventListener(
            "click",
            handleInstallmentClick
        );
    }

    /*
     * Event delegation for service cards.
     * This means dynamically-created service cards work too.
     */
    if (servicesList) {
        servicesList.addEventListener("click", handleServiceListClick);
    }

    /*
     * Event delegation for package cards.
     */
    if (packagesList) {
        packagesList.addEventListener("click", handlePackageListClick);
    }

    /*
     * Close delete dialog when clicking the overlay.
     */
    if (deleteDialog) {
        deleteDialog.addEventListener("click", (event) => {
            if (event.target === deleteDialog) {
                closeDeleteDialog();
            }
        });
    }

    /*
     * Escape key closes dialogs/editors.
     */
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        if (
            deleteDialog &&
            !deleteDialog.hidden &&
            deleteDialog.classList.contains("show")
        ) {
            closeDeleteDialog();
            return;
        }

        if (
            packageEditorSection &&
            !packageEditorSection.hidden &&
            packageEditorSection.classList.contains("show")
        ) {
            cancelPackageEdit();
        }
    });
}

/* =========================================================
   SERVICE LIST
   ========================================================= */

function renderServices() {
    if (!servicesList) {
        return;
    }

    servicesList.innerHTML = "";

    if (serviceCount) {
        serviceCount.textContent = services.length;
    }

    if (services.length === 0) {
        servicesList.hidden = true;

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }

    servicesList.hidden = false;

    if (emptyState) {
        emptyState.hidden = true;
    }

    services.forEach((service) => {
        const card = document.createElement("article");
        card.className = "service-card";
        card.dataset.serviceId = service.id;

        const startingPrice = getStartingPrice(service);

        card.innerHTML = `
            <div class="service-card-main">
                <div class="service-card-header">
                    <div>
                        <h3>${escapeHTML(service.name || "Untitled Service")}</h3>
                        <span class="service-status ${
                            service.active ? "active" : "inactive"
                        }">
                            <span class="status-dot"></span>
                            ${service.active ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>

                <p class="service-description">
                    ${escapeHTML(
                        service.description || "No description added."
                    )}
                </p>

                <div class="service-meta">
                    <div class="meta-item">
                        <span class="meta-label">Starting From</span>
                        <strong>
                            ${
                                startingPrice > 0
                                    ? formatCurrency(startingPrice)
                                    : "Not set"
                            }
                        </strong>
                    </div>

                    <div class="meta-item">
                        <span class="meta-label">Packages</span>
                        <strong>${service.packages.length}</strong>
                    </div>

                    <div class="meta-item">
                        <span class="meta-label">Coverage</span>
                        <strong>
                            ${escapeHTML(
                                service.coverageDuration || "Not set"
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            <div class="service-card-actions">
                <button
                    type="button"
                    class="btn btn-secondary edit-service-btn"
                    data-service-id="${escapeHTML(service.id)}"
                >
                    Edit Service
                </button>
            </div>
        `;

        servicesList.appendChild(card);
    });
}

function handleServiceListClick(event) {
    const editButton = event.target.closest(".edit-service-btn");

    if (!editButton) {
        return;
    }

    const serviceId = editButton.dataset.serviceId;

    if (serviceId) {
        openService(serviceId);
    }
}

/* =========================================================
   CREATE / OPEN SERVICE
   ========================================================= */

function createService() {
    const newService = {
        id: createId("service"),
        name: "",
        description: "",
        coverageDuration: "",
        deliveryTime: "",
        coverageType: "",
        active: true,
        packages: []
    };

    services.push(newService);

    currentServiceId = newService.id;
    isCreatingService = true;
    editingPackageId = null;
    creatingPackageId = null;

    openEditor();
    populateEditor();

    if (serviceName) {
        setTimeout(() => {
            serviceName.focus();
        }, 50);
    }
}

function openService(serviceId) {
    const service = services.find(
        (item) => item.id === serviceId
    );

    if (!service) {
        showNotification("Service could not be found.", "error");
        return;
    }

    currentServiceId = serviceId;
    isCreatingService = false;

    openEditor();
    populateEditor();
}

function openEditor() {
    if (servicesView) {
        servicesView.hidden = true;
    }

    if (editorView) {
        editorView.hidden = false;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function closeEditor() {
    if (isCreatingService) {
        const service = getCurrentService();

        /*
         * If the user leaves a newly-created service without saving,
         * remove it instead of leaving an empty service behind.
         */
        if (
            service &&
            !service.name.trim() &&
            service.packages.length === 0
        ) {
            services = services.filter(
                (item) => item.id !== currentServiceId
            );
        }
    }

    closePackageEditor();

    currentServiceId = null;
    isCreatingService = false;

    if (editorView) {
        editorView.hidden = true;
    }

    if (servicesView) {
        servicesView.hidden = false;
    }

    renderServices();
}

function populateEditor() {
    const service = getCurrentService();

    if (!service) {
        return;
    }

    if (editorBreadcrumb) {
        editorBreadcrumb.textContent =
            service.name || "New Service";
    }

    if (editorTitle) {
        editorTitle.textContent =
            service.name || "Create New Service";
    }

    if (editorSubtitle) {
        editorSubtitle.textContent = service.name
            ? "Manage your service details and packages."
            : "Create your service and add packages.";
    }

    if (serviceName) {
        serviceName.value = service.name;
    }

    if (serviceDescription) {
        serviceDescription.value = service.description;
    }

    if (coverageDuration) {
        coverageDuration.value = service.coverageDuration;
    }

    if (deliveryTime) {
        deliveryTime.value = service.deliveryTime;
    }

    if (coverageType) {
        coverageType.value = service.coverageType;
    }

    updateStatusIndicator(service);
    closePackageEditor();
    renderPackages();
}

/* =========================================================
   SERVICE STATUS
   ========================================================= */

function toggleServiceStatus() {
    const service = getCurrentService();

    if (!service) {
        return;
    }

    service.active = !service.active;

    updateStatusIndicator(service);
    persistServices();

    showNotification(
        service.active
            ? "Service activated."
            : "Service deactivated."
    );
}

function updateStatusIndicator(service) {
    if (!statusIndicator) {
        return;
    }

    statusIndicator.classList.toggle("active", service.active);
    statusIndicator.classList.toggle("inactive", !service.active);

    statusIndicator.setAttribute(
        "aria-label",
        service.active
            ? "Service is active. Click to deactivate."
            : "Service is inactive. Click to activate."
    );

    statusIndicator.setAttribute(
        "aria-pressed",
        service.active ? "true" : "false"
    );

    statusIndicator.title = service.active
        ? "Click to deactivate service"
        : "Click to activate service";
}

/* =========================================================
   SAVE SERVICE
   ========================================================= */

function collectServiceData() {
    return {
        name: serviceName ? serviceName.value.trim() : "",
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
            : ""
    };
}

function validateService(data) {
    if (!data.name) {
        showNotification("Please enter a service name.", "error");

        if (serviceName) {
            serviceName.focus();
        }

        return false;
    }

    if (!data.description) {
        showNotification(
            "Please enter a service description.",
            "error"
        );

        if (serviceDescription) {
            serviceDescription.focus();
        }

        return false;
    }

    if (!data.coverageDuration) {
        showNotification(
            "Please enter the coverage duration.",
            "error"
        );

        if (coverageDuration) {
            coverageDuration.focus();
        }

        return false;
    }

    if (!data.deliveryTime) {
        showNotification(
            "Please enter the delivery time.",
            "error"
        );

        if (deliveryTime) {
            deliveryTime.focus();
        }

        return false;
    }

    if (!data.coverageType) {
        showNotification(
            "Please enter the coverage type.",
            "error"
        );

        if (coverageType) {
            coverageType.focus();
        }

        return false;
    }

    return true;
}

function saveCurrentService() {
    const service = getCurrentService();

    if (!service) {
        return;
    }

    const data = collectServiceData();

    if (!validateService(data)) {
        return;
    }

    service.name = data.name;
    service.description = data.description;
    service.coverageDuration = data.coverageDuration;
    service.deliveryTime = data.deliveryTime;
    service.coverageType = data.coverageType;

    persistServices();

    isCreatingService = false;

    if (editorBreadcrumb) {
        editorBreadcrumb.textContent = service.name;
    }

    if (editorTitle) {
        editorTitle.textContent = service.name;
    }

    if (editorSubtitle) {
        editorSubtitle.textContent =
            "Manage your service details and packages.";
    }

    showNotification("Service saved successfully.");

    renderServices();
}

/* =========================================================
   CANCEL SERVICE
   ========================================================= */

function cancelServiceEdit() {
    if (isCreatingService) {
        const service = getCurrentService();

        if (service) {
            services = services.filter(
                (item) => item.id !== service.id
            );

            persistServices();
        }
    }

    closeEditor();
}

/* =========================================================
   DELETE SERVICE
   ========================================================= */

function openDeleteDialog() {
    const service = getCurrentService();

    if (!service) {
        return;
    }

    if (!deleteDialog) {
        const confirmed = window.confirm(
            `Delete "${service.name || "this service"}"?`
        );

        if (confirmed) {
            deleteCurrentService();
        }

        return;
    }

    deleteDialog.hidden = false;
    deleteDialog.classList.add("show");
    deleteDialog.setAttribute("aria-hidden", "false");
}

function closeDeleteDialog() {
    if (!deleteDialog) {
        return;
    }

    deleteDialog.classList.remove("show");
    deleteDialog.hidden = true;
    deleteDialog.setAttribute("aria-hidden", "true");
}

function deleteCurrentService() {
    const service = getCurrentService();

    if (!service) {
        closeDeleteDialog();
        return;
    }

    services = services.filter(
        (item) => item.id !== service.id
    );

    persistServices();

    currentServiceId = null;
    isCreatingService = false;

    closeDeleteDialog();
    closePackageEditor();

    if (editorView) {
        editorView.hidden = true;
    }

    if (servicesView) {
        servicesView.hidden = false;
    }

    renderServices();

    showNotification("Service deleted successfully.");
}

/* =========================================================
   PACKAGES
   ========================================================= */

function renderPackages() {
    const service = getCurrentService();

    if (!service || !packagesList) {
        return;
    }

    packagesList.innerHTML = "";

    if (service.packages.length === 0) {
        packagesList.hidden = true;

        if (packageEmpty) {
            packageEmpty.hidden = false;
        }

        return;
    }

    packagesList.hidden = false;

    if (packageEmpty) {
        packageEmpty.hidden = true;
    }

    service.packages.forEach((pkg) => {
        const card = document.createElement("article");
        card.className = "package-card";
        card.dataset.packageId = pkg.id;

        card.innerHTML = `
            <div class="package-card-content">
                <div class="package-card-heading">
                    <div>
                        <h3>${escapeHTML(
                            pkg.name || "Untitled Package"
                        )}</h3>
                        <strong class="package-price">
                            ${formatCurrency(pkg.price)}
                        </strong>
                    </div>
                </div>

                ${
                    pkg.description
                        ? `<p class="package-description">${escapeHTML(
                              pkg.description
                          )}</p>`
                        : ""
                }

                <div class="package-meta">
                    ${
                        pkg.coverage
                            ? `
                            <div class="meta-item">
                                <span class="meta-label">Coverage</span>
                                <strong>${escapeHTML(
                                    pkg.coverage
                                )}</strong>
                            </div>
                        `
                            : ""
                    }

                    ${
                        pkg.photos
                            ? `
                            <div class="meta-item">
                                <span class="meta-label">Photos</span>
                                <strong>${escapeHTML(
                                    pkg.photos
                                )}</strong>
                            </div>
                        `
                            : ""
                    }

                    ${
                        pkg.delivery
                            ? `
                            <div class="meta-item">
                                <span class="meta-label">Delivery</span>
                                <strong>${escapeHTML(
                                    pkg.delivery
                                )}</strong>
                            </div>
                        `
                            : ""
                    }

                    ${
                        pkg.album
                            ? `
                            <div class="meta-item">
                                <span class="meta-label">Album</span>
                                <strong>${escapeHTML(
                                    pkg.album
                                )}</strong>
                            </div>
                        `
                            : ""
                    }
                </div>

                <div class="package-payment-summary">
                    ${escapeHTML(
                        getPaymentPlanSummary(
                            pkg.paymentPlan,
                            pkg.price
                        )
                    )}
                </div>
            </div>

            <div class="package-card-actions">
                <button
                    type="button"
                    class="btn btn-secondary edit-package-btn"
                    data-package-id="${escapeHTML(pkg.id)}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="btn btn-danger delete-package-btn"
                    data-package-id="${escapeHTML(pkg.id)}"
                >
                    Delete
                </button>
            </div>
        `;

        packagesList.appendChild(card);
    });
}

function handlePackageListClick(event) {
    const editButton = event.target.closest(".edit-package-btn");
    const deleteButton = event.target.closest(".delete-package-btn");

    if (editButton) {
        openPackageEditor(editButton.dataset.packageId);
        return;
    }

    if (deleteButton) {
        deletePackage(deleteButton.dataset.packageId);
    }
}

function createPackage() {
    const service = getCurrentService();

    if (!service) {
        showNotification(
            "Save the service before adding a package.",
            "error"
        );
        return;
    }

    const newPackage = {
        id: createId("package"),
        name: "New Package",
        price: 0,
        coverage: "",
        photos: "",
        delivery: "",
        album: "",
        description: "",
        paymentPlan: {
            type: "full"
        }
    };

    service.packages.push(newPackage);

    editingPackageId = newPackage.id;
    creatingPackageId = newPackage.id;

    openPackageEditor(newPackage.id);
}

function openPackageEditor(packageId) {
    const service = getCurrentService();

    if (!service) {
        return;
    }

    const pkg = service.packages.find(
        (item) => item.id === packageId
    );

    if (!pkg) {
        showNotification("Package could not be found.", "error");
        return;
    }

    editingPackageId = packageId;

    if (packageEditorSection) {
        packageEditorSection.hidden = false;
        packageEditorSection.classList.add("show");
    }

    if (packageEditorTitle) {
        packageEditorTitle.textContent =
            creatingPackageId === packageId
                ? "Add Package"
                : "Edit Package";
    }

    if (packageName) {
        packageName.value = pkg.name;
    }

    if (packagePrice) {
        packagePrice.value =
            pkg.price > 0 ? pkg.price : "";
    }

    if (packageCoverage) {
        packageCoverage.value = pkg.coverage;
    }

    if (packagePhotos) {
        packagePhotos.value = pkg.photos;
    }

    if (packageDelivery) {
        packageDelivery.value = pkg.delivery;
    }

    if (packageAlbum) {
        packageAlbum.value = pkg.album;
    }

    if (packageDescription) {
        packageDescription.value = pkg.description;
    }

    populatePaymentPlanEditor(pkg.paymentPlan);

    packageEditorSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function closePackageEditor() {
    editingPackageId = null;
    creatingPackageId = null;

    if (packageEditorSection) {
        packageEditorSection.classList.remove("show");
        packageEditorSection.hidden = true;
    }

    if (installmentList) {
        installmentList.innerHTML = "";
    }

    if (installmentTotal) {
        installmentTotal.textContent = "₹0";
        installmentTotal.classList.remove(
            "valid",
            "invalid"
        );
    }
}

function cancelPackageEdit() {
    const service = getCurrentService();

    if (!service) {
        closePackageEditor();
        return;
    }

    /*
     * If this package was just created and the user cancelled,
     * remove it completely.
     */
    if (creatingPackageId) {
        service.packages = service.packages.filter(
            (pkg) => pkg.id !== creatingPackageId
        );

        persistServices();
    }

    closePackageEditor();
    renderPackages();
}

function collectPackageData() {
    return {
        name: packageName ? packageName.value.trim() : "",
        price: packagePrice
            ? Number(packagePrice.value)
            : 0,
        coverage: packageCoverage
            ? packageCoverage.value.trim()
            : "",
        photos: packagePhotos
            ? packagePhotos.value.trim()
            : "",
        delivery: packageDelivery
            ? packageDelivery.value.trim()
            : "",
        album: packageAlbum
            ? packageAlbum.value.trim()
            : "",
        description: packageDescription
            ? packageDescription.value.trim()
            : ""
    };
}

function validatePackage(data) {
    if (!data.name) {
        showNotification("Please enter a package name.", "error");

        if (packageName) {
            packageName.focus();
        }

        return false;
    }

    if (!Number.isFinite(data.price) || data.price <= 0) {
        showNotification(
            "Package price must be greater than ₹0.",
            "error"
        );

        if (packagePrice) {
            packagePrice.focus();
        }

        return false;
    }

    if (!data.coverage) {
        showNotification(
            "Please enter the package coverage.",
            "error"
        );

        if (packageCoverage) {
            packageCoverage.focus();
        }

        return false;
    }

    if (!data.photos) {
        showNotification(
            "Please enter the included photos.",
            "error"
        );

        if (packagePhotos) {
            packagePhotos.focus();
        }

        return false;
    }

    if (!data.delivery) {
        showNotification(
            "Please enter the delivery time.",
            "error"
        );

        if (packageDelivery) {
            packageDelivery.focus();
        }

        return false;
    }

    return true;
}

function saveCurrentPackage() {
    const service = getCurrentService();

    if (!service || !editingPackageId) {
        return;
    }

    const pkg = service.packages.find(
        (item) => item.id === editingPackageId
    );

    if (!pkg) {
        return;
    }

    const data = collectPackageData();

    if (!validatePackage(data)) {
        return;
    }

    const paymentPlan = collectPaymentPlan(
        data.price
    );

    if (!paymentPlan.valid) {
        return;
    }

    pkg.name = data.name;
    pkg.price = data.price;
    pkg.coverage = data.coverage;
    pkg.photos = data.photos;
    pkg.delivery = data.delivery;
    pkg.album = data.album;
    pkg.description = data.description;
    pkg.paymentPlan = paymentPlan.value;

    persistServices();

    creatingPackageId = null;

    closePackageEditor();
    renderPackages();

    showNotification("Package saved successfully.");
}

/* =========================================================
   DELETE PACKAGE
   ========================================================= */

function deletePackage(packageId) {
    const service = getCurrentService();

    if (!service) {
        return;
    }

    const pkg = service.packages.find(
        (item) => item.id === packageId
    );

    if (!pkg) {
        return;
    }

    const confirmed = window.confirm(
        `Delete "${pkg.name || "this package"}"?`
    );

    if (!confirmed) {
        return;
    }

    service.packages = service.packages.filter(
        (item) => item.id !== packageId
    );

    if (editingPackageId === packageId) {
        closePackageEditor();
    }

    persistServices();
    renderPackages();

    showNotification("Package deleted successfully.");
}

/* =========================================================
   PAYMENT PLAN
   ========================================================= */

function populatePaymentPlanEditor(paymentPlan) {
    const plan = normalizePaymentPlan(paymentPlan);

    if (paymentPlanType) {
        paymentPlanType.value = plan.type;
    }

    if (plan.type === "advance") {
        if (advancePaymentType) {
            advancePaymentType.value =
                plan.advanceType || "percentage";
        }

        if (advancePaymentValue) {
            advancePaymentValue.value =
                plan.advanceValue || "";
        }
    } else {
        if (advancePaymentType) {
            advancePaymentType.value = "percentage";
        }

        if (advancePaymentValue) {
            advancePaymentValue.value = "";
        }
    }

    if (plan.type === "installments") {
        renderInstallmentRows(plan.installments);
    } else {
        renderInstallmentRows([]);
    }

    updatePaymentPlanVisibility();
}

function updatePaymentPlanVisibility() {
    const type = paymentPlanType
        ? paymentPlanType.value
        : "full";

    if (advancePaymentFields) {
        advancePaymentFields.hidden = type !== "advance";
    }

    if (installmentPaymentFields) {
        installmentPaymentFields.hidden =
            type !== "installments";
    }

    if (type === "advance") {
        updateAdvancePaymentUI();
    }

    if (type === "installments") {
        updateInstallmentTotal();
    }
}

function updateAdvancePaymentUI() {
    const type = advancePaymentType
        ? advancePaymentType.value
        : "percentage";

    if (advancePaymentPrefix) {
        advancePaymentPrefix.textContent =
            type === "percentage" ? "%" : "₹";
    }

    if (advancePaymentInputWrap) {
        advancePaymentInputWrap.dataset.type = type;
    }
}

function collectPaymentPlan(price) {
    const type = paymentPlanType
        ? paymentPlanType.value
        : "full";

    if (type === "full") {
        return {
            valid: true,
            value: {
                type: "full"
            }
        };
    }

    if (type === "advance") {
        const advanceType = advancePaymentType
            ? advancePaymentType.value
            : "percentage";

        const value = advancePaymentValue
            ? Number(advancePaymentValue.value)
            : 0;

        if (!Number.isFinite(value) || value <= 0) {
            showNotification(
                "Please enter a valid advance payment.",
                "error"
            );

            if (advancePaymentValue) {
                advancePaymentValue.focus();
            }

            return {
                valid: false
            };
        }

        if (advanceType === "percentage") {
            if (value >= 100) {
                showNotification(
                    "Advance percentage must be less than 100%.",
                    "error"
                );

                return {
                    valid: false
                };
            }
        } else {
            if (value >= price) {
                showNotification(
                    "Fixed advance must be less than the package price.",
                    "error"
                );

                return {
                    valid: false
                };
            }
        }

        return {
            valid: true,
            value: {
                type: "advance",
                advanceType,
                advanceValue: value
            }
        };
    }

    if (type === "installments") {
        const rows = collectInstallments();

        if (rows.length === 0) {
            showNotification(
                "Add at least one installment.",
                "error"
            );

            return {
                valid: false
            };
        }

        for (const row of rows) {
            if (!row.name) {
                showNotification(
                    "Each installment needs a name.",
                    "error"
                );

                return {
                    valid: false
                };
            }

            if (!Number.isFinite(row.value) || row.value <= 0) {
                showNotification(
                    "Each installment must have a value greater than ₹0.",
                    "error"
                );

                return {
                    valid: false
                };
            }

            if (!row.due) {
                showNotification(
                    "Please enter when each installment is due.",
                    "error"
                );

                return {
                    valid: false
                };
            }

            if (row.type === "percentage" && row.value > 100) {
                showNotification(
                    "Installment percentage cannot exceed 100%.",
                    "error"
                );

                return {
                    valid: false
                };
            }

            if (row.type === "fixed" && row.value > price) {
                showNotification(
                    "An installment cannot exceed the package price.",
                    "error"
                );

                return {
                    valid: false
                };
            }
        }

        const total = calculateInstallmentTotal(
            rows,
            price
        );

        if (Math.abs(total - price) > 0.01) {
            showNotification(
                `Installments must total ${formatCurrency(
                    price
                )}. Current total is ${formatCurrency(total)}.`,
                "error"
            );

            updateInstallmentTotal();

            return {
                valid: false
            };
        }

        return {
            valid: true,
            value: {
                type: "installments",
                installments: rows
            }
        };
    }

    return {
        valid: false
    };
}

/* =========================================================
   INSTALLMENTS
   ========================================================= */

function renderInstallmentRows(rows) {
    if (!installmentList) {
        return;
    }

    installmentList.innerHTML = "";

    rows.forEach((row) => {
        appendInstallmentRow(row);
    });

    updateInstallmentTotal();
}

function appendInstallmentRow(row = {}) {
    if (!installmentList) {
        return;
    }

    const item = document.createElement("div");
    item.className = "installment-row";

    item.innerHTML = `
        <div class="installment-field">
            <label>Installment Name</label>
            <input
                type="text"
                class="installment-name"
                placeholder="e.g. Booking"
                value="${escapeAttribute(row.name || "")}"
            >
        </div>

        <div class="installment-field">
            <label>Type</label>
            <select class="installment-type">
                <option value="percentage" ${
                    row.type !== "fixed"
                        ? "selected"
                        : ""
                }>
                    Percentage
                </option>
                <option value="fixed" ${
                    row.type === "fixed"
                        ? "selected"
                        : ""
                }>
                    Fixed Amount
                </option>
            </select>
        </div>

        <div class="installment-field">
            <label>Value</label>
            <input
                type="number"
                class="installment-value"
                min="0"
                step="0.01"
                placeholder="0"
                value="${
                    Number(row.value) > 0
                        ? Number(row.value)
                        : ""
                }"
            >
        </div>

        <div class="installment-field">
            <label>Due</label>
            <input
                type="text"
                class="installment-due"
                placeholder="e.g. At Booking"
                value="${escapeAttribute(row.due || "")}"
            >
        </div>

        <button
            type="button"
            class="remove-installment-btn"
            aria-label="Remove installment"
            title="Remove installment"
        >
            Remove
        </button>
    `;

    installmentList.appendChild(item);
}

function addInstallmentRow() {
    appendInstallmentRow({
        name: "",
        type: "percentage",
        value: 0,
        due: ""
    });

    updateInstallmentTotal();
}

function collectInstallments() {
    if (!installmentList) {
        return [];
    }

    const rows = [];

    installmentList
        .querySelectorAll(".installment-row")
        .forEach((row) => {
            const nameInput =
                row.querySelector(".installment-name");

            const typeInput =
                row.querySelector(".installment-type");

            const valueInput =
                row.querySelector(".installment-value");

            const dueInput =
                row.querySelector(".installment-due");

            rows.push({
                name: nameInput
                    ? nameInput.value.trim()
                    : "",
                type:
                    typeInput &&
                    typeInput.value === "fixed"
                        ? "fixed"
                        : "percentage",
                value: valueInput
                    ? Number(valueInput.value)
                    : 0,
                due: dueInput
                    ? dueInput.value.trim()
                    : ""
            });
        });

    return rows;
}

function handleInstallmentInput() {
    updateInstallmentTotal();
}

function handleInstallmentClick(event) {
    const removeButton = event.target.closest(
        ".remove-installment-btn"
    );

    if (!removeButton) {
        return;
    }

    const row = removeButton.closest(".installment-row");

    if (row) {
        row.remove();
    }

    updateInstallmentTotal();
}

function calculateInstallmentTotal(rows, price) {
    return rows.reduce((total, row) => {
        if (row.type === "percentage") {
            return total + (price * row.value) / 100;
        }

        return total + row.value;
    }, 0);
}

function updateInstallmentTotal() {
    if (!installmentTotal) {
        return;
    }

    const price = packagePrice
        ? Number(packagePrice.value) || 0
        : 0;

    const rows = collectInstallments();
    const total = calculateInstallmentTotal(
        rows,
        price
    );

    installmentTotal.textContent = formatCurrency(total);

    installmentTotal.classList.remove(
        "valid",
        "invalid"
    );

    if (price <= 0 || rows.length === 0) {
        return;
    }

    if (Math.abs(total - price) <= 0.01) {
        installmentTotal.classList.add("valid");
    } else {
        installmentTotal.classList.add("invalid");
    }
}

/* =========================================================
   PAYMENT SUMMARY
   ========================================================= */

function getPaymentPlanSummary(paymentPlan, price) {
    const plan = normalizePaymentPlan(paymentPlan);

    if (plan.type === "full") {
        return "Payment: Full payment";
    }

    if (plan.type === "advance") {
        if (plan.advanceType === "percentage") {
            return `Payment: ${plan.advanceValue}% advance`;
        }

        return `Payment: ${formatCurrency(
            plan.advanceValue
        )} advance`;
    }

    if (plan.type === "installments") {
        const count = Array.isArray(plan.installments)
            ? plan.installments.length
            : 0;

        return `Payment: ${count} installment${
            count === 1 ? "" : "s"
        }`;
    }

    return "Payment: Full payment";
}

/* =========================================================
   HELPERS
   ========================================================= */

function getCurrentService() {
    if (!currentServiceId) {
        return null;
    }

    return (
        services.find(
            (service) => service.id === currentServiceId
        ) || null
    );
}

function getStartingPrice(service) {
    if (!service || !Array.isArray(service.packages)) {
        return 0;
    }

    const prices = service.packages
        .map((pkg) => Number(pkg.price))
        .filter(
            (price) =>
                Number.isFinite(price) && price > 0
        );

    return prices.length
        ? Math.min(...prices)
        : 0;
}

function getServiceName(serviceId) {
    const service = services.find(
        (item) => item.id === serviceId
    );

    return service ? service.name : "";
}

function formatCurrency(value) {
    const amount = Number(value) || 0;

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
}

function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
}

function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}

/* =========================================================
   NOTIFICATION
   ========================================================= */

let notificationTimer = null;

function showNotification(message, type = "success") {
    if (!notification) {
        console.log(`[${type}] ${message}`);
        return;
    }

    notification.textContent = message;

    notification.classList.remove(
        "show",
        "success",
        "error"
    );

    notification.classList.add(type);

    /*
     * Force reflow so repeated notifications animate correctly.
     */
    void notification.offsetWidth;

    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

/* =========================================================
   DASHBOARD / GLOBAL COMPATIBILITY
   =========================================================
   
   These functions are exposed because your dashboard/user.js
   may use them.
   ========================================================= */

window.getStoredServices = function () {
    return cloneData(services);
};

window.saveServices = function (newServices) {
    if (Array.isArray(newServices)) {
        services = normalizeServices(newServices);
    }

    return persistServices();
};

window.getServiceName = function (serviceId) {
    return getServiceName(serviceId);
};

window.ProfessionalStudioServices = {
    get: function () {
        return cloneData(services);
    },

    save: function (newServices) {
        if (!Array.isArray(newServices)) {
            return false;
        }

        services = normalizeServices(newServices);
        return persistServices();
    },

    reload: function () {
        loadServices();
        renderServices();
        return cloneData(services);
    }
};

/* =========================================================
   STORAGE UPDATE LISTENER
   ========================================================= */

window.addEventListener(
    "professionalStudioServicesUpdated",
    () => {
        /*
         * Keep the UI in sync if another Professional Studio
         * module changes the services data.
         */
        if (!editorView || editorView.hidden) {
            renderServices();
        }
    }
);