// ===============================
// Validation
// ===============================

const form = document.getElementById("profileForm");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    const studioName =
        document.getElementById("studioName");
    const photographerName =
        document.getElementById("photographerName");

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

    
    const user_object = {
        std_name: studioName.value.trim(),
        std_tag: document.getElementById("studioTagline").value.trim(),
        full_name: photographerName.value.trim(),
        experience: document.getElementById("photographerExperience").value.trim(),
        specialization: document.getElementById("specialization").value.trim(),
        about: document.getElementById("about").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        std_address: document.getElementById("address").value.trim(),
        insta_handle: document.getElementById("instagram").value.trim(),
        facebook_handle: document.getElementById("facebook").value.trim(),
        yt_handle: document.getElementById("youtube").value.trim()
    };
    
    const user_data = JSON.stringify(user_object);

    fetch("/api/update_user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: user_data
    })
    .then(response => response.json())
    .then(data => {
        if (data.redirect) {
                window.location.href = data.redirect;
                return;
            }
        if (data.error) {
            console.error("Error updating user:", data.error);
            alert("Error updating user: " + data.error);
        } else {
            console.log("User updated successfully:", data);
            alert("User updated successfully!");
        }
            
    })

    // window.location.href = "services-setup.html";

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