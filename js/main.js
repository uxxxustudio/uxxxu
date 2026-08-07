async function loadComponent(id, file) {
    const res = await fetch(file);

    if (!res.ok) {
        console.error(file + " load failed");
        return;
    }

    document.getElementById(id).innerHTML = await res.text();
}

window.addEventListener("DOMContentLoaded", async () => {

    await loadComponent("header", "components/header.html");

    await loadComponent("hero", "components/hero.html");

    await loadComponent("service", "components/service.html");

    await loadComponent("portfolio", "components/portfolio.html");

    await loadComponent("about", "components/about.html");

    await loadComponent("contact", "components/contact.html");

    await loadComponent("footer", "components/footer.html");

});
