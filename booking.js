
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

    const packageCards =
        document.querySelectorAll(".package-card");

    // ============================================================
    // BASIC SAFETY CHECK
    // ============================================================

    if (!form) {
        console.error("Booking form (#bookingForm) was not found.");
        return;
    }


    // ============================================================
    // MULTI DATE PICKER
    // ============================================================

    let datePicker = null;

    if (multiDateInput) {

        if (typeof flatpickr === "function") {

            datePicker = flatpickr(multiDateInput, {

                mode: "multiple",

                dateFormat: "d-m-Y",

                allowInput: false,

                onChange: function (selectedDates) {

                    if (!dateContainer) return;

                    dateContainer.innerHTML = "";

                    selectedDates.forEach(function (date) {

                        // Consistent date formatting
                        const day =
                            String(date.getDate()).padStart(2, "0");

                        const month =
                            String(date.getMonth() + 1).padStart(2, "0");

                        const year =
                            date.getFullYear();

                        const formattedDate =
                            `${day}-${month}-${year}`;


                        const row =
                            document.createElement("div");

                        row.className = "date-time-row";

                        row.innerHTML = `

                            <h4>${formattedDate}</h4>

                            <div class="time-row">

                                <input
                                    type="time"
                                    class="start-time"
                                    required>

                                <input
                                    type="time"
                                    class="end-time"
                                    required>

                            </div>

                            <div class="hours-box">

                                Total Hours :
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

                            if (
                                !startInput ||
                                !endInput ||
                                !hours
                            ) {
                                return;
                            }

                            if (
                                !startInput.value ||
                                !endInput.value
                            ) {
                                hours.innerText = "0";
                                updateTotalHours();
                                return;
                            }


                            const startParts =
                                startInput.value.split(":");

                            const endParts =
                                endInput.value.split(":");


                            let startMinutes =
                                parseInt(startParts[0]) * 60 +
                                parseInt(startParts[1]);

                            let endMinutes =
                                parseInt(endParts[0]) * 60 +
                                parseInt(endParts[1]);


                            let difference =
                                endMinutes - startMinutes;


                            // Overnight timing support
                            if (difference < 0) {

                                difference += 24 * 60;

                            }


                            // Same start and end time
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


                        if (startInput) {

                            startInput.addEventListener(
                                "change",
                                calculateHours
                            );

                        }


                        if (endInput) {

                            endInput.addEventListener(
                                "change",
                                calculateHours
                            );

                        }

                    });


                    updateTotalHours();

                }

            });

        } else {

            console.error(
                "Flatpickr is not loaded. Check your Flatpickr CSS/JS CDN."
            );

            // Keep the rest of the website working.
            multiDateInput.removeAttribute("readonly");

        }

    }


    // ============================================================
    // TOTAL HOURS
    // ============================================================

    function updateTotalHours() {

        if (!totalHoursElement) return;

        let total = 0;


        document
            .querySelectorAll(".hours")
            .forEach(function (hour) {

                const value =
                    parseFloat(hour.innerText);

                if (!isNaN(value)) {

                    total += value;

                }

            });


        totalHoursElement.innerText =
            total.toFixed(1);

    }


    // ============================================================
    // SERVICE SELECTION
    // ============================================================

    if (serviceSelect) {

        serviceSelect.addEventListener(
            "change",
            function () {

                if (packageSection) {

                    packageSection.style.display = "none";

                }

                if (packageDetails) {

                    packageDetails.innerHTML = "";

                }

                if (durationBox) {

                    durationBox.style.display = "none";

                }

                if (selectedPackage) {

                    selectedPackage.value = "";

                }


                // Remove old package selection
                packageCards.forEach(function (card) {

                    card.classList.remove("active");

                });


                let message = "";


                switch (serviceSelect.value) {

                    case "select service":

                        break;


                    case "wedding":

                        message =
                            "Expected duration: 3–5 days (extra 1–2 days possible).";

                        if (packageSection) {

                            packageSection.style.display = "block";

                        }

                        break;


                    case "event":

                        message =
                            "Expected duration: 1 day event coverage.";

                        break;


                    case "portrait":

                        message =
                            "Expected duration: Few hours (single day session).";

                        break;


                    case "prewedding":

                        message =
                            "Expected duration: 1–2 days shoot.";

                        break;


                    default:

                        message = "";

                }


                if (
                    message !== "" &&
                    durationText &&
                    durationBox
                ) {

                    durationText.innerText =
                        message;

                    durationBox.style.display =
                        "block";

                }

            }
        );

    }


    // ============================================================
    // PACKAGE SELECTION
    // ============================================================

    packageCards.forEach(function (card) {

        card.addEventListener("click", function () {

            packageCards.forEach(function (c) {

                c.classList.remove("active");

            });


            card.classList.add("active");


            const pkg =
                card.dataset.package;


            if (selectedPackage) {

                selectedPackage.value =
                    pkg;

            }


            let details = "";


            switch (pkg) {

                case "basic":

                    details = `
                        <ul>
                            <li>Candid Photography</li>
                            <li>Traditional Photography</li>
                        </ul>
                    `;

                    break;


                case "premium":

                    details = `
                        <ul>
                            <li>Cinematic Video</li>
                            <li>Candid Photography</li>
                            <li>Traditional Photography</li>
                        </ul>
                    `;

                    break;


                case "luxury":

                    details = `
                        <ul>
                            <li>Cinematic Video</li>
                            <li>Candid Photography</li>
                            <li>Traditional Photography</li>
                            <li>Pre-Wedding Shoot</li>
                        </ul>
                    `;

                    break;

            }


            if (packageDetails) {

                packageDetails.innerHTML =
                    details;

            }

        });

    });


    // ============================================================
    // GPS LOCATION
    // ============================================================

    window.getLocation = function () {

        if (!locationInput) {

            alert("Location field was not found.");

            return;

        }


        // Browser support check
        if (!("geolocation" in navigator)) {

            alert(
                "Geolocation is not supported by this browser."
            );

            return;

        }


        // HTTPS check
        if (
            window.location.protocol !== "https:" &&
            window.location.hostname !== "localhost" &&
            window.location.hostname !== "127.0.0.1"
        ) {

            alert(
                "GPS requires a secure HTTPS connection. Please open this website using HTTPS."
            );

            return;

        }


        locationInput.value =
            "Fetching location...";


        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                locationInput.value =
                    `${latitude}, ${longitude}`;


                // Trigger input/change events
                locationInput.dispatchEvent(
                    new Event("input", {
                        bubbles: true
                    })
                );


                locationInput.dispatchEvent(
                    new Event("change", {
                        bubbles: true
                    })
                );

            },


            function (error) {

                locationInput.value = "";


                switch (error.code) {

                    case error.PERMISSION_DENIED:

                        alert(
                            "Location permission was denied. Please allow location access in your browser settings."
                        );

                        break;


                    case error.POSITION_UNAVAILABLE:

                        alert(
                            "Your current location could not be determined. Please try again."
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
    // SUCCESS POPUP
    // ============================================================

    function showSuccess() {

        if (!successPopup) return;


        successPopup.style.display =
            "block";


        setTimeout(function () {

            successPopup.style.display =
                "none";

        }, 4000);

    }


    // ============================================================
    // FORM SUBMIT
    // ============================================================

    form.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const phoneElement =
                document.getElementById("phone");

            const emailElement =
                document.getElementById("email");

            const nameElement =
                document.getElementById("name");


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


            // ====================================================
            // PHONE VALIDATION
            // ====================================================

            const cleanPhone =
                phone.replace(/\D/g, "");


            if (
                cleanPhone.length < 10 ||
                cleanPhone.length > 15
            ) {

                alert(
                    "Please enter a valid phone number."
                );

                return;

            }


            // ====================================================
            // EMAIL VALIDATION
            // ====================================================

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailRegex.test(email)) {

                alert(
                    "Please enter a valid email address."
                );

                return;

            }


            // ====================================================
            // LOCATION VALIDATION
            // ====================================================

            if (location === "") {

                alert(
                    "Please enter your event location."
                );

                return;

            }


            // ====================================================
            // SERVICE VALIDATION
            // ====================================================

            if (
                !serviceSelect ||
                !serviceSelect.value ||
                serviceSelect.value === "select service"
            ) {

                alert(
                    "Please select a service."
                );

                return;

            }


            // ====================================================
            // PACKAGE VALIDATION
            // ====================================================

            if (
                serviceSelect.value === "wedding" &&
                selectedPackage &&
                selectedPackage.value === ""
            ) {

                alert(
                    "Please select a wedding package."
                );

                return;

            }


            // ====================================================
            // DATE VALIDATION
            // ====================================================

            const selectedDateRows =
                document.querySelectorAll(
                    ".date-time-row"
                );


            if (selectedDateRows.length === 0) {

                alert(
                    "Please select at least one date."
                );

                return;

            }


            // Make sure all selected dates have valid times
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

                }

            });


            if (invalidTime) {

                alert(
                    "Please select start and end time for every date."
                );

                return;

            }


            // ====================================================
            // LOADING BUTTON
            // ====================================================

            if (submitBtn) {

                submitBtn.disabled = true;

                submitBtn.innerText =
                    "Submitting...";

            }


            // ====================================================
            // SAVE BOOKING
            // ====================================================

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


            // ====================================================
            // OPTIONAL INSTAGRAM FIELD
            // ====================================================

            const instagramElement =
                document.getElementById("instagram");


            const instagram =
                instagramElement
                    ? instagramElement.value.trim()
                    : "-";


            // ====================================================
            // PACKAGE PRICE
            // ====================================================

            const packagePriceElement =
                document.getElementById("packagePrice");


            const packagePrice =
                packagePriceElement
                    ? packagePriceElement.value
                    : "₹0";


            // ====================================================
            // BOOKING OBJECT
            // ====================================================

            const booking = {

                id:
                    "BK-" + Date.now(),


                client:
                    nameElement
                        ? nameElement.value.trim()
                        : "",


                clientType:
                    "Photography Client",


                phone:
                    phone,


                email:
                    email,


                instagram:
                    instagram || "-",


                service:
                    serviceSelect.options[
                        serviceSelect.selectedIndex
                    ]
                        ? serviceSelect.options[
                            serviceSelect.selectedIndex
                        ].text
                        : serviceSelect.value,


                package:
                    selectedPackage
                        ? selectedPackage.value
                        : "",


                date:
                    bookingDate,


                time:
                    bookingTime,


                location:
                    location,


                status:
                    "Pending",


                payment:
                    "Pending",


                advance:
                    "₹0",


                remaining:
                    packagePrice || "₹0",


                image:
                    "images/profile.jpg",


                equipment:
                    "",


                notes:
                    ""

            };


            // ====================================================
            // LOCAL STORAGE
            // ====================================================

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
                    "Unable to read bookings from localStorage:",
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

            }


            // ====================================================
            // SUCCESS
            // ====================================================

            setTimeout(function () {

                showSuccess();


                if (submitBtn) {

                    submitBtn.disabled = false;

                    submitBtn.innerText =
                        "Submit Booking Request";

                }


                form.reset();


                // Clear date picker
                if (datePicker) {

                    datePicker.clear();

                }


                if (dateContainer) {

                    dateContainer.innerHTML = "";

                }


                if (packageSection) {

                    packageSection.style.display =
                        "none";

                }


                if (packageDetails) {

                    packageDetails.innerHTML =
                        "";

                }


                if (durationBox) {

                    durationBox.style.display =
                        "none";

                }


                if (selectedPackage) {

                    selectedPackage.value =
                        "";

                }


                packageCards.forEach(function (card) {

                    card.classList.remove("active");

                });


                updateTotalHours();


                // Clear form autosave
                clearFormStorage();


                // Go to client page
                window.location.href =
                    "client.html";


            }, 1200);

        }
    );


    // ============================================================
    // PROGRESS BAR
    // ============================================================

    const formFields =
        document.querySelectorAll(
            "#bookingForm input, #bookingForm select, #bookingForm textarea"
        );


    function updateProgress() {

        const progressFill =
            document.getElementById("progressFill");


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
    // LOCAL STORAGE - AUTO SAVE
    // ============================================================

    formFields.forEach(function (field) {

        if (!field.id) return;


        try {

            const savedValue =
                localStorage.getItem(field.id);


            if (savedValue !== null) {

                field.value =
                    savedValue;

            }

        } catch (error) {

            console.error(
                "Unable to load saved field:",
                field.id,
                error
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
                        field.id,
                        error
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
                        field.id,
                        error
                    );

                }

            }
        );

    });


    // ============================================================
    // CLEAR STORAGE AFTER SUCCESS
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
                    field.id,
                    error
                );

            }

        });

    


    // ============================================================
    // INITIAL PAGE LOAD
    // ============================================================

    updateProgress();

    updateTotalHours();

    }});