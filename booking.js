"use strict";

const params = new URLSearchParams(window.location.search);
const studioId = params.get("studio_id")?.trim();
const serviceId = params.get("service")?.trim();

const bookingForm = document.getElementById("bookingForm");
const eventDatesInput = document.getElementById("eventDates");
const dateAvailability = document.getElementById("dateAvailability");
const serviceSummary = document.getElementById("serviceSummary");
const summaryServiceName = document.getElementById("summaryServiceName");
const summaryAmount = document.getElementById("summaryAmount");
const summaryAdvanced = document.getElementById("summaryAdvanced");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");
const successPopup = document.getElementById("successPopup");
const backToService = document.getElementById("backToService");

let selectedService = null;
let datePicker = null;
let bookedDates = [];
let submitting = false;

if (studioId) {
    backToService.href = `service.html?studio_id=${encodeURIComponent(studioId)}`;
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(value);
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        const error = new Error(
            result?.error || result?.message || "The request could not be completed."
        );
        error.status = response.status;
        error.conflictingDates = result?.conflictingDates || [];
        throw error;
    }

    return result;
}

function showFormMessage(message) {
    formMessage.textContent = message;
    formMessage.hidden = false;
}

function showServiceError(message) {
    serviceSummary.replaceChildren();
    const error = document.createElement("p");
    error.textContent = message;
    serviceSummary.appendChild(error);
    submitBtn.disabled = true;
}

async function loadSelectedService() {
    if (!studioId || !serviceId) {
        showServiceError("The studio or service was not specified.");
        return;
    }

    const services = await fetchJson(
        `/api/list_service?studio_id=${encodeURIComponent(studioId)}`
    );

    if (!Array.isArray(services)) {
        throw new Error("The service list response is invalid.");
    }

    selectedService = services.find(
        (service) => String(service.id) === serviceId
    );

    if (!selectedService) {
        showServiceError("This service is not available. Please choose another service.");
        return;
    }

    const amount = Number(selectedService.amount);
    const advanced = Number(selectedService.advanced ?? 0);
    if (
        !Number.isFinite(amount) ||
        amount < 0 ||
        !Number.isFinite(advanced) ||
        advanced < 0
    ) {
        showServiceError("The selected service does not have valid pricing.");
        return;
    }

    const heading = document.createElement("h2");
    heading.textContent = selectedService.name || "Selected Service";
    serviceSummary.replaceChildren(heading);

    if (selectedService.description) {
        const description = document.createElement("p");
        description.className = "service-description";
        description.textContent = selectedService.description;
        serviceSummary.appendChild(description);
    }

    summaryServiceName.textContent = heading.textContent;
    summaryAmount.textContent = formatCurrency(amount);
    summaryAdvanced.textContent = formatCurrency(advanced);
}

async function loadBookedDates() {
    const result = await fetchJson(
        `/api/request_appointment?studio_id=${encodeURIComponent(studioId)}`
    );

    if (!Array.isArray(result.bookedDates)) {
        throw new Error("Date availability response is invalid.");
    }

    bookedDates = result.bookedDates;

    if (typeof window.flatpickr !== "function") {
        throw new Error("The date picker could not be loaded. Refresh and try again.");
    }

    datePicker = window.flatpickr(eventDatesInput, {
        mode: "multiple",
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: bookedDates
    });

    dateAvailability.textContent = bookedDates.length
        ? "Unavailable dates are disabled."
        : "Choose one or more available dates.";
}

function updateDatePickerDisabledDates(conflicts) {
    bookedDates = [...new Set([...bookedDates, ...conflicts])];
    datePicker.set("disable", bookedDates);

    const selected = datePicker.selectedDates.filter(
        (date) => !bookedDates.includes(datePicker.formatDate(date, "Y-m-d"))
    );
    datePicker.setDate(selected, false);
}

bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formMessage.hidden = true;

    if (submitting || !bookingForm.reportValidity()) {
        return;
    }

    if (!selectedService || !datePicker || !studioId) {
        showFormMessage("The service or available dates could not be loaded.");
        return;
    }

    const dates = datePicker.selectedDates.map(
        (date) => datePicker.formatDate(date, "Y-m-d")
    );
    if (!dates.length) {
        showFormMessage("Choose at least one event date.");
        eventDatesInput.focus();
        return;
    }

    const payload = {
        studio_id: studioId,
        service_id: selectedService.id,
        name: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        dates,
        location: document.getElementById("location").value.trim(),
        notes: document.getElementById("notes").value.trim()
    };

    submitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    try {
        await fetchJson("/api/request_appointment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        bookingForm.reset();
        datePicker.clear();
        successPopup.textContent = "Booking request submitted successfully.";
        successPopup.hidden = false;
        dateAvailability.textContent = "Your request has been sent to the studio.";
    } catch (error) {
        console.error("Unable to submit booking request:", error);

        if (error.status === 409 && error.conflictingDates.length) {
            updateDatePickerDisabledDates(error.conflictingDates);
            showFormMessage(
                `These dates are no longer available: ${error.conflictingDates.join(", ")}. Choose different dates and submit again.`
            );
        } else {
            showFormMessage(error.message || "Unable to submit the booking request.");
        }
    } finally {
        submitting = false;
        submitBtn.disabled = !selectedService || !datePicker;
        submitBtn.textContent = "Submit Booking Request";
    }
});

async function initializeBookingPage() {
    if (!studioId || !serviceId) {
        showServiceError("The studio or service was not specified.");
        dateAvailability.textContent =
            "Return to the services page and choose a service to continue.";
        return;
    }

    try {
        await Promise.all([loadSelectedService(), loadBookedDates()]);
        submitBtn.disabled = !selectedService || !datePicker;
    } catch (error) {
        console.error("Unable to initialize booking page:", error);
        showServiceError(error.message || "Unable to load the selected service.");
        dateAvailability.textContent =
            "Unable to check date availability. Refresh and try again.";
        submitBtn.disabled = true;
    }
}

initializeBookingPage();
