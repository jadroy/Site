import Link from "next/link";

const articles = [
  {
    title: "Design Systems at Scale",
    publication: "Medium",
    year: "2024",
    link: "#",
  },
  {
    title: "The Future of Product Design",
    publication: "Personal",
    year: "2023",
    link: "#",
  },
  {
    title: "Building for Startups",
    publication: "Substack",
    year: "2023",
    link: "#",
  },
];

export default function WritingPage() {
  return (
    <div className="page">
      <header className="page-header">
        <Link href="/" className="back-link">
          &larr; Back
        </Link>
        <h1 className="page-title">Writing</h1>
      </header>

      <div className="writing-list">
        {articles.map((article, index) => (
          <div key={index} className="writing-item">
            <div className="writing-left">
              <a
                href={article.link}
                className="writing-title"
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.title}
              </a>
              <span className="writing-publication">{article.publication}</span>
            </div>
            <span className="writing-year">{article.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
