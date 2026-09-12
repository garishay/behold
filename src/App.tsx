import { strings } from './strings/en.ts'

// The placeholder screen (Gate 01 A6): the title, the epigraph with its notice, the two lines,
// every word rendered by key. Nothing interactive; the case player arrives under its own gate (#6).
export default function App() {
  return (
    <main className="screen">
      <header className="masthead">
        <h1>{strings.title}</h1>
        <p className="kicker">{strings.kicker}</p>
      </header>
      <blockquote className="epigraph">
        <p>{strings.epigraph}</p>
        <footer>{strings.epigraphReference}</footer>
      </blockquote>
      <p className="line">{strings.line}</p>
      <p className="status">{strings.status}</p>
      <p className="notice">{strings.notice}</p>
    </main>
  )
}
