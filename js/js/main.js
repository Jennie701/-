/**
 * main.js - 主逻辑 / 章节导航 / 模块协调
 *
 * 职责：
 *   - Loading screen 管理
 *   - PART 01 开场文案序列
 *   - 烟花启动/停止
 *   - 滚动导航 / 进度条 / 导航点
 *   - 章节可见性追踪
 *   - 生日模式检测与标识
 *   - 初始化所有模块
 *   - 手动测试入口
 */

var MainApp = (function() {

  var currentPart = 0;
  var openingPlayed = false;
  var isBirthdayMode = false;
  var partElements = [];
  var navDots = [];

  function init() {
    // 初始化农历模块（其他模块依赖它）
    if (window.LunarModule) LunarModule.init();

    // 收集 PART 元素
    partElements = [
      document.getElementById('part-01'),
      document.getElementById('part-02'),
      document.getElementById('part-03'),
      document.getElementById('part-04'),
      document.getElementById('part-05')
    ].filter(Boolean);

    // 收集导航点
    navDots = Array.from(document.querySelectorAll('.nav-dot'));

    // 检测生日模式
    checkBirthdayMode();

    // 渲染回忆引导文案
    renderMemoriesIntro();

    // 初始化各模块
    if (window.PhotosModule) PhotosModule.init();
    if (window.MusicPlayer) MusicPlayer.init();
    if (window.BirthdayModule) BirthdayModule.init();
    if (window.InteractionsModule) InteractionsModule.init();

    // 设置导航
    setupNavigation();
    setupScrollListener();

    // 设置测试按钮
    setupTestButton();

    // 烟花引擎初始化
    if (window.FireworksEngine) {
      FireworksEngine.init('fireworks-canvas');
    }

    // 隐藏 loading screen，开始开场
    // 用 DOMContentLoaded + 超时兜底，避免大图片阻塞 load 事件导致卡在加载界面
    function tryStart() {
      if (!openingPlayed) {
        hideLoadingScreen();
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(tryStart, 600);
      });
    } else {
      setTimeout(tryStart, 600);
    }
    // 超时兜底：最多等 3 秒
    setTimeout(tryStart, 3000);
  }

  // ========== Loading Screen ==========
  function hideLoadingScreen() {
    var loader = document.getElementById('loading-screen');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(function() {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 800);
    }

    if (!openingPlayed) {
      startOpeningSequence();
    }
  }

  // ========== PART 01 开场序列（交互式输入版） ==========
  function startOpeningSequence() {
    openingPlayed = true;
    var container = document.getElementById('opening-sequence');
    if (!container) return;

    var sequence = (window.CONTENT_MAP && window.CONTENT_MAP.OPENING_SEQUENCE) || [];
    var inputConfig = (window.CONTENT_MAP && window.CONTENT_MAP.OPENING_INPUT) || {};
    var age = window.LunarModule ? LunarModule.getAge() : 20;

    // 第一步：显示 "正在寻找一个特别的人……"
    var firstItem = sequence[0];
    setTimeout(function() {
      var el = document.createElement('p');
      el.className = 'opening-text';
      el.textContent = firstItem.text;
      el.style.setProperty('--dur', (firstItem.duration / 1000) + 's');
      container.appendChild(el);

      requestAnimationFrame(function() {
        el.classList.add('visible');
      });

      // 第二步：显示输入对话框
      setTimeout(function() {
        showInputDialog(container, sequence, inputConfig, age);
      }, 2000);
    }, firstItem.delay);
  }

  // ========== 显示输入对话框 ==========
  function showInputDialog(container, sequence, inputConfig, age) {
    var box = document.createElement('div');
    box.className = 'opening-input-box';

    var label = document.createElement('div');
    label.className = 'opening-input-label';
    label.textContent = inputConfig.prompt || '请输入你的姓名';

    var wrapper = document.createElement('div');
    wrapper.className = 'opening-input-wrapper';

    var input = document.createElement('input');
    input.className = 'opening-input-field';
    input.type = 'text';
    input.placeholder = inputConfig.placeholder || '在这里输入名字…';
    input.setAttribute('autocomplete', 'off');

    var btn = document.createElement('button');
    btn.className = 'opening-input-btn';
    btn.textContent = inputConfig.buttonText || '确认';

    var hint = document.createElement('div');
    hint.className = 'opening-input-hint';

    wrapper.appendChild(input);
    wrapper.appendChild(btn);
    box.appendChild(label);
    box.appendChild(wrapper);
    box.appendChild(hint);
    container.appendChild(box);

    requestAnimationFrame(function() {
      box.classList.add('show');
      setTimeout(function() { input.focus(); }, 400);
    });

    var attemptCount = 0;

    function checkInput() {
      var value = input.value.trim();
      var expected = inputConfig.expectedAnswer || '张婧';

      if (value === expected) {
        // 正确！
        box.classList.add('correct');
        hint.textContent = '';
        hint.className = 'opening-input-hint';

        // 淡出输入框
        setTimeout(function() {
          if (box.parentNode) box.parentNode.removeChild(box);
        }, 800);

        // 显示 "找到了。"
        var foundItem = sequence[1];
        setTimeout(function() {
          var foundEl = document.createElement('p');
          foundEl.className = 'opening-text';
          foundEl.textContent = foundItem.text;
          foundEl.style.setProperty('--dur', (foundItem.duration / 1000) + 's');
          foundEl.style.fontSize = '1.6rem';
          foundEl.style.color = 'var(--gold-light)';
          container.appendChild(foundEl);

          requestAnimationFrame(function() {
            foundEl.classList.add('visible');
          });

          // 启动烟花
          setTimeout(function() {
            startFireworks();
          }, 800);

          // 显示祝福语
          var greetingItem = sequence[2];
          setTimeout(function() {
            var greetingEl = document.createElement('p');
            greetingEl.className = 'opening-greeting';
            greetingEl.textContent = greetingItem.text;
            greetingEl.style.setProperty('--dur', (greetingItem.duration / 1000) + 's');
            container.appendChild(greetingEl);

            requestAnimationFrame(function() {
              greetingEl.classList.add('visible');
            });

            // 播放生日歌
            if (window.MusicPlayer && window.MusicPlayer.playBirthday) {
              window.MusicPlayer.playBirthday();
            }

            // 显示仙女照片
            var openingPhoto = (window.CONTENT_MAP && window.CONTENT_MAP.OPENING_PHOTO) || '';
            if (openingPhoto) {
              setTimeout(function() {
                var photoWrap = document.createElement('div');
                photoWrap.style.cssText = 'margin: 2rem auto 0; max-width: 320px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(232,180,184,0.3), 0 4px 16px rgba(0,0,0,0.2); opacity: 0; transform: translateY(30px) scale(0.9); transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);';

                var img = document.createElement('img');
                img.src = encodeURI(openingPhoto);
                img.style.cssText = 'width: 100%; display: block; border-radius: 16px;';
                img.onload = function() {
                  requestAnimationFrame(function() {
                    photoWrap.style.opacity = '1';
                    photoWrap.style.transform = 'translateY(0) scale(1)';
                  });
                };
                img.onerror = function() {
                  if (photoWrap.parentNode) photoWrap.parentNode.removeChild(photoWrap);
                };

                photoWrap.appendChild(img);
                container.appendChild(photoWrap);
              }, 1500);
            }
          }, greetingItem.delay);

        }, foundItem.delay);

      } else {
        // 错误
        attemptCount++;
        box.classList.add('shake');
        setTimeout(function() {
          box.classList.remove('shake');
        }, 400);

        input.value = '';
        input.focus();

        hint.className = 'opening-input-hint show wrong';

        if (attemptCount >= 3) {
          hint.textContent = '小提示：她是这个网站的主角哦 ✨';
        } else if (attemptCount >= 2) {
          hint.textContent = inputConfig.hintAlmost || '接近了！再想想？';
        } else {
          hint.textContent = inputConfig.hintWrong || '嗯？不对哦，再试试？';
        }
      }
    }

    // 按钮点击
    btn.addEventListener('click', checkInput);

    // 回车提交
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkInput();
      }
    });
  }

  // ========== 烟花启动 ==========
  function startFireworks() {
    var glow = document.getElementById('fireworks-glow');
    var opening = document.querySelector('.part-opening');

    if (glow) glow.classList.add('active');
    if (opening) opening.classList.add('fireworks-active');

    if (window.FireworksEngine) {
      FireworksEngine.start();
      FireworksEngine.burst(3);
    }

    var hint = document.getElementById('scroll-hint');
    if (hint) {
      hint.style.animation = 'scrollHintAppear 1s var(--ease-out) 1s forwards';
    }
  }

  // ========== PART 02 回忆引导文案 ==========
  function renderMemoriesIntro() {
    var container = document.getElementById('memories-intro');
    if (!container) return;

    var introTexts = (window.CONTENT_MAP && window.CONTENT_MAP.MEMORIES_INTRO) || [];
    var introObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          introObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    introTexts.forEach(function(item, index) {
      var el = document.createElement(item.isHighlight ? 'div' : 'p');
      el.className = item.isHighlight ? 'memories-intro-highlight' : 'memories-intro-text';
      el.textContent = item.text;
      el.style.transitionDelay = (index * 0.3) + 's';
      container.appendChild(el);
      introObserver.observe(el);
    });
  }

  // ========== 生日模式检测 ==========
  function checkBirthdayMode() {
    if (!window.LunarModule) return;

    var info = LunarModule.getBirthdayInfo();
    isBirthdayMode = info.isBirthday;

    if (isBirthdayMode) {
      // 显示生日标识
      var badge = document.getElementById('birthday-badge');
      if (badge) {
        setTimeout(function() {
          badge.classList.add('visible');
        }, 2000);
      }
    }
  }

  // ========== 导航 ==========
  function setupNavigation() {
    navDots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        var target = document.getElementById(dot.dataset.target);
        if (target) {
          target.scrollInto({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ========== 滚动监听 ==========
  function setupScrollListener() {
    var progressBar = document.getElementById('progress-bar');
    var partLabels = document.querySelectorAll('.part-label');

    var scrollHandler = function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      // 更新进度条
      if (progressBar) {
        progressBar.style.width = progress + '%';
      }

      // 确定当前 PART
      var newPart = 0;
      for (var i = 0; i < partElements.length; i++) {
        var rect = partElements[i].getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4) {
          newPart = i;
        }
      }

      if (newPart !== currentPart) {
        currentPart = newPart;
        updateNavDots();
        updatePartLabels(newPart);
        handlePartTransition(newPart);
      }
    };

    // 节流
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          scrollHandler();
          ticking = false;
        });
        ticking = true;
      }
    });

    // 初始调用
    scrollHandler();
  }

  function updateNavDots() {
    navDots.forEach(function(dot, index) {
      dot.classList.toggle('active', index === currentPart);
    });
  }

  function updatePartLabels(partIndex) {
    var labels = document.querySelectorAll('.part-label');
    labels.forEach(function(label, index) {
      // 只显示非 PART 01 的标签（PART 01 有自己的开场）
      if (index === partIndex - 1 && partIndex > 0) {
        label.classList.add('visible');
      }
    });
  }

  function handlePartTransition(partIndex) {
    // 离开 PART 01 时停止烟花（节省性能）
    if (partIndex > 0 && window.FireworksEngine && FireworksEngine.isRunning()) {
      // 不完全停止，降低频率
      // FireworksEngine.stop();
    }

    // 进入 PART 03 时不做特殊处理（birthday.js 自己处理）
    // 进入 PART 05 时可以再次发射烟花
    if (partIndex === 4 && window.FireworksEngine) {
      if (!FireworksEngine.isRunning()) {
        // FireworksEngine.start();
      }
    }
  }

  // ========== 测试按钮 ==========
  function setupTestButton() {
    var btn = document.getElementById('test-mode-btn');
    if (!btn) return;

    var testModeActive = false;

    btn.addEventListener('click', function() {
      testModeActive = !testModeActive;

      if (testModeActive) {
        // 激活生日模式
        isBirthdayMode = true;
        var badge = document.getElementById('birthday-badge');
        if (badge) {
          badge.textContent = '🎂 生日模式（测试）';
          badge.classList.add('visible');
        }
        btn.textContent = '退出测试模式';

        // 启动烟花
        if (window.FireworksEngine && !FireworksEngine.isRunning()) {
          FireworksEngine.start();
          FireworksEngine.burst(3);
        }
      } else {
        // 退出测试模式
        isBirthdayMode = false;
        var badge = document.getElementById('birthday-badge');
        if (badge) {
          badge.classList.remove('visible');
        }
        btn.textContent = '🎂 测试生日模式';

        if (window.FireworksEngine && FireworksEngine.isRunning()) {
          FireworksEngine.stop();
        }
      }
    });
  }

  return {
    init: init
  };

})();

// ========== 启动 ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', MainApp.init);
} else {
  MainApp.init();
}
