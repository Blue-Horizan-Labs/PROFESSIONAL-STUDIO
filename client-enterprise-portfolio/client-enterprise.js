"use strict";

/* =========================================================
   PROFESSIONAL STUDIO
   ENTERPRISE PUBLIC CLIENT PROFILE
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
   ENTERPRISE PROFILE BRIDGE
========================================================= */

const ENTERPRISE_PROFILE_KEY =
    "professionalStudio.profile";

const ENTERPRISE_LEGACY_PROFILE_KEY =
    "professionalStudio.user";

const ENTERPRISE_PLAN =
    "enterprise";


function enterpriseReadStorage(
    key,
    fallback = null
) {
    try {
        const raw =
            localStorage.getItem(key);

        if (!raw) {
            return fallback;
        }

        const parsed =
            JSON.parse(raw);

        return parsed ?? fallback;
    } catch (error) {
        console.error(
            "Enterprise profile storage error:",
            error
        );

        return fallback;
    }
}


function getEnterpriseProfile() {
    const current =
        enterpriseReadStorage(
            ENTERPRISE_PROFILE_KEY,
            {}
        );

    const legacy =
        enterpriseReadStorage(
            ENTERPRISE_LEGACY_PROFILE_KEY,
            {}
        );

    const currentProfile =
        current &&
        typeof current === "object"
            ? current
            : {};

    const legacyProfile =
        legacy &&
        typeof legacy === "object"
            ? legacy
            : {};

    const social =
        currentProfile.social &&
        typeof currentProfile.social === "object"
            ? currentProfile.social
            : {};

    return {
        ...legacyProfile,
        ...currentProfile,

        studioName:
            currentProfile.studioName ||
            legacyProfile.studioName ||
            legacyProfile.std_name ||
            "",

        studioTagline:
            currentProfile.studioTagline ||
            legacyProfile.studioTagline ||
            legacyProfile.std_tag ||
            "",

        photographerName:
            currentProfile.photographerName ||
            legacyProfile.photographerName ||
            legacyProfile.full_name ||
            "",

        professionalRole:
            currentProfile.professionalRole ||
            legacyProfile.professionalRole ||
            legacyProfile.professional_role ||
            "",

        experience:
            currentProfile.experience ??
            legacyProfile.experience ??
            legacyProfile.photographerExperience ??
            0,

        sessionsDone:
            currentProfile.sessionsDone ??
            legacyProfile.sessionsDone ??
            legacyProfile.sessions_done ??
            0,

        specialization:
            currentProfile.specialization ||
            legacyProfile.specialization ||
            "",

        about:
            currentProfile.about ||
            legacyProfile.about ||
            "",

        phone:
            currentProfile.phone ||
            legacyProfile.phone ||
            "",

        address:
            currentProfile.address ||
            legacyProfile.address ||
            legacyProfile.std_address ||
            "",

        contactIntroduction:
            currentProfile.contactIntroduction ||
            legacyProfile.contactIntroduction ||
            "",

        social: {
            instagram:
                social.instagram ||
                legacyProfile.social?.instagram ||
                legacyProfile.insta_handle ||
                "",

            facebook:
                social.facebook ||
                legacyProfile.social?.facebook ||
                legacyProfile.facebook_handle ||
                "",

            youtube:
                social.youtube ||
                legacyProfile.social?.youtube ||
                legacyProfile.yt_handle ||
                ""
        },

        heroImage:
            currentProfile.heroImage ||
            legacyProfile.heroImage ||
            "",

        featuredImage:
            currentProfile.featuredImage ||
            legacyProfile.featuredImage ||
            currentProfile.profilePhoto ||
            legacyProfile.profilePhoto ||
            "",

        philosophy:
            currentProfile.philosophy ||
            currentProfile.statement ||
            legacyProfile.philosophy ||
            legacyProfile.statement ||
            "",

        plan:
            currentProfile.plan ||
            ENTERPRISE_PLAN
    };
}


function enterpriseSetText(
    selector,
    value
) {
    const element =
        document.querySelector(selector);

    if (!element) {
        return;
    }

    element.textContent =
        value == null
            ? ""
            : String(value).trim();
}


function enterpriseHasImage(value) {
    return (
        typeof value === "string" &&
        value.trim().length > 0
    );
}


function renderEnterpriseHeroImage(profile) {
    const hero =
        document.querySelector(
            ".enterprise-hero-image"
        );

    if (!hero) {
        return;
    }

    const image =
        String(
            profile.heroImage || ""
        ).trim();

    hero.style.backgroundImage =
        "none";

    hero.removeAttribute(
        "data-image-source"
    );

    hero.classList.remove(
        "has-image"
    );

    if (!enterpriseHasImage(image)) {
        return;
    }

    hero.style.backgroundImage =
        `url("${image.replace(/"/g, '\\"')}")`;

    hero.style.backgroundSize =
        "cover";

    hero.style.backgroundPosition =
        "center";

    hero.setAttribute(
        "data-image-source",
        image
    );

    hero.classList.add(
        "has-image"
    );
}


function renderEnterpriseFeaturedImage(profile) {
    const image =
        document.querySelector(
            ".enterprise-feature-frame img"
        );

    const frame =
        document.querySelector(
            ".enterprise-feature-frame"
        );

    if (!image) {
        return;
    }

    const source =
        String(
            profile.featuredImage || ""
        ).trim();

    image.removeAttribute("src");
    image.removeAttribute("srcset");
    image.removeAttribute("data-demo-image");

    if (!enterpriseHasImage(source)) {
        if (frame) {
            frame.classList.add("empty");
        }

        image.hidden = true;
        return;
    }

    image.src = source;
    image.alt =
        profile.photographerName
            ? `${profile.photographerName} featured portfolio`
            : "Featured portfolio image";

    image.hidden = false;

    if (frame) {
        frame.classList.remove("empty");
    }
}


function renderEnterprisePhilosophy(profile) {
    const statement =
        document.querySelector(
            ".enterprise-statement"
        );

    if (!statement) {
        return;
    }

    const quote =
        statement.querySelector(
            "blockquote"
        );

    if (!quote) {
        return;
    }

    const philosophy =
        String(
            profile.philosophy ||
            profile.statement ||
            ""
        ).trim();

    quote.textContent =
        philosophy;

    statement.hidden =
        !philosophy;

    const featuredImage =
        String(
            profile.featuredImage || ""
        ).trim();

    if (featuredImage) {
        statement.style.backgroundImage =
            `linear-gradient(
                rgba(13, 13, 12, 0.82),
                rgba(13, 13, 12, 0.82)
            ), url("${featuredImage.replace(/"/g, '\"')}")`;

        statement.style.backgroundPosition =
            "center";

        statement.style.backgroundSize =
            "cover";

        statement.style.backgroundAttachment =
            window.matchMedia("(max-width: 900px)").matches
                ? "scroll"
                : "fixed";
    } else {
        statement.style.backgroundImage =
            "linear-gradient(rgba(13, 13, 12, 0.82), rgba(13, 13, 12, 0.82))";

        statement.style.backgroundAttachment =
            "scroll";
    }
}


function renderEnterpriseBrand(profile) {
    const logo = document.getElementById("enterpriseLogo");
    if (logo) {
        logo.textContent = normalizeText(profile.studioName || profile.photographerName) || "Professional Studio";
    }

    const heroTitle = document.getElementById("heroTitle");
    if (heroTitle) {
        const primaryTitle = normalizeText(profile.studioName || profile.photographerName) || "Professional Studio";
        const secondaryTitle = normalizeText(profile.studioTagline || profile.specialization || profile.professionalRole);
        heroTitle.replaceChildren(document.createTextNode(primaryTitle));
        if (secondaryTitle) {
            const accent = document.createElement("span");
            accent.textContent = secondaryTitle;
            heroTitle.appendChild(accent);
        }
    }

    enterpriseSetText(
        "#heroKicker",
        normalizeText(profile.professionalRole || profile.specialization) || "Enterprise Photography Portfolio"
    );

    const pageTitle = normalizeText(profile.studioName || profile.photographerName);
    document.title = pageTitle
        ? `${pageTitle} | Portfolio`
        : "Professional Studio | Enterprise Portfolio";

    enterpriseSetText(
        "#aboutText",
        profile.about
    );

    enterpriseSetText(
        "#photographerName",
        profile.photographerName
    );

    enterpriseSetText(
        "#photographerStudio",
        profile.studioName
    );

    enterpriseSetText(
        "#profilePhone",
        profile.phone
    );

    enterpriseSetText(
        "#profileEmail",
        profile.email
    );

    enterpriseSetText(
        "#profileLocation",
        profile.address
    );

    document
        .querySelectorAll(
            "[data-profile='studio-name']"
        )
        .forEach((element) => {
            element.textContent =
                profile.studioName || "";
        });

    document
        .querySelectorAll(
            "[data-profile='studio-tagline']"
        )
        .forEach((element) => {
            element.textContent =
                profile.studioTagline || "";
        });

    document
        .querySelectorAll(
            "[data-profile='professional-role']"
        )
        .forEach((element) => {
            element.textContent =
                profile.professionalRole || "";
        });

    document
        .querySelectorAll(
            "[data-profile='specialization']"
        )
        .forEach((element) => {
            element.textContent =
                profile.specialization || "";
        });
}


function renderEnterpriseExperience(profile) {
    const sessions =
        Number(
            profile.sessionsDone
        );

    const years =
        Number(
            profile.experience
        );

    const sessionsSection =
        document.getElementById(
            "sessionsExperience"
        );

    const yearsSection =
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

    if (
        sessionsSection &&
        Number.isFinite(sessions) &&
        sessions > 0
    ) {
        sessionsSection.hidden = false;

        if (sessionsText) {
            sessionsText.textContent =
                `${sessions.toLocaleString("en-IN")} Sessions Completed`;
        }

        if (sessionsMeter) {
            const meter =
                Math.min(
                    100,
                    Math.max(
                        0,
                        sessions / 10
                    )
                );

            sessionsMeter.style.width =
                `${meter}%`;

            const meterContainer =
                sessionsMeter.closest(
                    ".meter"
                );

            meterContainer?.setAttribute(
                "aria-valuenow",
                String(
                    Math.round(meter)
                )
            );
        }
    } else if (sessionsSection) {
        sessionsSection.hidden = true;
    }

    if (
        yearsSection &&
        Number.isFinite(years) &&
        years > 0
    ) {
        yearsSection.hidden = false;

        if (yearsText) {
            yearsText.textContent =
                `${years} ${
                    years === 1
                        ? "Year"
                        : "Years"
                } Experience`;
        }

        if (experienceMeter) {
            const meter =
                Math.min(
                    100,
                    Math.max(
                        0,
                        years * 10
                    )
                );

            experienceMeter.style.width =
                `${meter}%`;

            const meterContainer =
                experienceMeter.closest(
                    ".meter"
                );

            meterContainer?.setAttribute(
                "aria-valuenow",
                String(
                    Math.round(meter)
                )
            );
        }
    } else if (yearsSection) {
        yearsSection.hidden = true;
    }
}


function normalizeEnterpriseSocialUrl(
    value,
    platform
) {
    const raw =
        String(value || "").trim();

    if (!raw) {
        return "";
    }

    if (
        /^https?:\/\//i.test(raw)
    ) {
        return raw;
    }

    if (raw.startsWith("@")) {
        return normalizeEnterpriseSocialUrl(
            raw.substring(1),
            platform
        );
    }

    const username =
        raw
            .replace(/^\/+/, "")
            .trim();

    const domains = {
        instagram:
            `https://instagram.com/${username}`,

        facebook:
            `https://facebook.com/${username}`,

        youtube:
            `https://youtube.com/@${username}`
    };

    return domains[platform] || "";
}


function renderEnterpriseSocial(profile) {
    document
        .querySelectorAll(
            '[data-social="instagram"]'
        )
        .forEach((element) => {
            const url =
                normalizeEnterpriseSocialUrl(
                    profile.social.instagram,
                    "instagram"
                );

            element.href =
                url || "#";

            element.hidden =
                !url;

            if (url) {
                element.target =
                    "_blank";
                element.rel =
                    "noopener noreferrer";
            }
        });

    document
        .querySelectorAll(
            '[data-social="facebook"]'
        )
        .forEach((element) => {
            const url =
                normalizeEnterpriseSocialUrl(
                    profile.social.facebook,
                    "facebook"
                );

            element.href =
                url || "#";

            element.hidden =
                !url;

            if (url) {
                element.target =
                    "_blank";
                element.rel =
                    "noopener noreferrer";
            }
        });

    document
        .querySelectorAll(
            '[data-social="youtube"]'
        )
        .forEach((element) => {
            const url =
                normalizeEnterpriseSocialUrl(
                    profile.social.youtube,
                    "youtube"
                );

            element.href =
                url || "#";

            element.hidden =
                !url;

            if (url) {
                element.target =
                    "_blank";
                element.rel =
                    "noopener noreferrer";
            }
        });
}


function renderEnterpriseProfile() {
    const profile =
        getEnterpriseProfile();

    renderEnterpriseBrand(
        profile
    );

    renderEnterpriseHeroImage(
        profile
    );

    renderEnterpriseFeaturedImage(
        profile
    );

    renderEnterprisePhilosophy(
        profile
    );

    renderEnterpriseExperience(
        profile
    );

    renderEnterpriseSocial(
        profile
    );

    if (
        typeof renderEnterpriseEquipment ===
        "function"
    ) {
        renderEnterpriseEquipment(
            profile
        );
    }

    if (
        typeof renderEnterpriseServices ===
        "function"
    ) {
        renderEnterpriseServices(
            profile
        );
    }

    if (
        typeof renderEnterpriseRecentWork ===
        "function"
    ) {
        renderEnterpriseRecentWork(
            profile
        );
    }

    if (
        typeof renderEnterpriseReviews ===
        "function"
    ) {
        renderEnterpriseReviews(
            profile
        );
    }
}


function getClientProfile() {
    return getEnterpriseProfile();
}


function renderPublicProfile() {
    renderEnterpriseProfile();
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
        normalizeText(review.name) ||
        "Anonymous Client";

    author.appendChild(name);


    if (
        normalizeText(review.service)
    ) {
        const service =
            document.createElement("div");

        service.className =
            "review-service";

        service.textContent =
            normalizeText(
                review.service
            );

        author.appendChild(service);
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
    [
        "reviewClientName",
        "reviewClientEmail",
        "reviewText"
    ].forEach((id) => {
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

    element.hidden = true;
    element.textContent = "";
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

        getReviewFocusableElements()[0]?.focus();
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
        typeof reviewPreviouslyFocusedElement.focus ===
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

    let valid = true;
    let firstInvalid = null;

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

        valid = false;
    }

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

        valid = false;
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

        valid = false;
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

        valid = false;
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

        valid = false;
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
                ) === result.email
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
        closeReviewModal,
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

    document
        .getElementById(
            "openReviewModalBtn"
        )
        ?.addEventListener(
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
                    event.key === "ArrowRight" ||
                    event.key === "ArrowDown"
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
                    event.key === "ArrowLeft" ||
                    event.key === "ArrowUp"
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
            if (event.key === "Escape") {
                event.preventDefault();
                closeReviewModal();
                return;
            }

            if (event.key !== "Tab") {
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
                document.activeElement === first
            ) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === last
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
    let services = readClientLocalStorage(STORAGE_KEYS.services, []);

    // A portfolio may be visited before Service Management initializes its
    // storage. Seed the same starter offerings so the public service cards
    // are visible on first visit. An existing empty array remains intentional.
    try {
        const hasUsableServices = Array.isArray(services) && services.some(service =>
            service &&
            typeof service === "object" &&
            service.active !== false &&
            service.isActive !== false &&
            normalizeText(service.name || service.title)
        );

        // Empty arrays are common when Service Management has been opened but
        // no services were saved yet. Keep the public portfolio demonstrable.
        if (localStorage.getItem(STORAGE_KEYS.services) === null || !hasUsableServices) {
            services = [
                {
                    id: "wedding-photography", category: "Wedding",
                    name: "Wedding Photography",
                    description: "Complete wedding photography coverage for ceremonies, portraits and celebrations.",
                    coverageDuration: "8 Hours", deliveryTime: "15-20 Days",
                    coverageType: "Full Day", active: true,
                    packages: [
                        { id: "wedding-basic", name: "Basic", price: 25000, coverage: "6 Hours", photos: "300+ Edited Photos", delivery: "15 Days", album: "No", description: "Essential wedding photography coverage.", paymentPlan: { type: "full" } },
                        { id: "wedding-premium", name: "Premium", price: 45000, coverage: "10 Hours", photos: "600+ Edited Photos", delivery: "15 Days", album: "1 Premium Album", description: "Extended wedding coverage with album.", paymentPlan: { type: "advance", advanceType: "percentage", advanceValue: 30 } },
                        { id: "wedding-luxury", name: "Luxury", price: 75000, coverage: "Full Day", photos: "1000+ Edited Photos", delivery: "12 Days", album: "2 Premium Albums", description: "Complete premium wedding photography experience.", paymentPlan: { type: "installments", installments: [{ name: "Booking", type: "percentage", value: 30, due: "At Booking" }, { name: "Event", type: "percentage", value: 40, due: "Event Day" }, { name: "Delivery", type: "percentage", value: 30, due: "Before Delivery" }] } }
                    ]
                },
                {
                    id: "portrait-photography", category: "Portrait",
                    name: "Portrait Photography",
                    description: "Professional portrait sessions for individuals, couples and personal branding.",
                    coverageDuration: "2 Hours", deliveryTime: "7-10 Days",
                    coverageType: "Session", active: true,
                    packages: [
                        { id: "portrait-basic", name: "Basic", price: 5000, coverage: "1 Hour", photos: "15 Edited Photos", delivery: "7 Days", album: "No", description: "Simple portrait session.", paymentPlan: { type: "full" } },
                        { id: "portrait-premium", name: "Premium", price: 9000, coverage: "2 Hours", photos: "30 Edited Photos", delivery: "7 Days", album: "No", description: "Extended portrait session with additional edited photos.", paymentPlan: { type: "advance", advanceType: "percentage", advanceValue: 50 } },
                        { id: "portrait-luxury", name: "Luxury", price: 15000, coverage: "3 Hours", photos: "50 Edited Photos", delivery: "5 Days", album: "1 Premium Album", description: "Premium portrait experience.", paymentPlan: { type: "full" } }
                    ]
                }
            ];
            localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(services));
        }
    } catch (error) {
        console.warn("Unable to initialize starter services:", error);
    }

    return Array.isArray(services) ? services : [];
}

function formatEnterpriseCurrency(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) return "";
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(value);
    } catch {
        return `₹${Math.round(value).toLocaleString("en-IN")}`;
    }
}

function getEnterpriseServiceStartingPrice(service) {
    const packages = Array.isArray(service?.packages) ? service.packages : [];
    const prices = packages
        .filter(pkg => pkg && typeof pkg === "object")
        .map(pkg => Number(pkg.price))
        .filter(price => Number.isFinite(price) && price > 0);
    if (prices.length) return Math.min(...prices);

    // Compatibility for older service records; current Service Management
    // stores prices on packages rather than on the service itself.
    const legacy = Number(service?.price ?? service?.startingPrice);
    return Number.isFinite(legacy) && legacy > 0 ? legacy : null;
}

function renderEnterpriseHeroServices(services) {
    const line = document.getElementById("heroServicesLine");
    if (!line) return;
    const names = services
        .map(service => normalizeText(service?.name || service?.title))
        .filter(Boolean);
    line.textContent = names.length
        ? names.slice(0, 5).join(" · ") + (names.length > 5 ? " · + More" : "")
        : "Explore the studio's published services and work.";
}

function loadClientServices() {
    const container = document.getElementById("servicesContainer");
    if (!container) return;

    const services = getClientServices().filter(service =>
        service &&
        typeof service === "object" &&
        service.active !== false &&
        service.isActive !== false &&
        normalizeText(service.name || service.title)
    );

    renderEnterpriseHeroServices(services);
    container.replaceChildren();

    if (!services.length) {
        const empty = document.createElement("div");
        empty.className = "service-empty-state";
        const heading = document.createElement("h3");
        heading.textContent = "Services coming soon";
        const message = document.createElement("p");
        message.textContent = "Published services will appear here after they are added in Service Management.";
        empty.append(heading, message);
        container.appendChild(empty);
        return;
    }

    services.forEach((service, index) => {
        const card = document.createElement("article");
        // The enterprise stylesheet hides .price-card until it has .visible.
        // Cards are inserted after the reveal observer starts, so set it now.
        card.className = "price-card visible";

        const name = normalizeText(service.name || service.title) || "Photography Service";
        const description = normalizeText(service.description || service.details);
        const packages = Array.isArray(service.packages)
            ? service.packages.filter(pkg => pkg && typeof pkg === "object")
            : [];
        const serviceId = normalizeText(service.id || service.serviceId || service.slug);
        const price = getEnterpriseServiceStartingPrice(service);

        const heading = document.createElement("h3");
        heading.textContent = name;
        card.appendChild(heading);

        const priceElement = document.createElement("div");
        priceElement.className = "price";
        priceElement.textContent = price !== null
            ? `Packages from ${formatEnterpriseCurrency(price)}`
            : "Contact for pricing";
        card.appendChild(priceElement);

        const summary = document.createElement("p");
        summary.className = "service-preview-description";
        summary.textContent = description || "Contact the studio to discuss this service.";
        card.appendChild(summary);

        const details = [];
        if (packages.length) {
            details.push(`${packages.length} ${packages.length === 1 ? "package" : "packages"}`);
        }
        const coverage = normalizeText(service.coverage);
        const delivery = normalizeText(service.delivery);
        if (coverage) details.push(coverage);
        if (delivery) details.push(delivery);

        if (details.length) {
            const list = document.createElement("ul");
            details.forEach(detail => {
                const item = document.createElement("li");
                item.textContent = detail;
                list.appendChild(item);
            });
            card.appendChild(list);
        }

        if (serviceId) {
            const actions = document.createElement("div");
            actions.className = "service-preview-actions";
            const view = document.createElement("a");
            view.className = "book-btn";
            view.href = `service.html?id=${encodeURIComponent(serviceId)}`;
            view.textContent = "View Service";
            actions.appendChild(view);
            card.appendChild(actions);
        }

        container.appendChild(card);
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

    if (value.includes("drone")) {
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

            heading.appendChild(icon);
            heading.appendChild(title);

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

            request.onerror = () => {
                reject(
                    request.error ||
                    new Error(
                        "Unable to open recent work database."
                    )
                );
            };

            request.onsuccess = () => {
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
                // Ignore cleanup errors.
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
        Array.isArray(storage.albums)
    ) {
        return storage.albums;
    }

    if (
        Array.isArray(storage.recentWork)
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
    return (
        normalizeText(
            album?.title ||
            album?.name ||
            album?.albumName
        ) ||
        "Untitled Album"
    );
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
            normalizeText(candidate);

        if (!raw) {
            continue;
        }

        try {
            const url =
                new URL(raw);

            if (
                url.protocol === "http:" ||
                url.protocol === "https:"
            ) {
                return url.href;
            }
        } catch {
            // Ignore invalid URLs.
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
            .filter((album) => album && typeof album === "object" && album.isPublic !== false)
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

        let imageElement = null;

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
   ENTERPRISE REVEAL ANIMATIONS
========================================================= */

function initializeRevealAnimations() {
    const elements =
        document.querySelectorAll(
            [
                ".enterprise-introduction",
                ".enterprise-feature-frame",
                ".enterprise-stat",
                ".enterprise-equipment-heading",
                ".equipment-category-card",
                ".price-card",
                ".work-card",
                ".enterprise-statement-inner",
                ".enterprise-reviews-heading",
                ".enterprise-review-summary",
                ".review-card",
                ".enterprise-contact-content"
            ].join(", ")
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
                    "0px 0px -40px 0px"
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
   ENTERPRISE NAVIGATION
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
            window.scrollY + 180;

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

    let ticking = false;

    window.addEventListener(
        "scroll",
        () => {
            if (ticking) {
                return;
            }

            ticking = true;

            requestAnimationFrame(
                () => {
                    updateNavigation();
                    ticking = false;
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
   NAVBAR
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
            ".book-btn, .enterprise-primary-button, .enterprise-nav-cta"
        )
        .forEach((button) => {
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
        });
}


/* =========================================================
   STORAGE UPDATES
========================================================= */

function initializeStorageListeners() {
    window.addEventListener(
        "storage",
        (event) => {
            if (
                event.key === null ||
                event.key === STORAGE_KEYS.profile
            ) {
                renderPublicProfile();
            }

            if (
                event.key === null ||
                event.key === STORAGE_KEYS.services
            ) {
                loadClientServices();
            }

            if (
                event.key === null ||
                event.key === STORAGE_KEYS.equipment
            ) {
                loadClientEquipment();
            }

            if (
                event.key === null ||
                event.key === STORAGE_KEYS.portfolioStorage
            ) {
                renderPortfolioRecentWork();
            }

            if (
                event.key === null ||
                event.key === STORAGE_KEYS.reviews
            ) {
                renderClientReviews();
            }
        }
    );

    window.addEventListener(
        "professionalStudioProfileUpdated",
        () => {
            renderPublicProfile();
        }
    );

    window.addEventListener(
        "professionalStudioServicesUpdated",
        loadClientServices
    );

    document.addEventListener(
        "professionalStudioReviewsUpdated",
        renderClientReviews
    );
}


/* =========================================================
   PAGE REFRESH
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