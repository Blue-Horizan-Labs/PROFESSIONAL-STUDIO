/* ============================================================
   PROFESSIONAL STUDIO
   BOOKING MANAGEMENT
============================================================ */


/* ============================================================
   STORAGE
============================================================ */

const BOOKING_STORAGE_KEY = "bookings";
const SERVICE_STORAGE_KEY = "professionalStudio.services";


/* ============================================================
   STATE
============================================================ */

let bookings = [];
let services = [];

let activeFilter = "all";
let searchTerm = "";

let calendarDate = new Date();
let selectedCalendarDate = null;


/* ============================================================
   ELEMENTS
============================================================ */

const bookingsContainer =
    document.getElementById("bookingsContainer");

const bookingSearch =
    document.getElementById("bookingSearch");

const filterTabs =
    document.getElementById("filterTabs");

const totalBookings =
    document.getElementById("totalBookings");

const pendingBookings =
    document.getElementById("pendingBookings");

const acceptedBookings =
    document.getElementById("acceptedBookings");

const confirmedBookings =
    document.getElementById("confirmedBookings");

const completedBookings =
    document.getElementById("completedBookings");

const bookingCount =
    document.getElementById("bookingCount");

const calendarMonth =
    document.getElementById("calendarMonth");

const calendarGrid =
    document.getElementById("calendarGrid");

const previousMonth =
    document.getElementById("previousMonth");

const nextMonth =
    document.getElementById("nextMonth");

const calendarDetails =
    document.getElementById("calendarDetails");

const bookingModal =
    document.getElementById("bookingModal");

const closeModal =
    document.getElementById("closeModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalBookingId =
    document.getElementById("modalBookingId");

const modalContent =
    document.getElementById("modalContent");

const modalActions =
    document.getElementById("modalActions");


/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    loadServices();
    loadBookings();

    syncBookingPaymentPlans();

    renderOverview();
    renderBookings();
    renderCalendar();

    setupEvents();

});


/* ============================================================
   LOAD SERVICES
============================================================ */

function loadServices() {

    try {

        const storedServices =
            localStorage.getItem(SERVICE_STORAGE_KEY);

        if (!storedServices) {

            services = [];

            return;

        }

        const parsedServices =
            JSON.parse(storedServices);

        services =
            Array.isArray(parsedServices)
                ? parsedServices
                : [];

    } catch (error) {

        console.error(
            "Unable to load services:",
            error
        );

        services = [];

    }

}


/* ============================================================
   LOAD BOOKINGS
============================================================ */

function loadBookings() {

    try {

        const storedBookings =
            localStorage.getItem(
                BOOKING_STORAGE_KEY
            );

        if (!storedBookings) {

            bookings = [];

            return;

        }

        const parsedBookings =
            JSON.parse(storedBookings);

        bookings =
            Array.isArray(parsedBookings)
                ? parsedBookings
                : [];

    } catch (error) {

        console.error(
            "Unable to load bookings:",
            error
        );

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

        console.error(
            "Unable to save bookings:",
            error
        );

    }

}


/* ============================================================
   SYNC PAYMENT PLANS
============================================================ */

function syncBookingPaymentPlans() {

    let changed = false;


    bookings = bookings.map(booking => {

        const service =
            findServiceForBooking(booking);

        const packageData =
            findPackageForBooking(
                booking,
                service
            );


        if (
            packageData &&
            packageData.paymentPlan
        ) {

            const normalizedPlan =
                normalizePaymentPlan(
                    packageData.paymentPlan
                );

            const existingPlan =
                booking.paymentPlan
                    ? JSON.stringify(
                        normalizePaymentPlan(
                            booking.paymentPlan
                        )
                    )
                    : "";

            const currentPlan =
                JSON.stringify(
                    normalizedPlan
                );


            /*
             * Only copy the service package plan
             * when the booking does not already have
             * its own payment plan.
             *
             * This prevents an already-created booking
             * from unexpectedly changing later.
             */

            if (!booking.paymentPlan) {

                booking.paymentPlan =
                    normalizedPlan;

                changed = true;

            }


            if (!booking.packagePrice) {

                booking.packagePrice =
                    extractPrice(
                        packageData.price
                    );

                changed = true;

            }

        }


        ensureBookingPaymentState(
            booking
        );


        return booking;

    });


    if (changed) {
        saveBookings();
    }

}


/* ============================================================
   EVENTS
============================================================ */

function setupEvents() {

    bookingSearch.addEventListener(
        "input",
        () => {

            searchTerm =
                bookingSearch.value
                    .trim()
                    .toLowerCase();

            renderBookings();

        }
    );


    filterTabs.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".filter-btn"
                );

            if (!button) {
                return;
            }

            activeFilter =
                button.dataset.filter || "all";


            document
                .querySelectorAll(
                    ".filter-btn"
                )
                .forEach(btn =>
                    btn.classList.remove(
                        "active"
                    )
                );


            button.classList.add("active");

            renderBookings();

        }
    );


    previousMonth.addEventListener(
        "click",
        () => {

            calendarDate.setMonth(
                calendarDate.getMonth() - 1
            );

            selectedCalendarDate = null;

            renderCalendar();

        }
    );


    nextMonth.addEventListener(
        "click",
        () => {

            calendarDate.setMonth(
                calendarDate.getMonth() + 1
            );

            selectedCalendarDate = null;

            renderCalendar();

        }
    );


    closeModal.addEventListener(
        "click",
        closeBookingModal
    );


    bookingModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                bookingModal
            ) {

                closeBookingModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeBookingModal();

            }

        }
    );


    window.addEventListener(
        "storage",
        event => {

            if (
                event.key !==
                BOOKING_STORAGE_KEY &&
                event.key !==
                SERVICE_STORAGE_KEY
            ) {
                return;
            }


            loadServices();
            loadBookings();

            syncBookingPaymentPlans();

            renderOverview();
            renderBookings();
            renderCalendar();

        }
    );

}


/* ============================================================
   OVERVIEW
============================================================ */

function renderOverview() {

    const total =
        bookings.length;


    const pending =
        bookings.filter(
            booking =>
                normalizeStatus(
                    booking.status
                ) === "Pending"
        ).length;


    const accepted =
        bookings.filter(
            booking =>
                normalizeStatus(
                    booking.status
                ) === "Accepted"
        ).length;


    const confirmed =
        bookings.filter(
            booking =>
                normalizeStatus(
                    booking.status
                ) === "Confirmed"
        ).length;


    const completed =
        bookings.filter(
            booking =>
                normalizeStatus(
                    booking.status
                ) === "Completed"
        ).length;


    totalBookings.textContent =
        total;

    pendingBookings.textContent =
        pending;

    acceptedBookings.textContent =
        accepted;

    confirmedBookings.textContent =
        confirmed;

    completedBookings.textContent =
        completed;

}


/* ============================================================
   FILTER
============================================================ */

function getFilteredBookings() {

    return bookings.filter(
        booking => {

            const status =
                normalizeStatus(
                    booking.status
                );


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


            return searchableText.includes(
                searchTerm
            );

        }
    );

}


/* ============================================================
   RENDER BOOKINGS
============================================================ */

function renderBookings() {

    const filteredBookings =
        getFilteredBookings();


    bookingCount.textContent =
        `${filteredBookings.length} ${
            filteredBookings.length === 1
                ? "booking"
                : "bookings"
        }`;


    if (!filteredBookings.length) {

        bookingsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    □
                </div>

                <h3>
                    ${
                        searchTerm ||
                        activeFilter !== "all"
                            ? "No matching bookings"
                            : "No bookings yet"
                    }
                </h3>

                <p>
                    ${
                        searchTerm ||
                        activeFilter !== "all"
                            ? "Try changing your search or filter."
                            : "Incoming photography bookings will appear here."
                    }
                </p>

            </div>

        `;

        return;

    }


    bookingsContainer.innerHTML =
        filteredBookings
            .map(createBookingCard)
            .join("");

}


/* ============================================================
   BOOKING CARD
============================================================ */

function createBookingCard(booking) {

    const status =
        normalizeStatus(
            booking.status
        );


    ensureBookingPaymentState(
        booking
    );


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
        extractPrice(
            booking.packagePrice
        );


    const dates =
        getBookingDates(
            booking
        );


    const firstDate =
        dates[0];


    const dateText =
        firstDate
            ? formatShortDate(
                firstDate.date
            )
            : "Date not provided";


    const timeText =
        firstDate
            ? formatTimeRange(
                firstDate.startTime,
                firstDate.endTime
            )
            : booking.time ||
              "Time not provided";


    const location =
        booking.location ||
        "Location not provided";


    const initials =
        getInitials(
            clientName
        );


    let actionButtons = `

        <button
            type="button"
            class="action-btn"
            data-action="view"
            data-id="${escapeAttribute(
                getBookingId(booking)
            )}"
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
                data-id="${escapeAttribute(
                    getBookingId(booking)
                )}"
            >
                Accept
            </button>

            <button
                type="button"
                class="action-btn danger"
                data-action="reject"
                data-id="${escapeAttribute(
                    getBookingId(booking)
                )}"
            >
                Reject
            </button>

        `;

    }


    if (status === "Accepted") {

        actionButtons += `

            <button
                type="button"
                class="action-btn danger"
                data-action="cancel"
                data-id="${escapeAttribute(
                    getBookingId(booking)
                )}"
            >
                Cancel
            </button>

        `;

    }


    if (status === "Confirmed") {

        actionButtons += `

            <button
                type="button"
                class="action-btn primary"
                data-action="complete"
                data-id="${escapeAttribute(
                    getBookingId(booking)
                )}"
            >
                Mark Complete
            </button>

            <button
                type="button"
                class="action-btn danger"
                data-action="cancel"
                data-id="${escapeAttribute(
                    getBookingId(booking)
                )}"
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
                        ${escapeHtml(
                            service
                        )}
                    </h3>

                    <p class="booking-package">
                        ${escapeHtml(
                            packageName
                        )}
                    </p>

                </div>


                <span
                    class="status-badge status-${status.toLowerCase()}"
                >
                    ${escapeHtml(status)}
                </span>

            </div>


            <div class="booking-client">

                <div class="client-avatar">
                    ${escapeHtml(
                        initials
                    )}
                </div>


                <div class="client-info">

                    <strong>
                        ${escapeHtml(
                            clientName
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            booking.email ||
                            booking.phone ||
                            "Client"
                        )}
                    </span>

                </div>

            </div>


            <div class="booking-meta">

                <div class="meta-item">

                    <span class="meta-label">
                        Next Session
                    </span>

                    <span class="meta-value">
                        ${escapeHtml(
                            dateText
                        )}
                    </span>

                </div>


                <div class="meta-item">

                    <span class="meta-label">
                        Time
                    </span>

                    <span class="meta-value">
                        ${escapeHtml(
                            timeText
                        )}
                    </span>

                </div>


                <div class="meta-item">

                    <span class="meta-label">
                        Location
                    </span>

                    <span class="meta-value">
                        ${escapeHtml(
                            location
                        )}
                    </span>

                </div>

            </div>


            ${
                dates.length > 1
                    ? `

                        <div class="booking-package">

                            ${dates.length}
                            session dates
                            ·
                            ${formatHours(
                                booking.totalHours
                            )}

                        </div>

                    `
                    : ""
            }


            ${createPaymentSummary(
                booking,
                status
            )}


            <div class="booking-footer">

                <strong class="booking-price">
                    ${formatCurrency(
                        price
                    )}
                </strong>


                <div class="booking-actions">
                    ${actionButtons}
                </div>

            </div>

        </article>

    `;

}


/* ============================================================
   PAYMENT SUMMARY
============================================================ */

function createPaymentSummary(
    booking,
    status
) {

    if (
        status === "Pending" ||
        status === "Cancelled"
    ) {

        return "";

    }


    const payment =
        getPaymentSummary(
            booking
        );


    const paymentStatus =
        payment.status;


    let statusClass =
        "payment-pending";


    if (
        paymentStatus === "Partially Paid"
    ) {

        statusClass =
            "payment-partial";

    }


    if (
        paymentStatus === "Paid"
    ) {

        statusClass =
            "payment-paid";

    }


    let detailText =
        "Waiting for required payment.";


    if (
        paymentStatus === "Paid"
    ) {

        detailText =
            "Required payment completed.";

    } else if (
        paymentStatus === "Partially Paid"
    ) {

        detailText =
            `${formatCurrency(
                payment.remaining
            )} remaining.`;

    } else if (
        payment.nextStage
    ) {

        detailText =
            `${payment.nextStage.name} · ${formatCurrency(
                payment.nextStage.amount
            )}`;

    }


    return `

        <div class="booking-payment-summary">

            <div class="booking-payment-top">

                <span class="booking-payment-label">
                    PAYMENT
                </span>

                <span
                    class="booking-payment-status ${statusClass}"
                >
                    ${escapeHtml(
                        paymentStatus
                    )}
                </span>

            </div>


            <div class="booking-payment-amount">
                ${formatCurrency(
                    payment.paid
                )}
                paid of
                ${formatCurrency(
                    payment.total
                )}
            </div>


            <div class="booking-payment-detail">
                ${escapeHtml(
                    detailText
                )}
            </div>

        </div>

    `;

}


/* ============================================================
   BOOKING ACTIONS
============================================================ */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        const bookingId =
            button.dataset.id;


        if (!bookingId) {
            return;
        }


        if (action === "view") {

            openBookingModal(
                bookingId
            );

            return;

        }


        if (action === "accept") {

            updateBookingStatus(
                bookingId,
                "Accepted"
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

    }
);


/* ============================================================
   UPDATE STATUS
============================================================ */

function updateBookingStatus(
    bookingId,
    newStatus
) {

    const bookingIndex =
        bookings.findIndex(
            booking =>
                getBookingId(
                    booking
                ) === bookingId
        );


    if (bookingIndex === -1) {
        return;
    }


    const booking =
        bookings[bookingIndex];


    booking.status =
        newStatus;


    const now =
        new Date().toISOString();


    if (
        newStatus === "Accepted"
    ) {

        booking.acceptedAt =
            now;


        /*
         * Payment becomes available
         * on the client Booking Status
         * page after acceptance.
         */

        ensureBookingPaymentState(
            booking
        );

        booking.paymentStatus =
            getPaymentSummary(
                booking
            ).status;

    }


    if (
        newStatus === "Completed"
    ) {

        booking.completedAt =
            now;

    }


    if (
        newStatus === "Cancelled"
    ) {

        booking.cancelledAt =
            now;

    }


    saveBookings();

    renderOverview();
    renderBookings();
    renderCalendar();

}


/* ============================================================
   BOOKING MODAL
============================================================ */

function openBookingModal(
    bookingId
) {

    const booking =
        bookings.find(
            item =>
                getBookingId(
                    item
                ) === bookingId
        );


    if (!booking) {
        return;
    }


    ensureBookingPaymentState(
        booking
    );


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
        normalizeStatus(
            booking.status
        );


    const dates =
        getBookingDates(
            booking
        );


    const payment =
        getPaymentSummary(
            booking
        );


    modalTitle.textContent =
        clientName;


    modalBookingId.textContent =
        getBookingId(
            booking
        );


    modalContent.innerHTML = `

        <div class="detail-group">

            <div class="detail-group-title">
                CLIENT
            </div>


            <div class="detail-grid">

                <div class="detail-item">
                    <span>Name</span>
                    <strong>
                        ${escapeHtml(
                            clientName
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <span>Email</span>
                    <strong>
                        ${escapeHtml(
                            booking.email ||
                            "-"
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <span>Phone</span>
                    <strong>
                        ${escapeHtml(
                            booking.phone ||
                            "-"
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <span>Instagram</span>
                    <strong>
                        ${escapeHtml(
                            booking.instagram ||
                            "-"
                        )}
                    </strong>
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
                    <strong>
                        ${escapeHtml(
                            service
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <span>Package</span>
                    <strong>
                        ${escapeHtml(
                            packageName
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <span>Package Price</span>
                    <strong>
                        ${formatCurrency(
                            booking.packagePrice
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <span>Booking Status</span>
                    <strong>
                        ${escapeHtml(
                            status
                        )}
                    </strong>
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
                        ? dates
                            .map(
                                date => `

                                    <div
                                        class="detail-date-row"
                                    >

                                        <strong>
                                            ${escapeHtml(
                                                formatLongDate(
                                                    date.date
                                                )
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

                                `
                            )
                            .join("")
                        : `

                            <div class="detail-date-row">

                                <strong>
                                    Date not provided
                                </strong>

                            </div>

                        `
                }

            </div>

        </div>


        <div class="detail-group">

            <div class="detail-group-title">
                PAYMENT
            </div>


            ${createPaymentProgress(
                booking
            )}

        </div>


        <div class="detail-group">

            <div class="detail-group-title">
                PAYMENT PLAN
            </div>


            ${createPaymentPlanMarkup(
                booking
            )}

        </div>


        <div class="detail-group">

            <div class="detail-group-title">
                SESSION INFORMATION
            </div>


            <div class="detail-grid">

                <div class="detail-item">
                    <span>Total Hours</span>
                    <strong>
                        ${formatHours(
                            booking.totalHours
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <span>Location</span>
                    <strong>
                        ${escapeHtml(
                            booking.location ||
                            "-"
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <span>Payment Status</span>
                    <strong>
                        ${escapeHtml(
                            payment.status
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <span>Remaining</span>
                    <strong>
                        ${formatCurrency(
                            payment.remaining
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
                            ${escapeHtml(
                                booking.notes
                            )}
                        </div>

                    </div>

                `
                : ""
        }

    `;


    modalActions.innerHTML =
        "";


    if (
        status === "Pending"
    ) {

        modalActions.innerHTML = `

            <button
                type="button"
                class="action-btn danger"
                data-action="reject"
                data-id="${escapeAttribute(
                    bookingId
                )}"
            >
                Reject Booking
            </button>


            <button
                type="button"
                class="action-btn primary"
                data-action="accept"
                data-id="${escapeAttribute(
                    bookingId
                )}"
            >
                Accept Booking
            </button>

        `;

    }


    if (
        status === "Accepted"
    ) {

        modalActions.innerHTML = `

            <button
                type="button"
                class="action-btn danger"
                data-action="cancel"
                data-id="${escapeAttribute(
                    bookingId
                )}"
            >
                Cancel Booking
            </button>

        `;

    }


    if (
        status === "Confirmed"
    ) {

        modalActions.innerHTML = `

            <button
                type="button"
                class="action-btn danger"
                data-action="cancel"
                data-id="${escapeAttribute(
                    bookingId
                )}"
            >
                Cancel Booking
            </button>


            <button
                type="button"
                class="action-btn primary"
                data-action="complete"
                data-id="${escapeAttribute(
                    bookingId
                )}"
            >
                Mark Completed
            </button>

        `;

    }


    bookingModal.classList.add(
        "open"
    );

    bookingModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


/* ============================================================
   PAYMENT PROGRESS
============================================================ */

function createPaymentProgress(
    booking
) {

    const payment =
        getPaymentSummary(
            booking
        );


    const percentage =
        payment.total > 0
            ? Math.min(
                100,
                Math.max(
                    0,
                    (
                        payment.paid /
                        payment.total
                    ) * 100
                )
            )
            : 0;


    return `

        <div class="payment-progress-box">

            <div class="payment-progress-heading">

                <strong>
                    ${escapeHtml(
                        payment.status
                    )}
                </strong>

                <span>
                    ${formatCurrency(
                        payment.paid
                    )}
                    /
                    ${formatCurrency(
                        payment.total
                    )}
                </span>

            </div>


            <div class="payment-progress-track">

                <div
                    class="payment-progress-bar"
                    style="width:${percentage}%"
                ></div>

            </div>


            <div class="payment-progress-meta">

                <span>
                    Paid:
                    ${formatCurrency(
                        payment.paid
                    )}
                </span>

                <span>
                    Remaining:
                    ${formatCurrency(
                        payment.remaining
                    )}
                </span>

            </div>

        </div>

    `;

}


/* ============================================================
   PAYMENT PLAN MARKUP
============================================================ */

function createPaymentPlanMarkup(
    booking
) {

    const plan =
        normalizePaymentPlan(
            booking.paymentPlan
        );


    const price =
        extractPrice(
            booking.packagePrice
        );


    const stages =
        getPaymentStages(
            plan,
            price
        );


    if (!stages.length) {

        return `

            <div class="payment-plan-box">

                <div class="payment-plan-header">

                    <strong>
                        Full Payment
                    </strong>

                    <span>
                        ${formatCurrency(
                            price
                        )}
                    </span>

                </div>

            </div>

        `;

    }


    return `

        <div class="payment-plan-box">

            <div class="payment-plan-header">

                <strong>
                    ${escapeHtml(
                        getPaymentPlanTitle(
                            plan
                        )
                    )}
                </strong>

                <span>
                    ${formatCurrency(
                        price
                    )}
                </span>

            </div>


            ${stages
                .map(
                    (stage, index) => {

                        const paid =
                            isStagePaid(
                                booking,
                                index
                            );


                        return `

                            <div
                                class="payment-stage"
                            >

                                <div
                                    class="payment-stage-info"
                                >

                                    <span
                                        class="payment-stage-name"
                                    >
                                        ${escapeHtml(
                                            stage.name
                                        )}
                                    </span>

                                    <span
                                        class="payment-stage-due"
                                    >
                                        ${escapeHtml(
                                            stage.due
                                        )}
                                    </span>

                                </div>


                                <span
                                    class="payment-stage-amount ${
                                        paid
                                            ? "payment-stage-paid"
                                            : "payment-stage-pending"
                                    }"
                                >
                                    ${
                                        paid
                                            ? "✓ "
                                            : ""
                                    }
                                    ${formatCurrency(
                                        stage.amount
                                    )}
                                </span>

                            </div>

                        `;

                    }
                )
                .join("")}

        </div>

    `;

}


/* ============================================================
   CLOSE MODAL
============================================================ */

function closeBookingModal() {

    bookingModal.classList.remove(
        "open"
    );

    bookingModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


/* ============================================================
   CALENDAR
============================================================ */

function renderCalendar() {

    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    calendarMonth.textContent =
        new Intl.DateTimeFormat(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        ).format(
            calendarDate
        );


    calendarGrid.innerHTML =
        "";


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );


    const daysInMonth =
        lastDay.getDate();


    let mondayFirstDay =
        firstDay.getDay() - 1;


    if (
        mondayFirstDay < 0
    ) {

        mondayFirstDay =
            6;

    }


    const previousMonthLastDay =
        new Date(
            year,
            month,
            0
        ).getDate();


    for (
        let i = mondayFirstDay - 1;
        i >= 0;
        i--
    ) {

        const day =
            previousMonthLastDay -
            i;


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


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

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
        42 -
        calendarGrid.children.length;


    for (
        let day = 1;
        day <= remainingCells;
        day++
    ) {

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

function createCalendarDay(
    date,
    otherMonth
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "calendar-day";


    if (otherMonth) {

        button.classList.add(
            "other-month"
        );

    }


    const dateKey =
        getDateKey(
            date
        );


    const bookingsForDate =
        getBookingsForDate(
            dateKey
        );


    const isToday =
        dateKey ===
        getDateKey(
            new Date()
        );


    const isSelected =
        selectedCalendarDate ===
        dateKey;


    if (isToday) {

        button.classList.add(
            "today"
        );

    }


    if (
        bookingsForDate.length
    ) {

        button.classList.add(
            "has-booking"
        );


        if (
            bookingsForDate.length > 1
        ) {

            button.classList.add(
                "busy-day"
            );

        }

    }


    if (isSelected) {

        button.classList.add(
            "selected"
        );

    }


    const dayNumber =
        document.createElement(
            "span"
        );


    dayNumber.className =
        "day-number";


    dayNumber.textContent =
        date.getDate();


    button.appendChild(
        dayNumber
    );


    if (
        bookingsForDate.length
    ) {

        const dots =
            document.createElement(
                "span"
            );


        dots.className =
            "booking-dots";


        const visibleDots =
            Math.min(
                bookingsForDate.length,
                3
            );


        for (
            let i = 0;
            i < visibleDots;
            i++
        ) {

            const dot =
                document.createElement(
                    "span"
                );


            dots.appendChild(
                dot
            );

        }


        button.appendChild(
            dots
        );

    }


    button.addEventListener(
        "click",
        () => {

            selectedCalendarDate =
                dateKey;

            renderCalendar();

        }
    );


    return button;

}


/* ============================================================
   CALENDAR DETAILS
============================================================ */

function renderCalendarDetails() {

    if (
        !selectedCalendarDate
    ) {

        calendarDetails.innerHTML = `

            <div class="calendar-details-empty">

                <strong>
                    Select a date
                </strong>

                <p>
                    Booked sessions for that date
                    will appear here.
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

                <strong>
                    ${escapeHtml(
                        heading
                    )}
                </strong>

                <span
                    class="date-booking-count"
                >
                    Available
                </span>

            </div>


            <div
                class="calendar-details-empty"
            >

                <p>
                    No bookings are scheduled
                    for this date.
                </p>

            </div>

        `;

        return;

    }


    calendarDetails.innerHTML = `

        <div class="selected-date-heading">

            <strong>
                ${escapeHtml(
                    heading
                )}
            </strong>

            <span
                class="date-booking-count"
            >
                ${dateBookings.length}
                ${
                    dateBookings.length === 1
                        ? "booking"
                        : "bookings"
                }
            </span>

        </div>


        ${dateBookings
            .map(
                booking => {

                    const dates =
                        getBookingDates(
                            booking
                        );


                    const matchingDate =
                        dates.find(
                            date =>
                                normalizeDateValue(
                                    date.date
                                ) ===
                                selectedCalendarDate
                        );


                    return `

                        <div
                            class="calendar-booking"
                        >

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
                                ·
                                ${escapeHtml(
                                    normalizeStatus(
                                        booking.status
                                    )
                                )}
                            </span>


                            <button
                                type="button"
                                data-calendar-booking="${escapeAttribute(
                                    getBookingId(
                                        booking
                                    )
                                )}"
                            >
                                View booking
                            </button>

                        </div>

                    `;

                }
            )
            .join("")}

    `;

}


/* ============================================================
   CALENDAR BOOKING VIEW
============================================================ */

document.addEventListener(
    "click",
    event => {

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

    }
);


/* ============================================================
   GET BOOKINGS FOR DATE
============================================================ */

function getBookingsForDate(
    dateKey
) {

    return bookings.filter(
        booking => {

            const dates =
                getBookingDates(
                    booking
                );


            return dates.some(
                date => {

                    return normalizeDateValue(
                        date.date
                    ) === dateKey;

                }
            );

        }
    );

}


/* ============================================================
   GET BOOKING DATES
============================================================ */

function getBookingDates(
    booking
) {

    if (
        Array.isArray(
            booking.dates
        ) &&
        booking.dates.length
    ) {

        return booking.dates.map(
            date => ({

                date:
                    date.date ||
                    "",

                startTime:
                    date.startTime ||
                    "",

                endTime:
                    date.endTime ||
                    ""

            })
        );

    }


    if (
        booking.date
    ) {

        return [

            {

                date:
                    booking.date,

                startTime:
                    booking.time ||
                    "",

                endTime:
                    ""

            }

        ];

    }


    return [];

}


/* ============================================================
   FIND SERVICE
============================================================ */

function findServiceForBooking(
    booking
) {

    if (!services.length) {
        return null;
    }


    if (
        booking.serviceId
    ) {

        const byId =
            services.find(
                service =>
                    String(
                        service.id
                    ) ===
                    String(
                        booking.serviceId
                    )
            );


        if (byId) {
            return byId;
        }

    }


    const serviceName =
        String(
            booking.service ||
            ""
        )
            .trim()
            .toLowerCase();


    if (!serviceName) {
        return null;
    }


    return (
        services.find(
            service =>
                String(
                    service.name ||
                    service.serviceName ||
                    ""
                )
                    .trim()
                    .toLowerCase() ===
                serviceName
        ) ||
        null
    );

}


/* ============================================================
   FIND PACKAGE
============================================================ */

function findPackageForBooking(
    booking,
    service
) {

    if (
        !service ||
        !Array.isArray(
            service.packages
        )
    ) {

        return null;

    }


    if (
        booking.packageId
    ) {

        const byId =
            service.packages.find(
                pkg =>
                    String(
                        pkg.id
                    ) ===
                    String(
                        booking.packageId
                    )
            );


        if (byId) {
            return byId;
        }

    }


    const packageName =
        String(
            booking.package ||
            ""
        )
            .trim()
            .toLowerCase();


    if (!packageName) {
        return null;
    }


    return (
        service.packages.find(
            pkg =>
                String(
                    pkg.name ||
                    pkg.packageName ||
                    ""
                )
                    .trim()
                    .toLowerCase() ===
                packageName
        ) ||
        null
    );

}


/* ============================================================
   PAYMENT PLAN
============================================================ */

function createDefaultPaymentPlan() {

    return {

        type: "full",

        advance: {

            type: "percentage",
            value: 0

        },

        installments: []

    };

}


function normalizePaymentPlan(
    plan
) {

    const defaultPlan =
        createDefaultPaymentPlan();


    if (
        !plan ||
        typeof plan !== "object"
    ) {

        return defaultPlan;

    }


    const type =
        [
            "full",
            "advance",
            "installments"
        ].includes(
            plan.type
        )
            ? plan.type
            : "full";


    const advance =
        plan.advance &&
        typeof plan.advance ===
            "object"
            ? {

                type:
                    plan.advance.type ===
                    "fixed"
                        ? "fixed"
                        : "percentage",

                value:
                    Number(
                        plan.advance.value
                    ) || 0

            }
            : {

                type:
                    "percentage",

                value:
                    0

            };


    const installments =
        Array.isArray(
            plan.installments
        )
            ? plan.installments
                .map(
                    item => ({

                        name:
                            String(
                                item.name ||
                                "Payment Stage"
                            ),

                        type:
                            item.type ===
                            "fixed"
                                ? "fixed"
                                : "percentage",

                        value:
                            Number(
                                item.value
                            ) || 0,

                        due:
                            String(
                                item.due ||
                                item.dueTiming ||
                                "Due as scheduled"
                            )

                    })
                )
            : [];


    return {

        type,

        advance,

        installments

    };

}


/* ============================================================
   PAYMENT STAGES
============================================================ */

function getPaymentStages(
    plan,
    price
) {

    const normalizedPlan =
        normalizePaymentPlan(
            plan
        );


    const packagePrice =
        extractPrice(
            price
        );


    if (
        normalizedPlan.type ===
        "full"
    ) {

        return [

            {

                name:
                    "Full Payment",

                amount:
                    packagePrice,

                due:
                    "Before booking confirmation"

            }

        ];

    }


    if (
        normalizedPlan.type ===
        "advance"
    ) {

        const advanceAmount =
            normalizedPlan.advance.type ===
            "percentage"
                ? packagePrice *
                  normalizedPlan.advance.value /
                  100
                : normalizedPlan.advance.value;


        return [

            {

                name:
                    "Booking Advance",

                amount:
                    Math.min(
                        packagePrice,
                        Math.max(
                            0,
                            advanceAmount
                        )
                    ),

                due:
                    "Required after booking acceptance"

            },

            {

                name:
                    "Remaining Balance",

                amount:
                    Math.max(
                        0,
                        packagePrice -
                        Math.min(
                            packagePrice,
                            Math.max(
                                0,
                                advanceAmount
                            )
                        )
                    ),

                due:
                    "Due later"

            }

        ];

    }


    if (
        normalizedPlan.type ===
        "installments"
    ) {

        return normalizedPlan
            .installments
            .map(
                item => ({

                    name:
                        item.name,

                    amount:
                        item.type ===
                        "percentage"
                            ? packagePrice *
                              item.value /
                              100
                            : item.value,

                    due:
                        item.due

                })
            );

    }


    return [];

}


/* ============================================================
   PAYMENT STATE
============================================================ */

function ensureBookingPaymentState(
    booking
) {

    const price =
        extractPrice(
            booking.packagePrice
        );


    const plan =
        normalizePaymentPlan(
            booking.paymentPlan
        );


    booking.paymentPlan =
        plan;


    if (
        !Array.isArray(
            booking.paymentRecords
        )
    ) {

        booking.paymentRecords =
            [];

    }


    /*
     * Legacy compatibility.
     *
     * Existing booking objects may already
     * contain payment / remaining fields.
     */

    if (
        booking.amountPaid ===
        undefined
    ) {

        booking.amountPaid =
            extractPrice(
                booking.paid
            ) ||
            0;

    }


    booking.amountPaid =
        Math.max(
            0,
            Math.min(
                price,
                extractPrice(
                    booking.amountPaid
                )
            )
        );


    booking.remainingAmount =
        Math.max(
            0,
            price -
            booking.amountPaid
        );


    const summary =
        getPaymentSummary(
            booking
        );


    booking.paymentStatus =
        summary.status;


    return booking;

}


/* ============================================================
   PAYMENT SUMMARY
============================================================ */

function getPaymentSummary(
    booking
) {

    const total =
        extractPrice(
            booking.packagePrice
        );


    const paid =
        Math.max(
            0,
            Math.min(
                total,
                extractPrice(
                    booking.amountPaid
                )
            )
        );


    const remaining =
        Math.max(
            0,
            total -
            paid
        );


    let status =
        "Pending";


    if (
        total <= 0
    ) {

        status =
            "Pending";

    } else if (
        paid >= total
    ) {

        status =
            "Paid";

    } else if (
        paid > 0
    ) {

        status =
            "Partially Paid";

    }


    const plan =
        normalizePaymentPlan(
            booking.paymentPlan
        );


    const stages =
        getPaymentStages(
            plan,
            total
        );


    const nextStage =
        stages.find(
            (
                stage,
                index
            ) =>
                !isStagePaid(
                    booking,
                    index
                )
        ) ||
        null;


    return {

        total,

        paid,

        remaining,

        status,

        stages,

        nextStage

    };

}


/* ============================================================
   STAGE PAYMENT CHECK
============================================================ */

function isStagePaid(
    booking,
    stageIndex
) {

    const stages =
        getPaymentStages(
            booking.paymentPlan,
            booking.packagePrice
        );


    if (
        !stages[stageIndex]
    ) {

        return false;

    }


    const stageAmount =
        stages[stageIndex].amount;


    const paidBeforeStage =
        stages
            .slice(
                0,
                stageIndex
            )
            .reduce(
                (
                    total,
                    stage
                ) =>
                    total +
                    stage.amount,
                0
            );


    const paid =
        extractPrice(
            booking.amountPaid
        );


    return (
        paid >=
        paidBeforeStage +
        stageAmount -
        0.01
    );

}


/* ============================================================
   PAYMENT PLAN TITLE
============================================================ */

function getPaymentPlanTitle(
    plan
) {

    const normalized =
        normalizePaymentPlan(
            plan
        );


    if (
        normalized.type ===
        "advance"
    ) {

        return "Advance Payment";

    }


    if (
        normalized.type ===
        "installments"
    ) {

        return "Custom Installments";

    }


    return "Full Payment";

}


/* ============================================================
   STATUS
============================================================ */

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            "Pending"
        )
            .trim()
            .toLowerCase();


    if (
        value ===
        "accepted"
    ) {

        return "Accepted";

    }


    if (
        value ===
        "confirmed"
    ) {

        return "Confirmed";

    }


    if (
        value ===
        "completed"
    ) {

        return "Completed";

    }


    if (
        value ===
        "cancelled" ||
        value ===
        "canceled" ||
        value ===
        "rejected"
    ) {

        return "Cancelled";

    }


    return "Pending";

}


/* ============================================================
   BOOKING ID
============================================================ */

function getBookingId(
    booking
) {

    return String(

        booking.id ||
        booking.bookingId ||
        `booking-${bookings.indexOf(
            booking
        )}`

    );

}


/* ============================================================
   PRICE
============================================================ */

function extractPrice(
    value
) {

    if (
        typeof value ===
        "number"
    ) {

        return Number.isFinite(
            value
        )
            ? value
            : 0;

    }


    if (!value) {
        return 0;
    }


    const cleaned =
        String(value)
            .replace(
                /[₹,\s]/g,
                ""
            )
            .replace(
                /[^\d.]/g,
                ""
            );


    const number =
        Number(
            cleaned
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


function formatCurrency(
    value
) {

    const price =
        extractPrice(
            value
        );


    return new Intl.NumberFormat(
        "en-IN",
        {

            style:
                "currency",

            currency:
                "INR",

            maximumFractionDigits:
                0

        }
    ).format(
        price
    );

}


/* ============================================================
   HOURS
============================================================ */

function calculateDateHours(
    startTime,
    endTime
) {

    if (
        !startTime ||
        !endTime
    ) {

        return 0;

    }


    const start =
        parseTime(
            startTime
        );


    const end =
        parseTime(
            endTime
        );


    if (
        start === null ||
        end === null
    ) {

        return 0;

    }


    let difference =
        end -
        start;


    if (
        difference < 0
    ) {

        difference +=
            24 * 60;

    }


    return difference /
        60;

}


function parseTime(
    time
) {

    const match =
        String(
            time
        )
            .trim()
            .match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
            );


    if (!match) {
        return null;
    }


    let hour =
        Number(
            match[1]
        );


    const minute =
        Number(
            match[2]
        );


    const period =
        match[3]
            ? match[3]
                .toUpperCase()
            : null;


    if (
        minute > 59
    ) {

        return null;

    }


    if (period) {

        if (
            hour < 1 ||
            hour > 12
        ) {

            return null;

        }


        if (
            period ===
            "AM"
        ) {

            hour =
                hour === 12
                    ? 0
                    : hour;

        } else {

            hour =
                hour === 12
                    ? 12
                    : hour + 12;

        }

    }


    if (
        hour > 23
    ) {

        return null;

    }


    return (
        hour * 60 +
        minute
    );

}


function formatHours(
    hours
) {

    const value =
        Number(
            hours
        );


    if (
        !Number.isFinite(
            value
        ) ||
        value <= 0
    ) {

        return "Not specified";

    }


    if (
        Number.isInteger(
            value
        )
    ) {

        return `${value} ${
            value === 1
                ? "hour"
                : "hours"
        }`;

    }


    return `${value.toFixed(
        1
    )} hours`;

}


/* ============================================================
   DATE HELPERS
============================================================ */

function normalizeDateValue(
    value
) {

    if (!value) {
        return "";
    }


    const text =
        String(
            value
        ).trim();


    let date =
        null;


    if (
        /^\d{2}-\d{2}-\d{4}$/.test(
            text
        )
    ) {

        const parts =
            text.split(
                "-"
            );


        date =
            new Date(

                Number(
                    parts[2]
                ),

                Number(
                    parts[1]
                ) - 1,

                Number(
                    parts[0]
                )

            );

    } else {

        date =
            new Date(
                text
            );

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return getDateKey(
        date
    );

}


function getDateKey(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            );


    const day =
        String(
            date.getDate()
        )
            .padStart(
                2,
                "0"
            );


    return `${year}-${month}-${day}`;

}


function parseDateKey(
    key
) {

    const parts =
        String(
            key
        )
            .split(
                "-"
            )
            .map(
                Number
            );


    return new Date(

        parts[0],

        parts[1] - 1,

        parts[2]

    );

}


function formatShortDate(
    value
) {

    const key =
        normalizeDateValue(
            value
        );


    if (!key) {

        return "Date not provided";

    }


    const date =
        parseDateKey(
            key
        );


    return new Intl.DateTimeFormat(
        "en-IN",
        {

            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"

        }
    ).format(
        date
    );

}


function formatLongDate(
    value
) {

    const key =
        normalizeDateValue(
            value
        );


    if (!key) {

        return "Date not provided";

    }


    const date =
        parseDateKey(
            key
        );


    return new Intl.DateTimeFormat(
        "en-IN",
        {

            weekday:
                "short",

            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"

        }
    ).format(
        date
    );

}


/* ============================================================
   TIME
============================================================ */

function formatTimeRange(
    startTime,
    endTime
) {

    if (
        !startTime &&
        !endTime
    ) {

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

function getInitials(
    name
) {

    const parts =
        String(
            name ||
            "Client"
        )
            .trim()
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    if (!parts.length) {

        return "C";

    }


    if (
        parts.length ===
        1
    ) {

        return parts[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (

        parts[0][0] +

        parts[
            parts.length - 1
        ][0]

    ).toUpperCase();

}


/* ============================================================
   ESCAPE HELPERS
============================================================ */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}


/* ============================================================
   BODY SCROLL LOCK CLEANUP
============================================================ */

window.addEventListener(
    "beforeunload",
    () => {

        document.body.style.overflow =
            "";

    }
);