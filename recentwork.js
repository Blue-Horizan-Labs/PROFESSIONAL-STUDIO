"use strict";

/* =========================================================
   RECENT WORK
   Professional Studio
   Frontend storage architecture:
   - localStorage = album + storage metadata
   - IndexedDB = actual image files
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

const DB_NAME =
    "ProfessionalStudioDB";

const DB_VERSION = 1;

const PHOTO_STORE =
    "recentWorkPhotos";

let database = null;


/* =========================================================
   STATE
   ========================================================= */

let selectedFiles = [];

let activeAlbumId = null;

let pendingDeleteType = null;

let pendingDeleteId = null;

let albumModalMode = "create";


/* =========================================================
   INDEXEDDB
   ========================================================= */

function openDatabase() {

    return new Promise(function(resolve, reject) {

        if (database) {
            resolve(database);
            return;
        }

        if (!window.indexedDB) {

            reject(
                new Error(
                    "IndexedDB is not supported by this browser."
                )
            );

            return;
        }

        const request =
            window.indexedDB.open(
                DB_NAME,
                DB_VERSION
            );

        request.onupgradeneeded =
            function(event) {

                const db =
                    event.target.result;

                if (!db.objectStoreNames.contains(PHOTO_STORE)) {

                    const store =
                        db.createObjectStore(
                            PHOTO_STORE,
                            {
                                keyPath: "id"
                            }
                        );

                    store.createIndex(
                        "albumId",
                        "albumId",
                        {
                            unique: false
                        }
                    );

                }

            };

        request.onsuccess =
            function(event) {

                database =
                    event.target.result;

                resolve(database);

            };

        request.onerror =
            function() {

                reject(
                    request.error ||
                    new Error(
                        "Could not open image storage."
                    )
                );

            };

    });

}


/* =========================================================
   SAVE PHOTO BLOB
   ========================================================= */

function savePhotoBlob(photoRecord) {

    return openDatabase()
        .then(function(db) {

            return new Promise(
                function(resolve, reject) {

                    const transaction =
                        db.transaction(
                            PHOTO_STORE,
                            "readwrite"
                        );

                    const store =
                        transaction.objectStore(
                            PHOTO_STORE
                        );

                    const request =
                        store.put(
                            photoRecord
                        );

                    request.onsuccess =
                        function() {
                            resolve();
                        };

                    request.onerror =
                        function() {
                            reject(
                                request.error ||
                                new Error(
                                    "Could not save photo."
                                )
                            );
                        };

                }
            );

        });

}


/* =========================================================
   GET PHOTO BLOB
   ========================================================= */

function getPhotoBlob(photoId) {

    return openDatabase()
        .then(function(db) {

            return new Promise(
                function(resolve, reject) {

                    const transaction =
                        db.transaction(
                            PHOTO_STORE,
                            "readonly"
                        );

                    const store =
                        transaction.objectStore(
                            PHOTO_STORE
                        );

                    const request =
                        store.get(
                            photoId
                        );

                    request.onsuccess =
                        function() {

                            resolve(
                                request.result || null
                            );

                        };

                    request.onerror =
                        function() {

                            reject(
                                request.error ||
                                new Error(
                                    "Could not read photo."
                                )
                            );

                        };

                }
            );

        });

}


/* =========================================================
   DELETE PHOTO BLOB
   ========================================================= */

function deletePhotoBlob(photoId) {

    return openDatabase()
        .then(function(db) {

            return new Promise(
                function(resolve, reject) {

                    const transaction =
                        db.transaction(
                            PHOTO_STORE,
                            "readwrite"
                        );

                    const store =
                        transaction.objectStore(
                            PHOTO_STORE
                        );

                    const request =
                        store.delete(
                            photoId
                        );

                    request.onsuccess =
                        function() {
                            resolve();
                        };

                    request.onerror =
                        function() {

                            reject(
                                request.error ||
                                new Error(
                                    "Could not delete photo."
                                )
                            );

                        };

                }
            );

        });

}


/* =========================================================
   DELETE MULTIPLE PHOTO BLOBS
   ========================================================= */

function deletePhotoBlobs(photoIds) {

    if (!photoIds.length) {
        return Promise.resolve();
    }

    return openDatabase()
        .then(function(db) {

            return new Promise(
                function(resolve, reject) {

                    const transaction =
                        db.transaction(
                            PHOTO_STORE,
                            "readwrite"
                        );

                    const store =
                        transaction.objectStore(
                            PHOTO_STORE
                        );

                    photoIds.forEach(
                        function(photoId) {

                            store.delete(
                                photoId
                            );

                        }
                    );

                    transaction.oncomplete =
                        function() {
                            resolve();
                        };

                    transaction.onerror =
                        function() {

                            reject(
                                transaction.error ||
                                new Error(
                                    "Could not delete photos."
                                )
                            );

                        };

                }
            );

        });

}


/* =========================================================
   GET CURRENT SUBSCRIPTION
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
   GET PORTFOLIO STORAGE
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
            "Could not read gallery storage:",
            error
        );

    }


    if (!Array.isArray(storage.albums)) {

        storage.albums = [];

    }


    if (!Array.isArray(storage.files)) {

        storage.files = [];

    }


    /*
       The subscription determines
       the current storage limit.
    */

    storage.planId =
        plan.id;

    storage.limitMB =
        plan.storageMB;


    /*
       Recalculate usage from actual
       stored file metadata.
    */

    storage.usedMB =
        storage.files.reduce(
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


    /*
       Ensure all albums have the
       fields required by the current
       frontend data model.
    */

    storage.albums =
        storage.albums.map(
            function(album) {

                return {

                    id:
                        album.id ||
                        createId("album"),

                    name:
                        album.name ||
                        "Untitled Album",

                    coverFileId:
                        album.coverFileId ||
                        null,

                    isPublic:
                        album.isPublic !== false,

                    createdAt:
                        album.createdAt ||
                        new Date().toISOString()

                };

            }
        );


    /*
       Ensure file metadata is valid.
       Actual binary data lives in IndexedDB.
    */

    storage.files =
        storage.files.map(
            function(file) {

                return {

                    id:
                        file.id ||
                        createId("photo"),

                    albumId:
                        file.albumId,

                    name:
                        file.name ||
                        "Untitled Photo",

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
                       blobKey is intentionally
                       separate from URL.
                    */

                    blobKey:
                        file.blobKey ||
                        file.id

                };

            }
        );


    /*
       Remove references to albums
       that no longer exist.
    */

    storage.files =
        storage.files.filter(
            function(file) {

                return storage.albums.some(
                    function(album) {

                        return (
                            album.id ===
                            file.albumId
                        );

                    }
                );

            }
        );


    /*
       Remove invalid album cover IDs.
    */

    storage.albums.forEach(
        function(album) {

            const coverExists =
                storage.files.some(
                    function(file) {

                        return (
                            file.albumId ===
                            album.id &&
                            file.id ===
                            album.coverFileId
                        );

                    }
                );

            if (!coverExists) {

                album.coverFileId =
                    null;

            }

        }
    );


    return storage;

}


/* =========================================================
   SAVE PORTFOLIO STORAGE
   ========================================================= */

function savePortfolioStorage(storage) {

    /*
       Recalculate before saving.
    */

    storage.usedMB =
        storage.files.reduce(
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


    localStorage.setItem(
        PORTFOLIO_STORAGE_KEY,
        JSON.stringify(storage)
    );


    renderStorage();

    renderAlbums();

    renderActiveAlbum();


    /*
       Notify other Professional Studio
       pages in the same browser.
    */

    window.dispatchEvent(
        new CustomEvent(
            "professionalStudioRecentWorkUpdated",
            {
                detail: storage
            }
        )
    );

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


    return (
        mb.toFixed(2) +
        " MB"
    );

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
            totalMB <=
            status.availableMB,

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


        if (
            status.status ===
            "full"
        ) {

            badge.textContent =
                "Storage Full";

        }
        else if (
            status.status ===
            "warning"
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

        if (
            status.status ===
            "full"
        ) {

            message.textContent =
                "Your storage is full. Delete existing work to make space or upgrade your plan.";

        }
        else if (
            status.status ===
            "warning"
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
                    album.id ===
                    albumId
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
                file.albumId ===
                albumId
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
                Number(
                    file.sizeMB || 0
                )
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


function openRenameAlbumModal(albumId) {

    const album =
        getAlbumById(
            albumId
        );


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


    /* CREATE */

    if (
        albumModalMode ===
        "create"
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

            isPublic:
                true,

            createdAt:
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


    /* RENAME */

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
                    item.id !==
                    album.id &&
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


    savePortfolioStorage(
        storage
    );


    closeModal(
        "albumModal"
    );

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

        grid.innerHTML =
            "";


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
                                        file.sizeMB ||
                                        0
                                    )
                                );

                            },
                            0
                        );


                    const visibilityText =
                        album.isPublic !== false
                            ? "Public"
                            : "Hidden";


                    return `

                        <article
                            class="album-card"
                            data-album-id="${escapeAttribute(album.id)}">

                            <div class="album-cover">

                                ${
                                    coverFile
                                        ? `

                                            <div
                                                class="album-cover-empty"
                                                data-cover-placeholder="${escapeAttribute(coverFile.id)}">
                                                ▧
                                            </div>

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

                                    ·

                                    ${visibilityText}

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
                                        class="album-action-button"
                                        type="button"
                                        data-toggle-visibility="${escapeAttribute(album.id)}">

                                        ${visibilityText}

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


    /*
       Load album cover images from IndexedDB.
    */

    storage.albums.forEach(
        function(album) {

            let coverFile =
                storage.files.find(
                    function(file) {

                        return (
                            file.albumId ===
                            album.id &&
                            file.id ===
                            album.coverFileId
                        );

                    }
                );


            if (!coverFile) {

                coverFile =
                    storage.files.find(
                        function(file) {

                            return (
                                file.albumId ===
                                album.id
                            );

                        }
                    );

            }


            if (!coverFile) {
                return;
            }


            getPhotoBlob(
                coverFile.blobKey
            )
                .then(
                    function(record) {

                        if (!record || !record.blob) {
                            return;
                        }


                        const card =
                            grid.querySelector(
                                `[data-album-id="${CSS.escape(album.id)}"]`
                            );


                        if (!card) {
                            return;
                        }


                        const cover =
                            card.querySelector(
                                ".album-cover"
                            );


                        if (!cover) {
                            return;
                        }


                        const url =
                            URL.createObjectURL(
                                record.blob
                            );


                        const placeholder =
                            cover.querySelector(
                                "[data-cover-placeholder]"
                            );


                        if (placeholder) {

                            placeholder.remove();

                        }


                        const img =
                            document.createElement(
                                "img"
                            );


                        img.src =
                            url;

                        img.alt =
                            album.name ||
                            "Album";

                        img.loading =
                            "lazy";


                        img.onload =
                            function() {

                                URL.revokeObjectURL(
                                    url
                                );

                            };


                        img.onerror =
                            function() {

                                URL.revokeObjectURL(
                                    url
                                );

                            };


                        cover.insertBefore(
                            img,
                            cover.firstChild
                        );

                    }
                )
                .catch(
                    function(error) {

                        console.warn(
                            "Could not load album cover:",
                            error
                        );

                    }
                );

        }
    );


    /*
       Album actions.
    */

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


    grid
        .querySelectorAll(
            "[data-toggle-visibility]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        toggleAlbumVisibility(
                            button.getAttribute(
                                "data-toggle-visibility"
                            )
                        );

                    }
                );

            }
        );


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
   TOGGLE ALBUM VISIBILITY
   ========================================================= */

function toggleAlbumVisibility(albumId) {

    const storage =
        getPortfolioStorage();


    const album =
        storage.albums.find(
            function(item) {

                return (
                    item.id ===
                    albumId
                );

            }
        );


    if (!album) {
        return;
    }


    album.isPublic =
        album.isPublic === false;


    savePortfolioStorage(
        storage
    );


    if (
        activeAlbumId ===
        albumId
    ) {

        const status =
            document.getElementById(
                "uploadStatus"
            );


        if (status) {

            status.className =
                "upload-status success";


            status.textContent =
                album.isPublic
                    ? "Album is now public."
                    : "Album is now hidden from your public gallery.";

        }

    }

}


/* =========================================================
   OPEN ALBUM
   ========================================================= */

function openAlbum(albumId) {

    const album =
        getAlbumById(
            albumId
        );


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


    selectedFiles =
        [];


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

            behavior:
                "smooth",

            block:
                "start"

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

        photoGrid.innerHTML =
            "";


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
                            class="photo-card"
                            data-photo-id="${escapeAttribute(file.id)}">

                            <div class="photo-image-wrap">

                                <div
                                    class="photo-image-placeholder"
                                    data-photo-placeholder="${escapeAttribute(file.id)}">

                                    ▧

                                </div>


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


    /*
       Load all image blobs.
    */

    files.forEach(
        function(file) {

            getPhotoBlob(
                file.blobKey
            )
                .then(
                    function(record) {

                        if (!record || !record.blob) {
                            return;
                        }


                        const card =
                            photoGrid.querySelector(
                                `[data-photo-id="${CSS.escape(file.id)}"]`
                            );


                        if (!card) {
                            return;
                        }


                        const imageWrap =
                            card.querySelector(
                                ".photo-image-wrap"
                            );


                        if (!imageWrap) {
                            return;
                        }


                        const url =
                            URL.createObjectURL(
                                record.blob
                            );


                        const img =
                            document.createElement(
                                "img"
                            );


                        img.className =
                            "photo-image";


                        img.src =
                            url;


                        img.alt =
                            file.name ||
                            "Photo";


                        img.loading =
                            "lazy";


                        img.onload =
                            function() {

                                const placeholder =
                                    imageWrap.querySelector(
                                        "[data-photo-placeholder]"
                                    );


                                if (placeholder) {

                                    placeholder.remove();

                                }


                                URL.revokeObjectURL(
                                    url
                                );

                            };


                        img.onerror =
                            function() {

                                URL.revokeObjectURL(
                                    url
                                );

                            };


                        imageWrap.insertBefore(
                            img,
                            imageWrap.firstChild
                        );

                    }
                )
                .catch(
                    function(error) {

                        console.warn(
                            "Could not load photo:",
                            error
                        );

                    }
                );

        }
    );


    /*
       Set cover buttons.
    */

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


    /*
       Delete photo buttons.
    */

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
        getAlbumById(
            albumId
        );


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
            formatStorage(
                storage
            ) +
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
                    item.id ===
                    fileId
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

function deletePhoto(fileId) {

    const storage =
        getPortfolioStorage();


    const index =
        storage.files.findIndex(
            function(file) {

                return (
                    file.id ===
                    fileId
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


    /*
       Replace album cover if necessary.
    */

    const album =
        storage.albums.find(
            function(item) {

                return (
                    item.id ===
                    albumId
                );

            }
        );


    if (
        album &&
        album.coverFileId ===
        fileId
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

    }


    /*
       Delete actual binary file
       from IndexedDB.
    */

    deletePhotoBlob(
        file.blobKey
    )
        .catch(
            function(error) {

                console.warn(
                    "Could not remove photo blob:",
                    error
                );

            }
        )
        .finally(
            function() {

                savePortfolioStorage(
                    storage
                );

            }
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

function deleteAlbum(albumId) {

    const storage =
        getPortfolioStorage();


    const albumIndex =
        storage.albums.findIndex(
            function(album) {

                return (
                    album.id ===
                    albumId
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
                        file.sizeMB ||
                        0
                    )
                );

            },
            0
        );


    const photoIds =
        filesToDelete.map(
            function(file) {

                return (
                    file.blobKey ||
                    file.id
                );

            }
        );


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


    /*
       Delete all actual image blobs.
    */

    deletePhotoBlobs(
        photoIds
    )
        .catch(
            function(error) {

                console.warn(
                    "Could not remove album photos:",
                    error
                );

            }
        )
        .finally(
            function() {

                savePortfolioStorage(
                    storage
                );

            }
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
                    item.id ===
                    fileId
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

    selectedFiles =
        Array.from(
            event.target.files || []
        );


    /*
       Only image files.
    */

    selectedFiles =
        selectedFiles.filter(
            function(file) {

                return (
                    file.type &&
                    file.type.startsWith(
                        "image/"
                    )
                );

            }
        );


    renderSelectedFiles();

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


    try {

        const newFiles = [];


        /*
           Save every actual image
           into IndexedDB first.
        */

        for (
            let index = 0;
            index < selectedFiles.length;
            index++
        ) {

            const file =
                selectedFiles[index];


            const id =
                createId(
                    "photo"
                );


            const sizeMB =
                getFileSizeMB(
                    file
                );


            const photoRecord = {

                id:
                    id,

                albumId:
                    activeAlbumId,

                blob:
                    file,

                name:
                    file.name,

                type:
                    file.type,

                sizeBytes:
                    file.size,

                createdAt:
                    new Date().toISOString()

            };


            await savePhotoBlob(
                photoRecord
            );


            newFiles.push({

                id:
                    id,

                albumId:
                    activeAlbumId,

                name:
                    file.name,

                sizeMB:
                    sizeMB,

                sizeBytes:
                    file.size,

                type:
                    file.type,

                createdAt:
                    photoRecord.createdAt,

                blobKey:
                    id

            });

        }


        /*
           Add metadata only after
           the actual blobs are stored.
        */

        storage.files.push(
            ...newFiles
        );


        /*
           Automatically select the
           first uploaded image as cover
           if no cover exists.
        */

        if (
            !album.coverFileId &&
            newFiles.length
        ) {

            album.coverFileId =
                newFiles[0].id;

        }


        savePortfolioStorage(
            storage
        );


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
            "Upload failed:",
            error
        );


        /*
           If the browser rejects
           IndexedDB storage, explain
           the problem without corrupting
           metadata.
        */

        showUploadError(
            "The photos could not be stored in this browser. Please check available browser storage and try again."
        );

    }
    finally {

        if (uploadButton) {

            uploadButton.textContent =
                "Upload to Album";

            uploadButton.disabled =
                selectedFiles.length === 0 ||
                !validateUpload(
                    selectedFiles
                ).allowed;

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
            .slice(2, 10)

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
   CLEANUP OLD LOCALSTORAGE BLOB URL DATA
   ========================================================= */

function cleanupLegacyFileMetadata() {

    const storage =
        getPortfolioStorage();


    let changed =
        false;


    storage.files =
        storage.files.map(
            function(file) {

                /*
                   Old version stored URL.
                   Remove it from the new metadata
                   model because blob URLs are temporary.
                */

                if (
                    Object.prototype.hasOwnProperty.call(
                        file,
                        "url"
                    )
                ) {

                    delete file.url;

                    changed =
                        true;

                }


                return file;

            }
        );


    if (changed) {

        localStorage.setItem(
            PORTFOLIO_STORAGE_KEY,
            JSON.stringify(storage)
        );

    }

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


    /* CREATE ALBUM */

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


    /* SAVE ALBUM */

    if (saveAlbumButton) {

        saveAlbumButton.addEventListener(
            "click",
            saveAlbumFromModal
        );

    }


    /* CLOSE ALBUM MODAL */

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


    /* ENTER TO SAVE */

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


    /* CLICK OUTSIDE ALBUM MODAL */

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


    /* FILE INPUT */

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            handleFileSelection
        );

    }


    /* UPLOAD */

    if (uploadButton) {

        uploadButton.addEventListener(
            "click",
            uploadSelectedFiles
        );

    }


    /* BACK TO ALBUMS */

    if (backToAlbums) {

        backToAlbums.addEventListener(
            "click",
            closeAlbumView
        );

    }


    /* RENAME ACTIVE ALBUM */

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


    /* DELETE ACTIVE ALBUM */

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


    /* DELETE MODAL */

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


    /* ESCAPE */

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


    /* STORAGE SYNCHRONIZATION */

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


    /*
       Custom same-page synchronization.
    */

    window.addEventListener(
        "professionalStudioRecentWorkUpdated",
        function() {

            renderStorage();

            renderAlbums();

            renderActiveAlbum();

        }
    );


    /* MOBILE SIDEBAR */

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


        sidebar
            .querySelectorAll(
                "a"
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


    /*
       Force both modals closed.
    */

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


    /*
       Open IndexedDB before rendering.
    */

    try {

        await openDatabase();

    }
    catch (error) {

        console.error(
            "Recent Work database initialization failed:",
            error
        );

    }


    /*
       Clean metadata left by the
       previous temporary blob URL system.
    */

    cleanupLegacyFileMetadata();


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