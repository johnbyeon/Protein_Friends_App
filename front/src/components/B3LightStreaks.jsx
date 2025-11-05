// src/components/B3LightStreaks.jsx
import "../styles/b3LightStreaks.css";

export default function B3LightStreaks() {
  return (
    <section className="b3-pillars">
      <div className="b3-pillars__beam-layer">
        <span className="pillar pillar--warm" />
        <span className="pillar pillar--magenta" />
        <span className="pillar pillar--violet" />
        <span className="pillar pillar--blue" />
        <span className="pillar pillar--cyan" />
      </div>
    </section>
  );
}
