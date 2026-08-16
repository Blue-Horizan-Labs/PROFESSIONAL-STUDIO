/*=========================================
  MOBILE MENU
=========================================*/

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if(menuBtn){

    menuBtn.addEventListener("click",()=>{

        navLinks.classList.toggle("show-menu");

    });

}

/*=========================================
  STICKY NAVBAR
=========================================*/

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

    if(window.scrollY > 50){

        navbar.classList.add("sticky");

    }else{

        navbar.classList.remove("sticky");

    }

});

/*=========================================
  SMOOTH SCROLL
=========================================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

    anchor.addEventListener("click",function(e){

        e.preventDefault();

        const target=document.querySelector(this.getAttribute("href"));

        if(target){

            target.scrollIntoView({

                behavior:"smooth"

            });

        }

        navLinks.classList.remove("show-menu");

    });

});

/*=========================================
  FAQ
=========================================*/

const faqItems=document.querySelectorAll(".faq-item");

faqItems.forEach(item=>{

    const question=item.querySelector(".faq-question");

    question.addEventListener("click",()=>{

        faqItems.forEach(faq=>{

            if(faq!==item){

                faq.classList.remove("active");

            }

        });

        item.classList.toggle("active");

    });

});

/*=========================================
  ACTIVE NAV LINK
=========================================*/

const sections=document.querySelectorAll("section");
const navItems=document.querySelectorAll(".nav-links a");

window.addEventListener("scroll",()=>{

    let current="";

    sections.forEach(section=>{

        const top=section.offsetTop-120;
        const height=section.offsetHeight;

        if(pageYOffset>=top){

            current=section.getAttribute("id");

        }

    });

    navItems.forEach(link=>{

        link.classList.remove("active");

        if(link.getAttribute("href")==="#" + current){

            link.classList.add("active");

        }

    });

});

/*=========================================
  SCROLL REVEAL
=========================================*/

const reveals=document.querySelectorAll(

".feature-card,.portfolio-card,.equipment-card,.gallery-card,.pricing-card,.testimonial-card,.event-card,.step-card,.dash-card"

);

const reveal=()=>{

    const trigger=window.innerHeight*0.85;

    reveals.forEach(card=>{

        const top=card.getBoundingClientRect().top;

        if(top<trigger){

            card.classList.add("show");

        }

    });

};

window.addEventListener("scroll",reveal);

reveal();

/*=========================================
  HERO COUNTERS
=========================================*/

const counters=document.querySelectorAll(".stat h2");

let started=false;

function runCounter(){

    if(started) return;

    const hero=document.querySelector(".hero");

    if(!hero) return;

    const heroBottom=hero.getBoundingClientRect().bottom;

    if(heroBottom>200){

        started=true;

        counters.forEach(counter=>{

            const original=counter.innerText;

            const target=parseInt(original.replace(/\D/g,""));

            const suffix=original.replace(/[0-9]/g,"");

            let value=0;

            const speed=Math.max(15,Math.floor(target/80));

            const update=()=>{

                value+=speed;

                if(value>=target){

                    counter.innerText=target+suffix;

                }else{

                    counter.innerText=value+suffix;

                    requestAnimationFrame(update);

                }

            };

            update();

        });

    }

}

window.addEventListener("scroll",runCounter);

runCounter();

/*=========================================
  IMAGE HOVER EFFECT
=========================================*/

document.querySelectorAll(".portfolio-card,.gallery-card").forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-10px)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0)";

    });

});

/*=========================================
  BUTTON RIPPLE
=========================================*/

document.querySelectorAll("button").forEach(button=>{

    button.addEventListener("click",function(e){

        const ripple=document.createElement("span");

        ripple.className="ripple";

        const rect=this.getBoundingClientRect();

        ripple.style.left=(e.clientX-rect.left)+"px";
        ripple.style.top=(e.clientY-rect.top)+"px";

        this.appendChild(ripple);

        setTimeout(()=>{

            ripple.remove();

        },600);

    });

});

console.log("Professional Studio Homepage Loaded Successfully");