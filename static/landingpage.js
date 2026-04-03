// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, {passive:true});

// Hero BG image fade on scroll
const heroBg = document.getElementById('hero-bg');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (window.innerHeight * 0.68);
  heroBg.style.opacity = Math.max(0, 1 - pct);
}, {passive:true});

// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, {threshold: 0.1});
document.querySelectorAll('.stat-item,.step,.feat-item,.feat-visual,.p-card,.t-card').forEach(el => obs.observe(el));

// Smooth anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

// 3D tilt on hero cards
document.querySelectorAll('.hcard').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) / (r.width/2);
    const y = (e.clientY - r.top - r.height/2) / (r.height/2);
    card.style.transition = 'transform .08s ease';
    card.style.transform = `translateY(-6px) rotateX(${-y*7}deg) rotateY(${x*7}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .5s ease';
    card.style.transform = '';
  });
});
