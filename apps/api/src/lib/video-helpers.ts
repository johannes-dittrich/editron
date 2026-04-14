import path from "node:path";
import { runProcess } from "./process.js";

const videoUseMainDir =
  process.env.VIDEO_USE_MAIN_DIR
    ? path.resolve(process.env.VIDEO_USE_MAIN_DIR)
    : path.resolve(process.cwd(), "../../video-use-main");

const pythonBin = process.env.PYTHON_BIN ?? "python3";

export async function transcribeMedia(inputPath: string, editDir: string) {
  return runProcess(
    pythonBin,
    [path.join(videoUseMainDir, "helpers", "transcribe.py"), inputPath, "--edit-dir", editDir],
    videoUseMainDir
  );
}

export async function gradeMedia(inputPath: string, outputPath: string, preset?: string) {
  const args = [path.join(videoUseMainDir, "helpers", "grade.py"), inputPath, "-o", outputPath];
  if (preset) {
    args.push("--preset", preset);
  }

  return runProcess(pythonBin, args, videoUseMainDir);
}

export async function renderFromEdl(edlPath: string, outputPath: string) {
  return runProcess(
    pythonBin,
    [path.join(videoUseMainDir, "helpers", "render.py"), edlPath, "-o", outputPath],
    videoUseMainDir
  );
}
