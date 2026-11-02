/* =========================================
   PROFESSIONAL STUDIO
   REFERRER DASHBOARD JAVASCRIPT
========================================= */


/* REFERRAL TABLE SEARCH */

const searchInput = document.getElementById("searchInput");

const referralRows = [
  ...document.querySelectorAll("#referralRows tr")
];

const emptyState = document.getElementById("emptyState");


/* SEARCH FUNCTIONALITY */

if (searchInput && emptyState) {

  searchInput.addEventListener("input", () => {

    const query = searchInput.value
      .trim()
      .toLowerCase();

    let visibleRows = 0;


    referralRows.forEach((row) => {

      const matches = row.innerText
        .toLowerCase()
        .includes(query);

      row.style.display = matches ? "" : "none";


      if (matches) {
        visibleRows++;
      }

    });


    /* SHOW EMPTY STATE WHEN NO RESULTS */

    emptyState.style.display =
      visibleRows === 0 ? "block" : "none";

  });

}