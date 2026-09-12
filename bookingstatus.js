/* =========================================================
   PROFESSIONAL STUDIO
   BOOKING STATUS
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const BOOKING_STORAGE_KEY = "bookings";
const SERVICES_STORAGE_KEY = "professionalStudio.services";


/* =========================================================
   DOM
========================================================= */

const errorCard =
    document.getElementById("errorCard");

const errorMessage =
    document.getElementById("errorMessage");

const bookingContent =
    document.getElementById("bookingContent");

const bookingIdElement =
    document.getElementById("bookingId");

const statusBadge =
    document.getElementById("statusBadge");

const clientName =
    document.getElementById("clientName");

const serviceName =
    document.getElementById("serviceName");

const packageName =
    document.getElementById("packageName");

const packagePrice =
    document.getElementById("packagePrice");

const locationElement =
    document.getElementById("location");

const totalHours =
    document.getElementById("totalHours");

const dateList =
    document.getElementById("dateList");


const stepRequest =
    document.getElementById("stepRequest");

const stepReview =
    document.getElementById("stepReview");

const stepPayment =
    document.getElementById("stepPayment");

const stepConfirmed =
    document.getElementById("stepConfirmed");


const lineReview =
    document.getElementById("lineReview");

const linePayment =
    document.getElementById("linePayment");

const lineConfirmed =
    document.getElementById("lineConfirmed");


const reviewText =
    document.getElementById("reviewText");

const paymentText =
    document.getElementById("paymentText");

const confirmedText =
    document.getElementById("confirmedText");


const messageIcon =
    document.getElementById("messageIcon");

const messageLabel =
    document.getElementById("messageLabel");

const messageTitle =
    document.getElementById("messageTitle");

const messageText =
    document.getElementById("messageText");


const paymentCard =
    document.getElementById("paymentCard");

const paymentTitle =
    document.getElementById("paymentTitle");

const paymentDescription =
    document.getElementById("paymentDescription");

const paymentPlanName =
    document.getElementById("paymentPlanName");

const paymentPackagePrice =
    document.getElementById("paymentPackagePrice");

const paidAmount =
    document.getElementById("paidAmount");

const remainingAmount =
    document.getElementById("remainingAmount");

const nextPaymentLabel =
    document.getElementById("nextPaymentLabel");

const nextPaymentAmount =
    document.getElementById("nextPaymentAmount");

const paymentProgressText =
    document.getElementById("paymentProgressText");

const paymentProgressFill =
    document.getElementById("paymentProgressFill");

const paymentNextTitle =
    document.getElementById("paymentNextTitle");

const paymentNextDue =
    document.getElementById("paymentNextDue");

const paymentSchedule =
    document.getElementById("paymentSchedule");

const payAdvanceButton =
    document.getElementById("payAdvanceButton");


const cancelledCard =
    document.getElementById("cancelledCard");

const confirmedCard =
    document.getElementById("confirmedCard");

const confirmedCardText =
    document.getElementById("confirmedCardText");


/* =========================================================
   URL
========================================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const bookingId =
    urlParams.get("id");


/* =========================================================
   GENERAL HELPERS
========================================================= */

function roundMoney(value) {

    return Math.round(
        Number(value || 0) * 100
    ) / 100;

}


function parseMoney(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }


    if (
        typeof value === "number"
    ) {
        return Number.isFinite(value)
            ? value
            : 0;
    }


    const number =
        Number(
            String(value)
                .replace(/[^\d.-]/g, "")
        );


    return Number.isFinite(number)
        ? number
        : 0;

}


function formatCurrency(value) {

    const number =
        parseMoney(value);


    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(number);

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function getPackagePrice(booking) {

    return parseMoney(
        booking.packagePrice ??
        booking.price ??
        booking.totalAmount ??
        0
    );

}


/* =========================================================
   STORAGE
========================================================= */

function getBookings() {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(
                    BOOKING_STORAGE_KEY
                )
            );


        return Array.isArray(stored)
            ? stored
            : [];

    } catch (error) {

        console.error(
            "Unable to read bookings:",
            error
        );

        return [];

    }

}


function saveBookings(bookings) {

    try {

        localStorage.setItem(
            BOOKING_STORAGE_KEY,
            JSON.stringify(bookings)
        );

        return true;

    } catch (error) {

        console.error(
            "Unable to save bookings:",
            error
        );

        return false;

    }

}


function getCurrentBooking() {

    if (!bookingId) {
        return null;
    }


    const bookings =
        getBookings();


    return bookings.find(
        function (booking) {

            return String(
                booking.id
            ) === String(
                bookingId
            );

        }
    ) || null;

}


/* =========================================================
   SERVICE STORAGE
========================================================= */

function getServices() {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(
                    SERVICES_STORAGE_KEY
                )
            );


        return Array.isArray(stored)
            ? stored
            : [];

    } catch (error) {

        console.error(
            "Unable to read services:",
            error
        );

        return [];

    }

}


/* =========================================================
   PAYMENT PLAN
========================================================= */

function normalizePaymentPlan(plan) {

    const source =
        plan && typeof plan === "object"
            ? plan
            : {};


    let type =
        String(
            source.type || "full"
        ).toLowerCase();


    if (
        type !== "full" &&
        type !== "advance" &&
        type !== "installments"
    ) {
        type = "full";
    }


    const advanceSource =
        source.advance &&
        typeof source.advance === "object"
            ? source.advance
            : {};


    const advanceType =
        String(
            advanceSource.type ||
            "percentage"
        ).toLowerCase();


    const normalizedAdvanceType =
        advanceType === "fixed"
            ? "fixed"
            : "percentage";


    const advanceValue =
        parseMoney(
            advanceSource.value
        );


    const installments =
        Array.isArray(
            source.installments
        )
            ? source.installments
                .map(
                    function (item, index) {

                        if (
                            !item ||
                            typeof item !== "object"
                        ) {
                            return null;
                        }


                        const itemType =
                            String(
                                item.type ||
                                "percentage"
                            ).toLowerCase();


                        return {

                            id:
                                item.id ||
                                "installment-" +
                                (index + 1),

                            name:
                                item.name ||
                                "Payment " +
                                (index + 1),

                            type:
                                itemType === "fixed"
                                    ? "fixed"
                                    : "percentage",

                            value:
                                parseMoney(
                                    item.value
                                ),

                            dueTiming:
                                item.dueTiming ||
                                "Before session"

                        };

                    }
                )
                .filter(Boolean)
            : [];


    return {

        type,

        advance: {

            type:
                normalizedAdvanceType,

            value:
                advanceValue

        },

        installments

    };

}


/* =========================================================
   FIND PAYMENT PLAN
========================================================= */

function resolvePaymentPlan(booking) {

    if (
        booking.paymentPlan &&
        typeof booking.paymentPlan === "object"
    ) {

        return normalizePaymentPlan(
            booking.paymentPlan
        );

    }


    if (
        booking.packagePaymentPlan &&
        typeof booking.packagePaymentPlan === "object"
    ) {

        return normalizePaymentPlan(
            booking.packagePaymentPlan
        );

    }


    const services =
        getServices();


    if (!services.length) {

        return normalizePaymentPlan(
            null
        );

    }


    const bookingServiceId =
        booking.serviceId ||
        booking.serviceID;


    const bookingPackageId =
        booking.packageId ||
        booking.packageID;


    const bookingServiceName =
        String(
            booking.service || ""
        )
            .trim()
            .toLowerCase();


    const bookingPackageName =
        String(
            booking.package || ""
        )
            .trim()
            .toLowerCase();


    let matchedService =
        null;


    if (bookingServiceId) {

        matchedService =
            services.find(
                function (service) {

                    return String(
                        service.id ||
                        service.serviceId ||
                        ""
                    ) === String(
                        bookingServiceId
                    );

                }
            ) || null;

    }


    if (!matchedService && bookingServiceName) {

        matchedService =
            services.find(
                function (service) {

                    const name =
                        String(
                            service.name ||
                            service.serviceName ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    return name ===
                        bookingServiceName;

                }
            ) || null;

    }


    if (!matchedService) {

        return normalizePaymentPlan(
            null
        );

    }


    const packages =
        Array.isArray(
            matchedService.packages
        )
            ? matchedService.packages
            : [];


    let matchedPackage =
        null;


    if (bookingPackageId) {

        matchedPackage =
            packages.find(
                function (pkg) {

                    return String(
                        pkg.id ||
                        pkg.packageId ||
                        ""
                    ) === String(
                        bookingPackageId
                    );

                }
            ) || null;

    }


    if (!matchedPackage && bookingPackageName) {

        matchedPackage =
            packages.find(
                function (pkg) {

                    const name =
                        String(
                            pkg.name ||
                            pkg.packageName ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    return name ===
                        bookingPackageName;

                }
            ) || null;

    }


    if (
        matchedPackage &&
        matchedPackage.paymentPlan
    ) {

        return normalizePaymentPlan(
            matchedPackage.paymentPlan
        );

    }


    return normalizePaymentPlan(
        null
    );

}


/* =========================================================
   PAYMENT PLAN LABEL
========================================================= */

function getPaymentPlanLabel(plan) {

    if (plan.type === "full") {
        return "Full Payment";
    }


    if (plan.type === "advance") {
        return "Advance Payment";
    }


    if (plan.type === "installments") {
        return "Custom Installments";
    }


    return "Full Payment";

}


/* =========================================================
   CALCULATE STAGE AMOUNT
========================================================= */

function calculateStageAmount(
    stage,
    total
) {

    if (
        !stage ||
        total <= 0
    ) {
        return 0;
    }


    if (
        stage.type === "fixed"
    ) {

        return roundMoney(
            Math.min(
                parseMoney(stage.value),
                total
            )
        );

    }


    return roundMoney(
        total *
        parseMoney(stage.value) /
        100
    );

}


/* =========================================================
   BUILD PAYMENT SCHEDULE
========================================================= */

function buildPaymentSchedule(
    plan,
    total
) {

    const schedule = [];


    if (total <= 0) {

        return schedule;

    }


    /*
        FULL PAYMENT
    */

    if (plan.type === "full") {

        schedule.push({

            id: "full-payment",

            name: "Full Payment",

            amount: total,

            dueTiming: "At booking"

        });


        return schedule;

    }


    /*
        ADVANCE PAYMENT
    */

    if (plan.type === "advance") {

        const advance =
            calculateStageAmount(
                plan.advance,
                total
            );


        const remaining =
            roundMoney(
                total - advance
            );


        if (advance > 0) {

            schedule.push({

                id: "booking-advance",

                name: "Booking Advance",

                amount: advance,

                dueTiming: "At booking"

            });

        }


        if (remaining > 0) {

            schedule.push({

                id: "remaining-balance",

                name: "Remaining Balance",

                amount: remaining,

                dueTiming: "Before session"

            });

        }


        return schedule;

    }


    /*
        CUSTOM INSTALLMENTS
    */

    if (
        plan.type === "installments" &&
        plan.installments.length
    ) {

        plan.installments.forEach(
            function (stage, index) {

                const amount =
                    calculateStageAmount(
                        stage,
                        total
                    );


                if (amount > 0) {

                    schedule.push({

                        id:
                            stage.id ||
                            "installment-" +
                            (index + 1),

                        name:
                            stage.name ||
                            "Payment " +
                            (index + 1),

                        amount,

                        dueTiming:
                            stage.dueTiming ||
                            "Before session"

                    });

                }

            }
        );

    }


    /*
        SAFETY FALLBACK

        If an invalid custom plan results
        in no stages, use full payment.
    */

    if (!schedule.length) {

        schedule.push({

            id: "full-payment",

            name: "Full Payment",

            amount: total,

            dueTiming: "At booking"

        });

    }


    /*
        ROUNDING SAFETY

        Make sure the schedule equals
        the package total.
    */

    const scheduleTotal =
        roundMoney(
            schedule.reduce(
                function (sum, item) {
                    return sum + item.amount;
                },
                0
            )
        );


    const difference =
        roundMoney(
            total - scheduleTotal
        );


    if (
        Math.abs(difference) > 0 &&
        schedule.length
    ) {

        schedule[
            schedule.length - 1
        ].amount =
            roundMoney(
                schedule[
                    schedule.length - 1
                ].amount +
                difference
            );

    }


    return schedule;

}


/* =========================================================
   PAYMENT DETAILS
========================================================= */

function createPaymentDetails(
    booking
) {

    const total =
        getPackagePrice(
            booking
        );


    const plan =
        resolvePaymentPlan(
            booking
        );


    const schedule =
        buildPaymentSchedule(
            plan,
            total
        );


    return {

        status: "pending",

        totalAmount: total,

        paidAmount: 0,

        remainingAmount: total,

        nextPaymentAmount:
            schedule.length
                ? schedule[0].amount
                : total,

        nextPaymentLabel:
            schedule.length
                ? schedule[0].name
                : "Payment",

        schedule,

        transactions: []

    };

}


/* =========================================================
   NORMALIZE PAYMENT DETAILS
========================================================= */

function normalizePaymentDetails(
    booking
) {

    const total =
        getPackagePrice(
            booking
        );


    const plan =
        resolvePaymentPlan(
            booking
        );


    const source =
        booking.paymentDetails &&
        typeof booking.paymentDetails === "object"
            ? booking.paymentDetails
            : null;


    let schedule =
        source &&
        Array.isArray(
            source.schedule
        ) &&
        source.schedule.length
            ? source.schedule.map(
                function (item, index) {

                    return {

                        id:
                            item.id ||
                            "payment-" +
                            (index + 1),

                        name:
                            item.name ||
                            "Payment " +
                            (index + 1),

                        amount:
                            parseMoney(
                                item.amount
                            ),

                        dueTiming:
                            item.dueTiming ||
                            "Before session",

                        status:
                            item.status ||
                            "pending"

                    };

                }
            )
            : buildPaymentSchedule(
                plan,
                total
            );


    let paid =
        source
        ? parseMoney(
            source.paidAmount
        )
        : 0;


    /*
        Legacy payment values are not
        treated as actual money because
        older records may contain strings
        such as "Pending".
    */

    if (
        !source &&
        typeof booking.payment === "number"
    ) {

        paid =
            parseMoney(
                booking.payment
            );

    }


    paid =
        Math.max(
            0,
            Math.min(
                paid,
                total
            )
        );


    let remaining =
        roundMoney(
            Math.max(
                0,
                total - paid
            )
        );


    /*
        Allocate the paid amount across
        the schedule.
    */

    let remainingPaid =
        paid;


    schedule =
        schedule.map(
            function (stage) {

                const amount =
                    parseMoney(
                        stage.amount
                    );


                const stagePaid =
                    roundMoney(
                        Math.min(
                            amount,
                            remainingPaid
                        )
                    );


                remainingPaid =
                    roundMoney(
                        remainingPaid -
                        stagePaid
                    );


                let status =
                    "pending";


                if (
                    stagePaid >=
                    amount &&
                    amount > 0
                ) {

                    status = "paid";

                } else if (
                    stagePaid > 0
                ) {

                    status = "partial";

                }


                return {

                    ...stage,

                    amount,

                    paidAmount:
                        stagePaid,

                    status

                };

            }
        );


    /*
        If an old paymentDetails object
        already contains explicit stage
        information, preserve useful
        transaction data.
    */

    const transactions =
        source &&
        Array.isArray(
            source.transactions
        )
            ? source.transactions
            : [];


    const firstUnpaid =
        schedule.find(
            function (stage) {

                return stage.status !== "paid";

            }
        );


    const paymentStatus =
        paid >= total && total > 0
            ? "paid"
            : paid > 0
                ? "partially_paid"
                : "pending";


    return {

        status:
            total <= 0
                ? "paid"
                : paymentStatus,

        totalAmount:
            total,

        paidAmount:
            paid,

        remainingAmount:
            remaining,

        nextPaymentAmount:
            firstUnpaid
                ? roundMoney(
                    firstUnpaid.amount -
                    firstUnpaid.paidAmount
                )
                : 0,

        nextPaymentLabel:
            firstUnpaid
                ? firstUnpaid.name
                : "Payment Complete",

        nextPaymentDue:
            firstUnpaid
                ? firstUnpaid.dueTiming
                : "",

        schedule,

        transactions

    };

}


/* =========================================================
   PAYMENT STATUS LABEL
========================================================= */

function getPaymentStatusLabel(
    payment
) {

    if (
        payment.status ===
        "paid"
    ) {
        return "Paid";
    }


    if (
        payment.status ===
        "partially_paid"
    ) {
        return "Partially Paid";
    }


    return "Pending";

}


/* =========================================================
   SYNC PAYMENT DATA
========================================================= */

function getBookingPayment(
    booking
) {

    const payment =
        normalizePaymentDetails(
            booking
        );


    return payment;

}


/* =========================================================
   BOOKING STATUS
========================================================= */

function normalizeStatus(status) {

    if (!status) {
        return "Pending";
    }


    const value =
        String(status)
            .trim()
            .toLowerCase();


    if (value === "pending") {
        return "Pending";
    }


    if (
        value === "accepted" ||
        value === "accept"
    ) {
        return "Accepted";
    }


    if (
        value === "confirmed" ||
        value === "confirm"
    ) {
        return "Confirmed";
    }


    if (
        value === "cancelled" ||
        value === "canceled" ||
        value === "rejected"
    ) {
        return "Cancelled";
    }


    if (value === "completed") {
        return "Completed";
    }


    return "Pending";

}


/* =========================================================
   REQUIRED PAYMENT
========================================================= */

function getRequiredPaymentAmount(
    payment
) {

    if (
        !payment.schedule ||
        !payment.schedule.length
    ) {
        return payment.totalAmount;
    }


    const firstStage =
        payment.schedule[0];


    return roundMoney(
        Math.max(
            0,
            firstStage.amount -
            (firstStage.paidAmount || 0)
        )
    );

}


/* =========================================================
   SHOULD CONFIRM BOOKING
========================================================= */

function hasRequiredPayment(
    payment
) {

    const required =
        payment.schedule &&
        payment.schedule.length
            ? payment.schedule[0].amount
            : payment.totalAmount;


    return (
        required <= 0 ||
        payment.paidAmount >= required
    );

}


/* =========================================================
   UPDATE BOOKING AFTER PAYMENT
========================================================= */

function updateBookingAfterPayment(
    booking,
    payment
) {

    const bookings =
        getBookings();


    const index =
        bookings.findIndex(
            function (item) {

                return String(
                    item.id
                ) === String(
                    booking.id
                );

            }
        );


    if (index === -1) {
        return false;
    }


    const updated =
        {
            ...bookings[index],

            paymentPlan:
                resolvePaymentPlan(
                    booking
                ),

            paymentDetails:
                payment,

            remaining:
                payment.remainingAmount

        };


    /*
        The booking becomes confirmed
        after the required first payment,
        not merely when the photographer
        accepts it.
    */

    if (
        normalizeStatus(
            updated.status
        ) === "Accepted" &&
        hasRequiredPayment(
            payment
        )
    ) {

        updated.status =
            "Confirmed";

    }


    bookings[index] =
        updated;


    return saveBookings(
        bookings
    );

}


/* =========================================================
   BASIC BOOKING INFORMATION
========================================================= */

function renderBookingInformation(
    booking
) {

    bookingIdElement.textContent =
        booking.id || "—";


    clientName.textContent =
        booking.client ||
        booking.clientName ||
        "—";


    serviceName.textContent =
        booking.service ||
        booking.serviceName ||
        "—";


    packageName.textContent =
        booking.package ||
        booking.packageName ||
        "—";


    packagePrice.textContent =
        formatCurrency(
            getPackagePrice(
                booking
            )
        );


    paymentPackagePrice.textContent =
        formatCurrency(
            getPackagePrice(
                booking
            )
        );


    locationElement.textContent =
        booking.location ||
        "Not provided";


    totalHours.textContent =
        booking.totalHours
            ? booking.totalHours +
              " hours"
            : "Not calculated";

}


/* =========================================================
   DATES
========================================================= */

function getBookingDates(
    booking
) {

    if (
        Array.isArray(
            booking.dates
        ) &&
        booking.dates.length
    ) {

        return booking.dates;

    }


    if (booking.date) {

        return [

            {

                date:
                    booking.date,

                startTime:
                    booking.time || "",

                endTime:
                    "",

                hours:
                    ""

            }

        ];

    }


    return [];

}


function formatDate(
    dateString
) {

    if (!dateString) {
        return "Date not available";
    }


    return dateString;

}


function renderDates(
    booking
) {

    const dates =
        getBookingDates(
            booking
        );


    dateList.innerHTML =
        "";


    if (!dates.length) {

        dateList.innerHTML =
            "<p>No session dates available.</p>";

        return;

    }


    dates.forEach(
        function (session) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "date-item";


            const main =
                document.createElement(
                    "div"
                );

            main.className =
                "date-main";


            const date =
                document.createElement(
                    "strong"
                );


            date.textContent =
                formatDate(
                    session.date
                );


            const time =
                document.createElement(
                    "span"
                );


            const start =
                session.startTime || "";


            const end =
                session.endTime || "";


            if (
                start &&
                end
            ) {

                time.textContent =
                    start +
                    " - " +
                    end;

            } else if (start) {

                time.textContent =
                    start;

            } else {

                time.textContent =
                    "Time not specified";

            }


            main.appendChild(
                date
            );

            main.appendChild(
                time
            );


            const hours =
                document.createElement(
                    "div"
                );


            hours.className =
                "date-hours";


            if (session.hours) {

                hours.textContent =
                    session.hours +
                    " hours";

            }


            item.appendChild(
                main
            );

            item.appendChild(
                hours
            );


            dateList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   BADGE
========================================================= */

function updateBadge(
    status
) {

    statusBadge.textContent =
        status;


    statusBadge.className =
        "status-badge";


    statusBadge.classList.add(
        status.toLowerCase()
    );

}


/* =========================================================
   TIMELINE RESET
========================================================= */

function resetTimeline() {

    [
        stepRequest,
        stepReview,
        stepPayment,
        stepConfirmed

    ].forEach(
        function (step) {

            step.classList.remove(
                "completed",
                "current"
            );

        }
    );


    [
        lineReview,
        linePayment,
        lineConfirmed

    ].forEach(
        function (line) {

            line.classList.remove(
                "completed"
            );

        }
    );

}


/* =========================================================
   TIMELINE
========================================================= */

function renderTimeline(
    status,
    payment
) {

    resetTimeline();


    stepRequest.classList.add(
        "completed"
    );


    /*
        PENDING
    */

    if (
        status === "Pending"
    ) {

        stepReview.classList.add(
            "current"
        );

        return;

    }


    /*
        ACCEPTED
    */

    if (
        status === "Accepted"
    ) {

        stepReview.classList.add(
            "completed"
        );

        lineReview.classList.add(
            "completed"
        );


        stepPayment.classList.add(
            "current"
        );


        return;

    }


    /*
        CONFIRMED
    */

    if (
        status === "Confirmed"
    ) {

        stepReview.classList.add(
            "completed"
        );

        lineReview.classList.add(
            "completed"
        );


        stepPayment.classList.add(
            "completed"
        );

        linePayment.classList.add(
            "completed"
        );


        stepConfirmed.classList.add(
            "completed"
        );

        lineConfirmed.classList.add(
            "completed"
        );


        return;

    }


    /*
        COMPLETED
    */

    if (
        status === "Completed"
    ) {

        stepReview.classList.add(
            "completed"
        );

        lineReview.classList.add(
            "completed"
        );


        stepPayment.classList.add(
            "completed"
        );

        linePayment.classList.add(
            "completed"
        );


        stepConfirmed.classList.add(
            "completed"
        );

        lineConfirmed.classList.add(
            "completed"
        );


        return;

    }


    /*
        CANCELLED
    */

    if (
        status === "Cancelled"
    ) {

        stepReview.classList.add(
            "current"
        );

    }

}


/* =========================================================
   PAYMENT SCHEDULE RENDER
========================================================= */

function renderPaymentSchedule(
    payment
) {

    paymentSchedule.innerHTML =
        "";


    if (
        !payment.schedule ||
        !payment.schedule.length
    ) {

        return;

    }


    payment.schedule.forEach(
        function (stage) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "payment-stage";


            let statusText =
                "Pending";


            let statusClass =
                "";


            if (
                stage.status ===
                "paid"
            ) {

                statusText =
                    "Paid";

                statusClass =
                    "paid";

            } else if (
                stage.status ===
                "partial"
            ) {

                statusText =
                    "Partially Paid";

                statusClass =
                    "partial";

            }


            row.innerHTML =

                '<div class="payment-stage-main">' +

                    '<span class="payment-stage-name">' +
                        escapeHTML(
                            stage.name
                        ) +
                    '</span>' +

                    '<span class="payment-stage-due">' +
                        escapeHTML(
                            stage.dueTiming ||
                            "Before session"
                        ) +
                    '</span>' +

                '</div>' +

                '<div class="payment-stage-right">' +

                    '<span class="payment-stage-amount">' +
                        formatCurrency(
                            stage.amount
                        ) +
                    '</span>' +

                    '<span class="payment-stage-status ' +
                        statusClass +
                    '">' +
                        statusText +
                    '</span>' +

                '</div>';


            paymentSchedule.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   PAYMENT UI
========================================================= */

function renderPayment(
    booking,
    payment
) {

    const plan =
        resolvePaymentPlan(
            booking
        );


    paymentPlanName.textContent =
        getPaymentPlanLabel(
            plan
        );


    paymentPackagePrice.textContent =
        formatCurrency(
            payment.totalAmount
        );


    paidAmount.textContent =
        formatCurrency(
            payment.paidAmount
        );


    remainingAmount.textContent =
        formatCurrency(
            payment.remainingAmount
        );


    const progress =
        payment.totalAmount > 0
            ? Math.min(
                100,
                Math.round(
                    (
                        payment.paidAmount /
                        payment.totalAmount
                    ) * 100
                )
            )
            : 100;


    paymentProgressText.textContent =
        progress + "%";


    paymentProgressFill.style.width =
        progress + "%";


    const hasNext =
        payment.nextPaymentAmount >
        0 &&
        payment.remainingAmount >
        0;


    if (hasNext) {

        nextPaymentLabel.textContent =
            "Next Payment";


        nextPaymentAmount.textContent =
            formatCurrency(
                payment.nextPaymentAmount
            );


        paymentNextTitle.textContent =
            payment.nextPaymentLabel ||
            "Next Payment";


        paymentNextDue.textContent =
            payment.nextPaymentDue ||
            "Due according to payment plan";


        payAdvanceButton.disabled =
            false;


        payAdvanceButton.textContent =
            payment.nextPaymentLabel
                ? "Proceed to " +
                  payment.nextPaymentLabel
                : "Proceed to Payment";

    } else {

        nextPaymentLabel.textContent =
            "Payment Status";


        nextPaymentAmount.textContent =
            "Paid";


        paymentNextTitle.textContent =
            "All scheduled payments completed";


        paymentNextDue.textContent =
            "No payment remaining";


        payAdvanceButton.disabled =
            true;


        payAdvanceButton.textContent =
            "Payment Complete";

    }


    renderPaymentSchedule(
        payment
    );

}


/* =========================================================
   MESSAGE
========================================================= */

function renderMessage(
    status,
    payment
) {

    paymentCard.hidden =
        true;

    cancelledCard.hidden =
        true;

    confirmedCard.hidden =
        true;


    /*
        PENDING
    */

    if (
        status === "Pending"
    ) {

        messageIcon.textContent =
            "2";


        messageLabel.textContent =
            "WAITING FOR PHOTOGRAPHER";


        messageTitle.textContent =
            "Your request is being reviewed";


        messageText.textContent =
            "Your booking request has been sent to the photographer. No payment is required at this stage.";


        return;

    }


    /*
        ACCEPTED
    */

    if (
        status === "Accepted"
    ) {

        messageIcon.textContent =
            "✓";


        messageLabel.textContent =
            "BOOKING ACCEPTED";


        messageTitle.textContent =
            "Your booking request has been accepted";


        if (
            payment.status ===
            "partially_paid"
        ) {

            messageText.textContent =
                "Your booking has been accepted and a payment has already been recorded. Complete the next payment below.";

        } else {

            messageText.textContent =
                "The photographer has accepted your request. Your required payment is now available below.";

        }


        paymentCard.hidden =
            false;


        paymentTitle.textContent =
            payment.status ===
            "partially_paid"
                ? "Continue Your Payment"
                : "Complete Your Payment";


        paymentDescription.textContent =
            "Your booking has been accepted. You can now proceed with the next payment according to the selected payment plan.";


        renderPayment(
            getCurrentBooking(),
            payment
        );


        return;

    }


    /*
        CONFIRMED
    */

    if (
        status === "Confirmed"
    ) {

        messageIcon.textContent =
            "✓";


        messageLabel.textContent =
            "BOOKING CONFIRMED";


        messageTitle.textContent =
            payment.remainingAmount > 0
                ? "Your photography session is confirmed"
                : "Your photography session is fully paid";


        messageText.textContent =
            payment.remainingAmount > 0
                ? "Your required payment has been received. Your booking is confirmed, and the remaining balance can be paid according to the payment schedule."
                : "Your booking has been fully paid and confirmed. Thank you for choosing Professional Studio.";


        confirmedCard.hidden =
            false;


        confirmedCardText.textContent =
            payment.remainingAmount > 0
                ? "Your required payment has been received and your booking is now confirmed. Remaining balance: " +
                  formatCurrency(
                      payment.remainingAmount
                  ) +
                  "."
                : "Your booking has been fully paid and your photography session is confirmed.";


        /*
            If money remains, show the payment
            section so the client can continue
            making scheduled payments.
        */

        if (
            payment.remainingAmount > 0
        ) {

            paymentCard.hidden =
                false;


            paymentTitle.textContent =
                "Remaining Payment";


            paymentDescription.textContent =
                "Your booking is confirmed. You can continue paying the remaining balance according to your payment plan.";


            renderPayment(
                getCurrentBooking(),
                payment
            );

        }


        return;

    }


    /*
        COMPLETED
    */

    if (
        status === "Completed"
    ) {

        messageIcon.textContent =
            "✓";


        messageLabel.textContent =
            "SESSION COMPLETED";


        messageTitle.textContent =
            "Your photography session has been completed";


        messageText.textContent =
            payment.remainingAmount > 0
                ? "The session has been marked completed. Remaining balance: " +
                  formatCurrency(
                      payment.remainingAmount
                  ) +
                  "."
                : "The session has been completed and all recorded payments are settled.";


        confirmedCard.hidden =
            false;


        confirmedCardText.textContent =
            "This booking has been completed.";


        if (
            payment.remainingAmount > 0
        ) {

            paymentCard.hidden =
                false;


            paymentTitle.textContent =
                "Remaining Balance";


            paymentDescription.textContent =
                "There is still a remaining balance associated with this booking.";


            renderPayment(
                getCurrentBooking(),
                payment
            );

        }


        return;

    }


    /*
        CANCELLED
    */

    if (
        status === "Cancelled"
    ) {

        messageIcon.textContent =
            "×";


        messageLabel.textContent =
            "BOOKING NOT ACCEPTED";


        messageTitle.textContent =
            "This booking request was not accepted";


        messageText.textContent =
            "No payment is required for this booking.";


        cancelledCard.hidden =
            false;

    }

}


/* =========================================================
   TIMELINE TEXT
========================================================= */

function renderTimelineText(
    status,
    payment
) {

    if (
        status === "Pending"
    ) {

        reviewText.textContent =
            "Waiting for the photographer to review your request.";


        paymentText.textContent =
            "Payment becomes available after approval.";


        confirmedText.textContent =
            "Your session will be confirmed after the required payment.";


        return;

    }


    if (
        status === "Accepted"
    ) {

        reviewText.textContent =
            "The photographer has accepted your booking request.";


        paymentText.textContent =
            payment.nextPaymentAmount > 0
                ? "Your " +
                  (
                    payment.nextPaymentLabel ||
                    "payment"
                  ) +
                  " is now available."
                : "Your required payment has been completed.";


        confirmedText.textContent =
            "Your booking will be confirmed after the required payment.";


        return;

    }


    if (
        status === "Confirmed"
    ) {

        reviewText.textContent =
            "Your booking request was accepted.";


        paymentText.textContent =
            payment.remainingAmount > 0
                ? "Required payment received. Remaining balance: " +
                  formatCurrency(
                      payment.remainingAmount
                  ) +
                  "."
                : "All scheduled payments have been received.";


        confirmedText.textContent =
            "Your photography session is confirmed.";


        return;

    }


    if (
        status === "Completed"
    ) {

        reviewText.textContent =
            "Your booking request was accepted.";


        paymentText.textContent =
            payment.remainingAmount > 0
                ? "Session completed. Remaining balance: " +
                  formatCurrency(
                      payment.remainingAmount
                  ) +
                  "."
                : "Payment schedule completed.";


        confirmedText.textContent =
            "Your photography session has been completed.";


        return;

    }


    if (
        status === "Cancelled"
    ) {

        reviewText.textContent =
            "The booking request was not accepted.";


        paymentText.textContent =
            "No payment is required.";


        confirmedText.textContent =
            "This booking is closed.";

    }

}


/* =========================================================
   RENDER BOOKING
========================================================= */

function renderBooking(
    booking
) {

    const status =
        normalizeStatus(
            booking.status
        );


    const payment =
        getBookingPayment(
            booking
        );


    /*
        If an Accepted booking has already
        received the required payment,
        promote it to Confirmed.
    */

    if (
        status === "Accepted" &&
        hasRequiredPayment(
            payment
        )
    ) {

        updateBookingAfterPayment(
            booking,
            payment
        );


        booking =
            getCurrentBooking() ||
            booking;

    }


    const currentStatus =
        normalizeStatus(
            booking.status
        );


    renderBookingInformation(
        booking
    );


    renderDates(
        booking
    );


    updateBadge(
        currentStatus
    );


    renderTimeline(
        currentStatus,
        payment
    );


    renderTimelineText(
        currentStatus,
        payment
    );


    renderMessage(
        currentStatus,
        payment
    );

}


/* =========================================================
   LOAD
========================================================= */

function loadBooking() {

    const booking =
        getCurrentBooking();


    if (!booking) {

        bookingContent.hidden =
            true;


        errorCard.hidden =
            false;


        if (!bookingId) {

            errorMessage.textContent =
                "No booking ID was provided.";

        } else {

            errorMessage.textContent =
                "We could not find booking " +
                bookingId +
                ".";

        }


        return;

    }


    errorCard.hidden =
        true;


    bookingContent.hidden =
        false;


    renderBooking(
        booking
    );

}


/* =========================================================
   DEMO PAYMENT
========================================================= */

function processDemoPayment() {

    const booking =
        getCurrentBooking();


    if (!booking) {
        return;
    }


    const payment =
        getBookingPayment(
            booking
        );


    const amount =
        payment.nextPaymentAmount;


    if (
        amount <= 0
    ) {
        return;
    }


    /*
        This is intentionally a FRONTEND
        test payment flow.

        It does not connect to a real
        payment gateway.

        The production gateway can later
        replace this function without
        changing the payment-plan system.
    */

    const confirmed =
        window.confirm(
            "Proceed with a test payment of " +
            formatCurrency(
                amount
            ) +
            "?"
        );


    if (!confirmed) {
        return;
    }


    const newPaidAmount =
        Math.min(
            payment.totalAmount,
            roundMoney(
                payment.paidAmount +
                amount
            )
        );


    const updatedPayment = {

        ...payment,

        paidAmount:
            newPaidAmount,

        remainingAmount:
            roundMoney(
                payment.totalAmount -
                newPaidAmount
            )

    };


    const normalizedPayment =
        normalizePaymentDetails(
            {
                ...booking,

                paymentDetails:
                    updatedPayment
            }
        );


    normalizedPayment.transactions =
        Array.isArray(
            payment.transactions
        )
            ? [
                ...payment.transactions,

                {

                    id:
                        "txn-" +
                        Date.now(),

                    amount,

                    status:
                        "paid",

                    createdAt:
                        new Date()
                            .toISOString()

                }

            ]
            : [

                {

                    id:
                        "txn-" +
                        Date.now(),

                    amount,

                    status:
                        "paid",

                    createdAt:
                        new Date()
                            .toISOString()

                }

            ];


    const success =
        updateBookingAfterPayment(
            booking,
            normalizedPayment
        );


    if (success) {

        loadBooking();

    }

}


/* =========================================================
   PAYMENT BUTTON
========================================================= */

payAdvanceButton.addEventListener(
    "click",
    processDemoPayment
);


/* =========================================================
   INITIAL LOAD
========================================================= */

loadBooking();


/* =========================================================
   AUTO REFRESH
========================================================= */

setInterval(
    function () {

        const booking =
            getCurrentBooking();


        if (booking) {

            renderBooking(
                booking
            );

        }

    },
    3000
);


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            BOOKING_STORAGE_KEY
        ) {

            loadBooking();

        }

    }
);