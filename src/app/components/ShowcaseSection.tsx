"use client";

const humanoidImages = [
  { src: "/Humanoids (1).png", alt: "Humanoids", link: "https://humanoid-index.com", type: "image" },
  { src: "/Humanoids (1).png", alt: "Humanoids", link: "https://humanoid-index.com", type: "image" },
  { src: "/Humanoids (1).png", alt: "Humanoids", link: "https://humanoid-index.com", type: "image" },
];

const contextImages = [
  { src: "/Context landing hero.png", alt: "Context Landing Hero", type: "image" },
  { src: "/Landing Hero.png", alt: "Context Landing Hero 2", type: "image" },
  { src: "/Context/Context landing hero fade in.mp4", alt: "Context Landing Hero Fade In", type: "video" },
  { src: "/Context/Context landing page walk through.mp4", alt: "Context Landing Page Walk Through", type: "video" },
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
          <div className="showcase-line"><span className="content">Humanoid Index</span></div>
          <div className="showcase-line"><span className="tree-branch">⎿</span> <a href="https://humanoid-index.com" target="_blank" rel="noopener noreferrer" className="showcase-link">humanoid-index.com</a></div>
          <div className="showcase-line"><span className="tree-branch">⎿</span> I curated a list of humanoid robots</div>
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
          <div className="showcase-line"><span className="content">Context</span></div>
          <div className="showcase-line"><span className="tree-branch">⎿</span> Founding Designer</div>
          <div className="showcase-line"><span className="tree-branch">⎿</span> <a href="https://context.ai" target="_blank" rel="noopener noreferrer" className="showcase-link">context.ai</a></div>
          <div className="showcase-line"><span className="tree-branch">⎿</span> 70 teams onboarded</div>
          <div className="showcase-line"><span className="tree-branch">⎿</span> 50k+ hours saved per team/month</div>
          <div className="showcase-line"><span className="tree-branch">⎿</span> 38% conversion (2x US)</div>
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
          <div className="showcase-line"><span className="content">Share</span></div>
          <div className="showcase-line"><span className="tree-branch">⎿</span> What if your phone knew when to share your work?</div>
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
