
document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // Animated Counters
    // ===============================

    const counters = document.querySelectorAll(".counter");

    counters.forEach(counter => {

        const target = Number(counter.dataset.target);

        let count = 0;

        const speed = Math.max(1, Math.ceil(target / 80));

        const updateCounter = () => {

            count += speed;

            if (count >= target) {

                counter.textContent = target;

            } else {

                counter.textContent = count;

                requestAnimationFrame(updateCounter);

            }

        };

        updateCounter();

    });

    // ===============================
    // Progress Bars
    // ===============================

    const progressBars = document.querySelectorAll(".progress-fill");

    progressBars.forEach(bar => {

        const width = bar.dataset.width;

        setTimeout(() => {

            bar.style.width = width + "%";

        }, 300);

    });

    // ===============================
    // Smooth Scroll Navigation
    // ===============================

    document.querySelectorAll(".navbar a").forEach(link => {

        link.addEventListener("click", function (e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (target) {

                e.preventDefault();

                target.scrollIntoView({

                    behavior: "smooth"

                });

            }

        });

    });

    // ===============================
    // Active Navigation Highlight
    // ===============================

    const sections = document.querySelectorAll("section[id]");

    const navLinks = document.querySelectorAll(".navbar nav a");

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {

            const sectionTop = section.offsetTop - 120;

            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + sectionHeight) {

                current = section.getAttribute("id");

            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {

                link.classList.add("active");

            }

        });

    });

    // ===============================
    // Button Click Animation
    // ===============================

    document.querySelectorAll("button").forEach(button => {

        button.addEventListener("click", () => {

            button.style.transform = "scale(.95)";

            setTimeout(() => {

                button.style.transform = "scale(1)";

            }, 150);

        });

    });

    // ===============================
    // Welcome Notification
    // ===============================

    setTimeout(() => {

        console.log("PhotoSaaS Admin Dashboard Loaded Successfully");

    }, 500);

});

// ===============================
// Placeholder Functions
// (Backend Integration Later)
// ===============================

function approvePhotographer(id){

    console.log("Approve Photographer :", id);

}

function suspendPhotographer(id){

    console.log("Suspend Photographer :", id);

}

function deletePhotographer(id){

    console.log("Delete Photographer :", id);

}

function updateSubscription(id){

    console.log("Update Subscription :", id);

}

function openSupportTicket(id){

    console.log("Support Ticket :", id);

}

function viewPayment(id){

    console.log("Payment :", id);

}

function createAnnouncement(){

    console.log("Announcement");

}

function savePlatformSettings(){

    console.log("Settings Saved");

}