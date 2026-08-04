/* ==========================================================
   PROFESSIONAL STUDIO
   BOOKING DASHBOARD
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       ELEMENTS
    ========================================== */

    const cards = document.querySelectorAll(".booking-card");

    const searchInput = document.querySelector(".filter-section input");

    const statusFilter = document.querySelectorAll(".filter-section select")[0];

    const serviceFilter = document.querySelectorAll(".filter-section select")[1];

    /* ==========================================
       SEARCH
    ========================================== */

    function filterCards() {

        const search = searchInput.value.toLowerCase();

        const status = statusFilter.value.toLowerCase();

        const service = serviceFilter.value.toLowerCase();

        cards.forEach(card => {

            const text = card.innerText.toLowerCase();

            let visible = true;

            if (search !== "" && !text.includes(search))
                visible = false;

            if (status !== "all status" && !text.includes(status))
                visible = false;

            if (service !== "all services" && !text.includes(service))
                visible = false;

            card.style.display = visible ? "block" : "none";

        });

    }

    if (searchInput)
        searchInput.addEventListener("keyup", filterCards);

    if (statusFilter)
        statusFilter.addEventListener("change", filterCards);

    if (serviceFilter)
        serviceFilter.addEventListener("change", filterCards);

    /* ==========================================
       CARD ENTRANCE ANIMATION
    ========================================== */

    cards.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(40px)";

        setTimeout(() => {

            card.style.transition = ".6s ease";

            card.style.opacity = "1";

            card.style.transform = "translateY(0)";

        }, index * 120);

    });

    /* ==========================================
       STATISTICS COUNTER
    ========================================== */

    const stats = document.querySelectorAll(".stat-card h2");

    stats.forEach(stat => {

        const target = parseInt(stat.innerText);

        let count = 0;

        const speed = Math.max(1, Math.floor(target / 40));

        const timer = setInterval(() => {

            count += speed;

            if (count >= target) {

                count = target;

                clearInterval(timer);

            }

            stat.innerText = count;

        }, 25);

    });

    /* ==========================================
       RIPPLE EFFECT
    ========================================== */

    document.querySelectorAll("button").forEach(button => {

        button.addEventListener("click", function (e) {

            const ripple = document.createElement("span");

            ripple.className = "ripple";

            const rect = this.getBoundingClientRect();

            ripple.style.left = `${e.clientX - rect.left}px`;

            ripple.style.top = `${e.clientY - rect.top}px`;

            this.appendChild(ripple);

            setTimeout(() => {

                ripple.remove();

            }, 600);

        });

    });

    /* ==========================================
       QUICK ACTIONS
    ========================================== */

    document.querySelectorAll(".action-grid button").forEach(btn => {

        btn.addEventListener("click", () => {

            alert(btn.innerText.trim() + " clicked.");

        });

    });

    /* ==========================================
       ACCEPT / REJECT BOOKING
    ========================================== */

    document.querySelectorAll(".booking-card").forEach(card => {

        const acceptBtn = card.querySelector(".accept-btn");

        const rejectBtn = card.querySelector(".reject-btn");

        if (!acceptBtn || !rejectBtn) return;

        acceptBtn.addEventListener("click", () => {

            acceptBtn.innerHTML =
                '<i class="fa-solid fa-check"></i> Accepted';

            acceptBtn.disabled = true;

            acceptBtn.style.background = "#16a34a";

            rejectBtn.disabled = true;

            rejectBtn.style.opacity = ".45";

            rejectBtn.style.cursor = "not-allowed";

        });

        rejectBtn.addEventListener("click", () => {

            rejectBtn.innerHTML =
                '<i class="fa-solid fa-xmark"></i> Rejected';

            rejectBtn.disabled = true;

            rejectBtn.style.background = "#dc2626";

            acceptBtn.disabled = true;

            acceptBtn.style.opacity = ".45";

            acceptBtn.style.cursor = "not-allowed";

        });

    });

    /* ==========================================
       BOOKING DRAWER
    ========================================== */

    const drawer = document.querySelector(".booking-drawer");

    const overlay = document.querySelector(".drawer-overlay");

    const closeDrawer = document.querySelector(".close-drawer");

    if (drawer && overlay && closeDrawer) {

        document.querySelectorAll(".view-btn").forEach(btn => {

            btn.addEventListener("click", () => {

                drawer.classList.add("active");

                overlay.classList.add("active");

            });

        });

        function hideDrawer() {

            drawer.classList.remove("active");

            overlay.classList.remove("active");

        }

        closeDrawer.addEventListener("click", hideDrawer);

        overlay.addEventListener("click", hideDrawer);

    }

    /* ==========================================
       NOTIFICATION
    ========================================== */

    const bell = document.querySelector(".notification");

    if (bell) {

        bell.addEventListener("click", () => {

            alert("No new notifications.");

        });

    }

    /* ==========================================
       ESC KEY CLOSES DRAWER
    ========================================== */

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            if (drawer && overlay) {

                drawer.classList.remove("active");
                overlay.classList.remove("active");

            }

        }

    });

    /* ==========================================
       BUTTON LOADING EFFECT
    ========================================== */

    document.querySelectorAll(".booking-buttons button").forEach(button => {

        button.addEventListener("click", function () {

            if (this.disabled) return;

            this.style.transform = "scale(.97)";

            setTimeout(() => {

                this.style.transform = "";

            },150);

        });

    });

    /* ==========================================
       CARD HOVER EFFECT
    ========================================== */

    cards.forEach(card => {

        card.addEventListener("mouseenter", () => {

            card.style.transition = ".35s";

        });

    });

    /* ==========================================
       AUTO HIGHLIGHT TODAY'S EVENTS
    ========================================== */

    document.querySelectorAll(".timeline-card").forEach(card => {

        if(card.innerText.toLowerCase().includes("today")){

            card.style.border = "1px solid #8b5cf6";

            card.style.boxShadow =
            "0 0 25px rgba(124,58,237,.25)";

        }

    });

    /* ==========================================
       CONSOLE MESSAGE
    ========================================== */

    console.log(
        "%cProfessional Studio Dashboard Loaded",
        "color:#8b5cf6;font-size:16px;font-weight:bold;"
    );

});