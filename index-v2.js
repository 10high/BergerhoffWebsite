const modalWindows = {
  harrySelector: "#harryWindow",
  gerstnerSelector: "#gerstnerWindow",
  melanieSelector: "#melanieWindow",
  carmenSelector: "#carmenWindow",
  miriamSelector: "#miriamWindow",
};

const querySelectAllArr = (query) => document.querySelectorAll(query);

const addEvent2Array = (arr, eventType, action) => {
  arr.forEach((item) => item.addEventListener(eventType, action));
};

const closeStaffWindow = (selectorProperty) => {
  const openWindow = document.querySelector(modalWindows[selectorProperty]);
  openWindow.classList.remove("popupFade");
  openWindow.hidden = true;
  document.querySelector(".modal").hidden = true;
  document.getElementById("bodyElement").classList.remove("stop-scrolling");
};

const staffSelectorHasFocus = (selectorProperty) => {
  const selectedStaff = document.getElementById(selectorProperty);
  const delay = setInterval(() => {
    if (!selectedStaff.matches(":focus")) {
      closeStaffWindow(selectorProperty);
      clearInterval(delay);
    }
  }, 300);
};

const showStaffInfo = (event) => {
  if (event.type === "click" || event.key === "Enter") {
    const selectorProperty = event.target.getAttribute("id");
    const openWindow = document.querySelector(modalWindows[selectorProperty]);
    openWindow.hidden = false;
    openWindow.classList.add("popupFade");
    document.querySelector(".modal").hidden = false;
    document.getElementById("bodyElement").classList.add("stop-scrolling");
    staffSelectorHasFocus(selectorProperty);
  }
  if (event.key === "Escape") {
    const selectorProperty = event.target.getAttribute("id");
    closeStaffWindow(selectorProperty);
  }
};

async function fetchHolidayData() {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch("./php/icalProxy.php");
      //const reponse = new Error();

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.text();
      resolve(data);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

async function displayHolidayData() {
  const elsToAppend = [];

  try {
    const data = await fetchHolidayData();

    const calendarArr = [];
    const holidayData = {
      startDate: "",
      endDate: "",
      vertreter: [],
      allUpcoming: [],
    };
    const newDate = new Date();
    const currentDate = Number(
      `${newDate.getFullYear()}${newDate.getMonth() + 1}${newDate.getDate()}`
    );

    //format the data for consumption
    const allEvents = data.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g);
    if (allEvents) {
      for (const event of allEvents) {
        const startDate = event.match(/(?<=DTSTART;VALUE=DATE:).*/g)[0];
        const endDate = event.match(/(?<=DTEND;VALUE=DATE:).*/g)[0];
        const uid = event.match(/(?<=UID:).*/g)[0];
        const descriptionRaw = event.match(
          /(?<=DESCRIPTION:)[\s\S]*(?=LAST-MODIFIED:)/g
        )[0];
        const description = descriptionRaw.replace(/\r\s+/g, "");
        calendarArr.push({
          eventStartDate: Number(startDate),
          eventEndDate: Number(endDate),
          uid: uid,
          description: description,
        });
      }
    }

    //find the next holiday event, if any
    for (const event of calendarArr) {
      const { eventStartDate, eventEndDate, uid } = event;

      //currently on holiday?
      if (eventStartDate <= currentDate && eventEndDate >= currentDate) {
        holidayData.allUpcoming.push({ id: uid, startDate: eventStartDate });
      }
      //future holiday within 3 weeks?
      if (eventStartDate > currentDate) {
        const eventStartStr = `${eventStartDate}`;
        const newEventStartDate = new Date(
          eventStartStr.substring(0, 4),
          parseInt(eventStartStr.substring(4, 6)) - 1,
          eventStartStr.substring(6, 8)
        );
        const timeDifference = newEventStartDate.getTime() - newDate.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24);
        if (daysDifference < 21) {
          holidayData.allUpcoming.push({ id: uid, startDate: eventStartDate });
        }
      }
    }
    if (holidayData.allUpcoming.length) {
      //sort all by the earliest starting date & set that data
      const eventsSortedByDate = holidayData.allUpcoming.sort(
        (a, b) => a.startDate - b.startDate
      );

      const eventDataToDisplay = calendarArr.filter(
        (obj) => obj["uid"] === eventsSortedByDate[0]["id"]
      );

      const {
        eventStartDate,
        eventEndDate,
        description = "Informationen über unsere Vertretung hören Sie über die telefonische Bandansage.",
      } = eventDataToDisplay[0];

      function formatDateInGerman(YYYYMMDD) {
        const year = Number(YYYYMMDD.substring(0, 4));
        const month = Number(YYYYMMDD.substring(4, 6)) - 1;
        const day = Number(YYYYMMDD.substring(6, 8));

        const dateObject = new Date(year, month, day);

        const germanDate = new Intl.DateTimeFormat("de-DE", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(dateObject);

        return germanDate;
      }

      holidayData.startDate = formatDateInGerman(`${eventStartDate}`);
      holidayData.endDate = formatDateInGerman(`${eventEndDate}`);
      holidayData.vertreter = description.split("\\,");
    }

    if (holidayData.allUpcoming.length) {
      const holidayDatesEl = document.createElement("p");
      holidayDatesEl.innerHTML = `Wir machen Urlaub von: <br> <span class="urlaubHighlightDates">${holidayData.startDate}</span> bis <span class="urlaubHighlightDates">${holidayData.endDate}</span>.`;
      elsToAppend.push(holidayDatesEl);

      const holidayVertreterIntroEl = document.createElement("p");
      holidayVertreterIntroEl.classList.add("urlaubSpacer");
      const holidayVertreterIntroText = document.createTextNode(
        "Wir werden vertreten von:"
      );
      holidayVertreterIntroEl.appendChild(holidayVertreterIntroText);
      elsToAppend.push(holidayVertreterIntroEl);

      const holidayVertreterULEl = document.createElement("ul");
      for (vertreter of holidayData.vertreter) {
        const li = document.createElement("li");
        li.innerHTML = `<span class="urlaubHighlightNames">${vertreter}</span>`;
        holidayVertreterULEl.appendChild(li);
      }
      elsToAppend.push(holidayVertreterULEl);
    } else {
      //No holiday planned
      const noHolidayEl = document.createElement("p");
      noHolidayEl.innerText =
        "Zurzeit kein Urlaub geplant. Wir sind für Sie da.";
      elsToAppend.push(noHolidayEl);
    }
  } catch (error) {
    //fetch error, display error message
    const noHolidayEl = document.createElement("p");
    noHolidayEl.innerText =
      "Oops! Etwas ist schiefgelaufen. Bitte aktualisiere die Seite!";
    elsToAppend.push(noHolidayEl);
  }
  const urlaubsnotizen = document.getElementById("urlaubsnotizen");
  elsToAppend.forEach((el) => urlaubsnotizen.appendChild(el));
}

addEvent2Array(querySelectAllArr(".heads"), "click", showStaffInfo);
addEvent2Array(querySelectAllArr(".heads"), "keydown", showStaffInfo);

document
  .getElementById("harryCloseBtn")
  .addEventListener("click", () => closeStaffWindow("harrySelector"));
document
  .getElementById("gerstnerCloseBtn")
  .addEventListener("click", () => closeStaffWindow("gerstnerSelector"));
document
  .getElementById("melanieCloseBtn")
  .addEventListener("click", () => closeStaffWindow("melanieSelector"));
document
  .getElementById("carmenCloseBtn")
  .addEventListener("click", () => closeStaffWindow("carmenSelector"));
document
  .getElementById("miriamCloseBtn")
  .addEventListener("click", () => closeStaffWindow("miriamSelector"));

document.addEventListener("DOMContentLoaded", displayHolidayData);
