export function onLoad() {
    document.querySelectorAll('.email-trigger').forEach(el => {
        el.onclick = () => {
            window.location = 'mailto:' + el.dataset.name + '@' + el.dataset.domain + '?subject=Contact from starikcetin.github.io';
        };
    });
}
