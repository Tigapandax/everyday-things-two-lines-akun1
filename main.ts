import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Everyday Things, Two Lines entry: print the two-line explanation of a
// toaster after validating it against the bounty rules (exactly two lines,
// each a single sentence, total at most 400 characters, clean whitespace,
// terminal punctuation on each line).
const raw = readFileSync(new URL("./two-lines.txt", import.meta.url), "utf8");
const text = raw.replace(/\r?\n$/, "");
const lines = text.split("\n");

const failures: string[] = [];
if (lines.length !== 2) failures.push(`must be exactly two lines, got ${lines.length}`);
if (text.length === 0) failures.push("empty entry");
if (text.length > 400) failures.push(`too long: ${text.length}/400 characters`);
if (/\r/.test(text)) failures.push("no carriage returns allowed");
for (const [i, line] of lines.entries()) {
  if (line.length === 0) failures.push(`line ${i + 1} is empty`);
  if (line !== line.trim()) failures.push(`line ${i + 1} has leading or trailing whitespace`);
  if (/\s{2,}/.test(line)) failures.push(`line ${i + 1} has a double space`);
  if (!/[.!?]$/.test(line)) failures.push(`line ${i + 1} must end with terminal punctuation`);
  if (!/[a-zA-Z]/.test(line)) failures.push(`line ${i + 1} must contain letters`);
  if (/https?:\/\/|www\./.test(line)) failures.push(`line ${i + 1} must not contain a link`);
  // One sentence per line: exactly one sentence-ending mark.
  const ends = (line.match(/[.!?]/g) || []).length;
  if (ends !== 1) failures.push(`line ${i + 1} must be a single sentence, found ${ends} sentence marks`);
}
if (lines.length === 2 && lines[0].split(/\s+/).length < 3) failures.push("line 1 too short to explain anything");
if (lines.length === 2 && lines[1].split(/\s+/).length < 3) failures.push("line 2 too short to explain the analogy");

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}

console.log(text);
console.log(`OK: ${text.length}/400 characters, two lines, each one sentence.`);

// Harness program/v1: the sealed scorer reads the entry from
// <MAKEFUN_OUTPUT_DIR>/entry.txt, so write both lines there too
// (stdout alone scores Valid 0).
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, text + "\n", "utf8");
