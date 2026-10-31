import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const requiredString = (value) =>
    typeof value === "string" && value.trim().length > 0;

const isValidDate = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

function logAndRespond(res, status, message, logMessage, details) {
    if (details === undefined) {
        console.error(logMessage);
    } else {
        console.error(logMessage, details);
    }

    return res.status(status).json({ error: message });
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    })[character]);
}

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET" && req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        return logAndRespond(
            res,
            405,
            "Method not allowed",
            `Unsupported appointment request method: ${req.method}`
        );
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        return logAndRespond(
            res,
            500,
            "Server configuration error",
            "Supabase environment variables are not configured"
        );
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
    );

    if (req.method === "GET") {
        const studioId = req.query?.studio_id;
        if (!requiredString(studioId)) {
            return res.status(400).json({ error: "A valid studio_id is required" });
        }

        try {
            const { data: appointments, error } = await supabase
                .from("appointment")
                .select("date, status")
                .eq("studio_id", studioId.trim());

            if (error) {
                return logAndRespond(
                    res,
                    500,
                    "Unable to check date availability",
                    "Failed to retrieve booked dates:",
                    error
                );
            }

            const unavailableStatuses = new Set([
                "denied",
                "declined",
                "cancelled",
                "canceled"
            ]);
            const bookedDates = [
                ...new Set(
                    (appointments ?? [])
                        .filter(
                            (appointment) =>
                                !unavailableStatuses.has(
                                    String(appointment.status ?? "").toLowerCase()
                                )
                        )
                        .map((appointment) => appointment.date)
                        .filter((date) => typeof date === "string")
                )
            ];

            return res.status(200).json({ bookedDates });
        } catch (error) {
            return logAndRespond(
                res,
                500,
                "Unable to check date availability",
                "Unexpected error retrieving booked dates:",
                error
            );
        }
    }

    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ error: "A JSON request body is required" });
    }

    const {
        studio_id,
        service_id,
        name,
        email,
        phone,
        dates,
        location,
        notes
    } = body;

    if (
        !requiredString(studio_id) ||
        (typeof service_id !== "string" && typeof service_id !== "number") ||
        !String(service_id).trim() ||
        !requiredString(name) ||
        name.trim().length > 120 ||
        !requiredString(email) ||
        email.trim().length > 254 ||
        !requiredString(phone) ||
        phone.trim().length > 40 ||
        !requiredString(location) ||
        location.trim().length > 300 ||
        !Array.isArray(dates) ||
        dates.length === 0 ||
        dates.length > 30 ||
        !dates.every(isValidDate) ||
        new Set(dates).size !== dates.length ||
        (notes !== undefined &&
            (typeof notes !== "string" || notes.length > 2000))
    ) {
        return res.status(400).json({ error: "Booking request details are invalid" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: "A valid email address is required" });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (dates.some((date) => date < today)) {
        return res.status(400).json({ error: "Event dates must be today or later" });
    }

    try {
        const normalizedStudioId = studio_id.trim();
        const { data: service, error: serviceError } = await supabase
            .from("services")
            .select("id, name, amount, advanced")
            .eq("id", String(service_id).trim())
            .eq("studio_id", normalizedStudioId)
            .maybeSingle();

        if (serviceError) {
            return logAndRespond(
                res,
                500,
                "Unable to verify selected service",
                "Failed to look up selected service:",
                serviceError
            );
        }

        if (!service) {
            return res.status(404).json({
                error: "The selected service was not found for this studio"
            });
        }

        const amount = Number(service.amount);
        const advancedAmount =
            service.advanced === null || service.advanced === undefined
                ? 0
                : Number(service.advanced);

        if (
            !Number.isFinite(amount) ||
            amount < 0 ||
            !Number.isFinite(advancedAmount) ||
            advancedAmount < 0
        ) {
            return logAndRespond(
                res,
                500,
                "Selected service pricing is invalid",
                "Selected service has invalid pricing"
            );
        }

        const { data: existingAppointments, error: availabilityError } =
            await supabase
                .from("appointment")
                .select("date, status")
                .eq("studio_id", normalizedStudioId)
                .in("date", dates);

        if (availabilityError) {
            return logAndRespond(
                res,
                500,
                "Unable to check date availability",
                "Failed to check appointment date conflicts:",
                availabilityError
            );
        }

        const unavailableStatuses = new Set([
            "denied",
            "declined",
            "cancelled",
            "canceled"
        ]);
        const conflictingDates = [
            ...new Set(
                (existingAppointments ?? [])
                    .filter(
                        (appointment) =>
                            !unavailableStatuses.has(
                                String(appointment.status ?? "").toLowerCase()
                            )
                    )
                    .map((appointment) => appointment.date)
                    .filter((date) => dates.includes(date))
            )
        ];

        if (conflictingDates.length) {
            return res.status(409).json({
                error: "One or more selected dates are already booked",
                conflictingDates
            });
        }

        const serviceIdValue = /^\d+$/.test(String(service.id))
            ? Number(service.id)
            : String(service.id);
        
        const { data: studio, error: studioError } = await supabase
            .from("user_data")
            .select("std_name, email, full_name")
            .eq("id", normalizedStudioId)
            .maybeSingle();


        console.log("Studio data retrieved:", studio, "Error:", studioError);
        const appointmentRows = dates.map((date) => ({
            studio_id: normalizedStudioId,
            studio_name: studio?.std_name || null,
            client: {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim()
            },
            service: serviceIdValue,
            service_name: service.name,
            date,
            time: null,
            location: location.trim(),
            notes: notes?.trim() ?? "",
            amount,
            status: "pending/unpaid"
        }));

        const { data: appointments, error: insertError } = await supabase
            .from("appointment")
            .insert(appointmentRows)
            .select("*");

        if (insertError) {
            return logAndRespond(
                res,
                500,
                "Unable to create booking request",
                "Failed to create appointment requests:",
                insertError
            );
        }

        if (studioError) {
            console.error("Failed to retrieve studio for booking notification:", studioError);
        } else if (studio?.email && process.env.RESEND_KEY) {
            const dateList = dates.map(escapeHtml).join(", ");
            try {
                const { error: emailError } = await new Resend(
                    process.env.RESEND_KEY
                ).emails.send({
                    from: "onboarding@resend.dev",
                    to: studio.email,
                    subject: "NEW APPOINTMENT REQUEST",
                    html: `
                        <h1>Hello, ${escapeHtml(studio.full_name || "Studio")}!</h1>
                        <p>You have a new booking request.</p>
                        <p><strong>Client:</strong> ${escapeHtml(name.trim())}</p>
                        <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
                        <p><strong>Phone:</strong> ${escapeHtml(phone.trim())}</p>
                        <p><strong>Service:</strong> ${escapeHtml(service.name)}</p>
                        <p><strong>Event dates:</strong> ${dateList}</p>
                        <p><strong>Location:</strong> ${escapeHtml(location.trim())}</p>
                        <p><strong>Notes:</strong> ${escapeHtml(notes?.trim() || "None")}</p>
                        <p><strong>Total amount:</strong> ₹${amount.toFixed(2)}</p>
                        <p><strong>Advance amount:</strong> ₹${advancedAmount.toFixed(2)}</p>
                    `
                });

                if (emailError) {
                    console.error("Failed to send booking notification:", emailError);
                }
            } catch (emailError) {
                console.error("Failed to send booking notification:", emailError);
            }
        }

        return res.status(201).json({
            appointments: appointments ?? [],
            service: {
                id: service.id,
                name: service.name,
                amount,
                advanced: advancedAmount
            }
        });
    } catch (error) {
        console.error("Unexpected error creating appointment:", error);
        return res.status(500).json({ error: "Unable to create booking request" });
    }
}
