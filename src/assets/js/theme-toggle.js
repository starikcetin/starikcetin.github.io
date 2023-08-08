// Theme toggle
const themeLocalStorageKey = "theme";
const themeFromLocalSorage = localStorage.getItem(themeLocalStorageKey) || 'dark';
document.documentElement.dataset.theme = themeFromLocalSorage;

let didSetupToggle = false;
const setupToggle = () => {
  if(didSetupToggle) return;
  didSetupToggle = true;

  const themeToggle = document.getElementById("theme-toggle-input");
  themeToggle.checked = themeFromLocalSorage === 'dark';

  themeToggle.addEventListener('change', () => {
    const themeFromToggle = themeToggle.checked ? 'dark' : 'light';
    document.documentElement.dataset.theme = themeFromToggle;
    localStorage.setItem(themeLocalStorageKey, themeFromToggle);
  });
};

window.addEventListener("DOMContentLoaded", setupToggle);
window.addEventListener("load", setupToggle);
