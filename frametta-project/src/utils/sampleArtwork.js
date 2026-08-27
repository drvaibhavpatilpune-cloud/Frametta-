/** Generates a small abstract sample painting so users can explore frames without uploading. */
export function createSampleArtwork() {
  const w = 800;
  const h = 1000;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, w * 0.2, h);
  bg.addColorStop(0, "#0f2840");
  bg.addColorStop(0.45, "#2d5a72");
  bg.addColorStop(1, "#e8c9a0");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const strokes = [
    { color: "rgba(232, 120, 90, 0.75)", x: 120, y: 180, r: 140 },
    { color: "rgba(255, 210, 120, 0.55)", x: 520, y: 320, r: 180 },
    { color: "rgba(40, 90, 110, 0.65)", x: 300, y: 620, r: 200 },
    { color: "rgba(255, 255, 255, 0.18)", x: 640, y: 760, r: 120 },
  ];
  for (const s of strokes) {
    const g = ctx.createRadialGradient(s.x, s.y, 8, s.x, s.y, s.r);
    g.addColorStop(0, s.color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, h - 220);
  ctx.quadraticCurveTo(260, h - 420, 420, h - 300);
  ctx.quadraticCurveTo(580, h - 180, 720, h - 260);
  ctx.stroke();

  return { dataUrl: canvas.toDataURL("image/png"), aspect: w / h };
}
