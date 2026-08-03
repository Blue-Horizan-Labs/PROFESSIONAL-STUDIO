// ===============================
// Studio Logo Preview
// ===============================

const studioLogo = document.getElementById("studioLogo");
const logoPreview = document.getElementById("logoPreview");

studioLogo.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    logoPreview.src = URL.createObjectURL(file);
    logoPreview.style.display = "block";

    logoPreview.parentElement.classList.add("has-image");

});

// ===============================
// Photographer Image Preview
// ===============================

function initializePhotoUploads() {

    const uploadBoxes = document.querySelectorAll(".photographer-card");

    uploadBoxes.forEach(card => {

        const input = card.querySelector(".photoInput");
        const preview = card.querySelector(".photoPreview");
        const label = card.querySelector(".upload-label");

        input.onchange = function () {

            const file = this.files[0];

            if (!file) return;

            preview.src = URL.createObjectURL(file);
            preview.style.display = "block";

            label.classList.add("has-image");

        };

    });

}

initializePhotoUploads();


// ===============================
// Add Photographer
// ===============================

const addButton = document.getElementById("addPhotographer");
const container = document.getElementById("photographerContainer");

let photographerCount = 1;

addButton.addEventListener("click", () => {

    if (photographerCount >= 3) {

        alert("Maximum 3 photographers allowed.");

        return;

    }

    photographerCount++;

    const card = document.createElement("div");

    card.className = "photographer-card";

    card.innerHTML = `

<div class="photo-side">

<div class="upload-box">

<input
type="file"
accept="image/*"
class="photoInput"
hidden>

<label class="upload-label">

<img
class="photoPreview"
src=""
alt="">

<i class="fa-solid fa-user"></i>

<p>Upload Photo</p>

<span>JPG or PNG</span>

</label>

</div>

<button
type="button"
class="remove-photographer">

Remove Photographer

</button>

</div>

<div class="details-side">

<div class="grid-2">

<div>

<label>Full Name</label>

<input
type="text"
placeholder="Photographer Name">

</div>

<div>

<label>Professional Role</label>

<input
type="text"
placeholder="Photographer">

</div>

<div>

<label>Experience</label>

<input
type="number"
placeholder="5">

</div>

<div>

<label>Specialization</label>

<input
type="text"
placeholder="Wedding Photography">

</div>

</div>

<label>About Yourself</label>

<textarea
rows="5"
placeholder="Tell clients about yourself..."></textarea>

<div class="grid-2">

<div>

<label>Email</label>

<input
type="email"
placeholder="example@email.com">

</div>

<div>

<label>Phone Number</label>

<input
type="tel"
placeholder="+91 9876543210">

</div>

</div>

</div>

`;

    container.appendChild(card);

    initializePhotoUploads();

    initializeRemoveButtons();

});


// ===============================
// Remove Photographer
// ===============================

function initializeRemoveButtons() {

    const removeButtons = document.querySelectorAll(".remove-photographer");

    removeButtons.forEach(button => {

        button.onclick = function () {

            this.closest(".photographer-card").remove();

            photographerCount--;

        };

    });

}

initializeRemoveButtons();


// ===============================
// Validation
// ===============================

const form = document.getElementById("profileForm");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    const studioName =
        document.querySelector('input[placeholder="Professional Studio"]');

    const photographerName =
        document.querySelector('input[placeholder="Rahul Patil"]');

    if (studioName.value.trim() === "") {

        alert("Please enter your studio name.");

        studioName.focus();

        return;

    }

    if (photographerName.value.trim() === "") {

        alert("Please enter photographer name.");

        photographerName.focus();

        return;

    }

    alert("Profile saved successfully!");

    // Future backend

    // window.location.href = "services-setup.html";

});


// ===============================
// Drag & Drop Support
// ===============================

document.querySelectorAll(".upload-label").forEach(label => {

    label.addEventListener("dragover", e => {

        e.preventDefault();

        label.style.borderColor = "#7c5cff";

    });

    label.addEventListener("dragleave", () => {

        label.style.borderColor = "";

    });

    label.addEventListener("drop", e => {

        e.preventDefault();

        label.style.borderColor = "";

        const input = label.previousElementSibling;

        if (!input) return;

        input.files = e.dataTransfer.files;

        input.dispatchEvent(new Event("change"));

    });

});


// ===============================
// Character Counter
// ===============================

document.querySelectorAll("textarea").forEach(area => {

    const counter = document.createElement("small");

    counter.style.color = "#94a3b8";

    counter.style.display = "block";

    counter.style.marginTop = "8px";

    counter.innerHTML = "0 / 300";

    area.after(counter);

    area.addEventListener("input", () => {

        if (area.value.length > 300)

            area.value = area.value.substring(0, 300);

        counter.innerHTML = area.value.length + " / 300";

    });

});


// ===============================
// Finished
// ===============================