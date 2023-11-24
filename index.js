const modalWindows = {
  harrySelector: "#harryWindow",
  eisenhuthSelector: "#eisenhuthWindow",
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
  window.onscroll = "";
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

const lockScreen = () => {
  const yScroll = window.scrollY;
  const xScroll = window.scrollX;
  window.onscroll = () => {
    window.scroll(xScroll, yScroll);
  };
};

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
};

async function fetchHolidayData() {
  const response = await fetch("./php/icalProxy.php");
  const data = await response.text();
  const elsToAppend = [];
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
  const dataArr = data.split("\n");
  dataArr.forEach((el, index) => (dataArr[index] = el.trim()));
  const formattedData = dataArr.filter((el) => el !== "");

  //add each event to array as object
  let dataIndex = 0;
  while (dataIndex < formattedData.length) {
    if (formattedData[dataIndex] === "BEGIN:VEVENT") {
      const endIndex = formattedData.indexOf("END:VEVENT", dataIndex);
      const eventSlice = formattedData.slice(dataIndex, endIndex + 1);
      const event = {};
      for (const eventItem of eventSlice) {
        const [key, value] = eventItem.split(":");
        event[key] = value;
      }
      calendarArr.push(event);
      //move to end of event
      dataIndex = endIndex + 1;
      continue;
    }
    dataIndex++;
  }

  //find the next holiday event, if any
  for (const event of calendarArr) {
    let {
      "DTSTART;VALUE=DATE": eventStartDate,
      "DTEND;VALUE=DATE": eventEndDate,
      UID: uid,
    } = event;
    eventStartDate = Number(eventStartDate);
    eventEndDate = Number(eventEndDate);

    //currently on holiday?
    if (eventStartDate < currentDate && eventEndDate > currentDate) {
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
      (obj) => obj["UID"] === eventsSortedByDate[0]["id"]
    );

    const {
      "DTSTART;VALUE=DATE": eventStartDate,
      "DTEND;VALUE=DATE": eventEndDate,
      DESCRIPTION:
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

    holidayData.startDate = formatDateInGerman(eventStartDate);
    holidayData.endDate = formatDateInGerman(eventEndDate);
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
    const noHolidayEl = document.createElement("p");
    noHolidayEl.innerText = "Zurzeit kein Urlaub geplant. Wir sind für Sie da.";
    elsToAppend.push(noHolidayEl);
  }
  const urlaubsnotizen = document.getElementById("urlaubsnotizen");
  elsToAppend.forEach((el) => urlaubsnotizen.appendChild(el));
}

addEvent2Array(querySelectAllArr(".heads"), "click", showStaffInfo);
addEvent2Array(querySelectAllArr(".heads"), "keydown", showStaffInfo);
document.addEventListener("DOMContentLoaded", fetchHolidayData);
