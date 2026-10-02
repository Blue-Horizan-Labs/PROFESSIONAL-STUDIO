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

    const SERVICE_STORAGE_KEY =
        "professionalStudio.services";

    const BOOKING_STORAGE_KEY =
        "bookings";


    /* =========================================================
       DOM
       ========================================================= */

    const bookingForm =
        document.getElementById("bookingForm");

    const selectedPackageCard =
        document.getElementById(
            "selectedPackageCard"
        );

    const summaryService =
        document.getElementById(
            "summaryService"
        );

    const summaryPackage =
        document.getElementById(
            "summaryPackage"
        );

    const summaryPrice =
        document.getElementById(
            "summaryPrice"
        );

    const multiDate =
        document.getElementById(
            "multiDate"
        );

    const dateTimeContainer =
        document.getElementById(
            "dateTimeContainer"
        );

    const totalHoursInput =
        document.getElementById(
            "totalHours"
        );

    const submitBtn =
        document.getElementById(
            "submitBtn"
        );

    const successPopup =
        document.getElementById(
            "successPopup"
        );

    const backToService =
        document.getElementById(
            "backToService"
        );


    /* =========================================================
       FORM FIELDS
       ========================================================= */

    const fullName =
        document.getElementById(
            "fullName"
        );

    const email =
        document.getElementById(
            "email"
        );

    const phone =
        document.getElementById(
            "phone"
        );

    const guestCount =
        document.getElementById(
            "guestCount"
        );

    const locationInput =
        document.getElementById(
            "location"
        );

    const useCurrentLocationBtn =
        document.getElementById(
            "useCurrentLocationBtn"
        );

    const locationStatus =
        document.getElementById(
            "locationStatus"
        );


    /*
     * GPS information is kept separately from the visible
     * location field.
     *
     * This allows the client to:
     *
     * 1. Use GPS.
     * 2. Edit the location manually afterward.
     * 3. Still have the existing location field work exactly
     *    as it did before.
     */

    let capturedLocation = {
        latitude: null,
        longitude: null,
        source: "manual"
    };


    const message =
        document.getElementById(
            "message"
        );

    const honeypot =
        document.getElementById(
            "website"
        );


    /* =========================================================
       URL PARAMETERS
       ========================================================= */

    const params =
        new URLSearchParams(
            window.location.search
        );

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
        guestCount,
        locationInput,
        message
    ].filter(Boolean);


    /* =========================================================
       CURRENT LOCATION
       ========================================================= */

    function setLocationStatus(
        messageText,
        type = ""
    ) {

        if (!locationStatus) {
            return;
        }

        locationStatus.textContent =
            messageText;

        locationStatus.className =
            `location-status${
                type
                    ? ` ${type}`
                    : ""
            }`;
    }


    function formatCoordinates(
        latitude,
        longitude
    ) {

        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }


    function useCurrentLocation() {

        if (!navigator.geolocation) {

            setLocationStatus(
                "GPS location is not supported by this browser. Please enter the location manually.",
                "error"
            );

            return;
        }


        if (useCurrentLocationBtn) {

            useCurrentLocationBtn.disabled =
                true;

        }


        setLocationStatus(
            "Getting your current location…"
        );


        navigator.geolocation.getCurrentPosition(

            position => {

                const {
                    latitude,
                    longitude,
                    accuracy
                } = position.coords;


                capturedLocation = {

                    latitude,

                    longitude,

                    source:
                        "gps"

                };


                if (locationInput) {

                    locationInput.value =
                        `GPS coordinates: ${formatCoordinates(
                            latitude,
                            longitude
                        )}`;


                    autosaveField(
                        locationInput
                    );


                    /*
                     * Trigger the normal input flow so
                     * anything already listening to the
                     * location field continues working.
                     */

                    locationInput.dispatchEvent(
                        new Event(
                            "input",
                            {
                                bubbles:true
                            }
                        )
                    );

                }


                const accuracyText =
                    Number.isFinite(
                        accuracy
                    )
                        ? ` Accuracy ±${Math.round(
                            accuracy
                        )} m.`
                        : "";


                setLocationStatus(
                    `Current location captured.${accuracyText} You can still edit the location manually.`,
                    "success"
                );


                if (useCurrentLocationBtn) {

                    useCurrentLocationBtn.disabled =
                        false;

                }

            },


            error => {

                capturedLocation = {

                    latitude: null,

                    longitude: null,

                    source:
                        "manual"

                };


                let errorMessage =
                    "Unable to get your current location. Please enter the location manually.";


                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {

                    errorMessage =
                        "Location permission was denied. Please allow location access or enter the location manually.";

                }

                else if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {

                    errorMessage =
                        "Your current location is unavailable. Please try again or enter the location manually.";

                }

                else if (
                    error.code ===
                    error.TIMEOUT
                ) {

                    errorMessage =
                        "Location request timed out. Please try again or enter the location manually.";

                }


                setLocationStatus(
                    errorMessage,
                    "error"
                );


                if (useCurrentLocationBtn) {

                    useCurrentLocationBtn.disabled =
                        false;

                }

            },


            {
                enableHighAccuracy:true,
                timeout:10000,
                maximumAge:0
            }

        );
    }


    if (useCurrentLocationBtn) {

        useCurrentLocationBtn.addEventListener(
            "click",
            useCurrentLocation
        );

    }


    /* =========================================================
       HELPERS
       ========================================================= */

    function escapeHTML(value) {

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


    function formatPrice(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "₹0";

        }


        if (
            typeof value ===
            "number"
        ) {

            return `₹${value.toLocaleString(
                "en-IN"
            )}`;

        }


        const numericValue =
            Number(
                String(value)
                    .replace(
                        /[^\d.-]/g,
                        ""
                    )
            );


        if (
            Number.isNaN(
                numericValue
            )
        ) {

            return String(value);

        }


        return `₹${numericValue.toLocaleString(
            "en-IN"
        )}`;

    }


    function parsePrice(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return 0;

        }


        const numericValue =
            Number(
                String(value)
                    .replace(
                        /[^\d.-]/g,
                        ""
                    )
            );


        return Number.isFinite(
            numericValue
        )
            ? numericValue
            : 0;

    }


    function getServices() {

        try {

            const stored =
                localStorage.getItem(
                    SERVICE_STORAGE_KEY
                );


            if (!stored) {

                return [];

            }


            const parsed =
                JSON.parse(
                    stored
                );


            return Array.isArray(
                parsed
            )
                ? parsed
                : [];

        }

        catch (error) {

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

    function normalizePaymentPlan(
        plan,
        packagePrice
    ) {

        const total =
            Math.max(
                0,
                Number(packagePrice) || 0
            );


        if (
            !plan ||
            typeof plan !== "object"
        ) {

            return {

                type:
                    "full",

                totalAmount:
                    total,

                stages:[
                    {
                        id:
                            "full",

                        name:
                            "Full Payment",

                        amount:
                            total,

                        percentage:
                            100
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


        if (
            rawType ===
            "advance"
        ) {

            let advanceAmount = 0;


            if (
                plan.amount !== undefined ||
                plan.advanceAmount !== undefined ||
                plan.fixedAmount !== undefined
            ) {

                advanceAmount =
                    Number(
                        plan.amount ??
                        plan.advanceAmount ??
                        plan.fixedAmount ??
                        0
                    );

            }

            else if (
                plan.percentage !== undefined ||
                plan.advancePercentage !== undefined
            ) {

                const percentage =
                    Number(
                        plan.percentage ??
                        plan.advancePercentage ??
                        0
                    );


                advanceAmount =
                    total *
                    (
                        percentage /
                        100
                    );

            }


            advanceAmount =
                Math.min(
                    total,
                    Math.max(
                        0,
                        advanceAmount
                    )
                );


            return {

                type:
                    "advance",

                totalAmount:
                    total,

                advanceAmount,

                remainingAmount:
                    Math.max(
                        0,
                        total -
                        advanceAmount
                    ),

                stages:[
                    {
                        id:
                            "advance",

                        name:
                            "Booking Advance",

                        amount:
                            advanceAmount,

                        percentage:
                            total > 0
                                ? (
                                    advanceAmount /
                                    total
                                ) * 100
                                : 0
                    },

                    {
                        id:
                            "remaining",

                        name:
                            "Remaining Balance",

                        amount:
                            Math.max(
                                0,
                                total -
                                advanceAmount
                            ),

                        percentage:
                            total > 0
                                ? (
                                    (
                                        total -
                                        advanceAmount
                                    ) /
                                    total
                                ) * 100
                                : 0
                    }
                ]

            };

        }


        if (
            rawType ===
            "installments" ||
            rawType ===
            "installment"
        ) {

            const rawStages =
                Array.isArray(
                    plan.stages
                )
                    ? plan.stages
                    : [];


            const stages =
                rawStages
                    .map(
                        (
                            stage,
                            index
                        ) => {

                            let amount = 0;


                            if (
                                stage.amount !== undefined ||
                                stage.fixedAmount !== undefined
                            ) {

                                amount =
                                    Number(
                                        stage.amount ??
                                        stage.fixedAmount ??
                                        0
                                    );

                            }

                            else if (
                                stage.percentage !== undefined
                            ) {

                                amount =
                                    total *
                                    (
                                        Number(
                                            stage.percentage
                                        ) /
                                        100
                                    );

                            }


                            amount =
                                Math.max(
                                    0,
                                    Number.isFinite(
                                        amount
                                    )
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
                                        ? (
                                            amount /
                                            total
                                        ) * 100
                                        : 0

                            };

                        }
                    );


            if (
                stages.length === 0
            ) {

                return {

                    type:
                        "full",

                    totalAmount:
                        total,

                    stages:[
                        {
                            id:
                                "full",

                            name:
                                "Full Payment",

                            amount:
                                total,

                            percentage:
                                100
                        }
                    ]

                };

            }


            const stageTotal =
                stages.reduce(
                    (
                        sum,
                        stage
                    ) =>
                        sum +
                        stage.amount,
                    0
                );


            if (
                stageTotal <= 0
            ) {

                stages[0].amount =
                    total;

                stages[0].percentage =
                    100;

            }


            return {

                type:
                    "installments",

                totalAmount:
                    total,

                stages

            };

        }


        return {

            type:
                "full",

            totalAmount:
                total,

            stages:[
                {
                    id:
                        "full",

                    name:
                        "Full Payment",

                    amount:
                        total,

                    percentage:
                        100
                }
            ]

        };

    }


    /* =========================================================
       SERVICE / PACKAGE LOOKUP
       ========================================================= */

    function findSelectedService() {

        const services =
            getServices();


        if (
            !services.length
        ) {

            return null;

        }


        if (
            serviceId
        ) {

            const exact =
                services.find(
                    service =>
                        getServiceId(
                            service
                        ) ===
                        String(
                            serviceId
                        )
                );


            if (
                exact
            ) {

                return exact;

            }

        }


        /*
         * Backward-compatible fallback:
         * If only one service exists, use it.
         */

        if (
            services.length === 1
        ) {

            return services[0];

        }


        return null;

    }


    function getPackagesFromService(
        service
    ) {

        if (!service) {

            return [];

        }


        const possiblePackages =
            service.packages ??
            service.packageList ??
            service.plans ??
            [];


        return Array.isArray(
            possiblePackages
        )
            ? possiblePackages
            : [];

    }


    function findSelectedPackage(
        service
    ) {

        const packages =
            getPackagesFromService(
                service
            );


        if (
            !packages.length
        ) {

            return null;

        }


        if (
            packageId
        ) {

            const exact =
                packages.find(
                    pkg =>
                        getPackageId(
                            pkg
                        ) ===
                        String(
                            packageId
                        )
                );


            if (
                exact
            ) {

                return exact;

            }

        }


        if (
            packages.length === 1
        ) {

            return packages[0];

        }


        return null;

    }


    /* =========================================================
       PACKAGE DISPLAY
       ========================================================= */

    function renderSelectedPackage() {

        if (
            !selectedPackageCard
        ) {

            return;

        }


        if (
            !selectedService ||
            !selectedPackage
        ) {

            selectedPackageCard.innerHTML = `

                <div class="package-error">

                    <h2>
                        Package not found
                    </h2>

                    <p>
                        We could not find the selected
                        service or package. Please return
                        to the services page and select
                        a package again.
                    </p>

                    <a href="client.html">
                        Return to Services
                    </a>

                </div>

            `;

            if (
                submitBtn
            ) {

                submitBtn.disabled =
                    true;

            }

            return;

        }


        const serviceName =
            selectedService.name ??
            selectedService.title ??
            "Photography Service";


        const packageName =
            getPackageName(
                selectedPackage
            );


        const description =
            getPackageDescription(
                selectedPackage
            );


        const price =
            getPackagePrice(
                selectedPackage
            );


        const coverage =
            getPackageCoverage(
                selectedPackage
            );


        const photos =
            getPackagePhotos(
                selectedPackage
            );


        const delivery =
            getPackageDelivery(
                selectedPackage
            );


        const metaItems = [];


        if (
            coverage !== ""
        ) {

            metaItems.push(
                `
                    <span class="package-meta-item">
                        ${escapeHTML(
                            coverage
                        )}
                    </span>
                `
            );

        }


        if (
            photos !== ""
        ) {

            metaItems.push(
                `
                    <span class="package-meta-item">
                        ${escapeHTML(
                            photos
                        )} photos
                    </span>
                `
            );

        }


        if (
            delivery !== ""
        ) {

            metaItems.push(
                `
                    <span class="package-meta-item">
                        Delivery:
                        ${escapeHTML(
                            delivery
                        )}
                    </span>
                `
            );

        }


        selectedPackageCard.innerHTML = `

            <div class="package-topline">

                <div>

                    <p class="package-service">
                        ${escapeHTML(
                            serviceName
                        )}
                    </p>

                    <h2 class="package-name">
                        ${escapeHTML(
                            packageName
                        )}
                    </h2>

                </div>

                <div class="package-price">
                    ${escapeHTML(
                        formatPrice(
                            price
                        )
                    )}
                </div>

            </div>

            ${
                description
                    ? `
                        <p class="package-description">
                            ${escapeHTML(
                                description
                            )}
                        </p>
                    `
                    : ""
            }

            ${
                metaItems.length
                    ? `
                        <div class="package-meta">
                            ${metaItems.join("")}
                        </div>
                    `
                    : ""
            }

        `;


        if (
            summaryService
        ) {

            summaryService.textContent =
                serviceName;

        }


        if (
            summaryPackage
        ) {

            summaryPackage.textContent =
                packageName;

        }


        if (
            summaryPrice
        ) {

            summaryPrice.textContent =
                formatPrice(
                    price
                );

        }

    }


    /* =========================================================
       DATE / TIME HELPERS
       ========================================================= */

    function padTimePart(
        value
    ) {

        return String(
            value
        ).padStart(
            2,
            "0"
        );

    }


    function timeToMinutes(
        time
    ) {

        if (
            !time ||
            typeof time !==
            "string"
        ) {

            return null;

        }


        const parts =
            time.split(":");


        if (
            parts.length < 2
        ) {

            return null;

        }


        const hours =
            Number(
                parts[0]
            );


        const minutes =
            Number(
                parts[1]
            );


        if (
            !Number.isFinite(
                hours
            ) ||
            !Number.isFinite(
                minutes
            )
        ) {

            return null;

        }


        return (
            hours * 60 +
            minutes
        );

    }


    function minutesToTime(
        totalMinutes
    ) {

        let minutes =
            Number(
                totalMinutes
            );


        if (
            !Number.isFinite(
                minutes
            )
        ) {

            return "";

        }


        minutes =
            Math.max(
                0,
                Math.min(
                    1439,
                    Math.round(
                        minutes
                    )
                )
            );


        const hours =
            Math.floor(
                minutes / 60
            );


        const remainder =
            minutes % 60;


        return `${padTimePart(
            hours
        )}:${padTimePart(
            remainder
        )}`;

    }


    /* =========================================================
       12-HOUR TIME UI
       ========================================================= */

    function timeValueToParts(
        timeValue
    ) {

        const fallback = {
            hour: "9",
            minute: "00",
            period: "AM"
        };


        if (
            !timeValue ||
            typeof timeValue !==
            "string"
        ) {

            return fallback;

        }


        const minutes =
            timeToMinutes(
                timeValue
            );


        if (
            minutes === null
        ) {

            return fallback;

        }


        let hour24 =
            Math.floor(
                minutes / 60
            );


        const minute =
            minutes % 60;


        const period =
            hour24 >= 12
                ? "PM"
                : "AM";


        let hour12 =
            hour24 % 12;


        if (
            hour12 === 0
        ) {

            hour12 =
                12;

        }


        const allowedMinutes =
            [
                0,
                15,
                30,
                45
            ];


        let nearestMinute =
            allowedMinutes.reduce(
                (
                    closest,
                    current
                ) =>
                    Math.abs(
                        current -
                        minute
                    ) <
                    Math.abs(
                        closest -
                        minute
                    )
                        ? current
                        : closest,
                allowedMinutes[0]
            );


        /*
         * If the nearest quarter-hour rounds to 60,
         * move to the next hour.
         */

        if (
            nearestMinute ===
                45 &&
            minute >= 53
        ) {

            nearestMinute = 0;

            hour12++;

            if (
                hour12 > 12
            ) {

                hour12 = 1;

            }

        }


        return {

            hour:
                String(
                    hour12
                ),

            minute:
                padTimePart(
                    nearestMinute
                ),

            period

        };

    }


    function buildTimeSelects(
        fieldName,
        currentValue
    ) {

        const parts =
            timeValueToParts(
                currentValue
            );


        const hourOptions =
            Array.from(
                {
                    length:12
                },
                (
                    _,
                    index
                ) => {

                    const hour =
                        index + 1;

                    return `
                        <option
                            value="${hour}"
                            ${
                                String(
                                    hour
                                ) ===
                                parts.hour
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${hour}
                        </option>
                    `;

                }
            ).join("");


        const minuteOptions =
            [
                "00",
                "15",
                "30",
                "45"
            ]
                .map(
                    minute => `
                        <option
                            value="${minute}"
                            ${
                                minute ===
                                parts.minute
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${minute}
                        </option>
                    `
                )
                .join("");


        const periodOptions =
            [
                "AM",
                "PM"
            ]
                .map(
                    period => `
                        <option
                            value="${period}"
                            ${
                                period ===
                                parts.period
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${period}
                        </option>
                    `
                )
                .join("");


        return `

            <div
                class="time-select-group"
                data-time-field="${escapeHTML(
                    fieldName
                )}"
            >

                <select
                    class="time-hour"
                    aria-label="${escapeHTML(
                        fieldName
                    )} hour"
                >
                    ${hourOptions}
                </select>

                <select
                    class="time-minute"
                    aria-label="${escapeHTML(
                        fieldName
                    )} minute"
                >
                    ${minuteOptions}
                </select>

                <select
                    class="time-period"
                    aria-label="${escapeHTML(
                        fieldName
                    )} AM or PM"
                >
                    ${periodOptions}
                </select>

            </div>

        `;

    }


    function readTimeSelects(
        row,
        fieldName
    ) {

        if (
            !row
        ) {

            return "";

        }


        const group =
            row.querySelector(
                `[data-time-field="${fieldName}"]`
            );


        if (
            !group
        ) {

            return "";

        }


        const hourSelect =
            group.querySelector(
                ".time-hour"
            );

        const minuteSelect =
            group.querySelector(
                ".time-minute"
            );

        const periodSelect =
            group.querySelector(
                ".time-period"
            );


        if (
            !hourSelect ||
            !minuteSelect ||
            !periodSelect
        ) {

            return "";

        }


        let hour =
            Number(
                hourSelect.value
            );


        const minute =
            Number(
                minuteSelect.value
            );


        const period =
            periodSelect.value;


        if (
            !Number.isFinite(
                hour
            ) ||
            !Number.isFinite(
                minute
            )
        ) {

            return "";

        }


        if (
            period === "AM"
        ) {

            if (
                hour === 12
            ) {

                hour = 0;

            }

        }

        else {

            if (
                hour !== 12
            ) {

                hour += 12;

            }

        }


        return `${padTimePart(
            hour
        )}:${padTimePart(
            minute
        )}`;

    }


    function calculateHours(
        startTime,
        endTime
    ) {

        const start =
            timeToMinutes(
                startTime
            );

        const end =
            timeToMinutes(
                endTime
            );


        if (
            start === null ||
            end === null
        ) {

            return 0;

        }


        /*
         * If the end time is earlier than the start time,
         * treat it as an overnight session.
         */

        let difference =
            end - start;


        if (
            difference < 0
        ) {

            difference +=
                24 * 60;

        }


        return (
            difference /
            60
        );

    }


    function formatHours(
        hours
    ) {

        const numeric =
            Number(
                hours
            );


        if (
            !Number.isFinite(
                numeric
            )
        ) {

            return "0 hrs";

        }


        if (
            Number.isInteger(
                numeric
            )
        ) {

            return `${numeric} hrs`;

        }


        return `${numeric.toFixed(
            2
        ).replace(
            /\.00$/,
            ""
        )} hrs`;

    }


    /* =========================================================
       DATE ROW RENDERING
       ========================================================= */

    function renderDateTimeRows(
        selectedDates
    ) {

        if (
            !dateTimeContainer
        ) {

            return;

        }


        /*
         * Preserve any existing time values before rebuilding
         * the rows. This matters when the user selects an
         * additional date after already entering times.
         */

        const existingRows =
            Array.from(
                dateTimeContainer.querySelectorAll(
                    ".date-time-row"
                )
            );


        const existingTimes =
            new Map();


        existingRows.forEach(
            row => {

                const date =
                    row.dataset.date;


                if (
                    !date
                ) {

                    return;

                }


                existingTimes.set(
                    date,
                    {
                        start:
                            readTimeSelects(
                                row,
                                "start"
                            ),

                        end:
                            readTimeSelects(
                                row,
                                "end"
                            )
                    }
                );

            }
        );


        dateTimeContainer.innerHTML =
            "";


        if (
            !Array.isArray(
                selectedDates
            ) ||
            !selectedDates.length
        ) {

            updateTotalHours();

            return;

        }


        selectedDates.forEach(
            (
                dateValue,
                index
            ) => {

                const date =
                    normalizeDateValue(
                        dateValue
                    );


                if (
                    !date
                ) {

                    return;

                }


                const previous =
                    existingTimes.get(
                        date
                    );


                const startValue =
                    previous?.start ||
                    "09:00";


                const endValue =
                    previous?.end ||
                    "12:00";


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "date-time-row";


                row.dataset.date =
                    date;


                row.innerHTML = `

                    <div class="date-heading">

                        <div>

                            <span class="date-label">
                                Date ${index + 1}
                            </span>

                            <h3>
                                ${escapeHTML(
                                    formatDateDisplay(
                                        date
                                    )
                                )}
                            </h3>

                        </div>

                    </div>


                    <div class="date-time-fields">

                        <div class="time-field">

                            <label>
                                Start Time
                            </label>

                            ${buildTimeSelects(
                                "start",
                                startValue
                            )}

                        </div>


                        <div class="time-separator">
                            to
                        </div>


                        <div class="time-field">

                            <label>
                                End Time
                            </label>

                            ${buildTimeSelects(
                                "end",
                                endValue
                            )}

                        </div>


                        <div
                            class="hours-display"
                            data-hours-display
                        >

                            <span class="hours-label">
                                Duration
                            </span>

                            <strong>
                                3 hrs
                            </strong>

                        </div>

                    </div>

                `;


                dateTimeContainer.appendChild(
                    row
                );


                const timeGroups =
                    row.querySelectorAll(
                        ".time-select-group select"
                    );


                timeGroups.forEach(
                    select => {

                        select.addEventListener(
                            "change",
                            () => {

                                updateRowHours(
                                    row
                                );

                                updateTotalHours();

                            }
                        );

                    }
                );


                updateRowHours(
                    row
                );

            }
        );


        updateTotalHours();

    }


    function normalizeDateValue(
        dateValue
    ) {

        if (
            !dateValue
        ) {

            return "";

        }


        if (
            dateValue instanceof Date
        ) {

            if (
                Number.isNaN(
                    dateValue.getTime()
                )
            ) {

                return "";

            }


            return [
                dateValue.getFullYear(),
                padTimePart(
                    dateValue.getMonth() + 1
                ),
                padTimePart(
                    dateValue.getDate()
                )
            ].join("-");

        }


        const stringValue =
            String(
                dateValue
            );


        /*
         * Flatpickr date strings are normally YYYY-MM-DD
         * when dateFormat is set accordingly.
         */

        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                stringValue
            )
        ) {

            return stringValue;

        }


        const parsed =
            new Date(
                stringValue
            );


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "";

        }


        return [
            parsed.getFullYear(),
            padTimePart(
                parsed.getMonth() + 1
            ),
            padTimePart(
                parsed.getDate()
            )
        ].join("-");

    }


    function formatDateDisplay(
        dateString
    ) {

        if (
            !dateString
        ) {

            return "";

        }


        const parts =
            dateString.split(
                "-"
            );


        if (
            parts.length !== 3
        ) {

            return dateString;

        }


        const year =
            Number(
                parts[0]
            );

        const month =
            Number(
                parts[1]
            ) - 1;

        const day =
            Number(
                parts[2]
            );


        const date =
            new Date(
                year,
                month,
                day
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return dateString;

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                weekday:
                    "short",

                day:
                    "numeric",

                month:
                    "short",

                year:
                    "numeric"
            }
        );

    }


    function getSelectedDates() {

        if (
            !multiDate
        ) {

            return [];

        }


        if (
            multiDate._flatpickr &&
            Array.isArray(
                multiDate._flatpickr.selectedDates
            )
        ) {

            return multiDate._flatpickr.selectedDates
                .map(
                    normalizeDateValue
                )
                .filter(Boolean);

        }


        if (
            !multiDate.value.trim()
        ) {

            return [];

        }


        return multiDate.value
            .split(",")
            .map(
                value =>
                    normalizeDateValue(
                        value.trim()
                    )
            )
            .filter(Boolean);

    }


    function getDateData() {

        if (
            !dateTimeContainer
        ) {

            return [];

        }


        return Array.from(
            dateTimeContainer.querySelectorAll(
                ".date-time-row"
            )
        )
            .map(
                row => {

                    const start =
                        readTimeSelects(
                            row,
                            "start"
                        );

                    const end =
                        readTimeSelects(
                            row,
                            "end"
                        );


                    return {

                        date:
                            row.dataset.date ||
                            "",

                        startTime:
                            start,

                        endTime:
                            end,

                        hours:
                            calculateHours(
                                start,
                                end
                            )

                    };

                }
            )
            .filter(
                item =>
                    item.date
            );

    }


    function updateRowHours(
        row
    ) {

        if (
            !row
        ) {

            return 0;

        }


        const start =
            readTimeSelects(
                row,
                "start"
            );

        const end =
            readTimeSelects(
                row,
                "end"
            );


        const hours =
            calculateHours(
                start,
                end
            );


        const display =
            row.querySelector(
                "[data-hours-display] strong"
            );


        if (
            display
        ) {

            display.textContent =
                formatHours(
                    hours
                );

        }


        return hours;

    }


    function updateTotalHours() {

        if (
            !dateTimeContainer
        ) {

            return 0;

        }


        const rows =
            Array.from(
                dateTimeContainer.querySelectorAll(
                    ".date-time-row"
                )
            );


        const total =
            rows.reduce(
                (
                    sum,
                    row
                ) =>
                    sum +
                    updateRowHours(
                        row
                    ),
                0
            );


        if (
            totalHoursInput
        ) {

            totalHoursInput.textContent =
                formatHours(
                    total
                );

        }


        return total;

    }


    /* =========================================================
       FLATPICKR
       ========================================================= */

    function initializeDatePicker() {

        if (
            !multiDate ||
            typeof flatpickr !==
            "function"
        ) {

            return;

        }


        flatpickr(
            multiDate,
            {

                mode:
                    "multiple",

                dateFormat:
                    "Y-m-d",

                minDate:
                    "today",

                disableMobile:
                    false,

                onChange:
                    selectedDates => {

                        renderDateTimeRows(
                            selectedDates
                        );

                        autosaveField(
                            multiDate
                        );

                    }

            }
        );

    }


    /* =========================================================
       AUTOSAVE
       ========================================================= */

    function getAutosaveKey(
        field
    ) {

        if (
            !field
        ) {

            return "";

        }


        return `professionalStudio.bookingDraft.${field.id}`;

    }


    function autosaveField(
        field
    ) {

        if (
            !field ||
            !field.id
        ) {

            return;

        }


        try {

            localStorage.setItem(
                getAutosaveKey(
                    field
                ),
                field.value ??
                ""
            );

        }

        catch (error) {

            console.warn(
                "Unable to autosave booking field:",
                error
            );

        }

    }


    function restoreAutosave() {

        AUTOSAVE_FIELDS.forEach(
            field => {

                if (
                    !field ||
                    !field.id
                ) {

                    return;

                }


                try {

                    const saved =
                        localStorage.getItem(
                            getAutosaveKey(
                                field
                            )
                        );


                    if (
                        saved !== null
                    ) {

                        field.value =
                            saved;

                    }

                }

                catch (error) {

                    console.warn(
                        "Unable to restore booking field:",
                        error
                    );

                }

            }
        );

    }


    AUTOSAVE_FIELDS.forEach(
        field => {

            if (
                !field
            ) {

                return;

            }


            field.addEventListener(
                "input",
                () => {

                    autosaveField(
                        field
                    );

                }
            );


            field.addEventListener(
                "change",
                () => {

                    autosaveField(
                        field
                    );

                }
            );

        }
    );


    /* =========================================================
       VALIDATION HELPERS
       ========================================================= */

    function showFieldError(
        element,
        messageText
    ) {

        if (
            !element
        ) {

            return;

        }


        element.setCustomValidity(
            messageText || ""
        );


        if (
            messageText
        ) {

            element.reportValidity();

        }

    }


    function clearFieldError(
        element
    ) {

        if (
            !element
        ) {

            return;

        }


        element.setCustomValidity(
            ""
        );

    }


    function validateClientDetails() {

        let valid = true;


        if (
            fullName
        ) {

            clearFieldError(
                fullName
            );


            if (
                !fullName.value.trim()
            ) {

                showFieldError(
                    fullName,
                    "Please enter your full name."
                );

                valid = false;

            }

        }


        if (
            email
        ) {

            clearFieldError(
                email
            );


            const emailValue =
                email.value.trim();


            if (
                !emailValue
            ) {

                showFieldError(
                    email,
                    "Please enter your email address."
                );

                valid = false;

            }

            else if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    emailValue
                )
            ) {

                showFieldError(
                    email,
                    "Please enter a valid email address."
                );

                valid = false;

            }

        }


        if (
            phone
        ) {

            clearFieldError(
                phone
            );


            const phoneValue =
                phone.value.trim();


            if (
                !phoneValue
            ) {

                showFieldError(
                    phone,
                    "Please enter your phone number."
                );

                valid = false;

            }

            else if (
                phoneValue.replace(
                    /\D/g,
                    ""
                ).length < 7
            ) {

                showFieldError(
                    phone,
                    "Please enter a valid phone number."
                );

                valid = false;

            }

        }


        if (
            guestCount
        ) {

            clearFieldError(
                guestCount
            );


            const guestValue =
                guestCount.value.trim();


            if (
                guestValue
            ) {

                const numericGuests =
                    Number(
                        guestValue
                    );


                if (
                    !Number.isInteger(
                        numericGuests
                    ) ||
                    numericGuests < 1
                ) {

                    showFieldError(
                        guestCount,
                        "Guest count must be a positive whole number."
                    );

                    valid = false;

                }

            }

        }


        if (
            locationInput
        ) {

            clearFieldError(
                locationInput
            );


            if (
                !locationInput.value.trim()
            ) {

                showFieldError(
                    locationInput,
                    "Please enter the session location."
                );

                valid = false;

            }

        }


        return valid;

    }


    function validateDates() {

        let valid = true;


        const dates =
            getSelectedDates();


        if (
            !dates.length
        ) {

            if (
                multiDate
            ) {

                showFieldError(
                    multiDate,
                    "Please select at least one event date."
                );

            }

            return false;

        }


        clearFieldError(
            multiDate
        );


        const rows =
            Array.from(
                dateTimeContainer?.querySelectorAll(
                    ".date-time-row"
                ) || []
            );


        if (
            rows.length !==
            dates.length
        ) {

            showFieldError(
                multiDate,
                "Please select valid event dates."
            );

            return false;

        }


        rows.forEach(
            row => {

                const start =
                    readTimeSelects(
                        row,
                        "start"
                    );

                const end =
                    readTimeSelects(
                        row,
                        "end"
                    );


                const startGroup =
                    row.querySelector(
                        '[data-time-field="start"] select'
                    );

                const endGroup =
                    row.querySelector(
                        '[data-time-field="end"] select'
                    );


                if (
                    !start ||
                    !end
                ) {

                    if (
                        startGroup
                    ) {

                        showFieldError(
                            startGroup,
                            "Please select a start time."
                        );

                    }

                    valid = false;

                    return;

                }


                const startMinutes =
                    timeToMinutes(
                        start
                    );

                const endMinutes =
                    timeToMinutes(
                        end
                    );


                if (
                    startMinutes === null ||
                    endMinutes === null
                ) {

                    if (
                        startGroup
                    ) {

                        showFieldError(
                            startGroup,
                            "Please select a valid start time."
                        );

                    }

                    valid = false;

                    return;

                }


                clearFieldError(
                    startGroup
                );

                clearFieldError(
                    endGroup
                );


                /*
                 * Equal times mean zero duration and are not
                 * accepted. Earlier end times are allowed because
                 * they represent overnight sessions.
                 */

                if (
                    startMinutes ===
                    endMinutes
                ) {

                    showFieldError(
                        endGroup,
                        "End time must be different from the start time."
                    );

                    valid = false;

                }

            }
        );


        return valid;

    }


    /* =========================================================
       BOOKING ID
       ========================================================= */

    function generateBookingId() {

        const timestamp =
            Date.now().toString(
                36
            ).toUpperCase();


        const random =
            Math.random()
                .toString(
                    36
                )
                .slice(
                    2,
                    7
                )
                .toUpperCase();


        return `BK-${timestamp}-${random}`;

    }


    /* =========================================================
       STORAGE HELPERS
       ========================================================= */

    function getBookings() {

        try {

            const stored =
                localStorage.getItem(
                    BOOKING_STORAGE_KEY
                );


            if (
                !stored
            ) {

                return [];

            }


            const parsed =
                JSON.parse(
                    stored
                );


            return Array.isArray(
                parsed
            )
                ? parsed
                : [];

        }

        catch (error) {

            console.error(
                "Unable to load bookings:",
                error
            );

            return [];

        }

    }


    function saveBookings(
        bookings
    ) {

        try {

            localStorage.setItem(
                BOOKING_STORAGE_KEY,
                JSON.stringify(
                    bookings
                )
            );


            return true;

        }

        catch (error) {

            console.error(
                "Unable to save booking:",
                error
            );

            return false;

        }

    }


    /* =========================================================
       BOOKING CREATION
       ========================================================= */

    function createBooking() {

        const dates =
            getDateData();


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


        const booking = {

            id:
                generateBookingId(),

            serviceId:
                getServiceId(
                    selectedService
                ),

            serviceName:
                selectedService?.name ??
                selectedService?.title ??
                "",

            packageId:
                getPackageId(
                    selectedPackage
                ),

            packageName:
                getPackageName(
                    selectedPackage
                ),

            packagePrice,

            paymentPlan,

            totalAmount:
                paymentPlan.totalAmount,

            guests:
                guestCount?.value.trim() ||
                "",

            client: {

                name:
                    fullName?.value.trim() ||
                    "",

                email:
                    email?.value.trim() ||
                    "",

                phone:
                    phone?.value.trim() ||
                    ""

            },

            dates,

            totalHours:
                dates.reduce(
                    (
                        sum,
                        item
                    ) =>
                        sum +
                        (
                            Number(
                                item.hours
                            ) || 0
                        ),
                    0
                ),

            location:
                locationInput?.value.trim() ||
                "",

            locationCoordinates:
                capturedLocation,

            message:
                message?.value.trim() ||
                "",

            status:
                "Pending",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        return booking;

    }


    /* =========================================================
       CLEAR AUTOSAVE
       ========================================================= */

    function clearAutosave() {

        AUTOSAVE_FIELDS.forEach(
            field => {

                if (
                    !field ||
                    !field.id
                ) {

                    return;

                }


                try {

                    localStorage.removeItem(
                        getAutosaveKey(
                            field
                        )
                    );

                }

                catch (error) {

                    console.warn(
                        "Unable to clear autosave:",
                        error
                    );

                }

            }
        );

    }


    /* =========================================================
       SUCCESS UI
       ========================================================= */

    function showSuccess() {

        if (
            !successPopup
        ) {

            return;

        }


        successPopup.textContent =
            "Booking request submitted successfully.";


        successPopup.style.display =
            "block";


        window.setTimeout(
            () => {

                successPopup.style.display =
                    "none";

            },
            4500
        );

    }


    /* =========================================================
       FORM SUBMISSION
       ========================================================= */

    if (
        bookingForm
    ) {

        bookingForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                if (
                    honeypot &&
                    honeypot.value.trim()
                ) {

                    return;

                }


                const clientValid =
                    validateClientDetails();


                const datesValid =
                    validateDates();


                if (
                    !clientValid ||
                    !datesValid
                ) {

                    return;

                }


                if (
                    !selectedService ||
                    !selectedPackage
                ) {

                    alert(
                        "The selected service or package could not be found. Please return to the service page and try again."
                    );

                    return;

                }


                const booking =
                    createBooking();


                const bookings =
                    getBookings();


                bookings.push(
                    booking
                );


                const saved =
                    saveBookings(
                        bookings
                    );


                if (
                    !saved
                ) {

                    alert(
                        "Unable to save your booking request. Please try again."
                    );

                    return;

                }


                clearAutosave();


                showSuccess();


                if (
                    submitBtn
                ) {

                    submitBtn.disabled =
                        true;

                    submitBtn.textContent =
                        "Booking Submitted";

                }


                window.setTimeout(
                    () => {

                        window.location.href =
                            "client.html";

                    },
                    1800
                );

            }
        );

    }


    /* =========================================================
       BACK BUTTON
       ========================================================= */

    if (
        backToService
    ) {

        backToService.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (
                    serviceId
                ) {

                    window.location.href =
                        `client.html?service=${encodeURIComponent(
                            serviceId
                        )}`;

                    return;

                }


                window.history.back();

            }
        );

    }


    /* =========================================================
       INITIALIZATION
       ========================================================= */

    selectedService =
        findSelectedService();


    selectedPackage =
        findSelectedPackage(
            selectedService
        );


    renderSelectedPackage();


    restoreAutosave();


    initializeDatePicker();


    /*
     * Restore the date/time rows after Flatpickr has been
     * initialized and the autosaved fields have been restored.
     */

    if (
        multiDate &&
        multiDate.value
    ) {

        const savedDates =
            getSelectedDates();


        if (
            savedDates.length
        ) {

            renderDateTimeRows(
                savedDates
            );

        }

    }


    updateTotalHours();

});