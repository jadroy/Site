"use client";

const humanoidImages = [
  { src: "/Humanoid Index/CleanShot 2026-02-06 at 14.41.55.mp4", alt: "Humanoid Index – Demo walkthrough", type: "video" },
  { src: "/Humanoid Index/CleanShot 2026-02-06 at 14.40.46@2x.png", alt: "Humanoid Index – Carousel view showing Neo by 1X Technologies", type: "image" },
  { src: "/Humanoid Index/CleanShot 2026-02-06 at 14.41.36@2x.png", alt: "Humanoid Index – Robot detail page", type: "image" },
  { src: "/Humanoid Index/CleanShot 2026-02-06 at 14.40.53@2x.png", alt: "Humanoid Index – Grid view of all humanoid robots", type: "image" },
];

const contextImages = [
  { src: "/Context/Context landing hero.mp4", alt: "Context Landing Hero Fade In", type: "video" },
  { src: "/Context/Context landing page walk through.mp4", alt: "Context Landing Page Walk Through", type: "video" },
];

const shareImages = [
  { src: "/Share/share-soren-NEWSITE-animation.mov", alt: "Share Animation", type: "video", playbackRate: 1.25, scale: 1.3 },
  { src: "/Share/Share Work NEW.png", alt: "Share Work – New", type: "image" },
  { src: "/Share/Share Work (2).png", alt: "Share Work 2", type: "image" },
  { src: "/Share/Share Work (9).png", alt: "Share Work 9", type: "image" },
  { src: "/Share/Share Work (11).png", alt: "Share Work 11", type: "image" },
  { src: "/Share/Share Work - Cover (1).png", alt: "Share Work Cover 1", type: "image" },
  { src: "/Share/Share Work - Cover (2).png", alt: "Share Work Cover 2", type: "image" },
  { src: "/Share/Share Work - Cover (8).png", alt: "Share Work Cover 8", type: "image" },
  { src: "/Share/Share Work - Cover (6).png", alt: "Share Work Cover 6", type: "image" },
];

const photosImages: { src: string; alt: string; type: string }[] = [
];

const doorknobImages = [
  { src: "/New doorknob/ABB6539D-6BC7-402E-A838-A11E432C84B8_1_105_c.jpeg", alt: "New Doorknob", type: "image" },
  { src: "/New doorknob/1EC092C6-8BF8-40BF-B9B3-A8D76017C2B4_1_105_c.jpeg", alt: "New Doorknob", type: "image" },
];

const esp32Images: { src: string; alt: string; type: string }[] = [
];

function ShowcaseCard({ item }: { item: { src: string; alt: string; type: string; playbackRate?: number; scale?: number } }) {
  return item.type === "video" ? (
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
}

type SectionData = {
  title: string;
  lines: React.ReactNode[];
  items: { src: string; alt: string; type: string; playbackRate?: number; scale?: number }[];
};

const sections: SectionData[] = [
  {
    title: "Humanoid Index",
    lines: [
      <><a href="https://humanoid-index.com" target="_blank" rel="noopener noreferrer" className="showcase-link">humanoid-index.com</a></>,
      <>I curated a list of humanoid robots</>,
    ],
    items: humanoidImages,
  },
  {
    title: "Context",
    lines: [
      <>Founding Designer</>,
      <><a href="https://context.ai" target="_blank" rel="noopener noreferrer" className="showcase-link">context.ai</a></>,
    ],
    items: contextImages,
  },
  {
    title: "Share",
    lines: [
      <>What if your phone knew when to share your work?</>,
    ],
    items: shareImages,
  },
  {
    title: "Photos",
    lines: [],
    items: photosImages,
  },
  {
    title: "New Doorknob",
    lines: [],
    items: doorknobImages,
  },
  {
    title: "ESP32 + E-Ink Weather Display",
    lines: [],
    items: esp32Images,
  },
];

export default function ShowcaseSection({ viewMode = "horizontal" }: { viewMode?: "horizontal" | "grid" }) {
  if (viewMode === "grid") {
    let globalIndex = 0;
    return (
      <div className="showcase-grid-view">
        {sections.map((section, si) => (
          <div key={si} className="showcase-grid-section">
            <div className="showcase-lines-content">
              <div className="showcase-line"><span className="content">{section.title}</span></div>
              {section.lines.map((line, li) => (
                <div key={li} className="showcase-line"><span className="tree-branch">⎿</span> {line}</div>
              ))}
            </div>
            {section.items.length > 0 && (
              <div className="showcase-grid-cards">
                {section.items.map((item, index) => {
                  const delay = globalIndex * 0.06;
                  globalIndex++;
                  return (
                    <div key={index} className="showcase-item" style={{ animationDelay: `${delay}s` }}>
                      <ShowcaseCard item={item} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {sections.map((section, si) => (
        <div key={si} className="showcase-with-lines">
          <div className="showcase-lines-content">
            <div className="showcase-line"><span className="content">{section.title}</span></div>
            {section.lines.map((line, li) => (
              <div key={li} className="showcase-line"><span className="tree-branch">⎿</span> {line}</div>
            ))}
          </div>
          <div className="showcase-cards-horizontal">
            {section.items.map((item, index) => (
              <div key={index} className="showcase-item">
                <ShowcaseCard item={item} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
