(function () {
  "use strict";

  var ORANGE = [239, 134, 49];
  var ORANGE_HEAD = [255, 214, 171];
  var BLUE = [40, 132, 220];
  var BLUE_HEAD = [178, 224, 255];
  var PURPLE = [102, 46, 255];
  var PURPLE_HEAD = [196, 160, 255];
  var PALETTE = [
    { base: BLUE, head: BLUE_HEAD },
    { base: ORANGE, head: ORANGE_HEAD },
    { base: PURPLE, head: PURPLE_HEAD }
  ];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rgba(color, alpha) {
    return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + alpha + ")";
  }

  function randomSegmentIndex(segs) {
    return segs.length > 0 ? Math.floor(Math.random() * segs.length) : 0;
  }

  function colorIndexForPoint(x, y, w, h) {
    if (y > h * 0.62 && x > w * 0.16 && x < w * 0.58) {
      return 2;
    }
    if (x < w * 0.48) {
      return 0;
    }
    if (x > w * 0.56) {
      return 1;
    }
    return y > h * 0.55 ? 2 : 0;
  }

  function startCircuit(canvas) {
    if (!canvas || canvas.dataset.circuitReady === "1") {
      return;
    }
    canvas.dataset.circuitReady = "1";

    var ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    var raf = 0;
    var width = 0;
    var height = 0;
    var startedAt = 0;
    var circuit = { segs: [], nodes: [] };
    var pulses = [];
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    // En teléfonos (pantalla chica) no corremos el bucle de animación: el CSS
    // ya oculta el canvas y así no gastamos procesador ni batería de gusto.
    var smallScreen = window.matchMedia && window.matchMedia("(max-width: 860px)");
    function motionOff() {
      return (reduceMotion && reduceMotion.matches) ||
             (smallScreen && smallScreen.matches);
    }
    var particles = Array.from({ length: 8 }, function (_, index) {
      return {
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00006,
        vy: (Math.random() - 0.5) * 0.00006,
        r: 0.45 + Math.random() * 0.7,
        a: 0.015 + Math.random() * 0.035,
        colorIdx: index % 3
      };
    });

    function buildCircuit(w, h) {
      var segs = [];
      var nodes = [];
      var cx = w / 2;
      var cy = h / 2;
      var minDim = Math.min(w, h);
      var safeR = minDim * (w < 760 ? 0.33 : 0.4);
      var edgeZone = w < 760 ? 0.48 : 0.37;

      function addSegment(x1, y1, x2, y2) {
        var segmentColorIdx = colorIndexForPoint((x1 + x2) / 2, (y1 + y2) / 2, w, h);
        segs.push({ x1: x1, y1: y1, x2: x2, y2: y2, colorIdx: segmentColorIdx });
        nodes.push({ x: x1, y: y1, colorIdx: segmentColorIdx });
        nodes.push({ x: x2, y: y2, colorIdx: segmentColorIdx });
      }

      function addMiddleRoute(startX, startY, direction, routeSteps) {
        var px = startX;
        var py = startY;
        for (var r = 0; r < routeSteps; r += 1) {
          var horizontal = r % 3 !== 1;
          var len = horizontal
            ? minDim * (0.08 + Math.random() * 0.15)
            : minDim * (0.035 + Math.random() * 0.08);
          var nx = horizontal ? clamp(px + direction * len, 10, w - 10) : px;
          var ny = horizontal ? py : clamp(py + (Math.random() < 0.5 ? -1 : 1) * len, 10, h - 10);
          addSegment(px, py, nx, ny);
          px = nx;
          py = ny;
          if (px <= 12 || px >= w - 12) {
            direction *= -1;
          }
        }
      }

      for (var t = 0; t < 104; t += 1) {
        var zone = t % 4;
        var x = 0;
        var y = 0;
        if (zone === 0) {
          x = Math.random() * w * edgeZone;
          y = Math.random() * h * edgeZone;
        } else if (zone === 1) {
          x = w * (1 - edgeZone) + Math.random() * w * edgeZone;
          y = Math.random() * h * edgeZone;
        } else if (zone === 2) {
          x = Math.random() * w * edgeZone;
          y = h * (1 - edgeZone) + Math.random() * h * edgeZone;
        } else {
          x = w * (1 - edgeZone) + Math.random() * w * edgeZone;
          y = h * (1 - edgeZone) + Math.random() * h * edgeZone;
        }

        if (Math.hypot(x - cx, y - cy) < safeR) {
          continue;
        }

        var horiz = Math.random() < 0.5;
        var dx = horiz ? (Math.random() < 0.5 ? 1 : -1) : 0;
        var dy = horiz ? 0 : Math.random() < 0.5 ? 1 : -1;
        var colorIdx = colorIndexForPoint(x, y, w, h);
        nodes.push({ x: x, y: y, colorIdx: colorIdx });

        var px = x;
        var py = y;
        var steps = 4 + Math.floor(Math.random() * 7);
        for (var s = 0; s < steps; s += 1) {
          var len = minDim * (0.04 + Math.random() * 0.13);
          var nx = clamp(px + dx * len, 8, w - 8);
          var ny = clamp(py + dy * len, 8, h - 8);
          var mx = (px + nx) / 2;
          var my = (py + ny) / 2;

          if (Math.hypot(mx - cx, my - cy) < safeR * 0.9) {
            var turnX = dy * (Math.random() < 0.5 ? 1 : -1);
            var turnY = dx * (Math.random() < 0.5 ? 1 : -1);
            nx = clamp(px + turnX * len, 8, w - 8);
            ny = clamp(py + turnY * len, 8, h - 8);
            mx = (px + nx) / 2;
            my = (py + ny) / 2;
            if (Math.hypot(mx - cx, my - cy) < safeR * 0.9) {
              break;
            }
            dx = turnX;
            dy = turnY;
          }

          var segmentColorIdx = colorIndexForPoint((px + nx) / 2, (py + ny) / 2, w, h);
          segs.push({ x1: px, y1: py, x2: nx, y2: ny, colorIdx: segmentColorIdx });
          nodes.push({ x: nx, y: ny, colorIdx: segmentColorIdx });
          px = nx;
          py = ny;

          horiz = !horiz;
          dx = horiz ? (Math.random() < 0.5 ? 1 : -1) : 0;
          dy = horiz ? 0 : Math.random() < 0.5 ? 1 : -1;
          colorIdx = colorIndexForPoint(px, py, w, h);
        }
      }

      if (w >= 760) {
        for (var m = 0; m < 10; m += 1) {
          var upperY = h * (0.08 + Math.random() * 0.18);
          var lowerY = h * (0.76 + Math.random() * 0.16);
          addMiddleRoute(w * (0.18 + Math.random() * 0.18), upperY, 1, 5 + Math.floor(Math.random() * 4));
          addMiddleRoute(w * (0.82 - Math.random() * 0.18), lowerY, -1, 5 + Math.floor(Math.random() * 4));
        }
      } else {
        for (var mobileRoute = 0; mobileRoute < 5; mobileRoute += 1) {
          addMiddleRoute(
            w * (0.18 + Math.random() * 0.18),
            h * (0.08 + Math.random() * 0.16),
            1,
            4 + Math.floor(Math.random() * 3)
          );
        }
      }

      circuit = { segs: segs, nodes: nodes };
      pulses = Array.from({ length: w < 760 ? 42 : 72 }, function (_, index) {
        return {
          phase: Math.random() * 12,
          speed: 0.1 + Math.random() * 0.2,
          size: 2.4 + Math.random() * 2.6,
          bright: 0.98 + Math.random() * 0.32,
          segIdx: randomSegmentIndex(segs),
          lastCycle: -1,
          colorIdx: index % 2
        };
      });
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildCircuit(width, height);
      if (reduceMotion && reduceMotion.matches) {
        draw(0);
      }
    }

    function drawAura(w, h, cx, auraY, maxDim, glowPulse) {
      return;
      var blueAura = ctx.createRadialGradient(w * -0.16, h * 0.5, 0, w * -0.16, h * 0.5, maxDim * 1.38);
      blueAura.addColorStop(0, "rgba(18,111,255," + (0.11 + glowPulse * 0.035) + ")");
      blueAura.addColorStop(0.36, "rgba(18,111,255,0.055)");
      blueAura.addColorStop(0.68, "rgba(3,27,78,0.03)");
      blueAura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = blueAura;
      ctx.fillRect(0, 0, w, h);

      var orangeAura = ctx.createRadialGradient(w * 1.16, h * 0.5, 0, w * 1.16, h * 0.5, maxDim * 1.36);
      orangeAura.addColorStop(0, "rgba(255,95,24," + (0.1 + glowPulse * 0.035) + ")");
      orangeAura.addColorStop(0.36, "rgba(255,95,24,0.052)");
      orangeAura.addColorStop(0.68, "rgba(72,18,6,0.028)");
      orangeAura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = orangeAura;
      ctx.fillRect(0, 0, w, h);

      var purpleAura = ctx.createRadialGradient(w * 0.36, h * 1.18, 0, w * 0.36, h * 1.18, maxDim * 1.02);
      purpleAura.addColorStop(0, "rgba(102,46,255," + (0.1 + glowPulse * 0.04) + ")");
      purpleAura.addColorStop(0.42, "rgba(102,46,255,0.045)");
      purpleAura.addColorStop(0.78, "rgba(39,13,96,0.026)");
      purpleAura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = purpleAura;
      ctx.fillRect(0, 0, w, h);
    }

    function draw(time) {
      var w = width;
      var h = height;
      var cx = w / 2;
      var auraY = h * 0.49;
      var minDim = Math.min(w, h);
      var maxDim = Math.max(w, h);
      var safeR = minDim * (w < 760 ? 0.33 : 0.4);
      var glowPulse = 0.5 + Math.sin(time * 0.72) * 0.5;

      ctx.clearRect(0, 0, w, h);

      var base = ctx.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, "#020716");
      base.addColorStop(0.34, "#03091d");
      base.addColorStop(0.62, "#05091b");
      base.addColorStop(1, "#070812");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      var diagonal = ctx.createLinearGradient(0, h * 0.06, w, h * 0.94);
      diagonal.addColorStop(0, "rgba(36,132,255,0)");
      diagonal.addColorStop(0.32, "rgba(36,132,255,0.006)");
      diagonal.addColorStop(0.52, "rgba(102,46,255,0.008)");
      diagonal.addColorStop(0.72, "rgba(255,95,24,0.005)");
      diagonal.addColorStop(1, "rgba(239,134,49,0)");
      ctx.fillStyle = diagonal;
      ctx.fillRect(0, 0, w, h);

      var grid = 30;
      for (var gx = grid / 2; gx < w; gx += grid) {
        for (var gy = grid / 2; gy < h; gy += grid) {
          var dC = Math.hypot(gx - cx, gy - auraY);
          var fade = clamp((dC - safeR * 0.75) / (minDim * 0.48), 0, 1);
          if (fade < 0.06) {
            continue;
          }
          var dotColor = PALETTE[colorIndexForPoint(gx, gy, w, h)].base;
          ctx.fillStyle = rgba(dotColor, fade * 0.025);
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      for (var i = 0; i < circuit.segs.length; i += 1) {
        var seg = circuit.segs[i];
        var mx = (seg.x1 + seg.x2) / 2;
        var my = (seg.y1 + seg.y2) / 2;
        var segDistance = Math.hypot(mx - cx, my - auraY);
        var segFade = clamp((segDistance - safeR) / (maxDim * 0.28), 0, 1);
        ctx.strokeStyle = rgba(PALETTE[seg.colorIdx].base, 0.018 + segFade * 0.055);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      }

      for (var n = 0; n < circuit.nodes.length; n += 1) {
        var node = circuit.nodes[n];
        var nodeDistance = Math.hypot(node.x - cx, node.y - auraY);
        var nodeFade = clamp((nodeDistance - safeR) / (maxDim * 0.28), 0, 1);
        ctx.fillStyle = rgba(PALETTE[node.colorIdx].base, 0.024 + nodeFade * 0.085);
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.25, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (var p = 0; p < pulses.length; p += 1) {
        var pulse = pulses[p];
        if (circuit.segs.length === 0) {
          break;
        }
        var raw = time * pulse.speed + pulse.phase;
        var cycle = Math.floor(raw);
        var t = raw % 1;
        if (cycle !== pulse.lastCycle) {
          pulse.lastCycle = cycle;
          pulse.segIdx = randomSegmentIndex(circuit.segs);
          pulse.colorIdx = circuit.segs[pulse.segIdx].colorIdx;
        }

        var pulseSeg = circuit.segs[pulse.segIdx];
        var px = pulseSeg.x1 + (pulseSeg.x2 - pulseSeg.x1) * t;
        var py = pulseSeg.y1 + (pulseSeg.y2 - pulseSeg.y1) * t;
        var pulseDistance = Math.hypot(px - cx, py - auraY);
        var pulseFade = Math.max(0, (pulseDistance - safeR * 0.58) / (maxDim * 0.32));
        if (pulseFade < 0.08) {
          continue;
        }
        var colorSet = PALETTE[pulseSeg.colorIdx];
        var bright = pulse.bright * Math.min(1, pulseFade);

        var trace = ctx.createLinearGradient(pulseSeg.x1, pulseSeg.y1, px, py);
        trace.addColorStop(0, rgba(colorSet.base, bright * 0.1));
        trace.addColorStop(0.62, rgba(colorSet.base, bright * 0.32));
        trace.addColorStop(1, rgba(colorSet.head, bright * 0.58));
        ctx.strokeStyle = trace;
        ctx.lineWidth = Math.max(1, pulse.size * 0.34);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(pulseSeg.x1, pulseSeg.y1);
        ctx.lineTo(px, py);
        ctx.stroke();

        var tailT = Math.max(0, t - 0.42);
        var tailX = pulseSeg.x1 + (pulseSeg.x2 - pulseSeg.x1) * tailT;
        var tailY = pulseSeg.y1 + (pulseSeg.y2 - pulseSeg.y1) * tailT;
        var beam = ctx.createLinearGradient(tailX, tailY, px, py);
        beam.addColorStop(0, rgba(colorSet.base, 0));
        beam.addColorStop(0.48, rgba(colorSet.base, bright * 0.34));
        beam.addColorStop(0.82, rgba(colorSet.base, bright * 0.62));
        beam.addColorStop(1, rgba(colorSet.head, bright));
        ctx.strokeStyle = beam;
        ctx.lineWidth = Math.max(1.2, pulse.size * 0.52);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(px, py);
        ctx.stroke();

        var head = ctx.createRadialGradient(px, py, 0, px, py, pulse.size + 3.2);
        head.addColorStop(0, rgba(colorSet.head, bright));
        head.addColorStop(0.34, rgba(colorSet.head, bright * 0.86));
        head.addColorStop(0.62, rgba(colorSet.base, bright * 0.52));
        head.addColorStop(1, rgba(colorSet.base, 0));
        ctx.fillStyle = head;
        ctx.beginPath();
        ctx.arc(px, py, pulse.size + 3.2, 0, Math.PI * 2);
        ctx.fill();

        for (var mark = 1; mark <= 3; mark += 1) {
          var mt = Math.max(0, t - mark * 0.11);
          var mxMark = pulseSeg.x1 + (pulseSeg.x2 - pulseSeg.x1) * mt;
          var myMark = pulseSeg.y1 + (pulseSeg.y2 - pulseSeg.y1) * mt;
          var markAlpha = bright * (0.26 - mark * 0.045);
          if (markAlpha <= 0) {
            continue;
          }
          ctx.fillStyle = rgba(colorSet.base, markAlpha);
          ctx.beginPath();
          ctx.arc(mxMark, myMark, Math.max(1, pulse.size * (0.42 - mark * 0.055)), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      ctx.save();
      ctx.lineWidth = 1.5;
      var cornerSize = minDim * 0.055;
      var cornerPad = minDim * 0.024;
      var corners = [
        [cornerPad, cornerPad, 1, 1, 0],
        [w - cornerPad, cornerPad, -1, 1, 1],
        [cornerPad, h - cornerPad, 1, -1, 1],
        [w - cornerPad, h - cornerPad, -1, -1, 0]
      ];
      for (var c = 0; c < corners.length; c += 1) {
        var corner = corners[c];
        var x = corner[0];
        var y = corner[1];
        var sx = corner[2];
        var sy = corner[3];
        var cornerColor = PALETTE[corner[4]].base;
        ctx.strokeStyle = rgba(cornerColor, 0.08);
        ctx.beginPath();
        ctx.moveTo(x + sx * cornerSize, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + sy * cornerSize);
        ctx.stroke();
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.moveTo(x + sx * cornerSize * 0.35, y + sy * 2.5);
        ctx.lineTo(x + sx * cornerSize * 0.35, y + sy * 8);
        ctx.moveTo(x + sx * 2.5, y + sy * cornerSize * 0.35);
        ctx.lineTo(x + sx * 8, y + sy * cornerSize * 0.35);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      drawAura(w, h, cx, auraY, maxDim, glowPulse);

      var scanY = (time * 0.055 % 1) * h;
      var scan = ctx.createLinearGradient(0, scanY - h * 0.18, 0, scanY + h * 0.18);
      scan.addColorStop(0, "rgba(40,132,220,0)");
      scan.addColorStop(0.46, "rgba(40,132,220,0.007)");
      scan.addColorStop(0.54, "rgba(239,134,49,0.006)");
      scan.addColorStop(1, "rgba(239,134,49,0)");
      ctx.fillStyle = scan;
      ctx.fillRect(0, Math.max(0, scanY - h * 0.18), w, h * 0.36);

      for (var q = 0; q < particles.length; q += 1) {
        var particle = particles[q];
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0) particle.x = 1;
        if (particle.x > 1) particle.x = 0;
        if (particle.y < 0) particle.y = 1;
        if (particle.y > 1) particle.y = 0;
        var twinkle = 0.55 + Math.sin(time * 1.7 + particle.x * 31 + particle.y * 27) * 0.3;
        ctx.beginPath();
        ctx.arc(particle.x * w, particle.y * h, particle.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(PALETTE[particle.colorIdx].base, particle.a * twinkle);
        ctx.fill();
      }

      var vignette = ctx.createRadialGradient(cx, auraY, h * 0.25, cx, auraY, h * 0.9);
      vignette.addColorStop(0, "rgba(2,8,22,0)");
      vignette.addColorStop(0.58, "rgba(2,8,22,0.1)");
      vignette.addColorStop(1, "rgba(0,2,8,0.64)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    }

    var lastDraw = 0;
    // 30 fps alcanzan para una animación ambiental y liberan CPU para el tipeo.
    function frame(ts) {
      if (!startedAt) {
        startedAt = ts;
      }
      if (ts - lastDraw >= 31) {
        lastDraw = ts;
        draw((ts - startedAt) / 1000);
      }
      raf = window.requestAnimationFrame(frame);
    }

    function restartForMotionPreference() {
      window.cancelAnimationFrame(raf);
      if (motionOff()) {
        draw(0);
        return;
      }
      startedAt = 0;
      raf = window.requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion && reduceMotion.addEventListener) {
      reduceMotion.addEventListener("change", restartForMotionPreference);
    }
    if (smallScreen && smallScreen.addEventListener) {
      smallScreen.addEventListener("change", restartForMotionPreference);
    }
    restartForMotionPreference();
  }

  function init() {
    var canvases = document.querySelectorAll(".auth-circuit-bg");
    for (var i = 0; i < canvases.length; i += 1) {
      startCircuit(canvases[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
