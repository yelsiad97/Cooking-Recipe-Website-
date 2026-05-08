/**
 * themeswitcher.js
 * Theme Switching System — Cooking & Recipe Website
 * Works exclusively with themes.css
 */

"use strict";

const STORAGE_KEY = 'cookingTheme';
const THEMES = ['theme-light', 'theme-dark', 'theme-autumn'];
const DEFAULT_THEME = 'theme-light';

/**
 * Called on page load. Reads localStorage and applies saved theme.
 */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    applyTheme(savedTheme, false); // Don't save on load
}

/**
 * Updates body classes and theme toggle UI.
 */
function applyTheme(themeName, save = true) {
    // Remove old themes
    document.body.classList.remove(...THEMES);

    // Add new theme
    if (themeName) {
        document.body.classList.add(themeName);
    }

    // Update UI labels/icons
    updateThemeUI(themeName);

    // Save to localStorage
    if (save) {
        saveTheme(themeName);
    }
}

/**
 * Saves theme to localStorage.
 */
function saveTheme(themeName) {
    localStorage.setItem(STORAGE_KEY, themeName);
}

/**
 * Updates the theme toggle button icon and label.
 */
function updateThemeUI(themeName) {
    const label = document.querySelector('.current-theme-label');
    const icon = document.querySelector('.current-theme-icon');

    let labelText = 'Light';
    let iconClass = 'icon-sun';

    if (themeName === 'theme-dark') {
        labelText = 'Dark';
        iconClass = 'icon-moon';
    } else if (themeName === 'theme-autumn') {
        labelText = 'Autumn';
        iconClass = 'icon-leaf';
    }

    if (label) label.textContent = labelText;
    if (icon) icon.className = `current-theme-icon ${iconClass}`; 
}

/**
 * Binds click events and hover previews to theme buttons.
 */
function initThemeSwitcher() {
    const themeOptions = document.querySelectorAll('.theme-option');

    themeOptions.forEach(option => {
        const themeToApply = option.getAttribute('data-theme');

        // Click: Apply & save
        option.addEventListener('click', (e) => {
            e.preventDefault();
            applyTheme(themeToApply, true);
        });

        // Hover: Preview theme
        option.addEventListener('mouseenter', () => {
            document.body.classList.remove(...THEMES);
            document.body.classList.add(themeToApply);
        });

        // Mouse leave: Restore saved theme
        option.addEventListener('mouseleave', () => {
            const savedTheme = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
            applyTheme(savedTheme, false);
        });
    });
}



// Apply saved theme IMMEDIATELY (before DOMContentLoaded) to prevent flash of wrong theme
loadSavedTheme();

// Init click/hover events after DOM is ready
document.addEventListener('DOMContentLoaded', initThemeSwitcher);