/** The three rising notes when a case closes, from the prototype; silent where audio is refused. */
export function sting() {
  try {
    const ac = new AudioContext()
    const now = ac.currentTime
    for (const [hz, at] of [
      [392, 0],
      [523.25, 0.18],
      [659.25, 0.36],
    ]) {
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.type = 'sine'
      o.frequency.value = hz
      g.gain.setValueAtTime(0.0001, now + at)
      g.gain.exponentialRampToValueAtTime(0.22, now + at + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, now + at + 1.1)
      o.connect(g)
      g.connect(ac.destination)
      o.start(now + at)
      o.stop(now + at + 1.2)
    }
  } catch {
    // No audio here; the reveal is enough.
  }
}
