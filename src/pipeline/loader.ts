// loader.ts — Reads the folder structure into typed objects
//
// Walks the project directory, loads all YAML/JSON files,
// and returns a fully typed project tree.

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import type {
  Project,
  Act,
  Sequence,
  Scene,
  WordTimings,
  Editorial,
  MusicManifest,
  SfxManifest,
} from "./types";

// ════════════════════════════════════════════════════
// The loaded project tree (what the compiler consumes)
// ════════════════════════════════════════════════════

export interface LoadedProject {
  root: Project;
  musicManifest: MusicManifest;
  sfxManifest: SfxManifest;
  acts: LoadedAct[];
}

export interface LoadedAct {
  config: Act;
  folderName: string;
  sequences: LoadedSequence[];
}

export interface LoadedSequence {
  config: Sequence;
  folderName: string;
  scenes: LoadedScene[];
}

export interface LoadedScene {
  config: Scene;
  folderName: string;
  path: string; // full relative path: "acts/act-1/seq-1/scene-1"

  narrationText: string;
  narrationAudioPath: string;
  wordTimings: WordTimings;
  editorial: Editorial;
}

// ════════════════════════════════════════════════════
// Loader
// ════════════════════════════════════════════════════

export async function loadProject(projectDir: string): Promise<LoadedProject> {
  // Root config
  const root = loadYaml<Project>(path.join(projectDir, "project.yaml"));

  // Asset manifests
  const musicManifest = loadYaml<MusicManifest>(
    path.join(projectDir, "assets", "music", "manifest.yaml")
  );
  const sfxManifest = loadYaml<SfxManifest>(
    path.join(projectDir, "assets", "sfx", "manifest.yaml")
  );

  // Walk acts
  const acts: LoadedAct[] = root.acts.map((actFolder) => {
    const actDir = path.join(projectDir, "acts", actFolder);
    const actConfig = loadYaml<Act>(path.join(actDir, "act.yaml"));

    const sequences: LoadedSequence[] = actConfig.sequences.map((seqFolder) => {
      const seqDir = path.join(actDir, seqFolder);
      const seqConfig = loadYaml<Sequence>(path.join(seqDir, "sequence.yaml"));

      const scenes: LoadedScene[] = seqConfig.scenes.map((sceneFolder) => {
        const sceneDir = path.join(seqDir, sceneFolder);
        const scenePath = path.join("acts", actFolder, seqFolder, sceneFolder);

        return {
          config: loadYaml<Scene>(path.join(sceneDir, "scene.yaml")),
          folderName: sceneFolder,
          path: scenePath,

          narrationText: fs.readFileSync(
            path.join(sceneDir, "narration.txt"),
            "utf-8"
          ),
          narrationAudioPath: path.join(scenePath, "narration.wav"),
          wordTimings: loadJson<WordTimings>(
            path.join(sceneDir, "words.json")
          ),
          editorial: loadYaml<Editorial>(
            path.join(sceneDir, "editorial.yaml")
          ),
        };
      });

      return { config: seqConfig, folderName: seqFolder, scenes };
    });

    return { config: actConfig, folderName: actFolder, sequences };
  });

  return { root, musicManifest, sfxManifest, acts };
}

// ════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════

function loadYaml<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, "utf-8");
  return yaml.load(content) as T;
}

function loadJson<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}
