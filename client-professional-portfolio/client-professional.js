"use strict";

/* =========================================================
   PROFESSIONAL STUDIO
   CLIENT PROFESSIONAL PORTFOLIO
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEYS = Object.freeze({

    services:
        "professionalStudio.services",

    equipment:
        "professionalStudio.equipment",

    profile:
        "professionalStudio.profile",

    reviews:
        "professionalStudio.reviews",

    reviewEmail:
        "professionalStudio.reviewEmail",

    portfolioStorage:
        "professionalStudio.portfolioStorage"

});


const RECENT_WORK_DB_NAME =
    "ProfessionalStudioDB";

const RECENT_WORK_DB_VERSION =
    1;

const RECENT_WORK_STORE_NAME =
    "recentWorkPhotos";


/* =========================================================
   GENERIC STORAGE HELPERS
========================================================= */

function readLocalStorage(
    key,
    fallback = null
){

    try{

        const raw =
            localStorage.getItem(key);

        if(!raw){
            return fallback;
        }

        return JSON.parse(raw);

    }catch{

        return fallback;

    }

}


function writeLocalStorage(
    key,
    value
){

    try{

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    }catch{

        return false;

    }

}


function normalizeText(value){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }

    return String(value).trim();

}


/* =========================================================
   PROFILE
========================================================= */

function getClientProfile(){

    const profile =
        readLocalStorage(
            STORAGE_KEYS.profile,
            null
        );

    if(
        profile &&
        typeof profile === "object"
    ){

        return profile;

    }

    return {};

}


function getProfileValue(
    profile,
    keys
){

    if(
        !profile ||
        typeof profile !== "object"
    ){

        return "";

    }


    for(
        const key of keys
    ){

        const value =
            profile[key];

        if(
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ){

            return value;

        }

    }


    return "";

}


function getNestedProfileValue(
    profile,
    parentKeys,
    childKeys
){

    if(
        !profile ||
        typeof profile !== "object"
    ){

        return "";

    }


    for(
        const parentKey of parentKeys
    ){

        const parent =
            profile[parentKey];

        if(
            !parent ||
            typeof parent !== "object"
        ){

            continue;

        }


        for(
            const childKey of childKeys
        ){

            const value =
                parent[childKey];

            if(
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ){

                return value;

            }

        }

    }


    return "";

}


/* =========================================================
   PROFILE GETTERS
========================================================= */

function getProfileName(profile){

    return normalizeText(
        getProfileValue(
            profile,
            [
                "photographerName",
                "name",
                "fullName",
                "displayName",
                "full_name"
            ]
        )
    ) || "Photographer";

}


function getProfileStudio(profile){

    return normalizeText(
        getProfileValue(
            profile,
            [
                "studioName",
                "std_name",
                "studio",
                "businessName"
            ]
        )
    ) || "Professional Studio";

}


function getProfileTagline(profile){

    return normalizeText(
        getProfileValue(
            profile,
            [
                "studioTagline",
                "std_tag",
                "tagline",
                "profileTagline"
            ]
        )
    );

}


function getProfileRole(profile){

    return normalizeText(
        getProfileValue(
            profile,
            [
                "professionalRole",
                "professional_role",
                "role"
            ]
        )
    );

}


function getProfileSpecialization(profile){

    return normalizeText(
        getProfileValue(
            profile,
            [
                "specialization",
                "speciality",
                "specialty"
            ]
        )
    );

}


function getProfileAbout(profile){

    return normalizeText(
        getProfileValue(
            profile,
            [
                "about",
                "bio",
                "description",
                "profileDescription"
            ]
        )
    ) || "No profile description has been added yet.";

}


function getProfileLocation(profile){

    return normalizeText(
        getProfileValue(
            profile,
            [
                "address",
                "std_address",
                "location"
            ]
        )
    ) || "Location not provided";

}


function getProfilePhone(profile){

    return normalizeText(
        getProfileValue(
            profile,
            [
                "phone",
                "phoneNumber",
                "mobile"
            ]
        )
    ) || "Phone not provided";

}


function getProfileEmail(profile){

    return normalizeText(
        getProfileValue(
            profile,
            [
                "email",
                "emailAddress"
            ]
        )
    ) || "Email not provided";

}


function getProfileExperience(profile){

    return normalizeText(
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


function getProfileSessions(profile){

    return normalizeText(
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


/* =========================================================
   IMAGE HELPERS
========================================================= */

function getSafeImageSource(value){

    const source =
        normalizeText(value);

    if(!source){
        return "";
    }


    /*
     * Allow local/base64 images created by setup.
     */

    if(
        /^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(source)
    ){

        return source;

    }


    /*
     * Allow externally hosted HTTPS images.
     */

    try{

        const url =
            new URL(source);

        if(
            url.protocol === "https:" ||
            url.protocol === "http:"
        ){

            return url.href;

        }

    }catch{

        return "";

    }


    return "";

}


/* =========================================================
   PROFESSIONAL IMAGE DATA
========================================================= */

function getProfileHeroImage(profile){

    return getSafeImageSource(
        getProfileValue(
            profile,
            [
                "heroImage",
                "hero_image",
                "heroImageUrl"
            ]
        )
    );

}


function getProfileFeaturedImage(profile){

    /*
     * Professional uses featuredImage first.
     *
     * profilePhoto remains the Starter-compatible
     * fallback so upgrading does not destroy an
     * existing profile photograph.
     */

    return getSafeImageSource(
        getProfileValue(
            profile,
            [
                "featuredImage",
                "featured_image",
                "featuredImageUrl",
                "profilePhoto",
                "photo",
                "profileImage",
                "profileImageUrl"
            ]
        )
    );

}


/* =========================================================
   PROFESSIONAL IMAGE RENDERING
========================================================= */

function renderProfessionalImages(profile){

    const hero =
        document.querySelector(
            ".hero-image-layer"
        );

    const featured =
        document.querySelector(
            ".professional-about .portfolio-image-wrap img"
        );


    const heroSource =
        getProfileHeroImage(profile);

    const featuredSource =
        getProfileFeaturedImage(profile);


    /* -----------------------------------------------------
       HERO
    ----------------------------------------------------- */

    if(hero){

        if(heroSource){

            hero.style.backgroundImage =
                `url("${heroSource.replaceAll('"', '\\"')}")`;

            hero.classList.add(
                "has-image"
            );

            document.documentElement.style
                .setProperty(
                    "--professional-hero-image",
                    `url("${heroSource.replaceAll('"', '\\"')}")`
                );

        }else{

            hero.style.backgroundImage =
                "none";

            hero.classList.remove(
                "has-image"
            );

            document.documentElement.style
                .removeProperty(
                    "--professional-hero-image"
                );

        }

    }


    /* -----------------------------------------------------
       FEATURED / ABOUT
    ----------------------------------------------------- */

    if(featured){

        if(featuredSource){

            featured.src =
                featuredSource;

            featured.alt =
                `${getProfileName(profile)} photography portfolio image`;

            featured.removeAttribute(
                "hidden"
            );

        }else{

            featured.removeAttribute(
                "src"
            );

            featured.setAttribute(
                "hidden",
                ""
            );

        }

    }


    /*
     * The CTA may reuse the SAME hero image.
     * It is never a separate image slot.
     */

    const cta =
        document.querySelector(
            ".professional-cta"
        );

    if(cta){

        if(heroSource){

            cta.classList.add(
                "has-hero-image"
            );

        }else{

            cta.classList.remove(
                "has-hero-image"
            );

        }

    }

}


/* =========================================================
   BRANDING
========================================================= */

function renderClientBranding(profile){

    const logo =
        document.querySelector(
            ".navbar-professional .logo, .navbar .logo"
        );

    if(logo){
        logo.textContent = getProfileStudio(profile);
    }

    document.title = `${getProfileStudio(profile)} | Portfolio`;

    const heroEyebrow = document.getElementById("heroEyebrow");
    if(heroEyebrow){
        heroEyebrow.textContent = getProfileRole(profile) || "Photography & Visual Stories";
    }

    const heroTitle =
        document.getElementById(
            "heroTitle"
        );

    if(heroTitle){

        heroTitle.textContent =
            getProfileTagline(profile) ||
            getProfileName(profile) ||
            "Capturing Real Stories";

    }


    const heroParagraph =
        document.querySelector(
            ".hero-professional .hero-content > p"
        );

    if(heroParagraph){
        const role = getProfileRole(profile);
        const specialization = getProfileSpecialization(profile);
        const description = [role, specialization].filter(Boolean).join(" • ");
        heroParagraph.textContent = description ||
            "Photography crafted around people, places and meaningful moments.";
    }

    const heroMetaPrimary = document.getElementById("heroMetaPrimary");
    if(heroMetaPrimary){
        heroMetaPrimary.textContent = getProfileRole(profile) || "Professional Photography";
    }

    const heroMetaSpecialization = document.getElementById("heroMetaSpecialization");
    if(heroMetaSpecialization){
        heroMetaSpecialization.textContent = getProfileSpecialization(profile) ||
            "Weddings · Portraits · Events · Commercial";
    }

}


/* =========================================================
   PROFILE DATA ATTRIBUTES
========================================================= */

function renderProfileDataAttributes(profile){

    document.body.dataset.profileCompleted =
        profile.profileCompleted
            ? "true"
            : "false";

    document.body.dataset.plan =
        profile.plan ||
        "professional";

}


/* =========================================================
   PHOTOGRAPHER NAME / STUDIO
========================================================= */

function renderClientPhotographerName(profile){

    const name =
        getProfileName(profile);

    document
        .querySelectorAll(
            "[data-profile-photographer-name]"
        )
        .forEach(element => {

            element.textContent =
                name;

        });

}


function renderClientStudioName(profile){

    const studio =
        getProfileStudio(profile);

    document
        .querySelectorAll(
            "[data-profile-studio-name]"
        )
        .forEach(element => {

            element.textContent =
                studio;

        });

}


/* =========================================================
   ABOUT
========================================================= */

function renderClientAbout(profile){

    const about =
        document.getElementById(
            "aboutText"
        );

    if(about){

        about.textContent =
            getProfileAbout(profile);

    }

}


/* =========================================================
   CONTACT
========================================================= */

function renderClientContact(profile){

    const phone =
        getProfilePhone(profile);

    const email =
        getProfileEmail(profile);

    const location =
        getProfileLocation(profile);


    const phoneElement =
        document.getElementById(
            "profilePhone"
        );

    if(phoneElement){

        phoneElement.href =
            phone !== "Phone not provided"
                ? `tel:${phone.replace(/[^\d+]/g, "")}`
                : "#";

        const span =
            phoneElement.querySelector(
                "span"
            );

        if(span){

            span.textContent =
                phone;

        }else{

            phoneElement.textContent =
                phone;

        }

    }


    const emailElement =
        document.getElementById(
            "profileEmail"
        );

    if(emailElement){

        emailElement.href =
            email !== "Email not provided"
                ? `mailto:${email}`
                : "#";

        const span =
            emailElement.querySelector(
                "span"
            );

        if(span){

            span.textContent =
                email;

        }else{

            emailElement.textContent =
                email;

        }

    }


    const locationElement =
        document.getElementById(
            "profileLocation"
        );

    if(locationElement){

        const span =
            locationElement.querySelector(
                "span"
            );

        if(span){

            span.textContent =
                location;

        }else{

            locationElement.textContent =
                location;

        }

    }

}


/* =========================================================
   SOCIAL LINKS
========================================================= */

function normalizeSocialUrl(
    platform,
    value
){

    let url =
        normalizeText(value);

    if(!url){
        return "";
    }


    if(
        !/^https?:\/\//i.test(url)
    ){

        if(
            platform === "instagram"
        ){

            if(
                url.startsWith("@")
            ){

                url =
                    url.slice(1);

            }

            return `https://instagram.com/${url}`;

        }


        if(
            platform === "facebook"
        ){

            return `https://facebook.com/${url}`;

        }


        if(
            platform === "youtube"
        ){

            if(
                url.startsWith("@")
            ){

                return `https://youtube.com/${url}`;

            }

            return `https://youtube.com/${url}`;

        }

    }


    return url;

}


function renderClientSocialLinks(profile){

    const social =
        profile.social ||
        profile.socialLinks ||
        profile.socialMedia ||
        {};


    document
        .querySelectorAll(
            "[data-social]"
        )
        .forEach(link => {

            const platform =
                link.dataset.social;

            const value =
                social[platform] ||
                profile[
                    platform
                ] ||
                "";


            const url =
                normalizeSocialUrl(
                    platform,
                    value
                );


            if(url){

                link.href =
                    url;

                link.hidden =
                    false;

            }else{

                link.hidden =
                    true;

            }

        });

}


/* =========================================================
   EXPERIENCE
========================================================= */

function renderExperience(profile){

    const sessions =
        getProfileSessions(profile);

    const years =
        getProfileExperience(profile);


    const section =
        document.querySelector(
            ".experience-section"
        );


    const sessionsElement =
        document.getElementById(
            "sessionsExperience"
        );

    const yearsElement =
        document.getElementById(
            "yearsExperience"
        );


    if(sessionsElement){

        sessionsElement.textContent =
            sessions || "0";

    }


    if(yearsElement){

        yearsElement.textContent =
            years || "0";

    }


    if(section){

        section.hidden =
            !sessions &&
            !years;

    }

}


/* =========================================================
   PUBLIC PROFILE
========================================================= */

function renderPublicProfile(){

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

    renderProfessionalImages(
        profile
    );

    renderExperience(
        profile
    );

}


/* =========================================================
   SERVICES
========================================================= */

function formatClientCurrency(amount){

    const value = Number(amount);

    if(!Number.isFinite(value) || value < 0){
        return "";
    }

    try{
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(value);
    }catch{
        return `₹${Math.round(value).toLocaleString("en-IN")}`;
    }

}


function getClientServiceStartingPrice(service){

    const packages = Array.isArray(service?.packages)
        ? service.packages
        : [];

    const packagePrices = packages
        .map(pkg => Number(pkg?.price))
        .filter(price => Number.isFinite(price) && price > 0);

    // Service Management stores pricing on packages, not on the service itself.
    // Keep support for older records that used a top-level price field.
    if(packagePrices.length){
        return Math.min(...packagePrices);
    }

    const legacyPrice = Number(service?.price);
    return Number.isFinite(legacyPrice) && legacyPrice > 0
        ? legacyPrice
        : null;

}


function loadClientServices(){

    const container = document.getElementById("servicesContainer");
    if(!container) return;

    const storedServices = readLocalStorage(STORAGE_KEYS.services, []);
    const activeServices = Array.isArray(storedServices)
        ? storedServices.filter(service =>
            service &&
            typeof service === "object" &&
            service.active !== false &&
            normalizeText(service.name || service.title)
        )
        : [];

    container.replaceChildren();

    if(!activeServices.length){
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-camera" aria-hidden="true"></i>
                <h3>Services coming soon</h3>
                <p>Published photography services will appear here when they are added in Service Management.</p>
            </div>`;
        return;
    }

    activeServices.forEach((service, index) => {
        const id = normalizeText(service.id);
        const name = normalizeText(service.name || service.title);
        const description = normalizeText(service.description || service.details);
        const startingPrice = getClientServiceStartingPrice(service);
        const packageCount = Array.isArray(service.packages)
            ? service.packages.filter(pkg => pkg && typeof pkg === "object").length
            : 0;

        const article = document.createElement("article");
        article.className = "service-card";

        const content = document.createElement("div");
        content.className = "service-card-content";

        const number = document.createElement("span");
        number.className = "service-index";
        number.textContent = String(index + 1).padStart(2, "0");

        const heading = document.createElement("h3");
        heading.textContent = name;

        const summary = document.createElement("p");
        summary.textContent = description || "Contact the studio to discuss this service.";

        content.append(number, heading, summary);

        const meta = document.createElement("div");
        meta.className = "service-card-meta";

        const price = document.createElement("strong");
        price.className = "service-card-price";
        price.textContent = startingPrice !== null
            ? `Packages from ${formatClientCurrency(startingPrice)}`
            : "Contact for pricing";
        meta.appendChild(price);

        if(packageCount){
            const packages = document.createElement("span");
            packages.className = "service-card-package-count";
            packages.textContent = `${packageCount} ${packageCount === 1 ? "package" : "packages"}`;
            meta.appendChild(packages);
        }

        content.appendChild(meta);

        if(id){
            const link = document.createElement("a");
            link.href = `service.html?id=${encodeURIComponent(id)}`;
            link.className = "text-link";
            link.append(document.createTextNode("View Service "));
            const icon = document.createElement("i");
            icon.className = "fa-solid fa-arrow-right";
            icon.setAttribute("aria-hidden", "true");
            link.appendChild(icon);
            content.appendChild(link);
        }

        article.appendChild(content);
        container.appendChild(article);
    });
}


/* =========================================================
   EQUIPMENT
========================================================= */

function loadClientEquipment(){

    const container =
        document.getElementById(
            "equipmentGrid"
        );

    if(!container){
        return;
    }


    const equipment =
        readLocalStorage(
            STORAGE_KEYS.equipment,
            []
        );


    container.innerHTML =
        "";


    if(!Array.isArray(equipment) ||
       !equipment.length){

        container.innerHTML =
            `
            <div class="empty-state">
                <i class="fa-solid fa-camera-retro"></i>
                <h3>Equipment details coming soon</h3>
                <p>
                    Equipment information will appear here.
                </p>
            </div>
            `;

        return;

    }


    equipment.forEach(
        item => {

            const category =
                normalizeText(
                    item.category ||
                    item.type ||
                    "Equipment"
                );


            const name =
                normalizeText(
                    item.name ||
                    item.title ||
                    "Photography Equipment"
                );


            const description =
                normalizeText(
                    item.description ||
                    ""
                );


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "equipment-card";


            card.innerHTML =
                `
                <span class="equipment-category">
                    ${escapeHtml(category)}
                </span>

                <h3>
                    ${escapeHtml(name)}
                </h3>

                ${
                    description
                        ? `
                            <p>
                                ${escapeHtml(description)}
                            </p>
                        `
                        : ""
                }
                `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value){

    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}


/* =========================================================
   RECENT WORK
========================================================= */

function openRecentWorkDatabase(){

    return new Promise(
        (resolve,reject) => {

            if(
                !window.indexedDB
            ){

                resolve(null);
                return;

            }


            const request =
                indexedDB.open(
                    RECENT_WORK_DB_NAME,
                    RECENT_WORK_DB_VERSION
                );


            request.onupgradeneeded =
                event => {

                    const db =
                        event.target.result;


                    if(
                        !db.objectStoreNames.contains(
                            RECENT_WORK_STORE_NAME
                        )
                    ){

                        db.createObjectStore(
                            RECENT_WORK_STORE_NAME,
                            {
                                keyPath:"id"
                            }
                        );

                    }

                };


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                () => {

                    resolve(null);

                };

        }
    );

}


async function getRecentWorkImage(
    imageId
){

    if(!imageId){
        return "";
    }


    const db =
        await openRecentWorkDatabase();


    if(!db){
        return "";
    }


    return new Promise(
        resolve => {

            try{

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
                    store.get(
                        imageId
                    );


                request.onsuccess =
                    () => {

                        const record =
                            request.result;


                        if(
                            record &&
                            record.blob
                        ){

                            resolve(
                                URL.createObjectURL(
                                    record.blob
                                )
                            );

                        }else{

                            resolve("");

                        }

                    };


                request.onerror =
                    () => {

                        resolve("");

                    };

            }catch{

                resolve("");

            }

        }
    );

}


async function renderPortfolioRecentWork(){

    const container = document.getElementById("recentWorkPreview");
    const emptyState = document.getElementById("recentWorkEmpty");

    if (!container) return;

    container.replaceChildren();

    const saved = readLocalStorage(STORAGE_KEYS.portfolioStorage, []);
    let albums = [];

    // Recent Work Management stores { albums: [], files: [], ... }.
    // Keep compatibility with earlier array and recentWork formats.
    if (Array.isArray(saved)) {
        albums = saved;
    } else if (saved && typeof saved === "object" && Array.isArray(saved.albums)) {
        albums = saved.albums;
    } else if (saved && typeof saved === "object" && Array.isArray(saved.recentWork)) {
        albums = saved.recentWork;
    }

    // Albums explicitly marked private must never be shown in the public portfolio.
    const publicAlbums = albums
        .filter(album => album && typeof album === "object" && album.isPublic !== false)
        .slice(0, 6);

    if (!publicAlbums.length) {
        if (emptyState) emptyState.hidden = false;
        return;
    }

    if (emptyState) emptyState.hidden = true;

    for (const album of publicAlbums) {
        let imageSource = getSafeImageSource(
            album.coverUrl || album.coverImage || album.thumbnail || album.imageUrl || ""
        );

        const coverId = album.coverFileId || album.coverPhotoId;
        if (!imageSource && coverId) {
            imageSource = await getRecentWorkImage(coverId);
        }

        const albumId = normalizeText(album.id || album.albumId || album.slug);
        const title = normalizeText(album.title || album.name || album.albumName) || "Photography";
        const category = normalizeText(album.category) || "Portfolio";
        const card = document.createElement("article");
        card.className = "recent-work-card";

        const link = document.createElement("a");
        link.className = "recent-work-link";
        link.href = albumId
            ? `gallery.html?album=${encodeURIComponent(albumId)}`
            : "gallery.html";

        if (imageSource) {
            const image = document.createElement("img");
            image.src = imageSource;
            image.alt = title;
            image.loading = "lazy";
            link.appendChild(image);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className = "recent-work-placeholder";
            placeholder.innerHTML = '<i class="fa-regular fa-image" aria-hidden="true"></i>';
            link.appendChild(placeholder);
        }

        const overlay = document.createElement("div");
        overlay.className = "recent-work-overlay";
        const categoryLabel = document.createElement("span");
        categoryLabel.textContent = category;
        const heading = document.createElement("h3");
        heading.textContent = title;
        overlay.append(categoryLabel, heading);
        link.appendChild(overlay);
        card.appendChild(link);
        container.appendChild(card);
    }

}


/* =========================================================
   REVIEWS
========================================================= */

function getClientReviews(){

    const reviews =
        readLocalStorage(
            STORAGE_KEYS.reviews,
            []
        );

    return Array.isArray(reviews)
        ? reviews
        : [];

}


function saveClientReviews(
    reviews
){

    return writeLocalStorage(
        STORAGE_KEYS.reviews,
        reviews
    );

}


function renderClientReviews(){

    const container =
        document.getElementById(
            "reviewsContainer"
        );

    const emptyState =
        document.getElementById(
            "reviewsEmpty"
        );


    if(!container){
        return;
    }


    const reviews =
        getClientReviews()
            .filter(
                review =>
                    review &&
                    review.approved !== false
            )
            .slice()
            .reverse()
            .slice(0,6);


    container.innerHTML =
        "";


    if(!reviews.length){

        if(emptyState){
            emptyState.hidden = false;
        }

        return;

    }


    if(emptyState){
        emptyState.hidden = true;
    }


    reviews.forEach(
        review => {

            const rating =
                Math.min(
                    5,
                    Math.max(
                        1,
                        Number(
                            review.rating || 5
                        )
                    )
                );


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "review-card";


            const stars =
                Array.from(
                    {length:5},
                    (_,index) =>
                        index < rating
                            ? "★"
                            : "☆"
                )
                .join("");


            card.innerHTML =
                `
                <div class="review-stars">
                    ${stars}
                </div>

                <p>
                    “${escapeHtml(
                        review.text ||
                        review.review ||
                        ""
                    )}”
                </p>

                <strong>
                    ${escapeHtml(
                        review.name ||
                        "Client"
                    )}
                </strong>
                `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   REVIEW MODAL
========================================================= */

function initializeReviewSystem(){

    const modal =
        document.getElementById(
            "reviewModal"
        );

    const openButton =
        document.getElementById(
            "openReviewModal"
        );

    const closeButton =
        document.getElementById(
            "closeReviewModal"
        );

    const form =
        document.getElementById(
            "reviewForm"
        );


    if(
        !modal ||
        !openButton ||
        !closeButton ||
        !form
    ){

        return;

    }


    function open(){

        modal.classList.add(
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    function close(){

        modal.classList.remove(
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    openButton.addEventListener(
        "click",
        open
    );


    closeButton.addEventListener(
        "click",
        close
    );


    modal
        .querySelector(
            ".review-modal-backdrop"
        )
        ?.addEventListener(
            "click",
            close
        );


    document.addEventListener(
        "keydown",
        event => {

            if(
                event.key === "Escape"
            ){

                close();

            }

        }
    );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "reviewName"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "reviewEmail"
                    )
                    .value
                    .trim();


            const rating =
                Number(
                    document
                        .getElementById(
                            "reviewRating"
                        )
                        .value
                );


            const text =
                document
                    .getElementById(
                        "reviewText"
                    )
                    .value
                    .trim();


            if(
                !name ||
                !email ||
                !rating ||
                !text
            ){

                alert(
                    "Please complete all review fields."
                );

                return;

            }


            const reviews =
                getClientReviews();


            reviews.push({

                id:
                    `review-${Date.now()}`,

                name,

                email,

                rating,

                text,

                approved:false,

                createdAt:
                    new Date().toISOString()

            });


            saveClientReviews(
                reviews
            );


            writeLocalStorage(
                STORAGE_KEYS.reviewEmail,
                email
            );


            form.reset();

            close();


            alert(
                "Thank you. Your review has been submitted for approval."
            );

        }
    );

}


/* =========================================================
   SMOOTH SCROLL
========================================================= */

function initializeSmoothScrolling(){

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if(
                        !href ||
                        href === "#"
                    ){

                        return;

                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if(!target){
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior:"smooth",
                        block:"start"
                    });

                }
            );

        });

}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initializeRevealAnimations(){

    const elements =
        document.querySelectorAll(
            ".section, .experience-section, .professional-cta"
        );


    if(
        !("IntersectionObserver" in window)
    ){

        elements.forEach(
            element =>
                element.classList.add(
                    "is-visible"
                )
        );

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if(
                            entry.isIntersecting
                        ){

                            entry.target.classList.add(
                                "is-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold:.08
            }
        );


    elements.forEach(
        element =>
            observer.observe(
                element
            )
    );

}


/* =========================================================
   EXPERIENCE METERS
========================================================= */

function initializeExperienceMeters(){

    document
        .querySelectorAll(
            "[data-meter]"
        )
        .forEach(
            meter => {

                const value =
                    Number(
                        meter.dataset.meter
                    ) || 0;


                requestAnimationFrame(
                    () => {

                        meter.style.width =
                            `${Math.min(
                                100,
                                Math.max(
                                    0,
                                    value
                                )
                            )}%`;

                    }
                );

            }
        );

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function initializeActiveNavigation(){

    const navLinks =
        document.querySelectorAll(
            ".navbar-professional nav a, .navbar nav a"
        );


    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    if(
        !navLinks.length ||
        !sections.length
    ){

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if(
                            !entry.isIntersecting
                        ){

                            return;

                        }


                        navLinks.forEach(
                            link => {

                                link.classList.toggle(
                                    "active",
                                    link.getAttribute(
                                        "href"
                                    ) ===
                                    `#${entry.target.id}`
                                );

                            }

                        );

                    }
                );

            },
            {
                rootMargin:
                    "-35% 0px -55% 0px"
            }
        );


    sections.forEach(
        section =>
            observer.observe(
                section
            )
    );

}


/* =========================================================
   NAVBAR SCROLL STATE
========================================================= */

function initializeNavbarScrollState(){

    const navbar =
        document.querySelector(
            ".navbar-professional, .navbar"
        );


    if(!navbar){
        return;
    }


    function update(){

        navbar.classList.toggle(
            "scrolled",
            window.scrollY > 20
        );

    }


    window.addEventListener(
        "scroll",
        update,
        {
            passive:true
        }
    );


    update();

}


/* =========================================================
   BOOK BUTTONS
========================================================= */

function initializeBookButtons(){

    document
        .querySelectorAll(
            ".book-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        const href =
                            button.getAttribute(
                                "href"
                            );


                        if(
                            !href ||
                            !href.startsWith("#")
                        ){

                            return;

                        }

                    }
                );

            }
        );

}


/* =========================================================
   STORAGE / LIVE UPDATE
========================================================= */

function refreshProfessionalPage(){

    renderPublicProfile();

    loadClientServices();

    loadClientEquipment();

    renderPortfolioRecentWork();

    renderClientReviews();

}


function initializeStorageListeners(){

    window.addEventListener(
        "storage",
        event => {

            if(
                event.key === null ||
                Object.values(
                    STORAGE_KEYS
                ).includes(
                    event.key
                )
            ){

                refreshProfessionalPage();

            }

        }
    );


    window.addEventListener(
        "professionalStudioProfileUpdated",
        refreshProfessionalPage
    );

    window.addEventListener(
        "professionalStudioServicesUpdated",
        loadClientServices
    );

    window.addEventListener(
        "professionalStudioReviewsUpdated",
        renderClientReviews
    );

}


/* =========================================================
   PAGE REFRESH
========================================================= */

function initializePageRefreshHandling(){

    window.addEventListener(
        "pageshow",
        () => {

            refreshProfessionalPage();

        }
    );

}


/* =========================================================
   FOOTER YEAR
========================================================= */

function renderFooterYear(){

    const element =
        document.getElementById(
            "footerYear"
        );


    if(element){

        element.textContent =
            new Date().getFullYear();

    }

}


/* =========================================================
   INITIALIZE
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

        renderFooterYear();

    }
);