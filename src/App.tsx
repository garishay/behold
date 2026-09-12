// The placeholder screen (Gate 01 A6): the title, the epigraph with its notice, the two lines.
// Nothing interactive; the case player arrives under its own gate (#6).
export default function App() {
  return (
    <main className="screen">
      <header className="masthead">
        <h1>Behold</h1>
        <p className="kicker">Bible Mystery Game</p>
      </header>
      <blockquote className="epigraph">
        <p>
          It is the glory of God to conceal things, but the glory of kings is to search things out.
        </p>
        <footer>Proverbs 25:2, ESV</footer>
      </blockquote>
      <p className="line">You know the stories. You don't know the details.</p>
      <p className="status">Season one is being written.</p>
      <p className="notice">
        Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), ©
        2001 by Crossway, a publishing ministry of Good News Publishers. ESV Text Edition: 2025. The
        ESV text may not be quoted in any publication made available to the public by a Creative
        Commons license. The ESV may not be translated in whole or in part into any other language.
        Used by permission. All rights reserved.
      </p>
    </main>
  )
}
