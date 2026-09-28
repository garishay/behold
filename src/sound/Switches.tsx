import { useSyncExternalStore } from 'react'
import { strings } from '../strings/en.ts'
import { isOn, subscribe, turn, type Switch } from './settings.ts'

function Toggle({ which }: { which: Switch }) {
  const on = useSyncExternalStore(subscribe, () => isOn(which))
  // The state is the button's pressed state, so a screen reader hears "Music, on, toggle button";
  // the word beside the name is for the eye.
  return (
    <button type="button" className="switch" aria-pressed={on} onClick={() => turn(which, !on)}>
      {strings[which]}
      <span aria-hidden="true">{` · ${on ? strings.on : strings.off}`}</span>
    </button>
  )
}

/** The two sound switches (Gate 10 A4), the same on the title screen and in the case's menu. */
export function Switches() {
  return (
    <div className="switches">
      <Toggle which="music" />
      <Toggle which="effects" />
    </div>
  )
}
