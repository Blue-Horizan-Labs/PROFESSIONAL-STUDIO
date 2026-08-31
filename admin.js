/* ============================================================
   PROFESSIONAL STUDIO
   ADMIN DASHBOARD JAVASCRIPT
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================================
       MOBILE NAVIGATION
    ======================================================== */

    const menuButton = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".navbar nav");

    if (menuButton && nav) {

        menuButton.addEventListener("click", () => {

            nav.classList.toggle("active");

            const isOpen = nav.classList.contains("active");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        });

        nav.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {
                nav.classList.remove("active");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            });

        });

    }


    /* ========================================================
       SMOOTH SCROLL
    ======================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* ========================================================
       COUNTER ANIMATION
    ======================================================== */

    const counters = document.querySelectorAll(".counter");

    const animateCounter = counter => {

        const target = Number(counter.dataset.target);

        if (Number.isNaN(target)) return;

        const duration = 1200;
        const startTime = performance.now();

        const updateCounter = currentTime => {

            const elapsed = currentTime - startTime;

            const progress = Math.min(
                elapsed / duration,
                1
            );

            // Smooth ease-out animation
            const easedProgress =
                1 - Math.pow(1 - progress, 3);

            const currentValue =
                Math.floor(target * easedProgress);

            counter.textContent =
                currentValue.toLocaleString("en-IN");

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent =
                    target.toLocaleString("en-IN");
            }

        };

        requestAnimationFrame(updateCounter);
    };


    /* ========================================================
       INTERSECTION OBSERVER
       COUNTERS ANIMATE WHEN VISIBLE
    ======================================================== */

    if ("IntersectionObserver" in window) {

        const counterObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            animateCounter(entry.target);

                            counterObserver.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.4
                }
            );

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });

    } else {

        counters.forEach(counter => {
            animateCounter(counter);
        });

    }


    /* ========================================================
       PROGRESS BAR ANIMATION
    ======================================================== */

    const progressBars =
        document.querySelectorAll(".progress-fill");

    if ("IntersectionObserver" in window) {

        const progressObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            const bar = entry.target;

                            const width =
                                bar.dataset.width;

                            if (width) {
                                requestAnimationFrame(() => {
                                    bar.style.width =
                                        `${width}%`;
                                });
                            }

                            progressObserver.unobserve(bar);
                        }

                    });

                },
                {
                    threshold: 0.5
                }
            );

        progressBars.forEach(bar => {
            progressObserver.observe(bar);
        });

    } else {

        progressBars.forEach(bar => {

            const width = bar.dataset.width;

            if (width) {
                bar.style.width = `${width}%`;
            }

        });

    }


    /* ========================================================
       ACTIVE NAVIGATION LINK
    ======================================================== */

    const sections =
        document.querySelectorAll("section[id]");

    const navLinks =
        document.querySelectorAll(".navbar nav a");

    if (sections.length && navLinks.length) {

        const sectionObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) return;

                        const id =
                            entry.target.getAttribute("id");

                        navLinks.forEach(link => {

                            link.classList.remove("active");

                            if (
                                link.getAttribute("href") ===
                                `#${id}`
                            ) {
                                link.classList.add("active");
                            }

                        });

                    });

                },
                {
                    rootMargin: "-25% 0px -65% 0px",
                    threshold: 0
                }
            );

        sections.forEach(section => {
            sectionObserver.observe(section);
        });

    }


    /* ========================================================
       VIEW / APPROVE / REVIEW BUTTONS
    ======================================================== */

    document.querySelectorAll("button").forEach(button => {

        const text =
            button.textContent.trim().toLowerCase();

        if (
            text === "view" ||
            text === "approve" ||
            text === "review" ||
            text === "manage" ||
            text === "view details" ||
            text === "view leaderboard"
        ) {

            button.addEventListener("click", () => {

                const originalText =
                    button.textContent;

                button.classList.add("loading");

                button.textContent = "Loading...";

                setTimeout(() => {

                    button.classList.remove("loading");

                    button.textContent =
                        originalText;

                    showNotification(
                        `${originalText} action selected. Backend integration required.`,
                        "info"
                    );

                }, 500);

            });

        }

    });


    /* ========================================================
       NOTIFICATION SYSTEM
    ======================================================== */

    function showNotification(message, type = "info") {

        let container =
            document.querySelector(".notification-container");

        if (!container) {

            container =
                document.createElement("div");

            container.className =
                "notification-container";

            document.body.appendChild(container);

        }

        const notification =
            document.createElement("div");

        notification.className =
            `notification notification-${type}`;

        notification.innerHTML = `
            <span class="notification-icon">
                ${type === "success" ? "✓" : "i"}
            </span>

            <span class="notification-message">
                ${message}
            </span>

            <button
                class="notification-close"
                aria-label="Close notification"
            >
                ×
            </button>
        `;

        container.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add("show");
        });

        const closeButton =
            notification.querySelector(
                ".notification-close"
            );

        closeButton.addEventListener(
            "click",
            () => removeNotification(notification)
        );

        setTimeout(() => {
            removeNotification(notification);
        }, 4000);

    }


    function removeNotification(notification) {

        if (!notification) return;

        notification.classList.remove("show");

        setTimeout(() => {

            if (notification.parentNode) {
                notification.remove();
            }

        }, 300);

    }


    /* ========================================================
       TABLE ROW HOVER / CLICK FEEDBACK
    ======================================================== */

    document
        .querySelectorAll("table tbody tr")
        .forEach(row => {

            row.addEventListener("click", event => {

                if (
                    event.target.closest("button")
                ) {
                    return;
                }

                document
                    .querySelectorAll("table tbody tr.selected")
                    .forEach(selectedRow => {
                        selectedRow.classList.remove(
                            "selected"
                        );
                    });

                row.classList.add("selected");

            });

        });


    /* ========================================================
       DASHBOARD CARD HOVER ACCESSIBILITY
    ======================================================== */

    document
        .querySelectorAll(
            ".stat-card, .subscription-card, .analytics-card, .setting-card"
        )
        .forEach(card => {

            card.addEventListener("mouseenter", () => {
                card.classList.add("is-hovered");
            });

            card.addEventListener("mouseleave", () => {
                card.classList.remove("is-hovered");
            });

        });


    /* ========================================================
       CURRENT YEAR
    ======================================================== */

    document
        .querySelectorAll("[data-current-year]")
        .forEach(element => {

            element.textContent =
                new Date().getFullYear();

        });


    /* ========================================================
       INITIAL PAGE STATE
    ======================================================== */

    document.body.classList.add("dashboard-ready");

});