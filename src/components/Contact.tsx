import { FadeIn } from "./FadeIn";

const socialLinks = [
  { name: "LinkedIn", href: "#" },
  { name: "Twitter", href: "#" },
  { name: "Dribbble", href: "#" },
];

export function Contact() {
  return (
    <section id="contact" className="contact">
      <h2 className="section-title">Get in Touch</h2>
      <FadeIn>
        <a href="mailto:hello@example.com" className="contact-email">
          hello@example.com
        </a>
      </FadeIn>
      <div className="social-links">
        {socialLinks.map((link) => (
          <a key={link.name} href={link.href} className="social-link">
            {link.name}
          </a>
        ))}
      </div>
    </section>
  );
}
