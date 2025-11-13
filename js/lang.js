document.addEventListener('DOMContentLoaded', function() {
    // Helper function to set up a language dropdown
    function setupLangDropdown(containerSelector, buttonClass, listClass) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            // console.warn(`Language container "${containerSelector}" not found.`);
            return;
        }

        const langBtn = container.querySelector(buttonClass);
        const langList = container.querySelector(listClass);

        if (!langBtn) {
            // console.warn(`Language button with class "${buttonClass}" not found in "${containerSelector}".`);
            return;
        }
        if (!langList) {
            // console.warn(`Language list with class "${listClass}" not found in "${containerSelector}".`);
            return;
        }

        langBtn.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent click from bubbling to document
            const isOpen = langList.classList.toggle('show');
            langBtn.setAttribute('aria-expanded', isOpen.toString());
        });

        // Add click listener to document to close this specific dropdown
        document.addEventListener('click', function(event) {
            if (langList.classList.contains('show')) {
                if (!langBtn.contains(event.target) && !langList.contains(event.target)) {
                    langList.classList.remove('show');
                    langBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // Setup for header language selector
    setupLangDropdown('.header-lang', '.choose-lang-button', '.choose-lang-list');

    // Setup for footer language selector
    setupLangDropdown('.footer-lang', '.choose-lang-button', '.choose-lang-list');
});
