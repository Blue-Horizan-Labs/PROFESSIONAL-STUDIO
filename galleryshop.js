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
        Cloudflare R2 Standard:
        $0.015 / GB / month

        Current working USD → INR conversion:
        ₹95.30 / USD

        Professional Studio markup:
        50%

        Final customer rate:
        $0.015 × ₹95.30 × 1.50
        = ₹2.14425 / GB / month
    */

    const R2_USD_PER_GB_MONTH = 0.015;

    const USD_TO_INR = 95.30;

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

    const pricingSelectButtons =
        document.querySelectorAll("[data-duration-select]");

    const purchaseBtn =
        document.getElementById("purchaseBtn");

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const mobileMenu =
        document.getElementById("mobileMenu");


    /* =====================================================
       STATE
    ====================================================== */

    let selectedStorage =
        Number(storageSlider.value);

    let selectedDuration = 6;


    /* =====================================================
       STORAGE LIMITS
    ====================================================== */

    const MIN_STORAGE = 10;

    const MAX_STORAGE = 1000;

    const STORAGE_STEP = 10;


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

        storageSlider.value =
            newStorage;

        storageValue.textContent =
            newStorage;

        summaryStorage.textContent =
            `${formatIndianNumber(newStorage)} GB`;

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

        totalPrice.textContent =
            formatIndianNumber(total);

        summaryStorage.textContent =
            `${formatIndianNumber(selectedStorage)} GB`;

        summaryDuration.textContent =
            `${selectedDuration} ${
                selectedDuration === 1
                    ? "month"
                    : "months"
            }`;

    }


    /* =====================================================
       SELECT DURATION
    ====================================================== */

    function selectDuration(months) {

        selectedDuration =
            Number(months);

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

    storageSlider.addEventListener(
        "input",
        event => {

            updateStorage(
                event.target.value
            );

        }
    );


    /* =====================================================
       DECREASE STORAGE
    ====================================================== */

    decreaseStorage.addEventListener(
        "click",
        () => {

            updateStorage(
                selectedStorage - STORAGE_STEP
            );

        }
    );


    /* =====================================================
       INCREASE STORAGE
    ====================================================== */

    increaseStorage.addEventListener(
        "click",
        () => {

            updateStorage(
                selectedStorage + STORAGE_STEP
            );

        }
    );


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
       PRICING GUIDE BUTTONS
    ====================================================== */

    pricingSelectButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const duration =
                    button.dataset.durationSelect;

                selectDuration(duration);

                const builder =
                    document.querySelector(
                        ".builder-card"
                    );

                if (builder) {

                    builder.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });


    /* =====================================================
       PURCHASE BUTTON
    ====================================================== */

    purchaseBtn.addEventListener(
        "click",
        () => {

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

            /*
                In production:

                1. Send orderData to backend.
                2. Backend recalculates price.
                3. Backend creates Razorpay order.
                4. Open Razorpay checkout.
                5. Verify payment server-side.
                6. Create gallery.
            */

            console.log(
                "Gallery purchase:",
                orderData
            );

            alert(
                `Gallery selected\n\n` +
                `Storage: ${selectedStorage} GB\n` +
                `Duration: ${selectedDuration} months\n` +
                `Total: ₹${formatIndianNumber(
                    orderData.totalPriceINR
                )}\n\n` +
                `Checkout will be connected here.`
            );

        }
    );


    /* =====================================================
       MOBILE MENU
    ====================================================== */

    mobileMenuBtn.addEventListener(
        "click",
        () => {

            mobileMenu.classList.toggle(
                "open"
            );

        }
    );


    /* =====================================================
       CLOSE MOBILE MENU AFTER CLICK
    ====================================================== */

    const mobileLinks =
        mobileMenu.querySelectorAll("a");

    mobileLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                mobileMenu.classList.remove(
                    "open"
                );

            }
        );

    });


    /* =====================================================
       INITIALIZE
    ====================================================== */

    updateStorage(
        storageSlider.value
    );

    selectDuration(6);

});