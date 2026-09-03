/* ============================================================
   PROFESSIONAL STUDIO
   BOOKING PAGE JAVASCRIPT
============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       STORAGE
    ========================================================= */

    const SERVICE_STORAGE_KEY = "professionalStudio.services";
    const BOOKING_STORAGE_KEY = "bookings";


    /* =========================================================
       DOM
    ========================================================= */

    const form = document.getElementById("bookingForm");

    const selectedPackageCard =
        document.getElementById("selectedPackageCard");

    const backToService =
        document.getElementById("backToService");

    const multiDateInput =
        document.getElementById("multiDate");

    const dateTimeContainer =
        document.getElementById("dateTimeContainer");

    const totalHoursElement =
        document.getElementById("totalHours");

    const locationInput =
        document.getElementById("location");

    const submitBtn =
        document.getElementById("submitBtn");

    const successPopup =
        document.getElementById("successPopup");

    const summaryService =
        document.getElementById("summaryService");

    const summaryPackage =
        document.getElementById("summaryPackage");

    const summaryPrice =
        document.getElementById("summaryPrice");

    const fullNameInput =
        document.getElementById("fullName");

    const emailInput =
        document.getElementById("email");

    const phoneInput =
        document.getElementById("phone");

    const messageInput =
        document.getElementById("message");

    const honeypotInput =
        document.getElementById("website");


    if (!form) {
        console.error("Booking form not found.");
        return;
    }


    /* =========================================================
       URL PARAMETERS
    ========================================================= */

    const urlParams =
        new URLSearchParams(window.location.search);

    const serviceId =
        urlParams.get("service");

    const packageId =
        urlParams.get("package");


    /* =========================================================
       HELPERS
    ========================================================= */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function formatPrice(price) {

        const numericPrice =
            Number(
                String(price ?? "")
                    .replace(/[₹,\s]/g, "")
            );

        if (Number.isNaN(numericPrice)) {
            return price || "₹0";
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(numericPrice);

    }


    function getServices() {

        try {

            const stored =
                localStorage.getItem(
                    SERVICE_STORAGE_KEY
                );

            const services =
                stored
                    ? JSON.parse(stored)
                    : [];

            return Array.isArray(services)
                ? services
                : [];

        } catch (error) {

            console.error(
                "Unable to load services:",
                error
            );

            return [];

        }

    }


    /* =========================================================
       LOAD SELECTED SERVICE
    ========================================================= */

    const services = getServices();

    const service =
        services.find(function (item) {

            return String(item.id) ===
                String(serviceId);

        });


    let selectedPackage = null;


    if (service && Array.isArray(service.packages)) {

        selectedPackage =
            service.packages.find(function (item) {

                return String(item.id) ===
                    String(packageId);

            });

    }


    /* =========================================================
       INVALID BOOKING
    ========================================================= */

    function showBookingError(title, message) {

        if (!selectedPackageCard) {
            return;
        }

        selectedPackageCard.innerHTML = `
            <div class="package-error">

                <h2>
                    ${escapeHTML(title)}
                </h2>

                <p>
                    ${escapeHTML(message)}
                </p>

                <a href="client.html#services">
                    Back to Services
                </a>

            </div>
        `;

        form.style.display = "none";

    }


    if (!service) {

        showBookingError(
            "Service Not Found",
            "The selected photography service could not be found."
        );

        return;

    }


    if (!service.active) {

        showBookingError(
            "Service Unavailable",
            "This service is currently unavailable for booking."
        );

        return;

    }


    if (!selectedPackage) {

        showBookingError(
            "Package Not Found",
            "The selected package could not be found."
        );

        return;

    }


    /* =========================================================
       BACK TO SERVICE
    ========================================================= */

    if (backToService) {

        backToService.href =
            "service.html?id=" +
            encodeURIComponent(service.id);

    }


    /* =========================================================
       SELECTED PACKAGE CARD
    ========================================================= */

    const packageName =
        selectedPackage.name || "Selected Package";

    const packagePrice =
        formatPrice(selectedPackage.price);

    const packageDescription =
        selectedPackage.description || "";

    const coverage =
        selectedPackage.coverage || "";

    const photos =
        selectedPackage.photos || "";

    const delivery =
        selectedPackage.delivery || "";


    let packageMeta = "";


    if (coverage) {

        packageMeta += `
            <span class="package-meta-item">
                ${escapeHTML(coverage)}
            </span>
        `;

    }


    if (photos) {

        packageMeta += `
            <span class="package-meta-item">
                ${escapeHTML(photos)} Photos
            </span>
        `;

    }


    if (delivery) {

        packageMeta += `
            <span class="package-meta-item">
                ${escapeHTML(delivery)}
            </span>
        `;

    }


    selectedPackageCard.innerHTML = `

        <div class="package-topline">

            <div>

                <p class="package-service">
                    ${escapeHTML(service.name)}
                </p>

                <h2 class="package-name">
                    ${escapeHTML(packageName)}
                </h2>

            </div>

            <div class="package-price">
                ${escapeHTML(packagePrice)}
            </div>

        </div>

        ${
            packageDescription
                ? `
                    <p class="package-description">
                        ${escapeHTML(packageDescription)}
                    </p>
                  `
                : ""
        }

        ${
            packageMeta
                ? `
                    <div class="package-meta">
                        ${packageMeta}
                    </div>
                  `
                : ""
        }

    `;


    /* =========================================================
       SUMMARY
    ========================================================= */

    if (summaryService) {
        summaryService.textContent =
            service.name || "—";
    }

    if (summaryPackage) {
        summaryPackage.textContent =
            packageName;
    }

    if (summaryPrice) {
        summaryPrice.textContent =
            packagePrice;
    }


    /* =========================================================
       MULTI DATE PICKER
    ========================================================= */

    let datePicker = null;


    if (
        multiDateInput &&
        typeof flatpickr === "function"
    ) {

        datePicker =
            flatpickr(
                multiDateInput,
                {
                    mode: "multiple",
                    dateFormat: "d-m-Y",
                    allowInput: false,
                    minDate: "today",

                    onChange:
                        function (selectedDates) {

                            renderDateRows(
                                selectedDates
                            );

                            updateTotalHours();

                        }
                }
            );

    } else if (multiDateInput) {

        console.error(
            "Flatpickr is not loaded."
        );

        multiDateInput.removeAttribute(
            "readonly"
        );

    }


    /* =========================================================
       FORMAT DATE
    ========================================================= */

    function formatDate(date) {

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const year =
            date.getFullYear();

        return `${day}-${month}-${year}`;

    }


    /* =========================================================
       RENDER DATE ROWS
    ========================================================= */

    function renderDateRows(selectedDates) {

        if (!dateTimeContainer) {
            return;
        }

        dateTimeContainer.innerHTML = "";


        selectedDates.forEach(
            function (date, index) {

                const row =
                    document.createElement("div");

                row.className =
                    "date-time-row";

                row.dataset.date =
                    formatDate(date);


                row.innerHTML = `

                    <div class="date-heading">

                        <h3>
                            ${escapeHTML(
                                formatDate(date)
                            )}
                        </h3>

                        <span class="date-label">
                            Date ${index + 1}
                        </span>

                    </div>


                    <div class="time-grid">

                        <div class="time-field">

                            <label>
                                Start Time
                            </label>

                            <input
                                type="time"
                                class="start-time"
                                aria-label="Start time for ${escapeHTML(formatDate(date))}"
                                required>

                        </div>


                        <div class="time-field">

                            <label>
                                End Time
                            </label>

                            <input
                                type="time"
                                class="end-time"
                                aria-label="End time for ${escapeHTML(formatDate(date))}"
                                required>

                        </div>

                    </div>


                    <div class="date-hours">

                        <span>
                            Hours for this date
                        </span>

                        <strong class="hours">
                            0
                        </strong>

                    </div>

                `;


                dateTimeContainer.appendChild(row);


                const startInput =
                    row.querySelector(
                        ".start-time"
                    );

                const endInput =
                    row.querySelector(
                        ".end-time"
                    );


                function calculateHours() {

                    const hoursElement =
                        row.querySelector(
                            ".hours"
                        );


                    if (
                        !startInput.value ||
                        !endInput.value
                    ) {

                        hoursElement.textContent =
                            "0";

                        updateTotalHours();

                        return;

                    }


                    const startParts =
                        startInput.value.split(":");

                    const endParts =
                        endInput.value.split(":");


                    let startMinutes =
                        parseInt(
                            startParts[0],
                            10
                        ) * 60 +
                        parseInt(
                            startParts[1],
                            10
                        );


                    let endMinutes =
                        parseInt(
                            endParts[0],
                            10
                        ) * 60 +
                        parseInt(
                            endParts[1],
                            10
                        );


                    let difference =
                        endMinutes -
                        startMinutes;


                    if (difference < 0) {

                        difference +=
                            24 * 60;

                    }


                    if (difference === 0) {

                        hoursElement.textContent =
                            "Invalid";

                        updateTotalHours();

                        return;

                    }


                    const calculatedHours =
                        difference / 60;


                    hoursElement.textContent =
                        calculatedHours
                            .toFixed(1);


                    updateTotalHours();

                }


                startInput.addEventListener(
                    "change",
                    calculateHours
                );

                endInput.addEventListener(
                    "change",
                    calculateHours
                );

            }
        );


        updateTotalHours();

    }


    /* =========================================================
       TOTAL HOURS
    ========================================================= */

    function updateTotalHours() {

        if (!totalHoursElement) {
            return;
        }


        let total = 0;


        document
            .querySelectorAll(
                ".date-time-row .hours"
            )
            .forEach(
                function (hourElement) {

                    const value =
                        parseFloat(
                            hourElement.textContent
                        );


                    if (!Number.isNaN(value)) {

                        total += value;

                    }

                }
            );


        totalHoursElement.textContent =
            total.toFixed(1);

    }


    /* =========================================================
       AUTOSAVE
    ========================================================= */

    const autosaveFields = [
        fullNameInput,
        emailInput,
        phoneInput,
        locationInput,
        messageInput
    ];


    autosaveFields.forEach(
        function (field) {

            if (!field || !field.id) {
                return;
            }


            try {

                const savedValue =
                    localStorage.getItem(
                        "booking." + field.id
                    );


                if (savedValue !== null) {

                    field.value =
                        savedValue;

                }

            } catch (error) {

                console.error(
                    "Unable to load saved field:",
                    field.id
                );

            }


            function saveField() {

                try {

                    localStorage.setItem(
                        "booking." + field.id,
                        field.value
                    );

                } catch (error) {

                    console.error(
                        "Unable to save field:",
                        field.id
                    );

                }

            }


            field.addEventListener(
                "input",
                saveField
            );

            field.addEventListener(
                "change",
                saveField
            );

        }
    );


    /* =========================================================
       CLEAR AUTOSAVE
    ========================================================= */

    function clearFormStorage() {

        autosaveFields.forEach(
            function (field) {

                if (!field || !field.id) {
                    return;
                }


                try {

                    localStorage.removeItem(
                        "booking." + field.id
                    );

                } catch (error) {

                    console.error(
                        "Unable to clear saved field:",
                        field.id
                    );

                }

            }
        );

    }


    /* =========================================================
       GET DATE DATA
    ========================================================= */

    function getDateData() {

        const rows =
            document.querySelectorAll(
                ".date-time-row"
            );


        const dates = [];


        rows.forEach(
            function (row) {

                const startInput =
                    row.querySelector(
                        ".start-time"
                    );

                const endInput =
                    row.querySelector(
                        ".end-time"
                    );


                dates.push({

                    date:
                        row.dataset.date || "",

                    startTime:
                        startInput
                            ? startInput.value
                            : "",

                    endTime:
                        endInput
                            ? endInput.value
                            : "",

                    hours:
                        row.querySelector(".hours")
                            ? row.querySelector(".hours").textContent
                            : "0"

                });

            }
        );


        return dates;

    }


    /* =========================================================
       VALIDATE DATES
    ========================================================= */

    function validateDates() {

        const dateRows =
            document.querySelectorAll(
                ".date-time-row"
            );


        if (dateRows.length === 0) {

            alert(
                "Please select at least one event date."
            );

            return false;

        }


        for (
            let index = 0;
            index < dateRows.length;
            index++
        ) {

            const row =
                dateRows[index];

            const startInput =
                row.querySelector(
                    ".start-time"
                );

            const endInput =
                row.querySelector(
                    ".end-time"
                );


            if (
                !startInput ||
                !endInput ||
                !startInput.value ||
                !endInput.value
            ) {

                alert(
                    "Please select a start and end time for every date."
                );

                return false;

            }


            if (
                startInput.value ===
                endInput.value
            ) {

                alert(
                    "Start time and end time cannot be the same."
                );

                return false;

            }

        }


        return true;

    }


    /* =========================================================
       FORM SUBMIT
    ========================================================= */

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            /* -----------------------------------------------
               HONEYPOT
            ------------------------------------------------ */

            if (
                honeypotInput &&
                honeypotInput.value.trim() !== ""
            ) {

                return;

            }


            /* -----------------------------------------------
               NAME
            ------------------------------------------------ */

            const name =
                fullNameInput
                    ? fullNameInput.value.trim()
                    : "";


            if (!name) {

                alert(
                    "Please enter your full name."
                );

                if (fullNameInput) {
                    fullNameInput.focus();
                }

                return;

            }


            /* -----------------------------------------------
               EMAIL
            ------------------------------------------------ */

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !email ||
                !emailRegex.test(email)
            ) {

                alert(
                    "Please enter a valid email address."
                );

                if (emailInput) {
                    emailInput.focus();
                }

                return;

            }


            /* -----------------------------------------------
               PHONE
            ------------------------------------------------ */

            const phone =
                phoneInput
                    ? phoneInput.value.trim()
                    : "";


            const cleanPhone =
                phone.replace(
                    /\D/g,
                    ""
                );


            if (
                cleanPhone.length < 10 ||
                cleanPhone.length > 15
            ) {

                alert(
                    "Please enter a valid phone number."
                );

                if (phoneInput) {
                    phoneInput.focus();
                }

                return;

            }


            /* -----------------------------------------------
               LOCATION
            ------------------------------------------------ */

            const location =
                locationInput
                    ? locationInput.value.trim()
                    : "";


            if (!location) {

                alert(
                    "Please enter the session location."
                );

                if (locationInput) {
                    locationInput.focus();
                }

                return;

            }


            /* -----------------------------------------------
               DATES
            ------------------------------------------------ */

            if (!validateDates()) {
                return;
            }


            const dates =
                getDateData();


            /* -----------------------------------------------
               TOTAL HOURS
            ------------------------------------------------ */

            const totalHours =
                totalHoursElement
                    ? totalHoursElement.textContent
                    : "0";


            /* -----------------------------------------------
               NOTES
            ------------------------------------------------ */

            const notes =
                messageInput
                    ? messageInput.value.trim()
                    : "";


            /* -----------------------------------------------
               BOOKING OBJECT
            ------------------------------------------------ */

            const booking = {

                id:
                    "BK-" +
                    Date.now(),

                client:
                    name,

                clientType:
                    "Photography Client",

                phone:
                    phone,

                email:
                    email,

                instagram:
                    "-",

                service:
                    service.name || "",

                serviceType:
                    service.id || "",

                package:
                    packageName,

                packageKey:
                    selectedPackage.id || "",

                packagePrice:
                    packagePrice,

                date:
                    dates.length
                        ? dates[0].date
                        : "",

                time:
                    dates.length
                        ? dates[0].startTime
                        : "",

                dates:
                    dates,

                totalHours:
                    totalHours,

                location:
                    location,

                guests:
                    "",

                status:
                    "Pending",

                payment:
                    "Pending",

                advance:
                    "₹0",

                remaining:
                    packagePrice,

                image:
                    "images/profile.jpg",

                equipment:
                    "",

                notes:
                    notes,

                createdAt:
                    new Date().toISOString()

            };


            /* -----------------------------------------------
               SAVE
            ------------------------------------------------ */

            let bookings = [];


            try {

                const storedBookings =
                    localStorage.getItem(
                        BOOKING_STORAGE_KEY
                    );


                if (storedBookings) {

                    bookings =
                        JSON.parse(
                            storedBookings
                        );

                }


                if (!Array.isArray(bookings)) {

                    bookings = [];

                }

            } catch (error) {

                console.error(
                    "Unable to read bookings:",
                    error
                );

                bookings = [];

            }


            bookings.unshift(
                booking
            );


            try {

                localStorage.setItem(
                    BOOKING_STORAGE_KEY,
                    JSON.stringify(bookings)
                );

            } catch (error) {

                console.error(
                    "Unable to save booking:",
                    error
                );

                alert(
                    "Unable to save your booking request. Please try again."
                );

                return;

            }


            /* -----------------------------------------------
               SUCCESS
            ------------------------------------------------ */

            if (submitBtn) {

                submitBtn.disabled =
                    true;

                submitBtn.textContent =
                    "Booking Submitted ✓";

            }


            if (successPopup) {

                successPopup.style.display =
                    "block";

            }


            clearFormStorage();


            setTimeout(
                function () {

                    if (successPopup) {

                        successPopup.style.display =
                            "none";

                    }


                    form.reset();


                    if (datePicker) {

                        datePicker.clear();

                    }


                    if (dateTimeContainer) {

                        dateTimeContainer.innerHTML =
                            "";

                    }


                    updateTotalHours();


                    if (submitBtn) {

                        submitBtn.disabled =
                            false;

                        submitBtn.textContent =
                            "Submit Booking Request";

                    }

                },
                1800
            );

        }
    );

});