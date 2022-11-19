
const modalWindows = {
    "harrySelector": "#harryWindow",
    "eisenhuthSelector": "#eisenhuthWindow",
    "melanieSelector": "#melanieWindow",
    "carmenSelector": "#carmenWindow",
    "miriamSelector": "#miriamWindow",
    "ubaxSelector": "#ubaxWindow",
    "annaSelector": "#annaWindow"
};

const querySelectAllArr = query => document.querySelectorAll(query);

const addEvent2Array = (arr, eventType, action) => {
    arr.forEach(item => item.addEventListener(eventType, action));
};

const closeStaffWindow = (selectorProperty) => {
    const openWindow = document.querySelector(modalWindows[selectorProperty]);
    openWindow.classList.remove("popupFade");
    openWindow.hidden = true;
    document.querySelector(".modal").hidden = true;
    window.onscroll = "";
}

const staffSelectorHasFocus = selectorProperty => {
    const selectedStaff = document.getElementById(selectorProperty);
    const delay = setInterval(() => {
        if (!selectedStaff.matches(":focus")) {
            closeStaffWindow(selectorProperty);
            clearInterval(delay);
        }
    }, 300)
}

const lockScreen = () => {
    const yScroll = window.scrollY;
    const xScroll = window.scrollX;
    window.onscroll = () => { window.scroll(xScroll, yScroll); };
}

const showStaffInfo = (event) => {
    if (event.type === "click" || event.key === "Enter") {
        const selectorProperty = event.target.getAttribute("id");
        const openWindow = document.querySelector(modalWindows[selectorProperty]);
        openWindow.hidden = false;
        openWindow.classList.add("popupFade");
        document.querySelector(".modal").hidden = false;
        lockScreen();
        staffSelectorHasFocus(selectorProperty);
    }
    if (event.key === "Escape") {
        const selectorProperty = event.target.getAttribute("id");
        closeStaffWindow(selectorProperty);
    }
}


addEvent2Array(querySelectAllArr(".heads"), "click", showStaffInfo);
addEvent2Array(querySelectAllArr(".heads"), "keydown", showStaffInfo);

