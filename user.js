window.addEventListener('DOMContentLoaded', () => {
    try {
        fetch('/api/dashboard-data')
        .then(response => response.json())
        .then(data => {
            if (data.message === "Unauthorized") {
                alert('You are not authorized to access this page. Please log in.');
                window.location.href = '/login';
                return;
            }
            document.getElementById('name').textContent = data.name;
            document.getElementById('openPortfolioBtn').addEventListener('click', () => {
                window.location.href = '/api/client?id='+data.link;
            })
            document.getElementById('copyProfileBtn').addEventListener('click', async () => {
                await navigator.clipboard.writeText(window.location.origin+'/api/client?id='+data.link);
                document.getElementById('copyProfileBtn').textContent = 'Copied!';
                setTimeout(() => {
                    document.getElementById('copyProfileBtn').textContent = 'Copy Profile Link';
                }, 2000);
            });
        });
    } catch (error) {
        alert('Error fetching dashboard data. Please try again later.');
        window.location.href = '/login';
    }
});