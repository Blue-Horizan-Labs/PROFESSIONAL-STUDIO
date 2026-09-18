/* =========================================================
   PROFESSIONAL STUDIO
   CLIENT GALLERIES
   Final Frontend Controller

   IMPORTANT:
   - Do NOT change clientgallery.html
   - Do NOT change clientgallery.css
   - Gallery Shop -> Client Galleries connection preserved
   - Metadata: localStorage
   - Actual media files: IndexedDB
   - WEDDING ALBUM selection moves media by changing sectionId
   - No media blob duplication
========================================================= */

(() => {
    "use strict";

    /* =========================================================
       STORAGE
    ========================================================= */

    const STORAGE_KEY = "professionalStudioGalleries";
    const PENDING_PURCHASE_KEY = "professionalStudioPendingGallery";
    const PURCHASE_HISTORY_KEY = "professionalStudioGalleryPurchases";

    const DB_NAME = "professionalStudioDB";
    const DB_VERSION = 2;
    const MEDIA_STORE = "clientGalleryMedia";

    const WEDDING_ALBUM_NAME = "WEDDING ALBUM";

    const state = {
        galleries: [],
        selectedGalleryId: null,
        activeTab: "overview",
        mediaFilter: "all",
        searchTerm: "",
        editingAlbumId: null,
        mediaObjectUrls: new Set(),
        coverObjectUrls: new Set(),
        db: null
    };

    /* =========================================================
       DOM REFERENCES
    ========================================================= */

    const refs = {
        galleryGrid: document.getElementById("galleryGrid"),
        gallerySearch: document.getElementById("gallerySearch"),
        galleryFilter: document.getElementById("galleryFilter"),

        totalGalleries: document.getElementById("totalGalleries"),
        activeGalleries: document.getElementById("activeGalleries"),
        expiringGalleries: document.getElementById("expiringGalleries"),
        storageUsed: document.getElementById("storageUsed"),

        galleryModal: document.getElementById("galleryModal"),
        modalGalleryTitle: document.getElementById("modalGalleryTitle"),
        modalGalleryClient: document.getElementById("modalGalleryClient"),
        closeGalleryModal: document.getElementById("closeGalleryModal"),

        modalStorageUsed: document.getElementById("modalStorageUsed"),
        modalStorageLimit: document.getElementById("modalStorageLimit"),
        modalStorageProgress: document.getElementById("modalStorageProgress"),

        modalExpiryDate: document.getElementById("modalExpiryDate"),
        modalDaysLeft: document.getElementById("modalDaysLeft"),

        galleryClientLink: document.getElementById("galleryClientLink"),
        copyGalleryLink: document.getElementById("copyGalleryLink"),

        mediaGrid: document.getElementById("mediaGrid"),
        mediaUpload: document.getElementById("mediaUpload"),
        uploadMediaBtn: document.getElementById("uploadMediaBtn"),

        albumsGrid: document.getElementById("albumsGrid"),
        createAlbumBtn: document.getElementById("createAlbumBtn"),

        albumModal: document.getElementById("albumModal"),
        albumForm: document.getElementById("albumForm"),
        albumName: document.getElementById("albumName"),
        cancelAlbum: document.getElementById("cancelAlbum"),

        passwordEnabled: document.getElementById("passwordEnabled"),
        galleryPassword: document.getElementById("galleryPassword"),
        generatePassword: document.getElementById("generatePassword"),
        savePassword: document.getElementById("savePassword"),

        downloadsEnabled: document.getElementById("downloadsEnabled"),
        galleryVisible: document.getElementById("galleryVisible"),

        modalPassword: document.getElementById("modalPassword"),
        modalDownloads: document.getElementById("modalDownloads"),
        modalVisibility: document.getElementById("modalVisibility"),

        deleteGalleryBtn: document.getElementById("deleteGalleryBtn"),

        toast: document.getElementById("toast"),
        toastMessage: document.getElementById("toastMessage"),

        sendToClientBtn: document.getElementById("sendToClientBtn"),

        quickUploadBtn: document.getElementById("quickUploadBtn"),
        quickAlbumBtn: document.getElementById("quickAlbumBtn"),

        mobileMenuBtn: document.getElementById("mobileMenuBtn"),
        sidebar: document.querySelector(".sidebar")
    };

    /* =========================================================
       GENERAL HELPERS
    ========================================================= */

    function createId(prefix = "id") {
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

    function formatDate(dateValue) {
        if (!dateValue) return "Not available";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function formatDateTime(dateValue) {
        if (!dateValue) return "Not available";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function addMonths(dateValue, months) {
        const date = new Date(dateValue);
        date.setMonth(date.getMonth() + Number(months || 0));
        return date.toISOString();
    }

    function daysBetween(dateValue) {
        const target = new Date(dateValue).getTime();
        const now = Date.now();

        if (!Number.isFinite(target)) return 0;

        return Math.ceil((target - now) / 86400000);
    }

    function formatGB(gb) {
        const value = Number(gb || 0);

        if (value >= 1000) {
            return `${(value / 1000).toFixed(2)} TB`;
        }

        if (value >= 1) {
            return `${value.toFixed(value % 1 ? 2 : 0)} GB`;
        }

        return `${(value * 1024).toFixed(0)} MB`;
    }

    function bytesToMB(bytes) {
        return Number(bytes || 0) / (1024 * 1024);
    }

    function bytesToGB(bytes) {
        return Number(bytes || 0) / (1024 * 1024 * 1024);
    }

    function isImage(type) {
        return String(type || "").startsWith("image/");
    }

    function isVideo(type) {
        return String(type || "").startsWith("video/");
    }

    function isPhoto(media) {
        return isImage(media?.type);
    }

    function isVideoMedia(media) {
        return isVideo(media?.type);
    }

    function showToast(message, type = "success") {
        if (!refs.toast || !refs.toastMessage) {
            alert(message);
            return;
        }

        refs.toastMessage.textContent = message;

        refs.toast.classList.remove("success", "error", "warning");
        refs.toast.classList.add(type);

        refs.toast.classList.add("show");

        clearTimeout(showToast.timeout);

        showToast.timeout = setTimeout(() => {
            refs.toast.classList.remove("show");
        }, 3000);
    }

    function revokeSet(set) {
        set.forEach(url => {
            try {
                URL.revokeObjectURL(url);
            } catch (_) {}
        });

        set.clear();
    }

    /* =========================================================
       INDEXED DB
    ========================================================= */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error("IndexedDB is not supported by this browser."));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = event => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(MEDIA_STORE)) {
                    const store = db.createObjectStore(MEDIA_STORE, {
                        keyPath: "id"
                    });

                    store.createIndex("galleryId", "galleryId", {
                        unique: false
                    });
                }
            };

            request.onsuccess = event => {
                state.db = event.target.result;

                state.db.onversionchange = () => {
                    state.db.close();
                };

                resolve(state.db);
            };

            request.onerror = () => {
                reject(request.error || new Error("Unable to open IndexedDB."));
            };
        });
    }

    function ensureDB() {
        if (state.db) {
            return Promise.resolve(state.db);
        }

        return openDatabase();
    }

    function idbRequest(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function putMediaFile(record) {
        const db = await ensureDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(MEDIA_STORE, "readwrite");
            const store = tx.objectStore(MEDIA_STORE);

            store.put(record);

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        });
    }

    async function getMediaFile(mediaId) {
        const db = await ensureDB();

        const tx = db.transaction(MEDIA_STORE, "readonly");
        const store = tx.objectStore(MEDIA_STORE);

        return idbRequest(store.get(mediaId));
    }

    async function deleteMediaFile(mediaId) {
        const db = await ensureDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(MEDIA_STORE, "readwrite");

            tx.objectStore(MEDIA_STORE).delete(mediaId);

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        });
    }

    async function deleteMediaFiles(mediaIds) {
        if (!mediaIds?.length) return;

        const db = await ensureDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(MEDIA_STORE, "readwrite");
            const store = tx.objectStore(MEDIA_STORE);

            mediaIds.forEach(id => {
                store.delete(id);
            });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        });
    }

    async function getGalleryMediaBlobs(galleryId) {
        const db = await ensureDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(MEDIA_STORE, "readonly");
            const store = tx.objectStore(MEDIA_STORE);
            const index = store.index("galleryId");

            const request = index.getAll(galleryId);

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /* =========================================================
       LOCAL STORAGE
    ========================================================= */

    function loadGalleries() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);

            if (!raw) {
                state.galleries = [];
                return;
            }

            const parsed = JSON.parse(raw);

            state.galleries = Array.isArray(parsed)
                ? parsed.map(normalizeGallery)
                : [];
        } catch (error) {
            console.error("Failed to load galleries:", error);
            state.galleries = [];
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
            console.error("Failed to save galleries:", error);

            showToast(
                "Unable to save gallery information. Storage may be full.",
                "error"
            );

            return false;
        }
    }

    /* =========================================================
       NORMALIZATION
    ========================================================= */

    function normalizeMedia(media, galleryId) {
        const id = media?.id || createId("media");

        return {
            id,
            galleryId: media?.galleryId || galleryId,
            name: media?.name || "Untitled",
            sizeMB: Number(media?.sizeMB || 0),
            sizeBytes: Number(media?.sizeBytes || 0),
            type: media?.type || "",
            createdAt: media?.createdAt || new Date().toISOString(),

            /*
             * sectionId is the only folder relationship.
             * WEDDING ALBUM selection changes this value.
             * The actual blob remains in IndexedDB exactly once.
             */
            sectionId: media?.sectionId || null,

            /*
             * Used when a selected photo is removed from
             * WEDDING ALBUM so it can return to its previous section.
             */
            previousSectionId:
                media?.previousSectionId !== undefined
                    ? media.previousSectionId
                    : null,

            isCover: Boolean(media?.isCover),

            /*
             * Optional client note for album selection.
             */
            clientComment: media?.clientComment || ""
        };
    }

    function normalizeAlbum(album, galleryId) {
        return {
            id: album?.id || createId("album"),
            galleryId: album?.galleryId || galleryId,
            name: album?.name || "Untitled Section",
            createdAt: album?.createdAt || new Date().toISOString(),
            updatedAt:
                album?.updatedAt ||
                album?.createdAt ||
                new Date().toISOString(),
            system: Boolean(album?.system)
        };
    }

    function createWeddingAlbumSection(galleryId) {
        return {
            id: createId("album"),
            galleryId,
            name: WEDDING_ALBUM_NAME,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            system: true
        };
    }

    function normalizeGallery(gallery) {
        const normalized = {
            id: gallery?.id || createId("gallery"),
            name: gallery?.name || "Untitled Gallery",
            clientName: gallery?.clientName || "",
            description: gallery?.description || "",

            storageGB: Number(gallery?.storageGB || 10),
            storageUsedGB: Number(gallery?.storageUsedGB || 0),

            durationMonths: Number(gallery?.durationMonths || 6),

            createdAt:
                gallery?.createdAt || new Date().toISOString(),

            expiresAt:
                gallery?.expiresAt ||
                addMonths(
                    gallery?.createdAt || new Date().toISOString(),
                    Number(gallery?.durationMonths || 6)
                ),

            galleryLink:
                gallery?.galleryLink ||
                `${window.location.origin}/client-gallery-view.html?gallery=${encodeURIComponent(
                    gallery?.id || ""
                )}`,

            password: gallery?.password || "",
            passwordEnabled:
                gallery?.passwordEnabled !== undefined
                    ? Boolean(gallery.passwordEnabled)
                    : false,

            downloadsEnabled:
                gallery?.downloadsEnabled !== undefined
                    ? Boolean(gallery.downloadsEnabled)
                    : true,

            visible:
                gallery?.visible !== undefined
                    ? Boolean(gallery.visible)
                    : true,

            deliveryStatus:
                gallery?.deliveryStatus || "draft",

            sentAt: gallery?.sentAt || null,

            downloads: Number(gallery?.downloads || 0),
            views: Number(gallery?.views || 0),

            media: Array.isArray(gallery?.media)
                ? gallery.media.map(item =>
                      normalizeMedia(item, gallery?.id)
                  )
                : [],

            albums: Array.isArray(gallery?.albums)
                ? gallery.albums.map(item =>
                      normalizeAlbum(item, gallery?.id)
                  )
                : []
        };

        /*
         * Every gallery gets a WEDDING ALBUM section.
         * This is metadata only. It does not create any files.
         */
        let weddingAlbum = normalized.albums.find(
            album =>
                String(album.name).trim().toUpperCase() ===
                WEDDING_ALBUM_NAME
        );

        if (!weddingAlbum) {
            weddingAlbum = createWeddingAlbumSection(normalized.id);
            normalized.albums.push(weddingAlbum);
        }

        weddingAlbum.system = true;

        const albumMediaIds = new Set(
            normalized.media
                .filter(
                    media => media.sectionId === weddingAlbum.id
                )
                .map(media => media.id)
        );

        const existingSelection =
            gallery?.albumSelection || {};

        normalized.albumSelection = {
            enabled:
                existingSelection.enabled !== undefined
                    ? Boolean(existingSelection.enabled)
                    : false,

            maxSelections:
                existingSelection.maxSelections === null ||
                existingSelection.maxSelections === undefined
                    ? null
                    : Math.max(
                          1,
                          Number(existingSelection.maxSelections)
                      ),

            status:
                existingSelection.status ||
                (
                    existingSelection.enabled
                        ? "open"
                        : "closed"
                ),

            selectedMediaIds: Array.from(albumMediaIds),

            submittedAt:
                existingSelection.submittedAt || null,

            submittedBy:
                existingSelection.submittedBy || "client",

            photographerApproved:
                Boolean(
                    existingSelection.photographerApproved
                ),

            approvedAt:
                existingSelection.approvedAt || null
        };

        /*
         * Keep selection metadata synchronized with actual
         * WEDDING ALBUM membership.
         */
        if (!normalized.albumSelection.enabled) {
            normalized.albumSelection.status = "closed";
        }

        return normalized;
    }

    /* =========================================================
       GALLERY STATUS
    ========================================================= */

    function getGalleryStatus(gallery) {
        const daysLeft = daysBetween(gallery.expiresAt);

        if (daysLeft <= 0) {
            return "expired";
        }

        if (daysLeft <= 30) {
            return "expiring";
        }

        return "active";
    }

    function getStatusLabel(gallery) {
        const status = getGalleryStatus(gallery);

        if (status === "expired") return "Expired";
        if (status === "expiring") return "Expiring Soon";

        return "Active";
    }

    function syncGalleryStatus(gallery) {
        gallery.status = getGalleryStatus(gallery);
        return gallery.status;
    }

    /* =========================================================
       GALLERY LOOKUP
    ========================================================= */

    function getSelectedGallery() {
        return state.galleries.find(
            gallery => gallery.id === state.selectedGalleryId
        ) || null;
    }

    function getGalleryById(id) {
        return state.galleries.find(
            gallery => gallery.id === id
        ) || null;
    }

    function getWeddingAlbum(gallery) {
        if (!gallery) return null;

        return gallery.albums.find(
            album =>
                String(album.name).trim().toUpperCase() ===
                WEDDING_ALBUM_NAME
        ) || null;
    }

    function getWeddingAlbumMedia(gallery) {
        const weddingAlbum = getWeddingAlbum(gallery);

        if (!weddingAlbum) return [];

        return gallery.media.filter(
            media => media.sectionId === weddingAlbum.id
        );
    }

    function syncWeddingAlbumSelection(gallery) {
        if (!gallery) return;

        const weddingAlbum = getWeddingAlbum(gallery);

        if (!weddingAlbum) return;

        gallery.albumSelection =
            gallery.albumSelection || {};

        gallery.albumSelection.selectedMediaIds =
            gallery.media
                .filter(
                    media =>
                        media.sectionId ===
                        weddingAlbum.id
                )
                .map(media => media.id);

        if (
            gallery.albumSelection.enabled &&
            gallery.albumSelection.status === "closed"
        ) {
            gallery.albumSelection.status = "open";
        }

        if (!gallery.albumSelection.enabled) {
            gallery.albumSelection.status = "closed";
        }
    }

    /* =========================================================
       GALLERY SHOP CONNECTION
    ========================================================= */

    function processPendingPurchase() {
        let pending = null;

        try {
            const raw = localStorage.getItem(
                PENDING_PURCHASE_KEY
            );

            if (raw) {
                pending = JSON.parse(raw);
            }
        } catch (error) {
            console.error(
                "Invalid pending gallery purchase:",
                error
            );
        }

        if (!pending) return false;

        /*
         * Prevent duplicate creation if the same purchase is
         * somehow processed twice.
         */
        const alreadyExists = state.galleries.some(
            gallery =>
                gallery.purchaseId &&
                gallery.purchaseId === pending.purchaseId
        );

        if (alreadyExists) {
            localStorage.removeItem(
                PENDING_PURCHASE_KEY
            );

            return false;
        }

        const now = new Date().toISOString();

        const galleryId = createId("gallery");

        const durationMonths = Number(
            pending.durationMonths || 6
        );

        const storageGB = Number(
            pending.storageGB || 10
        );

        const weddingAlbum = createWeddingAlbumSection(
            galleryId
        );

        const gallery = normalizeGallery({
            id: galleryId,

            purchaseId:
                pending.purchaseId ||
                createId("purchase"),

            name:
                pending.galleryName ||
                "New Client Gallery",

            clientName:
                pending.clientName || "",

            description:
                pending.description || "",

            storageGB,

            storageUsedGB: 0,

            durationMonths,

            createdAt: now,

            expiresAt:
                pending.expiresAt ||
                addMonths(now, durationMonths),

            galleryLink:
                `${window.location.origin}/client-gallery-view.html?gallery=${encodeURIComponent(
                    galleryId
                )}`,

            password: "",

            passwordEnabled: false,

            downloadsEnabled: true,

            visible: true,

            deliveryStatus: "draft",

            sentAt: null,

            downloads: 0,

            views: 0,

            media: [],

            albums: [weddingAlbum],

            albumSelection: {
                enabled: false,
                maxSelections: null,
                status: "closed",
                selectedMediaIds: [],
                submittedAt: null,
                submittedBy: "client",
                photographerApproved: false,
                approvedAt: null
            }
        });

        /*
         * Keep the source of the purchase.
         * This is important for future backend integration.
         */
        gallery.source =
            pending.source ||
            "gallery-shop";

        gallery.paymentStatus =
            pending.paymentStatus ||
            "frontend-confirmed";

        gallery.purchaseStatus =
            pending.status ||
            "purchased";

        state.galleries.unshift(gallery);

        const purchaseHistoryRaw =
            localStorage.getItem(
                PURCHASE_HISTORY_KEY
            );

        let purchaseHistory = [];

        try {
            purchaseHistory = purchaseHistoryRaw
                ? JSON.parse(purchaseHistoryRaw)
                : [];
        } catch (_) {
            purchaseHistory = [];
        }

        if (!Array.isArray(purchaseHistory)) {
            purchaseHistory = [];
        }

        purchaseHistory.unshift({
            ...pending,
            galleryId: gallery.id,
            createdGalleryAt: now
        });

        try {
            localStorage.setItem(
                PURCHASE_HISTORY_KEY,
                JSON.stringify(purchaseHistory)
            );
        } catch (_) {}

        saveGalleries();

        /*
         * Consume the purchase handoff only after the gallery
         * has successfully been created.
         */
        localStorage.removeItem(
            PENDING_PURCHASE_KEY
        );

        state.selectedGalleryId = gallery.id;

        showToast(
            "Gallery purchased and added to Client Galleries."
        );

        return true;
    }

    /* =========================================================
       PAGE RENDERING
    ========================================================= */

    async function renderPage() {
        loadGalleries();

        state.galleries.forEach(syncGalleryStatus);

        renderStats();
        await renderGalleryGrid();
    }

    function renderStats() {
        const total = state.galleries.length;

        let active = 0;
        let expiring = 0;
        let storage = 0;

        state.galleries.forEach(gallery => {
            const status = getGalleryStatus(gallery);

            if (status === "active") {
                active++;
            }

            if (status === "expiring") {
                expiring++;
            }

            storage += Number(
                gallery.storageUsedGB || 0
            );
        });

        if (refs.totalGalleries) {
            refs.totalGalleries.textContent = total;
        }

        if (refs.activeGalleries) {
            refs.activeGalleries.textContent = active;
        }

        if (refs.expiringGalleries) {
            refs.expiringGalleries.textContent = expiring;
        }

        if (refs.storageUsed) {
            refs.storageUsed.textContent =
                formatGB(storage);
        }
    }

    async function renderGalleryGrid() {
        if (!refs.galleryGrid) return;

        revokeSet(state.coverObjectUrls);

        const search = state.searchTerm
            .trim()
            .toLowerCase();

        const filter =
            refs.galleryFilter?.value || "all";

        let galleries = [...state.galleries];

        if (search) {
            galleries = galleries.filter(gallery => {
                return (
                    gallery.name
                        .toLowerCase()
                        .includes(search) ||
                    gallery.clientName
                        .toLowerCase()
                        .includes(search)
                );
            });
        }

        if (filter !== "all") {
            galleries = galleries.filter(
                gallery =>
                    getGalleryStatus(gallery) ===
                    filter
            );
        }

        if (!galleries.length) {
            refs.galleryGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fa-regular fa-images"></i>
                    </div>

                    <h3>No client galleries yet</h3>

                    <p>
                        Your purchased client galleries will appear here.
                    </p>

                    <a
                        href="galleryshop.html"
                        class="primary-btn"
                    >
                        <i class="fa-solid fa-plus"></i>
                        Buy Your First Gallery
                    </a>
                </div>
            `;

            return;
        }

        const cards = await Promise.all(
            galleries.map(
                gallery =>
                    buildGalleryCard(gallery)
            )
        );

        refs.galleryGrid.innerHTML =
            cards.join("");

        bindGalleryCardEvents();
    }

    async function buildGalleryCard(gallery) {
        const status = getGalleryStatus(gallery);
        const weddingMedia =
            getWeddingAlbumMedia(gallery);

        let coverHTML = `
            <div class="gallery-cover-placeholder">
                <i class="fa-regular fa-images"></i>
            </div>
        `;

        const coverMedia =
            gallery.media.find(
                media => media.isCover
            ) ||
            gallery.media.find(
                media => isPhoto(media)
            );

        if (coverMedia) {
            try {
                const blobRecord =
                    await getMediaFile(
                        coverMedia.id
                    );

                if (blobRecord?.blob) {
                    const url =
                        URL.createObjectURL(
                            blobRecord.blob
                        );

                    state.coverObjectUrls.add(url);

                    coverHTML = `
                        <img
                            src="${url}"
                            alt="${escapeHTML(
                                gallery.name
                            )}"
                            loading="lazy"
                        >
                    `;
                }
            } catch (error) {
                console.warn(
                    "Unable to load gallery cover:",
                    error
                );
            }
        }

        const deliveryLabel =
            gallery.deliveryStatus === "sent"
                ? "Sent to Client"
                : "Not Sent";

        return `
            <article
                class="gallery-card"
                data-gallery-id="${escapeHTML(
                    gallery.id
                )}"
            >
                <div class="gallery-card-cover">
                    ${coverHTML}

                    <span class="gallery-status ${status}">
                        ${getStatusLabel(gallery)}
                    </span>
                </div>

                <div class="gallery-card-body">
                    <div class="gallery-card-heading">
                        <h3>
                            ${escapeHTML(
                                gallery.name
                            )}
                        </h3>

                        <button
                            type="button"
                            class="icon-btn open-gallery-btn"
                            data-gallery-id="${escapeHTML(
                                gallery.id
                            )}"
                            title="Manage gallery"
                        >
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </button>
                    </div>

                    <p class="gallery-client">
                        <i class="fa-regular fa-user"></i>
                        ${escapeHTML(
                            gallery.clientName ||
                            "No client name"
                        )}
                    </p>

                    <div class="gallery-card-meta">
                        <span>
                            <i class="fa-regular fa-images"></i>
                            ${gallery.media.length} media
                        </span>

                        <span>
                            <i class="fa-regular fa-hard-drive"></i>
                            ${formatGB(
                                gallery.storageUsedGB
                            )}
                            / ${formatGB(
                                gallery.storageGB
                            )}
                        </span>
                    </div>

                    <div class="gallery-card-meta">
                        <span>
                            <i class="fa-regular fa-calendar"></i>
                            ${daysBetween(
                                gallery.expiresAt
                            ) > 0
                                ? `${daysBetween(
                                      gallery.expiresAt
                                  )} days left`
                                : "Expired"}
                        </span>

                        <span>
                            ${deliveryLabel}
                        </span>
                    </div>

                    ${
                        gallery.albumSelection?.enabled
                            ? `
                                <div class="gallery-card-meta">
                                    <span>
                                        <i class="fa-regular fa-square-check"></i>
                                        Album:
                                        ${weddingMedia.length}
                                        ${
                                            gallery.albumSelection
                                                .maxSelections
                                                ? ` / ${gallery.albumSelection.maxSelections}`
                                                : ""
                                        }
                                    </span>
                                </div>
                            `
                            : ""
                    }

                    <button
                        type="button"
                        class="secondary-btn full-width open-gallery-btn"
                        data-gallery-id="${escapeHTML(
                            gallery.id
                        )}"
                    >
                        Manage Gallery
                    </button>
                </div>
            </article>
        `;
    }

    function bindGalleryCardEvents() {
        document
            .querySelectorAll(".open-gallery-btn")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        const id =
                            button.dataset.galleryId;

                        openGalleryModal(id);
                    }
                );
            });
    }

    /* =========================================================
       OPEN / CLOSE GALLERY
    ========================================================= */

    async function openGalleryModal(galleryId) {
        const gallery =
            getGalleryById(galleryId);

        if (!gallery) return;

        state.selectedGalleryId = galleryId;
        state.activeTab = "overview";
        state.mediaFilter = "all";

        syncWeddingAlbumSelection(gallery);

        renderModalHeader(gallery);
        renderModalOverview(gallery);
        renderAlbums(gallery);
        renderSettings(gallery);
        renderWeddingAlbumStatus(gallery);

        switchTab("overview");

        if (refs.galleryModal) {
            refs.galleryModal.classList.add("open");
        }

        await renderMedia(gallery);
        renderModalOverview(gallery);
        renderAlbums(gallery);
        renderWeddingAlbumStatus(gallery);
    }

    function closeGalleryModal() {
        if (refs.galleryModal) {
            refs.galleryModal.classList.remove("open");
        }

        revokeSet(state.mediaObjectUrls);

        state.selectedGalleryId = null;
    }

    function renderModalHeader(gallery) {
        if (refs.modalGalleryTitle) {
            refs.modalGalleryTitle.textContent =
                gallery.name;
        }

        if (refs.modalGalleryClient) {
            refs.modalGalleryClient.textContent =
                gallery.clientName ||
                "No client assigned";
        }
    }

    /* =========================================================
       MODAL OVERVIEW
    ========================================================= */

    function renderModalOverview(gallery) {
        if (!gallery) return;

        const used =
            Number(gallery.storageUsedGB || 0);

        const limit =
            Number(gallery.storageGB || 0);

        const percent =
            limit > 0
                ? Math.min(
                      100,
                      (used / limit) * 100
                  )
                : 0;

        if (refs.modalStorageUsed) {
            refs.modalStorageUsed.textContent =
                formatGB(used);
        }

        if (refs.modalStorageLimit) {
            refs.modalStorageLimit.textContent =
                formatGB(limit);
        }

        if (refs.modalStorageProgress) {
            refs.modalStorageProgress.style.width =
                `${percent}%`;
        }

        if (refs.modalExpiryDate) {
            refs.modalExpiryDate.textContent =
                formatDate(gallery.expiresAt);
        }

        if (refs.modalDaysLeft) {
            const days =
                daysBetween(
                    gallery.expiresAt
                );

            refs.modalDaysLeft.textContent =
                days > 0
                    ? `${days} days left`
                    : "Expired";
        }

        if (refs.galleryClientLink) {
            refs.galleryClientLink.value =
                gallery.galleryLink;
        }

        updateDeliveryReadiness(gallery);
    }

    /* =========================================================
       WEDDING ALBUM
    ========================================================= */

    function renderWeddingAlbumStatus(gallery) {
        if (!gallery) return;

        /*
         * No extra HTML is injected here.
         *
         * The existing Albums/Sections area and Media Grid
         * are used for the WEDDING ALBUM feature.
         */

        syncWeddingAlbumSelection(gallery);

        const weddingAlbum =
            getWeddingAlbum(gallery);

        if (!weddingAlbum) return;

        const count =
            getWeddingAlbumMedia(gallery).length;

        /*
         * Update the existing WEDDING ALBUM card if present.
         */
        const card =
            refs.albumsGrid?.querySelector(
                `[data-album-id="${CSS.escape(
                    weddingAlbum.id
                )}"]`
            );

        if (!card) return;

        const countElement =
            card.querySelector(
                ".album-card-count"
            );

        if (countElement) {
            countElement.textContent =
                `${count} ${count === 1 ? "photo" : "photos"}`;
        }
    }

    function enableWeddingAlbumSelection(
        galleryId,
        maxSelections = null
    ) {
        const gallery =
            getGalleryById(galleryId);

        if (!gallery) return false;

        gallery.albumSelection =
            gallery.albumSelection || {};

        gallery.albumSelection.enabled = true;

        gallery.albumSelection.maxSelections =
            maxSelections === null ||
            maxSelections === "" ||
            maxSelections === undefined
                ? null
                : Math.max(
                      1,
                      Number(maxSelections)
                  );

        gallery.albumSelection.status = "open";

        gallery.albumSelection.photographerApproved =
            false;

        gallery.albumSelection.approvedAt =
            null;

        syncWeddingAlbumSelection(gallery);

        saveGalleries();

        renderGalleryGrid();

        if (
            state.selectedGalleryId ===
            gallery.id
        ) {
            renderAlbums(gallery);
            renderWeddingAlbumStatus(gallery);
        }

        return true;
    }

    function disableWeddingAlbumSelection(
        galleryId
    ) {
        const gallery =
            getGalleryById(galleryId);

        if (!gallery) return false;

        gallery.albumSelection =
            gallery.albumSelection || {};

        gallery.albumSelection.enabled = false;
        gallery.albumSelection.status = "closed";

        /*
         * Existing selected photos remain in the
         * WEDDING ALBUM section.
         *
         * Disabling the feature does NOT delete or
         * duplicate media.
         */
        saveGalleries();

        renderGalleryGrid();

        if (
            state.selectedGalleryId ===
            gallery.id
        ) {
            renderAlbums(gallery);
            renderWeddingAlbumStatus(gallery);
            renderModalOverview(gallery);
        }

        return true;
    }

    function setWeddingAlbumLimit(
        galleryId,
        maxSelections
    ) {
        const gallery =
            getGalleryById(galleryId);

        if (!gallery) return false;

        const value =
            maxSelections === null ||
            maxSelections === "" ||
            maxSelections === undefined
                ? null
                : Math.max(
                      1,
                      Number(maxSelections)
                  );

        gallery.albumSelection =
            gallery.albumSelection || {};

        gallery.albumSelection.maxSelections =
            value;

        syncWeddingAlbumSelection(gallery);

        if (
            value !== null &&
            gallery.albumSelection
                .selectedMediaIds.length >
                value
        ) {
            showToast(
                `There are currently ${gallery.albumSelection.selectedMediaIds.length} selected photos, which is above the new limit of ${value}. Remove some photos before submitting.`,
                "warning"
            );
        }

        saveGalleries();

        return true;
    }

    function approveWeddingAlbumSelection(
        galleryId
    ) {
        const gallery =
            getGalleryById(galleryId);

        if (!gallery) return false;

        syncWeddingAlbumSelection(gallery);

        if (
            !gallery.albumSelection
                .enabled
        ) {
            showToast(
                "Album Selection is not enabled.",
                "warning"
            );

            return false;
        }

        const count =
            gallery.albumSelection
                .selectedMediaIds.length;

        const limit =
            gallery.albumSelection
                .maxSelections;

        if (
            limit !== null &&
            count > limit
        ) {
            showToast(
                `The selection contains ${count} photos, exceeding the limit of ${limit}.`,
                "warning"
            );

            return false;
        }

        gallery.albumSelection.status =
            "approved";

        gallery.albumSelection.photographerApproved =
            true;

        gallery.albumSelection.approvedAt =
            new Date().toISOString();

        saveGalleries();

        showToast(
            "Wedding Album selection approved."
        );

        if (
            state.selectedGalleryId ===
            gallery.id
        ) {
            renderAlbums(gallery);
            renderWeddingAlbumStatus(gallery);
        }

        return true;
    }

    function reopenWeddingAlbumSelection(
        galleryId
    ) {
        const gallery =
            getGalleryById(galleryId);

        if (!gallery) return false;

        gallery.albumSelection =
            gallery.albumSelection || {};

        gallery.albumSelection.status =
            "open";

        gallery.albumSelection.photographerApproved =
            false;

        gallery.albumSelection.approvedAt =
            null;

        saveGalleries();

        showToast(
            "Wedding Album selection reopened."
        );

        if (
            state.selectedGalleryId ===
            gallery.id
        ) {
            renderAlbums(gallery);
            renderWeddingAlbumStatus(gallery);
        }

        return true;
    }

    /*
     * Move a photo into WEDDING ALBUM.
     *
     * IMPORTANT:
     * This DOES NOT copy the Blob.
     * It only changes sectionId in localStorage metadata.
     */
    function moveMediaToWeddingAlbum(
        galleryId,
        mediaId
    ) {
        const gallery =
            getGalleryById(galleryId);

        if (!gallery) return false;

        if (
            !gallery.albumSelection ||
            !gallery.albumSelection.enabled
        ) {
            showToast(
                "Album Selection is not enabled.",
                "warning"
            );

            return false;
        }

        if (
            gallery.albumSelection.status ===
                "approved" ||
            gallery.albumSelection.status ===
                "submitted"
        ) {
            showToast(
                "This selection is locked. Reopen it before making changes.",
                "warning"
            );

            return false;
        }

        const media =
            gallery.media.find(
                item => item.id === mediaId
            );

        if (!media) return false;

        if (!isPhoto(media)) {
            showToast(
                "Only photos can be selected for the Wedding Album.",
                "warning"
            );

            return false;
        }

        const weddingAlbum =
            getWeddingAlbum(gallery);

        if (!weddingAlbum) return false;

        if (
            media.sectionId ===
            weddingAlbum.id
        ) {
            return true;
        }

        const currentCount =
            getWeddingAlbumMedia(gallery)
                .length;

        const maxSelections =
            gallery.albumSelection
                .maxSelections;

        if (
            maxSelections !== null &&
            currentCount >= maxSelections
        ) {
            showToast(
                `You can select a maximum of ${maxSelections} photos.`,
                "warning"
            );

            return false;
        }

        /*
         * Remember where the photo came from.
         * The file itself is never duplicated.
         */
        media.previousSectionId =
            media.sectionId || null;

        media.sectionId =
            weddingAlbum.id;

        syncWeddingAlbumSelection(gallery);

        saveGalleries();

        return true;
    }

    function removeMediaFromWeddingAlbum(
        galleryId,
        mediaId
    ) {
        const gallery =
            getGalleryById(galleryId);

        if (!gallery) return false;

        const weddingAlbum =
            getWeddingAlbum(gallery);

        if (!weddingAlbum) return false;

        const media =
            gallery.media.find(
                item => item.id === mediaId
            );

        if (!media) return false;

        if (
            media.sectionId !==
            weddingAlbum.id
        ) {
            return false;
        }

        /*
         * Restore the previous folder.
         *
         * If the previous folder no longer exists,
         * leave the photo unassigned.
         */
        const previousSection =
            gallery.albums.find(
                album =>
                    album.id ===
                    media.previousSectionId &&
                    album.id !==
                        weddingAlbum.id
            );

        media.sectionId =
            previousSection
                ? previousSection.id
                : null;

        media.previousSectionId = null;

        syncWeddingAlbumSelection(gallery);

        saveGalleries();

        return true;
    }

    function addClientComment(
        galleryId,
        mediaId,
        comment
    ) {
        const gallery =
            getGalleryById(galleryId);

        if (!gallery) return false;

        const media =
            gallery.media.find(
                item => item.id === mediaId
            );

        if (!media) return false;

        media.clientComment =
            String(comment || "").trim();

        saveGalleries();

        return true;
    }

    /* =========================================================
       ALBUMS / SECTIONS
    ========================================================= */

    function renderAlbums(gallery) {
        if (!refs.albumsGrid) return;

        const albums =
            Array.isArray(gallery.albums)
                ? gallery.albums
                : [];

        if (!albums.length) {
            refs.albumsGrid.innerHTML = `
                <div class="empty-state">
                    <p>No sections created yet.</p>
                </div>
            `;

            return;
        }

        refs.albumsGrid.innerHTML =
            albums
                .map(album => {
                    const count =
                        gallery.media.filter(
                            media =>
                                media.sectionId ===
                                album.id
                        ).length;

                    const isWedding =
                        String(
                            album.name
                        )
                            .trim()
                            .toUpperCase() ===
                        WEDDING_ALBUM_NAME;

                    return `
                        <div
                            class="album-card ${
                                isWedding
                                    ? "wedding-album-card"
                                    : ""
                            }"
                            data-album-id="${escapeHTML(
                                album.id
                            )}"
                        >
                            <div class="album-card-icon">
                                <i class="fa-regular fa-folder"></i>
                            </div>

                            <div class="album-card-info">
                                <h4>
                                    ${escapeHTML(
                                        album.name
                                    )}
                                </h4>

                                <span class="album-card-count">
                                    ${count}
                                    ${
                                        count === 1
                                            ? "photo"
                                            : "photos"
                                    }
                                </span>
                            </div>

                            <div class="album-card-actions">
                                ${
                                    isWedding
                                        ? `
                                            <span
                                                class="album-system-label"
                                                title="System section"
                                            >
                                                <i class="fa-solid fa-shield-halved"></i>
                                            </span>
                                        `
                                        : `
                                            <button
                                                type="button"
                                                class="icon-btn edit-album-btn"
                                                data-album-id="${escapeHTML(
                                                    album.id
                                                )}"
                                                title="Rename section"
                                            >
                                                <i class="fa-solid fa-pen"></i>
                                            </button>

                                            <button
                                                type="button"
                                                class="icon-btn danger delete-album-btn"
                                                data-album-id="${escapeHTML(
                                                    album.id
                                                )}"
                                                title="Delete section"
                                            >
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        `
                                }
                            </div>
                        </div>
                    `;
                })
                .join("");

        bindAlbumEvents();
    }

    function bindAlbumEvents() {
        document
            .querySelectorAll(".edit-album-btn")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    event => {
                        event.stopPropagation();

                        openAlbumModal(
                            button.dataset.albumId
                        );
                    }
                );
            });

        document
            .querySelectorAll(".delete-album-btn")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    event => {
                        event.stopPropagation();

                        deleteAlbum(
                            button.dataset.albumId
                        );
                    }
                );
            });

        document
            .querySelectorAll(".album-card")
            .forEach(card => {
                card.addEventListener(
                    "click",
                    event => {
                        if (
                            event.target.closest(
                                "button"
                            )
                        ) {
                            return;
                        }

                        const albumId =
                            card.dataset.albumId;

                        switchTab("media");

                        state.mediaFilter =
                            "all";

                        renderMedia(
                            getSelectedGallery(),
                            albumId
                        );
                    }
                );
            });
    }

    function openAlbumModal(albumId = null) {
        if (!refs.albumModal) return;

        state.editingAlbumId =
            albumId || null;

        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        if (albumId) {
            const album =
                gallery.albums.find(
                    item =>
                        item.id === albumId
                );

            if (!album) return;

            if (album.system) {
                showToast(
                    "WEDDING ALBUM is a system section and cannot be renamed.",
                    "warning"
                );

                return;
            }

            if (refs.albumName) {
                refs.albumName.value =
                    album.name;
            }
        } else {
            if (refs.albumName) {
                refs.albumName.value = "";
            }
        }

        refs.albumModal.classList.add("open");
    }

    function closeAlbumModal() {
        if (refs.albumModal) {
            refs.albumModal.classList.remove(
                "open"
            );
        }

        state.editingAlbumId = null;
    }

    function saveAlbum(event) {
        event.preventDefault();

        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        const name =
            refs.albumName?.value
                ?.trim() || "";

        if (!name) {
            showToast(
                "Please enter a section name.",
                "warning"
            );

            return;
        }

        if (
            name.toUpperCase() ===
            WEDDING_ALBUM_NAME
        ) {
            showToast(
                "WEDDING ALBUM is reserved for Album Selection.",
                "warning"
            );

            return;
        }

        const duplicate =
            gallery.albums.some(
                album =>
                    album.id !==
                        state.editingAlbumId &&
                    album.name
                        .trim()
                        .toLowerCase() ===
                        name.toLowerCase()
            );

        if (duplicate) {
            showToast(
                "A section with this name already exists.",
                "warning"
            );

            return;
        }

        if (state.editingAlbumId) {
            const album =
                gallery.albums.find(
                    item =>
                        item.id ===
                        state.editingAlbumId
                );

            if (!album || album.system) {
                return;
            }

            album.name = name;
            album.updatedAt =
                new Date().toISOString();

            showToast(
                "Section renamed successfully."
            );
        } else {
            gallery.albums.push({
                id: createId("album"),
                galleryId: gallery.id,
                name,
                createdAt:
                    new Date().toISOString(),
                updatedAt:
                    new Date().toISOString(),
                system: false
            });

            showToast(
                "Section created successfully."
            );
        }

        saveGalleries();

        closeAlbumModal();

        renderAlbums(gallery);
        renderWeddingAlbumStatus(gallery);
    }

    function deleteAlbum(albumId) {
        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        const album =
            gallery.albums.find(
                item => item.id === albumId
            );

        if (!album) return;

        if (album.system) {
            showToast(
                "WEDDING ALBUM cannot be deleted.",
                "warning"
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Delete the section "${album.name}"? Photos inside it will remain in the gallery but become unassigned.`
            );

        if (!confirmed) return;

        /*
         * Do not delete media.
         * Only remove the section relationship.
         */
        gallery.media.forEach(media => {
            if (media.sectionId === albumId) {
                media.sectionId = null;
                media.previousSectionId = null;
            }
        });

        gallery.albums =
            gallery.albums.filter(
                item =>
                    item.id !== albumId
            );

        syncWeddingAlbumSelection(gallery);

        saveGalleries();

        renderAlbums(gallery);
        renderMedia(gallery);
        renderModalOverview(gallery);

        showToast(
            "Section deleted successfully."
        );
    }

    /* =========================================================
       SETTINGS
    ========================================================= */

    function renderSettings(gallery) {
        if (!gallery) return;

        if (refs.passwordEnabled) {
            refs.passwordEnabled.checked =
                Boolean(
                    gallery.passwordEnabled
                );
        }

        if (refs.galleryPassword) {
            refs.galleryPassword.value =
                gallery.password || "";
        }

        if (refs.downloadsEnabled) {
            refs.downloadsEnabled.checked =
                Boolean(
                    gallery.downloadsEnabled
                );
        }

        if (refs.galleryVisible) {
            refs.galleryVisible.checked =
                Boolean(gallery.visible);
        }

        updateSettingsSummary(gallery);
    }

    function updateSettingsSummary(gallery) {
        if (refs.modalPassword) {
            refs.modalPassword.textContent =
                gallery.passwordEnabled
                    ? "Protected"
                    : "Not protected";
        }

        if (refs.modalDownloads) {
            refs.modalDownloads.textContent =
                gallery.downloadsEnabled
                    ? "Enabled"
                    : "Disabled";
        }

        if (refs.modalVisibility) {
            refs.modalVisibility.textContent =
                gallery.visible
                    ? "Visible"
                    : "Hidden";
        }
    }

    function generateGalleryPassword() {
        const chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

        let password = "";

        for (let i = 0; i < 10; i++) {
            password +=
                chars[
                    Math.floor(
                        Math.random() *
                            chars.length
                    )
                ];
        }

        if (refs.galleryPassword) {
            refs.galleryPassword.value =
                password;
        }
    }

    function saveGalleryPassword() {
        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        const enabled =
            refs.passwordEnabled
                ? refs.passwordEnabled.checked
                : false;

        const password =
            refs.galleryPassword?.value
                ?.trim() || "";

        if (enabled && !password) {
            showToast(
                "Enter a password or generate one.",
                "warning"
            );

            return;
        }

        gallery.passwordEnabled =
            enabled;

        gallery.password =
            enabled ? password : "";

        saveGalleries();

        updateSettingsSummary(gallery);

        showToast(
            enabled
                ? "Gallery password saved."
                : "Gallery password protection disabled."
        );
    }

    function saveDownloadSetting() {
        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        gallery.downloadsEnabled =
            refs.downloadsEnabled
                ? refs.downloadsEnabled.checked
                : true;

        saveGalleries();

        updateSettingsSummary(gallery);
        updateDeliveryReadiness(gallery);
    }

    function saveVisibilitySetting() {
        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        gallery.visible =
            refs.galleryVisible
                ? refs.galleryVisible.checked
                : true;

        saveGalleries();

        updateSettingsSummary(gallery);
        updateDeliveryReadiness(gallery);
    }

    /* =========================================================
       DELIVERY READINESS
    ========================================================= */

    function updateDeliveryReadiness(gallery) {
        if (!gallery) return;

        const hasName =
            Boolean(
                gallery.name?.trim()
            );

        const hasClient =
            Boolean(
                gallery.clientName?.trim()
            );

        const hasMedia =
            gallery.media.length > 0;

        const accessReady =
            gallery.visible &&
            (
                !gallery.passwordEnabled ||
                Boolean(
                    gallery.password?.trim()
                )
            );

        const storageReady =
            Number(
                gallery.storageUsedGB || 0
            ) <=
            Number(
                gallery.storageGB || 0
            );

        const ready =
            hasName &&
            hasClient &&
            hasMedia &&
            accessReady &&
            storageReady &&
            gallery.downloadsEnabled;

        if (refs.sendToClientBtn) {
            refs.sendToClientBtn.disabled =
                !ready ||
                getGalleryStatus(
                    gallery
                ) === "expired";
        }

        const readinessContainer =
            document.querySelector(
                ".delivery-readiness"
            );

        if (!readinessContainer) {
            return;
        }

        const statusElement =
            readinessContainer.querySelector(
                ".readiness-status"
            );

        if (statusElement) {
            if (
                gallery.deliveryStatus ===
                "sent"
            ) {
                statusElement.textContent =
                    "Sent to Client";
            } else if (ready) {
                statusElement.textContent =
                    "Ready to Send";
            } else {
                statusElement.textContent =
                    "Not Ready";
            }
        }
    }

    /* =========================================================
       MEDIA RENDERING
    ========================================================= */

    async function renderMedia(
        gallery,
        sectionFilter = null
    ) {
        if (!refs.mediaGrid || !gallery) {
            return;
        }

        revokeSet(state.mediaObjectUrls);

        let media = [...gallery.media];

        if (sectionFilter) {
            media = media.filter(
                item =>
                    item.sectionId ===
                    sectionFilter
            );
        }

        if (
            state.mediaFilter === "photo"
        ) {
            media = media.filter(
                item => isPhoto(item)
            );
        }

        if (
            state.mediaFilter === "video"
        ) {
            media = media.filter(
                item => isVideoMedia(item)
            );
        }

        if (!media.length) {
            refs.mediaGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fa-regular fa-images"></i>
                    </div>

                    <h3>No media found</h3>

                    <p>
                        Upload photos or videos to this gallery.
                    </p>
                </div>
            `;

            return;
        }

        const weddingAlbum =
            getWeddingAlbum(gallery);

        const weddingAlbumId =
            weddingAlbum?.id || null;

        const selectionEnabled =
            Boolean(
                gallery.albumSelection?.enabled
            );

        const selectionLocked =
            gallery.albumSelection?.status ===
                "approved" ||
            gallery.albumSelection?.status ===
                "submitted";

        const htmlParts =
            await Promise.all(
                media.map(
                    async item =>
                        buildMediaCard(
                            gallery,
                            item,
                            weddingAlbumId,
                            selectionEnabled,
                            selectionLocked
                        )
                )
            );

        refs.mediaGrid.innerHTML =
            htmlParts.join("");

        bindMediaEvents();
    }

    async function buildMediaCard(
        gallery,
        media,
        weddingAlbumId,
        selectionEnabled,
        selectionLocked
    ) {
        let mediaHTML = `
            <div class="media-placeholder">
                <i class="fa-regular fa-file"></i>
            </div>
        `;

        try {
            const record =
                await getMediaFile(
                    media.id
                );

            if (record?.blob) {
                const url =
                    URL.createObjectURL(
                        record.blob
                    );

                state.mediaObjectUrls.add(
                    url
                );

                if (isImage(media.type)) {
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

                        <span class="media-type-badge">
                            <i class="fa-solid fa-play"></i>
                        </span>
                    `;
                }
            }
        } catch (error) {
            console.warn(
                "Unable to load media:",
                error
            );
        }

        const selected =
            weddingAlbumId &&
            media.sectionId ===
                weddingAlbumId;

        let albumAction = "";

        if (
            selectionEnabled &&
            isPhoto(media)
        ) {
            if (selected) {
                albumAction = `
                    <button
                        type="button"
                        class="secondary-btn remove-from-wedding-album"
                        data-media-id="${escapeHTML(
                            media.id
                        )}"
                        ${
                            selectionLocked
                                ? "disabled"
                                : ""
                        }
                    >
                        <i class="fa-solid fa-minus"></i>
                        Remove from Album
                    </button>
                `;
            } else {
                albumAction = `
                    <button
                        type="button"
                        class="secondary-btn add-to-wedding-album"
                        data-media-id="${escapeHTML(
                            media.id
                        )}"
                        ${
                            selectionLocked
                                ? "disabled"
                                : ""
                        }
                    >
                        <i class="fa-solid fa-plus"></i>
                        Add to Wedding Album
                    </button>
                `;
            }
        }

        return `
            <article
                class="media-card ${
                    selected
                        ? "selected-for-album"
                        : ""
                }"
                data-media-id="${escapeHTML(
                    media.id
                )}"
            >
                <div class="media-preview">
                    ${mediaHTML}

                    ${
                        selected
                            ? `
                                <span class="media-selection-badge">
                                    <i class="fa-solid fa-check"></i>
                                    Album
                                </span>
                            `
                            : ""
                    }
                </div>

                <div class="media-info">
                    <h4 title="${escapeHTML(
                        media.name
                    )}">
                        ${escapeHTML(
                            media.name
                        )}
                    </h4>

                    <span>
                        ${formatGB(
                            bytesToGB(
                                media.sizeBytes
                            )
                        )}
                    </span>
                </div>

                <div class="media-card-actions">
                    ${albumAction}

                    <button
                        type="button"
                        class="icon-btn set-cover"
                        data-media-id="${escapeHTML(
                            media.id
                        )}"
                        title="Set as gallery cover"
                    >
                        <i class="fa-regular fa-star"></i>
                    </button>

                    <button
                        type="button"
                        class="icon-btn danger remove-media"
                        data-media-id="${escapeHTML(
                            media.id
                        )}"
                        title="Remove media"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>

                ${
                    media.clientComment
                        ? `
                            <div class="media-comment">
                                <i class="fa-regular fa-comment"></i>
                                ${escapeHTML(
                                    media.clientComment
                                )}
                            </div>
                        `
                        : ""
                }
            </article>
        `;
    }

    function bindMediaEvents() {
        document
            .querySelectorAll(
                ".add-to-wedding-album"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    async event => {
                        event.stopPropagation();

                        const gallery =
                            getSelectedGallery();

                        if (!gallery) return;

                        const success =
                            moveMediaToWeddingAlbum(
                                gallery.id,
                                button.dataset
                                    .mediaId
                            );

                        if (success) {
                            await renderMedia(
                                gallery
                            );

                            renderAlbums(
                                gallery
                            );

                            renderGalleryGrid();
                        }
                    }
                );
            });

        document
            .querySelectorAll(
                ".remove-from-wedding-album"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    async event => {
                        event.stopPropagation();

                        const gallery =
                            getSelectedGallery();

                        if (!gallery) return;

                        const success =
                            removeMediaFromWeddingAlbum(
                                gallery.id,
                                button.dataset
                                    .mediaId
                            );

                        if (success) {
                            await renderMedia(
                                gallery
                            );

                            renderAlbums(
                                gallery
                            );

                            renderGalleryGrid();
                        }
                    }
                );
            });

        document
            .querySelectorAll(".remove-media")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    async event => {
                        event.stopPropagation();

                        await removeMedia(
                            button.dataset
                                .mediaId
                        );
                    }
                );
            });

        document
            .querySelectorAll(".set-cover")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    async event => {
                        event.stopPropagation();

                        await setMediaAsCover(
                            button.dataset
                                .mediaId
                        );
                    }
                );
            });
    }

    /* =========================================================
       UPLOAD
    ========================================================= */

    async function uploadFiles(files) {
        const gallery =
            getSelectedGallery();

        if (!gallery) {
            showToast(
                "Open a gallery before uploading.",
                "warning"
            );

            return;
        }

        if (!files?.length) {
            return;
        }

        const selectedFiles =
            Array.from(files);

        const totalBytes =
            selectedFiles.reduce(
                (sum, file) =>
                    sum +
                    Number(file.size || 0),
                0
            );

        const currentBytes =
            gallery.media.reduce(
                (sum, media) =>
                    sum +
                    Number(
                        media.sizeBytes || 0
                    ),
                0
            );

        const limitBytes =
            Number(
                gallery.storageGB || 0
            ) *
            1024 *
            1024 *
            1024;

        if (
            currentBytes +
                totalBytes >
            limitBytes
        ) {
            showToast(
                `Upload exceeds the gallery storage limit of ${formatGB(
                    gallery.storageGB
                )}.`,
                "warning"
            );

            return;
        }

        const createdMedia = [];

        try {
            await ensureDB();

            for (const file of selectedFiles) {
                const mediaId =
                    createId("media");

                const media = normalizeMedia(
                    {
                        id: mediaId,
                        galleryId:
                            gallery.id,
                        name: file.name,
                        sizeMB:
                            bytesToMB(
                                file.size
                            ),
                        sizeBytes:
                            file.size,
                        type:
                            file.type ||
                            "application/octet-stream",
                        createdAt:
                            new Date().toISOString(),
                        sectionId: null,
                        previousSectionId:
                            null,
                        isCover: false,
                        clientComment: ""
                    },
                    gallery.id
                );

                /*
                 * Actual file goes into IndexedDB.
                 */
                await putMediaFile({
                    id: mediaId,
                    galleryId: gallery.id,
                    blob: file,
                    name: file.name,
                    type: file.type,
                    sizeBytes: file.size,
                    createdAt:
                        media.createdAt
                });

                createdMedia.push(media);
            }

            /*
             * First uploaded image becomes cover if
             * the gallery does not already have one.
             */
            const hasCover =
                gallery.media.some(
                    media =>
                        media.isCover
                );

            if (!hasCover) {
                const firstPhoto =
                    createdMedia.find(
                        media =>
                            isPhoto(media)
                    );

                if (firstPhoto) {
                    firstPhoto.isCover =
                        true;
                }
            }

            gallery.media.push(
                ...createdMedia
            );

            recalculateStorage(gallery);

            if (!saveGalleries()) {
                /*
                 * Roll back IndexedDB if metadata could
                 * not be persisted.
                 */
                await deleteMediaFiles(
                    createdMedia.map(
                        media => media.id
                    )
                );

                gallery.media =
                    gallery.media.filter(
                        media =>
                            !createdMedia.some(
                                created =>
                                    created.id ===
                                    media.id
                            )
                    );

                recalculateStorage(
                    gallery
                );

                return;
            }

            showToast(
                `${createdMedia.length} ${
                    createdMedia.length === 1
                        ? "file"
                        : "files"
                } uploaded successfully.`
            );

            await renderMedia(
                gallery
            );

            renderAlbums(gallery);
            renderModalOverview(gallery);
            renderGalleryGrid();
        } catch (error) {
            console.error(
                "Upload failed:",
                error
            );

            /*
             * Best-effort rollback.
             */
            if (createdMedia.length) {
                try {
                    await deleteMediaFiles(
                        createdMedia.map(
                            media =>
                                media.id
                        )
                    );
                } catch (_) {}
            }

            showToast(
                "Upload failed. Please try again.",
                "error"
            );
        }

        if (refs.mediaUpload) {
            refs.mediaUpload.value = "";
        }
    }

    function recalculateStorage(gallery) {
        const bytes =
            gallery.media.reduce(
                (sum, media) =>
                    sum +
                    Number(
                        media.sizeBytes || 0
                    ),
                0
            );

        gallery.storageUsedGB =
            bytesToGB(bytes);
    }

    /* =========================================================
       MEDIA DELETE
    ========================================================= */

    async function removeMedia(mediaId) {
        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        const media =
            gallery.media.find(
                item => item.id === mediaId
            );

        if (!media) return;

        const confirmed =
            window.confirm(
                `Remove "${media.name}" from this gallery?`
            );

        if (!confirmed) return;

        try {
            await deleteMediaFile(
                media.id
            );
        } catch (error) {
            console.error(
                "Failed to delete media file:",
                error
            );

            showToast(
                "The media file could not be removed.",
                "error"
            );

            return;
        }

        gallery.media =
            gallery.media.filter(
                item =>
                    item.id !== mediaId
            );

        syncWeddingAlbumSelection(
            gallery
        );

        recalculateStorage(gallery);

        saveGalleries();

        await renderMedia(
            gallery
        );

        renderAlbums(gallery);
        renderModalOverview(gallery);
        renderGalleryGrid();

        showToast(
            "Media removed successfully."
        );
    }

    /* =========================================================
       COVER
    ========================================================= */

    async function setMediaAsCover(
        mediaId
    ) {
        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        const media =
            gallery.media.find(
                item =>
                    item.id === mediaId
            );

        if (!media) return;

        if (!isPhoto(media)) {
            showToast(
                "Only photos can be used as the gallery cover.",
                "warning"
            );

            return;
        }

        gallery.media.forEach(item => {
            item.isCover =
                item.id === mediaId;
        });

        saveGalleries();

        showToast(
            "Gallery cover updated."
        );

        renderGalleryGrid();
        await renderMedia(gallery);
    }

    /* =========================================================
       CLIENT LINK
    ========================================================= */

    async function copyGalleryLink() {
        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        try {
            await navigator.clipboard.writeText(
                gallery.galleryLink
            );

            showToast(
                "Client gallery link copied."
            );
        } catch (error) {
            /*
             * Fallback for browsers where
             * clipboard API is unavailable.
             */
            if (refs.galleryClientLink) {
                refs.galleryClientLink.select();

                try {
                    document.execCommand(
                        "copy"
                    );

                    showToast(
                        "Client gallery link copied."
                    );
                } catch (_) {
                    showToast(
                        "Unable to copy the link.",
                        "error"
                    );
                }
            }
        }
    }

    /* =========================================================
       SEND TO CLIENT
    ========================================================= */

    function sendGalleryToClient() {
        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        updateDeliveryReadiness(
            gallery
        );

        const hasName =
            Boolean(
                gallery.name?.trim()
            );

        const hasClient =
            Boolean(
                gallery.clientName?.trim()
            );

        const hasMedia =
            gallery.media.length > 0;

        const accessReady =
            gallery.visible &&
            (
                !gallery.passwordEnabled ||
                Boolean(
                    gallery.password?.trim()
                )
            );

        const storageReady =
            Number(
                gallery.storageUsedGB || 0
            ) <=
            Number(
                gallery.storageGB || 0
            );

        const ready =
            hasName &&
            hasClient &&
            hasMedia &&
            accessReady &&
            storageReady &&
            gallery.downloadsEnabled;

        if (!ready) {
            showToast(
                "Complete the gallery setup before sending it to the client.",
                "warning"
            );

            return;
        }

        if (
            getGalleryStatus(
                gallery
            ) === "expired"
        ) {
            showToast(
                "This gallery has expired.",
                "warning"
            );

            return;
        }

        gallery.deliveryStatus =
            "sent";

        gallery.sentAt =
            new Date().toISOString();

        /*
         * Sending to the client automatically makes
         * the gallery visible.
         */
        gallery.visible = true;

        saveGalleries();

        renderSettings(gallery);
        renderModalOverview(gallery);
        renderGalleryGrid();

        showToast(
            "Gallery marked as sent to client."
        );
    }

    /* =========================================================
       DELETE GALLERY
    ========================================================= */

    async function deleteSelectedGallery() {
        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        const confirmed =
            window.confirm(
                `Delete "${gallery.name}" permanently? This will remove all gallery media.`
            );

        if (!confirmed) return;

        try {
            await deleteMediaFiles(
                gallery.media.map(
                    media => media.id
                )
            );
        } catch (error) {
            console.error(
                "Failed deleting gallery media:",
                error
            );

            showToast(
                "Some media files could not be removed.",
                "error"
            );
        }

        state.galleries =
            state.galleries.filter(
                item =>
                    item.id !== gallery.id
            );

        saveGalleries();

        closeGalleryModal();

        renderStats();
        await renderGalleryGrid();

        showToast(
            "Gallery deleted successfully."
        );
    }

    /* =========================================================
       TABS
    ========================================================= */

    function switchTab(tabName) {
        state.activeTab =
            tabName;

        const tabs =
            document.querySelectorAll(
                "[data-tab]"
            );

        tabs.forEach(tab => {
            tab.classList.toggle(
                "active",
                tab.dataset.tab ===
                    tabName
            );
        });

        const contents =
            document.querySelectorAll(
                ".tab-content"
            );

        contents.forEach(content => {
            content.classList.toggle(
                "active",
                content.id ===
                    `tab-${tabName}`
            );
        });

        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        if (tabName === "overview") {
            renderModalOverview(
                gallery
            );
        }

        if (tabName === "media") {
            renderMedia(gallery);
        }

        if (tabName === "sections") {
            renderAlbums(gallery);
        }

        if (tabName === "settings") {
            renderSettings(gallery);
        }
    }

    /* =========================================================
       MEDIA FILTER
    ========================================================= */

    function setMediaFilter(filter) {
        state.mediaFilter =
            filter || "all";

        const gallery =
            getSelectedGallery();

        if (!gallery) return;

        renderMedia(gallery);
    }

    /* =========================================================
       QUICK ACTIONS
    ========================================================= */

    function quickUpload() {
        switchTab("media");

        setTimeout(() => {
            refs.mediaUpload?.click();
        }, 100);
    }

    function quickCreateAlbum() {
        switchTab("sections");
        openAlbumModal();
    }

    /* =========================================================
       SEARCH / FILTER
    ========================================================= */

    function handleSearch() {
        state.searchTerm =
            refs.gallerySearch?.value
                ?.trim() || "";

        renderGalleryGrid();
    }

    function handleGalleryFilter() {
        renderGalleryGrid();
    }

    /* =========================================================
       MOBILE MENU
    ========================================================= */

    function toggleMobileMenu() {
        refs.sidebar?.classList.toggle(
            "open"
        );
    }

    /* =========================================================
       EVENT LISTENERS
    ========================================================= */

    function bindEvents() {
        refs.closeGalleryModal?.addEventListener(
            "click",
            closeGalleryModal
        );

        refs.galleryModal?.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    refs.galleryModal
                ) {
                    closeGalleryModal();
                }
            }
        );

        document
            .querySelectorAll("[data-tab]")
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

        refs.gallerySearch?.addEventListener(
            "input",
            handleSearch
        );

        refs.galleryFilter?.addEventListener(
            "change",
            handleGalleryFilter
        );

        refs.mediaUpload?.addEventListener(
            "change",
            event => {
                uploadFiles(
                    event.target.files
                );
            }
        );

        refs.uploadMediaBtn?.addEventListener(
            "click",
            () => {
                refs.mediaUpload?.click();
            }
        );

        refs.quickUploadBtn?.addEventListener(
            "click",
            quickUpload
        );

        refs.quickAlbumBtn?.addEventListener(
            "click",
            quickCreateAlbum
        );

        refs.createAlbumBtn?.addEventListener(
            "click",
            () => openAlbumModal()
        );

        refs.cancelAlbum?.addEventListener(
            "click",
            closeAlbumModal
        );

        refs.albumForm?.addEventListener(
            "submit",
            saveAlbum
        );

        refs.albumModal?.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    refs.albumModal
                ) {
                    closeAlbumModal();
                }
            }
        );

        refs.generatePassword?.addEventListener(
            "click",
            generateGalleryPassword
        );

        refs.savePassword?.addEventListener(
            "click",
            saveGalleryPassword
        );

        refs.downloadsEnabled?.addEventListener(
            "change",
            saveDownloadSetting
        );

        refs.galleryVisible?.addEventListener(
            "change",
            saveVisibilitySetting
        );

        refs.copyGalleryLink?.addEventListener(
            "click",
            copyGalleryLink
        );

        refs.sendToClientBtn?.addEventListener(
            "click",
            sendGalleryToClient
        );

        refs.deleteGalleryBtn?.addEventListener(
            "click",
            deleteSelectedGallery
        );

        refs.mobileMenuBtn?.addEventListener(
            "click",
            toggleMobileMenu
        );

        /*
         * Drag/drop upload support using the existing
         * media upload area.
         */
        const uploadZone =
            document.querySelector(
                ".media-upload-zone"
            );

        if (uploadZone) {
            uploadZone.addEventListener(
                "dragover",
                event => {
                    event.preventDefault();

                    uploadZone.classList.add(
                        "dragover"
                    );
                }
            );

            uploadZone.addEventListener(
                "dragleave",
                () => {
                    uploadZone.classList.remove(
                        "dragover"
                    );
                }
            );

            uploadZone.addEventListener(
                "drop",
                event => {
                    event.preventDefault();

                    uploadZone.classList.remove(
                        "dragover"
                    );

                    uploadFiles(
                        event.dataTransfer
                            .files
                    );
                }
            );
        }

        /*
         * Existing media filter controls.
         */
        document
            .querySelectorAll(
                "[data-media-filter]"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        document
                            .querySelectorAll(
                                "[data-media-filter]"
                            )
                            .forEach(item =>
                                item.classList.remove(
                                    "active"
                                )
                            );

                        button.classList.add(
                            "active"
                        );

                        setMediaFilter(
                            button.dataset
                                .mediaFilter
                        );
                    }
                );
            });

        /*
         * Keyboard handling.
         */
        document.addEventListener(
            "keydown",
            event => {
                if (
                    event.key === "Escape"
                ) {
                    if (
                        refs.albumModal?.classList.contains(
                            "open"
                        )
                    ) {
                        closeAlbumModal();
                        return;
                    }

                    if (
                        refs.galleryModal?.classList.contains(
                            "open"
                        )
                    ) {
                        closeGalleryModal();
                    }
                }
            }
        );

        /*
         * Existing storage event.
         */
        window.addEventListener(
            "storage",
            event => {
                if (
                    event.key ===
                    STORAGE_KEY
                ) {
                    loadGalleries();

                    renderStats();
                    renderGalleryGrid();

                    const gallery =
                        getSelectedGallery();

                    if (gallery) {
                        syncWeddingAlbumSelection(
                            gallery
                        );

                        renderModalHeader(
                            gallery
                        );

                        renderModalOverview(
                            gallery
                        );

                        renderAlbums(
                            gallery
                        );

                        renderSettings(
                            gallery
                        );

                        renderWeddingAlbumStatus(
                            gallery
                        );

                        renderMedia(
                            gallery
                        );
                    }
                }
            }
        );

        /*
         * Same-tab synchronization.
         */
        window.addEventListener(
            "professionalStudioClientGalleriesUpdated",
            () => {
                loadGalleries();

                renderStats();
                renderGalleryGrid();

                const gallery =
                    getSelectedGallery();

                if (gallery) {
                    syncWeddingAlbumSelection(
                        gallery
                    );

                    renderModalHeader(
                        gallery
                    );

                    renderModalOverview(
                        gallery
                    );

                    renderAlbums(
                        gallery
                    );

                    renderSettings(
                        gallery
                    );

                    renderWeddingAlbumStatus(
                        gallery
                    );
                }
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

        getGallery(id) {
            return getGalleryById(id);
        },

        getSelectedGallery() {
            return getSelectedGallery();
        },

        getWeddingAlbum(galleryId) {
            const gallery =
                getGalleryById(
                    galleryId
                );

            return getWeddingAlbum(
                gallery
            );
        },

        getWeddingAlbumMedia(
            galleryId
        ) {
            const gallery =
                getGalleryById(
                    galleryId
                );

            return getWeddingAlbumMedia(
                gallery
            );
        },

        enableWeddingAlbum(
            galleryId,
            maxSelections = null
        ) {
            return enableWeddingAlbumSelection(
                galleryId,
                maxSelections
            );
        },

        disableWeddingAlbum(
            galleryId
        ) {
            return disableWeddingAlbumSelection(
                galleryId
            );
        },

        setWeddingAlbumLimit(
            galleryId,
            maxSelections
        ) {
            return setWeddingAlbumLimit(
                galleryId,
                maxSelections
            );
        },

        moveToWeddingAlbum(
            galleryId,
            mediaId
        ) {
            const result =
                moveMediaToWeddingAlbum(
                    galleryId,
                    mediaId
                );

            if (result) {
                const gallery =
                    getGalleryById(
                        galleryId
                    );

                if (
                    gallery &&
                    state.selectedGalleryId ===
                        galleryId
                ) {
                    renderMedia(
                        gallery
                    );

                    renderAlbums(
                        gallery
                    );

                    renderGalleryGrid();
                }
            }

            return result;
        },

        removeFromWeddingAlbum(
            galleryId,
            mediaId
        ) {
            const result =
                removeMediaFromWeddingAlbum(
                    galleryId,
                    mediaId
                );

            if (result) {
                const gallery =
                    getGalleryById(
                        galleryId
                    );

                if (
                    gallery &&
                    state.selectedGalleryId ===
                        galleryId
                ) {
                    renderMedia(
                        gallery
                    );

                    renderAlbums(
                        gallery
                    );

                    renderGalleryGrid();
                }
            }

            return result;
        },

        approveWeddingAlbum(
            galleryId
        ) {
            return approveWeddingAlbumSelection(
                galleryId
            );
        },

        reopenWeddingAlbum(
            galleryId
        ) {
            return reopenWeddingAlbumSelection(
                galleryId
            );
        },

        addClientComment(
            galleryId,
            mediaId,
            comment
        ) {
            return addClientComment(
                galleryId,
                mediaId,
                comment
            );
        },

        async getMediaBlob(
            mediaId
        ) {
            const record =
                await getMediaFile(
                    mediaId
                );

            return record?.blob || null;
        },

        refresh() {
            loadGalleries();
            renderStats();
            return renderGalleryGrid();
        }
    };

    /* =========================================================
       INITIALIZATION
    ========================================================= */

    async function init() {
        try {
            await ensureDB();
        } catch (error) {
            console.error(
                "IndexedDB initialization failed:",
                error
            );

            showToast(
                "Gallery storage could not be initialized. Media uploads may not work.",
                "error"
            );
        }

        loadGalleries();

        /*
         * IMPORTANT:
         * This processes the object handed over by
         * Gallery Shop.
         */
        processPendingPurchase();

        /*
         * Normalize old gallery structures and make sure
         * WEDDING ALBUM exists.
         */
        let changed = false;

        state.galleries =
            state.galleries.map(gallery => {
                const before =
                    JSON.stringify(
                        gallery
                    );

                const normalized =
                    normalizeGallery(
                        gallery
                    );

                const after =
                    JSON.stringify(
                        normalized
                    );

                if (before !== after) {
                    changed = true;
                }

                return normalized;
            });

        if (changed) {
            saveGalleries();
        }

        bindEvents();

        await renderPage();
    }

    /*
     * Wait until DOM is ready.
     */
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