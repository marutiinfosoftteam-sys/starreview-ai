import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

// Helper to draw rounded rectangles on canvas
function roundRect(ctx, x, y, width, height, radius) {
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
}

const GOOGLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`;

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generates an HTML5 Canvas containing the Standee Flyer (A6) or Counter Banner
 */
export async function generateFlyerCanvas({
  theme = 'Classic',
  size = 'A6',
  bizName = 'Team Maruti InfoSoft',
  qrDataUrl
}) {
  const isBanner = size === 'Banner';
  const canvas = document.createElement('canvas');

  // Load Google logo
  const googleImgPromise = loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(GOOGLE_SVG));

  // Ensure high quality QR image data URL
  let resolvedQrUrl = qrDataUrl;
  if (!resolvedQrUrl || !resolvedQrUrl.startsWith('data:image')) {
    try {
      resolvedQrUrl = await QRCode.toDataURL(resolvedQrUrl || 'https://starreview-ai-alpha.vercel.app/r/demo', {
        width: 600,
        margin: 2,
        errorCorrectionLevel: 'H'
      });
    } catch {
      resolvedQrUrl = qrDataUrl;
    }
  }

  const qrImgPromise = loadImage(resolvedQrUrl);
  const [googleImg, qrImg] = await Promise.all([googleImgPromise, qrImgPromise]);

  if (isBanner) {
    // ------------------------------------------------------------------------
    // WIDE COUNTER BANNER (1400 x 600)
    // ------------------------------------------------------------------------
    canvas.width = 1400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1400, 600);

    // Card border
    const borderColor = theme === 'Vibrant' ? '#c084fc' : (theme === 'Minimalist' ? '#0f172a' : (theme === 'Plain QR' ? '#e2e8f0' : '#86efac'));
    roundRect(ctx, 20, 20, 1360, 560, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Right side gradient
    ctx.save();
    roundRect(ctx, 20, 20, 1360, 560, 28);
    ctx.clip();

    const bannerGrad = ctx.createLinearGradient(850, 0, 1380, 600);
    if (theme === 'Vibrant') {
      bannerGrad.addColorStop(0, '#6366f1');
      bannerGrad.addColorStop(1, '#9333ea');
    } else if (theme === 'Minimalist') {
      bannerGrad.addColorStop(0, '#1e293b');
      bannerGrad.addColorStop(1, '#0f172a');
    } else if (theme === 'Plain QR') {
      bannerGrad.addColorStop(0, '#f1f5f9');
      bannerGrad.addColorStop(1, '#e2e8f0');
    } else {
      // Classic
      bannerGrad.addColorStop(0, '#15803d');
      bannerGrad.addColorStop(1, '#166534');
    }

    ctx.fillStyle = bannerGrad;
    ctx.beginPath();
    ctx.moveTo(850, 0);
    ctx.bezierCurveTo(800, 200, 890, 400, 830, 600);
    ctx.lineTo(1400, 600);
    ctx.lineTo(1400, 0);
    ctx.closePath();
    ctx.fill();

    // Left side elements
    // Business header with Google G
    if (googleImg) {
      ctx.drawImage(googleImg, 70, 65, 36, 36);
    }
    ctx.font = 'bold 30px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText(bizName, 120, 93);

    // 5 Stars
    ctx.font = '34px Arial, sans-serif';
    ctx.fillStyle = theme === 'Vibrant' ? '#f59e0b' : '#eab308';
    ctx.fillText('★★★★★', 70, 155);

    // Title: Review Us on Google
    ctx.font = 'bold 44px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Review Us on Google', 70, 220);

    // 3 Trust pills
    const pillBg = theme === 'Vibrant' ? '#faf5ff' : (theme === 'Minimalist' ? '#f8fafc' : '#f0fdf4');
    const pillBorder = theme === 'Vibrant' ? '#e9d5ff' : (theme === 'Minimalist' ? '#cbd5e1' : '#bbf7d0');
    const pillColor = theme === 'Vibrant' ? '#7e22ce' : (theme === 'Minimalist' ? '#0f172a' : '#15803d');
    const checkPills = ['✓ Real Reviews', '✓ Quick & Easy', '✓ Secure'];

    let pillX = 70;
    ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
    checkPills.forEach(p => {
      const pW = ctx.measureText(p).width + 32;
      roundRect(ctx, pillX, 260, pW, 40, 20);
      ctx.fillStyle = pillBg;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = pillBorder;
      ctx.stroke();

      ctx.fillStyle = pillColor;
      ctx.textAlign = 'center';
      ctx.fillText(p, pillX + pW / 2, 286);
      pillX += pW + 14;
    });

    // Call to action button
    const btnBg = theme === 'Vibrant' ? '#7e22ce' : (theme === 'Minimalist' ? '#0f172a' : '#16a34a');
    roundRect(ctx, 70, 340, 360, 60, 30);
    ctx.fillStyle = btnBg;
    ctx.fill();
    ctx.font = 'bold 20px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('📱 SCAN WITH YOUR PHONE', 70 + 180, 377);

    // Footer
    ctx.font = 'bold 16px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText('Powered by ReviewFlow AI', 70, 450);

    // Right Side: Banner QR Card
    // Top badge
    const topBadgeBg = 'rgba(255, 255, 255, 0.22)';
    roundRect(ctx, 990, 60, 260, 38, 19);
    ctx.fillStyle = topBadgeBg;
    ctx.fill();
    ctx.font = 'bold 14px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN & REVIEW WITH AI', 990 + 130, 84);

    // QR Card Box
    roundRect(ctx, 980, 115, 280, 280, 24);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();

    if (qrImg) {
      ctx.drawImage(qrImg, 1000, 135, 240, 240);
    }

    // Google G Center Logo on QR
    if (googleImg && theme !== 'Plain QR') {
      const cx = 1120, cy = 255, r = 26;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();
      ctx.drawImage(googleImg, cx - 16, cy - 16, 32, 32);
    }

    // Bottom Badge
    roundRect(ctx, 990, 420, 260, 38, 19);
    ctx.fillStyle = topBadgeBg;
    ctx.fill();
    ctx.font = 'bold 14px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ Takes less than 30 seconds', 990 + 130, 444);

    ctx.restore();
  } else {
    // ------------------------------------------------------------------------
    // STANDEE FLYER A6 VERTICAL (1000 x 1420) - MATCHES SCREENSHOT 3 EXACTLY
    // ------------------------------------------------------------------------
    canvas.width = 1000;
    canvas.height = 1420;
    const ctx = canvas.getContext('2d');

    // Fill white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1000, 1420);

    const borderColor = theme === 'Vibrant' ? '#c084fc' : (theme === 'Minimalist' ? '#0f172a' : (theme === 'Plain QR' ? '#e2e8f0' : '#86efac'));
    const accentColor = theme === 'Vibrant' ? '#9333ea' : (theme === 'Minimalist' ? '#0f172a' : (theme === 'Plain QR' ? '#64748b' : '#16a34a'));

    // Card boundary
    roundRect(ctx, 30, 30, 940, 1360, 36);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    ctx.save();
    roundRect(ctx, 30, 30, 940, 1360, 36);
    ctx.clip();

    // Top organic header wave gradient
    if (theme !== 'Plain QR') {
      const topWave = ctx.createLinearGradient(0, 30, 0, 200);
      if (theme === 'Vibrant') {
        topWave.addColorStop(0, '#faf5ff');
        topWave.addColorStop(1, '#ffffff');
      } else if (theme === 'Minimalist') {
        topWave.addColorStop(0, '#f8fafc');
        topWave.addColorStop(1, '#ffffff');
      } else {
        // Classic green wave
        topWave.addColorStop(0, '#f0fdf4');
        topWave.addColorStop(1, '#ffffff');
      }
      ctx.fillStyle = topWave;
      ctx.beginPath();
      ctx.moveTo(30, 30);
      ctx.lineTo(970, 30);
      ctx.lineTo(970, 130);
      ctx.bezierCurveTo(750, 180, 250, 110, 30, 170);
      ctx.closePath();
      ctx.fill();
    }

    // Google G Logo at top center
    const topLogoY = 85;
    if (googleImg) {
      ctx.drawImage(googleImg, 500 - 24, topLogoY - 24, 48, 48);
    }

    // Horizontal accent pill bars next to Google logo (as seen in Screenshot 3)
    if (theme !== 'Plain QR') {
      const barColor = theme === 'Vibrant' ? '#c084fc' : (theme === 'Minimalist' ? '#cbd5e1' : '#86efac');
      roundRect(ctx, 500 - 24 - 70, topLogoY - 2, 55, 5, 3);
      ctx.fillStyle = barColor;
      ctx.fill();

      roundRect(ctx, 500 + 24 + 15, topLogoY - 2, 55, 5, 3);
      ctx.fillStyle = barColor;
      ctx.fill();
    }

    // Business Name
    ctx.font = 'bold 38px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(bizName, 500, 180);

    // 5 Stars
    ctx.font = '34px Arial, sans-serif';
    ctx.fillStyle = theme === 'Vibrant' ? '#f59e0b' : '#eab308';
    ctx.fillText('★★★★★', 500, 230);

    // Review Us on Google
    ctx.font = 'bold 44px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Review Us on Google', 500, 290);

    // Central QR Box Wrap
    const qrBoxW = 460;
    const qrBoxH = 460;
    const qrBoxX = 500 - qrBoxW / 2;
    const qrBoxY = 330;

    const qrBoxBg = theme === 'Vibrant' ? '#faf5ff' : (theme === 'Minimalist' ? '#f8fafc' : (theme === 'Plain QR' ? '#ffffff' : '#f0fdf4'));
    const qrBoxBorder = theme === 'Vibrant' ? '#a855f7' : (theme === 'Minimalist' ? '#0f172a' : (theme === 'Plain QR' ? '#e2e8f0' : '#86efac'));

    roundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 28);
    ctx.fillStyle = qrBoxBg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = qrBoxBorder;
    ctx.stroke();

    // Inner White Card Box for QR (crisp dedicated white card)
    const innerPad = 26;
    roundRect(ctx, qrBoxX + innerPad, qrBoxY + innerPad, qrBoxW - innerPad * 2, qrBoxH - innerPad * 2, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.stroke();

    // QR Image drawn INSIDE white card
    if (qrImg) {
      const qrInnerPad = 44;
      ctx.drawImage(qrImg, qrBoxX + qrInnerPad, qrBoxY + qrInnerPad, qrBoxW - qrInnerPad * 2, qrBoxH - qrInnerPad * 2);
    }

    // Centered Google G Logo Circle on QR Code
    if (googleImg && theme !== 'Plain QR') {
      const cx = 500, cy = qrBoxY + qrBoxH / 2, r = 32;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();
      ctx.drawImage(googleImg, cx - 20, cy - 20, 40, 40);
    }

    // Floating pill badges on sides of QR (Drawn on top of QR card so they never get sliced or covered)
    if (theme !== 'Plain QR') {
      const badgeBg = theme === 'Vibrant' ? '#9333ea' : (theme === 'Minimalist' ? '#0f172a' : '#ffffff');
      const badgeBorder = theme === 'Vibrant' ? '#c084fc' : (theme === 'Minimalist' ? '#334155' : '#86efac');
      const badgeColor = theme === 'Vibrant' ? '#ffffff' : (theme === 'Minimalist' ? '#ffffff' : '#15803d');

      // Left Badge: Amazing! 😍 (Top border floating pill completely outside QR code)
      roundRect(ctx, qrBoxX + 28, qrBoxY - 22, 150, 44, 22);
      ctx.fillStyle = badgeBg;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = badgeBorder;
      ctx.stroke();
      ctx.font = 'bold 16px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillStyle = badgeColor;
      ctx.textAlign = 'center';
      ctx.fillText('Amazing! 😍', qrBoxX + 28 + 75, qrBoxY - 22 + 28);

      // Right Badge: Best ever! 🤩 (Bottom border floating pill completely outside QR code)
      roundRect(ctx, qrBoxX + qrBoxW - 178, qrBoxY + qrBoxH - 22, 150, 44, 22);
      ctx.fillStyle = badgeBg;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = badgeBorder;
      ctx.stroke();
      ctx.font = 'bold 16px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillStyle = badgeColor;
      ctx.textAlign = 'center';
      ctx.fillText('Best ever! 🤩', qrBoxX + qrBoxW - 178 + 75, qrBoxY + qrBoxH - 22 + 28);
    }

    // Time Badge: ⚡ Takes less than 30 seconds !
    const timeBg = theme === 'Vibrant' ? '#faf5ff' : (theme === 'Minimalist' ? '#f8fafc' : '#f0fdf4');
    const timeBorder = theme === 'Vibrant' ? '#e9d5ff' : (theme === 'Minimalist' ? '#cbd5e1' : '#bbf7d0');
    const timeColor = theme === 'Vibrant' ? '#7e22ce' : (theme === 'Minimalist' ? '#0f172a' : '#15803d');
    roundRect(ctx, 500 - 180, 825, 360, 44, 22);
    ctx.fillStyle = timeBg;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = timeBorder;
    ctx.stroke();
    ctx.font = 'bold 17px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = timeColor;
    ctx.textAlign = 'center';
    ctx.fillText('⚡ Takes less than 30 seconds !', 500, 853);

    // 3 Trust pills
    const pills = ['✓ Real Reviews', '✓ Quick & Easy', '✓ Secure'];
    let pStartX = 180;
    ctx.font = 'bold 17px "Plus Jakarta Sans", system-ui, sans-serif';
    pills.forEach((p, idx) => {
      const pW = 190;
      roundRect(ctx, pStartX + idx * (pW + 35), 900, pW, 40, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = borderColor;
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.textAlign = 'center';
      ctx.fillText(p, pStartX + idx * (pW + 35) + pW / 2, 926);
    });

    // SCAN WITH YOUR PHONE Button
    const btnBg = theme === 'Vibrant' ? '#7e22ce' : (theme === 'Minimalist' ? '#0f172a' : '#16a34a');
    roundRect(ctx, 500 - 275, 980, 550, 68, 34);
    ctx.fillStyle = btnBg;
    ctx.fill();
    ctx.font = 'bold 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN WITH YOUR PHONE  ➔', 500, 1022);

    // Footer Text
    ctx.font = 'bold 18px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('POWERED BY ReviewFlow AI', 500, 1110);
    ctx.font = '15px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('AI-Powered Google Review Growth System', 500, 1135);

    ctx.restore();
  }

  return canvas;
}

/**
 * Downloads a high-resolution PNG image matching Screenshot 3
 */
export async function downloadFlyerImage({
  theme = 'Classic',
  size = 'A6',
  bizName = 'Team Maruti InfoSoft',
  qrDataUrl,
  notify
}) {
  try {
    const canvas = await generateFlyerCanvas({ theme, size, bizName, qrDataUrl });
    const cleanBiz = (bizName || 'Review').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${cleanBiz}_Review_Flyer.png`;

    canvas.toBlob((blob) => {
      if (!blob) {
        if (notify) notify('Could not generate image file.');
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      if (notify) notify('Flyer image saved to your PC (' + fileName + ').');
    }, 'image/png');
  } catch (err) {
    console.error('downloadFlyerImage error:', err);
    if (notify) notify('Download failed: ' + (err.message || 'unknown error'));
  }
}

/**
 * Downloads a high-resolution, print-ready PDF file directly to the PC
 */
export async function downloadFlyerPdf({
  theme = 'Classic',
  size = 'A6',
  bizName = 'Team Maruti InfoSoft',
  qrDataUrl,
  notify
}) {
  try {
    const canvas = await generateFlyerCanvas({ theme, size, bizName, qrDataUrl });
    const isBanner = size === 'Banner';
    const pdf = new jsPDF({
      orientation: isBanner ? 'landscape' : 'portrait',
      unit: 'mm',
      format: isBanner ? [210, 95] : 'a6'
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');

    const cleanBiz = (bizName || 'Review').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${cleanBiz}_Review_Flyer.pdf`;
    pdf.save(fileName);
    if (notify) notify('Print-ready PDF downloaded to your PC (' + fileName + ').');
  } catch (err) {
    console.error('downloadFlyerPdf error:', err);
    if (notify) notify('PDF generation failed: ' + (err.message || 'unknown error'));
  }
}

/**
 * Downloads plain raw QR code PNG
 */
export function downloadPlainQr({
  bizName = 'Team Maruti InfoSoft',
  qrDataUrl,
  notify
}) {
  try {
    const cleanBiz = (bizName || 'Review').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${cleanBiz}_plain_qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (notify) notify('Plain QR code downloaded to your PC.');
  } catch (err) {
    console.error('downloadPlainQr error:', err);
    if (notify) notify('Download failed: ' + (err.message || 'unknown error'));
  }
}
