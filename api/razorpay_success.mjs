import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const PLANS = Object.freeze({
    starter: Object.freeze({ name: "Starter", amount: 49900 }),
    professional: Object.freeze({ name: "Professional", amount: 149900 }),
    enterprise: Object.freeze({ name: "Enterprise", amount: 299900 })
});

const MAX_BODY_BYTES = 1024 * 1024;

export const config = {
    api: {
        bodyParser: false
    }
};

function httpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function getRawBody(req) {
    if (Buffer.isBuffer(req.body)) {
        if (req.body.length > MAX_BODY_BYTES) {
            throw httpError(413, "Request body is too large");
        }
        return req.body;
    }

    if (typeof req.body === "string") {
        const body = Buffer.from(req.body);
        if (body.length > MAX_BODY_BYTES) {
            throw httpError(413, "Request body is too large");
        }
        return body;
    }

    if (req.body !== undefined && req.body !== null) {
        throw httpError(400, "Raw request body is required for signature verification");
    }

    if (typeof req[Symbol.asyncIterator] !== "function") {
        throw httpError(400, "Request body is missing");
    }

    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += buffer.length;
        if (size > MAX_BODY_BYTES) {
            throw httpError(413, "Request body is too large");
        }
        chunks.push(buffer);
    }

    if (size === 0) {
        throw httpError(400, "Request body is missing");
    }

    return Buffer.concat(chunks, size);
}

function hasValidSignature(rawBody, signature, secret) {
    if (typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) {
        return false;
    }

    const expected = createHmac("sha256", secret)
        .update(rawBody)
        .digest();
    const supplied = Buffer.from(signature, "hex");

    return supplied.length === expected.length &&
        timingSafeEqual(supplied, expected);
}

function addOneMonth(value) {
    const date = new Date(value);
    const originalDay = date.getUTCDate();

    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + 1);
    const lastDayOfMonth = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        0
    )).getUTCDate();
    date.setUTCDate(Math.min(originalDay, lastDayOfMonth));

    return date.toISOString();
}

function nextExpiry(currentExpiry) {
    const now = new Date();
    const current = currentExpiry ? new Date(currentExpiry) : null;
    const base = current && !Number.isNaN(current.getTime()) && current > now
        ? current
        : now;

    return addOneMonth(base);
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    const allowUnsignedDevelopmentWebhook =
        process.env.NODE_ENV === "development" &&
        process.env.ALLOW_UNSIGNED_RAZORPAY_WEBHOOKS === "true";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret && !allowUnsignedDevelopmentWebhook) {
        console.error("Razorpay webhook secret is not configured.");
        return res.status(500).json({
            success: false,
            message: "Webhook is not configured"
        });
    }

    let event;
    try {
        if (
            allowUnsignedDevelopmentWebhook &&
            req.body &&
            typeof req.body === "object" &&
            !Buffer.isBuffer(req.body)
        ) {
            event = req.body;
        } else {
            const rawBody = await getRawBody(req);
            const signature = req.headers?.["x-razorpay-signature"];

            if (
                !allowUnsignedDevelopmentWebhook &&
                !hasValidSignature(rawBody, signature, webhookSecret)
            ) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid webhook signature"
                });
            }

            try {
                event = JSON.parse(rawBody.toString("utf8"));
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid JSON payload"
                });
            }
        }
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

        console.error("Unable to read Razorpay webhook request:", error);
        return res.status(400).json({
            success: false,
            message: "Unable to read webhook request"
        });
    }

    if (event?.event !== "payment_link.paid") {
        return res.status(200).json({
            success: true,
            ignored: true
        });
    }

    const link = event.payload?.payment_link?.entity;
    const payment = event.payload?.payment?.entity;
    if (!link || !payment) {
        return res.status(400).json({
            success: false,
            message: "Payment link or payment details are missing"
        });
    }

    const referenceMatch = typeof link.reference_id === "string"
        ? /^plan_(starter|professional|enterprise)_([A-Za-z0-9-]+)$/
            .exec(link.reference_id)
        : null;
    if (!referenceMatch) {
        return res.status(400).json({
            success: false,
            message: "Payment link reference is invalid"
        });
    }

    const [, planId, userId] = referenceMatch;
    const plan = PLANS[planId];

    if (
        link.status !== "paid" ||
        link.currency !== "INR" ||
        !Number.isSafeInteger(link.amount) ||
        !Number.isSafeInteger(link.amount_paid) ||
        link.amount !== plan.amount ||
        link.amount_paid < plan.amount ||
        typeof payment.id !== "string" ||
        !payment.id ||
        payment.status !== "captured" ||
        payment.currency !== "INR" ||
        !Number.isSafeInteger(payment.amount) ||
        payment.amount !== plan.amount
    ) {
        return res.status(400).json({
            success: false,
            message: "Payment details do not match the selected plan"
        });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        console.error("Supabase webhook configuration is incomplete.");
        return res.status(500).json({
            success: false,
            message: "Subscription service is not configured"
        });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_KEY
        );
        const { data: user, error: userError } = await supabase
            .from("user_data")
            .select("id, full_name, email, expiry")
            .eq("id", userId)
            .maybeSingle();

        if (userError) {
            console.error("Unable to look up payment customer:", userError);
            return res.status(500).json({
                success: false,
                message: "Unable to find the subscription account"
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Subscription account was not found"
            });
        }

        const expiry = nextExpiry(user.expiry);
        const { data: updatedUser, error: updateError } = await supabase
            .from("user_data")
            .update({ plan: planId, expiry })
            .eq("id", userId)
            .select("id")
            .maybeSingle();

        if (updateError) {
            console.error("Unable to update subscription:", updateError);
            return res.status(500).json({
                success: false,
                message: "Unable to activate the subscription"
            });
        }

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Subscription account was not found"
            });
        }

        let emailSent = false;
        if (process.env.RESEND_KEY && user.email) {
            try {
                const resend = new Resend(process.env.RESEND_KEY);
                const { error: emailError } = await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: user.email,
                    subject: "Your subscription has been activated",
                    html: `
                        <h1>Subscription Activated</h1>
                        <p>Thanks for your purchase. Your ${plan.name} plan is now active.</p>
                    `
                });

                if (emailError) {
                    console.error("Subscription activation email failed:", emailError);
                } else {
                    emailSent = true;
                }
            } catch (emailError) {
                console.error("Subscription activation email failed:", emailError);
            }
        } else {
            console.error("Subscription activation email was skipped: Resend is not configured or the account has no email.");
        }

        return res.status(200).json({
            success: true,
            plan: planId,
            expiry,
            emailSent
        });
    } catch (error) {
        console.error("Razorpay webhook processing failed:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to process payment confirmation"
        });
    }
}
