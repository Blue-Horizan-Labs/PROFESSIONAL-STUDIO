/* =========================================================
   PROFESSIONAL STUDIO
   SERVICE PAGE
========================================================= */


/* =========================================================
   SHARED STORAGE
========================================================= */

const SERVICE_STORAGE_KEY =
    "professionalStudio.services";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const serviceNameElement =
    document.getElementById("serviceName");
const serviceCategoryLabel =
    document.getElementById("serviceCategoryLabel");

const serviceDescriptionElement =
    document.getElementById("serviceDescription");

const coverageDurationElement =
    document.getElementById("coverageDuration");

const deliveryTimeElement =
    document.getElementById("deliveryTime");

const coverageTypeElement =
    document.getElementById("coverageType");

const packagesContainer =
    document.getElementById("packagesContainer");

const serviceInfo =
    document.getElementById("serviceInfo");

const serviceError =
    document.getElementById("serviceError");

const serviceErrorMessage =
    document.getElementById("serviceErrorMessage");


/* =========================================================
   URL PARAMETERS
========================================================= */

const urlParams =
    new URLSearchParams(window.location.search);

const serviceId =
    urlParams.get("id");

const requestedAction =
    urlParams.get("action");


/* =========================================================
   LOAD SERVICES
========================================================= */

function getServices() {

    try {

        const storedServices =
            localStorage.getItem(
                SERVICE_STORAGE_KEY
            );

        if (!storedServices) {
            return [];
        }

        const services =
            JSON.parse(storedServices);

        if (!Array.isArray(services)) {
            return [];
        }

        return services;

    }
    catch (error) {

        console.error(
            "Could not load services:",
            error
        );

        return [];
    }
}


/* =========================================================
   FIND SERVICE
========================================================= */

function getSelectedService() {

    const services =
        getServices();

    return services.find((service) => {
        const candidateId = service && (service.id ?? service.serviceId ?? service.slug);
        return String(candidateId ?? "") === String(serviceId ?? "");
    });
}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(price) {

    if (price === null || price === undefined || String(price).trim() === "") {
        return "Contact for pricing";
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return "Contact for pricing";
    }

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(numericPrice);
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   SHOW ERROR
========================================================= */

function showServiceError(message) {

    if (serviceErrorMessage) {

        serviceErrorMessage.textContent =
            message;
    }

    if (serviceError) {

        serviceError.hidden = false;
    }

    if (serviceInfo) {

        serviceInfo.hidden = true;
    }

    if (packagesContainer) {

        packagesContainer.innerHTML = "";
    }

    document.title =
        "Professional Studio | Service Not Found";
}


/* =========================================================
   LOAD SERVICE DETAILS
========================================================= */

function renderService(service) {

    if (!service) {

        showServiceError(
            "The requested service could not be found."
        );

        return;
    }


    /*
     * Only active services are available
     * to clients.
     */

    if (service.active === false) {

        showServiceError(
            "This service is currently unavailable for booking."
        );

        return;
    }


    document.title =
        "Professional Studio | " +
        (
            service.name ||
            "Service"
        );

    if (serviceCategoryLabel) {
        serviceCategoryLabel.textContent = String(service.category || "Photography Service").trim().toLocaleUpperCase();
    }


    /* -----------------------------------------------------
       SERVICE INFORMATION
    ------------------------------------------------------ */

    if (serviceNameElement) {

        serviceNameElement.textContent =
            service.name ||
            "Photography Service";
    }


    if (serviceDescriptionElement) {

        serviceDescriptionElement.textContent =
            service.description ||
            "Professional photography service tailored to your needs.";
    }


    if (coverageDurationElement) {

        coverageDurationElement.textContent =
            service.coverageDuration ||
            "Available on request";
    }


    if (deliveryTimeElement) {

        deliveryTimeElement.textContent =
            service.deliveryTime ||
            "Available on request";
    }


    if (coverageTypeElement) {

        coverageTypeElement.textContent =
            service.coverageType ||
            "On-location";
    }


    /* -----------------------------------------------------
       PACKAGES
    ------------------------------------------------------ */

    renderPackages(service);


    /*
     * If the page was opened using:
     *
     * service.html?id=...&action=book
     *
     * scroll the visitor directly to packages.
     */

    if (requestedAction === "book") {

        setTimeout(
            () => {

                const packagesSection =
                    document.querySelector(
                        ".packages-section"
                    );

                if (packagesSection) {

                    packagesSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }

            },
            150
        );
    }
}


/* =========================================================
   RENDER PACKAGES
========================================================= */

function renderPackages(service) {

    if (!packagesContainer) {
        return;
    }


    const packages =
        Array.isArray(service.packages)
            ? service.packages.filter((packageData) => {
                if (!packageData || typeof packageData !== "object") return false;
                const id = packageData.id ?? packageData.packageId ?? packageData.key ?? packageData.slug;
                const name = String(packageData.name ?? packageData.packageName ?? packageData.title ?? "").trim();
                const price = Number(String(packageData.price ?? packageData.packagePrice ?? "").replace(/[^\d.-]/g, ""));
                return Boolean(String(id ?? "").trim() && name && Number.isFinite(price) && price > 0);
            })
            : [];


    if (packages.length === 0) {

        packagesContainer.innerHTML = `
            <div class="empty-packages">

                <h3>
                    Packages Coming Soon
                </h3>

                <p>
                    Package information for this service
                    is not available yet.
                </p>

            </div>
        `;

        return;
    }


    packagesContainer.innerHTML =
        packages
            .map(
                (
                    packageData,
                    index
                ) =>
                    createPackageCard(
                        service,
                        packageData,
                        index
                    )
            )
            .join("");


    attachPackageButtons();
}


function getPaymentPlanLabel(plan, price) {
    if (!plan || typeof plan !== "object" || plan.type === "full") return "Full payment";
    if (plan.type === "advance") {
        const value = Number(plan.advanceValue);
        if (!Number.isFinite(value) || value <= 0) return "Advance payment";
        if (plan.advanceType === "fixed") return `Advance ${formatPrice(value)}`;
        return `Advance ${Math.min(100, value)}%`;
    }
    if (plan.type === "installments") {
        const stages = Array.isArray(plan.installments) ? plan.installments.length : 0;
        return stages ? `${stages} payment stages` : "Custom installments";
    }
    return "Contact for payment details";
}


/* =========================================================
   CREATE PACKAGE CARD
========================================================= */

function createPackageCard(
    service,
    packageData,
    index
) {

    const packageId =
        packageData.id ??
        packageData.packageId ??
        packageData.key ??
        packageData.slug ??
        `package-${index + 1}`;

    const serviceIdentifier =
        service.id ?? service.serviceId ?? service.slug ?? "";


    const packageName =
        packageData.name ||
        packageData.packageName ||
        packageData.title ||
        `Package ${index + 1}`;


    const price =
        formatPrice(
            packageData.price ?? packageData.packagePrice ?? packageData.amount
        );


    const coverage =
        packageData.coverage || packageData.duration || packageData.hours ||
        "Available on request";


    const photos =
        packageData.photos || packageData.photoCount ||
        "Available on request";


    const delivery =
        packageData.delivery || packageData.deliveryTime ||
        "Available on request";


    const description =
        packageData.description ||
        "Professional photography package tailored to this service.";


    /*
     * The middle package is visually highlighted
     * when there are three packages.
     */

    const isFeatured =
        Array.isArray(service.packages) &&
        service.packages.length === 3 &&
        index === 1;


    return `
        <article
            class="package-card ${
                isFeatured
                    ? "featured"
                    : ""
            }"
        >

            ${
                isFeatured
                    ? `
                        <span class="package-badge">
                            POPULAR
                        </span>
                    `
                    : ""
            }


            <h3 class="package-name">
                ${escapeHTML(packageName)}
            </h3>


            <div class="package-price">
                ${escapeHTML(price)}
            </div>


            <p class="package-description">
                ${escapeHTML(description)}
            </p>


            <ul class="package-details">

                <li>
                    Coverage:
                    <strong>
                        ${escapeHTML(coverage)}
                    </strong>
                </li>

                <li>
                    Edited Photos:
                    <strong>
                        ${escapeHTML(photos)}
                    </strong>
                </li>

                <li>
                    Delivery:
                    <strong>
                        ${escapeHTML(delivery)}
                    </strong>
                </li>
                ${(packageData.album ?? packageData.albumIncluded) && String(packageData.album ?? packageData.albumIncluded).toLowerCase() !== "no" ? `
                    <li>Album: <strong>${escapeHTML(packageData.album ?? packageData.albumIncluded)}</strong></li>
                ` : ""}
                <li>
                    Payment:
                    <strong>${escapeHTML(getPaymentPlanLabel(packageData.paymentPlan ?? packageData.packagePaymentPlan ?? packageData.payment, packageData.price ?? packageData.packagePrice))}</strong>
                </li>

            </ul>


            <button
                type="button"
                class="primary-button package-book-button"
                data-service-id="${escapeHTML(serviceIdentifier)}"
                data-package-id="${escapeHTML(packageId)}"
            >
                BOOK THIS PACKAGE
            </button>

        </article>
    `;
}


/* =========================================================
   PACKAGE BUTTONS
========================================================= */

function attachPackageButtons() {

    const buttons =
        document.querySelectorAll(
            ".package-book-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const selectedServiceId =
                        this.dataset.serviceId;

                    const selectedPackageId =
                        this.dataset.packageId;


                    if (
                        !selectedServiceId ||
                        !selectedPackageId
                    ) {

                        console.error("Missing service or package ID.");
                        window.alert("This package cannot be booked right now. Please return to Services and try again.");
                        return;
                    }


                    /*
                     * Pass both IDs to booking.html.
                     *
                     * booking.html will use these IDs
                     * to retrieve the exact service and
                     * package from the shared storage.
                     */

                    const bookingURL =
                        "booking.html" +
                        "?service=" +
                        encodeURIComponent(
                            selectedServiceId
                        ) +
                        "&package=" +
                        encodeURIComponent(
                            selectedPackageId
                        );


                    window.location.href =
                        bookingURL;
                }
            );
        }
    );
}


/* =========================================================
   STORAGE CHANGE
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key === SERVICE_STORAGE_KEY ||
            event.key === null
        ) {

            const updatedService =
                getSelectedService();

            if (updatedService) {

                renderService(
                    updatedService
                );

            }
            else {

                showServiceError(
                    "This service is no longer available."
                );
            }
        }
    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeServicePage() {

    if (!serviceId) {

        showServiceError(
            "No service was selected."
        );

        return;
    }


    const selectedService =
        getSelectedService();


    renderService(
        selectedService
    );
}


initializeServicePage();