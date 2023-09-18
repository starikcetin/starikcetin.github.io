import * as theme from "./theme.js";
import * as email from "./email.js";
import * as datetime from "./datetime.js";
import * as feather from "./feather.js";
import * as giscus from "./giscus.js";
import * as googleAnalytics from "./googleAnalytics.js";
import * as visibilityTriggers from "./visibilityTriggers.js";

let didRunOnLoad = false;
function onLoad() {
    if (didRunOnLoad) {
        return;
    }
    didRunOnLoad = true;
    
    theme.onLoad();
    email.onLoad();
    datetime.onLoad();
    feather.onLoad();
    giscus.onLoad();
    googleAnalytics.onLoad();
    visibilityTriggers.onLoad();
}

window.addEventListener("DOMContentLoaded", onLoad);
window.addEventListener("load", onLoad);
