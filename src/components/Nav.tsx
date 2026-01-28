"use client";

export function Nav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="nav">
      <button onClick={() => scrollTo("work")} className="nav-link">
        Work
      </button>
      <button onClick={() => scrollTo("about")} className="nav-link">
        About
      </button>
      <button onClick={() => scrollTo("contact")} className="nav-link">
        Contact
      </button>
    </nav>
  );
}
