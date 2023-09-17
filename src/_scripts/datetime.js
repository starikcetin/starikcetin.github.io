import dayjs from "../../scripts/augmented-dayjs";

import Duration from "duration";

/**
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function equalsIgnoreCase(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;
}

function writeDatetimeElement(el) {
    const { machineForm, humanForm } = parseDatetime({
        raw: el.dataset.raw,
        type: el.dataset.type,
        format: el.dataset.format,
        presentPassthrough: el.dataset.presentPassthrough,
    });
    el.setAttribute("datetime", machineForm);
    el.innerText = humanForm;
}

function parseDatetime({ raw, type, format, presentPassthrough }) {
    let machineForm;
    let humanForm;
    
    if (equalsIgnoreCase(raw, "present")) {
        if (presentPassthrough) {
            humanForm = raw;
        }

        raw = new Date().toISOString();
    }

    switch (type) {
        case "exact":
            const parsed = dayjs.sane(raw);
            machineForm = parsed.format();
            humanForm ??= parsed.format(format);
            break;
        case "since":
            const start = dayjs.sane(raw);
            const diff = new Duration(start.toDate(), new Date());
            machineForm = diff.toString("P%dsDT%HH%MM");
            humanForm ??= diff.toString(format);
            break;
        default:
            throw new Error(`Unknown date template type: ${type} for element: ${el}`);
    }

    return {
        machineForm,
        humanForm,
    };
}

export function onLoad() {
    document.querySelectorAll('.date-template').forEach(el => {
        writeDatetimeElement(el);
    
        if(equalsIgnoreCase(el.dataset.type, "since") || equalsIgnoreCase(el.dataset.raw, "present")) {
            setInterval(() => {
                writeDatetimeElement(el);
            }, 1000);
        }
    });
}
