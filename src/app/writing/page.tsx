import Link from "next/link";

export default function WritingPage() {
  return (
    <div className="page">
      <header className="page-header">
        <Link href="/" className="back-link">
          &larr; Back
        </Link>
        <h1 className="page-title">Writing</h1>
      </header>
      <p className="coming-soon">Coming soon</p>
    </div>
  );
}
