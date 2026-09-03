/* ============================================================
   PROFESSIONAL STUDIO
   BOOKING MANAGEMENT
============================================================ */

const BOOKING_STORAGE_KEY = "bookings";

let bookings = [];
let activeFilter = "all";
let searchTerm = "";

let calendarDate = new Date();
let selectedCalendarDate = null;


/* ============================================================
   ELEMENTS
============================================================ */

const bookingsContainer = document.getElementById("bookingsContainer");
const bookingSearch = document.getElementById("bookingSearch");
const filterTabs = document.getElementById("filterTabs");

const totalBookings = document.getElementById("totalBookings");
const pendingBookings = document.getElementById("pendingBookings");
const confirmedBookings = document.getElementById("confirmedBookings");
const completedBookings = document.getElementById("completedBookings");
const bookingCount = document.getElementById("bookingCount");

const calendarMonth = document.getElementById("calendarMonth");
const calendarGrid = document.getElementById("calendarGrid");
const previousMonth = document.getElementById("previousMonth");
const nextMonth = document.getElementById("nextMonth");
const calendarDetails = document.getElementById("calendarDetails");

const bookingModal = document.getElementById("bookingModal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalBookingId = document.getElementById("modalBookingId");
const modalContent = document.getElementById("modalContent");
const modalActions = document.getElementById("modalActions");


/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    loadBookings();

    renderOverview();
    renderBookings();
    renderCalendar();

    setupEvents();

});


/* ============================================================
   LOAD BOOKINGS
============================================================ */

function loadBookings() {

    try {

        const storedBookings = localStorage.getItem(BOOKING_STORAGE_KEY);

        if (!storedBookings) {
            bookings = [];
            return;
        }

        const parsedBookings = JSON.parse(storedBookings);

        bookings = Array.isArray(parsedBookings)
            ? parsedBookings
            : [];

    } catch (error) {

        console.error("Unable to load bookings:", error);
        bookings = [];

    }

}


/* ============================================================
   SAVE BOOKINGS
============================================================ */

function saveBookings() {

    try {

        localStorage.setItem(
            BOOKING_STORAGE_KEY,
            JSON.stringify(bookings)
        );

    } catch (error) {

        console.error("Unable to save bookings:", error);

    }

}


/* ============================================================
   EVENTS
============================================================ */

function setupEvents() {

    bookingSearch.addEventListener("input", () => {

        searchTerm = bookingSearch.value.trim().toLowerCase();

        renderBookings();

    });


    filterTabs.addEventListener("click", (event) => {

        const button = event.target.closest(".filter-btn");

        if (!button) {
            return;
        }

        activeFilter = button.dataset.filter || "all";

        document
            .querySelectorAll(".filter-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        renderBookings();

    });


    previousMonth.addEventListener("click", () => {

        calendarDate.setMonth(calendarDate.getMonth() - 1);

        selectedCalendarDate = null;

        renderCalendar();

    });


    nextMonth.addEventListener("click", () => {

        calendarDate.setMonth(calendarDate.getMonth() + 1);

        selectedCalendarDate = null;

        renderCalendar();

    });


    closeModal.addEventListener("click", closeBookingModal);


    bookingModal.addEventListener("click", (event) => {

        if (event.target === bookingModal) {
            closeBookingModal();
        }

    });


    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            closeBookingModal();
        }

    });


    window.addEventListener("storage", (event) => {

        if (event.key !== BOOKING_STORAGE_KEY) {
            return;
        }

        loadBookings();

        renderOverview();
        renderBookings();
        renderCalendar();

    });

}


/* ============================================================
   OVERVIEW
============================================================ */

function renderOverview() {

    const total = bookings.length;

    const pending = bookings.filter(
        booking => normalizeStatus(booking.status) === "Pending"
    ).length;

    const confirmed = bookings.filter(
        booking => normalizeStatus(booking.status) === "Confirmed"
    ).length;

    const completed = bookings.filter(
        booking => normalizeStatus(booking.status) === "Completed"
    ).length;


    totalBookings.textContent = total;
    pendingBookings.textContent = pending;
    confirmedBookings.textContent = confirmed;
    completedBookings.textContent = completed;

}


/* ============================================================
   BOOKING FILTER
============================================================ */

function getFilteredBookings() {

    return bookings.filter(booking => {

        const status = normalizeStatus(booking.status);

        const matchesFilter =
            activeFilter === "all" ||
            status === activeFilter;

        if (!matchesFilter) {
            return false;
        }


        if (!searchTerm) {
            return true;
        }


        const searchableText = [
            booking.client,
            booking.name,
            booking.service,
            booking.package,
            booking.email,
            booking.phone,
            booking.location
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


        return searchableText.includes(searchTerm);

    });

}


/* ============================================================
   RENDER BOOKINGS
============================================================ */

function renderBookings() {

    const filteredBookings = getFilteredBookings();

    bookingCount.textContent =
        `${filteredBookings.length} ${
            filteredBookings.length === 1
                ? "booking"
                : "bookings"
        }`;


    if (!filteredBookings.length) {

        bookingsContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">□</div>

                <h3>
                    ${
                        searchTerm || activeFilter !== "all"
                            ? "No matching bookings"
                            : "No bookings yet"
                    }
                </h3>

                <p>
                    ${
                        searchTerm || activeFilter !== "all"
                            ? "Try changing your search or filter."
                            : "Incoming photography bookings will appear here."
                    }
                </p>

            </div>
        `;

        return;
    }


    bookingsContainer.innerHTML = filteredBookings
        .map(createBookingCard)
        .join("");

}


/* ============================================================
   BOOKING CARD
============================================================ */

function createBookingCard(booking) {

    const status = normalizeStatus(booking.status);

    const clientName =
        booking.client ||
        booking.name ||
        "Unknown Client";

    const service =
        booking.service ||
        "Photography Service";

    const packageName =
        booking.package ||
        "Package";

    const price =
        booking.packagePrice ??
        extractPrice(booking.packagePrice) ??
        0;

    const dates = getBookingDates(booking);

    const firstDate = dates[0];

    const dateText = firstDate
        ? formatShortDate(firstDate.date)
        : "Date not provided";

    const timeText = firstDate
        ? formatTimeRange(firstDate.startTime, firstDate.endTime)
        : booking.time || "Time not provided";

    const location =
        booking.location ||
        "Location not provided";

    const initials = getInitials(clientName);


    let actionButtons = `
        <button
            type="button"
            class="action-btn"
            data-action="view"
            data-id="${escapeAttribute(getBookingId(booking))}"
        >
            View Details
        </button>
    `;


    if (status === "Pending") {

        actionButtons += `
            <button
                type="button"
                class="action-btn primary"
                data-action="accept"
                data-id="${escapeAttribute(getBookingId(booking))}"
            >
                Accept
            </button>

            <button
                type="button"
                class="action-btn danger"
                data-action="reject"
                data-id="${escapeAttribute(getBookingId(booking))}"
            >
                Reject
            </button>
        `;

    }


    if (status === "Confirmed") {

        actionButtons += `
            <button
                type="button"
                class="action-btn primary"
                data-action="complete"
                data-id="${escapeAttribute(getBookingId(booking))}"
            >
                Mark Complete
            </button>

            <button
                type="button"
                class="action-btn danger"
                data-action="cancel"
                data-id="${escapeAttribute(getBookingId(booking))}"
            >
                Cancel
            </button>
        `;

    }


    return `
        <article class="booking-card">

            <div class="booking-card-top">

                <div class="booking-main">

                    <h3 class="booking-service">
                        ${escapeHtml(service)}
                    </h3>

                    <p class="booking-package">
                        ${escapeHtml(packageName)}
                    </p>

                </div>

                <span class="status-badge status-${status.toLowerCase()}">
                    ${escapeHtml(status)}
                </span>

            </div>


            <div class="booking-client">

                <div class="client-avatar">
                    ${escapeHtml(initials)}
                </div>

                <div class="client-info">

                    <strong>
                        ${escapeHtml(clientName)}
                    </strong>

                    <span>
                        ${escapeHtml(booking.email || booking.phone || "Client")}
                    </span>

                </div>

            </div>


            <div class="booking-meta">

                <div class="meta-item">

                    <span class="meta-label">
                        Next Session
                    </span>

                    <span class="meta-value">
                        ${escapeHtml(dateText)}
                    </span>

                </div>


                <div class="meta-item">

                    <span class="meta-label">
                        Time
                    </span>

                    <span class="meta-value">
                        ${escapeHtml(timeText)}
                    </span>

                </div>


                <div class="meta-item">

                    <span class="meta-label">
                        Location
                    </span>

                    <span class="meta-value">
                        ${escapeHtml(location)}
                    </span>

                </div>

            </div>


            ${
                dates.length > 1
                    ? `
                        <div class="booking-package">
                            ${dates.length} session dates · ${formatHours(booking.totalHours)}
                        </div>
                    `
                    : ""
            }


            <div class="booking-footer">

                <strong class="booking-price">
                    ${formatCurrency(price)}
                </strong>

                <div class="booking-actions">
                    ${actionButtons}
                </div>

            </div>

        </article>
    `;

}


/* ============================================================
   BOOKING ACTIONS
============================================================ */

document.addEventListener("click", (event) => {

    const button = event.target.closest("[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const bookingId = button.dataset.id;

    if (!bookingId) {
        return;
    }


    if (action === "view") {

        openBookingModal(bookingId);
        return;

    }


    if (action === "accept") {

        updateBookingStatus(
            bookingId,
            "Confirmed"
        );

        return;

    }


    if (action === "reject") {

        updateBookingStatus(
            bookingId,
            "Cancelled"
        );

        return;

    }


    if (action === "complete") {

        updateBookingStatus(
            bookingId,
            "Completed"
        );

        return;

    }


    if (action === "cancel") {

        updateBookingStatus(
            bookingId,
            "Cancelled"
        );

    }

});


/* ============================================================
   UPDATE STATUS
============================================================ */

function updateBookingStatus(bookingId, newStatus) {

    const bookingIndex = bookings.findIndex(
        booking => getBookingId(booking) === bookingId
    );


    if (bookingIndex === -1) {
        return;
    }


    bookings[bookingIndex].status = newStatus;


    if (newStatus === "Confirmed") {

        bookings[bookingIndex].confirmedAt =
            new Date().toISOString();

    }


    if (newStatus === "Completed") {

        bookings[bookingIndex].completedAt =
            new Date().toISOString();

    }


    if (newStatus === "Cancelled") {

        bookings[bookingIndex].cancelledAt =
            new Date().toISOString();

    }


    saveBookings();

    renderOverview();
    renderBookings();
    renderCalendar();

}


/* ============================================================
   BOOKING MODAL
============================================================ */

function openBookingModal(bookingId) {

    const booking = bookings.find(
        item => getBookingId(item) === bookingId
    );


    if (!booking) {
        return;
    }


    const clientName =
        booking.client ||
        booking.name ||
        "Unknown Client";

    const service =
        booking.service ||
        "Photography Service";

    const packageName =
        booking.package ||
        "Package";

    const status =
        normalizeStatus(booking.status);

    const dates =
        getBookingDates(booking);


    modalTitle.textContent = clientName;

    modalBookingId.textContent =
        getBookingId(booking);


    modalContent.innerHTML = `

        <div class="detail-group">

            <div class="detail-group-title">
                CLIENT
            </div>

            <div class="detail-grid">

                <div class="detail-item">
                    <span>Name</span>
                    <strong>${escapeHtml(clientName)}</strong>
                </div>

                <div class="detail-item">
                    <span>Email</span>
                    <strong>${escapeHtml(booking.email || "-")}</strong>
                </div>

                <div class="detail-item">
                    <span>Phone</span>
                    <strong>${escapeHtml(booking.phone || "-")}</strong>
                </div>

                <div class="detail-item">
                    <span>Instagram</span>
                    <strong>${escapeHtml(booking.instagram || "-")}</strong>
                </div>

            </div>

        </div>


        <div class="detail-group">

            <div class="detail-group-title">
                SERVICE
            </div>

            <div class="detail-grid">

                <div class="detail-item">
                    <span>Service</span>
                    <strong>${escapeHtml(service)}</strong>
                </div>

                <div class="detail-item">
                    <span>Package</span>
                    <strong>${escapeHtml(packageName)}</strong>
                </div>

                <div class="detail-item">
                    <span>Package Price</span>
                    <strong>${formatCurrency(booking.packagePrice)}</strong>
                </div>

                <div class="detail-item">
                    <span>Status</span>
                    <strong>${escapeHtml(status)}</strong>
                </div>

            </div>

        </div>


        <div class="detail-group">

            <div class="detail-group-title">
                SESSION DATES
            </div>

            <div class="detail-dates">

                ${
                    dates.length
                        ? dates.map(date => `
                            <div class="detail-date-row">

                                <strong>
                                    ${escapeHtml(
                                        formatLongDate(date.date)
                                    )}
                                </strong>

                                <span>
                                    ${escapeHtml(
                                        formatTimeRange(
                                            date.startTime,
                                            date.endTime
                                        )
                                    )}
                                    ·
                                    ${escapeHtml(
                                        formatHours(
                                            calculateDateHours(
                                                date.startTime,
                                                date.endTime
                                            )
                                        )
                                    )}
                                </span>

                            </div>
                        `).join("")
                        : `
                            <div class="detail-date-row">
                                <strong>Date not provided</strong>
                            </div>
                        `
                }

            </div>

        </div>


        <div class="detail-group">

            <div class="detail-group-title">
                SESSION INFORMATION
            </div>

            <div class="detail-grid">

                <div class="detail-item">
                    <span>Total Hours</span>
                    <strong>
                        ${formatHours(booking.totalHours)}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Location</span>
                    <strong>
                        ${escapeHtml(booking.location || "-")}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Payment</span>
                    <strong>
                        ${escapeHtml(booking.payment || "Pending")}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Remaining</span>
                    <strong>
                        ${escapeHtml(
                            booking.remaining ?? "-"
                        )}
                    </strong>
                </div>

            </div>

        </div>


        ${
            booking.notes
                ? `
                    <div class="detail-group">

                        <div class="detail-group-title">
                            CLIENT NOTES
                        </div>

                        <div class="notes-box">
                            ${escapeHtml(booking.notes)}
                        </div>

                    </div>
                `
                : ""
        }

    `;


    modalActions.innerHTML = "";


    if (status === "Pending") {

        modalActions.innerHTML = `

            <button
                type="button"
                class="action-btn danger"
                data-action="reject"
                data-id="${escapeAttribute(bookingId)}"
            >
                Reject Booking
            </button>

            <button
                type="button"
                class="action-btn primary"
                data-action="accept"
                data-id="${escapeAttribute(bookingId)}"
            >
                Accept Booking
            </button>

        `;

    }


    if (status === "Confirmed") {

        modalActions.innerHTML = `

            <button
                type="button"
                class="action-btn danger"
                data-action="cancel"
                data-id="${escapeAttribute(bookingId)}"
            >
                Cancel Booking
            </button>

            <button
                type="button"
                class="action-btn primary"
                data-action="complete"
                data-id="${escapeAttribute(bookingId)}"
            >
                Mark Completed
            </button>

        `;

    }


    bookingModal.classList.add("open");
    bookingModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

}


/* ============================================================
   CLOSE MODAL
============================================================ */

function closeBookingModal() {

    bookingModal.classList.remove("open");
    bookingModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

}


/* ============================================================
   CALENDAR
============================================================ */

function renderCalendar() {

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();


    calendarMonth.textContent =
        new Intl.DateTimeFormat("en-IN", {
            month: "long",
            year: "numeric"
        }).format(calendarDate);


    calendarGrid.innerHTML = "";


    const firstDay = new Date(
        year,
        month,
        1
    );


    const lastDay = new Date(
        year,
        month + 1,
        0
    );


    const daysInMonth = lastDay.getDate();


    let mondayFirstDay =
        firstDay.getDay() - 1;

    if (mondayFirstDay < 0) {
        mondayFirstDay = 6;
    }


    const previousMonthLastDay =
        new Date(
            year,
            month,
            0
        ).getDate();


    for (let i = mondayFirstDay - 1; i >= 0; i--) {

        const day =
            previousMonthLastDay - i;

        const date =
            new Date(
                year,
                month - 1,
                day
            );

        calendarGrid.appendChild(
            createCalendarDay(
                date,
                true
            )
        );

    }


    for (let day = 1; day <= daysInMonth; day++) {

        const date =
            new Date(
                year,
                month,
                day
            );

        calendarGrid.appendChild(
            createCalendarDay(
                date,
                false
            )
        );

    }


    const remainingCells =
        42 - calendarGrid.children.length;


    for (let day = 1; day <= remainingCells; day++) {

        const date =
            new Date(
                year,
                month + 1,
                day
            );

        calendarGrid.appendChild(
            createCalendarDay(
                date,
                true
            )
        );

    }


    renderCalendarDetails();

}


/* ============================================================
   CALENDAR DAY
============================================================ */

function createCalendarDay(date, otherMonth) {

    const button =
        document.createElement("button");

    button.type = "button";
    button.className = "calendar-day";


    if (otherMonth) {
        button.classList.add("other-month");
    }


    const dateKey =
        getDateKey(date);


    const bookingsForDate =
        getBookingsForDate(dateKey);


    const isToday =
        dateKey === getDateKey(new Date());


    const isSelected =
        selectedCalendarDate === dateKey;


    if (isToday) {
        button.classList.add("today");
    }


    if (bookingsForDate.length) {

        button.classList.add("has-booking");

        if (bookingsForDate.length > 1) {
            button.classList.add("busy-day");
        }

    }


    if (isSelected) {
        button.classList.add("selected");
    }


    const dayNumber =
        document.createElement("span");

    dayNumber.className = "day-number";
    dayNumber.textContent = date.getDate();

    button.appendChild(dayNumber);


    if (bookingsForDate.length) {

        const dots =
            document.createElement("span");

        dots.className = "booking-dots";


        const visibleDots =
            Math.min(
                bookingsForDate.length,
                3
            );


        for (let i = 0; i < visibleDots; i++) {

            const dot =
                document.createElement("span");

            dots.appendChild(dot);

        }


        button.appendChild(dots);

    }


    button.addEventListener("click", () => {

        selectedCalendarDate = dateKey;

        renderCalendar();

    });


    return button;

}


/* ============================================================
   CALENDAR DETAILS
============================================================ */

function renderCalendarDetails() {

    if (!selectedCalendarDate) {

        calendarDetails.innerHTML = `
            <div class="calendar-details-empty">
                <strong>Select a date</strong>
                <p>
                    Booked sessions for that date will appear here.
                </p>
            </div>
        `;

        return;

    }


    const dateBookings =
        getBookingsForDate(
            selectedCalendarDate
        );


    const selectedDate =
        parseDateKey(
            selectedCalendarDate
        );


    const heading =
        formatLongDate(
            selectedDate
        );


    if (!dateBookings.length) {

        calendarDetails.innerHTML = `

            <div class="selected-date-heading">
                <strong>${escapeHtml(heading)}</strong>
                <span class="date-booking-count">
                    Available
                </span>
            </div>

            <div class="calendar-details-empty">
                <p>
                    No bookings are scheduled for this date.
                </p>
            </div>

        `;

        return;

    }


    calendarDetails.innerHTML = `

        <div class="selected-date-heading">

            <strong>
                ${escapeHtml(heading)}
            </strong>

            <span class="date-booking-count">
                ${dateBookings.length}
                ${dateBookings.length === 1 ? "booking" : "bookings"}
            </span>

        </div>


        ${dateBookings.map(booking => {

            const dates =
                getBookingDates(booking);

            const matchingDate =
                dates.find(
                    date =>
                        normalizeDateValue(date.date) ===
                        selectedCalendarDate
                );


            return `

                <div class="calendar-booking">

                    <strong>
                        ${escapeHtml(
                            booking.client ||
                            booking.name ||
                            "Client"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            booking.service ||
                            "Photography"
                        )}
                        ·
                        ${escapeHtml(
                            matchingDate
                                ? formatTimeRange(
                                    matchingDate.startTime,
                                    matchingDate.endTime
                                )
                                : "Time not provided"
                        )}
                    </span>

                    <button
                        type="button"
                        data-calendar-booking="${escapeAttribute(
                            getBookingId(booking)
                        )}"
                    >
                        View booking
                    </button>

                </div>

            `;

        }).join("")}

    `;

}


/* ============================================================
   CALENDAR BOOKING VIEW
============================================================ */

document.addEventListener("click", event => {

    const button =
        event.target.closest(
            "[data-calendar-booking]"
        );


    if (!button) {
        return;
    }


    openBookingModal(
        button.dataset.calendarBooking
    );

});


/* ============================================================
   GET BOOKINGS FOR DATE
============================================================ */

function getBookingsForDate(dateKey) {

    return bookings.filter(booking => {

        const dates =
            getBookingDates(booking);


        return dates.some(date => {

            return normalizeDateValue(
                date.date
            ) === dateKey;

        });

    });

}


/* ============================================================
   GET BOOKING DATES
============================================================ */

function getBookingDates(booking) {

    if (
        Array.isArray(booking.dates) &&
        booking.dates.length
    ) {

        return booking.dates.map(date => ({
            date: date.date || "",
            startTime: date.startTime || "",
            endTime: date.endTime || ""
        }));

    }


    if (booking.date) {

        return [
            {
                date: booking.date,
                startTime: booking.time || "",
                endTime: ""
            }
        ];

    }


    return [];

}


/* ============================================================
   NORMALIZE STATUS
============================================================ */

function normalizeStatus(status) {

    const value =
        String(status || "Pending")
            .trim()
            .toLowerCase();


    if (value === "confirmed") {
        return "Confirmed";
    }

    if (value === "completed") {
        return "Completed";
    }

    if (
        value === "cancelled" ||
        value === "canceled" ||
        value === "rejected"
    ) {
        return "Cancelled";
    }

    return "Pending";

}


/* ============================================================
   BOOKING ID
============================================================ */

function getBookingId(booking) {

    return String(
        booking.id ||
        booking.bookingId ||
        `booking-${bookings.indexOf(booking)}`
    );

}


/* ============================================================
   PRICE
============================================================ */

function extractPrice(value) {

    if (typeof value === "number") {
        return value;
    }


    if (!value) {
        return 0;
    }


    const cleaned =
        String(value)
            .replace(/[₹,\s]/g, "")
            .replace(/[^\d.]/g, "");


    const number =
        Number(cleaned);


    return Number.isFinite(number)
        ? number
        : 0;

}


function formatCurrency(value) {

    const price =
        extractPrice(value);


    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(price);

}


/* ============================================================
   HOURS
============================================================ */

function calculateDateHours(startTime, endTime) {

    if (!startTime || !endTime) {
        return 0;
    }


    const start =
        parseTime(startTime);

    const end =
        parseTime(endTime);


    if (
        start === null ||
        end === null
    ) {
        return 0;
    }


    let difference =
        end - start;


    if (difference < 0) {
        difference += 24 * 60;
    }


    return difference / 60;

}


function parseTime(time) {

    const match =
        String(time)
            .trim()
            .match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
            );


    if (!match) {
        return null;
    }


    let hour =
        Number(match[1]);

    const minute =
        Number(match[2]);

    const period =
        match[3]
            ? match[3].toUpperCase()
            : null;


    if (minute > 59) {
        return null;
    }


    if (period) {

        if (hour < 1 || hour > 12) {
            return null;
        }


        if (period === "AM") {
            hour = hour === 12 ? 0 : hour;
        } else {
            hour = hour === 12 ? 12 : hour + 12;
        }

    }


    if (hour > 23) {
        return null;
    }


    return hour * 60 + minute;

}


function formatHours(hours) {

    const value =
        Number(hours);


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return "Not specified";
    }


    if (Number.isInteger(value)) {
        return `${value} ${value === 1 ? "hour" : "hours"}`;
    }


    return `${value.toFixed(1)} hours`;

}


/* ============================================================
   DATE HELPERS
============================================================ */

function normalizeDateValue(value) {

    if (!value) {
        return "";
    }


    const text =
        String(value).trim();


    let date = null;


    if (/^\d{2}-\d{2}-\d{4}$/.test(text)) {

        const parts =
            text.split("-");

        date =
            new Date(
                Number(parts[2]),
                Number(parts[1]) - 1,
                Number(parts[0])
            );

    } else {

        date =
            new Date(text);

    }


    if (Number.isNaN(date.getTime())) {
        return "";
    }


    return getDateKey(date);

}


function getDateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function parseDateKey(key) {

    const parts =
        String(key)
            .split("-")
            .map(Number);


    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );

}


function formatShortDate(value) {

    const key =
        normalizeDateValue(value);


    if (!key) {
        return "Date not provided";
    }


    const date =
        parseDateKey(key);


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}


function formatLongDate(value) {

    const key =
        normalizeDateValue(value);


    if (!key) {
        return "Date not provided";
    }


    const date =
        parseDateKey(key);


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(date);

}


/* ============================================================
   TIME
============================================================ */

function formatTimeRange(startTime, endTime) {

    if (!startTime && !endTime) {
        return "Time not provided";
    }


    if (!endTime) {
        return startTime;
    }


    return `${startTime} - ${endTime}`;

}


/* ============================================================
   INITIALS
============================================================ */

function getInitials(name) {

    const parts =
        String(name || "Client")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!parts.length) {
        return "C";
    }


    if (parts.length === 1) {
        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


/* ============================================================
   ESCAPE HELPERS
============================================================ */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return escapeHtml(value);

}


/* ============================================================
   BODY SCROLL LOCK CLEANUP
============================================================ */

window.addEventListener("beforeunload", () => {

    document.body.style.overflow = "";

});