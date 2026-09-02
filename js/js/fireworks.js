/**
 * fireworks.js - Canvas 烟花引擎
 *
 * 自实现的粒子烟花系统，参考 GitHub 上常见的 canvas fireworks 实现模式。
 * 纯手写，无第三方依赖。
 *
 * 特性：
 *   - 火箭升空 → 爆炸 → 粒子扩散 → 重力下落 → 渐隐
 *   - 自动检测移动端，降低粒子数量
 *   - 多种爆炸形态（球形、环形、心形）
 *   - 可控的启动/停止
 */

var FireworksEngine = (function() {

  var canvas, ctx;
  var width, height;
  var fireworks = [];
  var particles = [];
  var animationId = null;
  var isRunning = false;
  var isMobile = false;
  var maxFireworks = 3;
  var maxParticlesPerBurst = 80;
  var launchInterval = 1200; // ms
  var lastLaunch = 0;
  var fps = 60;
  var frameCount = 0;
  var lastFpsTime = 0;

  // 烟花颜色调色板（浪漫温柔系）
  var colorPalettes = [
    ['#ff6b9d', '#ffc5d9', '#ff9ebb', '#ffd6e7'],          // 粉色系
    ['#ffd700', '#ffec8b', '#ffdab9', '#fff8dc'],          // 金色系
    ['#e8b4b8', '#c97b85', '#f5c2c7', '#e8a0a8'],          // 玫瑰系
    ['#a8c8e8', '#b0d4f1', '#87ceeb', '#c6e2ff'],          // 淡蓝系
    ['#dda0dd', '#e6b8d4', '#c8a2c8', '#d4b5d4'],          // 淡紫系
    ['#ffb347', '#ffd700', '#ffa500', '#ffcc66'],          // 暖橙系
    ['#98fb98', '#90ee90', '#b0e0e6', '#a8e6a3'],          // 薄荷系
    ['#fff', '#fffacd', '#ffeedd', '#fffaea'],             // 白色暖光
  ];

  // ========== 火箭类 ==========
  class Firework {
    constructor(targetX, targetY) {
      this.x = targetX;
      this.y = height;
      this.targetX = targetX;
      this.targetY = targetY;
      this.speed = 2 + Math.random() * 2;
      this.angle = Math.atan2(targetY - this.y, targetX - this.x);
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.trail = [];
      this.maxTrail = 8;
      this.exploded = false;
      this.palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
      this.shape = Math.random() < 0.15 ? 'heart' : (Math.random() < 0.3 ? 'ring' : 'sphere');
    }

    update() {
      if (this.exploded) return;

      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.maxTrail) {
        this.trail.shift();
      }

      this.x += this.vx;
      this.y += this.vy;

      // 到达目标高度时爆炸
      var distToTarget = Math.sqrt(
        Math.pow(this.targetX - this.x, 2) +
        Math.pow(this.targetY - this.y, 2)
      );

      if (distToTarget < 10 || this.vy >= 0) {
        this.explode();
        this.exploded = true;
      }
    }

    draw() {
      if (this.exploded) return;

      // 尾迹
      for (var i = 0; i < this.trail.length; i++) {
        var alpha = i / this.trail.length;
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 240, 200, ' + (alpha * 0.8) + ')';
        ctx.fill();
      }

      // 火箭头
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ffd700';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    explode() {
      var count = isMobile ? 40 : maxParticlesPerBurst;
      var color = this.palette[Math.floor(Math.random() * this.palette.length)];

      if (this.shape === 'heart') {
        this.explodeHeart(count);
      } else if (this.shape === 'ring') {
        this.explodeRing(count);
      } else {
        this.explodeSphere(count);
      }
    }

    explodeSphere(count) {
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 * i) / count;
        var speed = 1 + Math.random() * 4;
        var color = this.palette[Math.floor(Math.random() * this.palette.length)];
        particles.push(new Particle(this.x, this.y, angle, speed, color));
      }
    }

    explodeRing(count) {
      var speed = 3 + Math.random() * 2;
      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 * i) / count;
        var color = this.palette[Math.floor(Math.random() * this.palette.length)];
        particles.push(new Particle(this.x, this.y, angle, speed + Math.random() * 0.5, color));
      }
    }

    explodeHeart(count) {
      // 心形参数方程
      for (var i = 0; i < count; i++) {
        var t = (Math.PI * 2 * i) / count;
        var heartX = 16 * Math.pow(Math.sin(t), 3);
        var heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        var angle = Math.atan2(heartY, heartX);
        var speed = Math.sqrt(heartX * heartX + heartY * heartY) * 0.25;
        var color = this.palette[Math.floor(Math.random() * this.palette.length)];
        particles.push(new Particle(this.x, this.y, angle, speed, color));
      }
    }
  }

  // ========== 粒子类 ==========
  class Particle {
    constructor(x, y, angle, speed, color) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.color = color;
      this.alpha = 1;
      this.decay = 0.006 + Math.random() * 0.01;
      this.size = 2 + Math.random() * 2;
      this.gravity = 0.03;
      this.friction = 0.985;
      this.trail = [];
      this.maxTrail = 5;
    }

    update() {
      this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
      if (this.trail.length > this.maxTrail) {
        this.trail.shift();
      }

      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw() {
      // 尾迹
      for (var i = 0; i < this.trail.length; i++) {
        var t = this.trail[i];
        ctx.beginPath();
        ctx.arc(t.x, t.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = this.colorWithAlpha(t.alpha * 0.4);
        ctx.fill();
      }

      // 粒子本体
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.colorWithAlpha(this.alpha);
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    colorWithAlpha(alpha) {
      // 将 hex 转为 rgba
      var hex = this.color.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      var r = parseInt(hex.substr(0, 2), 16);
      var g = parseInt(hex.substr(2, 2), 16);
      var b = parseInt(hex.substr(4, 2), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + Math.max(0, alpha) + ')';
    }

    isDead() {
      return this.alpha <= 0;
    }
  }

  // ========== 引擎方法 ==========
  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    detectMobile();
    resize();
    window.addEventListener('resize', resize);
  }

  function detectMobile() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth < 768;
    if (isMobile) {
      maxFireworks = 2;
      maxParticlesPerBurst = 40;
      launchInterval = 1800;
    }
  }

  function resize() {
    var parent = canvas.parentElement;
    width = parent ? parent.offsetWidth : window.innerWidth;
    height = parent ? parent.offsetHeight : window.innerHeight;
    if (width === 0) width = window.innerWidth;
    if (height === 0) height = window.innerHeight;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function launchFirework() {
    if (fireworks.length >= maxFireworks) return;

    var targetX = width * 0.2 + Math.random() * width * 0.6;
    var targetY = height * 0.15 + Math.random() * height * 0.35;
    fireworks.push(new Firework(targetX, targetY));
  }

  function animate(timestamp) {
    if (!isRunning) return;

    // FPS 检测（降级用）
    frameCount++;
    if (timestamp - lastFpsTime > 1000) {
      fps = frameCount;
      frameCount = 0;
      lastFpsTime = timestamp;
      // 如果 FPS 过低，进一步降低粒子
      if (fps < 30 && maxParticlesPerBurst > 30) {
        maxParticlesPerBurst -= 10;
      }
    }

    // 自动发射烟花
    if (timestamp - lastLaunch > launchInterval) {
      launchFirework();
      lastLaunch = timestamp;
    }

    // 半透明覆盖（拖尾效果）
    ctx.fillStyle = 'rgba(5, 5, 8, 0.15)';
    ctx.fillRect(0, 0, width, height);

    // 更新和绘制烟花
    var i;
    for (i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      fireworks[i].draw();
      if (fireworks[i].exploded) {
        fireworks.splice(i, 1);
      }
    }

    // 更新和绘制粒子
    for (i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    resize(); // 确保画布尺寸正确
    lastFpsTime = performance.now();
    lastLaunch = 0; // 立即发射第一枚
    animationId = requestAnimationFrame(animate);
  }

  function stop() {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function burst(count) {
    // 一次性发射多枚（用于特殊时刻）
    var n = count || 3;
    for (var i = 0; i < n; i++) {
      setTimeout(function() {
        launchFirework();
      }, i * 200);
    }
  }

  function clear() {
    fireworks = [];
    particles = [];
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
  }

  return {
    init: init,
    start: start,
    stop: stop,
    burst: burst,
    clear: clear,
    isRunning: function() { return isRunning; },
    isMobile: function() { return isMobile; }
  };

})();

if (typeof window !== 'undefined') {
  window.FireworksEngine = FireworksEngine;
}
