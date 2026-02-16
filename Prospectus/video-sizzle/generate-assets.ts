#!/usr/bin/env npx tsx
/**
 * DXF 30-Second Sizzle Reel — Asset Generator
 *
 * Generates:
 *   1. Concept images for storyboard frames (via ComfyUI Z-Image)
 *   2. Proof-of-concept voiceover audio (via F5-TTS with MaleArcher voice)
 *
 * Usage:
 *   npx tsx Prospectus/video-sizzle/generate-assets.ts --step images   # Generate images only
 *   npx tsx Prospectus/video-sizzle/generate-assets.ts --step audio    # Generate audio only
 *   npx tsx Prospectus/video-sizzle/generate-assets.ts --step all      # Generate everything
 *   npx tsx Prospectus/video-sizzle/generate-assets.ts --dry-run       # Show plan only
 *
 * Prerequisites:
 *   - ComfyUI running at http://127.0.0.1:8188 (for images)
 *   - F5-TTS installed with Python environment (for audio)
 *   - MaleArcher.mp3 reference voice in CourseFuture/voices/
 *
 * Run from: G:\z-CUSTOM_DEV\CourseFuture (project root)
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// Configuration
// ============================================================

const COURSEFUTURE_ROOT = 'G:\\z-CUSTOM_DEV\\CourseFuture';
const SIZZLE_ROOT = 'G:\\z-CUSTOM_DEV\\designxfactorwebsite\\Prospectus\\video-sizzle';
const COMFYUI_URL = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';

// Voice configuration
const MALE_ARCHER_VOICE = path.join(COURSEFUTURE_ROOT, 'voices', 'MaleArcher.mp3');

// Voiceover lines
const VO_LINES = [
  {
    id: 'line1',
    text: 'What if training...',
    timecode: '0:06',
    filename: 'vo-line1-what-if.wav',
    direction: 'Thoughtful, slightly questioning. Measured pace. Not rhetorical — genuinely curious.'
  },
  {
    id: 'line2',
    text: '...was something people actually remembered?',
    timecode: '0:08',
    filename: 'vo-line2-remembered.wav',
    direction: 'Landing the thought. Slight emphasis on "actually." Rising inflection on "remembered?"'
  },
  {
    id: 'line3',
    text: 'You have the expertise.',
    timecode: '0:20',
    filename: 'vo-line3-expertise.wav',
    direction: 'Warm, acknowledging. Direct. Confident but respectful.'
  },
  {
    id: 'line4',
    text: 'We create the experience.',
    timecode: '0:22',
    filename: 'vo-line4-experience.wav',
    direction: 'Definitive. Slight emphasis on "experience." Sure, not arrogant.'
  }
];

// ============================================================
// Console Colors
// ============================================================

const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
};

function log(msg: string, color: string = c.reset) {
  console.log(`${color}${msg}${c.reset}`);
}

function banner(text: string) {
  const line = '='.repeat(70);
  log(`\n${line}`, c.cyan + c.bright);
  log(`  ${text}`, c.cyan + c.bright);
  log(line, c.cyan + c.bright);
}

function success(msg: string) { log(`  ✓ ${msg}`, c.green); }
function warn(msg: string) { log(`  ⚠ ${msg}`, c.yellow); }
function error(msg: string) { log(`  ✗ ${msg}`, c.red); }
function info(msg: string) { log(`  → ${msg}`, c.dim); }

// ============================================================
// ComfyUI Image Generation
// ============================================================

async function isComfyUIAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${COMFYUI_URL}/system_stats`, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function loadWorkflow(): Promise<Record<string, any>> {
  // Try multiple workflow paths
  const paths = [
    path.join(COURSEFUTURE_ROOT, 'workflows', 'comfyui', 'Z-ImageAPI.json'),
    path.join(COURSEFUTURE_ROOT, 'Z-ImageAPI.json'),
    path.join(COURSEFUTURE_ROOT, 'workflows', 'comfyui', 'z-image-simple-api.json'),
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      log(`  Loading workflow: ${path.basename(p)}`, c.dim);
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  }

  throw new Error(`No Z-Image workflow found. Checked:\n${paths.join('\n')}`);
}

async function generateFrame(
  prompt: string,
  negativePrompt: string,
  outputPath: string,
  width: number = 1664,
  height: number = 928
): Promise<boolean> {
  try {
    const workflow = await loadWorkflow();

    // Set positive prompt (Node 10 for Z-ImageAPI)
    if (workflow['10']?.inputs) {
      workflow['10'].inputs.text = prompt;
    } else if (workflow['67']?.inputs) {
      // z-image-simple-api uses node 67
      workflow['67'].inputs.text = prompt;
    }

    // Set negative prompt
    if (workflow['71']?.inputs) {
      workflow['71'].inputs.text = negativePrompt;
    }

    // Set dimensions
    if (workflow['8']?.inputs) {
      workflow['8'].inputs.width = Math.round(width / 64) * 64;
      workflow['8'].inputs.height = Math.round(height / 64) * 64;
    } else if (workflow['68']?.inputs) {
      workflow['68'].inputs.width = Math.round(width / 64) * 64;
      workflow['68'].inputs.height = Math.round(height / 64) * 64;
    }

    // Set random seed
    if (workflow['9']?.inputs) {
      workflow['9'].inputs.seed = Math.floor(Math.random() * 1000000000000);
    } else if (workflow['69']?.inputs) {
      workflow['69'].inputs.seed = Math.floor(Math.random() * 1000000000000);
    }

    // Set output filename prefix
    const baseName = path.basename(outputPath, path.extname(outputPath));
    if (workflow['3']?.inputs) {
      workflow['3'].inputs.filename_prefix = `DXF-Sizzle/${baseName}`;
    } else if (workflow['9']?.inputs?.filename_prefix !== undefined) {
      workflow['9'].inputs.filename_prefix = `DXF-Sizzle/${baseName}`;
    }

    // Queue the prompt
    const queueResponse = await fetch(`${COMFYUI_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!queueResponse.ok) {
      const errText = await queueResponse.text();
      error(`Queue failed: ${errText}`);
      return false;
    }

    const { prompt_id } = await queueResponse.json();
    info(`Queued: ${prompt_id}`);

    // Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 300; // 5 minutes

    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;

      if (attempts % 15 === 0) {
        info(`Waiting... (${attempts}s)`);
      }

      const historyRes = await fetch(`${COMFYUI_URL}/history/${prompt_id}`);
      if (!historyRes.ok) continue;

      const history = await historyRes.json();
      if (!history[prompt_id]?.outputs) continue;

      completed = true;
      const outputs = history[prompt_id].outputs;

      // Find the SaveImage output node
      for (const nodeId of Object.keys(outputs)) {
        if (outputs[nodeId]?.images?.[0]) {
          const imageInfo = outputs[nodeId].images[0];
          const imageUrl = `${COMFYUI_URL}/view?filename=${encodeURIComponent(imageInfo.filename)}&subfolder=${encodeURIComponent(imageInfo.subfolder || '')}&type=output`;

          const imageRes = await fetch(imageUrl);
          if (imageRes.ok) {
            const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
            fs.writeFileSync(outputPath, imageBuffer);
            return true;
          }
        }
      }
    }

    if (!completed) {
      error('Timeout waiting for image generation');
    }

    return false;
  } catch (err: any) {
    error(`Generation error: ${err.message}`);
    return false;
  }
}

// ============================================================
// F5-TTS Audio Generation
// ============================================================

async function generateVoiceover(
  text: string,
  outputPath: string,
  referenceAudio: string = MALE_ARCHER_VOICE
): Promise<boolean> {
  const { spawn } = await import('child_process');

  return new Promise((resolve) => {
    const scriptPath = path.join(COURSEFUTURE_ROOT, 'src', 'ai', 'audio', 'f5-tts-generator.py');

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // Check if F5-TTS script exists
    if (!fs.existsSync(scriptPath)) {
      warn(`F5-TTS script not found at: ${scriptPath}`);
      warn('Trying alternative: direct Python F5-TTS call...');

      // Try direct Python call as alternative
      const pythonScript = `
import sys
try:
    from f5_tts.api import F5TTS
    model = F5TTS()
    wav, sr, _ = model.infer(
        ref_file="${referenceAudio.replace(/\\/g, '\\\\')}",
        ref_text="",
        gen_text="${text.replace(/"/g, '\\"')}",
        seed=-1,
        remove_silence=True,
        speed=1.0
    )
    import soundfile as sf
    sf.write("${outputPath.replace(/\\/g, '\\\\')}", wav, sr)
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
`;

      const proc = spawn('python', ['-c', pythonScript], {
        cwd: COURSEFUTURE_ROOT,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
      proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

      proc.on('close', (code: number) => {
        if (code === 0 && stdout.includes('SUCCESS')) {
          resolve(true);
        } else {
          error(`F5-TTS failed: ${stderr || stdout}`);
          resolve(false);
        }
      });

      return;
    }

    // Use the F5-TTS generator script
    const config = JSON.stringify({
      text,
      referenceAudio,
      outputPath,
      referenceText: '',
      removeSilence: true,
      speed: 1.0,
      modelName: 'F5TTS_v1_Base'
    });

    const proc = spawn('python', [scriptPath, '--config', config], {
      cwd: COURSEFUTURE_ROOT,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    proc.on('close', (code: number) => {
      if (code === 0) {
        resolve(true);
      } else {
        error(`F5-TTS failed (exit ${code}): ${stderr || stdout}`);
        resolve(false);
      }
    });
  });
}

// ============================================================
// Main Pipeline
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const step = args.find((a, i) => args[i - 1] === '--step') || 'all';
  const dryRun = args.includes('--dry-run');

  banner('DXF 30-Second Sizzle Reel — Asset Generator');
  log(`  Step: ${step}`, c.dim);
  log(`  Dry run: ${dryRun}`, c.dim);
  log(`  ComfyUI: ${COMFYUI_URL}`, c.dim);
  log(`  Voice: MaleArcher (${MALE_ARCHER_VOICE})`, c.dim);

  // ── IMAGES ──────────────────────────────────────────────
  if (step === 'all' || step === 'images') {
    banner('Phase 1: Concept Frame Generation (ComfyUI Z-Image)');

    const promptsFile = path.join(SIZZLE_ROOT, 'comfyui-prompts', 'frame-prompts.json');
    if (!fs.existsSync(promptsFile)) {
      error(`Prompts file not found: ${promptsFile}`);
      process.exit(1);
    }

    const prompts = JSON.parse(fs.readFileSync(promptsFile, 'utf-8'));
    const frames = prompts.frames;
    const negativePrompt = prompts.negativePrompt;

    log(`\n  Found ${frames.length} frames to generate\n`, c.cyan);

    if (dryRun) {
      for (const frame of frames) {
        info(`[${frame.id}] ${frame.name} (${frame.timecode})`);
        info(`  Prompt: "${frame.prompt.substring(0, 80)}..."`);
        info(`  Output: ${frame.outputPath}`);
      }
    } else {
      // Check ComfyUI availability
      const available = await isComfyUIAvailable();
      if (!available) {
        error('ComfyUI is not running at ' + COMFYUI_URL);
        error('Please start ComfyUI and try again.');
        error('You can start it with: scripts/comfyui/launch-comfyui.bat');
        if (step === 'images') process.exit(1);
        warn('Skipping image generation, continuing to audio...');
      } else {
        success('ComfyUI is available');

        let generated = 0;
        let failed = 0;

        for (const frame of frames) {
          const outputPath = path.join(SIZZLE_ROOT, frame.outputPath);

          // Skip if already exists
          if (fs.existsSync(outputPath)) {
            warn(`[${frame.id}] Already exists, skipping: ${frame.outputPath}`);
            generated++;
            continue;
          }

          log(`\n  [${frame.id}] Generating: ${frame.name}`, c.cyan + c.bright);
          info(`Timecode: ${frame.timecode}`);
          info(`Prompt: "${frame.prompt.substring(0, 100)}..."`);

          const ok = await generateFrame(
            frame.prompt,
            negativePrompt,
            outputPath,
            prompts.dimensions.width,
            prompts.dimensions.height
          );

          if (ok) {
            success(`Saved: ${frame.outputPath}`);
            generated++;
          } else {
            error(`Failed: ${frame.id}`);
            failed++;
          }
        }

        log(`\n  Results: ${generated} generated, ${failed} failed`, generated === frames.length ? c.green : c.yellow);
      }
    }
  }

  // ── AUDIO ──────────────────────────────────────────────
  if (step === 'all' || step === 'audio') {
    banner('Phase 2: Voiceover Generation (F5-TTS + MaleArcher)');

    // Check MaleArcher voice file exists
    if (!fs.existsSync(MALE_ARCHER_VOICE)) {
      error(`MaleArcher voice not found: ${MALE_ARCHER_VOICE}`);
      error('Please ensure the MaleArcher.mp3 reference file exists in CourseFuture/voices/');
      process.exit(1);
    }

    success(`MaleArcher voice found: ${MALE_ARCHER_VOICE}`);
    log(`\n  Generating ${VO_LINES.length} voiceover lines\n`, c.cyan);

    if (dryRun) {
      for (const line of VO_LINES) {
        info(`[${line.id}] "${line.text}"`);
        info(`  Timecode: ${line.timecode}`);
        info(`  Direction: ${line.direction}`);
        info(`  Output: audio/${line.filename}`);
      }
    } else {
      let generated = 0;
      let failed = 0;

      for (const line of VO_LINES) {
        const outputPath = path.join(SIZZLE_ROOT, 'audio', line.filename);

        // Skip if already exists
        if (fs.existsSync(outputPath)) {
          warn(`[${line.id}] Already exists, skipping: ${line.filename}`);
          generated++;
          continue;
        }

        log(`\n  [${line.id}] Generating: "${line.text}"`, c.magenta + c.bright);
        info(`Direction: ${line.direction}`);

        const ok = await generateVoiceover(line.text, outputPath);

        if (ok) {
          success(`Saved: audio/${line.filename}`);
          generated++;
        } else {
          error(`Failed: ${line.id}`);
          failed++;
        }
      }

      log(`\n  Results: ${generated} generated, ${failed} failed`, generated === VO_LINES.length ? c.green : c.yellow);
    }
  }

  // ── SUMMARY ──────────────────────────────────────────────
  banner('Asset Generation Complete');

  log('\n  Generated assets in:', c.dim);
  log(`  ${SIZZLE_ROOT}`, c.cyan);
  log('\n  Folder structure:', c.dim);
  log('  video-sizzle/', c.reset);
  log('  ├── storyboard.html        ← Visual storyboard (open in browser)', c.reset);
  log('  ├── generate-assets.ts     ← This script', c.dim);
  log('  ├── comfyui-prompts/', c.reset);
  log('  │   └── frame-prompts.json ← Z-Image generation prompts', c.reset);
  log('  ├── frames/                ← Generated concept images', c.green);
  log('  │   ├── F01-dull-slideshow.png', c.dim);
  log('  │   ├── F02-disengaged-learner.png', c.dim);
  log('  │   ├── F04-glitch-moment.png', c.dim);
  log('  │   └── ... (10 frames total)', c.dim);
  log('  └── audio/                 ← Generated VO audio', c.green);
  log('      ├── vo-line1-what-if.wav', c.dim);
  log('      ├── vo-line2-remembered.wav', c.dim);
  log('      ├── vo-line3-expertise.wav', c.dim);
  log('      └── vo-line4-experience.wav', c.dim);

  log('\n  Next steps:', c.yellow);
  log('  1. Review generated frames in frames/ folder', c.reset);
  log('  2. Listen to VO samples in audio/ folder', c.reset);
  log('  3. Open storyboard.html in browser for full visual reference', c.reset);
  log('  4. Share storyboard + assets with production team', c.reset);
  log('', c.reset);
}

main().catch(err => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});
