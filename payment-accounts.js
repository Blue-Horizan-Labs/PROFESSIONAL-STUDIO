/* =========================================================
   PROFESSIONAL STUDIO
   PAYMENT & ACCOUNTS

   Security rule: bank details are sent only to the secure
   backend API. This page never stores account numbers in
   localStorage or sessionStorage, and never calls a payout
   account "connected" unless the server confirms verification.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "/api/payout-accounts";

    const bankForm = document.getElementById("bankAccountForm");
    const accountHolder = document.getElementById("accountHolder");
    const bankName = document.getElementById("bankName");
    const accountType = document.getElementById("accountType");
    const accountNumber = document.getElementById("accountNumber");
    const confirmAccountNumber = document.getElementById("confirmAccountNumber");
    const ifsc = document.getElementById("ifsc");
    const accountStatusBadge = document.getElementById("accountStatusBadge");
    const accountDisplayName = document.getElementById("accountDisplayName");
    const accountDisplayDetails = document.getElementById("accountDisplayDetails");
    const removeAccountBtn = document.getElementById("removeAccountBtn");
    const defaultMethod = document.getElementById("defaultMethod");
    const sidebarStatus = document.getElementById("sidebarStatus");
    const clearFormBtn = document.getElementById("clearFormBtn");
    const toast = document.getElementById("toast");
    const submitButton = bankForm?.querySelector('button[type="submit"]');

    let currentAccount = null;
    let toastTimer = null;

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
    }

    function setError(input, errorElement, message) {
        if (input) {
            input.classList.toggle("input-error", Boolean(message));
            input.setAttribute("aria-invalid", message ? "true" : "false");
        }
        if (errorElement) errorElement.textContent = message || "";
    }

    function clearErrors() {
        document.querySelectorAll(".field-error").forEach(element => {
            element.textContent = "";
        });
        document.querySelectorAll(".input-error").forEach(element => {
            element.classList.remove("input-error");
            element.setAttribute("aria-invalid", "false");
        });
    }

    function responseMessage(data, fallback) {
        return data && typeof data.message === "string" && data.message.trim()
            ? data.message.trim()
            : fallback;
    }

    async function readJsonResponse(response) {
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) return {};
        try {
            return await response.json();
        } catch {
            return {};
        }
    }

    function setBadge(text, connected = false, pending = false) {
        if (!accountStatusBadge) return;
        accountStatusBadge.textContent = text;
        accountStatusBadge.classList.toggle("status-connected", connected);
        accountStatusBadge.classList.toggle("status-not-connected", !connected && !pending);
        accountStatusBadge.classList.toggle("status-pending", pending);
    }

    function renderAccount(account) {
        currentAccount = account && typeof account === "object" ? account : null;
        const verified = Boolean(currentAccount && (
            currentAccount.verified === true ||
            String(currentAccount.status || "").toLowerCase() === "verified"
        ));
        const pending = Boolean(currentAccount && !verified && (
            currentAccount.pending === true ||
            ["pending", "pending_verification", "verification_pending", "submitted"].includes(
                String(currentAccount.status || "").toLowerCase()
            )
        ));

        if (!currentAccount) {
            setBadge("Not Connected");
            if (accountDisplayName) accountDisplayName.textContent = "No payout account connected";
            if (accountDisplayDetails) accountDisplayDetails.textContent = "Secure payout setup is not available until the backend is configured.";
            if (removeAccountBtn) removeAccountBtn.classList.add("danger-hidden");
            if (sidebarStatus) sidebarStatus.textContent = "Not connected";
            if (defaultMethod) defaultMethod.textContent = "Not configured";
            return;
        }

        if (verified) {
            setBadge("Verified", true, false);
            if (sidebarStatus) sidebarStatus.textContent = "Verified";
            if (defaultMethod) defaultMethod.textContent = "Bank Account";
        } else if (pending) {
            setBadge("Verification Pending", false, true);
            if (sidebarStatus) sidebarStatus.textContent = "Pending verification";
            if (defaultMethod) defaultMethod.textContent = "Pending verification";
        } else {
            setBadge("Not Verified");
            if (sidebarStatus) sidebarStatus.textContent = "Not verified";
            if (defaultMethod) defaultMethod.textContent = "Not configured";
        }

        if (accountDisplayName) {
            accountDisplayName.textContent = currentAccount.bankName || "Bank account details";
        }
        const lastFour = String(currentAccount.lastFour || currentAccount.accountLast4 || "").replace(/\D/g, "").slice(-4);
        const accountTypeText = currentAccount.accountType || "Account";
        const ifscText = currentAccount.ifsc ? ` • IFSC ${currentAccount.ifsc}` : "";
        if (accountDisplayDetails) {
            accountDisplayDetails.textContent = `${accountTypeText}${lastFour ? ` • ending ${lastFour}` : ""}${ifscText}`;
        }
        if (removeAccountBtn) removeAccountBtn.classList.remove("danger-hidden");

        // Never load a full account number from the API into the form.
        if (accountHolder) accountHolder.value = currentAccount.accountHolderName || "";
        if (bankName) bankName.value = currentAccount.bankName || "";
        if (accountType) accountType.value = currentAccount.accountType || "";
        if (ifsc) ifsc.value = currentAccount.ifsc || "";
        if (accountNumber) accountNumber.value = "";
        if (confirmAccountNumber) confirmAccountNumber.value = "";
    }

    function validateBankForm() {
        clearErrors();
        let valid = true;
        const fields = [
            [accountHolder, "accountHolderError", value => value.trim().length >= 2, "Enter the account holder name."],
            [bankName, "bankNameError", value => value.trim().length >= 2, "Enter the bank name."],
            [accountType, "accountTypeError", value => Boolean(value), "Select an account type."],
            [accountNumber, "accountNumberError", value => /^[0-9]{9,18}$/.test(value.trim()), "Enter a valid account number (9–18 digits)."],
            [confirmAccountNumber, "confirmAccountNumberError", value => value.trim() === accountNumber.value.trim() && Boolean(value.trim()), "Account numbers do not match."],
            [ifsc, "ifscError", value => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.trim().toUpperCase()), "Enter a valid 11-character IFSC code."]
        ];

        fields.forEach(([input, errorId, predicate, message]) => {
            if (!input) return;
            if (!predicate(input.value)) {
                setError(input, document.getElementById(errorId), message);
                valid = false;
            }
        });
        return valid;
    }

    async function loadAccount() {
        try {
            const response = await fetch(API_BASE, {
                method: "GET",
                headers: { Accept: "application/json" },
                credentials: "same-origin"
            });
            const data = await readJsonResponse(response);
            if (response.status === 404 || response.status === 501) {
                renderAccount(null);
                return;
            }
            if (!response.ok) throw new Error(responseMessage(data, "Unable to load payout account status."));
            renderAccount(data.account || data.payoutAccount || null);
        } catch (error) {
            renderAccount(null);
            if (accountDisplayDetails) {
                accountDisplayDetails.textContent = "Payout service is not connected. No account is currently verified.";
            }
            console.info("Payout account API is unavailable until backend setup is complete.", error);
        }
    }

    if (bankForm) {
        bankForm.addEventListener("submit", async event => {
            event.preventDefault();
            if (!validateBankForm()) {
                showToast("Please correct the highlighted fields.");
                return;
            }
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Submitting…";
            }
            const payload = {
                accountHolderName: accountHolder.value.trim(),
                bankName: bankName.value.trim(),
                accountType: accountType.value,
                accountNumber: accountNumber.value.trim(),
                ifsc: ifsc.value.trim().toUpperCase()
            };

            try {
                const response = await fetch(API_BASE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify(payload)
                });
                const data = await readJsonResponse(response);
                if (!response.ok) {
                    throw new Error(responseMessage(data, response.status === 404 || response.status === 501
                        ? "Secure payout setup is not available yet. Your bank details were not saved."
                        : "Unable to submit payout details. Your bank details were not saved."));
                }
                renderAccount(data.account || data.payoutAccount || data);
                bankForm.reset();
                clearErrors();
                showToast(responseMessage(data, "Payout details submitted. Verification status is shown above."));
            } catch (error) {
                showToast(error.message || "Secure payout setup is unavailable. Your bank details were not saved.");
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Save Account";
                }
                // Remove the sensitive values from the form after the request completes.
                if (accountNumber) accountNumber.value = "";
                if (confirmAccountNumber) confirmAccountNumber.value = "";
            }
        });
    }

    if (clearFormBtn) {
        clearFormBtn.addEventListener("click", () => {
            bankForm?.reset();
            clearErrors();
            showToast("Form cleared. No payout details were saved.");
        });
    }

    if (removeAccountBtn) {
        removeAccountBtn.addEventListener("click", async () => {
            if (!currentAccount) return;
            if (!window.confirm("Remove this payout account from your workspace?")) return;
            removeAccountBtn.disabled = true;
            try {
                const response = await fetch(API_BASE, {
                    method: "DELETE",
                    headers: { Accept: "application/json" },
                    credentials: "same-origin"
                });
                const data = await readJsonResponse(response);
                if (!response.ok) {
                    throw new Error(responseMessage(data, response.status === 404 || response.status === 501
                        ? "Secure payout service is not configured. No account was removed."
                        : "Unable to remove the payout account."));
                }
                renderAccount(null);
                bankForm?.reset();
                showToast(responseMessage(data, "Payout account removed."));
            } catch (error) {
                showToast(error.message || "Unable to remove the payout account.");
            } finally {
                removeAccountBtn.disabled = false;
            }
        });
    }

    document.querySelectorAll("[data-toggle]").forEach(button => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.toggle);
            if (!input) return;
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            button.textContent = show ? "Hide" : "Show";
            button.setAttribute("aria-label", show ? "Hide account number" : "Show account number");
        });
    });

    if (ifsc) {
        ifsc.addEventListener("input", () => {
            ifsc.value = ifsc.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
        });
    }

    [accountNumber, confirmAccountNumber].forEach(input => {
        input?.addEventListener("input", () => {
            input.value = input.value.replace(/[^0-9]/g, "").slice(0, 18);
        });
    });

    loadAccount();
});
