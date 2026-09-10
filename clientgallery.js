document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       STORAGE
    ====================================================== */

    const STORAGE_KEY =
        "professionalStudioGalleries";


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const galleryGrid =
        document.getElementById("galleryGrid");

    const emptyState =
        document.getElementById("emptyState");

    const gallerySearch =
        document.getElementById("gallerySearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const totalGalleries =
        document.getElementById("totalGalleries");

    const activeGalleries =
        document.getElementById("activeGalleries");

    const totalStorage =
        document.getElementById("totalStorage");

    const expiringGalleries =
        document.getElementById("expiringGalleries");

    const galleryModal =
        document.getElementById("galleryModal");

    const closeGalleryModal =
        document.getElementById("closeGalleryModal");

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");


    /* =====================================================
       STATE
    ====================================================== */

    let galleries = loadGalleries();

    let selectedGalleryId = null;

    let currentTab = "overview";


    /* =====================================================
       LOAD GALLERIES
    ====================================================== */

    function loadGalleries() {

        try {

            const stored =
                localStorage.getItem(STORAGE_KEY);

            if (!stored) {
                return [];
            }

            return JSON.parse(stored);

        } catch (error) {

            console.error(
                "Could not load galleries:",
                error
            );

            return [];

        }

    }


    /* =====================================================
       SAVE GALLERIES
    ====================================================== */

    function saveGalleries() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(galleries)
        );

    }


    /* =====================================================
       GENERATE ID
    ====================================================== */

    function generateId() {

        return (
            "gallery_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );

    }


    /* =====================================================
       DATE HELPERS
    ====================================================== */

    function addMonths(date, months) {

        const result =
            new Date(date);

        result.setMonth(
            result.getMonth() + months
        );

        return result;

    }


    function formatDate(dateString) {

        const date =
            new Date(dateString);

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(date);

    }


    function getDaysRemaining(dateString) {

        const expiry =
            new Date(dateString);

        const now =
            new Date();

        const difference =
            expiry.getTime() -
            now.getTime();

        return Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );

    }


    /* =====================================================
       GALLERY STATUS
    ====================================================== */

    function getGalleryStatus(gallery) {

        const days =
            getDaysRemaining(
                gallery.expiresAt
            );

        if (days <= 0) {
            return "expired";
        }

        if (days <= 30) {
            return "expiring";
        }

        return "active";

    }


    /* =====================================================
       CREATE GALLERY FROM SHOP PURCHASE
    ====================================================== */

    function createGalleryFromPurchase(
        storageGB,
        durationMonths
    ) {

        const createdAt =
            new Date();

        const expiresAt =
            addMonths(
                createdAt,
                durationMonths
            );

        const gallery = {

            id:
                generateId(),

            name:
                "Untitled Gallery",

            clientName:
                "New Client",

            description:
                "",

            storageGB:
                Number(storageGB),

            storageUsedGB:
                0,

            durationMonths:
                Number(durationMonths),

            createdAt:
                createdAt.toISOString(),

            expiresAt:
                expiresAt.toISOString(),

            status:
                "active",

            galleryLink:
                "https://professionalstudio.in/gallery/" +
                generateId(),

            password:
                generatePasswordValue(),

            passwordEnabled:
                true,

            downloadsEnabled:
                true,

            visible:
                false,

            deliveryStatus:
                "preparing",

            sentAt:
                null,

            downloads:
                0,

            views:
                0,

            media:
                [],

            albums:
                [
                    {
                        id:
                            generateId(),

                        name:
                            "Highlights",

                        mediaCount:
                            0
                    }
                ]

        };


        galleries.push(
            gallery
        );

        saveGalleries();

        renderAll();

        return gallery;

    }


    /* =====================================================
       DETECT SHOP PURCHASE
    ====================================================== */

    function checkForShopPurchase() {

        const pendingPurchase =
            localStorage.getItem(
                "professionalStudioPendingGallery"
            );

        if (!pendingPurchase) {
            return;
        }

        try {

            const purchase =
                JSON.parse(
                    pendingPurchase
                );

            if (
                purchase.storageGB &&
                purchase.durationMonths
            ) {

                const gallery =
                    createGalleryFromPurchase(
                        purchase.storageGB,
                        purchase.durationMonths
                    );

                localStorage.removeItem(
                    "professionalStudioPendingGallery"
                );

                showToast(
                    "Gallery purchased and added to My Galleries."
                );

                openGallery(
                    gallery.id
                );

            }

        } catch (error) {

            console.error(
                "Purchase data error:",
                error
            );

        }

    }


    /* =====================================================
       RENDER EVERYTHING
    ====================================================== */

    function renderAll() {

        updateStats();

        renderGalleryCards();

    }


    /* =====================================================
       UPDATE STATS
    ====================================================== */

    function updateStats() {

        totalGalleries.textContent =
            galleries.length;


        let active = 0;

        let storage = 0;

        let expiring = 0;


        galleries.forEach(gallery => {

            const status =
                getGalleryStatus(
                    gallery
                );

            if (
                status === "active" ||
                status === "expiring"
            ) {

                active++;

            }

            storage +=
                Number(
                    gallery.storageUsedGB || 0
                );

            if (
                status === "expiring"
            ) {

                expiring++;

            }

        });


        activeGalleries.textContent =
            active;


        if (storage < 1) {

            totalStorage.textContent =
                "0 GB";

        } else {

            totalStorage.textContent =
                `${storage.toFixed(1)} GB`;

        }


        expiringGalleries.textContent =
            expiring;

    }


    /* =====================================================
       FILTER GALLERIES
    ====================================================== */

    function getFilteredGalleries() {

        const search =
            gallerySearch.value
                .trim()
                .toLowerCase();

        const filter =
            statusFilter.value;


        return galleries.filter(
            gallery => {

                const matchesSearch =
                    !search ||
                    gallery.name
                        .toLowerCase()
                        .includes(search) ||
                    gallery.clientName
                        .toLowerCase()
                        .includes(search);


                const status =
                    getGalleryStatus(
                        gallery
                    );

                const matchesStatus =
                    filter === "all" ||
                    filter === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );

    }


    /* =====================================================
       RENDER GALLERY CARDS
    ====================================================== */

    function renderGalleryCards() {

        const filtered =
            getFilteredGalleries();


        galleryGrid.innerHTML = "";


        if (!filtered.length) {

            emptyState.style.display =
                "block";

            return;

        }


        emptyState.style.display =
            "none";


        filtered.forEach(
            gallery => {

                const card =
                    createGalleryCard(
                        gallery
                    );

                galleryGrid.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       CREATE GALLERY CARD
    ====================================================== */

    function createGalleryCard(gallery) {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "gallery-card";


        const status =
            getGalleryStatus(
                gallery
            );


        const daysRemaining =
            getDaysRemaining(
                gallery.expiresAt
            );


        const cover =
            gallery.coverImage ||
            "";


        card.innerHTML = `

            <div class="gallery-cover">

                ${
                    cover
                    ?
                    `<img
                        src="${cover}"
                        alt="${escapeHtml(gallery.name)}"
                    >`
                    :
                    `
                    <div class="gallery-cover-placeholder">
                        <span>Professional Studio</span>
                    </div>
                    `
                }

                <span class="gallery-status ${status}">
                    ${status.toUpperCase()}
                </span>

            </div>


            <div class="gallery-card-body">

                <div class="gallery-card-heading">

                    <div>

                        <h3>
                            ${escapeHtml(gallery.name)}
                        </h3>

                        <p>
                            ${escapeHtml(gallery.clientName)}
                        </p>

                    </div>

                </div>


                <div class="gallery-card-meta">

                    <span>
                        ${gallery.durationMonths} months
                    </span>

                    <span>
                        ${Number(gallery.storageGB || 0)} GB
                    </span>

                    <span>
                        ${
                            daysRemaining > 0
                            ?
                            `${daysRemaining} days left`
                            :
                            "Expired"
                        }
                    </span>

                </div>


                <div class="gallery-card-footer">

                    <span class="delivery-mini ${gallery.deliveryStatus || "preparing"}">
                        ${
                            gallery.deliveryStatus === "sent"
                            ?
                            "Sent to Client"
                            :
                            "Preparing"
                        }
                    </span>

                    <button
                        type="button"
                        class="manage-gallery-btn"
                        data-gallery-id="${gallery.id}">
                        Manage Gallery
                    </button>

                </div>

            </div>

        `;


        const manageButton =
            card.querySelector(
                ".manage-gallery-btn"
            );


        manageButton.addEventListener(
            "click",
            () => {

                openGallery(
                    gallery.id
                );

            }
        );


        return card;

    }


    /* =====================================================
       OPEN GALLERY
    ====================================================== */

    function openGallery(id) {

        const gallery =
            galleries.find(
                item =>
                    item.id === id
            );


        if (!gallery) {
            return;
        }


        selectedGalleryId =
            id;


        currentTab =
            "overview";


        populateGalleryModal(
            gallery
        );


        galleryModal.classList.add(
            "open"
        );


        document.body.classList.add(
            "modal-open"
        );

    }


    /* =====================================================
       CLOSE GALLERY
    ====================================================== */

    function closeModal() {

        galleryModal.classList.remove(
            "open"
        );

        document.body.classList.remove(
            "modal-open"
        );

        selectedGalleryId =
            null;

    }


    if (closeGalleryModal) {

        closeGalleryModal.addEventListener(
            "click",
            closeModal
        );

    }


    if (galleryModal) {

        galleryModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    galleryModal
                ) {

                    closeModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                galleryModal.classList.contains(
                    "open"
                )
            ) {

                closeModal();

            }

        }
    );


    /* =====================================================
       POPULATE GALLERY MODAL
    ====================================================== */

    function populateGalleryModal(gallery) {

        if (!gallery) {
            return;
        }


        const title =
            document.getElementById(
                "modalGalleryTitle"
            );

        const subtitle =
            document.getElementById(
                "modalGallerySubtitle"
            );


        if (title) {

            title.textContent =
                gallery.name;

        }


        if (subtitle) {

            subtitle.textContent =
                gallery.clientName;

        }


        const editGalleryName =
            document.getElementById(
                "editGalleryName"
            );

        const editClientName =
            document.getElementById(
                "editClientName"
            );

        const editGalleryDescription =
            document.getElementById(
                "editGalleryDescription"
            );


        if (editGalleryName) {

            editGalleryName.value =
                gallery.name || "";

        }


        if (editClientName) {

            editClientName.value =
                gallery.clientName || "";

        }


        if (editGalleryDescription) {

            editGalleryDescription.value =
                gallery.description || "";

        }


        const storageUsed =
            document.getElementById(
                "modalStorageUsed"
            );

        const storageLimit =
            document.getElementById(
                "modalStorageLimit"
            );


        if (storageUsed) {

            storageUsed.textContent =
                `${Number(
                    gallery.storageUsedGB || 0
                ).toFixed(1)} GB`;

        }


        if (storageLimit) {

            storageLimit.textContent =
                `${Number(
                    gallery.storageGB || 0
                )} GB`;

        }


        const storageProgress =
            document.getElementById(
                "storageProgress"
            );


        if (storageProgress) {

            const percentage =
                gallery.storageGB > 0
                ?
                Math.min(
                    100,
                    (
                        Number(
                            gallery.storageUsedGB || 0
                        ) /
                        Number(
                            gallery.storageGB
                        )
                    ) * 100
                )
                :
                0;


            storageProgress.style.width =
                `${percentage}%`;

        }


        const expiryDate =
            document.getElementById(
                "modalExpiryDate"
            );


        if (expiryDate) {

            expiryDate.textContent =
                formatDate(
                    gallery.expiresAt
                );

        }


        const daysLeft =
            document.getElementById(
                "modalDaysLeft"
            );


        if (daysLeft) {

            const days =
                getDaysRemaining(
                    gallery.expiresAt
                );

            daysLeft.textContent =
                days > 0
                ?
                `${days} days remaining`
                :
                "Gallery expired";

        }


        const galleryLink =
            document.getElementById(
                "galleryClientLink"
            );


        if (galleryLink) {

            galleryLink.value =
                gallery.galleryLink || "";

        }


        const passwordInput =
            document.getElementById(
                "galleryPassword"
            );


        if (passwordInput) {

            passwordInput.value =
                gallery.password || "";

        }


        const passwordToggle =
            document.getElementById(
                "passwordProtectionToggle"
            );


        if (passwordToggle) {

            passwordToggle.checked =
                gallery.passwordEnabled !== false;

        }


        const downloadsToggle =
            document.getElementById(
                "downloadsToggle"
            );


        if (downloadsToggle) {

            downloadsToggle.checked =
                gallery.downloadsEnabled !== false;

        }


        const visibilityToggle =
            document.getElementById(
                "visibilityToggle"
            );


        if (visibilityToggle) {

            visibilityToggle.checked =
                gallery.visible === true;

        }


        renderMedia(
            gallery
        );

        renderAlbums(
            gallery
        );

        updatePasswordVisibility();

        updateDeliveryReadiness();

    }


    /* =====================================================
       TABS
    ====================================================== */

    const tabButtons =
        document.querySelectorAll(
            "[data-tab]"
        );


    tabButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const tab =
                        button.dataset.tab;

                    currentTab =
                        tab;


                    tabButtons.forEach(
                        item => {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        }
                    );


                    document
                        .querySelectorAll(
                            ".gallery-tab-panel"
                        )
                        .forEach(
                            panel => {

                                panel.classList.toggle(
                                    "active",
                                    panel.dataset.panel === tab
                                );

                            }
                        );

                }
            );

        }
    );


    /* =====================================================
       SAVE BASIC GALLERY INFORMATION
    ====================================================== */

    const saveGallerySettingsBtn =
        document.getElementById(
            "saveGallerySettings"
        );


    if (saveGallerySettingsBtn) {

        saveGallerySettingsBtn.addEventListener(
            "click",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                const nameInput =
                    document.getElementById(
                        "editGalleryName"
                    );

                const clientInput =
                    document.getElementById(
                        "editClientName"
                    );

                const descriptionInput =
                    document.getElementById(
                        "editGalleryDescription"
                    );


                const name =
                    nameInput
                    ?
                    nameInput.value.trim()
                    :
                    gallery.name;


                const clientName =
                    clientInput
                    ?
                    clientInput.value.trim()
                    :
                    gallery.clientName;


                const description =
                    descriptionInput
                    ?
                    descriptionInput.value.trim()
                    :
                    gallery.description;


                if (!name) {

                    showToast(
                        "Gallery name is required."
                    );

                    return;

                }


                if (!clientName) {

                    showToast(
                        "Client name is required."
                    );

                    return;

                }


                gallery.name =
                    name;

                gallery.clientName =
                    clientName;

                gallery.description =
                    description;


                saveGalleries();

                populateGalleryModal(
                    gallery
                );

                renderAll();

                showToast(
                    "Gallery information saved."
                );

            }
        );

    }


    /* =====================================================
       COPY CLIENT LINK
    ====================================================== */

    const copyGalleryLinkBtn =
        document.getElementById(
            "copyGalleryLink"
        );


    if (copyGalleryLinkBtn) {

        copyGalleryLinkBtn.addEventListener(
            "click",
            async () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        gallery.galleryLink
                    );

                    showToast(
                        "Client gallery link copied."
                    );

                } catch (error) {

                    const input =
                        document.getElementById(
                            "galleryClientLink"
                        );

                    if (input) {

                        input.select();

                        document.execCommand(
                            "copy"
                        );

                        showToast(
                            "Client gallery link copied."
                        );

                    }

                }

            }
        );

    }


    /* =====================================================
       PASSWORD
    ====================================================== */

    function generatePasswordValue() {

        return (
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase()
        );

    }


    function updatePasswordVisibility() {

        const gallery =
            getSelectedGallery();

        const passwordInput =
            document.getElementById(
                "galleryPassword"
            );

        if (
            !gallery ||
            !passwordInput
        ) {

            return;

        }


        passwordInput.disabled =
            gallery.passwordEnabled === false;

        passwordInput.type =
            "text";

    }


    const passwordToggle =
        document.getElementById(
            "passwordProtectionToggle"
        );


    if (passwordToggle) {

        passwordToggle.addEventListener(
            "change",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                gallery.passwordEnabled =
                    passwordToggle.checked;


                if (
                    gallery.passwordEnabled &&
                    !gallery.password
                ) {

                    gallery.password =
                        generatePasswordValue();

                }


                updatePasswordVisibility();

                updateDeliveryReadiness();

            }
        );

    }


    const savePasswordBtn =
        document.getElementById(
            "savePasswordBtn"
        );


    if (savePasswordBtn) {

        savePasswordBtn.addEventListener(
            "click",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                const passwordInput =
                    document.getElementById(
                        "galleryPassword"
                    );


                if (
                    gallery.passwordEnabled &&
                    (
                        !passwordInput ||
                        passwordInput.value.trim().length < 4
                    )
                ) {

                    showToast(
                        "Password must contain at least 4 characters."
                    );

                    return;

                }


                if (passwordInput) {

                    gallery.password =
                        passwordInput.value.trim();

                }


                saveGalleries();

                updateDeliveryReadiness();

                showToast(
                    "Password settings saved."
                );

            }
        );

    }


    /* =====================================================
       DOWNLOADS
    ====================================================== */

    const downloadsToggle =
        document.getElementById(
            "downloadsToggle"
        );


    if (downloadsToggle) {

        downloadsToggle.addEventListener(
            "change",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                gallery.downloadsEnabled =
                    downloadsToggle.checked;


                saveGalleries();

                updateDeliveryReadiness();

            }
        );

    }


    /* =====================================================
       VISIBILITY
    ====================================================== */

    const visibilityToggle =
        document.getElementById(
            "visibilityToggle"
        );


    if (visibilityToggle) {

        visibilityToggle.addEventListener(
            "change",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                gallery.visible =
                    visibilityToggle.checked;


                saveGalleries();

                updateDeliveryReadiness();

            }
        );

    }


    /* =====================================================
       MEDIA
    ====================================================== */

    const mediaUploadInput =
        document.getElementById(
            "mediaUpload"
        );


    const mediaUploadBtn =
        document.getElementById(
            "mediaUploadBtn"
        );


    if (mediaUploadBtn && mediaUploadInput) {

        mediaUploadBtn.addEventListener(
            "click",
            () => {

                mediaUploadInput.click();

            }
        );

    }


    if (mediaUploadInput) {

        mediaUploadInput.addEventListener(
            "change",
            event => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                const files =
                    Array.from(
                        event.target.files || []
                    );


                if (!files.length) {
                    return;
                }


                if (!Array.isArray(gallery.media)) {

                    gallery.media =
                        [];

                }


                files.forEach(
                    file => {

                        const type =
                            file.type.startsWith(
                                "video/"
                            )
                            ?
                            "video"
                            :
                            "photo";


                        const url =
                            URL.createObjectURL(
                                file
                            );


                        const sizeGB =
                            file.size /
                            (
                                1024 *
                                1024 *
                                1024
                            );


                        gallery.media.push({

                            id:
                                generateId(),

                            name:
                                file.name,

                            type:
                                type,

                            url:
                                url,

                            sizeGB:
                                sizeGB,

                            albumId:
                                gallery.albums &&
                                gallery.albums[0]
                                ?
                                gallery.albums[0].id
                                :
                                null

                        });

                    }
                );


                gallery.storageUsedGB =
                    gallery.media.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item.sizeGB || 0
                            ),
                        0
                    );


                if (
                    gallery.albums &&
                    gallery.albums[0]
                ) {

                    gallery.albums[0].mediaCount =
                        gallery.media.filter(
                            item =>
                                item.albumId ===
                                gallery.albums[0].id
                        ).length;

                }


                saveGalleries();

                renderMedia(
                    gallery
                );

                renderAlbums(
                    gallery
                );

                updateStats();

                updateDeliveryReadiness();

                showToast(
                    `${files.length} file${files.length > 1 ? "s" : ""} added.`
                );


                mediaUploadInput.value =
                    "";

            }
        );

    }


    /* =====================================================
       RENDER MEDIA
    ====================================================== */

    function renderMedia(gallery) {

        const mediaGrid =
            document.getElementById(
                "mediaGrid"
            );


        if (!mediaGrid) {
            return;
        }


        mediaGrid.innerHTML =
            "";


        if (
            !Array.isArray(
                gallery.media
            ) ||
            !gallery.media.length
        ) {

            mediaGrid.innerHTML = `
                <div class="media-empty">
                    <strong>No media uploaded yet.</strong>
                    <span>Add photos or videos to prepare this gallery.</span>
                </div>
            `;

            return;

        }


        gallery.media.forEach(
            media => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "media-item";


                if (
                    media.type === "video"
                ) {

                    item.innerHTML = `

                        <video
                            src="${media.url}"
                            controls>
                        </video>

                        <div class="media-item-info">

                            <span>
                                ${escapeHtml(media.name)}
                            </span>

                            <button
                                type="button"
                                class="remove-media"
                                data-media-id="${media.id}">
                                Remove
                            </button>

                        </div>

                    `;

                } else {

                    item.innerHTML = `

                        <img
                            src="${media.url}"
                            alt="${escapeHtml(media.name)}"
                        >

                        <div class="media-item-info">

                            <span>
                                ${escapeHtml(media.name)}
                            </span>

                            <button
                                type="button"
                                class="remove-media"
                                data-media-id="${media.id}">
                                Remove
                            </button>

                        </div>

                    `;

                }


                const removeButton =
                    item.querySelector(
                        ".remove-media"
                    );


                removeButton.addEventListener(
                    "click",
                    () => {

                        removeMedia(
                            media.id
                        );

                    }
                );


                mediaGrid.appendChild(
                    item
                );

            }
        );

    }


    /* =====================================================
       REMOVE MEDIA
    ====================================================== */

    function removeMedia(mediaId) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }


        const media =
            gallery.media.find(
                item =>
                    item.id === mediaId
            );


        if (!media) {
            return;
        }


        const confirmed =
            window.confirm(
                `Remove "${media.name}" from this gallery?`
            );


        if (!confirmed) {
            return;
        }


        gallery.media =
            gallery.media.filter(
                item =>
                    item.id !== mediaId
            );


        gallery.storageUsedGB =
            gallery.media.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.sizeGB || 0
                    ),
                0
            );


        if (gallery.albums) {

            gallery.albums.forEach(
                album => {

                    album.mediaCount =
                        gallery.media.filter(
                            item =>
                                item.albumId ===
                                album.id
                        ).length;

                }
            );

        }


        saveGalleries();

        renderMedia(
            gallery
        );

        renderAlbums(
            gallery
        );

        updateStats();

        updateDeliveryReadiness();

        showToast(
            "Media removed."
        );

    }


    /* =====================================================
       ALBUMS / SECTIONS
    ====================================================== */

    function renderAlbums(gallery) {

        const albumsList =
            document.getElementById(
                "albumsList"
            );


        if (!albumsList) {
            return;
        }


        albumsList.innerHTML =
            "";


        if (
            !Array.isArray(
                gallery.albums
            ) ||
            !gallery.albums.length
        ) {

            albumsList.innerHTML = `
                <div class="albums-empty">
                    No sections created yet.
                </div>
            `;

            return;

        }


        gallery.albums.forEach(
            album => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "album-item";


                const count =
                    gallery.media
                        ?
                        gallery.media.filter(
                            media =>
                                media.albumId ===
                                album.id
                        ).length
                        :
                        Number(
                            album.mediaCount || 0
                        );


                item.innerHTML = `

                    <div class="album-info">

                        <strong>
                            ${escapeHtml(album.name)}
                        </strong>

                        <span>
                            ${count}
                            ${count === 1 ? "item" : "items"}
                        </span>

                    </div>


                    <div class="album-actions">

                        <button
                            type="button"
                            class="edit-album"
                            data-album-id="${album.id}">
                            Edit
                        </button>

                        <button
                            type="button"
                            class="delete-album"
                            data-album-id="${album.id}">
                            Delete
                        </button>

                    </div>

                `;


                const editButton =
                    item.querySelector(
                        ".edit-album"
                    );


                editButton.addEventListener(
                    "click",
                    () => {

                        editAlbum(
                            album.id
                        );

                    }
                );


                const deleteButton =
                    item.querySelector(
                        ".delete-album"
                    );


                deleteButton.addEventListener(
                    "click",
                    () => {

                        deleteAlbum(
                            album.id
                        );

                    }
                );


                albumsList.appendChild(
                    item
                );

            }
        );

    }


    /* =====================================================
       CREATE ALBUM
    ====================================================== */

    const createAlbumBtn =
        document.getElementById(
            "createAlbumBtn"
        );


    const albumModal =
        document.getElementById(
            "albumModal"
        );


    const albumForm =
        document.getElementById(
            "albumForm"
        );


    const albumName =
        document.getElementById(
            "albumName"
        );


    let editingAlbumId =
        null;


    if (createAlbumBtn) {

        createAlbumBtn.addEventListener(
            "click",
            () => {

                editingAlbumId =
                    null;


                if (albumName) {

                    albumName.value =
                        "";

                }


                if (albumModal) {

                    albumModal.classList.add(
                        "open"
                    );

                }

            }
        );

    }


    if (albumForm) {

        albumForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                const name =
                    albumName
                    ?
                    albumName.value.trim()
                    :
                    "";


                if (!name) {

                    showToast(
                        "Section name is required."
                    );

                    return;

                }


                if (!Array.isArray(gallery.albums)) {

                    gallery.albums =
                        [];

                }


                if (editingAlbumId) {

                    const album =
                        gallery.albums.find(
                            item =>
                                item.id ===
                                editingAlbumId
                        );


                    if (album) {

                        album.name =
                            name;

                    }

                } else {

                    gallery.albums.push({

                        id:
                            generateId(),

                        name:
                            name,

                        mediaCount:
                            0

                    });

                }


                saveGalleries();

                renderAlbums(
                    gallery
                );


                if (albumModal) {

                    albumModal.classList.remove(
                        "open"
                    );

                }


                showToast(
                    editingAlbumId
                    ?
                    "Section updated."
                    :
                    "Section created."
                );


                editingAlbumId =
                    null;

            }
        );

    }


    function editAlbum(albumId) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }


        const album =
            gallery.albums.find(
                item =>
                    item.id === albumId
            );


        if (!album) {
            return;
        }


        editingAlbumId =
            albumId;


        if (albumName) {

            albumName.value =
                album.name;

        }


        if (albumModal) {

            albumModal.classList.add(
                "open"
            );

        }

    }


    function deleteAlbum(albumId) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }


        const album =
            gallery.albums.find(
                item =>
                    item.id === albumId
            );


        if (!album) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete the "${album.name}" section?`
            );


        if (!confirmed) {
            return;
        }


        gallery.albums =
            gallery.albums.filter(
                item =>
                    item.id !== albumId
            );


        gallery.media.forEach(
            media => {

                if (
                    media.albumId ===
                    albumId
                ) {

                    media.albumId =
                        null;

                }

            }
        );


        saveGalleries();

        renderAlbums(
            gallery
        );

        renderMedia(
            gallery
        );


        showToast(
            "Section deleted."
        );

    }


    const closeAlbumModal =
        document.getElementById(
            "closeAlbumModal"
        );


    if (closeAlbumModal) {

        closeAlbumModal.addEventListener(
            "click",
            () => {

                if (albumModal) {

                    albumModal.classList.remove(
                        "open"
                    );

                }

                editingAlbumId =
                    null;

            }
        );

    }


    /* =====================================================
       DELETE GALLERY
    ====================================================== */

    const deleteGalleryBtn =
        document.getElementById(
            "deleteGalleryBtn"
        );


    if (deleteGalleryBtn) {

        deleteGalleryBtn.addEventListener(
            "click",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                const confirmed =
                    window.confirm(
                        `Delete "${gallery.name}" permanently? This cannot be undone.`
                    );


                if (!confirmed) {
                    return;
                }


                galleries =
                    galleries.filter(
                        item =>
                            item.id !==
                            gallery.id
                    );


                saveGalleries();

                closeModal();

                renderAll();

                showToast(
                    "Gallery deleted."
                );

            }
        );

    }


    /* =====================================================
       CLIENT DELIVERY READINESS
    ====================================================== */

    const sendToClientBtn =
        document.getElementById(
            "sendToClientBtn"
        );


    function updateDeliveryReadiness() {

        if (!sendToClientBtn) {
            return;
        }


        const gallery =
            getSelectedGallery();


        if (!gallery) {
            return;
        }


        if (!gallery.deliveryStatus) {

            gallery.deliveryStatus =
                "preparing";

        }


        if (
            !Object.prototype.hasOwnProperty.call(
                gallery,
                "sentAt"
            )
        ) {

            gallery.sentAt =
                null;

        }


        const nameCheck =
            document.getElementById(
                "checkGalleryName"
            );


        const mediaCheck =
            document.getElementById(
                "checkMedia"
            );


        const passwordCheck =
            document.getElementById(
                "checkPassword"
            );


        const downloadsCheck =
            document.getElementById(
                "checkDownloads"
            );


        const storageCheck =
            document.getElementById(
                "checkStorage"
            );


        const hasGalleryName =
            Boolean(
                gallery.name &&
                gallery.name.trim() &&
                gallery.clientName &&
                gallery.clientName.trim()
            );


        const hasMedia =
            Array.isArray(
                gallery.media
            ) &&
            gallery.media.length > 0;


        const passwordReady =
            !gallery.passwordEnabled ||
            Boolean(
                gallery.password &&
                gallery.password.trim().length >= 4
            );


        const downloadsReady =
            typeof gallery.downloadsEnabled ===
            "boolean";


        const storageUsed =
            Number(
                gallery.storageUsedGB || 0
            );


        const storageLimit =
            Number(
                gallery.storageGB || 0
            );


        const storageReady =
            storageLimit > 0 &&
            storageUsed <= storageLimit;


        const accessReady =
            gallery.visible === true &&
            passwordReady;


        setReadinessState(
            nameCheck,
            hasGalleryName
        );


        setReadinessState(
            mediaCheck,
            hasMedia
        );


        setReadinessState(
            passwordCheck,
            accessReady
        );


        setReadinessState(
            downloadsCheck,
            downloadsReady
        );


        setReadinessState(
            storageCheck,
            storageReady
        );


        const galleryStatus =
            getGalleryStatus(
                gallery
            );


        const galleryExpired =
            galleryStatus === "expired";


        const gallerySent =
            gallery.deliveryStatus ===
            "sent";


        const ready =
            hasGalleryName &&
            hasMedia &&
            accessReady &&
            downloadsReady &&
            storageReady &&
            !galleryExpired;


        const deliveryStatus =
            document.getElementById(
                "deliveryStatus"
            );


        const deliveryMessage =
            document.getElementById(
                "deliveryMessage"
            );


        const deliveryExpiry =
            document.getElementById(
                "deliveryExpiry"
            );


        if (gallerySent) {

            deliveryStatus.textContent =
                "SENT TO CLIENT";


            deliveryStatus.className =
                "delivery-status sent";


            deliveryMessage.textContent =
                "This gallery has been sent to the client.";


            deliveryExpiry.textContent =
                `Client access is available until ${formatDate(gallery.expiresAt)}.`;


            sendToClientBtn.disabled =
                false;


            sendToClientBtn.textContent =
                "Client Access Active";


            return;

        }


        if (galleryExpired) {

            deliveryStatus.textContent =
                "EXPIRED";


            deliveryStatus.className =
                "delivery-status expired";


            deliveryMessage.textContent =
                "This gallery has expired and cannot be delivered.";


            deliveryExpiry.textContent =
                `Expired on ${formatDate(gallery.expiresAt)}.`;


            sendToClientBtn.disabled =
                true;


            sendToClientBtn.textContent =
                "Gallery Expired";


            return;

        }


        if (ready) {

            deliveryStatus.textContent =
                "READY TO DELIVER";


            deliveryStatus.className =
                "delivery-status ready";


            deliveryMessage.textContent =
                "Everything is ready. You can send this gallery to the client.";


            deliveryExpiry.textContent =
                `Client access will remain available until ${formatDate(gallery.expiresAt)}.`;


            sendToClientBtn.disabled =
                false;


            sendToClientBtn.textContent =
                "Send to Client";


            return;

        }


        deliveryStatus.textContent =
            "PREPARING";


        deliveryStatus.className =
            "delivery-status preparing";


        deliveryMessage.textContent =
            "Finish the required setup before sending this gallery.";


        deliveryExpiry.textContent =
            `Gallery expires on ${formatDate(gallery.expiresAt)}.`;


        sendToClientBtn.disabled =
            true;


        sendToClientBtn.textContent =
            "Complete Setup";

    }


    function setReadinessState(
        element,
        complete
    ) {

        if (!element) {
            return;
        }


        element.classList.toggle(
            "complete",
            complete
        );


        element.classList.toggle(
            "incomplete",
            !complete
        );


        const icon =
            element.querySelector(
                ".readiness-icon"
            );


        if (icon) {

            icon.textContent =
                complete
                ?
                "✓"
                :
                "•";

        }

    }


    if (sendToClientBtn) {

        sendToClientBtn.addEventListener(
            "click",
            () => {

                const gallery =
                    getSelectedGallery();


                if (!gallery) {
                    return;
                }


                if (
                    getGalleryStatus(
                        gallery
                    ) === "expired"
                ) {

                    showToast(
                        "This gallery has expired."
                    );


                    updateDeliveryReadiness();

                    return;

                }


                const hasName =
                    Boolean(
                        gallery.name &&
                        gallery.name.trim() &&
                        gallery.clientName &&
                        gallery.clientName.trim()
                    );


                const hasMedia =
                    Array.isArray(
                        gallery.media
                    ) &&
                    gallery.media.length > 0;


                const passwordReady =
                    !gallery.passwordEnabled ||
                    Boolean(
                        gallery.password &&
                        gallery.password.trim().length >= 4
                    );


                const accessReady =
                    gallery.visible === true &&
                    passwordReady;


                const downloadsReady =
                    typeof gallery.downloadsEnabled ===
                    "boolean";


                const storageUsed =
                    Number(
                        gallery.storageUsedGB || 0
                    );


                const storageLimit =
                    Number(
                        gallery.storageGB || 0
                    );


                const storageReady =
                    storageLimit > 0 &&
                    storageUsed <= storageLimit;


                if (
                    !hasName ||
                    !hasMedia ||
                    !accessReady ||
                    !downloadsReady ||
                    !storageReady
                ) {

                    showToast(
                        "Complete the gallery setup first."
                    );


                    updateDeliveryReadiness();

                    return;

                }


                if (
                    gallery.deliveryStatus ===
                    "sent"
                ) {

                    showToast(
                        "Gallery is already active for the client."
                    );

                    return;

                }


                const confirmed =
                    window.confirm(
                        `Send "${gallery.name}" to ${gallery.clientName}?`
                    );


                if (!confirmed) {
                    return;
                }


                gallery.deliveryStatus =
                    "sent";


                gallery.sentAt =
                    new Date().toISOString();


                gallery.visible =
                    true;


                saveGalleries();

                populateGalleryModal(
                    gallery
                );

                renderAll();

                updateDeliveryReadiness();


                showToast(
                    "Gallery sent to client."
                );

            }
        );

    }


    /* =====================================================
       GET SELECTED GALLERY
    ====================================================== */

    function getSelectedGallery() {

        return galleries.find(
            gallery =>
                gallery.id ===
                selectedGalleryId
        );

    }


    /* =====================================================
       SEARCH
    ====================================================== */

    if (gallerySearch) {

        gallerySearch.addEventListener(
            "input",
            renderGalleryCards
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderGalleryCards
        );

    }


    /* =====================================================
       MOBILE MENU
    ====================================================== */

    if (mobileMenuBtn) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                mobileMenu.classList.toggle(
                    "open"
                );

            }
        );

    }


    if (mobileMenu) {

        mobileMenu
            .querySelectorAll("a")
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        () => {

                            mobileMenu.classList.remove(
                                "open"
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       TOAST
    ====================================================== */

    let toastTimer;


    function showToast(message) {

        if (!toast || !toastMessage) {
            return;
        }


        toastMessage.textContent =
            message;


        toast.classList.add(
            "show"
        );


        clearTimeout(
            toastTimer
        );


        toastTimer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                2800
            );

    }


    /* =====================================================
       ESCAPE HTML
    ====================================================== */

    function escapeHtml(value) {

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


    /* =====================================================
       SHOP PAGE CONNECTION
    ====================================================== */

    /*
        This listens for the purchase created by
        galleryShop.js.

        The Gallery Shop should set:

        professionalStudioPendingGallery

        before redirecting to this page.
    */


    checkForShopPurchase();


    /* =====================================================
       INITIAL RENDER
    ====================================================== */

    renderAll();

});