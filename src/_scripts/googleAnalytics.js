export function onLoad() {
    if (siteConfig.deployEnv === "prod" && siteConfig.googleAnalytics) {
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', siteConfig.google_analytics);
    }
}
