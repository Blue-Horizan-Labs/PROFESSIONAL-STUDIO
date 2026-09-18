/* =========================================================
   PROFESSIONAL STUDIO
   PRIVATE CLIENT GALLERY VIEW
   FRONTEND PROTOTYPE
========================================================= */

(() => {
    "use strict";


    /* =========================================================
       CONFIGURATION
    ========================================================= */

    const STORAGE_KEY =
        "professionalStudioGalleries";

    const DB_NAME =
        "professionalStudioDB";

    const DB_VERSION =
        2;

    const MEDIA_STORE =
        "clientGalleryMedia";

    const WEDDING_ALBUM_NAME =
        "WEDDING ALBUM";


    /* =========================================================
       STATE
    ========================================================= */

    const state = {

        galleryId: null,

        gallery: null,

        authenticated: false,

        activeSectionId: "all",

        selectedMediaIds:
            new Set(),

        generalComment: "",

        visibleMedia: [],

        viewerIndex: -1,

        objectUrls:
            new Map(),

        viewerObjectUrls:
            new Set(),

        db: null

    };


    /* =========================================================
       DOM REFERENCES
    ========================================================= */

    const refs = {

        passwordScreen:
            document.getElementById(
                "passwordScreen"
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


        passwordGalleryName:
            document.getElementById(
                "passwordGalleryName"
            ),

        passwordForm:
            document.getElementById(
                "passwordForm"
            ),

        passwordInput:
            document.getElementById(
                "galleryPasswordInput"
            ),

        passwordError:
            document.getElementById(
                "passwordError"
            ),


        galleryTitle:
            document.getElementById(
                "galleryTitle"
            ),

        galleryDescription:
            document.getElementById(
                "galleryDescription"
            ),

        galleryClientName:
            document.getElementById(
                "galleryClientName"
            ),

        galleryExpiry:
            document.getElementById(
                "galleryExpiry"
            ),


        downloadGalleryBtn:
            document.getElementById(
                "downloadGalleryBtn"
            ),


        selectionPanel:
            document.getElementById(
                "selectionPanel"
            ),

        selectionDescription:
            document.getElementById(
                "selectionDescription"
            ),

        selectionCount:
            document.getElementById(
                "selectionCount"
            ),

        selectionLimit:
            document.getElementById(
                "selectionLimit"
            ),

        clearSelectionBtn:
            document.getElementById(
                "clearSelectionBtn"
            ),

        submitSelectionBtn:
            document.getElementById(
                "submitSelectionBtn"
            ),


        sectionsList:
            document.getElementById(
                "sectionsList"
            ),

        activeSectionEyebrow:
            document.getElementById(
                "activeSectionEyebrow"
            ),

        activeSectionTitle:
            document.getElementById(
                "activeSectionTitle"
            ),

        mediaGrid:
            document.getElementById(
                "mediaGrid"
            ),

        mediaCount:
            document.getElementById(
                "mediaCount"
            ),

        mediaEmpty:
            document.getElementById(
                "mediaEmpty"
            ),


        clientNoteSection:
            document.getElementById(
                "clientNoteSection"
            ),

        generalComment:
            document.getElementById(
                "generalComment"
            ),


        viewer:
            document.getElementById(
                "viewer"
            ),

        viewerBackdrop:
            document.getElementById(
                "viewerBackdrop"
            ),

        viewerClose:
            document.getElementById(
                "viewerClose"
            ),

        viewerPrev:
            document.getElementById(
                "viewerPrev"
            ),

        viewerNext:
            document.getElementById(
                "viewerNext"
            ),

        viewerMediaWrap:
            document.getElementById(
                "viewerMediaWrap"
            ),

        viewerTitle:
            document.getElementById(
                "viewerTitle"
            ),

        viewerPosition:
            document.getElementById(
                "viewerPosition"
            ),

        viewerDownloadBtn:
            document.getElementById(
                "viewerDownloadBtn"
            ),


        toast:
            document.getElementById(
                "toast"
            )

    };


    let toastTimer = null;


    /* =========================================================
       SCREEN MANAGEMENT
    ========================================================= */

    function hideAllScreens() {

        refs.passwordScreen
            ?.classList
            .add("hidden");

        refs.expiredScreen
            ?.classList
            .add("hidden");

        refs.notFoundScreen
            ?.classList
            .add("hidden");

        refs.galleryApp
            ?.classList
            .add("hidden");
    }


    function showPasswordScreen() {

        hideAllScreens();

        refs.passwordGalleryName.textContent =
            state.gallery?.name ||
            "Private Gallery";

        refs.passwordScreen
            .classList
            .remove("hidden");

        setTimeout(() => {

            refs.passwordInput?.focus();

        }, 50);
    }


    function showNotFoundScreen() {

        hideAllScreens();

        refs.notFoundScreen
            .classList
            .remove("hidden");
    }


    function showExpiredScreen() {

        hideAllScreens();

        refs.expiredScreen
            .classList
            .remove("hidden");
    }


    function showGalleryScreen() {

        hideAllScreens();

        refs.galleryApp
            .classList
            .remove("hidden");
    }


    /* =========================================================
       LOCAL STORAGE
    ========================================================= */

    function loadGalleries() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {
                return [];
            }

            const parsed =
                JSON.parse(raw);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                "Unable to load galleries:",
                error
            );

            return [];
        }
    }


    function saveGalleries(
        galleries
    ) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(galleries)
        );
    }


    function getGallery() {

        const galleries =
            loadGalleries();

        return galleries.find(
            gallery =>
                String(gallery.id) ===
                String(state.galleryId)
        ) || null;
    }


    function saveCurrentGallery() {

        if (!state.gallery) {
            return;
        }

        const galleries =
            loadGalleries();

        const index =
            galleries.findIndex(
                gallery =>
                    String(gallery.id) ===
                    String(state.gallery.id)
            );

        if (index === -1) {
            return;
        }

        galleries[index] =
            state.gallery;

        saveGalleries(
            galleries
        );
    }


    /* =========================================================
       URL
    ========================================================= */

    function getGalleryIdFromURL() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        return (
            params.get("gallery") ||
            params.get("id") ||
            ""
        ).trim();
    }


    /* =========================================================
       DATE / EXPIRY
    ========================================================= */

    function isExpired(
        gallery
    ) {

        if (!gallery) {
            return true;
        }

        if (!gallery.expiresAt) {
            return false;
        }

        const expiry =
            new Date(
                gallery.expiresAt
            ).getTime();

        return (
            Number.isFinite(expiry) &&
            Date.now() >= expiry
        );
    }


    function formatDate(
        value
    ) {

        if (!value) {
            return "";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        ).format(date);
    }


    function daysLeft(
        gallery
    ) {

        if (!gallery?.expiresAt) {
            return null;
        }

        const difference =
            new Date(
                gallery.expiresAt
            ).getTime() -
            Date.now();

        return Math.max(
            0,
            Math.ceil(
                difference /
                86400000
            )
        );
    }


    /* =========================================================
       INDEXED DB
    ========================================================= */

    function openDatabase() {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                if (
                    !("indexedDB" in window)
                ) {

                    reject(
                        new Error(
                            "IndexedDB is unavailable."
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
                            event.target.result;

                        if (
                            !db.objectStoreNames
                                .contains(
                                    MEDIA_STORE
                                )
                        ) {

                            db.createObjectStore(
                                MEDIA_STORE,
                                {
                                    keyPath: "id"
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
                            request.error ||
                            new Error(
                                "Could not open IndexedDB."
                            )
                        );
                    };

            }
        );
    }


    function getMediaBlob(
        mediaId
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                if (!state.db) {
                    resolve(null);
                    return;
                }

                const transaction =
                    state.db.transaction(
                        MEDIA_STORE,
                        "readonly"
                    );

                const store =
                    transaction.objectStore(
                        MEDIA_STORE
                    );

                const request =
                    store.get(mediaId);


                request.onsuccess =
                    () => {

                        const record =
                            request.result;

                        if (!record) {
                            resolve(null);
                            return;
                        }

                        resolve(
                            record.blob ||
                            record.file ||
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
       MEDIA HELPERS
    ========================================================= */

    function isVideoMedia(
        media
    ) {

        if (!media) {
            return false;
        }

        if (
            media.type === "video" ||
            media.mediaType === "video"
        ) {
            return true;
        }

        const mime =
            String(
                media.mimeType ||
                media.fileType ||
                ""
            ).toLowerCase();

        return mime.startsWith(
            "video/"
        );
    }


    function isPhoto(
        media
    ) {

        return !isVideoMedia(
            media
        );
    }


    function getMediaName(
        media
    ) {

        return (
            media.name ||
            media.fileName ||
            media.filename ||
            `media-${media.id}`
        );
    }


    function sanitizeFileName(
        name
    ) {

        return String(
            name ||
            "Untitled"
        )
            .replace(
                /[<>:"/\\|?*\x00-\x1F]/g,
                "_"
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .replace(
                /\.+$/,
                ""
            )
            .slice(
                0,
                150
            ) ||
            "Untitled";
    }


    function getMediaUrl(
        mediaId,
        blob
    ) {

        if (
            state.objectUrls.has(
                mediaId
            )
        ) {

            return state.objectUrls.get(
                mediaId
            );
        }

        const url =
            URL.createObjectURL(
                blob
            );

        state.objectUrls.set(
            mediaId,
            url
        );

        return url;
    }


    function revokeViewerUrls() {

        state.viewerObjectUrls.forEach(
            url =>
                URL.revokeObjectURL(
                    url
                )
        );

        state.viewerObjectUrls.clear();
    }


    /* =========================================================
       SECTIONS
    ========================================================= */

    function getAlbums() {

        return Array.isArray(
            state.gallery?.albums
        )
            ? state.gallery.albums
            : [];
    }


    function getWeddingAlbum() {

        return getAlbums().find(
            album =>
                album.system === true ||
                album.name ===
                WEDDING_ALBUM_NAME
        ) || null;
    }


    function getSectionName(
        sectionId
    ) {

        if (!sectionId) {
            return "Unsorted";
        }

        const album =
            getAlbums().find(
                item =>
                    item.id ===
                    sectionId
            );

        return (
            album?.name ||
            "Unsorted"
        );
    }


    function setupSections() {

        const sections =
            getAlbums();

        refs.sectionsList.innerHTML =
            "";


        /* ALL MEDIA */

        const allButton =
            document.createElement(
                "button"
            );

        allButton.type =
            "button";

        allButton.className =
            "section-button";

        allButton.dataset.sectionId =
            "all";

        allButton.textContent =
            "All media";


        if (
            state.activeSectionId ===
            "all"
        ) {

            allButton.classList.add(
                "active"
            );
        }


        allButton.addEventListener(
            "click",
            () => {

                state.activeSectionId =
                    "all";

                setupSections();

                renderMedia();
            }
        );


        refs.sectionsList.appendChild(
            allButton
        );


        /* SECTIONS */

        sections.forEach(
            section => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "section-button";

                button.dataset.sectionId =
                    section.id;

                button.textContent =
                    section.name ||
                    "Untitled Section";


                if (
                    String(
                        state.activeSectionId
                    ) ===
                    String(section.id)
                ) {

                    button.classList.add(
                        "active"
                    );
                }


                button.addEventListener(
                    "click",
                    () => {

                        state.activeSectionId =
                            section.id;

                        setupSections();

                        renderMedia();
                    }
                );


                refs.sectionsList.appendChild(
                    button
                );
            }
        );
    }


    /* =========================================================
       SELECTION
    ========================================================= */

    function getAlbumSelection() {

        return (
            state.gallery?.albumSelection ||
            null
        );
    }


    function selectionEnabled() {

        return (
            getAlbumSelection()?.enabled ===
            true
        );
    }


    function isSelectionLocked() {

        const status =
            getAlbumSelection()?.status;

        return (
            status === "submitted" ||
            status === "approved" ||
            status === "closed"
        );
    }


    function getSelectionLimit() {

        const limit =
            Number(
                getAlbumSelection()?.maxSelections
            );

        return (
            Number.isFinite(limit) &&
            limit > 0
        )
            ? limit
            : null;
    }


    function restoreExistingSelection() {

        state.selectedMediaIds =
            new Set();

        const weddingAlbum =
            getWeddingAlbum();

        const weddingAlbumId =
            weddingAlbum?.id;

        if (!weddingAlbumId) {
            return;
        }

        const media =
            getGalleryMedia();


        media.forEach(
            item => {

                if (
                    !isVideoMedia(item) &&
                    String(
                        item.sectionId
                    ) ===
                    String(
                        weddingAlbumId
                    )
                ) {

                    state.selectedMediaIds.add(
                        item.id
                    );
                }
            }
        );


        state.generalComment =
            state.gallery
                ?.albumSelection
                ?.generalComment ||
            "";
    }


    function updateSelectionUI() {

        const enabled =
            selectionEnabled();


        refs.selectionPanel.classList.toggle(
            "hidden",
            !enabled
        );

        refs.clientNoteSection.classList.toggle(
            "hidden",
            !enabled
        );


        if (!enabled) {
            return;
        }


        const count =
            state.selectedMediaIds.size;

        const limit =
            getSelectionLimit();


        refs.selectionCount.textContent =
            count;


        refs.selectionLimit.textContent =
            limit
                ? ` / ${limit}`
                : "";


        refs.selectionDescription.textContent =
            limit
                ? `Choose up to ${limit} photos for your physical album.`
                : "Choose the photographs you want included in your physical album.";


        refs.generalComment.value =
            state.generalComment;


        const locked =
            isSelectionLocked();


        refs.submitSelectionBtn.disabled =
            locked;

        refs.clearSelectionBtn.disabled =
            locked;

        refs.generalComment.disabled =
            locked;


        refs.submitSelectionBtn.textContent =
            locked
                ? "Selection Submitted"
                : "Submit Selection";
    }


    function toggleSelection(
        mediaId
    ) {

        if (
            !selectionEnabled() ||
            isSelectionLocked()
        ) {
            return;
        }


        const media =
            getGalleryMedia().find(
                item =>
                    item.id ===
                    mediaId
            );


        if (
            !media ||
            isVideoMedia(media)
        ) {
            return;
        }


        const selected =
            state.selectedMediaIds.has(
                mediaId
            );


        if (selected) {

            state.selectedMediaIds.delete(
                mediaId
            );

        } else {

            const limit =
                getSelectionLimit();


            if (
                limit &&
                state.selectedMediaIds.size >=
                limit
            ) {

                showToast(
                    `You can select a maximum of ${limit} photos.`
                );

                return;
            }


            state.selectedMediaIds.add(
                mediaId
            );
        }


        updateSelectionUI();

        renderMedia();
    }


    function clearSelection() {

        if (
            !selectionEnabled() ||
            isSelectionLocked()
        ) {
            return;
        }

        state.selectedMediaIds.clear();

        updateSelectionUI();

        renderMedia();
    }


    async function submitSelection() {

        if (
            !selectionEnabled() ||
            isSelectionLocked()
        ) {
            return;
        }


        if (
            state.selectedMediaIds.size ===
            0
        ) {

            showToast(
                "Please select at least one photo."
            );

            return;
        }


        const limit =
            getSelectionLimit();


        if (
            limit &&
            state.selectedMediaIds.size >
            limit
        ) {

            showToast(
                `You can select a maximum of ${limit} photos.`
            );

            return;
        }


        const confirmed =
            window.confirm(
                `Submit ${state.selectedMediaIds.size} selected photo(s) to your photographer?`
            );


        if (!confirmed) {
            return;
        }


        const weddingAlbum =
            getWeddingAlbum();


        if (!weddingAlbum) {

            showToast(
                "The Wedding Album section is not available.",
                "error"
            );

            return;
        }


        const media =
            getGalleryMedia();


        media.forEach(
            item => {

                if (
                    state.selectedMediaIds.has(
                        item.id
                    )
                ) {

                    /*
                     * IMPORTANT:
                     *
                     * The actual media file/blob
                     * is NOT copied.
                     *
                     * Only the metadata's
                     * sectionId is changed.
                     */

                    if (
                        String(
                            item.sectionId
                        ) !==
                        String(
                            weddingAlbum.id
                        )
                    ) {

                        item.previousSectionId =
                            item.sectionId ||
                            null;
                    }


                    item.sectionId =
                        weddingAlbum.id;
                }
            }
        );


        state.gallery.albumSelection =
            state.gallery.albumSelection ||
            {};


        state.gallery.albumSelection.enabled =
            true;


        state.gallery.albumSelection.status =
            "submitted";


        state.gallery.albumSelection.selectedMediaIds =
            Array.from(
                state.selectedMediaIds
            );


        state.generalComment =
            refs.generalComment.value.trim();


        state.gallery.albumSelection.generalComment =
            state.generalComment;


        state.gallery.albumSelection.submittedAt =
            new Date().toISOString();


        state.gallery.albumSelection.submittedBy =
            "client";


        saveCurrentGallery();


        updateSelectionUI();

        setupSections();

        await renderMedia();


        showToast(
            "Your Wedding Album selection has been submitted."
        );
    }


    /* =========================================================
       MEDIA
    ========================================================= */

    function getGalleryMedia() {

        return Array.isArray(
            state.gallery?.media
        )
            ? state.gallery.media
            : [];
    }


    function getVisibleMedia() {

        const media =
            getGalleryMedia();


        if (
            state.activeSectionId ===
            "all"
        ) {
            return media;
        }


        return media.filter(
            item =>
                String(
                    item.sectionId
                ) ===
                String(
                    state.activeSectionId
                )
        );
    }


    async function renderMedia() {

        revokeViewerUrls();


        const media =
            getVisibleMedia();


        state.visibleMedia =
            media.slice();


        refs.mediaGrid.innerHTML =
            "";


        const sectionName =
            state.activeSectionId === "all"
                ? "All media"
                : getSectionName(
                    state.activeSectionId
                );


        refs.activeSectionEyebrow.textContent =
            state.activeSectionId === "all"
                ? "GALLERY"
                : "SECTION";


        refs.activeSectionTitle.textContent =
            sectionName;


        refs.mediaCount.textContent =
            `${media.length} ${
                media.length === 1
                    ? "item"
                    : "items"
            }`;


        refs.mediaEmpty.classList.toggle(
            "hidden",
            media.length > 0
        );


        for (
            let index = 0;
            index < media.length;
            index++
        ) {

            await renderMediaCard(
                media[index],
                index
            );
        }


        updateSelectionUI();
    }


    async function renderMediaCard(
        media,
        index
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "media-card";


        card.dataset.mediaId =
            media.id;


        const blob =
            await getMediaBlob(
                media.id
            );


        if (!blob) {

            card.innerHTML = `
                <div style="
                    width:100%;
                    height:100%;
                    display:grid;
                    place-items:center;
                    color:#777;
                    font-size:10px;
                    padding:20px;
                    text-align:center;
                ">
                    Media unavailable in this browser.
                </div>
            `;


            refs.mediaGrid.appendChild(
                card
            );

            return;
        }


        const url =
            getMediaUrl(
                media.id,
                blob
            );


        if (
            isVideoMedia(media)
        ) {

            const video =
                document.createElement(
                    "video"
                );

            video.src =
                url;

            video.muted =
                true;

            video.playsInline =
                true;

            video.preload =
                "metadata";


            card.appendChild(
                video
            );

        } else {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                url;

            image.alt =
                getMediaName(
                    media
                );

            image.loading =
                "lazy";


            card.appendChild(
                image
            );
        }


        const overlay =
            document.createElement(
                "div"
            );


        overlay.className =
            "media-card-overlay";


        overlay.innerHTML = `
            <span class="media-card-name">
                ${escapeHTML(
                    getMediaName(media)
                )}
            </span>

            <span class="media-type">
                ${
                    isVideoMedia(media)
                        ? "VIDEO"
                        : "PHOTO"
                }
            </span>
        `;


        card.appendChild(
            overlay
        );


        /*
         * WEDDING ALBUM SELECTION
         *
         * Videos are intentionally excluded.
         */

        if (
            selectionEnabled() &&
            !isVideoMedia(media)
        ) {

            const selectButton =
                document.createElement(
                    "button"
                );


            selectButton.type =
                "button";


            selectButton.className =
                "select-media-btn";


            const selected =
                state.selectedMediaIds.has(
                    media.id
                );


            selectButton.textContent =
                selected
                    ? "✓"
                    : "Select";


            selectButton.title =
                selected
                    ? "Remove from Wedding Album"
                    : "Select for Wedding Album";


            selectButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    toggleSelection(
                        media.id
                    );
                }
            );


            card.appendChild(
                selectButton
            );


            if (selected) {

                card.classList.add(
                    "selected"
                );
            }


            if (
                isSelectionLocked()
            ) {

                selectButton.disabled =
                    true;
            }
        }


        card.addEventListener(
            "click",
            () => {

                openViewer(
                    index
                );
            }
        );


        refs.mediaGrid.appendChild(
            card
        );
    }


    /* =========================================================
       VIEWER
    ========================================================= */

    function openViewer(
        index
    ) {

        if (
            index < 0 ||
            index >=
            state.visibleMedia.length
        ) {
            return;
        }


        state.viewerIndex =
            index;


        renderViewer();


        refs.viewer.classList.remove(
            "hidden"
        );


        document.body.style.overflow =
            "hidden";
    }


    async function renderViewer() {

        const media =
            state.visibleMedia[
                state.viewerIndex
            ];


        if (!media) {
            return;
        }


        revokeViewerUrls();


        refs.viewerMediaWrap.innerHTML =
            "";


        const blob =
            await getMediaBlob(
                media.id
            );


        if (!blob) {

            refs.viewerMediaWrap.innerHTML = `
                <div style="
                    color:#fff;
                    text-align:center;
                    font-size:12px;
                ">
                    Media unavailable.
                </div>
            `;

            return;
        }


        const url =
            URL.createObjectURL(
                blob
            );


        state.viewerObjectUrls.add(
            url
        );


        if (
            isVideoMedia(media)
        ) {

            const video =
                document.createElement(
                    "video"
                );

            video.src =
                url;

            video.controls =
                true;

            video.autoplay =
                true;

            video.playsInline =
                true;


            refs.viewerMediaWrap.appendChild(
                video
            );

        } else {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                url;

            image.alt =
                getMediaName(
                    media
                );


            refs.viewerMediaWrap.appendChild(
                image
            );
        }


        refs.viewerTitle.textContent =
            getMediaName(
                media
            );


        refs.viewerPosition.textContent =
            `${state.viewerIndex + 1} / ${state.visibleMedia.length}`;


        const downloadsEnabled =
            state.gallery
                .downloadsEnabled ===
            true;


        refs.viewerDownloadBtn.classList.toggle(
            "hidden",
            !downloadsEnabled
        );
    }


    function closeViewer() {

        refs.viewer.classList.add(
            "hidden"
        );


        document.body.style.overflow =
            "";


        revokeViewerUrls();
    }


    function viewerPrevious() {

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


        renderViewer();
    }


    function viewerNext() {

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


        renderViewer();
    }


    /* =========================================================
       INDIVIDUAL DOWNLOAD
    ========================================================= */

    async function downloadMedia(
        media
    ) {

        if (
            state.gallery
                .downloadsEnabled !==
            true
        ) {

            showToast(
                "Downloads are disabled for this gallery."
            );

            return;
        }


        const blob =
            await getMediaBlob(
                media.id
            );


        if (!blob) {

            showToast(
                "This media file is unavailable.",
                "error"
            );

            return;
        }


        const url =
            URL.createObjectURL(
                blob
            );


        const anchor =
            document.createElement(
                "a"
            );


        anchor.href =
            url;


        anchor.download =
            sanitizeFileName(
                getMediaName(
                    media
                )
            );


        document.body.appendChild(
            anchor
        );


        anchor.click();


        anchor.remove();


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            2000
        );


        state.gallery.downloads =
            Number(
                state.gallery.downloads ||
                0
            ) + 1;


        saveCurrentGallery();


        showToast(
            "Download started."
        );
    }


    /* =========================================================
       DOWNLOAD ENTIRE GALLERY
    ========================================================= */

    async function downloadEntireGallery() {

        if (!state.gallery) {
            return;
        }


        if (
            state.gallery
                .downloadsEnabled !==
            true
        ) {

            showToast(
                "Downloads are disabled for this gallery."
            );

            return;
        }


        if (
            typeof JSZip ===
            "undefined"
        ) {

            showToast(
                "Gallery download is unavailable.",
                "error"
            );

            console.error(
                "JSZip was not loaded."
            );

            return;
        }


        const media =
            getGalleryMedia().filter(
                item =>
                    isPhoto(item) ||
                    isVideoMedia(item)
            );


        if (!media.length) {

            showToast(
                "There is no downloadable content in this gallery."
            );

            return;
        }


        const originalHTML =
            refs.downloadGalleryBtn.innerHTML;


        try {

            refs.downloadGalleryBtn.disabled =
                true;


            showToast(
                "Preparing your gallery download..."
            );


            const zip =
                new JSZip();


            /*
             * ROOT FOLDER
             *
             * Example:
             *
             * My Wedding/
             * ├── Ceremony/
             * ├── Reception/
             * ├── WEDDING ALBUM/
             * └── Unsorted/
             */

            const rootFolder =
                zip.folder(
                    sanitizeFileName(
                        state.gallery.name ||
                        "Gallery"
                    )
                );


            const albums =
                getAlbums();


            const folderObjects =
                new Map();


            albums.forEach(
                album => {

                    const name =
                        sanitizeFileName(
                            album.name ||
                            "Untitled Section"
                        );


                    folderObjects.set(
                        album.id,
                        rootFolder.folder(
                            name
                        )
                    );
                }
            );


            const unsortedFolder =
                rootFolder.folder(
                    "Unsorted"
                );


            /*
             * Track duplicate filenames
             * separately inside every folder.
             */

            const usedNamesByFolder =
                new Map();


            let added =
                0;

            let skipped =
                0;


            for (
                const item of media
            ) {

                const blob =
                    await getMediaBlob(
                        item.id
                    );


                if (!blob) {

                    skipped++;

                    continue;
                }


                let folder =
                    folderObjects.get(
                        item.sectionId
                    );


                if (!folder) {

                    folder =
                        unsortedFolder;
                }


                const folderKey =
                    item.sectionId ||
                    "unsorted";


                if (
                    !usedNamesByFolder.has(
                        folderKey
                    )
                ) {

                    usedNamesByFolder.set(
                        folderKey,
                        new Set()
                    );
                }


                const fileName =
                    getUniqueFileName(
                        getMediaName(
                            item
                        ),
                        usedNamesByFolder.get(
                            folderKey
                        )
                    );


                /*
                 * IMPORTANT:
                 *
                 * This adds the existing blob
                 * to the ZIP.
                 *
                 * It does NOT create another
                 * permanent gallery copy.
                 */

                folder.file(
                    fileName,
                    blob
                );


                added++;


                const percent =
                    Math.round(
                        (
                            added /
                            media.length
                        ) * 100
                    );


                refs.downloadGalleryBtn.innerHTML = `
                    <span>↓</span>
                    Preparing ${percent}%
                `;
            }


            if (!added) {

                showToast(
                    "No downloadable files were found.",
                    "error"
                );

                return;
            }


            refs.downloadGalleryBtn.innerHTML =
                `<span>↓</span> Creating ZIP...`;


            const zipBlob =
                await zip.generateAsync(
                    {
                        type: "blob",

                        compression:
                            "DEFLATE",

                        compressionOptions: {
                            level: 6
                        }
                    },

                    metadata => {

                        refs.downloadGalleryBtn.innerHTML = `
                            <span>↓</span>
                            Creating ZIP ${Math.round(
                                metadata.percent
                            )}%
                        `;
                    }
                );


            const url =
                URL.createObjectURL(
                    zipBlob
                );


            const anchor =
                document.createElement(
                    "a"
                );


            anchor.href =
                url;


            anchor.download =
                `${sanitizeFileName(
                    state.gallery.name ||
                    "Gallery"
                )}.zip`;


            document.body.appendChild(
                anchor
            );


            anchor.click();


            anchor.remove();


            setTimeout(
                () => {

                    URL.revokeObjectURL(
                        url
                    );

                },
                5000
            );


            /*
             * Prototype download counter.
             *
             * Backend will later replace this
             * with a real download event.
             */

            state.gallery.downloads =
                Number(
                    state.gallery.downloads ||
                    0
                ) + added;


            saveCurrentGallery();


            showToast(
                skipped
                    ? `Download started. ${skipped} file(s) were unavailable.`
                    : "Your gallery download has started."
            );


        } catch (error) {

            console.error(
                "Gallery ZIP creation failed:",
                error
            );


            showToast(
                "Unable to prepare the gallery download.",
                "error"
            );


        } finally {

            refs.downloadGalleryBtn.disabled =
                false;


            refs.downloadGalleryBtn.innerHTML =
                originalHTML;
        }
    }


    function getUniqueFileName(
        name,
        usedNames
    ) {

        const clean =
            sanitizeFileName(
                name
            );


        if (
            !usedNames.has(
                clean
            )
        ) {

            usedNames.add(
                clean
            );

            return clean;
        }


        const dot =
            clean.lastIndexOf(
                "."
            );


        const base =
            dot > 0
                ? clean.slice(
                    0,
                    dot
                )
                : clean;


        const extension =
            dot > 0
                ? clean.slice(
                    dot
                )
                : "";


        let number =
            2;


        let candidate =
            `${base} (${number})${extension}`;


        while (
            usedNames.has(
                candidate
            )
        ) {

            number++;


            candidate =
                `${base} (${number})${extension}`;
        }


        usedNames.add(
            candidate
        );


        return candidate;
    }


    /* =========================================================
       HEADER
    ========================================================= */

    function renderGalleryHeader() {

        refs.galleryTitle.textContent =
            state.gallery.name ||
            "Private Gallery";


        refs.galleryDescription.textContent =
            state.gallery.description ||
            "Your photographs and videos are ready.";


        refs.galleryClientName.textContent =
            state.gallery.clientName
                ? `For ${state.gallery.clientName}`
                : "";


        const remaining =
            daysLeft(
                state.gallery
            );


        const expiry =
            formatDate(
                state.gallery.expiresAt
            );


        refs.galleryExpiry.textContent =
            expiry
                ? `Available until ${expiry}${
                    remaining !== null
                        ? ` · ${remaining} days left`
                        : ""
                }`
                : "";


        /*
         * The Download Gallery button
         * only appears when the photographer
         * has enabled downloads.
         */

        refs.downloadGalleryBtn.classList.toggle(
            "hidden",
            state.gallery
                .downloadsEnabled !==
            true
        );
    }


    /* =========================================================
       AUTHENTICATION
    ========================================================= */

    function authenticate() {

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
            state.gallery.visible ===
            false
        ) {

            showNotFoundScreen();

            return;
        }


        if (
            !state.gallery.passwordEnabled
        ) {

            state.authenticated =
                true;

            openGallery();

            return;
        }


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


        const entered =
            refs.passwordInput.value;


        const expected =
            String(
                state.gallery.password ||
                ""
            );


        if (
            entered === expected &&
            expected.length > 0
        ) {

            state.authenticated =
                true;


            refs.passwordError
                .classList
                .add("hidden");


            refs.passwordInput.value =
                "";


            openGallery();


            return;
        }


        refs.passwordError
            .classList
            .remove("hidden");


        refs.passwordInput.select();
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


        if (!state.authenticated) {

            authenticate();

            return;
        }


        showGalleryScreen();


        renderGalleryHeader();


        setupSections();


        restoreExistingSelection();


        if (!state.activeSectionId) {

            state.activeSectionId =
                "all";
        }


        await renderMedia();
    }


    /* =========================================================
       HTML ESCAPING
    ========================================================= */

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
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
       TOAST
    ========================================================= */

    function showToast(
        message,
        type = "normal"
    ) {

        refs.toast.textContent =
            message;


        refs.toast.classList.toggle(
            "error",
            type === "error"
        );


        refs.toast.classList.add(
            "show"
        );


        clearTimeout(
            toastTimer
        );


        toastTimer =
            setTimeout(
                () => {

                    refs.toast.classList.remove(
                        "show"
                    );

                },
                3000
            );
    }


    /* =========================================================
       EVENT BINDINGS
    ========================================================= */

    function bindEvents() {

        refs.passwordForm.addEventListener(
            "submit",
            handlePasswordSubmit
        );


        refs.downloadGalleryBtn.addEventListener(
            "click",
            downloadEntireGallery
        );


        refs.clearSelectionBtn.addEventListener(
            "click",
            clearSelection
        );


        refs.submitSelectionBtn.addEventListener(
            "click",
            submitSelection
        );


        refs.generalComment.addEventListener(
            "input",
            event => {

                state.generalComment =
                    event.target.value;
            }
        );


        refs.viewerClose.addEventListener(
            "click",
            closeViewer
        );


        refs.viewerBackdrop.addEventListener(
            "click",
            closeViewer
        );


        refs.viewerPrev.addEventListener(
            "click",
            viewerPrevious
        );


        refs.viewerNext.addEventListener(
            "click",
            viewerNext
        );


        refs.viewerDownloadBtn.addEventListener(
            "click",
            async () => {

                const media =
                    state.visibleMedia[
                        state.viewerIndex
                    ];


                if (media) {

                    await downloadMedia(
                        media
                    );
                }
            }
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    refs.viewer.classList.contains(
                        "hidden"
                    )
                ) {
                    return;
                }


                if (
                    event.key ===
                    "Escape"
                ) {

                    closeViewer();
                }


                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    viewerPrevious();
                }


                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    viewerNext();
                }
            }
        );


        /*
         * Update the client gallery if
         * photographer-side data changes
         * in another browser tab.
         */

        window.addEventListener(
            "storage",
            event => {

                if (
                    event.key !==
                    STORAGE_KEY
                ) {
                    return;
                }


                if (!state.gallery) {
                    return;
                }


                const updated =
                    getGallery();


                if (!updated) {

                    showNotFoundScreen();

                    return;
                }


                state.gallery =
                    updated;


                if (
                    isExpired(
                        state.gallery
                    )
                ) {

                    showExpiredScreen();

                    return;
                }


                if (
                    state.authenticated
                ) {

                    renderGalleryHeader();

                    setupSections();

                    restoreExistingSelection();

                    renderMedia();
                }
            }
        );
    }


    /* =========================================================
       PUBLIC API
    ========================================================= */

    window.ProfessionalStudioClientGalleryView = {

        getGallery: () =>
            state.gallery,


        getSelectedMediaIds: () =>
            Array.from(
                state.selectedMediaIds
            ),


        submitSelection,


        downloadMedia,


        downloadEntireGallery,


        refresh: async () => {

            state.gallery =
                getGallery();


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
                state.authenticated
            ) {

                await openGallery();
            }
        }

    };


    /* =========================================================
       INIT
    ========================================================= */

    async function init() {

        state.galleryId =
            getGalleryIdFromURL();


        if (!state.galleryId) {

            showNotFoundScreen();

            return;
        }


        state.gallery =
            getGallery();


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


        try {

            await openDatabase();

        } catch (error) {

            console.warn(
                "IndexedDB unavailable:",
                error
            );
        }


        bindEvents();


        authenticate();
    }


    init();

})();