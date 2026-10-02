/* =========================================================
   PROFESSIONAL STUDIO
   CLIENT GALLERIES
   Frontend gallery controller

   Storage:
   - Gallery metadata: localStorage
   - Uploaded File/Blob data: IndexedDB when available
   - Existing legacy data URLs / URLs remain supported
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const STORAGE_KEY = "professionalStudioGalleries";
    const PENDING_PURCHASE_KEY = "professionalStudioPendingGallery";
    const DB_NAME = "professionalStudioGalleryMedia";
    const DB_VERSION = 1;
    const MEDIA_STORE = "media";
    const EXPIRING_DAYS = 30;
    const DEFAULT_STORAGE_GB = 10;
    const DEFAULT_DURATION_MONTHS = 6;

    const $ = id => document.getElementById(id);

    const refs = {
        galleryGrid: $("galleryGrid"),
        emptyState: $("emptyState"),
        gallerySearch: $("gallerySearch"),
        statusFilter: $("statusFilter"),
        totalGalleries: $("totalGalleries"),
        activeGalleries: $("activeGalleries"),
        totalStorage: $("totalStorage"),
        expiringGalleries: $("expiringGalleries"),

        galleryModal: $("galleryModal"),
        closeGalleryModal: $("closeGalleryModal"),

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

        mediaUpload: $("mediaUpload"),
        uploadZone: $("uploadZone"),
        mediaCount: $("mediaCount"),
        mediaFilter: $("mediaFilter"),
        mediaGrid: $("mediaGrid"),

        albumsGrid: $("albumsGrid"),
        createAlbumBtn: $("createAlbumBtn"),

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
        closeAlbumModal: $("closeAlbumModal"),
        cancelAlbum: $("cancelAlbum"),
        albumForm: $("albumForm"),
        albumName: $("albumName"),

        toast: $("toast"),
        toastMessage: $("toastMessage"),

        deliveryStatus: $("deliveryStatus"),
        deliveryMessage: $("deliveryMessage"),
        deliveryExpiry: $("deliveryExpiry"),
        sendToClientBtn: $("sendToClientBtn"),

        checkGalleryName: $("checkGalleryName"),
        checkMedia: $("checkMedia"),
        checkPassword: $("checkPassword"),
        checkDownloads: $("checkDownloads"),
        checkStorage: $("checkStorage"),

        mobileMenuBtn: $("mobileMenuBtn"),
        mobileMenu: $("mobileMenu")
    };

    const state = {
        galleries: [],
        selectedGalleryId: null,
        activeTab: "overview",
        mediaFilter: "all",
        toastTimer: null,
        db: null,
        objectUrls: new Map()
    };


    /* =========================================================
       SAFE STORAGE
    ========================================================= */

    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);

            if (!raw) {
                return fallback;
            }

            const value = JSON.parse(raw);

            return value ?? fallback;

        } catch (error) {
            console.error(`Could not read ${key}:`, error);
            return fallback;
        }
    }


    function writeJSON(key, value) {
        try {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {
            console.error(`Could not save ${key}:`, error);

            showToast(
                "Could not save the gallery. Storage may be full."
            );

            return false;
        }
    }


    function loadGalleries() {
        const raw = readJSON(
            STORAGE_KEY,
            []
        );

        let list = raw;

        if (
            raw &&
            !Array.isArray(raw) &&
            Array.isArray(raw.galleries)
        ) {
            list = raw.galleries;
        }

        if (!Array.isArray(list)) {
            return [];
        }

        return list.map(
            normalizeGallery
        );
    }


    function saveGalleries() {
        return writeJSON(
            STORAGE_KEY,
            state.galleries
        );
    }


    /* =========================================================
       NORMALIZATION / BACKWARD COMPATIBILITY
    ========================================================= */

    function makeId(prefix = "id") {

        if (
            window.crypto &&
            typeof crypto.randomUUID === "function"
        ) {
            return `${prefix}_${crypto.randomUUID()}`;
        }

        return (
            `${prefix}_` +
            `${Date.now()}_` +
            `${Math.random()
                .toString(36)
                .slice(2, 9)}`
        );
    }


    function number(value, fallback = 0) {

        const n = Number(value);

        return Number.isFinite(n)
            ? n
            : fallback;
    }


    function normalizeGallery(input) {

        const gallery =
            input &&
            typeof input === "object"
                ? { ...input }
                : {};

        const now =
            new Date().toISOString();

        gallery.id =
            String(
                gallery.id ||
                makeId("gallery")
            );

        gallery.name =
            String(
                gallery.name ||
                gallery.galleryName ||
                gallery.title ||
                "Untitled Gallery"
            ).trim();

        gallery.clientName =
            String(
                gallery.clientName ||
                gallery.client ||
                "New Client"
            ).trim();

        gallery.description =
            String(
                gallery.description || ""
            );

        gallery.storageGB =
            number(
                gallery.storageGB ??
                gallery.storageLimitGB ??
                gallery.storageLimit,
                DEFAULT_STORAGE_GB
            );

        gallery.durationMonths =
            number(
                gallery.durationMonths ??
                gallery.duration ??
                DEFAULT_DURATION_MONTHS,
                DEFAULT_DURATION_MONTHS
            );

        gallery.createdAt =
            gallery.createdAt ||
            now;

        gallery.expiresAt =
            gallery.expiresAt ||
            gallery.expiryDate ||
            addMonths(
                gallery.createdAt,
                gallery.durationMonths
            ).toISOString();

        gallery.storageUsedGB =
            calculateStorageGB(
                gallery
            );

        gallery.galleryLink =
            String(
                gallery.galleryLink ||
                gallery.link ||
                buildGalleryLink(
                    gallery.id
                )
            );

        gallery.password =
            String(
                gallery.password || ""
            );

        gallery.passwordEnabled =
            gallery.passwordEnabled !== false;

        gallery.downloadsEnabled =
            gallery.downloadsEnabled !== false;

        gallery.visible =
            gallery.visible !== false;

        gallery.deliveryStatus =
            gallery.deliveryStatus ||
            gallery.delivery ||
            "draft";

        gallery.sentAt =
            gallery.sentAt ||
            null;

        gallery.downloads =
            number(
                gallery.downloads,
                0
            );

        gallery.views =
            number(
                gallery.views,
                0
            );

        gallery.media =
            Array.isArray(gallery.media)
                ? gallery.media.map(
                    normalizeMedia
                )
                : [];

        gallery.albums =
            Array.isArray(gallery.albums)
                ? gallery.albums.map(
                    normalizeAlbum
                )
                : [];

        if (!gallery.albums.length) {

            gallery.albums.push({
                id: makeId("album"),
                name: "Highlights",
                description: "",
                createdAt: now
            });

        }

        gallery.media.forEach(
            media => {

                if (
                    !media.sectionId &&
                    gallery.albums[0]
                ) {
                    media.sectionId =
                        gallery.albums[0].id;
                }

            }
        );

        return gallery;
    }


    function normalizeMedia(input) {

        const item =
            input &&
            typeof input === "object"
                ? { ...input }
                : {};

        item.id =
            String(
                item.id ||
                makeId("media")
            );

        item.name =
            String(
                item.name ||
                item.fileName ||
                "Media"
            );

        item.type =
            String(
                item.type ||
                item.mimeType ||
                "image/jpeg"
            ).toLowerCase();

        item.sizeBytes =
            number(
                item.sizeBytes ??
                item.size,
                0
            );

        item.size =
            item.sizeBytes;

        item.sectionId =
            item.sectionId ||
            item.albumId ||
            null;

        item.createdAt =
            item.createdAt ||
            new Date().toISOString();

        item.storageKey =
            item.storageKey ||
            item.blobKey ||
            null;

        item.url =
            item.url ||
            item.dataUrl ||
            item.previewUrl ||
            "";

        item.dataUrl =
            item.dataUrl ||
            "";

        item.width =
            number(
                item.width,
                0
            );

        item.height =
            number(
                item.height,
                0
            );

        item.duration =
            number(
                item.duration,
                0
            );

        return item;
    }


    function normalizeAlbum(input) {

        const album =
            input &&
            typeof input === "object"
                ? { ...input }
                : {};

        album.id =
            String(
                album.id ||
                makeId("album")
            );

        album.name =
            String(
                album.name ||
                album.title ||
                "Section"
            ).trim();

        album.description =
            String(
                album.description || ""
            );

        album.createdAt =
            album.createdAt ||
            new Date().toISOString();

        return album;
    }


    function calculateStorageGB(gallery) {

        const media =
            Array.isArray(gallery.media)
                ? gallery.media
                : [];

        const bytes =
            media.reduce(
                (sum, item) =>
                    sum +
                    number(
                        item.sizeBytes ??
                        item.size,
                        0
                    ),
                0
            );

        if (bytes > 0) {
            return bytes /
                (1024 ** 3);
        }

        return number(
            gallery.storageUsedGB,
            0
        );
    }


    function refreshStorage(gallery) {

        gallery.storageUsedGB =
            calculateStorageGB(
                gallery
            );
    }


    /* =========================================================
       DATES / STATUS
    ========================================================= */

    function addMonths(
        dateValue,
        months
    ) {

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return new Date();
        }

        const day =
            date.getDate();

        date.setDate(1);

        date.setMonth(
            date.getMonth() +
            Number(months || 0)
        );

        const lastDay =
            new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0
            ).getDate();

        date.setDate(
            Math.min(
                day,
                lastDay
            )
        );

        return date;
    }


    function daysRemaining(
        dateValue
    ) {

        const expiry =
            new Date(dateValue);

        if (
            Number.isNaN(
                expiry.getTime()
            )
        ) {
            return 0;
        }

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        expiry.setHours(
            0,
            0,
            0,
            0
        );

        return Math.ceil(
            (expiry - today) /
            86400000
        );
    }


    function getGalleryStatus(
        gallery
    ) {

        const days =
            daysRemaining(
                gallery.expiresAt
            );

        if (days <= 0) {
            return "expired";
        }

        if (
            days <= EXPIRING_DAYS
        ) {
            return "expiring";
        }

        return "active";
    }


    function statusLabel(
        status
    ) {

        return {
            active: "ACTIVE",
            expiring: "EXPIRING SOON",
            expired: "EXPIRED"
        }[status] ||
            String(
                status
            ).toUpperCase();
    }


    function deliveryState(
        gallery
    ) {

        if (
            getGalleryStatus(
                gallery
            ) === "expired"
        ) {
            return "expired";
        }

        if (
            gallery.deliveryStatus ===
            "sent"
        ) {
            return "sent";
        }

        return isReady(gallery)
            ? "ready"
            : "preparing";
    }


    function isReady(
        gallery
    ) {

        const storageOk =
            gallery.storageGB > 0 &&
            gallery.storageUsedGB <=
                gallery.storageGB;

        const accessOk =
            gallery.visible === true &&
            (
                !gallery.passwordEnabled ||
                gallery.password
                    .trim()
                    .length >= 4
            );

        return Boolean(
            gallery.name.trim() &&
            gallery.clientName.trim() &&
            gallery.media.length > 0 &&
            accessOk &&
            typeof gallery.downloadsEnabled ===
                "boolean" &&
            storageOk &&
            getGalleryStatus(
                gallery
            ) !== "expired"
        );
    }


    function formatDate(
        value
    ) {

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ).format(date);
    }


    function formatBytes(
        bytes
    ) {

        const value =
            number(
                bytes,
                0
            );

        if (
            value < 1024
        ) {
            return `${value} B`;
        }

        if (
            value < 1024 ** 2
        ) {
            return `${(
                value / 1024
            ).toFixed(1)} KB`;
        }

        if (
            value < 1024 ** 3
        ) {
            return `${(
                value / 1024 ** 2
            ).toFixed(1)} MB`;
        }

        return `${(
            value / 1024 ** 3
        ).toFixed(2)} GB`;
    }


    function formatGB(
        value
    ) {

        const n =
            number(
                value,
                0
            );

        if (
            n < 0.01 &&
            n > 0
        ) {
            return "<0.01 GB";
        }

        return `${n.toFixed(
            n < 10
                ? 2
                : 1
        )} GB`;
    }


    function formatCount(
        value,
        singular,
        plural = `${singular}s`
    ) {

        const n =
            number(
                value,
                0
            );

        return `${n} ${
            n === 1
                ? singular
                : plural
        }`;
    }


    /* =========================================================
       LINKS / PASSWORDS
    ========================================================= */

    function buildGalleryLink(
        id
    ) {

        const path =
            "client-gallery-view.html";

        return `${
            window.location.origin
        }/${path}?gallery=${
            encodeURIComponent(id)
        }`;
    }


    function generatePasswordValue() {

        const alphabet =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

        let result = "";

        for (
            let i = 0;
            i < 8;
            i++
        ) {
            result +=
                alphabet[
                    Math.floor(
                        Math.random() *
                        alphabet.length
                    )
                ];
        }

        return result;
    }


    /* =========================================================
       GALLERY SHOP HANDOFF
    ========================================================= */

    function processPendingPurchase() {

        const pending =
            readJSON(
                PENDING_PURCHASE_KEY,
                null
            );

        if (
            !pending ||
            typeof pending !== "object"
        ) {
            return false;
        }

        const purchaseId =
            pending.purchaseId ||
            pending.id ||
            null;

        if (
            purchaseId &&
            state.galleries.some(
                gallery =>
                    gallery.purchaseId ===
                    purchaseId
            )
        ) {

            localStorage.removeItem(
                PENDING_PURCHASE_KEY
            );

            return false;
        }

        const createdAt =
            new Date().toISOString();

        const durationMonths =
            number(
                pending.durationMonths,
                DEFAULT_DURATION_MONTHS
            );

        const gallery =
            normalizeGallery({
                id: makeId("gallery"),

                purchaseId:
                    purchaseId ||
                    makeId("purchase"),

                name:
                    pending.galleryName ||
                    pending.name ||
                    "New Client Gallery",

                clientName:
                    pending.clientName ||
                    "",

                description:
                    pending.description ||
                    "",

                storageGB:
                    number(
                        pending.storageGB,
                        DEFAULT_STORAGE_GB
                    ),

                durationMonths,

                createdAt,

                expiresAt:
                    pending.expiresAt ||
                    addMonths(
                        createdAt,
                        durationMonths
                    ).toISOString(),

                password:
                    pending.password ||
                    generatePasswordValue(),

                passwordEnabled:
                    pending.passwordEnabled !==
                    false,

                downloadsEnabled:
                    pending.downloadsEnabled !==
                    false,

                visible:
                    pending.visible !==
                    false,

                deliveryStatus:
                    "draft",

                media: [],

                albums: []
            });

        gallery.source =
            pending.source ||
            "gallery-shop";

        gallery.paymentStatus =
            pending.paymentStatus ||
            "frontend-confirmed";

        gallery.purchaseStatus =
            pending.status ||
            "purchased";

        state.galleries.unshift(
            gallery
        );

        saveGalleries();

        localStorage.removeItem(
            PENDING_PURCHASE_KEY
        );

        showToast(
            "Gallery purchased and added to My Galleries."
        );

        return true;
    }


    /* =========================================================
       INDEXED DB FOR FILE BLOBS
    ========================================================= */

    function openMediaDB() {

        if (
            !("indexedDB" in window)
        ) {
            return Promise.resolve(
                null
            );
        }

        return new Promise(
            resolve => {

                const request =
                    indexedDB.open(
                        DB_NAME,
                        DB_VERSION
                    );

                request.onupgradeneeded =
                    () => {

                        const db =
                            request.result;

                        if (
                            !db.objectStoreNames.contains(
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
                    () =>
                        resolve(
                            request.result
                        );

                request.onerror =
                    () =>
                        resolve(
                            null
                        );
            }
        );
    }


    function putBlob(
        id,
        blob
    ) {

        if (
            !state.db ||
            !blob
        ) {
            return Promise.resolve(
                false
            );
        }

        return new Promise(
            resolve => {

                try {

                    const tx =
                        state.db.transaction(
                            MEDIA_STORE,
                            "readwrite"
                        );

                    tx.objectStore(
                        MEDIA_STORE
                    ).put({
                        id,
                        blob
                    });

                    tx.oncomplete =
                        () => resolve(true);

                    tx.onerror =
                        () => resolve(false);

                } catch (_) {

                    resolve(false);

                }
            }
        );
    }


    function getBlob(
        id
    ) {

        if (
            !state.db ||
            !id
        ) {
            return Promise.resolve(
                null
            );
        }

        return new Promise(
            resolve => {

                try {

                    const tx =
                        state.db.transaction(
                            MEDIA_STORE,
                            "readonly"
                        );

                    const request =
                        tx.objectStore(
                            MEDIA_STORE
                        ).get(id);

                    request.onsuccess =
                        () =>
                            resolve(
                                request.result?.blob ||
                                null
                            );

                    request.onerror =
                        () =>
                            resolve(
                                null
                            );

                } catch (_) {

                    resolve(null);

                }
            }
        );
    }


    function deleteBlob(
        id
    ) {

        if (
            !state.db ||
            !id
        ) {
            return Promise.resolve(
                false
            );
        }

        return new Promise(
            resolve => {

                try {

                    const tx =
                        state.db.transaction(
                            MEDIA_STORE,
                            "readwrite"
                        );

                    tx.objectStore(
                        MEDIA_STORE
                    ).delete(id);

                    tx.oncomplete =
                        () => resolve(true);

                    tx.onerror =
                        () => resolve(false);

                } catch (_) {

                    resolve(false);

                }
            }
        );
    }


    async function getMediaSource(
        media
    ) {

        if (media.url) {
            return media.url;
        }

        if (
            !media.storageKey
        ) {
            return "";
        }

        const cached =
            state.objectUrls.get(
                media.storageKey
            );

        if (cached) {
            return cached;
        }

        const blob =
            await getBlob(
                media.storageKey
            );

        if (!blob) {
            return "";
        }

        const url =
            URL.createObjectURL(
                blob
            );

        state.objectUrls.set(
            media.storageKey,
            url
        );

        return url;
    }


    function revokeObjectUrls() {

        state.objectUrls.forEach(
            url =>
                URL.revokeObjectURL(
                    url
                )
        );

        state.objectUrls.clear();
    }


    /* =========================================================
       STATS / GRID
    ========================================================= */

    function renderStats() {

        const total =
            state.galleries.length;

        let active = 0;
        let expiring = 0;
        let storage = 0;

        state.galleries.forEach(
            gallery => {

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

                if (
                    status === "expiring"
                ) {
                    expiring++;
                }

                storage +=
                    number(
                        gallery.storageUsedGB,
                        0
                    );
            }
        );

        if (
            refs.totalGalleries
        ) {
            refs.totalGalleries.textContent =
                total;
        }

        if (
            refs.activeGalleries
        ) {
            refs.activeGalleries.textContent =
                active;
        }

        if (
            refs.expiringGalleries
        ) {
            refs.expiringGalleries.textContent =
                expiring;
        }

        if (
            refs.totalStorage
        ) {
            refs.totalStorage.textContent =
                formatGB(storage);
        }
    }


    function getFilteredGalleries() {

        const query =
            String(
                refs.gallerySearch?.value ||
                ""
            )
                .trim()
                .toLowerCase();

        const filter =
            refs.statusFilter?.value ||
            "all";

        return state.galleries
            .slice()
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt
                    ) -
                    new Date(
                        a.createdAt
                    )
            )
            .filter(
                gallery => {

                    const haystack =
                        [
                            gallery.name,
                            gallery.clientName,
                            gallery.description
                        ]
                            .join(" ")
                            .toLowerCase();

                    const matchesSearch =
                        !query ||
                        haystack.includes(
                            query
                        );

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


    function renderGalleryGrid() {

        if (
            !refs.galleryGrid ||
            !refs.emptyState
        ) {
            return;
        }

        refs.galleryGrid.innerHTML =
            "";

        if (
            !state.galleries.length
        ) {

            refs.emptyState.hidden =
                false;

            refs.galleryGrid.hidden =
                true;

            return;
        }

        refs.emptyState.hidden =
            true;

        refs.galleryGrid.hidden =
            false;

        const filtered =
            getFilteredGalleries();

        if (
            !filtered.length
        ) {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "empty-state";

            wrapper.innerHTML = `
                <div class="empty-icon">⌕</div>
                <h3>No galleries found.</h3>
                <p>Try a different search or status filter.</p>
            `;

            refs.galleryGrid.appendChild(
                wrapper
            );

            return;
        }

        filtered.forEach(
            gallery =>
                refs.galleryGrid.appendChild(
                    createGalleryCard(
                        gallery
                    )
                )
        );
    }


    function createGalleryCard(
        gallery
    ) {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "gallery-card";

        card.dataset.id =
            gallery.id;

        const status =
            getGalleryStatus(
                gallery
            );

        const days =
            daysRemaining(
                gallery.expiresAt
            );

        const storagePercent =
            gallery.storageGB > 0
                ? Math.min(
                    100,
                    (
                        gallery.storageUsedGB /
                        gallery.storageGB
                    ) * 100
                )
                : 0;

        const cover =
            getCoverMedia(
                gallery
            );

        const coverMarkup =
            cover
                ? `
                    <img
                        class="gallery-cover-image"
                        src="${escapeAttr(
                            cover.url || ""
                        )}"
                        alt="${escapeAttr(
                            gallery.name
                        )}"
                    >
                `
                : `
                    <div
                        class="gallery-cover-icon"
                        aria-hidden="true">
                        ▧
                    </div>
                `;

        card.innerHTML = `
            <div class="gallery-cover">
                ${coverMarkup}

                <span
                    class="gallery-status ${status}">
                    ${statusLabel(status)}
                </span>
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
                                gallery.clientName ||
                                "No client assigned"
                            )}
                        </p>

                    </div>

                    <span
                        class="gallery-card-menu"
                        aria-hidden="true">
                        •••
                    </span>

                </div>

                <div class="gallery-card-meta">

                    <div>
                        <span>MEDIA</span>

                        <strong>
                            ${gallery.media.length}
                        </strong>
                    </div>

                    <div>
                        <span>EXPIRES</span>

                        <strong>
                            ${
                                status === "expired"
                                    ? "Expired"
                                    : `${days} days`
                            }
                        </strong>
                    </div>

                </div>

                <div class="gallery-card-footer">

                    <span class="storage-mini">
                        ${formatGB(
                            gallery.storageUsedGB
                        )}
                        /
                        ${gallery.storageGB}
                        GB ·
                        ${Math.round(
                            storagePercent
                        )}%
                    </span>

                    <button
                        type="button"
                        class="manage-btn">
                        Manage
                    </button>

                </div>

            </div>
        `;

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

                openGallery(
                    gallery.id
                );
            }
        );

        card.querySelector(
            ".manage-btn"
        )?.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openGallery(
                    gallery.id
                );
            }
        );

        return card;
    }


    function getCoverMedia(
        gallery
    ) {

        const media =
            gallery.media.find(
                item =>
                    isImage(item)
            ) ||
            gallery.media[0];

        if (!media) {
            return null;
        }

        const url =
            media.url ||
            state.objectUrls.get(
                media.storageKey
            ) ||
            "";

        return {
            ...media,
            url
        };
    }


    /* =========================================================
       MODAL / TABS
    ========================================================= */

    function getSelectedGallery() {

        return state.galleries.find(
            gallery =>
                gallery.id ===
                state.selectedGalleryId
        ) || null;
    }


    function openGallery(
        id
    ) {

        const gallery =
            state.galleries.find(
                item =>
                    item.id === id
            );

        if (!gallery) {
            return;
        }

        state.selectedGalleryId =
            id;

        state.activeTab =
            "overview";

        populateModal(
            gallery
        );

        setGalleryModal(
            true
        );

        switchTab(
            "overview"
        );
    }


    function closeGallery() {

        setGalleryModal(
            false
        );

        state.selectedGalleryId =
            null;
    }


    function setGalleryModal(
        open
    ) {

        if (
            !refs.galleryModal
        ) {
            return;
        }

        refs.galleryModal.classList.toggle(
            "open",
            open
        );

        refs.galleryModal.setAttribute(
            "aria-hidden",
            open
                ? "false"
                : "true"
        );

        document.body.style.overflow =
            open
                ? "hidden"
                : "";
    }


    function switchTab(
        tabName
    ) {

        state.activeTab =
            tabName;

        document
            .querySelectorAll(
                ".gallery-tab"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.tab ===
                            tabName
                    );
                }
            );

        document
            .querySelectorAll(
                ".tab-content"
            )
            .forEach(
                panel => {

                    panel.classList.toggle(
                        "active",
                        panel.id ===
                            `tab-${tabName}`
                    );
                }
            );

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        if (
            tabName === "media"
        ) {
            renderMedia(
                gallery
            );
        }

        if (
            tabName === "albums"
        ) {
            renderAlbums(
                gallery
            );
        }

        if (
            tabName === "overview"
        ) {
            updateDeliveryReadiness(
                gallery
            );
        }
    }


    function populateModal(
        gallery
    ) {

        if (!gallery) {
            return;
        }

        refs.modalGalleryName.textContent =
            gallery.name;

        refs.modalClientName.textContent =
            gallery.clientName ||
            "No client assigned";

        const status =
            getGalleryStatus(
                gallery
            );

        refs.modalStatus.textContent =
            statusLabel(
                status
            );

        refs.modalStatus.className =
            `status-pill ${status}`;

        refs.modalStorage.textContent =
            `${gallery.storageGB} GB`;

        refs.modalDuration.textContent =
            `${gallery.durationMonths} months`;

        refs.modalExpiry.textContent =
            formatDate(
                gallery.expiresAt
            );

        refs.modalExpiryNote.textContent =
            status === "expired"
                ? "Gallery has expired"
                : `${daysRemaining(
                    gallery.expiresAt
                )} days remaining`;

        refs.modalDownloads.textContent =
            gallery.downloadsEnabled
                ? "Enabled"
                : "Disabled";

        refs.modalGalleryLink.value =
            gallery.galleryLink ||
            buildGalleryLink(
                gallery.id
            );

        updateStorageUI(
            gallery
        );

        populateAccess(
            gallery
        );

        populateSettings(
            gallery
        );

        updateDeliveryReadiness(
            gallery
        );
    }


    function updateStorageUI(
        gallery
    ) {

        refreshStorage(
            gallery
        );

        const percent =
            gallery.storageGB > 0
                ? Math.min(
                    100,
                    (
                        gallery.storageUsedGB /
                        gallery.storageGB
                    ) * 100
                )
                : 0;

        if (
            refs.modalStorageProgress
        ) {
            refs.modalStorageProgress.style.width =
                `${percent}%`;
        }

        if (
            refs.modalStorageText
        ) {
            refs.modalStorageText.textContent =
                `${formatGB(
                    gallery.storageUsedGB
                )} used of ${
                    gallery.storageGB
                } GB`;
        }
    }


    /* =========================================================
       DELIVERY READINESS
    ========================================================= */

    function setReadiness(
        ref,
        complete
    ) {

        if (!ref) {
            return;
        }

        ref.classList.toggle(
            "complete",
            complete
        );

        ref.classList.toggle(
            "incomplete",
            !complete
        );

        const icon =
            ref.querySelector(
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

        if (!gallery) {
            return;
        }

        refreshStorage(
            gallery
        );

        const infoReady =
            Boolean(
                gallery.name.trim() &&
                gallery.clientName.trim()
            );

        const mediaReady =
            gallery.media.length > 0;

        const passwordReady =
            !gallery.passwordEnabled ||
            gallery.password
                .trim()
                .length >= 4;

        const accessReady =
            gallery.visible === true &&
            passwordReady;

        const downloadsReady =
            typeof gallery.downloadsEnabled ===
            "boolean";

        const storageReady =
            gallery.storageGB > 0 &&
            gallery.storageUsedGB <=
                gallery.storageGB;

        const ready =
            infoReady &&
            mediaReady &&
            accessReady &&
            downloadsReady &&
            storageReady &&
            getGalleryStatus(
                gallery
            ) !== "expired";

        const delivery =
            deliveryState(
                gallery
            );

        setReadiness(
            refs.checkGalleryName,
            infoReady
        );

        setReadiness(
            refs.checkMedia,
            mediaReady
        );

        setReadiness(
            refs.checkPassword,
            accessReady
        );

        setReadiness(
            refs.checkDownloads,
            downloadsReady
        );

        setReadiness(
            refs.checkStorage,
            storageReady
        );

        if (
            refs.deliveryStatus
        ) {

            refs.deliveryStatus.className =
                `delivery-status ${delivery}`;

            refs.deliveryStatus.textContent =
                {
                    preparing:
                        "PREPARING",

                    ready:
                        "READY TO SEND",

                    sent:
                        "SENT TO CLIENT",

                    expired:
                        "EXPIRED"

                }[delivery] ||
                "PREPARING";
        }

        if (
            refs.deliveryMessage
        ) {

            refs.deliveryMessage.textContent =
                gallery.deliveryStatus ===
                "sent"

                    ? `This gallery was sent to ${
                        gallery.clientName ||
                        "the client"
                    }.`

                    : ready

                        ? "Everything is ready. You can send this gallery to the client."

                        : "Finish the setup before sending this gallery.";
        }

        if (
            refs.deliveryExpiry
        ) {

            refs.deliveryExpiry.textContent =
                getGalleryStatus(
                    gallery
                ) === "expired"

                    ? "This gallery can no longer be delivered."

                    : `Gallery expires on ${
                        formatDate(
                            gallery.expiresAt
                        )
                    }.`;
        }

        if (
            refs.sendToClientBtn
        ) {

            refs.sendToClientBtn.disabled =
                !ready ||
                gallery.deliveryStatus ===
                    "sent";

            refs.sendToClientBtn.textContent =
                gallery.deliveryStatus ===
                "sent"

                    ? "Sent to Client"

                    : ready

                        ? "Send to Client"

                        : "Complete Setup";
        }
    }


    /* =========================================================
       MEDIA
    ========================================================= */

    function isImage(
        media
    ) {

        return String(
            media.type || ""
        ).startsWith(
            "image/"
        );
    }


    function isVideo(
        media
    ) {

        return String(
            media.type || ""
        ).startsWith(
            "video/"
        );
    }


    async function renderMedia(
        gallery
    ) {

        if (
            !refs.mediaGrid
        ) {
            return;
        }

        refs.mediaGrid.innerHTML =
            "";

        const filtered =
            gallery.media.filter(
                media => {

                    if (
                        state.mediaFilter ===
                        "photo"
                    ) {
                        return isImage(
                            media
                        );
                    }

                    if (
                        state.mediaFilter ===
                        "video"
                    ) {
                        return isVideo(
                            media
                        );
                    }

                    return true;
                }
            );

        if (
            refs.mediaCount
        ) {
            refs.mediaCount.textContent =
                formatCount(
                    filtered.length,
                    "item"
                );
        }

        if (
            !filtered.length
        ) {

            refs.mediaGrid.innerHTML = `
                <div class="empty-state media-empty-state">
                    <div class="empty-icon">▧</div>

                    <h3>
                        No media yet.
                    </h3>

                    <p>
                        Upload photos or videos to start building this gallery.
                    </p>
                </div>
            `;

            return;
        }

        const cards =
            await Promise.all(
                filtered.map(
                    media =>
                        createMediaCard(
                            media,
                            gallery
                        )
                )
            );

        cards.forEach(
            card =>
                refs.mediaGrid.appendChild(
                    card
                )
        );
    }


    async function createMediaCard(
        media,
        gallery
    ) {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "media-card";

        card.dataset.id =
            media.id;

        const source =
            await getMediaSource(
                media
            );

        const preview =
            isVideo(media)

                ? source

                    ? `
                        <video
                            class="media-preview"
                            src="${escapeAttr(
                                source
                            )}"
                            muted
                            preload="metadata">
                        </video>
                    `

                    : `
                        <div class="media-placeholder">
                            VIDEO
                        </div>
                    `

                : source

                    ? `
                        <img
                            class="media-preview"
                            src="${escapeAttr(
                                source
                            )}"
                            alt="${escapeAttr(
                                media.name
                            )}"
                            loading="lazy">
                    `

                    : `
                        <div class="media-placeholder">
                            PHOTO
                        </div>
                    `;

        card.innerHTML = `
            <div class="media-preview-wrap">

                ${preview}

                <span class="media-type-badge">
                    ${
                        isVideo(media)
                            ? "VIDEO"
                            : "PHOTO"
                    }
                </span>

            </div>

            <div class="media-info">

                <strong
                    title="${escapeAttr(
                        media.name
                    )}">
                    ${escapeHtml(
                        media.name
                    )}
                </strong>

                <small>
                    ${formatBytes(
                        media.sizeBytes
                    )}
                </small>

            </div>

            <div class="media-card-actions">

                <button
                    type="button"
                    class="icon-btn danger"
                    data-action="delete"
                    aria-label="Delete media">
                    ×
                </button>

            </div>
        `;

        card.querySelector(
            '[data-action="delete"]'
        )?.addEventListener(
            "click",
            async () => {

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
                            item.id !==
                            media.id
                    );

                refreshStorage(
                    gallery
                );

                await deleteBlob(
                    media.storageKey
                );

                saveGalleries();

                renderStats();

                renderGalleryGrid();

                renderMedia(
                    gallery
                );

                populateModal(
                    gallery
                );

                showToast(
                    "Media removed."
                );
            }
        );

        return card;
    }


    async function handleFiles(
        fileList
    ) {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const files =
            Array.from(
                fileList || []
            ).filter(
                file =>
                    file.type.startsWith(
                        "image/"
                    ) ||
                    file.type.startsWith(
                        "video/"
                    )
            );

        if (!files.length) {

            showToast(
                "Only image and video files are supported."
            );

            return;
        }

        const currentBytes =
            gallery.media.reduce(
                (sum, item) =>
                    sum +
                    number(
                        item.sizeBytes,
                        0
                    ),
                0
            );

        const incomingBytes =
            files.reduce(
                (sum, file) =>
                    sum +
                    file.size,
                0
            );

        const limitBytes =
            gallery.storageGB *
            1024 ** 3;

        if (
            currentBytes +
            incomingBytes >
            limitBytes
        ) {

            const available =
                Math.max(
                    0,
                    limitBytes -
                    currentBytes
                );

            showToast(
                `Storage limit exceeded. ${
                    formatBytes(
                        available
                    )
                } is available.`
            );

            return;
        }

        let added = 0;

        for (
            const file of files
        ) {

            const media =
                normalizeMedia({

                    id:
                        makeId("media"),

                    name:
                        file.name,

                    type:
                        file.type,

                    sizeBytes:
                        file.size,

                    sectionId:
                        gallery.albums[0]?.id ||
                        null,

                    createdAt:
                        new Date()
                            .toISOString()
                });

            if (
                state.db
            ) {

                const stored =
                    await putBlob(
                        media.id,
                        file
                    );

                if (stored) {
                    media.storageKey =
                        media.id;
                }
            }

            if (
                !media.storageKey
            ) {

                try {

                    media.dataUrl =
                        await fileToDataURL(
                            file
                        );

                    media.url =
                        media.dataUrl;

                } catch (_) {

                    showToast(
                        "A file could not be prepared for storage."
                    );

                    continue;
                }
            }

            gallery.media.push(
                media
            );

            added++;
        }

        refreshStorage(
            gallery
        );

        saveGalleries();

        renderStats();

        renderGalleryGrid();

        await renderMedia(
            gallery
        );

        populateModal(
            gallery
        );

        showToast(
            `${added} ${
                added === 1
                    ? "file"
                    : "files"
            } added to the gallery.`
        );
    }


    function fileToDataURL(
        file
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const reader =
                    new FileReader();

                reader.onload =
                    () =>
                        resolve(
                            reader.result
                        );

                reader.onerror =
                    reject;

                reader.readAsDataURL(
                    file
                );
            }
        );
    }


    /* =========================================================
       ALBUMS
    ========================================================= */

    function renderAlbums(
        gallery
    ) {

        if (
            !refs.albumsGrid
        ) {
            return;
        }

        refs.albumsGrid.innerHTML =
            "";

        gallery.albums.forEach(
            album => {

                const count =
                    gallery.media.filter(
                        media =>
                            media.sectionId ===
                            album.id
                    ).length;

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "album-card";

                card.innerHTML = `
                    <div class="album-card-icon">
                        □
                    </div>

                    <div class="album-card-info">

                        <h4>
                            ${escapeHtml(
                                album.name
                            )}
                        </h4>

                        <span class="album-card-count">
                            ${formatCount(
                                count,
                                "media item"
                            )}
                        </span>

                    </div>

                    <div class="album-card-actions">

                        <button
                            type="button"
                            class="icon-btn"
                            data-action="rename"
                            aria-label="Rename section">
                            ✎
                        </button>

                        <button
                            type="button"
                            class="icon-btn danger"
                            data-action="delete"
                            aria-label="Delete section">
                            ×
                        </button>

                    </div>
                `;

                card.querySelector(
                    '[data-action="rename"]'
                )?.addEventListener(
                    "click",
                    () =>
                        renameAlbum(
                            gallery,
                            album
                        )
                );

                card.querySelector(
                    '[data-action="delete"]'
                )?.addEventListener(
                    "click",
                    () =>
                        deleteAlbum(
                            gallery,
                            album
                        )
                );

                refs.albumsGrid.appendChild(
                    card
                );
            }
        );

        if (
            !gallery.albums.length
        ) {

            refs.albumsGrid.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        □
                    </div>

                    <h3>
                        No sections yet.
                    </h3>

                    <p>
                        Create sections to organize this gallery.
                    </p>

                </div>
            `;
        }
    }


    function openAlbumModal() {

        if (
            !refs.albumModal
        ) {
            return;
        }

        refs.albumForm?.reset();

        refs.albumModal.classList.add(
            "open"
        );

        document.body.style.overflow =
            "hidden";

        setTimeout(
            () =>
                refs.albumName?.focus(),
            50
        );
    }


    function closeAlbumModal() {

        if (
            !refs.albumModal
        ) {
            return;
        }

        refs.albumModal.classList.remove(
            "open"
        );

        if (
            refs.galleryModal?.classList.contains(
                "open"
            )
        ) {

            document.body.style.overflow =
                "hidden";

        } else {

            document.body.style.overflow =
                "";
        }
    }


    function createAlbum(
        event
    ) {

        event.preventDefault();

        const gallery =
            getSelectedGallery();

        const name =
            String(
                refs.albumName?.value ||
                ""
            ).trim();

        if (
            !gallery ||
            !name
        ) {
            return;
        }

        if (
            gallery.albums.some(
                album =>
                    album.name.toLowerCase() ===
                    name.toLowerCase()
            )
        ) {

            showToast(
                "A section with that name already exists."
            );

            return;
        }

        gallery.albums.push({
            id:
                makeId("album"),

            name,

            description:
                "",

            createdAt:
                new Date()
                    .toISOString()
        });

        saveGalleries();

        closeAlbumModal();

        renderAlbums(
            gallery
        );

        showToast(
            "Section created."
        );
    }


    function renameAlbum(
        gallery,
        album
    ) {

        const nextName =
            window.prompt(
                "Rename section",
                album.name
            );

        if (
            nextName === null
        ) {
            return;
        }

        const name =
            nextName.trim();

        if (!name) {
            return;
        }

        if (
            gallery.albums.some(
                item =>
                    item.id !==
                        album.id &&
                    item.name.toLowerCase() ===
                        name.toLowerCase()
            )
        ) {

            showToast(
                "A section with that name already exists."
            );

            return;
        }

        album.name =
            name;

        saveGalleries();

        renderAlbums(
            gallery
        );

        showToast(
            "Section renamed."
        );
    }


    function deleteAlbum(
        gallery,
        album
    ) {

        if (
            gallery.albums.length <= 1
        ) {

            showToast(
                "A gallery must keep at least one section."
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${album.name}"? Media inside it will be moved to the first remaining section.`
            );

        if (!confirmed) {
            return;
        }

        const replacement =
            gallery.albums.find(
                item =>
                    item.id !==
                    album.id
            );

        gallery.media.forEach(
            media => {

                if (
                    media.sectionId ===
                    album.id
                ) {

                    media.sectionId =
                        replacement.id;
                }
            }
        );

        gallery.albums =
            gallery.albums.filter(
                item =>
                    item.id !==
                    album.id
            );

        saveGalleries();

        renderAlbums(
            gallery
        );

        if (
            state.activeTab ===
            "media"
        ) {
            renderMedia(
                gallery
            );
        }

        showToast(
            "Section deleted."
        );
    }


    /* =========================================================
       ACCESS / SETTINGS
    ========================================================= */

    function populateAccess(
        gallery
    ) {

        refs.passwordEnabled.checked =
            gallery.passwordEnabled;

        refs.passwordSetting.hidden =
            !gallery.passwordEnabled;

        refs.galleryPassword.value =
            gallery.password || "";

        refs.downloadsEnabled.checked =
            gallery.downloadsEnabled;

        refs.galleryVisible.checked =
            gallery.visible;
    }


    function populateSettings(
        gallery
    ) {

        refs.editGalleryName.value =
            gallery.name;

        refs.editClientName.value =
            gallery.clientName;

        refs.editGalleryDescription.value =
            gallery.description || "";
    }


    function savePassword() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const password =
            String(
                refs.galleryPassword.value ||
                ""
            ).trim();

        if (
            gallery.passwordEnabled &&
            password.length < 4
        ) {

            showToast(
                "Use a password with at least 4 characters."
            );

            refs.galleryPassword.focus();

            return;
        }

        gallery.password =
            password;

        saveGalleries();

        updateDeliveryReadiness(
            gallery
        );

        showToast(
            "Gallery password saved."
        );
    }


    function saveSettings(
        event
    ) {

        event.preventDefault();

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const name =
            refs.editGalleryName.value
                .trim();

        const clientName =
            refs.editClientName.value
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
            clientName;

        gallery.description =
            refs.editGalleryDescription.value
                .trim();

        gallery.galleryLink =
            gallery.galleryLink ||
            buildGalleryLink(
                gallery.id
            );

        saveGalleries();

        renderStats();

        renderGalleryGrid();

        populateModal(
            gallery
        );

        showToast(
            "Gallery information saved."
        );
    }


    function togglePassword() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        gallery.passwordEnabled =
            refs.passwordEnabled.checked;

        if (
            gallery.passwordEnabled &&
            gallery.password.length < 4
        ) {

            gallery.password =
                generatePasswordValue();

            refs.galleryPassword.value =
                gallery.password;
        }

        refs.passwordSetting.hidden =
            !gallery.passwordEnabled;

        saveGalleries();

        updateDeliveryReadiness(
            gallery
        );
    }


    function toggleDownloads() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        gallery.downloadsEnabled =
            refs.downloadsEnabled.checked;

        saveGalleries();

        populateModal(
            gallery
        );

        showToast(
            gallery.downloadsEnabled
                ? "Client downloads enabled."
                : "Client downloads disabled."
        );
    }


    function toggleVisibility() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        gallery.visible =
            refs.galleryVisible.checked;

        saveGalleries();

        updateDeliveryReadiness(
            gallery
        );

        showToast(
            gallery.visible
                ? "Gallery is visible."
                : "Gallery is hidden."
        );
    }


    function deleteSelectedGallery() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const confirmed =
            window.confirm(
                `Permanently delete "${gallery.name}"? This cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        const removed =
            gallery.media.slice();

        state.galleries =
            state.galleries.filter(
                item =>
                    item.id !==
                    gallery.id
            );

        saveGalleries();

        removed.forEach(
            media =>
                deleteBlob(
                    media.storageKey
                )
        );

        closeGallery();

        renderStats();

        renderGalleryGrid();

        showToast(
            "Gallery deleted."
        );
    }


    /* =========================================================
       SEND TO CLIENT
    ========================================================= */

    function sendToClient() {

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

            return;
        }

        if (
            !isReady(gallery)
        ) {

            updateDeliveryReadiness(
                gallery
            );

            showToast(
                "Complete the gallery setup first."
            );

            return;
        }

        if (
            gallery.deliveryStatus ===
            "sent"
        ) {

            showToast(
                "This gallery has already been sent."
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

        refs.galleryVisible.checked =
            true;

        saveGalleries();

        populateModal(
            gallery
        );

        renderStats();

        renderGalleryGrid();

        showToast(
            "Gallery sent to client."
        );
    }


    /* =========================================================
       CLIPBOARD
    ========================================================= */

    async function copyGalleryLink() {

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        const link =
            gallery.galleryLink ||
            buildGalleryLink(
                gallery.id
            );

        try {

            await navigator.clipboard.writeText(
                link
            );

            showToast(
                "Gallery link copied."
            );

        } catch (_) {

            refs.modalGalleryLink.focus();

            refs.modalGalleryLink.select();

            try {

                document.execCommand(
                    "copy"
                );

                showToast(
                    "Gallery link copied."
                );

            } catch (error) {

                showToast(
                    "Could not copy the link."
                );
            }
        }
    }


    /* =========================================================
       TOAST
    ========================================================= */

    function showToast(
        message
    ) {

        if (
            !refs.toast ||
            !refs.toastMessage
        ) {
            return;
        }

        refs.toastMessage.textContent =
            message;

        refs.toast.classList.add(
            "show"
        );

        clearTimeout(
            state.toastTimer
        );

        state.toastTimer =
            setTimeout(
                () =>
                    refs.toast.classList.remove(
                        "show"
                    ),
                2800
            );
    }


    /* =========================================================
       MOBILE NAV
    ========================================================= */

    function setupMobileMenu() {

        if (
            !refs.mobileMenuBtn ||
            !refs.mobileMenu
        ) {
            return;
        }

        refs.mobileMenuBtn.addEventListener(
            "click",
            () => {

                refs.mobileMenu.classList.toggle(
                    "open"
                );
            }
        );

        refs.mobileMenu
            .querySelectorAll("a")
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        () =>
                            refs.mobileMenu.classList.remove(
                                "open"
                            )
                    );
                }
            );
    }


    /* =========================================================
       EVENTS
    ========================================================= */

    function setupEvents() {

        refs.gallerySearch?.addEventListener(
            "input",
            renderGalleryGrid
        );

        refs.statusFilter?.addEventListener(
            "change",
            renderGalleryGrid
        );

        refs.mediaFilter?.addEventListener(
            "change",
            () => {

                state.mediaFilter =
                    refs.mediaFilter.value;

                const gallery =
                    getSelectedGallery();

                if (gallery) {
                    renderMedia(
                        gallery
                    );
                }
            }
        );

        refs.closeGalleryModal?.addEventListener(
            "click",
            closeGallery
        );

        refs.galleryModal?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    refs.galleryModal
                ) {
                    closeGallery();
                }
            }
        );

        document
            .querySelectorAll(
                ".gallery-tab"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () =>
                            switchTab(
                                button.dataset.tab
                            )
                    );
                }
            );

        document
            .querySelectorAll(
                "[data-open-tab]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () =>
                            switchTab(
                                button.dataset.openTab
                            )
                    );
                }
            );

        refs.copyLinkBtn?.addEventListener(
            "click",
            copyGalleryLink
        );

        refs.mediaUpload?.addEventListener(
            "change",
            async event => {

                await handleFiles(
                    event.target.files
                );

                event.target.value =
                    "";
            }
        );

        refs.uploadZone?.addEventListener(
            "click",
            () =>
                refs.mediaUpload?.click()
        );

        refs.uploadZone?.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                refs.uploadZone.classList.add(
                    "dragover"
                );
            }
        );

        refs.uploadZone?.addEventListener(
            "dragleave",
            () =>
                refs.uploadZone.classList.remove(
                    "dragover"
                )
        );

        refs.uploadZone?.addEventListener(
            "drop",
            async event => {

                event.preventDefault();

                refs.uploadZone.classList.remove(
                    "dragover"
                );

                await handleFiles(
                    event.dataTransfer.files
                );
            }
        );

        refs.createAlbumBtn?.addEventListener(
            "click",
            openAlbumModal
        );

        refs.closeAlbumModal?.addEventListener(
            "click",
            closeAlbumModal
        );

        refs.cancelAlbum?.addEventListener(
            "click",
            closeAlbumModal
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

        refs.albumForm?.addEventListener(
            "submit",
            createAlbum
        );

        refs.passwordEnabled?.addEventListener(
            "change",
            togglePassword
        );

        refs.generatePassword?.addEventListener(
            "click",
            () => {

                refs.galleryPassword.value =
                    generatePasswordValue();

                refs.galleryPassword.focus();
            }
        );

        refs.savePassword?.addEventListener(
            "click",
            savePassword
        );

        refs.downloadsEnabled?.addEventListener(
            "change",
            toggleDownloads
        );

        refs.galleryVisible?.addEventListener(
            "change",
            toggleVisibility
        );

        refs.gallerySettingsForm?.addEventListener(
            "submit",
            saveSettings
        );

        refs.deleteGalleryBtn?.addEventListener(
            "click",
            deleteSelectedGallery
        );

        refs.sendToClientBtn?.addEventListener(
            "click",
            sendToClient
        );

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
                    closeGallery();
                }
            }
        );
    }


    /* =========================================================
       UTILITIES
    ========================================================= */

    function escapeHtml(
        value
    ) {

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


    function escapeAttr(
        value
    ) {

        return escapeHtml(
            value
        ).replace(
            /`/g,
            "&#096;"
        );
    }


    /* =========================================================
       INITIALIZATION
    ========================================================= */

    async function init() {

        state.db =
            await openMediaDB();

        state.galleries =
            loadGalleries();

        state.galleries.forEach(
            refreshStorage
        );

        const purchaseCreated =
            processPendingPurchase();

        if (
            purchaseCreated
        ) {
            state.galleries =
                loadGalleries();
        }

        saveGalleries();

        setupEvents();

        setupMobileMenu();

        renderStats();

        renderGalleryGrid();

        window.addEventListener(
            "beforeunload",
            revokeObjectUrls
        );
    }


    init();

});