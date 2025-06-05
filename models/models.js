window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        const content = document.getElementById('content');

        loader.classList.add('hidden');
        content.classList.add('visible');

        setTimeout(() => loader.style.display = 'none', 600);
    }, 600);
});
