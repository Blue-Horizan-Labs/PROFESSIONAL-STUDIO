// ======================================
// Photographer Portfolio - Client.js
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    // ==========================
    // Experience Meter Animation
    // ==========================

    const meterObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const meter = entry.target;
                const value = meter.dataset.value;

                meter.style.width = value + "%";

                meterObserver.unobserve(meter);

            }

        });

    }, {
        threshold: 0.5
    });


    document.querySelectorAll(".meter-fill").forEach(meter => {

        meter.style.width = "0%";
        meterObserver.observe(meter);

    });


    // ==========================
    // Smooth Scrolling
    // ==========================

    document.querySelectorAll('nav a[href^="#"]').forEach(link => {

        link.addEventListener("click", function (e) {

            e.preventDefault();

            const target =
                document.querySelector(
                    this.getAttribute("href")
                );

            if (target) {

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    // ==========================
    // Fade-In Animation
    // ==========================

    const fadeElements = document.querySelectorAll(
        ".portfolio-block, .work-card, .exp-box, .contact-info"
    );


    fadeElements.forEach(element => {

        element.style.opacity = "0";
        element.style.transform = "translateY(40px)";
        element.style.transition = "all 0.8s ease";

    });


    const fadeObserver =
        new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";

                    fadeObserver.unobserve(entry.target);

                }

            });

        }, {
            threshold: 0.2
        });


    fadeElements.forEach(element => {

        fadeObserver.observe(element);

    });


    // ==========================
    // Navbar Shadow
    // ==========================

    const navbar =
        document.querySelector(".navbar");


    if (navbar) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 30) {

                navbar.style.boxShadow =
                    "0 4px 15px rgba(0,0,0,0.08)";

            } else {

                navbar.style.boxShadow =
                    "none";

            }

        });

    }


    // ==========================
    // Active Navigation Link
    // ==========================

    const sections =
        document.querySelectorAll("section[id]");


    const navLinks =
        document.querySelectorAll(
            ".navbar nav a"
        );


    window.addEventListener("scroll", () => {

        let current = "";


        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 120;


            if (window.scrollY >= sectionTop) {

                current =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(link => {

            link.classList.remove("active");


            if (
                link.getAttribute("href") ===
                "#" + current
            ) {

                link.classList.add("active");

            }

        });

    });


    // ==========================
    // Button Click Effect
    // ==========================

    document
        .querySelectorAll(".book-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    this.style.transform =
                        "scale(0.96)";


                    setTimeout(() => {

                        this.style.transform = "";

                    }, 150);

                }
            );

        });


    // ==========================
    // LOAD CLIENT SERVICES
    // ==========================

    loadClientServices();


    // ==========================
    // LOAD CLIENT EQUIPMENT
    // ==========================

    loadClientEquipment();

});


// ======================================
// SHARED SERVICE DATA
// ======================================

const SERVICE_STORAGE_KEY =
    "professionalStudio.services";


// ======================================
// GET SERVICES
// ======================================

function getClientServices() {

    try {

        const storedServices =
            localStorage.getItem(
                SERVICE_STORAGE_KEY
            );


        if (!storedServices) {

            return [];

        }


        const services =
            JSON.parse(storedServices);


        if (!Array.isArray(services)) {

            return [];

        }


        return services;

    }
    catch (error) {

        console.error(
            "Could not load services:",
            error
        );

        return [];

    }

}


// ======================================
// FORMAT PRICE
// ======================================

function formatServicePrice(price) {

    if (
        price === undefined ||
        price === null ||
        price === ""
    ) {

        return null;

    }


    if (
        typeof price === "number"
    ) {

        return "₹" +
            price.toLocaleString("en-IN");

    }


    return String(price);

}


// ======================================
// GET STARTING PRICE
// ======================================

function getStartingPrice(service) {

    if (
        !service ||
        !Array.isArray(service.packages) ||
        service.packages.length === 0
    ) {

        return null;

    }


    const prices =
        service.packages
            .map(pkg => {

                if (
                    typeof pkg.price === "number"
                ) {

                    return pkg.price;

                }


                const numericPrice =
                    String(pkg.price)
                        .replace(/[^\d.]/g, "");


                return parseFloat(
                    numericPrice
                );

            })
            .filter(price =>
                !isNaN(price)
            );


    if (!prices.length) {

        return null;

    }


    return Math.min(...prices);

}


// ======================================
// CREATE SERVICE CARD
// ======================================

function createServiceCard(service) {

    const card =
        document.createElement("div");


    card.className =
        "price-card service-preview-card";


    const startingPrice =
        getStartingPrice(service);


    const priceText =
        startingPrice !== null
            ? formatServicePrice(
                startingPrice
            )
            : "Contact for pricing";


    const description =
        service.description ||
        "Professional photography service tailored to your needs.";


    const packageCount =
        Array.isArray(service.packages)
            ? service.packages.length
            : 0;


    card.innerHTML = `

        <h3>
            ${escapeServiceHTML(
                service.name ||
                "Photography Service"
            )}
        </h3>

        <div class="price">

            From ${priceText}

        </div>

        <p class="service-preview-description">

            ${escapeServiceHTML(
                description
            )}

        </p>

        <ul>

            <li>
                ✔ ${packageCount} Package${packageCount === 1 ? "" : "s"} Available
            </li>

            ${
                service.coverageDuration
                    ? `
                        <li>
                            ✔ ${escapeServiceHTML(
                                service.coverageDuration
                            )} Coverage
                        </li>
                    `
                    : ""
            }

            ${
                service.deliveryTime
                    ? `
                        <li>
                            ✔ Delivery in ${escapeServiceHTML(
                                service.deliveryTime
                            )}
                        </li>
                    `
                    : ""
            }

        </ul>

        <div class="service-preview-actions">

            <a
                href="service.html?id=${encodeURIComponent(
                    service.id
                )}"
                class="book-btn"
            >
                View Service
            </a>

            <a
                href="service.html?id=${encodeURIComponent(
                    service.id
                )}&action=book"
                class="book-btn"
            >
                Book Service
            </a>

        </div>

    `;


    return card;

}


// ======================================
// LOAD SERVICES ON CLIENT PAGE
// ======================================

function loadClientServices() {

    const container =
        document.getElementById(
            "servicesContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const services =
        getClientServices();


    const activeServices =
        services.filter(service =>
            service &&
            service.active === true
        );


    if (!activeServices.length) {

        container.innerHTML = `

            <div class="service-empty-state">

                <h3>
                    Services Coming Soon
                </h3>

                <p>
                    Photography services are currently being updated.
                </p>

            </div>

        `;

        return;

    }


    activeServices.forEach(service => {

        const card =
            createServiceCard(service);


        container.appendChild(card);

    });


    // Add the button effect to newly
    // generated service buttons.

    container
        .querySelectorAll(".book-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    this.style.transform =
                        "scale(0.96)";


                    setTimeout(() => {

                        this.style.transform = "";

                    }, 150);

                }
            );

        });

}


// ======================================
// ESCAPE SERVICE TEXT
// ======================================

function escapeServiceHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;

}


// ======================================
// UPDATE SERVICES IF CHANGED
// ======================================

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            SERVICE_STORAGE_KEY
        ) {

            loadClientServices();

        }

    }
);


// ======================================
// SHARED EQUIPMENT DATA
// ======================================

const EQUIPMENT_STORAGE_KEY =
    "professionalStudio.equipment";


// ======================================
// GET EQUIPMENT
// ======================================

function getClientEquipment() {

    try {

        const storedEquipment =
            localStorage.getItem(
                EQUIPMENT_STORAGE_KEY
            );


        if (!storedEquipment) {

            return [];

        }


        const equipment =
            JSON.parse(
                storedEquipment
            );


        if (!Array.isArray(equipment)) {

            return [];

        }


        return equipment;

    }
    catch (error) {

        console.error(
            "Could not load equipment:",
            error
        );

        return [];

    }

}


// ======================================
// EQUIPMENT CATEGORY ICON
// ======================================

function getEquipmentIcon(categoryName) {

    const name =
        String(
            categoryName || ""
        ).toLowerCase();


    if (name.includes("camera")) {

        return "fa-solid fa-camera";

    }


    if (name.includes("lens")) {

        return "fa-solid fa-circle-dot";

    }


    if (name.includes("light")) {

        return "fa-solid fa-lightbulb";

    }


    if (name.includes("drone")) {

        return "fa-solid fa-video";

    }


    if (
        name.includes("audio") ||
        name.includes("sound") ||
        name.includes("microphone")
    ) {

        return "fa-solid fa-microphone";

    }


    return "fa-solid fa-camera-retro";

}


// ======================================
// CREATE EQUIPMENT CATEGORY
// ======================================

function createEquipmentCategory(category) {

    const categoryCard =
        document.createElement("div");


    categoryCard.className =
        "equipment-category-card";


    // ==========================
    // Category Heading
    // ==========================

    const heading =
        document.createElement("div");


    heading.className =
        "equipment-category-heading";


    const icon =
        document.createElement("i");


    icon.className =
        getEquipmentIcon(
            category.name
        );


    const title =
        document.createElement("h3");


    title.textContent =
        category.name;


    heading.appendChild(icon);

    heading.appendChild(title);


    // ==========================
    // Equipment Bullet List
    // ==========================

    const list =
        document.createElement("ul");


    list.className =
        "equipment-items";


    category.items.forEach(item => {

        const equipmentItem =
            document.createElement("li");


        equipmentItem.className =
            "equipment-item";


        const itemName =
            document.createElement("span");


        itemName.textContent =
            item;


        equipmentItem.appendChild(
            itemName
        );


        list.appendChild(
            equipmentItem
        );

    });


    categoryCard.appendChild(
        heading
    );


    categoryCard.appendChild(
        list
    );


    return categoryCard;

}


// ======================================
// LOAD EQUIPMENT
// ======================================

function loadClientEquipment() {

    const container =
        document.getElementById(
            "equipmentGrid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const equipment =
        getClientEquipment();


    let validCategories = 0;


    equipment.forEach(category => {

        if (
            !category ||
            !category.name ||
            !Array.isArray(
                category.items
            )
        ) {

            return;

        }


        const validItems =
            category.items.filter(item => {

                return (
                    item !== undefined &&
                    item !== null &&
                    String(item).trim() !== ""
                );

            });


        // Do not display empty categories.

        if (!validItems.length) {

            return;

        }


        const categoryData = {

            name:
                String(
                    category.name
                ),

            items:
                validItems.map(item => {

                    return String(
                        item
                    );

                })

        };


        const categoryCard =
            createEquipmentCategory(
                categoryData
            );


        container.appendChild(
            categoryCard
        );


        validCategories++;

    });


    // ==========================
    // Empty Equipment State
    // ==========================

    if (
        validCategories === 0
    ) {

        const emptyState =
            document.createElement(
                "div"
            );


        emptyState.className =
            "equipment-empty-state";


        emptyState.innerHTML = `

            <h3>
                Professional Equipment
            </h3>

            <p>
                Equipment details will be available soon.
            </p>

        `;


        container.appendChild(
            emptyState
        );


        return;

    }


    animateEquipmentCategories();

}


// ======================================
// EQUIPMENT ANIMATION
// ======================================

function animateEquipmentCategories() {

    const container =
        document.getElementById(
            "equipmentGrid"
        );


    if (!container) {

        return;

    }


    const cards =
        container.querySelectorAll(
            ".equipment-category-card"
        );


    if (!cards.length) {

        return;

    }


    const observer =
        new IntersectionObserver(
            function(entries) {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.style.opacity =
                            "1";

                        entry.target.style.transform =
                            "translateY(0)";


                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.2
            }
        );


    cards.forEach(card => {

        card.style.opacity =
            "0";

        card.style.transform =
            "translateY(40px)";

        card.style.transition =
            "0.6s";


        observer.observe(
            card
        );

    });

}


// ======================================
// LIVE EQUIPMENT UPDATES
// ======================================

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            EQUIPMENT_STORAGE_KEY
        ) {

            loadClientEquipment();

        }

    }
);