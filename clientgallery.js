/* =========================================================
   PROFESSIONAL STUDIO
   PUBLIC PHOTOGRAPHER PROFILE
   CLIENT PAGE JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   STORAGE KEYS
========================================================= */

var PROFILE_STORAGE_KEY =
    "professionalStudio.profile";

var SERVICES_STORAGE_KEY =
    "professionalStudio.services";

var EQUIPMENT_STORAGE_KEY =
    "professionalStudio.equipment";

var PORTFOLIO_STORAGE_KEY =
    "professionalStudio.portfolioStorage";


/* =========================================================
   RECENT WORK INDEXEDDB
========================================================= */

var RECENT_WORK_DB_NAME =
    "ProfessionalStudioDB";

var RECENT_WORK_DB_VERSION =
    1;

var RECENT_WORK_STORE_NAME =
    "recentWorkPhotos";


/* =========================================================
   OBJECT URL TRACKING
========================================================= */

var recentWorkObjectURLs = [];


/* =========================================================
   SAFE LOCAL STORAGE READER
========================================================= */

function readLocalStorage(
    key,
    fallback
) {

    try {

        var saved =
            localStorage.getItem(key);

        if (!saved) {

            return fallback;

        }

        return JSON.parse(saved);

    } catch (error) {

        console.warn(
            "Professional Studio: unable to read storage key:",
            key,
            error
        );

        return fallback;

    }

}


/* =========================================================
   SAFE HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   PROFILE
========================================================= */

function getProfileData() {

    var profile =
        readLocalStorage(
            PROFILE_STORAGE_KEY,
            null
        );


    if (
        profile &&
        typeof profile === "object"
    ) {

        return profile;

    }


    /*
       Compatibility with older profile storage.
    */

    var possibleNameKeys = [
        "photographerName",
        "profileName",
        "name",
        "userName"
    ];


    for (
        var i = 0;
        i < possibleNameKeys.length;
        i++
    ) {

        var value =
            localStorage.getItem(
                possibleNameKeys[i]
            );


        if (
            value &&
            value.trim()
        ) {

            return {
                name: value.trim()
            };

        }

    }


    return {};

}


/* =========================================================
   PHOTOGRAPHER NAME
========================================================= */

function getPhotographerName() {

    var profile =
        getProfileData();


    var possibleNames = [

        profile.name,

        profile.fullName,

        profile.photographerName,

        profile.displayName

    ];


    for (
        var i = 0;
        i < possibleNames.length;
        i++
    ) {

        if (
            typeof possibleNames[i] ===
                "string" &&
            possibleNames[i].trim()
        ) {

            return possibleNames[i].trim();

        }

    }


    return "Photographer";

}


/* =========================================================
   RENDER PROFILE
========================================================= */

function renderPublicProfile() {

    var profile =
        getProfileData();


    var photographerName =
        getPhotographerName();


    /*
       Common profile fields.
       Only update elements that actually exist.
    */

    var nameElements =
        document.querySelectorAll(
            "[data-profile-name], #photographerName, #name"
        );


    nameElements.forEach(
        function(element) {

            element.textContent =
                photographerName;

        }
    );


    var aboutText =
        document.getElementById(
            "aboutText"
        );


    if (
        aboutText &&
        profile.about
    ) {

        aboutText.textContent =
            profile.about;

    }


    var bioText =
        document.querySelector(
            "[data-profile-bio]"
        );


    if (
        bioText &&
        profile.bio
    ) {

        bioText.textContent =
            profile.bio;

    }


    var locationElements =
        document.querySelectorAll(
            "[data-profile-location]"
        );


    locationElements.forEach(
        function(element) {

            var location =
                profile.location ||
                profile.city ||
                profile.address ||
                "";

            if (location) {

                element.textContent =
                    location;

            }

        }
    );


    var phoneElements =
        document.querySelectorAll(
            "[data-profile-phone]"
        );


    phoneElements.forEach(
        function(element) {

            if (profile.phone) {

                element.textContent =
                    profile.phone;

            }

        }
    );


    var emailElements =
        document.querySelectorAll(
            "[data-profile-email]"
        );


    emailElements.forEach(
        function(element) {

            if (profile.email) {

                element.textContent =
                    profile.email;

            }

        }
    );


    /*
       Social links.
    */

    var socialKeys = [
        "instagram",
        "facebook",
        "youtube",
        "twitter",
        "linkedin"
    ];


    socialKeys.forEach(
        function(key) {

            var links =
                document.querySelectorAll(
                    "[data-social='" +
                    key +
                    "']"
                );


            links.forEach(
                function(link) {

                    var value =
                        profile[key];


                    if (
                        typeof value ===
                            "string" &&
                        value.trim()
                    ) {

                        link.href =
                            value.trim();

                        link.style.display =
                            "";

                    } else {

                        link.style.display =
                            "none";

                    }

                }
            );

        }
    );

}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initializeSmoothScrolling() {

    var links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    links.forEach(
        function(link) {

            link.addEventListener(
                "click",
                function(event) {

                    var targetID =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetID ||
                        targetID === "#"
                    ) {

                        return;

                    }


                    var target =
                        document.querySelector(
                            targetID
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        }
    );

}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initializeRevealAnimations() {

    var elements =
        document.querySelectorAll(
            ".section, " +
            ".portfolio-block, " +
            ".equipment-grid, " +
            ".pricing-grid, " +
            ".work-card, " +
            ".contact-info"
        );


    if (!elements.length) {

        return;

    }


    elements.forEach(
        function(element) {

            element.classList.add(
                "reveal"
            );

        }
    );


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
                            !entry.isIntersecting
                        ) {

                            return;

                        }


                        entry.target.classList.add(
                            "visible"
                        );


                        observer.unobserve(
                            entry.target
                        );

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
            "[data-progress], " +
            ".experience-progress"
        );


    if (!meters.length) {

        return;

    }


    meters.forEach(
        function(meter) {

            var value =
                meter.getAttribute(
                    "data-progress"
                );


            if (
                value === null
            ) {

                return;

            }


            var numericValue =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Number(value)
                    )
                );


            meter.style.width =
                "0%";


            requestAnimationFrame(
                function() {

                    meter.style.width =
                        numericValue +
                        "%";

                }
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
            window.scrollY > 30
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


    window.addEventListener(
        "scroll",
        updateNavbar,
        {
            passive: true
        }
    );


    updateNavbar();

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function initializeActiveNavigation() {

    var sections =
        document.querySelectorAll(
            "section[id]"
        );


    var navLinks =
        document.querySelectorAll(
            ".nav-links a"
        );


    if (
        !sections.length ||
        !navLinks.length
    ) {

        return;

    }


    function updateActiveLink() {

        var currentSection =
            "";


        sections.forEach(
            function(section) {

                var sectionTop =
                    section.offsetTop -
                    150;


                var sectionBottom =
                    sectionTop +
                    section.offsetHeight;


                if (
                    window.scrollY >=
                        sectionTop &&
                    window.scrollY <
                        sectionBottom
                ) {

                    currentSection =
                        section.id;

                }

            }
        );


        navLinks.forEach(
            function(link) {

                link.classList.remove(
                    "active"
                );


                var href =
                    link.getAttribute(
                        "href"
                    );


                if (
                    href ===
                    "#" + currentSection
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

    }


    window.addEventListener(
        "scroll",
        updateActiveLink,
        {
            passive: true
        }
    );


    updateActiveLink();

}


/* =========================================================
   BOOK BUTTONS
========================================================= */

function initializeBookButtons() {

    var buttons =
        document.querySelectorAll(
            ".book-btn"
        );


    buttons.forEach(
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
                        300
                    );

                }
            );

        }
    );

}


/* =========================================================
   SERVICES
========================================================= */

function getStoredServices() {

    var services =
        readLocalStorage(
            SERVICES_STORAGE_KEY,
            []
        );


    return Array.isArray(
        services
    )
        ? services
        : [];

}


/* =========================================================
   FORMAT CURRENCY
========================================================= */

function formatCurrency(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "Price on request";

    }


    var number =
        Number(
            String(value)
                .replace(/[₹,\s]/g, "")
        );


    if (
        !Number.isFinite(number)
    ) {

        return String(value);

    }


    return (
        "₹" +
        number.toLocaleString(
            "en-IN"
        )
    );

}


/* =========================================================
   GET SERVICE PACKAGES
========================================================= */

function getServicePackages(
    service
) {

    if (
        !service ||
        typeof service !== "object"
    ) {

        return [];

    }


    /*
       Current service structure.
    */

    if (
        Array.isArray(
            service.packages
        )
    ) {

        return service.packages;

    }


    /*
       Compatibility with older object-based
       package structure.
    */

    if (
        service.packages &&
        typeof service.packages ===
            "object"
    ) {

        return Object.keys(
            service.packages
        ).map(
            function(key) {

                var pkg =
                    service.packages[key] ||
                    {};


                return {
                    id: key,

                    name:
                        pkg.name ||
                        key,

                    price:
                        pkg.price ||
                        "",

                    duration:
                        pkg.duration ||
                        pkg.coverage ||
                        "",

                    delivery:
                        pkg.delivery ||
                        "",

                    description:
                        pkg.description ||
                        "",

                    photos:
                        pkg.photos ||
                        ""

                };

            }
        );

    }


    return [];

}


/* =========================================================
   RENDER SERVICES
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
        getStoredServices();


    container.innerHTML =
        "";


    if (!services.length) {

        container.innerHTML = `
            <div class="services-empty">
                <h3>Services Coming Soon</h3>
                <p>
                    Photography services will appear here
                    once they have been published.
                </p>
            </div>
        `;

        return;

    }


    services.forEach(
        function(service) {

            if (
                !service ||
                typeof service !==
                    "object"
            ) {

                return;

            }


            var card =
                document.createElement(
                    "article"
                );


            card.className =
                "service-preview-card";


            var title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                service.name ||
                "Photography Service";


            card.appendChild(
                title
            );


            if (
                service.description
            ) {

                var description =
                    document.createElement(
                        "p"
                    );


                description.className =
                    "service-preview-description";


                description.textContent =
                    service.description;


                card.appendChild(
                    description
                );

            }


            var packages =
                getServicePackages(
                    service
                );


            if (
                packages.length
            ) {

                var packageGrid =
                    document.createElement(
                        "div"
                    );


                packageGrid.className =
                    "service-package-grid";


                packages.forEach(
                    function(pkg) {

                        var packageCard =
                            document.createElement(
                                "div"
                            );


                        packageCard.className =
                            "service-package";


                        packageCard.innerHTML = `
                            <h4>
                                ${escapeHTML(
                                    pkg.name ||
                                    "Package"
                                )}
                            </h4>

                            <div class="package-price">
                                ${escapeHTML(
                                    formatCurrency(
                                        pkg.price
                                    )
                                )}
                            </div>

                            ${
                                pkg.duration
                                    ? `
                                        <span>
                                            ${escapeHTML(
                                                pkg.duration
                                            )}
                                        </span>
                                      `
                                    : ""
                            }

                            ${
                                pkg.photos
                                    ? `
                                        <span>
                                            ${escapeHTML(
                                                pkg.photos
                                            )}
                                        </span>
                                      `
                                    : ""
                            }

                            ${
                                pkg.delivery
                                    ? `
                                        <span>
                                            ${escapeHTML(
                                                pkg.delivery
                                            )}
                                        </span>
                                      `
                                    : ""
                            }

                            ${
                                pkg.description
                                    ? `
                                        <p>
                                            ${escapeHTML(
                                                pkg.description
                                            )}
                                        </p>
                                      `
                                    : ""
                            }
                        `;


                        packageGrid.appendChild(
                            packageCard
                        );

                    }
                );


                card.appendChild(
                    packageGrid
                );

            }


            var actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "service-preview-actions";


            var bookLink =
                document.createElement(
                    "a"
                );


            bookLink.href =
                "booking.html?service=" +
                encodeURIComponent(
                    service.name ||
                    ""
                );


            bookLink.className =
                "book-btn";


            bookLink.textContent =
                "Book This Service";


            actions.appendChild(
                bookLink
            );


            card.appendChild(
                actions
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   EQUIPMENT
========================================================= */

function getStoredEquipment() {

    var equipment =
        readLocalStorage(
            EQUIPMENT_STORAGE_KEY,
            []
        );


    if (
        Array.isArray(equipment)
    ) {

        return equipment;

    }


    if (
        equipment &&
        typeof equipment ===
            "object"
    ) {

        return Object.keys(
            equipment
        ).map(
            function(category) {

                return {
                    name: category,
                    items:
                        Array.isArray(
                            equipment[category]
                        )
                            ? equipment[category]
                            : []
                };

            }
        );

    }


    return [];

}


/* =========================================================
   RENDER EQUIPMENT
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
        getStoredEquipment();


    container.innerHTML =
        "";


    if (!equipment.length) {

        container.innerHTML = `
            <div class="equipment-empty">
                <h3>Professional Equipment</h3>
                <p>
                    Equipment details will appear here
                    once they have been added.
                </p>
            </div>
        `;

        return;

    }


    equipment.forEach(
        function(category) {

            if (
                !category ||
                typeof category !==
                    "object"
            ) {

                return;

            }


            var card =
                document.createElement(
                    "article"
                );


            card.className =
                "equipment-card";


            var heading =
                document.createElement(
                    "h3"
                );


            heading.textContent =
                category.name ||
                category.category ||
                "Equipment";


            card.appendChild(
                heading
            );


            var items =
                Array.isArray(
                    category.items
                )
                    ? category.items
                    : [];


            if (!items.length) {

                return;

            }


            var list =
                document.createElement(
                    "ul"
                );


            items.forEach(
                function(item) {

                    var li =
                        document.createElement(
                            "li"
                        );


                    if (
                        typeof item ===
                        "string"
                    ) {

                        li.textContent =
                            item;

                    } else {

                        li.textContent =
                            item.name ||
                            item.model ||
                            item.title ||
                            "Equipment";

                    }


                    list.appendChild(
                        li
                    );

                }
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
   RECENT WORK
   INDEXEDDB
========================================================= */


/*
   Open the SAME database used by Recent Work.

   Do not create a new database name here.
*/

function openRecentWorkDB() {

    return new Promise(
        function(resolve, reject) {

            if (
                !window.indexedDB
            ) {

                reject(
                    new Error(
                        "IndexedDB is not supported."
                    )
                );

                return;

            }


            var request =
                indexedDB.open(
                    RECENT_WORK_DB_NAME,
                    RECENT_WORK_DB_VERSION
                );


            request.onsuccess =
                function() {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                function() {

                    reject(
                        request.error ||
                        new Error(
                            "Unable to open Recent Work database."
                        )
                    );

                };


            request.onblocked =
                function() {

                    reject(
                        new Error(
                            "Recent Work database is blocked."
                        )
                    );

                };

        }
    );

}


/* =========================================================
   GET ALL RECENT WORK MEDIA
========================================================= */

function getAllRecentWorkMedia(
    db
) {

    return new Promise(
        function(resolve, reject) {

            var transaction;


            try {

                transaction =
                    db.transaction(
                        RECENT_WORK_STORE_NAME,
                        "readonly"
                    );

            } catch (error) {

                reject(error);

                return;

            }


            var store =
                transaction.objectStore(
                    RECENT_WORK_STORE_NAME
                );


            var request =
                store.getAll();


            request.onsuccess =
                function() {

                    resolve(
                        Array.isArray(
                            request.result
                        )
                            ? request.result
                            : []
                    );

                };


            request.onerror =
                function() {

                    reject(
                        request.error ||
                        new Error(
                            "Unable to read Recent Work media."
                        )
                    );

                };

        }
    );

}


/* =========================================================
   GET SINGLE MEDIA RECORD
========================================================= */

function getRecentWorkMediaByID(
    db,
    id
) {

    return new Promise(
        function(resolve, reject) {

            if (
                !id
            ) {

                resolve(
                    null
                );

                return;

            }


            var transaction =
                db.transaction(
                    RECENT_WORK_STORE_NAME,
                    "readonly"
                );


            var store =
                transaction.objectStore(
                    RECENT_WORK_STORE_NAME
                );


            var request =
                store.get(id);


            request.onsuccess =
                function() {

                    resolve(
                        request.result ||
                        null
                    );

                };


            request.onerror =
                function() {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* =========================================================
   FIND ACTUAL BLOB
========================================================= */

async function resolveRecentWorkBlob(
    db,
    fileMetadata,
    allMedia
) {

    if (!fileMetadata) {

        return null;

    }


    /*
       Some versions store the blob directly.
    */

    if (
        fileMetadata.blob instanceof Blob
    ) {

        return fileMetadata.blob;

    }


    if (
        fileMetadata.file instanceof Blob
    ) {

        return fileMetadata.file;

    }


    /*
       Canonical metadata references the stored
       media using blobKey / id.
    */

    var possibleKeys = [

        fileMetadata.blobKey,

        fileMetadata.id,

        fileMetadata.key

    ];


    for (
        var i = 0;
        i < possibleKeys.length;
        i++
    ) {

        var key =
            possibleKeys[i];


        if (
            !key
        ) {

            continue;

        }


        /*
           Try the IndexedDB primary key.
        */

        try {

            var record =
                await getRecentWorkMediaByID(
                    db,
                    key
                );


            if (
                record &&
                record.blob instanceof Blob
            ) {

                return record.blob;

            }


            if (
                record &&
                record.file instanceof Blob
            ) {

                return record.file;

            }

        } catch (error) {

            /*
               Continue to the metadata search.
            */

        }


        /*
           Fallback search through all media records.
        */

        if (
            Array.isArray(allMedia)
        ) {

            var matchingRecord =
                allMedia.find(
                    function(record) {

                        return (
                            String(
                                record.id
                            ) ===
                            String(
                                key
                            ) ||

                            String(
                                record.blobKey
                            ) ===
                            String(
                                key
                            ) ||

                            String(
                                record.key
                            ) ===
                            String(
                                key
                            )
                        );

                    }
                );


            if (
                matchingRecord
            ) {

                if (
                    matchingRecord.blob
                    instanceof Blob
                ) {

                    return matchingRecord.blob;

                }


                if (
                    matchingRecord.file
                    instanceof Blob
                ) {

                    return matchingRecord.file;

                }

            }

        }

    }


    return null;

}


/* =========================================================
   RECENT WORK STORAGE
========================================================= */

function getRecentWorkStorage() {

    var storage =
        readLocalStorage(
            PORTFOLIO_STORAGE_KEY,
            {}
        );


    if (
        !storage ||
        typeof storage !==
            "object"
    ) {

        return {

            usedMB: 0,

            files: [],

            albums: []

        };

    }


    return {

        usedMB:
            Number(
                storage.usedMB
            ) || 0,

        files:
            Array.isArray(
                storage.files
            )
                ? storage.files
                : [],

        albums:
            Array.isArray(
                storage.albums
            )
                ? storage.albums
                : []

    };

}


/* =========================================================
   PUBLIC ALBUMS
========================================================= */

function getPublicRecentWorkAlbums() {

    var storage =
        getRecentWorkStorage();


    return storage.albums.filter(
        function(album) {

            /*
               Only explicitly private albums are hidden.

               This matches gallery.html behavior.
            */

            return (
                album &&
                album.isPublic !== false
            );

        }
    );

}


/* =========================================================
   ALBUM MEDIA
========================================================= */

function getAlbumMediaMetadata(
    album,
    files
) {

    if (
        !album ||
        !Array.isArray(files)
    ) {

        return [];

    }


    return files.filter(
        function(file) {

            return (
                file &&
                String(
                    file.albumId
                ) ===
                String(
                    album.id
                )
            );

        }
    );

}


/* =========================================================
   FIND ALBUM COVER METADATA
========================================================= */

function findRecentWorkCoverMetadata(
    album,
    albumFiles
) {

    if (
        !albumFiles.length
    ) {

        return null;

    }


    /*
       Explicit cover first.
    */

    var coverFileID =
        album.coverFileId ||
        album.coverImageId ||
        null;


    if (
        coverFileID
    ) {

        var explicitCover =
            albumFiles.find(
                function(file) {

                    return (
                        String(
                            file.id
                        ) ===
                        String(
                            coverFileID
                        )
                    );

                }
            );


        if (
            explicitCover
        ) {

            return explicitCover;

        }

    }


    /*
       Fallback to first file in the album.
    */

    return albumFiles[0];

}


/* =========================================================
   CLEAN RECENT WORK OBJECT URLS
========================================================= */

function cleanupRecentWorkObjectURLs() {

    recentWorkObjectURLs.forEach(
        function(url) {

            try {

                URL.revokeObjectURL(
                    url
                );

            } catch (error) {}

        }
    );


    recentWorkObjectURLs =
        [];

}


/* =========================================================
   CREATE IMAGE URL
========================================================= */

function createRecentWorkImageURL(
    blob
) {

    if (
        !(blob instanceof Blob)
    ) {

        return "";

    }


    var url =
        URL.createObjectURL(
            blob
        );


    recentWorkObjectURLs.push(
        url
    );


    return url;

}


/* =========================================================
   CREATE RECENT WORK CARD
========================================================= */

function createRecentWorkCard(
    album,
    imageURL,
    photoCount
) {

    var card =
        document.createElement(
            "article"
        );


    card.className =
        "work-card";


    /*
       The card still points to the public
       gallery page.

       Album-specific navigation is intentionally
       not invented here because gallery.html's
       current album-query behavior must remain
       authoritative.
    */

    var link =
        document.createElement(
            "a"
        );


    link.href =
        "gallery.html";


    var image =
        document.createElement(
            "img"
        );


    image.src =
        imageURL;


    image.alt =
        album.name ||
        "Recent Work";


    image.loading =
        "lazy";


    link.appendChild(
        image
    );


    card.appendChild(
        link
    );


    var heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        album.name ||
        "Untitled Album";


    card.appendChild(
        heading
    );


    var description =
        document.createElement(
            "p"
        );


    description.textContent =
        photoCount === 1
            ? "1 photo"
            : photoCount +
              " photos";


    card.appendChild(
        description
    );


    return card;

}


/* =========================================================
   EMPTY RECENT WORK STATE
========================================================= */

function showRecentWorkEmptyState() {

    var container =
        document.getElementById(
            "recentWorkPreview"
        );


    var empty =
        document.getElementById(
            "recentWorkEmpty"
        );


    if (container) {

        container.innerHTML =
            "";

    }


    if (empty) {

        empty.hidden =
            false;

    }

}


/* =========================================================
   LOAD RECENT WORK PREVIEW
========================================================= */

async function loadClientRecentWork() {

    var container =
        document.getElementById(
            "recentWorkPreview"
        );


    if (!container) {

        return;

    }


    var empty =
        document.getElementById(
            "recentWorkEmpty"
        );


    if (empty) {

        empty.hidden =
            true;

    }


    cleanupRecentWorkObjectURLs();


    container.innerHTML =
        "";


    var publicAlbums =
        getPublicRecentWorkAlbums();


    if (
        !publicAlbums.length
    ) {

        showRecentWorkEmptyState();

        return;

    }


    var db;


    try {

        db =
            await openRecentWorkDB();

    } catch (error) {

        console.warn(
            "Professional Studio: Recent Work database unavailable.",
            error
        );


        showRecentWorkEmptyState();

        return;

    }


    var allMedia;


    try {

        allMedia =
            await getAllRecentWorkMedia(
                db
            );

    } catch (error) {

        console.warn(
            "Professional Studio: unable to read Recent Work media.",
            error
        );


        db.close();

        showRecentWorkEmptyState();

        return;

    }


    /*
       The Portfolio page is a preview.
       Keep the same five-card visual scale
       as the old hardcoded section.
    */

    var albumsToRender =
        publicAlbums.slice(
            0,
            5
        );


    var renderedCount =
        0;


    for (
        var i = 0;
        i < albumsToRender.length;
        i++
    ) {

        var album =
            albumsToRender[i];


        var albumFiles =
            getAlbumMediaMetadata(
                album,
                getRecentWorkStorage().files
            );


        if (
            !albumFiles.length
        ) {

            continue;

        }


        var coverMetadata =
            findRecentWorkCoverMetadata(
                album,
                albumFiles
            );


        if (
            !coverMetadata
        ) {

            continue;

        }


        var blob =
            await resolveRecentWorkBlob(
                db,
                coverMetadata,
                allMedia
            );


        if (
            !blob
        ) {

            console.warn(
                "Professional Studio: unable to resolve cover image for album:",
                album.name
            );

            continue;

        }


        var imageURL =
            createRecentWorkImageURL(
                blob
            );


        if (
            !imageURL
        ) {

            continue;

        }


        var card =
            createRecentWorkCard(
                album,
                imageURL,
                albumFiles.length
            );


        container.appendChild(
            card
        );


        renderedCount++;

    }


    db.close();


    if (
        renderedCount === 0
    ) {

        showRecentWorkEmptyState();

        return;

    }


    /*
       Add dynamically created cards to the
       existing reveal behavior.
    */

    initializeRecentWorkCardReveal();

}


/* =========================================================
   RECENT WORK CARD REVEAL
========================================================= */

function initializeRecentWorkCardReveal() {

    var cards =
        document.querySelectorAll(
            "#recentWorkPreview .work-card"
        );


    if (
        !cards.length
    ) {

        return;

    }


    if (
        !("IntersectionObserver" in window)
    ) {

        cards.forEach(
            function(card) {

                card.classList.add(
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
                            !entry.isIntersecting
                        ) {

                            return;

                        }


                        entry.target.classList.add(
                            "visible"
                        );


                        observer.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    cards.forEach(
        function(card) {

            observer.observe(
                card
            );

        }
    );

}


/* =========================================================
   RECENT WORK UPDATE EVENT
========================================================= */

window.addEventListener(
    "professionalStudioRecentWorkUpdated",
    function() {

        loadClientRecentWork();

    }
);


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            PORTFOLIO_STORAGE_KEY
        ) {

            loadClientRecentWork();

        }


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
   PAGE VISIBILITY REFRESH
========================================================= */

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.visibilityState !==
            "visible"
        ) {

            return;

        }


        renderPublicProfile();

        loadClientServices();

        loadClientEquipment();

        loadClientRecentWork();

    }
);


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        cleanupRecentWorkObjectURLs();

    }
);



/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderPublicProfile();

        initializeSmoothScrolling();

        initializeRevealAnimations();

        initializeExperienceMeters();

        initializeNavbar();

        initializeActiveNavigation();

        initializeBookButtons();

        loadClientServices();

        loadClientEquipment();

        loadClientRecentWork();

    }
);