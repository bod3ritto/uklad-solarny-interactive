export interface PlanetConfig { orbitRadius: number; size: number; speed: number; color: string; glowColor: string; label: string; angle: number; }

import { useRef, useEffect, useState, useCallback } from "react";

const PLANETS: PlanetConfig[] = [
  {
    orbitRadius: 90,
    size: 10,
    speed: 0.008,
    color: "#a78bfa",
    glowColor: "rgba(167, 139, 250, 0.6)",
    label: "Web Dev",
    angle: 0,
  },
  {
    orbitRadius: 150,
    size: 8,
    speed: 0.005,
    color: "#818cf8",
    glowColor: "rgba(129, 140, 248, 0.6)",
    label: "Animacje",
    angle: (2 * Math.PI) / 3,
  },
  {
    orbitRadius: 210,
    size: 12,
    speed: 0.003,
    color: "#c084fc",
    glowColor: "rgba(192, 132, 252, 0.6)",
    label: "UI/UX",
    angle: (4 * Math.PI) / 3,
  },
];

interface PlanetState {
  x: number;
  y: number;
  angle: number;
  hovered: boolean;
}

interface PlanetarySystemProps {
  customColor?: string;
}

export default function PlanetarySystem({ customColor }: PlanetarySystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const planetStatesRef = useRef<PlanetState[]>(
    PLANETS.map((p) => ({ x: 0, y: 0, angle: p.angle, hovered: false }))
  );
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [hoveredPlanet, setHoveredPlanet] = useState<number | null>(null);
  const scaleRef = useRef(1);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    const minDim = Math.min(rect.width, rect.height);
    scaleRef.current = minDim / 500;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(container);
    resizeCanvas();

    return () => observer.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let newHoveredPlanet: number | null = null;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cx = w / 2;
      const cy = h / 2;
      const scale = scaleRef.current;

      ctx.clearRect(0, 0, w, h);

      /* ── Central star ─────────────────────────────────── */
      const starRadius = 18 * scale;
      const themeColor = customColor || "#a78bfa";

      // Outer glow
      const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, starRadius * 4);
      outerGlow.addColorStop(0, themeColor + "26");
      outerGlow.addColorStop(0.5, themeColor + "0d");
      outerGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, starRadius * 4, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Inner glow
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, starRadius * 2);
      innerGlow.addColorStop(0, themeColor + "66");
      innerGlow.addColorStop(0.6, themeColor + "26");
      innerGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, starRadius * 2, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      // Core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, starRadius);
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.4, themeColor);
      coreGrad.addColorStop(1, themeColor);
      ctx.beginPath();
      ctx.arc(cx, cy, starRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Pulsing ring
      const pulseRadius = starRadius * (1.3 + 0.15 * Math.sin(Date.now() * 0.002));
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = themeColor + "40";
      ctx.lineWidth = 1;
      ctx.stroke();

      /* ── Orbit rings & planets ────────────────────────── */
      newHoveredPlanet = null;

      PLANETS.forEach((planet, i) => {
        const states = planetStatesRef.current;
        const orbitR = planet.orbitRadius * scale;
        const planetColor = customColor || planet.color;

        // Orbit ring
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Check hover
        const dist = Math.hypot(
          mouseRef.current.x - states[i].x,
          mouseRef.current.y - states[i].y
        );
        const isHovered = dist < planet.size * scale * 2.5;
        states[i].hovered = isHovered;
        if (isHovered) newHoveredPlanet = i;

        // Update angle (slow down on hover)
        const speedMultiplier = isHovered ? 0.15 : 1;
        states[i].angle += planet.speed * speedMultiplier;

        // Planet position
        const px = cx + Math.cos(states[i].angle) * orbitR;
        const py = cy + Math.sin(states[i].angle) * orbitR;
        states[i].x = px;
        states[i].y = py;

        const pSize = planet.size * scale;

        // Planet glow (enhanced on hover)
        const glowRadius = isHovered ? pSize * 5 : pSize * 3;
        const glowOpacity = isHovered ? "80" : "33";
        const planetGlow = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
        planetGlow.addColorStop(0, planetColor + glowOpacity);
        planetGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = planetGlow;
        ctx.fill();

        // Planet body
        const bodyGrad = ctx.createRadialGradient(
          px - pSize * 0.3,
          py - pSize * 0.3,
          0,
          px,
          py,
          pSize
        );
        bodyGrad.addColorStop(0, "#fff");
        bodyGrad.addColorStop(0.3, planetColor);
        bodyGrad.addColorStop(1, planetColor + "88");
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Label on hover
        if (isHovered) {
          ctx.save();
          ctx.font = `${Math.max(12, 14 * scale)}px Inter, sans-serif`;
          ctx.fillStyle = "#fafafa";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";

          // Label background
          const labelText = planet.label;
          const metrics = ctx.measureText(labelText);
          const padding = 8 * scale;
          const labelY = py - pSize * 2.5;
          const bgWidth = metrics.width + padding * 2;
          const bgHeight = 24 * scale;

          ctx.fillStyle = "rgba(17, 17, 19, 0.9)";
          ctx.beginPath();
          const bgX = px - bgWidth / 2;
          const bgY = labelY - bgHeight;
          const radius = 6 * scale;
          ctx.moveTo(bgX + radius, bgY);
          ctx.lineTo(bgX + bgWidth - radius, bgY);
          ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius);
          ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius);
          ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight);
          ctx.lineTo(bgX + radius, bgY + bgHeight);
          ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius);
          ctx.lineTo(bgX, bgY + radius);
          ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = planetColor + "66";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = planetColor;
          ctx.textBaseline = "middle";
          ctx.fillText(labelText, px, bgY + bgHeight / 2);
          ctx.restore();
        }
      });

      setHoveredPlanet(newHoveredPlanet);

      /* ── Particle dust ────────────────────────────────── */
      const time = Date.now() * 0.001;
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2 + time * 0.1;
        const radius = 60 * scale + i * 8 * scale;
        const x = cx + Math.cos(angle + i * 0.5) * radius;
        const y = cy + Math.sin(angle + i * 0.5) * radius;
        const opacity = 0.1 + 0.1 * Math.sin(time + i);
        const size = (0.5 + Math.sin(time * 2 + i) * 0.3) * scale;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = themeColor;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [customColor]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className={`h-full w-full ${hoveredPlanet !== null ? "cursor-pointer" : "cursor-default"
          }`}
      />
    </div>
  );
}
