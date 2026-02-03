"use client";

const humanoidImages = [
  { src: "/Humanoids (1).png", alt: "Humanoids", link: "https://humanoid-index.com", type: "image" },
  { src: "/Humanoids (1).png", alt: "Humanoids", link: "https://humanoid-index.com", type: "image" },
  { src: "/Humanoids (1).png", alt: "Humanoids", link: "https://humanoid-index.com", type: "image" },
];

const contextImages = [
  { src: "/Context landing hero.png", alt: "Context Landing Hero", type: "image" },
  { src: "/Landing Hero.png", alt: "Context Landing Hero 2", type: "image" },
];

const shareImages = [
  { src: "/share-soren-NEWSITE-animation.mov", alt: "Share Animation", type: "video", playbackRate: 1.25, scale: 1.3 },
];

function ShowcaseCard({ item }: { item: { src: string; alt: string; link?: string; type: string; playbackRate?: number; scale?: number } }) {
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
      <img src={item.src} alt={item.alt} />
    </div>
  );

  return item.link ? (
    <a href={item.link} target="_blank" rel="noopener noreferrer">
      {cardContent}
    </a>
  ) : (
    cardContent
  );
}

export default function ShowcaseSection() {
  return (
    <>
      {/* Humanoid Index Section */}
      <div className="showcase-with-lines">
        <div className="showcase-lines-content">
          <div className="line"><span className="ln">01</span><span className="content">Humanoid Index</span></div>
          <div className="line"><span className="ln">02</span><span className="role">Product Design</span></div>
        </div>
        <div className="showcase-cards-horizontal">
          {humanoidImages.map((item, index) => (
            <div key={index} className="showcase-item">
              <ShowcaseCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Context Section */}
      <div className="showcase-with-lines">
        <div className="showcase-lines-content">
          <div className="line"><span className="ln">01</span><span className="content">Context</span></div>
          <div className="line"><span className="ln">02</span><span className="role">Founding Designer</span></div>
        </div>
        <div className="showcase-cards-horizontal">
          {contextImages.map((item, index) => (
            <div key={index} className="showcase-item">
              <ShowcaseCard item={item} />
            </div>
          ))}
        </div>
      </div>

      {/* Share Animation Section */}
      <div className="showcase-with-lines">
        <div className="showcase-lines-content">
          <div className="line"><span className="ln">01</span><span className="content">Share</span></div>
          <div className="line"><span className="ln">02</span><span className="role">Animation</span></div>
        </div>
        <div className="showcase-cards-horizontal">
          {shareImages.map((item, index) => (
            <div key={index} className="showcase-item">
              <ShowcaseCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
