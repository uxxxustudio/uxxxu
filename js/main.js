/* =========================================================
   Component Loader
========================================================= */

async function loadComponent(id, file) {

    const res = await fetch(file);

    if (!res.ok) {
        console.error(file + " load failed");
        return;
    }

    document.getElementById(id).innerHTML = await res.text();

}


/* =========================================================
   Initialize
========================================================= */

window.addEventListener("DOMContentLoaded", async () => {

    await loadComponent("header", "components/header.html");

    await loadComponent("hero", "components/hero.html");

    await loadComponent("service", "components/service.html");

    await loadComponent("portfolio", "components/portfolio.html");

    await loadComponent("about", "components/about.html");

    await loadComponent("contact", "components/contact.html");

    await loadComponent("footer", "components/footer.html");

});


/* =========================================================
   Header Scroll
========================================================= */

window.addEventListener("scroll", () => {

    const header = document.querySelector("#header > header");
    const nav = document.querySelector("header nav");

    if (!header) return;

    if (window.scrollY > 30) {
        header.classList.add("active");
    } else {
        header.classList.remove("active");
    }

    if (nav) {
        nav.classList.remove("open");
    }

});

/* =========================================================
   Mobile Menu
========================================================= */

window.addEventListener("click", (e) => {

    const button = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");
   
    if (!button || !nav) return;

    if (e.target.closest(".menu-toggle")) {
        nav.classList.toggle("open");
    }

});
