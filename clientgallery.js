/* =========================================================
   PROFESSIONAL STUDIO
   CLIENT GALLERIES
   Final Frontend Controller

   Includes:
   - Real purchased galleries
   - Gallery Shop connection
   - IndexedDB media storage
   - Wedding Album selection
   - Demo Gallery
   - Demo Share Link
   - Demo pricing
   - Delivery readiness
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

    /* =========================================================
       DEMO CONFIGURATION
    ========================================================= */

    const DEMO_GALLERY_ID = "professional-studio-demo-gallery";

    const DEMO_PRICING = {
        "3": {
            duration: 3,
            price: 643
        },
        "6": {
            duration: 6,
            price: 1287
        },
        "12": {
            duration: 12,
            price: 2573
        }
    };

    const DEMO_GALLERY = {
        id: DEMO_GALLERY_ID,
        demo: true,

        galleryName: "Aarav & Meera",
        clientName: "Aarav & Meera",
        description:
            "A complete example wedding gallery showing how a photographer can prepare, protect and deliver a client gallery.",

        status: "active",
        deliveryStatus: "ready",

        storageLimitGB: 100,
        storageUsedGB: 18.6,

        duration: 12,

        createdAt: new Date().toISOString(),

        expiryDate: (() => {
            const d = new Date();
            d.setMonth(d.getMonth() + 12);
            return d.toISOString();
        })(),

        passwordEnabled: true,
        password: "Aarav2026",

        downloadsEnabled: true,
        visible: true,

        clientGalleryLink:
            `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "")}client-gallery-view.html?gallery=aarav-meera-demo`,

        media: [
            {
                id: "demo-photo-1",
                name: "Wedding Ceremony",
                type: "image",
                sectionId: "wedding-album",
                sizeMB: 4.8
            },
            {
                id: "demo-photo-2",
                name: "Bride & Groom",
                type: "image",
                sectionId: "wedding-album",
                sizeMB: 5.2
            },
            {
                id: "demo-photo-3",
                name: "Wedding Portrait",
                type: "image",
                sectionId: "wedding-album",
                sizeMB: 4.4
            },
            {
                id: "demo-photo-4",
                name: "Family Moments",
                type: "image",
                sectionId: "wedding-album",
                sizeMB: 5.1
            },
            {
                id: "demo-photo-5",
                name: "Reception",
                type: "image",
                sectionId: "reception",
                sizeMB: 4.9
            },
            {
                id: "demo-video-1",
                name: "Wedding Highlights",
                type: "video",
                sectionId: "highlights",
                sizeMB: 820
            }
        ],

        albums: [
            {
                id: "demo-wedding-album",
                name: WEDDING_ALBUM_NAME,
                description: "Client-selected favourite wedding photographs.",
                mediaIds: [
                    "demo-photo-1",
                    "demo-photo-2",
                    "demo-photo-3",
                    "demo-photo-4"
                ],
                isWeddingAlbum: true,
                selectionEnabled: true,
                maxSelections: 50,
                selectedCount: 34,
                status: "open"
            },
            {
                id: "demo-reception-album",
                name: "Reception",
                description: "Reception photographs and moments.",
                mediaIds: [
                    "demo-photo-5"
                ],
                isWeddingAlbum: false
            },
            {
                id: "demo-highlights-album",
                name: "Highlights",
                description: "Wedding highlight video.",
                mediaIds: [
                    "demo-video-1"
                ],
                isWeddingAlbum: false
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
        coverObjectUrls: new Set(),
        db: null,
        demoMode: false
    };

    /* =========================================================
       DOM REFERENCES
    ========================================================= */

    const refs = {
        galleryGrid: document.getElementById("galleryGrid"),
        gallerySearch: document.getElementById("gallerySearch"),
        galleryFilter: document.getElementById("statusFilter"),

        totalGalleries: document.getElementById("totalGalleries"),
        activeGalleries: document.getElementById("activeGalleries"),
        expiringGalleries: document.getElementById("expiringGalleries"),
        storageUsed: document.getElementById("totalStorage"),

        galleryModal: document.getElementById("galleryModal"),

        modalGalleryTitle:
            document.getElementById("modalGalleryName"),

        modalGalleryClient:
            document.getElementById("modalClientName"),

        closeGalleryModal:
            document.getElementById("closeGalleryModal"),

        modalDescription:
            document.getElementById("modalDescription"),

        modalCreatedAt:
            document.getElementById("modalCreatedAt"),

        modalDuration:
            document.getElementById("modalDuration"),

        modalStatus:
            document.getElementById("modalStatus"),

        modalStorageText:
            document.getElementById("modalStorageText"),

        modalStorageUsed:
            document.getElementById("modalStorageUsed"),

        modalStorageLimit:
            document.getElementById("modalStorageLimit"),

        modalStorageProgress:
            document.getElementById("modalStorageProgress"),

        modalExpiry:
            document.getElementById("modalExpiry"),

        modalExpiryStatus:
            document.getElementById("modalExpiryStatus"),

        modalExpiryDuration:
            document.getElementById("modalExpiryDuration"),

        modalExpiryNote:
            document.getElementById("modalExpiryNote"),

        modalGalleryLink:
            document.getElementById("modalGalleryLink"),

        copyLinkBtn:
            document.getElementById("copyLinkBtn"),

        mediaGrid:
            document.getElementById("mediaGrid"),

        mediaUpload:
            document.getElementById("mediaUpload"),

        uploadZone:
            document.getElementById("uploadZone"),

        mediaCount:
            document.getElementById("mediaCount"),

        mediaFilter:
            document.getElementById("mediaFilter"),

        albumsGrid:
            document.getElementById("albumsGrid"),

        createAlbumBtn:
            document.getElementById("createAlbumBtn"),

        gallerySettingsForm:
            document.getElementById("gallerySettingsForm"),

        editGalleryName:
            document.getElementById("editGalleryName"),

        editClientName:
            document.getElementById("editClientName"),

        editGalleryDescription:
            document.getElementById("editGalleryDescription"),

        passwordEnabled:
            document.getElementById("passwordEnabled"),

        passwordSetting:
            document.getElementById("passwordSetting"),

        galleryPassword:
            document.getElementById("galleryPassword"),

        generatePassword:
            document.getElementById("generatePassword"),

        savePassword:
            document.getElementById("savePassword"),

        downloadsEnabled:
            document.getElementById("downloadsEnabled"),

        galleryVisible:
            document.getElementById("galleryVisible"),

        modalPassword:
            document.getElementById("modalPassword"),

        modalDownloads:
            document.getElementById("modalDownloads"),

        modalVisibility:
            document.getElementById("modalVisibility"),

        deleteGalleryBtn:
            document.getElementById("deleteGalleryBtn"),

        checkGalleryName:
            document.getElementById("checkGalleryName"),

        checkMedia:
            document.getElementById("checkMedia"),

        checkPassword:
            document.getElementById("checkPassword"),

        checkDownloads:
            document.getElementById("checkDownloads"),

        checkStorage:
            document.getElementById("checkStorage"),

        deliveryStatus:
            document.getElementById("deliveryStatus"),

        deliveryMessage:
            document.getElementById("deliveryMessage"),

        deliveryExpiry:
            document.getElementById("deliveryExpiry"),

        sendToClientBtn:
            document.getElementById("sendToClientBtn"),

        closeAlbumModal:
            document.getElementById("closeAlbumModal"),

        cancelAlbum:
            document.getElementById("cancelAlbum"),

        albumModal:
            document.getElementById("albumModal"),

        albumForm:
            document.getElementById("albumForm"),

        albumName:
            document.getElementById("albumName"),

        toast:
            document.getElementById("toast"),

        toastMessage:
            document.getElementById("toastMessage"),

        mobileMenuBtn:
            document.getElementById("mobileMenuBtn"),

        mobileMenu:
            document.getElementById("mobileMenu")
    };

    /* =========================================================
       HELPERS
    ========================================================= */

    const createId = prefix =>
        `${prefix}_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 10)}`;

    const escapeHTML = value =>
        String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    const formatDate = value => {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatDateTime = value => {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const addMonths = (dateValue, months) => {
        const date = new Date(dateValue);
        date.setMonth(date.getMonth() + Number(months || 0));
        return date;
    };

    const daysBetween = (futureDate, currentDate = new Date()) => {
        const future = new Date(futureDate);

        if (Number.isNaN(future.getTime())) {
            return 0;
        }

        return Math.ceil(
            (future.getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
    };

    const formatGB = value => {
        const number = Number(value || 0);

        if (number < 1) {
            return `${(number * 1024).toFixed(0)} MB`;
        }

        return `${number.toFixed(1)} GB`;
    };

    const isImage = file =>
        file?.type === "image" ||
        /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(
            file?.name || ""
        );

    const isVideo = file =>
        file?.type === "video" ||
        /\.(mp4|mov|avi|webm|mkv)$/i.test(
            file?.name || ""
        );

    const isPhoto = media =>
        media?.type === "image" ||
        /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(
            media?.name || ""
        );

    const isVideoMedia = media =>
        media?.type === "video" ||
        /\.(mp4|mov|avi|webm|mkv)$/i.test(
            media?.name || ""
        );

    const showToast = message => {
        if (!refs.toast || !refs.toastMessage) {
            return;
        }

        refs.toastMessage.textContent = message;

        refs.toast.classList.add("show");

        clearTimeout(showToast.timer);

        showToast.timer = setTimeout(() => {
            refs.toast.classList.remove("show");
        }, 2600);
    };

    const revokeSet = set => {
        set.forEach(url => {
            try {
                URL.revokeObjectURL(url);
            } catch (_) {}
        });

        set.clear();
    };

    /* =========================================================
       INDEXED DB
    ========================================================= */

    const openDatabase = () =>
        new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                resolve(null);
                return;
            }

            const request = indexedDB.open(
                DB_NAME,
                DB_VERSION
            );

            request.onupgradeneeded = event => {
                const database = event.target.result;

                if (!database.objectStoreNames.contains(MEDIA_STORE)) {
                    database.createObjectStore(
                        MEDIA_STORE,
                        {
                            keyPath: "id"
                        }
                    );
                }
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });

    const ensureDB = async () => {
        if (state.db) {
            return state.db;
        }

        try {
            state.db = await openDatabase();
        } catch (error) {
            console.warn(
                "IndexedDB unavailable:",
                error
            );

            state.db = null;
        }

        return state.db;
    };

    const idbRequest = (
        storeName,
        mode,
        callback
    ) =>
        new Promise(async (resolve, reject) => {
            const database = await ensureDB();

            if (!database) {
                resolve(null);
                return;
            }

            const transaction =
                database.transaction(
                    storeName,
                    mode
                );

            const store =
                transaction.objectStore(storeName);

            let request;

            try {
                request = callback(store);
            } catch (error) {
                reject(error);
                return;
            }

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });

    const putMediaFile = media =>
        idbRequest(
            MEDIA_STORE,
            "readwrite",
            store => store.put(media)
        );

    const getMediaFile = id =>
        idbRequest(
            MEDIA_STORE,
            "readonly",
            store => store.get(id)
        );

    const deleteMediaFile = id =>
        idbRequest(
            MEDIA_STORE,
            "readwrite",
            store => store.delete(id)
        );

    const deleteMediaFiles = ids =>
        Promise.all(
            ids.map(id =>
                deleteMediaFile(id)
            )
        );

    const getGalleryMediaBlobs = async galleryId => {
        const result = await idbRequest(
            MEDIA_STORE,
            "readonly",
            store => store.getAll()
        );

        return (result || []).filter(
            item =>
                item.galleryId === galleryId
        );
    };

    /* =========================================================
       LOCAL STORAGE
    ========================================================= */

    const loadGalleries = () => {
        try {
            const stored =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!stored) {
                return [];
            }

            const parsed =
                JSON.parse(stored);

            return Array.isArray(parsed)
                ? parsed
                : [];
        } catch (error) {
            console.warn(
                "Could not load galleries:",
                error
            );

            return [];
        }
    };

    const saveGalleries = galleries => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(galleries)
        );

        window.dispatchEvent(
            new CustomEvent(
                "professionalStudioClientGalleriesUpdated"
            )
        );
    };

    /* =========================================================
       NORMALIZATION
    ========================================================= */

    const normalizeMedia = media => ({
        id:
            media.id ||
            createId("media"),

        galleryId:
            media.galleryId || null,

        name:
            media.name ||
            "Untitled Media",

        type:
            media.type ||
            "image",

        sizeMB:
            Number(media.sizeMB || 0),

        sectionId:
            media.sectionId ||
            "main",

        createdAt:
            media.createdAt ||
            new Date().toISOString(),

        isCover:
            Boolean(media.isCover),

        clientSelected:
            Boolean(media.clientSelected)
    });

    const normalizeAlbum = album => ({
        id:
            album.id ||
            createId("album"),

        name:
            album.name ||
            "Untitled Album",

        description:
            album.description ||
            "",

        mediaIds:
            Array.isArray(album.mediaIds)
                ? album.mediaIds
                : [],

        isWeddingAlbum:
            Boolean(album.isWeddingAlbum),

        selectionEnabled:
            Boolean(album.selectionEnabled),

        maxSelections:
            Number(
                album.maxSelections || 50
            ),

        selectedMediaIds:
            Array.isArray(
                album.selectedMediaIds
            )
                ? album.selectedMediaIds
                : [],

        selectedCount:
            Number(
                album.selectedCount ||
                album.selectedMediaIds?.length ||
                0
            ),

        status:
            album.status ||
            "open",

        submittedAt:
            album.submittedAt ||
            null,

        submittedBy:
            album.submittedBy ||
            null,

        photographerApproved:
            Boolean(
                album.photographerApproved
            ),

        approvedAt:
            album.approvedAt ||
            null
    });

    const createWeddingAlbumSection = () => ({
        id: "wedding-album",
        name: WEDDING_ALBUM_NAME,
        isWeddingAlbum: true,
        selectionEnabled: true,
        maxSelections: 50,
        selectedMediaIds: [],
        selectedCount: 0,
        status: "open"
    });

    const normalizeGallery = gallery => {
        const normalized = {
            ...gallery,

            id:
                gallery.id ||
                createId("gallery"),

            galleryName:
                gallery.galleryName ||
                gallery.name ||
                "Untitled Gallery",

            clientName:
                gallery.clientName ||
                "Client",

            description:
                gallery.description ||
                "",

            duration:
                Number(
                    gallery.duration || 3
                ),

            storageLimitGB:
                Number(
                    gallery.storageLimitGB ||
                    gallery.storage ||
                    100
                ),

            storageUsedGB:
                Number(
                    gallery.storageUsedGB ||
                    0
                ),

            createdAt:
                gallery.createdAt ||
                new Date().toISOString(),

            expiryDate:
                gallery.expiryDate ||
                addMonths(
                    gallery.createdAt ||
                        new Date(),
                    gallery.duration || 3
                ).toISOString(),

            passwordEnabled:
                Boolean(
                    gallery.passwordEnabled
                ),

            password:
                gallery.password ||
                "",

            downloadsEnabled:
                gallery.downloadsEnabled !== false,

            visible:
                gallery.visible !== false,

            media:
                Array.isArray(gallery.media)
                    ? gallery.media.map(
                          normalizeMedia
                      )
                    : [],

            albums:
                Array.isArray(gallery.albums)
                    ? gallery.albums.map(
                          normalizeAlbum
                      )
                    : []
        };

        const hasWeddingAlbum =
            normalized.albums.some(
                album =>
                    album.isWeddingAlbum ||
                    album.name ===
                        WEDDING_ALBUM_NAME
            );

        if (!hasWeddingAlbum) {
            normalized.albums.unshift(
                normalizeAlbum(
                    createWeddingAlbumSection()
                )
            );
        }

        return normalized;
    };

    /* =========================================================
       STATUS
    ========================================================= */

    const getGalleryStatus = gallery => {
        if (gallery.demo) {
            return "active";
        }

        const days =
            daysBetween(
                gallery.expiryDate
            );

        if (days <= 0) {
            return "expired";
        }

        if (
            gallery.deliveryStatus ===
            "sent"
        ) {
            return "sent";
        }

        if (
            gallery.deliveryStatus ===
            "ready"
        ) {
            return "ready";
        }

        return "preparing";
    };

    const getStatusLabel = status => {
        const labels = {
            active: "Active",
            sent: "Sent to Client",
            ready: "Ready",
            preparing: "Preparing",
            expired: "Expired",
            expiring: "Expiring Soon"
        };

        return (
            labels[status] ||
            "Preparing"
        );
    };

    const syncGalleryStatus = gallery => {
        if (gallery.demo) {
            return gallery;
        }

        gallery.status =
            getGalleryStatus(
                gallery
            );

        return gallery;
    };

    /* =========================================================
       GALLERY LOOKUP
    ========================================================= */

    const getSelectedGallery = () => {
        if (state.demoMode) {
            return DEMO_GALLERY;
        }

        return state.galleries.find(
            gallery =>
                gallery.id ===
                state.selectedGalleryId
        );
    };

    const getGalleryById = id => {
        if (id === DEMO_GALLERY_ID) {
            return DEMO_GALLERY;
        }

        return state.galleries.find(
            gallery =>
                gallery.id === id
        );
    };

    const getWeddingAlbum = gallery =>
        gallery?.albums?.find(
            album =>
                album.isWeddingAlbum ||
                album.name ===
                    WEDDING_ALBUM_NAME
        );

    const getWeddingAlbumMedia = gallery => {
        const album =
            getWeddingAlbum(
                gallery
            );

        if (!album) {
            return [];
        }

        return (
            gallery.media || []
        ).filter(media =>
            album.mediaIds.includes(
                media.id
            )
        );
    };

    const syncWeddingAlbumSelection = gallery => {
        const album =
            getWeddingAlbum(
                gallery
            );

        if (!album) {
            return;
        }

        album.selectedMediaIds =
            Array.isArray(
                album.selectedMediaIds
            )
                ? album.selectedMediaIds
                : [];

        album.selectedCount =
            album.selectedMediaIds.length;
    };

    /* =========================================================
       GALLERY SHOP CONNECTION
    ========================================================= */

    const processPendingPurchase = () => {
        let pending = null;

        try {
            const raw =
                localStorage.getItem(
                    PENDING_PURCHASE_KEY
                );

            if (raw) {
                pending =
                    JSON.parse(raw);
            }
        } catch (_) {}

        if (!pending) {
            return;
        }

        const purchaseId =
            pending.purchaseId ||
            createId("purchase");

        const alreadyExists =
            state.galleries.some(
                gallery =>
                    gallery.purchaseId ===
                    purchaseId
            );

        if (alreadyExists) {
            localStorage.removeItem(
                PENDING_PURCHASE_KEY
            );

            return;
        }

        const duration =
            Number(
                pending.duration || 3
            );

        const storageLimit =
            Number(
                pending.storageLimitGB ||
                    pending.storage ||
                    100
            );

        const createdAt =
            new Date().toISOString();

        const expiryDate =
            addMonths(
                createdAt,
                duration
            ).toISOString();

        const gallery = normalizeGallery({
            id:
                createId("gallery"),

            purchaseId,

            galleryName:
                pending.galleryName ||
                "New Client Gallery",

            clientName:
                pending.clientName ||
                "New Client",

            description:
                pending.description ||
                "",

            duration,

            storageLimitGB:
                storageLimit,

            storageUsedGB: 0,

            createdAt,

            expiryDate,

            clientGalleryLink:
                `${window.location.origin}${window.location.pathname.replace(
                    /[^/]*$/,
                    ""
                )}client-gallery-view.html?gallery=${encodeURIComponent(
                    purchaseId
                )}`,

            passwordEnabled: false,

            password: "",

            downloadsEnabled: true,

            visible: true,

            deliveryStatus: "draft",

            media: [],

            albums: [
                createWeddingAlbumSection()
            ],

            purchaseSource:
                pending.source ||
                "gallery-shop",

            paymentStatus:
                pending.paymentStatus ||
                "paid",

            purchaseStatus:
                "completed"
        });

        state.galleries.push(
            gallery
        );

        try {
            const history =
                JSON.parse(
                    localStorage.getItem(
                        PURCHASE_HISTORY_KEY
                    ) || "[]"
                );

            history.push({
                ...pending,
                purchaseId,
                galleryId:
                    gallery.id,
                createdAt
            });

            localStorage.setItem(
                PURCHASE_HISTORY_KEY,
                JSON.stringify(history)
            );
        } catch (_) {}

        saveGalleries(
            state.galleries
        );

        localStorage.removeItem(
            PENDING_PURCHASE_KEY
        );

        state.selectedGalleryId =
            gallery.id;

        showToast(
            "New client gallery added."
        );
    };

    /* =========================================================
       DEMO GALLERY INJECTION
    ========================================================= */

    const ensureDemoGallerySection = () => {
        if (!refs.galleryGrid) {
            return;
        }

        let section =
            document.getElementById(
                "professionalStudioDemoGallery"
            );

        if (!section) {
            section =
                document.createElement(
                    "section"
                );

            section.id =
                "professionalStudioDemoGallery";

            section.className =
                "professional-studio-demo-gallery";

            refs.galleryGrid.parentNode.insertBefore(
                section,
                refs.galleryGrid
            );
        }

        section.innerHTML = `
            <div style="
                margin:0 0 22px;
                padding:24px;
                border:1px solid #e7e7e7;
                border-radius:16px;
                background:#fff;
                box-shadow:0 8px 30px rgba(0,0,0,.04);
            ">

                <div style="
                    display:flex;
                    align-items:flex-start;
                    justify-content:space-between;
                    gap:20px;
                    margin-bottom:20px;
                ">

                    <div>
                        <div style="
                            display:inline-flex;
                            align-items:center;
                            padding:5px 9px;
                            border-radius:999px;
                            background:#111;
                            color:#fff;
                            font-size:9px;
                            font-weight:700;
                            letter-spacing:.08em;
                            text-transform:uppercase;
                            margin-bottom:10px;
                        ">
                            Professional Studio Demo
                        </div>

                        <h2 style="
                            margin:0;
                            font-size:20px;
                            line-height:1.2;
                            color:#111;
                        ">
                            See how a complete client gallery works
                        </h2>

                        <p style="
                            margin:8px 0 0;
                            max-width:680px;
                            color:#777;
                            font-size:12px;
                            line-height:1.6;
                        ">
                            This sample gallery lets you preview the same
                            workflow your photographers will use for real clients.
                            It is separate from purchased galleries.
                        </p>
                    </div>

                    <div style="
                        flex-shrink:0;
                        padding:10px 13px;
                        border:1px solid #e8e8e8;
                        border-radius:10px;
                        text-align:right;
                    ">
                        <div style="
                            font-size:9px;
                            color:#999;
                            margin-bottom:3px;
                        ">
                            DEMO ONLY
                        </div>

                        <strong style="
                            font-size:12px;
                            color:#111;
                        ">
                            Not included in your galleries
                        </strong>
                    </div>

                </div>

                <div style="
                    display:grid;
                    grid-template-columns:
                        repeat(auto-fit,minmax(180px,1fr));
                    gap:12px;
                ">

                    <div style="
                        padding:18px;
                        border:1px solid #eee;
                        border-radius:12px;
                    ">
                        <div style="
                            font-size:9px;
                            color:#999;
                            text-transform:uppercase;
                            letter-spacing:.05em;
                        ">
                            Gallery
                        </div>

                        <strong style="
                            display:block;
                            margin-top:6px;
                            font-size:15px;
                        ">
                            Aarav & Meera
                        </strong>

                        <span style="
                            display:block;
                            margin-top:4px;
                            font-size:10px;
                            color:#777;
                        ">
                            Wedding Gallery
                        </span>
                    </div>

                    <div style="
                        padding:18px;
                        border:1px solid #eee;
                        border-radius:12px;
                    ">
                        <div style="
                            font-size:9px;
                            color:#999;
                            text-transform:uppercase;
                            letter-spacing:.05em;
                        ">
                            Storage
                        </div>

                        <strong style="
                            display:block;
                            margin-top:6px;
                            font-size:15px;
                        ">
                            18.6 GB / 100 GB
                        </strong>

                        <span style="
                            display:block;
                            margin-top:4px;
                            font-size:10px;
                            color:#777;
                        ">
                            Photos + Videos
                        </span>
                    </div>

                    <div style="
                        padding:18px;
                        border:1px solid #eee;
                        border-radius:12px;
                    ">
                        <div style="
                            font-size:9px;
                            color:#999;
                            text-transform:uppercase;
                            letter-spacing:.05em;
                        ">
                            Client Access
                        </div>

                        <strong style="
                            display:block;
                            margin-top:6px;
                            font-size:15px;
                        ">
                            Password Protected
                        </strong>

                        <span style="
                            display:block;
                            margin-top:4px;
                            font-size:10px;
                            color:#777;
                        ">
                            Downloads enabled
                        </span>
                    </div>

                    <div style="
                        padding:18px;
                        border:1px solid #eee;
                        border-radius:12px;
                    ">
                        <div style="
                            font-size:9px;
                            color:#999;
                            text-transform:uppercase;
                            letter-spacing:.05em;
                        ">
                            Wedding Album
                        </div>

                        <strong style="
                            display:block;
                            margin-top:6px;
                            font-size:15px;
                        ">
                            34 / 50 Selected
                        </strong>

                        <span style="
                            display:block;
                            margin-top:4px;
                            font-size:10px;
                            color:#777;
                        ">
                            Client selection workflow
                        </span>
                    </div>

                </div>

                <div style="
                    display:flex;
                    flex-wrap:wrap;
                    align-items:center;
                    gap:10px;
                    margin-top:18px;
                    padding-top:18px;
                    border-top:1px solid #eee;
                ">

                    <button
                        type="button"
                        id="openDemoGalleryBtn"
                        style="
                            border:0;
                            border-radius:9px;
                            padding:11px 17px;
                            background:#111;
                            color:#fff;
                            font-size:11px;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        Open Demo Gallery
                    </button>

                    <button
                        type="button"
                        id="shareDemoGalleryBtn"
                        style="
                            border:1px solid #ddd;
                            border-radius:9px;
                            padding:10px 17px;
                            background:#fff;
                            color:#111;
                            font-size:11px;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        Share Link
                    </button>

                    <span style="
                        margin-left:auto;
                        color:#777;
                        font-size:10px;
                    ">
                        Ready to deliver
                    </span>

                </div>

                <div style="
                    margin-top:18px;
                    padding-top:18px;
                    border-top:1px solid #eee;
                ">

                    <div style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:12px;
                        margin-bottom:10px;
                    ">

                        <strong style="
                            font-size:11px;
                        ">
                            Gallery duration pricing
                        </strong>

                        <span style="
                            font-size:9px;
                            color:#999;
                        ">
                            Demo pricing
                        </span>

                    </div>

                    <div style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:9px;
                    ">

                        <div style="
                            padding:9px 12px;
                            border:1px solid #eee;
                            border-radius:9px;
                            font-size:10px;
                        ">
                            <strong>3 Months</strong>
                            <span style="color:#777;">
                                · ₹643
                            </span>
                        </div>

                        <div style="
                            padding:9px 12px;
                            border:1px solid #eee;
                            border-radius:9px;
                            font-size:10px;
                        ">
                            <strong>6 Months</strong>
                            <span style="color:#777;">
                                · ₹1,287
                            </span>
                        </div>

                        <div style="
                            padding:9px 12px;
                            border:1px solid #eee;
                            border-radius:9px;
                            font-size:10px;
                        ">
                            <strong>12 Months</strong>
                            <span style="color:#777;">
                                · ₹2,573
                            </span>
                        </div>

                    </div>

                </div>

            </div>
        `;

        const openButton =
            document.getElementById(
                "openDemoGalleryBtn"
            );

        const shareButton =
            document.getElementById(
                "shareDemoGalleryBtn"
            );

        if (openButton) {
            openButton.onclick = () => {
                openDemoGallery();
            };
        }

        if (shareButton) {
            shareButton.onclick = () => {
                shareDemoGallery();
            };
        }
    };

    const openDemoGallery = () => {
        state.demoMode = true;
        state.selectedGalleryId =
            DEMO_GALLERY_ID;

        state.activeTab = "overview";

        openGalleryModal(
            DEMO_GALLERY_ID
        );
    };

    const shareDemoGallery = async () => {
        const link =
            DEMO_GALLERY.clientGalleryLink;

        if (
            navigator.share &&
            typeof navigator.share ===
                "function"
        ) {
            try {
                await navigator.share({
                    title:
                        "Aarav & Meera Wedding Gallery",
                    text:
                        "View this Professional Studio demo gallery.",
                    url: link
                });

                return;
            } catch (error) {
                if (
                    error?.name ===
                    "AbortError"
                ) {
                    return;
                }
            }
        }

        try {
            await navigator.clipboard.writeText(
                link
            );

            showToast(
                "Demo gallery link copied."
            );
        } catch (_) {
            window.prompt(
                "Copy the demo gallery link:",
                link
            );
        }
    };

    /* =========================================================
       PAGE RENDERING
    ========================================================= */

    const renderPage = () => {
        ensureDemoGallerySection();
        renderStats();
        renderGalleryGrid();
    };

    const renderStats = () => {
        const galleries =
            state.galleries.map(
                syncGalleryStatus
            );

        const total =
            galleries.length;

        const active =
            galleries.filter(
                gallery =>
                    getGalleryStatus(
                        gallery
                    ) !== "expired"
            ).length;

        const expiring =
            galleries.filter(
                gallery => {
                    const days =
                        daysBetween(
                            gallery.expiryDate
                        );

                    return (
                        days > 0 &&
                        days <= 30
                    );
                }
            ).length;

        const storage =
            galleries.reduce(
                (
                    total,
                    gallery
                ) =>
                    total +
                    Number(
                        gallery.storageUsedGB ||
                            0
                    ),
                0
            );

        if (refs.totalGalleries) {
            refs.totalGalleries.textContent =
                total;
        }

        if (refs.activeGalleries) {
            refs.activeGalleries.textContent =
                active;
        }

        if (refs.expiringGalleries) {
            refs.expiringGalleries.textContent =
                expiring;
        }

        if (refs.storageUsed) {
            refs.storageUsed.textContent =
                formatGB(storage);
        }
    };

    const renderGalleryGrid = async () => {
        if (!refs.galleryGrid) {
            return;
        }

        const search =
            state.searchTerm
                .trim()
                .toLowerCase();

        const filter =
            refs.galleryFilter?.value ||
            "all";

        let galleries =
            state.galleries.filter(
                gallery => {
                    const name =
                        `${gallery.galleryName} ${gallery.clientName}`
                            .toLowerCase();

                    if (
                        search &&
                        !name.includes(search)
                    ) {
                        return false;
                    }

                    const status =
                        getGalleryStatus(
                            gallery
                        );

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
                        return (
                            daysBetween(
                                gallery.expiryDate
                            ) <= 30 &&
                            daysBetween(
                                gallery.expiryDate
                            ) > 0
                        );
                    }

                    return true;
                }
            );

        if (!galleries.length) {
            refs.galleryGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fa-regular fa-images"></i>
                    </div>

                    <h3>No galleries found</h3>

                    <p>
                        Purchase a gallery from the Gallery Shop
                        to start preparing a client delivery.
                    </p>
                </div>
            `;

            return;
        }

        const cards =
            await Promise.all(
                galleries.map(
                    gallery =>
                        buildGalleryCard(
                            gallery
                        )
                )
            );

        refs.galleryGrid.innerHTML =
            cards.join("");

        bindGalleryCardEvents();
    };

    /* =========================================================
       GALLERY CARD
    ========================================================= */

    const buildGalleryCard = async gallery => {
        const status =
            getGalleryStatus(
                gallery
            );

        const mediaCount =
            gallery.media?.length ||
            0;

        const daysLeft =
            daysBetween(
                gallery.expiryDate
            );

        const weddingAlbum =
            getWeddingAlbum(
                gallery
            );

        const selectedCount =
            weddingAlbum?.selectedCount ||
            weddingAlbum?.selectedMediaIds
                ?.length ||
            0;

        return `
            <article
                class="gallery-card"
                data-gallery-id="${escapeHTML(
                    gallery.id
                )}"
            >

                <div class="gallery-card-cover">

                    <div class="gallery-card-cover-placeholder">
                        <i class="fa-regular fa-images"></i>
                    </div>

                    <span class="gallery-status ${escapeHTML(
                        status
                    )}">
                        ${escapeHTML(
                            getStatusLabel(
                                status
                            )
                        )}
                    </span>

                </div>

                <div class="gallery-card-body">

                    <div class="gallery-card-heading">

                        <div>
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
                        </div>

                    </div>

                    <div class="gallery-card-meta">

                        <span>
                            <i class="fa-regular fa-images"></i>
                            ${mediaCount} media
                        </span>

                        <span>
                            <i class="fa-solid fa-database"></i>
                            ${formatGB(
                                gallery.storageUsedGB
                            )}
                            /
                            ${formatGB(
                                gallery.storageLimitGB
                            )}
                        </span>

                    </div>

                    <div class="gallery-card-meta">

                        <span>
                            <i class="fa-regular fa-clock"></i>
                            ${
                                daysLeft > 0
                                    ? `${daysLeft} days left`
                                    : "Expired"
                            }
                        </span>

                        ${
                            weddingAlbum
                                ? `
                            <span>
                                <i class="fa-regular fa-heart"></i>
                                ${selectedCount}/${
                                    weddingAlbum.maxSelections ||
                                    50
                                } selected
                            </span>
                        `
                                : ""
                        }

                    </div>

                    <button
                        type="button"
                        class="manage-gallery-btn"
                        data-action="manage"
                        data-gallery-id="${escapeHTML(
                            gallery.id
                        )}"
                    >
                        Manage Gallery
                    </button>

                </div>

            </article>
        `;
    };

    const bindGalleryCardEvents = () => {
        document
            .querySelectorAll(
                "[data-action='manage']"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        const id =
                            button.dataset
                                .galleryId;

                        state.demoMode =
                            false;

                        openGalleryModal(
                            id
                        );
                    }
                );
            });
    };

    /* =========================================================
       OPEN / CLOSE MODAL
    ========================================================= */

    const openGalleryModal = async id => {
        const gallery =
            getGalleryById(id);

        if (!gallery) {
            return;
        }

        state.selectedGalleryId =
            id;

        state.demoMode =
            gallery.demo === true;

        state.activeTab =
            "overview";

        renderModalHeader(
            gallery
        );

        renderModalOverview(
            gallery
        );

        renderMedia(
            gallery
        );

        renderAlbums(
            gallery
        );

        renderSettings(
            gallery
        );

        updateDeliveryReadiness(
            gallery
        );

        if (refs.galleryModal) {
            refs.galleryModal.classList.add(
                "open"
            );

            refs.galleryModal.style.display =
                "flex";
        }
    };

    const closeGalleryModal = () => {
        state.selectedGalleryId =
            null;

        state.demoMode =
            false;

        if (refs.galleryModal) {
            refs.galleryModal.classList.remove(
                "open"
            );

            refs.galleryModal.style.display =
                "none";
        }
    };

    /* =========================================================
       MODAL HEADER
    ========================================================= */

    const renderModalHeader = gallery => {
        if (refs.modalGalleryTitle) {
            refs.modalGalleryTitle.textContent =
                gallery.galleryName;
        }

        if (refs.modalGalleryClient) {
            refs.modalGalleryClient.textContent =
                gallery.clientName;
        }

        if (refs.modalStatus) {
            refs.modalStatus.textContent =
                getStatusLabel(
                    getGalleryStatus(
                        gallery
                    )
                );
        }

        if (
            state.demoMode &&
            refs.modalStatus
        ) {
            refs.modalStatus.textContent =
                "DEMO • Ready";
        }
    };

    /* =========================================================
       MODAL OVERVIEW
    ========================================================= */

    const renderModalOverview = gallery => {
        const used =
            Number(
                gallery.storageUsedGB ||
                    0
            );

        const limit =
            Number(
                gallery.storageLimitGB ||
                    100
            );

        const percentage =
            limit > 0
                ? Math.min(
                      100,
                      (used / limit) *
                          100
                  )
                : 0;

        const daysLeft =
            daysBetween(
                gallery.expiryDate
            );

        if (refs.modalDescription) {
            refs.modalDescription.textContent =
                gallery.description ||
                "No gallery description added yet.";
        }

        if (refs.modalCreatedAt) {
            refs.modalCreatedAt.textContent =
                formatDate(
                    gallery.createdAt
                );
        }

        if (refs.modalDuration) {
            refs.modalDuration.textContent =
                `${gallery.duration} months`;
        }

        if (refs.modalStorageUsed) {
            refs.modalStorageUsed.textContent =
                formatGB(used);
        }

        if (refs.modalStorageLimit) {
            refs.modalStorageLimit.textContent =
                formatGB(limit);
        }

        if (refs.modalStorageText) {
            refs.modalStorageText.textContent =
                `${formatGB(
                    used
                )} of ${formatGB(
                    limit
                )} used`;
        }

        if (refs.modalStorageProgress) {
            refs.modalStorageProgress.style.width =
                `${percentage}%`;
        }

        if (refs.modalExpiry) {
            refs.modalExpiry.textContent =
                formatDate(
                    gallery.expiryDate
                );
        }

        if (refs.modalExpiryStatus) {
            refs.modalExpiryStatus.textContent =
                daysLeft > 0
                    ? `${daysLeft} days remaining`
                    : "Expired";
        }

        if (refs.modalExpiryDuration) {
            refs.modalExpiryDuration.textContent =
                `${gallery.duration} month gallery`;
        }

        if (refs.modalExpiryNote) {
            refs.modalExpiryNote.textContent =
                daysLeft > 0
                    ? "Gallery remains available during this period."
                    : "This gallery has expired.";
        }

        if (refs.modalGalleryLink) {
            refs.modalGalleryLink.value =
                gallery.clientGalleryLink ||
                "";
        }

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
    };

    /* =========================================================
       WEDDING ALBUM
    ========================================================= */

    const renderWeddingAlbumStatus = gallery => {
        const album =
            getWeddingAlbum(
                gallery
            );

        if (!album) {
            return "";
        }

        const selected =
            album.selectedCount ||
            album.selectedMediaIds
                ?.length ||
            0;

        const maximum =
            album.maxSelections ||
            50;

        return `
            <div
                class="wedding-album-management"
                style="
                    margin-top:20px;
                    padding:18px;
                    border:1px solid #e7e7e7;
                    border-radius:12px;
                    background:#fafafa;
                "
            >

                <div style="
                    display:flex;
                    justify-content:space-between;
                    gap:15px;
                    align-items:flex-start;
                ">

                    <div>
                        <strong>
                            WEDDING ALBUM
                        </strong>

                        <p style="
                            margin:5px 0 0;
                            color:#777;
                            font-size:10px;
                        ">
                            Client selection album
                        </p>
                    </div>

                    <span style="
                        font-size:10px;
                        font-weight:700;
                    ">
                        ${selected}/${maximum}
                    </span>

                </div>

                <div style="
                    height:5px;
                    margin-top:12px;
                    border-radius:99px;
                    background:#e5e5e5;
                    overflow:hidden;
                ">

                    <div style="
                        width:${Math.min(
                            100,
                            (selected /
                                maximum) *
                                100
                        )}%;
                        height:100%;
                        background:#111;
                    "></div>

                </div>

                ${
                    gallery.demo
                        ? `
                    <div style="
                        margin-top:12px;
                        font-size:10px;
                        color:#777;
                    ">
                        Demo: client has selected
                        ${selected} favourite photographs.
                    </div>
                `
                        : ""
                }

            </div>
        `;
    };

    /* =========================================================
       ALBUM RENDERING
    ========================================================= */

    const renderAlbums = gallery => {
        if (!refs.albumsGrid) {
            return;
        }

        const albums =
            gallery.albums || [];

        let html =
            albums
                .map(
                    album => `
                <div
                    class="album-card"
                    data-album-id="${escapeHTML(
                        album.id
                    )}"
                >

                    <div>
                        <strong>
                            ${escapeHTML(
                                album.name
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                album.description ||
                                    ""
                            )}
                        </p>
                    </div>

                    <div>
                        <span>
                            ${
                                album.mediaIds
                                    ?.length ||
                                0
                            } media
                        </span>

                        ${
                            album.isWeddingAlbum
                                ? `
                            <span>
                                ·
                                ${
                                    album.selectedCount ||
                                    0
                                } selected
                            </span>
                        `
                                : ""
                        }
                    </div>

                </div>
            `
                )
                .join("");

        refs.albumsGrid.innerHTML =
            html ||
            `
                <div class="empty-state">
                    <p>
                        No albums created yet.
                    </p>
                </div>
            `;

        if (gallery.demo) {
            refs.albumsGrid.insertAdjacentHTML(
                "beforeend",
                renderWeddingAlbumStatus(
                    gallery
                )
            );
        }

        bindAlbumEvents();
    };

    const bindAlbumEvents = () => {
        document
            .querySelectorAll(
                ".album-card"
            )
            .forEach(card => {
                card.addEventListener(
                    "click",
                    () => {
                        if (
                            state.demoMode
                        ) {
                            showToast(
                                "This is a demo gallery."
                            );
                        }
                    }
                );
            });
    };

    /* =========================================================
       SETTINGS
    ========================================================= */

    const renderSettings = gallery => {
        if (refs.editGalleryName) {
            refs.editGalleryName.value =
                gallery.galleryName ||
                "";
        }

        if (refs.editClientName) {
            refs.editClientName.value =
                gallery.clientName ||
                "";
        }

        if (
            refs.editGalleryDescription
        ) {
            refs.editGalleryDescription.value =
                gallery.description ||
                "";
        }

        if (refs.passwordEnabled) {
            refs.passwordEnabled.checked =
                Boolean(
                    gallery.passwordEnabled
                );
        }

        if (refs.passwordSetting) {
            refs.passwordSetting.style.display =
                gallery.passwordEnabled
                    ? ""
                    : "none";
        }

        if (refs.galleryPassword) {
            refs.galleryPassword.value =
                gallery.password ||
                "";
        }

        if (refs.downloadsEnabled) {
            refs.downloadsEnabled.checked =
                gallery.downloadsEnabled !==
                false;
        }

        if (refs.galleryVisible) {
            refs.galleryVisible.checked =
                gallery.visible !== false;
        }
    };

    const updateSettingsSummary =
        gallery => {
            renderSettings(
                gallery
            );
        };

    /* =========================================================
       DELIVERY READINESS
    ========================================================= */

    const updateDeliveryReadiness =
        gallery => {
            const hasName =
                Boolean(
                    gallery.galleryName?.trim()
                );

            const hasMedia =
                (gallery.media?.length ||
                    0) > 0;

            const hasPassword =
                !gallery.passwordEnabled ||
                Boolean(
                    gallery.password?.trim()
                );

            const downloads =
                gallery.downloadsEnabled !==
                false;

            const storage =
                Number(
                    gallery.storageUsedGB ||
                        0
                ) <=
                Number(
                    gallery.storageLimitGB ||
                        100
                );

            const checks = [
                [
                    refs.checkGalleryName,
                    hasName
                ],
                [
                    refs.checkMedia,
                    hasMedia
                ],
                [
                    refs.checkPassword,
                    hasPassword
                ],
                [
                    refs.checkDownloads,
                    downloads
                ],
                [
                    refs.checkStorage,
                    storage
                ]
            ];

            checks.forEach(
                ([element, passed]) => {
                    if (!element) {
                        return;
                    }

                    element.classList.toggle(
                        "complete",
                        passed
                    );

                    element.classList.toggle(
                        "checked",
                        passed
                    );
                }
            );

            const ready =
                hasName &&
                hasMedia &&
                hasPassword &&
                downloads &&
                storage &&
                daysBetween(
                    gallery.expiryDate
                ) > 0;

            if (
                refs.deliveryStatus
            ) {
                refs.deliveryStatus.textContent =
                    ready
                        ? "Ready to deliver"
                        : "Still preparing";
            }

            if (
                refs.deliveryMessage
            ) {
                refs.deliveryMessage.textContent =
                    ready
                        ? "Everything required for client delivery is ready."
                        : "Complete the remaining requirements before sending this gallery.";
            }

            if (
                refs.deliveryExpiry
            ) {
                refs.deliveryExpiry.textContent =
                    `Expires ${formatDate(
                        gallery.expiryDate
                    )}`;
            }

            if (
                refs.sendToClientBtn
            ) {
                refs.sendToClientBtn.disabled =
                    !ready;
            }

            return ready;
        };

    /* =========================================================
       MEDIA
    ========================================================= */

    const renderMedia = async gallery => {
        if (!refs.mediaGrid) {
            return;
        }

        const media =
            gallery.media || [];

        let filtered =
            media;

        if (
            state.mediaFilter ===
            "photos"
        ) {
            filtered =
                media.filter(
                    isPhoto
                );
        }

        if (
            state.mediaFilter ===
            "videos"
        ) {
            filtered =
                media.filter(
                    isVideoMedia
                );
        }

        if (refs.mediaCount) {
            refs.mediaCount.textContent =
                `${media.length} media`;
        }

        if (!filtered.length) {
            refs.mediaGrid.innerHTML = `
                <div class="empty-state">
                    <p>
                        No media found.
                    </p>
                </div>
            `;

            return;
        }

        const cards =
            await Promise.all(
                filtered.map(
                    mediaItem =>
                        buildMediaCard(
                            gallery,
                            mediaItem
                        )
                )
            );

        refs.mediaGrid.innerHTML =
            cards.join("");

        bindMediaEvents();
    };

    const buildMediaCard = async (
        gallery,
        media
    ) => {
        let preview = "";

        if (gallery.demo) {
            preview = `
                <div
                    class="media-video-placeholder"
                    style="
                        background:
                            linear-gradient(
                                135deg,
                                #ededed,
                                #d8d8d8
                            );
                        color:#111;
                    "
                >
                    ${
                        isVideoMedia(
                            media
                        )
                            ? "▶"
                            : "♡"
                    }
                </div>
            `;
        } else {
            const stored =
                await getMediaFile(
                    media.id
                );

            if (
                stored?.blob
            ) {
                const url =
                    URL.createObjectURL(
                        stored.blob
                    );

                state.mediaObjectUrls.add(
                    url
                );

                preview = isImage(
                    stored
                )
                    ? `
                        <img
                            src="${url}"
                            alt="${escapeHTML(
                                media.name
                            )}"
                        >
                    `
                    : `
                        <div class="media-video-placeholder">
                            ▶
                        </div>
                    `;
            } else {
                preview = `
                    <div class="media-video-placeholder">
                        ${
                            isVideoMedia(
                                media
                            )
                                ? "▶"
                                : "♡"
                        }
                    </div>
                `;
            }
        }

        return `
            <div
                class="media-item"
                data-media-id="${escapeHTML(
                    media.id
                )}"
            >

                ${preview}

                <div class="media-item-info">
                    ${escapeHTML(
                        media.name
                    )}
                </div>

            </div>
        `;
    };

    const bindMediaEvents = () => {
        document
            .querySelectorAll(
                ".media-item"
            )
            .forEach(item => {
                item.addEventListener(
                    "click",
                    () => {
                        if (
                            state.demoMode
                        ) {
                            showToast(
                                "Demo media preview."
                            );
                        }
                    }
                );
            });
    };

    /* =========================================================
       MEDIA UPLOAD
    ========================================================= */

    const uploadFiles = async files => {
        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            showToast(
                "Demo gallery media cannot be modified."
            );

            return;
        }

        if (!files?.length) {
            return;
        }

        for (
            const file of files
        ) {
            const media = normalizeMedia({
                id:
                    createId("media"),

                galleryId:
                    gallery.id,

                name:
                    file.name,

                type:
                    isVideo(file)
                        ? "video"
                        : "image",

                sizeMB:
                    file.size /
                    (1024 * 1024),

                sectionId:
                    "main"
            });

            gallery.media.push(
                media
            );

            await putMediaFile({
                id: media.id,
                galleryId:
                    gallery.id,
                blob: file,
                name:
                    file.name,
                type:
                    file.type
            });
        }

        recalculateStorage(
            gallery
        );

        saveGalleries(
            state.galleries
        );

        renderPage();

        renderMedia(
            gallery
        );

        updateDeliveryReadiness(
            gallery
        );

        showToast(
            `${files.length} media file${
                files.length > 1
                    ? "s"
                    : ""
            } uploaded.`
        );
    };

    const recalculateStorage =
        gallery => {
            const totalMB =
                (
                    gallery.media || []
                ).reduce(
                    (
                        total,
                        media
                    ) =>
                        total +
                        Number(
                            media.sizeMB ||
                                0
                        ),
                    0
                );

            gallery.storageUsedGB =
                totalMB /
                1024;
        };

    const removeMedia = async id => {
        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            showToast(
                "Demo gallery cannot be modified."
            );

            return;
        }

        gallery.media =
            gallery.media.filter(
                media =>
                    media.id !== id
            );

        await deleteMediaFile(
            id
        );

        recalculateStorage(
            gallery
        );

        saveGalleries(
            state.galleries
        );

        renderMedia(
            gallery
        );

        renderPage();

        updateDeliveryReadiness(
            gallery
        );
    };

    const setMediaAsCover =
        galleryId => {};

    /* =========================================================
       GALLERY SETTINGS
    ========================================================= */

    const saveGalleryInformation =
        () => {
            const gallery =
                getSelectedGallery();

            if (
                !gallery ||
                state.demoMode
            ) {
                showToast(
                    "Demo gallery settings are read-only."
                );

                return;
            }

            gallery.galleryName =
                refs.editGalleryName
                    ?.value.trim() ||
                gallery.galleryName;

            gallery.clientName =
                refs.editClientName
                    ?.value.trim() ||
                gallery.clientName;

            gallery.description =
                refs.editGalleryDescription
                    ?.value.trim() ||
                "";

            saveGalleries(
                state.galleries
            );

            renderModalHeader(
                gallery
            );

            renderModalOverview(
                gallery
            );

            updateDeliveryReadiness(
                gallery
            );

            renderPage();

            showToast(
                "Gallery information saved."
            );
        };

    /* =========================================================
       PASSWORD
    ========================================================= */

    const generateGalleryPassword =
        () => {
            if (
                state.demoMode
            ) {
                showToast(
                    "Demo password: Aarav2026"
                );

                return;
            }

            const chars =
                "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

            let password = "";

            for (
                let i = 0;
                i < 10;
                i++
            ) {
                password +=
                    chars[
                        Math.floor(
                            Math.random() *
                                chars.length
                        )
                    ];
            }

            if (
                refs.galleryPassword
            ) {
                refs.galleryPassword.value =
                    password;
            }
        };

    const saveGalleryPassword =
        () => {
            const gallery =
                getSelectedGallery();

            if (
                !gallery ||
                state.demoMode
            ) {
                showToast(
                    "Demo password cannot be changed."
                );

                return;
            }

            gallery.passwordEnabled =
                Boolean(
                    refs.passwordEnabled
                        ?.checked
                );

            gallery.password =
                refs.galleryPassword
                    ?.value.trim() ||
                "";

            saveGalleries(
                state.galleries
            );

            updateDeliveryReadiness(
                gallery
            );

            renderModalOverview(
                gallery
            );

            showToast(
                "Password settings saved."
            );
        };

    const saveDownloadSetting =
        () => {
            const gallery =
                getSelectedGallery();

            if (
                !gallery ||
                state.demoMode
            ) {
                showToast(
                    "Demo gallery settings are read-only."
                );

                return;
            }

            gallery.downloadsEnabled =
                Boolean(
                    refs.downloadsEnabled
                        ?.checked
                );

            saveGalleries(
                state.galleries
            );

            updateDeliveryReadiness(
                gallery
            );

            renderModalOverview(
                gallery
            );
        };

    const saveVisibilitySetting =
        () => {
            const gallery =
                getSelectedGallery();

            if (
                !gallery ||
                state.demoMode
            ) {
                showToast(
                    "Demo gallery settings are read-only."
                );

                return;
            }

            gallery.visible =
                Boolean(
                    refs.galleryVisible
                        ?.checked
                );

            saveGalleries(
                state.galleries
            );

            renderModalOverview(
                gallery
            );
        };

    /* =========================================================
       SHARE / COPY LINK
    ========================================================= */

    const copyGalleryLink =
        async () => {
            const gallery =
                getSelectedGallery();

            if (!gallery) {
                return;
            }

            const link =
                gallery.clientGalleryLink ||
                "";

            if (!link) {
                showToast(
                    "Gallery link is not available."
                );

                return;
            }

            if (
                navigator.share &&
                typeof navigator.share ===
                    "function"
            ) {
                try {
                    await navigator.share({
                        title:
                            `${gallery.galleryName} Gallery`,
                        text:
                            `View ${gallery.clientName}'s gallery.`,
                        url: link
                    });

                    return;
                } catch (error) {
                    if (
                        error?.name ===
                        "AbortError"
                    ) {
                        return;
                    }
                }
            }

            try {
                await navigator.clipboard.writeText(
                    link
                );

                showToast(
                    "Gallery link copied."
                );
            } catch (_) {
                window.prompt(
                    "Copy gallery link:",
                    link
                );
            }
        };

    /* =========================================================
       SEND TO CLIENT
    ========================================================= */

    const sendGalleryToClient =
        () => {
            const gallery =
                getSelectedGallery();

            if (!gallery) {
                return;
            }

            if (
                state.demoMode
            ) {
                shareDemoGallery();

                return;
            }

            const ready =
                updateDeliveryReadiness(
                    gallery
                );

            if (!ready) {
                showToast(
                    "Complete the delivery requirements first."
                );

                return;
            }

            gallery.deliveryStatus =
                "sent";

            gallery.sentAt =
                new Date().toISOString();

            saveGalleries(
                state.galleries
            );

            renderPage();

            renderModalHeader(
                gallery
            );

            showToast(
                "Gallery marked as sent to client."
            );
        };

    /* =========================================================
       DELETE GALLERY
    ========================================================= */

    const deleteSelectedGallery =
        async () => {
            const gallery =
                getSelectedGallery();

            if (
                !gallery ||
                state.demoMode
            ) {
                showToast(
                    "The demo gallery cannot be deleted."
                );

                return;
            }

            const confirmed =
                window.confirm(
                    `Delete "${gallery.galleryName}"?`
                );

            if (!confirmed) {
                return;
            }

            const ids =
                gallery.media.map(
                    media =>
                        media.id
                );

            await deleteMediaFiles(
                ids
            );

            state.galleries =
                state.galleries.filter(
                    item =>
                        item.id !==
                        gallery.id
                );

            saveGalleries(
                state.galleries
            );

            closeGalleryModal();

            renderPage();

            showToast(
                "Gallery deleted."
            );
        };

    /* =========================================================
       TAB SWITCHING
    ========================================================= */

    const switchTab = tab => {
        state.activeTab =
            tab;

        document
            .querySelectorAll(
                "[data-tab]"
            )
            .forEach(element => {
                element.classList.toggle(
                    "active",
                    element.dataset.tab ===
                        tab
                );
            });

        const gallery =
            getSelectedGallery();

        if (!gallery) {
            return;
        }

        if (
            tab === "overview"
        ) {
            renderModalOverview(
                gallery
            );
        }

        if (
            tab === "media"
        ) {
            renderMedia(
                gallery
            );
        }

        if (
            tab === "albums"
        ) {
            renderAlbums(
                gallery
            );
        }

        if (
            tab === "access"
        ) {
            renderSettings(
                gallery
            );
        }

        if (
            tab === "settings"
        ) {
            renderSettings(
                gallery
            );
        }
    };

    /* =========================================================
       MEDIA FILTER
    ========================================================= */

    const setMediaFilter =
        value => {
            state.mediaFilter =
                value ||
                "all";

            const gallery =
                getSelectedGallery();

            if (gallery) {
                renderMedia(
                    gallery
                );
            }
        };

    /* =========================================================
       QUICK ACTIONS
    ========================================================= */

    const quickUpload =
        () => {
            if (
                state.demoMode
            ) {
                showToast(
                    "Demo gallery media cannot be modified."
                );

                return;
            }

            refs.mediaUpload?.click();
        };

    const quickCreateAlbum =
        () => {
            if (
                state.demoMode
            ) {
                showToast(
                    "Demo gallery albums are read-only."
                );

                return;
            }

            if (
                refs.albumModal
            ) {
                refs.albumModal.style.display =
                    "flex";
            }
        };

    /* =========================================================
       ALBUM MODAL
    ========================================================= */

    const openAlbumModal =
        () => {
            if (
                state.demoMode
            ) {
                showToast(
                    "Demo gallery albums are read-only."
                );

                return;
            }

            if (
                refs.albumModal
            ) {
                refs.albumModal.style.display =
                    "flex";
            }
        };

    const closeAlbumModal =
        () => {
            if (
                refs.albumModal
            ) {
                refs.albumModal.style.display =
                    "none";
            }

            state.editingAlbumId =
                null;
        };

    const saveAlbum = event => {
        event?.preventDefault();

        const gallery =
            getSelectedGallery();

        if (
            !gallery ||
            state.demoMode
        ) {
            showToast(
                "Demo gallery albums are read-only."
            );

            return;
        }

        const name =
            refs.albumName
                ?.value.trim();

        if (!name) {
            showToast(
                "Enter an album name."
            );

            return;
        }

        gallery.albums.push(
            normalizeAlbum({
                id:
                    createId("album"),

                name,

                description:
                    "",

                mediaIds: [],

                isWeddingAlbum:
                    false
            })
        );

        saveGalleries(
            state.galleries
        );

        renderAlbums(
            gallery
        );

        closeAlbumModal();

        showToast(
            "Album created."
        );
    };

    /* =========================================================
       SEARCH / FILTER
    ========================================================= */

    const handleSearch =
        event => {
            state.searchTerm =
                event.target.value ||
                "";

            renderGalleryGrid();
        };

    const handleGalleryFilter =
        event => {
            renderGalleryGrid();
        };

    /* =========================================================
       MOBILE MENU
    ========================================================= */

    const toggleMobileMenu =
        () => {
            refs.mobileMenu?.classList.toggle(
                "open"
            );
        };

    /* =========================================================
       EVENT LISTENERS
    ========================================================= */

    if (
        refs.closeGalleryModal
    ) {
        refs.closeGalleryModal.addEventListener(
            "click",
            closeGalleryModal
        );
    }

    if (
        refs.copyLinkBtn
    ) {
        refs.copyLinkBtn.addEventListener(
            "click",
            copyGalleryLink
        );

        refs.copyLinkBtn.textContent =
            "Share Link";
    }

    if (
        refs.sendToClientBtn
    ) {
        refs.sendToClientBtn.addEventListener(
            "click",
            sendGalleryToClient
        );
    }

    if (
        refs.gallerySearch
    ) {
        refs.gallerySearch.addEventListener(
            "input",
            handleSearch
        );
    }

    if (
        refs.galleryFilter
    ) {
        refs.galleryFilter.addEventListener(
            "change",
            handleGalleryFilter
        );
    }

    if (
        refs.mediaFilter
    ) {
        refs.mediaFilter.addEventListener(
            "change",
            event =>
                setMediaFilter(
                    event.target.value
                )
        );
    }

    if (
        refs.mediaUpload
    ) {
        refs.mediaUpload.addEventListener(
            "change",
            event => {
                uploadFiles(
                    Array.from(
                        event.target.files ||
                            []
                    )
                );

                event.target.value =
                    "";
            }
        );
    }

    if (
        refs.uploadZone
    ) {
        refs.uploadZone.addEventListener(
            "dragover",
            event => {
                event.preventDefault();

                refs.uploadZone.classList.add(
                    "dragging"
                );
            }
        );

        refs.uploadZone.addEventListener(
            "dragleave",
            () => {
                refs.uploadZone.classList.remove(
                    "dragging"
                );
            }
        );

        refs.uploadZone.addEventListener(
            "drop",
            event => {
                event.preventDefault();

                refs.uploadZone.classList.remove(
                    "dragging"
                );

                uploadFiles(
                    Array.from(
                        event.dataTransfer
                            ?.files ||
                            []
                    )
                );
            }
        );
    }

    if (
        refs.passwordEnabled
    ) {
        refs.passwordEnabled.addEventListener(
            "change",
            () => {
                if (
                    refs.passwordSetting
                ) {
                    refs.passwordSetting.style.display =
                        refs.passwordEnabled
                            .checked
                            ? ""
                            : "none";
                }
            }
        );
    }

    if (
        refs.generatePassword
    ) {
        refs.generatePassword.addEventListener(
            "click",
            generateGalleryPassword
        );
    }

    if (
        refs.savePassword
    ) {
        refs.savePassword.addEventListener(
            "click",
            saveGalleryPassword
        );
    }

    if (
        refs.downloadsEnabled
    ) {
        refs.downloadsEnabled.addEventListener(
            "change",
            saveDownloadSetting
        );
    }

    if (
        refs.galleryVisible
    ) {
        refs.galleryVisible.addEventListener(
            "change",
            saveVisibilitySetting
        );
    }

    if (
        refs.gallerySettingsForm
    ) {
        refs.gallerySettingsForm.addEventListener(
            "submit",
            saveGalleryInformation
        );
    }

    if (
        refs.deleteGalleryBtn
    ) {
        refs.deleteGalleryBtn.addEventListener(
            "click",
            deleteSelectedGallery
        );
    }

    if (
        refs.createAlbumBtn
    ) {
        refs.createAlbumBtn.addEventListener(
            "click",
            openAlbumModal
        );
    }

    if (
        refs.closeAlbumModal
    ) {
        refs.closeAlbumModal.addEventListener(
            "click",
            closeAlbumModal
        );
    }

    if (
        refs.cancelAlbum
    ) {
        refs.cancelAlbum.addEventListener(
            "click",
            closeAlbumModal
        );
    }

    if (
        refs.albumForm
    ) {
        refs.albumForm.addEventListener(
            "submit",
            saveAlbum
        );
    }

    if (
        refs.mobileMenuBtn
    ) {
        refs.mobileMenuBtn.addEventListener(
            "click",
            toggleMobileMenu
        );
    }

    document.addEventListener(
        "click",
        event => {
            const tab =
                event.target.closest(
                    "[data-tab]"
                );

            if (tab) {
                switchTab(
                    tab.dataset.tab
                );
            }
        }
    );

    /* =========================================================
       PUBLIC API
    ========================================================= */

    window.ProfessionalStudioClientGalleries =
        {
            getGalleries: () =>
                state.galleries,

            getDemoGallery: () =>
                DEMO_GALLERY,

            openDemoGallery,

            shareDemoGallery,

            openGallery:
                openGalleryModal,

            closeGallery:
                closeGalleryModal,

            refresh: renderPage
        };

    /* =========================================================
       INITIALIZATION
    ========================================================= */

    const init = async () => {
        await ensureDB();

        state.galleries =
            loadGalleries()
                .map(
                    normalizeGallery
                )
                .map(
                    syncGalleryStatus
                );

        processPendingPurchase();

        state.galleries =
            state.galleries.map(
                normalizeGallery
            );

        renderPage();
    };

    init();

})();