window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        const content = document.getElementById('content');

        loader.classList.add('hidden');
        content.classList.add('visible');

        // Через 0.6 сек повністю прибираємо loader з DOM (не обов’язково, але красиво)
        setTimeout(() => loader.style.display = 'none', 600);
    }, 600);
});
