"use strict";

const servicesContainer = document.getElementById("servicesContainer");
const servicesStatus = document.getElementById("servicesStatus");
const studioId = new URLSearchParams(window.location.search)
    .get("studio_id")
    ?.trim();

function formatAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return "Contact for pricing";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}

function addDetail(card, label, value) {
    if (value === null || value === undefined || value === "") {
        return;
    }

    const detail = document.createElement("p");
    detail.className = "service-detail";

    const detailLabel = document.createElement("strong");
    detailLabel.textContent = `${label}: `;
    detail.append(detailLabel, document.createTextNode(String(value)));
    card.appendChild(detail);
}

function renderServices(services) {
    servicesContainer.replaceChildren();

    services.forEach((service) => {
        if (!service || service.id === undefined || service.id === null) {
            return;
        }

        const card = document.createElement("article");
        card.className = "package-card";

        const name = document.createElement("h2");
        name.className = "package-name";
        name.textContent = service.name || "Photography Service";
        card.appendChild(name);

        addDetail(card, "Price", formatAmount(service.amount));
        if (service.advanced !== null && service.advanced !== undefined) {
            addDetail(card, "Advance", formatAmount(service.advanced));
        }

        if (service.description) {
            const description = document.createElement("p");
            description.className = "package-description";
            description.textContent = service.description;
            card.appendChild(description);
        }

        const selectButton = document.createElement("a");
        selectButton.className = "primary-button";
        selectButton.textContent = "Choose Service";
        selectButton.href =
            `/booking?service=${encodeURIComponent(service.id)}` +
            `&studio_id=${encodeURIComponent(studioId)}`;
        card.appendChild(selectButton);

        servicesContainer.appendChild(card);
    });

    if (servicesContainer.childElementCount === 0) {
        servicesStatus.textContent = "No services are available for this studio.";
        return;
    }

    servicesStatus.textContent = "";
}

async function loadServices() {
    if (!studioId) {
        servicesStatus.textContent =
            "A studio ID is required to view services.";
        return;
    }

    servicesStatus.textContent = "Loading services…";

    try {
        const response = await fetch(
            `/api/list_service?studio_id=${encodeURIComponent(studioId)}`
        );
        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result?.error || result?.message || "Unable to load services."
            );
        }

        if (!Array.isArray(result)) {
            throw new Error("The service list response is invalid.");
        }

        renderServices(result);
    } catch (error) {
        console.error("Unable to load studio services:", error);
        servicesStatus.textContent =
            error.message || "Unable to load services. Please try again.";
    }
}

loadServices();
