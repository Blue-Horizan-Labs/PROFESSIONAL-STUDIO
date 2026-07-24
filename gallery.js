// ==========================================
// GET SERVICE FROM URL
// Example:
// gallery.html?service=wedding
// ==========================================

const params = new URLSearchParams(window.location.search);

const service = params.get("service") || "wedding";

// ==========================================
// GALLERY DATA
// ==========================================

const galleryData = {

    wedding: {

        title: "Wedding Gallery",

        subtitle:
        "Timeless wedding memories captured with emotion and elegance.",

        camera: "Sony A7 IV",

        lens: "24-70mm f/2.8",

        location: "Nagpur",

        editing: "Natural & Cinematic",

        folder: "images/wedding"

    },

    prewedding: {

        title: "Pre-Wedding Gallery",

        subtitle:
        "Creative storytelling before the big day.",

        camera: "Canon R6",

        lens: "50mm f/1.8",

        location: "Lonavala",

        editing: "Warm & Cinematic",

        folder: "images/prewedding"

    },

    portrait: {

        title: "Portrait Gallery",

        subtitle:
        "Natural portraits with clean compositions.",

        camera: "Sony A7 III",

        lens: "85mm f/1.8",

        location: "Studio",

        editing: "Soft Skin Tone",

        folder: "images/portrait"

    },

    events: {

        title: "Event Gallery",

        subtitle:
        "Corporate and private events captured professionally.",

        camera: "Canon R5",

        lens: "70-200mm",

        location: "Mumbai",

        editing: "True Color",

        folder: "images/events"

    },

    commercial: {

        title: "Commercial Gallery",

        subtitle:
        "Professional branding and product photography.",

        camera: "Sony A7R V",

        lens: "90mm Macro",

        location: "Studio",

        editing: "Premium Commercial",

        folder: "images/commercial"

    }

};

const data = galleryData[service];

// ==========================================
// UPDATE PAGE CONTENT
// ==========================================

document.getElementById("galleryTitle").textContent =
data.title;

document.getElementById("gallerySubtitle").textContent =
data.subtitle;

document.getElementById("cameraName").textContent =
data.camera;

document.getElementById("lensName").textContent =
data.lens;

document.getElementById("locationName").textContent =
data.location;

document.getElementById("editingStyle").textContent =
data.editing;

// ==========================================
// LOAD IMAGES
// ==========================================

const galleryGrid =
document.getElementById("galleryGrid");

const imageArray = [];

for(let i = 1; i <= 20; i++){

    const imagePath =
    `${data.folder}/${i}.jpg`;

    imageArray.push(imagePath);

    const img =
    document.createElement("img");

    img.src = imagePath;

    img.alt = `${service} ${i}`;

    img.dataset.index = i - 1;

    galleryGrid.appendChild(img);

}

// ==========================================
// LIGHTBOX
// ==========================================

const lightbox =
document.getElementById("lightbox");

const lightboxImage =
document.getElementById("lightboxImage");

const closeBtn =
document.querySelector(".close-btn");

const prevBtn =
document.querySelector(".prev");

const nextBtn =
document.querySelector(".next");

const currentImage =
document.getElementById("currentImage");

const totalImages =
document.getElementById("totalImages");

totalImages.textContent =
imageArray.length;

let currentIndex = 0;

// ==========================================
// OPEN IMAGE
// ==========================================

function openImage(index){

    currentIndex = index;

    lightboxImage.src =
    imageArray[currentIndex];

    currentImage.textContent =
    currentIndex + 1;

    lightbox.classList.add("active");

}

// ==========================================
// CLICK IMAGE
// ==========================================

document.querySelectorAll(".gallery-grid img")
.forEach(img=>{

    img.addEventListener("click",()=>{

        openImage(Number(img.dataset.index));

    });

});

// ==========================================
// CLOSE
// ==========================================

closeBtn.onclick=()=>{

    lightbox.classList.remove("active");

};

// ==========================================
// NEXT
// ==========================================

function nextImage(){

    currentIndex++;

    if(currentIndex>=imageArray.length){

        currentIndex=0;

    }

    openImage(currentIndex);

}

// ==========================================
// PREVIOUS
// ==========================================

function previousImage(){

    currentIndex--;

    if(currentIndex<0){

        currentIndex=imageArray.length-1;

    }

    openImage(currentIndex);

}

nextBtn.onclick=nextImage;

prevBtn.onclick=previousImage;

// ==========================================
// KEYBOARD SUPPORT
// ==========================================

document.addEventListener("keydown",(e)=>{

    if(!lightbox.classList.contains("active"))
    return;

    if(e.key==="ArrowRight"){

        nextImage();

    }

    if(e.key==="ArrowLeft"){

        previousImage();

    }

    if(e.key==="Escape"){

        lightbox.classList.remove("active");

    }

});

// ==========================================
// CLOSE WHEN CLICKING OUTSIDE IMAGE
// ==========================================

lightbox.addEventListener("click",(e)=>{

    if(e.target===lightbox){

        lightbox.classList.remove("active");

    }

});