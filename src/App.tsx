import { RunFrame } from "@tscircuit/runframe/runner"
import { type ChangeEvent, useMemo, useState } from "react"
import arduinoUnoKicadPcb from "./assets/arduino-uno.source.kicad_pcb?raw"

type PcbBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

const initialMainTsx = `
import { circuitJson } from "./uploaded-board.kicad_pcb"

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
  const [kicadPcb, setKicadPcb] = useState(arduinoUnoKicadPcb)
  const [boardName, setBoardName] = useState("Arduino Uno")

  const handlePcbUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setKicadPcb(await file.text())
    setBoardName(file.name)
    setMainTsx(initialMainTsx)
  }

  const resetToDefaultBoard = () => {
    setKicadPcb(arduinoUnoKicadPcb)
    setBoardName("Arduino Uno")
    setMainTsx(initialMainTsx)
  }

  const fsMap = useMemo(
    () => ({
      "main.tsx": mainTsx,
      "uploaded-board.kicad_pcb": kicadPcb,
    }),
    [kicadPcb, mainTsx],
  )

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="header-copy">
          <h1>{boardName}</h1>
          <p className="instructions">
            Click on the Bounds and drag a rectangle to reroute the region
          </p>
        </div>

        <div className="upload-controls">
          <label className="upload-button">
            Upload .kicad_pcb
            <input
              type="file"
              accept=".kicad_pcb"
              onChange={handlePcbUpload}
            />
          </label>
          <button
            className="reset-button"
            type="button"
            onClick={resetToDefaultBoard}
          >
            Reset
          </button>
        </div>
      </header>

      <section className="runframe-panel" aria-label={`${boardName} RunFrame demo`}>
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
