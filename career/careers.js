
(function () {

    "use strict";

    var menuButton = document.getElementById("mobileMenuBtn");
    var mobileNav = document.getElementById("mobileNav");

    if (menuButton && mobileNav) {

        menuButton.addEventListener("click", function () {

            var isOpen =
                mobileNav.classList.toggle("open");

            menuButton.classList.toggle(
                "active",
                isOpen
            );

            menuButton.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        });


        mobileNav
            .querySelectorAll("a")
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        mobileNav.classList.remove("open");
                        menuButton.classList.remove("active");

                        menuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            });

    }


    var newsletterForm =
        document.getElementById("newsletterForm");

    if (newsletterForm) {

        newsletterForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                var email =
                    document.getElementById(
                        "newsletterEmail"
                    );

                if (!email || !email.value.trim()) {
                    return;
                }

                alert(
                    "Thank you for subscribing to Professional Studio."
                );

                newsletterForm.reset();

            }
        );

    }

})();
