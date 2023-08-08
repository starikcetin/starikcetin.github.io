document.querySelectorAll('a[data-mail]').forEach(function(el) {
    el.onclick = function() {
        window.location = 'mailto:' + el.dataset.mail+'@'+ el.dataset.domain+'?subject=Contact from starikcetin.github.io';
    };
});
