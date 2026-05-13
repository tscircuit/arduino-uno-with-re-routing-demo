import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const runframeRoot = "/Users/rishabhgupta/Public/tscircuit/runframe"
const projectRoot =
  "/Users/rishabhgupta/Public/tscircuit/arduino-uno-with-re-routing-demo"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@tscircuit/runframe/runner": `${runframeRoot}/lib/runner.ts`,
      lib: `${runframeRoot}/lib`,
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    fs: {
      allow: [projectRoot, runframeRoot],
    },
  },
})
