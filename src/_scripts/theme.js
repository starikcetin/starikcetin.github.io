import { hasValue } from '../../scripts/nullish';

const themeLocalStorageKey = "theme";
const autoTheme = 'auto';
const lightTheme = 'light';
const darkTheme = 'dark';
const initialTheme = localStorage.getItem(themeLocalStorageKey) ?? autoTheme;
const prefersDarkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
document.documentElement.dataset.theme = initialTheme;

const saveThemeToLocalStorage = (theme) => {
    localStorage.setItem(themeLocalStorageKey, theme);
};

/**
 * @param {string} theme
 * @returns {string} no auto
 */
export const resolveTheme = (theme) => {
    return theme === autoTheme ? (prefersDarkMediaQuery.matches ? darkTheme : lightTheme) : theme;
};

/**
 * @param {string | undefined} setTo if has a value, will set the document's theme to this value
 * @returns the document's theme (after setting it if setTo has a value)
 */
export const documentTheme = (setTo) => {
    if (hasValue(setTo)) {
        document.documentElement.dataset.theme = setTo;
    }
    
    return document.documentElement.dataset.theme;
};

export function onLoad() {
    const themeSelectors = document.querySelectorAll('.theme-selector');
    
    const setGiscusThemes = (theme) => {
        const giscusFrames = document.querySelectorAll('iframe.giscus-frame');
        for (const frame of giscusFrames) {
            frame.contentWindow.postMessage({ giscus: { setConfig: { theme: resolveTheme(theme) } } }, 'https://giscus.app');
        }
    };

    const setTheme = (theme) => {
        documentTheme(theme);
        saveThemeToLocalStorage(theme);
        setGiscusThemes(theme);
    };

    for (const themeSelector of themeSelectors) {
        const trigger = themeSelector.querySelector('.trigger');
        const menu = themeSelector.querySelector('.menu');
        const options = menu.querySelectorAll('[data-option]');

        trigger.addEventListener('click', () => {
            menu.classList.toggle('visible');
        });

        for (const option of options) {
            option.addEventListener('click', () => {
                menu.classList.remove('visible');
                setTheme(option.dataset.option);
            });
        }
    }

    prefersDarkMediaQuery.addEventListener('change', () => {
        if (documentTheme() === autoTheme) {
            setTheme(autoTheme);
        }
    });

    setTheme(initialTheme);
}
