import React, { useRef, useEffect, useState } from 'react';
import { Rotate3d, ZoomIn, ZoomOut, RefreshCw, Smartphone, Laptop, Gamepad2, Award } from 'lucide-react';

const Virtual360Viewer = ({ productName = "Samsung Galaxy S25 Ultra", category = "celulares", color = "#334155" }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.8 }); // initial angles
  const [zoom, setZoom] = useState(1.1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);

  // Reset view
  const resetView = () => {
    setRotation({ x: 0.3, y: 0.8 });
    setZoom(1.1);
    setAutoRotate(false);
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.007,
      y: prev.y + deltaX * 0.007
    }));
    
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setAutoRotate(false);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStart.current.x;
    const deltaY = e.touches[0].clientY - dragStart.current.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.007,
      y: prev.y + deltaX * 0.007
    }));
    
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  // Zoom control
  const handleZoom = (amount) => {
    setZoom(prev => Math.min(Math.max(prev + amount, 0.5), 2.0));
  };

  // Render 3D phone model in Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = Math.max(rect.width * 0.8, 320) * window.devicePixelRatio;
      canvas.style.width = '100%';
      canvas.style.height = `${Math.max(rect.width * 0.8, 320)}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId;
    
    // Core drawing loop
    const draw = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, w, h);
      
      // Draw grid floor for depth
      ctx.strokeStyle = document.body.classList.contains('dark') ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      const gridCount = 10;
      for (let i = -gridCount; i <= gridCount; i++) {
        const xOffset = i * gridSize;
        const floorY = h / 2 + 100;
        ctx.beginPath();
        ctx.moveTo(w / 2 + xOffset * 1.5, floorY - 50);
        ctx.lineTo(w / 2 + xOffset * 2.5, floorY + 80);
        ctx.stroke();
      }

      // Geometry declarations
      let vertices = [];
      let faces = [];
      let screenVertices = [];
      let cameraVertices = [];
      let keyboardVertices = [];
      let isDiamond = false;
      let isLaptop = false;

      // Sizing variables
      const sizeW = (category === 'tablets' ? 110 : category === 'consolas' || category === 'hogar' ? 100 : 80) * zoom;
      const sizeH = (category === 'consolas' || category === 'hogar' ? 95 : 150) * zoom;
      const sizeD = (category === 'consolas' || category === 'hogar' ? 65 : 10) * zoom;

      // 3D coordinates based on category slug
      if (category === 'laptops') {
        isLaptop = true;
        const baseW = 120 * zoom;
        const baseH = 90 * zoom; 
        const lidH = 85 * zoom;  
        
        // Laptop open clamshell structure
        // 0-3: Slanted Screen Lid
        // 4-7: Flat Keyboard Base
        vertices = [
          // Screen Lid (Slanted back slightly)
          {x: -baseW, y: -lidH, z: -25*zoom}, // 0: Lid Top Left
          {x: baseW, y: -lidH, z: -25*zoom},  // 1: Lid Top Right
          {x: baseW, y: 0, z: -5*zoom},      // 2: Lid Bottom Right (hinge)
          {x: -baseW, y: 0, z: -5*zoom},     // 3: Lid Bottom Left (hinge)
          // Keyboard Base (Flat horizontal)
          {x: -baseW, y: 0, z: -5*zoom},     // 4: Base Back Left
          {x: baseW, y: 0, z: -5*zoom},      // 5: Base Back Right
          {x: baseW, y: 15*zoom, z: baseH},  // 6: Base Front Right
          {x: -baseW, y: 15*zoom, z: baseH}  // 7: Base Front Left
        ];

        // Screen area
        const sm = 6 * zoom;
        screenVertices = [
          {x: -baseW + sm, y: -lidH + sm, z: -24*zoom},
          {x: baseW - sm, y: -lidH + sm, z: -24*zoom},
          {x: baseW - sm, y: -sm, z: -6*zoom},
          {x: -baseW + sm, y: -sm, z: -6*zoom}
        ];

        // Touchpad area
        keyboardVertices = [
          {x: -25*zoom, y: 13*zoom, z: baseH - 22*zoom},
          {x: 25*zoom, y: 13*zoom, z: baseH - 22*zoom},
          {x: 25*zoom, y: 14*zoom, z: baseH - 4*zoom},
          {x: -25*zoom, y: 14*zoom, z: baseH - 4*zoom}
        ];

        faces = [
          { indices: [0, 1, 2, 3], name: 'laptop_screen_lid', depth: 0, fillStyle: color, borderStyle: 'rgba(255,255,255,0.1)' },
          { indices: [4, 5, 6, 7], name: 'laptop_base', depth: 0, fillStyle: '#1e293b', borderStyle: 'rgba(255,255,255,0.15)' }
        ];

      } else if (category === 'hombre' || category === 'mujer' || category === 'accesorios') {
        isDiamond = true;
        const gemW = 80 * zoom;
        const gemH = 110 * zoom;
        
        // Polyhedron Diamond Gem structure
        vertices = [
          {x: 0, y: -gemH, z: 0},       // 0: Top Tip
          {x: 0, y: gemH, z: 0},        // 1: Bottom Tip
          {x: -gemW, y: 0, z: -gemW},   // 2: Mid Front Left
          {x: gemW, y: 0, z: -gemW},    // 3: Mid Front Right
          {x: gemW, y: 0, z: gemW},     // 4: Mid Back Right
          {x: -gemW, y: 0, z: gemW}      // 5: Mid Back Left
        ];

        faces = [
          // Top pyramidal faces
          { indices: [0, 2, 3], name: 'gem_top_1', depth: 0, fillStyle: color },
          { indices: [0, 3, 4], name: 'gem_top_2', depth: 0, fillStyle: color },
          { indices: [0, 4, 5], name: 'gem_top_3', depth: 0, fillStyle: color },
          { indices: [0, 5, 2], name: 'gem_top_4', depth: 0, fillStyle: color },
          // Bottom pyramidal faces
          { indices: [1, 2, 3], name: 'gem_bot_1', depth: 0, fillStyle: color },
          { indices: [1, 3, 4], name: 'gem_bot_2', depth: 0, fillStyle: color },
          { indices: [1, 4, 5], name: 'gem_bot_3', depth: 0, fillStyle: color },
          { indices: [1, 5, 2], name: 'gem_bot_4', depth: 0, fillStyle: color }
        ];

      } else {
        // FLAT BOX (Smartphones, Tablets, Consoles, Household Items)
        vertices = [
          {x: -sizeW, y: -sizeH, z: -sizeD}, // 0: TL Back
          {x: sizeW, y: -sizeH, z: -sizeD},  // 1: TR Back
          {x: sizeW, y: sizeH, z: -sizeD},   // 2: BR Back
          {x: -sizeW, y: sizeH, z: -sizeD},  // 3: BL Back
          {x: -sizeW, y: -sizeH, z: sizeD},  // 4: TL Front
          {x: sizeW, y: -sizeH, z: sizeD},   // 5: TR Front
          {x: sizeW, y: sizeH, z: sizeD},    // 6: BR Front
          {x: -sizeW, y: sizeH, z: sizeD}     // 7: BL Front
        ];

        const sm = 4 * zoom;
        screenVertices = [
          {x: -sizeW + sm, y: -sizeH + sm * 2.5, z: sizeD + 0.2},
          {x: sizeW - sm, y: -sizeH + sm * 2.5, z: sizeD + 0.2},
          {x: sizeW - sm, y: sizeH - sm * 2.5, z: sizeD + 0.2},
          {x: -sizeW + sm, y: sizeH - sm * 2.5, z: sizeD + 0.2}
        ];

        cameraVertices = [
          {x: -sizeW + 20*zoom, y: -sizeH + 25*zoom, z: -sizeD - 1.5},
          {x: -sizeW + 20*zoom, y: -sizeH + 45*zoom, z: -sizeD - 1.5}
        ];

        faces = [
          { indices: [0, 1, 2, 3], name: 'back', depth: 0, fillStyle: color, borderStyle: 'rgba(255,255,255,0.1)' },
          { indices: [4, 5, 6, 7], name: 'front', depth: 0, fillStyle: '#0f172a', borderStyle: 'rgba(255,255,255,0.15)' },
          { indices: [0, 1, 5, 4], name: 'top', depth: 0, fillStyle: '#1e293b', borderStyle: 'rgba(255,255,255,0.1)' },
          { indices: [2, 3, 7, 6], name: 'bottom', depth: 0, fillStyle: '#1e293b', borderStyle: 'rgba(255,255,255,0.1)' },
          { indices: [0, 3, 7, 4], name: 'left', depth: 0, fillStyle: '#0a0f1d', borderStyle: 'rgba(255,255,255,0.1)' },
          { indices: [1, 2, 6, 5], name: 'right', depth: 0, fillStyle: '#0a0f1d', borderStyle: 'rgba(255,255,255,0.1)' }
        ];
      }

      // Trig variables
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);

      // Project 3D coordinate to 2D screen coordinate
      const project = (v) => {
        // Rotate Y axis
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.x * sinY + v.z * cosY;
        
        // Rotate X axis
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = v.y * sinX + z1 * cosX;
        
        const distance = 400;
        const scale = distance / (distance + z2);
        
        return {
          x: w / 2 + x1 * scale,
          y: h / 2 + y2 * scale,
          z: z2
        };
      };

      const projVertices = vertices.map(project);
      const projScreen = screenVertices.map(project);
      const projCam = cameraVertices.map(project);
      const projKeyboard = keyboardVertices.map(project);

      // Calculate depths
      faces.forEach(face => {
        face.depth = face.indices.reduce((sum, idx) => sum + projVertices[idx].z, 0) / face.indices.length;
      });

      // Painter's algorithm sort
      faces.sort((a, b) => b.depth - a.depth);

      // Render faces
      faces.forEach(face => {
        ctx.beginPath();
        ctx.moveTo(projVertices[face.indices[0]].x, projVertices[face.indices[0]].y);
        for (let i = 1; i < face.indices.length; i++) {
          ctx.lineTo(projVertices[face.indices[i]].x, projVertices[face.indices[i]].y);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(w/2 - 100, h/2 - 100, w/2 + 100, h/2 + 100);

        if (isDiamond) {
          // Glass prism rendering for apparel/accessories
          grad.addColorStop(0, `${color}88`); // Semi transparent
          grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.35)');
          grad.addColorStop(1, 'rgba(14, 165, 233, 0.2)');
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();

        } else if (isLaptop) {
          // Laptop rendering
          if (face.name === 'laptop_screen_lid') {
            grad.addColorStop(0, color);
            grad.addColorStop(0.5, '#475569');
            grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.stroke();

            // Draw glowing laptop screen (only if facing frontwards)
            if (face.depth < 0) {
              ctx.beginPath();
              ctx.moveTo(projScreen[0].x, projScreen[0].y);
              ctx.lineTo(projScreen[1].x, projScreen[1].y);
              ctx.lineTo(projScreen[2].x, projScreen[2].y);
              ctx.lineTo(projScreen[3].x, projScreen[3].y);
              ctx.closePath();

              const screenGrad = ctx.createLinearGradient(projScreen[0].x, projScreen[0].y, projScreen[2].x, projScreen[2].y);
              screenGrad.addColorStop(0, '#3b82f6');
              screenGrad.addColorStop(0.5, '#8b5cf6');
              screenGrad.addColorStop(1, '#ec4899');
              ctx.fillStyle = screenGrad;
              ctx.fill();

              // Screen text
              ctx.fillStyle = '#ffffff';
              ctx.font = `bold ${Math.max(10 * zoom, 7)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText("NOVAMARQUET-AI", (projScreen[0].x + projScreen[1].x)/2, (projScreen[0].y + projScreen[2].y)/2 - 10*zoom);
              
              ctx.font = `${Math.max(7 * zoom, 5)}px sans-serif`;
              ctx.fillText("Laptop Pro Virtual 3D", (projScreen[0].x + projScreen[1].x)/2, (projScreen[0].y + projScreen[2].y)/2 + 5*zoom);
            }
          } else if (face.name === 'laptop_base') {
            // Draw aluminum laptop keyboard tray
            grad.addColorStop(0, '#1e293b');
            grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.stroke();

            // Trackpad
            if (face.depth < 0) {
              ctx.beginPath();
              ctx.moveTo(projKeyboard[0].x, projKeyboard[0].y);
              ctx.lineTo(projKeyboard[1].x, projKeyboard[1].y);
              ctx.lineTo(projKeyboard[2].x, projKeyboard[2].y);
              ctx.lineTo(projKeyboard[3].x, projKeyboard[3].y);
              ctx.closePath();
              ctx.fillStyle = '#334155';
              ctx.fill();
              ctx.strokeStyle = 'rgba(255,255,255,0.2)';
              ctx.stroke();

              // Drawing keyboard keys layout guidelines
              ctx.strokeStyle = 'rgba(255,255,255,0.06)';
              ctx.lineWidth = 1;
              const kbY = (projVertices[4].y + projVertices[6].y)/2 - 5*zoom;
              ctx.beginPath();
              // key grid mockups
              ctx.moveTo(projVertices[4].x + 10*zoom, kbY);
              ctx.lineTo(projVertices[5].x - 10*zoom, kbY);
              ctx.moveTo(projVertices[4].x + 15*zoom, kbY + 5*zoom);
              ctx.lineTo(projVertices[5].x - 15*zoom, kbY + 5*zoom);
              ctx.stroke();
            }
          }

        } else {
          // Standard Box Rendering (Phones / Consoles)
          if (face.name === 'back') {
            grad.addColorStop(0, color);
            grad.addColorStop(0.5, '#475569');
            grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad;
          } else if (face.name === 'front') {
            ctx.fillStyle = (category === 'consolas' || category === 'hogar') ? '#1e293b' : '#090d16';
          } else {
            grad.addColorStop(0, '#1e293b');
            grad.addColorStop(0.5, '#475569');
            grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad;
          }

          ctx.fill();
          ctx.strokeStyle = face.borderStyle;
          ctx.stroke();

          // Render glowing screen (smartphones/tablets only, consoles bypass this)
          if (face.name === 'front' && face.depth < 0 && category !== 'consolas' && category !== 'hogar') {
            ctx.beginPath();
            ctx.moveTo(projScreen[0].x, projScreen[0].y);
            ctx.lineTo(projScreen[1].x, projScreen[1].y);
            ctx.lineTo(projScreen[2].x, projScreen[2].y);
            ctx.lineTo(projScreen[3].x, projScreen[3].y);
            ctx.closePath();

            const screenGrad = ctx.createLinearGradient(projScreen[0].x, projScreen[0].y, projScreen[2].x, projScreen[2].y);
            screenGrad.addColorStop(0, '#0ea5e9');
            screenGrad.addColorStop(0.5, '#a855f7');
            screenGrad.addColorStop(1, '#6366f1');
            ctx.fillStyle = screenGrad;
            ctx.fill();

            // Mobile display labels
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(10 * zoom, 7)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText("NOVAMARQUET-AI", (projScreen[0].x + projScreen[1].x)/2, (projScreen[0].y + projScreen[2].y)/2 - 15*zoom);
            
            ctx.font = `${Math.max(8 * zoom, 6)}px sans-serif`;
            ctx.fillText("Active Intelligence 3D", (projScreen[0].x + projScreen[1].x)/2, (projScreen[0].y + projScreen[2].y)/2 + 2*zoom);
            
            ctx.font = `bold ${Math.max(16 * zoom, 12)}px sans-serif`;
            ctx.fillText("12:00", (projScreen[0].x + projScreen[1].x)/2, (projScreen[0].y + projScreen[2].y)/2 + 25*zoom);
            
            // Camera hole
            ctx.beginPath();
            ctx.arc((projScreen[0].x + projScreen[1].x) / 2, projScreen[0].y + 6*zoom, 3*zoom, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
          }

          // Console Interface drawing
          if (face.name === 'front' && face.depth < 0 && (category === 'consolas' || category === 'hogar')) {
            // Draw Blu-ray slot lines
            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo((projVertices[4].x + projVertices[5].x)/2 - 25*zoom, (projVertices[4].y + projVertices[7].y)/2);
            ctx.lineTo((projVertices[4].x + projVertices[5].x)/2 + 25*zoom, (projVertices[4].y + projVertices[7].y)/2);
            ctx.stroke();

            // Draw blue glowing power LED dot
            ctx.beginPath();
            ctx.arc((projVertices[4].x + projVertices[5].x)/2 - 35*zoom, (projVertices[4].y + projVertices[7].y)/2, 2.5*zoom, 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4'; // Cyan led glow
            ctx.fill();
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 10;
          }

          // Render back cameras
          if (face.name === 'back' && face.depth < 0 && category !== 'consolas' && category !== 'hogar') {
            projCam.forEach(cam => {
              ctx.beginPath();
              ctx.arc(cam.x, cam.y, 8*zoom, 0, Math.PI * 2);
              ctx.fillStyle = '#1e293b';
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(cam.x, cam.y, 5*zoom, 0, Math.PI * 2);
              ctx.fillStyle = '#020617';
              ctx.fill();

              ctx.beginPath();
              ctx.arc(cam.x - 2*zoom, cam.y - 2*zoom, 1.5*zoom, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
            });
          }
        }
      });

      // Handle self rotating animations
      if (autoRotate) {
        setRotation(prev => ({
          x: prev.x,
          y: prev.y + 0.005
        }));
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [rotation, zoom, autoRotate, color, category]);

  // Icon selector HUD
  const getCategoryIconHud = () => {
    switch (category) {
      case 'laptops':
        return <Laptop size={12} className="animate-bounce" />;
      case 'consolas':
      case 'accesorios':
        return <Gamepad2 size={12} className="animate-bounce" />;
      case 'hombre':
      case 'mujer':
        return <Award size={12} className="animate-bounce" />;
      default:
        return <Smartphone size={12} className="animate-bounce" />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      
      {/* Lights backdrop */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

      {/* Header HUD */}
      <div className="w-full flex justify-between items-center mb-4 z-10">
        <div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 uppercase tracking-widest flex items-center gap-1.5">
            {getCategoryIconHud()} Vista Virtual 3D
          </span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1 max-w-[180px] sm:max-w-xs truncate" title={productName}>{productName}</h3>
        </div>
        
        {/* Toggle rotation */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
            autoRotate
              ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
              : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-dark-700 hover:bg-slate-200 dark:hover:bg-dark-700'
          }`}
        >
          <Rotate3d size={14} className={autoRotate ? "animate-spin" : ""} />
          {autoRotate ? 'Giro Activo' : 'Girar Auto'}
        </button>
      </div>

      {/* Drag Canvas */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className="w-full cursor-grab active:cursor-grabbing border border-slate-100 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/40 rounded-2xl relative select-none overflow-hidden touch-none"
      >
        <canvas ref={canvasRef} className="block mx-auto" />
        
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-405 pointer-events-none flex items-center gap-1">
          <Rotate3d size={10} /> Arrastra para rotar en 3D
        </div>
      </div>

      {/* Toolbar controls HUD */}
      <div className="flex gap-3 mt-4 z-10">
        <button
          onClick={() => handleZoom(0.15)}
          title="Acercar Zoom"
          className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 transition-all active:scale-90"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => handleZoom(-0.15)}
          title="Alejar Zoom"
          className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 transition-all active:scale-90"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={resetView}
          title="Restaurar Cámara"
          className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 transition-all active:scale-90 flex items-center gap-1 text-xs"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
};

export default Virtual360Viewer;
