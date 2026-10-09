"use strict";

/* =========================================================
   PROFESSIONAL STUDIO
   PUBLIC CLIENT PROFILE
========================================================= */

const STORAGE_KEYS = Object.freeze({
    services: "professionalStudio.services",
    equipment: "professionalStudio.equipment",
    profile: "professionalStudio.profile",
    reviews: "professionalStudio.reviews",
    reviewEmail: "professionalStudio.reviewEmail",
    portfolioStorage: "professionalStudio.portfolioStorage"
});

const RECENT_WORK_DB_NAME = "ProfessionalStudioDB";
const RECENT_WORK_DB_VERSION = 1;
const RECENT_WORK_STORE_NAME = "recentWorkPhotos";

let recentWorkObjectUrls = [];
let recentWorkRenderToken = 0;

let reviewModal = null;
let reviewForm = null;
let reviewPreviouslyFocusedElement = null;


/* =========================================================
   GENERAL HELPERS
========================================================= */

function readClientLocalStorage(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return fallback;
        }

        return JSON.parse(value);
    } catch (error) {
        console.warn(
            `Unable to read localStorage key "${key}".`,
            error
        );

        return fallback;
    }
}

function writeClientLocalStorage(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;
    } catch (error) {
        console.warn(
            `Unable to write localStorage key "${key}".`,
            error
        );

        return false;
    }
}

function normalizeText(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).trim();
}

function normalizeEmail(value) {
    return normalizeText(value).toLowerCase();
}

function escapeHtml(value) {
    return normalizeText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function clamp(value, min, max) {
    return Math.min(
        Math.max(value, min),
        max
    );
}

function getNumericValue(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

function isReducedMotion() {
    return (
        window.matchMedia &&
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    );
}


/* =========================================================
   PROFILE
========================================================= */

function getClientProfile() {
    const profile =
        readClientLocalStorage(
            STORAGE_KEYS.profile,
            null
        );

    return (
        profile &&
        typeof profile === "object"
    )
        ? profile
        : {};
}


function getProfileValue(
    profile,
    aliases = []
) {
    for (const alias of aliases) {

        const value =
            profile?.[alias];

        if (
            value !== null &&
            value !== undefined &&
            String(value).trim()
        ) {
            return value;
        }
    }

    return "";
}


function getNestedProfileValue(
    profile,
    parentAliases = [],
    aliases = []
) {
    for (
        const parentAlias
        of parentAliases
    ) {

        const parent =
            profile?.[parentAlias];

        if (
            !parent ||
            typeof parent !== "object"
        ) {
            continue;
        }

        for (
            const alias
            of aliases
        ) {

            const value =
                parent?.[alias];

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim()
            ) {
                return value;
            }
        }
    }

    return "";
}


/* ---------------------------------------------------------
   PROFILE BASIC VALUES
--------------------------------------------------------- */

function getProfileName(profile) {
    return getProfileValue(
        profile,
        [
            "photographerName",
            "name",
            "fullName",
            "displayName",
            "full_name"
        ]
    ) || "Photographer";
}


function getProfileStudio(profile) {
    return getProfileValue(
        profile,
        [
            "studioName",
            "std_name",
            "studio",
            "businessName"
        ]
    ) || "Professional Studio";
}


function getProfileTagline(profile) {
    return getProfileValue(
        profile,
        [
            "studioTagline",
            "std_tag",
            "tagline",
            "profileTagline"
        ]
    );
}


function getProfileRole(profile) {
    return getProfileValue(
        profile,
        [
            "professionalRole",
            "professional_role",
            "role"
        ]
    );
}


function getProfileSpecialization(profile) {
    return getProfileValue(
        profile,
        [
            "specialization",
            "speciality",
            "specialty"
        ]
    );
}


function getProfileAbout(profile) {
    return getProfileValue(
        profile,
        [
            "about",
            "bio",
            "description",
            "profileDescription"
        ]
    ) || "No profile description has been added yet.";
}


function getProfileLocation(profile) {
    return getProfileValue(
        profile,
        [
            "address",
            "std_address",
            "location"
        ]
    ) || "Location not provided";
}


function getProfilePhone(profile) {
    return getProfileValue(
        profile,
        [
            "phone",
            "phoneNumber",
            "mobile"
        ]
    ) || "Phone not provided";
}


function getProfileEmail(profile) {
    return getProfileValue(
        profile,
        [
            "email",
            "emailAddress"
        ]
    ) || "Email not provided";
}


function getProfileExperience(profile) {
    return getNumericValue(
        getProfileValue(
            profile,
            [
                "experience",
                "yearsExperience",
                "experienceYears",
                "yearsOfExperience"
            ]
        )
    );
}


function getProfileSessions(profile) {
    return getNumericValue(
        getProfileValue(
            profile,
            [
                "sessionsDone",
                "sessionsCompleted",
                "completedSessions",
                "totalSessions",
                "sessions"
            ]
        )
    );
}


/* ---------------------------------------------------------
   PROFILE PHOTO
--------------------------------------------------------- */

function getProfilePhoto(profile) {
    return normalizeText(
        getProfileValue(
            profile,
            [
                "profilePhoto",
                "photo",
                "profileImage",
                "profileImageUrl"
            ]
        )
    );
}


function getSafeImageSource(value) {
    const rawValue =
        normalizeText(value);

    if (!rawValue) {
        return "";
    }

    /*
     * Setup currently stores uploaded images
     * as base64 Data URLs.
     */
    if (
        /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(
            rawValue
        )
    ) {
        return rawValue;
    }

    try {
        const url =
            new URL(rawValue);

        if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
        ) {
            return "";
        }

        return url.href;

    } catch {
        return "";
    }
}


function renderClientProfilePhoto(profile) {
    const photo =
        getSafeImageSource(
            getProfilePhoto(profile)
        );

    const portfolioImage =
        document.querySelector(
            ".portfolio-block img"
        );

    if (!portfolioImage) {
        return;
    }

    /*
     * Keep the original image if no
     * profile photo exists.
     */
    if (!photo) {
        portfolioImage.alt =
            "Featured photography portfolio image";

        return;
    }

    portfolioImage.src =
        photo;

    portfolioImage.alt =
        `${getProfileName(profile)} profile photo`;
}


/* ---------------------------------------------------------
   PROFILE DATA ATTRIBUTES
--------------------------------------------------------- */

function renderProfileDataAttributes(profile) {
    document
        .querySelectorAll(
            "[data-profile-field]"
        )
        .forEach((element) => {

            const field =
                element.dataset.profileField;

            if (!field) {
                return;
            }

            const value =
                getProfileValue(
                    profile,
                    [field]
                );

            element.textContent =
                value || "";
        });
}


/* ---------------------------------------------------------
   PHOTOGRAPHER NAME
--------------------------------------------------------- */

function renderClientPhotographerName(profile) {
    const name =
        getProfileName(profile);

    document
        .querySelectorAll(
            "[data-profile-name], #profileName, #photographerName"
        )
        .forEach((element) => {

            element.textContent =
                name;
        });
}


/* ---------------------------------------------------------
   STUDIO
--------------------------------------------------------- */

function renderClientStudioName(profile) {
    const studio =
        getProfileStudio(profile);

    const element =
        document.getElementById(
            "photographerStudio"
        );

    if (!element) {
        return;
    }

    element.textContent =
        studio;
}


/* ---------------------------------------------------------
   ABOUT
--------------------------------------------------------- */

function renderClientAbout(profile) {
    const element =
        document.getElementById(
            "aboutText"
        );

    if (!element) {
        return;
    }

    element.textContent =
        getProfileAbout(profile);
}


/* ---------------------------------------------------------
   CONTACT
--------------------------------------------------------- */

function renderClientContact(profile) {
    const values = {

        profilePhone:
            getProfilePhone(profile),

        profileEmail:
            getProfileEmail(profile),

        profileLocation:
            getProfileLocation(profile)

    };

    Object.entries(values)
        .forEach(
            ([id, value]) => {

                const element =
                    document.getElementById(id);

                if (element) {
                    element.textContent =
                        value;
                }
            }
        );
}


/* ---------------------------------------------------------
   SOCIAL LINKS
--------------------------------------------------------- */

function normalizeSocialUrl(
    value,
    platform
) {
    const rawValue =
        normalizeText(value);

    if (!rawValue) {
        return "";
    }

    /*
     * Full URL supplied.
     */
    try {
        const url =
            new URL(rawValue);

        if (
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {
            return url.href;
        }

    } catch {
        /*
         * Not a complete URL.
         * Treat it as a username/handle.
         */
    }

    const username =
        rawValue
            .replace(/^@/, "")
            .trim();

    if (!username) {
        return "";
    }

    switch (platform) {

        case "instagram":
            return (
                "https://www.instagram.com/" +
                encodeURIComponent(username) +
                "/"
            );

        case "facebook":
            return (
                "https://www.facebook.com/" +
                encodeURIComponent(username)
            );

        case "youtube":
            return (
                "https://www.youtube.com/@" +
                encodeURIComponent(username)
            );

        default:
            return "";
    }
}


function renderClientSocialLinks(profile) {
    const socialLinks =
        document.querySelectorAll(
            "[data-social]"
        );

    socialLinks.forEach((link) => {

        const platform =
            normalizeText(
                link.dataset.social
            ).toLowerCase();

        if (!platform) {
            return;
        }

        const rawValue =
            getNestedProfileValue(
                profile,
                [
                    "social",
                    "socialLinks",
                    "socialMedia"
                ],
                [platform]
            );

        const url =
            normalizeSocialUrl(
                rawValue,
                platform
            );

        if (url) {

            link.href =
                url;

            link.hidden =
                false;

            link.setAttribute(
                "aria-hidden",
                "false"
            );

        } else {

            link.hidden =
                true;

            link.setAttribute(
                "aria-hidden",
                "true"
            );

            link.removeAttribute(
                "href"
            );
        }
    });
}


/* ---------------------------------------------------------
   BRANDING / HERO
--------------------------------------------------------- */

function renderClientBranding(profile) {

    const name =
        getProfileName(profile);

    const studio =
        getProfileStudio(profile);

    const tagline =
        getProfileTagline(profile);

    const role =
        getProfileRole(profile);

    const specialization =
        getProfileSpecialization(profile);


    /*
     * Existing navbar logo.
     */
    const logo =
        document.querySelector(
            ".navbar .logo"
        );

    if (logo) {

        logo.textContent =
            studio ||
            name ||
            "Photographer";
    }


    /*
     * Existing hero heading.
     *
     * Priority:
     * 1. Setup studio tagline
     * 2. Photographer name
     * 3. Existing default
     */
    const heroTitle =
        document.getElementById(
            "heroTitle"
        );

    if (heroTitle) {

        heroTitle.textContent =
            tagline ||
            name ||
            "Capturing Real Stories";
    }


    /*
     * If the existing hero paragraph exists,
     * populate it from Setup information.
     *
     * We do not create a new element.
     */
    const heroParagraph =
        document.querySelector(
            ".hero-content > p"
        );

    if (heroParagraph) {

        const heroInformation = [
            role,
            specialization
        ].filter(Boolean);

        if (heroInformation.length) {

            heroParagraph.textContent =
                heroInformation.join(
                    " • "
                );

        }
    }
}


/* ---------------------------------------------------------
   EXPERIENCE
--------------------------------------------------------- */

function renderExperience(profile) {

    const sessionsBox =
        document.getElementById(
            "sessionsExperience"
        );

    const yearsBox =
        document.getElementById(
            "yearsExperience"
        );

    const sessionsText =
        document.getElementById(
            "sessionsExperienceText"
        );

    const yearsText =
        document.getElementById(
            "yearsExperienceText"
        );

    const sessionsMeter =
        document.querySelector(
            '[data-meter="sessions"]'
        );

    const experienceMeter =
        document.querySelector(
            '[data-meter="experience"]'
        );


    /*
     * The page structure can vary slightly.
     * We therefore do not require a specific
     * #experienceSection ID.
     */
    const section =
        document.getElementById(
            "experienceSection"
        ) ||
        sessionsBox?.closest("section") ||
        yearsBox?.closest("section");


    if (
        !sessionsBox ||
        !yearsBox ||
        !sessionsText ||
        !yearsText
    ) {
        return;
    }


    const sessions =
        getProfileSessions(profile);

    const years =
        getProfileExperience(profile);


    let visibleCards = 0;


    /* -----------------------------------------------------
       SESSIONS
    ----------------------------------------------------- */

    if (sessions !== null) {

        sessionsBox.hidden =
            false;

        visibleCards += 1;

        sessionsText.textContent =
            `${sessions.toLocaleString()} Sessions`;


        if (sessionsMeter) {

            sessionsMeter.style.width =
                "100%";

            sessionsMeter.dataset.value =
                "100";

            const meter =
                sessionsMeter.closest(
                    ".meter"
                );

            meter?.setAttribute(
                "aria-valuenow",
                "100"
            );
        }

    } else {

        sessionsBox.hidden =
            true;
    }


    /* -----------------------------------------------------
       EXPERIENCE
    ----------------------------------------------------- */

    if (years !== null) {

        yearsBox.hidden =
            false;

        visibleCards += 1;

        yearsText.textContent =
            `${years} ${
                years === 1
                    ? "Year"
                    : "Years"
            } Experience`;


        if (experienceMeter) {

            const meterValue =
                clamp(
                    (years / 10) * 100,
                    0,
                    100
                );

            experienceMeter.style.width =
                `${meterValue}%`;

            experienceMeter.dataset.value =
                String(meterValue);

            const meter =
                experienceMeter.closest(
                    ".meter"
                );

            meter?.setAttribute(
                "aria-valuenow",
                String(meterValue)
            );
        }

    } else {

        yearsBox.hidden =
            true;
    }


    if (section) {

        section.hidden =
            visibleCards === 0;

    }


    if (visibleCards > 0) {

        requestAnimationFrame(() => {

            document
                .querySelectorAll(
                    "#sessionsExperience, #yearsExperience"
                )
                .forEach((box) => {

                    if (!box.hidden) {

                        box.classList.add(
                            "visible"
                        );
                    }
                });
        });
    }
}


/* ---------------------------------------------------------
   PUBLIC PROFILE RENDER
--------------------------------------------------------- */

function renderPublicProfile() {

    const profile =
        getClientProfile();


    renderProfileDataAttributes(
        profile
    );

    renderClientBranding(
        profile
    );

    renderClientPhotographerName(
        profile
    );

    renderClientStudioName(
        profile
    );

    renderClientAbout(
        profile
    );

    renderClientContact(
        profile
    );

    renderClientSocialLinks(
        profile
    );

    renderClientProfilePhoto(
        profile
    );

    renderExperience(
        profile
    );
}


/* =========================================================
   REVIEWS
========================================================= */

function getClientReviews() {

    const reviews =
        readClientLocalStorage(
            STORAGE_KEYS.reviews,
            []
        );

    return Array.isArray(reviews)
        ? reviews
        : [];
}


function saveClientReviews(reviews) {

    return writeClientLocalStorage(
        STORAGE_KEYS.reviews,
        reviews
    );
}


function getStoredReviewEmail() {

    try {

        return normalizeEmail(
            localStorage.getItem(
                STORAGE_KEYS.reviewEmail
            )
        );

    } catch {
        return "";
    }
}


function setStoredReviewEmail(email) {

    try {

        localStorage.setItem(
            STORAGE_KEYS.reviewEmail,
            normalizeEmail(email)
        );

    } catch (error) {

        console.warn(
            "Unable to remember review email.",
            error
        );
    }
}


function generateReviewId() {

    return (
        `review_${Date.now()}_` +
        Math.random()
            .toString(36)
            .slice(2, 10)
    );
}


function formatReviewDate(value) {

    if (!value) {
        return "Date unavailable";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(date);
}


function createReviewStars(rating) {

    const safeRating =
        clamp(
            Number(rating) || 0,
            0,
            5
        );

    const fragment =
        document.createDocumentFragment();

    for (
        let index = 1;
        index <= 5;
        index += 1
    ) {

        const icon =
            document.createElement("i");

        icon.className =
            index <= safeRating
                ? "fa-solid fa-star"
                : "fa-regular fa-star";

        icon.setAttribute(
            "aria-hidden",
            "true"
        );

        fragment.appendChild(icon);
    }

    return fragment;
}


function createReviewCard(review) {

    const article =
        document.createElement("article");

    article.className =
        "review-card";


    const header =
        document.createElement("div");

    header.className =
        "review-card-header";


    const author =
        document.createElement("div");

    author.className =
        "review-author";


    const name =
        document.createElement("h3");

    name.className =
        "review-author-name";

    name.textContent =
        normalizeText(
            review.name
        ) ||
        "Anonymous Client";

    author.appendChild(name);


    if (
        normalizeText(
            review.service
        )
    ) {

        const service =
            document.createElement("div");

        service.className =
            "review-service";

        service.textContent =
            normalizeText(
                review.service
            );

        author.appendChild(
            service
        );
    }


    const rating =
        document.createElement("div");

    rating.className =
        "review-card-rating";

    rating.setAttribute(
        "aria-label",
        `${clamp(
            Number(review.rating) || 0,
            0,
            5
        )} out of 5 stars`
    );

    rating.appendChild(
        createReviewStars(
            review.rating
        )
    );


    header.appendChild(author);
    header.appendChild(rating);


    const text =
        document.createElement("p");

    text.className =
        "review-card-text";

    text.textContent =
        normalizeText(
            review.text
        ) ||
        "No review text provided.";


    const date =
        document.createElement("div");

    date.className =
        "review-date";

    date.textContent =
        formatReviewDate(
            review.createdAt
        );


    article.appendChild(header);
    article.appendChild(text);
    article.appendChild(date);


    return article;
}


function renderReviewStars(rating) {

    const container =
        document.getElementById(
            "reviewsAverageStars"
        );

    if (!container) {
        return;
    }

    const safeRating =
        clamp(
            Number(rating) || 0,
            0,
            5
        );

    container.replaceChildren(
        createReviewStars(
            safeRating
        )
    );

    container.setAttribute(
        "aria-label",
        safeRating > 0
            ? `Average rating ${safeRating.toFixed(1)} out of 5`
            : "No reviews yet"
    );
}


function renderClientReviews() {

    const reviews =
        getClientReviews();

    const list =
        document.getElementById(
            "reviewsList"
        );

    const emptyState =
        document.getElementById(
            "reviewsEmptyState"
        );

    const averageElement =
        document.getElementById(
            "reviewsAverageRating"
        );

    const countElement =
        document.getElementById(
            "reviewsCount"
        );


    if (
        !list ||
        !emptyState ||
        !averageElement ||
        !countElement
    ) {
        return;
    }


    list.replaceChildren();


    if (!reviews.length) {

        averageElement.textContent =
            "0.0";

        countElement.textContent =
            "No reviews yet";

        renderReviewStars(0);

        emptyState.hidden =
            false;

        return;
    }


    const validReviews =
        reviews.filter((review) => {

            const rating =
                Number(
                    review?.rating
                );

            return (
                Number.isFinite(rating) &&
                rating >= 1 &&
                rating <= 5
            );
        });


    if (!validReviews.length) {

        averageElement.textContent =
            "0.0";

        countElement.textContent =
            "No reviews yet";

        renderReviewStars(0);

        emptyState.hidden =
            false;

        return;
    }


    const average =
        validReviews.reduce(
            (sum, review) =>
                sum +
                Number(review.rating),
            0
        ) /
        validReviews.length;


    averageElement.textContent =
        average.toFixed(1);


    countElement.textContent =
        validReviews.length === 1
            ? "1 review"
            : `${validReviews.length} reviews`;


    renderReviewStars(
        average
    );


    validReviews
        .slice()
        .sort(
            (a, b) =>
                new Date(
                    b.createdAt || 0
                ) -
                new Date(
                    a.createdAt || 0
                )
        )
        .forEach((review) => {

            list.appendChild(
                createReviewCard(
                    review
                )
            );
        });


    emptyState.hidden =
        true;
}


/* =========================================================
   REVIEW MODAL
========================================================= */

function getReviewFocusableElements() {

    if (!reviewModal) {
        return [];
    }

    return Array.from(
        reviewModal.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
    ).filter(
        (element) =>
            !element.hidden &&
            element.offsetParent !== null
    );
}


function resetReviewRating() {

    document
        .querySelectorAll(
            ".rating-star"
        )
        .forEach((button) => {

            button.classList.remove(
                "selected"
            );

            button.setAttribute(
                "aria-checked",
                "false"
            );

            const icon =
                button.querySelector("i");

            if (icon) {

                icon.className =
                    "fa-regular fa-star";
            }
        });


    const ratingValue =
        document.getElementById(
            "reviewRatingValue"
        );

    if (ratingValue) {
        ratingValue.value = "";
    }
}


function clearReviewFieldErrors() {

    const fields = [
        "reviewClientName",
        "reviewClientEmail",
        "reviewText"
    ];


    fields.forEach((id) => {

        const element =
            document.getElementById(id);

        if (element) {

            element.classList.remove(
                "invalid"
            );

            element.removeAttribute(
                "aria-invalid"
            );
        }
    });


    [
        "reviewClientNameError",
        "reviewClientEmailError",
        "reviewRatingError",
        "reviewTextError"
    ].forEach((id) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = "";
        }
    });
}


function showReviewFormMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "reviewFormMessage"
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        `review-form-message ${type}`;

    element.hidden =
        false;
}


function hideReviewFormMessage() {

    const element =
        document.getElementById(
            "reviewFormMessage"
        );

    if (!element) {
        return;
    }

    element.hidden =
        true;

    element.textContent =
        "";

    element.className =
        "review-form-message";
}


function resetReviewForm() {

    reviewForm?.reset();

    clearReviewFieldErrors();

    hideReviewFormMessage();

    resetReviewRating();

    updateReviewCharacterCount();


    const submitButton =
        document.getElementById(
            "submitReviewBtn"
        );

    if (submitButton) {

        submitButton.disabled =
            false;

        submitButton.textContent =
            "Submit Review";
    }


    const alreadySubmitted =
        document.getElementById(
            "reviewAlreadySubmitted"
        );

    if (alreadySubmitted) {
        alreadySubmitted.hidden =
            true;
    }


    reviewForm?.removeAttribute(
        "hidden"
    );
}


function openReviewModal() {

    if (!reviewModal) {
        return;
    }


    reviewPreviouslyFocusedElement =
        document.activeElement;


    resetReviewForm();


    reviewModal.hidden =
        false;

    reviewModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "review-modal-open"
    );


    requestAnimationFrame(() => {

        const nameInput =
            document.getElementById(
                "reviewClientName"
            );

        if (
            nameInput &&
            !nameInput.disabled
        ) {

            nameInput.focus();

            return;
        }


        const focusable =
            getReviewFocusableElements();

        focusable[0]?.focus();
    });
}


function closeReviewModal() {

    if (!reviewModal) {
        return;
    }


    reviewModal.hidden =
        true;

    reviewModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "review-modal-open"
    );


    resetReviewForm();


    if (
        reviewPreviouslyFocusedElement &&
        typeof
            reviewPreviouslyFocusedElement.focus ===
            "function"
    ) {

        reviewPreviouslyFocusedElement.focus();
    }


    reviewPreviouslyFocusedElement =
        null;
}


function setReviewRating(value) {

    const rating =
        clamp(
            Number(value) || 0,
            0,
            5
        );


    const hiddenInput =
        document.getElementById(
            "reviewRatingValue"
        );

    if (hiddenInput) {

        hiddenInput.value =
            rating
                ? String(rating)
                : "";
    }


    document
        .querySelectorAll(
            ".rating-star"
        )
        .forEach((button) => {

            const buttonRating =
                Number(
                    button.dataset.rating
                );

            const selected =
                buttonRating <= rating;


            button.classList.toggle(
                "selected",
                selected
            );


            button.setAttribute(
                "aria-checked",
                buttonRating === rating
                    ? "true"
                    : "false"
            );


            const icon =
                button.querySelector("i");

            if (icon) {

                icon.className =
                    selected
                        ? "fa-solid fa-star"
                        : "fa-regular fa-star";
            }
        });
}


function updateReviewCharacterCount() {

    const textarea =
        document.getElementById(
            "reviewText"
        );

    const counter =
        document.getElementById(
            "reviewCharacterCount"
        );

    if (
        !textarea ||
        !counter
    ) {
        return;
    }

    counter.textContent =
        `${textarea.value.length} / 1000`;
}


function setFieldError(
    fieldId,
    errorId,
    message
) {

    const field =
        document.getElementById(
            fieldId
        );

    const error =
        document.getElementById(
            errorId
        );


    if (field) {

        field.classList.toggle(
            "invalid",
            Boolean(message)
        );


        if (message) {

            field.setAttribute(
                "aria-invalid",
                "true"
            );

        } else {

            field.removeAttribute(
                "aria-invalid"
            );
        }
    }


    if (error) {
        error.textContent =
            message || "";
    }
}


function validateReviewForm() {

    clearReviewFieldErrors();


    const name =
        normalizeText(
            document.getElementById(
                "reviewClientName"
            )?.value
        );


    const email =
        normalizeEmail(
            document.getElementById(
                "reviewClientEmail"
            )?.value
        );


    const rating =
        Number(
            document.getElementById(
                "reviewRatingValue"
            )?.value
        );


    const text =
        normalizeText(
            document.getElementById(
                "reviewText"
            )?.value
        );


    let valid =
        true;

    let firstInvalid =
        null;


    if (name.length < 2) {

        setFieldError(
            "reviewClientName",
            "reviewClientNameError",
            "Please enter your name."
        );


        firstInvalid ??=
            document.getElementById(
                "reviewClientName"
            );


        valid =
            false;
    }


    /*
     * Fixed email validation.
     */
    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {

        setFieldError(
            "reviewClientEmail",
            "reviewClientEmailError",
            "Please enter a valid email address."
        );


        firstInvalid ??=
            document.getElementById(
                "reviewClientEmail"
            );


        valid =
            false;
    }


    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {

        const error =
            document.getElementById(
                "reviewRatingError"
            );


        if (error) {

            error.textContent =
                "Please choose a rating.";
        }


        firstInvalid ??=
            document.querySelector(
                ".rating-star"
            );


        valid =
            false;
    }


    if (text.length < 5) {

        setFieldError(
            "reviewText",
            "reviewTextError",
            "Please enter at least 5 characters."
        );


        firstInvalid ??=
            document.getElementById(
                "reviewText"
            );


        valid =
            false;
    }


    if (text.length > 1000) {

        setFieldError(
            "reviewText",
            "reviewTextError",
            "Your review cannot exceed 1000 characters."
        );


        firstInvalid ??=
            document.getElementById(
                "reviewText"
            );


        valid =
            false;
    }


    if (!valid) {
        firstInvalid?.focus();
    }


    return {
        valid,
        name,
        email,
        rating,
        text
    };
}


function handleReviewSubmit(event) {

    event.preventDefault();


    const result =
        validateReviewForm();


    if (!result.valid) {

        showReviewFormMessage(
            "Please correct the highlighted fields.",
            "error"
        );

        return;
    }


    const existingReviews =
        getClientReviews();


    const duplicate =
        existingReviews.some(
            (review) =>
                normalizeEmail(
                    review.email
                ) ===
                result.email
        );


    if (duplicate) {

        setStoredReviewEmail(
            result.email
        );


        reviewForm.hidden =
            true;


        const alreadySubmitted =
            document.getElementById(
                "reviewAlreadySubmitted"
            );


        if (alreadySubmitted) {

            alreadySubmitted.hidden =
                false;
        }


        return;
    }


    const submitButton =
        document.getElementById(
            "submitReviewBtn"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Submitting...";
    }


    const newReview = {

        id:
            generateReviewId(),

        name:
            result.name,

        email:
            result.email,

        rating:
            result.rating,

        text:
            result.text,

        createdAt:
            new Date().toISOString()
    };


    const saved =
        saveClientReviews([
            ...existingReviews,
            newReview
        ]);


    if (!saved) {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Submit Review";
        }


        showReviewFormMessage(
            "Your review could not be saved on this device. Please try again.",
            "error"
        );


        return;
    }


    setStoredReviewEmail(
        result.email
    );


    renderClientReviews();


    showReviewFormMessage(
        "Your review has been added successfully.",
        "success"
    );


    if (submitButton) {

        submitButton.textContent =
            "Review Added";
    }


    document.dispatchEvent(
        new CustomEvent(
            "professionalStudioReviewsUpdated"
        )
    );


    setTimeout(
        () => {
            closeReviewModal();
        },
        900
    );
}


function initializeReviewSystem() {

    reviewModal =
        document.getElementById(
            "reviewModal"
        );


    reviewForm =
        document.getElementById(
            "reviewForm"
        );


    if (
        !reviewModal ||
        !reviewForm
    ) {
        return;
    }


    const openButton =
        document.getElementById(
            "openReviewModalBtn"
        );


    openButton?.addEventListener(
        "click",
        openReviewModal
    );


    document
        .querySelectorAll(
            "[data-close-review-modal]"
        )
        .forEach((element) => {

            element.addEventListener(
                "click",
                closeReviewModal
            );
        });


    document
        .getElementById(
            "closeReviewModalBtn"
        )
        ?.addEventListener(
            "click",
            closeReviewModal
        );


    document
        .querySelectorAll(
            ".rating-star"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    setReviewRating(
                        button.dataset.rating
                    );
                }
            );
        });


    document
        .getElementById(
            "reviewRating"
        )
        ?.addEventListener(
            "keydown",
            (event) => {

                const buttons =
                    Array.from(
                        document.querySelectorAll(
                            ".rating-star"
                        )
                    );


                const currentIndex =
                    buttons.indexOf(
                        document.activeElement
                    );


                if (
                    event.key ===
                        "ArrowRight" ||
                    event.key ===
                        "ArrowDown"
                ) {

                    event.preventDefault();


                    const nextIndex =
                        currentIndex < 0
                            ? 0
                            : Math.min(
                                currentIndex + 1,
                                buttons.length - 1
                            );


                    buttons[
                        nextIndex
                    ]?.focus();


                    setReviewRating(
                        buttons[
                            nextIndex
                        ]?.dataset.rating
                    );
                }


                if (
                    event.key ===
                        "ArrowLeft" ||
                    event.key ===
                        "ArrowUp"
                ) {

                    event.preventDefault();


                    const previousIndex =
                        currentIndex < 0
                            ? buttons.length - 1
                            : Math.max(
                                currentIndex - 1,
                                0
                            );


                    buttons[
                        previousIndex
                    ]?.focus();


                    setReviewRating(
                        buttons[
                            previousIndex
                        ]?.dataset.rating
                    );
                }
            }
        );


    document
        .getElementById(
            "reviewText"
        )
        ?.addEventListener(
            "input",
            updateReviewCharacterCount
        );


    reviewForm.addEventListener(
        "submit",
        handleReviewSubmit
    );


    reviewModal.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                closeReviewModal();

                return;
            }


            if (
                event.key !==
                "Tab"
            ) {
                return;
            }


            const focusable =
                getReviewFocusableElements();


            if (!focusable.length) {

                event.preventDefault();

                return;
            }


            const first =
                focusable[0];

            const last =
                focusable[
                    focusable.length - 1
                ];


            if (
                event.shiftKey &&
                document.activeElement ===
                    first
            ) {

                event.preventDefault();

                last.focus();

            } else if (
                !event.shiftKey &&
                document.activeElement ===
                    last
            ) {

                event.preventDefault();

                first.focus();
            }
        }
    );


    renderClientReviews();
}


/* =========================================================
   SERVICES
========================================================= */

function getClientServices() {

    const services =
        readClientLocalStorage(
            STORAGE_KEYS.services,
            []
        );

    return Array.isArray(services)
        ? services
        : [];
}


function loadClientServices() {

    const container =
        document.getElementById(
            "servicesContainer"
        );

    if (!container) {
        return;
    }


    container.replaceChildren();


    const services =
        getClientServices()
            .filter(
                (service) =>
                    service &&
                    service.active !== false
            );


    if (!services.length) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "service-empty-state";

        empty.innerHTML = `
            <h3>No Services Available Yet</h3>
            <p>
                Photography services will appear here once they have been published.
            </p>
        `;

        container.appendChild(
            empty
        );

        return;
    }


    services.forEach((service) => {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "price-card";


        const name =
            normalizeText(
                service.name ||
                service.title
            ) ||
            "Photography Service";


        const description =
            normalizeText(
                service.description
            );


        const price =
            normalizeText(
                service.price ??
                service.startingPrice
            );


        const coverage =
            normalizeText(
                service.coverage
            );


        const delivery =
            normalizeText(
                service.delivery
            );


        const packageCount =
            Array.isArray(
                service.packages
            )
                ? service.packages.length
                : getNumericValue(
                    service.packageCount
                );


        const serviceId =
            normalizeText(
                service.id ||
                service.serviceId ||
                service.slug
            );


        const title =
            document.createElement(
                "h3"
            );

        title.textContent =
            name;


        card.appendChild(
            title
        );


        if (price) {

            const priceElement =
                document.createElement(
                    "div"
                );

            priceElement.className =
                "price";

            priceElement.textContent =
                price;

            card.appendChild(
                priceElement
            );
        }


        if (description) {

            const descriptionElement =
                document.createElement(
                    "p"
                );

            descriptionElement.className =
                "service-preview-description";

            descriptionElement.textContent =
                description;

            card.appendChild(
                descriptionElement
            );
        }


        const details = [];


        if (packageCount !== null) {

            details.push(
                `${packageCount} package${
                    packageCount === 1
                        ? ""
                        : "s"
                }`
            );
        }


        if (coverage) {
            details.push(
                coverage
            );
        }


        if (delivery) {
            details.push(
                delivery
            );
        }


        if (details.length) {

            const list =
                document.createElement(
                    "ul"
                );


            details.forEach(
                (detail) => {

                    const item =
                        document.createElement(
                            "li"
                        );

                    item.textContent =
                        detail;

                    list.appendChild(
                        item
                    );
                }
            );


            card.appendChild(
                list
            );
        }


        if (serviceId) {

            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "service-preview-actions";


            const viewLink =
                document.createElement(
                    "a"
                );

            viewLink.className =
                "book-btn";

            viewLink.href =
                `service.html?id=${encodeURIComponent(
                    serviceId
                )}`;

            viewLink.textContent =
                "View Service";


            const bookLink =
                document.createElement(
                    "a"
                );

            bookLink.className =
                "book-btn";

            bookLink.href =
                `service.html?id=${encodeURIComponent(
                    serviceId
                )}&action=book`;

            bookLink.textContent =
                "Book Service";


            actions.appendChild(
                viewLink
            );

            actions.appendChild(
                bookLink
            );


            card.appendChild(
                actions
            );
        }


        container.appendChild(
            card
        );
    });
}


/* =========================================================
   EQUIPMENT
========================================================= */

function getClientEquipment() {

    const equipment =
        readClientLocalStorage(
            STORAGE_KEYS.equipment,
            []
        );

    return Array.isArray(equipment)
        ? equipment
        : [];
}


function getEquipmentIcon(category) {

    const value =
        normalizeText(category)
            .toLowerCase();


    if (
        value.includes("camera") ||
        value.includes("body")
    ) {
        return "fa-camera";
    }


    if (
        value.includes("lens") ||
        value.includes("optics")
    ) {
        return "fa-camera-retro";
    }


    if (
        value.includes("light") ||
        value.includes("lighting")
    ) {
        return "fa-lightbulb";
    }


    if (
        value.includes("audio") ||
        value.includes("microphone")
    ) {
        return "fa-microphone";
    }


    if (
        value.includes("drone")
    ) {
        return "fa-helicopter";
    }


    if (
        value.includes("tripod") ||
        value.includes("support")
    ) {
        return "fa-photo-film";
    }


    return "fa-camera";
}


function loadClientEquipment() {

    const grid =
        document.getElementById(
            "equipmentGrid"
        );


    if (!grid) {
        return;
    }


    grid.replaceChildren();


    const equipment =
        getClientEquipment();


    const validCategories =
        equipment.filter(
            (category) => {

                if (!category) {
                    return false;
                }


                const name =
                    normalizeText(
                        category.name ||
                        category.category ||
                        category.title
                    );


                const items =
                    Array.isArray(
                        category.items
                    )
                        ? category.items
                        : [];


                return Boolean(
                    name &&
                    items.length
                );
            }
        );


    if (!validCategories.length) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "equipment-empty-state";

        empty.textContent =
            "Equipment information will appear here once it has been added.";


        grid.appendChild(
            empty
        );


        return;
    }


    validCategories.forEach(
        (category) => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "equipment-category-card";


            const heading =
                document.createElement(
                    "div"
                );

            heading.className =
                "equipment-category-heading";


            const icon =
                document.createElement(
                    "i"
                );

            icon.className =
                `fa-solid ${getEquipmentIcon(
                    category.name ||
                    category.category ||
                    category.title
                )}`;

            icon.setAttribute(
                "aria-hidden",
                "true"
            );


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                normalizeText(
                    category.name ||
                    category.category ||
                    category.title
                );


            heading.appendChild(
                icon
            );

            heading.appendChild(
                title
            );


            const list =
                document.createElement(
                    "ul"
                );

            list.className =
                "equipment-items";


            category.items.forEach(
                (item) => {

                    const itemText =
                        typeof item ===
                            "string"
                            ? item
                            : item?.name ||
                              item?.title ||
                              item?.model;


                    const cleanItem =
                        normalizeText(
                            itemText
                        );


                    if (!cleanItem) {
                        return;
                    }


                    const listItem =
                        document.createElement(
                            "li"
                        );

                    listItem.textContent =
                        cleanItem;


                    list.appendChild(
                        listItem
                    );
                }
            );


            if (
                !list.children.length
            ) {
                return;
            }


            card.appendChild(
                heading
            );

            card.appendChild(
                list
            );


            grid.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   RECENT WORK / INDEXED DB
========================================================= */

function openRecentWorkDatabase() {

    return new Promise(
        (resolve, reject) => {

            if (
                !("indexedDB" in window)
            ) {

                reject(
                    new Error(
                        "IndexedDB is not supported."
                    )
                );

                return;
            }


            const request =
                indexedDB.open(
                    RECENT_WORK_DB_NAME,
                    RECENT_WORK_DB_VERSION
                );


            request.onerror =
                () => {

                    reject(
                        request.error ||
                        new Error(
                            "Unable to open recent work database."
                        )
                    );
                };


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );
                };
        }
    );
}


async function getRecentWorkPhoto(
    photoId
) {

    if (!photoId) {
        return null;
    }


    let db = null;


    try {

        db =
            await openRecentWorkDatabase();


        if (
            !db.objectStoreNames.contains(
                RECENT_WORK_STORE_NAME
            )
        ) {

            db.close();

            return null;
        }


        return await new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        RECENT_WORK_STORE_NAME,
                        "readonly"
                    );


                const store =
                    transaction.objectStore(
                        RECENT_WORK_STORE_NAME
                    );


                const request =
                    store.get(photoId);


                request.onsuccess =
                    () => {

                        resolve(
                            request.result ||
                            null
                        );
                    };


                request.onerror =
                    () => {

                        reject(
                            request.error ||
                            new Error(
                                "Unable to read portfolio image."
                            )
                        );
                    };
            }
        );

    } catch (error) {

        console.warn(
            "Unable to load recent work image.",
            error
        );


        return null;

    } finally {

        if (db) {
            db.close();
        }
    }
}


function cleanupRecentWorkObjectUrls() {

    recentWorkObjectUrls.forEach(
        (url) => {

            try {
                URL.revokeObjectURL(
                    url
                );
            } catch {
                /*
                 * Ignore cleanup errors.
                 */
            }
        }
    );


    recentWorkObjectUrls = [];
}


function getRecentWorkAlbums() {

    const storage =
        readClientLocalStorage(
            STORAGE_KEYS.portfolioStorage,
            {}
        );


    if (
        !storage ||
        typeof storage !== "object"
    ) {
        return [];
    }


    if (Array.isArray(storage)) {
        return storage;
    }


    if (
        Array.isArray(
            storage.albums
        )
    ) {
        return storage.albums;
    }


    if (
        Array.isArray(
            storage.recentWork
        )
    ) {
        return storage.recentWork;
    }


    return [];
}


function getAlbumId(album) {

    return normalizeText(
        album?.id ||
        album?.albumId ||
        album?.slug
    );
}


function getAlbumTitle(album) {

    return normalizeText(
        album?.title ||
        album?.name ||
        album?.albumName
    ) ||
        "Untitled Album";
}


function getAlbumDescription(album) {

    return normalizeText(
        album?.description ||
        album?.caption
    );
}


function getAlbumImageId(album) {

    return normalizeText(
        album?.coverPhotoId ||
        album?.coverImageId ||
        album?.thumbnailId
    );
}


function getAlbumImageUrl(album) {

    const candidates = [
        album?.coverUrl,
        album?.coverImage,
        album?.thumbnail,
        album?.imageUrl
    ];


    for (
        const candidate
        of candidates
    ) {

        const raw =
            normalizeText(
                candidate
            );


        if (!raw) {
            continue;
        }


        try {

            const url =
                new URL(raw);


            if (
                url.protocol ===
                    "http:" ||
                url.protocol ===
                    "https:"
            ) {

                return url.href;
            }

        } catch {
            /*
             * Ignore invalid image URLs.
             */
        }
    }


    return "";
}


async function renderPortfolioRecentWork() {

    const grid =
        document.getElementById(
            "recentWorkPreview"
        );


    const emptyState =
        document.getElementById(
            "recentWorkEmpty"
        );


    if (
        !grid ||
        !emptyState
    ) {
        return;
    }


    const currentToken =
        ++recentWorkRenderToken;


    cleanupRecentWorkObjectUrls();


    grid.replaceChildren();

    emptyState.hidden =
        true;


    const albums =
        getRecentWorkAlbums()
            .filter(
                (album) =>
                    album &&
                    album.isPublic !== false
            )
            .slice(0, 6);


    if (!albums.length) {

        emptyState.hidden =
            false;

        return;
    }


    for (
        const album
        of albums
    ) {

        if (
            currentToken !==
            recentWorkRenderToken
        ) {
            return;
        }


        const card =
            document.createElement(
                "article"
            );

        card.className =
            "work-card";


        const albumId =
            getAlbumId(album);

        const title =
            getAlbumTitle(album);

        const description =
            getAlbumDescription(album);

        const imageUrl =
            getAlbumImageUrl(album);

        const imageId =
            getAlbumImageId(album);


        const link =
            document.createElement(
                "a"
            );


        link.href =
            albumId
                ? `gallery.html?album=${encodeURIComponent(
                    albumId
                )}`
                : "gallery.html";


        link.setAttribute(
            "aria-label",
            `View ${title}`
        );


        let imageElement =
            null;


        if (imageUrl) {

            imageElement =
                document.createElement(
                    "img"
                );


            imageElement.src =
                imageUrl;


            imageElement.alt =
                `${title} portfolio`;


            imageElement.loading =
                "lazy";


            imageElement.decoding =
                "async";

        } else if (imageId) {

            const imageRecord =
                await getRecentWorkPhoto(
                    imageId
                );


            if (
                currentToken !==
                recentWorkRenderToken
            ) {
                return;
            }


            if (
                imageRecord?.blob
                    instanceof Blob
            ) {

                const objectUrl =
                    URL.createObjectURL(
                        imageRecord.blob
                    );


                recentWorkObjectUrls.push(
                    objectUrl
                );


                imageElement =
                    document.createElement(
                        "img"
                    );


                imageElement.src =
                    objectUrl;


                imageElement.alt =
                    `${title} portfolio`;


                imageElement.loading =
                    "lazy";


                imageElement.decoding =
                    "async";
            }
        }


        if (imageElement) {

            imageElement.addEventListener(
                "error",
                () => {

                    const placeholder =
                        document.createElement(
                            "div"
                        );


                    placeholder.className =
                        "work-card-placeholder";


                    placeholder.innerHTML =
                        '<i class="fa-regular fa-image" aria-hidden="true"></i>';


                    imageElement.replaceWith(
                        placeholder
                    );
                },
                {
                    once: true
                }
            );


            link.appendChild(
                imageElement
            );

        } else {

            const placeholder =
                document.createElement(
                    "div"
                );


            placeholder.className =
                "work-card-placeholder";


            placeholder.innerHTML =
                '<i class="fa-regular fa-images" aria-hidden="true"></i>';


            link.appendChild(
                placeholder
            );
        }


        const heading =
            document.createElement(
                "h3"
            );


        heading.textContent =
            title;


        const descriptionElement =
            document.createElement(
                "p"
            );


        descriptionElement.textContent =
            description ||
            "View this published portfolio collection.";


        card.appendChild(
            link
        );


        card.appendChild(
            heading
        );


        card.appendChild(
            descriptionElement
        );


        grid.appendChild(
            card
        );


        requestAnimationFrame(
            () => {

                card.classList.add(
                    "visible"
                );
            }
        );
    }


    emptyState.hidden =
        grid.children.length === 0;
}


/* =========================================================
   SMOOTH SCROLLING
========================================================= */

function initializeSmoothScrolling() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach((link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior:
                            isReducedMotion()
                                ? "auto"
                                : "smooth",
                        block:
                            "start"
                    });


                    if (
                        history.replaceState
                    ) {

                        history.replaceState(
                            null,
                            "",
                            targetId
                        );
                    }
                }
            );
        });
}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initializeRevealAnimations() {

    const elements =
        document.querySelectorAll(
            ".portfolio-block, .work-card, .exp-box, .contact-info, .equipment-category-card, .price-card"
        );


    if (
        isReducedMotion() ||
        !(
            "IntersectionObserver"
            in window
        )
    ) {

        elements.forEach(
            (element) => {

                element.classList.add(
                    "visible"
                );
            }
        );


        return;
    }


    const observer =
        new IntersectionObserver(
            (entries, instance) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        entry.target.classList.add(
                            "visible"
                        );


                        instance.unobserve(
                            entry.target
                        );
                    }
                );
            },
            {
                threshold: 0.08,
                rootMargin:
                    "0px 0px -30px 0px"
            }
        );


    elements.forEach(
        (element) => {

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

    const meters =
        document.querySelectorAll(
            ".meter-fill"
        );


    if (!meters.length) {
        return;
    }


    if (
        isReducedMotion() ||
        !(
            "IntersectionObserver"
            in window
        )
    ) {

        meters.forEach(
            (meter) => {

                const value =
                    Number(
                        meter.dataset.value
                    );


                if (
                    Number.isFinite(
                        value
                    )
                ) {

                    meter.style.width =
                        `${clamp(
                            value,
                            0,
                            100
                        )}%`;
                }
            }
        );


        return;
    }


    const observer =
        new IntersectionObserver(
            (entries, instance) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        const meter =
                            entry.target;


                        const value =
                            Number(
                                meter.dataset.value
                            );


                        if (
                            Number.isFinite(
                                value
                            )
                        ) {

                            meter.style.width =
                                `${clamp(
                                    value,
                                    0,
                                    100
                                )}%`;
                        }


                        instance.unobserve(
                            meter
                        );
                    }
                );
            },
            {
                threshold: 0.5
            }
        );


    meters.forEach(
        (meter) => {

            observer.observe(
                meter
            );
        }
    );
}


/* =========================================================
   NAVIGATION STATE
========================================================= */

function initializeActiveNavigation() {

    const navLinks =
        Array.from(
            document.querySelectorAll(
                '.navbar nav a[href^="#"]'
            )
        );


    const sections =
        navLinks
            .map((link) => {

                const id =
                    link.getAttribute(
                        "href"
                    );


                return document.querySelector(
                    id
                );
            })
            .filter(Boolean);


    if (!sections.length) {
        return;
    }


    function updateNavigation() {

        const scrollPosition =
            window.scrollY + 150;


        let activeSection =
            null;


        sections.forEach(
            (section) => {

                if (
                    section.offsetTop <=
                    scrollPosition
                ) {

                    activeSection =
                        section;
                }
            }
        );


        navLinks.forEach(
            (link) => {

                const target =
                    document.querySelector(
                        link.getAttribute(
                            "href"
                        )
                    );


                const active =
                    target ===
                    activeSection;


                link.classList.toggle(
                    "active",
                    active
                );


                if (active) {

                    link.setAttribute(
                        "aria-current",
                        "location"
                    );

                } else {

                    link.removeAttribute(
                        "aria-current"
                    );
                }
            }
        );
    }


    let ticking =
        false;


    window.addEventListener(
        "scroll",
        () => {

            if (ticking) {
                return;
            }


            ticking =
                true;


            requestAnimationFrame(
                () => {

                    updateNavigation();

                    ticking =
                        false;
                }
            );
        },
        {
            passive: true
        }
    );


    updateNavigation();
}


/* =========================================================
   NAVBAR SCROLL STATE
========================================================= */

function initializeNavbarScrollState() {

    const navbar =
        document.querySelector(
            ".navbar"
        );


    if (!navbar) {
        return;
    }


    function update() {

        navbar.classList.toggle(
            "scrolled",
            window.scrollY > 10
        );
    }


    window.addEventListener(
        "scroll",
        update,
        {
            passive: true
        }
    );


    update();
}


/* =========================================================
   BUTTON INTERACTION
========================================================= */

function initializeBookButtons() {

    document
        .querySelectorAll(
            ".book-btn"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        button.classList.add(
                            "clicked"
                        );


                        window.setTimeout(
                            () => {

                                button.classList.remove(
                                    "clicked"
                                );

                            },
                            250
                        );
                    }
                );
            }
        );
}


/* =========================================================
   STORAGE UPDATES
========================================================= */

function initializeStorageListeners() {

    window.addEventListener(
        "storage",
        (event) => {

            if (
                event.key ===
                STORAGE_KEYS.profile
            ) {

                renderPublicProfile();
            }


            if (
                event.key ===
                STORAGE_KEYS.services
            ) {

                loadClientServices();
            }


            if (
                event.key ===
                STORAGE_KEYS.equipment
            ) {

                loadClientEquipment();
            }


            if (
                event.key ===
                STORAGE_KEYS.portfolioStorage
            ) {

                renderPortfolioRecentWork();
            }


            if (
                event.key ===
                STORAGE_KEYS.reviews
            ) {

                renderClientReviews();
            }
        }
    );


    /*
     * Setup page dispatches this event after
     * successfully saving the profile.
     *
     * This makes the Portfolio react immediately
     * when the profile is changed in another
     * same-page context.
     */
    window.addEventListener(
        "professionalStudioProfileUpdated",
        () => {

            renderPublicProfile();
        }
    );


    document.addEventListener(
        "professionalStudioReviewsUpdated",
        renderClientReviews
    );
}


/* =========================================================
   PAGE VISIBILITY / BF CACHE
========================================================= */

function initializePageRefreshHandling() {

    window.addEventListener(
        "pageshow",
        () => {

            renderPublicProfile();

            loadClientServices();

            loadClientEquipment();

            renderPortfolioRecentWork();

            renderClientReviews();
        }
    );
}


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    cleanupRecentWorkObjectUrls
);


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderPublicProfile();

        loadClientServices();

        loadClientEquipment();

        renderPortfolioRecentWork();

        renderClientReviews();

        initializeReviewSystem();

        initializeSmoothScrolling();

        initializeRevealAnimations();

        initializeExperienceMeters();

        initializeActiveNavigation();

        initializeNavbarScrollState();

        initializeBookButtons();

        initializeStorageListeners();

        initializePageRefreshHandling();
    }
);