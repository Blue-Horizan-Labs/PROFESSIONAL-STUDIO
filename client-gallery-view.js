/* =========================================================
   PROFESSIONAL STUDIO
   PRIVATE CLIENT GALLERY
   Client-Facing Gallery Controller
========================================================= */

(() => {
    "use strict";


    /* =========================================================
       CONSTANTS
    ========================================================= */

    const STORAGE_KEY =
        "professionalStudioGalleries";

    const DB_NAME =
        "professionalStudioDB";

    const DB_VERSION = 2;

    const MEDIA_STORE =
        "clientGalleryMedia";

    const WEDDING_ALBUM_NAME =
        "WEDDING ALBUM";


    /* =========================================================
       STATE
    ========================================================= */

    const state = {
        gallery: null,

        galleryId: null,

        authenticated: false,

        activeSectionId: null,

        mediaFilter: "all",

        visibleMedia: [],

        viewerIndex: -1,

        selectedMediaIds: new Set(),

        comments: {},

        generalComment: "",

        objectUrls: new Set(),

        db: null
    };


    /* =========================================================
       DOM
    ========================================================= */

    const refs = {
        passwordScreen:
            document.getElementById(
                "passwordScreen"
            ),

        passwordGalleryName:
            document.getElementById(
                "passwordGalleryName"
            ),

        passwordForm:
            document.getElementById(
                "passwordForm"
            ),

        galleryAccessPassword:
            document.getElementById(
                "galleryAccessPassword"
            ),

        togglePassword:
            document.getElementById(
                "togglePassword"
            ),

        passwordError:
            document.getElementById(
                "passwordError"
            ),

        expiredScreen:
            document.getElementById(
                "expiredScreen"
            ),

        notFoundScreen:
            document.getElementById(
                "notFoundScreen"
            ),

        galleryApp:
            document.getElementById(
                "galleryApp"
            ),

        galleryTitle:
            document.getElementById(
                "galleryTitle"
            ),

        galleryDescription:
            document.getElementById(
                "galleryDescription"
            ),

        heroMediaCount:
            document.getElementById(
                "heroMediaCount"
            ),

        heroExpiry:
            document.getElementById(
                "heroExpiry"
            ),

        sectionNavigation:
            document.getElementById(
                "sectionNavigation"
            ),

        currentSectionTitle:
            document.getElementById(
                "currentSectionTitle"
            ),

        currentSectionCount:
            document.getElementById(
                "currentSectionCount"
            ),

        clientMediaGrid:
            document.getElementById(
                "clientMediaGrid"
            ),

        mediaEmptyState:
            document.getElementById(
                "mediaEmptyState"
            ),

        albumSelectionBar:
            document.getElementById(
                "albumSelectionBar"
            ),

        selectionCount:
            document.getElementById(
                "selectionCount"
            ),

        selectionLimitText:
            document.getElementById(
                "selectionLimitText"
            ),

        headerSelectionCount:
            document.getElementById(
                "headerSelectionCount"
            ),

        openSelectionSummary:
            document.getElementById(
                "openSelectionSummary"
            ),

        selectionModal:
            document.getElementById(
                "selectionModal"
            ),

        closeSelectionModal:
            document.getElementById(
                "closeSelectionModal"
            ),

        closeSelectionModalBtn:
            document.getElementById(
                "closeSelectionModalBtn"
            ),

        summarySelectionCount:
            document.getElementById(
                "summarySelectionCount"
            ),

        summaryLimitText:
            document.getElementById(
                "summaryLimitText"
            ),

        selectedMediaList:
            document.getElementById(
                "selectedMediaList"
            ),

        selectionGeneralComment:
            document.getElementById(
                "selectionGeneralComment"
            ),

        submitSelectionBtn:
            document.getElementById(
                "submitSelectionBtn"
            ),

        submittedModal:
            document.getElementById(
                "submittedModal"
            ),

        submittedCount:
            document.getElementById(
                "submittedCount"
            ),

        closeSubmittedModal:
            document.getElementById(
                "closeSubmittedModal"
            ),

        mediaViewer:
            document.getElementById(
                "mediaViewer"
            ),

        viewerMedia:
            document.getElementById(
                "viewerMedia"
            ),

        viewerMediaName:
            document.getElementById(
                "viewerMediaName"
            ),

        viewerMediaPosition:
            document.getElementById(
                "viewerMediaPosition"
            ),

        viewerSelectBtn:
            document.getElementById(
                "viewerSelectBtn"
            ),

        viewerDownloadBtn:
            document.getElementById(
                "viewerDownloadBtn"
            ),

        closeViewer:
            document.getElementById(
                "closeViewer"
            ),

        previousMedia:
            document.getElementById(
                "previousMedia"
            ),

        nextMedia:
            document.getElementById(
                "nextMedia"
            ),

        clientToast:
            document.getElementById(
                "clientToast"
            ),

        clientToastMessage:
            document.getElementById(
                "clientToastMessage"
            )
    };


    /* =========================================================
       SCREEN CONTROLLER
       
       Exactly ONE of these states can be visible:
       
       1. Password
       2. Expired
       3. Not Found
       4. Gallery
    ========================================================= */

    function hideAllScreens() {
        refs.passwordScreen?.classList.add(
            "hidden"
        );

        refs.expiredScreen?.classList.add(
            "hidden"
        );

        refs.notFoundScreen?.classList.add(
            "hidden"
        );

        refs.galleryApp?.classList.add(
            "hidden"
        );
    }

    function showPasswordScreen() {
        hideAllScreens();

        if (!refs.passwordScreen) {
            return;
        }

        refs.passwordGalleryName.textContent =
            state.gallery?.name ||
            "Private Gallery";

        refs.passwordError.textContent = "";

        refs.passwordScreen.classList.remove(
            "hidden"
        );

        refs.galleryAccessPassword?.focus();
    }

    function showExpiredScreen() {
        hideAllScreens();

        refs.expiredScreen?.classList.remove(
            "hidden"
        );
    }

    function showNotFoundScreen() {
        hideAllScreens();

        refs.notFoundScreen?.classList.remove(
            "hidden"
        );
    }

    function showGalleryScreen() {
        hideAllScreens();

        refs.galleryApp?.classList.remove(
            "hidden"
        );
    }


    /* =========================================================
       HELPERS
    ========================================================= */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(dateValue) {
        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
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

    function formatSize(bytes) {
        const value =
            Number(bytes || 0);

        if (
            value >=
            1024 * 1024 * 1024
        ) {
            return (
                value /
                (1024 * 1024 * 1024)
            ).toFixed(2) + " GB";
        }

        if (
            value >=
            1024 * 1024
        ) {
            return (
                value /
                (1024 * 1024)
            ).toFixed(1) + " MB";
        }

        return (
            value /
            1024
        ).toFixed(0) + " KB";
    }

    function isImage(media) {
        return String(
            media?.type || ""
        ).startsWith("image/");
    }

    function isVideo(media) {
        return String(
            media?.type || ""
        ).startsWith("video/");
    }

    function getGalleryIdFromURL() {
        const params =
            new URLSearchParams(
                window.location.search
            );

        return (
            params.get("gallery") ||
            params.get("id") ||
            ""
        );
    }

    function getGallery() {
        try {
            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {
                return null;
            }

            const galleries =
                JSON.parse(raw);

            if (
                !Array.isArray(
                    galleries
                )
            ) {
                return null;
            }

            return (
                galleries.find(
                    gallery =>
                        gallery.id ===
                        state.galleryId
                ) || null
            );
        } catch (error) {
            console.error(
                "Unable to load gallery:",
                error
            );

            return null;
        }
    }

    function daysLeft(dateValue) {
        const target =
            new Date(
                dateValue
            ).getTime();

        if (!Number.isFinite(target)) {
            return 0;
        }

        return Math.ceil(
            (
                target -
                Date.now()
            ) /
                86400000
        );
    }

    function isExpired(gallery) {
        if (!gallery?.expiresAt) {
            return false;
        }

        return (
            daysLeft(
                gallery.expiresAt
            ) <= 0
        );
    }

    function showToast(
        message,
        type = "success"
    ) {
        if (
            !refs.clientToast ||
            !refs.clientToastMessage
        ) {
            return;
        }

        refs.clientToastMessage.textContent =
            message;

        refs.clientToast.classList.remove(
            "error",
            "warning"
        );

        if (type !== "success") {
            refs.clientToast.classList.add(
                type
            );
        }

        refs.clientToast.classList.add(
            "show"
        );

        clearTimeout(
            showToast.timeout
        );

        showToast.timeout =
            setTimeout(() => {
                refs.clientToast.classList.remove(
                    "show"
                );
            }, 3000);
    }


    /* =========================================================
       INDEXED DB
    ========================================================= */

    function openDatabase() {
        return new Promise(
            (resolve, reject) => {
                if (
                    !window.indexedDB
                ) {
                    reject(
                        new Error(
                            "IndexedDB unavailable."
                        )
                    );

                    return;
                }

                const request =
                    indexedDB.open(
                        DB_NAME,
                        DB_VERSION
                    );

                request.onupgradeneeded =
                    event => {
                        const db =
                            event.target
                                .result;

                        if (
                            !db.objectStoreNames.contains(
                                MEDIA_STORE
                            )
                        ) {
                            const store =
                                db.createObjectStore(
                                    MEDIA_STORE,
                                    {
                                        keyPath:
                                            "id"
                                    }
                                );

                            store.createIndex(
                                "galleryId",
                                "galleryId",
                                {
                                    unique:
                                        false
                                }
                            );
                        }
                    };

                request.onsuccess =
                    event => {
                        state.db =
                            event.target.result;

                        resolve(
                            state.db
                        );
                    };

                request.onerror =
                    () => {
                        reject(
                            request.error
                        );
                    };
            }
        );
    }

    async function getMediaBlob(
        mediaId
    ) {
        if (!state.db) {
            await openDatabase();
        }

        return new Promise(
            (resolve, reject) => {
                const tx =
                    state.db.transaction(
                        MEDIA_STORE,
                        "readonly"
                    );

                const request =
                    tx.objectStore(
                        MEDIA_STORE
                    ).get(mediaId);

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
                            request.error
                        );
                    };
            }
        );
    }


    /* =========================================================
       LOCAL STORAGE GALLERY UPDATES
    ========================================================= */

    function saveGalleryChanges() {
        try {
            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) return false;

            const galleries =
                JSON.parse(raw);

            if (
                !Array.isArray(
                    galleries
                )
            ) {
                return false;
            }

            const index =
                galleries.findIndex(
                    gallery =>
                        gallery.id ===
                        state.gallery.id
                );

            if (index === -1) {
                return false;
            }

            galleries[index] =
                state.gallery;

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    galleries
                )
            );

            window.dispatchEvent(
                new CustomEvent(
                    "professionalStudioClientGalleryUpdated"
                )
            );

            return true;
        } catch (error) {
            console.error(
                "Unable to save client gallery:",
                error
            );

            return false;
        }
    }


    /* =========================================================
       PASSWORD
    ========================================================= */

    function checkPasswordRequired() {
        return Boolean(
            state.gallery
                ?.passwordEnabled
        );
    }

    function authenticate() {
        /*
         * No gallery should ever reach this point.
         * Still protect the function in case something
         * changes during initialization.
         */
        if (!state.gallery) {
            showNotFoundScreen();
            return;
        }

        /*
         * Expiration always wins over password access.
         */
        if (
            isExpired(
                state.gallery
            )
        ) {
            showExpiredScreen();
            return;
        }

        /*
         * Gallery does not require a password.
         */
        if (
            !checkPasswordRequired()
        ) {
            state.authenticated =
                true;

            openGallery();

            return;
        }

        /*
         * Valid active gallery that requires
         * authentication.
         */
        showPasswordScreen();
    }

    function handlePasswordSubmit(
        event
    ) {
        event.preventDefault();

        if (!state.gallery) {
            showNotFoundScreen();
            return;
        }

        if (
            isExpired(
                state.gallery
            )
        ) {
            showExpiredScreen();
            return;
        }

        const entered =
            refs.galleryAccessPassword
                ?.value
                ?.trim() || "";

        const correctPassword =
            String(
                state.gallery.password ||
                    ""
            ).trim();

        if (
            entered !==
            correctPassword
        ) {
            refs.passwordError.textContent =
                "Incorrect password. Please try again.";

            refs.galleryAccessPassword.value =
                "";

            refs.galleryAccessPassword.focus();

            return;
        }

        refs.passwordError.textContent =
            "";

        state.authenticated =
            true;

        openGallery();
    }


    /* =========================================================
       OPEN GALLERY
    ========================================================= */

    async function openGallery() {
        if (!state.gallery) {
            showNotFoundScreen();
            return;
        }

        if (
            isExpired(
                state.gallery
            )
        ) {
            showExpiredScreen();
            return;
        }

        if (
            !state.authenticated
        ) {
            authenticate();
            return;
        }

        /*
         * This is the only place where the
         * actual gallery application becomes visible.
         */
        showGalleryScreen();

        renderGalleryHeader();

        setupSections();

        setupSelectionMode();

        if (!state.activeSectionId) {
            state.activeSectionId =
                "all";
        }

        await renderMedia();
    }

    function renderGalleryHeader() {
        refs.galleryTitle.textContent =
            state.gallery.name ||
            "Client Gallery";

        refs.galleryDescription.textContent =
            state.gallery.description ||
            "A private collection prepared for you by your photographer.";

        refs.heroExpiry.textContent =
            formatDate(
                state.gallery.expiresAt
            );

        refs.heroMediaCount.textContent =
            Array.isArray(
                state.gallery.media
            )
                ? state.gallery.media.length
                : 0;
    }


    /* =========================================================
       SECTIONS
    ========================================================= */

    function setupSections() {
        if (
            !refs.sectionNavigation
        ) {
            return;
        }

        const sections =
            Array.isArray(
                state.gallery.albums
            )
                ? state.gallery.albums
                : [];

        const allTab = `
            <button
                type="button"
                class="section-tab ${
                    state.activeSectionId ===
                    "all"
                        ? "active"
                        : ""
                }"
                data-section-id="all"
            >
                All Photos
            </button>
        `;

        const sectionTabs =
            sections
                .map(section => {
                    const isWedding =
                        String(
                            section.name
                        )
                            .trim()
                            .toUpperCase() ===
                        WEDDING_ALBUM_NAME;

                    return `
                        <button
                            type="button"
                            class="section-tab ${
                                isWedding
                                    ? "wedding-album"
                                    : ""
                            } ${
                                state.activeSectionId ===
                                section.id
                                    ? "active"
                                    : ""
                            }"
                            data-section-id="${escapeHTML(
                                section.id
                            )}"
                        >
                            ${
                                isWedding
                                    ? '<i class="fa-solid fa-book-open"></i> '
                                    : ""
                            }
                            ${escapeHTML(
                                section.name
                            )}
                        </button>
                    `;
                })
                .join("");

        refs.sectionNavigation.innerHTML =
            allTab +
            sectionTabs;

        refs.sectionNavigation
            .querySelectorAll(
                "[data-section-id]"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    async () => {
                        state.activeSectionId =
                            button.dataset
                                .sectionId;

                        setupSections();

                        await renderMedia();
                    }
                );
            });
    }


    /* =========================================================
       SELECTION MODE
    ========================================================= */

    function setupSelectionMode() {
        const selection =
            state.gallery
                .albumSelection;

        if (
            !selection ||
            !selection.enabled
        ) {
            refs.albumSelectionBar.classList.add(
                "hidden"
            );

            return;
        }

        refs.albumSelectionBar.classList.remove(
            "hidden"
        );

        if (
            selection.status ===
                "approved" ||
            selection.status ===
                "submitted"
        ) {
            refs.selectionLimitText.textContent =
                "photos • selection locked";
        } else if (
            selection.maxSelections
        ) {
            refs.selectionLimitText.textContent =
                `of ${selection.maxSelections}`;
        } else {
            refs.selectionLimitText.textContent =
                "photos";
        }

        updateSelectionUI();
    }

    function isSelectionLocked() {
        const status =
            state.gallery
                ?.albumSelection
                ?.status;

        return (
            status === "approved" ||
            status === "submitted"
        );
    }

    function getSelectionLimit() {
        const limit =
            state.gallery
                ?.albumSelection
                ?.maxSelections;

        if (
            limit === null ||
            limit === undefined ||
            limit === ""
        ) {
            return null;
        }

        return Number(limit);
    }

    function canSelectMore() {
        const limit =
            getSelectionLimit();

        if (limit === null) {
            return true;
        }

        return (
            state.selectedMediaIds
                .size < limit
        );
    }

    function isSelected(mediaId) {
        return state.selectedMediaIds.has(
            mediaId
        );
    }

    function toggleSelection(
        mediaId
    ) {
        if (
            !state.gallery
                ?.albumSelection
                ?.enabled
        ) {
            return;
        }

        if (
            isSelectionLocked()
        ) {
            showToast(
                "This selection has been submitted and is currently locked.",
                "warning"
            );

            return;
        }

        const media =
            state.gallery.media.find(
                item =>
                    item.id === mediaId
            );

        if (!media) return;

        if (!isImage(media.type)) {
            showToast(
                "Only photos can be selected for the Wedding Album.",
                "warning"
            );

            return;
        }

        if (
            isSelected(mediaId)
        ) {
            state.selectedMediaIds.delete(
                mediaId
            );

            delete state.comments[
                mediaId
            ];
        } else {
            if (
                !canSelectMore()
            ) {
                const limit =
                    getSelectionLimit();

                showToast(
                    `You can select a maximum of ${limit} photos.`,
                    "warning"
                );

                return;
            }

            state.selectedMediaIds.add(
                mediaId
            );
        }

        updateSelectionUI();

        renderMedia();

        if (
            refs.selectionModal.classList.contains(
                "open"
            )
        ) {
            renderSelectionSummary();
        }
    }

    function updateSelectionUI() {
        const count =
            state.selectedMediaIds.size;

        if (
            refs.selectionCount
        ) {
            refs.selectionCount.textContent =
                count;
        }

        if (
            refs.headerSelectionCount
        ) {
            refs.headerSelectionCount.textContent =
                count;
        }

        if (
            refs.summarySelectionCount
        ) {
            refs.summarySelectionCount.textContent =
                count;
        }

        const limit =
            getSelectionLimit();

        if (
            refs.selectionLimitText &&
            state.gallery
                ?.albumSelection
                ?.enabled
        ) {
            refs.selectionLimitText.textContent =
                limit === null
                    ? "photos"
                    : `of ${limit}`;
        }

        if (
            refs.summaryLimitText
        ) {
            refs.summaryLimitText.textContent =
                limit === null
                    ? "Select your favourite photos for the physical album."
                    : `You can select up to ${limit} photos for the physical album.`;
        }
    }


    /* =========================================================
       MEDIA
    ========================================================= */

    function getCurrentMedia() {
        let media =
            Array.isArray(
                state.gallery.media
            )
                ? [
                      ...state.gallery
                          .media
                  ]
                : [];

        if (
            state.activeSectionId &&
            state.activeSectionId !==
                "all"
        ) {
            media =
                media.filter(
                    item =>
                        item.sectionId ===
                        state.activeSectionId
                );
        }

        if (
            state.mediaFilter ===
            "photo"
        ) {
            media =
                media.filter(
                    item =>
                        isImage(item.type)
                );
        }

        if (
            state.mediaFilter ===
            "video"
        ) {
            media =
                media.filter(
                    item =>
                        isVideo(item.type)
                );
        }

        return media;
    }

    async function renderMedia() {
        if (
            !refs.clientMediaGrid
        ) {
            return;
        }

        revokeObjectUrls();

        const media =
            getCurrentMedia();

        state.visibleMedia =
            media;

        updateCurrentSectionInfo(
            media
        );

        if (!media.length) {
            refs.clientMediaGrid.innerHTML =
                "";

            refs.mediaEmptyState.classList.remove(
                "hidden"
            );

            return;
        }

        refs.mediaEmptyState.classList.add(
            "hidden"
        );

        const cards =
            await Promise.all(
                media.map(
                    item =>
                        buildMediaCard(
                            item
                        )
                )
            );

        refs.clientMediaGrid.innerHTML =
            cards.join("");

        bindMediaCards();
    }

    function updateCurrentSectionInfo(
        media
    ) {
        let title =
            "All Photos";

        if (
            state.activeSectionId &&
            state.activeSectionId !==
                "all"
        ) {
            const section =
                state.gallery.albums?.find(
                    item =>
                        item.id ===
                        state.activeSectionId
                );

            if (section) {
                title =
                    section.name;
            }
        }

        refs.currentSectionTitle.textContent =
            title;

        refs.currentSectionCount.textContent =
            `${media.length} ${
                media.length === 1
                    ? "item"
                    : "items"
            }`;
    }

    async function buildMediaCard(
        media
    ) {
        let mediaHTML = "";

        try {
            const record =
                await getMediaBlob(
                    media.id
                );

            if (
                record?.blob
            ) {
                const url =
                    URL.createObjectURL(
                        record.blob
                    );

                state.objectUrls.add(
                    url
                );

                if (
                    isImage(media.type)
                ) {
                    mediaHTML = `
                        <img
                            src="${url}"
                            alt="${escapeHTML(
                                media.name
                            )}"
                            loading="lazy"
                        >
                    `;
                } else if (
                    isVideo(media.type)
                ) {
                    mediaHTML = `
                        <video
                            src="${url}"
                            preload="metadata"
                        ></video>
                    `;
                }
            }
        } catch (error) {
            console.error(
                "Unable to load media:",
                error
            );
        }

        if (!mediaHTML) {
            mediaHTML = `
                <div
                    style="
                        width:100%;
                        height:100%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:#999;
                        background:#f2f2f2;
                    "
                >
                    <i class="fa-regular fa-file"></i>
                </div>
            `;
        }

        const selected =
            isSelected(media.id);

        const selectionEnabled =
            Boolean(
                state.gallery
                    ?.albumSelection
                    ?.enabled
            );

        const locked =
            isSelectionLocked();

        return `
            <article
                class="client-media-card ${
                    selected
                        ? "selected"
                        : ""
                }"
                data-media-id="${escapeHTML(
                    media.id
                )}"
            >

                ${mediaHTML}

                <div class="media-overlay">

                    ${
                        selectionEnabled &&
                        isImage(media.type)
                            ? `
                                <div class="media-top-actions">

                                    <button
                                        type="button"
                                        class="media-select-btn"
                                        data-action="select"
                                        data-media-id="${escapeHTML(
                                            media.id
                                        )}"
                                        ${
                                            locked
                                                ? "disabled"
                                                : ""
                                        }
                                        aria-label="${
                                            selected
                                                ? "Remove selection"
                                                : "Select photo"
                                        }"
                                    >
                                        <i class="${
                                            selected
                                                ? "fa-solid fa-check"
                                                : "fa-regular fa-square"
                                        }"></i>
                                    </button>

                                </div>
                            `
                            : ""
                    }

                    <div class="media-bottom">

                        <span
                            class="media-name"
                            title="${escapeHTML(
                                media.name
                            )}"
                        >
                            ${escapeHTML(
                                media.name
                            )}
                        </span>

                        <span class="media-type">
                            ${
                                isVideo(
                                    media.type
                                )
                                    ? '<i class="fa-solid fa-play"></i>'
                                    : '<i class="fa-regular fa-image"></i>'
                            }
                        </span>

                    </div>

                </div>

                ${
                    selected
                        ? `
                            <span class="selection-check">
                                <i class="fa-solid fa-check"></i>
                            </span>
                        `
                        : ""
                }

                ${
                    isVideo(
                        media.type
                    )
                        ? `
                            <span class="video-indicator">
                                <i class="fa-solid fa-play"></i>
                            </span>
                        `
                        : ""
                }

            </article>
        `;
    }

    function bindMediaCards() {
        refs.clientMediaGrid
            .querySelectorAll(
                ".client-media-card"
            )
            .forEach(card => {
                card.addEventListener(
                    "click",
                    event => {
                        const selectButton =
                            event.target.closest(
                                '[data-action="select"]'
                            );

                        if (
                            selectButton
                        ) {
                            event.stopPropagation();

                            toggleSelection(
                                selectButton
                                    .dataset
                                    .mediaId
                            );

                            return;
                        }

                        const mediaId =
                            card.dataset
                                .mediaId;

                        openViewer(
                            mediaId
                        );
                    }
                );
            });
    }

    function revokeObjectUrls() {
        state.objectUrls.forEach(
            url => {
                try {
                    URL.revokeObjectURL(
                        url
                    );
                } catch (_) {}
            }
        );

        state.objectUrls.clear();
    }


    /* =========================================================
       MEDIA VIEWER
    ========================================================= */

    async function openViewer(
        mediaId
    ) {
        const index =
            state.visibleMedia.findIndex(
                media =>
                    media.id ===
                    mediaId
            );

        if (index === -1) {
            return;
        }

        state.viewerIndex =
            index;

        refs.mediaViewer.classList.add(
            "open"
        );

        await renderViewerMedia();
    }

    async function renderViewerMedia() {
        const media =
            state.visibleMedia[
                state.viewerIndex
            ];

        if (!media) return;

        refs.viewerMedia.innerHTML =
            "";

        const record =
            await getMediaBlob(
                media.id
            );

        if (!record?.blob) {
            refs.viewerMedia.innerHTML = `
                <div
                    style="
                        color:white;
                        text-align:center;
                    "
                >
                    Media unavailable
                </div>
            `;

            return;
        }

        const url =
            URL.createObjectURL(
                record.blob
            );

        state.objectUrls.add(
            url
        );

        if (
            isImage(media.type)
        ) {
            const img =
                document.createElement(
                    "img"
                );

            img.src = url;
            img.alt =
                media.name;

            refs.viewerMedia.appendChild(
                img
            );
        } else if (
            isVideo(media.type)
        ) {
            const video =
                document.createElement(
                    "video"
                );

            video.src = url;
            video.controls = true;
            video.autoplay = true;

            refs.viewerMedia.appendChild(
                video
            );
        }

        refs.viewerMediaName.textContent =
            media.name;

        refs.viewerMediaPosition.textContent =
            `${state.viewerIndex + 1} / ${state.visibleMedia.length}`;

        const selected =
            isSelected(
                media.id
            );

        refs.viewerSelectBtn.classList.toggle(
            "selected",
            selected
        );

        refs.viewerSelectBtn.innerHTML =
            selected
                ? `
                    <i class="fa-solid fa-check"></i>
                    Selected
                `
                : `
                    <i class="fa-regular fa-square-check"></i>
                    Select
                `;

        const downloadsEnabled =
            Boolean(
                state.gallery
                    .downloadsEnabled
            );

        refs.viewerDownloadBtn.style.display =
            downloadsEnabled
                ? "flex"
                : "none";
    }

    function closeViewer() {
        refs.mediaViewer.classList.remove(
            "open"
        );

        refs.viewerMedia.innerHTML =
            "";

        state.viewerIndex = -1;
    }

    async function previousViewerMedia() {
        if (
            !state.visibleMedia.length
        ) {
            return;
        }

        state.viewerIndex =
            (
                state.viewerIndex -
                1 +
                state.visibleMedia.length
            ) %
            state.visibleMedia.length;

        await renderViewerMedia();
    }

    async function nextViewerMedia() {
        if (
            !state.visibleMedia.length
        ) {
            return;
        }

        state.viewerIndex =
            (
                state.viewerIndex +
                1
            ) %
            state.visibleMedia.length;

        await renderViewerMedia();
    }


    /* =========================================================
       DOWNLOAD
    ========================================================= */

    async function downloadMedia(
        mediaId
    ) {
        if (
            !state.gallery
                .downloadsEnabled
        ) {
            showToast(
                "Downloads are disabled for this gallery.",
                "warning"
            );

            return;
        }

        const media =
            state.gallery.media.find(
                item =>
                    item.id ===
                    mediaId
            );

        if (!media) return;

        try {
            const record =
                await getMediaBlob(
                    mediaId
                );

            if (!record?.blob) {
                throw new Error(
                    "Media unavailable"
                );
            }

            const url =
                URL.createObjectURL(
                    record.blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                media.name ||
                "download";

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            setTimeout(() => {
                URL.revokeObjectURL(
                    url
                );
            }, 1000);

            state.gallery.downloads =
                Number(
                    state.gallery
                        .downloads || 0
                ) + 1;

            saveGalleryChanges();

            showToast(
                "Download started."
            );
        } catch (error) {
            console.error(
                "Download failed:",
                error
            );

            showToast(
                "Unable to download this file.",
                "error"
            );
        }
    }


    /* =========================================================
       SELECTION SUMMARY
    ========================================================= */

    async function openSelectionModal() {
        if (
            !state.gallery
                ?.albumSelection
                ?.enabled
        ) {
            showToast(
                "Album Selection is not enabled for this gallery.",
                "warning"
            );

            return;
        }

        await renderSelectionSummary();

        refs.selectionModal.classList.add(
            "open"
        );
    }

    function closeSelectionModal() {
        refs.selectionModal.classList.remove(
            "open"
        );
    }

    async function renderSelectionSummary() {
        updateSelectionUI();

        const selected =
            state.gallery.media.filter(
                media =>
                    state.selectedMediaIds.has(
                        media.id
                    )
            );

        if (
            refs.selectionGeneralComment
        ) {
            refs.selectionGeneralComment.value =
                state.generalComment;
        }

        if (
            !selected.length
        ) {
            refs.selectedMediaList.innerHTML =
                `
                    <div class="client-empty-state">
                        <div class="empty-icon">
                            <i class="fa-regular fa-square-check"></i>
                        </div>

                        <h3>No photos selected</h3>

                        <p>
                            Go back to the gallery and select your favourite photos.
                        </p>
                    </div>
                `;

            return;
        }

        const items =
            await Promise.all(
                selected.map(
                    media =>
                        buildSelectedMediaItem(
                            media
                        )
                )
            );

        refs.selectedMediaList.innerHTML =
            items.join("");

        bindSelectedMediaEvents();
    }

    async function buildSelectedMediaItem(
        media
    ) {
        let thumbnail = "";

        try {
            const record =
                await getMediaBlob(
                    media.id
                );

            if (
                record?.blob
            ) {
                const url =
                    URL.createObjectURL(
                        record.blob
                    );

                state.objectUrls.add(
                    url
                );

                thumbnail = `
                    <img
                        src="${url}"
                        alt="${escapeHTML(
                            media.name
                        )}"
                    >
                `;
            }
        } catch (_) {}

        return `
            <div
                class="selected-media-item"
                data-media-id="${escapeHTML(
                    media.id
                )}"
            >

                <div class="selected-media-thumb">
                    ${thumbnail}
                </div>

                <div class="selected-media-info">

                    <strong>
                        ${escapeHTML(
                            media.name
                        )}
                    </strong>

                    <span>
                        ${formatSize(
                            media.sizeBytes
                        )}
                    </span>

                </div>

                <button
                    type="button"
                    class="selected-media-remove"
                    data-remove-selected="${escapeHTML(
                        media.id
                    )}"
                    ${
                        isSelectionLocked()
                            ? "disabled"
                            : ""
                    }
                    title="Remove"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </div>
        `;
    }

    function bindSelectedMediaEvents() {
        refs.selectedMediaList
            .querySelectorAll(
                "[data-remove-selected]"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    async () => {
                        toggleSelection(
                            button.dataset
                                .removeSelected
                        );

                        await renderSelectionSummary();
                    }
                );
            });
    }


    /* =========================================================
       SUBMIT SELECTION
    ========================================================= */

    function submitSelection() {
        if (
            !state.gallery
                ?.albumSelection
                ?.enabled
        ) {
            return;
        }

        if (
            isSelectionLocked()
        ) {
            showToast(
                "This selection has already been submitted.",
                "warning"
            );

            return;
        }

        const count =
            state.selectedMediaIds.size;

        const limit =
            getSelectionLimit();

        if (
            limit !== null &&
            count > limit
        ) {
            showToast(
                `You have selected ${count} photos, but the limit is ${limit}.`,
                "warning"
            );

            return;
        }

        if (count === 0) {
            showToast(
                "Please select at least one photo.",
                "warning"
            );

            return;
        }

        state.generalComment =
            refs.selectionGeneralComment
                ?.value
                ?.trim() || "";

        const weddingAlbum =
            state.gallery.albums?.find(
                album =>
                    String(
                        album.name
                    )
                        .trim()
                        .toUpperCase() ===
                    WEDDING_ALBUM_NAME
            );

        if (weddingAlbum) {
            state.gallery.media.forEach(
                media => {
                    if (
                        state.selectedMediaIds.has(
                            media.id
                        )
                    ) {
                        media.sectionId =
                            weddingAlbum.id;
                    }
                }
            );
        }

        state.gallery.albumSelection =
            state.gallery
                .albumSelection || {};

        state.gallery.albumSelection
            .selectedMediaIds =
            Array.from(
                state.selectedMediaIds
            );

        state.gallery.albumSelection
            .status =
            "submitted";

        state.gallery.albumSelection
            .submittedAt =
            new Date().toISOString();

        state.gallery.albumSelection
            .submittedBy =
            "client";

        state.gallery.albumSelection
            .photographerApproved =
            false;

        state.gallery.albumSelection
            .approvedAt =
            null;

        state.gallery.clientAlbumComment =
            state.generalComment;

        saveGalleryChanges();

        refs.submittedCount.textContent =
            count;

        closeSelectionModal();

        refs.submittedModal.classList.add(
            "open"
        );

        updateSelectionUI();

        showToast(
            "Your album selection has been submitted."
        );
    }


    /* =========================================================
       FILTERS
    ========================================================= */

    function bindFilters() {
        document
            .querySelectorAll(
                ".filter-btn"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    async () => {
                        document
                            .querySelectorAll(
                                ".filter-btn"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        state.mediaFilter =
                            button.dataset
                                .filter ||
                            "all";

                        await renderMedia();
                    }
                );
            });
    }


    /* =========================================================
       PASSWORD VISIBILITY
    ========================================================= */

    function togglePasswordVisibility() {
        const input =
            refs.galleryAccessPassword;

        if (!input) return;

        const showing =
            input.type === "text";

        input.type =
            showing
                ? "password"
                : "text";

        refs.togglePassword.innerHTML =
            showing
                ? '<i class="fa-regular fa-eye"></i>'
                : '<i class="fa-regular fa-eye-slash"></i>';

        refs.togglePassword.setAttribute(
            "aria-label",
            showing
                ? "Show password"
                : "Hide password"
        );
    }


    /* =========================================================
       KEYBOARD
    ========================================================= */

    function bindKeyboard() {
        document.addEventListener(
            "keydown",
            async event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    if (
                        refs.mediaViewer.classList.contains(
                            "open"
                        )
                    ) {
                        closeViewer();
                        return;
                    }

                    if (
                        refs.selectionModal.classList.contains(
                            "open"
                        )
                    ) {
                        closeSelectionModal();
                        return;
                    }

                    if (
                        refs.submittedModal.classList.contains(
                            "open"
                        )
                    ) {
                        refs.submittedModal.classList.remove(
                            "open"
                        );
                    }
                }

                if (
                    refs.mediaViewer.classList.contains(
                        "open"
                    )
                ) {

                    if (
                        event.key ===
                        "ArrowLeft"
                    ) {
                        await previousViewerMedia();
                    }

                    if (
                        event.key ===
                        "ArrowRight"
                    ) {
                        await nextViewerMedia();
                    }
                }
            }
        );
    }


    /* =========================================================
       EVENTS
    ========================================================= */

    function bindEvents() {

        refs.passwordForm?.addEventListener(
            "submit",
            handlePasswordSubmit
        );

        refs.togglePassword?.addEventListener(
            "click",
            togglePasswordVisibility
        );

        refs.openSelectionSummary?.addEventListener(
            "click",
            openSelectionModal
        );

        refs.closeSelectionModal?.addEventListener(
            "click",
            closeSelectionModal
        );

        refs.closeSelectionModalBtn?.addEventListener(
            "click",
            closeSelectionModal
        );

        refs.submitSelectionBtn?.addEventListener(
            "click",
            submitSelection
        );

        refs.closeSubmittedModal?.addEventListener(
            "click",
            () => {
                refs.submittedModal.classList.remove(
                    "open"
                );
            }
        );

        refs.closeViewer?.addEventListener(
            "click",
            closeViewer
        );

        refs.previousMedia?.addEventListener(
            "click",
            previousViewerMedia
        );

        refs.nextMedia?.addEventListener(
            "click",
            nextViewerMedia
        );

        refs.viewerSelectBtn?.addEventListener(
            "click",
            () => {

                const media =
                    state.visibleMedia[
                        state.viewerIndex
                    ];

                if (!media) return;

                toggleSelection(
                    media.id
                );

                renderViewerMedia();
            }
        );

        refs.viewerDownloadBtn?.addEventListener(
            "click",
            () => {

                const media =
                    state.visibleMedia[
                        state.viewerIndex
                    ];

                if (!media) return;

                downloadMedia(
                    media.id
                );
            }
        );

        refs.selectionModal?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    refs.selectionModal
                        .querySelector(
                            ".modal-backdrop"
                        )
                ) {
                    closeSelectionModal();
                }
            }
        );

        refs.submittedModal?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    refs.submittedModal
                        .querySelector(
                            ".modal-backdrop"
                        )
                ) {
                    refs.submittedModal.classList.remove(
                        "open"
                    );
                }
            }
        );

        bindFilters();

        bindKeyboard();
    }


    /* =========================================================
       EXISTING SELECTION RESTORE
    ========================================================= */

    function restoreExistingSelection() {

        if (
            !state.gallery
                ?.albumSelection
                ?.enabled
        ) {
            return;
        }

        const weddingAlbum =
            state.gallery.albums?.find(
                album =>
                    String(
                        album.name
                    )
                        .trim()
                        .toUpperCase() ===
                    WEDDING_ALBUM_NAME
            );

        if (!weddingAlbum) {
            return;
        }

        /*
         * WEDDING ALBUM is the source of truth.
         *
         * We do not duplicate media.
         * The selected photo simply belongs
         * to the Wedding Album section.
         */
        const selected =
            state.gallery.media
                .filter(
                    media =>
                        media.sectionId ===
                        weddingAlbum.id &&
                        isImage(media.type)
                )
                .map(
                    media =>
                        media.id
                );

        state.selectedMediaIds =
            new Set(selected);
    }


    /* =========================================================
       INITIALIZATION
    ========================================================= */

    async function init() {

        /*
         * Start with every major screen hidden.
         * This prevents the HTML from briefly showing
         * the password screen before JavaScript decides
         * what the correct state should be.
         */
        hideAllScreens();

        state.galleryId =
            getGalleryIdFromURL();

        /*
         * No gallery ID in the URL.
         */
        if (!state.galleryId) {
            showNotFoundScreen();
            return;
        }

        /*
         * Try to load the requested gallery.
         */
        state.gallery =
            getGallery();

        /*
         * Gallery ID exists in URL but does not
         * correspond to a stored gallery.
         */
        if (!state.gallery) {
            showNotFoundScreen();
            return;
        }

        /*
         * Expiration is checked before password access.
         */
        if (
            isExpired(
                state.gallery
            )
        ) {
            showExpiredScreen();
            return;
        }

        /*
         * IndexedDB contains the actual media blobs.
         */
        try {
            await openDatabase();
        } catch (error) {
            console.error(
                "IndexedDB unavailable:",
                error
            );
        }

        restoreExistingSelection();

        bindEvents();

        /*
         * authenticate() decides between:
         *
         * - password screen
         * - gallery
         *
         * and re-checks expiration.
         */
        authenticate();
    }


    /* =========================================================
       PUBLIC API
    ========================================================= */

    window.ProfessionalStudioClientGallery = {

        getGallery() {
            return state.gallery;
        },

        getSelectedMedia() {
            return state.gallery?.media
                ?.filter(media =>
                    state.selectedMediaIds.has(
                        media.id
                    )
                ) || [];
        },

        getSelectedMediaIds() {
            return Array.from(
                state.selectedMediaIds
            );
        },

        isAuthenticated() {
            return state.authenticated;
        },

        refresh() {
            state.gallery =
                getGallery();

            if (!state.gallery) {
                showNotFoundScreen();
                return Promise.resolve();
            }

            if (
                isExpired(
                    state.gallery
                )
            ) {
                showExpiredScreen();
                return Promise.resolve();
            }

            if (
                !state.authenticated &&
                checkPasswordRequired()
            ) {
                showPasswordScreen();
                return Promise.resolve();
            }

            restoreExistingSelection();

            renderGalleryHeader();

            setupSections();

            setupSelectionMode();

            return renderMedia();
        }
    };


    /* =========================================================
       START
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();