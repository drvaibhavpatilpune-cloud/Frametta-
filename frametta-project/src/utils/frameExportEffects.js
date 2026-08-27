/** Canvas helpers mirroring live FrameLighting overlays for export fidelity. */

export function drawWallShadow(ctx, x, y, w, h, scale = 1) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";

  const contactY = y + h + 6 * scale;
  const contactGrad = ctx.createRadialGradient(x + w / 2, contactY, 0, x + w / 2, contactY, w * 0.42);
  contactGrad.addColorStop(0, "rgba(0,0,0,0.55)");
  contactGrad.addColorStop(0.55, "rgba(0,0,0,0.18)");
  contactGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = contactGrad;
  ctx.fillRect(x - w * 0.08, contactY - 8 * scale, w * 1.16, h * 0.22);

  const ambientY = y + h + 14 * scale;
  const ambientGrad = ctx.createRadialGradient(x + w / 2, ambientY, 0, x + w / 2, ambientY, w * 0.55);
  ambientGrad.addColorStop(0, "rgba(0,0,0,0.28)");
  ambientGrad.addColorStop(0.6, "rgba(0,0,0,0.08)");
  ambientGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ambientGrad;
  ctx.fillRect(x - w * 0.12, ambientY - 12 * scale, w * 1.24, h * 0.32);

  ctx.restore();
}

export function drawRabbetAO(ctx, x, y, w, h, depth = 14) {
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const inset = t * depth;
    const alpha = (1 - t) * 0.14;
    ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
  }
}

export function drawMatBevel(ctx, x, y, w, h) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, "rgba(0,0,0,0.16)");
  grad.addColorStop(0.08, "rgba(0,0,0,0)");
  grad.addColorStop(0.92, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(255,255,255,0.22)");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

export function drawArtworkBorder(ctx, x, y, w, h, showBorderLine) {
  if (showBorderLine) {
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
  }
  const innerShadow = ctx.createLinearGradient(x, y, x, y + Math.min(24, h * 0.15));
  innerShadow.addColorStop(0, "rgba(0,0,0,0.42)");
  innerShadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = innerShadow;
  ctx.fillRect(x, y, w, Math.min(24, h * 0.15));
}

export function drawMiterCorners(ctx, frameWidth, contentW, contentH) {
  const fw = frameWidth;
  const drawMiter = (x0, y0, angle) => {
    ctx.save();
    ctx.translate(x0, y0);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(-fw, -fw, fw, fw);
    g.addColorStop(0.48, "rgba(0,0,0,0.38)");
    g.addColorStop(0.5, "rgba(255,255,255,0.12)");
    g.addColorStop(0.52, "rgba(0,0,0,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-fw, fw);
    ctx.lineTo(fw, -fw);
    ctx.stroke();
    ctx.restore();
  };

  drawMiter(fw / 2, fw / 2, 0);
  drawMiter(contentW - fw / 2, fw / 2, 0);
  drawMiter(fw / 2, contentH - fw / 2, 0);
  drawMiter(contentW - fw / 2, contentH - fw / 2, 0);
}

export function drawFrameGrain(ctx, x, y, w, h, opacity = 0.08) {
  const imageData = ctx.getImageData(x, y, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 28;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n;
  }
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.putImageData(imageData, x, y);
  ctx.restore();
}

export function drawGlassSheen(ctx, x, y, w, h) {
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, "rgba(255,255,255,0.16)");
  grad.addColorStop(0.18, "rgba(255,255,255,0.05)");
  grad.addColorStop(0.4, "rgba(255,255,255,0)");
  grad.addColorStop(0.78, "rgba(255,255,255,0.06)");
  grad.addColorStop(1, "rgba(255,255,255,0.14)");
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}
