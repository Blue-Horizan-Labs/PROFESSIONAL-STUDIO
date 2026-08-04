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

            if (
                status !== "all status" &&
                !text.includes(status)
            )
                visible = false;

            if (
                service !== "all services" &&
                !text.includes(service)
            )
                visible = false;

            card.style.display = visible ? "block" : "none";

        });

    }

    searchInput.addEventListener("keyup", filterCards);
    statusFilter.addEventListener("change", filterCards);
    serviceFilter.addEventListener("change", filterCards);

    /* ==========================================
       CARD ENTRANCE
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
       STAT COUNTER
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
       BUTTON RIPPLE EFFECT
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
       BOOKING BUTTONS
    ========================================== */

    document.querySelectorAll(".accept-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            btn.innerText = "Accepted";
            btn.disabled = true;

        });

    });

    document.querySelectorAll(".reject-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            btn.innerText = "Rejected";
            btn.disabled = true;

        });

    });

    /* ==========================================
       NOTIFICATION
    ========================================== */

    const bell = document.querySelector(".notification");

    if (bell) {

        bell.addEventListener("click", () => {

            alert("No new notifications.");

        });

    }

});