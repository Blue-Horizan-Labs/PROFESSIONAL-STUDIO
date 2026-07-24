// ======================================
// Photographer Portfolio - Home.js
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

            const target = document.querySelector(this.getAttribute("href"));

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

    const fadeObserver = new IntersectionObserver((entries) => {

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

    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 30) {

            navbar.style.boxShadow = "0 4px 15px rgba(0,0,0,0.08)";

        } else {

            navbar.style.boxShadow = "none";

        }

    });

    // ==========================
    // Active Navigation Link
    // ==========================

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".navbar nav a");

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {

            const sectionTop = section.offsetTop - 120;

            if (window.scrollY >= sectionTop) {

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

    // ==========================
    // Button Click Effect
    // ==========================

    document.querySelectorAll(".book-btn").forEach(button => {

        button.addEventListener("click", function () {

            this.style.transform = "scale(0.96)";

            setTimeout(() => {

                this.style.transform = "";

            }, 150);

        });

    });

});

// Equipment Cards Animation

const equipmentCards =
document.querySelectorAll(".equipment-card");

const equipmentObserver =
new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";

entry.target.style.transform="translateY(0)";

}

});

},{threshold:.2});

equipmentCards.forEach(card=>{

card.style.opacity="0";

card.style.transform="translateY(40px)";

card.style.transition=".6s";

equipmentObserver.observe(card);

});

// ===============================
// Pricing Section
// ===============================

const pricingData = {

    wedding: [

        {
            name:"Basic",
            price:"₹20,000",
            features:[
                "4 Hours Coverage",
                "100 Edited Photos",
                "Traditional Photography",
                "Online Gallery"
            ]
        },

        {
            name:"Premium",
            price:"₹45,000",
            featured:true,
            features:[
                "8 Hours Coverage",
                "Drone Included",
                "Cinematic Video",
                "300 Edited Photos"
            ]
        },

        {
            name:"Luxury",
            price:"₹80,000",
            features:[
                "Full Day Coverage",
                "Premium Album",
                "Pre-Wedding Included",
                "Unlimited Edited Photos"
            ]
        }

    ],

    prewedding:[

        {
            name:"Basic",
            price:"₹10,000",
            features:[
                "2 Hours",
                "50 Photos",
                "Outdoor Shoot"
            ]
        },

        {
            name:"Premium",
            price:"₹18,000",
            featured:true,
            features:[
                "4 Hours",
                "Drone",
                "120 Photos"
            ]
        }

    ],

    portrait:[

        {
            name:"Standard",
            price:"₹3,000",
            features:[
                "1 Hour",
                "20 Edited Photos",
                "Studio Lighting"
            ]
        },

        {
            name:"Premium",
            price:"₹6,000",
            featured:true,
            features:[
                "2 Hours",
                "50 Photos",
                "Outdoor + Studio"
            ]
        }

    ],

    event:[

        {
            name:"Basic",
            price:"₹12,000",
            features:[
                "4 Hours",
                "150 Photos"
            ]
        },

        {
            name:"Premium",
            price:"₹25,000",
            featured:true,
            features:[
                "8 Hours",
                "Drone Included",
                "300 Photos"
            ]
        }

    ],

    commercial:[

        {
            name:"Business",
            price:"₹15,000",
            features:[
                "Product Photography",
                "Basic Editing"
            ]
        },

        {
            name:"Enterprise",
            price:"₹35,000",
            featured:true,
            features:[
                "Full Commercial Shoot",
                "Premium Editing",
                "Brand Content"
            ]
        }

    ]

};

const pricingContainer =
document.getElementById("pricingContainer");

const tabButtons =
document.querySelectorAll(".tab-btn");

function loadPricing(service){

    pricingContainer.innerHTML="";

    pricingData[service].forEach(pkg=>{

        let featureList="";

        pkg.features.forEach(f=>{

            featureList+=`<li>✔ ${f}</li>`;

        });

        pricingContainer.innerHTML+=`

        <div class="price-card ${pkg.featured?"featured":""}">

        ${pkg.featured?
        '<span class="featured-badge">Most Popular</span>':''
        }

        <h3>${pkg.name}</h3>

        <div class="price">

        ${pkg.price}

        </div>

        <ul>

        ${featureList}

        </ul>

        <a href="booking.html"

        class="book-btn">

        Book Now

        </a>

        </div>

        `;

    });

}

tabButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        tabButtons.forEach(b=>b.classList.remove("active"));

        btn.classList.add("active");

        loadPricing(btn.dataset.service);

    });

});

loadPricing("wedding");