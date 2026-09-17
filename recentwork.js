"use strict";

/* =========================================================
   PROFESSIONAL STUDIO
   RECENT WORK / PORTFOLIO

   STORAGE ARCHITECTURE

   localStorage:
   - album metadata
   - photo metadata
   - storage plan information

   IndexedDB:
   - actual image blobs

   Future backend:
   - localStorage metadata -> API/database
   - IndexedDB blobs -> Cloudflare R2
========================================================= */


/* =========================================================
   STORAGE CONFIGURATION
========================================================= */

const PORTFOLIO_STORAGE_KEY =
    "professionalStudio.portfolioStorage";

const SUBSCRIPTION_STORAGE_KEY =
    "professionalStudio.subscription";

const STORAGE_PLANS = {

    basic: {
        id: "basic",
        name: "Basic",
        price: 499,
        storageMB: 500
    },

    professional: {
        id: "professional",
        name: "Professional",
        price: 1499,
        storageMB: 5120
    },

    studio: {
        id: "studio",
        name: "Studio",
        price: 2999,
        storageMB: 20480
    }

};

const DEFAULT_STORAGE_PLAN = "basic";


/* =========================================================
   INDEXEDDB CONFIGURATION
========================================================= */

const PORTFOLIO_DB_NAME =
    "ProfessionalStudioPortfolio";

const PORTFOLIO_DB_VERSION = 1;

const PORTFOLIO_BLOB_STORE =
    "fileBlobs";

let portfolioDBPromise = null;


/* =========================================================
   STATE
========================================================= */

let selectedFiles = [];

let activeAlbumId = null;

let pendingDeleteType = null;

let pendingDeleteId = null;

let albumModalMode = "create";

/*
   Object URLs are temporary browser URLs.

   They are created from IndexedDB blobs when needed
   and revoked when no longer required.
*/

const objectURLCache = new Map();


/* =========================================================
   INDEXEDDB
========================================================= */

function openPortfolioDatabase() {

    if (portfolioDBPromise) {
        return portfolioDBPromise;
    }

    portfolioDBPromise = new Promise(function(resolve, reject) {

        if (!window.indexedDB) {

            reject(
                new Error(
                    "IndexedDB is not supported by this browser."
                )
            );

            return;
        }

        const request = indexedDB.open(
            PORTFOLIO_DB_NAME,
            PORTFOLIO_DB_VERSION
        );

        request.onupgradeneeded = function(event) {

            const db = event.target.result;

            if (!db.objectStoreNames.contains(PORTFOLIO_BLOB_STORE)) {

                db.createObjectStore(
                    PORTFOLIO_BLOB_STORE,
                    {
                        keyPath: "id"
                    }
                );

            }

        };

        request.onsuccess = function() {

            const db = request.result;

            db.onversionchange = function() {
                db.close();
            };

            resolve(db);

        };

        request.onerror = function() {

            reject(
                request.error ||
                new Error("Could not open portfolio database.")
            );

        };

    });

    return portfolioDBPromise;

}


/* =========================================================
   STORE FILE BLOB
========================================================= */

async function storeFileBlob(fileId, file) {

    const db =
        await openPortfolioDatabase();

    return new Promise(function(resolve, reject) {

        const transaction =
            db.transaction(
                PORTFOLIO_BLOB_STORE,
                "readwrite"
            );

        const store =
            transaction.objectStore(
                PORTFOLIO_BLOB_STORE
            );

        const request =
            store.put({
                id: fileId,
                blob: file,
                type: file.type || "image/*",
                size: file.size,
                name: file.name
            });

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function() {
            reject(
                request.error ||
                new Error("Could not store image.")
            );
        };

    });

}


/* =========================================================
   GET FILE BLOB
========================================================= */

async function getStoredFileBlob(fileId) {

    const db =
        await openPortfolioDatabase();

    return new Promise(function(resolve, reject) {

        const transaction =
            db.transaction(
                PORTFOLIO_BLOB_STORE,
                "readonly"
            );

        const store =
            transaction.objectStore(
                PORTFOLIO_BLOB_STORE
            );

        const request =
            store.get(fileId);

        request.onsuccess = function() {

            const result =
                request.result;

            resolve(
                result
                    ? result.blob
                    : null
            );

        };

        request.onerror = function() {

            reject(
                request.error ||
                new Error("Could not retrieve image.")
            );

        };

    });

}


/* =========================================================
   DELETE FILE BLOB
========================================================= */

async function deleteStoredFileBlob(fileId) {

    try {

        const db =
            await openPortfolioDatabase();

        await new Promise(function(resolve, reject) {

            const transaction =
                db.transaction(
                    PORTFOLIO_BLOB_STORE,
                    "readwrite"
                );

            const store =
                transaction.objectStore(
                    PORTFOLIO_BLOB_STORE
                );

            const request =
                store.delete(fileId);

            request.onsuccess = function() {
                resolve();
            };

            request.onerror = function() {
                reject(request.error);
            };

        });

    }
    catch (error) {

        console.warn(
            "Could not delete stored image:",
            error
        );

    }

}


/* =========================================================
   CREATE OBJECT URL
========================================================= */

async function getFileObjectURL(fileId) {

    if (objectURLCache.has(fileId)) {

        return objectURLCache.get(fileId);

    }

    const blob =
        await getStoredFileBlob(fileId);

    if (!blob) {
        return "";
    }

    const url =
        URL.createObjectURL(blob);

    objectURLCache.set(
        fileId,
        url
    );

    return url;

}


/* =========================================================
   REVOKE OBJECT URL
========================================================= */

function revokeFileObjectURL(fileId) {

    const url =
        objectURLCache.get(fileId);

    if (!url) {
        return;
    }

    try {

        URL.revokeObjectURL(url);

    }
    catch (error) {

        /* Ignore cleanup errors. */

    }

    objectURLCache.delete(fileId);

}


/* =========================================================
   REVOKE ALL OBJECT URLS
========================================================= */

function revokeAllObjectURLs() {

    objectURLCache.forEach(function(url) {

        try {

            URL.revokeObjectURL(url);

        }
        catch (error) {

            /* Ignore cleanup errors. */

        }

    });

    objectURLCache.clear();

}


/* =========================================================
   SUBSCRIPTION
========================================================= */

function getCurrentSubscription() {

    try {

        const saved =
            localStorage.getItem(
                SUBSCRIPTION_STORAGE_KEY
            );

        if (!saved) {

            return {
                plan: DEFAULT_STORAGE_PLAN
            };

        }

        const subscription =
            JSON.parse(saved);

        if (typeof subscription === "string") {

            return {
                plan: subscription
            };

        }

        return (
            subscription || {
                plan: DEFAULT_STORAGE_PLAN
            }
        );

    }
    catch (error) {

        return {
            plan: DEFAULT_STORAGE_PLAN
        };

    }

}


/* =========================================================
   CURRENT STORAGE PLAN
========================================================= */

function getCurrentStoragePlan() {

    const subscription =
        getCurrentSubscription();

    const planId =
        subscription.plan ||
        subscription.planId ||
        subscription.id ||
        DEFAULT_STORAGE_PLAN;

    return (
        STORAGE_PLANS[planId] ||
        STORAGE_PLANS[DEFAULT_STORAGE_PLAN]
    );

}


/* =========================================================
   PORTFOLIO STORAGE
========================================================= */

function getPortfolioStorage() {

    const plan =
        getCurrentStoragePlan();

    let storage = {

        version: 2,

        planId: plan.id,

        limitMB: plan.storageMB,

        usedMB: 0,

        albums: [],

        files: []

    };

    try {

        const saved =
            localStorage.getItem(
                PORTFOLIO_STORAGE_KEY
            );

        if (saved) {

            const parsed =
                JSON.parse(saved);

            if (
                parsed &&
                typeof parsed === "object"
            ) {

                storage = {
                    ...storage,
                    ...parsed
                };

            }

        }

    }
    catch (error) {

        console.warn(
            "Could not read portfolio storage:",
            error
        );

    }


    /* -----------------------------------------------------
       DATA SAFETY
    ----------------------------------------------------- */

    if (!Array.isArray(storage.albums)) {
        storage.albums = [];
    }

    if (!Array.isArray(storage.files)) {
        storage.files = [];
    }


    /* -----------------------------------------------------
       NORMALIZE ALBUMS
    ----------------------------------------------------- */

    storage.albums =
        storage.albums.map(function(album) {

            return {

                id:
                    album.id ||
                    createId("album"),

                name:
                    String(
                        album.name || "Untitled Album"
                    ),

                coverFileId:
                    album.coverFileId || null,

                publicVisible:
                    album.publicVisible !== false,

                createdAt:
                    album.createdAt ||
                    new Date().toISOString(),

                updatedAt:
                    album.updatedAt ||
                    album.createdAt ||
                    new Date().toISOString()

            };

        });


    /* -----------------------------------------------------
       NORMALIZE FILE METADATA
    ----------------------------------------------------- */

    storage.files =
        storage.files.map(function(file) {

            return {

                id:
                    file.id ||
                    createId("photo"),

                albumId:
                    file.albumId || null,

                name:
                    String(
                        file.name || "Untitled"
                    ),

                sizeMB:
                    Number(
                        file.sizeMB || 0
                    ),

                sizeBytes:
                    Number(
                        file.sizeBytes ||
                        (
                            Number(file.sizeMB || 0) *
                            1024 *
                            1024
                        )
                    ),

                type:
                    file.type ||
                    "image/*",

                createdAt:
                    file.createdAt ||
                    new Date().toISOString(),

                /*
                   blobUrl is intentionally NOT persisted.

                   The actual image lives in IndexedDB.
                */

                url: ""
            };

        });


    /* -----------------------------------------------------
       CURRENT SUBSCRIPTION ALWAYS CONTROLS LIMIT
    ----------------------------------------------------- */

    storage.planId =
        plan.id;

    storage.limitMB =
        plan.storageMB;


    /* -----------------------------------------------------
       CALCULATE ACTUAL STORAGE
    ----------------------------------------------------- */

    storage.usedMB =
        storage.files.reduce(
            function(total, file) {

                return (
                    total +
                    Number(file.sizeMB || 0)
                );

            },
            0
        );


    return storage;

}


/* =========================================================
   SAVE PORTFOLIO STORAGE
========================================================= */

function savePortfolioStorage(storage) {

    try {

        localStorage.setItem(
            PORTFOLIO_STORAGE_KEY,
            JSON.stringify(storage)
        );

    }
    catch (error) {

        console.error(
            "Could not save portfolio metadata:",
            error
        );

        showGlobalStorageError(
            "Your browser could not save the portfolio information."
        );

        return false;

    }


    renderStorage();

    renderAlbums();

    renderActiveAlbum();

    return true;

}


/* =========================================================
   FORMAT STORAGE
========================================================= */

function formatStorage(mb) {

    mb =
        Number(mb) || 0;


    if (mb >= 1024) {

        const gb =
            mb / 1024;

        if (gb >= 10) {

            return (
                gb.toFixed(0) +
                " GB"
            );

        }

        return (
            gb
                .toFixed(2)
                .replace(/\.00$/, "") +
            " GB"
        );

    }


    if (mb >= 1) {

        return (
            mb.toFixed(0) +
            " MB"
        );

    }


    if (mb > 0) {

        return (
            mb.toFixed(2) +
            " MB"
        );

    }


    return "0 MB";

}


/* =========================================================
   STORAGE STATUS
========================================================= */

function getStorageStatus() {

    const storage =
        getPortfolioStorage();

    const used =
        storage.usedMB;

    const limit =
        storage.limitMB;

    const available =
        Math.max(
            0,
            limit - used
        );

    let percentage =
        limit > 0
            ? (used / limit) * 100
            : 100;

    percentage =
        Math.min(
            100,
            percentage
        );


    let status =
        "available";


    if (used >= limit) {

        status =
            "full";

    }
    else if (percentage >= 80) {

        status =
            "warning";

    }


    return {

        ...storage,

        availableMB:
            available,

        percentage:
            percentage,

        status:
            status

    };

}


/* =========================================================
   FILE SIZE
========================================================= */

function getFileSizeMB(file) {

    return Number(
        (
            file.size /
            (1024 * 1024)
        ).toFixed(4)
    );

}


/* =========================================================
   FILE VALIDATION
========================================================= */

function validateFiles(files) {

    const validFiles = [];

    const invalidFiles = [];

    Array.from(files || []).forEach(function(file) {

        if (
            !file ||
            !file.type ||
            !file.type.startsWith("image/")
        ) {

            invalidFiles.push(file);

            return;

        }

        validFiles.push(file);

    });

    return {

        validFiles:
            validFiles,

        invalidFiles:
            invalidFiles

    };

}


/* =========================================================
   UPLOAD VALIDATION
========================================================= */

function validateUpload(files) {

    const status =
        getStorageStatus();

    const totalMB =
        files.reduce(
            function(total, file) {

                return (
                    total +
                    getFileSizeMB(file)
                );

            },
            0
        );


    return {

        allowed:
            totalMB <= status.availableMB,

        totalMB:
            totalMB,

        availableMB:
            status.availableMB,

        requiredExtraMB:
            Math.max(
                0,
                totalMB -
                status.availableMB
            )

    };

}


/* =========================================================
   RENDER STORAGE
========================================================= */

function renderStorage() {

    const status =
        getStorageStatus();

    const plan =
        getCurrentStoragePlan();


    const planName =
        document.getElementById(
            "planName"
        );

    const usedStorage =
        document.getElementById(
            "usedStorage"
        );

    const availableStorage =
        document.getElementById(
            "availableStorage"
        );

    const totalStorage =
        document.getElementById(
            "totalStorage"
        );

    const progress =
        document.getElementById(
            "storageProgress"
        );

    const badge =
        document.getElementById(
            "storageBadge"
        );

    const message =
        document.getElementById(
            "storageMessage"
        );


    if (planName) {

        planName.textContent =
            plan.name +
            " Plan";

    }


    if (usedStorage) {

        usedStorage.textContent =
            formatStorage(
                status.usedMB
            );

    }


    if (availableStorage) {

        availableStorage.textContent =
            formatStorage(
                status.availableMB
            );

    }


    if (totalStorage) {

        totalStorage.textContent =
            formatStorage(
                status.limitMB
            );

    }


    if (progress) {

        progress.style.width =
            status.percentage +
            "%";

    }


    if (badge) {

        badge.className =
            "storage-badge " +
            status.status;


        if (status.status === "full") {

            badge.textContent =
                "Storage Full";

        }
        else if (
            status.status === "warning"
        ) {

            badge.textContent =
                "Almost Full";

        }
        else {

            badge.textContent =
                "Available";

        }

    }


    if (message) {

        if (status.status === "full") {

            message.textContent =
                "Your storage is full. Delete existing work to make space or upgrade your plan.";

        }
        else if (
            status.status === "warning"
        ) {

            message.textContent =
                formatStorage(
                    status.availableMB
                ) +
                " remaining. Delete unused work or upgrade before you run out.";

        }
        else {

            message.textContent =
                formatStorage(
                    status.availableMB
                ) +
                " remaining on your " +
                plan.name +
                " plan.";

        }

    }

}


/* =========================================================
   ALBUM HELPERS
========================================================= */

function getAlbumById(albumId) {

    const storage =
        getPortfolioStorage();

    return (
        storage.albums.find(
            function(album) {

                return (
                    album.id === albumId
                );

            }
        ) ||
        null
    );

}


function getAlbumFiles(albumId) {

    const storage =
        getPortfolioStorage();

    return storage.files.filter(
        function(file) {

            return (
                file.albumId === albumId
            );

        }
    );

}


function getAlbumStorageMB(albumId) {

    return getAlbumFiles(
        albumId
    ).reduce(
        function(total, file) {

            return (
                total +
                Number(file.sizeMB || 0)
            );

        },
        0
    );

}


/* =========================================================
   ALBUM MODAL
========================================================= */

function openCreateAlbumModal() {

    albumModalMode =
        "create";


    const title =
        document.getElementById(
            "albumModalTitle"
        );

    const input =
        document.getElementById(
            "albumNameInput"
        );

    const saveButton =
        document.getElementById(
            "saveAlbumButton"
        );

    const error =
        document.getElementById(
            "albumFormError"
        );


    if (title) {

        title.textContent =
            "Create Album";

    }


    if (saveButton) {

        saveButton.textContent =
            "Create Album";

    }


    if (input) {

        input.value = "";

    }


    if (error) {

        error.textContent = "";

    }


    openModal(
        "albumModal"
    );


    if (input) {

        setTimeout(
            function() {

                input.focus();

            },
            0
        );

    }

}


/* =========================================================
   RENAME ALBUM MODAL
========================================================= */

function openRenameAlbumModal(albumId) {

    const album =
        getAlbumById(albumId);

    if (!album) {
        return;
    }


    albumModalMode =
        albumId;


    const title =
        document.getElementById(
            "albumModalTitle"
        );

    const input =
        document.getElementById(
            "albumNameInput"
        );

    const saveButton =
        document.getElementById(
            "saveAlbumButton"
        );

    const error =
        document.getElementById(
            "albumFormError"
        );


    if (title) {

        title.textContent =
            "Rename Album";

    }


    if (saveButton) {

        saveButton.textContent =
            "Save Changes";

    }


    if (input) {

        input.value =
            album.name || "";

    }


    if (error) {

        error.textContent = "";

    }


    openModal(
        "albumModal"
    );


    if (input) {

        setTimeout(
            function() {

                input.focus();
                input.select();

            },
            0
        );

    }

}


/* =========================================================
   SAVE ALBUM
========================================================= */

function saveAlbumFromModal() {

    const input =
        document.getElementById(
            "albumNameInput"
        );

    const error =
        document.getElementById(
            "albumFormError"
        );


    const name =
        input
            ? input.value.trim()
            : "";


    if (!name) {

        if (error) {

            error.textContent =
                "Please enter an album name.";

        }

        return;

    }


    const storage =
        getPortfolioStorage();


    /* -----------------------------------------------------
       CREATE
    ----------------------------------------------------- */

    if (
        albumModalMode === "create"
    ) {

        const duplicate =
            storage.albums.some(
                function(album) {

                    return (
                        String(
                            album.name || ""
                        )
                            .trim()
                            .toLowerCase() ===
                        name.toLowerCase()
                    );

                }
            );


        if (duplicate) {

            if (error) {

                error.textContent =
                    "An album with this name already exists.";

            }

            return;

        }


        const newAlbum = {

            id:
                createId("album"),

            name:
                name,

            coverFileId:
                null,

            publicVisible:
                true,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        storage.albums.push(
            newAlbum
        );


        savePortfolioStorage(
            storage
        );


        closeModal(
            "albumModal"
        );


        openAlbum(
            newAlbum.id
        );


        return;

    }


    /* -----------------------------------------------------
       RENAME
    ----------------------------------------------------- */

    const album =
        storage.albums.find(
            function(item) {

                return (
                    item.id ===
                    albumModalMode
                );

            }
        );


    if (!album) {

        closeModal(
            "albumModal"
        );

        return;

    }


    const duplicate =
        storage.albums.some(
            function(item) {

                return (

                    item.id !== album.id &&

                    String(
                        item.name || ""
                    )
                        .trim()
                        .toLowerCase() ===
                    name.toLowerCase()

                );

            }
        );


    if (duplicate) {

        if (error) {

            error.textContent =
                "An album with this name already exists.";

        }

        return;

    }


    album.name =
        name;

    album.updatedAt =
        new Date().toISOString();


    savePortfolioStorage(
        storage
    );


    closeModal(
        "albumModal"
    );


    if (
        activeAlbumId === album.id
    ) {

        const activeName =
            document.getElementById(
                "activeAlbumName"
            );

        if (activeName) {

            activeName.textContent =
                album.name;

        }

    }

}


/* =========================================================
   RENDER ALBUMS
========================================================= */

function renderAlbums() {

    const storage =
        getPortfolioStorage();

    const grid =
        document.getElementById(
            "albumGrid"
        );

    const emptyState =
        document.getElementById(
            "albumEmptyState"
        );


    if (!grid) {
        return;
    }


    if (!storage.albums.length) {

        grid.innerHTML = "";

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    grid.innerHTML =
        storage.albums
            .map(
                function(album) {

                    const files =
                        storage.files.filter(
                            function(file) {

                                return (
                                    file.albumId ===
                                    album.id
                                );

                            }
                        );


                    let coverFile =
                        files.find(
                            function(file) {

                                return (
                                    file.id ===
                                    album.coverFileId
                                );

                            }
                        );


                    if (!coverFile) {

                        coverFile =
                            files[0] ||
                            null;

                    }


                    const photoCount =
                        files.length;


                    const albumStorage =
                        files.reduce(
                            function(total, file) {

                                return (
                                    total +
                                    Number(
                                        file.sizeMB || 0
                                    )
                                );

                            },
                            0
                        );


                    return `

                        <article
                            class="album-card"
                            data-album-id="${escapeAttribute(album.id)}">

                            <div class="album-cover">

                                ${
                                    coverFile
                                        ? `
                                            <img
                                                data-cover-file="${escapeAttribute(coverFile.id)}"
                                                alt="${escapeAttribute(album.name || "Album")}"
                                                loading="lazy">
                                          `
                                        : `
                                            <div class="album-cover-empty">
                                                ▧
                                            </div>
                                          `
                                }

                                <span class="album-photo-count">

                                    ${photoCount}

                                    ${
                                        photoCount === 1
                                            ? "photo"
                                            : "photos"
                                    }

                                </span>

                            </div>


                            <div class="album-card-body">

                                <span
                                    class="album-name"
                                    title="${escapeAttribute(album.name || "")}">

                                    ${escapeHTML(
                                        album.name ||
                                        "Untitled Album"
                                    )}

                                </span>


                                <div class="album-meta">

                                    ${formatStorage(
                                        albumStorage
                                    )}

                                    ·

                                    ${photoCount}

                                    ${
                                        photoCount === 1
                                            ? "photo"
                                            : "photos"
                                    }

                                </div>


                                <div class="album-card-actions">

                                    <button
                                        class="album-open-button"
                                        type="button"
                                        data-open-album="${escapeAttribute(album.id)}">

                                        Open Album

                                    </button>


                                    <button
                                        class="album-action-button"
                                        type="button"
                                        data-rename-album="${escapeAttribute(album.id)}">

                                        Rename

                                    </button>


                                    <button
                                        class="album-action-button album-delete-button"
                                        type="button"
                                        data-delete-album="${escapeAttribute(album.id)}">

                                        Delete

                                    </button>

                                </div>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    /* -----------------------------------------------------
       HYDRATE ALBUM COVERS
    ----------------------------------------------------- */

    grid
        .querySelectorAll(
            "[data-cover-file]"
        )
        .forEach(
            async function(image) {

                const fileId =
                    image.getAttribute(
                        "data-cover-file"
                    );

                const url =
                    await getFileObjectURL(
                        fileId
                    );

                if (url) {

                    image.src =
                        url;

                }

            }
        );


    /* -----------------------------------------------------
       OPEN
    ----------------------------------------------------- */

    grid
        .querySelectorAll(
            "[data-open-album]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        openAlbum(
                            button.getAttribute(
                                "data-open-album"
                            )
                        );

                    }
                );

            }
        );


    /* -----------------------------------------------------
       RENAME
    ----------------------------------------------------- */

    grid
        .querySelectorAll(
            "[data-rename-album]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        openRenameAlbumModal(
                            button.getAttribute(
                                "data-rename-album"
                            )
                        );

                    }
                );

            }
        );


    /* -----------------------------------------------------
       DELETE
    ----------------------------------------------------- */

    grid
        .querySelectorAll(
            "[data-delete-album]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        openDeleteAlbumModal(
                            button.getAttribute(
                                "data-delete-album"
                            )
                        );

                    }
                );

            }
        );

}


/* =========================================================
   OPEN ALBUM
========================================================= */

function openAlbum(albumId) {

    const album =
        getAlbumById(albumId);

    if (!album) {
        return;
    }


    activeAlbumId =
        albumId;


    const albumSection =
        document.getElementById(
            "albumViewSection"
        );

    const activeName =
        document.getElementById(
            "activeAlbumName"
        );


    if (albumSection) {

        albumSection.classList.add(
            "active"
        );

    }


    if (activeName) {

        activeName.textContent =
            album.name ||
            "Untitled Album";

    }


    selectedFiles = [];


    const input =
        document.getElementById(
            "imageInput"
        );

    if (input) {

        input.value = "";

    }


    renderSelectedFiles();

    renderActiveAlbum();


    if (albumSection) {

        albumSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   CLOSE ALBUM
========================================================= */

function closeAlbumView() {

    activeAlbumId =
        null;

    selectedFiles =
        [];


    const albumSection =
        document.getElementById(
            "albumViewSection"
        );


    if (albumSection) {

        albumSection.classList.remove(
            "active"
        );

    }


    const input =
        document.getElementById(
            "imageInput"
        );


    if (input) {

        input.value = "";

    }


    renderSelectedFiles();

}


/* =========================================================
   RENDER ACTIVE ALBUM
========================================================= */

function renderActiveAlbum() {

    if (!activeAlbumId) {
        return;
    }


    const album =
        getAlbumById(
            activeAlbumId
        );


    if (!album) {

        closeAlbumView();

        return;

    }


    const files =
        getAlbumFiles(
            activeAlbumId
        );


    const activeName =
        document.getElementById(
            "activeAlbumName"
        );

    const activeMeta =
        document.getElementById(
            "activeAlbumMeta"
        );

    const photoCount =
        document.getElementById(
            "photoCount"
        );

    const photoGrid =
        document.getElementById(
            "photoGrid"
        );

    const emptyState =
        document.getElementById(
            "albumPhotoEmpty"
        );


    if (activeName) {

        activeName.textContent =
            album.name ||
            "Untitled Album";

    }


    const countText =
        files.length +
        (
            files.length === 1
                ? " photo"
                : " photos"
        ) +
        " · " +
        formatStorage(
            getAlbumStorageMB(
                activeAlbumId
            )
        );


    if (activeMeta) {

        activeMeta.textContent =
            countText;

    }


    if (photoCount) {

        photoCount.textContent =
            files.length +
            (
                files.length === 1
                    ? " photo"
                    : " photos"
            );

    }


    if (!photoGrid) {
        return;
    }


    if (!files.length) {

        photoGrid.innerHTML = "";

        if (emptyState) {

            emptyState.classList.add(
                "visible"
            );

        }

        return;

    }


    if (emptyState) {

        emptyState.classList.remove(
            "visible"
        );

    }


    photoGrid.innerHTML =
        files
            .map(
                function(file) {

                    const isCover =
                        file.id ===
                        album.coverFileId;


                    return `

                        <article
                            class="photo-card">

                            <div class="photo-image-wrap">

                                <img
                                    class="photo-image"
                                    data-photo-file="${escapeAttribute(file.id)}"
                                    alt="${escapeAttribute(file.name || "Photo")}"
                                    loading="lazy">

                                ${
                                    isCover
                                        ? `
                                            <span class="cover-badge">
                                                Album Cover
                                            </span>
                                          `
                                        : ""
                                }

                            </div>


                            <div class="photo-card-body">

                                <span
                                    class="photo-name"
                                    title="${escapeAttribute(file.name || "")}">

                                    ${escapeHTML(
                                        file.name ||
                                        "Untitled"
                                    )}

                                </span>


                                <div class="photo-meta">

                                    ${formatStorage(
                                        file.sizeMB
                                    )}

                                </div>


                                <div class="photo-actions">

                                    ${
                                        isCover
                                            ? `
                                                <button
                                                    class="photo-action-button"
                                                    type="button"
                                                    disabled>

                                                    Album Cover

                                                </button>
                                              `
                                            : `
                                                <button
                                                    class="photo-action-button"
                                                    type="button"
                                                    data-set-cover="${escapeAttribute(file.id)}">

                                                    Set Cover

                                                </button>
                                              `
                                    }


                                    <button
                                        class="photo-action-button photo-delete-button"
                                        type="button"
                                        data-delete-photo="${escapeAttribute(file.id)}">

                                        Delete

                                    </button>

                                </div>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    /* -----------------------------------------------------
       HYDRATE IMAGES FROM INDEXEDDB
    ----------------------------------------------------- */

    photoGrid
        .querySelectorAll(
            "[data-photo-file]"
        )
        .forEach(
            async function(image) {

                const fileId =
                    image.getAttribute(
                        "data-photo-file"
                    );

                const url =
                    await getFileObjectURL(
                        fileId
                    );

                if (url) {

                    image.src =
                        url;

                }
                else {

                    image.alt =
                        "Image unavailable";

                }

            }
        );


    /* -----------------------------------------------------
       SET COVER
    ----------------------------------------------------- */

    photoGrid
        .querySelectorAll(
            "[data-set-cover]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        setAlbumCover(
                            button.getAttribute(
                                "data-set-cover"
                            )
                        );

                    }
                );

            }
        );


    /* -----------------------------------------------------
       DELETE PHOTO
    ----------------------------------------------------- */

    photoGrid
        .querySelectorAll(
            "[data-delete-photo]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        openDeletePhotoModal(
                            button.getAttribute(
                                "data-delete-photo"
                            )
                        );

                    }
                );

            }
        );

}


/* =========================================================
   CREATE ALBUM
========================================================= */

function createAlbum() {

    openCreateAlbumModal();

}


/* =========================================================
   DELETE ALBUM MODAL
========================================================= */

function openDeleteAlbumModal(albumId) {

    const album =
        getAlbumById(albumId);

    if (!album) {
        return;
    }


    pendingDeleteType =
        "album";

    pendingDeleteId =
        albumId;


    const title =
        document.getElementById(
            "deleteTitle"
        );

    const description =
        document.getElementById(
            "deleteDescription"
        );

    const confirmButton =
        document.getElementById(
            "confirmDelete"
        );


    if (title) {

        title.textContent =
            "Delete this album?";

    }


    if (description) {

        const fileCount =
            getAlbumFiles(
                albumId
            ).length;

        const storage =
            getAlbumStorageMB(
                albumId
            );


        description.textContent =
            '"' +
            album.name +
            '" and its ' +
            fileCount +
            (
                fileCount === 1
                    ? " photo"
                    : " photos"
            ) +
            " will be removed. " +
            formatStorage(storage) +
            " of storage will be freed.";

    }


    if (confirmButton) {

        confirmButton.textContent =
            "Delete Album";

    }


    openModal(
        "deleteModal"
    );

}


/* =========================================================
   DELETE PHOTO MODAL
========================================================= */

function openDeletePhotoModal(fileId) {

    const storage =
        getPortfolioStorage();


    const file =
        storage.files.find(
            function(item) {

                return (
                    item.id === fileId
                );

            }
        );


    if (!file) {
        return;
    }


    pendingDeleteType =
        "photo";

    pendingDeleteId =
        fileId;


    const title =
        document.getElementById(
            "deleteTitle"
        );

    const description =
        document.getElementById(
            "deleteDescription"
        );

    const confirmButton =
        document.getElementById(
            "confirmDelete"
        );


    if (title) {

        title.textContent =
            "Delete this photo?";

    }


    if (description) {

        description.textContent =
            '"' +
            file.name +
            '" will be removed and ' +
            formatStorage(
                file.sizeMB
            ) +
            " of storage will be freed.";

    }


    if (confirmButton) {

        confirmButton.textContent =
            "Delete Photo";

    }


    openModal(
        "deleteModal"
    );

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

function confirmDelete() {

    if (
        !pendingDeleteType ||
        !pendingDeleteId
    ) {

        return;

    }


    if (
        pendingDeleteType ===
        "photo"
    ) {

        deletePhoto(
            pendingDeleteId
        );

    }
    else if (
        pendingDeleteType ===
        "album"
    ) {

        deleteAlbum(
            pendingDeleteId
        );

    }

}


/* =========================================================
   DELETE PHOTO
========================================================= */

async function deletePhoto(fileId) {

    const storage =
        getPortfolioStorage();


    const index =
        storage.files.findIndex(
            function(file) {

                return (
                    file.id === fileId
                );

            }
        );


    if (index === -1) {

        closeDeleteModal();

        return;

    }


    const file =
        storage.files[index];


    const albumId =
        file.albumId;


    storage.files.splice(
        index,
        1
    );


    /* -----------------------------------------------------
       UPDATE COVER
    ----------------------------------------------------- */

    const album =
        storage.albums.find(
            function(item) {

                return (
                    item.id === albumId
                );

            }
        );


    if (
        album &&
        album.coverFileId === fileId
    ) {

        const replacement =
            storage.files.find(
                function(item) {

                    return (
                        item.albumId ===
                        albumId
                    );

                }
            );


        album.coverFileId =
            replacement
                ? replacement.id
                : null;

        album.updatedAt =
            new Date().toISOString();

    }


    /* -----------------------------------------------------
       DELETE ACTUAL BLOB
    ----------------------------------------------------- */

    await deleteStoredFileBlob(
        fileId
    );


    revokeFileObjectURL(
        fileId
    );


    savePortfolioStorage(
        storage
    );


    closeDeleteModal();


    const status =
        document.getElementById(
            "uploadStatus"
        );


    if (status) {

        status.className =
            "upload-status success";

        status.textContent =
            "Photo deleted. " +
            formatStorage(
                file.sizeMB
            ) +
            " of storage is now available.";

    }

}


/* =========================================================
   DELETE ALBUM
========================================================= */

async function deleteAlbum(albumId) {

    const storage =
        getPortfolioStorage();


    const albumIndex =
        storage.albums.findIndex(
            function(album) {

                return (
                    album.id === albumId
                );

            }
        );


    if (albumIndex === -1) {

        closeDeleteModal();

        return;

    }


    const album =
        storage.albums[albumIndex];


    const filesToDelete =
        storage.files.filter(
            function(file) {

                return (
                    file.albumId ===
                    albumId
                );

            }
        );


    const freedStorage =
        filesToDelete.reduce(
            function(total, file) {

                return (
                    total +
                    Number(
                        file.sizeMB || 0
                    )
                );

            },
            0
        );


    /* -----------------------------------------------------
       DELETE BLOBS
    ----------------------------------------------------- */

    for (
        const file
        of filesToDelete
    ) {

        await deleteStoredFileBlob(
            file.id
        );

        revokeFileObjectURL(
            file.id
        );

    }


    /* -----------------------------------------------------
       DELETE METADATA
    ----------------------------------------------------- */

    storage.files =
        storage.files.filter(
            function(file) {

                return (
                    file.albumId !==
                    albumId
                );

            }
        );


    storage.albums.splice(
        albumIndex,
        1
    );


    savePortfolioStorage(
        storage
    );


    closeDeleteModal();


    if (
        activeAlbumId ===
        albumId
    ) {

        closeAlbumView();

    }


    const status =
        document.getElementById(
            "uploadStatus"
        );


    if (status) {

        status.className =
            "upload-status success";

        status.textContent =
            "Album deleted. " +
            formatStorage(
                freedStorage
            ) +
            " of storage is now available.";

    }

}


/* =========================================================
   SET ALBUM COVER
========================================================= */

function setAlbumCover(fileId) {

    if (!activeAlbumId) {
        return;
    }


    const storage =
        getPortfolioStorage();


    const file =
        storage.files.find(
            function(item) {

                return (
                    item.id === fileId
                );

            }
        );


    if (
        !file ||
        file.albumId !==
        activeAlbumId
    ) {

        return;

    }


    const album =
        storage.albums.find(
            function(item) {

                return (
                    item.id ===
                    activeAlbumId
                );

            }
        );


    if (!album) {
        return;
    }


    album.coverFileId =
        fileId;

    album.updatedAt =
        new Date().toISOString();


    savePortfolioStorage(
        storage
    );


    const status =
        document.getElementById(
            "uploadStatus"
        );


    if (status) {

        status.className =
            "upload-status success";

        status.textContent =
            '"' +
            file.name +
            '" is now the album cover."';

    }

}


/* =========================================================
   FILE SELECTION
========================================================= */

function handleFileSelection(event) {

    const selected =
        Array.from(
            event.target.files || []
        );


    const validation =
        validateFiles(
            selected
        );


    selectedFiles =
        validation.validFiles;


    renderSelectedFiles();


    if (
        validation.invalidFiles.length
    ) {

        showUploadError(
            "Only image files can be uploaded to Recent Work."
        );

    }

}


/* =========================================================
   SELECTED FILES
========================================================= */

function renderSelectedFiles() {

    const container =
        document.getElementById(
            "selectedFiles"
        );

    const uploadButton =
        document.getElementById(
            "uploadButton"
        );


    if (!container) {
        return;
    }


    if (!selectedFiles.length) {

        container.innerHTML =
            "<p>No files selected.</p>";


        if (uploadButton) {

            uploadButton.disabled =
                true;

        }

        return;

    }


    const validation =
        validateUpload(
            selectedFiles
        );


    container.innerHTML =
        selectedFiles
            .map(
                function(file) {

                    const sizeMB =
                        getFileSizeMB(
                            file
                        );


                    return `

                        <div class="selected-file">

                            <span>

                                ${escapeHTML(
                                    file.name
                                )}

                            </span>

                            <span>

                                ${formatStorage(
                                    sizeMB
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join("");


    if (uploadButton) {

        uploadButton.disabled =
            !activeAlbumId ||
            !validation.allowed;

    }


    const status =
        document.getElementById(
            "uploadStatus"
        );


    if (status) {

        status.className =
            "upload-status";


        if (!validation.allowed) {

            status.classList.add(
                "error"
            );


            status.textContent =
                "Not enough storage. This upload needs " +
                formatStorage(
                    validation.totalMB
                ) +
                ", but only " +
                formatStorage(
                    validation.availableMB
                ) +
                " is available. Delete existing photos or upgrade your plan.";

        }
        else {

            status.textContent =
                formatStorage(
                    validation.totalMB
                ) +
                " selected. You have enough storage.";

        }

    }

}


/* =========================================================
   UPLOAD
========================================================= */

async function uploadSelectedFiles() {

    if (
        !selectedFiles.length ||
        !activeAlbumId
    ) {

        return;

    }


    const validation =
        validateUpload(
            selectedFiles
        );


    if (!validation.allowed) {

        showUploadError(
            "Not enough storage. Delete existing photos to make space or upgrade your plan."
        );

        return;

    }


    const storage =
        getPortfolioStorage();


    const albumExists =
        storage.albums.some(
            function(album) {

                return (
                    album.id ===
                    activeAlbumId
                );

            }
        );


    if (!albumExists) {

        showUploadError(
            "This album no longer exists."
        );

        return;

    }


    const uploadButton =
        document.getElementById(
            "uploadButton"
        );


    if (uploadButton) {

        uploadButton.disabled =
            true;

        uploadButton.textContent =
            "Uploading...";

    }


    const status =
        document.getElementById(
            "uploadStatus"
        );


    if (status) {

        status.className =
            "upload-status";

        status.textContent =
            "Preparing your photos...";

    }


    const newFiles = [];


    try {

        /* -------------------------------------------------
           STORE EACH ORIGINAL FILE IN INDEXEDDB
        ------------------------------------------------- */

        for (
            const file
            of selectedFiles
        ) {

            const id =
                createId("photo");


            await storeFileBlob(
                id,
                file
            );


            newFiles.push({

                id:
                    id,

                albumId:
                    activeAlbumId,

                name:
                    file.name,

                sizeMB:
                    getFileSizeMB(file),

                sizeBytes:
                    file.size,

                type:
                    file.type,

                createdAt:
                    new Date().toISOString()

            });

        }


        /* -------------------------------------------------
           ADD METADATA
        ------------------------------------------------- */

        storage.files.push(
            ...newFiles
        );


        /* -------------------------------------------------
           FIRST IMAGE BECOMES COVER
        ------------------------------------------------- */

        const album =
            storage.albums.find(
                function(item) {

                    return (
                        item.id ===
                        activeAlbumId
                    );

                }
            );


        if (
            album &&
            !album.coverFileId &&
            newFiles.length
        ) {

            album.coverFileId =
                newFiles[0].id;

        }


        if (album) {

            album.updatedAt =
                new Date().toISOString();

        }


        /* -------------------------------------------------
           SAVE METADATA
        ------------------------------------------------- */

        const saved =
            savePortfolioStorage(
                storage
            );


        if (!saved) {

            /*
               Metadata could not be saved.

               Remove the blobs we just created
               so we do not leave orphaned files.
            */

            for (
                const file
                of newFiles
            ) {

                await deleteStoredFileBlob(
                    file.id
                );

            }

            throw new Error(
                "Could not save portfolio metadata."
            );

        }


        /* -------------------------------------------------
           RESET SELECTION
        ------------------------------------------------- */

        selectedFiles = [];


        const input =
            document.getElementById(
                "imageInput"
            );


        if (input) {

            input.value = "";

        }


        if (status) {

            status.className =
                "upload-status success";

            status.textContent =
                newFiles.length +
                (
                    newFiles.length === 1
                        ? " photo"
                        : " photos"
                ) +
                " uploaded successfully.";

        }


        renderSelectedFiles();

        renderStorage();

        renderAlbums();

        renderActiveAlbum();

    }
    catch (error) {

        console.error(
            "Portfolio upload failed:",
            error
        );


        /*
           Clean up any blobs that were successfully
           stored before the failure.
        */

        for (
            const file
            of newFiles
        ) {

            await deleteStoredFileBlob(
                file.id
            );

        }


        showUploadError(
            "The photos could not be uploaded. Please try again."
        );

    }
    finally {

        if (uploadButton) {

            uploadButton.disabled =
                !selectedFiles.length;

            uploadButton.textContent =
                "Upload Photos";

        }

    }

}


/* =========================================================
   UPLOAD ERROR
========================================================= */

function showUploadError(message) {

    const status =
        document.getElementById(
            "uploadStatus"
        );


    if (!status) {
        return;
    }


    status.className =
        "upload-status error";

    status.textContent =
        message;

}


/* =========================================================
   GLOBAL STORAGE ERROR
========================================================= */

function showGlobalStorageError(message) {

    console.warn(
        message
    );

}


/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(modalId) {

    const modal =
        document.getElementById(
            modalId
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function closeModal(modalId) {

    const modal =
        document.getElementById(
            modalId
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    const anyOpenModal =
        document.querySelector(
            ".modal-backdrop.open"
        );


    if (!anyOpenModal) {

        document.body.style.overflow =
            "";

    }

}


/* =========================================================
   DELETE MODAL CLOSE
========================================================= */

function closeDeleteModal() {

    pendingDeleteType =
        null;

    pendingDeleteId =
        null;


    closeModal(
        "deleteModal"
    );

}


/* =========================================================
   ALBUM MODAL CLOSE
========================================================= */

function closeAlbumModal() {

    albumModalMode =
        "create";


    closeModal(
        "albumModal"
    );

}


/* =========================================================
   HELPERS
========================================================= */

function createId(prefix) {

    return (

        (prefix || "item") +
        "-" +
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 8)

    );

}


function escapeHTML(value) {

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


function escapeAttribute(value) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    const createAlbumButton =
        document.getElementById(
            "createAlbumButton"
        );

    const emptyCreateAlbum =
        document.getElementById(
            "emptyCreateAlbum"
        );

    const saveAlbumButton =
        document.getElementById(
            "saveAlbumButton"
        );

    const cancelAlbumModalButton =
        document.getElementById(
            "cancelAlbumModal"
        );

    const closeAlbumModalButton =
        document.getElementById(
            "closeAlbumModal"
        );

    const albumModal =
        document.getElementById(
            "albumModal"
        );

    const albumNameInput =
        document.getElementById(
            "albumNameInput"
        );

    const imageInput =
        document.getElementById(
            "imageInput"
        );

    const uploadButton =
        document.getElementById(
            "uploadButton"
        );

    const backToAlbums =
        document.getElementById(
            "backToAlbums"
        );

    const renameAlbumButton =
        document.getElementById(
            "renameAlbumButton"
        );

    const deleteAlbumButton =
        document.getElementById(
            "deleteAlbumButton"
        );

    const cancelDelete =
        document.getElementById(
            "cancelDelete"
        );

    const closeDelete =
        document.getElementById(
            "closeDeleteModal"
        );

    const confirmDeleteButton =
        document.getElementById(
            "confirmDelete"
        );

    const deleteModal =
        document.getElementById(
            "deleteModal"
        );

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    /* -----------------------------------------------------
       CREATE ALBUM
    ----------------------------------------------------- */

    if (createAlbumButton) {

        createAlbumButton.addEventListener(
            "click",
            createAlbum
        );

    }


    if (emptyCreateAlbum) {

        emptyCreateAlbum.addEventListener(
            "click",
            createAlbum
        );

    }


    /* -----------------------------------------------------
       ALBUM MODAL
    ----------------------------------------------------- */

    if (saveAlbumButton) {

        saveAlbumButton.addEventListener(
            "click",
            saveAlbumFromModal
        );

    }


    if (cancelAlbumModalButton) {

        cancelAlbumModalButton.addEventListener(
            "click",
            closeAlbumModal
        );

    }


    if (closeAlbumModalButton) {

        closeAlbumModalButton.addEventListener(
            "click",
            closeAlbumModal
        );

    }


    if (albumNameInput) {

        albumNameInput.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    saveAlbumFromModal();

                }

            }
        );

    }


    if (albumModal) {

        albumModal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    albumModal
                ) {

                    closeAlbumModal();

                }

            }
        );

    }


    /* -----------------------------------------------------
       IMAGE INPUT
    ----------------------------------------------------- */

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            handleFileSelection
        );

    }


    /* -----------------------------------------------------
       UPLOAD
    ----------------------------------------------------- */

    if (uploadButton) {

        uploadButton.addEventListener(
            "click",
            uploadSelectedFiles
        );

    }


    /* -----------------------------------------------------
       ALBUM VIEW
    ----------------------------------------------------- */

    if (backToAlbums) {

        backToAlbums.addEventListener(
            "click",
            closeAlbumView
        );

    }


    if (renameAlbumButton) {

        renameAlbumButton.addEventListener(
            "click",
            function() {

                if (activeAlbumId) {

                    openRenameAlbumModal(
                        activeAlbumId
                    );

                }

            }
        );

    }


    if (deleteAlbumButton) {

        deleteAlbumButton.addEventListener(
            "click",
            function() {

                if (activeAlbumId) {

                    openDeleteAlbumModal(
                        activeAlbumId
                    );

                }

            }
        );

    }


    /* -----------------------------------------------------
       DELETE MODAL
    ----------------------------------------------------- */

    if (cancelDelete) {

        cancelDelete.addEventListener(
            "click",
            closeDeleteModal
        );

    }


    if (closeDelete) {

        closeDelete.addEventListener(
            "click",
            closeDeleteModal
        );

    }


    if (confirmDeleteButton) {

        confirmDeleteButton.addEventListener(
            "click",
            confirmDelete
        );

    }


    if (deleteModal) {

        deleteModal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    deleteModal
                ) {

                    closeDeleteModal();

                }

            }
        );

    }


    /* -----------------------------------------------------
       ESCAPE
    ----------------------------------------------------- */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeDeleteModal();

                closeAlbumModal();

            }

        }
    );


    /* -----------------------------------------------------
       STORAGE SYNCHRONIZATION
    ----------------------------------------------------- */

    window.addEventListener(
        "storage",
        function(event) {

            if (
                event.key ===
                    PORTFOLIO_STORAGE_KEY ||
                event.key ===
                    SUBSCRIPTION_STORAGE_KEY
            ) {

                renderStorage();

                renderAlbums();

                renderActiveAlbum();

            }

        }
    );


    /* -----------------------------------------------------
       MOBILE SIDEBAR
    ----------------------------------------------------- */

    if (
        mobileMenu &&
        sidebar
    ) {

        mobileMenu.addEventListener(
            "click",
            function() {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );

    }


    /* -----------------------------------------------------
       CLOSE MOBILE SIDEBAR WHEN NAV LINK IS CLICKED
    ----------------------------------------------------- */

    if (sidebar) {

        sidebar
            .querySelectorAll(
                ".nav-link"
            )
            .forEach(
                function(link) {

                    link.addEventListener(
                        "click",
                        function() {

                            sidebar.classList.remove(
                                "open"
                            );

                        }
                    );

                }
            );

    }

}


/* =========================================================
   CLEAN ORPHANED OBJECT URLS ON PAGE EXIT
========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        revokeAllObjectURLs();

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

async function initializeRecentWork() {

    const albumModal =
        document.getElementById(
            "albumModal"
        );

    const deleteModal =
        document.getElementById(
            "deleteModal"
        );


    /* -----------------------------------------------------
       FORCE MODALS CLOSED
    ----------------------------------------------------- */

    if (albumModal) {

        albumModal.classList.remove(
            "open"
        );

        albumModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if (deleteModal) {

        deleteModal.classList.remove(
            "open"
        );

        deleteModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    document.body.style.overflow =
        "";


    activeAlbumId =
        null;

    selectedFiles =
        [];

    pendingDeleteType =
        null;

    pendingDeleteId =
        null;


    /* -----------------------------------------------------
       OPEN DATABASE FIRST
    ----------------------------------------------------- */

    try {

        await openPortfolioDatabase();

    }
    catch (error) {

        console.error(
            "Portfolio storage database could not be opened:",
            error
        );

    }


    /* -----------------------------------------------------
       RENDER
    ----------------------------------------------------- */

    renderStorage();

    renderSelectedFiles();

    renderAlbums();

    renderActiveAlbum();

    setupEvents();

}


/* =========================================================
   START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeRecentWork
    );

}
else {

    initializeRecentWork();

}