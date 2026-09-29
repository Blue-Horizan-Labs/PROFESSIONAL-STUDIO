/* =========================================================
   PROFESSIONAL STUDIO
   PAYMENT & ACCOUNTS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const STORAGE_KEY =
        "professionalStudio.paymentAccount";

    const UPI_STORAGE_KEY =
        "professionalStudio.paymentUPI";


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const bankForm =
        document.getElementById("bankAccountForm");

    const upiForm =
        document.getElementById("upiForm");

    const accountHolder =
        document.getElementById("accountHolder");

    const bankName =
        document.getElementById("bankName");

    const accountType =
        document.getElementById("accountType");

    const accountNumber =
        document.getElementById("accountNumber");

    const confirmAccountNumber =
        document.getElementById("confirmAccountNumber");

    const ifsc =
        document.getElementById("ifsc");

    const upiId =
        document.getElementById("upiId");

    const accountStatusBadge =
        document.getElementById("accountStatusBadge");

    const accountDisplayName =
        document.getElementById("accountDisplayName");

    const accountDisplayDetails =
        document.getElementById("accountDisplayDetails");

    const removeAccountBtn =
        document.getElementById("removeAccountBtn");

    const defaultMethod =
        document.getElementById("defaultMethod");

    const sidebarStatus =
        document.getElementById("sidebarStatus");

    const upiStatus =
        document.getElementById("upiStatus");

    const clearFormBtn =
        document.getElementById("clearFormBtn");

    const toast =
        document.getElementById("toast");



    /* =====================================================
       STORAGE HELPERS
    ====================================================== */

    function getStoredAccount() {

        try {

            const data =
                localStorage.getItem(STORAGE_KEY);

            if (!data) {
                return null;
            }

            return JSON.parse(data);

        } catch (error) {

            console.warn(
                "Unable to read payment account.",
                error
            );

            return null;
        }
    }


    function saveStoredAccount(data) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(data)
            );

            return true;

        } catch (error) {

            console.warn(
                "Unable to save payment account.",
                error
            );

            return false;
        }
    }


    function getStoredUPI() {

        try {

            return localStorage.getItem(
                UPI_STORAGE_KEY
            );

        } catch (error) {

            console.warn(
                "Unable to read UPI.",
                error
            );

            return null;
        }
    }



    /* =====================================================
       TOAST
    ====================================================== */

    let toastTimer = null;


    function showToast(message) {

        if (!toast) {
            return;
        }

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {

            toast.classList.remove("show");

        }, 2600);
    }



    /* =====================================================
       ERROR HANDLING
    ====================================================== */

    function setError(input, errorElement, message) {

        if (input) {
            input.classList.toggle(
                "input-error",
                Boolean(message)
            );
        }

        if (errorElement) {
            errorElement.textContent =
                message || "";
        }
    }


    function clearErrors() {

        document
            .querySelectorAll(".field-error")
            .forEach(element => {

                element.textContent = "";

            });


        document
            .querySelectorAll(".input-error")
            .forEach(element => {

                element.classList.remove(
                    "input-error"
                );

            });
    }



    /* =====================================================
       VALIDATION
    ====================================================== */

    function validateBankForm() {

        clearErrors();

        let valid = true;


        const accountHolderError =
            document.getElementById(
                "accountHolderError"
            );

        const bankNameError =
            document.getElementById(
                "bankNameError"
            );

        const accountTypeError =
            document.getElementById(
                "accountTypeError"
            );

        const accountNumberError =
            document.getElementById(
                "accountNumberError"
            );

        const confirmAccountNumberError =
            document.getElementById(
                "confirmAccountNumberError"
            );

        const ifscError =
            document.getElementById(
                "ifscError"
            );


        const holderValue =
            accountHolder.value.trim();

        const bankValue =
            bankName.value.trim();

        const typeValue =
            accountType.value;

        const accountValue =
            accountNumber.value.trim();

        const confirmValue =
            confirmAccountNumber.value.trim();

        const ifscValue =
            ifsc.value.trim().toUpperCase();



        if (holderValue.length < 2) {

            setError(
                accountHolder,
                accountHolderError,
                "Enter the account holder name."
            );

            valid = false;
        }



        if (bankValue.length < 2) {

            setError(
                bankName,
                bankNameError,
                "Enter the bank name."
            );

            valid = false;
        }



        if (!typeValue) {

            setError(
                accountType,
                accountTypeError,
                "Select an account type."
            );

            valid = false;
        }



        if (!/^[0-9]{9,18}$/.test(accountValue)) {

            setError(
                accountNumber,
                accountNumberError,
                "Enter a valid account number."
            );

            valid = false;
        }



        if (
            confirmValue !== accountValue ||
            !confirmValue
        ) {

            setError(
                confirmAccountNumber,
                confirmAccountNumberError,
                "Account numbers do not match."
            );

            valid = false;
        }



        const ifscPattern =
            /^[A-Z]{4}0[A-Z0-9]{6}$/;


        if (!ifscPattern.test(ifscValue)) {

            setError(
                ifsc,
                ifscError,
                "Enter a valid 11-character IFSC code."
            );

            valid = false;
        }


        return valid;
    }



    /* =====================================================
       DISPLAY ACCOUNT
    ====================================================== */

    function maskAccountNumber(number) {

        if (!number) {
            return "";
        }


        const lastFour =
            number.slice(-4);


        return "•••• •••• " + lastFour;
    }


    function renderAccount() {

        const account =
            getStoredAccount();


        if (!account) {

            accountStatusBadge.textContent =
                "Not Connected";

            accountStatusBadge.classList.remove(
                "status-connected"
            );

            accountStatusBadge.classList.add(
                "status-not-connected"
            );


            accountDisplayName.textContent =
                "No account connected";


            accountDisplayDetails.textContent =
                "Add your bank account below.";


            removeAccountBtn.classList.add(
                "danger-hidden"
            );


            sidebarStatus.textContent =
                "Not connected";


            defaultMethod.textContent =
                "Not configured";


            return;
        }


        accountStatusBadge.textContent =
            "Connected";


        accountStatusBadge.classList.remove(
            "status-not-connected"
        );


        accountStatusBadge.classList.add(
            "status-connected"
        );


        accountDisplayName.textContent =
            account.bankName;


        accountDisplayDetails.textContent =
            `${account.accountType} • ${maskAccountNumber(
                account.accountNumber
            )} • ${account.ifsc}`;


        removeAccountBtn.classList.remove(
            "danger-hidden"
        );


        sidebarStatus.textContent =
            "Connected";


        defaultMethod.textContent =
            "Bank Account";
    }



    /* =====================================================
       LOAD ACCOUNT INTO FORM
    ====================================================== */

    function loadAccountIntoForm() {

        const account =
            getStoredAccount();


        if (!account) {
            return;
        }


        accountHolder.value =
            account.accountHolder || "";


        bankName.value =
            account.bankName || "";


        accountType.value =
            account.accountType || "";


        accountNumber.value =
            account.accountNumber || "";


        confirmAccountNumber.value =
            account.accountNumber || "";


        ifsc.value =
            account.ifsc || "";
    }



    /* =====================================================
       BANK FORM SUBMIT
    ====================================================== */

    if (bankForm) {

        bankForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                if (!validateBankForm()) {

                    showToast(
                        "Please correct the highlighted fields."
                    );

                    return;
                }


                const account = {

                    accountHolder:
                        accountHolder.value.trim(),

                    bankName:
                        bankName.value.trim(),

                    accountType:
                        accountType.value,

                    accountNumber:
                        accountNumber.value.trim(),

                    ifsc:
                        ifsc.value
                            .trim()
                            .toUpperCase(),

                    updatedAt:
                        new Date().toISOString()

                };


                const saved =
                    saveStoredAccount(account);


                if (!saved) {

                    showToast(
                        "Unable to save account details."
                    );

                    return;
                }


                renderAccount();


                showToast(
                    "Payout account saved."
                );

            }
        );

    }



    /* =====================================================
       CLEAR FORM
    ====================================================== */

    if (clearFormBtn) {

        clearFormBtn.addEventListener(
            "click",
            () => {

                bankForm.reset();

                clearErrors();

                showToast(
                    "Form cleared."
                );

            }
        );

    }



    /* =====================================================
       REMOVE ACCOUNT
    ====================================================== */

    if (removeAccountBtn) {

        removeAccountBtn.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Remove the saved payout account?"
                    );


                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    STORAGE_KEY
                );


                bankForm.reset();

                clearErrors();

                renderAccount();

                showToast(
                    "Payout account removed."
                );

            }
        );

    }



    /* =====================================================
       SHOW / HIDE ACCOUNT NUMBER
    ====================================================== */

    document
        .querySelectorAll(
            "[data-toggle]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset.toggle;

                    const input =
                        document.getElementById(
                            targetId
                        );


                    if (!input) {
                        return;
                    }


                    const isPassword =
                        input.type === "password";


                    input.type =
                        isPassword
                            ? "text"
                            : "password";


                    button.textContent =
                        isPassword
                            ? "Hide"
                            : "Show";

                }
            );

        });



    /* =====================================================
       IFSC FORMAT
    ====================================================== */

    if (ifsc) {

        ifsc.addEventListener(
            "input",
            () => {

                ifsc.value =
                    ifsc.value
                        .toUpperCase()
                        .replace(
                            /[^A-Z0-9]/g,
                            ""
                        )
                        .slice(0, 11);

            }
        );

    }



    /* =====================================================
       ACCOUNT NUMBER FORMAT
    ====================================================== */

    if (accountNumber) {

        accountNumber.addEventListener(
            "input",
            () => {

                accountNumber.value =
                    accountNumber.value
                        .replace(
                            /[^0-9]/g,
                            ""
                        )
                        .slice(0, 18);

            }
        );

    }


    if (confirmAccountNumber) {

        confirmAccountNumber.addEventListener(
            "input",
            () => {

                confirmAccountNumber.value =
                    confirmAccountNumber.value
                        .replace(
                            /[^0-9]/g,
                            ""
                        )
                        .slice(0, 18);

            }
        );

    }



    /* =====================================================
       UPI
    ====================================================== */

    if (upiForm) {

        upiForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const value =
                    upiId.value
                        .trim()
                        .toLowerCase();


                const error =
                    document.getElementById(
                        "upiError"
                    );


                const pattern =
                    /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9._-]{2,}$/;


                if (!pattern.test(value)) {

                    setError(
                        upiId,
                        error,
                        "Enter a valid UPI ID."
                    );

                    showToast(
                        "Enter a valid UPI ID."
                    );

                    return;
                }


                localStorage.setItem(
                    UPI_STORAGE_KEY,
                    value
                );


                upiStatus.textContent =
                    "Added";


                showToast(
                    "UPI ID saved."
                );

            }
        );

    }



    /* =====================================================
       LOAD UPI
    ====================================================== */

    function loadUPI() {

        const value =
            getStoredUPI();


        if (!value) {
            return;
        }


        upiId.value =
            value;


        upiStatus.textContent =
            "Added";

    }



    /* =====================================================
       INITIALIZE
    ====================================================== */

    loadAccountIntoForm();

    renderAccount();

    loadUPI();

});