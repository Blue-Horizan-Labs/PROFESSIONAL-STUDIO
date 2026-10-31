"use strict";

const serviceForm = document.getElementById("serviceForm");
const servicesList = document.getElementById("servicesList");
const serviceCount = document.getElementById("serviceCount");
const listStatus = document.getElementById("listStatus");
const refreshServicesBtn = document.getElementById("refreshServicesBtn");
const saveServiceBtn = document.getElementById("saveServiceBtn");
const deleteDialog = document.getElementById("deleteDialog");
const deleteDialogTitle = document.getElementById("deleteDialogTitle");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const notification = document.getElementById("notification");

let services = [];
let selectedServiceId = null;
let notificationTimer;

function init() {
    serviceForm.addEventListener("submit", registerService);
    refreshServicesBtn.addEventListener("click", loadServices);
    servicesList.addEventListener("click", handleServiceListClick);
    cancelDeleteBtn.addEventListener("click", closeDeleteDialog);
    confirmDeleteBtn.addEventListener("click", deleteService);
    deleteDialog.addEventListener("click", (event) => {
        if (event.target === deleteDialog) {
            closeDeleteDialog();
        }
    });

    loadServices();
}

async function requestJson(url, options) {
    const response = await fetch(url, options);
    const responseText = await response.text();
    let result = null;

    if (responseText) {
        try {
            result = JSON.parse(responseText);
        } catch {
            result = responseText;
        }
    }

    if (!response.ok) {
        const message =
            result && typeof result === "object"
                ? result.message || result.error
                : result;
        throw new Error(message || `Request failed (${response.status}).`);
    }

    return result;
}

async function loadServices() {
    listStatus.textContent = "Loading services…";
    refreshServicesBtn.disabled = true;

    try {
        const result = await requestJson("/api/list_service");
        const list = Array.isArray(result)
            ? result
            : result && Array.isArray(result.services)
                ? result.services
                : result && Array.isArray(result.data)
                    ? result.data
                    : null;

        if (!list) {
            throw new Error("The service list response was not a valid list.");
        }

        services = list.filter(
            (service) => service && typeof service === "object"
        );
        renderServices();
        listStatus.textContent = services.length
            ? ""
            : "No services have been added yet.";
    } catch (error) {
        console.error("Unable to load services:", error);
        services = [];
        renderServices();
        listStatus.textContent = "Unable to load services. Please try again.";
        showNotification(error.message || "Unable to load services.", "error");
    } finally {
        refreshServicesBtn.disabled = false;
    }
}

async function registerService(event) {
    event.preventDefault();

    const amountInput = document.getElementById("serviceAmount");
    const advancedAmountInput = document.getElementById("advancedAmount");
    const amount = Number(amountInput.value);
    const advancedAmount = advancedAmountInput.value.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
        amountInput.focus();
        showNotification("Enter an amount greater than zero.", "error");
        return;
    }

    if (advancedAmount && (!Number.isFinite(Number(advancedAmount)) || Number(advancedAmount) < 0)) {
        advancedAmountInput.focus();
        showNotification("Enter a valid advanced amount.", "error");
        return;
    }

    const payload = {
        service_name: document.getElementById("serviceName").value.trim(),
        description: document.getElementById("serviceDescription").value.trim(),
        amount,
        advanced_amount: advancedAmount ? Number(advancedAmount) : null
    };

    saveServiceBtn.disabled = true;

    try {
        await requestJson("/api/register_service", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        serviceForm.reset();
        showNotification("Service added successfully.");
        await loadServices();
    } catch (error) {
        console.error("Unable to register service:", error);
        showNotification(error.message || "Unable to add service.", "error");
    } finally {
        saveServiceBtn.disabled = false;
    }
}

function renderServices() {
    servicesList.replaceChildren();
    serviceCount.textContent = String(services.length);

    services.forEach((service) => {
        const card = document.createElement("article");
        card.className = "service-card";

        const main = document.createElement("div");
        main.className = "service-card-main";

        const title = document.createElement("h3");
        title.textContent =
            service.service_name || service.serviceName || service.name || "Untitled service";
        main.appendChild(title);

        const description = service.description || service.service_description;
        if (description) {
            const descriptionElement = document.createElement("p");
            descriptionElement.className = "service-description";
            descriptionElement.textContent = description;
            main.appendChild(descriptionElement);
        }

        const details = document.createElement("div");
        details.className = "service-meta";
        appendServiceDetail(
            details,
            "Amount",
            service.amount ?? service.service_amount
        );
        appendServiceDetail(
            details,
            "Advanced amount",
            service.advanced ?? service.advancedAmount
        );
        main.appendChild(details);
        
        const serviceId =
            service.service_id ?? service.serviceId ?? service.id;
        const actions = document.createElement("div");
        actions.className = "service-card-action";
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger";
        deleteButton.dataset.serviceId =
            serviceId === undefined || serviceId === null
                ? ""
                : String(serviceId);
        deleteButton.textContent = "Delete";
        deleteButton.disabled = !deleteButton.dataset.serviceId;
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${title.textContent}`
        );
        actions.appendChild(deleteButton);

        card.append(main, actions);
        servicesList.appendChild(card);
    });
}

function appendServiceDetail(container, label, value) {
    if (value === undefined || value === null || value === "") {
        return;
    }

    const detail = document.createElement("div");
    detail.className = "service-meta-item";

    const detailLabel = document.createElement("span");
    detailLabel.className = "service-meta-label";
    detailLabel.textContent = label;

    const detailValue = document.createElement("strong");
    detailValue.className = "service-meta-value";
    detailValue.textContent = String(value);

    detail.append(detailLabel, detailValue);
    container.appendChild(detail);
}

function handleServiceListClick(event) {
    const button = event.target.closest("button[data-service-id]");
    if (!button || !button.dataset.serviceId) {
        return;
    }

    selectedServiceId = button.dataset.serviceId;
    const service = services.find((item) => {
        const id = item.service_id ?? item.serviceId ?? item.id;
        return id !== undefined && id !== null && String(id) === selectedServiceId;
    });
    const serviceName =
        service && (service.service_name || service.serviceName || service.name);

    deleteDialogTitle.textContent = serviceName
        ? `Delete "${serviceName}"?`
        : "Delete service?";
    deleteDialog.hidden = false;
    deleteDialog.classList.add("show");
    confirmDeleteBtn.focus();
}

function closeDeleteDialog() {
    selectedServiceId = null;
    deleteDialog.classList.remove("show");
    deleteDialog.hidden = true;
}

async function deleteService() {
    if (!selectedServiceId) {
        closeDeleteDialog();
        showNotification("Select a service to delete.", "error");
        return;
    }

    confirmDeleteBtn.disabled = true;

    try {
        await requestJson("/api/del_service", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                service_id: selectedServiceId
            })
        });

        closeDeleteDialog();
        showNotification("Service deleted successfully.");
        await loadServices();
    } catch (error) {
        console.error("Unable to delete service:", error);
        showNotification(error.message || "Unable to delete service.", "error");
    } finally {
        confirmDeleteBtn.disabled = false;
    }
}

function showNotification(message, type = "success") {
    notification.textContent = message;
    notification.classList.remove("show", "success", "error");
    notification.classList.add(type);
    void notification.offsetWidth;
    notification.classList.add("show");
    clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

init();
