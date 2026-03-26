const canvas = document.getElementById("hero-video");
const context = canvas.getContext("2d");

const config = {
  blooms: [],
  grainCanvas: null,
  sparks: [],
  rippleCount: 3,
  waves: [],
  width: 0,
  height: 0,
};

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  config.width = window.innerWidth;
  config.height = window.innerHeight;

  canvas.width = Math.floor(config.width * dpr);
  canvas.height = Math.floor(config.height * dpr);
  canvas.style.width = `${config.width}px`;
  canvas.style.height = `${config.height}px`;

  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  config.blooms = Array.from({ length: 5 }, (_, index) => createBloom(index));
  config.sparks = Array.from({ length: 18 }, (_, index) => createSpark(index));
  config.waves = Array.from({ length: 3 }, (_, index) => createWave(index));
  config.grainCanvas = createGrainCanvas();
}

function createBloom(index) {
  return {
    x: config.width * (0.15 + Math.random() * 0.7),
    y: config.height * (0.1 + Math.random() * 0.8),
    radius: Math.min(config.width, config.height) * (0.2 + Math.random() * 0.22),
    driftX: (Math.random() - 0.5) * 0.012,
    driftY: (Math.random() - 0.5) * 0.012,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.1 + index * 0.018,
    hue:
      index % 3 === 0
        ? [255, 204, 170]
        : index % 3 === 1
          ? [206, 164, 233]
          : [255, 236, 226],
  };
}

function createSpark(index) {
  const anchorX = config.width * 0.12;
  const anchorY = config.height * 0.84;

  return {
    orbit: 38 + Math.random() * 180,
    angle: (index / 18) * Math.PI * 2,
    speed: 0.00035 + Math.random() * 0.00065,
    size: 1.4 + Math.random() * 4.2,
    alpha: 0.35 + Math.random() * 0.35,
    hue:
      index % 2 === 0
        ? [255, 224, 194]
        : [236, 196, 255],
    anchorX,
    anchorY,
    wobble: 8 + Math.random() * 28,
    trail: [],
  };
}

function createWave(index) {
  return {
    y: config.height * (0.2 + index * 0.22),
    amplitude: config.height * (0.034 + index * 0.01),
    wavelength: 150 + index * 70,
    speed: 0.00065 + index * 0.00028,
    thickness: 60 + index * 26,
    hue:
      index === 0
        ? [255, 211, 183]
        : index === 1
          ? [223, 182, 245]
          : [255, 240, 232],
  };
}

function drawBackground() {
  const gradient = context.createLinearGradient(0, 0, config.width, config.height);
  gradient.addColorStop(0, "#dd8a78");
  gradient.addColorStop(0.45, "#ba7b83");
  gradient.addColorStop(1, "#7f678f");
  context.fillStyle = gradient;
  context.fillRect(0, 0, config.width, config.height);
}

function drawBlooms(time) {
  config.blooms.forEach((bloom, index) => {
    const pulse = 1 + Math.sin(time * 0.0002 + bloom.phase) * 0.08;
    const x = bloom.x + Math.sin(time * bloom.driftX + bloom.phase) * 32;
    const y = bloom.y + Math.cos(time * bloom.driftY + bloom.phase) * 24;
    const gradient = context.createRadialGradient(x, y, 0, x, y, bloom.radius * pulse);

    gradient.addColorStop(
      0,
      `rgba(${bloom.hue[0]}, ${bloom.hue[1]}, ${bloom.hue[2]}, ${bloom.alpha + 0.03})`,
    );
    gradient.addColorStop(
      0.42,
      `rgba(${bloom.hue[0]}, ${bloom.hue[1]}, ${bloom.hue[2]}, ${bloom.alpha})`,
    );
    gradient.addColorStop(1, `rgba(${bloom.hue[0]}, ${bloom.hue[1]}, ${bloom.hue[2]}, 0)`);

    context.fillStyle = gradient;
    context.fillRect(0, 0, config.width, config.height);

    if (index === 0) {
      const flare = context.createRadialGradient(
        config.width * 0.18,
        config.height * 0.82,
        0,
        config.width * 0.18,
        config.height * 0.82,
        config.width * 0.34,
      );
      flare.addColorStop(0, "rgba(255, 208, 162, 0.2)");
      flare.addColorStop(1, "rgba(255, 208, 162, 0)");
      context.fillStyle = flare;
      context.fillRect(0, 0, config.width, config.height);
    }
  });
}

function drawAuroraWaves(time) {
  config.waves.forEach((wave, index) => {
    context.save();
    context.beginPath();
    context.moveTo(0, config.height);

    for (let x = 0; x <= config.width; x += 16) {
      const y =
        wave.y +
        Math.sin(x / wave.wavelength + time * wave.speed) * wave.amplitude +
        Math.cos(x / (wave.wavelength * 0.7) + time * wave.speed * 0.8) * wave.amplitude * 0.7;
      context.lineTo(x, y);
    }

    context.lineTo(config.width, config.height);
    context.closePath();

    const gradient = context.createLinearGradient(0, wave.y - wave.thickness, 0, config.height);
    gradient.addColorStop(
      0,
      `rgba(${wave.hue[0]}, ${wave.hue[1]}, ${wave.hue[2]}, ${0.18 + index * 0.05})`,
    );
    gradient.addColorStop(
      0.4,
      `rgba(${wave.hue[0]}, ${wave.hue[1]}, ${wave.hue[2]}, ${0.32 + index * 0.06})`,
    );
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    context.fillStyle = gradient;
    context.fill();

    context.beginPath();
    for (let x = 0; x <= config.width; x += 16) {
      const y =
        wave.y +
        Math.sin(x / wave.wavelength + time * wave.speed) * wave.amplitude +
        Math.cos(x / (wave.wavelength * 0.7) + time * wave.speed * 0.8) * wave.amplitude * 0.7;

      if (x === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.strokeStyle = `rgba(${wave.hue[0]}, ${wave.hue[1]}, ${wave.hue[2]}, ${0.35 + index * 0.08})`;
    context.lineWidth = 2.2 + index * 0.7;
    context.shadowColor = `rgba(${wave.hue[0]}, ${wave.hue[1]}, ${wave.hue[2]}, 0.38)`;
    context.shadowBlur = 18;
    context.stroke();
    context.restore();
  });
}

function drawRipples(time) {
  const centerX = config.width * 0.12;
  const centerY = config.height * 0.84;

  context.save();
  for (let i = 0; i < config.rippleCount; i += 1) {
    const cycle = ((time * 0.00012) + i / config.rippleCount) % 1;
    const radius = 40 + cycle * Math.min(config.width, config.height) * 0.28;
    const alpha = (1 - cycle) * 0.28;

    context.beginPath();
    context.lineWidth = 1.8 + cycle * 2.4;
    context.strokeStyle = `rgba(255, 236, 226, ${alpha})`;
    context.ellipse(centerX, centerY, radius, radius * 0.42, -0.25, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
}

function drawSparkTrails(time) {
  config.sparks.forEach((spark, index) => {
    const wobbleAngle = time * spark.speed + spark.angle;
    const radiusPulse = spark.orbit + Math.sin(time * spark.speed * 2.2 + index) * spark.wobble;
    const x = spark.anchorX + Math.cos(wobbleAngle) * radiusPulse;
    const y = spark.anchorY + Math.sin(wobbleAngle * 1.18) * radiusPulse * 0.34;

    spark.trail.unshift({ x, y });
    spark.trail = spark.trail.slice(0, 14);

    context.beginPath();
    spark.trail.forEach((point, trailIndex) => {
      if (trailIndex === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.strokeStyle = `rgba(${spark.hue[0]}, ${spark.hue[1]}, ${spark.hue[2]}, ${spark.alpha * 0.4})`;
    context.lineWidth = spark.size * 0.8;
    context.lineCap = "round";
    context.shadowColor = `rgba(${spark.hue[0]}, ${spark.hue[1]}, ${spark.hue[2]}, 0.45)`;
    context.shadowBlur = 14;
    context.stroke();

    const gradient = context.createRadialGradient(x, y, 0, x, y, spark.size * 6);
    gradient.addColorStop(0, `rgba(${spark.hue[0]}, ${spark.hue[1]}, ${spark.hue[2]}, ${spark.alpha + 0.18})`);
    gradient.addColorStop(1, `rgba(${spark.hue[0]}, ${spark.hue[1]}, ${spark.hue[2]}, 0)`);

    context.beginPath();
    context.fillStyle = gradient;
    context.arc(x, y, spark.size * 6, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.fillStyle = `rgba(255, 248, 244, ${Math.min(0.98, spark.alpha + 0.3)})`;
    context.arc(x, y, spark.size, 0, Math.PI * 2);
    context.fill();
  });

  context.shadowBlur = 0;
}

function drawProtectiveArc(time) {
  const centerX = config.width * 0.12;
  const centerY = config.height * 0.84;
  const radius = Math.min(config.width, config.height) * 0.22;
  const sweep = Math.sin(time * 0.0011) * 0.22;

  context.save();
  context.beginPath();
  context.lineWidth = 3;
  context.strokeStyle = "rgba(255, 240, 231, 0.46)";
  context.arc(centerX, centerY, radius, -1.1 + sweep, 0.25 + sweep);
  context.shadowColor = "rgba(255, 240, 231, 0.35)";
  context.shadowBlur = 18;
  context.stroke();

  context.beginPath();
  context.lineWidth = 1.6;
  context.strokeStyle = "rgba(243, 201, 255, 0.34)";
  context.arc(centerX + 18, centerY - 10, radius * 0.72, -1.35 - sweep, 0.08 - sweep);
  context.stroke();
  context.restore();
}

function createGrainCanvas() {
  const grainCanvas = document.createElement("canvas");
  const grainContext = grainCanvas.getContext("2d");

  grainCanvas.width = config.width;
  grainCanvas.height = config.height;

  const imageData = grainContext.createImageData(config.width, config.height);
  const buffer = imageData.data;

  for (let i = 0; i < buffer.length; i += 4) {
    const value = Math.random() * 255;
    buffer[i] = value;
    buffer[i + 1] = value;
    buffer[i + 2] = value;
    buffer[i + 3] = 10;
  }

  grainContext.putImageData(imageData, 0, 0);
  return grainCanvas;
}

function drawGrain(time) {
  context.save();
  context.globalAlpha = 0.12 + Math.sin(time * 0.0012) * 0.02;
  context.drawImage(config.grainCanvas, 0, 0, config.width, config.height);
  context.restore();
}

function animate(timestamp) {
  drawBackground();
  drawBlooms(timestamp);
  drawAuroraWaves(timestamp);
  drawRipples(timestamp);
  drawProtectiveArc(timestamp);
  drawSparkTrails(timestamp);
  drawGrain(timestamp);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);

resize();
requestAnimationFrame(animate);
