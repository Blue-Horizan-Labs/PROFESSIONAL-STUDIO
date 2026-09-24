
/* =========================================================
   PROFESSIONAL STUDIO
   PUBLIC PHOTOGRAPHER PROFILE
   FRONTEND JAVASCRIPT
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

var SERVICES_STORAGE_KEY =
    "professionalStudio.services";

var EQUIPMENT_STORAGE_KEY =
    "professionalStudio.equipment";

var PROFILE_STORAGE_KEY =
    "professionalStudio.profile";


/* =========================================================
   SAFE JSON READER
========================================================= */

function readClientLocalStorage(
    key,
    fallback
) {

    var saved =
        localStorage.getItem(key);


    if (!saved) {
        return fallback;
    }


    try {

        return JSON.parse(saved);

    } catch (error) {

        return fallback;

    }

}

/* =========================================================
   REVIEWS
========================================================= */

var REVIEWS_STORAGE_KEY =
    "professionalStudio.reviews";


/* =========================================================
   GET STORED REVIEWS
========================================================= */

function getClientReviews() {

    var reviews =
        readClientLocalStorage(
            REVIEWS_STORAGE_KEY,
            []
        );


    /*
       Support both:

       [
           {...},
           {...}
       ]

       and:

       {
           reviews: [...]
       }
    */

    if (
        reviews &&
        typeof reviews === "object" &&
        !Array.isArray(reviews) &&
        Array.isArray(reviews.reviews)
    ) {

        reviews =
            reviews.reviews;

    }


    if (
        !Array.isArray(reviews)
    ) {

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


/* =========================================================
   SAVE REVIEWS
========================================================= */

function saveClientReviews(
    reviews
) {

    try {

        localStorage.setItem(
            REVIEWS_STORAGE_KEY,
            JSON.stringify(
                reviews
            )
        );

        return true;

    }
    catch (error) {

        console.error(
            "Could not save reviews:",
            error
        );

        return false;

    }

}


/* =========================================================
   NORMALIZE REVIEW EMAIL
========================================================= */

function normalizeReviewEmail(
    email
) {

    return String(
        email || ""
    )
    .trim()
    .toLowerCase();

}


/* =========================================================
   CHECK WHETHER EMAIL ALREADY REVIEWED
========================================================= */

function hasClientAlreadyReviewed(
    email
) {

    var normalizedEmail =
        normalizeReviewEmail(
            email
        );


    if (!normalizedEmail) {

        return false;

    }


    var reviews =
        getClientReviews();


    return reviews.some(
        function(review) {

            return (
                normalizeReviewEmail(
                    review.email ||
                    review.clientEmail ||
                    ""
                ) === normalizedEmail
            );

        }
    );

}


/* =========================================================
   GENERATE REVIEW ID
========================================================= */

function generateReviewId() {

    return (
        "review-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );

}


/* =========================================================
   FORMAT REVIEW DATE
========================================================= */

function formatClientReviewDate(
    value
) {

    if (!value) {

        return "";

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

        return "";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   CREATE REVIEW STARS
========================================================= */

function createReviewStars(
    rating
) {

    var wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "review-card-rating";


    var safeRating =
        Number(
            rating
        );


    if (
        !Number.isFinite(
            safeRating
        )
    ) {

        safeRating = 0;

    }


    safeRating =
        Math.max(
            0,
            Math.min(
                5,
                Math.round(
                    safeRating
                )
            )
        );


    for (
        var i = 1;
        i <= 5;
        i++
    ) {

        var star =
            document.createElement(
                "i"
            );


        star.className =
            i <= safeRating
                ? "fa-solid fa-star"
                : "fa-regular fa-star";


        star.setAttribute(
            "aria-hidden",
            "true"
        );


        wrapper.appendChild(
            star
        );

    }


    return wrapper;

}


/* =========================================================
   CREATE REVIEW CARD
========================================================= */

function createClientReviewCard(
    review
) {

    var card =
        document.createElement(
            "article"
        );


    card.className =
        "review-card";


    var header =
        document.createElement(
            "div"
        );


    header.className =
        "review-card-header";


    var author =
        document.createElement(
            "div"
        );


    author.className =
        "review-author";


    var authorName =
        document.createElement(
            "h3"
        );


    authorName.className =
        "review-author-name";


    authorName.textContent =
        review.clientName ||
        review.name ||
        "Client";


    author.appendChild(
        authorName
    );


    var serviceName =
        review.service ||
        review.serviceName ||
        "";


    if (serviceName) {

        var service =
            document.createElement(
                "span"
            );


        service.className =
            "review-service";


        service.textContent =
            serviceName;


        author.appendChild(
            service
        );

    }


    header.appendChild(
        author
    );


    header.appendChild(
        createReviewStars(
            review.rating
        )
    );


    var reviewText =
        document.createElement(
            "p"
        );


    reviewText.className =
        "review-card-text";


    reviewText.textContent =
        review.review ||
        review.text ||
        review.comment ||
        "";


    card.appendChild(
        header
    );


    card.appendChild(
        reviewText
    );


    var date =
        formatClientReviewDate(
            review.createdAt ||
            review.date
        );


    if (date) {

        var dateElement =
            document.createElement(
                "div"
            );


        dateElement.className =
            "review-date";


        dateElement.textContent =
            date;


        card.appendChild(
            dateElement
        );

    }


    return card;

}


/* =========================================================
   CALCULATE AVERAGE RATING
========================================================= */

function getClientAverageRating(
    reviews
) {

    if (
        !reviews.length
    ) {

        return 0;

    }


    var total =
        0;


    var validRatings =
        0;


    reviews.forEach(
        function(review) {

            var rating =
                Number(
                    review.rating
                );


            if (
                Number.isFinite(
                    rating
                ) &&
                rating >= 1 &&
                rating <= 5
            ) {

                total += rating;

                validRatings++;

            }

        }
    );


    if (!validRatings) {

        return 0;

    }


    return total /
        validRatings;

}


/* =========================================================
   RENDER AVERAGE STARS
========================================================= */

function renderClientAverageStars(
    rating
) {

    var container =
        document.getElementById(
            "reviewsAverageStars"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    var roundedRating =
        Math.round(
            rating
        );


    for (
        var i = 1;
        i <= 5;
        i++
    ) {

        var star =
            document.createElement(
                "i"
            );


        star.className =
            i <= roundedRating
                ? "fa-solid fa-star"
                : "fa-regular fa-star";


        star.setAttribute(
            "aria-hidden",
            "true"
        );


        container.appendChild(
            star
        );

    }

}


/* =========================================================
   RENDER REVIEWS
========================================================= */

function renderClientReviews() {

    var list =
        document.getElementById(
            "reviewsList"
        );


    if (!list) {

        return;

    }


    var emptyState =
        document.getElementById(
            "reviewsEmptyState"
        );


    var averageElement =
        document.getElementById(
            "reviewsAverageRating"
        );


    var countElement =
        document.getElementById(
            "reviewsCount"
        );


    var reviews =
        getClientReviews();


    list.innerHTML =
        "";


    var average =
        getClientAverageRating(
            reviews
        );


    if (averageElement) {

        averageElement.textContent =
            average.toFixed(1);

    }


    renderClientAverageStars(
        average
    );


    if (countElement) {

        if (!reviews.length) {

            countElement.textContent =
                "No reviews yet";

        }
        else {

            countElement.textContent =
                reviews.length +
                (
                    reviews.length === 1
                        ? " client review"
                        : " client reviews"
                );

        }

    }


    if (!reviews.length) {

        if (emptyState) {

            emptyState.hidden =
                false;

        }

        return;

    }


    if (emptyState) {

        emptyState.hidden =
            true;

    }


    /*
       Newest reviews appear first.
    */

    reviews
        .slice()
        .sort(
            function(a, b) {

                var dateA =
                    new Date(
                        a.createdAt ||
                        a.date ||
                        0
                    ).getTime();


                var dateB =
                    new Date(
                        b.createdAt ||
                        b.date ||
                        0
                    ).getTime();


                return dateB - dateA;

            }
        )
        .forEach(
            function(review) {

                list.appendChild(
                    createClientReviewCard(
                        review
                    )
                );

            }
        );

}


/* =========================================================
   REVIEW MODAL ELEMENTS
========================================================= */

function getReviewModalElements() {

    return {

        modal:
            document.getElementById(
                "reviewModal"
            ),

        form:
            document.getElementById(
                "reviewForm"
            ),

        alreadySubmitted:
            document.getElementById(
                "reviewAlreadySubmitted"
            ),

        openButton:
            document.getElementById(
                "openReviewModalBtn"
            ),

        closeButton:
            document.getElementById(
                "closeReviewModalBtn"
            ),

        nameInput:
            document.getElementById(
                "reviewClientName"
            ),

        emailInput:
            document.getElementById(
                "reviewClientEmail"
            ),

        ratingInput:
            document.getElementById(
                "reviewRatingValue"
            ),

        reviewInput:
            document.getElementById(
                "reviewText"
            ),

        submitButton:
            document.getElementById(
                "submitReviewBtn"
            ),

        message:
            document.getElementById(
                "reviewFormMessage"
            ),

        characterCount:
            document.getElementById(
                "reviewCharacterCount"
            )

    };

}


/* =========================================================
   RESET REVIEW FORM
========================================================= */

function resetReviewForm() {

    var elements =
        getReviewModalElements();


    if (!elements.form) {

        return;

    }


    elements.form.reset();


    if (elements.ratingInput) {

        elements.ratingInput.value =
            "";

    }


    document
        .querySelectorAll(
            ".rating-star"
        )
        .forEach(
            function(star) {

                star.classList.remove(
                    "selected"
                );

                star
                    .setAttribute(
                        "aria-checked",
                        "false"
                    );

                var icon =
                    star.querySelector(
                        "i"
                    );


                if (icon) {

                    icon.className =
                        "fa-regular fa-star";

                }

            }
        );


    document
        .querySelectorAll(
            ".review-field-error"
        )
        .forEach(
            function(errorElement) {

                errorElement.textContent =
                    "";

            }
        );


    document
        .querySelectorAll(
            ".review-form-group input.invalid, .review-form-group textarea.invalid"
        )
        .forEach(
            function(element) {

                element.classList.remove(
                    "invalid"
                );

            }
        );


    if (elements.message) {

        elements.message.hidden =
            true;

        elements.message.textContent =
            "";

        elements.message.className =
            "review-form-message";

    }


    if (elements.characterCount) {

        elements.characterCount.textContent =
            "0 / 1000";

    }


    if (elements.alreadySubmitted) {

        elements.alreadySubmitted.hidden =
            true;

    }


    if (elements.form) {

        elements.form.hidden =
            false;

    }

}


/* =========================================================
   OPEN REVIEW MODAL
========================================================= */

function openClientReviewModal() {

    var elements =
        getReviewModalElements();


    if (!elements.modal) {

        return;

    }


    resetReviewForm();


    elements.modal.hidden =
        false;


    elements.modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "review-modal-open"
    );


    /*
       If this browser has already submitted
       a review, show the already-submitted state.
    */

    var rememberedEmail =
        localStorage.getItem(
            "professionalStudio.reviewEmail"
        );


    if (
        rememberedEmail &&
        hasClientAlreadyReviewed(
            rememberedEmail
        )
    ) {

        showAlreadySubmittedState();

    }
    else if (
        elements.nameInput
    ) {

        setTimeout(
            function() {

                elements.nameInput.focus();

            },
            50
        );

    }

}


/* =========================================================
   CLOSE REVIEW MODAL
========================================================= */

function closeClientReviewModal() {

    var elements =
        getReviewModalElements();


    if (!elements.modal) {

        return;

    }


    elements.modal.hidden =
        true;


    elements.modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "review-modal-open"
    );

}


/* =========================================================
   SHOW ALREADY SUBMITTED STATE
========================================================= */

function showAlreadySubmittedState() {

    var elements =
        getReviewModalElements();


    if (
        !elements.form ||
        !elements.alreadySubmitted
    ) {

        return;

    }


    elements.form.hidden =
        true;


    elements.alreadySubmitted.hidden =
        false;

}


/* =========================================================
   RATING SELECTION
========================================================= */

function setClientReviewRating(
    rating
) {

    var elements =
        getReviewModalElements();


    var safeRating =
        Number(
            rating
        );


    if (
        !Number.isInteger(
            safeRating
        ) ||
        safeRating < 1 ||
        safeRating > 5
    ) {

        return;

    }


    if (elements.ratingInput) {

        elements.ratingInput.value =
            String(
                safeRating
            );

    }


    document
        .querySelectorAll(
            ".rating-star"
        )
        .forEach(
            function(star) {

                var starRating =
                    Number(
                        star.dataset.rating
                    );


                var selected =
                    starRating <= safeRating;


                star.classList.toggle(
                    "selected",
                    selected
                );


                star.setAttribute(
                    "aria-checked",
                    starRating === safeRating
                        ? "true"
                        : "false"
                );


                var icon =
                    star.querySelector(
                        "i"
                    );


                if (icon) {

                    icon.className =
                        selected
                            ? "fa-solid fa-star"
                            : "fa-regular fa-star";

                }

            }
        );

}


/* =========================================================
   REVIEW FORM MESSAGE
========================================================= */

function showReviewFormMessage(
    message,
    type
) {

    var messageElement =
        document.getElementById(
            "reviewFormMessage"
        );


    if (!messageElement) {

        return;

    }


    messageElement.textContent =
        message;


    messageElement.className =
        "review-form-message " +
        (
            type === "success"
                ? "success"
                : "error"
        );


    messageElement.hidden =
        false;

}


/* =========================================================
   REVIEW VALIDATION
========================================================= */

function validateClientReviewForm() {

    var elements =
        getReviewModalElements();


    var valid =
        true;


    var name =
        elements.nameInput
            ? elements.nameInput.value.trim()
            : "";


    var email =
        elements.emailInput
            ? normalizeReviewEmail(
                elements.emailInput.value
            )
            : "";


    var rating =
        elements.ratingInput
            ? Number(
                elements.ratingInput.value
            )
            : 0;


    var reviewText =
        elements.reviewInput
            ? elements.reviewInput.value.trim()
            : "";


    var nameError =
        document.getElementById(
            "reviewClientNameError"
        );


    var emailError =
        document.getElementById(
            "reviewClientEmailError"
        );


    var ratingError =
        document.getElementById(
            "reviewRatingError"
        );


    var reviewError =
        document.getElementById(
            "reviewTextError"
        );


    [
        elements.nameInput,
        elements.emailInput,
        elements.reviewInput
    ]
    .forEach(
        function(element) {

            if (element) {

                element.classList.remove(
                    "invalid"
                );

            }

        }
    );


    if (nameError) {

        nameError.textContent =
            "";

    }


    if (emailError) {

        emailError.textContent =
            "";

    }


    if (ratingError) {

        ratingError.textContent =
            "";

    }


    if (reviewError) {

        reviewError.textContent =
            "";

    }


    if (
        name.length < 2
    ) {

        valid =
            false;


        if (elements.nameInput) {

            elements.nameInput.classList.add(
                "invalid"
            );

        }


        if (nameError) {

            nameError.textContent =
                "Please enter your name.";

        }

    }


    var emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            email
        )
    ) {

        valid =
            false;


        if (elements.emailInput) {

            elements.emailInput.classList.add(
                "invalid"
            );

        }


        if (emailError) {

            emailError.textContent =
                "Please enter a valid email address.";

        }

    }


    if (
        !Number.isInteger(
            rating
        ) ||
        rating < 1 ||
        rating > 5
    ) {

        valid =
            false;


        if (ratingError) {

            ratingError.textContent =
                "Please select a rating.";

        }

    }


    if (
        reviewText.length < 10
    ) {

        valid =
            false;


        if (elements.reviewInput) {

            elements.reviewInput.classList.add(
                "invalid"
            );

        }


        if (reviewError) {

            reviewError.textContent =
                "Please write at least 10 characters.";

        }

    }


    if (
        reviewText.length > 1000
    ) {

        valid =
            false;


        if (elements.reviewInput) {

            elements.reviewInput.classList.add(
                "invalid"
            );

        }


        if (reviewError) {

            reviewError.textContent =
                "Your review cannot exceed 1000 characters.";

        }

    }


    /*
       Important duplicate check.

       This happens before the review is written.
    */

    if (
        valid &&
        hasClientAlreadyReviewed(
            email
        )
    ) {

        valid =
            false;


        if (emailError) {

            emailError.textContent =
                "A review has already been submitted using this email.";

        }


        if (elements.emailInput) {

            elements.emailInput.classList.add(
                "invalid"
            );

        }

    }


    return {

        valid: valid,

        name: name,

        email: email,

        rating: rating,

        review: reviewText

    };

}


/* =========================================================
   SUBMIT REVIEW
========================================================= */

function submitClientReview(
    event
) {

    event.preventDefault();


    var elements =
        getReviewModalElements();


    var result =
        validateClientReviewForm();


    if (!result.valid) {

        return;

    }


    if (elements.submitButton) {

        elements.submitButton.disabled =
            true;

        elements.submitButton.textContent =
            "Submitting...";

    }


    /*
       Create the review object.

       This structure is intentionally compatible
       with the Dashboard review renderer.
    */

    var review =
        {

            id:
                generateReviewId(),

            clientName:
                result.name,

            email:
                result.email,

            rating:
                result.rating,

            review:
                result.review,

            service:
                "",

            createdAt:
                new Date().toISOString()

        };


    var reviews =
        getClientReviews();


    /*
       Final duplicate check immediately before
       writing to storage.
    */

    if (
        hasClientAlreadyReviewed(
            result.email
        )
    ) {

        if (elements.submitButton) {

            elements.submitButton.disabled =
                false;

            elements.submitButton.textContent =
                "Submit Review";

        }


        showAlreadySubmittedState();

        return;

    }


    reviews.push(
        review
    );


    var saved =
        saveClientReviews(
            reviews
        );


    if (!saved) {

        if (elements.submitButton) {

            elements.submitButton.disabled =
                false;

            elements.submitButton.textContent =
                "Submit Review";

        }


        showReviewFormMessage(
            "The review could not be saved. Please try again.",
            "error"
        );

        return;

    }


    /*
       Remember the email locally so the same browser
       immediately knows this client has already reviewed.
    */

    try {

        localStorage.setItem(
            "professionalStudio.reviewEmail",
            result.email
        );

    }
    catch (error) {

        console.warn(
            "Could not remember review email:",
            error
        );

    }


    renderClientReviews();


    /*
       Tell other Professional Studio modules in this
       same page/application that reviews changed.
    */

    window.dispatchEvent(
        new CustomEvent(
            "professionalStudioReviewsUpdated"
        )
    );


    if (elements.submitButton) {

        elements.submitButton.disabled =
            false;

        elements.submitButton.textContent =
            "Submit Review";

    }


    if (elements.form) {

        elements.form.hidden =
            true;

    }


    if (elements.alreadySubmitted) {

        elements.alreadySubmitted.hidden =
            true;

    }


    showReviewFormMessage(
        "Your review has been submitted successfully.",
        "success"
    );


    /*
       Show the success message briefly, then close
       the modal and show the already-submitted state
       next time the client opens it.
    */

    setTimeout(
        function() {

            closeClientReviewModal();

        },
        1400
    );

}


/* =========================================================
   REVIEW CHARACTER COUNTER
========================================================= */

function initializeReviewCharacterCounter() {

    var input =
        document.getElementById(
            "reviewText"
        );


    var counter =
        document.getElementById(
            "reviewCharacterCount"
        );


    if (
        !input ||
        !counter
    ) {

        return;

    }


    function updateCounter() {

        counter.textContent =
            input.value.length +
            " / 1000";

    }


    updateCounter();


    input.addEventListener(
        "input",
        updateCounter
    );

}


/* =========================================================
   REVIEW MODAL
========================================================= */

function initializeReviewSystem() {

    var elements =
        getReviewModalElements();


    if (
        !elements.modal ||
        !elements.form
    ) {

        return;

    }


    if (elements.openButton) {

        elements.openButton.addEventListener(
            "click",
            openClientReviewModal
        );

    }


    if (elements.closeButton) {

        elements.closeButton.addEventListener(
            "click",
            closeClientReviewModal
        );

    }


    document
        .querySelectorAll(
            "[data-close-review-modal]"
        )
        .forEach(
            function(element) {

                element.addEventListener(
                    "click",
                    closeClientReviewModal
                );

            }
        );


    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape" &&
                !elements.modal.hidden
            ) {

                closeClientReviewModal();

            }

        }
    );


    document
        .querySelectorAll(
            ".rating-star"
        )
        .forEach(
            function(star) {

                star.addEventListener(
                    "click",
                    function() {

                        setClientReviewRating(
                            star.dataset.rating
                        );

                    }
                );


                star.addEventListener(
                    "keydown",
                    function(event) {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            event.preventDefault();

                            setClientReviewRating(
                                star.dataset.rating
                            );

                        }

                    }
                );

            }
        );


    elements.form.addEventListener(
        "submit",
        submitClientReview
    );


    /*
       If the client enters an email that has already
       reviewed, show the existing-review state before
       submission.
    */

    if (elements.emailInput) {

        elements.emailInput.addEventListener(
            "blur",
            function() {

                var email =
                    normalizeReviewEmail(
                        elements.emailInput.value
                    );


                if (
                    email &&
                    hasClientAlreadyReviewed(
                        email
                    )
                ) {

                    showAlreadySubmittedState();

                }

            }
        );

    }


    initializeReviewCharacterCounter();


    renderClientReviews();

}


/* =========================================================
   REVIEW STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            REVIEWS_STORAGE_KEY
        ) {

            renderClientReviews();

        }

    }
);


/* =========================================================
   SAME-PAGE REVIEW UPDATE EVENT
========================================================= */

window.addEventListener(
    "professionalStudioReviewsUpdated",
    function() {

        renderClientReviews();

    }
);

/* =========================================================
   PROFILE
========================================================= */

function getClientProfile() {

    var profile =
        readClientLocalStorage(
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


    var name =
        localStorage.getItem(
            "photographerName"
        );


    if (
        name &&
        name.trim()
    ) {

        return {
            name: name.trim()
        };

    }


    return {};

}


/* =========================================================
   PROFILE VALUE HELPER
========================================================= */

function getProfileValue(
    profile,
    keys,
    fallback
) {

    if (
        !profile ||
        typeof profile !== "object"
    ) {

        return fallback || "";

    }


    for (
        var i = 0;
        i < keys.length;
        i++
    ) {

        var value =
            profile[keys[i]];


        if (
            typeof value === "string" &&
            value.trim()
        ) {

            return value.trim();

        }


        if (
            typeof value === "number"
        ) {

            return String(
                value
            );

        }

    }


    return fallback || "";

}


/* =========================================================
   PROFILE NAME
========================================================= */

function getClientPhotographerName() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "name",
            "fullName",
            "photographerName",
            "displayName"
        ],
        "Photographer"
    );

}


/* =========================================================
   PROFILE STUDIO NAME
========================================================= */

function getClientStudioName() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "studioName",
            "businessName",
            "companyName",
            "brandName"
        ],
        ""
    );

}


/* =========================================================
   PROFILE ABOUT
========================================================= */

function getClientAbout() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "about",
            "aboutMe",
            "bio",
            "description",
            "profileDescription"
        ],
        ""
    );

}


/* =========================================================
   PROFILE LOCATION
========================================================= */

function getClientLocation() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "location",
            "city",
            "address",
            "locationName"
        ],
        ""
    );

}


/* =========================================================
   PROFILE PHONE
========================================================= */

function getClientPhone() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "phone",
            "phoneNumber",
            "mobile",
            "contactNumber"
        ],
        ""
    );

}


/* =========================================================
   PROFILE EMAIL
========================================================= */

function getClientEmail() {

    var profile =
        getClientProfile();


    return getProfileValue(
        profile,
        [
            "email",
            "emailAddress",
            "contactEmail"
        ],
        ""
    );

}


/* =========================================================
   PROFILE SOCIAL LINKS
========================================================= */

function getClientSocialLinks() {

    var profile =
        getClientProfile();


    var social =
        profile.social ||
        profile.socialLinks ||
        profile.socialMedia ||
        {};


    if (
        !social ||
        typeof social !== "object"
    ) {

        social = {};

    }


    return {

        instagram:
            getProfileValue(
                social,
                [
                    "instagram",
                    "instagramUrl"
                ],
                ""
            ),

        facebook:
            getProfileValue(
                social,
                [
                    "facebook",
                    "facebookUrl"
                ],
                ""
            ),

        youtube:
            getProfileValue(
                social,
                [
                    "youtube",
                    "youtubeUrl"
                ],
                ""
            )

    };

}


/* =========================================================
   SAFE URL
========================================================= */

function getSafeProfileUrl(
    value
) {

    if (
        typeof value !== "string"
    ) {

        return "";

    }


    var url =
        value.trim();


    if (!url) {
        return "";
    }


    if (
        url.indexOf("https://") === 0 ||
        url.indexOf("http://") === 0
    ) {

        return url;

    }


    return "";

}


/* =========================================================
   PROFILE ELEMENT HELPER
========================================================= */

function setProfileText(
    selector,
    value
) {

    if (!value) {
        return;
    }


    var element =
        document.querySelector(
            selector
        );


    if (!element) {
        return;
    }


    element.textContent =
        value;

}


/* =========================================================
   PROFILE DATA ATTRIBUTES
========================================================= */

function renderProfileDataAttributes() {

    var profile =
        getClientProfile();


    document
        .querySelectorAll(
            "[data-profile-field]"
        )
        .forEach(
            function(element) {

                var field =
                    element.dataset.profileField;


                if (!field) {
                    return;
                }


                var value =
                    getProfileValue(
                        profile,
                        [
                            field
                        ],
                        ""
                    );


                if (!value) {
                    return;
                }


                element.textContent =
                    value;

            }
        );

}


/* =========================================================
   PHOTOGRAPHER NAME
========================================================= */

function renderClientPhotographerName() {

    var name =
        getClientPhotographerName();


    document
        .querySelectorAll(
            "[data-profile-name], #profileName, #photographerName"
        )
        .forEach(
            function(element) {

                element.textContent =
                    name;

            }
        );


    var heroName =
        document.querySelector(
            ".hero-content [data-profile-name]"
        );


    if (heroName) {

        heroName.textContent =
            name;

    }

}


/* =========================================================
   STUDIO NAME
========================================================= */

function renderClientStudioName() {

    var studioName =
        getClientStudioName();


    if (!studioName) {
        return;
    }


    document
        .querySelectorAll(
            "[data-profile-studio], #studioName, #photographerStudio"
        )
        .forEach(
            function(element) {

                element.textContent =
                    studioName;

            }
        );

}


/* =========================================================
   ABOUT
========================================================= */

function renderClientAbout() {

    var about =
        getClientAbout();


    if (!about) {
        return;
    }


    document
        .querySelectorAll(
            "[data-profile-about], #profileAbout, #aboutText"
        )
        .forEach(
            function(element) {

                element.textContent =
                    about;

            }
        );

}


/* =========================================================
   CONTACT INFORMATION
========================================================= */

function renderClientContact() {

    var phone =
        getClientPhone();


    var email =
        getClientEmail();


    var location =
        getClientLocation();


    document
        .querySelectorAll(
            "[data-profile-phone], #profilePhone"
        )
        .forEach(
            function(element) {

                if (phone) {

                    element.textContent =
                        phone;

                }

            }
        );


    document
        .querySelectorAll(
            "[data-profile-email], #profileEmail"
        )
        .forEach(
            function(element) {

                if (email) {

                    element.textContent =
                        email;

                }

            }
        );


    document
        .querySelectorAll(
            "[data-profile-location], #profileLocation"
        )
        .forEach(
            function(element) {

                if (location) {

                    element.textContent =
                        location;

                }

            }
        );

}


/* =========================================================
   SOCIAL LINKS
========================================================= */

function renderClientSocialLinks() {

    var social =
        getClientSocialLinks();


    var links = {

        instagram:
            getSafeProfileUrl(
                social.instagram
            ),

        facebook:
            getSafeProfileUrl(
                social.facebook
            ),

        youtube:
            getSafeProfileUrl(
                social.youtube
            )

    };


    document
        .querySelectorAll(
            "[data-social='instagram']"
        )
        .forEach(
            function(element) {

                if (links.instagram) {

                    element.href =
                        links.instagram;

                    element.target =
                        "_blank";

                    element.rel =
                        "noopener noreferrer";

                    element.hidden =
                        false;

                } else {

                    element.hidden =
                        true;

                }

            }
        );


    document
        .querySelectorAll(
            "[data-social='facebook']"
        )
        .forEach(
            function(element) {

                if (links.facebook) {

                    element.href =
                        links.facebook;

                    element.target =
                        "_blank";

                    element.rel =
                        "noopener noreferrer";

                    element.hidden =
                        false;

                } else {

                    element.hidden =
                        true;

                }

            }
        );


    document
        .querySelectorAll(
            "[data-social='youtube']"
        )
        .forEach(
            function(element) {

                if (links.youtube) {

                    element.href =
                        links.youtube;

                    element.target =
                        "_blank";

                    element.rel =
                        "noopener noreferrer";

                    element.hidden =
                        false;

                } else {

                    element.hidden =
                        true;

                }

            }
        );

}


/* =========================================================
   PUBLIC PROFILE RENDER
========================================================= */

function renderPublicProfile() {

    renderClientPhotographerName();

    renderClientStudioName();

    renderClientAbout();

    renderClientContact();

    renderClientSocialLinks();

    renderProfileDataAttributes();

}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initializeSmoothScrolling() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(
            function(link) {

                link.addEventListener(
                    "click",
                    function(event) {

                        var targetId =
                            link.getAttribute(
                                "href"
                            );


                        if (
                            !targetId ||
                            targetId === "#"
                        ) {

                            return;

                        }


                        var target =
                            document.querySelector(
                                targetId
                            );


                        if (!target) {
                            return;
                        }


                        event.preventDefault();


                        target.scrollIntoView(
                            {
                                behavior: "smooth",
                                block: "start"
                            }
                        );

                    }
                );

            }
        );

}


/* =========================================================
   INTERSECTION OBSERVER
========================================================= */

function initializeRevealAnimations() {

    var elements =
        document.querySelectorAll(
            ".portfolio-block, .work-card, .exp-box, .contact-info"
        );


    if (
        !elements.length
    ) {

        return;

    }


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            function(element) {

                element.classList.add(
                    "visible"
                );

            }
        );

        return;

    }


    var observer =
        new IntersectionObserver(
            function(entries) {

                entries.forEach(
                    function(entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    elements.forEach(
        function(element) {

            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   EXPERIENCE METERS
========================================================= */

function initializeExperienceMeters() {

    var meters =
        document.querySelectorAll(
            ".meter-fill"
        );


    if (!meters.length) {
        return;
    }


    function animateMeter(
        element
    ) {

        var value =
            Number(
                element.dataset.value
            ) || 0;


        value =
            Math.min(
                100,
                Math.max(
                    0,
                    value
                )
            );


        element.style.width =
            value + "%";

    }


    if (
        !("IntersectionObserver" in window)
    ) {

        meters.forEach(
            animateMeter
        );

        return;

    }


    var observer =
        new IntersectionObserver(
            function(entries) {

                entries.forEach(
                    function(entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            animateMeter(
                                entry.target
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.3
            }
        );


    meters.forEach(
        function(meter) {

            observer.observe(
                meter
            );

        }
    );

}


/* =========================================================
   NAVBAR
========================================================= */

function initializeNavbar() {

    var navbar =
        document.querySelector(
            ".navbar"
        );


    if (!navbar) {
        return;
    }


    function updateNavbar() {

        if (
            window.scrollY > 20
        ) {

            navbar.classList.add(
                "scrolled"
            );

        } else {

            navbar.classList.remove(
                "scrolled"
            );

        }

    }


    updateNavbar();


    window.addEventListener(
        "scroll",
        updateNavbar,
        {
            passive: true
        }
    );

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function initializeActiveNavigation() {

    var links =
        document.querySelectorAll(
            ".navbar a[href^='#']"
        );


    if (!links.length) {
        return;
    }


    var sections = [];


    links.forEach(
        function(link) {

            var href =
                link.getAttribute(
                    "href"
                );


            if (
                !href ||
                href === "#"
            ) {

                return;

            }


            var section =
                document.querySelector(
                    href
                );


            if (section) {

                sections.push(
                    {
                        link: link,
                        section: section
                    }
                );

            }

        }
    );


    if (!sections.length) {
        return;
    }


    function updateActiveLink() {

        var current =
            null;


        sections.forEach(
            function(item) {

                var top =
                    item.section.getBoundingClientRect()
                        .top;


                if (
                    top <= 140
                ) {

                    current =
                        item;

                }

            }
        );


        links.forEach(
            function(link) {

                link.classList.remove(
                    "active"
                );

            }
        );


        if (current) {

            current.link.classList.add(
                "active"
            );

        }

    }


    updateActiveLink();


    window.addEventListener(
        "scroll",
        updateActiveLink,
        {
            passive: true
        }
    );

}


/* =========================================================
   BOOK BUTTON EFFECT
========================================================= */

function initializeBookButtons() {

    document
        .querySelectorAll(
            ".book-btn"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        button.classList.add(
                            "clicked"
                        );


                        setTimeout(
                            function() {

                                button.classList.remove(
                                    "clicked"
                                );

                            },
                            160
                        );

                    }
                );

            }
        );

}


/* =========================================================
   SERVICES
========================================================= */

function getClientServices() {

    var services =
        readClientLocalStorage(
            SERVICES_STORAGE_KEY,
            []
        );


    if (
        !Array.isArray(
            services
        )
    ) {

        return [];

    }


    return services;

}


/* =========================================================
   FORMAT SERVICE PRICE
========================================================= */

function formatServicePrice(
    value
) {

    var price =
        Number(value);


    if (
        !Number.isFinite(price)
    ) {

        return "";

    }


    return "₹" +
        price.toLocaleString(
            "en-IN"
        );

}


/* =========================================================
   GET STARTING PRICE
========================================================= */

function getStartingPrice(
    service
) {

    if (
        !service ||
        !Array.isArray(
            service.packages
        )
    ) {

        return null;

    }


    var prices =
        service.packages
            .map(
                function(pkg) {

                    return Number(
                        pkg.price
                    );

                }
            )
            .filter(
                function(price) {

                    return Number.isFinite(
                        price
                    );

                }
            );


    if (!prices.length) {

        return null;

    }


    return Math.min.apply(
        null,
        prices
    );

}


/* =========================================================
   CREATE SERVICE CARD
========================================================= */

function createServiceCard(
    service
) {

    var card =
        document.createElement(
            "article"
        );


    card.className =
        "price-card service-preview-card";


    var name =
        service.name ||
        service.serviceName ||
        service.title ||
        "Photography Service";


    var description =
        service.description ||
        service.shortDescription ||
        "";


    var startingPrice =
        getStartingPrice(
            service
        );


    var packageCount =
        Array.isArray(
            service.packages
        )
            ? service.packages.length
            : 0;


    var details =
        document.createElement(
            "div"
        );


    details.className =
        "service-preview-content";


    var heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        name;


    details.appendChild(
        heading
    );


    if (startingPrice !== null) {

        var price =
            document.createElement(
                "div"
            );


        price.className =
            "service-preview-price";


        price.textContent =
            "From " +
            formatServicePrice(
                startingPrice
            );


        details.appendChild(
            price
        );

    }


    if (description) {

        var descriptionElement =
            document.createElement(
                "p"
            );


        descriptionElement.className =
            "service-preview-description";


        descriptionElement.textContent =
            description;


        details.appendChild(
            descriptionElement
        );

    }


    var meta =
        document.createElement(
            "div"
        );


    meta.className =
        "service-preview-meta";


    if (packageCount) {

        var packages =
            document.createElement(
                "span"
            );


        packages.textContent =
            packageCount +
            (
                packageCount === 1
                    ? " Package"
                    : " Packages"
            );


        meta.appendChild(
            packages
        );

    }


    if (
        service.coverageDuration
    ) {

        var coverage =
            document.createElement(
                "span"
            );


        coverage.textContent =
            service.coverageDuration;


        meta.appendChild(
            coverage
        );

    }


    if (
        service.deliveryTime
    ) {

        var delivery =
            document.createElement(
                "span"
            );


        delivery.textContent =
            service.deliveryTime;


        meta.appendChild(
            delivery
        );

    }


    if (
        meta.children.length
    ) {

        details.appendChild(
            meta
        );

    }


    var actions =
        document.createElement(
            "div"
        );


    actions.className =
        "service-preview-actions";


    var serviceId =
        service.id ||
        service.serviceId ||
        service.slug ||
        "";


    if (serviceId) {

        var viewLink =
            document.createElement(
                "a"
            );


        viewLink.className =
            "book-btn";


        viewLink.href =
            "service.html?id=" +
            encodeURIComponent(
                serviceId
            );


        viewLink.textContent =
            "View Service";


        actions.appendChild(
            viewLink
        );


        var bookLink =
            document.createElement(
                "a"
            );


        bookLink.className =
            "book-btn";


        bookLink.href =
            "service.html?id=" +
            encodeURIComponent(
                serviceId
            ) +
            "&action=book";


        bookLink.textContent =
            "Book Service";


        actions.appendChild(
            bookLink
        );

    }


    card.appendChild(
        details
    );


    card.appendChild(
        actions
    );


    return card;

}


/* =========================================================
   SERVICE EMPTY STATE
========================================================= */

function createServiceEmptyState() {

    var empty =
        document.createElement(
            "div"
        );


    empty.className =
        "service-empty-state";


    var heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        "Services Coming Soon";


    var text =
        document.createElement(
            "p"
        );


    text.textContent =
        "Photography services will appear here once they are available.";


    empty.appendChild(
        heading
    );


    empty.appendChild(
        text
    );


    return empty;

}


/* =========================================================
   LOAD SERVICES
========================================================= */

function loadClientServices() {

    var container =
        document.getElementById(
            "servicesContainer"
        );


    if (!container) {
        return;
    }


    var services =
        getClientServices()
            .filter(
                function(service) {

                    return (
                        service &&
                        service.active !== false
                    );

                }
            );


    container.innerHTML =
        "";


    if (!services.length) {

        container.appendChild(
            createServiceEmptyState()
        );

        return;

    }


    services.forEach(
        function(service) {

            container.appendChild(
                createServiceCard(
                    service
                )
            );

        }
    );

}


/* =========================================================
   EQUIPMENT
========================================================= */

function getClientEquipment() {

    var equipment =
        readClientLocalStorage(
            EQUIPMENT_STORAGE_KEY,
            []
        );


    if (
        !Array.isArray(
            equipment
        )
    ) {

        return [];

    }


    return equipment;

}


/* =========================================================
   EQUIPMENT ICON
========================================================= */

function getEquipmentIcon(
    category
) {

    var value =
        String(
            category || ""
        )
        .toLowerCase();


    if (
        value.indexOf(
            "camera"
        ) !== -1
    ) {

        return "fa-camera";

    }


    if (
        value.indexOf(
            "lens"
        ) !== -1
    ) {

        return "fa-circle-dot";

    }


    if (
        value.indexOf(
            "light"
        ) !== -1
    ) {

        return "fa-lightbulb";

    }


    if (
        value.indexOf(
            "drone"
        ) !== -1
    ) {

        return "fa-video";

    }


    if (
        value.indexOf(
            "audio"
        ) !== -1 ||
        value.indexOf(
            "sound"
        ) !== -1 ||
        value.indexOf(
            "microphone"
        ) !== -1
    ) {

        return "fa-microphone";

    }


    return "fa-camera-retro";

}


/* =========================================================
   LOAD EQUIPMENT
========================================================= */

function loadClientEquipment() {

    var container =
        document.getElementById(
            "equipmentGrid"
        );


    if (!container) {
        return;
    }


    var equipment =
        getClientEquipment()
            .filter(
                function(category) {

                    return (
                        category &&
                        category.name &&
                        Array.isArray(
                            category.items
                        ) &&
                        category.items.length
                    );

                }
            );


    container.innerHTML =
        "";


    if (!equipment.length) {

        var empty =
            document.createElement(
                "div"
            );


        empty.className =
            "equipment-empty-state";


        empty.textContent =
            "Equipment information will appear here once it has been added.";


        container.appendChild(
            empty
        );


        return;

    }


    equipment.forEach(
        function(category) {

            var card =
                document.createElement(
                    "article"
                );


            card.className =
                "equipment-category-card";


            var heading =
                document.createElement(
                    "div"
                );


            heading.className =
                "equipment-category-heading";


            var icon =
                document.createElement(
                    "i"
                );


            icon.className =
                "fa-solid " +
                getEquipmentIcon(
                    category.name
                );


            icon.setAttribute(
                "aria-hidden",
                "true"
            );


            heading.appendChild(
                icon
            );


            var title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                category.name;


            heading.appendChild(
                title
            );


            var list =
                document.createElement(
                    "ul"
                );


            list.className =
                "equipment-items";


            category.items
                .filter(
                    function(item) {

                        return (
                            typeof item === "string" &&
                            item.trim()
                        );

                    }
                )
                .forEach(
                    function(item) {

                        var li =
                            document.createElement(
                                "li"
                            );


                        li.textContent =
                            item;


                        list.appendChild(
                            li
                        );

                    }
                );


            card.appendChild(
                heading
            );


            card.appendChild(
                list
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   RECENT WORK STORAGE
========================================================= */

var RECENT_WORK_STORAGE_KEY =
    "professionalStudio.portfolioStorage";

var RECENT_WORK_DB_NAME =
    "ProfessionalStudioDB";

var RECENT_WORK_DB_VERSION =
    1;

var RECENT_WORK_STORE =
    "recentWorkPhotos";


/* =========================================================
   OPEN RECENT WORK DATABASE
========================================================= */

function openRecentWorkDatabase() {

    return new Promise(
        function(resolve, reject) {

            if (!window.indexedDB) {

                reject(
                    new Error(
                        "IndexedDB is not supported."
                    )
                );

                return;

            }


            var request =
                window.indexedDB.open(
                    RECENT_WORK_DB_NAME,
                    RECENT_WORK_DB_VERSION
                );


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result
                    );

                };


            request.onerror =
                function() {

                    reject(
                        request.error ||
                        new Error(
                            "Could not open Recent Work database."
                        )
                    );

                };

        }
    );

}


/* =========================================================
   GET RECENT WORK PHOTO
========================================================= */

function getRecentWorkPhoto(
    blobKey
) {

    return openRecentWorkDatabase()
        .then(
            function(db) {

                return new Promise(
                    function(resolve, reject) {

                        var transaction;


                        try {

                            transaction =
                                db.transaction(
                                    RECENT_WORK_STORE,
                                    "readonly"
                                );

                        } catch (error) {

                            reject(error);

                            return;

                        }


                        var store =
                            transaction.objectStore(
                                RECENT_WORK_STORE
                            );


                        var request =
                            store.get(
                                blobKey
                            );


                        request.onsuccess =
                            function() {

                                resolve(
                                    request.result ||
                                    null
                                );

                            };


                        request.onerror =
                            function() {

                                reject(
                                    request.error ||
                                    new Error(
                                        "Could not read Recent Work image."
                                    )
                                );

                            };

                    }
                );

            }
        );

}


/* =========================================================
   READ RECENT WORK STORAGE
========================================================= */

function getRecentWorkStorage() {

    try {

        var raw =
            localStorage.getItem(
                RECENT_WORK_STORAGE_KEY
            );


        if (!raw) {

            return {
                albums: [],
                files: []
            };

        }


        var parsed =
            JSON.parse(
                raw
            );


        return {

            albums:
                Array.isArray(
                    parsed.albums
                )
                    ? parsed.albums
                    : [],

            files:
                Array.isArray(
                    parsed.files
                )
                    ? parsed.files
                    : []

        };

    }
    catch (error) {

        console.warn(
            "Could not read Recent Work:",
            error
        );


        return {
            albums: [],
            files: []
        };

    }

}


/* =========================================================
   ESCAPE RECENT WORK HTML
========================================================= */

function escapeRecentWorkHTML(
    value
) {

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =========================================================
   RECENT WORK EMPTY STATE
========================================================= */

function showRecentWorkEmptyState() {

    var empty =
        document.getElementById(
            "recentWorkEmpty"
        );


    if (empty) {

        empty.hidden =
            false;

    }

}


/* =========================================================
   HIDE RECENT WORK EMPTY STATE
========================================================= */

function hideRecentWorkEmptyState() {

    var empty =
        document.getElementById(
            "recentWorkEmpty"
        );


    if (empty) {

        empty.hidden =
            true;

    }

}


/* =========================================================
   RENDER RECENT WORK
========================================================= */

function renderPortfolioRecentWork() {

    var grid =
        document.getElementById(
            "recentWorkPreview"
        );


    if (!grid) {

        console.warn(
            "Recent Work preview container was not found."
        );

        return;

    }


    var storage =
        getRecentWorkStorage();


    /*
       Only public albums are shown.

       Missing isPublic is treated as public,
       matching the main Recent Work module.
    */

    var publicAlbums =
        storage.albums.filter(
            function(album) {

                return (
                    album &&
                    album.isPublic !== false
                );

            }
        );


    grid.innerHTML =
        "";


    /*
       Remove stale empty-state content.
    */

    hideRecentWorkEmptyState();


    if (!publicAlbums.length) {

        showRecentWorkEmptyState();

        return;

    }


    publicAlbums.forEach(
        function(album) {

            var albumFiles =
                storage.files.filter(
                    function(file) {

                        return (
                            file &&
                            file.albumId ===
                            album.id
                        );

                    }
                );


            /*
               Explicit cover first.
               Otherwise use the first available file.
            */

            var coverFile =
                albumFiles.find(
                    function(file) {

                        return (
                            file &&
                            file.id ===
                            album.coverFileId
                        );

                    }
                );


            if (!coverFile) {

                coverFile =
                    albumFiles[0] ||
                    null;

            }


            var card =
                document.createElement(
                    "a"
                );


            card.className =
                "work-card recent-work-card";


            card.href =
                "gallery.html?album=" +
                encodeURIComponent(
                    album.id
                );


            var imageContainer =
                document.createElement(
                    "div"
                );


            imageContainer.className =
                "work-image";


            var placeholder =
                document.createElement(
                    "div"
                );


            placeholder.className =
                "recent-work-image-placeholder";


            placeholder.textContent =
                "Loading...";


            imageContainer.appendChild(
                placeholder
            );


            var content =
                document.createElement(
                    "div"
                );


            content.className =
                "work-content";


            var heading =
                document.createElement(
                    "h3"
                );


            heading.textContent =
                album.name ||
                "Untitled Album";


            var count =
                document.createElement(
                    "p"
                );


            count.textContent =
                albumFiles.length +
                (
                    albumFiles.length === 1
                        ? " photo"
                        : " photos"
                );


            content.appendChild(
                heading
            );


            content.appendChild(
                count
            );


            card.appendChild(
                imageContainer
            );


            card.appendChild(
                content
            );


            grid.appendChild(
                card
            );


            /*
               No media in the album.
            */

            if (!coverFile) {

                placeholder.textContent =
                    "No preview image";

                return;

            }


            var blobKey =
                coverFile.blobKey ||
                coverFile.id;


            getRecentWorkPhoto(
                blobKey
            )
            .then(
                function(record) {

                    if (
                        !record ||
                        !record.blob
                    ) {

                        placeholder.textContent =
                            "Preview unavailable";

                        return;

                    }


                    var image =
                        document.createElement(
                            "img"
                        );


                    var objectURL =
                        URL.createObjectURL(
                            record.blob
                        );


                    image.src =
                        objectURL;


                    image.alt =
                        album.name ||
                        "Recent Work";


                    image.loading =
                        "lazy";


                    image.decoding =
                        "async";


                    image.onload =
                        function() {

                            if (
                                placeholder &&
                                placeholder.parentNode
                            ) {

                                placeholder.remove();

                            }

                        };


                    image.onerror =
                        function() {

                            URL.revokeObjectURL(
                                objectURL
                            );

                            image.remove();

                            placeholder.textContent =
                                "Preview unavailable";

                        };


                    imageContainer.insertBefore(
                        image,
                        imageContainer.firstChild
                    );

                }
            )
            .catch(
                function(error) {

                    console.warn(
                        "Could not load Recent Work cover:",
                        error
                    );


                    placeholder.textContent =
                        "Preview unavailable";

                }
            );

        }
    );

}


/* =========================================================
   RECENT WORK UPDATES
========================================================= */

window.addEventListener(
    "professionalStudioRecentWorkUpdated",
    function() {

        renderPortfolioRecentWork();

    }
);


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key ===
            PROFILE_STORAGE_KEY
        ) {

            renderPublicProfile();

        }


        if (
            event.key ===
            SERVICES_STORAGE_KEY
        ) {

            loadClientServices();

        }


        if (
            event.key ===
            EQUIPMENT_STORAGE_KEY
        ) {

            loadClientEquipment();

        }


        if (
            event.key ===
            RECENT_WORK_STORAGE_KEY
        ) {

            renderPortfolioRecentWork();

        }

    }
);




/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderPublicProfile();

        initializeExperienceMeters();

        initializeSmoothScrolling();

        initializeRevealAnimations();

        initializeNavbar();

        initializeActiveNavigation();

        initializeBookButtons();

        loadClientServices();

        loadClientEquipment();

        renderPortfolioRecentWork();

         initializeReviewSystem();

    }
);
