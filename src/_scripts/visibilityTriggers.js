export const onLoad = () => {
    const triggers = document.querySelectorAll('[data-visibility-trigger-for]');
    for (const trigger of triggers) {
        trigger.addEventListener('click', () => {
            const target = document.querySelector(trigger.dataset.visibilityTriggerFor);
            target.classList.toggle('visible');
        });
    }
};
