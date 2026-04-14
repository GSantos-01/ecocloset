if (!window.matchMedia("(min-width: 769px)").matches) return;


//  1. NAVBAR DINÂMICA

const nav = document.querySelector("nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.style.background = "rgba(244,240,232,0.95)";
    nav.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
  } else {
    nav.style.background = "rgba(244,240,232,0.85)";
    nav.style.boxShadow = "none";
  }
});

//  2. SCROLL SUAVE
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const target = document.querySelector(link.getAttribute("href"));

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

//  3. HOVER 3D NOS CARDS

document.querySelectorAll(".clothes-card").forEach(card => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.transform = `
      rotateX(${-(y - rect.height/2) / 20}deg)
      rotateY(${(x - rect.width/2) / 20}deg)
      scale(1.03)
    `;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0) rotateY(0) scale(1)";
  });
});

//  4. FEEDBACK NOS BOTÕES

document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.style.transform = "scale(0.95)";
    setTimeout(() => {
      btn.style.transform = "";
    }, 150);
  });
});

// 5. ANIMAÇÃO AO APARECER
const revealElements = document.querySelectorAll("[data-reveal]");

const revealOnScroll = () => {
  revealElements.forEach(el => {
    const top = el.getBoundingClientRect().top;

    if (top < window.innerHeight - 100) {
      el.classList.add("revealed");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

 document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) - 0.5;
  const y = (e.clientY / window.innerHeight) - 0.5;

  document.querySelectorAll(".floating-badge").forEach(el => {
    el.style.transform = `
      translate(${x * 30}px, ${y * 30}px)
    `;
  });
});
document.addEventListener("mousemove", (e) => {
  requestAnimationFrame(() => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;

    document.querySelectorAll(".floating-badge").forEach(el => {
      el.style.transform = `
        translate(${x * 20}px, ${y * 20}px)
      `;
    });
  });
});
