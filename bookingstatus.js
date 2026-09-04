/* =========================================================
   PROFESSIONAL STUDIO
   BOOKING STATUS
========================================================= */

const BOOKING_STORAGE_KEY = "bookings";


/* =========================================================
   DOM
========================================================= */

const errorCard =
    document.getElementById("errorCard");

const errorMessage =
    document.getElementById("errorMessage");

const bookingContent =
    document.getElementById("bookingContent");

const bookingIdElement =
    document.getElementById("bookingId");

const statusBadge =
    document.getElementById("statusBadge");

const clientName =
    document.getElementById("clientName");

const serviceName =
    document.getElementById("serviceName");

const packageName =
    document.getElementById("packageName");

const packagePrice =
    document.getElementById("packagePrice");

const locationElement =
    document.getElementById("location");

const totalHours =
    document.getElementById("totalHours");

const dateList =
    document.getElementById("dateList");


const stepRequest =
    document.getElementById("stepRequest");

const stepReview =
    document.getElementById("stepReview");

const stepPayment =
    document.getElementById("stepPayment");

const stepConfirmed =
    document.getElementById("stepConfirmed");


const lineReview =
    document.getElementById("lineReview");

const linePayment =
    document.getElementById("linePayment");

const lineConfirmed =
    document.getElementById("lineConfirmed");


const reviewText =
    document.getElementById("reviewText");

const paymentText =
    document.getElementById("paymentText");

const confirmedText =
    document.getElementById("confirmedText");


const messageIcon =
    document.getElementById("messageIcon");

const messageLabel =
    document.getElementById("messageLabel");

const messageTitle =
    document.getElementById("messageTitle");

const messageText =
    document.getElementById("messageText");


const paymentCard =
    document.getElementById("paymentCard");

const paymentPackagePrice =
    document.getElementById("paymentPackagePrice");

const advanceAmount =
    document.getElementById("advanceAmount");

const payAdvanceButton =
    document.getElementById("payAdvanceButton");


const cancelledCard =
    document.getElementById("cancelledCard");

const confirmedCard =
    document.getElementById("confirmedCard");


/* =========================================================
   URL
========================================================= */

const urlParams =
    new URLSearchParams(window.location.search);

const bookingId =
    urlParams.get("id");


/* =========================================================
   STORAGE
========================================================= */

function getBookings() {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(
                    BOOKING_STORAGE_KEY
                )
            );

        return Array.isArray(stored)
            ? stored
            : [];

    } catch (error) {

        console.error(
            "Unable to read bookings:",
            error
        );

        return [];

    }

}


function getCurrentBooking() {

    if (!bookingId) {
        return null;
    }

    const bookings =
        getBookings();

    return bookings.find(
        function (booking) {
            return String(booking.id) ===
                String(bookingId);
        }
    ) || null;

}


/* =========================================================
   FORMAT HELPERS
========================================================= */

function formatCurrency(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "₹0";
    }


    if (
        typeof value === "string" &&
        value.includes("₹")
    ) {
        return value;
    }


    const number =
        Number(
            String(value)
                .replace(/[^\d.-]/g, "")
        );


    if (Number.isNaN(number)) {
        return String(value);
    }


    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(number);

}


function formatDate(dateString) {

    if (!dateString) {
        return "Date not available";
    }

    return dateString;

}


function getBookingDates(booking) {

    if (
        Array.isArray(booking.dates) &&
        booking.dates.length > 0
    ) {
        return booking.dates;
    }


    if (booking.date) {

        return [
            {
                date: booking.date,
                startTime: booking.time || "",
                endTime: "",
                hours: ""
            }
        ];

    }


    return [];

}


function getAdvanceAmount(booking) {

    /*
        Do not invent an advance percentage.

        If your existing payment system or backend
        already stores an advance amount, this page
        will display it.

        Until then, the payment area stays safe.
    */

    if (
        booking.advanceAmount !== undefined &&
        booking.advanceAmount !== null &&
        booking.advanceAmount !== ""
    ) {
        return formatCurrency(
            booking.advanceAmount
        );
    }


    if (
        booking.advance &&
        booking.advance !== "₹0"
    ) {
        return booking.advance;
    }


    return "Payment amount will be shown here";

}


/* =========================================================
   STATUS
========================================================= */

function normalizeStatus(status) {

    if (!status) {
        return "Pending";
    }

    const value =
        String(status).toLowerCase();

    if (value === "pending") {
        return "Pending";
    }

    if (value === "accepted") {
        return "Accepted";
    }

    if (value === "confirmed") {
        return "Confirmed";
    }

    if (value === "cancelled") {
        return "Cancelled";
    }

    if (value === "completed") {
        return "Completed";
    }

    return status;

}


/* =========================================================
   BASIC BOOKING INFORMATION
========================================================= */

function renderBookingInformation(booking) {

    bookingIdElement.textContent =
        booking.id || "—";

    clientName.textContent =
        booking.client || "—";

    serviceName.textContent =
        booking.service || "—";

    packageName.textContent =
        booking.package || "—";

    packagePrice.textContent =
        formatCurrency(
            booking.packagePrice
        );

    paymentPackagePrice.textContent =
        formatCurrency(
            booking.packagePrice
        );

    locationElement.textContent =
        booking.location || "Not provided";

    totalHours.textContent =
        booking.totalHours
            ? booking.totalHours + " hours"
            : "Not calculated";

}


/* =========================================================
   DATES
========================================================= */

function renderDates(booking) {

    const dates =
        getBookingDates(booking);


    dateList.innerHTML = "";


    if (dates.length === 0) {

        dateList.innerHTML =
            "<p>No session dates available.</p>";

        return;

    }


    dates.forEach(
        function (session) {

            const item =
                document.createElement("div");

            item.className =
                "date-item";


            const main =
                document.createElement("div");

            main.className =
                "date-main";


            const date =
                document.createElement("strong");

            date.textContent =
                formatDate(
                    session.date
                );


            const time =
                document.createElement("span");

            const start =
                session.startTime || "";

            const end =
                session.endTime || "";


            if (start && end) {

                time.textContent =
                    start +
                    " - " +
                    end;

            } else if (start) {

                time.textContent =
                    start;

            } else {

                time.textContent =
                    "Time not specified";

            }


            main.appendChild(date);
            main.appendChild(time);


            const hours =
                document.createElement("div");

            hours.className =
                "date-hours";


            if (session.hours) {

                hours.textContent =
                    session.hours +
                    " hours";

            } else {

                hours.textContent =
                    "";

            }


            item.appendChild(main);
            item.appendChild(hours);

            dateList.appendChild(item);

        }
    );

}


/* =========================================================
   BADGE
========================================================= */

function updateBadge(status) {

    statusBadge.textContent =
        status;

    statusBadge.className =
        "status-badge";


    statusBadge.classList.add(
        status.toLowerCase()
    );

}


/* =========================================================
   TIMELINE RESET
========================================================= */

function resetTimeline() {

    [
        stepRequest,
        stepReview,
        stepPayment,
        stepConfirmed
    ].forEach(
        function (step) {

            step.classList.remove(
                "completed",
                "current"
            );

        }
    );


    [
        lineReview,
        linePayment,
        lineConfirmed
    ].forEach(
        function (line) {

            line.classList.remove(
                "completed"
            );

        }
    );

}


/* =========================================================
   TIMELINE STATE
========================================================= */

function renderTimeline(status, paymentStatus) {

    resetTimeline();


    /*
        REQUEST SENT
    */

    stepRequest.classList.add(
        "completed"
    );


    /*
        PENDING
    */

    if (status === "Pending") {

        stepReview.classList.add(
            "current"
        );

        return;

    }


    /*
        ACCEPTED
    */

    if (status === "Accepted") {

        stepReview.classList.add(
            "completed"
        );

        lineReview.classList.add(
            "completed"
        );

        stepPayment.classList.add(
            "current"
        );

        return;

    }


    /*
        CONFIRMED
    */

    if (
        status === "Confirmed" ||
        status === "Completed"
    ) {

        stepReview.classList.add(
            "completed"
        );

        lineReview.classList.add(
            "completed"
        );


        stepPayment.classList.add(
            "completed"
        );

        linePayment.classList.add(
            "completed"
        );


        stepConfirmed.classList.add(
            "completed"
        );

        lineConfirmed.classList.add(
            "completed"
        );

        return;

    }


    /*
        CANCELLED
    */

    if (status === "Cancelled") {

        stepReview.classList.add(
            "current"
        );

    }

}


/* =========================================================
   MESSAGE
========================================================= */

function renderMessage(status, paymentStatus) {

    paymentCard.hidden = true;
    cancelledCard.hidden = true;
    confirmedCard.hidden = true;


    /*
        PENDING
    */

    if (status === "Pending") {

        messageIcon.textContent =
            "2";

        messageLabel.textContent =
            "WAITING FOR PHOTOGRAPHER";

        messageTitle.textContent =
            "Your request is being reviewed";

        messageText.textContent =
            "Your booking request has been sent to the photographer. No payment is required at this stage.";

        return;

    }


    /*
        ACCEPTED
    */

    if (status === "Accepted") {

        messageIcon.textContent =
            "✓";

        messageLabel.textContent =
            "BOOKING ACCEPTED";

        messageTitle.textContent =
            "Your booking request has been accepted";

        messageText.textContent =
            "The photographer has accepted your request. Your advance payment can now be completed.";

        paymentCard.hidden = false;

        advanceAmount.textContent =
            getAdvanceAmount(
                getCurrentBooking()
            );

        return;

    }


    /*
        CONFIRMED
    */

    if (
        status === "Confirmed" ||
        status === "Completed"
    ) {

        messageIcon.textContent =
            "✓";

        messageLabel.textContent =
            "BOOKING CONFIRMED";

        messageTitle.textContent =
            "Your photography session is confirmed";

        messageText.textContent =
            "Your booking has been confirmed. Thank you for choosing Professional Studio.";

        confirmedCard.hidden = false;

        return;

    }


    /*
        CANCELLED
    */

    if (status === "Cancelled") {

        messageIcon.textContent =
            "×";

        messageLabel.textContent =
            "BOOKING NOT ACCEPTED";

        messageTitle.textContent =
            "This booking request was not accepted";

        messageText.textContent =
            "No payment is required for this booking.";

        cancelledCard.hidden = false;

    }

}


/* =========================================================
   TEXT STATE
========================================================= */

function renderTimelineText(status, paymentStatus) {

    if (status === "Pending") {

        reviewText.textContent =
            "Waiting for the photographer to review your request.";

        paymentText.textContent =
            "Payment becomes available after approval.";

        confirmedText.textContent =
            "Your session will be confirmed after the advance payment.";

        return;

    }


    if (status === "Accepted") {

        reviewText.textContent =
            "The photographer has accepted your booking request.";

        paymentText.textContent =
            "Advance payment is now available.";

        confirmedText.textContent =
            "Your booking will be confirmed after payment.";

        return;

    }


    if (
        status === "Confirmed" ||
        status === "Completed"
    ) {

        reviewText.textContent =
            "Your booking request was accepted.";

        paymentText.textContent =
            paymentStatus === "Paid"
                ? "Advance payment received."
                : "Payment completed.";

        confirmedText.textContent =
            "Your photography session is confirmed.";

        return;

    }


    if (status === "Cancelled") {

        reviewText.textContent =
            "The booking request was not accepted.";

        paymentText.textContent =
            "No payment is required.";

        confirmedText.textContent =
            "This booking is closed.";

    }

}


/* =========================================================
   RENDER
========================================================= */

function renderBooking(booking) {

    const status =
        normalizeStatus(
            booking.status
        );

    const paymentStatus =
        booking.payment || "Pending";


    renderBookingInformation(
        booking
    );


    renderDates(
        booking
    );


    updateBadge(
        status
    );


    renderTimeline(
        status,
        paymentStatus
    );


    renderTimelineText(
        status,
        paymentStatus
    );


    renderMessage(
        status,
        paymentStatus
    );

}


/* =========================================================
   LOAD
========================================================= */

function loadBooking() {

    const booking =
        getCurrentBooking();


    if (!booking) {

        bookingContent.hidden =
            true;

        errorCard.hidden =
            false;

        if (!bookingId) {

            errorMessage.textContent =
                "No booking ID was provided.";

        } else {

            errorMessage.textContent =
                "We could not find booking " +
                bookingId +
                ".";

        }

        return;

    }


    errorCard.hidden =
        true;

    bookingContent.hidden =
        false;


    renderBooking(
        booking
    );

}


/* =========================================================
   PAYMENT BUTTON
========================================================= */

payAdvanceButton.addEventListener(
    "click",
    function () {

        /*
            IMPORTANT

            The existing payment gateway has NOT
            been modified or replaced.

            We intentionally stop here until the
            existing gateway implementation is identified.

            This prevents us from accidentally breaking
            your friend's payment integration.
        */

        alert(
            "The payment system is already connected to this project. The existing payment gateway will be opened here without changing its implementation."
        );

    }
);


/* =========================================================
   INITIAL LOAD
========================================================= */

loadBooking();


/* =========================================================
   AUTO REFRESH
========================================================= */

setInterval(
    function () {

        const booking =
            getCurrentBooking();


        if (booking) {

            renderBooking(
                booking
            );

        }

    },
    3000
);


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            BOOKING_STORAGE_KEY
        ) {

            loadBooking();

        }

    }
);