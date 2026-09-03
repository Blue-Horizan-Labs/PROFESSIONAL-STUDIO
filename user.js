/* ==========================================
   Dashboard Core
========================================== */

/* ==========================================
   GLOBAL VARIABLES
========================================== */

var userName = "Rahul Photography";
var link = "https://professionalstudio.vercel.app/client";

/*
   Shared service storage.

   Portfolio and booking page should read from
   the same localStorage key:

   photographerServices

   Structure:

   [
       {
           name: "Wedding",
           description: "...",
           packages: {
               basic: {
                   price: "...",
                   duration: "...",
                   delivery: "...",
                   description: "..."
               },
               premium: {
                   price: "...",
                   duration: "...",
                   delivery: "...",
                   description: "..."
               },
               luxury: {
                   price: "...",
                   duration: "...",
                   delivery: "...",
                   description: "..."
               }
           }
       }
   ]
*/

var SERVICE_STORAGE_KEY = "professionalStudio.services";


/* ==========================================
   DEFAULT SERVICE DATA
========================================== */

var defaultServices = [
    {
        name: "Wedding",
        description: "Complete wedding photography coverage tailored to your event.",
        packages: {
            basic: {
                price: "",
                duration: "1 Day",
                delivery: "15-20 Days",
                description: "Essential wedding photography coverage."
            },
            premium: {
                price: "",
                duration: "2 Days",
                delivery: "12-15 Days",
                description: "Extended wedding coverage with additional moments."
            },
            luxury: {
                price: "",
                duration: "3 Days",
                delivery: "10-12 Days",
                description: "Full wedding experience with complete multi-day coverage."
            }
        }
    }
];


/* ==========================================
   SERVICE STORAGE HELPERS
========================================== */

function getStoredServices() {

    try {

        var stored =
            localStorage.getItem(SERVICE_STORAGE_KEY);

        if (!stored) {
            return [];
        }

        var parsed =
            JSON.parse(stored);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;

    }
    catch (error) {

        console.error(
            "Could not read service data:",
            error
        );

        return [];

    }

}


function saveServices(services) {

    try {

        localStorage.setItem(
            SERVICE_STORAGE_KEY,
            JSON.stringify(services)
        );

        return true;

    }
    catch (error) {

        console.error(
            "Could not save service data:",
            error
        );

        return false;

    }

}


function ensurePackageStructure(service) {

    if (!service.packages) {

        service.packages = {};

    }

    if (!service.packages.basic) {

        service.packages.basic = {};

    }

    if (!service.packages.premium) {

        service.packages.premium = {};

    }

    if (!service.packages.luxury) {

        service.packages.luxury = {};

    }


    var packageNames = [
        "basic",
        "premium",
        "luxury"
    ];


    packageNames.forEach(function(packageName) {

        var packageData =
            service.packages[packageName];


        if (
            typeof packageData.price ===
            "undefined"
        ) {

            packageData.price = "";

        }


        if (
            typeof packageData.duration ===
            "undefined"
        ) {

            packageData.duration = "";

        }


        if (
            typeof packageData.delivery ===
            "undefined"
        ) {

            packageData.delivery = "";

        }


        if (
            typeof packageData.description ===
            "undefined"
        ) {

            packageData.description = "";

        }

    });


    if (
        typeof service.description ===
        "undefined"
    ) {

        service.description = "";

    }


    return service;

}

/* ==========================================
   PUBLIC CLIENT PAGE
========================================== */

var link =
    window.location.origin +
    "/client.html";


/* ==========================================
   SERVER REQUEST
========================================== */

fetch("/api/dashboard-data", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    }

})
.then(function(response) {

    if (!response.ok) {
        throw new Error(
            "Dashboard data request failed"
        );
    }

    return response.json();

})
.then(function(data) {

    var nameElement =
        document.getElementById("name");


    if (nameElement && data.name) {

        nameElement.textContent =
            data.name;

    }


    userName =
        data.name ||
        "Rahul Photography";

})
.catch(function(error) {

    console.error(
        "Dashboard data error:",
        error
    );

});


/* ==========================================
   ENABLE PUBLIC PAGE BUTTONS
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        var openButton =
            document.getElementById(
                "openPortfolioBtn"
            );


        var copyButton =
            document.getElementById(
                "copyProfileBtn"
            );


        if (openButton) {

            openButton.disabled =
                false;

        }


        if (copyButton) {

            copyButton.disabled =
                false;

        }

    }
);


/* ==========================================
   OPEN CLIENT PAGE
========================================== */

function openPortfolio() {

    window.open(
        link,
        "_blank"
    );

}


/* ==========================================
   COPY CLIENT PAGE LINK
========================================== */

function copyProfileLink() {

    var button =
        document.getElementById(
            "copyProfileBtn"
        );


    if (!link) {
        return;
    }


    /*
       Use the Clipboard API when available.
    */

    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard
            .writeText(link)
            .then(function() {

                if (!button) {
                    return;
                }


                var originalText =
                    button.textContent;


                button.textContent =
                    "✓ COPIED";


                button.disabled =
                    true;


                setTimeout(
                    function() {

                        button.textContent =
                            originalText;


                        button.disabled =
                            false;

                    },
                    2000
                );

            })
            .catch(function(error) {

                console.error(
                    "Could not copy profile link:",
                    error
                );

                fallbackCopyLink();

            });

        return;

    }


    fallbackCopyLink();


    function fallbackCopyLink() {

        var textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            link;


        textarea.style.position =
            "fixed";


        textarea.style.left =
            "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.focus();


        textarea.select();


        try {

            document.execCommand(
                "copy"
            );


            if (button) {

                var originalText =
                    button.textContent;


                button.textContent =
                    "✓ COPIED";


                button.disabled =
                    true;


                setTimeout(
                    function() {

                        button.textContent =
                            originalText;


                        button.disabled =
                            false;

                    },
                    2000
                );

            }

        }
        catch (error) {

            console.error(
                "Could not copy profile link:",
                error
            );

        }


        document.body.removeChild(
            textarea
        );

    }

}

/* ==========================================
   DOM CONTENT LOADED
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /* ==========================
           SIDEBAR ACTIVE
        ========================== */

        var menuLinks =
            document.querySelectorAll(
                ".menu a"
            );


        menuLinks.forEach(function(menuLink) {

            menuLink.addEventListener(
                "click",
                function() {

                    menuLinks.forEach(
                        function(item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    menuLink.classList.add(
                        "active"
                    );

                }
            );

        });


        /* ==========================
           COUNTER ANIMATION
        ========================== */

        var counters =
            document.querySelectorAll(
                ".counter"
            );


        counters.forEach(function(counter) {

            var target =
                Number(
                    counter.dataset.target
                );


            var current = 0;


            var speed =
                target / 80;


            function updateCounter() {

                current += speed;


                if (current < target) {

                    counter.textContent =
                        Math.floor(current);


                    requestAnimationFrame(
                        updateCounter
                    );

                }
                else {

                    counter.textContent =
                        target;

                }

            }


            updateCounter();

        });


        /* ==========================
           SAVE BUTTONS
        ========================== */

        document
            .querySelectorAll("button")
            .forEach(function(button) {

                button.addEventListener(
                    "click",
                    function(e) {

                        if (
                            button.id ===
                            "openPortfolioBtn" ||
                            button.id ===
                            "copyProfileBtn"
                        ) {

                            return;

                        }


                        if (
                            button.type ===
                            "submit"
                        ) {

                            return;

                        }


                        if (
                            button.classList.contains(
                                "service-save-btn"
                            )
                        ) {

                            return;

                        }


                        var original =
                            button.innerText;


                        button.innerText =
                            "Saved ✓";


                        button.disabled =
                            true;


                        setTimeout(
                            function() {

                                button.innerText =
                                    original;


                                button.disabled =
                                    false;

                            },
                            1500
                        );

                    }
                );

            });


        /* ==========================
           IMAGE PREVIEW
        ========================== */

        var upload =
            document.querySelector(
                "input[type=file]"
            );


        if (upload) {

            upload.addEventListener(
                "change",
                function() {

                    var file =
                        this.files[0];


                    if (!file) {
                        return;
                    }


                    var reader =
                        new FileReader();


                    reader.onload =
                        function(e) {

                            var preview =
                                document.querySelector(
                                    ".preview-image"
                                );


                            if (!preview) {

                                preview =
                                    document.createElement(
                                        "img"
                                    );


                                preview.className =
                                    "preview-image";


                                upload.parentNode.appendChild(
                                    preview
                                );

                            }


                            preview.src =
                                e.target.result;

                        };


                    reader.readAsDataURL(file);

                }
            );

        }


        /* ==========================
           SMOOTH SCROLL
        ========================== */

        document
            .querySelectorAll(
                'a[href^="#"]'
            )
            .forEach(function(anchor) {

                anchor.addEventListener(
                    "click",
                    function(e) {

                        var target =
                            document.querySelector(
                                this.getAttribute(
                                    "href"
                                )
                            );


                        if (!target) {
                            return;
                        }


                        e.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }
                );

            });


        /* ==========================
           ACTIVE SECTION
        ========================== */

        var sections =
            document.querySelectorAll(
                "section"
            );


        window.addEventListener(
            "scroll",
            function() {

                var current = "";


                sections.forEach(
                    function(section) {

                        var top =
                            section.offsetTop -
                            120;


                        if (
                            pageYOffset >=
                            top
                        ) {

                            current =
                                section.id;

                        }

                    }
                );


                menuLinks.forEach(
                    function(menuLink) {

                        menuLink.classList.remove(
                            "active"
                        );


                        if (
                            menuLink.getAttribute(
                                "href"
                            ) ===
                            "#" + current
                        ) {

                            menuLink.classList.add(
                                "active"
                            );

                        }

                    }
                );

            }
        );


    }
);


/* ==========================================
   INTERACTIVE DASHBOARD FEATURES
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /* ==========================
           EQUIPMENT SECTION
        ========================== */

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
                    return;
                }


                var li =
                    document.createElement(
                        "li"
                    );


                li.textContent =
                    value;


                list.appendChild(
                    li
                );


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

                    if (e.key === "Enter") {

                        e.preventDefault();

                        addItem();

                    }

                }
            );

        }


        document
            .querySelectorAll(
                ".equipment-card"
            )
            .forEach(function(card) {

                attachEquipmentEvents(
                    card
                );

            });


        var equipmentGrid =
            document.querySelector(
                ".equipment-grid"
            );


        var addEquipment =
            document.getElementById(
                "addEquipment"
            );


        if (
            addEquipment &&
            equipmentGrid
        ) {

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
                        "<button class=\"create-btn\">Create</button>" +
                        "<button class=\"cancel-btn\">Cancel</button>" +
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

                        var category =
                            input.value.trim();


                        if (!category) {
                            return;
                        }


                        var card =
                            document.createElement(
                                "div"
                            );


                        card.className =
                            "equipment-card";


                        card.innerHTML =
                            "<h3>" +
                            category +
                            "</h3>" +
                            "<ul class=\"equipment-list\"></ul>" +
                            "<div class=\"equipment-input\">" +
                            "<input type=\"text\" placeholder=\"Add " +
                            category +
                            "\">" +
                            "<button class=\"add-item-btn\">Add Item</button>" +
                            "</div>";


                        equipmentGrid.insertBefore(
                            card,
                            createCard
                        );


                        attachEquipmentEvents(
                            card
                        );


                        createCard.remove();

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


        /* ==========================================
           DASHBOARD SERVICE CONTROLS
        ========================================== */

        var serviceGrid =
            document.getElementById(
                "serviceGrid"
            );


        function getSharedServices() {

            try {

                var stored =
                    localStorage.getItem(
                        SERVICE_STORAGE_KEY
                    );


                if (!stored) {
                    return [];
                }


                var services =
                    JSON.parse(stored);


                return Array.isArray(services)
                    ? services
                    : [];

            }
            catch (error) {

                console.error(
                    "Could not read shared service data:",
                    error
                );


                return [];

            }

        }


        function saveSharedServices(services) {

            try {

                localStorage.setItem(
                    SERVICE_STORAGE_KEY,
                    JSON.stringify(services)
                );

            }
            catch (error) {

                console.error(
                    "Could not save shared service data:",
                    error
                );

            }

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
                services.filter(function(service) {

                    return service.active === true;

                }).length;


            counter.dataset.target =
                activeCount;


            counter.textContent =
                activeCount;

        }


        function getServiceName(service) {

            return service && service.name
                ? String(service.name).trim()
                : "";

        }


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
                    document.createElement("p");


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


            services.forEach(function(service) {

                var name =
                    getServiceName(service);


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

            });


            attachServiceCheckboxEvents();


            updateActiveServiceCounter(
                services
            );

        }


        function attachServiceCheckboxEvents() {

            if (!serviceGrid) {
                return;
            }


            serviceGrid
                .querySelectorAll(
                    "input[type='checkbox']"
                )
                .forEach(function(checkbox) {

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
                                services.find(function(item) {

                                    if (serviceId) {

                                        return String(item.id) ===
                                            String(serviceId);

                                    }


                                    return (
                                        getServiceName(item).toLowerCase() ===
                                        serviceName.toLowerCase()
                                    );

                                });


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

                });

        }


        renderDashboardServices();


        /* ==========================
           GALLERY FILE COUNT
        ========================== */

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


        /* ==========================
           SIMPLE LOCAL STORAGE
        ========================== */

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


        /* ==========================
           ANALYTICS BAR
        ========================== */

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


        /* ==========================
           MOBILE SIDEBAR
        ========================== */

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


        /* ==========================
           DASHBOARD GREETING
        ========================== */

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


        var heading =
            document.querySelector(
                ".topbar h1"
            );


        if (heading) {

            heading.innerHTML =
                greeting +
                ", " +
                userName;

        }


        document
            .querySelectorAll(
                ".menu a"
            )
            .forEach(
                function(menuLink) {

                    menuLink.addEventListener(
                        "click",
                        function() {

                            if (
                                window.innerWidth <
                                768
                            ) {

                                if (sidebar) {

                                    sidebar.classList.remove(
                                        "show"
                                    );

                                }

                            }

                        }
                    );

                }
            );

    }
);


/* ==========================================
   BOOKING DASHBOARD
========================================== */

var bookings = [

    {
        client: "Rahul Patil",
        service: "Wedding",
        date: "15 Aug 2026",
        amount: "₹45,000",
        status: "Confirmed"
    },

    {
        client: "Neha Sharma",
        service: "Pre-Wedding",
        date: "22 Aug 2026",
        amount: "₹18,000",
        status: "Pending"
    },

    {
        client: "Aryan Mehta",
        service: "Portrait",
        date: "30 Aug 2026",
        amount: "₹9,000",
        status: "Completed"
    },

    {
        client: "Priya Deshmukh",
        service: "Maternity",
        date: "4 Sep 2026",
        amount: "₹12,500",
        status: "Confirmed"
    },

    {
        client: "Karan Joshi",
        service: "Birthday",
        date: "12 Sep 2026",
        amount: "₹15,000",
        status: "Pending"
    },

    {
        client: "Sneha Kulkarni",
        service: "Corporate",
        date: "18 Sep 2026",
        amount: "₹32,000",
        status: "Completed"
    }

];


var table =
    document.getElementById(
        "bookingTable"
    );


var searchInput =
    document.getElementById(
        "searchBooking"
    );


var statusFilter =
    document.getElementById(
        "statusFilter"
    );


var viewFilter =
    document.getElementById(
        "viewFilter"
    );


var compareFilter =
    document.getElementById(
        "compareFilter"
    );


var totalBookings =
    document.getElementById(
        "totalBookings"
    );


var confirmedBookings =
    document.getElementById(
        "confirmedBookings"
    );


var pendingBookings =
    document.getElementById(
        "pendingBookings"
    );


var completedBookings =
    document.getElementById(
        "completedBookings"
    );


var currentValue =
    document.getElementById(
        "currentValue"
    );


var previousValue =
    document.getElementById(
        "previousValue"
    );


var growthValue =
    document.getElementById(
        "growthValue"
    );


function statusClass(status) {

    if (status === "Confirmed") {

        return "active";

    }


    if (status === "Pending") {

        return "pending";

    }


    return "completed";

}


function renderTable() {

    if (
        !table ||
        !searchInput ||
        !statusFilter
    ) {

        return;

    }


    var search =
        searchInput.value.toLowerCase();


    var status =
        statusFilter.value;


    var filtered =
        bookings.filter(
            function(booking) {

                var matchSearch =
                    booking.client
                        .toLowerCase()
                        .includes(search) ||

                    booking.service
                        .toLowerCase()
                        .includes(search);


                var matchStatus =
                    status === "all" ||
                    booking.status === status;


                return (
                    matchSearch &&
                    matchStatus
                );

            }
        );


    table.innerHTML =
        "";


    filtered.forEach(
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
                booking.client;


            var service =
                document.createElement(
                    "td"
                );


            service.textContent =
                booking.service;


            var date =
                document.createElement(
                    "td"
                );


            date.textContent =
                booking.date;


            var amount =
                document.createElement(
                    "td"
                );


            amount.textContent =
                booking.amount;


            var statusCell =
                document.createElement(
                    "td"
                );


            var statusBadge =
                document.createElement(
                    "span"
                );


            statusBadge.className =
                "status " +
                statusClass(
                    booking.status
                );


            statusBadge.textContent =
                booking.status;


            statusCell.appendChild(
                statusBadge
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
                amount
            );


            row.appendChild(
                statusCell
            );


            table.appendChild(
                row
            );

        }
    );


    updateStats(
        filtered
    );

}


function updateStats(list) {

    if (!totalBookings) {
        return;
    }


    totalBookings.textContent =
        list.length;


    confirmedBookings.textContent =
        list.filter(
            function(b) {

                return b.status ===
                    "Confirmed";

            }
        ).length;


    pendingBookings.textContent =
        list.filter(
            function(b) {

                return b.status ===
                    "Pending";

            }
        ).length;


    completedBookings.textContent =
        list.filter(
            function(b) {

                return b.status ===
                    "Completed";

            }
        ).length;

}


function updateComparison() {

    if (
        !viewFilter ||
        !compareFilter ||
        !currentValue ||
        !previousValue ||
        !growthValue
    ) {

        return;

    }


    var current = 0;
    var previous = 0;


    switch (viewFilter.value) {

        case "week":

            current = 5;
            previous = 4;

            break;


        case "month":

            current = 18;
            previous = 14;

            break;


        case "year":

            current = 132;
            previous = 115;

            break;


        default:

            current = 584;
            previous = 530;

    }


    if (
        compareFilter.value ===
        "none"
    ) {

        previousValue.textContent =
            "--";


        growthValue.textContent =
            "--";


        return;

    }


    currentValue.textContent =
        current;


    previousValue.textContent =
        previous;


    var growth =
        (
            (
                current -
                previous
            ) /
            previous *
            100
        ).toFixed(0);


    growthValue.textContent =
        (
            growth >= 0
                ? "+"
                : ""
        ) +
        growth +
        "%";

}


if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        renderTable
    );

}


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderTable
    );

}


if (viewFilter) {

    viewFilter.addEventListener(
        "change",
        updateComparison
    );

}


if (compareFilter) {

    compareFilter.addEventListener(
        "change",
        updateComparison
    );

}


renderTable();


updateComparison();


/* ==========================================
   SERVICE DATA CHANGE LISTENER
========================================== */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            SERVICE_STORAGE_KEY
        ) {

            renderDashboardServices();

        }

    }
);