export function onLoad() {
    if (siteConfig.deployEnv === "prod" && siteConfig.googleAnalytics) {
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('set', {
            cookie_domain: siteConfig.baseUrl.replace(/^https?:\/\//, ''),
            cookie_flags: 'SameSite=None;Secure',
        });
        gtag('config', siteConfig.google_analytics);
    }
}
