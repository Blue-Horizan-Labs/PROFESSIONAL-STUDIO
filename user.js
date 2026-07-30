/* ==========================================
   user.js - Part 1
   Dashboard Core
========================================== */

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

    document.querySelectorAll(".equipment-card").forEach(card => {

        const button = card.querySelector("button");
        const textarea = card.querySelector("textarea");

        if (!button || !textarea) return;

        button.addEventListener("click", () => {

            const value = prompt("Enter new equipment");

            if (!value) return;

            textarea.value +=
                (textarea.value ? "\n" : "") + value;

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


  /* ==========================
       BOOKING SEC-
    ========================== */
    const viewSelect = document.querySelector(".booking-filter select");
const compareSelect = document.querySelector(".booking-compare select");

const cards = document.querySelectorAll(".compare-card");

const bookingStats = {

    week:{
        current:5,
        previous:4,
        growth:"+25%"
    },

    month:{
        current:18,
        previous:14,
        growth:"+28%"
    },

    year:{
        current:132,
        previous:115,
        growth:"+15%"
    },

    all:{
        current:584,
        previous:530,
        growth:"+10%"
    }

};

function updateCards(type){

    let data;

    switch(type){

        case "This Week":
            data = bookingStats.week;
            cards[0].querySelector("h4").textContent="This Week";
            cards[1].querySelector("h4").textContent="Last Week";
        break;

        case "This Year":
            data = bookingStats.year;
            cards[0].querySelector("h4").textContent="This Year";
            cards[1].querySelector("h4").textContent="Last Year";
        break;

        case "All Time":
            data = bookingStats.all;
            cards[0].querySelector("h4").textContent="All Time";
            cards[1].querySelector("h4").textContent="Previous Total";
        break;

        default:
            data = bookingStats.month;
            cards[0].querySelector("h4").textContent="This Month";
            cards[1].querySelector("h4").textContent="Last Month";
    }

    cards[0].querySelector(".count").textContent=data.current;
    cards[1].querySelector(".count").textContent=data.previous;
    cards[2].querySelector(".count").textContent=data.growth;

}

viewSelect.addEventListener("change",function(){

    updateCards(this.value);

});

compareSelect.addEventListener("change",function(){

    if(this.value==="No Comparison"){

        cards[1].style.display="none";
        cards[2].style.display="none";

    }else{

        cards[1].style.display="block";
        cards[2].style.display="block";

    }

});

updateCards("This Month");