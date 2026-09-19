/* =========================================================
   PROFESSIONAL STUDIO
   BOOKING SYSTEM
   booking.js
   Frontend-only booking creation
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =========================================================
       STORAGE
       ========================================================= */

    const SERVICE_STORAGE_KEY = "professionalStudio.services";
    const BOOKING_STORAGE_KEY = "bookings";

    /* =========================================================
       DOM
       ========================================================= */

    const bookingForm = document.getElementById("bookingForm");

    const selectedPackageCard =
        document.getElementById("selectedPackageCard");

    const summaryService =
        document.getElementById("summaryService");

    const summaryPackage =
        document.getElementById("summaryPackage");

    const summaryPrice =
        document.getElementById("summaryPrice");

    const multiDate =
        document.getElementById("multiDate");

    const dateTimeContainer =
        document.getElementById("dateTimeContainer");

    const totalHoursInput =
        document.getElementById("totalHours");

    const submitBtn =
        document.getElementById("submitBtn");

    const successPopup =
        document.getElementById("successPopup");

    const backToService =
        document.getElementById("backToService");

    /* =========================================================
       FORM FIELDS
       ========================================================= */

    const fullName =
        document.getElementById("fullName");

    const email =
        document.getElementById("email");

    const phone =
        document.getElementById("phone");

    const locationInput =
        document.getElementById("location");

    const message =
        document.getElementById("message");

    const honeypot =
        document.getElementById("website");

    /* =========================================================
       URL PARAMETERS
       ========================================================= */

    const params = new URLSearchParams(window.location.search);

    const serviceId =
        params.get("service");

    const packageId =
        params.get("package");

    /* =========================================================
       SELECTED DATA
       ========================================================= */

    let selectedService = null;
    let selectedPackage = null;

    /* =========================================================
       AUTOSAVE
       ========================================================= */

    const AUTOSAVE_FIELDS = [
        fullName,
        email,
        phone,
        locationInput,
        message
    ].filter(Boolean);

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

    function formatPrice(value) {
        if (value === null || value === undefined || value === "") {
            return "₹0";
        }

        if (typeof value === "number") {
            return `₹${value.toLocaleString("en-IN")}`;
        }

        const numericValue = Number(
            String(value).replace(/[^\d.-]/g, "")
        );

        if (Number.isNaN(numericValue)) {
            return String(value);
        }

        return `₹${numericValue.toLocaleString("en-IN")}`;
    }

    function parsePrice(value) {
        if (value === null || value === undefined) {
            return 0;
        }

        const numericValue = Number(
            String(value).replace(/[^\d.-]/g, "")
        );

        return Number.isFinite(numericValue)
            ? numericValue
            : 0;
    }

    function getServices() {
        try {
            const stored =
                localStorage.getItem(SERVICE_STORAGE_KEY);

            if (!stored) {
                return [];
            }

            const parsed = JSON.parse(stored);

            return Array.isArray(parsed)
                ? parsed
                : [];
        } catch (error) {
            console.error(
                "Unable to load services:",
                error
            );

            return [];
        }
    }

    function getServiceId(service) {
        if (!service) {
            return "";
        }

        return String(
            service.id ??
            service.serviceId ??
            service.slug ??
            ""
        );
    }

    function getPackageId(pkg) {
        if (!pkg) {
            return "";
        }

        return String(
            pkg.id ??
            pkg.packageId ??
            pkg.key ??
            pkg.slug ??
            ""
        );
    }

    function getPackageName(pkg) {
        if (!pkg) {
            return "Photography Package";
        }

        return (
            pkg.name ??
            pkg.packageName ??
            pkg.title ??
            "Photography Package"
        );
    }

    function getPackageDescription(pkg) {
        if (!pkg) {
            return "";
        }

        return (
            pkg.description ??
            pkg.shortDescription ??
            ""
        );
    }

    function getPackagePrice(pkg) {
        if (!pkg) {
            return 0;
        }

        return parsePrice(
            pkg.price ??
            pkg.packagePrice ??
            pkg.amount ??
            0
        );
    }

    function getPaymentPlan(pkg) {
        if (!pkg) {
            return null;
        }

        return (
            pkg.paymentPlan ??
            pkg.packagePaymentPlan ??
            pkg.payment ??
            null
        );
    }

    function getPackageCoverage(pkg) {
        if (!pkg) {
            return "";
        }

        return (
            pkg.coverage ??
            pkg.duration ??
            pkg.hours ??
            ""
        );
    }

    function getPackagePhotos(pkg) {
        if (!pkg) {
            return "";
        }

        return (
            pkg.photos ??
            pkg.photoCount ??
            ""
        );
    }

    function getPackageDelivery(pkg) {
        if (!pkg) {
            return "";
        }

        return (
            pkg.delivery ??
            pkg.deliveryTime ??
            ""
        );
    }

    /* =========================================================
       PAYMENT PLAN NORMALIZATION
       ========================================================= */

    function normalizePaymentPlan(plan, packagePrice) {
        const total = Math.max(
            0,
            Number(packagePrice) || 0
        );

        if (!plan || typeof plan !== "object") {
            return {
                type: "full",
                totalAmount: total,
                stages: [
                    {
                        id: "full",
                        name: "Full Payment",
                        amount: total,
                        percentage: 100
                    }
                ]
            };
        }

        const rawType =
            String(
                plan.type ??
                plan.planType ??
                "full"
            ).toLowerCase();

        if (rawType === "advance") {
            let advanceAmount = 0;

            if (
                plan.amount !== undefined ||
                plan.advanceAmount !== undefined ||
                plan.fixedAmount !== undefined
            ) {
                advanceAmount = Number(
                    plan.amount ??
                    plan.advanceAmount ??
                    plan.fixedAmount ??
                    0
                );
            } else if (
                plan.percentage !== undefined ||
                plan.advancePercentage !== undefined
            ) {
                const percentage = Number(
                    plan.percentage ??
                    plan.advancePercentage ??
                    0
                );

                advanceAmount =
                    total * (percentage / 100);
            }

            advanceAmount = Math.min(
                total,
                Math.max(0, advanceAmount)
            );

            return {
                type: "advance",
                totalAmount: total,
                advanceAmount,
                remainingAmount:
                    Math.max(
                        0,
                        total - advanceAmount
                    ),
                stages: [
                    {
                        id: "advance",
                        name: "Booking Advance",
                        amount: advanceAmount,
                        percentage:
                            total > 0
                                ? (advanceAmount / total) * 100
                                : 0
                    },
                    {
                        id: "remaining",
                        name: "Remaining Balance",
                        amount:
                            Math.max(
                                0,
                                total - advanceAmount
                            ),
                        percentage:
                            total > 0
                                ? ((total - advanceAmount) / total) * 100
                                : 0
                    }
                ]
            };
        }

        if (
            rawType === "installments" ||
            rawType === "installment"
        ) {
            const rawStages =
                Array.isArray(plan.stages)
                    ? plan.stages
                    : [];

            const stages = rawStages
                .map((stage, index) => {
                    let amount = 0;

                    if (
                        stage.amount !== undefined ||
                        stage.fixedAmount !== undefined
                    ) {
                        amount = Number(
                            stage.amount ??
                            stage.fixedAmount ??
                            0
                        );
                    } else if (
                        stage.percentage !== undefined
                    ) {
                        amount =
                            total *
                            (Number(stage.percentage) / 100);
                    }

                    amount = Math.max(
                        0,
                        Number.isFinite(amount)
                            ? amount
                            : 0
                    );

                    return {
                        id:
                            stage.id ??
                            `stage-${index + 1}`,
                        name:
                            stage.name ??
                            stage.title ??
                            `Payment ${index + 1}`,
                        amount,
                        percentage:
                            total > 0
                                ? (amount / total) * 100
                                : 0,
                        due:
                            stage.due ??
                            stage.dueDate ??
                            stage.label ??
                            ""
                    };
                })
                .filter(stage => stage.amount > 0);

            if (stages.length) {
                const stageTotal =
                    stages.reduce(
                        (sum, stage) =>
                            sum + stage.amount,
                        0
                    );

                /*
                 * If the configured installment amounts do not
                 * exactly equal the package price, preserve the
                 * package price as the authoritative total.
                 *
                 * This avoids creating a booking whose payment
                 * schedule silently exceeds or falls below the
                 * actual package price.
                 */
                if (
                    Math.abs(stageTotal - total) > 0.01 &&
                    total > 0
                ) {
                    const lastStage =
                        stages[stages.length - 1];

                    lastStage.amount = Math.max(
                        0,
                        lastStage.amount +
                            (total - stageTotal)
                    );

                    lastStage.percentage =
                        total > 0
                            ? (lastStage.amount / total) * 100
                            : 0;
                }

                return {
                    type: "installments",
                    totalAmount: total,
                    stages
                };
            }
        }

        return {
            type: "full",
            totalAmount: total,
            stages: [
                {
                    id: "full",
                    name: "Full Payment",
                    amount: total,
                    percentage: 100
                }
            ]
        };
    }

    /* =========================================================
       PAYMENT STATE
       ========================================================= */

    function initializePaymentState(
        booking,
        paymentPlan
    ) {
        const total =
            parsePrice(booking.packagePrice);

        const normalizedPlan =
            normalizePaymentPlan(
                paymentPlan,
                total
            );

        booking.paymentPlan =
            normalizedPlan;

        if (!Array.isArray(booking.paymentRecords)) {
            booking.paymentRecords = [];
        }

        if (
            booking.amountPaid === undefined ||
            booking.amountPaid === null
        ) {
            if (
                booking.paid !== undefined &&
                booking.paid !== null
            ) {
                booking.amountPaid =
                    parsePrice(booking.paid);
            } else {
                booking.amountPaid = 0;
            }
        }

        booking.amountPaid = Math.min(
            total,
            Math.max(
                0,
                Number(booking.amountPaid) || 0
            )
        );

        booking.remainingAmount = Math.max(
            0,
            total - booking.amountPaid
        );

        if (booking.amountPaid <= 0) {
            booking.paymentStatus = "Pending";
        } else if (
            booking.remainingAmount <= 0.01
        ) {
            booking.paymentStatus = "Paid";
        } else {
            booking.paymentStatus = "Partially Paid";
        }

        /*
         * Keep legacy fields because older frontend screens
         * may still read them.
         */
        booking.payment =
            booking.paymentStatus;

        booking.advance =
            booking.amountPaid > 0
                ? formatPrice(booking.amountPaid)
                : "₹0";

        booking.remaining =
            formatPrice(booking.remainingAmount);

        return booking;
    }

    /* =========================================================
       LOAD SELECTED SERVICE + PACKAGE
       ========================================================= */

    function loadSelectedPackage() {
        const services = getServices();

        if (!serviceId || !packageId) {
            showSelectionError(
                "The selected service or package is missing."
            );
            return false;
        }

        selectedService =
            services.find(service => {
                const currentId =
                    getServiceId(service);

                return (
                    currentId === String(serviceId) &&
                    service.active !== false
                );
            });

        if (!selectedService) {
            showSelectionError(
                "The selected photography service could not be found or is no longer available."
            );
            return false;
        }

        const packages =
            Array.isArray(selectedService.packages)
                ? selectedService.packages
                : [];

        selectedPackage =
            packages.find(pkg => {
                return (
                    getPackageId(pkg) ===
                    String(packageId)
                );
            });

        if (!selectedPackage) {
            showSelectionError(
                "The selected package could not be found."
            );
            return false;
        }

        renderSelectedPackage();

        return true;
    }

    /* =========================================================
       PACKAGE CARD
       ========================================================= */

    function renderSelectedPackage() {
        if (!selectedPackageCard) {
            return;
        }

        const serviceName =
            selectedService.name ??
            selectedService.title ??
            "Photography Service";

        const packageName =
            getPackageName(selectedPackage);

        const packagePrice =
            getPackagePrice(selectedPackage);

        const description =
            getPackageDescription(selectedPackage);

        const coverage =
            getPackageCoverage(selectedPackage);

        const photos =
            getPackagePhotos(selectedPackage);

        const delivery =
            getPackageDelivery(selectedPackage);

        selectedPackageCard.innerHTML = `
            <div class="selected-package-inner">

                <div class="selected-package-label">
                    SELECTED PACKAGE
                </div>

                <div class="selected-package-service">
                    ${escapeHTML(serviceName)}
                </div>

                <h2 class="selected-package-name">
                    ${escapeHTML(packageName)}
                </h2>

                ${
                    description
                        ? `
                            <p class="selected-package-description">
                                ${escapeHTML(description)}
                            </p>
                        `
                        : ""
                }

                <div class="selected-package-price">
                    ${formatPrice(packagePrice)}
                </div>

                ${
                    coverage ||
                    photos ||
                    delivery
                        ? `
                            <div class="selected-package-meta">

                                ${
                                    coverage
                                        ? `
                                            <div class="package-meta-item">
                                                <span>Coverage</span>
                                                <strong>
                                                    ${escapeHTML(coverage)}
                                                </strong>
                                            </div>
                                        `
                                        : ""
                                }

                                ${
                                    photos
                                        ? `
                                            <div class="package-meta-item">
                                                <span>Photos</span>
                                                <strong>
                                                    ${escapeHTML(photos)}
                                                </strong>
                                            </div>
                                        `
                                        : ""
                                }

                                ${
                                    delivery
                                        ? `
                                            <div class="package-meta-item">
                                                <span>Delivery</span>
                                                <strong>
                                                    ${escapeHTML(delivery)}
                                                </strong>
                                            </div>
                                        `
                                        : ""
                                }

                            </div>
                        `
                        : ""
                }

            </div>
        `;

        if (summaryService) {
            summaryService.textContent =
                serviceName;
        }

        if (summaryPackage) {
            summaryPackage.textContent =
                packageName;
        }

        if (summaryPrice) {
            summaryPrice.textContent =
                formatPrice(packagePrice);
        }
    }

    /* =========================================================
       ERROR STATE
       ========================================================= */

    function showSelectionError(messageText) {
        if (selectedPackageCard) {
            selectedPackageCard.innerHTML = `
                <div class="selected-package-inner">
                    <div class="selected-package-label">
                        BOOKING ERROR
                    </div>

                    <h2 class="selected-package-name">
                        Unable to load package
                    </h2>

                    <p class="selected-package-description">
                        ${escapeHTML(messageText)}
                    </p>
                </div>
            `;
        }

        if (bookingForm) {
            bookingForm.style.display = "none";
        }

        if (submitBtn) {
            submitBtn.disabled = true;
        }
    }

    /* =========================================================
       BACK TO SERVICE
       ========================================================= */

    if (backToService) {
        backToService.addEventListener(
            "click",
            event => {
                event.preventDefault();

                if (!selectedService) {
                    window.location.href =
                        "client.html";

                    return;
                }

                const id =
                    encodeURIComponent(
                        getServiceId(selectedService)
                    );

                window.location.href =
                    `service.html?id=${id}`;
            }
        );
    }

    /* =========================================================
       FLATPICKR
       ========================================================= */

    let datePicker = null;

    function initializeDatePicker() {
        if (
            !multiDate ||
            typeof flatpickr === "undefined"
        ) {
            console.error(
                "Flatpickr is not available."
            );

            return;
        }

        datePicker = flatpickr(
            multiDate,
            {
                mode: "multiple",
                dateFormat: "d-m-Y",
                minDate: "today",
                allowInput: false,

                onChange(selectedDates) {
                    renderDateTimeRows(
                        selectedDates
                    );

                    updateTotalHours();
                }
            }
        );
    }

    /* =========================================================
       DATE FORMAT
       ========================================================= */

    function formatDateForStorage(date) {
        if (!(date instanceof Date)) {
            return "";
        }

        const day =
            String(date.getDate()).padStart(
                2,
                "0"
            );

        const month =
            String(date.getMonth() + 1).padStart(
                2,
                "0"
            );

        const year =
            date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    function formatDateLong(dateString) {
        if (!dateString) {
            return "";
        }

        const parts =
            String(dateString).split("-");

        if (parts.length === 3) {
            const day =
                Number(parts[0]);

            const month =
                Number(parts[1]) - 1;

            const year =
                Number(parts[2]);

            const parsed =
                new Date(
                    year,
                    month,
                    day
                );

            if (!Number.isNaN(parsed.getTime())) {
                return parsed.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );
            }
        }

        const parsed =
            new Date(dateString);

        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
        }

        return dateString;
    }

    /* =========================================================
       DATE / TIME ROWS
       ========================================================= */

    function renderDateTimeRows(selectedDates) {
        if (!dateTimeContainer) {
            return;
        }

        dateTimeContainer.innerHTML = "";

        if (!selectedDates.length) {
            return;
        }

        selectedDates.forEach(
            (date, index) => {
                const dateValue =
                    formatDateForStorage(date);

                const row =
                    document.createElement("div");

                row.className =
                    "date-time-row";

                row.dataset.date =
                    dateValue;

                row.innerHTML = `
                    <div class="date-time-date">
                        <span class="date-label">
                            ${escapeHTML(
                                formatDateLong(
                                    dateValue
                                )
                            )}
                        </span>
                    </div>

                    <div class="date-time-fields">

                        <div class="time-field">
                            <label for="startTime_${index}">
                                Start Time
                            </label>

                            <input
                                type="time"
                                id="startTime_${index}"
                                class="start-time"
                                aria-label="Start time for ${escapeHTML(dateValue)}"
                            >
                        </div>

                        <div class="time-separator">
                            to
                        </div>

                        <div class="time-field">
                            <label for="endTime_${index}">
                                End Time
                            </label>

                            <input
                                type="time"
                                id="endTime_${index}"
                                class="end-time"
                                aria-label="End time for ${escapeHTML(dateValue)}"
                            >
                        </div>

                        <div class="hours-display">
                            <span class="hours-label">
                                Hours
                            </span>

                            <strong class="hours">
                                0
                            </strong>
                        </div>

                    </div>
                `;

                dateTimeContainer.appendChild(
                    row
                );

                const startInput =
                    row.querySelector(
                        ".start-time"
                    );

                const endInput =
                    row.querySelector(
                        ".end-time"
                    );

                if (startInput) {
                    startInput.addEventListener(
                        "change",
                        () => {
                            updateRowHours(row);
                            updateTotalHours();
                        }
                    );
                }

                if (endInput) {
                    endInput.addEventListener(
                        "change",
                        () => {
                            updateRowHours(row);
                            updateTotalHours();
                        }
                    );
                }
            }
        );
    }

    /* =========================================================
       TIME CALCULATION
       ========================================================= */

    function timeToMinutes(value) {
        if (!value) {
            return null;
        }

        const parts =
            String(value).split(":");

        if (parts.length !== 2) {
            return null;
        }

        const hours =
            Number(parts[0]);

        const minutes =
            Number(parts[1]);

        if (
            !Number.isInteger(hours) ||
            !Number.isInteger(minutes) ||
            hours < 0 ||
            hours > 23 ||
            minutes < 0 ||
            minutes > 59
        ) {
            return null;
        }

        return (
            hours * 60 +
            minutes
        );
    }

    function calculateHours(
        startValue,
        endValue
    ) {
        const start =
            timeToMinutes(startValue);

        const end =
            timeToMinutes(endValue);

        if (
            start === null ||
            end === null
        ) {
            return 0;
        }

        /*
         * A photography session cannot silently become
         * a next-day session simply because the user picked
         * an end time earlier than the start time.
         *
         * Overnight sessions should be represented explicitly
         * by a future dedicated option rather than guessed.
         */
        if (end <= start) {
            return 0;
        }

        return (
            (end - start) / 60
        );
    }

    function updateRowHours(row) {
        if (!row) {
            return 0;
        }

        const startInput =
            row.querySelector(
                ".start-time"
            );

        const endInput =
            row.querySelector(
                ".end-time"
            );

        const hoursElement =
            row.querySelector(
                ".hours"
            );

        const hours =
            calculateHours(
                startInput?.value,
                endInput?.value
            );

        if (hoursElement) {
            hoursElement.textContent =
                hours
                    ? Number(hours.toFixed(2))
                    : "0";
        }

        return hours;
    }

    function updateTotalHours() {
        if (!dateTimeContainer) {
            return 0;
        }

        const rows =
            dateTimeContainer.querySelectorAll(
                ".date-time-row"
            );

        let total = 0;

        rows.forEach(row => {
            total += updateRowHours(row);
        });

        total = Number(
            total.toFixed(2)
        );

        if (totalHoursInput) {
            totalHoursInput.value =
                total;
        }

        return total;
    }

    /* =========================================================
       GET DATE DATA
       ========================================================= */

    function getDateData() {
        if (!dateTimeContainer) {
            return [];
        }

        const rows =
            dateTimeContainer.querySelectorAll(
                ".date-time-row"
            );

        return Array.from(rows)
            .map(row => {
                const startInput =
                    row.querySelector(
                        ".start-time"
                    );

                const endInput =
                    row.querySelector(
                        ".end-time"
                    );

                const date =
                    row.dataset.date || "";

                const start =
                    startInput?.value || "";

                const end =
                    endInput?.value || "";

                const hours =
                    calculateHours(
                        start,
                        end
                    );

                return {
                    date,
                    start,
                    end,
                    time:
                        start && end
                            ? `${start} - ${end}`
                            : "",
                    hours
                };
            });
    }

    /* =========================================================
       VALIDATION
       ========================================================= */

    function showFieldError(
        element,
        messageText
    ) {
        if (!element) {
            return;
        }

        element.setCustomValidity(
            messageText
        );

        element.reportValidity();

        element.focus();

        setTimeout(() => {
            element.setCustomValidity("");
        }, 50);
    }

    function validateDates() {
        const dateData =
            getDateData();

        if (!dateData.length) {
            if (multiDate) {
                showFieldError(
                    multiDate,
                    "Please select at least one session date."
                );
            }

            return false;
        }

        for (
            let index = 0;
            index < dateData.length;
            index++
        ) {
            const item =
                dateData[index];

            const row =
                dateTimeContainer.querySelectorAll(
                    ".date-time-row"
                )[index];

            const startInput =
                row?.querySelector(
                    ".start-time"
                );

            const endInput =
                row?.querySelector(
                    ".end-time"
                );

            if (!item.start) {
                showFieldError(
                    startInput,
                    "Please select a start time."
                );

                return false;
            }

            if (!item.end) {
                showFieldError(
                    endInput,
                    "Please select an end time."
                );

                return false;
            }

            const start =
                timeToMinutes(
                    item.start
                );

            const end =
                timeToMinutes(
                    item.end
                );

            if (
                start === null ||
                end === null
            ) {
                showFieldError(
                    startInput,
                    "Please enter a valid time."
                );

                return false;
            }

            if (end <= start) {
                showFieldError(
                    endInput,
                    "End time must be later than start time."
                );

                return false;
            }

            if (item.hours <= 0) {
                showFieldError(
                    endInput,
                    "Please select a valid session duration."
                );

                return false;
            }
        }

        return true;
    }

    function validateClientDetails() {
        const name =
            fullName?.value.trim() || "";

        if (!name) {
            showFieldError(
                fullName,
                "Please enter your full name."
            );

            return false;
        }

        const emailValue =
            email?.value.trim() || "";

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailValue ||
            !emailPattern.test(emailValue)
        ) {
            showFieldError(
                email,
                "Please enter a valid email address."
            );

            return false;
        }

        const phoneValue =
            phone?.value.trim() || "";

        const phoneDigits =
            phoneValue.replace(
                /\D/g,
                ""
            );

        if (
            phoneDigits.length < 10 ||
            phoneDigits.length > 15
        ) {
            showFieldError(
                phone,
                "Please enter a valid phone number."
            );

            return false;
        }

        const locationValue =
            locationInput?.value.trim() || "";

        if (!locationValue) {
            showFieldError(
                locationInput,
                "Please enter the session location."
            );

            return false;
        }

        return true;
    }

    /* =========================================================
       AUTOSAVE
       ========================================================= */

    function autosaveField(field) {
        if (!field) {
            return;
        }

        try {
            localStorage.setItem(
                `booking.${field.id}`,
                field.value
            );
        } catch (error) {
            console.warn(
                "Unable to autosave booking field:",
                error
            );
        }
    }

    function restoreAutosavedFields() {
        AUTOSAVE_FIELDS.forEach(field => {
            try {
                const saved =
                    localStorage.getItem(
                        `booking.${field.id}`
                    );

                if (
                    saved !== null &&
                    !field.value
                ) {
                    field.value = saved;
                }
            } catch (error) {
                console.warn(
                    "Unable to restore booking field:",
                    error
                );
            }
        });
    }

    function clearAutosavedFields() {
        AUTOSAVE_FIELDS.forEach(field => {
            try {
                localStorage.removeItem(
                    `booking.${field.id}`
                );
            } catch (error) {
                console.warn(
                    "Unable to clear booking autosave:",
                    error
                );
            }
        });
    }

    AUTOSAVE_FIELDS.forEach(field => {
        field.addEventListener(
            "input",
            () => autosaveField(field)
        );

        field.addEventListener(
            "change",
            () => autosaveField(field)
        );
    });

    restoreAutosavedFields();

    /* =========================================================
       BUILD BOOKING
       ========================================================= */

    function createBooking() {
        const dates =
            getDateData();

        const firstDate =
            dates[0] || {};

        const packagePrice =
            getPackagePrice(
                selectedPackage
            );

        const paymentPlan =
            normalizePaymentPlan(
                getPaymentPlan(
                    selectedPackage
                ),
                packagePrice
            );

        const bookingId =
            `BK-${Date.now()}`;

        const serviceName =
            selectedService.name ??
            selectedService.title ??
            "Photography Service";

        const packageName =
            getPackageName(
                selectedPackage
            );

        const totalHours =
            Number(
                dates
                    .reduce(
                        (sum, item) =>
                            sum +
                            Number(item.hours || 0),
                        0
                    )
                    .toFixed(2)
            );

        const booking = {
            /* ---------------------------------------------
               Identity
               --------------------------------------------- */

            id: bookingId,

            bookingId,

            /* ---------------------------------------------
               Client
               --------------------------------------------- */

            client:
                fullName?.value.trim() || "",

            clientType:
                "Photography Client",

            email:
                email?.value.trim() || "",

            phone:
                phone?.value.trim() || "",

            instagram:
                "-",

            /* ---------------------------------------------
               Service
               --------------------------------------------- */

            service:
                serviceName,

            serviceId:
                getServiceId(
                    selectedService
                ),

            /*
             * Keep the existing field names too.
             * This makes the booking compatible with
             * earlier versions of Booking Management.
             */
            serviceType:
                getServiceId(
                    selectedService
                ),

            /* ---------------------------------------------
               Package
               --------------------------------------------- */

            package:
                packageName,

            packageId:
                getPackageId(
                    selectedPackage
                ),

            packageKey:
                getPackageId(
                    selectedPackage
                ),

            packagePrice,

            /* ---------------------------------------------
               Payment
               --------------------------------------------- */

            paymentPlan,

            paymentRecords: [],

            amountPaid: 0,

            remainingAmount:
                packagePrice,

            paymentStatus:
                "Pending",

            /*
             * Legacy-compatible fields.
             */
            payment:
                "Pending",

            advance:
                "₹0",

            remaining:
                formatPrice(
                    packagePrice
                ),

            /* ---------------------------------------------
               Session
               --------------------------------------------- */

            date:
                firstDate.date || "",

            time:
                firstDate.time || "",

            dates,

            totalHours,

            location:
                locationInput?.value.trim() || "",

            guests:
                "",

            /* ---------------------------------------------
               Booking status
               --------------------------------------------- */

            status:
                "Pending",

            /* ---------------------------------------------
               Extra information
               --------------------------------------------- */

            image:
                "images/profile.jpg",

            equipment:
                "",

            notes:
                message?.value.trim() || "",

            /* ---------------------------------------------
               Timestamps
               --------------------------------------------- */

            createdAt:
                new Date().toISOString()
        };

        /*
         * Run through the same payment-state initializer
         * used by the photographer management system.
         */
        initializePaymentState(
            booking,
            paymentPlan
        );

        return booking;
    }

    /* =========================================================
       SAVE BOOKING
       ========================================================= */

    function saveBooking(booking) {
        let bookings = [];

        try {
            const stored =
                localStorage.getItem(
                    BOOKING_STORAGE_KEY
                );

            if (stored) {
                const parsed =
                    JSON.parse(stored);

                if (Array.isArray(parsed)) {
                    bookings = parsed;
                }
            }
        } catch (error) {
            console.error(
                "Unable to read existing bookings:",
                error
            );
        }

        bookings.unshift(
            booking
        );

        try {
            localStorage.setItem(
                BOOKING_STORAGE_KEY,
                JSON.stringify(bookings)
            );

            return true;
        } catch (error) {
            console.error(
                "Unable to save booking:",
                error
            );

            return false;
        }
    }

    /* =========================================================
       SUCCESS STATE
       ========================================================= */

    function showSuccess(bookingId) {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent =
                "Booking Submitted ✓";
        }

        if (successPopup) {
            successPopup.classList.add(
                "active"
            );

            /*
             * Support either a normal success popup
             * or a popup containing a booking ID element.
             */
            const popupBookingId =
                successPopup.querySelector(
                    "[data-booking-id]"
                );

            if (popupBookingId) {
                popupBookingId.textContent =
                    bookingId;
            }
        }
    }

    /* =========================================================
       SUBMIT
       ========================================================= */

    if (bookingForm) {
        bookingForm.addEventListener(
            "submit",
            event => {
                event.preventDefault();

                /*
                 * Honeypot.
                 * Real users should never interact with this.
                 */
                if (
                    honeypot &&
                    honeypot.value.trim()
                ) {
                    return;
                }

                if (
                    !selectedService ||
                    !selectedPackage
                ) {
                    showSelectionError(
                        "The selected service or package is unavailable."
                    );

                    return;
                }

                if (
                    !validateClientDetails()
                ) {
                    return;
                }

                if (
                    !validateDates()
                ) {
                    return;
                }

                updateTotalHours();

                const booking =
                    createBooking();

                const saved =
                    saveBooking(
                        booking
                    );

                if (!saved) {
                    alert(
                        "Your booking could not be saved. Please try again."
                    );

                    return;
                }

                clearAutosavedFields();

                showSuccess(
                    booking.id
                );

                /*
                 * Give the user a moment to see the
                 * successful submission state before
                 * opening the booking status page.
                 */
                setTimeout(() => {
                    window.location.href =
                        `bookingStatus.html?id=${encodeURIComponent(
                            booking.id
                        )}`;
                }, 1200);
            }
        );
    }

    /* =========================================================
       INITIALIZATION
       ========================================================= */

    const packageLoaded =
        loadSelectedPackage();

    if (packageLoaded) {
        initializeDatePicker();
    }
});