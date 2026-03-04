"use client";

const caseStudies = [
  {
    title: "Humanoids",
    subtitle: "Product Design",
    link: "/case-studies/humanoids",
    image: "/Humanoids (1).png",
  },
  {
    title: "Case Study 2",
    subtitle: "Coming soon",
    link: "/case-studies/example-2",
  },
];

export default function CaseStudiesSection() {
  return (
    <section className="case-studies">
      <h2 className="section-title">Case Studies</h2>
      <div className="case-studies-grid">
        {caseStudies.map((study, index) => (
          <a key={index} href={study.link} className="case-study-card">
            <div className="case-study-image">
              {study.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={study.image} alt={study.title} />
              )}
            </div>
            <div className="case-study-meta">
              <span className="case-study-title">{study.title}</span>
              <span className="case-study-subtitle">{study.subtitle}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
