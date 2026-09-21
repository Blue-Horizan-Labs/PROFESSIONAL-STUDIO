/* =========================================================
   PROFESSIONAL STUDIO
   PUBLIC PHOTOGRAPHER PROFILE
   FRONTEND JAVASCRIPT
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

var SERVICES_STORAGE_KEY =
    "professionalStudio.services";

var EQUIPMENT_STORAGE_KEY =
    "professionalStudio.equipment";

var PROFILE_STORAGE_KEY =
    "professionalStudio.profile";


/* =========================================================
   SAFE JSON READER
========================================================= */

function readClientLocalStorage(
    key,
    fallback
) {

    var saved =
        localStorage.getItem(key);


    if (!saved) {
        return fallback;
    }


    try {

        return JSON.parse(saved);

    } catch (error) {

        return fallback;

    }

}


/* =========================================================
   PROFILE
========================================================= */

function getClientProfile() {

    var profile =
        readClientLocalStorage(
            PROFILE_STORAGE_KEY,
            null
        );


    if (
        profile &&
        typeof profile === "object" &&
        !Array.isArray(profile)
    ) {

        return profile;

    }


    /*
       Keep compatibility with older frontend
       profile values without creating a new
       profile storage system.
    */

    var name =
        localStorage.getItem(
            "photographerName"
        );


    if (
        name &&
        name.trim()
    ) {

        return {
            name: name.trim()
        };

    }


    return {};

}


/* =========================================================
   PROFILE VALUE HELPER
========================================================= */

function getProfileValue(
    profile,
    keys,
    fallback
) {

    if (
        !profile ||
        typeof profile !== "object"
    ) {

        return fallback || "";

    }


    for (
        var i = 0;
        i < keys.length;
        i++
    ) {

        var value =
            profile[keys[i]];


        if (
            typeof value === "string" &&
            value.trim()
        ) {

            return value.trim();

        }


        if (
            typeof value === "number"
        ) {

            return String(
                value
            );

        }

    }


    return fallback || "";

}


/* =========================================================
   PROFILE NAME
========================================================= */

function getClientPhotographerName() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "name",
            "fullName",
            "photographerName",
            "displayName"
        ],
        "Photographer"
    );

}


/* =========================================================
   PROFILE STUDIO NAME
========================================================= */

function getClientStudioName() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "studioName",
            "businessName",
            "companyName",
            "brandName"
        ],
        ""
    );

}


/* =========================================================
   PROFILE ABOUT
========================================================= */

function getClientAbout() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "about",
            "aboutMe",
            "bio",
            "description",
            "profileDescription"
        ],
        ""
    );

}


/* =========================================================
   PROFILE LOCATION
========================================================= */

function getClientLocation() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "location",
            "city",
            "address",
            "locationName"
        ],
        ""
    );

}


/* =========================================================
   PROFILE PHONE
========================================================= */

function getClientPhone() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "phone",
            "phoneNumber",
            "mobile",
            "contactNumber"
        ],
        ""
    );

}


/* =========================================================
   PROFILE EMAIL
========================================================= */

function getClientEmail() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "email",
            "emailAddress",
            "contactEmail"
        ],
        ""
    );

}


/* =========================================================
   PROFILE SOCIAL LINKS
========================================================= */

function getClientSocialLinks() {

    var profile =
        getClientProfile();


    var social =
        profile.social ||
        profile.socialLinks ||
        profile.socialMedia ||
        {};


    if (
        !social ||
        typeof social !== "object"
    ) {

        social = {};

    }


    return {

        instagram:
            getProfileValue(
                social,
                [
                    "instagram",
                    "instagramUrl"
                ],
                ""
            ),

        facebook:
            getProfileValue(
                social,
                [
                    "facebook",
                    "facebookUrl"
                ],
                ""
            ),

        youtube:
            getProfileValue(
                social,
                [
                    "youtube",
                    "youtubeUrl"
                ],
                ""
            )

    };

}


/* =========================================================
   SAFE URL
========================================================= */

function getSafeProfileUrl(
    value
) {

    if (
        typeof value !== "string"
    ) {

        return "";

    }


    var url =
        value.trim();


    if (!url) {
        return "";
    }


    /*
       Only allow normal web URLs for the
       public social links.
    */

    if (
        url.indexOf("https://") === 0 ||
        url.indexOf("http://") === 0
    ) {

        return url;

    }


    return "";

}


/* =========================================================
   PROFILE ELEMENT HELPER
========================================================= */

function setProfileText(
    selector,
    value
) {

    if (!value) {
        return;
    }


    var element =
        document.querySelector(
            selector
        );


    if (!element) {
        return;
    }


    element.textContent =
        value;

}


/* =========================================================
   PROFILE DATA ATTRIBUTES
   These are intentionally optional.

   If the corresponding attributes are added
   to the HTML later, the same JS will work
   without changing the profile data structure.
========================================================= */

function renderProfileDataAttributes() {

    var profile =
        getClientProfile();


    document
        .querySelectorAll(
            "[data-profile-field]"
        )
        .forEach(
            function(element) {

                var field =
                    element.dataset.profileField;


                if (!field) {
                    return;
                }


                var value =
                    getProfileValue(
                        profile,
                        [
                            field
                        ],
                        ""
                    );


                if (!value) {
                    return;
                }


                element.textContent =
                    value;

            }
        );

}


/* =========================================================
   PHOTOGRAPHER NAME
========================================================= */

function renderClientPhotographerName() {

    var name =
        getClientPhotographerName();


    /*
       Explicit profile selectors are preferred.
       The existing page can continue working even
       if these attributes are not present yet.
    */

    document
        .querySelectorAll(
            "[data-profile-name], #profileName, #photographerName"
        )
        .forEach(
            function(element) {

                element.textContent =
                    name;

            }
        );


    /*
       Existing hero heading fallback.

       This only updates the hero if it is clearly
       acting as the photographer heading. It does
       not replace the existing hero copy.
    */

    var heroName =
        document.querySelector(
            ".hero-content [data-profile-name]"
        );


    if (heroName) {

        heroName.textContent =
            name;

    }

}


/* =========================================================
   STUDIO NAME
========================================================= */

function renderClientStudioName() {

    var studioName =
        getClientStudioName();


    if (!studioName) {
        return;
    }


    document
        .querySelectorAll(
            "[data-profile-studio], #studioName, #photographerStudio"
        )
        .forEach(
            function(element) {

                element.textContent =
                    studioName;

            }
        );

}


/* =========================================================
   ABOUT
========================================================= */

function renderClientAbout() {

    var about =
        getClientAbout();


    if (!about) {
        return;
    }


    document
        .querySelectorAll(
            "[data-profile-about], #profileAbout, #aboutText"
        )
        .forEach(
            function(element) {

                element.textContent =
                    about;

            }
        );

}


/* =========================================================
   CONTACT INFORMATION
========================================================= */

function renderClientContact() {

    var phone =
        getClientPhone();


    var email =
        getClientEmail();


    var location =
        getClientLocation();


    document
        .querySelectorAll(
            "[data-profile-phone], #profilePhone"
        )
        .forEach(
            function(element) {

                if (phone) {

                    element.textContent =
                        phone;

                }

            }
        );


    document
        .querySelectorAll(
            "[data-profile-email], #profileEmail"
        )
        .forEach(
            function(element) {

                if (email) {

                    element.textContent =
                        email;

                }

            }
        );


    document
        .querySelectorAll(
            "[data-profile-location], #profileLocation"
        )
        .forEach(
            function(element) {

                if (location) {

                    element.textContent =
                        location;

                }

            }
        );

}


/* =========================================================
   SOCIAL LINKS
========================================================= */

function renderClientSocialLinks() {

    var social =
        getClientSocialLinks();


    var links = {

        instagram:
            getSafeProfileUrl(
                social.instagram
            ),

        facebook:
            getSafeProfileUrl(
                social.facebook
            ),

        youtube:
            getSafeProfileUrl(
                social.youtube
            )

    };


    document
        .querySelectorAll(
            "[data-social='instagram']"
        )
        .forEach(
            function(element) {

                if (links.instagram) {

                    element.href =
                        links.instagram;

                    element.target =
                        "_blank";

                    element.rel =
                        "noopener noreferrer";

                    element.hidden =
                        false;

                } else {

                    element.hidden =
                        true;

                }

            }
        );


    document
        .querySelectorAll(
            "[data-social='facebook']"
        )
        .forEach(
            function(element) {

                if (links.facebook) {

                    element.href =
                        links.facebook;

                    element.target =
                        "_blank";

                    element.rel =
                        "noopener noreferrer";

                    element.hidden =
                        false;

                } else {

                    element.hidden =
                        true;

                }

            }
        );


    document
        .querySelectorAll(
            "[data-social='youtube']"
        )
        .forEach(
            function(element) {

                if (links.youtube) {

                    element.href =
                        links.youtube;

                    element.target =
                        "_blank";

                    element.rel =
                        "noopener noreferrer";

                    element.hidden =
                        false;

                } else {

                    element.hidden =
                        true;

                }

            }
        );

}


/* =========================================================
   PUBLIC PROFILE RENDER
========================================================= */

function renderPublicProfile() {

    renderClientPhotographerName();

    renderClientStudioName();

    renderClientAbout();

    renderClientContact();

    renderClientSocialLinks();

    renderProfileDataAttributes();

}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initializeSmoothScrolling() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(
            function(link) {

                link.addEventListener(
                    "click",
                    function(event) {

                        var targetId =
                            link.getAttribute(
                                "href"
                            );


                        if (
                            !targetId ||
                            targetId === "#"
                        ) {

                            return;

                        }


                        var target =
                            document.querySelector(
                                targetId
                            );


                        if (!target) {
                            return;
                        }


                        event.preventDefault();


                        target.scrollIntoView(
                            {
                                behavior: "smooth",
                                block: "start"
                            }
                        );

                    }
                );

            }
        );

}


/* =========================================================
   INTERSECTION OBSERVER
========================================================= */

function initializeRevealAnimations() {

    var elements =
        document.querySelectorAll(
            ".portfolio-block, .work-card, .exp-box, .contact-info"
        );


    if (
        !elements.length
    ) {

        return;

    }


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            function(element) {

                element.classList.add(
                    "visible"
                );

            }
        );

        return;

    }


    var observer =
        new IntersectionObserver(
            function(entries) {

                entries.forEach(
                    function(entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    elements.forEach(
        function(element) {

            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   EXPERIENCE METERS
========================================================= */

function initializeExperienceMeters() {

    var meters =
        document.querySelectorAll(
            ".meter-fill"
        );


    if (!meters.length) {
        return;
    }


    function animateMeter(
        element
    ) {

        var value =
            Number(
                element.dataset.value
            ) || 0;


        value =
            Math.min(
                100,
                Math.max(
                    0,
                    value
                )
            );


        element.style.width =
            value + "%";

    }


    if (
        !("IntersectionObserver" in window)
    ) {

        meters.forEach(
            animateMeter
        );

        return;

    }


    var observer =
        new IntersectionObserver(
            function(entries) {

                entries.forEach(
                    function(entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            animateMeter(
                                entry.target
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.3
            }
        );


    meters.forEach(
        function(meter) {

            observer.observe(
                meter
            );

        }
    );

}


/* =========================================================
   NAVBAR
========================================================= */

function initializeNavbar() {

    var navbar =
        document.querySelector(
            ".navbar"
        );


    if (!navbar) {
        return;
    }


    function updateNavbar() {

        if (
            window.scrollY > 20
        ) {

            navbar.classList.add(
                "scrolled"
            );

        } else {

            navbar.classList.remove(
                "scrolled"
            );

        }

    }


    updateNavbar();


    window.addEventListener(
        "scroll",
        updateNavbar,
        {
            passive: true
        }
    );

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function initializeActiveNavigation() {

    var links =
        document.querySelectorAll(
            ".navbar a[href^='#']"
        );


    if (!links.length) {
        return;
    }


    var sections = [];


    links.forEach(
        function(link) {

            var href =
                link.getAttribute(
                    "href"
                );


            if (
                !href ||
                href === "#"
            ) {

                return;

            }


            var section =
                document.querySelector(
                    href
                );


            if (section) {

                sections.push(
                    {
                        link: link,
                        section: section
                    }
                );

            }

        }
    );


    if (!sections.length) {
        return;
    }


    function updateActiveLink() {

        var current =
            null;


        sections.forEach(
            function(item) {

                var top =
                    item.section.getBoundingClientRect()
                        .top;


                if (
                    top <= 140
                ) {

                    current =
                        item;

                }

            }
        );


        links.forEach(
            function(link) {

                link.classList.remove(
                    "active"
                );

            }
        );


        if (current) {

            current.link.classList.add(
                "active"
            );

        }

    }


    updateActiveLink();


    window.addEventListener(
        "scroll",
        updateActiveLink,
        {
            passive: true
        }
    );

}


/* =========================================================
   BOOK BUTTON EFFECT
========================================================= */

function initializeBookButtons() {

    document
        .querySelectorAll(
            ".book-btn"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        button.classList.add(
                            "clicked"
                        );


                        setTimeout(
                            function() {

                                button.classList.remove(
                                    "clicked"
                                );

                            },
                            160
                        );

                    }
                );

            }
        );

}


/* =========================================================
   SERVICES
========================================================= */

function getClientServices() {

    var services =
        readClientLocalStorage(
            SERVICES_STORAGE_KEY,
            []
        );


    if (
        !Array.isArray(
            services
        )
    ) {

        return [];

    }


    return services;

}


/* =========================================================
   FORMAT SERVICE PRICE
========================================================= */

function formatServicePrice(
    value
) {

    var price =
        Number(value);


    if (
        !Number.isFinite(price)
    ) {

        return "";

    }


    return "₹" +
        price.toLocaleString(
            "en-IN"
        );

}


/* =========================================================
   GET STARTING PRICE
========================================================= */

function getStartingPrice(
    service
) {

    if (
        !service ||
        !Array.isArray(
            service.packages
        )
    ) {

        return null;

    }


    var prices =
        service.packages
            .map(
                function(pkg) {

                    return Number(
                        pkg.price
                    );

                }
            )
            .filter(
                function(price) {

                    return Number.isFinite(
                        price
                    );

                }
            );


    if (!prices.length) {

        return null;

    }


    return Math.min.apply(
        null,
        prices
    );

}


/* =========================================================
   ESCAPE SERVICE HTML
========================================================= */

function escapeServiceHTML(
    value
) {

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   CREATE SERVICE CARD
========================================================= */

function createServiceCard(
    service
) {

    var card =
        document.createElement(
            "article"
        );


    card.className =
        "price-card service-preview-card";


    var name =
        service.name ||
        service.serviceName ||
        service.title ||
        "Photography Service";


    var description =
        service.description ||
        service.shortDescription ||
        "";


    var startingPrice =
        getStartingPrice(
            service
        );


    var packageCount =
        Array.isArray(
            service.packages
        )
            ? service.packages.length
            : 0;


    var details =
        document.createElement(
            "div"
        );


    details.className =
        "service-preview-content";


    var heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        name;


    details.appendChild(
        heading
    );


    if (startingPrice !== null) {

        var price =
            document.createElement(
                "div"
            );


        price.className =
            "service-preview-price";


        price.textContent =
            "From " +
            formatServicePrice(
                startingPrice
            );


        details.appendChild(
            price
        );

    }


    if (description) {

        var descriptionElement =
            document.createElement(
                "p"
            );


        descriptionElement.className =
            "service-preview-description";


        descriptionElement.textContent =
            description;


        details.appendChild(
            descriptionElement
        );

    }


    var meta =
        document.createElement(
            "div"
        );


    meta.className =
        "service-preview-meta";


    if (packageCount) {

        var packages =
            document.createElement(
                "span"
            );


        packages.textContent =
            packageCount +
            (
                packageCount === 1
                    ? " Package"
                    : " Packages"
            );


        meta.appendChild(
            packages
        );

    }


    if (
        service.coverageDuration
    ) {

        var coverage =
            document.createElement(
                "span"
            );


        coverage.textContent =
            service.coverageDuration;


        meta.appendChild(
            coverage
        );

    }


    if (
        service.deliveryTime
    ) {

        var delivery =
            document.createElement(
                "span"
            );


        delivery.textContent =
            service.deliveryTime;


        meta.appendChild(
            delivery
        );

    }


    if (
        meta.children.length
    ) {

        details.appendChild(
            meta
        );

    }


    var actions =
        document.createElement(
            "div"
        );


    actions.className =
        "service-preview-actions";


    var serviceId =
        service.id ||
        service.serviceId ||
        service.slug ||
        "";


    if (serviceId) {

        var viewLink =
            document.createElement(
                "a"
            );


        viewLink.className =
            "book-btn";


        viewLink.href =
            "service.html?id=" +
            encodeURIComponent(
                serviceId
            );


        viewLink.textContent =
            "View Service";


        actions.appendChild(
            viewLink
        );


        var bookLink =
            document.createElement(
                "a"
            );


        bookLink.className =
            "book-btn";


        bookLink.href =
            "service.html?id=" +
            encodeURIComponent(
                serviceId
            ) +
            "&action=book";


        bookLink.textContent =
            "Book Service";


        actions.appendChild(
            bookLink
        );

    }


    card.appendChild(
        details
    );


    card.appendChild(
        actions
    );


    return card;

}


/* =========================================================
   SERVICE EMPTY STATE
========================================================= */

function createServiceEmptyState() {

    var empty =
        document.createElement(
            "div"
        );


    empty.className =
        "service-empty-state";


    var heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        "Services Coming Soon";


    var text =
        document.createElement(
            "p"
        );


    text.textContent =
        "Photography services will appear here once they are available.";


    empty.appendChild(
        heading
    );


    empty.appendChild(
        text
    );


    return empty;

}


/* =========================================================
   LOAD SERVICES
========================================================= */

function loadClientServices() {

    var container =
        document.getElementById(
            "servicesContainer"
        );


    if (!container) {
        return;
    }


    var services =
        getClientServices()
            .filter(
                function(service) {

                    return (
                        service &&
                        service.active !== false
                    );

                }
            );


    container.innerHTML =
        "";


    if (!services.length) {

        container.appendChild(
            createServiceEmptyState()
        );

        return;

    }


    services.forEach(
        function(service) {

            container.appendChild(
                createServiceCard(
                    service
                )
            );

        }
    );

}


/* =========================================================
   EQUIPMENT
========================================================= */

function getClientEquipment() {

    var equipment =
        readClientLocalStorage(
            EQUIPMENT_STORAGE_KEY,
            []
        );


    if (
        !Array.isArray(
            equipment
        )
    ) {

        return [];

    }


    return equipment;

}


/* =========================================================
   EQUIPMENT ICON
========================================================= */

function getEquipmentIcon(
    category
) {

    var value =
        String(
            category || ""
        )
        .toLowerCase();


    if (
        value.indexOf(
            "camera"
        ) !== -1
    ) {

        return "fa-camera";

    }


    if (
        value.indexOf(
            "lens"
        ) !== -1
    ) {

        return "fa-circle-dot";

    }


    if (
        value.indexOf(
            "light"
        ) !== -1
    ) {

        return "fa-lightbulb";

    }


    if (
        value.indexOf(
            "drone"
        ) !== -1
    ) {

        return "fa-video";

    }


    if (
        value.indexOf(
            "audio"
        ) !== -1 ||
        value.indexOf(
            "sound"
        ) !== -1 ||
        value.indexOf(
            "microphone"
        ) !== -1
    ) {

        return "fa-microphone";

    }


    return "fa-camera-retro";

}


/* =========================================================
   LOAD EQUIPMENT
========================================================= */

function loadClientEquipment() {

    var container =
        document.getElementById(
            "equipmentGrid"
        );


    if (!container) {
        return;
    }


    var equipment =
        getClientEquipment()
            .filter(
                function(category) {

                    return (
                        category &&
                        category.name &&
                        Array.isArray(
                            category.items
                        ) &&
                        category.items.length
                    );

                }
            );


    container.innerHTML =
        "";


    if (!equipment.length) {

        var empty =
            document.createElement(
                "div"
            );


        empty.className =
            "equipment-empty-state";


        empty.textContent =
            "Equipment information will appear here once it has been added.";


        container.appendChild(
            empty
        );


        return;

    }


    equipment.forEach(
        function(category) {

            var card =
                document.createElement(
                    "article"
                );


          card.className =
    "equipment-category-card";
var heading =
    document.createElement(
        "div"
    );

heading.className =
    "equipment-category-heading";


            var icon =
                document.createElement(
                    "i"
                );


            icon.className =
                "fa-solid " +
                getEquipmentIcon(
                    category.name
                );


            icon.setAttribute(
                "aria-hidden",
                "true"
            );


            heading.appendChild(
                icon
            );


            var title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                category.name;


            heading.appendChild(
                title
            );


            var list =
                document.createElement(
                    "ul"
                );

                list.className =
    "equipment-items";


            category.items
                .filter(
                    function(item) {

                        return (
                            typeof item === "string" &&
                            item.trim()
                        );

                    }
                )
                .forEach(
                    function(item) {

                        var li =
                            document.createElement(
                                "li"
                            );


                        li.textContent =
                            item;


                        list.appendChild(
                            li
                        );

                    }
                );


            card.appendChild(
                heading
            );


            card.appendChild(
                list
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            PROFILE_STORAGE_KEY
        ) {

            renderPublicProfile();

        }


        if (
            event.key ===
            SERVICES_STORAGE_KEY
        ) {

            loadClientServices();

        }


        if (
            event.key ===
            EQUIPMENT_STORAGE_KEY
        ) {

            loadClientEquipment();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderPublicProfile();

        initializeExperienceMeters();

        initializeSmoothScrolling();

        initializeRevealAnimations();

        initializeNavbar();

        initializeActiveNavigation();

        initializeBookButtons();

        loadClientServices();

        loadClientEquipment();

    }
);