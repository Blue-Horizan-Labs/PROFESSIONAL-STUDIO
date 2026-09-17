/* =========================================================
   PROFESSIONAL STUDIO
   CLIENT GALLERIES
   COMPLETE JAVASCRIPT
   WEDDING ALBUM / SELECTION SYSTEM
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       STORAGE CONFIGURATION
    ====================================================== */

    const GALLERIES_STORAGE_KEY =
        "professionalStudioGalleries";

    const PENDING_GALLERY_KEY =
        "professionalStudioPendingGallery";

    const PURCHASE_HISTORY_KEY =
        "professionalStudioGalleryPurchases";

    const DB_NAME =
        "professionalStudioDB";

    const DB_VERSION = 2;

    const MEDIA_STORE =
        "clientGalleryMedia";


    /* =====================================================
       ELEMENT HELPER
    ====================================================== */

    const $ = id =>
        document.getElementById(id);


    /* =====================================================
       PAGE ELEMENTS
    ====================================================== */

    const galleryGrid =
        $("galleryGrid");

    const galleryEmpty =
        $("galleryEmpty");

    const gallerySearch =
        $("gallerySearch");

    const statusFilter =
        $("statusFilter");

    const totalGalleries =
        $("totalGalleries");

    const activeGalleries =
        $("activeGalleries");

    const preparingGalleries =
        $("preparingGalleries");

    const storageUsed =
        $("storageUsed");


    /* =====================================================
       MODAL ELEMENTS
    ====================================================== */

    const galleryModal =
        $("galleryModal");

    const closeGalleryModal =
        $("closeGalleryModal");

    const modalGalleryTitle =
        $("modalGalleryTitle");

    const modalGalleryClient =
        $("modalGalleryClient");

    const modalGalleryName =
        $("modalGalleryName");

    const modalClientName =
        $("modalClientName");

    const modalDescription =
        $("modalDescription");

    const modalCreatedAt =
        $("modalCreatedAt");

    const modalDuration =
        $("modalDuration");

    const modalStorageText =
        $("modalStorageText");

    const modalStorageProgress =
        $("modalStorageProgress");

    const modalStorageLimit =
        $("modalStorageLimit");

    const modalStorageUsed =
        $("modalStorageUsed");

    const modalExpiry =
        $("modalExpiry");

    const modalExpiryStatus =
        $("modalExpiryStatus");

    const modalExpiryDuration =
        $("modalExpiryDuration");

    const modalGalleryLink =
        $("modalGalleryLink");

    const copyLinkBtn =
        $("copyLinkBtn");

    const deliveryStatus =
        $("deliveryStatus");

    const deliveryMessage =
        $("deliveryMessage");

    const deliveryExpiry =
        $("deliveryExpiry");

    const sendToClientBtn =
        $("sendToClientBtn");


    /* =====================================================
       READINESS ELEMENTS
    ====================================================== */

    const checkGalleryName =
        $("checkGalleryName");

    const checkMedia =
        $("checkMedia");

    const checkPassword =
        $("checkPassword");

    const checkDownloads =
        $("checkDownloads");

    const checkStorage =
        $("checkStorage");


    /* =====================================================
       MEDIA ELEMENTS
    ====================================================== */

    const uploadZone =
        $("uploadZone");

    const mediaUpload =
        $("mediaUpload");

    const mediaFilter =
        $("mediaFilter");

    const mediaGrid =
        $("mediaGrid");

    const mediaCount =
        $("mediaCount");


    /* =====================================================
       SECTION ELEMENTS
    ====================================================== */

    const createAlbumBtn =
        $("createAlbumBtn");

    const albumsGrid =
        $("albumsGrid");

    const albumModal =
        $("albumModal");

    const closeAlbumModal =
        $("closeAlbumModal");

    const cancelAlbum =
        $("cancelAlbum");

    const albumForm =
        $("albumForm");

    const albumName =
        $("albumName");


    /* =====================================================
       SETTINGS ELEMENTS
    ====================================================== */

    const gallerySettingsForm =
        $("gallerySettingsForm");

    const editGalleryName =
        $("editGalleryName");

    const editClientName =
        $("editClientName");

    const editGalleryDescription =
        $("editGalleryDescription");

    const passwordEnabled =
        $("passwordEnabled");

    const passwordSetting =
        $("passwordSetting");

    const galleryPassword =
        $("galleryPassword");

    const generatePassword =
        $("generatePassword");

    const savePassword =
        $("savePassword");

    const downloadsEnabled =
        $("downloadsEnabled");

    const galleryVisible =
        $("galleryVisible");

    const modalPassword =
        $("modalPassword");

    const modalDownloads =
        $("modalDownloads");

    const modalVisibility =
        $("modalVisibility");

    const deleteGalleryBtn =
        $("deleteGalleryBtn");


    /* =====================================================
       TOAST
    ====================================================== */

    const toast =
        $("toast");

    const toastMessage =
        $("toastMessage");


    /* =====================================================
       STATE
    ====================================================== */

    let galleries = [];

    let selectedGalleryId = null;

    let selectedAlbumId = null;

    let editingAlbumId = null;

    let activeMediaFilter = "all";

    let activeObjectUrls =
        new Set();

    let databasePromise = null;

    let toastTimer = null;


    /* =====================================================
       ID GENERATOR
    ====================================================== */

    function createId(prefix) {

        return (
            prefix +
            "_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 9)
        );

    }


    /* =====================================================
       HTML ESCAPE
    ====================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       DATE HELPERS
    ====================================================== */

    function addMonths(date, months) {

        const result =
            new Date(date);

        result.setMonth(
            result.getMonth() + Number(months)
        );

        return result;

    }


    function formatDate(dateValue) {

        if (!dateValue) {
            return "-";
        }

        const date =
            new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
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


    function getDaysLeft(dateValue) {

        const expiry =
            new Date(dateValue);

        if (Number.isNaN(expiry.getTime())) {
            return 0;
        }

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

        const daysLeft =
            getDaysLeft(
                gallery.expiresAt
            );

        if (daysLeft <= 0) {
            return "expired";
        }

        if (
            gallery.deliveryStatus ===
            "sent"
        ) {
            return "sent";
        }

        if (
            isGalleryReady(gallery)
        ) {
            return "ready";
        }

        return "preparing";

    }


    /* =====================================================
       SIZE HELPERS
    ====================================================== */

    function bytesToGB(bytes) {

        return (
            Number(bytes || 0) /
            (1024 * 1024 * 1024)
        );

    }


    function bytesToMB(bytes) {

        return (
            Number(bytes || 0) /
            (1024 * 1024)
        );

    }


    function formatStorage(bytes) {

        const value =
            Number(bytes || 0);

        if (value <= 0) {
            return "0 GB";
        }

        if (value < 1024 * 1024) {

            return (
                Math.round(value / 1024) +
                " KB"
            );

        }

        if (value < 1024 * 1024 * 1024) {

            return (
                bytesToMB(value)
                    .toFixed(1)
                    .replace(".0", "") +
                " MB"
            );

        }

        return (
            bytesToGB(value)
                .toFixed(2)
                .replace(/\.00$/, "") +
            " GB"
        );

    }


    /* =====================================================
       DATABASE
    ====================================================== */

    function openDatabase() {

        if (databasePromise) {
            return databasePromise;
        }

        databasePromise =
            new Promise((resolve, reject) => {

                if (!window.indexedDB) {

                    reject(
                        new Error(
                            "IndexedDB is not supported."
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
                                .contains(MEDIA_STORE)
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

                        resolve(
                            event.target.result
                        );

                    };

                request.onerror =
                    () => {

                        reject(
                            request.error
                        );

                    };

            });

        return databasePromise;

    }


    /* =====================================================
       SAVE MEDIA BLOB
    ====================================================== */

    async function saveMediaBlob(
        mediaId,
        blob,
        galleryId
    ) {

        const db =
            await openDatabase();

        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        MEDIA_STORE,
                        "readwrite"
                    );

                const store =
                    transaction.objectStore(
                        MEDIA_STORE
                    );

                const request =
                    store.put({
                        id: mediaId,
                        galleryId,
                        blob,
                        type: blob.type,
                        sizeBytes: blob.size,
                        createdAt:
                            new Date()
                                .toISOString()
                    });

                request.onsuccess =
                    () => resolve();

                request.onerror =
                    () => reject(
                        request.error
                    );

            }
        );

    }


    /* =====================================================
       GET MEDIA BLOB
    ====================================================== */

    async function getMediaBlob(
        mediaId
    ) {

        const db =
            await openDatabase();

        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
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

                        resolve(
                            request.result
                                ? request.result.blob
                                : null
                        );

                    };

                request.onerror =
                    () => reject(
                        request.error
                    );

            }
        );

    }


    /* =====================================================
       DELETE MEDIA BLOB
    ====================================================== */

    async function deleteMediaBlob(
        mediaId
    ) {

        const db =
            await openDatabase();

        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        MEDIA_STORE,
                        "readwrite"
                    );

                const store =
                    transaction.objectStore(
                        MEDIA_STORE
                    );

                const request =
                    store.delete(mediaId);

                request.onsuccess =
                    () => resolve();

                request.onerror =
                    () => reject(
                        request.error
                    );

            }
        );

    }


    /* =====================================================
       DELETE GALLERY MEDIA
    ====================================================== */

    async function deleteGalleryMedia(
        galleryId
    ) {

        const db =
            await openDatabase();

        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        MEDIA_STORE,
                        "readwrite"
                    );

                const store =
                    transaction.objectStore(
                        MEDIA_STORE
                    );

                const request =
                    store.openCursor();

                request.onsuccess =
                    event => {

                        const cursor =
                            event.target.result;

                        if (!cursor) {
                            return;
                        }

                        if (
                            cursor.value.galleryId ===
                            galleryId
                        ) {

                            store.delete(
                                cursor.value.id
                            );

                        }

                        cursor.continue();

                    };

                transaction.oncomplete =
                    () => resolve();

                transaction.onerror =
                    () => reject(
                        transaction.error
                    );

            }
        );

    }


    /* =====================================================
       WEDDING ALBUM HELPERS
    ====================================================== */

    function getWeddingAlbum(
        gallery
    ) {

        if (!gallery) {
            return null;
        }

        return gallery.sections.find(
            section =>
                section.isWeddingAlbum === true
        ) || null;

    }


    function ensureWeddingAlbum(
        gallery
    ) {

        if (!gallery.sections) {
            gallery.sections = [];
        }

        let weddingAlbum =
            getWeddingAlbum(
                gallery
            );

        if (!weddingAlbum) {

            weddingAlbum = {

                id:
                    createId("weddingAlbum"),

                name:
                    "WEDDING ALBUM",

                createdAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString(),

                isWeddingAlbum:
                    true,

                system:
                    true

            };

            gallery.sections.push(
                weddingAlbum
            );

        }

        return weddingAlbum;

    }


    /* =====================================================
       ALBUM SELECTION DATA
    ====================================================== */

    function normalizeAlbumSelection(
        selection
    ) {

        selection =
            selection || {};

        return {

            enabled:
                Boolean(
                    selection.enabled
                ),

            maxSelections:
                selection.maxSelections ===
                null ||
                selection.maxSelections ===
                undefined ||
                selection.maxSelections === ""
                    ? null
                    : Number(
                        selection.maxSelections
                    ),

            status:
                selection.status ||
                "closed",

            selectedMediaIds:
                Array.isArray(
                    selection.selectedMediaIds
                )
                    ? [
                        ...new Set(
                            selection.selectedMediaIds
                        )
                    ]
                    : [],

            comments:
                selection.comments &&
                typeof selection.comments ===
                    "object"
                    ? selection.comments
                    : {},

            submittedAt:
                selection.submittedAt ||
                null,

            submittedBy:
                selection.submittedBy ||
                "client",

            photographerApproved:
                Boolean(
                    selection.photographerApproved
                ),

            approvedAt:
                selection.approvedAt ||
                null

        };

    }


    /* =====================================================
       NORMALIZE GALLERY
    ====================================================== */

    function normalizeGallery(
        gallery
    ) {

        const now =
            new Date().toISOString();

        const storageGB =
            Number(
                gallery.storageGB ??
                (
                    gallery.storage?.limitMB
                        ? gallery.storage.limitMB / 1024
                        : 0
                )
            );

        const media =
            Array.isArray(gallery.media)
                ? gallery.media.map(
                    normalizeMedia
                )
                : [];

        const sections =
            Array.isArray(gallery.sections)
                ? gallery.sections
                : (
                    Array.isArray(gallery.albums)
                        ? gallery.albums
                        : []
                );

        const normalizedSections =
            sections.map(section => ({

                id:
                    section.id ||
                    createId("section"),

                name:
                    section.name ||
                    "Untitled Section",

                createdAt:
                    section.createdAt ||
                    now,

                updatedAt:
                    section.updatedAt ||
                    now,

                isWeddingAlbum:
                    Boolean(
                        section.isWeddingAlbum
                    ),

                system:
                    Boolean(
                        section.system
                    )

            }));

        const createdAt =
            gallery.createdAt ||
            now;

        let expiresAt =
            gallery.expiresAt;

        if (!expiresAt) {

            expiresAt =
                addMonths(
                    createdAt,
                    Number(
                        gallery.durationMonths || 6
                    )
                ).toISOString();

        }

        const passwordEnabled =
            Boolean(
                gallery.access?.passwordEnabled ??
                gallery.passwordEnabled ??
                gallery.password ??
                false
            );

        const password =
            gallery.access?.password ??
            gallery.password ??
            "";

        const downloadsEnabled =
            gallery.access?.downloadsEnabled ??
            gallery.downloadsEnabled ??
            false;

        const visible =
            gallery.access?.visible ??
            gallery.visible ??
            false;

        const usedBytes =
            media.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.sizeBytes || 0
                    ),
                0
            );

        const normalized = {

            id:
                gallery.id ||
                createId("gallery"),

            name:
                gallery.name ||
                "Untitled Client Gallery",

            clientName:
                gallery.clientName ||
                "Client",

            description:
                gallery.description ||
                "",

            storageGB:
                storageGB || 10,

            durationMonths:
                Number(
                    gallery.durationMonths || 6
                ),

            createdAt,

            expiresAt,

            galleryLink:
                gallery.galleryLink ||
                createGalleryLink(
                    gallery.id ||
                    createId("gallery")
                ),

            deliveryStatus:
                gallery.deliveryStatus ||
                "preparing",

            sentAt:
                gallery.sentAt ||
                null,

            downloads:
                Number(
                    gallery.downloads || 0
                ),

            views:
                Number(
                    gallery.views || 0
                ),

            media,

            sections:
                normalizedSections,

            coverMediaId:
                gallery.coverMediaId ||
                null,

            access: {

                passwordEnabled,

                password,

                downloadsEnabled,

                visible

            },

            storage: {

                limitMB:
                    Number(
                        storageGB || 10
                    ) * 1024,

                usedBytes

            },

            purchaseId:
                gallery.purchaseId ||
                null,

            albumSelection:
                normalizeAlbumSelection(
                    gallery.albumSelection
                ),

            updatedAt:
                gallery.updatedAt ||
                now

        };

        ensureWeddingAlbum(
            normalized
        );

        return normalized;

    }


    /* =====================================================
       NORMALIZE MEDIA
    ====================================================== */

    function normalizeMedia(
        media
    ) {

        return {

            id:
                media.id ||
                createId("media"),

            name:
                media.name ||
                "Untitled",

            type:
                media.type === "video"
                    ? "video"
                    : "photo",

            mimeType:
                media.mimeType ||
                media.mime ||
                "",

            sizeBytes:
                Number(
                    media.sizeBytes ||
                    (
                        Number(
                            media.sizeMB || 0
                        ) *
                        1024 *
                        1024
                    )
                ),

            sectionId:
                media.sectionId ||
                media.albumId ||
                null,

            createdAt:
                media.createdAt ||
                new Date().toISOString()

        };

    }


    /* =====================================================
       CREATE CLIENT LINK
    ====================================================== */

    function createGalleryLink(
        galleryId
    ) {

        return (
            window.location.origin +
            window.location.pathname
                .replace(
                    "clientgallery.html",
                    "gallery.html"
                ) +
            "?gallery=" +
            encodeURIComponent(
                galleryId
            )
        );

    }


    /* =====================================================
       LOAD GALLERIES
    ====================================================== */

    function loadGalleries() {

        try {

            const stored =
                localStorage.getItem(
                    GALLERIES_STORAGE_KEY
                );

            galleries =
                stored
                    ? JSON.parse(stored)
                    : [];

        } catch (error) {

            console.error(
                "Could not load galleries:",
                error
            );

            galleries = [];

        }

        if (!Array.isArray(galleries)) {
            galleries = [];
        }

        galleries =
            galleries.map(
                normalizeGallery
            );

        /*
            Ensure migrations are saved.
        */

        try {

            localStorage.setItem(
                GALLERIES_STORAGE_KEY,
                JSON.stringify(galleries)
            );

        } catch (error) {

            console.error(
                "Could not save normalized galleries:",
                error
            );

        }

    }


    /* =====================================================
       SAVE GALLERIES
    ====================================================== */

    function saveGalleries() {

        try {

            localStorage.setItem(
                GALLERIES_STORAGE_KEY,
                JSON.stringify(galleries)
            );

            window.dispatchEvent(
                new CustomEvent(
                    "professionalStudioClientGalleriesUpdated"
                )
            );

            return true;

        } catch (error) {

            console.error(
                "Could not save galleries:",
                error
            );

            showToast(
                "Could not save gallery information."
            );

            return false;

        }

    }


    /* =====================================================
       PROCESS GALLERY SHOP PURCHASE
    ====================================================== */

    function processPendingPurchase() {

        let pending = null;

        try {

            const raw =
                localStorage.getItem(
                    PENDING_GALLERY_KEY
                );

            if (!raw) {
                return false;
            }

            pending =
                JSON.parse(raw);

        } catch (error) {

            console.error(
                "Invalid pending gallery:",
                error
            );

            localStorage.removeItem(
                PENDING_GALLERY_KEY
            );

            return false;

        }

        if (
            !pending ||
            !pending.storageGB ||
            !pending.durationMonths
        ) {

            return false;

        }


        const purchaseId =
            pending.purchaseId ||
            null;

        const alreadyExists =
            galleries.some(
                gallery =>
                    purchaseId &&
                    gallery.purchaseId ===
                    purchaseId
            );

        if (alreadyExists) {

            localStorage.removeItem(
                PENDING_GALLERY_KEY
            );

            return false;

        }


        const createdAt =
            pending.purchasedAt ||
            new Date().toISOString();

        const expiresAt =
            addMonths(
                createdAt,
                Number(
                    pending.durationMonths
                )
            ).toISOString();

        const galleryId =
            createId("gallery");

        const newGallery = {

            id:
                galleryId,

            name:
                "New Client Gallery",

            clientName:
                "Client",

            description:
                "",

            storageGB:
                Number(
                    pending.storageGB
                ),

            durationMonths:
                Number(
                    pending.durationMonths
                ),

            createdAt,

            expiresAt,

            galleryLink:
                createGalleryLink(
                    galleryId
                ),

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

            sections:
                [
                    {
                        id:
                            createId("section"),

                        name:
                            "Highlights",

                        createdAt,

                        updatedAt:
                            createdAt,

                        isWeddingAlbum:
                            false,

                        system:
                            false
                    },

                    {
                        id:
                            createId("weddingAlbum"),

                        name:
                            "WEDDING ALBUM",

                        createdAt,

                        updatedAt:
                            createdAt,

                        isWeddingAlbum:
                            true,

                        system:
                            true
                    }
                ],

            coverMediaId:
                null,

            access:
                {
                    passwordEnabled:
                        false,

                    password:
                        "",

                    downloadsEnabled:
                        false,

                    visible:
                        false
                },

            storage:
                {
                    limitMB:
                        Number(
                            pending.storageGB
                        ) * 1024,

                    usedBytes:
                        0
                },

            albumSelection:
                {
                    enabled:
                        false,

                    maxSelections:
                        null,

                    status:
                        "closed",

                    selectedMediaIds:
                        [],

                    comments:
                        {},

                    submittedAt:
                        null,

                    submittedBy:
                        "client",

                    photographerApproved:
                        false,

                    approvedAt:
                        null
                },

            purchaseId,

            updatedAt:
                new Date().toISOString()

        };


        galleries.unshift(
            newGallery
        );

        saveGalleries();


        localStorage.removeItem(
            PENDING_GALLERY_KEY
        );


        showToast(
            "Gallery purchased and added to your workspace."
        );


        return true;

    }


    /* =====================================================
       SELECTED GALLERY
    ====================================================== */

    function getSelectedGallery() {

        return galleries.find(
            gallery =>
                gallery.id ===
                selectedGalleryId
        );

    }


    /* =====================================================
       STORAGE CALCULATION
    ====================================================== */

    function calculateUsedBytes(
        gallery
    ) {

        return gallery.media.reduce(
            (
                total,
                media
            ) =>
                total +
                Number(
                    media.sizeBytes || 0
                ),
            0
        );

    }


    function getStorageLimitBytes(
        gallery
    ) {

        return (
            Number(
                gallery.storageGB || 0
            ) *
            1024 *
            1024 *
            1024
        );

    }


    function updateGalleryStorage(
        gallery
    ) {

        const usedBytes =
            calculateUsedBytes(
                gallery
            );

        gallery.storage =
            gallery.storage || {};

        gallery.storage.limitMB =
            Number(
                gallery.storageGB || 0
            ) * 1024;

        gallery.storage.usedBytes =
            usedBytes;

    }


    /* =====================================================
       CHECK GALLERY READINESS
    ====================================================== */

    function isGalleryReady(
        gallery
    ) {

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

        const access =
            gallery.access || {};

        const passwordReady =
            !access.passwordEnabled ||
            Boolean(
                access.password &&
                access.password.trim()
            );

        const downloadsReady =
            typeof access.downloadsEnabled ===
            "boolean";

        const storageReady =
            calculateUsedBytes(
                gallery
            ) <=
            getStorageLimitBytes(
                gallery
            );

        return (
            hasName &&
            hasMedia &&
            passwordReady &&
            downloadsReady &&
            storageReady
        );

    }


    /* =====================================================
       GALLERY DISPLAY STATUS
    ====================================================== */

    function getStatusLabel(
        gallery
    ) {

        const status =
            getGalleryStatus(
                gallery
            );

        switch (status) {

            case "sent":
                return "Sent to Client";

            case "ready":
                return "Ready to Deliver";

            case "expired":
                return "Expired";

            default:
                return "Preparing";

        }

    }


    /* =====================================================
       RENDER PAGE
    ====================================================== */

    function renderPage() {

        renderStats();

        renderGalleryGrid();

        if (selectedGalleryId) {

            const selected =
                getSelectedGallery();

            if (selected) {
                renderModal();
            }

        }

    }


    /* =====================================================
       RENDER STATS
    ====================================================== */

    function renderStats() {

        const total =
            galleries.length;

        const active =
            galleries.filter(
                gallery =>
                    getGalleryStatus(
                        gallery
                    ) !== "expired"
            ).length;

        const preparing =
            galleries.filter(
                gallery =>
                    getGalleryStatus(
                        gallery
                    ) === "preparing"
            ).length;

        const totalBytes =
            galleries.reduce(
                (
                    total,
                    gallery
                ) =>
                    total +
                    calculateUsedBytes(
                        gallery
                    ),
                0
            );

        if (totalGalleries) {
            totalGalleries.textContent =
                total;
        }

        if (activeGalleries) {
            activeGalleries.textContent =
                active;
        }

        if (preparingGalleries) {
            preparingGalleries.textContent =
                preparing;
        }

        if (storageUsed) {
            storageUsed.textContent =
                formatStorage(
                    totalBytes
                );
        }

    }


    /* =====================================================
       FILTER GALLERIES
    ====================================================== */

    function getFilteredGalleries() {

        const search =
            (
                gallerySearch?.value ||
                ""
            )
            .trim()
            .toLowerCase();

        const filter =
            statusFilter?.value ||
            "all";

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

                const matchesStatus =
                    filter === "all" ||
                    getGalleryStatus(
                        gallery
                    ) === filter;

                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );

    }


    /* =====================================================
       RENDER GALLERY GRID
    ====================================================== */

    function renderGalleryGrid() {

        if (!galleryGrid) {
            return;
        }

        const filtered =
            getFilteredGalleries();

        galleryGrid.innerHTML = "";

        if (!filtered.length) {

            galleryGrid.innerHTML =
                `
                <div class="gallery-no-results">
                    <h3>No galleries found</h3>
                    <p>
                        Try changing your search or
                        status filter.
                    </p>
                </div>
                `;

            if (galleryEmpty) {

                galleryEmpty.hidden =
                    galleries.length !== 0;

            }

            return;

        }

        if (galleryEmpty) {
            galleryEmpty.hidden = true;
        }


        filtered.forEach(
            gallery => {

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

                const usedBytes =
                    calculateUsedBytes(
                        gallery
                    );

                const limitBytes =
                    getStorageLimitBytes(
                        gallery
                    );

                const storagePercent =
                    limitBytes > 0
                        ? Math.min(
                            100,
                            (
                                usedBytes /
                                limitBytes
                            ) * 100
                        )
                        : 0;

                const weddingAlbum =
                    getWeddingAlbum(
                        gallery
                    );

                const weddingAlbumCount =
                    weddingAlbum
                        ? gallery.media.filter(
                            media =>
                                media.sectionId ===
                                weddingAlbum.id
                        ).length
                        : 0;

                card.innerHTML =
                    `
                    <div
                        class="gallery-card-cover"
                        data-gallery-cover="${escapeHTML(
                            gallery.id
                        )}"
                    >
                        <div class="gallery-cover-placeholder">
                            <span>PHOTO</span>
                        </div>

                        <span class="gallery-status ${escapeHTML(
                            status
                        )}">
                            ${escapeHTML(
                                getStatusLabel(
                                    gallery
                                )
                            )}
                        </span>
                    </div>

                    <div class="gallery-card-body">

                        <div class="gallery-card-heading">
                            <div>
                                <span class="eyebrow">
                                    CLIENT GALLERY
                                </span>

                                <h3>
                                    ${escapeHTML(
                                        gallery.name
                                    )}
                                </h3>
                            </div>
                        </div>

                        <p class="gallery-client-name">
                            ${escapeHTML(
                                gallery.clientName
                            )}
                        </p>

                        <div class="gallery-card-meta">

                            <span>
                                ${gallery.media.length}
                                ${
                                    gallery.media.length === 1
                                        ? "item"
                                        : "items"
                                }
                            </span>

                            <span>
                                ${formatStorage(
                                    usedBytes
                                )}
                                /
                                ${escapeHTML(
                                    String(
                                        gallery.storageGB
                                    )
                                )} GB
                            </span>

                        </div>

                        <div class="gallery-storage-mini">

                            <div
                                class="gallery-storage-mini-bar"
                                style="width:${storagePercent}%"
                            ></div>

                        </div>

                        ${
                            weddingAlbumCount > 0
                                ? `
                                <div class="gallery-wedding-album-mini">
                                    <span>
                                        WEDDING ALBUM
                                    </span>
                                    <strong>
                                        ${weddingAlbumCount}
                                        ${
                                            weddingAlbumCount === 1
                                                ? "photo"
                                                : "photos"
                                        }
                                    </strong>
                                </div>
                                `
                                : ""
                        }

                        <div class="gallery-card-footer">

                            <span>
                                Expires
                                ${formatDate(
                                    gallery.expiresAt
                                )}
                            </span>

                            <button
                                type="button"
                                class="primary-btn manage-gallery-btn"
                                data-gallery-id="${escapeHTML(
                                    gallery.id
                                )}"
                            >
                                Manage
                            </button>

                        </div>

                    </div>
                    `;

                galleryGrid.appendChild(
                    card
                );

                loadGalleryCover(
                    gallery,
                    card
                );

            }
        );

    }


    /* =====================================================
       LOAD GALLERY COVER
    ====================================================== */

    async function loadGalleryCover(
        gallery,
        card
    ) {

        const coverContainer =
            card.querySelector(
                "[data-gallery-cover]"
            );

        if (!coverContainer) {
            return;
        }

        let coverMedia = null;

        if (gallery.coverMediaId) {

            coverMedia =
                gallery.media.find(
                    media =>
                        media.id ===
                        gallery.coverMediaId
                );

        }

        if (!coverMedia) {

            coverMedia =
                gallery.media.find(
                    media =>
                        media.type ===
                        "photo"
                );

        }

        if (!coverMedia) {
            return;
        }

        try {

            const blob =
                await getMediaBlob(
                    coverMedia.id
                );

            if (!blob) {
                return;
            }

            const objectUrl =
                URL.createObjectURL(
                    blob
                );

            activeObjectUrls.add(
                objectUrl
            );

            coverContainer
                .innerHTML =
                `
                <img
                    src="${objectUrl}"
                    alt="${escapeHTML(
                        gallery.name
                    )}"
                >

                <span class="gallery-status ${escapeHTML(
                    getGalleryStatus(
                        gallery
                    )
                )}">
                    ${escapeHTML(
                        getStatusLabel(
                            gallery
                        )
                    )}
                </span>
                `;

        } catch (error) {

            console.error(
                "Could not load gallery cover:",
                error
            );

        }

    }


    /* =====================================================
       OPEN GALLERY
    ====================================================== */

    function openGallery(
        galleryId
    ) {

        const gallery =
            galleries.find(
                item =>
                    item.id ===
                    galleryId
            );

        if (!gallery) {
            return;
        }

        ensureWeddingAlbum(
            gallery
        );

        selectedGalleryId =
            galleryId;

        activeMediaFilter =
            "all";

        if (mediaFilter) {
            mediaFilter.value = "all";
        }

        renderModal();

        openGalleryModal();

    }


    /* =====================================================
       OPEN MODAL
    ====================================================== */

    function openGalleryModal() {

        if (!galleryModal) {
            return;
        }

        galleryModal.classList.add(
            "open"
        );

        galleryModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        activateTab(
            "overview"
        );

    }


    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    function closeGalleryModalFn() {

        if (!galleryModal) {
            return;
        }

        galleryModal.classList.remove(
            "open"
        );

        galleryModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        selectedGalleryId =
            null;

        selectedAlbumId =
            null;

        editingAlbumId =
            null;

        revokeObjectUrls();

    }


    /* =====================================================
       REVOKE OBJECT URLS
    ====================================================== */

    function revokeObjectUrls() {

        activeObjectUrls.forEach(
            url => {

                try {
                    URL.revokeObjectURL(
                        url
                    );
                } catch (error) {}

            }
        );

        activeObjectUrls.clear();

    }


    /* =====================================================
       RENDER MODAL
    ====================================================== */

    function renderModal() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        ensureWeddingAlbum(
            gallery
        );

        updateGalleryStorage(
            gallery
        );

        const usedBytes =
            calculateUsedBytes(
                gallery
            );

        const limitBytes =
            getStorageLimitBytes(
                gallery
            );

        const percent =
            limitBytes > 0
                ? Math.min(
                    100,
                    (
                        usedBytes /
                        limitBytes
                    ) * 100
                )
                : 0;


        if (modalGalleryTitle) {
            modalGalleryTitle.textContent =
                gallery.name;
        }

        if (modalGalleryClient) {
            modalGalleryClient.textContent =
                gallery.clientName;
        }

        if (modalGalleryName) {
            modalGalleryName.textContent =
                gallery.name;
        }

        if (modalClientName) {
            modalClientName.textContent =
                gallery.clientName;
        }

        if (modalDescription) {
            modalDescription.textContent =
                gallery.description ||
                "No description added.";
        }

        if (modalCreatedAt) {
            modalCreatedAt.textContent =
                formatDate(
                    gallery.createdAt
                );
        }

        if (modalDuration) {
            modalDuration.textContent =
                `${gallery.durationMonths} ${
                    gallery.durationMonths === 1
                        ? "month"
                        : "months"
                }`;
        }


        if (modalStorageText) {
            modalStorageText.textContent =
                `${formatStorage(
                    usedBytes
                )} used of ${
                    gallery.storageGB
                } GB`;
        }

        if (modalStorageLimit) {
            modalStorageLimit.textContent =
                `${gallery.storageGB} GB`;
        }

        if (modalStorageUsed) {
            modalStorageUsed.textContent =
                formatStorage(
                    usedBytes
                );
        }

        if (modalStorageProgress) {
            modalStorageProgress.style.width =
                `${percent}%`;
        }


        const daysLeft =
            getDaysLeft(
                gallery.expiresAt
            );

        if (modalExpiry) {
            modalExpiry.textContent =
                formatDate(
                    gallery.expiresAt
                );
        }

        if (modalExpiryDuration) {
            modalExpiryDuration.textContent =
                `${gallery.durationMonths} ${
                    gallery.durationMonths === 1
                        ? "month"
                        : "months"
                }`;
        }

        if (modalExpiryStatus) {
            modalExpiryStatus.textContent =
                daysLeft > 0
                    ? `${daysLeft} days remaining`
                    : "Gallery expired";
        }


        if (modalGalleryLink) {
            modalGalleryLink.value =
                gallery.galleryLink;
        }


        if (editGalleryName) {
            editGalleryName.value =
                gallery.name;
        }

        if (editClientName) {
            editClientName.value =
                gallery.clientName;
        }

        if (editGalleryDescription) {
            editGalleryDescription.value =
                gallery.description;
        }

        if (passwordEnabled) {
            passwordEnabled.checked =
                Boolean(
                    gallery.access
                        ?.passwordEnabled
                );
        }

        if (galleryPassword) {
            galleryPassword.value =
                gallery.access
                    ?.password ||
                "";
        }

        if (downloadsEnabled) {
            downloadsEnabled.checked =
                Boolean(
                    gallery.access
                        ?.downloadsEnabled
                );
        }

        if (galleryVisible) {
            galleryVisible.checked =
                Boolean(
                    gallery.access
                        ?.visible
                );
        }


        updatePasswordVisibility(
            gallery
        );

        updateAccessSummary(
            gallery
        );

        updateDeliveryReadiness(
            gallery
        );

        renderMedia();

        renderAlbums();

        renderWeddingAlbumPanel();

    }


    /* =====================================================
       WEDDING ALBUM PANEL
    ====================================================== */

    function renderWeddingAlbumPanel() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        ensureWeddingAlbum(
            gallery
        );

        const existing =
            document.getElementById(
                "professionalStudioWeddingAlbumPanel"
            );

        if (existing) {
            existing.remove();
        }

        const albumsTab =
            document.getElementById(
                "tab-albums"
            );

        if (!albumsTab) {
            return;
        }

        const selection =
            gallery.albumSelection;

        const weddingAlbum =
            getWeddingAlbum(
                gallery
            );

        const selectedMedia =
            gallery.media.filter(
                media =>
                    media.sectionId ===
                    weddingAlbum.id
            );

        const selectedCount =
            selectedMedia.length;

        const maxText =
            selection.maxSelections
                ? `${selection.maxSelections} photos maximum`
                : "No selection limit";

        const statusLabel =
            selection.status === "submitted"
                ? "Selection Submitted"
                : selection.status === "approved"
                    ? "Approved"
                    : selection.enabled
                        ? "Open"
                        : "Not Enabled";

        const panel =
            document.createElement(
                "section"
            );

        panel.id =
            "professionalStudioWeddingAlbumPanel";

        panel.className =
            "wedding-album-control-panel";

        panel.innerHTML =
            `
            <div class="wedding-album-panel-header">

                <div>
                    <span class="eyebrow">
                        CLIENT SELECTION
                    </span>

                    <h3>
                        WEDDING ALBUM
                    </h3>

                    <p>
                        Let your client select the photos
                        they want in the physical wedding album.
                    </p>
                </div>

                <span class="wedding-album-status">
                    ${escapeHTML(
                        statusLabel
                    )}
                </span>

            </div>

            <div class="wedding-album-panel-stats">

                <div>
                    <strong>
                        ${selectedCount}
                    </strong>

                    <span>
                        Selected
                    </span>
                </div>

                <div>
                    <strong>
                        ${escapeHTML(
                            maxText
                        )}
                    </strong>

                    <span>
                        Selection limit
                    </span>
                </div>

                <div>
                    <strong>
                        ${gallery.media.filter(
                            media =>
                                media.type ===
                                "photo"
                        ).length}
                    </strong>

                    <span>
                        Available photos
                    </span>
                </div>

            </div>

            <div class="wedding-album-panel-actions">

                ${
                    selection.enabled
                        ? `
                            <button
                                type="button"
                                class="secondary-btn"
                                id="disableWeddingAlbumSelection"
                            >
                                Disable Selection
                            </button>
                        `
                        : `
                            <button
                                type="button"
                                class="primary-btn"
                                id="enableWeddingAlbumSelection"
                            >
                                Enable Album Selection
                            </button>
                        `
                }

                ${
                    selection.status === "submitted"
                        ? `
                            <button
                                type="button"
                                class="primary-btn"
                                id="approveWeddingAlbumSelection"
                            >
                                Approve Selection
                            </button>

                            <button
                                type="button"
                                class="secondary-btn"
                                id="reopenWeddingAlbumSelection"
                            >
                                Reopen Selection
                            </button>
                        `
                        : ""
                }

                ${
                    selection.status === "approved"
                        ? `
                            <button
                                type="button"
                                class="secondary-btn"
                                id="reopenWeddingAlbumSelection"
                            >
                                Reopen Selection
                            </button>
                        `
                        : ""
                }

            </div>

            ${
                selection.enabled
                    ? `
                        <div class="wedding-album-limit-control">

                            <label
                                for="weddingAlbumMaxSelections"
                            >
                                Maximum photos
                            </label>

                            <div class="wedding-album-limit-row">

                                <input
                                    type="number"
                                    id="weddingAlbumMaxSelections"
                                    min="1"
                                    max="10000"
                                    value="${
                                        selection.maxSelections ??
                                        ""
                                    }"
                                    placeholder="No limit"
                                >

                                <button
                                    type="button"
                                    class="secondary-btn"
                                    id="saveWeddingAlbumLimit"
                                >
                                    Save Limit
                                </button>

                            </div>

                            <small>
                                Leave empty if the client can select any number of photos.
                            </small>

                        </div>
                    `
                    : ""
            }

            <div class="wedding-album-info">

                <strong>
                    How it works
                </strong>

                <p>
                    Clients select photos from the gallery.
                    Selected photos are placed into this
                    WEDDING ALBUM folder using the same
                    existing media files. No duplicate uploads
                    or extra storage are created.
                </p>

            </div>
            `;

        albumsTab.prepend(
            panel
        );


        const enableButton =
            document.getElementById(
                "enableWeddingAlbumSelection"
            );

        if (enableButton) {

            enableButton.addEventListener(
                "click",
                enableWeddingAlbumSelection
            );

        }


        const disableButton =
            document.getElementById(
                "disableWeddingAlbumSelection"
            );

        if (disableButton) {

            disableButton.addEventListener(
                "click",
                disableWeddingAlbumSelection
            );

        }


        const saveLimitButton =
            document.getElementById(
                "saveWeddingAlbumLimit"
            );

        if (saveLimitButton) {

            saveLimitButton.addEventListener(
                "click",
                saveWeddingAlbumLimit
            );

        }


        const approveButton =
            document.getElementById(
                "approveWeddingAlbumSelection"
            );

        if (approveButton) {

            approveButton.addEventListener(
                "click",
                approveWeddingAlbumSelection
            );

        }


        const reopenButton =
            document.getElementById(
                "reopenWeddingAlbumSelection"
            );

        if (reopenButton) {

            reopenButton.addEventListener(
                "click",
                reopenWeddingAlbumSelection
            );

        }

    }


    /* =====================================================
       ENABLE WEDDING ALBUM SELECTION
    ====================================================== */

    function enableWeddingAlbumSelection() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        gallery.albumSelection =
            normalizeAlbumSelection(
                gallery.albumSelection
            );

        gallery.albumSelection.enabled =
            true;

        gallery.albumSelection.status =
            "open";

        gallery.albumSelection.photographerApproved =
            false;

        gallery.albumSelection.approvedAt =
            null;

        gallery.updatedAt =
            new Date().toISOString();

        ensureWeddingAlbum(
            gallery
        );

        saveGalleries();

        renderModal();

        showToast(
            "Wedding Album selection enabled."
        );

    }


    /* =====================================================
       DISABLE WEDDING ALBUM SELECTION
    ====================================================== */

    function disableWeddingAlbumSelection() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const confirmed =
            window.confirm(
                "Disable Wedding Album selection for this gallery?"
            );

        if (!confirmed) {
            return;
        }

        gallery.albumSelection.enabled =
            false;

        gallery.albumSelection.status =
            "closed";

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        renderModal();

        showToast(
            "Wedding Album selection disabled."
        );

    }


    /* =====================================================
       SAVE WEDDING ALBUM LIMIT
    ====================================================== */

    function saveWeddingAlbumLimit() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const input =
            document.getElementById(
                "weddingAlbumMaxSelections"
            );

        if (!input) {
            return;
        }

        const value =
            input.value.trim();

        if (!value) {

            gallery.albumSelection.maxSelections =
                null;

        } else {

            const limit =
                Number(value);

            if (
                !Number.isInteger(limit) ||
                limit < 1
            ) {

                showToast(
                    "Enter a valid selection limit."
                );

                return;

            }

            gallery.albumSelection.maxSelections =
                limit;

        }

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        renderModal();

        showToast(
            "Wedding Album selection limit saved."
        );

    }


    /* =====================================================
       APPROVE WEDDING ALBUM SELECTION
    ====================================================== */

    function approveWeddingAlbumSelection() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const selectedCount =
            gallery.albumSelection
                .selectedMediaIds
                .length;

        if (!selectedCount) {

            showToast(
                "There are no selected photos to approve."
            );

            return;

        }

        const confirmed =
            window.confirm(
                `Approve ${selectedCount} selected ${
                    selectedCount === 1
                        ? "photo"
                        : "photos"
                } for the Wedding Album?`
            );

        if (!confirmed) {
            return;
        }

        gallery.albumSelection.status =
            "approved";

        gallery.albumSelection.photographerApproved =
            true;

        gallery.albumSelection.approvedAt =
            new Date().toISOString();

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        renderModal();

        showToast(
            "Wedding Album selection approved."
        );

    }


    /* =====================================================
       REOPEN WEDDING ALBUM SELECTION
    ====================================================== */

    function reopenWeddingAlbumSelection() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        gallery.albumSelection.status =
            "open";

        gallery.albumSelection.photographerApproved =
            false;

        gallery.albumSelection.approvedAt =
            null;

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        renderModal();

        showToast(
            "Wedding Album selection reopened."
        );

    }


    /* =====================================================
       MOVE MEDIA TO WEDDING ALBUM
       IMPORTANT:
       THIS DOES NOT COPY THE FILE.
       ONLY SECTION ID CHANGES.
    ====================================================== */

    function moveMediaToWeddingAlbum(
        mediaId
    ) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return false;
        }

        const weddingAlbum =
            ensureWeddingAlbum(
                gallery
            );

        const media =
            gallery.media.find(
                item =>
                    item.id ===
                    mediaId
            );

        if (!media) {
            return false;
        }

        if (
            media.type !==
            "photo"
        ) {

            showToast(
                "Only photos can be added to the Wedding Album."
            );

            return false;

        }

        /*
            No blob operation happens here.

            The existing media record stays exactly
            where it is in IndexedDB.

            We only change its folder reference.
        */

        media.sectionId =
            weddingAlbum.id;

        gallery.albumSelection =
            normalizeAlbumSelection(
                gallery.albumSelection
            );

        if (
            !gallery.albumSelection
                .selectedMediaIds
                .includes(mediaId)
        ) {

            gallery.albumSelection
                .selectedMediaIds
                .push(
                    mediaId
                );

        }

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        return true;

    }


    /* =====================================================
       REMOVE MEDIA FROM WEDDING ALBUM
       IMPORTANT:
       THIS DOES NOT DELETE THE FILE.
    ====================================================== */

    function removeMediaFromWeddingAlbum(
        mediaId
    ) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return false;
        }

        const weddingAlbum =
            getWeddingAlbum(
                gallery
            );

        if (!weddingAlbum) {
            return false;
        }

        const media =
            gallery.media.find(
                item =>
                    item.id ===
                    mediaId
            );

        if (!media) {
            return false;
        }

        if (
            media.sectionId !==
            weddingAlbum.id
        ) {
            return false;
        }

        /*
            We do not delete the IndexedDB blob.

            We only remove the photo from the
            Wedding Album folder.
        */

        media.sectionId =
            null;

        gallery.albumSelection =
            normalizeAlbumSelection(
                gallery.albumSelection
            );

        gallery.albumSelection
            .selectedMediaIds =
            gallery.albumSelection
                .selectedMediaIds
                .filter(
                    id =>
                        id !==
                        mediaId
                );

        delete gallery.albumSelection
            .comments[mediaId];

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        return true;

    }


    /* =====================================================
       GET WEDDING ALBUM MEDIA
    ====================================================== */

    function getWeddingAlbumMedia(
        gallery
    ) {

        const weddingAlbum =
            getWeddingAlbum(
                gallery
            );

        if (!weddingAlbum) {
            return [];
        }

        return gallery.media.filter(
            media =>
                media.sectionId ===
                weddingAlbum.id
        );

    }


    /* =====================================================
       ADD CLIENT COMMENT
    ====================================================== */

    function addClientAlbumComment(
        mediaId,
        comment
    ) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return false;
        }

        gallery.albumSelection =
            normalizeAlbumSelection(
                gallery.albumSelection
            );

        const mediaExists =
            gallery.media.some(
                media =>
                    media.id ===
                    mediaId
            );

        if (!mediaExists) {
            return false;
        }

        gallery.albumSelection.comments[
            mediaId
        ] =
            String(
                comment || ""
            ).trim();

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        return true;

    }


    /* =====================================================
       RENDER ALBUMS / SECTIONS
    ====================================================== */

    function renderAlbums() {

        const gallery =
            getSelectedGallery();

        if (!gallery || !albumsGrid) {
            return;
        }

        ensureWeddingAlbum(
            gallery
        );

        albumsGrid.innerHTML =
            "";


        if (!gallery.sections.length) {

            albumsGrid.innerHTML =
                `
                <div class="albums-empty-state">
                    <h4>No sections yet</h4>
                    <p>
                        Create sections to organize
                        this gallery.
                    </p>
                </div>
                `;

            return;

        }


        gallery.sections.forEach(
            section => {

                const sectionMedia =
                    gallery.media.filter(
                        media =>
                            media.sectionId ===
                            section.id
                    );

                const isWeddingAlbum =
                    section.isWeddingAlbum === true;

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    isWeddingAlbum
                        ? "album-card wedding-album-card"
                        : "album-card";

                card.innerHTML =
                    `
                    <div class="album-card-content">

                        <span class="eyebrow">
                            ${
                                isWeddingAlbum
                                    ? "CLIENT SELECTION"
                                    : "GALLERY SECTION"
                            }
                        </span>

                        <h4>
                            ${escapeHTML(
                                section.name
                            )}
                        </h4>

                        <p>
                            ${sectionMedia.length}
                            ${
                                sectionMedia.length === 1
                                    ? "photo"
                                    : "photos"
                            }
                        </p>

                        ${
                            isWeddingAlbum
                                ? `
                                    <small>
                                        ${
                                            gallery.albumSelection
                                                .status === "approved"
                                                ? "Selection approved"
                                                : gallery.albumSelection
                                                    .status === "submitted"
                                                    ? "Waiting for photographer review"
                                                    : gallery.albumSelection
                                                        .enabled
                                                        ? "Client selection folder"
                                                        : "Album selection disabled"
                                        }
                                    </small>
                                `
                                : ""
                        }

                    </div>

                    <div class="album-card-actions">

                        ${
                            isWeddingAlbum
                                ? `
                                    <button
                                        type="button"
                                        class="secondary-btn view-wedding-album"
                                    >
                                        View Album
                                    </button>
                                `
                                : `
                                    <button
                                        type="button"
                                        class="secondary-btn edit-album"
                                        data-album-id="${escapeHTML(
                                            section.id
                                        )}"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        class="danger-btn delete-album"
                                        data-album-id="${escapeHTML(
                                            section.id
                                        )}"
                                    >
                                        Delete
                                    </button>
                                `
                        }

                    </div>
                    `;


                albumsGrid.appendChild(
                    card
                );

            }
        );

        renderWeddingAlbumPanel();

    }


    /* =====================================================
       OPEN WEDDING ALBUM
    ====================================================== */

    function openWeddingAlbum() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const weddingAlbum =
            getWeddingAlbum(
                gallery
            );

        if (!weddingAlbum) {
            return;
        }

        selectedAlbumId =
            weddingAlbum.id;

        activateTab(
            "media"
        );

        renderMedia();

        showToast(
            "Showing WEDDING ALBUM photos."
        );

    }


    /* =====================================================
       OPEN ALBUM MODAL
    ====================================================== */

    function openAlbumModal(
        sectionId = null
    ) {

        if (!albumModal) {
            return;
        }

        editingAlbumId =
            sectionId;

        const gallery =
            getSelectedGallery();

        if (
            sectionId &&
            gallery
        ) {

            const section =
                gallery.sections.find(
                    item =>
                        item.id ===
                        sectionId
                );

            if (
                section &&
                albumName
            ) {

                albumName.value =
                    section.name;

            }

        } else {

            if (albumName) {
                albumName.value = "";
            }

        }

        albumModal.classList.add(
            "open"
        );

        albumModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =====================================================
       CLOSE ALBUM MODAL
    ====================================================== */

    function closeAlbumModalFn() {

        if (!albumModal) {
            return;
        }

        albumModal.classList.remove(
            "open"
        );

        albumModal.setAttribute(
            "aria-hidden",
            "true"
        );

        editingAlbumId =
            null;

        if (albumName) {
            albumName.value = "";
        }

    }


    /* =====================================================
       SAVE ALBUM / SECTION
    ====================================================== */

    function saveAlbum(
        event
    ) {

        event.preventDefault();

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const name =
            albumName
                ?.value
                .trim();


        if (!name) {

            showToast(
                "Enter a section name."
            );

            return;

        }


        if (editingAlbumId) {

            const section =
                gallery.sections.find(
                    item =>
                        item.id ===
                        editingAlbumId
                );

            if (section) {

                if (
                    section.isWeddingAlbum
                ) {

                    showToast(
                        "WEDDING ALBUM is a system folder and cannot be renamed."
                    );

                    closeAlbumModalFn();

                    return;

                }

                section.name =
                    name;

                section.updatedAt =
                    new Date().toISOString();

            }

            showToast(
                "Section updated."
            );

        } else {

            gallery.sections.push({

                id:
                    createId("section"),

                name,

                createdAt:
                    new Date()
                        .toISOString(),

                updatedAt:
                    new Date()
                        .toISOString(),

                isWeddingAlbum:
                    false,

                system:
                    false

            });

            showToast(
                "Section created."
            );

        }


        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        renderAlbums();

        closeAlbumModalFn();

    }


    /* =====================================================
       DELETE ALBUM / SECTION
    ====================================================== */

    async function deleteAlbum(
        sectionId
    ) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const section =
            gallery.sections.find(
                item =>
                    item.id ===
                    sectionId
            );

        if (!section) {
            return;
        }


        if (
            section.isWeddingAlbum
        ) {

            showToast(
                "WEDDING ALBUM is a protected system folder."
            );

            return;

        }


        const confirmed =
            window.confirm(
                `Delete the "${section.name}" section? Media inside it will be moved to no section.`
            );

        if (!confirmed) {
            return;
        }


        gallery.media.forEach(
            media => {

                if (
                    media.sectionId ===
                    sectionId
                ) {

                    media.sectionId =
                        null;

                }

            }
        );


        gallery.sections =
            gallery.sections.filter(
                item =>
                    item.id !==
                    sectionId
            );


        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        renderAlbums();

        renderMedia();

        showToast(
            "Section deleted."
        );

    }


    /* =====================================================
       SAVE GALLERY SETTINGS
    ====================================================== */

    function saveGallerySettings(
        event
    ) {

        event.preventDefault();

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }


        const name =
            editGalleryName
                ?.value
                .trim();

        const client =
            editClientName
                ?.value
                .trim();

        const description =
            editGalleryDescription
                ?.value
                .trim();


        if (!name) {

            showToast(
                "Gallery name is required."
            );

            return;

        }


        gallery.name =
            name;

        gallery.clientName =
            client ||
            "Client";

        gallery.description =
            description ||
            "";

        gallery.updatedAt =
            new Date().toISOString();


        saveGalleries();

        renderPage();

        renderModal();

        showToast(
            "Gallery details saved."
        );

    }


    /* =====================================================
       PASSWORD ENABLE / DISABLE
    ====================================================== */

    function togglePasswordEnabled() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        gallery.access =
            gallery.access || {};

        gallery.access.passwordEnabled =
            Boolean(
                passwordEnabled?.checked
            );


        if (
            !gallery.access.passwordEnabled
        ) {

            gallery.access.password =
                "";

            if (galleryPassword) {
                galleryPassword.value =
                    "";
            }

        }


        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        updatePasswordVisibility(
            gallery
        );

        updateAccessSummary(
            gallery
        );

        updateDeliveryReadiness(
            gallery
        );

    }


    /* =====================================================
       PASSWORD UI
    ====================================================== */

    function updatePasswordVisibility(
        gallery
    ) {

        if (!passwordSetting) {
            return;
        }

        const enabled =
            Boolean(
                gallery.access
                    ?.passwordEnabled
            );

        passwordSetting.style.display =
            enabled
                ? ""
                : "none";

    }


    function generateGalleryPassword() {

        const characters =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

        let password = "";

        for (
            let i = 0;
            i < 10;
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

        if (galleryPassword) {

            galleryPassword.value =
                password;

        }

    }


    function saveGalleryPassword() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const password =
            galleryPassword
                ?.value
                .trim();


        if (
            gallery.access
                ?.passwordEnabled &&
            !password
        ) {

            showToast(
                "Enter a password first."
            );

            return;

        }


        gallery.access =
            gallery.access || {};

        gallery.access.password =
            password || "";

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        updateAccessSummary(
            gallery
        );

        updateDeliveryReadiness(
            gallery
        );

        showToast(
            "Gallery password saved."
        );

    }


    /* =====================================================
       ACCESS SUMMARY
    ====================================================== */

    function updateAccessSummary(
        gallery
    ) {

        const access =
            gallery.access || {};

        if (modalPassword) {

            modalPassword.textContent =
                access.passwordEnabled
                    ? "Enabled"
                    : "Disabled";

        }

        if (modalDownloads) {

            modalDownloads.textContent =
                access.downloadsEnabled
                    ? "Allowed"
                    : "Disabled";

        }

        if (modalVisibility) {

            modalVisibility.textContent =
                access.visible
                    ? "Available"
                    : "Private";

        }

    }


    /* =====================================================
       DOWNLOAD SETTING
    ====================================================== */

    function updateDownloadsSetting() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        gallery.access =
            gallery.access || {};

        gallery.access.downloadsEnabled =
            Boolean(
                downloadsEnabled?.checked
            );

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        updateAccessSummary(
            gallery
        );

        updateDeliveryReadiness(
            gallery
        );

    }


    /* =====================================================
       VISIBILITY SETTING
    ====================================================== */

    function updateVisibilitySetting() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        gallery.access =
            gallery.access || {};

        gallery.access.visible =
            Boolean(
                galleryVisible?.checked
            );

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        updateAccessSummary(
            gallery
        );

        updateDeliveryReadiness(
            gallery
        );

    }


    /* =====================================================
       READINESS
    ====================================================== */

    function updateReadinessItem(
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
                    ? "✓"
                    : "•";

        }

    }


    function updateDeliveryReadiness(
        gallery
    ) {

        const access =
            gallery.access || {};

        const hasName =
            Boolean(
                gallery.name &&
                gallery.name.trim() &&
                gallery.clientName &&
                gallery.clientName.trim()
            );

        const hasMedia =
            gallery.media.length > 0;

        const passwordReady =
            !access.passwordEnabled ||
            Boolean(
                access.password &&
                access.password.trim()
            );

        const downloadsReady =
            typeof access.downloadsEnabled ===
            "boolean";

        const storageReady =
            calculateUsedBytes(
                gallery
            ) <=
            getStorageLimitBytes(
                gallery
            );

        updateReadinessItem(
            checkGalleryName,
            hasName
        );

        updateReadinessItem(
            checkMedia,
            hasMedia
        );

        updateReadinessItem(
            checkPassword,
            passwordReady
        );

        updateReadinessItem(
            checkDownloads,
            downloadsReady
        );

        updateReadinessItem(
            checkStorage,
            storageReady
        );


        const ready =
            hasName &&
            hasMedia &&
            passwordReady &&
            downloadsReady &&
            storageReady;


        if (deliveryStatus) {

            if (
                getGalleryStatus(
                    gallery
                ) === "sent"
            ) {

                deliveryStatus.textContent =
                    "SENT TO CLIENT";

                deliveryStatus.className =
                    "delivery-status sent";

            } else if (ready) {

                deliveryStatus.textContent =
                    "READY";

                deliveryStatus.className =
                    "delivery-status ready";

            } else {

                deliveryStatus.textContent =
                    "PREPARING";

                deliveryStatus.className =
                    "delivery-status preparing";

            }

        }


        if (deliveryMessage) {

            deliveryMessage.textContent =
                ready
                    ? "This gallery is ready to be delivered."
                    : "Finish the setup before sending this gallery.";

        }

        if (deliveryExpiry) {

            deliveryExpiry.textContent =
                `Gallery expires on ${formatDate(
                    gallery.expiresAt
                )}.`;

        }

        if (sendToClientBtn) {

            sendToClientBtn.disabled =
                !ready;

            sendToClientBtn.textContent =
                gallery.deliveryStatus === "sent"
                    ? "Gallery Sent"
                    : ready
                        ? "Send to Client"
                        : "Complete Setup";

        }

    }


    /* =====================================================
       RENDER MEDIA
    ====================================================== */

    async function renderMedia() {

        const gallery =
            getSelectedGallery();

        if (!gallery || !mediaGrid) {
            return;
        }

        revokeObjectUrls();

        mediaGrid.innerHTML =
            "";

        let media =
            [...gallery.media];


        /*
            If a Wedding Album is selected,
            show only its photos.
        */

        if (selectedAlbumId) {

            media =
                media.filter(
                    item =>
                        item.sectionId ===
                        selectedAlbumId
                );

        } else if (
            activeMediaFilter !==
            "all"
        ) {

            media =
                media.filter(
                    item =>
                        item.type ===
                        activeMediaFilter
                );

        }


        if (mediaCount) {

            if (selectedAlbumId) {

                mediaCount.textContent =
                    `${media.length} ${
                        media.length === 1
                            ? "photo"
                            : "photos"
                    } in WEDDING ALBUM`;

            } else {

                mediaCount.textContent =
                    `${gallery.media.length} ${
                        gallery.media.length === 1
                            ? "item"
                            : "items"
                    }`;

            }

        }


        if (!media.length) {

            mediaGrid.innerHTML =
                `
                <div class="media-empty-state">
                    <h4>
                        ${
                            selectedAlbumId
                                ? "WEDDING ALBUM is empty"
                                : "No media yet"
                        }
                    </h4>

                    <p>
                        ${
                            selectedAlbumId
                                ? "Selected client photos will appear here."
                                : "Upload photos or videos to this client gallery."
                        }
                    </p>
                </div>
                `;

            return;

        }


        for (
            const mediaItem
            of media
        ) {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "media-card";

            card.dataset.mediaId =
                mediaItem.id;


            const mediaBlob =
                await getMediaBlob(
                    mediaItem.id
                );


            const isWeddingAlbumMedia =
                selectedAlbumId &&
                mediaItem.sectionId ===
                selectedAlbumId;


            const clientComment =
                gallery.albumSelection
                    ?.comments
                    ?.[
                        mediaItem.id
                    ] ||
                "";


            if (mediaBlob) {

                const objectUrl =
                    URL.createObjectURL(
                        mediaBlob
                    );

                activeObjectUrls.add(
                    objectUrl
                );


                if (
                    mediaItem.type ===
                    "video"
                ) {

                    card.innerHTML =
                        `
                        <div class="media-preview">

                            <video
                                src="${objectUrl}"
                                controls
                                preload="metadata"
                            ></video>

                        </div>

                        <div class="media-card-info">

                            <strong>
                                ${escapeHTML(
                                    mediaItem.name
                                )}
                            </strong>

                            <small>
                                ${formatStorage(
                                    mediaItem.sizeBytes
                                )}
                            </small>

                        </div>

                        <div class="media-card-actions">

                            ${
                                !isWeddingAlbumMedia
                                    ? `
                                        <button
                                            type="button"
                                            class="secondary-btn add-to-wedding-album"
                                            data-media-id="${escapeHTML(
                                                mediaItem.id
                                            )}"
                                        >
                                            Add to Wedding Album
                                        </button>
                                    `
                                    : `
                                        <button
                                            type="button"
                                            class="secondary-btn remove-from-wedding-album"
                                            data-media-id="${escapeHTML(
                                                mediaItem.id
                                            )}"
                                        >
                                            Remove from Album
                                        </button>
                                    `
                            }

                            <button
                                type="button"
                                class="danger-btn remove-media"
                                data-media-id="${escapeHTML(
                                    mediaItem.id
                                )}"
                            >
                                Remove
                            </button>

                        </div>
                        `;

                } else {

                    card.innerHTML =
                        `
                        <div class="media-preview">

                            <img
                                src="${objectUrl}"
                                alt="${escapeHTML(
                                    mediaItem.name
                                )}"
                            >

                        </div>

                        <div class="media-card-info">

                            <strong>
                                ${escapeHTML(
                                    mediaItem.name
                                )}
                            </strong>

                            <small>
                                ${formatStorage(
                                    mediaItem.sizeBytes
                                )}
                            </small>

                        </div>

                        ${
                            clientComment
                                ? `
                                    <div class="client-photo-comment">
                                        <span>
                                            Client comment
                                        </span>

                                        <p>
                                            ${escapeHTML(
                                                clientComment
                                            )}
                                        </p>
                                    </div>
                                `
                                : ""
                        }

                        <div class="media-card-actions">

                            ${
                                !isWeddingAlbumMedia
                                    ? `
                                        <button
                                            type="button"
                                            class="secondary-btn add-to-wedding-album"
                                            data-media-id="${escapeHTML(
                                                mediaItem.id
                                            )}"
                                        >
                                            Add to Wedding Album
                                        </button>
                                    `
                                    : `
                                        <button
                                            type="button"
                                            class="secondary-btn remove-from-wedding-album"
                                            data-media-id="${escapeHTML(
                                                mediaItem.id
                                            )}"
                                        >
                                            Remove from Album
                                        </button>
                                    `
                            }

                            <button
                                type="button"
                                class="secondary-btn set-cover"
                                data-media-id="${escapeHTML(
                                    mediaItem.id
                                )}"
                            >
                                Set Cover
                            </button>

                            <button
                                type="button"
                                class="danger-btn remove-media"
                                data-media-id="${escapeHTML(
                                    mediaItem.id
                                )}"
                            >
                                Remove
                            </button>

                        </div>
                        `;

                }

            } else {

                card.innerHTML =
                    `
                    <div class="media-preview media-missing">

                        <span>
                            Media unavailable
                        </span>

                    </div>

                    <div class="media-card-info">

                        <strong>
                            ${escapeHTML(
                                mediaItem.name
                            )}
                        </strong>

                        <small>
                            File data not found
                        </small>

                    </div>

                    <div class="media-card-actions">

                        <button
                            type="button"
                            class="danger-btn remove-media"
                            data-media-id="${escapeHTML(
                                mediaItem.id
                            )}"
                        >
                            Remove
                        </button>

                    </div>
                    `;

            }


            mediaGrid.appendChild(
                card
            );

        }

    }


    /* =====================================================
       UPLOAD MEDIA
    ====================================================== */

    async function uploadFiles(
        files
    ) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const fileArray =
            Array.from(files || []);

        if (!fileArray.length) {
            return;
        }


        const validFiles =
            fileArray.filter(
                file =>
                    file.type.startsWith(
                        "image/"
                    ) ||
                    file.type.startsWith(
                        "video/"
                    )
            );


        if (!validFiles.length) {

            showToast(
                "Please select image or video files."
            );

            return;

        }


        const currentUsed =
            calculateUsedBytes(
                gallery
            );

        const limit =
            getStorageLimitBytes(
                gallery
            );

        const incomingSize =
            validFiles.reduce(
                (
                    total,
                    file
                ) =>
                    total +
                    file.size,
                0
            );


        if (
            currentUsed +
            incomingSize >
            limit
        ) {

            showToast(
                "These files exceed your purchased gallery storage."
            );

            return;

        }


        const addedMedia =
            [];


        try {

            for (
                const file
                of validFiles
            ) {

                const mediaId =
                    createId("media");

                const type =
                    file.type.startsWith(
                        "video/"
                    )
                        ? "video"
                        : "photo";


                await saveMediaBlob(
                    mediaId,
                    file,
                    gallery.id
                );


                addedMedia.push({

                    id:
                        mediaId,

                    name:
                        file.name,

                    type,

                    mimeType:
                        file.type,

                    sizeBytes:
                        file.size,

                    sectionId:
                        null,

                    createdAt:
                        new Date()
                            .toISOString()

                });

            }


            gallery.media.push(
                ...addedMedia
            );


            if (
                !gallery.coverMediaId
            ) {

                const firstPhoto =
                    addedMedia.find(
                        item =>
                            item.type ===
                            "photo"
                    );

                if (firstPhoto) {

                    gallery.coverMediaId =
                        firstPhoto.id;

                }

            }


            updateGalleryStorage(
                gallery
            );

            gallery.updatedAt =
                new Date().toISOString();

            saveGalleries();

            renderPage();

            renderModal();

            showToast(
                `${addedMedia.length} ${
                    addedMedia.length === 1
                        ? "file"
                        : "files"
                } uploaded successfully.`
            );


        } catch (error) {

            console.error(
                "Upload failed:",
                error
            );


            for (
                const item
                of addedMedia
            ) {

                try {

                    await deleteMediaBlob(
                        item.id
                    );

                } catch (
                    cleanupError
                ) {}

            }


            showToast(
                "Upload failed. Please try again."
            );

        }

    }


    /* =====================================================
       REMOVE MEDIA
    ====================================================== */

    async function removeMedia(
        mediaId
    ) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const media =
            gallery.media.find(
                item =>
                    item.id ===
                    mediaId
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


        try {

            await deleteMediaBlob(
                mediaId
            );

        } catch (error) {

            console.error(
                "Could not delete media blob:",
                error
            );

        }


        gallery.media =
            gallery.media.filter(
                item =>
                    item.id !==
                    mediaId
            );


        if (
            gallery.coverMediaId ===
            mediaId
        ) {

            const nextPhoto =
                gallery.media.find(
                    item =>
                        item.type ===
                        "photo"
                );

            gallery.coverMediaId =
                nextPhoto
                    ? nextPhoto.id
                    : null;

        }


        gallery.albumSelection =
            normalizeAlbumSelection(
                gallery.albumSelection
            );

        gallery.albumSelection
            .selectedMediaIds =
            gallery.albumSelection
                .selectedMediaIds
                .filter(
                    id =>
                        id !==
                        mediaId
                );

        delete gallery.albumSelection
            .comments[mediaId];


        gallery.updatedAt =
            new Date().toISOString();

        updateGalleryStorage(
            gallery
        );

        saveGalleries();

        renderPage();

        renderModal();

        showToast(
            "Media removed."
        );

    }


    /* =====================================================
       SET MEDIA COVER
    ====================================================== */

    function setMediaAsCover(
        mediaId
    ) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const media =
            gallery.media.find(
                item =>
                    item.id ===
                    mediaId
            );

        if (!media) {
            return;
        }

        if (
            media.type !==
            "photo"
        ) {

            showToast(
                "Only photos can be used as a gallery cover."
            );

            return;

        }

        gallery.coverMediaId =
            mediaId;

        gallery.updatedAt =
            new Date().toISOString();

        saveGalleries();

        renderPage();

        renderModal();

        showToast(
            "Gallery cover updated."
        );

    }


    /* =====================================================
       COPY LINK
    ====================================================== */

    async function copyGalleryLink() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const link =
            gallery.galleryLink;

        try {

            await navigator.clipboard.writeText(
                link
            );

            showToast(
                "Gallery link copied."
            );

        } catch (error) {

            if (modalGalleryLink) {

                modalGalleryLink.select();

                document.execCommand(
                    "copy"
                );

                showToast(
                    "Gallery link copied."
                );

            }

        }

    }


    /* =====================================================
       SEND TO CLIENT
    ====================================================== */

    function sendGalleryToClient() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        if (
            !isGalleryReady(
                gallery
            )
        ) {

            showToast(
                "Complete the required setup first."
            );

            return;

        }


        const confirmed =
            window.confirm(
                "Mark this gallery as sent to the client?"
            );

        if (!confirmed) {
            return;
        }


        gallery.deliveryStatus =
            "sent";

        gallery.sentAt =
            new Date().toISOString();

        gallery.access.visible =
            true;

        gallery.updatedAt =
            new Date().toISOString();


        if (galleryVisible) {
            galleryVisible.checked =
                true;
        }


        saveGalleries();

        renderPage();

        renderModal();

        showToast(
            "Gallery marked as sent to client."
        );

    }


    /* =====================================================
       DELETE GALLERY
    ====================================================== */

    async function deleteSelectedGallery() {

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


        try {

            await deleteGalleryMedia(
                gallery.id
            );

        } catch (error) {

            console.error(
                "Could not delete gallery media:",
                error
            );

        }


        galleries =
            galleries.filter(
                item =>
                    item.id !==
                    gallery.id
            );


        saveGalleries();

        closeGalleryModalFn();

        renderPage();

        showToast(
            "Gallery deleted."
        );

    }


    /* =====================================================
       ACTIVATE TAB
    ====================================================== */

    function activateTab(
        tabName
    ) {

        const tabs =
            document.querySelectorAll(
                ".gallery-tab"
            );

        const contents =
            document.querySelectorAll(
                ".tab-content"
            );


        tabs.forEach(
            tab => {

                tab.classList.toggle(
                    "active",
                    tab.dataset.tab ===
                    tabName
                );

            }
        );


        contents.forEach(
            content => {

                content.classList.toggle(
                    "active",
                    content.id ===
                    `tab-${tabName}`
                );

            }
        );


        if (
            tabName ===
            "media"
        ) {

            renderMedia();

        }

        if (
            tabName ===
            "albums"
        ) {

            renderAlbums();

        }

    }


    /* =====================================================
       TOAST
    ====================================================== */

    function showToast(
        message
    ) {

        if (!toast) {
            return;
        }

        if (toastMessage) {

            toastMessage.textContent =
                message;

        }

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
       UPLOAD ZONE
    ====================================================== */

    if (
        uploadZone &&
        mediaUpload
    ) {

        uploadZone.addEventListener(
            "click",
            () => {

                mediaUpload.click();

            }
        );


        mediaUpload.addEventListener(
            "change",
            async event => {

                await uploadFiles(
                    event.target.files
                );

                mediaUpload.value =
                    "";

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
            async event => {

                event.preventDefault();

                uploadZone.classList.remove(
                    "dragging"
                );

                await uploadFiles(
                    event.dataTransfer.files
                );

            }
        );

    }


    /* =====================================================
       GALLERY GRID EVENTS
    ====================================================== */

    if (galleryGrid) {

        galleryGrid.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".manage-gallery-btn"
                    );

                if (!button) {
                    return;
                }

                openGallery(
                    button.dataset.galleryId
                );

            }
        );

    }


    /* =====================================================
       SEARCH
    ====================================================== */

    if (gallerySearch) {

        gallerySearch.addEventListener(
            "input",
            renderGalleryGrid
        );

    }


    /* =====================================================
       STATUS FILTER
    ====================================================== */

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderGalleryGrid
        );

    }


    /* =====================================================
       MODAL CLOSE
    ====================================================== */

    if (closeGalleryModal) {

        closeGalleryModal.addEventListener(
            "click",
            closeGalleryModalFn
        );

    }


    const modalOverlay =
        galleryModal
            ?.querySelector(
                ".gallery-modal-overlay"
            );

    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeGalleryModalFn
        );

    }


    /* =====================================================
       ESCAPE KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            if (
                galleryModal?.classList
                    .contains("open")
            ) {

                closeGalleryModalFn();

            }

            if (
                albumModal?.classList
                    .contains("open")
            ) {

                closeAlbumModalFn();

            }

        }
    );


    /* =====================================================
       TABS
    ====================================================== */

    document
        .querySelectorAll(
            ".gallery-tab"
        )
        .forEach(
            tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        activateTab(
                            tab.dataset.tab
                        );

                    }
                );

            }
        );


    /* =====================================================
       QUICK ACTIONS
    ====================================================== */

    document
        .querySelectorAll(
            "[data-open-tab]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        activateTab(
                            button.dataset.openTab
                        );

                    }
                );

            }
        );


    /* =====================================================
       MEDIA FILTER
    ====================================================== */

    if (mediaFilter) {

        mediaFilter.addEventListener(
            "change",
            () => {

                activeMediaFilter =
                    mediaFilter.value;

                selectedAlbumId =
                    null;

                renderMedia();

            }
        );

    }


    /* =====================================================
       MEDIA GRID EVENTS
    ====================================================== */

    if (mediaGrid) {

        mediaGrid.addEventListener(
            "click",
            async event => {

                const removeButton =
                    event.target.closest(
                        ".remove-media"
                    );

                const coverButton =
                    event.target.closest(
                        ".set-cover"
                    );

                const addWeddingButton =
                    event.target.closest(
                        ".add-to-wedding-album"
                    );

                const removeWeddingButton =
                    event.target.closest(
                        ".remove-from-wedding-album"
                    );


                if (removeButton) {

                    await removeMedia(
                        removeButton.dataset.mediaId
                    );

                    return;

                }


                if (coverButton) {

                    setMediaAsCover(
                        coverButton.dataset.mediaId
                    );

                    return;

                }


                if (addWeddingButton) {

                    const mediaId =
                        addWeddingButton
                            .dataset
                            .mediaId;

                    const gallery =
                        getSelectedGallery();

                    if (
                        gallery?.albumSelection
                            ?.maxSelections
                    ) {

                        const currentCount =
                            gallery.albumSelection
                                .selectedMediaIds
                                .length;

                        if (
                            currentCount >=
                            gallery.albumSelection
                                .maxSelections
                        ) {

                            showToast(
                                "The Wedding Album selection limit has been reached."
                            );

                            return;

                        }

                    }

                    if (
                        moveMediaToWeddingAlbum(
                            mediaId
                        )
                    ) {

                        renderModal();

                        showToast(
                            "Photo added to WEDDING ALBUM."
                        );

                    }

                    return;

                }


                if (removeWeddingButton) {

                    if (
                        removeMediaFromWeddingAlbum(
                            removeWeddingButton
                                .dataset
                                .mediaId
                        )
                    ) {

                        renderModal();

                        showToast(
                            "Photo removed from WEDDING ALBUM."
                        );

                    }

                }

            }
        );

    }


    /* =====================================================
       CREATE SECTION
    ====================================================== */

    if (createAlbumBtn) {

        createAlbumBtn.addEventListener(
            "click",
            () => {

                openAlbumModal();

            }
        );

    }


    /* =====================================================
       ALBUM MODAL CLOSE
    ====================================================== */

    if (closeAlbumModal) {

        closeAlbumModal.addEventListener(
            "click",
            closeAlbumModalFn
        );

    }

    if (cancelAlbum) {

        cancelAlbum.addEventListener(
            "click",
            closeAlbumModalFn
        );

    }


    const albumOverlay =
        albumModal
            ?.querySelector(
                ".small-modal-overlay"
            );

    if (albumOverlay) {

        albumOverlay.addEventListener(
            "click",
            closeAlbumModalFn
        );

    }


    /* =====================================================
       ALBUM FORM
    ====================================================== */

    if (albumForm) {

        albumForm.addEventListener(
            "submit",
            saveAlbum
        );

    }


    /* =====================================================
       ALBUM GRID EVENTS
    ====================================================== */

    if (albumsGrid) {

        albumsGrid.addEventListener(
            "click",
            event => {

                const editButton =
                    event.target.closest(
                        ".edit-album"
                    );

                const deleteButton =
                    event.target.closest(
                        ".delete-album"
                    );

                const weddingButton =
                    event.target.closest(
                        ".view-wedding-album"
                    );


                if (weddingButton) {

                    openWeddingAlbum();

                    return;

                }


                if (editButton) {

                    openAlbumModal(
                        editButton.dataset.albumId
                    );

                    return;

                }


                if (deleteButton) {

                    deleteAlbum(
                        deleteButton.dataset.albumId
                    );

                }

            }
        );

    }


    /* =====================================================
       SETTINGS FORM
    ====================================================== */

    if (gallerySettingsForm) {

        gallerySettingsForm.addEventListener(
            "submit",
            saveGallerySettings
        );

    }


    /* =====================================================
       PASSWORD TOGGLE
    ====================================================== */

    if (passwordEnabled) {

        passwordEnabled.addEventListener(
            "change",
            togglePasswordEnabled
        );

    }


    /* =====================================================
       GENERATE PASSWORD
    ====================================================== */

    if (generatePassword) {

        generatePassword.addEventListener(
            "click",
            generateGalleryPassword
        );

    }


    /* =====================================================
       SAVE PASSWORD
    ====================================================== */

    if (savePassword) {

        savePassword.addEventListener(
            "click",
            saveGalleryPassword
        );

    }


    /* =====================================================
       DOWNLOAD TOGGLE
    ====================================================== */

    if (downloadsEnabled) {

        downloadsEnabled.addEventListener(
            "change",
            updateDownloadsSetting
        );

    }


    /* =====================================================
       VISIBILITY TOGGLE
    ====================================================== */

    if (galleryVisible) {

        galleryVisible.addEventListener(
            "change",
            updateVisibilitySetting
        );

    }


    /* =====================================================
       COPY LINK
    ====================================================== */

    if (copyLinkBtn) {

        copyLinkBtn.addEventListener(
            "click",
            copyGalleryLink
        );

    }


    /* =====================================================
       SEND TO CLIENT
    ====================================================== */

    if (sendToClientBtn) {

        sendToClientBtn.addEventListener(
            "click",
            sendGalleryToClient
        );

    }


    /* =====================================================
       DELETE GALLERY
    ====================================================== */

    if (deleteGalleryBtn) {

        deleteGalleryBtn.addEventListener(
            "click",
            deleteSelectedGallery
        );

    }


    /* =====================================================
       MOBILE MENU
    ====================================================== */

    const mobileMenuBtn =
        $("mobileMenuBtn");

    const mobileMenu =
        $("mobileMenu");

    if (
        mobileMenuBtn &&
        mobileMenu
    ) {

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
       CROSS-TAB STORAGE SYNC
    ====================================================== */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key ===
                GALLERIES_STORAGE_KEY
            ) {

                loadGalleries();

                renderPage();

                if (
                    selectedGalleryId
                ) {

                    renderModal();

                }

            }

        }
    );


    /* =====================================================
       CUSTOM SAME-TAB SYNC
    ====================================================== */

    window.addEventListener(
        "professionalStudioClientGalleriesUpdated",
        () => {

            loadGalleries();

            renderPage();

        }
    );


    /* =====================================================
       PUBLIC API
    ====================================================== */

    window.ProfessionalStudioClientGalleries =
        {

            getGalleries:
                () =>
                    JSON.parse(
                        JSON.stringify(
                            galleries
                        )
                    ),

            getGallery:
                galleryId => {

                    const gallery =
                        galleries.find(
                            item =>
                                item.id ===
                                galleryId
                        );

                    return gallery
                        ? JSON.parse(
                            JSON.stringify(
                                gallery
                            )
                        )
                        : null;

                },

            getSelectedGallery:
                () => {

                    const gallery =
                        getSelectedGallery();

                    return gallery
                        ? JSON.parse(
                            JSON.stringify(
                                gallery
                            )
                        )
                        : null;

                },

            getWeddingAlbum:
                galleryId => {

                    const gallery =
                        galleries.find(
                            item =>
                                item.id ===
                                galleryId
                        );

                    if (!gallery) {
                        return null;
                    }

                    const album =
                        getWeddingAlbum(
                            gallery
                        );

                    return album
                        ? JSON.parse(
                            JSON.stringify(
                                album
                            )
                        )
                        : null;

                },

            getWeddingAlbumMedia:
                galleryId => {

                    const gallery =
                        galleries.find(
                            item =>
                                item.id ===
                                galleryId
                        );

                    if (!gallery) {
                        return [];
                    }

                    return JSON.parse(
                        JSON.stringify(
                            getWeddingAlbumMedia(
                                gallery
                            )
                        )
                    );

                },

            addMediaToWeddingAlbum:
                (
                    galleryId,
                    mediaId
                ) => {

                    const gallery =
                        galleries.find(
                            item =>
                                item.id ===
                                galleryId
                        );

                    if (!gallery) {
                        return false;
                    }

                    const previous =
                        selectedGalleryId;

                    selectedGalleryId =
                        galleryId;

                    const result =
                        moveMediaToWeddingAlbum(
                            mediaId
                        );

                    selectedGalleryId =
                        previous;

                    return result;

                },

            removeMediaFromWeddingAlbum:
                (
                    galleryId,
                    mediaId
                ) => {

                    const gallery =
                        galleries.find(
                            item =>
                                item.id ===
                                galleryId
                        );

                    if (!gallery) {
                        return false;
                    }

                    const previous =
                        selectedGalleryId;

                    selectedGalleryId =
                        galleryId;

                    const result =
                        removeMediaFromWeddingAlbum(
                            mediaId
                        );

                    selectedGalleryId =
                        previous;

                    return result;

                },

            refresh:
                () => {

                    loadGalleries();

                    renderPage();

                }

        };


    /* =====================================================
       INITIALIZE
    ====================================================== */

    try {

        await openDatabase();

    } catch (error) {

        console.error(
            "IndexedDB initialization failed:",
            error
        );

        showToast(
            "Browser storage could not be initialized."
        );

    }


    loadGalleries();


    /*
        IMPORTANT:
        Gallery Shop purchase → Client Gallery
        connection remains unchanged.
    */

    processPendingPurchase();


    renderPage();

});