const btn = document.getElementById('btn');
if (localStorage.getItem('?') == 'true') {
    btn.disabled = true;
    btn.textContent = "You're already on the waitlist!";
}
btn.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    try {
        const response = await fetch('/api/waitlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        const result = await response.json();
        if (response.ok) {
            window.alert("Thanks for showing interest! We'll notify you when we launch.");
            localStorage.setItem('?', 'true');
            btn.disabled = true;
            btn.textContent = "You're already on the waitlist!";
            
        } else {
            window.alert("Error adding to waitlist. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        window.alert("An error occurred. Please try again.");
    }
});