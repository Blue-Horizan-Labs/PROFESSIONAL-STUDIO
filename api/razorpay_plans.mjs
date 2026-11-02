import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const PLANS = Object.freeze({
    starter: Object.freeze({ name: "Starter", amount: 49900 }),
    professional: Object.freeze({ name: "Professional", amount: 149900 }),
    enterprise: Object.freeze({ name: "Enterprise", amount: 299900 })
});

function getAuthToken(req) {
    if (req.cookies?.token) {
        return req.cookies.token;
    }

    const cookieHeader = req.headers?.cookie || "";
    const tokenCookie = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("token="));

    return tokenCookie ? tokenCookie.slice("token=".length) : null;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    const planId = req.body?.planId;
    if (typeof planId !== "string" || !Object.hasOwn(PLANS, planId)) {
        return res.status(400).json({
            success: false,
            message: "A valid plan ID is required"
        });
    }

    const token = getAuthToken(req);
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Please sign in before starting checkout"
        });
    }

    const requiredEnv = [
        "SUPABASE_URL",
        "SUPABASE_KEY",
        "RAZORPAY_KEY",
        "RAZORPAY_SECRET"
    ];
    if (requiredEnv.some((key) => !process.env[key])) {
        console.error("Checkout service is missing required configuration.");
        return res.status(500).json({
            success: false,
            message: "Checkout is temporarily unavailable. Please try again later."
        });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        );
        const { data: authData, error: authError } =
            await supabase.auth.getUser(token);

        if (authError || !authData?.user?.email) {
            return res.status(401).json({
                success: false,
                message: "Please sign in before starting checkout"
            });
        }

        const { data: user, error: userError } = await supabase
            .from("user_data")
            .select("id, full_name, email")
            .eq("email", authData.user.email)
            .single();

        if (userError || !user?.id) {
            console.error("Unable to find checkout customer profile.");
            return res.status(400).json({
                success: false,
                message: "Your account profile could not be found. Please contact support."
            });
        }

        const plan = PLANS[planId];
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET
        });

        const paymentLink = await razorpay.paymentLink.create({
            amount: plan.amount,
            currency: "INR",
            reference_id: `plan_${planId}_${user.id}`,
            description: `Professional Studio ${plan.name} plan`,
            customer: {
                name: user.full_name || undefined,
                email: user.email || authData.user.email
            },
            callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/setup || https://professionalstudio.in/setup`,
        });

        if (
            typeof paymentLink.short_url !== "string" ||
            !paymentLink.short_url
        ) {
            console.error("Razorpay did not return a payment link.");
            return res.status(502).json({
                success: false,
                message: "Unable to start checkout right now. Please try again later."
            });
        }

        return res.status(200).json({
            success: true,
            paymentLink: paymentLink.short_url
        });
    } catch (error) {
        console.error("Unable to create Razorpay payment link:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to start checkout right now. Please try again later."
        });
    }
}
