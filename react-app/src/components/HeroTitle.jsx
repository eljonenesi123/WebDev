import { Fragment, useState } from "react";

// Hero title: wraps each letter in a span so hover/tap can animate it
// individually (see .hero-letter rules in style.css). Ported from
// script.js's splitHeroTitle(), which re-ran on every language switch since
// it rewrote innerHTML directly. In React this "just works" on re-render
// since `text` is the live translated string — no manual re-split needed.
//
// Touch tap: instead of the original's classList remove/reflow/add trick to
// restart the CSS "pop" animation, each letter tracks a small "pop counter"
// in state and uses it as part of the span's `key`, so tapping the same
// letter twice remounts the node and the animation reliably restarts.
export default function HeroTitle({ text }) {
  const [popCounts, setPopCounts] = useState({});

  const words = text.split(" ");

  const handleTouchStart = (id) => {
    setPopCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <h1 className="hero-title" aria-label={text}>
      {words.map((word, wi) => (
        // The space is a sibling text node AFTER the word span (not inside
        // it) so the browser still has a line-break opportunity between
        // words, matching the original DOM structure exactly. Fragment adds
        // no extra DOM node.
        <Fragment key={wi}>
          <span className="hero-word">
            {[...word].map((char, ci) => {
              const id = `${wi}-${ci}`;
              const pop = popCounts[id] || 0;
              return (
                <span
                  key={pop ? `${id}-${pop}` : id}
                  className={pop ? "hero-letter pop" : "hero-letter"}
                  onTouchStart={() => handleTouchStart(id)}
                >
                  {char}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </h1>
  );
}
