/* =========================================================
   PROFESSIONAL STUDIO
   HELP CENTER JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const searchInput =
        document.getElementById("helpSearch");

    const clearSearch =
        document.getElementById("clearSearch");

    const searchStatus =
        document.getElementById("searchStatus");

    const topicCards = Array.from(
        document.querySelectorAll(".topic-card")
    );

    const categoryButtons = Array.from(
        document.querySelectorAll(".category-btn")
    );

    const resultCount =
        document.getElementById("resultCount");

    const resultsTitle =
        document.getElementById("resultsTitle");

    const emptyState =
        document.getElementById("emptyState");

    const resetSearch =
        document.getElementById("resetSearch");

    const faqItems = Array.from(
        document.querySelectorAll(".faq-item")
    );

    const categoryCounts = new Map();

    const currentYear =
        document.getElementById("currentYear");


    /* =====================================================
       STATE
    ===================================================== */

    let activeCategory = "all";
    let currentSearch = "";


    /* =====================================================
       CATEGORY NAMES
    ===================================================== */

    const categoryNames = {
        all: "Help topics",
        account: "Account",
        studio: "Studio setup",
        bookings: "Bookings",
        galleries: "Client galleries",
        billing: "Billing & plans"
    };


    /* =====================================================
       NORMALIZE SEARCH
    ===================================================== */

    function normalize(value) {

        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");

    }


    /* =====================================================
       UPDATE SEARCH BUTTON
    ===================================================== */

    function updateClearButton() {

        if (!clearSearch) {
            return;
        }

        clearSearch.hidden =
            !currentSearch;

    }


    /* =====================================================
       FILTER TOPICS
    ===================================================== */

    function updateCategoryCounts() {

        categoryCounts.clear();
        categoryCounts.set("all", topicCards.length);

        topicCards.forEach((card) => {
            const category = card.dataset.category || "";
            categoryCounts.set(
                category,
                (categoryCounts.get(category) || 0) + 1
            );
        });

        categoryButtons.forEach((button) => {
            const count = button.querySelector(".category-count");
            if (count) {
                count.textContent = String(
                    categoryCounts.get(button.dataset.category || "all") || 0
                ).padStart(2, "0");
            }
        });

    }


    function filterTopics() {

        let visibleCount = 0;
        let visibleFaqCount = 0;

        const search =
            normalize(currentSearch);


        topicCards.forEach((card) => {

            const category =
                card.dataset.category || "";

            const searchableText =
                normalize(
                    `${card.textContent} ${card.dataset.search || ""}`
                );


            const categoryMatch =
                activeCategory === "all" ||
                category === activeCategory ||
                category === "all";


            const searchMatch =
                !search ||
                searchableText.includes(search);


            const shouldShow =
                categoryMatch &&
                searchMatch;


            card.hidden = !shouldShow;


            if (shouldShow) {
                visibleCount++;
            }

        });


        faqItems.forEach((item) => {

            const category = item.dataset.category || "all";
            const searchableText = normalize(item.textContent);
            const categoryMatch =
                activeCategory === "all" ||
                category === activeCategory ||
                category === "all";
            const searchMatch =
                !search || searchableText.includes(search);
            const shouldShow = categoryMatch && searchMatch;

            item.hidden = !shouldShow;
            if (shouldShow) {
                visibleFaqCount++;
            } else {
                closeFaq(item);
            }

        });


        /* =================================================
           RESULT TITLE
        ================================================= */

        if (resultsTitle) {

            if (search) {

                resultsTitle.textContent =
                    `Results for "${currentSearch}"`;

            } else {

                resultsTitle.textContent =
                    categoryNames[activeCategory] ||
                    "Help topics";

            }

        }


        /* =================================================
           RESULT COUNT
        ================================================= */

        if (resultCount) {

            const topicLabel = `${visibleCount} ${visibleCount === 1 ? "topic" : "topics"}`;
            const faqLabel = `${visibleFaqCount} ${visibleFaqCount === 1 ? "answer" : "answers"}`;
            resultCount.textContent = search || activeCategory !== "all"
                ? `${topicLabel} · ${faqLabel}`
                : topicLabel;

        }


        /* =================================================
           EMPTY STATE
        ================================================= */

        if (emptyState) {

            emptyState.hidden =
                visibleCount !== 0 || visibleFaqCount !== 0;

        }


        /* =================================================
           SEARCH STATUS
        ================================================= */

        if (searchStatus) {

            if (search) {

                if (visibleCount === 0 && visibleFaqCount === 0) {

                    searchStatus.textContent =
                        "No matching help topics or answers were found.";

                } else {

                    searchStatus.textContent =
                        `${visibleCount} matching ${visibleCount === 1 ? "topic" : "topics"} and ${visibleFaqCount} matching ${visibleFaqCount === 1 ? "answer" : "answers"} found.`;

                }

            } else {

                searchStatus.textContent =
                    "Search help topics, common questions, and answers.";

            }

        }

    }


    /* =====================================================
       CATEGORY FILTERS
    ===================================================== */

    categoryButtons.forEach((button) => {

        button.addEventListener("click", () => {

            activeCategory =
                button.dataset.category || "all";


            categoryButtons.forEach((item) => {

                const isActive =
                    item === button;

                item.classList.toggle(
                    "active",
                    isActive
                );

                item.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );

            });


            filterTopics();

        });

        /*
         * Makes the buttons accessible even though they
         * aren't native checkbox/radio controls.
         */

        button.setAttribute(
            "aria-pressed",
            button.classList.contains("active")
                ? "true"
                : "false"
        );

    });


    /* =====================================================
       SEARCH
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                currentSearch =
                    searchInput.value;

                updateClearButton();

                filterTopics();

            }
        );

    }


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    function clearSearchValue() {

        if (searchInput) {

            searchInput.value = "";

            currentSearch = "";

            searchInput.focus();

        }

        updateClearButton();

        filterTopics();

    }


    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            clearSearchValue
        );

    }


    /* =====================================================
       RESET SEARCH
    ===================================================== */

    if (resetSearch) {

        resetSearch.addEventListener(
            "click",
            () => {

                activeCategory = "all";

                categoryButtons.forEach(
                    (button) => {

                        const isAll =
                            button.dataset.category === "all";

                        button.classList.toggle(
                            "active",
                            isAll
                        );

                        button.setAttribute(
                            "aria-pressed",
                            String(isAll)
                        );

                    }
                );

                clearSearchValue();

            }
        );

    }


    /* =====================================================
       FAQ ACCORDION
    ===================================================== */

    function closeFaq(item) {

        if (!item) {
            return;
        }

        item.classList.remove("open");

        const button =
            item.querySelector(".faq-question");

        const answer =
            item.querySelector(".faq-answer");


        if (button) {

            button.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        if (answer) {

            answer.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    }


    function openFaq(item) {

        if (!item) {
            return;
        }

        item.classList.add("open");

        const button =
            item.querySelector(".faq-question");

        const answer =
            item.querySelector(".faq-answer");


        if (button) {

            button.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        if (answer) {

            answer.setAttribute(
                "aria-hidden",
                "false"
            );

        }

    }


    faqItems.forEach((item) => {

        const button =
            item.querySelector(".faq-question");


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            () => {

                const wasOpen =
                    item.classList.contains("open");


                /*
                 * Only one FAQ stays open at a time.
                 */

                faqItems.forEach((faq) => {

                    if (faq !== item) {
                        closeFaq(faq);
                    }

                });


                if (wasOpen) {

                    closeFaq(item);

                } else {

                    openFaq(item);

                }

            }
        );

    });


    /* =====================================================
       KEYBOARD SHORTCUT
       "/" focuses search when user isn't typing elsewhere.
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "/") {
                return;
            }


            const target =
                event.target;


            const isTyping =
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                target.isContentEditable;


            if (isTyping) {
                return;
            }


            event.preventDefault();


            if (searchInput) {
                searchInput.focus();
            }

        }
    );


    /* =====================================================
       ESCAPE
       Escape clears search when search is active,
       otherwise closes an open FAQ.
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }


            if (
                document.activeElement === searchInput &&
                currentSearch
            ) {

                clearSearchValue();

                return;

            }


            const openFaq =
                document.querySelector(
                    ".faq-item.open"
                );


            if (openFaq) {
                closeFaq(openFaq);
            }

        }
    );


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateCategoryCounts();
    filterTopics();

    updateClearButton();

});