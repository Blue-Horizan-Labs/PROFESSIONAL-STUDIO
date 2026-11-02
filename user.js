"use strict";

const appointmentsBody = document.getElementById("bookingTable");
const bookingEmptyState = document.getElementById("bookingEmptyState");
const analyticsStatus = document.getElementById("analyticsStatus");
const serviceGrid = document.getElementById("serviceGrid");

let appointments = [];
let services = [];

async function getJson(url, options = {}) {
    const response = await fetch(url, options);
    let data = null;

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text };
            }
        }
    }

    if (!response.ok) {
        const error = new Error(
            data?.message || data?.error || "Unable to load dashboard data."
        );
        error.status = response.status;
        throw error;
    }

    return data;
}

function handleUnauthorized(error) {
    if (error?.status === 401) {
        window.location.href = "/login";
        return true;
    }

    return false;
}

function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getAppointmentDate(appointment) {
    const date = appointment?.date ?? appointment?.booking_date ?? "";
    return typeof date === "string" ? date.slice(0, 10) : "";
}

function normalizeStatus(appointment) {
    const status = appointment?.status ?? appointment?.booking_status ?? "";
    return String(status).trim().toLowerCase();
}

function isCancelled(appointment) {
    return ["denied", "declined", "cancelled", "canceled"].includes(
        normalizeStatus(appointment)
    );
}

function isConfirmed(appointment) {
    return ["accepted", "confirmed", "completed"].includes(
        normalizeStatus(appointment)
    );
}

function formatCurrency(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = String(value ?? "");
    }
}

function getServiceName(appointment) {
    const serviceId = appointment?.service_id ?? appointment?.service;
    const service = services.find(
        (item) => String(item.id) === String(serviceId)
    );

    return (
        appointment?.service_name ||
        service?.name ||
        (serviceId !== undefined && serviceId !== null
            ? `Service ${serviceId}`
            : "Photography Service")
    );
}

function formatDate(dateString) {
    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function renderBookingsTable() {
    if (!appointmentsBody || !bookingEmptyState) {
        return;
    }

    appointmentsBody.replaceChildren();

    if (appointments.length === 0) {
        bookingEmptyState.hidden = false;
        return;
    }

    bookingEmptyState.hidden = true;

    const rows = [...appointments]
        .filter((appointment) => appointment && typeof appointment === "object")
        .sort((a, b) => {
            const first = new Date(getAppointmentDate(a) || 0).getTime();
            const second = new Date(getAppointmentDate(b) || 0).getTime();
            return first - second;
        })
        .slice(0, 5);

    rows.forEach((appointment) => {
        const row = document.createElement("tr");

        const clientCell = document.createElement("td");
        clientCell.textContent =
            appointment.client_name ||
            appointment.name ||
            appointment.email ||
            "Client";

        const serviceCell = document.createElement("td");
        serviceCell.textContent = getServiceName(appointment);

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(getAppointmentDate(appointment));

        const statusCell = document.createElement("td");
        const status = document.createElement("span");
        const normalizedStatus = normalizeStatus(appointment);
        status.className = "booking-status";
        status.textContent = normalizedStatus || "Pending";
        statusCell.appendChild(status);

        row.append(clientCell, serviceCell, dateCell, statusCell);
        appointmentsBody.appendChild(row);
    });
}

function renderServices() {
    if (!serviceGrid) {
        return;
    }

    serviceGrid.replaceChildren();

    if (services.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "No services available yet.";
        serviceGrid.appendChild(empty);
        return;
    }

    services.forEach((service) => {
        const card = document.createElement("article");
        card.className = "service-card";

        const title = document.createElement("h3");
        title.textContent =
            service.service_name ||
            service.serviceName ||
            service.name ||
            "Untitled service";

        const description = document.createElement("p");
        description.textContent =
            service.description ||
            service.service_description ||
            "No description added yet.";

        const amount = document.createElement("span");
        amount.className = "service-amount";
        amount.textContent = formatCurrency(service.amount ?? 0);

        card.append(title, description, amount);
        serviceGrid.appendChild(card);
    });
}

function renderMonthlyTrend() {
    const chart = document.getElementById("activityChart");
    if (!chart) {
        return;
    }

    chart.replaceChildren();

    const now = new Date();
    const months = [];
    for (let offset = 5; offset >= 0; offset--) {
        const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        months.push({
            key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
            label: month.toLocaleDateString("en", { month: "short" }),
            count: 0
        });
    }

    appointments.forEach((appointment) => {
        const date = getAppointmentDate(appointment);
        const month = months.find((item) => item.key === date.slice(0, 7));
        if (month) {
            month.count += 1;
        }
    });

    const maxCount = Math.max(1, ...months.map((month) => month.count));
    months.forEach((month) => {
        const barGroup = document.createElement("div");
        barGroup.className = "chart-month";

        const count = document.createElement("span");
        count.className = "chart-count";
        count.textContent = String(month.count);

        const bar = document.createElement("span");
        bar.className = "chart-bar";
        bar.style.height = `${Math.max(10, (month.count / maxCount) * 125)}px`;
        bar.setAttribute("aria-label", `${month.label}: ${month.count} bookings`);

        const label = document.createElement("span");
        label.className = "chart-label";
        label.textContent = month.label;

        barGroup.append(count, bar, label);
        chart.appendChild(barGroup);
    });
}

function renderAnalytics() {
    const today = localDateKey();
    const currentMonth = today.slice(0, 7);
    const pending = appointments.filter(
        (appointment) => normalizeStatus(appointment) === "pending"
    );
    const confirmed = appointments.filter(isConfirmed);
    const completed = appointments.filter(
        (appointment) => normalizeStatus(appointment) === "completed"
    );
    const confirmedValue = confirmed.reduce((total, appointment) => {
        const amount = Number(appointment.amount);
        return Number.isFinite(amount) && amount > 0 ? total + amount : total;
    }, 0);
    const todayCount = appointments.filter((appointment) => {
        const date = getAppointmentDate(appointment);
        return date === today && !isCancelled(appointment);
    }).length;
    const thisMonthCount = appointments.filter((appointment) => {
        const date = getAppointmentDate(appointment);
        return date && date.slice(0, 7) === currentMonth;
    }).length;

    setText("todayBookingsCounter", todayCount);
    setText("activeServicesCounter", services.length);
    setText("dashboardRevenue", formatCurrency(confirmedValue));
    setText("totalBookings", appointments.length);
    setText("pendingBookingsAnalytics", pending.length);
    setText("confirmedBookingsAnalytics", confirmed.length);
    setText("totalRevenue", formatCurrency(confirmedValue));
    setText("completedBookingsAnalytics", completed.length);
    setText("bookingsThisMonth", thisMonthCount);

    renderMonthlyTrend();
}

async function loadProfile() {
    try {
        const data = await getJson("/api/dashboard-data");
        if (data?.message === "Unauthorized") {
            window.location.href = "/login";
            return;
        }

        setText("name", data?.name || "Photographer");

        const openPortfolioButton = document.getElementById("openPortfolioBtn");
        if (openPortfolioButton) {
            openPortfolioButton.addEventListener("click", () => {
                window.location.href = `/api/client?id=${encodeURIComponent(data?.link || "")}`;
            });
        }

        const copyProfileButton = document.getElementById("copyProfileBtn");
        if (copyProfileButton) {
            copyProfileButton.addEventListener("click", async (event) => {
                const button = event.currentTarget;
                try {
                    await navigator.clipboard.writeText(
                        `${window.location.origin}/api/client?id=${encodeURIComponent(data?.link || "")}`
                    );
                    button.textContent = "Copied!";
                    window.setTimeout(() => {
                        button.textContent = "Copy Profile Link";
                    }, 2000);
                } catch (error) {
                    console.error("Unable to copy profile link:", error);
                    if (analyticsStatus) {
                        analyticsStatus.textContent =
                            "Could not copy the profile link. Check clipboard permissions.";
                    }
                }
            });
        }
    } catch (error) {
        console.error("Unable to load dashboard profile:", error);
        if (!handleUnauthorized(error) && analyticsStatus) {
            analyticsStatus.textContent =
                "Unable to load your dashboard profile. Refresh to try again.";
        }
    }
}

async function loadBusinessAnalytics() {
    try {
        const [appointmentData, serviceData] = await Promise.all([
            getJson("/api/appointments"),
            getJson("/api/list_service")
        ]);

        const normalizedAppointments = Array.isArray(appointmentData?.appointments)
            ? appointmentData.appointments.filter(
                  (appointment) => appointment && typeof appointment === "object"
              )
            : [];

        if (!Array.isArray(serviceData)) {
            throw new Error("The services response is invalid.");
        }

        appointments = normalizedAppointments;
        services = serviceData;

        renderBookingsTable();
        renderServices();
        renderAnalytics();

        if (analyticsStatus) {
            analyticsStatus.textContent = "";
        }
    } catch (error) {
        console.error("Unable to load dashboard analytics:", error);
        if (handleUnauthorized(error)) {
            return;
        }

        appointments = [];
        services = [];
        renderBookingsTable();
        renderServices();
        renderAnalytics();

        if (analyticsStatus) {
            analyticsStatus.textContent =
                "Unable to load booking analytics. Refresh the page to try again.";
        }

        if (bookingEmptyState) {
            bookingEmptyState.hidden = false;
            bookingEmptyState.querySelector("h3").textContent =
                "Bookings could not be loaded";
            bookingEmptyState.querySelector("p").textContent =
                "Please refresh the page and try again.";
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    loadBusinessAnalytics();
});
