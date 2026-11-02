(function () {
    "use strict";

    const plans = window.PROFESSIONAL_STUDIO_PLANS;
    const form = document.getElementById("planForm");
    const planOptions = document.getElementById("planOptions");
    const continueButton = document.getElementById("continueButton");
    const message = document.getElementById("formMessage");

    if (!form || !planOptions || !continueButton || !message) {
        return;
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "form-message show" + (type ? " " + type : "");
    }

    function formatPrice(price) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(price);
    }

    function createPlanOption(plan, selectedPlan) {
        const label = document.createElement("label");
        label.className = "plan-option";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "planId";
        input.value = plan.id;
        input.required = true;
        input.checked = plan.id === selectedPlan;

        const card = document.createElement("span");
        card.className = "plan-card";

        const topLine = document.createElement("span");
        topLine.className = "plan-topline";

        const name = document.createElement("span");
        name.className = "plan-name";
        name.textContent = plan.name;
        topLine.appendChild(name);

        if (plan.popular) {
            const popular = document.createElement("span");
            popular.className = "popular";
            popular.textContent = "Most popular";
            topLine.appendChild(popular);
        }

        const description = document.createElement("span");
        description.className = "plan-description";
        description.textContent = plan.marketingDescription || plan.description;

        const price = document.createElement("span");
        price.className = "price";
        price.textContent = formatPrice(plan.price);

        const billing = document.createElement("span");
        billing.className = "billing";
        billing.textContent = "per month";

        const divider = document.createElement("span");
        divider.className = "plan-divider";

        const includes = document.createElement("span");
        includes.className = "includes";
        includes.textContent = plan.includesLabel || "Plan features";

        const features = document.createElement("span");
        features.className = "features";
        plan.features.forEach(function (feature) {
            const item = document.createElement("span");
            item.textContent = feature;
            features.appendChild(item);
        });

        const footnote = document.createElement("span");
        footnote.className = "plan-foot";
        footnote.textContent = plan.footnote || "";

        card.append(
            topLine,
            description,
            price,
            billing,
            divider,
            includes,
            features,
            footnote
        );
        label.append(input, card);
        return label;
    }

    if (!plans) {
        showMessage("Plans could not be loaded. Please refresh the page or try again later.", "error");
        continueButton.disabled = true;
        return;
    }

    const selectedFromUrl = new URLSearchParams(window.location.search).get("plan");
    const planIds = Object.keys(plans);
    const selectedPlan = planIds.includes(selectedFromUrl) ? selectedFromUrl : "";

    planIds.forEach(function (planId) {
        planOptions.appendChild(createPlanOption(plans[planId], selectedPlan));
    });

    async function readResponse(response) {
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("application/json")) {
            throw new Error("The checkout service returned an unexpected response. Please try again later.");
        }

        try {
            return await response.json();
        } catch (error) {
            throw new Error("The checkout service returned an invalid response. Please try again later.");
        }
    }

    function getErrorMessage(data) {
        const candidate = data && (
            typeof data.message === "string"
                ? data.message
                : data.error
        );
        if (typeof candidate !== "string") {
            return "Unable to start checkout right now. Please try again later.";
        }

        const text = candidate.trim();
        if (!text || text.length > 200 || /^\s*</.test(text)) {
            return "Unable to start checkout right now. Please try again later.";
        }

        return text;
    }

    form.addEventListener("change", function (event) {
        if (event.target.name === "planId") {
            message.className = "form-message";
            message.textContent = "";
        }
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const selected = form.querySelector('input[name="planId"]:checked');
        if (!selected) {
            showMessage("Choose a plan to continue.", "error");
            return;
        }

        continueButton.disabled = true;
        showMessage("Preparing your secure checkout...", "");

        try {
            const response = await fetch("/api/razorpay_plans", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ planId: selected.value })
            });

            const data = await readResponse(response);
            if (!response.ok || !data || typeof data !== "object" || data.success === false) {
                throw new Error(getErrorMessage(data));
            }

            if (typeof data.paymentLink !== "string" || !data.paymentLink.trim()) {
                throw new Error("The checkout service did not provide a payment link. Please try again later.");
            }

            let paymentUrl;
            try {
                paymentUrl = new URL(data.paymentLink);
            } catch (error) {
                throw new Error("The checkout service returned an invalid payment link. Please try again later.");
            }

            if (paymentUrl.protocol !== "https:") {
                throw new Error("The checkout service returned an invalid payment link. Please try again later.");
            }

            showMessage("Redirecting to Razorpay...", "success");
            window.location.assign(paymentUrl.href);
        } catch (error) {
            showMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to start checkout right now. Please try again later.",
                "error"
            );
            continueButton.disabled = false;
        }
    });
})();
