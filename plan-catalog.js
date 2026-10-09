/* Shared Professional Studio plan catalog. Keep pricing and subscription displays in sync here. */
(function (window) {
    "use strict";
    window.PROFESSIONAL_STUDIO_PLANS = Object.freeze({
        starter: Object.freeze({
            id: "starter", name: "Starter", price: 499, storageMB: 500,
            description: "Perfect for photographers getting started.",
            marketingDescription: "Everything you need to put your photography business online.",
            billingLabel: "Perfect for beginners", includesLabel: "Included in Starter",
            footnote: "A polished place to showcase your work.", popular: false,
            features: ["Personal Portfolio", "Online Booking", "Contact Form", "500 MB Storage For Recent Work", "Services and Pricing Showcase", "Equipment Preview"],
            comparison: { portfolio: "Included", booking: "Included", galleries: "Included", services: "Included", storage: "500 MB", seo: "Not included", themes: "Default theme", support: "Not included", ai: "Not included" }
        }),
        professional: Object.freeze({
            id: "professional", name: "Professional", price: 1499, storageMB: 2048,
            description: "Additional features to the Starter Plan.",
            marketingDescription: "More visibility and flexibility for a growing studio.",
            billingLabel: "Everything in Starter, plus", includesLabel: "Grow your studio",
            footnote: "More ways to make your studio your own.", popular: true,
            features: ["Everything in Starter", "Basic SEO", "2 GB Storage For Recent Work", "2 Theme Options", "AI Assistant Support (Upcoming)", "Basic Support For Profile Setup"],
            comparison: { portfolio: "Included", booking: "Included", galleries: "Included", services: "Included", storage: "2 GB", seo: "Basic", themes: "2", support: "Basic support", ai: "Upcoming" }
        }),
        enterprise: Object.freeze({
            id: "enterprise", name: "Enterprise", price: 2999, storageMB: 10240,
            description: "Additional features to the Professional Plan.",
            marketingDescription: "More capacity and hands-on help for your next stage.",
            billingLabel: "Everything in Professional, plus", includesLabel: "Stand out and scale",
            footnote: "Priority setup support for your photography business.", popular: false,
            features: ["Everything in Professional", "Premium SEO", "10 GB Storage For Recent Work", "5 Theme Options", "Top Priority Support For Profile Setup"],
            comparison: { portfolio: "Included", booking: "Included", galleries: "Included", services: "Included", storage: "10 GB", seo: "Premium", themes: "5", support: "Priority support", ai: "Upcoming" }
        })
    });
    window.PROFESSIONAL_STUDIO_PLAN_COMPARISON = Object.freeze([
        { key: "portfolio", label: "Personal portfolio" },
        { key: "booking", label: "Online booking" },
        { key: "galleries", label: "Client galleries" },
        { key: "services", label: "Services, pricing & equipment showcase" },
        { key: "storage", label: "Recent Work storage" },
        { key: "seo", label: "Search optimization" },
        { key: "themes", label: "Theme options" },
        { key: "support", label: "Profile setup support" },
        { key: "ai", label: "AI assistant support" }
    ]);
})(window);
