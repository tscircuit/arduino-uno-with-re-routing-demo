import { RunFrame } from "@tscircuit/runframe/runner"
import { useMemo, useState } from "react"
import arduinoUnoKicadPcb from "./assets/arduino-uno.source.kicad_pcb?raw"

type PcbBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

const initialMainTsx = `
import { circuitJson } from "./arduino-uno.source.kicad_pcb"

circuit.add(
  <board>
    <subcircuit circuitJson={circuitJson} />
  </board>
)`.trim()

const formatCoord = (value: number) => Number(value.toFixed(3))

const createAutoroutingPhaseJsx = (region: PcbBounds) => `
    <autoroutingphase
      reroute
      region={{
        shape: "rect",
        minX: ${formatCoord(region.minX)},
        maxX: ${formatCoord(region.maxX)},
        minY: ${formatCoord(region.minY)},
        maxY: ${formatCoord(region.maxY)},
      }}
    />`

const appendAutoroutingPhase = (code: string, region: PcbBounds) => {
  const autoroutingPhase = createAutoroutingPhaseJsx(region)

  if (code.includes("</board>")) {
    return code.replace(/\n\s*<\/board>/, `\n${autoroutingPhase}\n  </board>`)
  }

  return `${code}\n${autoroutingPhase}`
}

export default function App() {
  const [mainTsx, setMainTsx] = useState(initialMainTsx)

  const fsMap = useMemo(
    () => ({
      "main.tsx": mainTsx,
      "arduino-uno.source.kicad_pcb": arduinoUnoKicadPcb,
    }),
    [mainTsx],
  )

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1 style={{
          fontWeight: "bold",
          fontSize: "2rem",
        }}>Arduino Uno</h1>
        <p style={{
          fontSize: "1rem",
        }}>
          Click on the Bounds and drag a rectangle to reroute the region
        </p>
      </header>

      <section className="runframe-panel" aria-label="Arduino Uno RunFrame demo">
        <RunFrame
          fsMap={fsMap}
          entrypoint="main.tsx"
          availableTabs={["pcb"]}
          defaultActiveTab="pcb"
          defaultTab="pcb"
          showFileMenu={false}
          onPcbBoundsSelected={(bounds) => {
            setMainTsx((code) => appendAutoroutingPhase(code, bounds))
          }}
        />
      </section>
    </main>
  )
}
