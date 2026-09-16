"use strict";


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
   STATE
========================================================= */

let selectedFiles = [];

let pendingDeleteId = null;


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


        return subscription || {
            plan: DEFAULT_STORAGE_PLAN
        };

    }

    catch (error) {

        return {
            plan: DEFAULT_STORAGE_PLAN
        };

    }

}


/* =========================================================
   CURRENT PLAN
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

        planId: plan.id,

        limitMB: plan.storageMB,

        usedMB: 0,

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


    if (!Array.isArray(storage.files)) {

        storage.files = [];

    }


    /*
       The current subscription determines
       the current storage limit.

       Existing files are NEVER automatically
       deleted after a downgrade.
    */

    storage.planId = plan.id;

    storage.limitMB = plan.storageMB;


    /*
       Always calculate usage from actual
       stored file sizes.
    */

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
   SAVE STORAGE
========================================================= */

function savePortfolioStorage(storage) {

    localStorage.setItem(
        PORTFOLIO_STORAGE_KEY,
        JSON.stringify(storage)
    );


    renderStorage();

    renderWork();

}


/* =========================================================
   FORMAT STORAGE
========================================================= */

function formatStorage(mb) {

    mb = Number(mb) || 0;


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

        status = "full";

    }

    else if (percentage >= 80) {

        status = "warning";

    }


    return {

        ...storage,

        availableMB: available,

        percentage: percentage,

        status: status

    };

}


/* =========================================================
   VALIDATE UPLOAD
========================================================= */

function validateUpload(files) {

    const status =
        getStorageStatus();


    const totalMB =
        files.reduce(
            function(total, file) {

                return (
                    total +
                    (
                        file.size /
                        (1024 * 1024)
                    )
                );

            },
            0
        );


    const allowed =
        totalMB <= status.availableMB;


    return {

        allowed: allowed,

        totalMB: totalMB,

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
   FILE SELECTION
========================================================= */

function handleFileSelection(event) {

    selectedFiles =
        Array.from(
            event.target.files || []
        );


    renderSelectedFiles();

}


/* =========================================================
   SELECTED FILES UI
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
                        file.size /
                        (1024 * 1024);


                    return `
                        <div class="selected-file">

                            <span>
                                ${escapeHTML(file.name)}
                            </span>

                            <span>
                                ${formatStorage(sizeMB)}
                            </span>

                        </div>
                    `;

                }
            )
            .join("");


    if (uploadButton) {

        uploadButton.disabled =
            false;

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
                " is available. Delete existing work or upgrade your plan.";

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

function uploadSelectedFiles() {

    if (!selectedFiles.length) {

        return;

    }


    const validation =
        validateUpload(
            selectedFiles
        );


    if (!validation.allowed) {

        showUploadError(
            "Not enough storage. Delete existing work to make space or upgrade your plan."
        );

        return;

    }


    const storage =
        getPortfolioStorage();

const newFiles =
    selectedFiles.map(
        function(file) {

            return {

                id: createId(),

                name: file.name,

                sizeMB:
                    Number(
                        (
                            file.size /
                            (1024 * 1024)
                        ).toFixed(4)
                    ),

                type: file.type,

                createdAt:
                    new Date().toISOString(),

                url:
                    URL.createObjectURL(file)

            };

        }
    );

    storage.files.push(
        ...newFiles
    );


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


    const status =
        document.getElementById(
            "uploadStatus"
        );


    if (status) {

        status.className =
            "upload-status success";


        status.textContent =
            "Images uploaded successfully.";

    }


    renderSelectedFiles();

    renderStorage();

    renderWork();

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
   RENDER WORK
========================================================= */

function renderWork() {

    const storage =
        getPortfolioStorage();


    const grid =
        document.getElementById(
            "workGrid"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    const itemCount =
        document.getElementById(
            "itemCount"
        );


    if (!grid) {

        return;

    }


    if (itemCount) {

        itemCount.textContent =
            storage.files.length +
            (
                storage.files.length === 1
                    ? " item"
                    : " items"
            );

    }


    if (!storage.files.length) {

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
        storage.files
            .map(
                function(file) {

                    return `
                        <article class="work-card">

                            <div class="work-image-wrap">

                                <img
                                    class="work-image"
                                    src="${escapeAttribute(file.url || "")}"
                                    alt="${escapeAttribute(file.name || "Uploaded work")}"
                                    loading="lazy">

                            </div>


                            <div class="work-card-body">

                                <span
                                    class="work-name"
                                    title="${escapeAttribute(file.name || "")}">

                                    ${escapeHTML(
                                        file.name ||
                                        "Untitled"
                                    )}

                                </span>

                                <div class="work-meta">

    Recent Work ·
    ${formatStorage(file.sizeMB)}

</div>

                                <div class="work-card-actions">

                                    <button
                                        class="delete-button"
                                        type="button"
                                        data-delete-id="${escapeAttribute(file.id)}">

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
       Attach Delete handlers only to actual
       Delete buttons.

       Nothing is executed automatically.
    */

    grid
        .querySelectorAll(
            "[data-delete-id]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        openDeleteModal(
                            button.getAttribute(
                                "data-delete-id"
                            )
                        );

                    }
                );

            }
        );

}


/* =========================================================
   OPEN DELETE MODAL
========================================================= */

function openDeleteModal(fileId) {

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


    pendingDeleteId =
        fileId;


    const description =
        document.getElementById(
            "deleteDescription"
        );


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


    const modal =
        document.getElementById(
            "deleteModal"
        );


    if (!modal) {

        return;

    }


    /*
       THIS is the only place where the
       modal gets the .open class.
    */

    modal.classList.add(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    const cancelButton =
        document.getElementById(
            "cancelDelete"
        );


    if (cancelButton) {

        setTimeout(
            function() {

                cancelButton.focus();

            },
            0
        );

    }

}


/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

function closeDeleteModal() {

    pendingDeleteId =
        null;


    const modal =
        document.getElementById(
            "deleteModal"
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


    document.body.style.overflow =
        "";

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

function confirmDelete() {

    if (!pendingDeleteId) {

        return;

    }


    const storage =
        getPortfolioStorage();


    const fileIndex =
        storage.files.findIndex(
            function(file) {

                return (
                    file.id ===
                    pendingDeleteId
                );

            }
        );


    if (fileIndex === -1) {

        closeDeleteModal();

        return;

    }


    const file =
        storage.files[fileIndex];


    /*
       Free browser object URL.
    */

    if (
        file.url &&
        file.url.indexOf("blob:") === 0
    ) {

        try {

            URL.revokeObjectURL(
                file.url
            );

        }

        catch (error) {

            /*
               Ignore cleanup errors.
            */

        }

    }


    /*
       Remove the file from storage.

       This immediately frees its size.
    */

    storage.files.splice(
        fileIndex,
        1
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
            "Image deleted. " +
            formatStorage(
                file.sizeMB
            ) +
            " of storage is now available.";

    }

}


/* =========================================================
   HELPERS
========================================================= */

function createId() {

    return (
        Date.now().toString(36) +
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

    return escapeHTML(value);

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    const imageInput =
        document.getElementById(
            "imageInput"
        );


    const uploadButton =
        document.getElementById(
            "uploadButton"
        );


    if (imageInput) {

        imageInput.addEventListener(
            "change",
            handleFileSelection
        );

    }


    if (uploadButton) {

        /*
           IMPORTANT:

           Correct:
           addEventListener("click", uploadSelectedFiles)

           NOT:
           addEventListener("click", uploadSelectedFiles())

           The latter would execute immediately.
        */

        uploadButton.addEventListener(
            "click",
            uploadSelectedFiles
        );


        uploadButton.disabled =
            true;

    }


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


    const modal =
        document.getElementById(
            "deleteModal"
        );


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

        /*
           IMPORTANT:

           This passes the function.

           It does NOT execute the function
           while the page is loading.
        */

        confirmDeleteButton.addEventListener(
            "click",
            confirmDelete
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    modal
                ) {

                    closeDeleteModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeDeleteModal();

            }

        }
    );


    /*
       Keep dashboard and Recent Work
       synchronized through localStorage.
    */

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

                renderWork();

            }

        }
    );


    /*
       Mobile sidebar.
    */

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


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

}


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeRecentWork() {

    /*
       VERY IMPORTANT FIX.

       Force the delete modal to be closed
       when the page initializes.

       Therefore Delete and Cancel cannot
       appear automatically.
    */

    const modal =
        document.getElementById(
            "deleteModal"
        );


    if (modal) {

        modal.classList.remove(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    document.body.style.overflow =
        "";


    pendingDeleteId =
        null;


    renderStorage();

    renderSelectedFiles();

    renderWork();

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