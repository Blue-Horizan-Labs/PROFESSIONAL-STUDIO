/* =========================================================
   PROFESSIONAL STUDIO
   DASHBOARD JAVASCRIPT
   FRONTEND VERSION
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

var PORTFOLIO_STORAGE_KEY =
    "professionalStudio.portfolioStorage";

var SUBSCRIPTION_PLAN_KEY =
    "professionalStudio.subscriptionPlan";

var EQUIPMENT_STORAGE_KEY =
    "professionalStudio.equipment";

var SERVICES_STORAGE_KEY =
    "professionalStudio.services";

var GALLERY_STORAGE_KEY =
    "professionalStudioGalleries";

var BOOKING_STORAGE_KEY =
    "bookings";

var PROFILE_STORAGE_KEY =
    "professionalStudio.profile";


/* =========================================================
   SUBSCRIPTION PLANS
========================================================= */

var STORAGE_PLANS = {

    basic: {
        id: "basic",
        name: "Basic",
        price: 499,
        storageMB: 500
    },

    professional: {
        id: "professional",
        name: "Professional",
        price: 1499,
        storageMB: 5120
    },

    studio: {
        id: "studio",
        name: "Studio",
        price: 2999,
        storageMB: 20480
    }

};


/* =========================================================
   SAFE JSON READER
========================================================= */

function readLocalStorage(
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
   SAFE JSON WRITER
========================================================= */

function writeLocalStorage(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        return false;

    }

}


/* =========================================================
   TOAST
========================================================= */

var toastTimer = null;


function showDashboardToast(
    message
) {

    var toast =
        document.getElementById(
            "dashboardToast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function() {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

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
       Support older profile keys.
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
   GET PHOTOGRAPHER NAME
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
            typeof possibleNames[i] === "string" &&
            possibleNames[i].trim()
        ) {

            return possibleNames[i].trim();

        }

    }


    return "Photographer";

}


/* =========================================================
   PROFILE LINK
========================================================= */

function getProfileLink() {

    var profile =
        getProfileData();


    var possibleLinks = [
        profile.profileUrl,
        profile.publicUrl,
        profile.profileLink,
        profile.slug
    ];


    for (
        var i = 0;
        i < possibleLinks.length;
        i++
    ) {

        if (
            typeof possibleLinks[i] === "string" &&
            possibleLinks[i].trim()
        ) {

            var value =
                possibleLinks[i].trim();


            if (
                value.indexOf("http://") === 0 ||
                value.indexOf("https://") === 0
            ) {

                return value;

            }


            /*
               If only a slug was stored,
               create a local public profile URL.
            */

            return (
                window.location.origin +
                "/profile.html?slug=" +
                encodeURIComponent(value)
            );

        }

    }


    /*
       Fallback profile URL.

       This allows the button to work even
       before the final public profile page
       is connected.
    */

    var slug =
        localStorage.getItem(
            "professionalStudio.profileSlug"
        );


    if (slug) {

        return (
            window.location.origin +
            "/profile.html?slug=" +
            encodeURIComponent(slug)
        );

    }


    return (
        window.location.origin +
        "/profile.html"
    );

}


/* =========================================================
   OPEN PUBLIC PROFILE
========================================================= */

function openPortfolio() {

    var link =
        getProfileLink();


    window.open(
        link,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================================
   COPY PROFILE LINK
========================================================= */

function copyProfileLink() {

    var link =
        getProfileLink();


    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard
            .writeText(link)
            .then(
                function() {

                    showDashboardToast(
                        "Profile link copied"
                    );

                }
            )
            .catch(
                function() {

                    fallbackCopyText(
                        link
                    );

                }
            );

        return;

    }


    fallbackCopyText(
        link
    );

}


/* =========================================================
   FALLBACK COPY
========================================================= */

function fallbackCopyText(
    text
) {

    var textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    try {

        document.execCommand(
            "copy"
        );


        showDashboardToast(
            "Profile link copied"
        );

    } catch (error) {

        showDashboardToast(
            "Copy failed. Link: " + text
        );

    }


    textarea.remove();

}


/* =========================================================
   SUBSCRIPTION
========================================================= */

function getCurrentSubscriptionPlan() {

    var savedPlan =
        localStorage.getItem(
            SUBSCRIPTION_PLAN_KEY
        );


    if (
        savedPlan &&
        STORAGE_PLANS[savedPlan]
    ) {

        return STORAGE_PLANS[savedPlan];

    }


    return STORAGE_PLANS.basic;

}


function getPortfolioStorageLimitMB() {

    return getCurrentSubscriptionPlan()
        .storageMB;

}


/* =========================================================
   PORTFOLIO STORAGE
========================================================= */

function getPortfolioStorage() {

    var storage =
        readLocalStorage(
            PORTFOLIO_STORAGE_KEY,
            null
        );


    if (
        !storage ||
        typeof storage !== "object"
    ) {

        storage = {

            storageUsedMB: 0,

            storagePlan:
                getCurrentSubscriptionPlan().id,

            storageLimitMB:
                getPortfolioStorageLimitMB(),

            files: []

        };

    }


    if (
        !Array.isArray(
            storage.files
        )
    ) {

        storage.files = [];

    }


    storage.storageLimitMB =
        getPortfolioStorageLimitMB();


    storage.storagePlan =
        getCurrentSubscriptionPlan().id;


    /*
       Recalculate storage usage from
       actual file records.
    */

    if (
        storage.files.length > 0
    ) {

        storage.storageUsedMB =
            storage.files.reduce(
                function(total, file) {

                    return total +
                        (
                            Number(
                                file.sizeMB
                            ) || 0
                        );

                },
                0
            );

    } else {

        storage.storageUsedMB =
            Number(
                storage.storageUsedMB
            ) || 0;

    }


    return storage;

}


/* =========================================================
   SAVE PORTFOLIO STORAGE
========================================================= */

function savePortfolioStorage(
    storage
) {

    if (
        !storage ||
        typeof storage !== "object"
    ) {

        return false;

    }


    storage.storageLimitMB =
        getPortfolioStorageLimitMB();


    storage.storagePlan =
        getCurrentSubscriptionPlan().id;


    return writeLocalStorage(
        PORTFOLIO_STORAGE_KEY,
        storage
    );

}


/* =========================================================
   FORMAT STORAGE
========================================================= */

function formatPortfolioStorageMB(
    value
) {

    var mb =
        Number(value) || 0;


    if (mb < 1024) {

        return (
            Math.round(
                mb * 100
            ) / 100
        ) + " MB";

    }


    var gb =
        mb / 1024;


    if (gb < 10) {

        return (
            Math.round(
                gb * 100
            ) / 100
        ) + " GB";

    }


    return (
        Math.round(
            gb * 10
        ) / 10
    ) + " GB";

}


/* =========================================================
   STORAGE PERCENTAGE
========================================================= */

function getPortfolioStoragePercentage(
    storage
) {

    if (!storage) {
        return 0;
    }


    var limit =
        Number(
            storage.storageLimitMB
        ) || 0;


    var used =
        Number(
            storage.storageUsedMB
        ) || 0;


    if (limit <= 0) {
        return 100;
    }


    return Math.min(
        100,
        Math.max(
            0,
            (used / limit) * 100
        )
    );

}


/* =========================================================
   STORAGE STATUS
========================================================= */

function getPortfolioStorageStatus(
    storage
) {

    var percentage =
        getPortfolioStoragePercentage(
            storage
        );


    if (
        percentage >= 100
    ) {

        return {
            label: "Storage Full",
            className: "full"
        };

    }


    if (
        percentage >= 80
    ) {

        return {
            label: "Almost Full",
            className: "warning"
        };

    }


    return {
        label: "Available",
        className: ""
    };

}


/* =========================================================
   RENDER PORTFOLIO STORAGE
========================================================= */

function renderPortfolioStorage() {

    var sizeElement =
        document.getElementById(
            "portfolioStorageSize"
        );

    var usedElement =
        document.getElementById(
            "portfolioStorageUsed"
        );

    var availableElement =
        document.getElementById(
            "portfolioStorageAvailable"
        );

    var progressElement =
        document.getElementById(
            "portfolioStorageProgress"
        );

    var badgeElement =
        document.getElementById(
            "portfolioStorageBadge"
        );

    var warningElement =
        document.getElementById(
            "portfolioStorageWarning"
        );


    var storage =
        getPortfolioStorage();


    var limit =
        Number(
            storage.storageLimitMB
        ) || 0;


    var used =
        Number(
            storage.storageUsedMB
        ) || 0;


    var available =
        Math.max(
            0,
            limit - used
        );


    var percentage =
        getPortfolioStoragePercentage(
            storage
        );


    var status =
        getPortfolioStorageStatus(
            storage
        );


    var plan =
        getCurrentSubscriptionPlan();


    if (sizeElement) {

        sizeElement.textContent =
            formatPortfolioStorageMB(
                used
            ) +
            " / " +
            formatPortfolioStorageMB(
                limit
            );

    }


    if (usedElement) {

        usedElement.textContent =
            formatPortfolioStorageMB(
                used
            ) +
            " used";

    }


    if (availableElement) {

        availableElement.textContent =
            formatPortfolioStorageMB(
                available
            ) +
            " available";

    }


    if (progressElement) {

        progressElement.style.width =
            percentage + "%";

    }


    if (badgeElement) {

        badgeElement.textContent =
            status.label;


        badgeElement.classList.remove(
            "warning",
            "full"
        );


        if (
            status.className
        ) {

            badgeElement.classList.add(
                status.className
            );

        }

    }


    if (warningElement) {

        var warningStrong =
            warningElement.querySelector(
                "strong"
            );

        var warningText =
            warningElement.querySelector(
                "span"
            );


        if (
            percentage >= 100
        ) {

            warningElement.hidden =
                false;


            if (warningStrong) {

                warningStrong.textContent =
                    "Storage is full";

            }


            if (warningText) {

                warningText.textContent =
                    "Delete existing recent work to make space before uploading new photos.";

            }

        } else {

            warningElement.hidden =
                true;

        }

    }


    document
        .querySelectorAll(
            "[data-portfolio-plan]"
        )
        .forEach(
            function(element) {

                element.textContent =
                    plan.name +
                    " Plan";

            }
        );


    document
        .querySelectorAll(
            "[data-portfolio-plan-storage]"
        )
        .forEach(
            function(element) {

                element.textContent =
                    formatPortfolioStorageMB(
                        plan.storageMB
                    );

            }
        );

}


/* =========================================================
   PORTFOLIO FILE FUNCTIONS
========================================================= */

function getPortfolioUploadCheck(
    fileSizeMB
) {

    var storage =
        getPortfolioStorage();


    var size =
        Number(fileSizeMB) || 0;


    var used =
        Number(
            storage.storageUsedMB
        ) || 0;


    var limit =
        Number(
            storage.storageLimitMB
        ) || 0;


    var available =
        Math.max(
            0,
            limit - used
        );


    return {

        allowed:
            used + size <= limit,

        fileSizeMB:
            size,

        usedMB:
            used,

        limitMB:
            limit,

        availableMB:
            available,

        requiredExtraMB:
            Math.max(
                0,
                size - available
            ),

        plan:
            getCurrentSubscriptionPlan()

    };

}


function canUploadPortfolioFile(
    fileSizeMB
) {

    return getPortfolioUploadCheck(
        fileSizeMB
    ).allowed;

}


function addPortfolioFile(
    fileData
) {

    if (
        !fileData ||
        typeof fileData !== "object"
    ) {

        return {
            success: false,
            reason: "invalid-file"
        };

    }


    var sizeMB =
        Number(
            fileData.sizeMB
        ) || 0;


    var check =
        getPortfolioUploadCheck(
            sizeMB
        );


    if (!check.allowed) {

        return {

            success: false,

            reason: "storage-full",

            message:
                "Not enough storage available.",

            check:
                check

        };

    }


    var storage =
        getPortfolioStorage();


    if (!fileData.id) {

        fileData.id =
            "portfolio-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8);

    }


    fileData.sizeMB =
        sizeMB;


    fileData.createdAt =
        fileData.createdAt ||
        new Date().toISOString();


    storage.files.push(
        fileData
    );


    storage.storageUsedMB =
        storage.files.reduce(
            function(total, file) {

                return total +
                    (
                        Number(
                            file.sizeMB
                        ) || 0
                    );

            },
            0
        );


    savePortfolioStorage(
        storage
    );


    renderPortfolioStorage();


    return {

        success: true,

        file:
            fileData,

        storage:
            storage

    };

}


function deletePortfolioFile(
    fileId
) {

    var storage =
        getPortfolioStorage();


    var originalLength =
        storage.files.length;


    storage.files =
        storage.files.filter(
            function(file) {

                return String(
                    file.id
                ) !==
                String(
                    fileId
                );

            }
        );


    if (
        storage.files.length ===
        originalLength
    ) {

        return false;

    }


    storage.storageUsedMB =
        storage.files.reduce(
            function(total, file) {

                return total +
                    (
                        Number(
                            file.sizeMB
                        ) || 0
                    );

            },
            0
        );


    savePortfolioStorage(
        storage
    );


    renderPortfolioStorage();


    return true;

}


/* =========================================================
   CHANGE PORTFOLIO SUBSCRIPTION
========================================================= */

function setPortfolioSubscriptionPlan(
    planId
) {

    if (
        !STORAGE_PLANS[planId]
    ) {

        return false;

    }


    localStorage.setItem(
        SUBSCRIPTION_PLAN_KEY,
        planId
    );


    var storage =
        getPortfolioStorage();


    storage.storagePlan =
        planId;


    storage.storageLimitMB =
        STORAGE_PLANS[
            planId
        ].storageMB;


    savePortfolioStorage(
        storage
    );


    renderPortfolioStorage();


    renderSubscription();


    return true;

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


    if (
        !Array.isArray(services)
    ) {

        return [];

    }


    return services;

}


function saveServices(
    services
) {

    return writeLocalStorage(
        SERVICES_STORAGE_KEY,
        services
    );

}


function getServiceName(
    service
) {

    if (!service) {
        return "";
    }


    var names = [
        service.name,
        service.serviceName,
        service.title,
        service.type
    ];


    for (
        var i = 0;
        i < names.length;
        i++
    ) {

        if (
            typeof names[i] === "string" &&
            names[i].trim()
        ) {

            return names[i].trim();

        }

    }


    return "";

}


function updateActiveServiceCounter(
    services
) {

    var counter =
        document.getElementById(
            "activeServicesCounter"
        );


    if (!counter) {
        return;
    }


    var activeCount =
        services.filter(
            function(service) {

                return service.active === true;

            }
        ).length;


    counter.textContent =
        activeCount;


    counter.dataset.target =
        activeCount;

}


/* =========================================================
   RENDER SERVICES
========================================================= */

function renderDashboardServices() {

    var serviceGrid =
        document.getElementById(
            "serviceGrid"
        );


    if (!serviceGrid) {
        return;
    }


    var services =
        getStoredServices();


    serviceGrid.innerHTML =
        "";


    if (!services.length) {

        var empty =
            document.createElement(
                "div"
            );


        empty.className =
            "services-empty";


        empty.textContent =
            "No services have been created yet. Open Manage Services to add your services.";


        serviceGrid.appendChild(
            empty
        );


        updateActiveServiceCounter(
            services
        );


        return;

    }


    services.forEach(
        function(service) {

            var name =
                getServiceName(
                    service
                );


            if (!name) {
                return;
            }


            var label =
                document.createElement(
                    "label"
                );


            label.className =
                "service-card";


            var checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.checked =
                service.active === true;


            checkbox.dataset.serviceId =
                service.id || "";


            checkbox.dataset.serviceName =
                name;


            var span =
                document.createElement(
                    "span"
                );


            span.textContent =
                name;


            label.appendChild(
                checkbox
            );


            label.appendChild(
                span
            );


            serviceGrid.appendChild(
                label
            );

        }
    );


    attachServiceCheckboxEvents();


    updateActiveServiceCounter(
        services
    );

}


/* =========================================================
   SERVICE CHECKBOX EVENTS
========================================================= */

function attachServiceCheckboxEvents() {

    var serviceGrid =
        document.getElementById(
            "serviceGrid"
        );


    if (!serviceGrid) {
        return;
    }


    serviceGrid
        .querySelectorAll(
            "input[type='checkbox']"
        )
        .forEach(
            function(checkbox) {

                checkbox.addEventListener(
                    "change",
                    function() {

                        var services =
                            getStoredServices();


                        var serviceId =
                            checkbox.dataset.serviceId;


                        var serviceName =
                            checkbox.dataset.serviceName;


                        var service =
                            services.find(
                                function(item) {

                                    if (
                                        serviceId
                                    ) {

                                        return String(
                                            item.id
                                        ) ===
                                        String(
                                            serviceId
                                        );

                                    }


                                    return (
                                        getServiceName(
                                            item
                                        ).toLowerCase() ===
                                        serviceName.toLowerCase()
                                    );

                                }
                            );


                        if (!service) {
                            return;
                        }


                        service.active =
                            checkbox.checked;


                        saveServices(
                            services
                        );


                        updateActiveServiceCounter(
                            services
                        );

                    }
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


    return Array.isArray(
        equipment
    )
        ? equipment
        : [];

}


function saveEquipment(
    equipment
) {

    return writeLocalStorage(
        EQUIPMENT_STORAGE_KEY,
        equipment
    );

}


/* =========================================================
   EQUIPMENT LIST ITEM
========================================================= */

function addEquipmentListItem(
    list,
    item
) {

    if (
        !list ||
        !item
    ) {

        return;

    }


    var li =
        document.createElement(
            "li"
        );


    var text =
        document.createElement(
            "span"
        );


    text.textContent =
        item;


    var removeButton =
        document.createElement(
            "button"
        );


    removeButton.type =
        "button";


    removeButton.className =
        "equipment-remove-btn";


    removeButton.textContent =
        "×";


    removeButton.setAttribute(
        "aria-label",
        "Remove " + item
    );


    removeButton.addEventListener(
        "click",
        function() {

            var card =
                list.closest(
                    ".equipment-card"
                );


            if (!card) {
                return;
            }


            var categoryId =
                card.dataset.categoryId;


            var equipment =
                getStoredEquipment();


            var category =
                equipment.find(
                    function(existing) {

                        return String(
                            existing.id
                        ) ===
                        String(
                            categoryId
                        );

                    }
                );


            if (!category) {
                return;
            }


            category.items =
                category.items.filter(
                    function(existingItem) {

                        return existingItem !==
                            item;

                    }
                );


            if (
                saveEquipment(
                    equipment
                )
            ) {

                li.remove();

                showDashboardToast(
                    "Equipment removed"
                );

            }

        }
    );


    li.appendChild(
        text
    );


    li.appendChild(
        removeButton
    );


    list.appendChild(
        li
    );

}


/* =========================================================
   CREATE EQUIPMENT CARD
========================================================= */

function createEquipmentCard(
    category
) {

    var card =
        document.createElement(
            "div"
        );


    card.className =
        "equipment-card";


    card.dataset.categoryId =
        category.id;


    var heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        category.name;


    var list =
        document.createElement(
            "ul"
        );


    list.className =
        "equipment-list";


    if (
        Array.isArray(
            category.items
        )
    ) {

        category.items.forEach(
            function(item) {

                addEquipmentListItem(
                    list,
                    item
                );

            }
        );

    }


    var inputWrapper =
        document.createElement(
            "div"
        );


    inputWrapper.className =
        "equipment-input";


    var input =
        document.createElement(
            "input"
        );


    input.type =
        "text";


    input.placeholder =
        "Add equipment";


    var button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "add-item-btn";


    button.textContent =
        "ADD";


    inputWrapper.appendChild(
        input
    );


    inputWrapper.appendChild(
        button
    );


    card.appendChild(
        heading
    );


    card.appendChild(
        list
    );


    card.appendChild(
        inputWrapper
    );


    attachEquipmentEvents(
        card
    );


    return card;

}


/* =========================================================
   EQUIPMENT EVENTS
========================================================= */

function attachEquipmentEvents(
    card
) {

    var input =
        card.querySelector(
            ".equipment-input input"
        );


    var button =
        card.querySelector(
            ".add-item-btn"
        );


    var list =
        card.querySelector(
            ".equipment-list"
        );


    if (
        !input ||
        !button ||
        !list
    ) {

        return;

    }


    function addItem() {

        var value =
            input.value.trim();


        if (!value) {
            return;
        }


        var categoryId =
            card.dataset.categoryId;


        var equipment =
            getStoredEquipment();


        var category =
            equipment.find(
                function(item) {

                    return String(
                        item.id
                    ) ===
                    String(
                        categoryId
                    );

                }
            );


        if (!category) {
            return;
        }


        if (
            !Array.isArray(
                category.items
            )
        ) {

            category.items = [];

        }


        var alreadyExists =
            category.items.some(
                function(existingItem) {

                    return (
                        String(
                            existingItem
                        ).toLowerCase() ===
                        value.toLowerCase()
                    );

                }
            );


        if (alreadyExists) {

            showDashboardToast(
                "This equipment is already added"
            );

            input.value =
                "";

            return;

        }


        category.items.push(
            value
        );


        if (
            saveEquipment(
                equipment
            )
        ) {

            addEquipmentListItem(
                list,
                value
            );


            showDashboardToast(
                "Equipment added"
            );

        }


        input.value =
            "";

        input.focus();

    }


    button.addEventListener(
        "click",
        addItem
    );


    input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                addItem();

            }

        }
    );

}


/* =========================================================
   RENDER EQUIPMENT
========================================================= */

function renderDashboardEquipment() {

    var equipmentGrid =
        document.querySelector(
            ".equipment-grid"
        );


    var addEquipment =
        document.getElementById(
            "addEquipment"
        );


    if (
        !equipmentGrid ||
        !addEquipment
    ) {

        return;

    }


    equipmentGrid
        .querySelectorAll(
            ".equipment-card:not(#addEquipment)"
        )
        .forEach(
            function(card) {

                card.remove();

            }
        );


    var equipment =
        getStoredEquipment();


    equipment.forEach(
        function(category) {

            if (
                !category ||
                !category.name
            ) {

                return;

            }


            var card =
                createEquipmentCard(
                    category
                );


            equipmentGrid.insertBefore(
                card,
                addEquipment
            );

        }
    );

}


/* =========================================================
   ADD EQUIPMENT CATEGORY
========================================================= */

function initializeEquipmentCategoryCreation() {

    var equipmentGrid =
        document.querySelector(
            ".equipment-grid"
        );


    var addEquipment =
        document.getElementById(
            "addEquipment"
        );


    if (
        !equipmentGrid ||
        !addEquipment
    ) {

        return;

    }


    addEquipment.addEventListener(
        "click",
        function() {

            if (
                document.querySelector(
                    ".create-equipment-card"
                )
            ) {

                return;

            }


            var createCard =
                document.createElement(
                    "div"
                );


            createCard.className =
                "equipment-card create-equipment-card";


            createCard.innerHTML =
                "<h3>New Equipment Category</h3>" +
                "<input type=\"text\" id=\"newEquipmentName\" placeholder=\"Category name\">" +
                "<div class=\"create-actions\">" +
                "<button type=\"button\" class=\"create-btn\">Create</button>" +
                "<button type=\"button\" class=\"cancel-btn\">Cancel</button>" +
                "</div>";


            equipmentGrid.insertBefore(
                createCard,
                addEquipment
            );


            var input =
                createCard.querySelector(
                    "#newEquipmentName"
                );


            input.focus();


            function createCategory() {

                var categoryName =
                    input.value.trim();


                if (!categoryName) {

                    input.focus();

                    return;

                }


                var equipment =
                    getStoredEquipment();


                var exists =
                    equipment.some(
                        function(category) {

                            return (
                                String(
                                    category.name
                                ).toLowerCase() ===
                                categoryName.toLowerCase()
                            );

                        }
                    );


                if (exists) {

                    showDashboardToast(
                        "This category already exists"
                    );

                    input.select();

                    return;

                }


                var category = {

                    id:
                        "equipment-" +
                        Date.now(),

                    name:
                        categoryName,

                    items: []

                };


                equipment.push(
                    category
                );


                if (
                    saveEquipment(
                        equipment
                    )
                ) {

                    var card =
                        createEquipmentCard(
                            category
                        );


                    equipmentGrid.insertBefore(
                        card,
                        createCard
                    );


                    createCard.remove();


                    showDashboardToast(
                        "Equipment category created"
                    );

                }

            }


            createCard
                .querySelector(
                    ".create-btn"
                )
                .addEventListener(
                    "click",
                    createCategory
                );


            input.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        createCategory();

                    }

                }
            );


            createCard
                .querySelector(
                    ".cancel-btn"
                )
                .addEventListener(
                    "click",
                    function() {

                        createCard.remove();

                    }
                );

        }
    );

}


/* =========================================================
   GALLERIES
========================================================= */

function getStoredGalleries() {

    var galleries =
        readLocalStorage(
            GALLERY_STORAGE_KEY,
            []
        );


    /*
       Some versions of the gallery system
       may store an object instead of an array.
    */

    if (
        galleries &&
        typeof galleries === "object" &&
        !Array.isArray(galleries)
    ) {

        if (
            Array.isArray(
                galleries.galleries
            )
        ) {

            galleries =
                galleries.galleries;

        } else {

            galleries = [];

        }

    }


    return Array.isArray(
        galleries
    )
        ? galleries
        : [];

}


/* =========================================================
   GALLERY DATE HELPERS
========================================================= */

function getGalleryExpiryDate(
    gallery
) {

    if (!gallery) {
        return null;
    }


    var possibleDates = [
        gallery.expiresAt,
        gallery.expiryDate,
        gallery.expirationDate,
        gallery.endDate
    ];


    for (
        var i = 0;
        i < possibleDates.length;
        i++
    ) {

        if (
            possibleDates[i]
        ) {

            var date =
                new Date(
                    possibleDates[i]
                );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                return date;

            }

        }

    }


    if (
        gallery.durationMonths &&
        gallery.createdAt
    ) {

        var created =
            new Date(
                gallery.createdAt
            );


        if (
            !Number.isNaN(
                created.getTime()
            )
        ) {

            var expiry =
                new Date(
                    created
                );


            expiry.setMonth(
                expiry.getMonth() +
                Number(
                    gallery.durationMonths
                )
            );


            return expiry;

        }

    }


    return null;

}


/* =========================================================
   GALLERY STATUS
========================================================= */

function getGalleryStatus(
    gallery
) {

    var expiry =
        getGalleryExpiryDate(
            gallery
        );


    if (!expiry) {

        return {
            label: "Active",
            className: "active"
        };

    }


    var now =
        new Date();


    if (
        expiry.getTime() <=
        now.getTime()
    ) {

        return {
            label: "Expired",
            className: "expired"
        };

    }


    var days =
        Math.ceil(
            (
                expiry.getTime() -
                now.getTime()
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    if (
        days <= 14
    ) {

        return {
            label:
                "Expires in " +
                days +
                " day" +
                (
                    days === 1
                        ? ""
                        : "s"
                ),

            className:
                "expiring"
        };

    }


    return {
        label: "Active",
        className: "active"
    };

}


/* =========================================================
   GALLERY FILE COUNT
========================================================= */

function getGalleryPhotoCount(
    gallery
) {

    var possibleValues = [
        gallery.photoCount,
        gallery.photosCount,
        gallery.totalPhotos
    ];


    for (
        var i = 0;
        i < possibleValues.length;
        i++
    ) {

        var value =
            Number(
                possibleValues[i]
            );


        if (
            Number.isFinite(value)
        ) {

            return value;

        }

    }


    var arrays = [
        gallery.photos,
        gallery.media,
        gallery.files
    ];


    for (
        var j = 0;
        j < arrays.length;
        j++
    ) {

        if (
            Array.isArray(
                arrays[j]
            )
        ) {

            return arrays[j].length;

        }

    }


    return 0;

}


/* =========================================================
   GALLERY STORAGE COUNT
========================================================= */

function getGalleryStorageMB(
    gallery
) {

    var possibleValues = [
        gallery.storageUsedMB,
        gallery.usedMB,
        gallery.storageMB
    ];


    for (
        var i = 0;
        i < possibleValues.length;
        i++
    ) {

        var value =
            Number(
                possibleValues[i]
            );


        if (
            Number.isFinite(value) &&
            value >= 0
        ) {

            return value;

        }

    }


    var bytes =
        Number(
            gallery.storageUsedBytes
        );


    if (
        Number.isFinite(bytes) &&
        bytes > 0
    ) {

        return bytes /
            (
                1024 *
                1024
            );

    }


    return 0;

}


/* =========================================================
   GALLERY TITLE
========================================================= */

function getGalleryName(
    gallery
) {

    return (
        gallery.name ||
        gallery.galleryName ||
        gallery.title ||
        gallery.clientName ||
        "Untitled Gallery"
    );

}


/* =========================================================
   GALLERY COVER
========================================================= */

function getGalleryCover(
    gallery
) {

    return (
        gallery.coverImage ||
        gallery.coverUrl ||
        gallery.thumbnail ||
        gallery.image ||
        ""
    );

}


/* =========================================================
   RENDER GALLERIES
========================================================= */

function renderDashboardGalleries() {

    var galleries =
        getStoredGalleries();


    var totalElement =
        document.getElementById(
            "totalGalleries"
        );

    var activeElement =
        document.getElementById(
            "activeGalleries"
        );

    var storageElement =
        document.getElementById(
            "galleryStorageUsed"
        );

    var expiringElement =
        document.getElementById(
            "expiringGalleries"
        );

    var listElement =
        document.getElementById(
            "dashboardGalleryList"
        );

    var emptyElement =
        document.getElementById(
            "galleryEmptyState"
        );


    var activeCount =
        0;

    var expiringCount =
        0;

    var totalStorageMB =
        0;


    galleries.forEach(
        function(gallery) {

            var status =
                getGalleryStatus(
                    gallery
                );


            if (
                status.className ===
                "active"
            ) {

                activeCount++;

            }


            if (
                status.className ===
                "expiring"
            ) {

                expiringCount++;

            }


            totalStorageMB +=
                getGalleryStorageMB(
                    gallery
                );

        }
    );


    if (totalElement) {

        totalElement.textContent =
            galleries.length;

    }


    if (activeElement) {

        activeElement.textContent =
            activeCount;

    }


    if (storageElement) {

        storageElement.textContent =
            formatPortfolioStorageMB(
                totalStorageMB
            );

    }


    if (expiringElement) {

        expiringElement.textContent =
            expiringCount;

    }


    if (!listElement) {
        return;
    }


    listElement.innerHTML =
        "";


    if (!galleries.length) {

        if (emptyElement) {

            emptyElement.hidden =
                false;

        }

        return;

    }


    if (emptyElement) {

        emptyElement.hidden =
            true;

    }


    /*
       Show latest galleries first.
    */

    var sorted =
        galleries.slice()
            .sort(
                function(a, b) {

                    var aDate =
                        new Date(
                            a.createdAt ||
                            a.updatedAt ||
                            0
                        ).getTime();


                    var bDate =
                        new Date(
                            b.createdAt ||
                            b.updatedAt ||
                            0
                        ).getTime();


                    return bDate - aDate;

                }
            )
            .slice(0, 6);


    sorted.forEach(
        function(gallery) {

            listElement.appendChild(
                createDashboardGalleryCard(
                    gallery
                )
            );

        }
    );

}


/* =========================================================
   CREATE GALLERY CARD
========================================================= */

function createDashboardGalleryCard(
    gallery
) {

    var card =
        document.createElement(
            "article"
        );


    card.className =
        "gallery-card";


    var imageWrapper =
        document.createElement(
            "div"
        );


    imageWrapper.className =
        "gallery-card-image";


    var cover =
        getGalleryCover(
            gallery
        );


    if (cover) {

        var image =
            document.createElement(
                "img"
            );


        image.src =
            cover;


        image.alt =
            getGalleryName(
                gallery
            );


        image.loading =
            "lazy";


        image.onerror =
            function() {

                image.remove();

                var placeholder =
                    document.createElement(
                        "span"
                    );


                placeholder.className =
                    "gallery-placeholder";


                placeholder.textContent =
                    "Gallery";

                imageWrapper.appendChild(
                    placeholder
                );

            };


        imageWrapper.appendChild(
            image
        );

    } else {

        var placeholder =
            document.createElement(
                "span"
            );


        placeholder.className =
            "gallery-placeholder";


        placeholder.textContent =
            "Gallery";


        imageWrapper.appendChild(
            placeholder
        );

    }


    var content =
        document.createElement(
            "div"
        );


    content.className =
        "gallery-card-content";


    var title =
        document.createElement(
            "h4"
        );


    title.textContent =
        getGalleryName(
            gallery
        );


    var meta =
        document.createElement(
            "div"
        );


    meta.className =
        "gallery-card-meta";


    var photos =
        document.createElement(
            "span"
        );


    photos.textContent =
        getGalleryPhotoCount(
            gallery
        ) +
        " photos";


    var storage =
        document.createElement(
            "span"
        );


    storage.textContent =
        formatPortfolioStorageMB(
            getGalleryStorageMB(
                gallery
            )
        );


    meta.appendChild(
        photos
    );


    meta.appendChild(
        storage
    );


    var status =
        getGalleryStatus(
            gallery
        );


    var statusElement =
        document.createElement(
            "div"
        );


    statusElement.className =
        "gallery-status " +
        status.className;


    statusElement.textContent =
        status.label;


    content.appendChild(
        title
    );


    content.appendChild(
        meta
    );


    content.appendChild(
        statusElement
    );


    card.appendChild(
        imageWrapper
    );


    card.appendChild(
        content
    );


    return card;

}


/* =========================================================
   BOOKINGS
========================================================= */

function getStoredBookings() {

    var bookings =
        readLocalStorage(
            BOOKING_STORAGE_KEY,
            []
        );


    if (
        !Array.isArray(bookings)
    ) {

        return [];

    }


    return bookings;

}


/* =========================================================
   BOOKING HELPERS
========================================================= */

function getBookingClientName(
    booking
) {

    return (
        booking.clientName ||
        booking.name ||
        booking.client ||
        booking.customerName ||
        "Client"
    );

}


function getBookingServiceName(
    booking
) {

    return (
        booking.serviceName ||
        booking.service ||
        booking.type ||
        booking.packageName ||
        "Photography"
    );

}


function getBookingDate(
    booking
) {

    return (
        booking.date ||
        booking.bookingDate ||
        booking.eventDate ||
        booking.startDate ||
        ""
    );

}


function getBookingStatus(
    booking
) {

    return (
        booking.status ||
        "Pending"
    );

}


function formatBookingDate(
    dateValue
) {

    if (!dateValue) {
        return "—";
    }


    var date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateValue
        );

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   RENDER BOOKINGS
========================================================= */

function renderDashboardBookings(
    searchTerm
) {

    var table =
        document.getElementById(
            "bookingTable"
        );

    var empty =
        document.getElementById(
            "bookingEmptyState"
        );


    if (!table) {
        return;
    }


    var bookings =
        getStoredBookings();


    var query =
        String(
            searchTerm || ""
        )
        .trim()
        .toLowerCase();


    if (query) {

        bookings =
            bookings.filter(
                function(booking) {

                    var searchable =
                        [
                            getBookingClientName(
                                booking
                            ),

                            getBookingServiceName(
                                booking
                            ),

                            getBookingDate(
                                booking
                            ),

                            getBookingStatus(
                                booking
                            )

                        ]
                        .join(" ")
                        .toLowerCase();


                    return searchable
                        .indexOf(query) !== -1;

                }
            );

    }


    table.innerHTML =
        "";


    if (!bookings.length) {

        if (empty) {

            empty.hidden =
                false;

        }


        return;

    }


    if (empty) {

        empty.hidden =
            true;

    }


    bookings
        .slice(0, 8)
        .forEach(
            function(booking) {

                var row =
                    document.createElement(
                        "tr"
                    );


                var client =
                    document.createElement(
                        "td"
                    );


                client.textContent =
                    getBookingClientName(
                        booking
                    );


                var service =
                    document.createElement(
                        "td"
                    );


                service.textContent =
                    getBookingServiceName(
                        booking
                    );


                var date =
                    document.createElement(
                        "td"
                    );


                date.textContent =
                    formatBookingDate(
                        getBookingDate(
                            booking
                        )
                    );


                var statusCell =
                    document.createElement(
                        "td"
                    );


                var status =
                    getBookingStatus(
                        booking
                    );


                var statusElement =
                    document.createElement(
                        "span"
                    );


                var statusClass =
                    String(
                        status
                    )
                    .toLowerCase();


                statusElement.className =
                    "booking-status";


                if (
                    statusClass.indexOf(
                        "confirm"
                    ) !== -1
                ) {

                    statusElement.classList.add(
                        "confirmed"
                    );

                }
                else if (
                    statusClass.indexOf(
                        "cancel"
                    ) !== -1
                ) {

                    statusElement.classList.add(
                        "cancelled"
                    );

                }
                else {

                    statusElement.classList.add(
                        "pending"
                    );

                }


                statusElement.textContent =
                    status;


                statusCell.appendChild(
                    statusElement
                );


                row.appendChild(
                    client
                );

                row.appendChild(
                    service
                );

                row.appendChild(
                    date
                );

                row.appendChild(
                    statusCell
                );


                table.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   TODAY'S BOOKINGS
========================================================= */

function countTodaysBookings() {

    var bookings =
        getStoredBookings();


    var today =
        new Date();


    var todayString =
        today.toISOString()
            .split("T")[0];


    return bookings.filter(
        function(booking) {

            var date =
                getBookingDate(
                    booking
                );


            if (!date) {
                return false;
            }


            var parsed =
                new Date(
                    date
                );


            if (
                Number.isNaN(
                    parsed.getTime()
                )
            ) {

                return (
                    String(date)
                    .indexOf(
                        todayString
                    ) !== -1
                );

            }


            return (
                parsed.toISOString()
                    .split("T")[0] ===
                todayString
            );

        }
    ).length;

}


/* =========================================================
   REVENUE
========================================================= */

function getBookingRevenue(
    booking
) {

    var values = [
        booking.revenue,
        booking.amount,
        booking.price,
        booking.totalAmount,
        booking.total
    ];


    for (
        var i = 0;
        i < values.length;
        i++
    ) {

        var value =
            Number(
                values[i]
            );


        if (
            Number.isFinite(value)
        ) {

            return value;

        }

    }


    return 0;

}


function formatCurrency(
    amount
) {

    var value =
        Number(amount) || 0;


    return "₹" +
        value.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 0
            }
        );

}


/* =========================================================
   UPDATE DASHBOARD STATS
========================================================= */

function updateDashboardStats() {

    var bookings =
        getStoredBookings();


    var galleries =
        getStoredGalleries();


    var services =
        getStoredServices();


    var todayCounter =
        document.getElementById(
            "todayBookingsCounter"
        );


    var photosCounter =
        document.getElementById(
            "galleryPhotosCounter"
        );


    var revenueElement =
        document.getElementById(
            "dashboardRevenue"
        );


    var totalBookingsElement =
        document.getElementById(
            "totalBookings"
        );


    var totalRevenueElement =
        document.getElementById(
            "totalRevenue"
        );


    var albumsElement =
        document.getElementById(
            "totalAlbums"
        );


    var totalPhotos =
        galleries.reduce(
            function(total, gallery) {

                return total +
                    getGalleryPhotoCount(
                        gallery
                    );

            },
            0
        );


    var totalRevenue =
        bookings.reduce(
            function(total, booking) {

                return total +
                    getBookingRevenue(
                        booking
                    );

            },
            0
        );


    if (todayCounter) {

        todayCounter.textContent =
            countTodaysBookings();

    }


    if (photosCounter) {

        photosCounter.textContent =
            totalPhotos.toLocaleString(
                "en-IN"
            );

    }


    if (revenueElement) {

        revenueElement.textContent =
            formatCurrency(
                totalRevenue
            );

    }


    if (totalBookingsElement) {

        totalBookingsElement.textContent =
            bookings.length.toLocaleString(
                "en-IN"
            );

    }


    if (totalRevenueElement) {

        totalRevenueElement.textContent =
            formatCurrency(
                totalRevenue
            );

    }


    if (albumsElement) {

        albumsElement.textContent =
            galleries.length.toLocaleString(
                "en-IN"
            );

    }


    updateActiveServiceCounter(
        services
    );

}


/* =========================================================
   REVIEWS
========================================================= */

function getStoredReviews() {

    var reviews =
        readLocalStorage(
            "professionalStudio.reviews",
            null
        );


    if (
        Array.isArray(
            reviews
        )
    ) {

        return reviews;

    }


    /*
       Temporary frontend fallback.

       This will later be replaced by
       backend review data.
    */

    return [

        {
            name: "Rahul Patil",
            review:
                "Very professional experience. The final photographs were excellent.",
            service:
                "Wedding Photography",
            rating: 5
        },

        {
            name: "Neha Sharma",
            review:
                "The entire booking and photography experience was smooth and well managed.",
            service:
                "Pre-Wedding Photography",
            rating: 5
        },

        {
            name: "Aryan Mehta",
            review:
                "Beautiful photographs and great communication throughout the project.",
            service:
                "Event Photography",
            rating: 5
        }

    ];

}


/* =========================================================
   RENDER REVIEWS
========================================================= */

function renderDashboardReviews() {

    var grid =
        document.getElementById(
            "reviewsGrid"
        );


    if (!grid) {
        return;
    }


    var reviews =
        getStoredReviews();


    grid.innerHTML =
        "";


    reviews
        .slice(0, 6)
        .forEach(
            function(review) {

                var card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "review-card";


                var stars =
                    document.createElement(
                        "div"
                    );


                stars.className =
                    "review-stars";


                var rating =
                    Number(
                        review.rating
                    ) || 5;


                stars.textContent =
                    "★".repeat(
                        Math.min(
                            5,
                            Math.max(
                                1,
                                rating
                            )
                        )
                    );


                var text =
                    document.createElement(
                        "p"
                    );


                text.className =
                    "review-text";


                text.textContent =
                    review.review ||
                    review.text ||
                    review.comment ||
                    "";


                var author =
                    document.createElement(
                        "div"
                    );


                author.className =
                    "review-author";


                author.textContent =
                    review.name ||
                    review.clientName ||
                    "Client";


                var service =
                    document.createElement(
                        "div"
                    );


                service.className =
                    "review-service";


                service.textContent =
                    review.service ||
                    review.serviceName ||
                    "";


                card.appendChild(
                    stars
                );


                card.appendChild(
                    text
                );


                card.appendChild(
                    author
                );


                card.appendChild(
                    service
                );


                grid.appendChild(
                    card
                );

            }
        );

}


/* =========================================================
   ANALYTICS
========================================================= */

function renderActivityChart() {

    var chart =
        document.getElementById(
            "activityChart"
        );


    if (!chart) {
        return;
    }


    chart.innerHTML =
        "";


    /*
       Frontend visualization only.

       This deliberately avoids pretending these
       values are backend analytics.
    */

    var values = [
        35,
        58,
        44,
        72,
        61,
        85,
        67
    ];


    values.forEach(
        function(value) {

            var bar =
                document.createElement(
                    "div"
                );


            bar.className =
                "chart-bar";


            bar.style.height =
                value + "%";


            chart.appendChild(
                bar
            );

        }
    );

}


/* =========================================================
   SUBSCRIPTION DISPLAY
========================================================= */

function getSubscriptionRenewal() {

    var saved =
        localStorage.getItem(
            "professionalStudio.subscriptionRenewal"
        );


    if (saved) {

        var date =
            new Date(
                saved
            );


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            return date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        }

    }


    /*
       Temporary prototype date.
    */

    return "12 Jan 2027";

}


function renderSubscription() {

    var plan =
        getCurrentSubscriptionPlan();


    var planName =
        document.getElementById(
            "subscriptionPlanName"
        );


    var storageText =
        document.getElementById(
            "subscriptionStorageText"
        );


    var renewal =
        document.getElementById(
            "subscriptionRenewal"
        );


    if (planName) {

        planName.textContent =
            plan.name;

    }


    if (storageText) {

        storageText.textContent =
            formatPortfolioStorageMB(
                plan.storageMB
            ) +
            " portfolio storage";

    }


    if (renewal) {

        renewal.textContent =
            getSubscriptionRenewal();

    }

}


/* =========================================================
   GREETING
========================================================= */

function renderGreeting() {

    var hour =
        new Date()
            .getHours();


    var greeting =
        "Welcome";


    if (hour < 12) {

        greeting =
            "Good Morning";

    }
    else if (hour < 17) {

        greeting =
            "Good Afternoon";

    }
    else {

        greeting =
            "Good Evening";

    }


    document
        .querySelectorAll(
            "[data-greeting]"
        )
        .forEach(
            function(element) {

                element.textContent =
                    greeting;

            }
        );

}


/* =========================================================
   RENDER PHOTOGRAPHER NAME
========================================================= */

function renderPhotographerName() {

    var nameElement =
        document.getElementById(
            "name"
        );


    if (!nameElement) {
        return;
    }


    nameElement.textContent =
        getPhotographerName();

}


/* =========================================================
   SEARCH BOOKINGS
========================================================= */

function initializeBookingSearch() {

    var input =
        document.getElementById(
            "searchBooking"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function() {

            renderDashboardBookings(
                input.value
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

        var relevantKeys = [

            PORTFOLIO_STORAGE_KEY,

            SUBSCRIPTION_PLAN_KEY,

            EQUIPMENT_STORAGE_KEY,

            SERVICES_STORAGE_KEY,

            GALLERY_STORAGE_KEY,

            BOOKING_STORAGE_KEY,

            PROFILE_STORAGE_KEY

        ];


        if (
            relevantKeys.indexOf(
                event.key
            ) !== -1
        ) {

            refreshDashboard();

        }

    }
);


/* =========================================================
   GLOBAL REFRESH
========================================================= */

function refreshDashboard() {

    renderPhotographerName();

    renderGreeting();

    renderPortfolioStorage();

    renderDashboardEquipment();

    renderDashboardServices();

    renderDashboardGalleries();

    renderDashboardBookings(
        document.getElementById(
            "searchBooking"
        )?.value || ""
    );

    renderDashboardReviews();

    updateDashboardStats();

    renderSubscription();

}


/* =========================================================
   INITIALIZE PORTFOLIO STORAGE
========================================================= */

function initializePortfolioStorage() {

    var storage =
        getPortfolioStorage();


    storage.storagePlan =
        getCurrentSubscriptionPlan()
            .id;


    storage.storageLimitMB =
        getPortfolioStorageLimitMB();


    savePortfolioStorage(
        storage
    );

}


/* =========================================================
   DASHBOARD INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializePortfolioStorage();

        renderPhotographerName();

        renderGreeting();

        renderPortfolioStorage();

        renderDashboardEquipment();

        initializeEquipmentCategoryCreation();

        renderDashboardServices();

        renderDashboardGalleries();

        renderDashboardBookings();

        renderDashboardReviews();

        renderActivityChart();

        updateDashboardStats();

        renderSubscription();

        initializeBookingSearch();

    }
);