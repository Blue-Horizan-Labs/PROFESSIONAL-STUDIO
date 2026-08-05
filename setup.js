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