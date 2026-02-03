"use client";

// Configure card order here - rearrange to change display order
const showcaseItems = [
  { src: "/Humanoids (1).png", alt: "Humanoids", caption: "Humanoids", link: "https://humanoid-index.com", type: "image" },
  { src: "/Context landing hero.png", alt: "Context Landing Hero", caption: "Context", type: "image" },
  { src: "/share-soren-NEWSITE-animation.mov", alt: "Share Animation", caption: "Share Animation", type: "video", playbackRate: 1.25, scale: 1.3 },
];

export default function ShowcaseSection() {
  const cards = showcaseItems;
  // Generate line numbers based on card count (cards have height, so ~20 lines each)
  const linesPerCard = 18;
  const totalLines = cards.length * linesPerCard;
  const startLine = 18; // Continue from main content line numbers

  return (
    <div className="showcase-with-lines">
      <div className="showcase-line-numbers">
        {Array.from({ length: totalLines }, (_, i) => (
          <span key={i} className="ln">{String(startLine + i).padStart(2, '0')}</span>
        ))}
      </div>
      <div className="showcase-cards-horizontal">
        {cards.map((item, index) => {
        const cardContent = item.type === "video" ? (
          <div className="showcase-card">
            <video
              src={item.src}
              autoPlay
              loop
              muted
              playsInline
              style={item.scale ? { transform: `scale(${item.scale})` } : undefined}
              ref={(el) => {
                if (el && item.playbackRate) {
                  el.playbackRate = item.playbackRate;
                }
              }}
            />
          </div>
        ) : (
          <div className="showcase-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt}
            />
          </div>
        );
        return (
          <div key={index} className="showcase-item">
            {item.link ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                {cardContent}
              </a>
            ) : (
              cardContent
            )}
            {item.link ? (
              <a href={item.link} className="showcase-caption showcase-caption-link" target="_blank" rel="noopener noreferrer">
                {item.caption} ↗
              </a>
            ) : (
              <p className="showcase-caption">{item.caption}</p>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
