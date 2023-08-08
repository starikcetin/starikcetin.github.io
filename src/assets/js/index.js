---
---

let didSetup = false;
const setup = () => {
  if (didSetup) {
    return;
  }
  didSetup = true;

  const themeLocalStorageKey = "theme";
  const themeFromLocalSorage = localStorage.getItem(themeLocalStorageKey) || 'dark';
  document.documentElement.dataset.theme = themeFromLocalSorage;

  const themeToggle = document.getElementById("theme-toggle-input");
  themeToggle.checked = themeFromLocalSorage === 'dark';

  themeToggle.addEventListener('change', () => {
    const themeFromToggle = themeToggle.checked ? 'dark' : 'light';
    document.documentElement.dataset.theme = themeFromToggle;
    localStorage.setItem(themeLocalStorageKey, themeFromToggle);

    document.querySelectorAll('iframe.giscus-frame').forEach(el => {
      el.contentWindow.postMessage({ giscus: { setConfig: { theme: themeFromToggle } } }, 'https://giscus.app');
    });
  });

  const giscusAttributes = {
    "src": "https://giscus.app/client.js",
    "data-repo": "starikcetin/starikcetin.github.io",
    "data-repo-id": "R_kgDOJ6Al7w",
    "data-category": "Giscus",
    "data-category-id": "DIC_kwDOJ6Al784CXzaw",
    "data-mapping": "pathname",
    "data-strict": "1",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "top",
    "data-theme": themeFromLocalSorage,
    "data-lang": "en",
    // "data-loading": "lazy",
    "crossorigin": "anonymous",
    "async": "",
  };

  document.querySelectorAll(".giscus-container").forEach(el => {
    const giscusScript = document.createElement("script");
    Object.entries(giscusAttributes).forEach(([key, value]) => giscusScript.setAttribute(key, value));
    el.appendChild(giscusScript);
  });

  document.querySelectorAll('a[data-mail]').forEach(el => {
    el.onclick = () => {
      window.location = 'mailto:' + el.dataset.mail + '@' + el.dataset.domain + '?subject=Contact from starikcetin.github.io';
    };
  });

  feather.replace();
};

window.addEventListener("DOMContentLoaded", setup);
window.addEventListener("load", setup);

{% if jekyll.environment == "production" and site.google_analytics %}
  window['ga-disable-{{ site.google_analytics }}'] = window.doNotTrack === "1" || navigator.doNotTrack === "1" || navigator.doNotTrack === "yes" || navigator.msDoNotTrack === "1";
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', '{{ site.google_analytics }}');
{% endif %}
