/* =========================================================
   PROFESSIONAL STUDIO
   CLIENT GALLERIES
   COMPLETE JAVASCRIPT
========================================================= */

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
                true,

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

                let matchesStatus = true;


                if (
                    filter !== "all"
                ) {

                    matchesStatus =
                        status === filter;

                }


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


        if (
            galleries.length === 0
        ) {

            emptyState.style.display =
                "flex";

            galleryGrid.style.display =
                "none";

            return;

        }


        emptyState.style.display =
            "none";

        galleryGrid.style.display =
            "grid";


        if (
            filtered.length === 0
        ) {

            galleryGrid.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ⌕
                    </div>

                    <h3>
                        No galleries found.
                    </h3>

                    <p>
                        Try a different search or filter.
                    </p>

                </div>

            `;

            return;

        }


        filtered.forEach(
            gallery => {

                galleryGrid.appendChild(
                    createGalleryCard(
                        gallery
                    )
                );

            }
        );

    }


    /* =====================================================
       CREATE GALLERY CARD
    ====================================================== */

    function createGalleryCard(gallery) {

        const card =
            document.createElement("article");

        card.className =
            "gallery-card";


        const status =
            getGalleryStatus(
                gallery
            );


        const days =
            getDaysRemaining(
                gallery.expiresAt
            );


        let statusText =
            "ACTIVE";


        if (
            status === "expiring"
        ) {

            statusText =
                "EXPIRING SOON";

        }


        if (
            status === "expired"
        ) {

            statusText =
                "EXPIRED";

        }


        const storageUsed =
            Number(
                gallery.storageUsedGB || 0
            );

        const storageLimit =
            Number(
                gallery.storageGB
            );

        const storagePercentage =
            Math.min(
                100,
                (storageUsed /
                    storageLimit) *
                100
            );


        let expiryText =
            `${days} days left`;


        if (
            status === "expired"
        ) {

            expiryText =
                "Expired";

        }


        card.innerHTML = `

            <div class="gallery-cover">

                <div class="cover-pattern"></div>

                <span class="gallery-status">
                    ${statusText}
                </span>

                <div class="gallery-cover-icon">
                    ▧
                </div>

            </div>


            <div class="gallery-card-body">

                <div class="gallery-card-title">

                    <div>

                        <h3>
                            ${escapeHtml(
                                gallery.name
                            )}
                        </h3>

                        <p class="gallery-card-client">
                            ${escapeHtml(
                                gallery.clientName
                            )}
                        </p>

                    </div>


                    <button
                        type="button"
                        class="card-menu"
                        data-id="${gallery.id}"
                        aria-label="Gallery menu">

                        ···

                    </button>

                </div>


                <div class="gallery-card-meta">

                    <div class="gallery-meta-item">

                        <span>
                            DURATION
                        </span>

                        <strong>
                            ${gallery.durationMonths}
                            months
                        </strong>

                    </div>


                    <div class="gallery-meta-item">

                        <span>
                            EXPIRES
                        </span>

                        <strong>
                            ${expiryText}
                        </strong>

                    </div>

                </div>


                <div class="gallery-card-footer">

                    <span class="storage-mini">
                        ${storageUsed.toFixed(1)}
                        / ${storageLimit} GB
                        · ${Math.round(storagePercentage)}%
                    </span>


                    <button
                        type="button"
                        class="manage-btn"
                        data-id="${gallery.id}">

                        Manage

                    </button>

                </div>

            </div>

        `;


        const manageButton =
            card.querySelector(
                ".manage-btn"
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
       ESCAPE HTML
    ====================================================== */

    function escapeHtml(value) {

        return String(value)
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


        populateGalleryModal(
            gallery
        );


        galleryModal.classList.add(
            "open"
        );


        document.body.style.overflow =
            "hidden";


        switchTab(
            "overview"
        );

    }


    /* =====================================================
       CLOSE GALLERY
    ====================================================== */

    function closeGallery() {

        galleryModal.classList.remove(
            "open"
        );

        document.body.style.overflow =
            "";

    }


    /* =====================================================
       POPULATE MODAL
    ====================================================== */

    function populateGalleryModal(
        gallery
    ) {

        document.getElementById(
            "modalGalleryName"
        ).textContent =
            gallery.name;


        document.getElementById(
            "modalClientName"
        ).textContent =
            gallery.clientName;


        const status =
            getGalleryStatus(
                gallery
            );


        const statusElement =
            document.getElementById(
                "modalStatus"
            );


        statusElement.textContent =
            status === "expired"
                ? "EXPIRED"
                : status === "expiring"
                    ? "EXPIRING SOON"
                    : "ACTIVE";


        document.getElementById(
            "modalStorage"
        ).textContent =
            `${gallery.storageGB} GB`;


        document.getElementById(
            "modalDuration"
        ).textContent =
            `${gallery.durationMonths} months`;


        document.getElementById(
            "modalExpiry"
        ).textContent =
            formatDate(
                gallery.expiresAt
            );


        const days =
            getDaysRemaining(
                gallery.expiresAt
            );


        document.getElementById(
            "modalExpiryNote"
        ).textContent =
            days > 0
                ? `${days} days remaining`
                : "Gallery has expired";


        document.getElementById(
            "modalDownloads"
        ).textContent =
            gallery.downloadsEnabled
                ? "Enabled"
                : "Disabled";


        document.getElementById(
            "modalGalleryLink"
        ).value =
            gallery.galleryLink;


        const used =
            Number(
                gallery.storageUsedGB || 0
            );


        const limit =
            Number(
                gallery.storageGB
            );


        const percentage =
            Math.min(
                100,
                (used / limit) * 100
            );


        document.getElementById(
            "modalStorageProgress"
        ).style.width =
            `${percentage}%`;


        document.getElementById(
            "modalStorageText"
        ).textContent =
            `${used.toFixed(1)} GB used of ${limit} GB`;


        document.getElementById(
            "passwordEnabled"
        ).checked =
            gallery.passwordEnabled;


        document.getElementById(
            "galleryPassword"
        ).value =
            gallery.password || "";


        document.getElementById(
            "downloadsEnabled"
        ).checked =
            gallery.downloadsEnabled;


        document.getElementById(
            "galleryVisible"
        ).checked =
            gallery.visible;


        document.getElementById(
            "editGalleryName"
        ).value =
            gallery.name;


        document.getElementById(
            "editClientName"
        ).value =
            gallery.clientName;


        document.getElementById(
            "editGalleryDescription"
        ).value =
            gallery.description || "";


        renderMedia(
            gallery
        );


        renderAlbums(
            gallery
        );


        updatePasswordVisibility();

    }


    /* =====================================================
       TABS
    ====================================================== */

    function switchTab(tabName) {

        currentTab =
            tabName;


        document
            .querySelectorAll(
                ".gallery-tab"
            )
            .forEach(tab => {

                tab.classList.toggle(
                    "active",
                    tab.dataset.tab === tabName
                );

            });


        document
            .querySelectorAll(
                ".tab-content"
            )
            .forEach(content => {

                content.classList.toggle(
                    "active",
                    content.id ===
                    `tab-${tabName}`
                );

            });

    }


    document
        .querySelectorAll(
            ".gallery-tab"
        )
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    switchTab(
                        tab.dataset.tab
                    );

                }
            );

        });


    document
        .querySelectorAll(
            "[data-open-tab]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    switchTab(
                        button.dataset.openTab
                    );

                }
            );

        });


    /* =====================================================
       SEARCH & FILTER
    ====================================================== */

    gallerySearch.addEventListener(
        "input",
        renderGalleryCards
    );


    statusFilter.addEventListener(
        "change",
        renderGalleryCards
    );


    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    closeGalleryModal.addEventListener(
        "click",
        closeGallery
    );


    galleryModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                galleryModal
            ) {

                closeGallery();

            }

        }
    );


    /* =====================================================
       COPY LINK
    ====================================================== */

    document
        .getElementById(
            "copyLinkBtn"
        )
        .addEventListener(
            "click",
            async () => {

                const input =
                    document.getElementById(
                        "modalGalleryLink"
                    );


                try {

                    await navigator.clipboard.writeText(
                        input.value
                    );

                    showToast(
                        "Gallery link copied."
                    );

                } catch {

                    input.select();

                    document.execCommand(
                        "copy"
                    );

                    showToast(
                        "Gallery link copied."
                    );

                }

            }
        );


    /* =====================================================
       PASSWORD TOGGLE
    ====================================================== */

    document
        .getElementById(
            "passwordEnabled"
        )
        .addEventListener(
            "change",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }

                gallery.passwordEnabled =
                    document.getElementById(
                        "passwordEnabled"
                    ).checked;

                saveGalleries();

                updatePasswordVisibility();

                showToast(
                    gallery.passwordEnabled
                        ? "Password protection enabled."
                        : "Password protection disabled."
                );

            }
        );


    function updatePasswordVisibility() {

        const enabled =
            document.getElementById(
                "passwordEnabled"
            ).checked;


        document.getElementById(
            "passwordSetting"
        ).style.display =
            enabled
                ? "block"
                : "none";

    }


    /* =====================================================
       GENERATE PASSWORD
    ====================================================== */

    document
        .getElementById(
            "generatePassword"
        )
        .addEventListener(
            "click",
            () => {

                document.getElementById(
                    "galleryPassword"
                ).value =
                    generatePasswordValue();

            }
        );


    function generatePasswordValue() {

        const characters =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        let password = "";


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            password +=
                characters[
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                ];

        }


        return password;

    }


    /* =====================================================
       SAVE PASSWORD
    ====================================================== */

    document
        .getElementById(
            "savePassword"
        )
        .addEventListener(
            "click",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                const password =
                    document.getElementById(
                        "galleryPassword"
                    ).value.trim();


                if (
                    gallery.passwordEnabled &&
                    password.length < 4
                ) {

                    showToast(
                        "Password must contain at least 4 characters."
                    );

                    return;

                }


                gallery.password =
                    password;


                saveGalleries();

                showToast(
                    "Gallery password saved."
                );

            }
        );


    /* =====================================================
       DOWNLOAD TOGGLE
    ====================================================== */

    document
        .getElementById(
            "downloadsEnabled"
        )
        .addEventListener(
            "change",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                gallery.downloadsEnabled =
                    document.getElementById(
                        "downloadsEnabled"
                    ).checked;


                saveGalleries();

                document.getElementById(
                    "modalDownloads"
                ).textContent =
                    gallery.downloadsEnabled
                        ? "Enabled"
                        : "Disabled";


                showToast(
                    gallery.downloadsEnabled
                        ? "Client downloads enabled."
                        : "Client downloads disabled."
                );

            }
        );


    /* =====================================================
       VISIBILITY TOGGLE
    ====================================================== */

    document
        .getElementById(
            "galleryVisible"
        )
        .addEventListener(
            "change",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                gallery.visible =
                    document.getElementById(
                        "galleryVisible"
                    ).checked;


                saveGalleries();

                showToast(
                    gallery.visible
                        ? "Gallery is now visible."
                        : "Gallery visibility disabled."
                );

            }
        );


    /* =====================================================
       SETTINGS FORM
    ====================================================== */

    document
        .getElementById(
            "gallerySettingsForm"
        )
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                const name =
                    document.getElementById(
                        "editGalleryName"
                    ).value.trim();


                const client =
                    document.getElementById(
                        "editClientName"
                    ).value.trim();


                const description =
                    document.getElementById(
                        "editGalleryDescription"
                    ).value.trim();


                if (!name) {

                    showToast(
                        "Gallery name is required."
                    );

                    return;

                }


                gallery.name =
                    name;

                gallery.clientName =
                    client || "Client";

                gallery.description =
                    description;


                saveGalleries();

                populateGalleryModal(
                    gallery
                );

                renderGalleryCards();

                showToast(
                    "Gallery details updated."
                );

            }
        );


    /* =====================================================
       DELETE GALLERY
    ====================================================== */

    document
        .getElementById(
            "deleteGalleryBtn"
        )
        .addEventListener(
            "click",
            () => {

                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                const confirmed =
                    window.confirm(
                        `Delete "${gallery.name}" permanently?`
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

                closeGallery();

                renderAll();

                showToast(
                    "Gallery deleted."
                );

            }
        );


    /* =====================================================
       MEDIA UPLOAD
    ====================================================== */

    const mediaUpload =
        document.getElementById(
            "mediaUpload"
        );


    mediaUpload.addEventListener(
        "change",
        event => {

            handleFiles(
                event.target.files
            );

            mediaUpload.value =
                "";

        }
    );


    const uploadZone =
        document.getElementById(
            "uploadZone"
        );


    uploadZone.addEventListener(
        "click",
        () => {

            mediaUpload.click();

        }
    );


    uploadZone.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            uploadZone.classList.add(
                "dragging"
            );

        }
    );


    uploadZone.addEventListener(
        "dragleave",
        () => {

            uploadZone.classList.remove(
                "dragging"
            );

        }
    );


    uploadZone.addEventListener(
        "drop",
        event => {

            event.preventDefault();

            uploadZone.classList.remove(
                "dragging"
            );

            handleFiles(
                event.dataTransfer.files
            );

        }
    );


    function handleFiles(
        fileList
    ) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }


        const files =
            Array.from(fileList);


        if (!files.length) {
            return;
        }


        let added =
            0;


        files.forEach(file => {

            const isPhoto =
                file.type.startsWith(
                    "image/"
                );


            const isVideo =
                file.type.startsWith(
                    "video/"
                );


            if (
                !isPhoto &&
                !isVideo
            ) {

                return;

            }


            const sizeGB =
                file.size /
                (1024 * 1024 * 1024);


            const currentUsage =
                Number(
                    gallery.storageUsedGB || 0
                );


            const limit =
                Number(
                    gallery.storageGB
                );


            if (
                currentUsage +
                sizeGB >
                limit
            ) {

                showToast(
                    "Storage limit reached."
                );

                return;

            }


            const mediaItem = {

                id:
                    generateId(),

                name:
                    file.name,

                type:
                    isPhoto
                        ? "photo"
                        : "video",

                sizeGB:
                    sizeGB,

                addedAt:
                    new Date().toISOString(),

                preview:
                    isPhoto
                        ? URL.createObjectURL(file)
                        : null

            };


            gallery.media.push(
                mediaItem
            );


            gallery.storageUsedGB =
                currentUsage +
                sizeGB;


            added++;

        });


        saveGalleries();

        populateGalleryModal(
            gallery
        );

        renderAll();


        if (added > 0) {

            showToast(
                `${added} media item${added > 1 ? "s" : ""} added.`
            );

        }

    }


    /* =====================================================
       RENDER MEDIA
    ====================================================== */

    function renderMedia(
        gallery
    ) {

        const mediaGrid =
            document.getElementById(
                "mediaGrid"
            );


        const mediaCount =
            document.getElementById(
                "mediaCount"
            );


        const mediaFilter =
            document.getElementById(
                "mediaFilter"
            );


        const filter =
            mediaFilter.value;


        const media =
            gallery.media || [];


        const filtered =
            media.filter(
                item => {

                    if (
                        filter === "all"
                    ) {
                        return true;
                    }

                    return item.type === filter;

                }
            );


        mediaCount.textContent =
            `${media.length} ${
                media.length === 1
                    ? "item"
                    : "items"
            }`;


        mediaGrid.innerHTML = "";


        if (
            filtered.length === 0
        ) {

            mediaGrid.innerHTML = `

                <div class="album-empty">

                    No media uploaded yet.

                </div>

            `;

            return;

        }


        filtered.forEach(
            item => {

                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "media-item";


                if (
                    item.type === "photo" &&
                    item.preview
                ) {

                    const img =
                        document.createElement(
                            "img"
                        );

                    img.src =
                        item.preview;

                    img.alt =
                        item.name;

                    element.appendChild(
                        img
                    );

                } else {

                    const video =
                        document.createElement(
                            "div"
                        );

                    video.className =
                        "media-video-placeholder";

                    video.textContent =
                        "▶";

                    element.appendChild(
                        video
                    );

                }


                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "media-item-info";


                info.textContent =
                    item.name;


                element.appendChild(
                    info
                );


                mediaGrid.appendChild(
                    element
                );

            }
        );

    }


    document
        .getElementById(
            "mediaFilter"
        )
        .addEventListener(
            "change",
            () => {

                const gallery =
                    getSelectedGallery();

                if (gallery) {

                    renderMedia(
                        gallery
                    );

                }

            }
        );


    /* =====================================================
       CREATE ALBUM
    ====================================================== */

    const albumModal =
        document.getElementById(
            "albumModal"
        );


    const createAlbumBtn =
        document.getElementById(
            "createAlbumBtn"
        );


    const closeAlbumModal =
        document.getElementById(
            "closeAlbumModal"
        );


    const cancelAlbum =
        document.getElementById(
            "cancelAlbum"
        );


    createAlbumBtn.addEventListener(
        "click",
        () => {

            document.getElementById(
                "albumName"
            ).value = "";

            albumModal.classList.add(
                "open"
            );

        }
    );


    closeAlbumModal.addEventListener(
        "click",
        closeAlbumModalWindow
    );


    cancelAlbum.addEventListener(
        "click",
        closeAlbumModalWindow
    );


    function closeAlbumModalWindow() {

        albumModal.classList.remove(
            "open"
        );

    }


    document
        .getElementById(
            "albumForm"
        )
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const gallery =
                    getSelectedGallery();

                if (!gallery) {
                    return;
                }


                const name =
                    document.getElementById(
                        "albumName"
                    ).value.trim();


                if (!name) {
                    return;
                }


                gallery.albums.push({

                    id:
                        generateId(),

                    name:
                        name,

                    mediaCount:
                        0

                });


                saveGalleries();

                renderAlbums(
                    gallery
                );

                closeAlbumModalWindow();

                showToast(
                    "Gallery section created."
                );

            }
        );


    /* =====================================================
       RENDER ALBUMS
    ====================================================== */

    function renderAlbums(
        gallery
    ) {

        const albumsGrid =
            document.getElementById(
                "albumsGrid"
            );


        const albums =
            gallery.albums || [];


        albumsGrid.innerHTML = "";


        if (
            albums.length === 0
        ) {

            albumsGrid.innerHTML = `

                <div class="album-empty">

                    No sections created yet.

                </div>

            `;

            return;

        }


        albums.forEach(
            album => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "album-card";


                card.innerHTML = `

                    <div>

                        <div class="album-card-icon">
                            □
                        </div>

                        <h4>
                            ${escapeHtml(
                                album.name
                            )}
                        </h4>

                        <p>
                            ${album.mediaCount || 0}
                            media items
                        </p>

                    </div>


                    <div class="album-card-footer">

                        <button
                            type="button"
                            data-action="rename"
                            data-album-id="${album.id}">

                            Rename

                        </button>


                        <button
                            type="button"
                            data-action="delete"
                            data-album-id="${album.id}">

                            Delete

                        </button>

                    </div>

                `;


                card
                    .querySelector(
                        '[data-action="rename"]'
                    )
                    .addEventListener(
                        "click",
                        () => {

                            renameAlbum(
                                gallery,
                                album.id
                            );

                        }
                    );


                card
                    .querySelector(
                        '[data-action="delete"]'
                    )
                    .addEventListener(
                        "click",
                        () => {

                            deleteAlbum(
                                gallery,
                                album.id
                            );

                        }
                    );


                albumsGrid.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       RENAME ALBUM
    ====================================================== */

    function renameAlbum(
        gallery,
        albumId
    ) {

        const album =
            gallery.albums.find(
                item =>
                    item.id ===
                    albumId
            );


        if (!album) {
            return;
        }


        const newName =
            window.prompt(
                "Enter the new section name:",
                album.name
            );


        if (
            !newName ||
            !newName.trim()
        ) {

            return;

        }


        album.name =
            newName.trim();


        saveGalleries();

        renderAlbums(
            gallery
        );

        showToast(
            "Section renamed."
        );

    }


    /* =====================================================
       DELETE ALBUM
    ====================================================== */

    function deleteAlbum(
        gallery,
        albumId
    ) {

        const album =
            gallery.albums.find(
                item =>
                    item.id ===
                    albumId
            );


        if (!album) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete "${album.name}"?`
            );


        if (!confirmed) {
            return;
        }


        gallery.albums =
            gallery.albums.filter(
                item =>
                    item.id !==
                    albumId
            );


        saveGalleries();

        renderAlbums(
            gallery
        );

        showToast(
            "Section deleted."
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


    mobileMenu
        .querySelectorAll("a")
        .forEach(link => {

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
       TOAST
    ====================================================== */

    let toastTimer;


    function showToast(message) {

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