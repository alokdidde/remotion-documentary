// scripts/compile.ts — Loads the project tree and compiles to timeline.json
//
// Usage: tsx scripts/compile.ts <project-dir>
// Defaults to current directory if no argument provided.

import fs from "fs";
import path from "path";
import { loadProject, compile } from "../src/pipeline";

async function main() {
  const projectDir = path.resolve(process.argv[2] || ".");

  console.log(`Compiling project from: ${projectDir}`);

  // Load the full project tree
  const project = await loadProject(projectDir);
  console.log(
    `Loaded: ${project.acts.length} acts, ` +
    `${project.acts.reduce((s, a) => s + a.sequences.length, 0)} sequences, ` +
    `${project.acts.reduce((s, a) => s + a.sequences.reduce((ss, sq) => ss + sq.scenes.length, 0), 0)} scenes`
  );

  // Compile to timeline
  const timeline = compile(project);
  console.log(
    `Compiled: ${timeline.segments.length} segments, ` +
    `${timeline.total_frames} total frames ` +
    `(${(timeline.total_frames / timeline.fps).toFixed(1)}s at ${timeline.fps}fps)`
  );

  // Ensure output directories exist
  const compiledDir = path.join(projectDir, "compiled");
  const publicCompiledDir = path.join(projectDir, "public", "compiled");
  for (const dir of [compiledDir, publicCompiledDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Write timeline.json (to both compiled/ and public/compiled/ for staticFile access)
  const timelineJson = JSON.stringify(timeline, null, 2);
  const renderPropsJson = JSON.stringify({ timeline }, null, 2);

  for (const dir of [compiledDir, publicCompiledDir]) {
    fs.writeFileSync(path.join(dir, "timeline.json"), timelineJson);
    fs.writeFileSync(path.join(dir, "render-props.json"), renderPropsJson);
  }
  console.log(`Written: ${compiledDir}/timeline.json`);
  console.log(`Written: ${publicCompiledDir}/timeline.json (for Remotion staticFile)`);

  console.log("Done.");
}

main().catch((err) => {
  console.error("Compilation failed:", err);
  process.exit(1);
});
