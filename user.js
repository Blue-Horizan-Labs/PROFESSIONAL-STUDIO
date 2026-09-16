/* =========================================================
   PROFESSIONAL STUDIO
   DASHBOARD JAVASCRIPT
========================================================= */


/* =========================================================
   GLOBAL STORAGE CONFIGURATION
========================================================= */

var PORTFOLIO_STORAGE_KEY =
    "professionalStudio.portfolioStorage";

var SUBSCRIPTION_PLAN_KEY =
    "professionalStudio.subscriptionPlan";


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
   DEFAULT SUBSCRIPTION
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

    /*
       Prototype default.

       Until the real backend/subscription
       system is connected, every new
       photographer starts on Basic.
    */

    return STORAGE_PLANS.basic;
}


/* =========================================================
   GET STORAGE LIMIT FROM PLAN
========================================================= */

function getPortfolioStorageLimitMB() {

    var plan =
        getCurrentSubscriptionPlan();

    return plan.storageMB;
}


/* =========================================================
   STORAGE OBJECT
========================================================= */

function getPortfolioStorage() {

    var saved =
        localStorage.getItem(
            PORTFOLIO_STORAGE_KEY
        );

    var storage;

    try {

        storage =
            saved
                ? JSON.parse(saved)
                : null;

    } catch (error) {

        storage = null;

    }


    if (
        !storage ||
        typeof storage !== "object"
    ) {

        storage = {

            storageUsedMB: 0,

            storagePlan:
                getCurrentSubscriptionPlan().id,

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


    /*
       The limit is NEVER permanently
       stored as the source of truth.

       It comes from the photographer's
       current subscription plan.
    */

    storage.storageLimitMB =
        getPortfolioStorageLimitMB();


    storage.storagePlan =
        getCurrentSubscriptionPlan().id;


    /*
       Recalculate usage from files when
       possible so the dashboard does not
       blindly trust an old number.
    */

    var calculatedUsage = 0;

    storage.files.forEach(
        function(file) {

            var size =
                Number(
                    file.sizeMB
                );

            if (
                Number.isFinite(size) &&
                size > 0
            ) {

                calculatedUsage +=
                    size;

            }

        }
    );


    /*
       Only replace the stored usage when
       file records actually exist.

       This keeps compatibility with the
       prototype while allowing the new
       Recent Work page to maintain exact
       file sizes.
    */

    if (
        storage.files.length > 0
    ) {

        storage.storageUsedMB =
            calculatedUsage;

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


    localStorage.setItem(
        PORTFOLIO_STORAGE_KEY,
        JSON.stringify(storage)
    );


    return true;

}


/* =========================================================
   FORMAT STORAGE SIZE
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


    /*
       These elements may not exist on
       older dashboard versions.
    */

    if (
        !sizeElement &&
        !usedElement &&
        !availableElement &&
        !progressElement &&
        !badgeElement
    ) {

        return;

    }


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


    /*
       Update warning.
    */

    if (warningElement) {

        if (
            percentage >= 100
        ) {

            warningElement.hidden =
                false;


            var warningStrong =
                warningElement.querySelector(
                    "strong"
                );

            var warningText =
                warningElement.querySelector(
                    "span"
                );


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


    /*
       Optional plan labels.
       These only update if the dashboard
       contains the corresponding elements.
    */

    var planElements =
        document.querySelectorAll(
            "[data-portfolio-plan]"
        );


    planElements.forEach(
        function(element) {

            element.textContent =
                plan.name +
                " Plan";

        }
    );


    var planStorageElements =
        document.querySelectorAll(
            "[data-portfolio-plan-storage]"
        );


    planStorageElements.forEach(
        function(element) {

            element.textContent =
                formatPortfolioStorageMB(
                    plan.storageMB
                );

        }
    );

}


/* =========================================================
   STORAGE VALIDATION
========================================================= */

function canUploadPortfolioFile(
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


    return (
        used + size <= limit
    );

}


/* =========================================================
   STORAGE SPACE CHECK
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


    var allowed =
        used + size <= limit;


    return {

        allowed: allowed,

        fileSizeMB: size,

        usedMB: used,

        limitMB: limit,

        availableMB: available,

        requiredExtraMB:
            Math.max(
                0,
                size - available
            ),

        plan:
            getCurrentSubscriptionPlan()

    };

}


/* =========================================================
   ADD PORTFOLIO FILE
========================================================= */

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


    /*
       HARD BLOCK.

       Never automatically delete,
       overwrite, compress or replace
       existing photographer work.
    */

    if (!check.allowed) {

        return {

            success: false,

            reason: "storage-full",

            message:
                "Not enough storage available.",

            check: check

        };

    }


    var storage =
        getPortfolioStorage();


    if (
        !fileData.id
    ) {

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


    /*
       Recalculate from actual file
       records.
    */

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

        file: fileData,

        storage: storage

    };

}


/* =========================================================
   DELETE PORTFOLIO FILE
========================================================= */

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
   CHANGE SUBSCRIPTION PLAN
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


    /*
       Existing files remain untouched
       even when they exceed the new
       storage limit.
    */

    savePortfolioStorage(
        storage
    );


    renderPortfolioStorage();


    return true;

}


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            PORTFOLIO_STORAGE_KEY ||
            event.key ===
            SUBSCRIPTION_PLAN_KEY
        ) {

            renderPortfolioStorage();

        }

    }
);


/* =========================================================
   DASHBOARD INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderPortfolioStorage();

    }
);


/* =========================================================
   EQUIPMENT STORAGE
========================================================= */

var EQUIPMENT_STORAGE_KEY =
    "professionalStudio.equipment";


function getStoredEquipment() {

    var saved =
        localStorage.getItem(
            EQUIPMENT_STORAGE_KEY
        );


    if (!saved) {

        return [];

    }


    try {

        var parsed =
            JSON.parse(saved);


        return Array.isArray(
            parsed
        )
            ? parsed
            : [];

    } catch (error) {

        return [];

    }

}


function saveEquipment(
    equipment
) {

    try {

        localStorage.setItem(
            EQUIPMENT_STORAGE_KEY,
            JSON.stringify(
                equipment
            )
        );

        return true;

    } catch (error) {

        return false;

    }

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


            saveEquipment(
                equipment
            );


            li.remove();

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

                    return existingItem
                        .toLowerCase() ===
                        value.toLowerCase();

                }
            );


        if (alreadyExists) {

            input.value = "";

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
        function(e) {

            if (
                e.key ===
                "Enter"
            ) {

                e.preventDefault();

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

                    return;

                }


                var equipment =
                    getStoredEquipment();


                var exists =
                    equipment.some(
                        function(category) {

                            return category.name
                                .toLowerCase() ===
                                categoryName.toLowerCase();

                        }
                    );


                if (exists) {

                    input.value = "";

                    input.focus();

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
                function(e) {

                    if (
                        e.key ===
                        "Enter"
                    ) {

                        e.preventDefault();

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
   INITIALIZE EQUIPMENT
========================================================= */

renderDashboardEquipment();

initializeEquipmentCategoryCreation();


/* =========================================================
   DASHBOARD SERVICE CONTROLS
========================================================= */

var serviceGrid =
    document.getElementById(
        "serviceGrid"
    );


function getSharedServices() {

    return getStoredServices();

}


function saveSharedServices(
    services
) {

    saveServices(
        services
    );

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


    counter.dataset.target =
        activeCount;


    counter.textContent =
        activeCount;

}


/* =========================================================
   DASHBOARD SERVICES
========================================================= */

function renderDashboardServices() {

    if (!serviceGrid) {

        return;

    }


    var services =
        getSharedServices();


    serviceGrid.innerHTML =
        "";


    if (!services.length) {

        var empty =
            document.createElement(
                "p"
            );


        empty.textContent =
            "No services have been created yet. Open Manage Services to add your services.";


        empty.style.color =
            "#666";


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


            label.dataset.serviceId =
                service.id || "";


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
                            getSharedServices();


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


                        saveSharedServices(
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
   RENDER SERVICES
========================================================= */

renderDashboardServices();


/* =========================================================
   GALLERY FILE COUNT
========================================================= */

var galleryUpload =
    document.querySelector(
        'input[type="file"]'
    );


if (galleryUpload) {

    galleryUpload.addEventListener(
        "change",
        function() {

            var count =
                this.files.length;


            var info =
                document.querySelector(
                    ".upload-count"
                );


            if (!info) {

                info =
                    document.createElement(
                        "p"
                    );


                info.className =
                    "upload-count";


                this.parentNode.appendChild(
                    info
                );

            }


            info.innerHTML =
                count +
                " file(s) selected";

        }
    );

}


/* =========================================================
   SIMPLE LOCAL STORAGE
========================================================= */

document
    .querySelectorAll(
        "input, textarea, select"
    )
    .forEach(
        function(field) {

            if (!field.name) {

                return;

            }


            var saved =
                localStorage.getItem(
                    field.name
                );


            if (saved) {

                field.value =
                    saved;

            }


            field.addEventListener(
                "input",
                function() {

                    localStorage.setItem(
                        field.name,
                        field.value
                    );

                }
            );

        }
    );


/* =========================================================
   ANALYTICS BAR
========================================================= */

document
    .querySelectorAll(
        ".chart-placeholder"
    )
    .forEach(
        function(chart) {

            chart.innerHTML =
                "";


            for (
                var i = 0;
                i < 7;
                i++
            ) {

                var bar =
                    document.createElement(
                        "div"
                    );


                bar.style.width =
                    "28px";


                bar.style.height =
                    (
                        40 +
                        Math.random() *
                        100
                    ) +
                    "px";


                bar.style.background =
                    "#111";


                bar.style.borderRadius =
                    "6px";


                bar.style.display =
                    "inline-block";


                bar.style.margin =
                    "0 5px";


                bar.style.verticalAlign =
                    "bottom";


                chart.appendChild(
                    bar
                );

            }

        }
    );


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

var toggle =
    document.querySelector(
        ".mobile-toggle"
    );


var sidebar =
    document.querySelector(
        ".sidebar"
    );


if (
    toggle &&
    sidebar
) {

    toggle.addEventListener(
        "click",
        function() {

            sidebar.classList.toggle(
                "show"
            );

        }
    );

}


/* =========================================================
   DASHBOARD GREETING
========================================================= */

var hour =
    new Date().getHours();


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


/* =========================================================
   APPLY GREETING
========================================================= */

var greetingElements =
    document.querySelectorAll(
        "[data-greeting]"
    );


greetingElements.forEach(
    function(element) {

        element.textContent =
            greeting;

    }
);


/* =========================================================
   INITIAL PORTFOLIO STORAGE SETUP
========================================================= */

(function initializePortfolioStorage() {

    var storage =
        getPortfolioStorage();


    /*
       Make sure the current plan is
       reflected immediately.
    */

    storage.storagePlan =
        getCurrentSubscriptionPlan().id;


    storage.storageLimitMB =
        getPortfolioStorageLimitMB();


    savePortfolioStorage(
        storage
    );


    renderPortfolioStorage();

})();