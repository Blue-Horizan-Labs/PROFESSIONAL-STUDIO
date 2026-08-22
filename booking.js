// ============================================================
// BOOKING FORM JAVASCRIPT
// Professional Studio
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    // ============================================================
    // DOM ELEMENTS
    // ============================================================

    const form = document.getElementById("bookingForm");
    const serviceSelect = document.getElementById("serviceSelect");
    const packageSection = document.getElementById("packageSection");
    const packageDetails = document.getElementById("packageDetails");
    const selectedPackage = document.getElementById("selectedPackage");
    const durationBox = document.getElementById("durationBox");
    const durationText = document.getElementById("durationText");
    const locationInput = document.getElementById("location");
    const dateContainer = document.getElementById("dateTimeContainer");
    const totalHoursElement = document.getElementById("totalHours");
    const submitBtn = document.querySelector(".submit-btn");
    const successPopup = document.getElementById("successPopup");
    const multiDateInput = document.getElementById("multiDate");
    const progressFill = document.getElementById("progressFill");

    const packageCards = document.querySelectorAll(".package-card");

    if (!form) {
        console.error("Booking form not found.");
        return;
    }

    // ============================================================
    // PACKAGE DATA
    // ============================================================

    const packageData = {

        wedding: {
            basic: {
                name: "Wedding Basic",
                price: "₹20,000",
                features: [
                    "Candid Photography",
                    "Traditional Photography",
                    "100 Edited Photos",
                    "Online Gallery"
                ]
            },

            premium: {
                name: "Wedding Premium",
                price: "₹45,000",
                features: [
                    "Cinematic Video",
                    "Candid Photography",
                    "Traditional Photography",
                    "Drone Coverage",
                    "300 Edited Photos"
                ]
            },

            luxury: {
                name: "Wedding Luxury",
                price: "₹80,000",
                features: [
                    "Cinematic Video",
                    "Candid Photography",
                    "Traditional Photography",
                    "Premium Album",
                    "Pre-Wedding Shoot",
                    "Unlimited Edited Photos"
                ]
            }
        },

        event: {
            basic: {
                name: "Event Basic",
                price: "₹12,000",
                features: [
                    "4 Hours Coverage",
                    "150 Edited Photos",
                    "Online Gallery"
                ]
            },

            premium: {
                name: "Event Premium",
                price: "₹25,000",
                features: [
                    "8 Hours Coverage",
                    "Drone Coverage",
                    "300 Edited Photos",
                    "Online Gallery"
                ]
            }
        },

        portrait: {
            basic: {
                name: "Portrait Standard",
                price: "₹3,000",
                features: [
                    "1 Hour Session",
                    "20 Edited Photos",
                    "Studio Lighting"
                ]
            },

            premium: {
                name: "Portrait Premium",
                price: "₹6,000",
                features: [
                    "2 Hour Session",
                    "50 Edited Photos",
                    "Outdoor + Studio"
                ]
            }
        },

        prewedding: {
            basic: {
                name: "Pre-Wedding Basic",
                price: "₹10,000",
                features: [
                    "2 Hours Coverage",
                    "50 Edited Photos",
                    "Outdoor Shoot"
                ]
            },

            premium: {
                name: "Pre-Wedding Premium",
                price: "₹18,000",
                features: [
                    "4 Hours Coverage",
                    "Drone Coverage",
                    "120 Edited Photos"
                ]
            }
        }
    };

    // ============================================================
    // MULTI DATE PICKER
    // ============================================================

    let datePicker = null;

    if (multiDateInput && typeof flatpickr === "function") {

        datePicker = flatpickr(multiDateInput, {

            mode: "multiple",
            dateFormat: "d-m-Y",
            allowInput: false,

            onChange: function (selectedDates) {

                dateContainer.innerHTML = "";

                selectedDates.forEach(function (date) {

                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const year = date.getFullYear();

                    const formattedDate = `${day}-${month}-${year}`;

                    const row = document.createElement("div");

                    row.className = "date-time-row";

                    row.innerHTML = `
                        <h4>${formattedDate}</h4>

                        <div class="time-row">

                            <div class="time-field">
                                <label>Start Time</label>
                                <input type="time"
                                       class="start-time"
                                       required>
                            </div>

                            <div class="time-field">
                                <label>End Time</label>
                                <input type="time"
                                       class="end-time"
                                       required>
                            </div>

                        </div>

                        <div class="hours-box">
                            Total Hours:
                            <span class="hours">0</span>
                        </div>
                    `;

                    dateContainer.appendChild(row);

                    const startInput =
                        row.querySelector(".start-time");

                    const endInput =
                        row.querySelector(".end-time");

                    const hours =
                        row.querySelector(".hours");

                    function calculateHours() {

                        if (!startInput.value || !endInput.value) {
                            hours.innerText = "0";
                            updateTotalHours();
                            return;
                        }

                        const startParts = startInput.value.split(":");
                        const endParts = endInput.value.split(":");

                        let startMinutes =
                            parseInt(startParts[0]) * 60 +
                            parseInt(startParts[1]);

                        let endMinutes =
                            parseInt(endParts[0]) * 60 +
                            parseInt(endParts[1]);

                        let difference =
                            endMinutes - startMinutes;

                        // Allow overnight sessions
                        if (difference < 0) {
                            difference += 24 * 60;
                        }

                        if (difference === 0) {
                            hours.innerText = "Invalid";
                            updateTotalHours();
                            return;
                        }

                        const calculatedHours =
                            difference / 60;

                        hours.innerText =
                            calculatedHours.toFixed(1);

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
                });

                updateTotalHours();
                updateProgress();
            }
        });

    } else if (multiDateInput) {

        console.error("Flatpickr is not loaded.");

        multiDateInput.removeAttribute("readonly");
    }

    // ============================================================
    // TOTAL HOURS
    // ============================================================

    function updateTotalHours() {

        if (!totalHoursElement) return;

        let total = 0;

        document.querySelectorAll(".hours").forEach(function (hour) {

            const value = parseFloat(hour.innerText);

            if (!isNaN(value)) {
                total += value;
            }
        });

        totalHoursElement.innerText = total.toFixed(1);
    }

    // ============================================================
    // PACKAGE DISPLAY
    // ============================================================

    function loadPackages(service) {

        if (!packageSection) return;

        packageSection.style.display = "none";

        if (packageDetails) {
            packageDetails.innerHTML = "";
        }

        if (selectedPackage) {
            selectedPackage.value = "";
        }

        packageCards.forEach(function (card) {
            card.classList.remove("active");
        });

        if (!packageData[service]) {
            return;
        }

        const packages = packageData[service];

        const packageOptions =
            packageSection.querySelector(".package-options");

        if (!packageOptions) return;

        packageOptions.innerHTML = "";

        Object.keys(packages).forEach(function (key, index) {

            const pkg = packages[key];

            const card = document.createElement("div");

            card.className = "package-card";

            card.dataset.package = key;

            card.innerHTML = `

                ${index === 1 ? `
                    <span class="badge">
                        Most Popular
                    </span>
                ` : ""}

                <h4>${pkg.name}</h4>

                <div class="package-price">
                    ${pkg.price}
                </div>

                <p>
                    ${pkg.features.slice(0, 2).join(" • ")}
                </p>
            `;

            packageOptions.appendChild(card);

            card.addEventListener("click", function () {

                packageOptions
                    .querySelectorAll(".package-card")
                    .forEach(function (c) {
                        c.classList.remove("active");
                    });

                card.classList.add("active");

                selectedPackage.value = key;

                packageDetails.innerHTML = `

                    <h4>${pkg.name}</h4>

                    <p>
                        <strong>Price:</strong> ${pkg.price}
                    </p>

                    <ul>
                        ${pkg.features.map(function (feature) {
                            return `<li>✔ ${feature}</li>`;
                        }).join("")}
                    </ul>
                `;

                updateProgress();
            });
        });

        packageSection.style.display = "block";
    }

    // ============================================================
    // SERVICE SELECTION
    // ============================================================

    if (serviceSelect) {

        serviceSelect.addEventListener("change", function () {

            const service = serviceSelect.value;

            if (durationBox) {
                durationBox.style.display = "none";
            }

            if (service === "") {
                loadPackages("");
                updateProgress();
                return;
            }

            loadPackages(service);

            let message = "";

            switch (service) {

                case "wedding":
                    message =
                        "Expected duration: 3–5 days. Extra 1–2 days may be required depending on the event.";
                    break;

                case "event":
                    message =
                        "Expected duration: 1 day event coverage.";
                    break;

                case "portrait":
                    message =
                        "Expected duration: Few hours, usually a single-day session.";
                    break;

                case "prewedding":
                    message =
                        "Expected duration: 1–2 days depending on the selected shoot plan.";
                    break;
            }

            if (message && durationText && durationBox) {

                durationText.innerText = message;

                durationBox.style.display = "block";
            }

            updateProgress();
        });
    }

    // ============================================================
    // GPS LOCATION
    // ============================================================

    window.getLocation = function () {

        if (!locationInput) {
            alert("Location field was not found.");
            return;
        }

        if (!("geolocation" in navigator)) {
            alert(
                "Geolocation is not supported by this browser."
            );
            return;
        }

        if (
            window.location.protocol !== "https:" &&
            window.location.hostname !== "localhost" &&
            window.location.hostname !== "127.0.0.1"
        ) {
            alert(
                "GPS requires a secure HTTPS connection."
            );
            return;
        }

        locationInput.value = "Fetching location...";

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                locationInput.value =
                    `${latitude}, ${longitude}`;

                updateProgress();
            },

            function (error) {

                locationInput.value = "";

                switch (error.code) {

                    case error.PERMISSION_DENIED:
                        alert(
                            "Location permission was denied. Please allow location access."
                        );
                        break;

                    case error.POSITION_UNAVAILABLE:
                        alert(
                            "Your current location could not be determined."
                        );
                        break;

                    case error.TIMEOUT:
                        alert(
                            "Location request timed out. Please try again."
                        );
                        break;

                    default:
                        alert(
                            "Unable to fetch your location. Please enter it manually."
                        );
                }
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    // ============================================================
    // FORM SUBMIT
    // ============================================================

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const nameElement =
            document.getElementById("fullName");

        const phoneElement =
            document.getElementById("phone");

        const emailElement =
            document.getElementById("email");

        const name =
            nameElement
                ? nameElement.value.trim()
                : "";

        const phone =
            phoneElement
                ? phoneElement.value.trim()
                : "";

        const email =
            emailElement
                ? emailElement.value.trim()
                : "";

        const location =
            locationInput
                ? locationInput.value.trim()
                : "";

        // ========================================================
        // REQUIRED DETAILS
        // ========================================================

        if (!name) {
            alert("Please enter your full name.");
            return;
        }

        // ========================================================
        // PHONE VALIDATION
        // ========================================================

        const cleanPhone =
            phone.replace(/\D/g, "");

        if (
            cleanPhone.length < 10 ||
            cleanPhone.length > 15
        ) {
            alert("Please enter a valid phone number.");
            return;
        }

        // ========================================================
        // EMAIL VALIDATION
        // ========================================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // ========================================================
        // LOCATION
        // ========================================================

        if (!location) {
            alert("Please enter your event location.");
            return;
        }

        // ========================================================
        // SERVICE
        // ========================================================

        if (!serviceSelect || !serviceSelect.value) {
            alert("Please select a service.");
            return;
        }

        // ========================================================
        // PACKAGE
        // ========================================================

        if (
            selectedPackage &&
            selectedPackage.value === ""
        ) {
            alert("Please select a package.");
            return;
        }

        // ========================================================
        // DATES
        // ========================================================

        const selectedDateRows =
            document.querySelectorAll(".date-time-row");

        if (selectedDateRows.length === 0) {
            alert("Please select at least one date.");
            return;
        }

        // ========================================================
        // TIME VALIDATION
        // ========================================================

        let invalidTime = false;

        selectedDateRows.forEach(function (row) {

            const start =
                row.querySelector(".start-time");

            const end =
                row.querySelector(".end-time");

            if (
                !start ||
                !end ||
                !start.value ||
                !end.value
            ) {
                invalidTime = true;
                return;
            }

            if (start.value === end.value) {
                invalidTime = true;
            }
        });

        if (invalidTime) {
            alert(
                "Please select valid start and end times for every date."
            );
            return;
        }

        // ========================================================
        // PACKAGE INFORMATION
        // ========================================================

        const service =
            serviceSelect.value;

        const packageKey =
            selectedPackage
                ? selectedPackage.value
                : "";

        const selectedPkg =
            packageData[service] &&
            packageData[service][packageKey];

        const packageName =
            selectedPkg
                ? selectedPkg.name
                : "";

        const packagePrice =
            selectedPkg
                ? selectedPkg.price
                : "₹0";

        // ========================================================
        // FIRST DATE
        // ========================================================

        const firstDate =
            selectedDateRows[0];

        let bookingDate = "";
        let bookingTime = "";

        if (firstDate) {

            const dateHeading =
                firstDate.querySelector("h4");

            const startTime =
                firstDate.querySelector(".start-time");

            if (dateHeading) {
                bookingDate =
                    dateHeading.innerText;
            }

            if (startTime) {
                bookingTime =
                    startTime.value;
            }
        }

        // ========================================================
        // TOTAL HOURS
        // ========================================================

        const totalHours =
            totalHoursElement
                ? totalHoursElement.innerText
                : "0";

        // ========================================================
        // OTHER DETAILS
        // ========================================================

        const instagramElement =
            document.getElementById("instagram");

        const instagram =
            instagramElement
                ? instagramElement.value.trim()
                : "-";

        const messageElement =
            document.getElementById("message");

        const message =
            messageElement
                ? messageElement.value.trim()
                : "";

        const guestsElement =
            document.querySelector(
                'input[type="number"]'
            );

        const guests =
            guestsElement
                ? guestsElement.value
                : "";

        // ========================================================
        // BOOKING OBJECT
        // ========================================================

        const booking = {

            id: "BK-" + Date.now(),

            client: name,

            clientType: "Photography Client",

            phone: phone,

            email: email,

            instagram: instagram || "-",

            service:
                serviceSelect.options[
                    serviceSelect.selectedIndex
                ].text,

            serviceType: service,

            package: packageName,

            packageKey: packageKey,

            packagePrice: packagePrice,

            date: bookingDate,

            time: bookingTime,

            totalHours: totalHours,

            location: location,

            guests: guests,

            status: "Pending",

            payment: "Pending",

            advance: "₹0",

            remaining: packagePrice,

            image: "images/profile.jpg",

            equipment: "",

            notes: message

        };

        // ========================================================
        // SAVE BOOKING
        // ========================================================

        let bookings = [];

        try {

            bookings =
                JSON.parse(
                    localStorage.getItem("bookings")
                ) || [];

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

        bookings.unshift(booking);

        try {

            localStorage.setItem(
                "bookings",
                JSON.stringify(bookings)
            );

        } catch (error) {

            console.error(
                "Unable to save booking:",
                error
            );

            alert(
                "Unable to save booking. Please try again."
            );

            return;
        }

        // ========================================================
        // SUCCESS
        // ========================================================

        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.innerText =
                "Booking Submitted ✓";
        }

        if (successPopup) {

            successPopup.style.display =
                "block";
        }

        setTimeout(function () {

            if (successPopup) {
                successPopup.style.display =
                    "none";
            }

            if (submitBtn) {

                submitBtn.disabled = false;

                submitBtn.innerText =
                    "Submit Booking Request";
            }

            form.reset();

            if (datePicker) {
                datePicker.clear();
            }

            dateContainer.innerHTML = "";

            packageSection.style.display = "none";

            packageDetails.innerHTML = "";

            durationBox.style.display = "none";

            selectedPackage.value = "";

            updateTotalHours();

            updateProgress();

            clearFormStorage();

            // IMPORTANT:
            // Stay on booking page.
            // Do NOT redirect to client.html.

        }, 1500);
    });

    // ============================================================
    // PROGRESS BAR
    // ============================================================

    const formFields =
        document.querySelectorAll(
            "#bookingForm input, #bookingForm select, #bookingForm textarea"
        );

    function updateProgress() {

        if (!progressFill) return;

        let filled = 0;
        let total = 0;

        formFields.forEach(function (field) {

            if (
                field.type === "hidden" ||
                field.type === "button" ||
                field.disabled
            ) {
                return;
            }

            total++;

            if (
                typeof field.value === "string" &&
                field.value.trim() !== ""
            ) {
                filled++;
            }
        });

        const percentage =
            total > 0
                ? (filled / total) * 100
                : 0;

        progressFill.style.width =
            Math.min(percentage, 100) + "%";
    }

    formFields.forEach(function (field) {

        field.addEventListener(
            "input",
            updateProgress
        );

        field.addEventListener(
            "change",
            updateProgress
        );
    });

    // ============================================================
    // AUTO SAVE
    // ============================================================

    formFields.forEach(function (field) {

        if (!field.id) return;

        try {

            const savedValue =
                localStorage.getItem(field.id);

            if (
                savedValue !== null &&
                field.type !== "date"
            ) {
                field.value = savedValue;
            }

        } catch (error) {

            console.error(
                "Unable to load saved field:",
                field.id
            );
        }

        field.addEventListener(
            "input",
            function () {

                try {

                    localStorage.setItem(
                        field.id,
                        field.value
                    );

                } catch (error) {

                    console.error(
                        "Unable to save field:",
                        field.id
                    );
                }
            }
        );

        field.addEventListener(
            "change",
            function () {

                try {

                    localStorage.setItem(
                        field.id,
                        field.value
                    );

                } catch (error) {

                    console.error(
                        "Unable to save field:",
                        field.id
                    );
                }
            }
        );
    });

    // ============================================================
    // CLEAR AUTOSAVE
    // ============================================================

    function clearFormStorage() {

        formFields.forEach(function (field) {

            if (!field.id) return;

            try {

                localStorage.removeItem(
                    field.id
                );

            } catch (error) {

                console.error(
                    "Unable to clear saved field:",
                    field.id
                );
            }
        });
    }

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    updateProgress();
    updateTotalHours();

});