/* ═══════════════════════════════════════════════════════════════
   SENTIENCE — Animated Flowing Data Dots
   Animates dots along SVG paths using getPointAtLength.
   ═══════════════════════════════════════════════════════════════ */
'use strict';

(function initSentienceDiagram() {
  const svg = document.getElementById('sentience-diagram');
  if (!svg) return;

  const paths = svg.querySelectorAll('path.conn');
  const dotElements = [];

  // Group all animated elements inside a <g> so they render on top
  const animLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  animLayer.setAttribute('id', 'sd-anim-layer');
  svg.appendChild(animLayer);

  // Initialize dots for each path
  paths.forEach((path, pathIdx) => {
    const totalLength = path.getTotalLength();
    if (totalLength < 15) return;

    // Use data-speed attribute if defined, otherwise default
    const speedAttr = parseFloat(path.getAttribute('data-speed'));
    const speed = isNaN(speedAttr) ? 0.8 : speedAttr;
    
    // Number of dots scales with path length
    const dotSpacing = 140; 
    const dotCount = Math.max(1, Math.floor(totalLength / dotSpacing));

    const pathData = {
      path,
      totalLength,
      speed
    };

    for (let i = 0; i < dotCount; i++) {
      // Create main dark dot
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3');
      dot.setAttribute('fill', '#fff');
      dot.setAttribute('opacity', '0');
      
      // Create subtle glow ring
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.setAttribute('r', '6');
      glow.setAttribute('fill', 'rgba(255,255,255,0.2)');
      glow.setAttribute('opacity', '0');

      animLayer.appendChild(glow);
      animLayer.appendChild(dot);

      dotElements.push({
        dot,
        glow,
        pData: pathData,
        offset: i / dotCount // Stagger dots evenly along the path
      });
    }
  });

  const startTime = performance.now();

  function animateFrame(now) {
    dotElements.forEach(item => {
      const pData = item.pData;
      
      // Calculate animation duration based on length and speed
      // Base duration is 50ms per pixel at 1.0x speed
      const duration = (pData.totalLength / 50) * (1 / pData.speed) * 1000;
      
      // Calculate elapsed time taking offset into account
      const elapsed = ((now - startTime) - (item.offset * duration)) % duration;
      
      // Normalized position [0.0 - 1.0]
      const t = ((elapsed % duration) + duration) % duration / duration;

      // Get exact coordinates along the SVG path
      const point = pData.path.getPointAtLength(t * pData.totalLength);

      item.dot.setAttribute('cx', point.x);
      item.dot.setAttribute('cy', point.y);
      item.glow.setAttribute('cx', point.x);
      item.glow.setAttribute('cy', point.y);

      // Fade in at start and fade out at end for smooth transitions
      let opacity = 0.9;
      if (t < 0.08) {
        opacity = (t / 0.08) * 0.9;
      } else if (t > 0.92) {
        opacity = ((1 - t) / 0.08) * 0.9;
      }

      item.dot.setAttribute('opacity', opacity);
      item.glow.setAttribute('opacity', opacity * 0.8);
    });

    requestAnimationFrame(animateFrame);
  }

  // Start animation
  requestAnimationFrame(animateFrame);

})();

// --- PARTICLE ORB ANIMATION ---
(function initOrb() {
  const canvas = document.getElementById('orb-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  
  const width = canvas.width;
  const height = canvas.height;
  
  const particles = [];
  const numParticles = 3000;
  const radius = 320;
  
  for (let i = 0; i < numParticles; i++) {
    // Distribute points evenly on a sphere using Fibonacci lattice
    const phi = Math.acos(-1 + (2 * i) / numParticles);
    const theta = Math.sqrt(numParticles * Math.PI) * phi;
    
    // Add noise to radius
    const rVar = radius + (Math.random() * 50 - 25);

    particles.push({
      phi: phi,
      theta: theta,
      rVar: rVar,
      baseSize: Math.random() * 1.5 + 0.4,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      pulseAmp: Math.random() * 30 + 10
    });
  }
  
  // Keep an extremely slow rotation just for depth perception, but stop the spinning
  let angleX = 0;
  let angleY = 0;
  
  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    angleX += 0.0001;
    angleY += 0.0002;
    
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.globalCompositeOperation = 'lighter';
    
    for (let i = 0; i < numParticles; i++) {
      const p = particles[i];
      
      // Update individual pulsing phase
      p.phase += p.pulseSpeed;
      
      // Calculate current radius based on pulse
      const currentR = p.rVar + Math.sin(p.phase) * p.pulseAmp;
      
      // Calculate 3D coordinates
      const px = currentR * Math.cos(p.theta) * Math.sin(p.phi);
      const py = currentR * Math.sin(p.theta) * Math.sin(p.phi);
      const pz = currentR * Math.cos(p.phi);
      
      // Rotate X
      const y1 = py * cosX - pz * sinX;
      const z1 = py * sinX + pz * cosX;
      
      // Rotate Y
      const x2 = px * cosY + z1 * sinY;
      const z2 = -px * sinY + z1 * cosY;
      
      // Perspective projection
      const perspective = 800 / (800 + z2);
      
      if (perspective > 0.1) {
        const xProj = centerX + x2 * perspective;
        const yProj = centerY + y1 * perspective;
        const size = p.baseSize * perspective;
        
        // Depth-based alpha fading
        const alpha = Math.min(1, Math.max(0.05, perspective - 0.4));
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(xProj, yProj, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    requestAnimationFrame(draw);
  }
  
  draw();
})();
