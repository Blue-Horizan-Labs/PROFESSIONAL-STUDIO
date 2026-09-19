/* =========================================================
   PROFESSIONAL STUDIO
   GALLERY SHOP
   COMPLETE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PRICING CONFIGURATION
    ====================================================== */

    /*
        Cloudflare R2 Standard storage:
        $0.015 / GB-month

        Working conversion:
        ₹100 = $1

        Professional Studio markup:
        50%

        Final customer rate:
        $0.015 × ₹100 × 1.50
        = ₹2.25 / GB / month
    */

    const R2_USD_PER_GB_MONTH = 0.015;
    const USD_TO_INR = 100;
    const PLATFORM_MARKUP = 0.50;

    const FINAL_PRICE_PER_GB_MONTH =
        R2_USD_PER_GB_MONTH *
        USD_TO_INR *
        (1 + PLATFORM_MARKUP);


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const storageSlider =
        document.getElementById("storageSlider");

    const storageValue =
        document.getElementById("storageValue");

    const decreaseStorage =
        document.getElementById("decreaseStorage");

    const increaseStorage =
        document.getElementById("increaseStorage");

    const summaryStorage =
        document.getElementById("summaryStorage");

    const summaryDuration =
        document.getElementById("summaryDuration");

    const totalPrice =
        document.getElementById("totalPrice");

    const durationOptions =
        document.querySelectorAll(".duration-option");

    const purchaseBtn =
        document.getElementById("purchaseBtn");

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const mobileMenu =
        document.getElementById("mobileMenu");


    /* =====================================================
       CHECKOUT ELEMENTS
    ====================================================== */

    const checkoutOverlay =
        document.getElementById("checkoutOverlay");

    const checkoutClose =
        document.getElementById("checkoutClose");

    const checkoutCancel =
        document.getElementById("checkoutCancel");

    const checkoutAgreement =
        document.getElementById("checkoutAgreement");

    const checkoutConfirm =
        document.getElementById("checkoutConfirm");

    const checkoutStorage =
        document.getElementById("checkoutStorage");

    const checkoutDuration =
        document.getElementById("checkoutDuration");

    const checkoutTotal =
        document.getElementById("checkoutTotal");


    /* =====================================================
       PAYMENT ELEMENTS
    ====================================================== */

    const paymentOverlay =
        document.getElementById("paymentOverlay");

    const paymentConfirm =
        document.getElementById("paymentConfirm");

    const paymentBack =
        document.getElementById("paymentBack");

    const paymentTotal =
        document.getElementById("paymentTotal");


    /* =====================================================
       STATE
    ====================================================== */

    let selectedStorage =
        storageSlider
            ? Number(storageSlider.value)
            : 100;

    let selectedDuration = 6;


    /* =====================================================
       STORAGE LIMITS
    ====================================================== */

    const MIN_STORAGE = 10;
    const MAX_STORAGE = 1000;
    const STORAGE_STEP = 10;


    /* =====================================================
       DURATION LIMITS
    ====================================================== */

    const ALLOWED_DURATIONS = [3, 6, 12];


    /* =====================================================
       FORMAT NUMBER
    ====================================================== */

    function formatIndianNumber(number) {

        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 0
        }).format(number);

    }


    /* =====================================================
       CALCULATE PRICE
    ====================================================== */

    function calculatePrice(storage, months) {

        const price =
            storage *
            months *
            FINAL_PRICE_PER_GB_MONTH;

        return Math.round(price);

    }


    /* =====================================================
       UPDATE STORAGE
    ====================================================== */

    function updateStorage(value) {

        let newStorage =
            Number(value);

        if (!Number.isFinite(newStorage)) {
            newStorage = MIN_STORAGE;
        }

        newStorage =
            Math.max(
                MIN_STORAGE,
                Math.min(
                    MAX_STORAGE,
                    newStorage
                )
            );

        newStorage =
            Math.round(
                newStorage / STORAGE_STEP
            ) * STORAGE_STEP;

        selectedStorage =
            newStorage;

        if (storageSlider) {
            storageSlider.value =
                newStorage;
        }

        if (storageValue) {
            storageValue.textContent =
                formatIndianNumber(newStorage);
        }

        updatePrice();

    }


    /* =====================================================
       UPDATE PRICE
    ====================================================== */

    function updatePrice() {

        const total =
            calculatePrice(
                selectedStorage,
                selectedDuration
            );

        if (totalPrice) {

            totalPrice.textContent =
                formatIndianNumber(total);

        }

        if (summaryStorage) {

            summaryStorage.textContent =
                `${formatIndianNumber(selectedStorage)} GB`;

        }

        if (summaryDuration) {

            summaryDuration.textContent =
                `${selectedDuration} ${
                    selectedDuration === 1
                        ? "month"
                        : "months"
                }`;

        }

    }


    /* =====================================================
       SELECT DURATION
    ====================================================== */

    function selectDuration(months) {

        const duration =
            Number(months);

        if (
            !Number.isFinite(duration) ||
            !ALLOWED_DURATIONS.includes(duration)
        ) {
            return;
        }

        selectedDuration =
            duration;

        durationOptions.forEach(option => {

            const optionDuration =
                Number(
                    option.dataset.duration
                );

            option.classList.toggle(
                "selected",
                optionDuration === selectedDuration
            );

        });

        updatePrice();

    }


    /* =====================================================
       STORAGE SLIDER
    ====================================================== */

    if (storageSlider) {

        storageSlider.addEventListener(
            "input",
            event => {

                updateStorage(
                    event.target.value
                );

            }
        );

    }


    /* =====================================================
       DECREASE STORAGE
    ====================================================== */

    if (decreaseStorage) {

        decreaseStorage.addEventListener(
            "click",
            () => {

                updateStorage(
                    selectedStorage -
                    STORAGE_STEP
                );

            }
        );

    }


    /* =====================================================
       INCREASE STORAGE
    ====================================================== */

    if (increaseStorage) {

        increaseStorage.addEventListener(
            "click",
            () => {

                updateStorage(
                    selectedStorage +
                    STORAGE_STEP
                );

            }
        );

    }


    /* =====================================================
       DURATION BUTTONS
    ====================================================== */

    durationOptions.forEach(option => {

        option.addEventListener(
            "click",
            () => {

                selectDuration(
                    option.dataset.duration
                );

            }
        );

    });


    /* =====================================================
       CHECKOUT SUMMARY
    ====================================================== */

    function updateCheckoutSummary() {

        const total =
            calculatePrice(
                selectedStorage,
                selectedDuration
            );

        if (checkoutStorage) {

            checkoutStorage.textContent =
                `${formatIndianNumber(selectedStorage)} GB`;

        }

        if (checkoutDuration) {

            checkoutDuration.textContent =
                `${selectedDuration} ${
                    selectedDuration === 1
                        ? "month"
                        : "months"
                }`;

        }

        if (checkoutTotal) {

            checkoutTotal.textContent =
                `₹${formatIndianNumber(total)}`;

        }

        if (paymentTotal) {

            paymentTotal.textContent =
                `₹${formatIndianNumber(total)}`;

        }

    }


    /* =====================================================
       OPEN CHECKOUT
    ====================================================== */

    function openCheckout() {

        if (!checkoutOverlay) {
            return;
        }

        updateCheckoutSummary();

        if (checkoutAgreement) {
            checkoutAgreement.checked = false;
        }

        if (checkoutConfirm) {
            checkoutConfirm.disabled = true;
        }

        checkoutOverlay.classList.add("open");
        checkoutOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    /* =====================================================
       CLOSE CHECKOUT
    ====================================================== */

    function closeCheckout() {

        if (!checkoutOverlay) {
            return;
        }

        checkoutOverlay.classList.remove("open");

        checkoutOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    /* =====================================================
       OPEN PAYMENT
    ====================================================== */

    function openPayment() {

        if (!paymentOverlay) {
            return;
        }

        updateCheckoutSummary();

        closeCheckout();

        paymentOverlay.classList.add("open");

        paymentOverlay.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    /* =====================================================
       CLOSE PAYMENT
    ====================================================== */

    function closePayment() {

        if (!paymentOverlay) {
            return;
        }

        paymentOverlay.classList.remove("open");

        paymentOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    /* =====================================================
       CREATE PURCHASE HANDOFF
    ====================================================== */

    function createGalleryPurchase(orderData) {

        /*
            IMPORTANT CONNECTION

            Gallery Shop
                    ↓
            professionalStudioPendingGallery
                    ↓
            Client Galleries

            These names are intentionally preserved
            because Client Galleries already depends
            on them.
        */

        const purchaseId =
            `purchase_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 8)}`;


        const purchaseData = {

            purchaseId,

            storageGB:
                orderData.storageGB,

            durationMonths:
                orderData.durationMonths,

            totalPriceINR:
                orderData.totalPriceINR,

            purchasedAt:
                new Date().toISOString(),

            source:
                "gallery-shop",

            paymentStatus:
                "frontend-confirmed",

            status:
                "purchased"

        };


        /* =================================================
           CLIENT GALLERY HANDOFF
        ================================================= */

        localStorage.setItem(
            "professionalStudioPendingGallery",
            JSON.stringify(purchaseData)
        );


        /* =================================================
           PURCHASE HISTORY
        ================================================= */

        let purchases = [];

        try {

            purchases =
                JSON.parse(
                    localStorage.getItem(
                        "professionalStudioGalleryPurchases"
                    )
                ) || [];

        } catch (error) {

            purchases = [];

        }


        if (!Array.isArray(purchases)) {
            purchases = [];
        }


        purchases.push(
            purchaseData
        );


        localStorage.setItem(
            "professionalStudioGalleryPurchases",
            JSON.stringify(purchases)
        );


        return purchaseData;

    }


    /* =====================================================
       FINISH FRONTEND PURCHASE
    ====================================================== */

    function completePurchase() {

        const orderData = {

            storageGB:
                selectedStorage,

            durationMonths:
                selectedDuration,

            totalPriceINR:
                calculatePrice(
                    selectedStorage,
                    selectedDuration
                )

        };


        const purchase =
            createGalleryPurchase(
                orderData
            );


        console.log(
            "Gallery purchase created:",
            purchase
        );


        closePayment();


        /*
            Small success state before navigation.
        */

        sessionStorage.setItem(
            "professionalStudioGalleryPurchaseSuccess",
            JSON.stringify({
                purchaseId: purchase.purchaseId,
                storageGB: purchase.storageGB,
                durationMonths: purchase.durationMonths,
                totalPriceINR: purchase.totalPriceINR
            })
        );


        window.location.href =
            "clientgallery.html";

    }


    /* =====================================================
       PURCHASE BUTTON
    ====================================================== */

    if (purchaseBtn) {

        purchaseBtn.addEventListener(
            "click",
            () => {

                openCheckout();

            }
        );

    }


    /* =====================================================
       CHECKOUT AGREEMENT
    ====================================================== */

    if (checkoutAgreement) {

        checkoutAgreement.addEventListener(
            "change",
            () => {

                if (checkoutConfirm) {

                    checkoutConfirm.disabled =
                        !checkoutAgreement.checked;

                }

            }
        );

    }


    /* =====================================================
       CONTINUE TO PAYMENT
    ====================================================== */

    if (checkoutConfirm) {

        checkoutConfirm.addEventListener(
            "click",
            () => {

                if (
                    checkoutAgreement &&
                    !checkoutAgreement.checked
                ) {
                    return;
                }

                openPayment();

            }
        );

    }


    /* =====================================================
       CLOSE CHECKOUT BUTTONS
    ====================================================== */

    if (checkoutClose) {

        checkoutClose.addEventListener(
            "click",
            closeCheckout
        );

    }

    if (checkoutCancel) {

        checkoutCancel.addEventListener(
            "click",
            closeCheckout
        );

    }


    /* =====================================================
       PAYMENT CONFIRM
    ====================================================== */

    if (paymentConfirm) {

        paymentConfirm.addEventListener(
            "click",
            () => {

                completePurchase();

            }
        );

    }


    /* =====================================================
       PAYMENT BACK
    ====================================================== */

    if (paymentBack) {

        paymentBack.addEventListener(
            "click",
            () => {

                closePayment();

                openCheckout();

            }
        );

    }


    /* =====================================================
       CLOSE ON BACKDROP
    ====================================================== */

    if (checkoutOverlay) {

        checkoutOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    checkoutOverlay
                ) {
                    closeCheckout();
                }

            }
        );

    }


    if (paymentOverlay) {

        paymentOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    paymentOverlay
                ) {
                    closePayment();
                }

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            if (
                checkoutOverlay &&
                checkoutOverlay.classList.contains("open")
            ) {
                closeCheckout();
                return;
            }

            if (
                paymentOverlay &&
                paymentOverlay.classList.contains("open")
            ) {
                closePayment();
            }

        }
    );


    /* =====================================================
       MOBILE MENU
    ====================================================== */

    if (mobileMenuBtn && mobileMenu) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                const isOpen =
                    mobileMenu.classList.toggle(
                        "open"
                    );

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );


        const mobileLinks =
            mobileMenu.querySelectorAll("a");


        mobileLinks.forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenu.classList.remove(
                        "open"
                    );

                    mobileMenuBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        });

    }


    /* =====================================================
       INITIALIZE
    ====================================================== */

    updateStorage(
        storageSlider
            ? storageSlider.value
            : MIN_STORAGE
    );

    selectDuration(6);

});