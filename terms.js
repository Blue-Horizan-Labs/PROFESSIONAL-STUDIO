// ===========================================
// PROFESSIONAL STUDIO
// TERMS & CONDITIONS
// ===========================================

const backTop = document.getElementById("backTop");
const sections = document.querySelectorAll(".card");
const navLinks = document.querySelectorAll(".toc a");

// ===============================
// BACK TO TOP BUTTON
// ===============================

window.addEventListener("scroll", () => {

    if (window.scrollY > 500) {
        backTop.classList.add("show");
    } else {
        backTop.classList.remove("show");
    }

});

backTop.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// ===============================
// ACTIVE TABLE OF CONTENTS
// ===============================

function updateActiveLink() {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 180;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

}

window.addEventListener("scroll", updateActiveLink);

// ===============================
// SCROLL REVEAL
// ===============================

const observer = new IntersectionObserver(

(entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

        }

    });

},

{
    threshold: 0.12
}

);

sections.forEach(card => {

    card.style.opacity = "0";
    card.style.transform = "translateY(40px)";
    card.style.transition = "0.7s ease";

    observer.observe(card);

});

// ===============================
// HERO FADE
// ===============================

window.addEventListener("load", () => {

    document.querySelector(".hero-content").style.opacity = "1";
    document.querySelector(".hero-content").style.transform = "translateY(0)";

});