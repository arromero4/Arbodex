/* Footer de comunidad: amplio al entrar y compacto con sesión iniciada. */
(() => {
  "use strict";
  const links = [
    { name: "Instagram", url: "https://www.instagram.com/arbodex/", svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.5-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/></svg>` },
    { name: "Facebook", url: "https://www.facebook.com/profile.php?id=61595922495084", svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.87V14.9H7.9V12h2.54V9.8c0-2.52 1.5-3.91 3.8-3.91 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.25 0-1.64.78-1.64 1.58V12h2.79l-.45 2.9h-2.34v6.97A10 10 0 0 0 22 12Z"/></svg>` },
    { name: "X", url: "https://x.com/ArboDex", svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.77L23.2 22h-6.3l-4.93-7.52L5.4 22H2.27l7.28-8.33L1.8 2h6.47l4.46 6.82L18.9 2Zm-1.1 18h1.74L7.31 3.88H5.45L17.8 20Z"/></svg>` },
    { name: "Campfire", url: "https://campfire.onelink.me/eBr8?af_dp=campfire://&af_force_deeplink=true&deep_link_sub1=cj1jbHVicyZjPWQzODhiM2IxLTgzMmUtNDU5Yy05Y2E3LWU1NGRkMjMwNmYwOSZpPXRydWU=", svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.2 2c1.4 4.6-1.7 6.4-1.5 9.1C8.9 10 8.3 8.6 8.3 7c-2.6 2.8-4 5.5-4 8.1A7.8 7.8 0 0 0 12 23a7.8 7.8 0 0 0 7.7-7.9c0-4.4-2.3-8.5-7.5-13.1ZM12 21a4 4 0 0 1-4-4c0-1.5.7-2.9 1.8-4.1.3 1.7 1.7 2.5 2.6 2.9.5-1.3.6-2.5.3-3.6 2.2 1.9 3.3 3.4 3.3 4.8a4 4 0 0 1-4 4Z"/></svg>` }
  ];
  const footer = document.createElement("footer");
  footer.id = "arbodex-login-footer";
  footer.setAttribute("aria-label", "Redes sociales de ArboDex");
  const heading = document.createElement("p");
  heading.className = "adf-heading";
  heading.textContent = "SÍGUENOS Y ÚNETE A LA COMUNIDAD";
  footer.appendChild(heading);
  const socials = document.createElement("nav");
  socials.className = "adf-social";
  socials.setAttribute("aria-label", "Redes sociales");
  links.forEach(({name, url, svg}) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.setAttribute("aria-label", `Abrir ArboDex en ${name}`);
    anchor.title = name;
    if (name === "Campfire") anchor.className = "adf-campfire";
    anchor.innerHTML = svg;
    socials.appendChild(anchor);
  });
  footer.appendChild(socials);
  // Secciones informativas sin URL confirmada: texto no clicable hasta tener páginas oficiales.
  const info = document.createElement("p");
  info.className = "adf-info";
  info.textContent = "Acerca de ArboDex  ·  Privacidad  ·  Contacto";
  footer.appendChild(info);
  const rule = document.createElement("div");
  rule.className = "adf-rule";
  rule.setAttribute("aria-hidden", "true");
  footer.appendChild(rule);
  const copyright = document.createElement("p");
  copyright.className = "adf-copyright";
  copyright.textContent = "© 2026 ArboDex · Hecho para nuestra comunidad de entrenadores 🍃";
  footer.appendChild(copyright);
  const root = document.getElementById("root");
  if (!root) return;
  // Fuera del árbol de React para conservarlo durante los cambios de vista.
  root.insertAdjacentElement("afterend", footer);
  const sync = () => {
    const login = Boolean(root.querySelector("main.signin"));
    const authenticated = !login && Boolean(root.querySelector(".accountbar"));
    footer.hidden = !login && !authenticated;
    footer.classList.toggle("adf-compact", authenticated);
    root.classList.toggle("adf-authenticated", authenticated);
  };
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; sync(); });
  });
  observer.observe(root, { childList: true, subtree: true });
  sync();
})();
