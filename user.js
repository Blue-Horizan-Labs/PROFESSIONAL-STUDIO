/* ==========================================
   Dashboard Core
========================================== */


/* ==========================================
   GLOBAL VARIABLES
========================================== */

var userName = "Rahul Photography";

var SERVICE_STORAGE_KEY =
    "professionalStudio.services";

var BOOKING_STORAGE_KEY =
    "bookings";


/* ==========================================
   PUBLIC CLIENT PAGE
========================================== */

var link =
    window.location.origin +
    "/client.html";


/* ==========================================
   SERVICE STORAGE HELPERS
========================================== */

function getStoredServices() {

    try {

        var stored =
            localStorage.getItem(
                SERVICE_STORAGE_KEY
            );

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


function getServiceName(service) {

    return service && service.name
        ? String(service.name).trim()
        : "";

}


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

    if (
        nameElement &&
        data.name
    ) {

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
   PUBLIC PAGE BUTTONS
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


    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard
            .writeText(link)
            .then(function() {

                showCopiedState(button);

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

            showCopiedState(button);

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


function showCopiedState(button) {

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

        menuLinks.forEach(
            function(menuLink) {

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

            }
        );


        /* ==========================
           COUNTER ANIMATION
        ========================== */

        var counters =
            document.querySelectorAll(
                ".counter"
            );

        counters.forEach(
            function(counter) {

                var target =
                    Number(
                        counter.dataset.target
                    );

                var current =
                    0;

                var speed =
                    target / 80;


                function updateCounter() {

                    current += speed;

                    if (
                        current < target
                    ) {

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

            }
        );


        /* ==========================
           SAVE BUTTONS
        ========================== */

        document
            .querySelectorAll("button")
            .forEach(
                function(button) {

                    button.addEventListener(
                        "click",
                        function() {

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

                }
            );


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

                    reader.readAsDataURL(
                        file
                    );

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
            .forEach(
                function(anchor) {

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

                }
            );


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

                var current =
                    "";

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


        document
            .querySelectorAll(
                ".equipment-card"
            )
            .forEach(
                function(card) {

                    attachEquipmentEvents(
                        card
                    );

                }
            );


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


        /* ==========================
           DASHBOARD SERVICE CONTROLS
        ========================== */

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


/* ==========================================
   GET STORED BOOKINGS
========================================== */

function getStoredBookings() {

    try {

        var stored =
            localStorage.getItem(
                BOOKING_STORAGE_KEY
            );

        if (!stored) {
            return [];
        }

        var parsed =
            JSON.parse(stored);

        return Array.isArray(parsed)
            ? parsed
            : [];

    }
    catch (error) {

        console.error(
            "Could not read booking data:",
            error
        );

        return [];

    }

}


/* ==========================================
   BOOKING HELPERS
========================================== */

function getBookingClient(
    booking
) {

    return booking &&
        booking.client
        ? String(booking.client)
        : "Unknown Client";

}


function getBookingService(
    booking
) {

    return booking &&
        booking.service
        ? String(booking.service)
        : "Photography Service";

}


function getBookingDate(
    booking
) {

    if (
        booking &&
        booking.date
    ) {

        return String(
            booking.date
        );

    }


    if (
        booking &&
        Array.isArray(booking.dates) &&
        booking.dates.length
    ) {

        return booking.dates[0].date ||
            "Not specified";

    }


    return "Not specified";

}


function getBookingAmount(
    booking
) {

    if (
        booking &&
        booking.packagePrice !== undefined &&
        booking.packagePrice !== null &&
        booking.packagePrice !== ""
    ) {

        var price =
            Number(
                String(
                    booking.packagePrice
                )
                .replace(
                    /[^\d.-]/g,
                    ""
                )
            );


        if (!isNaN(price)) {

            return new Intl.NumberFormat(
                "en-IN",
                {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0
                }
            ).format(price);

        }

    }


    if (
        booking &&
        booking.amount
    ) {

        return String(
            booking.amount
        );

    }


    return "₹0";

}


function getBookingStatus(
    booking
) {

    return booking &&
        booking.status
        ? String(booking.status)
        : "Pending";

}


function getBookingStatusClass(
    status
) {

    if (
        status ===
        "Confirmed"
    ) {

        return "active";

    }


    if (
        status ===
        "Completed"
    ) {

        return "completed";

    }


    return "pending";

}


/* ==========================================
   RENDER BOOKING TABLE
========================================== */

function renderBookingTable() {

    var table =
        document.getElementById(
            "bookingTable"
        );


    if (!table) {
        return;
    }


    var searchInput =
        document.getElementById(
            "searchBooking"
        );


    var statusFilter =
        document.getElementById(
            "statusFilter"
        );


    var search =
        searchInput
        ? searchInput.value
            .trim()
            .toLowerCase()
        : "";


    var selectedStatus =
        statusFilter
        ? statusFilter.value
        : "all";


    var bookings =
        getStoredBookings();


    var filtered =
        bookings.filter(
            function(booking) {

                var client =
                    getBookingClient(
                        booking
                    ).toLowerCase();

                var service =
                    getBookingService(
                        booking
                    ).toLowerCase();

                var status =
                    getBookingStatus(
                        booking
                    );


                var matchesSearch =
                    !search ||
                    client.includes(search) ||
                    service.includes(search);


                var matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    table.innerHTML =
        "";


    if (!filtered.length) {

        var emptyRow =
            document.createElement(
                "tr"
            );

        var emptyCell =
            document.createElement(
                "td"
            );

        emptyCell.colSpan =
            5;

        emptyCell.textContent =
            bookings.length
                ? "No bookings match your search."
                : "No bookings have been received yet.";

        emptyCell.style.textAlign =
            "center";

        emptyCell.style.padding =
            "30px 20px";

        emptyCell.style.color =
            "#666";


        emptyRow.appendChild(
            emptyCell
        );

        table.appendChild(
            emptyRow
        );


        updateBookingStats(
            filtered
        );

        return;

    }


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
                getBookingClient(
                    booking
                );


            var service =
                document.createElement(
                    "td"
                );

            service.textContent =
                getBookingService(
                    booking
                );


            var date =
                document.createElement(
                    "td"
                );

            date.textContent =
                getBookingDate(
                    booking
                );


            var amount =
                document.createElement(
                    "td"
                );

            amount.textContent =
                getBookingAmount(
                    booking
                );


            var statusCell =
                document.createElement(
                    "td"
                );


            var statusBadge =
                document.createElement(
                    "span"
                );


            var status =
                getBookingStatus(
                    booking
                );


            statusBadge.className =
                "status " +
                getBookingStatusClass(
                    status
                );


            statusBadge.textContent =
                status;


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


    updateBookingStats(
        filtered
    );

}


/* ==========================================
   BOOKING STATISTICS
========================================== */

function updateBookingStats(
    list
) {

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


    if (totalBookings) {

        totalBookings.textContent =
            list.length;

    }


    if (confirmedBookings) {

        confirmedBookings.textContent =
            list.filter(
                function(booking) {

                    return getBookingStatus(
                        booking
                    ) ===
                    "Confirmed";

                }
            ).length;

    }


    if (pendingBookings) {

        pendingBookings.textContent =
            list.filter(
                function(booking) {

                    return getBookingStatus(
                        booking
                    ) ===
                    "Pending";

                }
            ).length;

    }


    if (completedBookings) {

        completedBookings.textContent =
            list.filter(
                function(booking) {

                    return getBookingStatus(
                        booking
                    ) ===
                    "Completed";

                }
            ).length;

    }

}


/* ==========================================
   BOOKING COMPARISON
========================================== */

function updateComparison() {

    var viewFilter =
        document.getElementById(
            "viewFilter"
        );

    var compareFilter =
        document.getElementById(
            "compareFilter"
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


    if (
        !viewFilter ||
        !compareFilter ||
        !currentValue ||
        !previousValue ||
        !growthValue
    ) {

        return;

    }


    if (
        compareFilter.value ===
        "none"
    ) {

        currentValue.textContent =
            "--";

        previousValue.textContent =
            "--";

        growthValue.textContent =
            "--";

        return;

    }


    var bookings =
        getStoredBookings();


    var now =
        new Date();


    var current =
        0;

    var previous =
        0;


    bookings.forEach(
        function(booking) {

            if (!booking.createdAt) {
                return;
            }


            var created =
                new Date(
                    booking.createdAt
                );


            if (
                isNaN(
                    created.getTime()
                )
            ) {

                return;

            }


            var difference =
                now.getTime() -
                created.getTime();


            var days =
                difference /
                (
                    1000 *
                    60 *
                    60 *
                    24
                );


            if (
                viewFilter.value ===
                "week"
            ) {

                if (
                    days >= 0 &&
                    days < 7
                ) {

                    current++;

                }
                else if (
                    days >= 7 &&
                    days < 14
                ) {

                    previous++;

                }

            }


            else if (
                viewFilter.value ===
                "month"
            ) {

                if (
                    created.getMonth() ===
                    now.getMonth() &&
                    created.getFullYear() ===
                    now.getFullYear()
                ) {

                    current++;

                }


                var previousMonth =
                    new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        1
                    );


                if (
                    created.getMonth() ===
                    previousMonth.getMonth() &&
                    created.getFullYear() ===
                    previousMonth.getFullYear()
                ) {

                    previous++;

                }

            }


            else if (
                viewFilter.value ===
                "year"
            ) {

                if (
                    created.getFullYear() ===
                    now.getFullYear()
                ) {

                    current++;

                }


                if (
                    created.getFullYear() ===
                    now.getFullYear() - 1
                ) {

                    previous++;

                }

            }

        }
    );


    currentValue.textContent =
        current;

    previousValue.textContent =
        previous;


    if (previous === 0) {

        growthValue.textContent =
            current > 0
                ? "+100%"
                : "0%";

        return;

    }


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
            Number(growth) >= 0
                ? "+"
                : ""
        ) +
        growth +
        "%";

}


/* ==========================================
   INITIALIZE BOOKING DASHBOARD
========================================== */

function initializeBookingDashboard() {

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


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderBookingTable
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderBookingTable
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


    renderBookingTable();

    updateComparison();

}


/* ==========================================
   INITIALIZE BOOKING DASHBOARD
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeBookingDashboard();

    }
);


/* ==========================================
   LIVE BOOKING UPDATES
========================================== */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            BOOKING_STORAGE_KEY
        ) {

            renderBookingTable();

            updateComparison();

        }

    }
);


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

            if (
                typeof renderDashboardServices ===
                "function"
            ) {

                renderDashboardServices();

            }

        }

    }
);