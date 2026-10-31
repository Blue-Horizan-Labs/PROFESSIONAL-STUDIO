"use strict";

const appointmentsBody = document.getElementById("bookingTable");
const bookingEmptyState = document.getElementById("bookingEmptyState");
const bookingSearch = document.getElementById("searchBooking");
const analyticsStatus = document.getElementById("analyticsStatus");

let appointments = [];
let services = [];

async function getJson(url) {
    const response = await fetch(url);
    const data = await response.json();

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
    if (error.status === 401) {
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
    const date = appointment?.date;
    return typeof date === "string" ? date.slice(0, 10) : "";
}

function normalizeStatus(appointment) {
    return String(appointment?.status || "").trim().toLowerCase();
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
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = String(value);
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

function renderAppointments() {
    const searchTerm = bookingSearch.value.trim().toLowerCase();
    const upcoming = appointments
        .filter((appointment) => {
            const date = getAppointmentDate(appointment);
            return date >= localDateKey() && !isCancelled(appointment);
        })
        .sort((left, right) =>
            getAppointmentDate(left).localeCompare(getAppointmentDate(right))
        )
        .filter((appointment) => {
            const client =
                typeof appointment.client === "object"
                    ? appointment.client?.name
                    : appointment.client;
            const searchable = [
                client,
                getServiceName(appointment),
                getAppointmentDate(appointment),
                appointment.status
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return searchable.includes(searchTerm);
        });

    appointmentsBody.replaceChildren();

    upcoming.forEach((appointment) => {
        const row = document.createElement("tr");
        const clientCell = document.createElement("td");
        const serviceCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const statusCell = document.createElement("td");

        clientCell.textContent =
            typeof appointment.client === "object"
                ? appointment.client?.name || "Unknown client"
                : appointment.client || appointment.name || "Unknown client";
        serviceCell.textContent = getServiceName(appointment);
        dateCell.textContent = getAppointmentDate(appointment) || "—";
        statusCell.textContent = appointment.status || "Pending";
        row.append(clientCell, serviceCell, dateCell, statusCell);
        appointmentsBody.appendChild(row);
    });

    bookingEmptyState.hidden = upcoming.length > 0;
}

function renderMonthlyTrend() {
    const chart = document.getElementById("activityChart");
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
        bar.setAttribute(
            "aria-label",
            `${month.label}: ${month.count} bookings`
        );

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
    const todayCount = appointments.filter(
        (appointment) =>
            getAppointmentDate(appointment) === today && !isCancelled(appointment)
    ).length;
    const thisMonthCount = appointments.filter(
        (appointment) => getAppointmentDate(appointment).slice(0, 7) === currentMonth
    ).length;

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
    renderAppointments();
}

async function loadProfile() {
    try {
        const data = await getJson("/api/dashboard-data");
        if (data.message === "Unauthorized") {
            window.location.href = "/login";
            return;
        }

        setText("name", data.name || "Photographer");

        document.getElementById("openPortfolioBtn").addEventListener("click", () => {
            window.location.href = `/api/client?id=${encodeURIComponent(data.link)}`;
        });

        document.getElementById("copyProfileBtn").addEventListener(
            "click",
            async (event) => {
                const button = event.currentTarget;
                try {
                    await navigator.clipboard.writeText(
                        `${window.location.origin}/api/client?id=${encodeURIComponent(data.link)}`
                    );
                    button.textContent = "Copied!";
                    window.setTimeout(() => {
                        button.textContent = "Copy Profile Link";
                    }, 2000);
                } catch (error) {
                    console.error("Unable to copy profile link:", error);
                    analyticsStatus.textContent =
                        "Could not copy the profile link. Check clipboard permissions.";
                }
            }
        );
    } catch (error) {
        console.error("Unable to load dashboard profile:", error);
        if (!handleUnauthorized(error)) {
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

        if (!Array.isArray(appointmentData.appointments)) {
            throw new Error("The appointments response is invalid.");
        }
        if (!Array.isArray(serviceData)) {
            throw new Error("The services response is invalid.");
        }

        appointments = appointmentData.appointments;
        services = serviceData;
        renderAnalytics();
        analyticsStatus.textContent = "";
    } catch (error) {
        console.error("Unable to load dashboard analytics:", error);
        if (handleUnauthorized(error)) {
            return;
        }

        analyticsStatus.textContent =
            "Unable to load booking analytics. Refresh the page to try again.";
        bookingEmptyState.hidden = false;
        bookingEmptyState.querySelector("h3").textContent =
            "Bookings could not be loaded";
        bookingEmptyState.querySelector("p").textContent =
            "Please refresh the page and try again.";
    }
}

window.addEventListener("DOMContentLoaded", () => {
    bookingSearch.addEventListener("input", renderAppointments);
    loadProfile();
    loadBusinessAnalytics();
});
