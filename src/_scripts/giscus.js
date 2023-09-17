import { documentTheme, resolveTheme } from "./theme";

export function onLoad() {
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
        "data-theme": resolveTheme(documentTheme()),
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
}
