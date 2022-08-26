
const modalWindows = {
    "harrySelector": "#harryWindow",
    "eisenhuthSelector": "#eisenhuthWindow",
    "melanieSelector": "#melanieWindow",
    "carmenSelector": "#carmenWindow",
    "miriamSelector": "#miriamWindow",
    currentWindowOpen: ""
};

const querySelectAllArr = query => document.querySelectorAll(query);

const addEvent2Array = (arr, eventType, action) => {
    arr.forEach(item => item.addEventListener(eventType, action));
};

const showStaffInfo = (event) => {
    if (event.type === "click" || event.code === "Enter") {
        const selectorProperty = event.target.getAttribute("id");
        document.querySelector(modalWindows[selectorProperty]).hidden = false;
        document.querySelector(modalWindows[selectorProperty]).classList.toggle("popupFade");
        document.querySelector(".modal").hidden = false;
        modalWindows.currentWindowOpen = modalWindows[selectorProperty];
    }
}

const closeStaffWindow = (event) => {
    if (event.type === "click" || event.code === "Escape") {
        document.querySelector(modalWindows.currentWindowOpen).classList.toggle("popupFade");
        document.querySelector(modalWindows.currentWindowOpen).hidden = true;
        document.querySelector(".modal").hidden = true;
        modalWindows.currentWindowOpen = "";
    }
}

addEvent2Array(querySelectAllArr(".heads"), "click", showStaffInfo);
addEvent2Array(querySelectAllArr(".heads"), "keydown", showStaffInfo);
addEvent2Array(querySelectAllArr(".heads"), "keydown", closeStaffWindow);
addEvent2Array(querySelectAllArr(".modal"), "click", closeStaffWindow);

