
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

const closeStaffWindow = (selectorProperty) => {
    const openWindow = document.querySelector(modalWindows[selectorProperty]);
    openWindow.classList.toggle("popupFade");
    openWindow.hidden = true;
    document.querySelector(".modal").hidden = true;
}

const staffWindowHasFocus = selectorProperty => {
    const selectedStaff = document.getElementById(selectorProperty);
    const delay = setInterval(() => {
        if (!selectedStaff.matches(":focus")) {
            closeStaffWindow(selectorProperty);
            clearInterval(delay);
        }
    }, 300)
}

const showStaffInfo = (event) => {
    if (event.type === "click" || event.code === "Enter") {
        const selectorProperty = event.target.getAttribute("id");
        const openWindow = document.querySelector(modalWindows[selectorProperty]);
        openWindow.hidden = false;
        openWindow.classList.toggle("popupFade");
        document.querySelector(".modal").hidden = false;
        staffWindowHasFocus(selectorProperty);
    }
}


addEvent2Array(querySelectAllArr(".heads"), "click", showStaffInfo);
addEvent2Array(querySelectAllArr(".heads"), "keydown", showStaffInfo);

