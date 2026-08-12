/* ==========================================
   Dashboard Core
========================================== */

/* Copy link */

function copyPortfolioLink() {
    const portfolioLink = window.location.origin + "/portfolio.html";

    navigator.clipboard.writeText(portfolioLink).then(() => {
        const button = document.getElementById("copyPortfolioBtn");

        button.textContent = "Copied!";

        setTimeout(() => {
            button.textContent = "Copy Portfolio Link";
        }, 2000);
    });
}


document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       SIDEBAR ACTIVE
    ========================== */

    const menuLinks = document.querySelectorAll(".menu a");

    menuLinks.forEach(link => {

        link.addEventListener("click", () => {

            menuLinks.forEach(item =>
                item.classList.remove("active")
            );

            link.classList.add("active");

        });

    });


    /* ==========================
       COUNTER ANIMATION
    ========================== */

    const counters = document.querySelectorAll(".counter");

    counters.forEach(counter => {

        const target = Number(counter.dataset.target);

        let current = 0;

        const speed = target / 80;

        function updateCounter(){

            current += speed;

            if(current < target){

                counter.textContent =
                Math.floor(current);

                requestAnimationFrame(updateCounter);

            }

            else{

                counter.textContent = target;

            }

        }

        updateCounter();

    });


    /* ==========================
       SAVE BUTTONS
    ========================== */

    document.querySelectorAll("button")
    .forEach(button=>{

        button.addEventListener("click",(e)=>{

            if(button.type==="submit") return;

            const original = button.innerText;

            button.innerText = "Saved ✓";

            button.disabled = true;

            setTimeout(()=>{

                button.innerText = original;

                button.disabled = false;

            },1500);

        });

    });


    /* ==========================
       IMAGE PREVIEW
    ========================== */

    const upload =
    document.querySelector("input[type=file]");

    if(upload){

        upload.addEventListener("change",function(){

            const file = this.files[0];

            if(!file) return;

            const reader =
            new FileReader();

            reader.onload=function(e){

                let preview =
                document.querySelector(".preview-image");

                if(!preview){

                    preview =
                    document.createElement("img");

                    preview.className =
                    "preview-image";

                    upload.parentNode.appendChild(preview);

                }

                preview.src = e.target.result;

            }

            reader.readAsDataURL(file);

        });

    }


    /* ==========================
       SMOOTH SCROLL
    ========================== */

    document
    .querySelectorAll('a[href^="#"]')
    .forEach(anchor=>{

        anchor.addEventListener("click",function(e){

            const target =
            document.querySelector(
            this.getAttribute("href")
            );

            if(!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior:"smooth",

                block:"start"

            });

        });

    });


    /* ==========================
       ACTIVE SECTION
    ========================== */

    const sections =
    document.querySelectorAll("section");

    window.addEventListener("scroll",()=>{

        let current="";

        sections.forEach(section=>{

            const top =
            section.offsetTop-120;

            if(pageYOffset>=top){

                current = section.id;

            }

        });

        menuLinks.forEach(link=>{

            link.classList.remove("active");

            if(link.getAttribute("href")==="#"+current){

                link.classList.add("active");

            }

        });

    });

});

/* ==========================================
   user.js - Part 2
   Interactive Dashboard Features
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       ADD EQUIPMENT
    ========================== */

/* ==========================
   EQUIPMENT SECTION
========================== */

function attachEquipmentEvents(card) {

    const input = card.querySelector(".equipment-input input");
    const button = card.querySelector(".add-item-btn");
    const list = card.querySelector(".equipment-list");

    if (!input || !button || !list) return;

    function addItem() {

        const value = input.value.trim();

        if (!value) return;

        const li = document.createElement("li");
        li.textContent = value;

        list.appendChild(li);

        input.value = "";
        input.focus();
    }

    button.addEventListener("click", addItem);

    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            addItem();
        }
    });

}

document.querySelectorAll(".equipment-card").forEach(card => {
    attachEquipmentEvents(card);
});

const equipmentGrid = document.querySelector(".equipment-grid");
const addEquipment = document.getElementById("addEquipment");

addEquipment.addEventListener("click", () => {

    // Prevent opening multiple create cards
    if (document.querySelector(".create-equipment-card")) return;

    const createCard = document.createElement("div");
    createCard.className = "equipment-card create-equipment-card";

    createCard.innerHTML = `
        <h3>New Equipment Category</h3>

        <input
            type="text"
            id="newEquipmentName"
            placeholder="Category name">

        <div class="create-actions">
            <button class="create-btn">Create</button>
            <button class="cancel-btn">Cancel</button>
        </div>
    `;

    equipmentGrid.insertBefore(createCard, addEquipment);

    const input = createCard.querySelector("#newEquipmentName");

    input.focus();

    function createCategory() {

        const category = input.value.trim();

        if (!category) return;

        const card = document.createElement("div");
        card.className = "equipment-card";

        card.innerHTML = `
            <h3>${category}</h3>

            <ul class="equipment-list"></ul>

            <div class="equipment-input">
                <input
                    type="text"
                    placeholder="Add ${category}">
                <button class="add-item-btn">
                    Add Item
                </button>
            </div>
        `;

        equipmentGrid.insertBefore(card, createCard);

        attachEquipmentEvents(card);

        createCard.remove();
    }

    createCard.querySelector(".create-btn")
        .addEventListener("click", createCategory);

    input.addEventListener("keydown", e => {
        if (e.key === "Enter") createCategory();
    });

    createCard.querySelector(".cancel-btn")
        .addEventListener("click", () => {
            createCard.remove();
        });

});

    /* ==========================
       ADD PRICING PACKAGE
    ========================== */

    document.querySelectorAll(".pricing-card").forEach(card => {

        const addBtn = document.createElement("button");

        addBtn.innerText = "Add Package";

        addBtn.classList.add("secondary");

        addBtn.style.marginTop = "15px";

        card.appendChild(addBtn);

        addBtn.addEventListener("click", () => {

            const packageName =
                prompt("Package Name");

            if (!packageName) return;

            const packagePrice =
                prompt("Price");

            if (!packagePrice) return;

            const wrapper =
                document.createElement("div");

            wrapper.style.marginTop = "15px";

            wrapper.innerHTML = `

                <label>${packageName}</label>

                <input
                type="text"
                value="${packagePrice}">

            `;

            card.insertBefore(wrapper, addBtn);

        });

    });

    const serviceGrid = document.getElementById("serviceGrid");
const pricingGrid = document.getElementById("pricingGrid");
const addServiceBtn = document.getElementById("addServiceBtn");
const newService = document.getElementById("newService");

function createPricingCard(serviceName) {

    return `
        <div class="pricing-card" data-service="${serviceName}">

            <h3>${serviceName}</h3>

            <label>Basic Package</label>
            <input type="text" placeholder="₹">

            <label>Premium Package</label>
            <input type="text" placeholder="₹">

            <label>Luxury Package</label>
            <input type="text" placeholder="₹">

            <button>Save Pricing</button>

        </div>
    `;
}

function updatePricing() {

    pricingGrid.innerHTML = "";

    const services = serviceGrid.querySelectorAll("label");

    services.forEach(service => {

        const checkbox = service.querySelector("input");

        if (checkbox.checked) {

            const name = service.textContent.trim();

            pricingGrid.innerHTML += createPricingCard(name);

        }

    });

}

function attachCheckboxEvents() {

    const checkboxes = serviceGrid.querySelectorAll("input[type='checkbox']");

    checkboxes.forEach(box => {

        box.onchange = updatePricing;

    });

}

addServiceBtn.onclick = () => {

    const name = newService.value.trim();

    if (name === "") return;

    const exists = [...serviceGrid.querySelectorAll("label")].some(
        s => s.textContent.trim().toLowerCase() === name.toLowerCase()
    );

    if (exists) {

        alert("Service already exists.");
        return;

    }

    const label = document.createElement("label");

    label.className = "service-card";

    label.innerHTML = `
        <input type="checkbox" checked>
        ${name}
    `;

    serviceGrid.appendChild(label);

    newService.value = "";

    attachCheckboxEvents();

    updatePricing();

};

attachCheckboxEvents();
updatePricing();


    /* ==========================
       GALLERY FILE COUNT
    ========================== */

    const upload =
        document.querySelector('input[type="file"]');

    if (upload) {

        upload.addEventListener("change", function () {

            const count = this.files.length;

            let info =
                document.querySelector(".upload-count");

            if (!info) {

                info = document.createElement("p");

                info.className = "upload-count";

                this.parentNode.appendChild(info);

            }

            info.innerHTML =
                count + " file(s) selected";

        });

    }


    /* ==========================
       SIMPLE LOCAL STORAGE
    ========================== */

    document.querySelectorAll("input, textarea, select")
        .forEach(field => {

            if (!field.name) return;

            const saved =
                localStorage.getItem(field.name);

            if (saved) {

                field.value = saved;

            }

            field.addEventListener("input", () => {

                localStorage.setItem(

                    field.name,

                    field.value

                );

            });

        });


    /* ==========================
       ANALYTICS BAR
    ========================== */

    document.querySelectorAll(".chart-placeholder")
        .forEach(chart => {

            chart.innerHTML = "";

            for (let i = 0; i < 7; i++) {

                const bar =
                    document.createElement("div");

                bar.style.width = "28px";

                bar.style.height =
                    (40 + Math.random() * 100) + "px";

                bar.style.background = "#111";

                bar.style.borderRadius = "6px";

                bar.style.display = "inline-block";

                bar.style.margin = "0 5px";

                bar.style.verticalAlign = "bottom";

                chart.appendChild(bar);

            }

        });


    /* ==========================
       MOBILE SIDEBAR
    ========================== */

    const toggle =
        document.querySelector(".mobile-toggle");

    const sidebar =
        document.querySelector(".sidebar");

    if (toggle && sidebar) {

        toggle.addEventListener("click", () => {

            sidebar.classList.toggle("show");

        });

    }


    /* ==========================
       DASHBOARD GREETING
    ========================== */

    const hour = new Date().getHours();

    let greeting = "Welcome";

    if (hour < 12)
        greeting = "Good Morning";

    else if (hour < 17)
        greeting = "Good Afternoon";

    else
        greeting = "Good Evening";

    const heading =
        document.querySelector(".topbar h1");

    if (heading) {

        heading.innerHTML =
            greeting + ", Rahul Photography";

    }


  

    document.querySelectorAll(".menu a")
        .forEach(link => {

            link.addEventListener("click", () => {

                if (window.innerWidth < 768) {

                    sidebar.classList.remove("show");

                }

            });

        });

});


/* ==========================================
   BOOKING DASHBOARD
========================================== */

const bookings = [
    {
        client: "Rahul Patil",
        service: "Wedding",
        date: "15 Aug 2026",
        amount: "₹45,000",
        status: "Confirmed"
    },
    {
        client: "Neha Sharma",
        service: "Pre-Wedding",
        date: "22 Aug 2026",
        amount: "₹18,000",
        status: "Pending"
    },
    {
        client: "Aryan Mehta",
        service: "Portrait",
        date: "30 Aug 2026",
        amount: "₹9,000",
        status: "Completed"
    },
    {
        client: "Priya Deshmukh",
        service: "Maternity",
        date: "4 Sep 2026",
        amount: "₹12,500",
        status: "Confirmed"
    },
    {
        client: "Karan Joshi",
        service: "Birthday",
        date: "12 Sep 2026",
        amount: "₹15,000",
        status: "Pending"
    },
    {
        client: "Sneha Kulkarni",
        service: "Corporate",
        date: "18 Sep 2026",
        amount: "₹32,000",
        status: "Completed"
    }
];

const table = document.getElementById("bookingTable");

const searchInput = document.getElementById("searchBooking");
const statusFilter = document.getElementById("statusFilter");
const viewFilter = document.getElementById("viewFilter");
const compareFilter = document.getElementById("compareFilter");

const totalBookings = document.getElementById("totalBookings");
const confirmedBookings = document.getElementById("confirmedBookings");
const pendingBookings = document.getElementById("pendingBookings");
const completedBookings = document.getElementById("completedBookings");

const currentValue = document.getElementById("currentValue");
const previousValue = document.getElementById("previousValue");
const growthValue = document.getElementById("growthValue");

function statusClass(status){

    if(status==="Confirmed") return "active";
    if(status==="Pending") return "pending";
    return "completed";

}

function renderTable(){

    let search = searchInput.value.toLowerCase();

    let status = statusFilter.value;

    let filtered = bookings.filter(function(booking){

        let matchSearch =
        booking.client.toLowerCase().includes(search) ||
        booking.service.toLowerCase().includes(search);

        let matchStatus =
        status==="all" || booking.status===status;

        return matchSearch && matchStatus;

    });

    table.innerHTML="";

    filtered.forEach(function(booking){

        table.innerHTML += `

        <tr>

            <td>${booking.client}</td>

            <td>${booking.service}</td>

            <td>${booking.date}</td>

            <td>${booking.amount}</td>

            <td>
                <span class="status ${statusClass(booking.status)}">
                    ${booking.status}
                </span>
            </td>

        </tr>

        `;

    });

    updateStats(filtered);

}

function updateStats(list){

    totalBookings.textContent=list.length;

    confirmedBookings.textContent=
    list.filter(b=>b.status==="Confirmed").length;

    pendingBookings.textContent=
    list.filter(b=>b.status==="Pending").length;

    completedBookings.textContent=
    list.filter(b=>b.status==="Completed").length;

}

function updateComparison(){

    let current=0;
    let previous=0;

    switch(viewFilter.value){

        case "week":
            current=5;
            previous=4;
        break;

        case "month":
            current=18;
            previous=14;
        break;

        case "year":
            current=132;
            previous=115;
        break;

        default:
            current=584;
            previous=530;

    }

    if(compareFilter.value==="none"){

        previousValue.textContent="--";
        growthValue.textContent="--";
        return;

    }

    currentValue.textContent=current;

    previousValue.textContent=previous;

    let growth=((current-previous)/previous*100).toFixed(0);

    growthValue.textContent=
    (growth>=0?"+":"")+growth+"%";

}

searchInput.addEventListener("keyup",renderTable);

statusFilter.addEventListener("change",renderTable);

viewFilter.addEventListener("change",updateComparison);

compareFilter.addEventListener("change",updateComparison);

renderTable();

updateComparison();