document.addEventListener("DOMContentLoaded", function () {

    const GOOGLE_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbyPrh9neI38s-X8KJ9Npl08ZbLrQwYZHvchcdlQ1d5vqCwNPtrV_xIeRjQN0CTtrYSGTQ/exec";

    const monthYear = document.getElementById("monthYear");
    const calendarDays = document.getElementById("calendarDays");
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");

    const appointmentBox = document.getElementById("appointmentBox");
    const selectedDateText = document.getElementById("selectedDate");
    const timeSlots = document.getElementById("timeSlots");

    const appointmentForm = document.getElementById("appointmentForm");

    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;

    const availableTimes = [
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "12:00 PM - 01:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM",
        "04:00 PM - 05:00 PM",
        "06:00 PM - 08:00 PM",
        "08:00 PM - 10:00 PM"
    ];


    /* =========================
       CALENDAR
    ========================= */

    function renderCalendar() {

        calendarDays.innerHTML = "";

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);

        // Monday = 0
        const startingDay = (firstDay.getDay() + 6) % 7;

        const daysInMonth =
            new Date(year, month + 1, 0).getDate();

        monthYear.textContent =
            currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric"
            });


        // Empty spaces before first day
        for (let i = 0; i < startingDay; i++) {

            const emptyDay = document.createElement("div");

            emptyDay.classList.add("empty");

            calendarDays.appendChild(emptyDay);
        }


        // Create calendar days
        for (let day = 1; day <= daysInMonth; day++) {

            const dayElement = document.createElement("div");

            dayElement.textContent = day;

            const date = new Date(year, month, day);

            const today = new Date();

            today.setHours(0, 0, 0, 0);


            if (date < today) {

                dayElement.classList.add("past");

            } else {

                dayElement.classList.add("available");

                dayElement.addEventListener("click", function () {

                    selectDate(date, dayElement);

                });
            }

            calendarDays.appendChild(dayElement);
        }
    }


    /* =========================
       SELECT DATE
    ========================= */

    function selectDate(date, element) {

        document
            .querySelectorAll(".calendar-days .selected")
            .forEach(function (item) {

                item.classList.remove("selected");

            });


        element.classList.add("selected");

        selectedDate = date;


        const formattedDate =
            date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });


        selectedDateText.textContent = formattedDate;

        appointmentBox.style.display = "block";

        showTimeSlots();


        appointmentBox.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /* =========================
       SHOW TIME SLOTS
    ========================= */

    function showTimeSlots() {

        timeSlots.innerHTML = "";

        selectedTime = null;


        const now = new Date();
        const isToday = selectedDate &&
            selectedDate.getFullYear() === now.getFullYear() &&
            selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getDate() === now.getDate();


        availableTimes.forEach(function (time) {

            const button = document.createElement("button");

            button.type = "button";

            button.className = "time-slot";

            button.textContent = time;

            button.setAttribute("data-time", time);

            if (isToday && getSlotStartTime(time) <= now.getTime()) {
                button.disabled = true;
                button.classList.add("past");
            }

            timeSlots.appendChild(button);

        });
    }


    function getSlotStartTime(time) {
        const startTime = time.split(" - ")[0];
        const parts = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        const slotDate = new Date(selectedDate);
        let hours = Number(parts[1]);

        if (parts[3].toUpperCase() === "PM" && hours !== 12) {
            hours += 12;
        }

        if (parts[3].toUpperCase() === "AM" && hours === 12) {
            hours = 0;
        }

        slotDate.setHours(hours, Number(parts[2]), 0, 0);
        return slotDate.getTime();
    }


    /* =========================
       TIME SLOT CLICK
    ========================= */

    timeSlots.addEventListener("click", function (event) {

        const button = event.target.closest(".time-slot");

        if (!button) {
            return;
        }

        if (button.disabled) {
            return;
        }


        document
            .querySelectorAll(".time-slot")
            .forEach(function (item) {

                item.classList.remove("selected");

            });


        button.classList.add("selected");

        selectedTime = button.getAttribute("data-time");


        console.log("Selected Time:", selectedTime);
    });


    /* =========================
       PREVIOUS MONTH
    ========================= */

    prevMonth.addEventListener("click", function () {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();

        appointmentBox.style.display = "none";

        selectedDate = null;
        selectedTime = null;
    });


    /* =========================
       NEXT MONTH
    ========================= */

    nextMonth.addEventListener("click", function () {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();

        appointmentBox.style.display = "none";

        selectedDate = null;
        selectedTime = null;
    });


    /* =========================
       APPOINTMENT SUBMIT
    ========================= */

    appointmentForm.addEventListener("submit", function (event) {

        event.preventDefault();


        if (!selectedDate) {

            alert("Please select a date.");

            return;
        }


        if (!selectedTime) {

            alert("Please select a time slot.");

            return;
        }


        const name =
            document.getElementById("customerName").value.trim();

        const phone =
            document.getElementById("customerPhone").value.trim();

        const mehendiType =
            document.getElementById("mehendiType").value;


        if (!name || !phone || !mehendiType) {

            alert("Please fill all the details.");

            return;
        }


        const formattedDate =
            selectedDate.getDate() + "/" +
            (selectedDate.getMonth() + 1) + "/" +
            selectedDate.getFullYear();


        /* =========================
           SAVE TO GOOGLE SHEET
        ========================= */

        const bookingData = {

            type: "booking",

            sheetName: "Sheet2",

            sheet: "Sheet2",

            name: name,

            phone: phone,

            mehendiType: mehendiType,

            date: formattedDate,

            time: selectedTime
        };


        const submitButton =
            appointmentForm.querySelector("button[type='submit']");


        submitButton.disabled = true;

        submitButton.textContent = "SAVING...";


        fetch(GOOGLE_SCRIPT_URL, {

            method: "POST",

            mode: "no-cors",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(bookingData)

        })
        .then(function () {

            /* =========================
               WHATSAPP
            ========================= */

            const whatsappNumber = "918668526211";


            const message =
                "Hello Reshma Mehendi Art!\n\n" +
                "*New Appointment Request*\n\n" +
                "Name: " + name + "\n" +
                "Phone: " + phone + "\n" +
                "Mehendi Type: " + mehendiType + "\n" +
                "Date: " + formattedDate + "\n" +
                "Time: " + selectedTime;


            const whatsappURL =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(message);


            window.open(
                whatsappURL,
                "_blank"
            );


            alert(
                "Appointment saved successfully!\n\n" +
                "Date: " + formattedDate +
                "\nTime: " + selectedTime
            );


            appointmentForm.reset();

            submitButton.disabled = false;

            submitButton.textContent =
                "CONFIRM APPOINTMENT";

        })
        .catch(function (error) {

            console.error("Booking Error:", error);

            alert(
                "There was a problem saving the appointment. Please try again."
            );

            submitButton.disabled = false;

            submitButton.textContent =
                "CONFIRM APPOINTMENT";
        });

    });


    /* =========================
       LOAD CALENDAR
    ========================= */

    renderCalendar();
    showTimeSlots();

});