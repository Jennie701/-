/**
 * photos.js - 照片懒加载与展示逻辑（增强版）
 *
 * 增强：
 *   - 照片视差滚动效果
 *   - 照片入场动画（从模糊到清晰）
 *   - 老照片装饰角标
 *   - 拍立得随机旋转和浮动
 *   - 相册网格错落进场
 */

var PhotosModule = (function() {

  var observer = null;
  var imageObserver = null;
  var parallaxElements = [];

  function init() {
    var stages = (window.CONTENT_MAP && window.CONTENT_MAP.STAGES) || [];

    initObservers();

    stages.forEach(function(stageData) {
      renderStage(stageData);
    });

    // 启动视差滚动
    setupParallax();
  }

  // ========== 观察器初始化 ==========
  function initObservers() {
    observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    }, { threshold: 0.1, rootMargin: '120px 0px' });
  }

  // ========== 视差滚动 ==========
  function setupParallax() {
    var parallaxItems = document.querySelectorAll('.photo-hero, .photo-fullscreen, .photo-hero-vintage');

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          parallaxItems.forEach(function(el) {
            var rect = el.getBoundingClientRect();
            var windowHeight = window.innerHeight;

            if (rect.top < windowHeight && rect.bottom > 0) {
              var center = rect.top + rect.height / 2;
              var offset = (center - windowHeight / 2) / windowHeight;
              var translateY = offset * -10;

              var img = el.querySelector('img');
              if (img && img.classList.contains('loaded')) {
                img.style.transform = 'translateY(' + translateY + 'px)';
              }
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ========== 渲染 Stage ==========
  function renderStage(stageData) {
    var stageEl = document.getElementById('stage-' + stageData.id);
    if (!stageEl) return;

    // 如果有互动元素，先渲染互动（在照片和文案之前）
    if (stageData.interactive) {
      renderInteractive(stageEl, stageData);
    }

    // 渲染文案
    if (stageData.texts && stageData.texts.length > 0) {
      stageData.texts.forEach(function(text, index) {
        var p = document.createElement('p');
        p.className = 'stage-text reveal';
        p.style.transitionDelay = Math.min(index * 0.12, 0.6) + 's';
        p.textContent = text;

        // 短句特殊样式
        if (text.length <= 6 && !text.includes('？') && !text.includes('。')) {
          p.style.fontSize = 'clamp(1.3rem, 4vw, 1.8rem)';
          p.style.fontWeight = '500';
          p.style.color = 'var(--rose-deep)';
          p.style.letterSpacing = '0.1em';
        }

        // 括号内容特殊处理
        if (text.includes('（') || text.includes('(')) {
          p.style.fontSize = 'clamp(0.9rem, 2.5vw, 1.1rem)';
          p.style.color = 'var(--text-muted)';
          p.style.fontStyle = 'italic';
        }

        stageEl.appendChild(p);
        observer.observe(p);
      });
    }

    // 渲染照片
    if (stageData.photos && stageData.photos.length > 0) {
      renderPhotos(stageEl, stageData);
    }
  }

  // ========== 渲染照片 ==========
  function renderPhotos(stageEl, stageData) {
    var photos = stageData.photos;

    if (stageData.id === 'daily' || stageData.id === 'beijing' || stageData.id === 'changzhou') {
      var wall = stageEl.querySelector('.polaroid-wall');
      if (!wall) {
        wall = document.createElement('div');
        wall.className = 'polaroid-wall';
        stageEl.appendChild(wall);
      }
      photos.forEach(function(photo, index) {
        var polaroid = createPolaroid(photo, index);
        wall.appendChild(polaroid);
        if (photo.isMain) {
          polaroid.style.width = '260px';
          polaroid.style.zIndex = '2';
        }
      });
    } else if (stageData.id === 'chengdu') {
      var grid = stageEl.querySelector('.gallery-grid');
      if (!grid) {
        grid = document.createElement('div');
        grid.className = 'gallery-grid';
        stageEl.appendChild(grid);
      }
      photos.forEach(function(photo, index) {
        var item = createGalleryItem(photo, index);
        grid.appendChild(item);
      });
    } else {
      // 检查是否有duo模式的照片
      var duoPhotos = photos.filter(function(p) {
        return p.displayMode === 'duo-left' || p.displayMode === 'duo-right';
      });
      var otherPhotos = photos.filter(function(p) {
        return p.displayMode !== 'duo-left' && p.displayMode !== 'duo-right';
      });

      // 先渲染普通照片
      otherPhotos.forEach(function(photo, index) {
        var wrapper = createPhotoWrapper(photo, index);
        stageEl.appendChild(wrapper);
      });

      // 再渲染duo合照（如果有）
      if (duoPhotos.length > 0) {
        var duoContainer = document.createElement('div');
        duoContainer.className = 'photo-duo-container reveal';
        duoContainer.style.transitionDelay = '0.3s';

        var leftPhoto = duoPhotos.find(function(p) { return p.displayMode === 'duo-left'; });
        var rightPhoto = duoPhotos.find(function(p) { return p.displayMode === 'duo-right'; });

        if (leftPhoto) {
          var leftEl = document.createElement('div');
          leftEl.className = 'photo-duo-left';
          leftEl.appendChild(createLazyImage(leftPhoto));
          if (leftPhoto.caption) {
            var cap = document.createElement('div');
            cap.className = 'photo-duo-caption';
            cap.textContent = leftPhoto.caption;
            leftEl.appendChild(cap);
          }
          duoContainer.appendChild(leftEl);
        }

        if (rightPhoto) {
          var rightEl = document.createElement('div');
          rightEl.className = 'photo-duo-right';
          rightEl.appendChild(createLazyImage(rightPhoto));
          if (rightPhoto.caption) {
            var cap2 = document.createElement('div');
            cap2.className = 'photo-duo-caption';
            cap2.textContent = rightPhoto.caption;
            rightEl.appendChild(cap2);
          }
          duoContainer.appendChild(rightEl);
        }

        stageEl.appendChild(duoContainer);
        observer.observe(duoContainer);
      }
    }
  }

  // ========== 渲染互动元素 ==========
  function renderInteractive(stageEl, stageData) {
    var config = stageData.interactive;
    if (!config || config.type !== 'guess') return;

    var container = document.createElement('div');
    container.className = 'childhood-interactive reveal';

    var question = document.createElement('div');
    question.className = 'guess-question';
    question.textContent = config.question;

    var subtext = document.createElement('div');
    subtext.className = 'guess-subtext';
    subtext.textContent = config.subtext;

    var options = document.createElement('div');
    options.className = 'guess-options';

    config.options.forEach(function(opt, index) {
      var btn = document.createElement('button');
      btn.className = 'guess-btn';
      btn.textContent = opt;

      btn.addEventListener('click', function() {
        if (index === config.correctIndex) {
          // 猜对了
          btn.classList.add('correct');
          container.classList.add('solved');
          container.querySelectorAll('.guess-btn').forEach(function(b) {
            b.disabled = true;
            if (b !== btn) b.classList.add('wrong');
          });

          // 显示揭示文字
          setTimeout(function() {
            var reveal = document.createElement('div');
            reveal.className = 'guess-reveal';
            reveal.textContent = config.revealText;
            container.appendChild(reveal);
            requestAnimationFrame(function() {
              reveal.classList.add('visible');
            });
          }, 600);

          // 触发小烟花
          if (window.FireworksEngine) {
            setTimeout(function() {
              FireworksEngine.burst(1);
            }, 400);
          }
        } else {
          // 猜错了
          btn.classList.add('wrong');
          btn.disabled = true;
        }
      });

      options.appendChild(btn);
    });

    container.appendChild(question);
    container.appendChild(subtext);
    container.appendChild(options);
    stageEl.appendChild(container);

    observer.observe(container);
  }

  // ========== 创建照片容器 ==========
  function createPhotoWrapper(photo, index) {
    var wrapper = document.createElement('div');
    var displayClass = getDisplayClass(photo.displayMode);
    wrapper.className = 'photo-wrapper reveal ' + displayClass;
    wrapper.style.transitionDelay = '0.2s';

    if (photo.displayMode === 'hero-vintage') {
      var frame = document.createElement('div');
      frame.className = 'photo-hero-vintage';

      // 老照片角落装饰
      var tl = document.createElement('div');
      tl.className = 'vintage-corner tl';
      var tr = document.createElement('div');
      tr.className = 'vintage-corner tr';
      var bl = document.createElement('div');
      bl.className = 'vintage-corner bl';
      var br = document.createElement('div');
      br.className = 'vintage-corner br';
      frame.appendChild(tl);
      frame.appendChild(tr);
      frame.appendChild(bl);
      frame.appendChild(br);

      var img = createLazyImage(photo);
      frame.appendChild(img);

      if (photo.caption) {
        var cap = document.createElement('div');
        cap.className = 'vintage-caption';
        cap.textContent = photo.caption;
        frame.appendChild(cap);
      }

      wrapper.innerHTML = '';
      wrapper.appendChild(frame);
    } else {
      var container = document.createElement('div');
      container.className = displayClass;

      var img = createLazyImage(photo);
      container.appendChild(img);

      wrapper.innerHTML = '';
      wrapper.appendChild(container);

      if (photo.caption) {
        var cap = document.createElement('p');
        cap.className = 'photo-caption reveal';
        cap.style.transitionDelay = '0.6s';
        cap.textContent = photo.caption;
        wrapper.appendChild(cap);
        observer.observe(cap);
      }
    }

    observer.observe(wrapper);
    return wrapper;
  }

  // ========== 创建拍立得 ==========
  function createPolaroid(photo, index) {
    var polaroid = document.createElement('div');
    polaroid.className = 'photo-polaroid reveal';
    polaroid.style.transitionDelay = (index * 0.15) + 's';

    // 随机旋转角度
    var rotations = ['-4deg', '-2deg', '1.5deg', '3deg', '-1.5deg', '2.5deg', '-3deg', '0.5deg'];
    var rot = rotations[index % rotations.length];
    polaroid.style.setProperty('--rot', rot);
    polaroid.style.transform = 'rotate(' + rot + ')';

    var img = createLazyImage(photo);
    polaroid.appendChild(img);

    if (photo.caption) {
      var date = document.createElement('div');
      date.className = 'polaroid-date';
      date.textContent = photo.caption;
      polaroid.appendChild(date);
    }

    observer.observe(polaroid);
    return polaroid;
  }

  // ========== 创建相册项 ==========
  function createGalleryItem(photo, index) {
    var item = document.createElement('div');
    item.className = 'gallery-item reveal';
    item.style.transitionDelay = (index * 0.12) + 's';

    var img = createLazyImage(photo);
    item.appendChild(img);

    observer.observe(item);
    return item;
  }

  // ========== 创建图片（直接加载，不用懒加载） ==========
  function createLazyImage(photo) {
    var img = document.createElement('img');
    img.className = 'lazy-img loaded';
    img.src = encodeURI(photo.image);
    img.alt = photo.caption || '';

    img.onerror = function() {
      img.style.display = 'none';
      var placeholder = createPlaceholder(photo);
      if (img.parentNode) {
        img.parentNode.appendChild(placeholder);
      }
    };

    return img;
  }

  // ========== 创建占位符 ==========
  function createPlaceholder(photo) {
    var div = document.createElement('div');
    div.className = 'photo-placeholder';
    div.style.cssText = 'padding:20px;background:rgba(232,180,184,0.1);border:2px dashed rgba(232,180,184,0.4);border-radius:12px;text-align:center;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;';

    var nameSpan = document.createElement('div');
    nameSpan.className = 'filename';
    nameSpan.style.cssText = 'font-size:14px;color:#e8848c;word-break:break-all;';
    nameSpan.textContent = '找不到: ' + photo.image;
    div.appendChild(nameSpan);

    return div;
  }

  function getDisplayClass(displayMode) {
    var map = {
      'hero': 'photo-hero',
      'hero-vintage': 'photo-hero-vintage',
      'fullscreen': 'photo-fullscreen',
      'normal': 'photo-normal',
      'polaroid': 'photo-polaroid',
      'gallery': 'gallery-item'
    };
    return map[displayMode] || 'photo-normal';
  }

  return {
    init: init
  };

})();

if (typeof window !== 'undefined') {
  window.PhotosModule = PhotosModule;
}
