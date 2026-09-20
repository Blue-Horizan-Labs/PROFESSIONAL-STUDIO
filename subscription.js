/* =========================================================
   PROFESSIONAL STUDIO
   BILLING & SUBSCRIPTION JAVASCRIPT
   FRONTEND VERSION
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

var SUBSCRIPTION_PLAN_KEY =
    "professionalStudio.subscriptionPlan";

var SUBSCRIPTION_RENEWAL_KEY =
    "professionalStudio.subscriptionRenewal";

var BILLING_HISTORY_KEY =
    "professionalStudio.billingHistory";

var GALLERY_PURCHASES_KEY =
    "professionalStudioGalleryPurchases";

var PROFILE_STORAGE_KEY =
    "professionalStudio.profile";


/* =========================================================
   ACTUAL PROFESSIONAL STUDIO PLANS
   Source:
   professionalstudio.vercel.app
========================================================= */

var SUBSCRIPTION_PLANS = {

    starter: {

        id: "starter",

        name: "Starter",

        price: 499,

        storageMB: 500,

        description:
            "Perfect for photographers getting started.",

        features: [

            "Personal Portfolio",

            "Online Booking",

            "Contact Form",

            "500 MB Storage For Recent Work",

            "Services and Pricing Showcase",

            "Equipment Preview"

        ]

    },


    professional: {

        id: "professional",

        name: "Professional",

        price: 1499,

        storageMB: 2048,

        description:
            "Additional features to the Starter Plan.",

        features: [

            "Everything in Starter",

            "Basic SEO",

            "2 GB Storage For Recent Work",

            "2 Theme Options",

            "AI Assistant Support (Upcoming)",

            "Basic Support For Profile Setup"

        ]

    },


    enterprise: {

        id: "enterprise",

        name: "Enterprise",

        price: 2999,

        storageMB: 10240,

        description:
            "Additional features to the Professional Plan.",

        features: [

            "Everything in Professional",

            "Premium SEO",

            "10 GB Storage For Recent Work",

            "5 Theme Options",

            "Top Priority Support For Profile Setup"

        ]

    }

};


/* =========================================================
   LEGACY PLAN COMPATIBILITY
========================================================= */

var LEGACY_PLAN_MAP = {

    basic: "starter",

    starter: "starter",

    professional: "professional",

    studio: "enterprise",

    enterprise: "enterprise"

};


/* =========================================================
   SAFE JSON READER
========================================================= */

function readLocalStorage(
    key,
    fallback
) {

    var saved =
        localStorage.getItem(
            key
        );


    if (!saved) {
        return fallback;
    }


    try {

        return JSON.parse(
            saved
        );

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
   FORMAT CURRENCY
========================================================= */

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
   FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    if (!value) {
        return "—";
    }


    var date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
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
   FORMAT STORAGE
========================================================= */

function formatStorage(
    valueMB
) {

    var mb =
        Number(
            valueMB
        ) || 0;


    if (mb < 1024) {

        return (
            Math.round(
                mb * 100
            ) / 100
        ) +
        " MB";

    }


    return (
        Math.round(
            (
                mb / 1024
            ) * 10
        ) / 10
    ) +
    " GB";

}


/* =========================================================
   GET PROFILE
========================================================= */

function getProfile() {

    var profile =
        readLocalStorage(
            PROFILE_STORAGE_KEY,
            {}
        );


    if (
        profile &&
        typeof profile === "object"
    ) {

        return profile;

    }


    return {};

}


/* =========================================================
   GET PHOTOGRAPHER NAME
========================================================= */

function getPhotographerName() {

    var profile =
        getProfile();


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
   NORMALIZE PLAN ID
========================================================= */

function normalizePlanId(
    planId
) {

    var value =
        String(
            planId || ""
        )
        .trim()
        .toLowerCase();


    return (
        LEGACY_PLAN_MAP[value] ||
        "starter"
    );

}


/* =========================================================
   GET CURRENT PLAN
========================================================= */

function getCurrentPlanId() {

    var saved =
        localStorage.getItem(
            SUBSCRIPTION_PLAN_KEY
        );


    return normalizePlanId(
        saved
    );

}


function getCurrentPlan() {

    return SUBSCRIPTION_PLANS[
        getCurrentPlanId()
    ];

}


/* =========================================================
   SUBSCRIPTION STATUS
========================================================= */

function getSubscriptionStatus() {

    var savedStatus =
        localStorage.getItem(
            "professionalStudio.subscriptionStatus"
        );


    if (!savedStatus) {

        return "active";

    }


    return String(
        savedStatus
    ).toLowerCase();

}


/* =========================================================
   RENEWAL DATE
========================================================= */

function getRenewalDate() {

    var saved =
        localStorage.getItem(
            SUBSCRIPTION_RENEWAL_KEY
        );


    if (saved) {

        var savedDate =
            new Date(
                saved
            );


        if (
            !Number.isNaN(
                savedDate.getTime()
            )
        ) {

            return savedDate;

        }

    }


    /*
       Frontend fallback.

       If no real billing date exists,
       create a monthly renewal date.
    */

    var date =
        new Date();


    date.setMonth(
        date.getMonth() + 1
    );


    date.setHours(
        0,
        0,
        0,
        0
    );


    localStorage.setItem(
        SUBSCRIPTION_RENEWAL_KEY,
        date.toISOString()
    );


    return date;

}


/* =========================================================
   GET BILLING HISTORY
========================================================= */

function getBillingHistory() {

    var history =
        readLocalStorage(
            BILLING_HISTORY_KEY,
            []
        );


    if (
        !Array.isArray(history)
    ) {

        return [];

    }


    return history;

}


/* =========================================================
   CREATE FRONTEND BILLING RECORD
========================================================= */

function createBillingRecord(
    plan,
    date
) {

    return {

        id:
            "INV-" +
            Date.now(),

        date:
            date || new Date().toISOString(),

        description:
            plan.name +
            " monthly subscription",

        planId:
            plan.id,

        planName:
            plan.name,

        amount:
            plan.price,

        status:
            "Paid",

        type:
            "subscription"

    };

}


/* =========================================================
   INITIALIZE BILLING HISTORY
========================================================= */

function initializeBillingHistory() {

    var history =
        getBillingHistory();


    if (history.length) {
        return history;
    }


    /*
       Do not create fake payment history.

       The current plan is real frontend state,
       but there is no actual payment record yet.
    */

    return [];

}


/* =========================================================
   GALLERY PURCHASES
========================================================= */

function getGalleryPurchases() {

    var purchases =
        readLocalStorage(
            GALLERY_PURCHASES_KEY,
            []
        );


    if (
        !Array.isArray(purchases)
    ) {

        return [];

    }


    return purchases;

}


/* =========================================================
   GALLERY PURCHASE PRICE
========================================================= */

function getGalleryPurchasePrice(
    purchase
) {

    var values = [

        purchase.totalPriceINR,

        purchase.totalPrice,

        purchase.price,

        purchase.amount

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


/* =========================================================
   GALLERY PURCHASE DATE
========================================================= */

function getGalleryPurchaseDate(
    purchase
) {

    return (
        purchase.purchasedAt ||
        purchase.createdAt ||
        purchase.date ||
        ""
    );

}


/* =========================================================
   GALLERY PURCHASE STATUS
========================================================= */

function getGalleryPurchaseStatus(
    purchase
) {

    return (
        purchase.paymentStatus ||
        purchase.status ||
        "Purchased"
    );

}


/* =========================================================
   GALLERY PURCHASE STORAGE
========================================================= */

function getGalleryStorage(
    purchase
) {

    var storage =
        Number(
            purchase.storageGB
        );


    if (
        Number.isFinite(storage) &&
        storage > 0
    ) {

        return storage + " GB";

    }


    return "—";

}


/* =========================================================
   GALLERY PURCHASE DURATION
========================================================= */

function getGalleryDuration(
    purchase
) {

    var months =
        Number(
            purchase.durationMonths
        );


    if (
        Number.isFinite(months) &&
        months > 0
    ) {

        return (
            months +
            " month" +
            (
                months === 1
                    ? ""
                    : "s"
            )
        );

    }


    return "—";

}


/* =========================================================
   TOTAL PAID
========================================================= */

function getTotalPaid() {

    var subscriptionTotal =
        getBillingHistory()
            .reduce(
                function(total, record) {

                    return total +
                        (
                            Number(
                                record.amount
                            ) || 0
                        );

                },
                0
            );


    var galleryTotal =
        getGalleryPurchases()
            .reduce(
                function(total, purchase) {

                    return total +
                        getGalleryPurchasePrice(
                            purchase
                        );

                },
                0
            );


    return (
        subscriptionTotal +
        galleryTotal
    );

}


/* =========================================================
   TOAST
========================================================= */

var toastTimer = null;


function showToast(
    message
) {

    var toast =
        document.getElementById(
            "billingToast"
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
            2400
        );

}


/* =========================================================
   RENDER OVERVIEW
========================================================= */

function renderOverview() {

    var plan =
        getCurrentPlan();


    var status =
        getSubscriptionStatus();


    var renewal =
        getRenewalDate();


    var planElement =
        document.getElementById(
            "overviewPlan"
        );


    var priceElement =
        document.getElementById(
            "overviewPlanPrice"
        );


    var statusElement =
        document.getElementById(
            "overviewStatus"
        );


    var statusText =
        document.getElementById(
            "overviewStatusText"
        );


    var renewalElement =
        document.getElementById(
            "overviewRenewal"
        );


    var totalPaidElement =
        document.getElementById(
            "overviewTotalPaid"
        );


    if (planElement) {

        planElement.textContent =
            plan.name;

    }


    if (priceElement) {

        priceElement.textContent =
            formatCurrency(
                plan.price
            ) +
            " / month";

    }


    if (statusElement) {

        statusElement.textContent =
            status === "cancelled"
                ? "Cancelled"
                : "Active";


        statusElement.className =
            "overview-value " +
            (
                status === "cancelled"
                    ? ""
                    : "status-active"
            );

    }


    if (statusText) {

        statusText.textContent =
            status === "cancelled"
                ? "Your subscription is cancelled"
                : "Your subscription is active";

    }


    if (renewalElement) {

        renewalElement.textContent =
            formatDate(
                renewal
            );

    }


    if (totalPaidElement) {

        totalPaidElement.textContent =
            formatCurrency(
                getTotalPaid()
            );

    }

}


/* =========================================================
   RENDER CURRENT PLAN
========================================================= */

function renderCurrentPlan() {

    var plan =
        getCurrentPlan();


    var status =
        getSubscriptionStatus();


    var planName =
        document.getElementById(
            "currentPlanName"
        );


    var planDescription =
        document.getElementById(
            "currentPlanDescription"
        );


    var planPrice =
        document.getElementById(
            "currentPlanPrice"
        );


    var planStorage =
        document.getElementById(
            "currentPlanStorage"
        );


    var planRenewal =
        document.getElementById(
            "currentPlanRenewal"
        );


    var statusElement =
        document.getElementById(
            "currentPlanStatus"
        );


    if (planName) {

        planName.textContent =
            plan.name;

    }


    if (planDescription) {

        planDescription.textContent =
            plan.description;

    }


    if (planPrice) {

        planPrice.textContent =
            formatCurrency(
                plan.price
            );

    }


    if (planStorage) {

        planStorage.textContent =
            formatStorage(
                plan.storageMB
            );

    }


    if (planRenewal) {

        planRenewal.textContent =
            formatDate(
                getRenewalDate()
            );

    }


    if (statusElement) {

        statusElement.textContent =
            status === "cancelled"
                ? "Cancelled"
                : "Active";


        statusElement.className =
            "plan-status " +
            (
                status === "cancelled"
                    ? "cancelled"
                    : "active"
            );

    }

}


/* =========================================================
   RENDER PLANS
========================================================= */

function renderPlans() {

    var grid =
        document.getElementById(
            "plansGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML =
        "";


    var currentPlanId =
        getCurrentPlanId();


    Object.keys(
        SUBSCRIPTION_PLANS
    )
    .forEach(
        function(planId) {

            var plan =
                SUBSCRIPTION_PLANS[
                    planId
                ];


            var card =
                document.createElement(
                    "article"
                );


            card.className =
                "plan-card";


            if (
                planId ===
                currentPlanId
            ) {

                card.classList.add(
                    "current"
                );

            }


            var badge =
                document.createElement(
                    "span"
                );


            badge.className =
                "plan-card-badge";


            badge.textContent =
                planId ===
                currentPlanId
                    ? "CURRENT PLAN"
                    : (
                        planId ===
                        "professional"
                            ? "POPULAR"
                            : ""
                    );


            if (
                !badge.textContent
            ) {

                badge.remove();

            }
            else {

                card.appendChild(
                    badge
                );

            }


            var name =
                document.createElement(
                    "h3"
                );


            name.className =
                "plan-card-name";


            name.textContent =
                plan.name;


            card.appendChild(
                name
            );


            var description =
                document.createElement(
                    "p"
                );


            description.className =
                "plan-card-description";


            description.textContent =
                plan.description;


            card.appendChild(
                description
            );


            var price =
                document.createElement(
                    "div"
                );


            price.className =
                "plan-price";


            price.innerHTML =
                formatCurrency(
                    plan.price
                ) +
                "<span>/ month</span>";


            card.appendChild(
                price
            );


            var storage =
                document.createElement(
                    "div"
                );


            storage.className =
                "plan-storage";


            storage.textContent =
                formatStorage(
                    plan.storageMB
                ) +
                " recent work storage";


            card.appendChild(
                storage
            );


            var divider =
                document.createElement(
                    "div"
                );


            divider.className =
                "plan-divider";


            card.appendChild(
                divider
            );


            var featureList =
                document.createElement(
                    "ul"
                );


            featureList.className =
                "plan-features";


            plan.features.forEach(
                function(feature) {

                    var item =
                        document.createElement(
                            "li"
                        );


                    item.textContent =
                        feature;


                    featureList.appendChild(
                        item
                    );

                }
            );


            card.appendChild(
                featureList
            );


            var button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                planId ===
                currentPlanId
                    ? "btn-secondary"
                    : "btn-primary";


            button.textContent =
                planId ===
                currentPlanId
                    ? "Current Plan"
                    : (
                        getPlanOrder(
                            planId
                        ) >
                        getPlanOrder(
                            currentPlanId
                        )
                            ? "Upgrade"
                            : "Change Plan"
                    );


            if (
                planId ===
                currentPlanId
            ) {

                button.disabled =
                    true;

                button.style.cursor =
                    "default";

                button.style.opacity =
                    "0.65";

            }
            else {

                button.addEventListener(
                    "click",
                    function() {

                        openPlanModal(
                            planId
                        );

                    }
                );

            }


            card.appendChild(
                button
            );


            grid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   PLAN ORDER
========================================================= */

function getPlanOrder(
    planId
) {

    var order = {

        starter: 1,

        professional: 2,

        enterprise: 3

    };


    return (
        order[
            normalizePlanId(
                planId
            )
        ] || 1
    );

}


/* =========================================================
   RENDER BILLING HISTORY
========================================================= */

function renderBillingHistory() {

    var table =
        document.getElementById(
            "billingHistoryTable"
        );


    var empty =
        document.getElementById(
            "billingHistoryEmpty"
        );


    if (!table) {
        return;
    }


    var history =
        initializeBillingHistory();


    table.innerHTML =
        "";


    if (!history.length) {

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


    history
        .slice()
        .sort(
            function(a, b) {

                return new Date(
                    b.date
                ) -
                new Date(
                    a.date
                );

            }
        )
        .forEach(
            function(record) {

                var row =
                    document.createElement(
                        "tr"
                    );


                var dateCell =
                    document.createElement(
                        "td"
                    );


                dateCell.textContent =
                    formatDate(
                        record.date
                    );


                var descriptionCell =
                    document.createElement(
                        "td"
                    );


                var description =
                    document.createElement(
                        "span"
                    );


                description.className =
                    "payment-description";


                description.textContent =
                    record.description ||
                    "Subscription payment";


                var subtext =
                    document.createElement(
                        "span"
                    );


                subtext.className =
                    "payment-subtext";


                subtext.textContent =
                    record.id ||
                    "Payment";


                descriptionCell.appendChild(
                    description
                );


                descriptionCell.appendChild(
                    subtext
                );


                var planCell =
                    document.createElement(
                        "td"
                    );


                planCell.textContent =
                    record.planName ||
                    "Professional Studio";


                var amountCell =
                    document.createElement(
                        "td"
                    );


                amountCell.textContent =
                    formatCurrency(
                        record.amount
                    );


                var statusCell =
                    document.createElement(
                        "td"
                    );


                var status =
                    document.createElement(
                        "span"
                    );


                status.className =
                    "payment-status";


                status.textContent =
                    record.status ||
                    "Paid";


                statusCell.appendChild(
                    status
                );


                var invoiceCell =
                    document.createElement(
                        "td"
                    );


                var invoiceButton =
                    document.createElement(
                        "button"
                    );


                invoiceButton.type =
                    "button";


                invoiceButton.className =
                    "invoice-btn";


                invoiceButton.textContent =
                    "View";


                invoiceButton.addEventListener(
                    "click",
                    function() {

                        showToast(
                            "Invoice generation will be connected with billing backend."
                        );

                    }
                );


                invoiceCell.appendChild(
                    invoiceButton
                );


                row.appendChild(
                    dateCell
                );

                row.appendChild(
                    descriptionCell
                );

                row.appendChild(
                    planCell
                );

                row.appendChild(
                    amountCell
                );

                row.appendChild(
                    statusCell
                );

                row.appendChild(
                    invoiceCell
                );


                table.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   RENDER GALLERY PURCHASES
========================================================= */

function renderGalleryPurchases() {

    var list =
        document.getElementById(
            "galleryPurchasesList"
        );


    var empty =
        document.getElementById(
            "galleryPurchasesEmpty"
        );


    var totalElement =
        document.getElementById(
            "galleryTotalSpend"
        );


    var countElement =
        document.getElementById(
            "galleryPurchaseCount"
        );


    if (!list) {
        return;
    }


    var purchases =
        getGalleryPurchases();


    var total =
        purchases.reduce(
            function(sum, purchase) {

                return sum +
                    getGalleryPurchasePrice(
                        purchase
                    );

            },
            0
        );


    if (totalElement) {

        totalElement.textContent =
            formatCurrency(
                total
            );

    }


    if (countElement) {

        countElement.textContent =
            purchases.length;

    }


    list.innerHTML =
        "";


    if (!purchases.length) {

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


    purchases
        .slice()
        .sort(
            function(a, b) {

                return new Date(
                    getGalleryPurchaseDate(
                        b
                    )
                ) -
                new Date(
                    getGalleryPurchaseDate(
                        a
                    )
                );

            }
        )
        .forEach(
            function(purchase) {

                var item =
                    document.createElement(
                        "article"
                    );


                item.className =
                    "purchase-item";


                var titleWrapper =
                    document.createElement(
                        "div"
                    );


                var title =
                    document.createElement(
                        "div"
                    );


                title.className =
                    "purchase-title";


                title.textContent =
                    purchase.galleryName ||
                    purchase.name ||
                    purchase.title ||
                    (
                        "Client Gallery"
                    );


                var meta =
                    document.createElement(
                        "div"
                    );


                meta.className =
                    "purchase-meta";


                meta.textContent =
                    formatDate(
                        getGalleryPurchaseDate(
                            purchase
                        )
                    );


                titleWrapper.appendChild(
                    title
                );


                titleWrapper.appendChild(
                    meta
                );


                var storageWrapper =
                    document.createElement(
                        "div"
                    );


                storageWrapper.className =
                    "purchase-detail";


                storageWrapper.innerHTML =
                    "<span>Storage</span>" +
                    "<strong>" +
                    getGalleryStorage(
                        purchase
                    ) +
                    "</strong>";


                var durationWrapper =
                    document.createElement(
                        "div"
                    );


                durationWrapper.className =
                    "purchase-detail";


                durationWrapper.innerHTML =
                    "<span>Duration</span>" +
                    "<strong>" +
                    getGalleryDuration(
                        purchase
                    ) +
                    "</strong>";


                var amountWrapper =
                    document.createElement(
                        "div"
                    );


                amountWrapper.className =
                    "purchase-detail";


                amountWrapper.innerHTML =
                    "<span>Amount</span>" +
                    "<strong>" +
                    formatCurrency(
                        getGalleryPurchasePrice(
                            purchase
                        )
                    ) +
                    "</strong>";


                var statusWrapper =
                    document.createElement(
                        "div"
                    );


                var status =
                    document.createElement(
                        "span"
                    );


                status.className =
                    "purchase-status paid";


                status.textContent =
                    getGalleryPurchaseStatus(
                        purchase
                    );


                statusWrapper.appendChild(
                    status
                );


                item.appendChild(
                    titleWrapper
                );


                item.appendChild(
                    storageWrapper
                );


                item.appendChild(
                    durationWrapper
                );


                item.appendChild(
                    amountWrapper
                );


                item.appendChild(
                    statusWrapper
                );


                list.appendChild(
                    item
                );

            }
        );

}


/* =========================================================
   BILLING ACCOUNT
========================================================= */

function renderBillingAccount() {

    var element =
        document.getElementById(
            "billingAccountName"
        );


    if (!element) {
        return;
    }


    element.textContent =
        getPhotographerName();

}


/* =========================================================
   PLAN MODAL
========================================================= */

var selectedPlanId =
    null;


function openPlanModal(
    planId
) {

    selectedPlanId =
        normalizePlanId(
            planId
        );


    var modal =
        document.getElementById(
            "planModal"
        );


    var options =
        document.getElementById(
            "modalPlanOptions"
        );


    if (
        !modal ||
        !options
    ) {

        return;

    }


    options.innerHTML =
        "";


    var currentPlanId =
        getCurrentPlanId();


    Object.keys(
        SUBSCRIPTION_PLANS
    )
    .forEach(
        function(id) {

            var plan =
                SUBSCRIPTION_PLANS[
                    id
                ];


            var button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "modal-plan-option";


            if (
                id ===
                currentPlanId
            ) {

                button.classList.add(
                    "current"
                );

            }


            if (
                id ===
                selectedPlanId
            ) {

                button.classList.add(
                    "selected"
                );

            }


            var left =
                document.createElement(
                    "div"
                );


            var name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                plan.name;


            var storage =
                document.createElement(
                    "span"
                );


            storage.textContent =
                formatStorage(
                    plan.storageMB
                ) +
                " recent work storage";


            left.appendChild(
                name
            );


            left.appendChild(
                storage
            );


            var price =
                document.createElement(
                    "span"
                );


            price.className =
                "modal-plan-price";


            price.textContent =
                formatCurrency(
                    plan.price
                ) +
                " / month";


            button.appendChild(
                left
            );


            button.appendChild(
                price
            );


            button.addEventListener(
                "click",
                function() {

                    selectedPlanId =
                        id;


                    options
                        .querySelectorAll(
                            ".modal-plan-option"
                        )
                        .forEach(
                            function(option) {

                                option.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    button.classList.add(
                        "selected"
                    );

                }
            );


            options.appendChild(
                button
            );

        }
    );


    modal.hidden =
        false;


    document.body.style.overflow =
        "hidden";

}


function closePlanModal() {

    var modal =
        document.getElementById(
            "planModal"
        );


    if (!modal) {
        return;
    }


    modal.hidden =
        true;


    document.body.style.overflow =
        "";

    selectedPlanId =
        null;

}


/* =========================================================
   CHANGE PLAN
========================================================= */

function changeSubscriptionPlan(
    planId
) {

    var normalizedPlan =
        normalizePlanId(
            planId
        );


    var plan =
        SUBSCRIPTION_PLANS[
            normalizedPlan
        ];


    if (!plan) {
        return false;
    }


    var currentPlanId =
        getCurrentPlanId();


    if (
        currentPlanId ===
        normalizedPlan
    ) {

        return false;

    }


    /*
       Keep the canonical plan IDs.

       The dashboard can be updated to these
       same IDs when its subscription module
       is synchronized.
    */

    localStorage.setItem(
        SUBSCRIPTION_PLAN_KEY,
        normalizedPlan
    );


    /*
       Reset subscription status when
       changing to another plan.
    */

    localStorage.setItem(
        "professionalStudio.subscriptionStatus",
        "active"
    );


    var renewal =
        new Date();


    renewal.setMonth(
        renewal.getMonth() + 1
    );


    localStorage.setItem(
        SUBSCRIPTION_RENEWAL_KEY,
        renewal.toISOString()
    );


    /*
       Frontend-only payment simulation.

       No payment record is created because
       this is not a real transaction.
    */


    renderAll();


    closePlanModal();


    showToast(
        "Plan changed to " +
        plan.name +
        "."
    );


    return true;

}


/* =========================================================
   CANCEL SUBSCRIPTION
========================================================= */

function cancelSubscription() {

    var confirmed =
        window.confirm(
            "Cancel your Professional Studio subscription?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.setItem(
        "professionalStudio.subscriptionStatus",
        "cancelled"
    );


    renderAll();


    showToast(
        "Subscription marked as cancelled."
    );

}


/* =========================================================
   CHANGE PLAN BUTTON
========================================================= */

function initializeButtons() {

    var changeButton =
        document.getElementById(
            "changePlanBtn"
        );


    var cancelButton =
        document.getElementById(
            "cancelSubscriptionBtn"
        );


    var closeButton =
        document.getElementById(
            "closePlanModal"
        );


    var modalCancelButton =
        document.getElementById(
            "modalCancelBtn"
        );


    var confirmButton =
        document.getElementById(
            "confirmPlanBtn"
        );


    if (changeButton) {

        changeButton.addEventListener(
            "click",
            function() {

                openPlanModal(
                    getCurrentPlanId()
                );

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cancelSubscription
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePlanModal
        );

    }


    if (modalCancelButton) {

        modalCancelButton.addEventListener(
            "click",
            closePlanModal
        );

    }


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            function() {

                if (!selectedPlanId) {
                    return;
                }


                changeSubscriptionPlan(
                    selectedPlanId
                );

            }
        );

    }


    var modal =
        document.getElementById(
            "planModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    modal
                ) {

                    closePlanModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Escape"
            ) {

                closePlanModal();

            }

        }
    );

}


/* =========================================================
   GLOBAL RENDER
========================================================= */

function renderAll() {

    renderOverview();

    renderCurrentPlan();

    renderPlans();

    renderBillingHistory();

    renderGalleryPurchases();

    renderBillingAccount();

}


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        var relevantKeys = [

            SUBSCRIPTION_PLAN_KEY,

            SUBSCRIPTION_RENEWAL_KEY,

            BILLING_HISTORY_KEY,

            GALLERY_PURCHASES_KEY,

            PROFILE_STORAGE_KEY

        ];


        if (
            relevantKeys.indexOf(
                event.key
            ) !== -1
        ) {

            renderAll();

        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderAll();

        initializeButtons();

    }
);