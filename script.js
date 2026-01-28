// Scroll-triggered animations using Intersection Observer
document.addEventListener('DOMContentLoaded', () => {

  // Elements to animate on scroll
  const animateElements = document.querySelectorAll('.project, .about-content, .contact-email');

  // Reset initial animation state (override CSS animation)
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.animation = 'none';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  });

  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(el => observer.observe(el));

  // Smooth scroll for nav links (fallback for browsers without CSS smooth scroll)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Parallax effect on hero (subtle)
  const hero = document.querySelector('.hero-content');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
          hero.style.transform = `translateY(${scrolled * 0.3}px)`;
          hero.style.opacity = 1 - (scrolled / window.innerHeight);
        }
        ticking = false;
      });
      ticking = true;
    }
  });

});
