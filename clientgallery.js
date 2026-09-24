/* =========================================================
   PROFESSIONAL STUDIO
   CLIENT GALLERIES
   FRONTEND CONTROLLER
   =========================================================

   Includes:
   - Purchased gallery support
   - Gallery Shop connection
   - IndexedDB media storage
   - Wedding Album support
   - Demo Gallery
   - Demo download testing
   - Storage limit enforcement
   - Media validation
   - Media deletion
   - Album assignment
   - Delivery readiness
   - Password/access settings
   - Gallery expiry handling
   ========================================================= */

(() => {
    "use strict";

    /* =========================================================
       STORAGE
    ========================================================= */

    const STORAGE_KEY = "professionalStudioGalleries";
    const PENDING_PURCHASE_KEY = "professionalStudioPendingGallery";
    const PURCHASE_HISTORY_KEY = "professionalStudioGalleryPurchases";

    const DB_NAME = "professionalstudioDB";
    const DB_VERSION = 2;
    const MEDIA_STORE = "clientGalleryMedia";

    const WEDDING_ALBUM_NAME = "WEDDING ALBUM";

    const DEMO_GALLERY_ID = "professional-studio-demo-gallery";

    const DEMO_PRICING = {
        3: 643,
        6: 1287,
        12: 2573
    };

    /* =========================================================
       DEMO GALLERY
    ========================================================= */

    const DEMO_GALLERY = {
        id: DEMO_GALLERY_ID,
        galleryName: "Aarav & Meera Wedding",
        clientName: "Aarav & Meera",
        description:
            "A demonstration client gallery showing media delivery, download permissions, albums and access settings.",

        status: "ready",
        deliveryStatus: "ready",

        storageLimitGB: 100,
        storageUsedGB: 18.6,

        duration: 12,

        createdAt: "2026-09-01T10:00:00",
        expiryDate: "2027-09-01T10:00:00",

        passwordEnabled: true,
        password: "PS-DEMO-2026",

        downloadsEnabled: true,
        visible: true,

        demo: true,

        media: [
            {
                id: "demo-photo-1",
                galleryId: DEMO_GALLERY_ID,
                name: "Wedding Ceremony",
                type: "photo",
                sizeMB: 4.8,
                sectionId: "wedding-album",
                createdAt: "2026-09-01T10:00:00",
                isCover: true,
                clientSelected: false
            },
            {
                id: "demo-photo-2",
                galleryId: DEMO_GALLERY_ID,
                name: "Reception Portrait",
                type: "photo",
                sizeMB: 5.1,
                sectionId: "wedding-album",
                createdAt: "2026-09-01T10:02:00",
                isCover: false,
                clientSelected: false
            },
            {
                id: "demo-photo-3",
                galleryId: DEMO_GALLERY_ID,
                name: "Couple Portrait",
                type: "photo",
                sizeMB: 6.2,
                sectionId: "wedding-album",
                createdAt: "2026-09-01T10:04:00",
                isCover: false,
                clientSelected: true
            },
            {
                id: "demo-video-1",
                galleryId: DEMO_GALLERY_ID,
                name: "Wedding Highlights",
                type: "video",
                sizeMB: 48.5,
                sectionId: "highlights",
                createdAt: "2026-09-01T10:06:00",
                isCover: false,
                clientSelected: false
            },
            {
                id: "demo-photo-4",
                galleryId: DEMO_GALLERY_ID,
                name: "Reception",
                type: "photo",
                sizeMB: 4.3,
                sectionId: "reception",
                createdAt: "2026-09-01T10:08:00",
                isCover: false,
                clientSelected: false
            },
            {
                id: "demo-video-2",
                galleryId: DEMO_GALLERY_ID,
                name: "First Dance",
                type: "video",
                sizeMB: 32.7,
                sectionId: "highlights",
                createdAt: "2026-09-01T10:10:00",
                isCover: false,
                clientSelected: true
            }
        ],

        albums: [
            {
                id: "wedding-album",
                name: WEDDING_ALBUM_NAME,
                description: "Client selection album",
                mediaIds: [
                    "demo-photo-1",
                    "demo-photo-2",
                    "demo-photo-3"
                ],
                isWeddingAlbum: true,
                selectionEnabled: true,
                maxSelections: 50,
                selectedMediaIds: [
                    "demo-photo-3"
                ],
                selectedCount: 1,
                status: "open",
                submittedAt: null,
                submittedBy: null,
                photographerApproved: false,
                approvedAt: null
            },
            {
                id: "reception",
                name: "Reception",
                description: "Reception photographs",
                mediaIds: [
                    "demo-photo-4"
                ],
                isWeddingAlbum: false,
                selectionEnabled: false,
                maxSelections: 0,
                selectedMediaIds: [],
                selectedCount: 0,
                status: "open"
            },
            {
                id: "highlights",
                name: "Highlights",
                description: "Highlight videos",
                mediaIds: [
                    "demo-video-1",
                    "demo-video-2"
                ],
                isWeddingAlbum: false,
                selectionEnabled: false,
                maxSelections: 0,
                selectedMediaIds: [],
                selectedCount: 0,
                status: "open"
            }
        ]
    };

    /* =========================================================
       STATE
    ========================================================= */

    const state = {
        galleries: [],
        selectedGalleryId: null,

        activeTab: "overview",
        mediaFilter: "all",
        searchTerm: "",

        editingAlbumId: null,

        mediaObjectUrls: new Set(),

        db: null,

        demoMode: false
    };

    /* =========================================================
       DOM
    ========================================================= */

    const $ = (id) => document.getElementById(id);

    const dom = {
        totalGalleries: $("totalGalleries"),
        activeGalleries: $("activeGalleries"),
        totalStorage: $("totalStorage"),
        expiringGalleries: $("expiringGalleries"),

        gallerySearch: $("gallerySearch"),
        statusFilter: $("statusFilter"),
        galleryGrid: $("galleryGrid"),

        galleryModal: $("galleryModal"),

        modalGalleryName: $("modalGalleryName"),
        modalClientName: $("modalClientName"),
        modalStatus: $("modalStatus"),

        modalStorage: $("modalStorage"),
        modalStorageProgress: $("modalStorageProgress"),
        modalStorageText: $("modalStorageText"),

        modalDuration: $("modalDuration"),
        modalExpiry: $("modalExpiry"),
        modalExpiryNote: $("modalExpiryNote"),
        modalDownloads: $("modalDownloads"),

        modalGalleryLink: $("modalGalleryLink"),
        copyLinkBtn: $("copyLinkBtn"),

        checkGalleryName: $("checkGalleryName"),
        checkMedia: $("checkMedia"),
        checkPassword: $("checkPassword"),
        checkDownloads: $("checkDownloads"),
        checkStorage: $("checkStorage"),

        deliveryStatus: $("deliveryStatus"),
        deliveryMessage: $("deliveryMessage"),
        deliveryExpiry: $("deliveryExpiry"),
        sendToClientBtn: $("sendToClientBtn"),

        mediaUpload: $("mediaUpload"),
        uploadZone: $("uploadZone"),
        mediaCount: $("mediaCount"),
        mediaFilter: $("mediaFilter"),
        mediaGrid: $("mediaGrid"),

        createAlbumBtn: $("createAlbumBtn"),
        albumsGrid: $("albumsGrid"),

        passwordEnabled: $("passwordEnabled"),
        passwordSetting: $("passwordSetting"),
        galleryPassword: $("galleryPassword"),
        generatePassword: $("generatePassword"),
        savePassword: $("savePassword"),

        downloadsEnabled: $("downloadsEnabled"),
        galleryVisible: $("galleryVisible"),

        gallerySettingsForm: $("gallerySettingsForm"),
        editGalleryName: $("editGalleryName"),
        editClientName: $("editClientName"),
        editGalleryDescription: $("editGalleryDescription"),
        deleteGalleryBtn: $("deleteGalleryBtn"),

        albumModal: $("albumModal"),
        albumForm: $("albumForm"),
        albumName: $("albumName"),

        toast: $("toast"),
        toastMessage: $("toastMessage")
    };

    /* =========================================================
       HELPERS
    ========================================================= */

    function generateId(prefix = "id") {
        return (
            prefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random().toString(36).slice(2, 9)
        );
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatMB(mb) {
        const value = Number(mb) || 0;

        if (value < 1) {
            return `${(value * 1024).toFixed(0)} KB`;
        }

        if (value < 1024) {
            return `${value.toFixed(1)} MB`;
        }

        return `${(value / 1024).toFixed(2)} GB`;
    }

    function formatGB(gb) {
        return `${(Number(gb) || 0).toFixed(2)} GB`;
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function daysBetweenNow(value) {
        if (!value) return 0;

        const target = new Date(value).getTime();
        const now = Date.now();

        return Math.ceil((target - now) / 86400000);
    }

    function getSelectedGallery() {
        return state.galleries.find(
            (gallery) => gallery.id === state.selectedGalleryId
        );
    }

    function isPhoto(media) {
        return (
            media?.type === "photo" ||
            media?.type === "image" ||
            String(media?.type || "").startsWith("image/")
        );
    }

    function isVideoMedia(media) {
        return (
            media?.type === "video" ||
            String(media?.type || "").startsWith("video/")
        );
    }

    function isSupportedFile(file) {
        if (!file) return false;

        const type = String(file.type || "").toLowerCase();
        const name = String(file.name || "").toLowerCase();

        const imageExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif"
        ];

        const videoExtensions = [
            ".mp4",
            ".webm",
            ".mov",
            ".m4v"
        ];

        const imageByType = type.startsWith("image/");
        const videoByType = type.startsWith("video/");

        const imageByExtension = imageExtensions.some((ext) =>
            name.endsWith(ext)
        );

        const videoByExtension = videoExtensions.some((ext) =>
            name.endsWith(ext)
        );

        return (
            imageByType ||
            videoByType ||
            imageByExtension ||
            videoByExtension
        );
    }

    function getMediaType(file) {
        const type = String(file?.type || "").toLowerCase();
        const name = String(file?.name || "").toLowerCase();

        if (
            type.startsWith("video/") ||
            [".mp4", ".webm", ".mov", ".m4v"].some((ext) =>
                name.endsWith(ext)
            )
        ) {
            return "video";
        }

        return "photo";
    }

    function fileSizeMB(file) {
        return (Number(file?.size) || 0) / (1024 * 1024);
    }

    function revokeObjectUrls() {
        state.mediaObjectUrls.forEach((url) => {
            try {
                URL.revokeObjectURL(url);
            } catch (_) {}
        });

        state.mediaObjectUrls.clear();
    }

    function showToast(message, duration = 2800) {
        if (!dom.toast || !dom.toastMessage) {
            return;
        }

        dom.toastMessage.textContent = message;

        dom.toast.classList.add("show");

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(() => {
            dom.toast.classList.remove("show");
        }, duration);
    }

    function getGalleryStatus(gallery) {
        const daysLeft = daysBetweenNow(gallery.expiryDate);

        if (daysLeft <= 0) {
            return "expired";
        }

        if (gallery.deliveryStatus === "sent") {
            return "sent";
        }

        if (gallery.deliveryStatus === "ready") {
            return "ready";
        }

        return "preparing";
    }

    function getStatusLabel(status) {
        const labels = {
            ready: "Ready",
            sent: "Sent",
            preparing: "Preparing",
            expired: "Expired"
        };

        return labels[status] || "Preparing";
    }

    function syncGalleryStatus(gallery) {
        gallery.status = getGalleryStatus(gallery);
        return gallery;
    }

    /* =========================================================
       LOCAL STORAGE
    ========================================================= */

    function loadGalleries() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);

            if (!raw) {
                return [];
            }

            const parsed = JSON.parse(raw);

            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Unable to load galleries:", error);
            return [];
        }
    }

    function saveGalleries() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state.galleries)
            );

            window.dispatchEvent(
                new CustomEvent(
                    "professionalStudioClientGalleriesUpdated"
                )
            );

            return true;
        } catch (error) {
            console.error("Unable to save galleries:", error);
            showToast("Unable to save gallery changes.");
            return false;
        }
    }

    /* =========================================================
       NORMALIZATION
    ========================================================= */

    function createWeddingAlbumSection() {
        return {
            id: "wedding-album",
            name: WEDDING_ALBUM_NAME,
            description: "Client selection album",
            mediaIds: [],
            isWeddingAlbum: true,
            selectionEnabled: true,
            maxSelections: 50,
            selectedMediaIds: [],
            selectedCount: 0,
            status: "open",
            submittedAt: null,
            submittedBy: null,
            photographerApproved: false,
            approvedAt: null
        };
    }

    function normalizeMedia(media, galleryId) {
        return {
            id: media?.id || generateId("media"),
            galleryId,
            name: media?.name || "Untitled media",
            type: media?.type || "photo",
            sizeMB: Number(media?.sizeMB) || 0,
            sectionId: media?.sectionId || "wedding-album",
            createdAt: media?.createdAt || new Date().toISOString(),
            isCover: Boolean(media?.isCover),
            clientSelected: Boolean(media?.clientSelected),
            blobKey: media?.blobKey || null
        };
    }

    function normalizeAlbum(album) {
        return {
            id: album?.id || generateId("album"),
            name: album?.name || "Untitled Album",
            description: album?.description || "",
            mediaIds: Array.isArray(album?.mediaIds)
                ? album.mediaIds
                : [],
            isWeddingAlbum: Boolean(album?.isWeddingAlbum),
            selectionEnabled: Boolean(album?.selectionEnabled),
            maxSelections: Number(album?.maxSelections) || 0,
            selectedMediaIds: Array.isArray(album?.selectedMediaIds)
                ? album.selectedMediaIds
                : [],
            selectedCount:
                Number(album?.selectedCount) ||
                (Array.isArray(album?.selectedMediaIds)
                    ? album.selectedMediaIds.length
                    : 0),
            status: album?.status || "open",
            submittedAt: album?.submittedAt || null,
            submittedBy: album?.submittedBy || null,
            photographerApproved: Boolean(
                album?.photographerApproved
            ),
            approvedAt: album?.approvedAt || null
        };
    }

    function normalizeGallery(gallery) {
        const normalized = {
            id: gallery?.id || generateId("gallery"),

            galleryName:
                gallery?.galleryName ||
                gallery?.name ||
                "Untitled Gallery",

            clientName:
                gallery?.clientName ||
                "Unnamed Client",

            description: gallery?.description || "",

            duration: Number(gallery?.duration) || 3,

            storageLimitGB:
                Number(gallery?.storageLimitGB) || 1,

            storageUsedGB:
                Number(gallery?.storageUsedGB) || 0,

            createdAt:
                gallery?.createdAt ||
                new Date().toISOString(),

            expiryDate:
                gallery?.expiryDate ||
                new Date(
                    Date.now() + 90 * 86400000
                ).toISOString(),

            passwordEnabled:
                gallery?.passwordEnabled !== false,

            password:
                gallery?.password || "",

            downloadsEnabled:
                gallery?.downloadsEnabled !== false,

            visible:
                gallery?.visible !== false,

            deliveryStatus:
                gallery?.deliveryStatus ||
                gallery?.status ||
                "preparing",

            sentAt:
                gallery?.sentAt ||
                null,

            media: Array.isArray(gallery?.media)
                ? gallery.media.map((media) =>
                      normalizeMedia(
                          media,
                          gallery?.id
                      )
                  )
                : [],

            albums: Array.isArray(gallery?.albums)
                ? gallery.albums.map(normalizeAlbum)
                : []
        };

        if (
            !normalized.albums.some(
                (album) => album.id === "wedding-album"
            )
        ) {
            normalized.albums.unshift(
                createWeddingAlbumSection()
            );
        }

        syncGalleryStatus(normalized);

        return normalized;
    }

    function normalizeAllGalleries() {
        state.galleries = state.galleries.map(normalizeGallery);
    }

    /* =========================================================
       INDEXED DB
    ========================================================= */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(
                    new Error(
                        "IndexedDB is not supported by this browser."
                    )
                );
                return;
            }

            const request = indexedDB.open(
                DB_NAME,
                DB_VERSION
            );

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                if (
                    !database.objectStoreNames.contains(
                        MEDIA_STORE
                    )
                ) {
                    const store =
                        database.createObjectStore(
                            MEDIA_STORE,
                            {
                                keyPath: "id"
                            }
                        );

                    store.createIndex(
                        "galleryId",
                        "galleryId",
                        {
                            unique: false
                        }
                    );
                }
            };

            request.onsuccess = () => {
                const database = request.result;

                database.onversionchange = () => {
                    database.close();
                };

                resolve(database);
            };

            request.onerror = () => {
                reject(
                    request.error ||
                        new Error(
                            "Unable to open IndexedDB."
                        )
                );
            };
        });
    }

    function idbRequest(
        mode,
        operation
    ) {
        return new Promise((resolve, reject) => {
            if (!state.db) {
                reject(
                    new Error(
                        "IndexedDB is not initialized."
                    )
                );
                return;
            }

            let transaction;

            try {
                transaction =
                    state.db.transaction(
                        MEDIA_STORE,
                        mode
                    );

                const store =
                    transaction.objectStore(
                        MEDIA_STORE
                    );

                let request;
                let result;

                request = operation(store);

                if (request) {
                    request.onsuccess = () => {
                        result = request.result;
                    };

                    request.onerror = () => {
                        reject(
                            request.error ||
                                new Error(
                                    "IndexedDB request failed."
                                )
                        );
                    };
                }

                transaction.oncomplete = () => {
                    resolve(result);
                };

                transaction.onerror = () => {
                    reject(
                        transaction.error ||
                            new Error(
                                "IndexedDB transaction failed."
                            )
                    );
                };

                transaction.onabort = () => {
                    reject(
                        transaction.error ||
                            new Error(
                                "IndexedDB transaction aborted."
                            )
                    );
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    async function putMediaBlob(record) {
        return idbRequest(
            "readwrite",
            (store) => store.put(record)
        );
    }

    async function getMediaBlob(id) {
        return idbRequest(
            "readonly",
            (store) => store.get(id)
        );
    }

    async function deleteMediaBlob(id) {
        return idbRequest(
            "readwrite",
            (store) => store.delete(id)
        );
    }

    async function getAllGalleryBlobs(galleryId) {
        return idbRequest(
            "readonly",
            (store) =>
                store
                    .index("galleryId")
                    .getAll(galleryId)
        );
    }

    /* =========================================================
       STORAGE RECALCULATION
    ========================================================= */

    function calculateStorageGB(gallery) {
        const totalMB = (gallery.media || []).reduce(
            (sum, media) =>
                sum + (Number(media.sizeMB) || 0),
            0
        );

        return totalMB / 1024;
    }

    function recalculateGalleryStorage(gallery) {
        gallery.storageUsedGB =
            calculateStorageGB(gallery);

        return gallery.storageUsedGB;
    }

    function syncAllStorage() {
        let changed = false;

        state.galleries.forEach((gallery) => {
            const oldValue =
                Number(gallery.storageUsedGB) || 0;

            const newValue =
                recalculateGalleryStorage(gallery);

            if (
                Math.abs(oldValue - newValue) >
                0.000001
            ) {
                changed = true;
            }

            syncGalleryStatus(gallery);
        });

        if (changed) {
            saveGalleries();
        }
    }

    /* =========================================================
       PENDING GALLERY SHOP PURCHASE
    ========================================================= */

    function processPendingPurchase() {
        try {
            const raw =
                localStorage.getItem(
                    PENDING_PURCHASE_KEY
                );

            if (!raw) {
                return;
            }

            const purchase =
                JSON.parse(raw);

            if (!purchase) {
                return;
            }

            const duration =
                Number(purchase.duration) || 3;

            const now = new Date();

            const expiry = new Date(now);

            expiry.setMonth(
                expiry.getMonth() + duration
            );

            const gallery =
                normalizeGallery({
                    id:
                        purchase.galleryId ||
                        generateId("gallery"),

                    galleryName:
                        purchase.galleryName ||
                        "New Client Gallery",

                    clientName:
                        purchase.clientName ||
                        "New Client",

                    description:
                        purchase.description ||
                        "",

                    duration,

                    storageLimitGB:
                        Number(
                            purchase.storageLimitGB
                        ) || 1,

                    storageUsedGB: 0,

                    createdAt:
                        now.toISOString(),

                    expiryDate:
                        expiry.toISOString(),

                    passwordEnabled: true,
                    password: "",

                    downloadsEnabled: true,
                    visible: true,

                    deliveryStatus:
                        "preparing",

                    media: [],
                    albums: [
                        createWeddingAlbumSection()
                    ]
                });

            state.galleries.push(gallery);

            try {
                const history =
                    JSON.parse(
                        localStorage.getItem(
                            PURCHASE_HISTORY_KEY
                        ) || "[]"
                    );

                const purchases =
                    Array.isArray(history)
                        ? history
                        : [];

                purchases.push({
                    id: generateId("purchase"),
                    galleryId: gallery.id,
                    duration,
                    price:
                        Number(
                            purchase.price
                        ) ||
                        DEMO_PRICING[
                            duration
                        ] ||
                        0,
                    createdAt:
                        now.toISOString()
                });

                localStorage.setItem(
                    PURCHASE_HISTORY_KEY,
                    JSON.stringify(
                        purchases
                    )
                );
            } catch (error) {
                console.warn(
                    "Unable to update purchase history:",
                    error
                );
            }

            localStorage.removeItem(
                PENDING_PURCHASE_KEY
            );

            state.selectedGalleryId =
                gallery.id;

            saveGalleries();

            showToast(
                "New client gallery created."
            );
        } catch (error) {
            console.error(
                "Pending gallery processing failed:",
                error
            );
        }
    }

    /* =========================================================
       STATS
    ========================================================= */

    function renderStats() {
        const galleries =
            state.galleries;

        const active =
            galleries.filter(
                (gallery) => {
                    const status =
                        getGalleryStatus(
                            gallery
                        );

                    return (
                        status !==
                            "expired"
                    );
                }
            );

        const expiring =
            galleries.filter(
                (gallery) => {
                    const days =
                        daysBetweenNow(
                            gallery.expiryDate
                        );

                    return (
                        days > 0 &&
                        days <= 30
                    );
                }
            );

        const storage =
            galleries.reduce(
                (sum, gallery) =>
                    sum +
                    (
                        Number(
                            gallery.storageUsedGB
                        ) || 0
                    ),
                0
            );

        if (dom.totalGalleries) {
            dom.totalGalleries.textContent =
                galleries.length;
        }

        if (dom.activeGalleries) {
            dom.activeGalleries.textContent =
                active.length;
        }

        if (dom.totalStorage) {
            dom.totalStorage.textContent =
                formatGB(storage);
        }

        if (dom.expiringGalleries) {
            dom.expiringGalleries.textContent =
                expiring.length;
        }
    }

    /* =========================================================
       GALLERY GRID
    ========================================================= */

    function getFilteredGalleries() {
        const search =
            state.searchTerm
                .trim()
                .toLowerCase();

        const filter =
            dom.statusFilter?.value ||
            "all";

        return state.galleries.filter(
            (gallery) => {
                const status =
                    getGalleryStatus(
                        gallery
                    );

                const matchesSearch =
                    !search ||
                    gallery.galleryName
                        .toLowerCase()
                        .includes(search) ||
                    gallery.clientName
                        .toLowerCase()
                        .includes(search);

                if (!matchesSearch) {
                    return false;
                }

                if (
                    filter ===
                    "expired"
                ) {
                    return (
                        status ===
                        "expired"
                    );
                }

                if (
                    filter ===
                    "active"
                ) {
                    return (
                        status !==
                        "expired"
                    );
                }

                if (
                    filter ===
                    "expiring"
                ) {
                    const days =
                        daysBetweenNow(
                            gallery.expiryDate
                        );

                    return (
                        days > 0 &&
                        days <= 30
                    );
                }

                return true;
            }
        );
    }

    function renderGalleryGrid() {
        if (!dom.galleryGrid) {
            return;
        }

        const galleries =
            getFilteredGalleries();

        if (!galleries.length) {
            dom.galleryGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">◎</div>
                    <h3>No galleries found</h3>
                    <p>
                        Create a client gallery or adjust
                        your search and filters.
                    </p>
                </div>
            `;

            return;
        }

        dom.galleryGrid.innerHTML =
            galleries
                .map(
                    (gallery) => {
                        const status =
                            getGalleryStatus(
                                gallery
                            );

                        const days =
                            daysBetweenNow(
                                gallery.expiryDate
                            );

                        const mediaCount =
                            gallery.media
                                ?.length ||
                            0;

                        const wedding =
                            gallery.albums?.find(
                                (album) =>
                                    album.isWeddingAlbum
                            );

                        const selectedCount =
                            wedding
                                ?.selectedMediaIds
                                ?.length ||
                            0;

                        return `
                            <article
                                class="gallery-card"
                                data-gallery-id="${escapeHTML(
                                    gallery.id
                                )}"
                            >
                                <div class="gallery-card-top">
                                    <span class="status-badge ${status}">
                                        ${escapeHTML(
                                            getStatusLabel(
                                                status
                                            )
                                        )}
                                    </span>

                                    <span class="gallery-card-date">
                                        ${escapeHTML(
                                            formatDate(
                                                gallery.createdAt
                                            )
                                        )}
                                    </span>
                                </div>

                                <div class="gallery-card-body">
                                    <h3>
                                        ${escapeHTML(
                                            gallery.galleryName
                                        )}
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            gallery.clientName
                                        )}
                                    </p>

                                    <div class="gallery-card-meta">
                                        <span>
                                            ${mediaCount}
                                            media
                                        </span>

                                        <span>
                                            ${formatGB(
                                                gallery.storageUsedGB
                                            )}
                                            /
                                            ${formatGB(
                                                gallery.storageLimitGB
                                            )}
                                        </span>

                                        <span>
                                            ${
                                                days > 0
                                                    ? `${days} days left`
                                                    : "Expired"
                                            }
                                        </span>
                                    </div>

                                    ${
                                        wedding
                                            ? `
                                                <div class="gallery-card-selection">
                                                    Wedding Album:
                                                    <strong>
                                                        ${selectedCount}
                                                        selected
                                                    </strong>
                                                </div>
                                            `
                                            : ""
                                    }
                                </div>

                                <div class="gallery-card-footer">
                                    <button
                                        type="button"
                                        class="btn btn-primary"
                                        data-manage-gallery="${escapeHTML(
                                            gallery.id
                                        )}"
                                    >
                                        Manage Gallery
                                    </button>
                                </div>
                            </article>
                        `;
                    }
                )
                .join("");
    }

    /* =========================================================
       DEMO SECTION
    ========================================================= */

    function renderDemoSection() {
        const existing =
            document.getElementById(
                "professionalStudioDemoGallery"
            );

        if (existing) {
            existing.remove();
        }

        if (!dom.galleryGrid) {
            return;
        }

        const section =
            document.createElement(
                "section"
            );

        section.id =
            "professionalStudioDemoGallery";

        section.style.cssText = `
            margin: 0 0 24px;
            padding: 22px;
            border: 1px solid #dcdcdc;
            background: #fff;
            border-radius: 12px;
        `;

        section.innerHTML = `
            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:20px;
                    align-items:flex-start;
                    flex-wrap:wrap;
                "
            >
                <div style="flex:1;min-width:260px;">
                    <div
                        style="
                            font-size:11px;
                            font-weight:700;
                            letter-spacing:.12em;
                            text-transform:uppercase;
                            color:#777;
                            margin-bottom:7px;
                        "
                    >
                        Demo Client Gallery
                    </div>

                    <h3
                        style="
                            margin:0 0 6px;
                            font-size:19px;
                            color:#111;
                        "
                    >
                        ${escapeHTML(
                            DEMO_GALLERY.galleryName
                        )}
                    </h3>

                    <p
                        style="
                            margin:0;
                            color:#666;
                            font-size:14px;
                            line-height:1.5;
                        "
                    >
                        Use this gallery to test the
                        client-gallery workflow before
                        connecting real client data.
                    </p>
                </div>

                <div
                    style="
                        display:flex;
                        gap:8px;
                        flex-wrap:wrap;
                    "
                >
                    <button
                        type="button"
                        id="openDemoGalleryBtn"
                        class="btn btn-primary"
                    >
                        Open Demo Gallery
                    </button>

                    <button
                        type="button"
                        id="shareDemoGalleryBtn"
                        class="btn btn-secondary"
                    >
                        Share Demo Link
                    </button>
                </div>
            </div>

            <div
                style="
                    margin-top:18px;
                    padding-top:18px;
                    border-top:1px solid #ededed;
                    display:grid;
                    grid-template-columns:
                        repeat(
                            auto-fit,
                            minmax(180px,1fr)
                        );
                    gap:12px;
                "
            >
                <div
                    style="
                        padding:14px;
                        background:#f7f7f7;
                        border-radius:8px;
                    "
                >
                    <div
                        style="
                            font-size:11px;
                            color:#777;
                            text-transform:uppercase;
                            letter-spacing:.08em;
                            margin-bottom:5px;
                        "
                    >
                        Demo Media
                    </div>

                    <strong
                        style="
                            font-size:18px;
                            color:#111;
                        "
                    >
                        ${DEMO_GALLERY.media.length}
                    </strong>

                    <div
                        style="
                            margin-top:4px;
                            color:#777;
                            font-size:12px;
                        "
                    >
                        Photos + videos
                    </div>
                </div>

                <div
                    style="
                        padding:14px;
                        background:#f7f7f7;
                        border-radius:8px;
                    "
                >
                    <div
                        style="
                            font-size:11px;
                            color:#777;
                            text-transform:uppercase;
                            letter-spacing:.08em;
                            margin-bottom:5px;
                        "
                    >
                        Download Testing
                    </div>

                    <strong
                        id="demoDownloadSummary"
                        style="
                            font-size:18px;
                            color:#111;
                        "
                    >
                        ENABLED
                    </strong>

                    <div
                        style="
                            margin-top:4px;
                            color:#777;
                            font-size:12px;
                        "
                    >
                        Open the demo to test
                    </div>
                </div>

                <div
                    style="
                        padding:14px;
                        background:#f7f7f7;
                        border-radius:8px;
                    "
                >
                    <div
                        style="
                            font-size:11px;
                            color:#777;
                            text-transform:uppercase;
                            letter-spacing:.08em;
                            margin-bottom:5px;
                        "
                    >
                        Demo Pricing
                    </div>

                    <strong
                        style="
                            font-size:18px;
                            color:#111;
                        "
                    >
                        ₹${DEMO_PRICING[3]}
                    </strong>

                    <div
                        style="
                            margin-top:4px;
                            color:#777;
                            font-size:12px;
                        "
                    >
                        3 month example
                    </div>
                </div>
            </div>
        `;

        dom.galleryGrid.parentNode.insertBefore(
            section,
            dom.galleryGrid
        );

        const openButton =
            document.getElementById(
                "openDemoGalleryBtn"
            );

        const shareButton =
            document.getElementById(
                "shareDemoGalleryBtn"
            );

        openButton?.addEventListener(
            "click",
            () => {
                openDemoGallery();
            }
        );

        shareButton?.addEventListener(
            "click",
            () => {
                shareDemoGallery();
            }
        );
    }

    function openDemoGallery() {
        state.demoMode = true;
        state.selectedGalleryId =
            DEMO_GALLERY_ID;

        openGalleryModal(
            DEMO_GALLERY
        );
    }

    async function shareDemoGallery() {
        const demoLink =
            "https://professionalstudio.vercel.app/demo/client-gallery";

        try {
            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                await navigator.clipboard.writeText(
                    demoLink
                );

                showToast(
                    "Demo gallery link copied."
                );

                return;
            }
        } catch (error) {
            console.warn(
                "Clipboard unavailable:",
                error
            );
        }

        window.prompt(
            "Copy the demo gallery link:",
            demoLink
        );
    }

    /* =========================================================
       MODAL
    ========================================================= */

    function openGalleryModal(gallery) {
        if (!gallery) {
            return;
        }

        state.selectedGalleryId =
            gallery.id;

        state.demoMode =
            gallery.id ===
            DEMO_GALLERY_ID;

        state.activeTab = "overview";
        state.mediaFilter = "all";

        renderModal(gallery);

        if (dom.galleryModal) {
            dom.galleryModal.classList.add(
                "active"
            );
            dom.galleryModal.setAttribute(
                "aria-hidden",
                "false"
            );
        }
    }

    function closeGalleryModal() {
        revokeObjectUrls();

        state.demoMode = false;

        if (dom.galleryModal) {
            dom.galleryModal.classList.remove(
                "active"
            );

            dom.galleryModal.setAttribute(
                "aria-hidden",
                "true"
            );
        }
    }

    function renderModal(gallery) {
        if (!gallery) return;

        syncGalleryStatus(gallery);

        renderModalHeader(gallery);
        renderModalOverview(gallery);
        renderDeliveryReadiness(gallery);
        renderMedia(gallery);
        renderAlbums(gallery);
        renderSettings(gallery);

        switchTab(
            state.activeTab,
            false
        );
    }

    function renderModalHeader(gallery) {
        if (dom.modalGalleryName) {
            dom.modalGalleryName.textContent =
                gallery.galleryName;
        }

        if (dom.modalClientName) {
            dom.modalClientName.textContent =
                gallery.clientName;
        }

        if (dom.modalStatus) {
            const status =
                getGalleryStatus(
                    gallery
                );

            dom.modalStatus.textContent =
                state.demoMode
                    ? "DEMO • Ready"
                    : getStatusLabel(
                          status
                      );

            dom.modalStatus.className =
                `status-badge ${status}`;
        }
    }

    function renderModalOverview(gallery) {
        const used =
            Number(
                gallery.storageUsedGB
            ) || 0;

        const limit =
            Number(
                gallery.storageLimitGB
            ) || 0;

        const percent =
            limit > 0
                ? Math.min(
                      100,
                      (used / limit) *
                          100
                  )
                : 0;

        if (dom.modalStorage) {
            dom.modalStorage.textContent =
                `${formatGB(
                    used
                )} / ${formatGB(
                    limit
                )}`;
        }

        if (dom.modalStorageText) {
            dom.modalStorageText.textContent =
                `${formatGB(
                    used
                )} used of ${formatGB(
                    limit
                )}`;
        }

        if (
            dom.modalStorageProgress
        ) {
            dom.modalStorageProgress.style.width =
                `${percent}%`;

            dom.modalStorageProgress.setAttribute(
                "aria-valuenow",
                String(
                    Math.round(
                        percent
                    )
                )
            );
        }

        if (dom.modalDuration) {
            dom.modalDuration.textContent =
                `${gallery.duration} ${
                    gallery.duration ===
                    1
                        ? "month"
                        : "months"
                }`;
        }

        if (dom.modalExpiry) {
            dom.modalExpiry.textContent =
                formatDate(
                    gallery.expiryDate
                );
        }

        const days =
            daysBetweenNow(
                gallery.expiryDate
            );

        if (dom.modalExpiryNote) {
            if (days <= 0) {
                dom.modalExpiryNote.textContent =
                    "This gallery has expired.";
            } else if (days <= 7) {
                dom.modalExpiryNote.textContent =
                    `${days} ${
                        days === 1
                            ? "day"
                            : "days"
                    } remaining.`;
            } else {
                dom.modalExpiryNote.textContent =
                    `${days} days remaining.`;
            }
        }

        if (dom.modalDownloads) {
            dom.modalDownloads.textContent =
                gallery.downloadsEnabled
                    ? "Enabled"
                    : "Disabled";
        }

        if (dom.modalGalleryLink) {
            dom.modalGalleryLink.value =
                gallery.demo
                    ? "https://professionalstudio.vercel.app/demo/client-gallery"
                    : `https://professionalstudio.vercel.app/client/${encodeURIComponent(
                          gallery.id
                      )}`;
        }
    }

    /* =========================================================
       DELIVERY READINESS
    ========================================================= */

    function setCheckState(
        element,
        complete
    ) {
        if (!element) return;

        element.classList.toggle(
            "complete",
            Boolean(complete)
        );

        element.classList.toggle(
            "checked",
            Boolean(complete)
        );

        const icon =
            element.querySelector(
                ".check-icon"
            );

        if (icon) {
            icon.textContent =
                complete
                    ? "✓"
                    : "○";
        }
    }

    function renderDeliveryReadiness(
        gallery
    ) {
        if (!gallery) return;

        const hasName =
            Boolean(
                gallery.galleryName?.trim()
            );

        const hasMedia =
            Array.isArray(
                gallery.media
            ) &&
            gallery.media.length > 0;

        const passwordConfigured =
            gallery.passwordEnabled
                ? Boolean(
                      gallery.password?.trim()
                  )
                : true;

        /*
         * Download permission is a setting,
         * not a requirement to deliver.
         *
         * A photographer should be able to
         * intentionally disable downloads.
         */
        const downloadsConfigured =
            typeof gallery.downloadsEnabled ===
            "boolean";

        const storageOkay =
            Number(
                gallery.storageUsedGB
            ) <=
            Number(
                gallery.storageLimitGB
            );

        const notExpired =
            daysBetweenNow(
                gallery.expiryDate
            ) > 0;

        const visible =
            gallery.visible !== false;

        setCheckState(
            dom.checkGalleryName,
            hasName
        );

        setCheckState(
            dom.checkMedia,
            hasMedia
        );

        setCheckState(
            dom.checkPassword,
            passwordConfigured
        );

        setCheckState(
            dom.checkDownloads,
            downloadsConfigured
        );

        setCheckState(
            dom.checkStorage,
            storageOkay
        );

        const downloadSmall =
            dom.checkDownloads?.querySelector(
                "small"
            );

        if (downloadSmall) {
            downloadSmall.textContent =
                gallery.downloadsEnabled
                    ? "Downloads enabled"
                    : "Downloads disabled";
        }

        const ready =
            hasName &&
            hasMedia &&
            passwordConfigured &&
            downloadsConfigured &&
            storageOkay &&
            notExpired &&
            visible;

        if (dom.deliveryStatus) {
            dom.deliveryStatus.classList.toggle(
                "ready",
                ready
            );

            dom.deliveryStatus.classList.toggle(
                "preparing",
                !ready
            );

            dom.deliveryStatus.textContent =
                ready
                    ? "Ready to deliver"
                    : "Preparing";
        }

        if (dom.deliveryMessage) {
            if (!visible) {
                dom.deliveryMessage.textContent =
                    "Make the gallery visible before delivering it.";
            } else if (!notExpired) {
                dom.deliveryMessage.textContent =
                    "This gallery has expired.";
            } else if (!hasMedia) {
                dom.deliveryMessage.textContent =
                    "Add at least one media item.";
            } else if (!passwordConfigured) {
                dom.deliveryMessage.textContent =
                    "Add a gallery password or disable password protection.";
            } else if (!storageOkay) {
                dom.deliveryMessage.textContent =
                    "Storage limit exceeded.";
            } else if (ready) {
                dom.deliveryMessage.textContent =
                    "Everything is ready to deliver this gallery.";
            } else {
                dom.deliveryMessage.textContent =
                    "Complete the remaining gallery setup.";
            }
        }

        if (dom.deliveryExpiry) {
            dom.deliveryExpiry.textContent =
                notExpired
                    ? `${daysBetweenNow(
                          gallery.expiryDate
                      )} days remaining`
                    : "Expired";
        }

        if (dom.sendToClientBtn) {
            dom.sendToClientBtn.disabled =
                !ready ||
                state.demoMode;

            dom.sendToClientBtn.title =
                state.demoMode
                    ? "Demo gallery cannot be delivered."
                    : ready
                    ? "Send gallery to client"
                    : "Complete the required setup first";
        }
    }

    /* =========================================================
       MEDIA
    ========================================================= */

    async function renderMedia(
        gallery
    ) {
        if (!dom.mediaGrid) {
            return;
        }

        revokeObjectUrls();

        const media =
            Array.isArray(
                gallery.media
            )
                ? gallery.media
                : [];

        let filtered =
            media.slice();

        /*
         * IMPORTANT:
         * HTML values are:
         * all / photo / video
         */
        if (
            state.mediaFilter ===
            "photo"
        ) {
            filtered =
                media.filter(
                    isPhoto
                );
        }

        if (
            state.mediaFilter ===
            "video"
        ) {
            filtered =
                media.filter(
                    isVideoMedia
                );
        }

        if (dom.mediaCount) {
            dom.mediaCount.textContent =
                `${filtered.length} ${
                    filtered.length === 1
                        ? "item"
                        : "items"
                }`;
        }

        if (!filtered.length) {
            dom.mediaGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">□</div>
                    <h3>No media found</h3>
                    <p>
                        ${
                            media.length
                                ? "Try another media filter."
                                : "Upload photos or videos to this gallery."
                        }
                    </p>
                </div>
            `;

            return;
        }

        const cards =
            await Promise.all(
                filtered.map(
                    (item) =>
                        buildMediaCard(
                            gallery,
                            item
                        )
                )
            );

        dom.mediaGrid.innerHTML =
            cards.join("");
    }

    async function buildMediaCard(
        gallery,
        media
    ) {
        if (state.demoMode) {
            return buildDemoMediaCard(
                gallery,
                media
            );
        }

        let previewHTML = `
            <div class="media-preview-placeholder">
                <span>
                    ${
                        isVideoMedia(media)
                            ? "VIDEO"
                            : "PHOTO"
                    }
                </span>
            </div>
        `;

        try {
            const record =
                await getMediaBlob(
                    media.blobKey ||
                        media.id
                );

            if (
                record?.blob instanceof
                Blob
            ) {
                const url =
                    URL.createObjectURL(
                        record.blob
                    );

                state.mediaObjectUrls.add(
                    url
                );

                if (
                    isVideoMedia(media)
                ) {
                    previewHTML = `
                        <video
                            class="media-preview"
                            src="${url}"
                            muted
                            preload="metadata"
                        ></video>
                    `;
                } else {
                    previewHTML = `
                        <img
                            class="media-preview"
                            src="${url}"
                            alt="${escapeHTML(
                                media.name
                            )}"
                            loading="lazy"
                        >
                    `;
                }
            }
        } catch (error) {
            console.warn(
                "Unable to load media preview:",
                error
            );
        }

        return buildMediaCardHTML(
            gallery,
            media,
            previewHTML
        );
    }

    function buildDemoMediaCard(
        gallery,
        media
    ) {
        const isVideo =
            isVideoMedia(media);

        const icon =
            isVideo
                ? "▶"
                : "PHOTO";

        const downloadEnabled =
            gallery.downloadsEnabled;

        return `
            <article
                class="media-card demo-media-card"
                data-media-id="${escapeHTML(
                    media.id
                )}"
            >
                <div
                    class="media-preview demo-preview"
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        min-height:180px;
                        background:#f1f1f1;
                        color:#777;
                        font-size:13px;
                        letter-spacing:.08em;
                    "
                >
                    ${icon}
                </div>

                <div class="media-card-body">
                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:10px;
                            align-items:flex-start;
                        "
                    >
                        <div>
                            <strong>
                                ${escapeHTML(
                                    media.name
                                )}
                            </strong>

                            <div
                                style="
                                    margin-top:4px;
                                    font-size:12px;
                                    color:#777;
                                "
                            >
                                ${escapeHTML(
                                    media.type
                                )}
                                ·
                                ${formatMB(
                                    media.sizeMB
                                )}
                            </div>
                        </div>

                        <span
                            style="
                                font-size:10px;
                                padding:4px 7px;
                                border:1px solid #ddd;
                                border-radius:4px;
                                text-transform:uppercase;
                            "
                        >
                            Demo
                        </span>
                    </div>

                    <div
                        style="
                            margin-top:13px;
                            padding:10px;
                            border:1px solid ${
                                downloadEnabled
                                    ? "#cfcfcf"
                                    : "#e5e5e5"
                            };
                            background:${
                                downloadEnabled
                                    ? "#fafafa"
                                    : "#f3f3f3"
                            };
                            border-radius:7px;
                        "
                    >
                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                gap:8px;
                                align-items:center;
                                margin-bottom:8px;
                            "
                        >
                            <strong
                                style="
                                    font-size:11px;
                                    text-transform:uppercase;
                                    letter-spacing:.08em;
                                "
                            >
                                Download
                            </strong>

                            <span
                                style="
                                    font-size:11px;
                                    font-weight:700;
                                    color:${
                                        downloadEnabled
                                            ? "#111"
                                            : "#888"
                                    };
                                "
                            >
                                ${
                                    downloadEnabled
                                        ? "ENABLED"
                                        : "DISABLED"
                                }
                            </span>
                        </div>

                        <button
                            type="button"
                            class="btn ${
                                downloadEnabled
                                    ? "btn-primary"
                                    : "btn-secondary"
                            } demo-download-btn"
                            data-demo-download="${escapeHTML(
                                media.id
                            )}"
                            ${
                                downloadEnabled
                                    ? ""
                                    : "disabled"
                            }
                            style="
                                width:100%;
                                ${
                                    downloadEnabled
                                        ? ""
                                        : "opacity:.55;cursor:not-allowed;"
                                }
                            "
                        >
                            ${
                                downloadEnabled
                                    ? "Download Demo File"
                                    : "Downloads Disabled"
                            }
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    function buildMediaCardHTML(
        gallery,
        media,
        previewHTML
    ) {
        const albumOptions =
            gallery.albums
                .map(
                    (album) => `
                        <option
                            value="${escapeHTML(
                                album.id
                            )}"
                            ${
                                album.id ===
                                media.sectionId
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escapeHTML(
                                album.name
                            )}
                        </option>
                    `
                )
                .join("");

        return `
            <article
                class="media-card"
                data-media-id="${escapeHTML(
                    media.id
                )}"
            >
                ${previewHTML}

                <div class="media-card-body">
                    <strong>
                        ${escapeHTML(
                            media.name
                        )}
                    </strong>

                    <div
                        style="
                            margin-top:4px;
                            font-size:12px;
                            color:#777;
                        "
                    >
                        ${escapeHTML(
                            media.type
                        )}
                        ·
                        ${formatMB(
                            media.sizeMB
                        )}
                    </div>

                    <label
                        style="
                            display:block;
                            margin-top:12px;
                            font-size:11px;
                            color:#777;
                        "
                    >
                        Album

                        <select
                            class="media-album-select"
                            data-media-id="${escapeHTML(
                                media.id
                            )}"
                            style="
                                display:block;
                                width:100%;
                                margin-top:5px;
                            "
                        >
                            ${albumOptions}
                        </select>
                    </label>

                    <button
                        type="button"
                        class="btn btn-secondary media-delete-btn"
                        data-delete-media="${escapeHTML(
                            media.id
                        )}"
                        style="
                            width:100%;
                            margin-top:10px;
                        "
                    >
                        Delete Media
                    </button>
                </div>
            </article>
        `;
    }

    /* =========================================================
       DEMO DOWNLOAD
       ========================================================= */

    function createDemoDownloadBlob(
        media
    ) {
        const content =
            [
                "PROFESSIONAL STUDIO",
                "DEMO CLIENT GALLERY",
                "",
                `Media: ${media.name}`,
                `Type: ${media.type}`,
                `Size: ${formatMB(
                    media.sizeMB
                )}`,
                "",
                "This is a demo download file.",
                "It exists only to test the",
                "client gallery download workflow."
            ].join("\n");

        return new Blob(
            [content],
            {
                type: "text/plain"
            }
        );
    }

    function downloadDemoMedia(
        mediaId
    ) {
        const gallery =
            DEMO_GALLERY;

        if (
            !gallery.downloadsEnabled
        ) {
            showToast(
                "Downloads are currently disabled."
            );

            return;
        }

        const media =
            gallery.media.find(
                (item) =>
                    item.id ===
                    mediaId
            );

        if (!media) {
            showToast(
                "Demo media could not be found."
            );

            return;
        }

        const blob =
            createDemoDownloadBlob(
                media
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const anchor =
            document.createElement(
                "a"
            );

        anchor.href = url;

        anchor.download =
            `${media.name
                .replace(
                    /[^a-z0-9-_]+/gi,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                )
                .toLowerCase() ||
                "demo-media"}-demo.txt`;

        document.body.appendChild(
            anchor
        );

        anchor.click();

        anchor.remove();

        setTimeout(() => {
            URL.revokeObjectURL(
                url
            );
        }, 1000);

        showToast(
            `Demo download started: ${media.name}`
        );
    }

    /* =========================================================
       ALBUMS
    ========================================================= */

    function renderAlbums(gallery) {
        if (!dom.albumsGrid) {
            return;
        }

        const albums =
            Array.isArray(
                gallery.albums
            )
                ? gallery.albums
                : [];

        if (!albums.length) {
            dom.albumsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No albums</h3>
                    <p>Create an album to organize gallery media.</p>
                </div>
            `;

            return;
        }

        dom.albumsGrid.innerHTML =
            albums
                .map(
                    (album) => {
                        const count =
                            gallery.media.filter(
                                (media) =>
                                    media.sectionId ===
                                    album.id
                            ).length;

                        const selected =
                            album
                                .selectedMediaIds
                                ?.length ||
                            0;

                        return `
                            <article
                                class="album-card"
                                data-album-id="${escapeHTML(
                                    album.id
                                )}"
                            >
                                <div class="album-card-body">
                                    <div
                                        style="
                                            display:flex;
                                            justify-content:space-between;
                                            gap:10px;
                                            align-items:flex-start;
                                        "
                                    >
                                        <div>
                                            <h4>
                                                ${escapeHTML(
                                                    album.name
                                                )}
                                            </h4>

                                            ${
                                                album.description
                                                    ? `
                                                        <p>
                                                            ${escapeHTML(
                                                                album.description
                                                            )}
                                                        </p>
                                                    `
                                                    : ""
                                            }
                                        </div>

                                        ${
                                            album.isWeddingAlbum
                                                ? `
                                                    <span
                                                        style="
                                                            font-size:10px;
                                                            text-transform:uppercase;
                                                            letter-spacing:.08em;
                                                            border:1px solid #ddd;
                                                            padding:5px 7px;
                                                            border-radius:4px;
                                                        "
                                                    >
                                                        Selection
                                                    </span>
                                                `
                                                : ""
                                        }
                                    </div>

                                    <div
                                        style="
                                            margin-top:12px;
                                            display:flex;
                                            gap:15px;
                                            flex-wrap:wrap;
                                            font-size:12px;
                                            color:#777;
                                        "
                                    >
                                        <span>
                                            ${count}
                                            media
                                        </span>

                                        ${
                                            album.isWeddingAlbum
                                                ? `
                                                    <span>
                                                        ${selected}
                                                        selected
                                                    </span>
                                                `
                                                : ""
                                        }
                                    </div>

                                    ${
                                        !album.isWeddingAlbum &&
                                        !state.demoMode
                                            ? `
                                                <button
                                                    type="button"
                                                    class="btn btn-secondary album-delete-btn"
                                                    data-delete-album="${escapeHTML(
                                                        album.id
                                                    )}"
                                                    style="
                                                        margin-top:12px;
                                                    "
                                                >
                                                    Delete Album
                                                </button>
                                            `
                                            : ""
                                    }
                                </div>
                            </article>
                        `;
                    }
                )
                .join("");

        if (state.demoMode) {
            const demoNotice =
                document.createElement(
                    "div"
                );

            demoNotice.style.cssText = `
                margin-top:12px;
                padding:11px 13px;
                background:#f7f7f7;
                border:1px solid #e5e5e5;
                border-radius:7px;
                font-size:12px;
                color:#666;
            `;

            demoNotice.textContent =
                "Demo albums are read-only. Wedding Album shows the client-selection state.";

            dom.albumsGrid.appendChild(
                demoNotice
            );
        }
    }

    function openCreateAlbumModal() {
        if (state.demoMode) {
            showToast(
                "Demo gallery albums are read-only."
            );
            return;
        }

        state.editingAlbumId = null;

        if (dom.albumName) {
            dom.albumName.value = "";
        }

        if (dom.albumModal) {
            dom.albumModal.classList.add(
                "active"
            );
        }
    }

    function closeAlbumModal() {
        if (dom.albumModal) {
            dom.albumModal.classList.remove(
                "active"
            );
        }
    }

    function createAlbum() {
        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        if (state.demoMode) {
            showToast(
                "Demo gallery albums are read-only."
            );
            return;
        }

        const name =
            dom.albumName?.value
                ?.trim();

        if (!name) {
            showToast(
                "Enter an album name."
            );
            return;
        }

        gallery.albums.push(
            normalizeAlbum({
                id: generateId(
                    "album"
                ),
                name,
                description: "",
                mediaIds: [],
                isWeddingAlbum: false,
                selectionEnabled: false,
                maxSelections: 0,
                selectedMediaIds: [],
                selectedCount: 0,
                status: "open"
            })
        );

        saveGalleries();

        closeAlbumModal();

        renderAlbums(
            gallery
        );

        showToast(
            "Album created."
        );
    }

    function deleteAlbum(
        albumId
    ) {
        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            return;
        }

        const album =
            gallery.albums.find(
                (item) =>
                    item.id ===
                    albumId
            );

        if (!album) {
            return;
        }

        if (album.isWeddingAlbum) {
            showToast(
                "The Wedding Album cannot be deleted."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${album.name}"? Media will remain in the gallery.`
            );

        if (!confirmed) {
            return;
        }

        gallery.media.forEach(
            (media) => {
                if (
                    media.sectionId ===
                    album.id
                ) {
                    media.sectionId =
                        "wedding-album";
                }
            }
        );

        gallery.albums =
            gallery.albums.filter(
                (item) =>
                    item.id !==
                    album.id
            );

        syncAlbumMediaIds(
            gallery
        );

        saveGalleries();

        renderAlbums(
            gallery
        );

        renderMedia(
            gallery
        );

        showToast(
            "Album deleted."
        );
    }

    function syncAlbumMediaIds(
        gallery
    ) {
        gallery.albums.forEach(
            (album) => {
                album.mediaIds =
                    gallery.media
                        .filter(
                            (media) =>
                                media.sectionId ===
                                album.id
                        )
                        .map(
                            (media) =>
                                media.id
                        );
            }
        );
    }

    function assignMediaToAlbum(
        mediaId,
        albumId
    ) {
        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            return;
        }

        const media =
            gallery.media.find(
                (item) =>
                    item.id ===
                    mediaId
            );

        const album =
            gallery.albums.find(
                (item) =>
                    item.id ===
                    albumId
            );

        if (!media || !album) {
            return;
        }

        media.sectionId =
            album.id;

        syncAlbumMediaIds(
            gallery
        );

        saveGalleries();

        renderAlbums(
            gallery
        );

        showToast(
            `Media moved to ${album.name}.`
        );
    }

    /* =========================================================
       UPLOAD
    ========================================================= */

    async function uploadFiles(
        fileList
    ) {
        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        if (state.demoMode) {
            showToast(
                "The demo gallery is read-only."
            );
            return;
        }

        if (
            getGalleryStatus(
                gallery
            ) === "expired"
        ) {
            showToast(
                "This gallery has expired and cannot receive new media."
            );
            return;
        }

        const files =
            Array.from(
                fileList || []
            );

        if (!files.length) {
            return;
        }

        const invalidFiles =
            files.filter(
                (file) =>
                    !isSupportedFile(
                        file
                    )
            );

        if (
            invalidFiles.length
        ) {
            showToast(
                `${invalidFiles.length} unsupported file${
                    invalidFiles.length ===
                    1
                        ? ""
                        : "s"
                }. Use JPG, PNG, WEBP, GIF, MP4, WEBM, MOV or M4V.`
            );

            return;
        }

        const currentUsedMB =
            (Number(
                gallery.storageUsedGB
            ) || 0) * 1024;

        const incomingMB =
            files.reduce(
                (sum, file) =>
                    sum +
                    fileSizeMB(
                        file
                    ),
                0
            );

        const limitMB =
            (Number(
                gallery.storageLimitGB
            ) || 0) * 1024;

        if (
            currentUsedMB +
                incomingMB >
            limitMB
        ) {
            const availableMB =
                Math.max(
                    0,
                    limitMB -
                        currentUsedMB
                );

            showToast(
                `Upload exceeds your gallery storage. ${formatMB(
                    availableMB
                )} is available.`
            );

            return;
        }

        const originalMedia =
            gallery.media.slice();

        const createdRecords = [];

        try {
            for (
                const file of files
            ) {
                const mediaId =
                    generateId(
                        "media"
                    );

                const blobKey =
                    mediaId;

                const media =
                    normalizeMedia(
                        {
                            id: mediaId,
                            galleryId:
                                gallery.id,
                            name:
                                file.name,
                            type:
                                getMediaType(
                                    file
                                ),
                            sizeMB:
                                fileSizeMB(
                                    file
                                ),
                            sectionId:
                                "wedding-album",
                            createdAt:
                                new Date().toISOString(),
                            isCover:
                                false,
                            clientSelected:
                                false,
                            blobKey
                        },
                        gallery.id
                    );

                const record = {
                    id: mediaId,
                    galleryId:
                        gallery.id,
                    blob: file,
                    name:
                        file.name,
                    type:
                        file.type ||
                        getMediaType(
                            file
                        ),
                    sizeMB:
                        media.sizeMB,
                    createdAt:
                        media.createdAt
                };

                await putMediaBlob(
                    record
                );

                createdRecords.push(
                    record
                );

                gallery.media.push(
                    media
                );
            }

            syncAlbumMediaIds(
                gallery
            );

            recalculateGalleryStorage(
                gallery
            );

            saveGalleries();

            renderStats();

            renderGalleryGrid();

            renderModalOverview(
                gallery
            );

            renderDeliveryReadiness(
                gallery
            );

            await renderMedia(
                gallery
            );

            renderAlbums(
                gallery
            );

            showToast(
                `${files.length} ${
                    files.length === 1
                        ? "file"
                        : "files"
                } uploaded successfully.`
            );
        } catch (error) {
            console.error(
                "Media upload failed:",
                error
            );

            gallery.media =
                originalMedia;

            for (
                const record of createdRecords
            ) {
                try {
                    await deleteMediaBlob(
                        record.id
                    );
                } catch (
                    cleanupError
                ) {
                    console.warn(
                        "Upload cleanup failed:",
                        cleanupError
                    );
                }
            }

            recalculateGalleryStorage(
                gallery
            );

            showToast(
                "Upload failed. No partial media was kept."
            );

            await renderMedia(
                gallery
            );
        } finally {
            if (dom.mediaUpload) {
                dom.mediaUpload.value =
                    "";
            }
        }
    }

    /* =========================================================
       DELETE MEDIA
    ========================================================= */

    async function removeMedia(
        mediaId
    ) {
        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            return;
        }

        const mediaIndex =
            gallery.media.findIndex(
                (media) =>
                    media.id ===
                    mediaId
            );

        if (
            mediaIndex === -1
        ) {
            return;
        }

        const media =
            gallery.media[
                mediaIndex
            ];

        const confirmed =
            window.confirm(
                `Delete "${media.name}" from this gallery?`
            );

        if (!confirmed) {
            return;
        }

        gallery.media.splice(
            mediaIndex,
            1
        );

        syncAlbumMediaIds(
            gallery
        );

        recalculateGalleryStorage(
            gallery
        );

        try {
            await deleteMediaBlob(
                media.blobKey ||
                    media.id
            );
        } catch (error) {
            console.warn(
                "Unable to delete media blob:",
                error
            );
        }

        saveGalleries();

        renderStats();
        renderGalleryGrid();
        renderModalOverview(
            gallery
        );
        renderDeliveryReadiness(
            gallery
        );

        await renderMedia(
            gallery
        );

        renderAlbums(
            gallery
        );

        showToast(
            "Media deleted."
        );
    }

    /* =========================================================
       SETTINGS
    ========================================================= */

    function renderSettings(
        gallery
    ) {
        if (dom.editGalleryName) {
            dom.editGalleryName.value =
                gallery.galleryName;
        }

        if (dom.editClientName) {
            dom.editClientName.value =
                gallery.clientName;
        }

        if (
            dom.editGalleryDescription
        ) {
            dom.editGalleryDescription.value =
                gallery.description ||
                "";
        }

        if (
            dom.passwordEnabled
        ) {
            dom.passwordEnabled.checked =
                gallery.passwordEnabled;
        }

        if (
            dom.galleryPassword
        ) {
            dom.galleryPassword.value =
                gallery.password || "";

            dom.galleryPassword.disabled =
                !gallery.passwordEnabled;
        }

        if (
            dom.downloadsEnabled
        ) {
            dom.downloadsEnabled.checked =
                gallery.downloadsEnabled;
        }

        if (
            dom.galleryVisible
        ) {
            dom.galleryVisible.checked =
                gallery.visible;
        }

        if (
            dom.passwordSetting
        ) {
            dom.passwordSetting.classList.toggle(
                "disabled",
                !gallery.passwordEnabled
            );
        }
    }

    function saveGalleryInformation(
        event
    ) {
        event?.preventDefault();

        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            return;
        }

        const name =
            dom.editGalleryName?.value
                ?.trim();

        const clientName =
            dom.editClientName?.value
                ?.trim();

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

        gallery.galleryName =
            name;

        gallery.clientName =
            clientName;

        gallery.description =
            dom.editGalleryDescription
                ?.value
                ?.trim() || "";

        syncGalleryStatus(
            gallery
        );

        saveGalleries();

        renderStats();
        renderGalleryGrid();

        renderModalHeader(
            gallery
        );

        renderModalOverview(
            gallery
        );

        renderDeliveryReadiness(
            gallery
        );

        showToast(
            "Gallery information saved."
        );
    }

    /* =========================================================
       PASSWORD
    ========================================================= */

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

        if (dom.galleryPassword) {
            dom.galleryPassword.value =
                password;
        }
    }

    function saveGalleryPassword() {
        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            return;
        }

        const enabled =
            Boolean(
                dom.passwordEnabled
                    ?.checked
            );

        const password =
            dom.galleryPassword
                ?.value
                ?.trim() || "";

        if (
            enabled &&
            !password
        ) {
            showToast(
                "Enter a password or generate one."
            );
            return;
        }

        gallery.passwordEnabled =
            enabled;

        gallery.password =
            enabled
                ? password
                : "";

        saveGalleries();

        renderSettings(
            gallery
        );

        renderDeliveryReadiness(
            gallery
        );

        showToast(
            enabled
                ? "Gallery password saved."
                : "Gallery password protection disabled."
        );
    }

    function togglePasswordUI() {
        const enabled =
            Boolean(
                dom.passwordEnabled
                    ?.checked
            );

        if (
            dom.galleryPassword
        ) {
            dom.galleryPassword.disabled =
                !enabled;
        }

        if (
            dom.passwordSetting
        ) {
            dom.passwordSetting.classList.toggle(
                "disabled",
                !enabled
            );
        }
    }

    /* =========================================================
       ACCESS SETTINGS
    ========================================================= */

    function saveDownloadsSetting() {
        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            return;
        }

        gallery.downloadsEnabled =
            Boolean(
                dom.downloadsEnabled
                    ?.checked
            );

        saveGalleries();

        renderModalOverview(
            gallery
        );

        renderDeliveryReadiness(
            gallery
        );

        showToast(
            gallery.downloadsEnabled
                ? "Client downloads enabled."
                : "Client downloads disabled."
        );
    }

    function saveVisibilitySetting() {
        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            return;
        }

        gallery.visible =
            Boolean(
                dom.galleryVisible
                    ?.checked
            );

        saveGalleries();

        renderDeliveryReadiness(
            gallery
        );

        showToast(
            gallery.visible
                ? "Gallery is now visible."
                : "Gallery is hidden."
        );
    }

    /* =========================================================
       DEMO DOWNLOAD SETTING
       ========================================================= */

    function toggleDemoDownloads() {
        if (!state.demoMode) {
            return;
        }

        DEMO_GALLERY.downloadsEnabled =
            !DEMO_GALLERY.downloadsEnabled;

        const gallery =
            DEMO_GALLERY;

        renderModalOverview(
            gallery
        );

        renderDeliveryReadiness(
            gallery
        );

        renderMedia(
            gallery
        );

        const summary =
            document.getElementById(
                "demoDownloadSummary"
            );

        if (summary) {
            summary.textContent =
                gallery.downloadsEnabled
                    ? "ENABLED"
                    : "DISABLED";
        }

        showToast(
            gallery.downloadsEnabled
                ? "Demo downloads ENABLED."
                : "Demo downloads DISABLED."
        );
    }

    /* =========================================================
       SHARE / COPY
    ========================================================= */

    async function copyGalleryLink() {
        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const link =
            gallery.demo
                ? "https://professionalstudio.vercel.app/demo/client-gallery"
                : `https://professionalstudio.vercel.app/client/${encodeURIComponent(
                      gallery.id
                  )}`;

        try {
            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {
                await navigator.clipboard.writeText(
                    link
                );

                showToast(
                    "Gallery link copied."
                );

                return;
            }
        } catch (error) {
            console.warn(
                "Clipboard failed:",
                error
            );
        }

        window.prompt(
            "Copy gallery link:",
            link
        );
    }

    /* =========================================================
       SEND TO CLIENT
    ========================================================= */

    function sendGalleryToClient() {
        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            return;
        }

        const hasName =
            Boolean(
                gallery.galleryName?.trim()
            );

        const hasMedia =
            gallery.media.length >
            0;

        const passwordOkay =
            gallery.passwordEnabled
                ? Boolean(
                      gallery.password
                  )
                : true;

        const storageOkay =
            gallery.storageUsedGB <=
            gallery.storageLimitGB;

        const notExpired =
            daysBetweenNow(
                gallery.expiryDate
            ) > 0;

        const visible =
            gallery.visible !== false;

        if (
            !hasName ||
            !hasMedia ||
            !passwordOkay ||
            !storageOkay ||
            !notExpired ||
            !visible
        ) {
            showToast(
                "Complete the gallery setup before sending."
            );
            return;
        }

        gallery.deliveryStatus =
            "sent";

        gallery.sentAt =
            new Date().toISOString();

        saveGalleries();

        syncGalleryStatus(
            gallery
        );

        renderModalHeader(
            gallery
        );

        renderDeliveryReadiness(
            gallery
        );

        renderGalleryGrid();

        showToast(
            "Gallery marked as sent to client."
        );
    }

    /* =========================================================
       DELETE GALLERY
    ========================================================= */

    async function deleteGallery() {
        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${gallery.galleryName}"? This cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        const media =
            gallery.media || [];

        for (
            const item of media
        ) {
            try {
                await deleteMediaBlob(
                    item.blobKey ||
                        item.id
                );
            } catch (error) {
                console.warn(
                    "Unable to remove media blob:",
                    error
                );
            }
        }

        state.galleries =
            state.galleries.filter(
                (item) =>
                    item.id !==
                    gallery.id
            );

        state.selectedGalleryId =
            null;

        saveGalleries();

        closeGalleryModal();

        renderStats();
        renderGalleryGrid();

        showToast(
            "Gallery deleted."
        );
    }

    /* =========================================================
       TABS
    ========================================================= */

    function switchTab(
        tabName,
        rerender = true
    ) {
        state.activeTab =
            tabName;

        document
            .querySelectorAll(
                "[data-tab]"
            )
            .forEach(
                (element) => {
                    element.classList.toggle(
                        "active",
                        element.dataset
                            .tab ===
                            tabName
                    );
                }
            );

        document
            .querySelectorAll(
                ".modal-tab-panel"
            )
            .forEach(
                (panel) => {
                    panel.classList.toggle(
                        "active",
                        panel.dataset
                            .tabPanel ===
                            tabName
                    );
                }
            );

        if (!rerender) {
            return;
        }

        const gallery =
            state.demoMode
                ? DEMO_GALLERY
                : getSelectedGallery();

        if (!gallery) {
            return;
        }

        if (
            tabName ===
            "media"
        ) {
            renderMedia(
                gallery
            );
        }

        if (
            tabName ===
            "albums"
        ) {
            renderAlbums(
                gallery
            );
        }

        if (
            tabName ===
            "settings"
        ) {
            renderSettings(
                gallery
            );
        }
    }

    /* =========================================================
       EVENT HANDLERS
    ========================================================= */

    function bindEvents() {
        dom.gallerySearch?.addEventListener(
            "input",
            (event) => {
                state.searchTerm =
                    event.target.value ||
                    "";

                renderGalleryGrid();
            }
        );

        dom.statusFilter?.addEventListener(
            "change",
            () => {
                renderGalleryGrid();
            }
        );

        dom.mediaFilter?.addEventListener(
            "change",
            (event) => {
                state.mediaFilter =
                    event.target.value ||
                    "all";

                const gallery =
                    state.demoMode
                        ? DEMO_GALLERY
                        : getSelectedGallery();

                if (gallery) {
                    renderMedia(
                        gallery
                    );
                }
            }
        );

        dom.mediaUpload?.addEventListener(
            "change",
            (event) => {
                uploadFiles(
                    event.target.files
                );
            }
        );

        dom.uploadZone?.addEventListener(
            "dragover",
            (event) => {
                event.preventDefault();

                dom.uploadZone.classList.add(
                    "dragover"
                );
            }
        );

        dom.uploadZone?.addEventListener(
            "dragleave",
            () => {
                dom.uploadZone.classList.remove(
                    "dragover"
                );
            }
        );

        dom.uploadZone?.addEventListener(
            "drop",
            (event) => {
                event.preventDefault();

                dom.uploadZone.classList.remove(
                    "dragover"
                );

                uploadFiles(
                    event.dataTransfer
                        ?.files
                );
            }
        );

        dom.createAlbumBtn?.addEventListener(
            "click",
            openCreateAlbumModal
        );

        dom.albumForm?.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();
                createAlbum();
            }
        );

        dom.generatePassword?.addEventListener(
            "click",
            generateGalleryPassword
        );

        dom.passwordEnabled?.addEventListener(
            "change",
            togglePasswordUI
        );

        dom.savePassword?.addEventListener(
            "click",
            saveGalleryPassword
        );

        dom.downloadsEnabled?.addEventListener(
            "change",
            saveDownloadsSetting
        );

        dom.galleryVisible?.addEventListener(
            "change",
            saveVisibilitySetting
        );

        dom.gallerySettingsForm?.addEventListener(
            "submit",
            saveGalleryInformation
        );

        dom.deleteGalleryBtn?.addEventListener(
            "click",
            deleteGallery
        );

        dom.copyLinkBtn?.addEventListener(
            "click",
            copyGalleryLink
        );

        dom.sendToClientBtn?.addEventListener(
            "click",
            sendGalleryToClient
        );

        /*
         * Main gallery grid buttons
         */
        dom.galleryGrid?.addEventListener(
            "click",
            (event) => {
                const manageButton =
                    event.target.closest(
                        "[data-manage-gallery]"
                    );

                if (
                    manageButton
                ) {
                    const id =
                        manageButton.dataset
                            .manageGallery;

                    const gallery =
                        state.galleries.find(
                            (item) =>
                                item.id ===
                                id
                        );

                    if (gallery) {
                        openGalleryModal(
                            gallery
                        );
                    }

                    return;
                }
            }
        );

        /*
         * Modal tab buttons
         */
        document.addEventListener(
            "click",
            (event) => {
                const tabButton =
                    event.target.closest(
                        "[data-tab]"
                    );

                if (
                    tabButton &&
                    dom.galleryModal?.contains(
                        tabButton
                    )
                ) {
                    event.preventDefault();

                    switchTab(
                        tabButton.dataset
                            .tab
                    );

                    return;
                }

                /*
                 * QUICK ACTION FIX
                 *
                 * HTML uses:
                 * data-open-tab="media"
                 * data-open-tab="albums"
                 * data-open-tab="access"
                 */
                const openTabButton =
                    event.target.closest(
                        "[data-open-tab]"
                    );

                if (
                    openTabButton &&
                    dom.galleryModal?.contains(
                        openTabButton
                    )
                ) {
                    event.preventDefault();

                    const tab =
                        openTabButton.dataset
                            .openTab;

                    if (
                        tab ===
                        "access"
                    ) {
                        switchTab(
                            "settings"
                        );
                    } else {
                        switchTab(
                            tab
                        );
                    }

                    return;
                }

                /*
                 * Demo download button
                 */
                const demoDownload =
                    event.target.closest(
                        "[data-demo-download]"
                    );

                if (
                    demoDownload
                ) {
                    downloadDemoMedia(
                        demoDownload.dataset
                            .demoDownload
                    );

                    return;
                }

                /*
                 * Demo download setting
                 *
                 * This can be wired to a button
                 * if the HTML contains
                 * data-demo-download-toggle.
                 */
                const demoToggle =
                    event.target.closest(
                        "[data-demo-download-toggle]"
                    );

                if (
                    demoToggle
                ) {
                    toggleDemoDownloads();
                    return;
                }

                /*
                 * Delete media
                 */
                const deleteMediaButton =
                    event.target.closest(
                        "[data-delete-media]"
                    );

                if (
                    deleteMediaButton
                ) {
                    removeMedia(
                        deleteMediaButton
                            .dataset
                            .deleteMedia
                    );

                    return;
                }

                /*
                 * Delete album
                 */
                const deleteAlbumButton =
                    event.target.closest(
                        "[data-delete-album]"
                    );

                if (
                    deleteAlbumButton
                ) {
                    deleteAlbum(
                        deleteAlbumButton
                            .dataset
                            .deleteAlbum
                    );

                    return;
                }

                /*
                 * Close album modal
                 */
                const closeAlbum =
                    event.target.closest(
                        "[data-close-album-modal]"
                    );

                if (
                    closeAlbum
                ) {
                    closeAlbumModal();
                    return;
                }

                /*
                 * Close gallery modal
                 */
                const closeGallery =
                    event.target.closest(
                        "[data-close-gallery-modal]"
                    );

                if (
                    closeGallery
                ) {
                    closeGalleryModal();
                    return;
                }
            }
        );

        /*
         * Media album assignment
         */
        dom.mediaGrid?.addEventListener(
            "change",
            (event) => {
                const select =
                    event.target.closest(
                        ".media-album-select"
                    );

                if (!select) {
                    return;
                }

                assignMediaToAlbum(
                    select.dataset
                        .mediaId,
                    select.value
                );
            }
        );

        /*
         * Modal background click
         */
        dom.galleryModal?.addEventListener(
            "click",
            (event) => {
                if (
                    event.target ===
                    dom.galleryModal
                ) {
                    closeGalleryModal();
                }
            }
        );

        /*
         * Album modal background click
         */
        dom.albumModal?.addEventListener(
            "click",
            (event) => {
                if (
                    event.target ===
                    dom.albumModal
                ) {
                    closeAlbumModal();
                }
            }
        );

        /*
         * Escape key
         */
        document.addEventListener(
            "keydown",
            (event) => {
                if (
                    event.key !==
                    "Escape"
                ) {
                    return;
                }

                if (
                    dom.albumModal?.classList.contains(
                        "active"
                    )
                ) {
                    closeAlbumModal();
                    return;
                }

                if (
                    dom.galleryModal?.classList.contains(
                        "active"
                    )
                ) {
                    closeGalleryModal();
                }
            }
        );

        /*
         * Mobile menu
         */
        const mobileMenuButton =
            document.querySelector(
                "[data-mobile-menu]"
            ) ||
            document.querySelector(
                ".mobile-menu-btn"
            );

        const mobileMenu =
            document.querySelector(
                "[data-mobile-nav]"
            ) ||
            document.querySelector(
                ".mobile-nav"
            );

        mobileMenuButton?.addEventListener(
            "click",
            () => {
                mobileMenu?.classList.toggle(
                    "active"
                );
            }
        );

        /*
         * Close mobile menu after navigation
         */
        mobileMenu?.addEventListener(
            "click",
            (event) => {
                if (
                    event.target.closest(
                        "a"
                    )
                ) {
                    mobileMenu.classList.remove(
                        "active"
                    );
                }
            }
        );

        /*
         * Refresh when another tab/window
         * changes the gallery storage.
         */
        window.addEventListener(
            "storage",
            (event) => {
                if (
                    event.key ===
                    STORAGE_KEY
                ) {
                    state.galleries =
                        loadGalleries();

                    normalizeAllGalleries();

                    syncAllStorage();

                    renderStats();
                    renderGalleryGrid();

                    const gallery =
                        getSelectedGallery();

                    if (
                        gallery &&
                        dom.galleryModal?.classList.contains(
                            "active"
                        )
                    ) {
                        renderModal(
                            gallery
                        );
                    }
                }
            }
        );

        window.addEventListener(
            "professionalStudioClientGalleriesUpdated",
            () => {
                state.galleries =
                    loadGalleries();

                normalizeAllGalleries();

                syncAllStorage();

                renderStats();
                renderGalleryGrid();
            }
        );
    }

    /* =========================================================
       DEMO DOWNLOAD CONTROL
       ========================================================= */

    function injectDemoDownloadTester() {
        if (!dom.galleryModal) {
            return;
        }

        /*
         * The existing HTML does not have a dedicated
         * demo-download setting control, so we inject
         * a clearly visible tester when the demo opens.
         */

        const existing =
            document.getElementById(
                "demoDownloadTester"
            );

        existing?.remove();

        if (!state.demoMode) {
            return;
        }

        const mediaPanel =
            dom.galleryModal.querySelector(
                '[data-tab-panel="media"]'
            ) ||
            dom.galleryModal.querySelector(
                "#media"
            );

        if (!mediaPanel) {
            return;
        }

        const tester =
            document.createElement(
                "div"
            );

        tester.id =
            "demoDownloadTester";

        tester.style.cssText = `
            margin: 0 0 18px;
            padding: 16px;
            border: 2px solid #222;
            background: #fff;
            border-radius: 9px;
        `;

        tester.innerHTML = `
            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:16px;
                    flex-wrap:wrap;
                "
            >
                <div>
                    <div
                        style="
                            font-size:11px;
                            font-weight:800;
                            letter-spacing:.1em;
                            text-transform:uppercase;
                            margin-bottom:6px;
                        "
                    >
                        DEMO DOWNLOAD TEST
                    </div>

                    <strong
                        id="demoDownloadTesterStatus"
                        style="
                            font-size:17px;
                        "
                    >
                        Downloads are ${
                            DEMO_GALLERY.downloadsEnabled
                                ? "ENABLED"
                                : "DISABLED"
                        }
                    </strong>

                    <p
                        style="
                            margin:6px 0 0;
                            color:#666;
                            font-size:13px;
                            line-height:1.45;
                        "
                    >
                        ${
                            DEMO_GALLERY.downloadsEnabled
                                ? "The Download Demo File buttons below should work."
                                : "Download buttons below should be disabled."
                        }
                    </p>
                </div>

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-demo-download-toggle
                >
                    ${
                        DEMO_GALLERY.downloadsEnabled
                            ? "Disable Downloads"
                            : "Enable Downloads"
                    }
                </button>
            </div>
        `;

        mediaPanel.prepend(
            tester
        );
    }

    /* =========================================================
       PATCH DEMO RENDERING
       ========================================================= */

    const originalOpenDemoGallery =
        openDemoGallery;

    /*
     * Re-render the tester after opening.
     */
    function openDemoGalleryWithTester() {
        originalOpenDemoGallery();

        setTimeout(() => {
            injectDemoDownloadTester();
        }, 0);
    }

    /*
     * Replace demo button listeners created
     * in the demo section.
     */
    function bindDemoSectionButtons() {
        const openButton =
            document.getElementById(
                "openDemoGalleryBtn"
            );

        openButton?.addEventListener(
            "click",
            () => {
                openDemoGalleryWithTester();
            }
        );
    }

    /* =========================================================
       PUBLIC API
    ========================================================= */

    window.ProfessionalStudioClientGalleries = {
        getGalleries() {
            return state.galleries;
        },

        getDemoGallery() {
            return DEMO_GALLERY;
        },

        openDemoGallery:
            openDemoGalleryWithTester,

        shareDemoGallery,

        openGallery(
            galleryId
        ) {
            const gallery =
                state.galleries.find(
                    (item) =>
                        item.id ===
                        galleryId
                );

            if (gallery) {
                openGalleryModal(
                    gallery
                );
            }
        },

        closeGallery:
            closeGalleryModal,

        refresh() {
            state.galleries =
                loadGalleries();

            normalizeAllGalleries();

            syncAllStorage();

            renderStats();
            renderGalleryGrid();
            renderDemoSection();
            bindDemoSectionButtons();
        }
    };

    /* =========================================================
       INIT
    ========================================================= */

    async function init() {
        try {
            state.db =
                await openDatabase();
        } catch (error) {
            console.error(
                "Client Gallery IndexedDB unavailable:",
                error
            );

            showToast(
                "Gallery storage is unavailable in this browser."
            );
        }

        state.galleries =
            loadGalleries();

        normalizeAllGalleries();

        processPendingPurchase();

        normalizeAllGalleries();

        syncAllStorage();

        bindEvents();

        renderStats();
        renderGalleryGrid();
        renderDemoSection();
        bindDemoSectionButtons();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );
    } else {
        init();
    }
})();