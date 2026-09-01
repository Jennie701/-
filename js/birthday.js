/**
 * birthday.js - 吹蜡烛 / 许愿交互
 *
 * 流程：
 *   1. 显示 "20" 大数字
 *   2. 显示蛋糕和蜡烛（蜡烛带火焰动画）
 *   3. 依次显示提示文案
 *   4. 用户点击/触摸蜡烛 → 火焰熄灭 → 烟雾上升
 *   5. 所有蜡烛熄灭后 → 显示许愿文案 + 星光粒子
 */

var BirthdayModule = (function() {

  var config = null;
  var candles = [];
  var allOut = false;
  var observer = null;

  function init() {
    config = (window.CONTENT_MAP && window.CONTENT_MAP.CANDLE_CONFIG) || {
      number: 20,
      prompts: ['认真许愿。', '不能偷看。', '你许完了吗？', '行了行了，吹吧。'],
      afterBlow: ['愿望会实现的。', '20岁，要每天开心。']
    };

    // 设置年龄数字
    var age = window.LunarModule ? LunarModule.getAge() : 20;
    var numberEl = document.getElementById('candle-number');
    if (numberEl) {
      numberEl.textContent = age;
    }

    // 生成蜡烛（2支代表20岁）
    createCandles();

    // 初始化观察器
    observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          startSequence();
        }
      });
    }, { threshold: 0.4 });

    var partEl = document.getElementById('part-03');
    if (partEl) {
      observer.observe(partEl);
    }
  }

  // ========== 创建蜡烛 ==========
  function createCandles() {
    var row = document.getElementById('candles-row');
    if (!row) return;

    row.innerHTML = '';

    // 创建 2 支蜡烛（代表 "2" 和 "0"）
    var count = 2;
    for (var i = 0; i < count; i++) {
      var candle = document.createElement('div');
      candle.className = 'candle';
      candle.dataset.index = i;

      var flame = document.createElement('div');
      flame.className = 'candle-flame';
      candle.appendChild(flame);

      var smoke = document.createElement('div');
      smoke.className = 'candle-smoke';
      candle.appendChild(smoke);

      // 点击/触摸吹灭
      candle.addEventListener('click', function() {
        blowCandle(this);
      });
      candle.addEventListener('touchend', function(e) {
        e.preventDefault();
        blowCandle(this);
      });

      row.appendChild(candle);
      candles.push(candle);
    }
  }

  // ========== 吹灭蜡烛 ==========
  function blowCandle(candle) {
    if (candle.classList.contains('out')) return;

    candle.classList.add('out');

    // 检查是否全部熄灭
    var allCandlesOut = candles.every(function(c) {
      return c.classList.contains('out');
    });

    if (allCandlesOut && !allOut) {
      allOut = true;
      onAllCandlesOut();
    } else if (!allOut) {
      // 还有蜡烛没灭，更新提示
      showPrompt(3); // "行了行了，吹吧。"
    }
  }

  // ========== 全部熄灭后 ==========
  function onAllCandlesOut() {
    // 隐藏提示
    var promptEl = document.getElementById('candle-prompt');
    if (promptEl) {
      promptEl.classList.remove('visible');
    }

    // 延迟显示祝福
    setTimeout(function() {
      var afterEl = document.getElementById('candle-after');
      if (afterEl && config.afterBlow) {
        afterEl.innerHTML = '';
        config.afterBlow.forEach(function(text, index) {
          var p = document.createElement('p');
          p.textContent = text;
          p.style.opacity = '0';
          p.style.transition = 'opacity 1s var(--ease-out) ' + (index * 0.8) + 's';
          afterEl.appendChild(p);

          setTimeout(function() {
            p.style.opacity = '1';
          }, 100);
        });

        afterEl.classList.add('visible');
      }

      // 释放星光粒子
      createWishParticles();

      // 发射烟花庆祝
      if (window.FireworksEngine) {
        FireworksEngine.burst(3);
      }
    }, 800);
  }

  // ========== 星光粒子 ==========
  function createWishParticles() {
    var scene = document.getElementById('candle-scene');
    if (!scene) return;

    var count = 20;
    for (var i = 0; i < count; i++) {
      var particle = document.createElement('div');
      particle.className = 'wish-particle';
      particle.style.left = (40 + Math.random() * 20) + '%';
      particle.style.top = '50%';

      var tx = (Math.random() - 0.5) * 200;
      var ty = -80 - Math.random() * 120;
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.setProperty('--ty', ty + 'px');
      particle.style.animationDelay = (i * 0.1) + 's';

      scene.appendChild(particle);

      // 清理
      setTimeout(function(p) {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 2500, particle);
    }
  }

  // ========== 提示文案序列 ==========
  var promptIndex = 0;
  var promptTimer = null;

  function startSequence() {
    if (promptTimer) return; // 已经启动

    // 显示数字
    var numberEl = document.getElementById('candle-number');
    if (numberEl) {
      numberEl.classList.add('visible');
    }

    // 依次显示提示
    setTimeout(function() {
      showNextPrompt();
    }, 1500);
  }

  function showNextPrompt() {
    if (promptIndex >= config.prompts.length) {
      // 所有提示显示完毕，等待用户吹蜡烛
      return;
    }

    if (allOut) return;

    showPrompt(promptIndex);
    promptIndex++;

    promptTimer = setTimeout(showNextPrompt, 2500);
  }

  function showPrompt(index) {
    if (allOut) return;

    var promptEl = document.getElementById('candle-prompt');
    if (!promptEl || !config.prompts[index]) return;

    promptEl.classList.remove('visible');

    setTimeout(function() {
      promptEl.textContent = config.prompts[index];
      promptEl.classList.add('visible');
    }, 300);
  }

  return {
    init: init
  };

})();

if (typeof window !== 'undefined') {
  window.BirthdayModule = BirthdayModule;
}
