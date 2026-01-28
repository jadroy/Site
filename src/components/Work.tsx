import { FadeIn } from "./FadeIn";

const projects = [
  {
    title: "Project Title",
    category: "Branding / Web Design",
    description:
      "A brief description of the project, the challenge, and the outcome. Keep it concise and impactful.",
  },
  {
    title: "Another Project",
    category: "UI/UX Design",
    description:
      "Short case study text explaining the work done and results achieved.",
  },
  {
    title: "Third Project",
    category: "Product Design",
    description: "Another brief overview of work, approach, and impact.",
  },
];

export function Work() {
  return (
    <section id="work" className="work">
      <h2 className="section-title">Selected Work</h2>

      {projects.map((project, i) => (
        <FadeIn key={i} className="project">
          <div className="project-image">
            <div className="placeholder-image">Project {String(i + 1).padStart(2, "0")}</div>
          </div>
          <div className="project-info">
            <h3>{project.title}</h3>
            <p className="project-category">{project.category}</p>
            <p className="project-description">{project.description}</p>
          </div>
        </FadeIn>
      ))}
    </section>
  );
}
