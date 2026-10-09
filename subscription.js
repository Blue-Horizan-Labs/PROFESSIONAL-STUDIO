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

var PLAN_REQUEST_KEY =
    "professionalStudio.subscriptionPlanRequest";

var CANCELLATION_REQUEST_KEY =
    "professionalStudio.subscriptionCancellationRequest";


/* =========================================================
   SHARED PROFESSIONAL STUDIO PLAN CATALOG
   Loaded by subscription.html before this file.
========================================================= */
var SUBSCRIPTION_PLANS = window.PROFESSIONAL_STUDIO_PLANS || {};
if (!Object.keys(SUBSCRIPTION_PLANS).length) { console.error("Shared plan catalog failed to load. Check plan-catalog.js is loaded before subscription.js."); }


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
   PLAN AND SUBSCRIPTION STATE
========================================================= */

function normalizePlanId(planId) {
    var value = String(planId || "").trim().toLowerCase();
    var normalized = LEGACY_PLAN_MAP[value] || value;
    return Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, normalized)
        ? normalized
        : null;
}

function getCurrentPlanId() {
    return normalizePlanId(localStorage.getItem(SUBSCRIPTION_PLAN_KEY));
}

function getCurrentPlan() {
    var id = getCurrentPlanId();
    return (id && SUBSCRIPTION_PLANS[id]) || SUBSCRIPTION_PLANS.starter;
}

function hasActiveSubscription() {
    // Only a backend-confirmed flag may activate paid subscription UI.
    // Local plan selection or a legacy frontend status is not proof of payment.
    return localStorage.getItem("professionalStudio.subscriptionVerified") === "true" &&
        getSubscriptionStatus() === "active" &&
        Boolean(getCurrentPlanId());
}

function getSubscriptionStatus() {
    var verified = localStorage.getItem("professionalStudio.subscriptionVerified") === "true";
    var saved = String(localStorage.getItem("professionalStudio.subscriptionStatus") || "").toLowerCase();
    if (!verified) return "not-active";
    if (saved === "active" || saved === "cancelled" || saved === "past_due" || saved === "suspended") return saved;
    return "not-active";
}

function getRenewalDate() {
    var saved = localStorage.getItem(SUBSCRIPTION_RENEWAL_KEY);
    if (!saved) return null;
    var date = new Date(saved);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getPlanRequest() {
    var request = readLocalStorage(PLAN_REQUEST_KEY, null);
    return request && typeof request === "object" ? request : null;
}

function getCancellationRequest() {
    var request = readLocalStorage(CANCELLATION_REQUEST_KEY, null);
    return request && typeof request === "object" ? request : null;
}

function getPendingRequestMessage() {
    var planRequest = getPlanRequest();
    if (planRequest && planRequest.status === "awaiting-billing") {
        var requestedPlan = SUBSCRIPTION_PLANS[normalizePlanId(planRequest.requestedPlanId)];
        return requestedPlan
            ? "Plan request for " + requestedPlan.name + " saved. It is not active until billing is connected."
            : "A plan request is saved and is awaiting billing setup.";
    }

    var cancellation = getCancellationRequest();
    if (cancellation && cancellation.status === "awaiting-backend") {
        return "Cancellation request saved. Your subscription has not been cancelled by this frontend.";
    }
    return "";
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
   TOTAL PAID: COUNT ONLY EXPLICITLY PAID GALLERY ORDERS
========================================================= */

function getTotalPaid() {
    var subscriptionTotal = getBillingHistory().reduce(function(total, record) {
        var status = String(record.status || "").toLowerCase();
        return total + (["paid", "success", "succeeded", "completed"].includes(status)
            ? (Number(record.amount) || 0)
            : 0);
    }, 0);

    var galleryTotal = getGalleryPurchases().reduce(function(total, purchase) {
        var status = String(purchase.paymentStatus || purchase.status || "").toLowerCase();
        var isPaid = ["paid", "success", "succeeded", "completed"].includes(status);
        return total + (isPaid ? getGalleryPurchasePrice(purchase) : 0);
    }, 0);

    return subscriptionTotal + galleryTotal;
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
   RENDER OVERVIEW AND CURRENT PLAN
========================================================= */

function renderOverview() {
    var active = hasActiveSubscription();
    var plan = getCurrentPlan();
    var status = getSubscriptionStatus();
    var renewal = active ? getRenewalDate() : null;

    var planElement = document.getElementById("overviewPlan");
    var priceElement = document.getElementById("overviewPlanPrice");
    var statusElement = document.getElementById("overviewStatus");
    var statusText = document.getElementById("overviewStatusText");
    var renewalElement = document.getElementById("overviewRenewal");
    var totalPaidElement = document.getElementById("overviewTotalPaid");

    if (planElement) planElement.textContent = active ? plan.name : "No active plan";
    if (priceElement) priceElement.textContent = active ? formatCurrency(plan.price) + " / month" : "Choose a plan to get started";

    var statusLabels = {
        active: "Active",
        cancelled: "Cancelled",
        past_due: "Payment issue",
        suspended: "Suspended",
        "not-active": "Not activated"
    };
    if (statusElement) {
        statusElement.textContent = statusLabels[status] || "Not activated";
        statusElement.className = "overview-value " + (status === "active" ? "status-active" : "status-inactive");
    }
    if (statusText) {
        statusText.textContent = getPendingRequestMessage() || (
            status === "active" ? "Your subscription is active" :
            status === "cancelled" ? "Your subscription is marked as cancelled" :
            status === "past_due" ? "Billing needs attention" :
            status === "suspended" ? "Subscription access is suspended" :
            "No paid subscription has been activated yet"
        );
    }
    if (renewalElement) renewalElement.textContent = renewal ? formatDate(renewal) : "—";
    if (totalPaidElement) totalPaidElement.textContent = formatCurrency(getTotalPaid());
}

function renderCurrentPlan() {
    var active = hasActiveSubscription();
    var plan = getCurrentPlan();
    var status = getSubscriptionStatus();
    var planName = document.getElementById("currentPlanName");
    var planDescription = document.getElementById("currentPlanDescription");
    var planPrice = document.getElementById("currentPlanPrice");
    var planStorage = document.getElementById("currentPlanStorage");
    var planRenewal = document.getElementById("currentPlanRenewal");
    var statusElement = document.getElementById("currentPlanStatus");
    var cancelButton = document.getElementById("cancelSubscriptionBtn");

    if (planName) planName.textContent = active ? plan.name : "No active subscription";
    if (planDescription) planDescription.textContent = active
        ? plan.description
        : "Choose a plan below. Your subscription will only activate after billing is connected and payment is confirmed.";
    if (planPrice) planPrice.textContent = active ? formatCurrency(plan.price) : "—";
    if (planStorage) planStorage.textContent = active ? formatStorage(plan.storageMB) : "—";
    if (planRenewal) planRenewal.textContent = active && getRenewalDate() ? formatDate(getRenewalDate()) : "—";

    if (statusElement) {
        var labels = { active: "Active", cancelled: "Cancelled", past_due: "Payment issue", suspended: "Suspended", "not-active": "Not activated" };
        statusElement.textContent = labels[status] || "Not activated";
        statusElement.className = "plan-status " + (status === "active" ? "active" : status === "cancelled" ? "cancelled" : "inactive");
    }
    if (cancelButton) {
        cancelButton.disabled = !active || Boolean(getCancellationRequest() && getCancellationRequest().status === "awaiting-backend");
        cancelButton.textContent = getCancellationRequest() && getCancellationRequest().status === "awaiting-backend"
            ? "Cancellation Requested"
            : "Cancel Subscription";
    }
}

/* =========================================================
   RENDER PLANS
========================================================= */

function renderPlans() {
    var grid = document.getElementById("plansGrid");
    if (!grid) return;
    grid.innerHTML = "";

    var active = hasActiveSubscription();
    var currentPlanId = active ? getCurrentPlanId() : null;
    var pendingRequest = getPlanRequest();

    Object.keys(SUBSCRIPTION_PLANS).forEach(function(planId) {
        var plan = SUBSCRIPTION_PLANS[planId];
        var card = document.createElement("article");
        card.className = "plan-card";
        if (planId === currentPlanId) card.classList.add("current");

        var badgeText = planId === currentPlanId ? "CURRENT PLAN" : (plan.popular ? "POPULAR" : "");
        if (pendingRequest && pendingRequest.status === "awaiting-billing" && pendingRequest.requestedPlanId === planId) badgeText = "REQUESTED";
        if (badgeText) {
            var badge = document.createElement("span");
            badge.className = "plan-card-badge";
            badge.textContent = badgeText;
            card.appendChild(badge);
        }

        var name = document.createElement("h3");
        name.className = "plan-card-name";
        name.textContent = plan.name;
        card.appendChild(name);

        var description = document.createElement("p");
        description.className = "plan-card-description";
        description.textContent = plan.description;
        card.appendChild(description);

        var price = document.createElement("div");
        price.className = "plan-price";
        price.textContent = formatCurrency(plan.price) + " / month";
        card.appendChild(price);

        var storage = document.createElement("div");
        storage.className = "plan-storage";
        storage.textContent = formatStorage(plan.storageMB) + " recent work storage";
        card.appendChild(storage);

        var divider = document.createElement("div");
        divider.className = "plan-divider";
        card.appendChild(divider);

        var featureList = document.createElement("ul");
        featureList.className = "plan-features";
        (Array.isArray(plan.features) ? plan.features : []).forEach(function(feature) {
            var item = document.createElement("li");
            item.textContent = feature;
            featureList.appendChild(item);
        });
        card.appendChild(featureList);

        var button = document.createElement("button");
        button.type = "button";
        var isCurrent = planId === currentPlanId;
        var isRequested = pendingRequest && pendingRequest.status === "awaiting-billing" && pendingRequest.requestedPlanId === planId;
        button.className = isCurrent ? "btn-secondary" : "btn-primary";
        button.textContent = isCurrent ? "Current Plan" : isRequested ? "Request Saved" : active ? (getPlanOrder(planId) > getPlanOrder(currentPlanId) ? "Upgrade" : "Change Plan") : "Choose Plan";
        button.disabled = isCurrent || Boolean(isRequested);
        if (button.disabled) button.style.cursor = "default";
        if (!button.disabled) button.addEventListener("click", function() { openPlanModal(planId); });
        card.appendChild(button);
        grid.appendChild(card);
    });
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
                    "Status unavailable";


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
   PLAN REQUESTS (FRONTEND ONLY)
========================================================= */

var selectedPlanId = null;

function openPlanModal(planId) {
    selectedPlanId = normalizePlanId(planId);
    var modal = document.getElementById("planModal");
    var options = document.getElementById("modalPlanOptions");
    var modalText = document.getElementById("planModalText");
    var confirmButton = document.getElementById("confirmPlanBtn");
    if (!modal || !options) return;

    var active = hasActiveSubscription();
    var currentPlanId = active ? getCurrentPlanId() : null;
    if (modalText) {
        modalText.textContent = active
            ? "Choose a plan to request a change. Your current plan will remain unchanged until billing is connected and the request is processed."
            : "Choose a plan to request activation. No payment will be taken and the plan will not activate until billing is connected.";
    }
    if (confirmButton) confirmButton.textContent = active ? "Save Change Request" : "Save Plan Request";

    options.innerHTML = "";
    Object.keys(SUBSCRIPTION_PLANS).forEach(function(id) {
        var plan = SUBSCRIPTION_PLANS[id];
        var button = document.createElement("button");
        button.type = "button";
        button.className = "modal-plan-option";
        if (id === currentPlanId) button.classList.add("current");
        if (id === selectedPlanId) button.classList.add("selected");

        var left = document.createElement("div");
        var name = document.createElement("strong");
        name.textContent = plan.name;
        var storage = document.createElement("span");
        storage.textContent = formatStorage(plan.storageMB) + " recent work storage";
        left.appendChild(name);
        left.appendChild(storage);

        var price = document.createElement("span");
        price.className = "modal-plan-price";
        price.textContent = formatCurrency(plan.price) + " / month";
        button.appendChild(left);
        button.appendChild(price);
        button.setAttribute("aria-pressed", id === selectedPlanId ? "true" : "false");
        button.addEventListener("click", function() {
            selectedPlanId = id;
            options.querySelectorAll(".modal-plan-option").forEach(function(option) {
                option.classList.remove("selected");
                option.setAttribute("aria-pressed", "false");
            });
            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        });
        options.appendChild(button);
    });

    modal.hidden = false;
    document.body.style.overflow = "hidden";
}

function closePlanModal() {
    var modal = document.getElementById("planModal");
    if (modal) modal.hidden = true;
    document.body.style.overflow = "";
    selectedPlanId = null;
}

function changeSubscriptionPlan(planId) {
    var requestedPlanId = normalizePlanId(planId);
    if (!requestedPlanId || !SUBSCRIPTION_PLANS[requestedPlanId]) {
        showToast("Please select a valid plan.");
        return false;
    }

    var active = hasActiveSubscription();
    var currentPlanId = active ? getCurrentPlanId() : null;
    if (active && currentPlanId === requestedPlanId) {
        showToast("That is already your current plan.");
        return false;
    }

    var request = {
        requestId: "plan-request-" + Date.now(),
        requestType: active ? "change-plan" : "new-subscription",
        currentPlanId: currentPlanId,
        requestedPlanId: requestedPlanId,
        status: "awaiting-billing",
        createdAt: new Date().toISOString(),
        source: "subscription-page",
        note: "Frontend request only. No payment was processed and no subscription was activated or changed."
    };

    if (!writeLocalStorage(PLAN_REQUEST_KEY, request)) {
        showToast("Could not save the request. Check browser storage and try again.");
        return false;
    }

    closePlanModal();
    renderAll();
    showToast("Plan request saved. Billing setup is still required.");
    return true;
}

function cancelSubscription() {
    if (!hasActiveSubscription()) {
        showToast("There is no active subscription to cancel.");
        return;
    }
    var existing = getCancellationRequest();
    if (existing && existing.status === "awaiting-backend") {
        showToast("A cancellation request is already saved.");
        return;
    }
    var confirmed = window.confirm("Save a cancellation request? Your subscription will remain unchanged until the billing backend processes it.");
    if (!confirmed) return;

    var request = {
        requestId: "cancel-request-" + Date.now(),
        currentPlanId: getCurrentPlanId(),
        status: "awaiting-backend",
        createdAt: new Date().toISOString(),
        source: "subscription-page",
        note: "Frontend request only. Subscription has not been cancelled by this page."
    };
    if (!writeLocalStorage(CANCELLATION_REQUEST_KEY, request)) {
        showToast("Could not save the cancellation request.");
        return;
    }
    renderAll();
    showToast("Cancellation request saved. Backend processing is still required.");
}

function initializeButtons() {
    var changeButton = document.getElementById("changePlanBtn");
    var cancelButton = document.getElementById("cancelSubscriptionBtn");
    var closeButton = document.getElementById("closePlanModal");
    var modalCancelButton = document.getElementById("modalCancelBtn");
    var confirmButton = document.getElementById("confirmPlanBtn");

    if (changeButton) changeButton.addEventListener("click", function() { openPlanModal(null); });
    if (cancelButton) cancelButton.addEventListener("click", cancelSubscription);
    if (closeButton) closeButton.addEventListener("click", closePlanModal);
    if (modalCancelButton) modalCancelButton.addEventListener("click", closePlanModal);
    if (confirmButton) confirmButton.addEventListener("click", function() {
        if (!selectedPlanId) {
            showToast("Select a plan first.");
            return;
        }
        changeSubscriptionPlan(selectedPlanId);
    });

    var modal = document.getElementById("planModal");
    if (modal) modal.addEventListener("click", function(event) {
        if (event.target === modal) closePlanModal();
    });
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") closePlanModal();
    });
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

window.addEventListener("storage", function(event) {
    var relevantKeys = [
        SUBSCRIPTION_PLAN_KEY,
        SUBSCRIPTION_RENEWAL_KEY,
        BILLING_HISTORY_KEY,
        GALLERY_PURCHASES_KEY,
        PROFILE_STORAGE_KEY,
        "professionalStudio.subscriptionStatus",
        PLAN_REQUEST_KEY,
        CANCELLATION_REQUEST_KEY
    ];
    if (event.key === null || relevantKeys.indexOf(event.key) !== -1) renderAll();
});

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