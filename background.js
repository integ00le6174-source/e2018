const canvas = document.getElementById("coordinateBackground");
const context = canvas?.getContext("2d");

if (canvas && context) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const points = [];
  const gridRange = 6;
  const gridStep = 1;

  for (let x = -gridRange; x <= gridRange; x += 2) {
    for (let z = -gridRange; z <= gridRange; z += 2) {
      points.push({ x, y: Math.sin(x * 0.7 + z * 0.4) * 0.35, z });
    }
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function rotate(point, time) {
    const yaw = -0.58 + Math.sin(time * 0.00012) * 0.08;
    const pitch = 0.62 + Math.cos(time * 0.00016) * 0.05;
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const x1 = point.x * cy - point.z * sy;
    const z1 = point.x * sy + point.z * cy;
    const y1 = point.y * cp - z1 * sp;
    const z2 = point.y * sp + z1 * cp;
    return { x: x1, y: y1, z: z2 };
  }

  function project(point, time) {
    const rotated = rotate(point, time);
    const depth = rotated.z + 13;
    const scale = Math.min(window.innerWidth, window.innerHeight) * 0.092;
    return {
      x: window.innerWidth * 0.5 + (rotated.x / depth) * scale * 12,
      y: window.innerHeight * 0.54 - (rotated.y / depth) * scale * 12,
      depth,
    };
  }

  function drawLine(start, end, color, width = 1) {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.stroke();
  }

  function draw(time = 0) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const gradient = context.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
    gradient.addColorStop(0, "#071224");
    gradient.addColorStop(0.48, "#0c1b31");
    gradient.addColorStop(1, "#030915");
    context.fillStyle = gradient;
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    const depthHaze = context.createLinearGradient(0, 0, 0, window.innerHeight);
    depthHaze.addColorStop(0, "rgba(35, 87, 150, 0.12)");
    depthHaze.addColorStop(0.55, "rgba(9, 22, 42, 0.05)");
    depthHaze.addColorStop(1, "rgba(3, 9, 21, 0.62)");
    context.fillStyle = depthHaze;
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = -gridRange; i <= gridRange; i += gridStep) {
      const alpha = i === 0 ? 0.52 : 0.15;
      const lineWidth = i === 0 ? 1.8 : 1;
      drawLine(
        project({ x: -gridRange, y: 0, z: i }, time),
        project({ x: gridRange, y: 0, z: i }, time),
        `rgba(116, 212, 255, ${alpha})`,
        lineWidth
      );
      drawLine(
        project({ x: i, y: 0, z: -gridRange }, time),
        project({ x: i, y: 0, z: gridRange }, time),
        `rgba(116, 212, 255, ${alpha})`,
        lineWidth
      );
    }

    const origin = project({ x: 0, y: 0, z: 0 }, time);
    const axisX = project({ x: gridRange + 1.4, y: 0, z: 0 }, time);
    const axisY = project({ x: 0, y: gridRange * 0.8, z: 0 }, time);
    const axisZ = project({ x: 0, y: 0, z: gridRange + 1.4 }, time);

    drawLine(origin, axisX, "rgba(100, 171, 255, 0.9)", 2.4);
    drawLine(origin, axisY, "rgba(135, 236, 255, 0.9)", 2.4);
    drawLine(origin, axisZ, "rgba(70, 106, 255, 0.82)", 2.4);

    context.font = "700 13px Inter, system-ui, sans-serif";
    context.fillStyle = "rgba(214, 240, 255, 0.74)";
    context.fillText("x", axisX.x + 8, axisX.y + 4);
    context.fillText("y", axisY.x + 8, axisY.y + 4);
    context.fillText("z", axisZ.x + 8, axisZ.y + 4);

    for (const point of points) {
      const lifted = {
        x: point.x,
        y: point.y + Math.sin(time * 0.001 + point.x * 0.4 + point.z * 0.35) * 0.18,
        z: point.z,
      };
      const projected = project(lifted, time);
      const radius = Math.max(1.2, 4.8 - projected.depth * 0.18);
      context.beginPath();
      context.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(168, 226, 255, 0.52)";
      context.fill();
    }

    if (!prefersReducedMotion.matches) {
      requestAnimationFrame(draw);
    }
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}
