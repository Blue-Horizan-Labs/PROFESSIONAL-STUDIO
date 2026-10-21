window.addEventListener('DOMContentLoaded', () => {
    try {
        fetch('/api/dashboard-data')
        .then(response => response.json())
        .then(data => {
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
    }catch (error) {
        console.error('Unexpected error:', error);
    }
});