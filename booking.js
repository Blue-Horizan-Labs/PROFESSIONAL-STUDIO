// ================================
// DOM ELEMENTS
// ================================

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


// ================================
// MULTI DATE PICKER
// ================================

flatpickr("#multiDate", {

    mode: "multiple",

    dateFormat: "d-m-Y",

    onChange(selectedDates) {

        dateContainer.innerHTML = "";

        selectedDates.forEach(date => {

            const formattedDate =
            date.toLocaleDateString("en-GB");

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

                if (!startInput.value || !endInput.value)
                    return;

                const start =
                new Date(`1970-01-01T${startInput.value}`);

                const end =
                new Date(`1970-01-01T${endInput.value}`);

                let difference =
                (end - start) / 3600000;

                // Overnight timing support

                if (difference < 0) {

                    difference += 24;

                }

                if (difference === 0) {

                    hours.innerText =
                    "Invalid";

                    updateTotalHours();

                    return;

                }

                hours.innerText =
                difference.toFixed(1);

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

    }

});


// ================================
// TOTAL HOURS
// ================================

function updateTotalHours() {

    let total = 0;

    document.querySelectorAll(".hours")
    .forEach(hour => {

        const value =
        parseFloat(hour.innerText);

        if (!isNaN(value)) {

            total += value;

        }

    });

    totalHoursElement.innerText =
    total.toFixed(1);

}
// ================================
// SERVICE SELECTION
// ================================

serviceSelect.addEventListener("change", () => {

    packageSection.style.display = "none";
    packageDetails.innerHTML = "";
    durationBox.style.display = "none";
    selectedPackage.value = "";

    let message = "";

    switch (serviceSelect.value) {

        
     case "select service":

         break;

        case "wedding":

            message =
            
    "Expected duration: 3–5 days (extra 1–2 days possible).";

            packageSection.style.display = "block";

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

    if (message !== "") {

        durationText.innerText = message;

        durationBox.style.display = "block";

    }

});


// ================================
// PACKAGE SELECTION
// ================================

const packageCards =
document.querySelectorAll(".package-card");

packageCards.forEach(card => {

    card.addEventListener("click", () => {

        packageCards.forEach(c =>
            c.classList.remove("active")
        );

        card.classList.add("active");

        const pkg = card.dataset.package;

        selectedPackage.value = pkg;

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

        packageDetails.innerHTML = details;

    });

});


// ================================
// GPS LOCATION
// ================================

function getLocation() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported.");

        return;

    }

    locationInput.value =
    "Fetching location...";

    navigator.geolocation.getCurrentPosition(

        position => {

            const latitude =
            position.coords.latitude;

            const longitude =
            position.coords.longitude;

            locationInput.value =
            `${latitude}, ${longitude}`;

            locationInput.dispatchEvent(
                new Event("input")
            );

        },

        () => {

            locationInput.value = "";

            alert(
                "Unable to fetch location. Please allow GPS permission."
            );

        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}
// ================================
// SUCCESS POPUP
// ================================

function showSuccess() {

    successPopup.style.display = "block";

    setTimeout(() => {

        successPopup.style.display = "none";

    }, 4000);

}


// ================================
// FORM SUBMIT
// ================================

form.addEventListener("submit", function (e) {

    e.preventDefault();

    const phone =
    document.getElementById("phone").value.trim();

    const email =
    document.getElementById("email").value.trim();

    const location =
    locationInput.value.trim();

    // ----------------------------
    // Phone Validation
    // ----------------------------

    if (phone.length < 10 || isNaN(phone)) {

        alert("Please enter a valid phone number.");

        return;

    }

    // ----------------------------
    // Email Validation
    // ----------------------------

    const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

        alert("Please enter a valid email address.");

        return;

    }

    // ----------------------------
    // Location Validation
    // ----------------------------

    if (location === "") {

        alert("Please enter your event location.");

        return;

    }

    // ----------------------------
    // Package Validation
    // ----------------------------

    if (
        serviceSelect.value === "wedding" &&
        selectedPackage.value === ""
    ) {

        alert("Please select a wedding package.");

        return;

    }

    // ----------------------------
    // Loading Button
    // ----------------------------

    submitBtn.disabled = true;

    submitBtn.innerText = "Submitting...";

    // =====================================
    // BACKEND WILL BE ADDED HERE LATER
    // =====================================

    setTimeout(() => {

        showSuccess();

        submitBtn.disabled = false;

        submitBtn.innerText =
        "Submit Booking Request";

        form.reset();

        packageSection.style.display = "none";

        packageDetails.innerHTML = "";

        durationBox.style.display = "none";

        selectedPackage.value = "";

        updateTotalHours();
        window.location.href = "client.html";
    }, 1200);

    

});
// ================================
// PROGRESS BAR
// ================================

const formFields = document.querySelectorAll(
    "#bookingForm input, #bookingForm select, #bookingForm textarea"
);

function updateProgress() {

    let filled = 0;

    formFields.forEach(field => {

        if (field.type === "hidden") return;

        if (field.value.trim() !== "") {

            filled++;

        }

    });

    const percentage =
    (filled / (formFields.length - 1)) * 100;

    document.getElementById("progressFill").style.width =
    percentage + "%";

}

formFields.forEach(field => {

    field.addEventListener("input", updateProgress);

});

updateProgress();


// ================================
// LOCAL STORAGE (AUTO SAVE)
// ================================

formFields.forEach(field => {

    if (!field.id) return;

    const savedValue = localStorage.getItem(field.id);

    if (savedValue !== null) {

        field.value = savedValue;

    }

    field.addEventListener("input", () => {

        localStorage.setItem(

            field.id,

            field.value

        );

    });

});


// ================================
// CLEAR STORAGE AFTER SUCCESS
// ================================

function clearFormStorage() {

    formFields.forEach(field => {

        if (!field.id) return;

        localStorage.removeItem(field.id);

    });

}


// ================================
// UPDATE SUCCESS FUNCTION
// ================================

const originalShowSuccess = showSuccess;

showSuccess = function () {

    originalShowSuccess();

    clearFormStorage();

};


// ================================
// INITIAL PAGE LOAD
// ================================

window.addEventListener("load", () => {

    updateProgress();

});