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

var SUBSCRIPTION_STATUS_KEY =
    "professionalStudio.subscriptionStatus";

var SUBSCRIPTION_RENEWAL_KEY =
    "professionalStudio.subscriptionRenewal";

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

var REVIEW_STORAGE_KEY =
    "professionalStudio.reviews";


/* =========================================================
   SUBSCRIPTION PLANS
========================================================= */

var STORAGE_PLANS = {

    starter: {
        id: "starter",
        name: "Starter",
        price: 499,
        storageMB: 500
    },

    professional: {
        id: "professional",
        name: "Professional",
        price: 1499,
        storageMB: 2048
    },

    enterprise: {
        id: "enterprise",
        name: "Enterprise",
        price: 2999,
        storageMB: 10240
    }

};


var LEGACY_SUBSCRIPTION_PLAN_MAP = {

    basic: "starter",

    professional: "professional",

    studio: "enterprise"

};


/* =========================================================
   GENERAL HELPERS
========================================================= */

function normalizeSubscriptionPlanId(planId) {

    if (typeof planId !== "string") {
        return null;
    }

    var normalized =
        planId.trim().toLowerCase();

    if (STORAGE_PLANS[normalized]) {
        return normalized;
    }

    if (
        LEGACY_SUBSCRIPTION_PLAN_MAP[
            normalized
        ]
    ) {
        return LEGACY_SUBSCRIPTION_PLAN_MAP[
            normalized
        ];
    }

    return null;
}


function readLocalStorage(key, fallback) {

    try {

        var saved =
            localStorage.getItem(key);

        if (!saved) {
            return fallback;
        }

        return JSON.parse(saved);

    } catch (error) {

        return fallback;

    }
}


function writeLocalStorage(key, value) {

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


function removeLocalStorage(key) {

    try {

        localStorage.removeItem(key);

        return true;

    } catch (error) {

        return false;

    }
}


function getRawLocalStorageValue(key) {

    try {

        return localStorage.getItem(key);

    } catch (error) {

        return null;

    }
}


function safeNumber(value, fallback) {

    var number =
        Number(value);

    if (Number.isFinite(number)) {
        return number;
    }

    return fallback !== undefined
        ? fallback
        : 0;
}


function safeDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    var date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date;
}


function createUniqueId(prefix) {

    return (
        String(prefix || "item") +
        "-" +
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );

}


function normalizeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase();

}


/* =========================================================
   TOAST
========================================================= */

var toastTimer = null;


function showDashboardToast(message) {

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
        typeof profile === "object" &&
        !Array.isArray(profile)
    ) {

        return profile;

    }

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
            getRawLocalStorageValue(
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

            return (
                window.location.origin +
                "/profile.html?slug=" +
                encodeURIComponent(value)
            );

        }

    }

    var slug =
        getRawLocalStorageValue(
            "professionalStudio.profileSlug"
        );

    if (slug) {

        return (
            window.location.origin +
            "/profile.html?slug=" +
            encodeURIComponent(
                slug.trim()
            )
        );

    }

    return (
        window.location.origin +
        "/profile.html"
    );

}


function openPortfolio() {

    var link =
        getProfileLink();

    window.open(
        link,
        "_blank",
        "noopener,noreferrer"
    );

}


function fallbackCopyText(text) {

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

    textarea.setAttribute(
        "readonly",
        ""
    );

    document.body.appendChild(
        textarea
    );

    textarea.select();

    try {

        var successful =
            document.execCommand(
                "copy"
            );

        if (successful) {

            showDashboardToast(
                "Profile link copied"
            );

        } else {

            showDashboardToast(
                "Copy failed"
            );

        }

    } catch (error) {

        showDashboardToast(
            "Copy failed"
        );

    }

    textarea.remove();

}


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
   SUBSCRIPTION
========================================================= */

function getCurrentSubscriptionPlan() {

    var savedPlan =
        getRawLocalStorageValue(
            SUBSCRIPTION_PLAN_KEY
        );

    var normalizedPlanId =
        normalizeSubscriptionPlanId(
            savedPlan
        );

    if (
        normalizedPlanId &&
        STORAGE_PLANS[normalizedPlanId]
    ) {

        return STORAGE_PLANS[
            normalizedPlanId
        ];

    }

    return STORAGE_PLANS.starter;

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
        typeof storage !== "object" ||
        Array.isArray(storage)
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

    storage.files =
        storage.files.filter(
            function(file) {

                return (
                    file &&
                    typeof file === "object"
                );

            }
        );

    storage.storageLimitMB =
        getPortfolioStorageLimitMB();

    storage.storagePlan =
        getCurrentSubscriptionPlan().id;

    if (
        storage.files.length
    ) {

        storage.storageUsedMB =
            storage.files.reduce(
                function(total, file) {

                    return total +
                        Math.max(
                            0,
                            safeNumber(
                                file.sizeMB
                            )
                        );

                },
                0
            );

    } else {

        storage.storageUsedMB =
            Math.max(
                0,
                safeNumber(
                    storage.storageUsedMB
                )
            );

    }

    return storage;

}


function savePortfolioStorage(storage) {

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


function formatPortfolioStorageMB(value) {

    var mb =
        Math.max(
            0,
            safeNumber(value)
        );

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


function getPortfolioStoragePercentage(storage) {

    if (!storage) {
        return 0;
    }

    var limit =
        safeNumber(
            storage.storageLimitMB
        );

    var used =
        Math.max(
            0,
            safeNumber(
                storage.storageUsedMB
            )
        );

    if (limit <= 0) {
        return 100;
    }

    return Math.min(
        100,
        Math.max(
            0,
            (
                used /
                limit
            ) * 100
        )
    );

}


function getPortfolioStorageStatus(storage) {

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
        safeNumber(
            storage.storageLimitMB
        );

    var used =
        Math.max(
            0,
            safeNumber(
                storage.storageUsedMB
            )
        );

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

        progressElement.setAttribute(
            "aria-valuenow",
            String(
                Math.round(
                    percentage
                )
            )
        );

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

        }
        else if (
            percentage >= 80
        ) {

            warningElement.hidden =
                false;

            if (warningStrong) {

                warningStrong.textContent =
                    "Storage is almost full";

            }

            if (warningText) {

                warningText.textContent =
                    "Consider removing unused files before uploading more recent work.";

            }

        }
        else {

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


function getPortfolioUploadCheck(fileSizeMB) {

    var storage =
        getPortfolioStorage();

    var size =
        Math.max(
            0,
            safeNumber(
                fileSizeMB
            )
        );

    var used =
        Math.max(
            0,
            safeNumber(
                storage.storageUsedMB
            )
        );

    var limit =
        Math.max(
            0,
            safeNumber(
                storage.storageLimitMB
            )
        );

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


function canUploadPortfolioFile(fileSizeMB) {

    return getPortfolioUploadCheck(
        fileSizeMB
    ).allowed;

}


function addPortfolioFile(fileData) {

    if (
        !fileData ||
        typeof fileData !== "object" ||
        Array.isArray(fileData)
    ) {

        return {
            success: false,
            reason: "invalid-file"
        };

    }

    var sizeMB =
        Math.max(
            0,
            safeNumber(
                fileData.sizeMB
            )
        );

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
            createUniqueId(
                "portfolio"
            );

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
                    Math.max(
                        0,
                        safeNumber(
                            file.sizeMB
                        )
                    );

            },
            0
        );

    if (
        !savePortfolioStorage(
            storage
        )
    ) {

        return {

            success: false,

            reason:
                "storage-write-failed"

        };

    }

    renderPortfolioStorage();

    return {

        success: true,

        file:
            fileData,

        storage:
            storage

    };

}


function deletePortfolioFile(fileId) {

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
                    Math.max(
                        0,
                        safeNumber(
                            file.sizeMB
                        )
                    );

            },
            0
        );

    if (
        !savePortfolioStorage(
            storage
        )
    ) {

        return false;

    }

    renderPortfolioStorage();

    return true;

}


function setPortfolioSubscriptionPlan(planId) {

    var normalizedPlanId =
        normalizeSubscriptionPlanId(
            planId
        );

    if (
        !normalizedPlanId ||
        !STORAGE_PLANS[
            normalizedPlanId
        ]
    ) {

        return false;

    }

    if (
        !writeLocalStorage(
            SUBSCRIPTION_PLAN_KEY,
            normalizedPlanId
        )
    ) {

        return false;

    }

    var storage =
        getPortfolioStorage();

    storage.storagePlan =
        normalizedPlanId;

    storage.storageLimitMB =
        STORAGE_PLANS[
            normalizedPlanId
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

    if (!Array.isArray(services)) {
        return [];
    }

    return services.filter(
        function(service) {

            return (
                service &&
                typeof service === "object"
            );

        }
    );

}


function saveServices(services) {

    return writeLocalStorage(
        SERVICES_STORAGE_KEY,
        services
    );

}


function getServiceName(service) {

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


function updateActiveServiceCounter(services) {

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

    if (
        !serviceGrid.dataset.eventsAttached
    ) {

        serviceGrid.addEventListener(
            "change",
            function(event) {

                if (
                    !event.target.matches(
                        "input[type='checkbox']"
                    )
                ) {
                    return;
                }

                var checkbox =
                    event.target;

                var services =
                    getStoredServices();

                var serviceId =
                    checkbox.dataset.serviceId;

                var serviceName =
                    checkbox.dataset.serviceName;

                var service =
                    services.find(
                        function(item) {

                            if (serviceId) {

                                return String(
                                    item.id
                                ) ===
                                String(
                                    serviceId
                                );

                            }

                            return (
                                normalizeText(
                                    getServiceName(
                                        item
                                    )
                                ) ===
                                normalizeText(
                                    serviceName
                                )
                            );

                        }
                    );

                if (!service) {
                    return;
                }

                service.active =
                    checkbox.checked;

                if (
                    saveServices(
                        services
                    )
                ) {

                    updateActiveServiceCounter(
                        services
                    );

                }

            }
        );

        serviceGrid.dataset.eventsAttached =
            "true";

    }

    updateActiveServiceCounter(
        services
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

    if (!Array.isArray(equipment)) {
        return [];
    }

    var changed = false;

    equipment =
        equipment.filter(
            function(category, index) {

                if (
                    !category ||
                    typeof category !== "object" ||
                    Array.isArray(category)
                ) {

                    changed = true;

                    return false;

                }

                if (!category.id) {

                    category.id =
                        createUniqueId(
                            "equipment"
                        );

                    changed = true;

                }

                if (
                    !Array.isArray(
                        category.items
                    )
                ) {

                    category.items = [];

                    changed = true;

                }

                if (
                    typeof category.name !== "string" ||
                    !category.name.trim()
                ) {

                    category.name =
                        "Equipment";

                    changed = true;

                }

                return true;

            }
        );

    if (changed) {

        writeLocalStorage(
            EQUIPMENT_STORAGE_KEY,
            equipment
        );

    }

    return equipment;

}


function saveEquipment(equipment) {

    return writeLocalStorage(
        EQUIPMENT_STORAGE_KEY,
        equipment
    );

}


function getEquipmentItemName(item) {

    if (
        item &&
        typeof item === "object"
    ) {

        if (item.name) {
            return String(
                item.name
            ).trim();
        }

        if (item.title) {
            return String(
                item.title
            ).trim();
        }

        if (item.value) {
            return String(
                item.value
            ).trim();
        }

    }

    return String(
        item || ""
    ).trim();

}


function getEquipmentCategoryName(category) {

    if (!category) {
        return "Equipment";
    }

    return String(
        category.name ||
        category.title ||
        "Equipment"
    ).trim();

}


/* =========================================================
   EQUIPMENT LIST ITEM
========================================================= */

function addEquipmentListItem(list, item) {

    if (!list) {
        return;
    }

    var itemName =
        getEquipmentItemName(
            item
        );

    if (!itemName) {
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
        itemName;

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
        "Remove " +
        itemName
    );

    removeButton.title =
        "Remove " +
        itemName;

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

            if (
                !Array.isArray(
                    category.items
                )
            ) {

                category.items = [];

            }

            var removeIndex =
                category.items.findIndex(
                    function(existingItem) {

                        return (
                            normalizeText(
                                getEquipmentItemName(
                                    existingItem
                                )
                            ) ===
                            normalizeText(
                                itemName
                            )
                        );

                    }
                );

            if (removeIndex === -1) {
                return;
            }

            category.items.splice(
                removeIndex,
                1
            );

            if (
                saveEquipment(
                    equipment
                )
            ) {

                renderDashboardEquipment();

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

function createEquipmentCard(category) {

    var card =
        document.createElement(
            "div"
        );

    card.className =
        "equipment-card";

    card.dataset.categoryId =
        category.id;

    var header =
        document.createElement(
            "div"
        );

    header.className =
        "equipment-card-header";

    var headingWrap =
        document.createElement(
            "div"
        );

    headingWrap.className =
        "equipment-card-heading";

    var heading =
        document.createElement(
            "h3"
        );

    heading.textContent =
        getEquipmentCategoryName(
            category
        );

    var itemCount =
        document.createElement(
            "span"
        );

    itemCount.className =
        "equipment-item-count";

    var items =
        Array.isArray(
            category.items
        )
            ? category.items
            : [];

    var validItemCount =
        items.filter(
            function(item) {

                return Boolean(
                    getEquipmentItemName(
                        item
                    )
                );

            }
        ).length;

    itemCount.textContent =
        validItemCount +
        (
            validItemCount === 1
                ? " item"
                : " items"
        );

    headingWrap.appendChild(
        heading
    );

    headingWrap.appendChild(
        itemCount
    );

    var deleteButton =
        document.createElement(
            "button"
        );

    deleteButton.type =
        "button";

    deleteButton.className =
        "equipment-category-delete-btn";

    deleteButton.textContent =
        "Delete";

    deleteButton.setAttribute(
        "aria-label",
        "Delete " +
        getEquipmentCategoryName(
            category
        ) +
        " category"
    );

    deleteButton.title =
        "Delete category";

    deleteButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            var categoryName =
                getEquipmentCategoryName(
                    category
                );

            var confirmed =
                window.confirm(
                    "Delete the \"" +
                    categoryName +
                    "\" category?\n\n" +
                    "This will also remove all equipment listed inside it."
                );

            if (!confirmed) {
                return;
            }

            var equipment =
                getStoredEquipment();

            var updatedEquipment =
                equipment.filter(
                    function(existing) {

                        return String(
                            existing.id
                        ) !==
                        String(
                            category.id
                        );

                    }
                );

            if (
                updatedEquipment.length ===
                equipment.length
            ) {

                return;

            }

            if (
                saveEquipment(
                    updatedEquipment
                )
            ) {

                renderDashboardEquipment();

                showDashboardToast(
                    "Equipment category deleted"
                );

            }

        }
    );

    header.appendChild(
        headingWrap
    );

    header.appendChild(
        deleteButton
    );

    var list =
        document.createElement(
            "ul"
        );

    list.className =
        "equipment-list";

    if (items.length) {

        items.forEach(
            function(item) {

                addEquipmentListItem(
                    list,
                    item
                );

            }
        );

    }
    else {

        var empty =
            document.createElement(
                "li"
            );

        empty.className =
            "equipment-empty";

        empty.textContent =
            "No equipment added yet. Add your first item below.";

        list.appendChild(
            empty
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
        "e.g. Sony A7 IV";

    input.setAttribute(
        "aria-label",
        "Add equipment to " +
        getEquipmentCategoryName(
            category
        )
    );

    input.autocomplete =
        "off";

    var button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "add-item-btn";

    button.textContent =
        "Add";

    inputWrapper.appendChild(
        input
    );

    inputWrapper.appendChild(
        button
    );

    card.appendChild(
        header
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

function attachEquipmentEvents(card) {

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

            input.focus();

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
                        normalizeText(
                            getEquipmentItemName(
                                existingItem
                            )
                        ) ===
                        normalizeText(
                            value
                        )
                    );

                }
            );

        if (alreadyExists) {

            showDashboardToast(
                "This equipment is already added"
            );

            input.select();

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

            renderDashboardEquipment();

            showDashboardToast(
                "Equipment added"
            );

            var newCard = null;

            document
                .querySelectorAll(
                    ".equipment-card"
                )
                .forEach(
                    function(candidate) {

                        if (
                            !newCard &&
                            String(
                                candidate.dataset.categoryId
                            ) ===
                            String(
                                categoryId
                            )
                        ) {

                            newCard =
                                candidate;

                        }

                    }
                );

            if (newCard) {

                var newInput =
                    newCard.querySelector(
                        ".equipment-input input"
                    );

                if (newInput) {
                    newInput.focus();
                }

            }

        }

    }

    button.addEventListener(
        "click",
        addItem
    );

    input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
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

    equipmentGrid
        .querySelectorAll(
            ".equipment-section-empty"
        )
        .forEach(
            function(emptyState) {

                emptyState.remove();

            }
        );

    var equipment =
        getStoredEquipment();

    if (!equipment.length) {

        var emptyState =
            document.createElement(
                "div"
            );

        emptyState.className =
            "equipment-section-empty";

        var strong =
            document.createElement(
                "strong"
            );

        strong.textContent =
            "No equipment categories yet";

        var span =
            document.createElement(
                "span"
            );

        span.textContent =
            "Create a category to start organizing your cameras, lenses, lighting and other gear.";

        emptyState.appendChild(
            strong
        );

        emptyState.appendChild(
            span
        );

        equipmentGrid.insertBefore(
            emptyState,
            addEquipment
        );

    }

    equipment.forEach(
        function(category) {

            if (
                !category ||
                !getEquipmentCategoryName(
                    category
                )
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

    if (
        addEquipment.dataset.eventsAttached
    ) {

        return;

    }

    addEquipment.dataset.eventsAttached =
        "true";

    addEquipment.addEventListener(
        "click",
        function() {

            if (
                equipmentGrid.querySelector(
                    ".create-equipment-card"
                )
            ) {

                return;

            }

            var emptyState =
                equipmentGrid.querySelector(
                    ".equipment-section-empty"
                );

            if (emptyState) {
                emptyState.remove();
            }

            var createCard =
                document.createElement(
                    "div"
                );

            createCard.className =
                "equipment-card create-equipment-card";

            var icon =
                document.createElement(
                    "div"
                );

            icon.className =
                "create-equipment-icon";

            icon.textContent =
                "+";

            var copy =
                document.createElement(
                    "div"
                );

            copy.className =
                "create-equipment-copy";

            var eyebrow =
                document.createElement(
                    "span"
                );

            eyebrow.className =
                "equipment-eyebrow";

            eyebrow.textContent =
                "NEW CATEGORY";

            var heading =
                document.createElement(
                    "h3"
                );

            heading.textContent =
                "Organize your equipment";

            var paragraph =
                document.createElement(
                    "p"
                );

            paragraph.textContent =
                "Give this group a simple name, such as Cameras, Lenses or Studio Lighting.";

            copy.appendChild(
                eyebrow
            );

            copy.appendChild(
                heading
            );

            copy.appendChild(
                paragraph
            );

            var label =
                document.createElement(
                    "label"
                );

            label.className =
                "equipment-create-label";

            label.setAttribute(
                "for",
                "newEquipmentName"
            );

            label.textContent =
                "Category name";

            var input =
                document.createElement(
                    "input"
                );

            input.type =
                "text";

            input.id =
                "newEquipmentName";

            input.placeholder =
                "e.g. Cameras";

            input.maxLength =
                60;

            input.autocomplete =
                "off";

            var actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "create-actions";

            var createButton =
                document.createElement(
                    "button"
                );

            createButton.type =
                "button";

            createButton.className =
                "create-btn";

            createButton.textContent =
                "Create Category";

            var cancelButton =
                document.createElement(
                    "button"
                );

            cancelButton.type =
                "button";

            cancelButton.className =
                "cancel-btn";

            cancelButton.textContent =
                "Cancel";

            actions.appendChild(
                createButton
            );

            actions.appendChild(
                cancelButton
            );

            createCard.appendChild(
                icon
            );

            createCard.appendChild(
                copy
            );

            createCard.appendChild(
                label
            );

            createCard.appendChild(
                input
            );

            createCard.appendChild(
                actions
            );

            equipmentGrid.insertBefore(
                createCard,
                addEquipment
            );

            input.focus();

            function removeCreationCard() {

                createCard.remove();

                renderDashboardEquipment();

            }

            function createCategory() {

                var categoryName =
                    input.value.trim();

                if (!categoryName) {

                    input.focus();

                    showDashboardToast(
                        "Enter a category name"
                    );

                    return;

                }

                var equipment =
                    getStoredEquipment();

                var exists =
                    equipment.some(
                        function(category) {

                            return (
                                normalizeText(
                                    getEquipmentCategoryName(
                                        category
                                    )
                                ) ===
                                normalizeText(
                                    categoryName
                                )
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
                        createUniqueId(
                            "equipment"
                        ),

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

                    renderDashboardEquipment();

                    showDashboardToast(
                        "Equipment category created"
                    );

                } else {

                    showDashboardToast(
                        "Unable to save equipment category"
                    );

                }

            }

            createButton.addEventListener(
                "click",
                createCategory
            );

            input.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        createCategory();

                    }

                    if (
                        event.key === "Escape"
                    ) {

                        event.preventDefault();

                        removeCreationCard();

                    }

                }
            );

            cancelButton.addEventListener(
                "click",
                function() {

                    removeCreationCard();

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

    if (!Array.isArray(galleries)) {
        return [];
    }

    return galleries.filter(
        function(gallery) {

            return (
                gallery &&
                typeof gallery === "object"
            );

        }
    );

}


function getGalleryExpiryDate(gallery) {

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

        var date =
            safeDate(
                possibleDates[i]
            );

        if (date) {
            return date;
        }

    }

    if (
        gallery.durationMonths &&
        gallery.createdAt
    ) {

        var created =
            safeDate(
                gallery.createdAt
            );

        if (created) {

            var expiry =
                new Date(
                    created.getTime()
                );

            expiry.setMonth(
                expiry.getMonth() +
                safeNumber(
                    gallery.durationMonths
                )
            );

            return expiry;

        }

    }

    return null;

}


function getGalleryStatus(gallery) {

    var expiry =
        getGalleryExpiryDate(
            gallery
        );

    if (!expiry) {

        return {

            label: "Active",

            className:
                "active"

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

            className:
                "expired"

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

    if (days <= 14) {

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

        className:
            "active"

    };

}


function getGalleryPhotoCount(gallery) {

    if (!gallery) {
        return 0;
    }

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
            safeNumber(
                possibleValues[i],
                NaN
            );

        if (
            Number.isFinite(value)
        ) {

            return Math.max(
                0,
                value
            );

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


function getGalleryStorageMB(gallery) {

    if (!gallery) {
        return 0;
    }

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
            safeNumber(
                possibleValues[i],
                NaN
            );

        if (
            Number.isFinite(value) &&
            value >= 0
        ) {

            return value;

        }

    }

    var bytes =
        safeNumber(
            gallery.storageUsedBytes,
            0
        );

    if (bytes > 0) {

        return bytes /
            (
                1024 *
                1024
            );

    }

    return 0;

}


function getGalleryName(gallery) {

    if (!gallery) {
        return "Untitled Gallery";
    }

    var name =
        gallery.name ||
        gallery.galleryName ||
        gallery.title ||
        gallery.clientName ||
        "";

    return String(
        name
    ).trim() ||
        "Untitled Gallery";

}


function getGalleryCover(gallery) {

    if (!gallery) {
        return "";
    }

    return String(
        gallery.coverImage ||
        gallery.coverUrl ||
        gallery.thumbnail ||
        gallery.image ||
        ""
    ).trim();

}


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

    var activeCount = 0;

    var expiringCount = 0;

    var totalStorageMB = 0;

    galleries.forEach(
        function(gallery) {

            var status =
                getGalleryStatus(
                    gallery
                );

            /*
               Expiring galleries are still active
               until their expiry date is reached.
            */

            if (
                status.className === "active" ||
                status.className === "expiring"
            ) {

                activeCount++;

            }

            if (
                status.className === "expiring"
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
            emptyElement.hidden = false;
        }

        return;

    }

    if (emptyElement) {
        emptyElement.hidden = true;
    }

    var sorted =
        galleries
            .slice()
            .sort(
                function(a, b) {

                    var aDate =
                        safeDate(
                            a.createdAt ||
                            a.updatedAt
                        );

                    var bDate =
                        safeDate(
                            b.createdAt ||
                            b.updatedAt
                        );

                    return (
                        (
                            bDate
                                ? bDate.getTime()
                                : 0
                        ) -
                        (
                            aDate
                                ? aDate.getTime()
                                : 0
                        )
                    );

                }
            )
            .slice(
                0,
                6
            );

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


function createDashboardGalleryCard(gallery) {

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

    }
    else {

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

    if (!Array.isArray(bookings)) {
        return [];
    }

    return bookings.filter(
        function(booking) {

            return (
                booking &&
                typeof booking === "object"
            );

        }
    );

}


function getBookingClientName(booking) {

    if (!booking) {
        return "Client";
    }

    return String(
        booking.clientName ||
        booking.name ||
        booking.client ||
        booking.customerName ||
        "Client"
    ).trim() || "Client";

}


function getBookingServiceName(booking) {

    if (!booking) {
        return "Photography";
    }

    return String(
        booking.serviceName ||
        booking.service ||
        booking.type ||
        booking.packageName ||
        "Photography"
    ).trim() || "Photography";

}


function getBookingDate(booking) {

    if (!booking) {
        return "";
    }

    return (
        booking.date ||
        booking.bookingDate ||
        booking.eventDate ||
        booking.startDate ||
        ""
    );

}


function getBookingStatus(booking) {

    if (!booking) {
        return "Pending";
    }

    return String(
        booking.status ||
        "Pending"
    ).trim() || "Pending";

}


/* =========================================================
   BOOKING TIME
========================================================= */

function normalizeTimeValue(timeValue) {

    if (
        timeValue === null ||
        timeValue === undefined ||
        timeValue === ""
    ) {

        return "";

    }

    var value =
        String(
            timeValue
        ).trim();

    var twelveHour =
        value.match(
            /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
        );

    if (twelveHour) {

        var twelveHourNumber =
            Number(
                twelveHour[1]
            );

        var minute =
            twelveHour[2];

        var period =
            twelveHour[3]
                .toUpperCase();

        if (
            twelveHourNumber >= 1 &&
            twelveHourNumber <= 12
        ) {

            return (
                twelveHourNumber +
                ":" +
                minute +
                " " +
                period
            );

        }

    }

    var twentyFourHour =
        value.match(
            /^(\d{1,2}):(\d{2})$/
        );

    if (twentyFourHour) {

        var hour =
            Number(
                twentyFourHour[1]
            );

        var minutes =
            twentyFourHour[2];

        if (
            hour >= 0 &&
            hour <= 23
        ) {

            var suffix =
                hour >= 12
                    ? "PM"
                    : "AM";

            var displayHour =
                hour % 12;

            if (
                displayHour === 0
            ) {

                displayHour =
                    12;

            }

            return (
                displayHour +
                ":" +
                minutes +
                " " +
                suffix
            );

        }

    }

    return value;

}


function getBookingStartTime(booking) {

    if (!booking) {
        return "";
    }

    return (
        booking.startTime ||
        booking.time ||
        booking.fromTime ||
        booking.eventTime ||
        ""
    );

}


function getBookingEndTime(booking) {

    if (!booking) {
        return "";
    }

    return (
        booking.endTime ||
        booking.toTime ||
        booking.untilTime ||
        ""
    );

}


function formatBookingTimeRange(booking) {

    var start =
        normalizeTimeValue(
            getBookingStartTime(
                booking
            )
        );

    var end =
        normalizeTimeValue(
            getBookingEndTime(
                booking
            )
        );

    if (
        start &&
        end
    ) {

        return (
            start +
            " - " +
            end
        );

    }

    return (
        start ||
        end ||
        ""
    );

}


/* =========================================================
   BOOKING DATE
========================================================= */

function parseBookingDate(dateValue) {

    if (!dateValue) {
        return null;
    }

    if (dateValue instanceof Date) {

        return Number.isNaN(
            dateValue.getTime()
        )
            ? null
            : dateValue;

    }

    var value =
        String(
            dateValue
        ).trim();

    var indian =
        value.match(
            /^(\d{2})-(\d{2})-(\d{4})$/
        );

    if (indian) {

        var day =
            Number(
                indian[1]
            );

        var month =
            Number(
                indian[2]
            ) - 1;

        var year =
            Number(
                indian[3]
            );

        var localDate =
            new Date(
                year,
                month,
                day
            );

        if (
            localDate.getFullYear() === year &&
            localDate.getMonth() === month &&
            localDate.getDate() === day
        ) {

            return localDate;

        }

    }

    return safeDate(
        value
    );

}


function formatBookingDate(dateValue) {

    if (!dateValue) {
        return "—";
    }

    var date =
        parseBookingDate(
            dateValue
        );

    if (!date) {

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
   BOOKING STATUS HELPERS
========================================================= */

function normalizeBookingStatus(status) {

    return normalizeText(
        status
    );

}


function isCancelledBooking(booking) {

    var status =
        normalizeBookingStatus(
            getBookingStatus(
                booking
            )
        );

    return (
        status.indexOf("cancel") !== -1 ||
        status.indexOf("reject") !== -1 ||
        status.indexOf("declin") !== -1
    );

}


function isRevenueEligibleBooking(booking) {

    if (!booking) {
        return false;
    }

    if (
        isCancelledBooking(
            booking
        )
    ) {

        return false;

    }

    var status =
        normalizeBookingStatus(
            getBookingStatus(
                booking
            )
        );

    /*
       Revenue should not be presented as earned
       from requests that are still pending.

       Paid/completed/confirmed bookings are treated
       as revenue-eligible until the backend defines
       a stricter payment state.
    */

    if (
        status.indexOf("pending") !== -1 ||
        status.indexOf("requested") !== -1 ||
        status.indexOf("inquir") !== -1
    ) {

        return false;

    }

    return true;

}


/* =========================================================
   RENDER BOOKINGS
========================================================= */

function renderDashboardBookings(searchTerm) {

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

    var originalBookingCount =
        bookings.length;

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

                    var searchable = [

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
                        ),

                        getBookingStartTime(
                            booking
                        ),

                        getBookingEndTime(
                            booking
                        )

                    ]
                        .join(" ")
                        .toLowerCase();

                    return (
                        searchable.indexOf(
                            query
                        ) !== -1
                    );

                }
            );

    }

    table.innerHTML =
        "";

    if (!bookings.length) {

        if (empty) {

            empty.hidden =
                false;

            if (query) {

                empty.dataset.searchResult =
                    "true";

            } else {

                delete empty.dataset.searchResult;

            }

        }

        return;

    }

    if (empty) {
        empty.hidden = true;
    }

    bookings
        .slice(
            0,
            8
        )
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

                var time =
                    formatBookingTimeRange(
                        booking
                    );

                if (time) {

                    var timeElement =
                        document.createElement(
                            "small"
                        );

                    timeElement.className =
                        "booking-time";

                    timeElement.textContent =
                        time;

                    date.appendChild(
                        document.createElement(
                            "br"
                        )
                    );

                    date.appendChild(
                        timeElement
                    );

                }

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
                    normalizeBookingStatus(
                        status
                    );

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
                    ) !== -1 ||
                    statusClass.indexOf(
                        "reject"
                    ) !== -1
                ) {

                    statusElement.classList.add(
                        "cancelled"
                    );

                }
                else if (
                    statusClass.indexOf(
                        "complete"
                    ) !== -1
                ) {

                    statusElement.classList.add(
                        "completed"
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

function getLocalDateKey(date) {

    if (
        !(date instanceof Date) ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }

    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +
        "-" +
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )
    );

}


function countTodaysBookings() {

    var bookings =
        getStoredBookings();

    var today =
        new Date();

    var todayKey =
        getLocalDateKey(
            today
        );

    return bookings.filter(
        function(booking) {

            var parsed =
                parseBookingDate(
                    getBookingDate(
                        booking
                    )
                );

            if (!parsed) {
                return false;
            }

            return (
                getLocalDateKey(
                    parsed
                ) ===
                todayKey
            );

        }
    ).length;

}


/* =========================================================
   REVENUE
========================================================= */

function getBookingRevenue(booking) {

    if (!booking) {
        return 0;
    }

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
            Number.isFinite(
                value
            ) &&
            value >= 0
        ) {

            return value;

        }

    }

    return 0;

}


function formatCurrency(amount) {

    var value =
        Math.max(
            0,
            Number(amount) || 0
        );

    return "₹" +
        value.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 0
            }
        );

}


/* =========================================================
   DASHBOARD STATS
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

                if (
                    !isRevenueEligibleBooking(
                        booking
                    )
                ) {

                    return total;

                }

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
            REVIEW_STORAGE_KEY,
            []
        );

    if (
        reviews &&
        typeof reviews === "object" &&
        !Array.isArray(reviews)
    ) {

        if (
            Array.isArray(
                reviews.reviews
            )
        ) {

            reviews =
                reviews.reviews;

        } else {

            reviews = [];

        }

    }

    if (!Array.isArray(reviews)) {
        return [];
    }

    return reviews.filter(
        function(review) {

            return (
                review &&
                typeof review === "object"
            );

        }
    );

}


function getReviewText(review) {

    if (!review) {
        return "";
    }

    var values = [

        review.review,
        review.text,
        review.comment,
        review.message

    ];

    for (
        var i = 0;
        i < values.length;
        i++
    ) {

        if (
            typeof values[i] === "string" &&
            values[i].trim()
        ) {

            return values[i].trim();

        }

    }

    return "";

}


function getReviewAuthor(review) {

    if (!review) {
        return "Client";
    }

    var values = [

        review.name,
        review.clientName,
        review.customerName,
        review.author,
        review.client

    ];

    for (
        var i = 0;
        i < values.length;
        i++
    ) {

        if (
            typeof values[i] === "string" &&
            values[i].trim()
        ) {

            return values[i].trim();

        }

    }

    return "Client";

}


function getReviewService(review) {

    if (!review) {
        return "";
    }

    var values = [

        review.service,
        review.serviceName,
        review.packageName,
        review.package

    ];

    for (
        var i = 0;
        i < values.length;
        i++
    ) {

        if (
            typeof values[i] === "string" &&
            values[i].trim()
        ) {

            return values[i].trim();

        }

    }

    return "";

}


function getReviewRating(review) {

    if (!review) {
        return 0;
    }

    var rating =
        Number(
            review.rating
        );

    if (
        !Number.isFinite(
            rating
        ) ||
        rating <= 0
    ) {

        return 0;

    }

    return Math.min(
        5,
        Math.max(
            1,
            Math.round(
                rating
            )
        )
    );

}


function getReviewIdentifier(review) {

    if (
        review &&
        review.id
    ) {

        return String(
            review.id
        );

    }

    return [

        getReviewAuthor(review),
        getReviewText(review),
        getReviewService(review),
        getReviewRating(review)

    ]
        .join("|")
        .toLowerCase();

}


function deleteDashboardReview(review) {

    if (!review) {
        return;
    }

    var reviews =
        getStoredReviews();

    var identifier =
        getReviewIdentifier(
            review
        );

    var reviewIndex =
        reviews.findIndex(
            function(existingReview) {

                return (
                    getReviewIdentifier(
                        existingReview
                    ) ===
                    identifier
                );

            }
        );

    if (
        reviewIndex === -1
    ) {

        showDashboardToast(
            "Review could not be found"
        );

        return;

    }

    var confirmed =
        window.confirm(
            "Delete this client review? This action cannot be undone."
        );

    if (!confirmed) {
        return;
    }

    reviews.splice(
        reviewIndex,
        1
    );

    if (
        !writeLocalStorage(
            REVIEW_STORAGE_KEY,
            reviews
        )
    ) {

        showDashboardToast(
            "Unable to delete review"
        );

        return;

    }

    renderDashboardReviews();

    showDashboardToast(
        "Review deleted"
    );

    window.dispatchEvent(
        new CustomEvent(
            "professionalStudioReviewsUpdated"
        )
    );

}


function renderReviewsEmptyState(grid) {

    var empty =
        document.createElement(
            "div"
        );

    empty.className =
        "reviews-empty";

    var title =
        document.createElement(
            "h3"
        );

    title.textContent =
        "No client reviews yet";

    var text =
        document.createElement(
            "p"
        );

    text.textContent =
        "Reviews from your clients will appear here once they submit feedback.";

    empty.appendChild(
        title
    );

    empty.appendChild(
        text
    );

    grid.appendChild(
        empty
    );

}


function createDashboardReviewCard(review) {

    var card =
        document.createElement(
            "article"
        );

    card.className =
        "review-card";

    var rating =
        getReviewRating(
            review
        );

    if (rating > 0) {

        var stars =
            document.createElement(
                "div"
            );

        stars.className =
            "review-stars";

        stars.setAttribute(
            "aria-label",
            rating +
            " out of 5 stars"
        );

        stars.textContent =
            "★".repeat(
                rating
            );

        card.appendChild(
            stars
        );

    }

    var reviewText =
        getReviewText(
            review
        );

    if (reviewText) {

        var text =
            document.createElement(
                "p"
            );

        text.className =
            "review-text";

        text.textContent =
            reviewText;

        card.appendChild(
            text
        );

    }

    var author =
        document.createElement(
            "div"
        );

    author.className =
        "review-author";

    author.textContent =
        getReviewAuthor(
            review
        );

    card.appendChild(
        author
    );

    var service =
        getReviewService(
            review
        );

    if (service) {

        var serviceElement =
            document.createElement(
                "div"
            );

        serviceElement.className =
            "review-service";

        serviceElement.textContent =
            service;

        card.appendChild(
            serviceElement
        );

    }

    var actions =
        document.createElement(
            "div"
        );

    actions.className =
        "review-actions";

    var deleteButton =
        document.createElement(
            "button"
        );

    deleteButton.type =
        "button";

    deleteButton.className =
        "review-delete-btn";

    deleteButton.textContent =
        "Delete Review";

    deleteButton.setAttribute(
        "aria-label",
        "Delete review from " +
        getReviewAuthor(
            review
        )
    );

    deleteButton.addEventListener(
        "click",
        function() {

            deleteDashboardReview(
                review
            );

        }
    );

    actions.appendChild(
        deleteButton
    );

    card.appendChild(
        actions
    );

    return card;

}


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

    if (!reviews.length) {

        renderReviewsEmptyState(
            grid
        );

        return;

    }

    var sortedReviews =
        reviews
            .slice()
            .sort(
                function(a, b) {

                    var aDate =
                        safeDate(
                            a.createdAt ||
                            a.submittedAt ||
                            a.date
                        );

                    var bDate =
                        safeDate(
                            b.createdAt ||
                            b.submittedAt ||
                            b.date
                        );

                    return (
                        (
                            bDate
                                ? bDate.getTime()
                                : 0
                        ) -
                        (
                            aDate
                                ? aDate.getTime()
                                : 0
                        )
                    );

                }
            )
            .slice(
                0,
                6
            );

    sortedReviews.forEach(
        function(review) {

            var hasText =
                Boolean(
                    getReviewText(
                        review
                    )
                );

            var hasRating =
                getReviewRating(
                    review
                ) > 0;

            if (
                !hasText &&
                !hasRating
            ) {

                return;

            }

            grid.appendChild(
                createDashboardReviewCard(
                    review
                )
            );

        }
    );

    if (
        !grid.children.length
    ) {

        renderReviewsEmptyState(
            grid
        );

    }

}


/* =========================================================
   DYNAMIC ACTIVITY CHART
========================================================= */

function getDateKeyOffset(daysAgo) {

    var date =
        new Date();

    date.setHours(
        0,
        0,
        0,
        0
    );

    date.setDate(
        date.getDate() -
        daysAgo
    );

    return getLocalDateKey(
        date
    );

}


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

    var bookings =
        getStoredBookings();

    var counts = [];

    for (
        var i = 6;
        i >= 0;
        i--
    ) {

        var key =
            getDateKeyOffset(
                i
            );

        var count =
            bookings.filter(
                function(booking) {

                    var date =
                        parseBookingDate(
                            getBookingDate(
                                booking
                            )
                        );

                    return (
                        date &&
                        getLocalDateKey(
                            date
                        ) ===
                        key
                    );

                }
            ).length;

        counts.push(
            count
        );

    }

    var maximum =
        Math.max(
            1,
            ...counts
        );

    counts.forEach(
        function(count) {

            var bar =
                document.createElement(
                    "div"
                );

            bar.className =
                "chart-bar";

            var percentage =
                Math.max(
                    8,
                    (
                        count /
                        maximum
                    ) * 100
                );

            bar.style.height =
                percentage + "%";

            bar.setAttribute(
                "title",
                count +
                (
                    count === 1
                        ? " booking"
                        : " bookings"
                )
            );

            bar.setAttribute(
                "aria-label",
                count +
                (
                    count === 1
                        ? " booking"
                        : " bookings"
                )
            );

            chart.appendChild(
                bar
            );

        }
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function getDashboardNotifications() {

    var notifications = [];

    var storage =
        getPortfolioStorage();

    var storagePercentage =
        getPortfolioStoragePercentage(
            storage
        );

    if (
        storagePercentage >= 100
    ) {

        notifications.push({

            type: "warning",

            message:
                "Your portfolio storage is full."

        });

    }
    else if (
        storagePercentage >= 80
    ) {

        notifications.push({

            type: "warning",

            message:
                "Your portfolio storage is almost full."

        });

    }

    var galleries =
        getStoredGalleries();

    galleries.forEach(
        function(gallery) {

            var status =
                getGalleryStatus(
                    gallery
                );

            if (
                status.className ===
                "expired"
            ) {

                notifications.push({

                    type: "warning",

                    message:
                        getGalleryName(
                            gallery
                        ) +
                        " has expired."

                });

            }
            else if (
                status.className ===
                "expiring"
            ) {

                notifications.push({

                    type: "warning",

                    message:
                        getGalleryName(
                            gallery
                        ) +
                        " " +
                        status.label.toLowerCase() +
                        "."

                });

            }

        }
    );

    var bookings =
        getStoredBookings();

    var pendingBookings =
        bookings.filter(
            function(booking) {

                var status =
                    normalizeBookingStatus(
                        getBookingStatus(
                            booking
                        )
                    );

                return (
                    status.indexOf(
                        "pending"
                    ) !== -1
                );

            }
        ).length;

    if (
        pendingBookings > 0
    ) {

        notifications.push({

            type: "info",

            message:
                pendingBookings +
                (
                    pendingBookings === 1
                        ? " booking is"
                        : " bookings are"
                ) +
                " waiting for your response."

        });

    }

    return notifications;

}


function renderDashboardNotifications() {

    var container =
        document.getElementById(
            "dashboardNotifications"
        );

    if (!container) {
        return;
    }

    var notifications =
        getDashboardNotifications();

    container.innerHTML =
        "";

    if (!notifications.length) {

        var empty =
            document.createElement(
                "div"
            );

        empty.className =
            "dashboard-notification-empty";

        empty.textContent =
            "You're all caught up.";

        container.appendChild(
            empty
        );

        return;

    }

    notifications
        .slice(
            0,
            8
        )
        .forEach(
            function(notification) {

                var item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "dashboard-notification " +
                    notification.type;

                item.textContent =
                    notification.message;

                container.appendChild(
                    item
                );

            }
        );

}


/* =========================================================
   SUBSCRIPTION DISPLAY
========================================================= */

function getSubscriptionRenewal() {

    var saved =
        getRawLocalStorageValue(
            SUBSCRIPTION_RENEWAL_KEY
        );

    if (saved) {

        var date =
            safeDate(
                saved
            );

        if (date) {

            return date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        }

        if (
            typeof saved === "string" &&
            saved.trim()
        ) {

            return saved.trim();

        }

    }

    return "Not available";

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
   PHOTOGRAPHER NAME
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
   BOOKING SEARCH
========================================================= */

function initializeBookingSearch() {

    var input =
        document.getElementById(
            "searchBooking"
        );

    if (!input) {
        return;
    }

    if (
        input.dataset.eventsAttached
    ) {

        return;

    }

    input.dataset.eventsAttached =
        "true";

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

            SUBSCRIPTION_STATUS_KEY,

            SUBSCRIPTION_RENEWAL_KEY,

            EQUIPMENT_STORAGE_KEY,

            SERVICES_STORAGE_KEY,

            GALLERY_STORAGE_KEY,

            BOOKING_STORAGE_KEY,

            PROFILE_STORAGE_KEY,

            REVIEW_STORAGE_KEY

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
   REVIEW UPDATE EVENT
========================================================= */

window.addEventListener(
    "professionalStudioReviewsUpdated",
    function() {

        renderDashboardReviews();

        updateDashboardStats();

        renderDashboardNotifications();

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

    var searchInput =
        document.getElementById(
            "searchBooking"
        );

    renderDashboardBookings(
        searchInput
            ? searchInput.value
            : ""
    );

    renderDashboardReviews();

    updateDashboardStats();

    renderSubscription();

    renderActivityChart();

    renderDashboardNotifications();

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

var dashboardInitialized =
    false;


function initializeDashboard() {

    if (dashboardInitialized) {
        return;
    }

    dashboardInitialized =
        true;

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

    renderDashboardNotifications();

    updateDashboardStats();

    renderSubscription();

    initializeBookingSearch();

}


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard,
        {
            once: true
        }
    );

}
else {

    initializeDashboard();

}