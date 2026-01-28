import { FadeIn } from "./FadeIn";

const experience = [
  {
    role: "Senior Designer",
    company: "Company Name",
    date: "2022 — Present",
  },
  {
    role: "Designer",
    company: "Previous Company",
    date: "2019 — 2022",
  },
  {
    role: "Junior Designer",
    company: "First Company",
    date: "2017 — 2019",
  },
];

export function About() {
  return (
    <section id="about" className="about">
      <h2 className="section-title">About</h2>
      <FadeIn className="about-content">
        <p className="about-text">
          A few sentences about yourself, your background, and what drives your
          work. Keep it personal but professional.
        </p>
        <div className="experience">
          <h3>Experience</h3>
          <ul className="experience-list">
            {experience.map((exp, i) => (
              <li key={i}>
                <span className="exp-role">{exp.role}</span>
                <span className="exp-company">{exp.company}</span>
                <span className="exp-date">{exp.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </FadeIn>
    </section>
  );
}
