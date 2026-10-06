/* =========================================
   PROFESSIONAL STUDIO HOMEPAGE
   ========================================= */

const root = document.documentElement;
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const navbar = document.querySelector(".navbar");

root.classList.add("js");


/* =========================================
   MOBILE NAVIGATION
   ========================================= */

const closeMobileMenu = () => {

    if (!navLinks) {
        return;
    }

    navLinks.classList.remove("show-menu");

    if (menuBtn) {
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        const icon = menuBtn.querySelector("i");

        if (icon) {
            icon.classList.remove("ri-close-line");
            icon.classList.add("ri-menu-line");
        }
    }

};


const openMobileMenu = () => {

    if (!navLinks) {
        return;
    }

    navLinks.classList.add("show-menu");

    if (menuBtn) {
        menuBtn.setAttribute("aria-expanded", "true");
        menuBtn.setAttribute(
            "aria-label",
            "Close navigation menu"
        );

        const icon = menuBtn.querySelector("i");

        if (icon) {
            icon.classList.remove("ri-menu-line");
            icon.classList.add("ri-close-line");
        }
    }

};


if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", () => {

        const isOpen =
            navLinks.classList.contains("show-menu");

        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }

    });


    navLinks
        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                closeMobileMenu
            );

        });


    document.addEventListener("click", (event) => {

        if (
            navLinks.classList.contains("show-menu") &&
            !navLinks.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {

            closeMobileMenu();

        }

    });


    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            closeMobileMenu();

            if (document.activeElement === menuBtn) {
                menuBtn.blur();
            }

        }

    });


    window.addEventListener("resize", () => {

        if (window.innerWidth > 992) {
            closeMobileMenu();
        }

    });

}


/* =========================================
   STICKY NAVBAR
   ========================================= */

const updateNavbar = () => {

    if (!navbar) {
        return;
    }

    navbar.classList.toggle(
        "sticky",
        window.scrollY > 24
    );

};

window.addEventListener(
    "scroll",
    updateNavbar,
    { passive: true }
);

updateNavbar();


/* =========================================
   SMOOTH IN-PAGE NAVIGATION
   ========================================= */

const inPageLinks = document.querySelectorAll(
    'a[href^="#"]'
);

inPageLinks.forEach((anchor) => {

    anchor.addEventListener(
        "click",
        (event) => {

            const selector =
                anchor.getAttribute("href");

            if (
                !selector ||
                selector === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(selector);

            if (!target) {
                return;
            }

            event.preventDefault();

            const reducedMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;

            target.scrollIntoView({
                behavior: reducedMotion
                    ? "auto"
                    : "smooth",
                block: "start"
            });

            closeMobileMenu();

        }
    );

});


/* =========================================
   FAQ ACCORDION
   ========================================= */

const faqItems = [
    ...document.querySelectorAll(".faq-item")
];

const closeFaqItem = (item) => {

    item.classList.remove("active");

    const question =
        item.querySelector(".faq-question");

    const answer =
        item.querySelector(".faq-answer");

    if (question) {
        question.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    if (answer) {
        answer.setAttribute(
            "aria-hidden",
            "true"
        );
    }

};


const openFaqItem = (item) => {

    item.classList.add("active");

    const question =
        item.querySelector(".faq-question");

    const answer =
        item.querySelector(".faq-answer");

    if (question) {
        question.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    if (answer) {
        answer.setAttribute(
            "aria-hidden",
            "false"
        );
    }

};


faqItems.forEach((item, index) => {

    const question =
        item.querySelector(".faq-question");

    const answer =
        item.querySelector(".faq-answer");

    if (!question || !answer) {
        return;
    }

    const answerId =
        answer.id || `faq-answer-${index + 1}`;

    answer.id = answerId;

    question.setAttribute(
        "aria-controls",
        answerId
    );

    question.setAttribute(
        "aria-expanded",
        item.classList.contains("active")
            ? "true"
            : "false"
    );

    answer.setAttribute(
        "aria-hidden",
        item.classList.contains("active")
            ? "false"
            : "true"
    );


    question.addEventListener(
        "click",
        () => {

            const isOpen =
                item.classList.contains("active");

            faqItems.forEach(closeFaqItem);

            if (!isOpen) {
                openFaqItem(item);
            }

        }
    );

});


/* =========================================
   ACTIVE NAVIGATION
   ========================================= */

const navItems = [
    ...document.querySelectorAll(
        '.nav-links a[href^="#"]'
    )
];

const navTargets = navItems
    .map((link) => {

        const selector =
            link.getAttribute("href");

        if (
            !selector ||
            selector === "#"
        ) {
            return null;
        }

        const target =
            document.querySelector(selector);

        return target
            ? {
                link,
                target
            }
            : null;

    })
    .filter(Boolean);


const updateActiveNav = () => {

    if (!navTargets.length) {
        return;
    }

    const scrollPosition =
        window.scrollY + 170;

    let current =
        navTargets[0].target.id;

    navTargets.forEach(({ target }) => {

        if (
            scrollPosition >=
            target.offsetTop
        ) {
            current = target.id;
        }

    });

    navItems.forEach((link) => {

        const isActive =
            link.getAttribute("href") ===
            `#${current}`;

        link.classList.toggle(
            "active",
            isActive
        );

        if (isActive) {
            link.setAttribute(
                "aria-current",
                "location"
            );
        } else {
            link.removeAttribute(
                "aria-current"
            );
        }

    });

};


let activeNavTick = false;

window.addEventListener(
    "scroll",
    () => {

        if (activeNavTick) {
            return;
        }

        activeNavTick = true;

        window.requestAnimationFrame(() => {

            updateActiveNav();

            activeNavTick = false;

        });

    },
    { passive: true }
);

window.addEventListener(
    "resize",
    updateActiveNav
);

updateActiveNav();


/* =========================================
   SCROLL REVEAL
   ========================================= */

const revealTargets = document.querySelectorAll(
    ".feature-card, " +
    ".portfolio-card, " +
    ".equipment-card, " +
    ".gallery-card, " +
    ".pricing-card, " +
    ".testimonial-card, " +
    ".event-card, " +
    ".step-card, " +
    ".dash-card"
);


if (
    "IntersectionObserver" in window &&
    !window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches
) {

    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("show");

                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );


    revealTargets.forEach((element) => {

        revealObserver.observe(element);

    });

} else {

    revealTargets.forEach((element) => {

        element.classList.add("show");

    });

}


/* =========================================
   IMAGE FALLBACKS
   ========================================= */

document
    .querySelectorAll("img")
    .forEach((image) => {

        image.addEventListener(
            "error",
            () => {

                if (
                    image.dataset.fallbackApplied === "true"
                ) {
                    return;
                }

                image.dataset.fallbackApplied = "true";
                image.hidden = true;

                const fallback =
                    document.createElement("div");

                fallback.className =
                    "image-fallback";

                fallback.setAttribute(
                    "role",
                    "img"
                );

                fallback.setAttribute(
                    "aria-label",
                    image.alt ||
                    "Preview image unavailable"
                );

                fallback.textContent =
                    "Preview image unavailable";

                image.parentElement?.appendChild(
                    fallback
                );

            },
            { once: true }
        );

    });


console.log(
    "Professional Studio Homepage Loaded Successfully"
);