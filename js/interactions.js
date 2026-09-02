/**
 * interactions.js - 聊天气泡 / 搞怪档案 / 生日信 / 未来 / 结尾动画
 *
 * 增强版：
 *   - 聊天序列加入打字指示器、连续消息合并、更自然的节奏
 *   - 生日信加入章节编号、闪回标签增强
 *   - 未来区域增强
 *   - 数字动画增强
 */

var InteractionsModule = (function() {

  var observer = null;
  var chatStarted = false;
  var numberAnimated = false;
  var endingStarted = false;

  function init() {
    observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          if (entry.target.id === 'stage-chat' && !chatStarted) {
            chatStarted = true;
            startChatSequence();
          }
          if (entry.target.id === 'number-animation' && !numberAnimated) {
            numberAnimated = true;
            startNumberAnimation();
          }
          if (entry.target.id === 'ending-texts' && !endingStarted) {
            endingStarted = true;
            startEndingSequence();
          }
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    setupChat();
    setupArchive();
    renderLetter();
    setupFuture();
    setupEnding();
  }

  // ========== 聊天气泡序列（增强版） ==========
  function setupChat() {
    var messages = (window.CONTENT_MAP && window.CONTENT_MAP.CHAT_MESSAGES) || [];
    var container = document.getElementById('chat-messages');
    if (!container) return;

    // 预创建气泡（隐藏状态）
    messages.forEach(function(msg, index) {
      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + msg.sender;
      bubble.textContent = msg.text;
      bubble.dataset.delay = msg.delay || 800;
      bubble.dataset.sender = msg.sender;
      bubble.dataset.index = index;
      container.appendChild(bubble);
    });

    var chatStage = document.getElementById('stage-chat');
    if (chatStage) {
      observer.observe(chatStage);
    }
  }

  function startChatSequence() {
    var bubbles = document.querySelectorAll('#chat-messages .chat-bubble');
    var container = document.getElementById('chat-messages');
    var cumulativeDelay = 0;

    bubbles.forEach(function(bubble, index) {
      var delay = parseInt(bubble.dataset.delay) || 800;
      cumulativeDelay += delay;

      var sender = bubble.dataset.sender;

      // 如果是张婧的回复，先显示打字指示器
      if (sender === 'zhangjing' && index > 0) {
        var typingEl = document.createElement('div');
        typingEl.className = 'chat-typing';
        typingEl.innerHTML = '<span></span><span></span><span></span>';

        setTimeout(function() {
          container.appendChild(typingEl);
          requestAnimationFrame(function() {
            typingEl.classList.add('show');
          });
        }, cumulativeDelay - delay + 200);

        // 1秒后移除打字指示器并显示消息
        setTimeout(function() {
          typingEl.classList.remove('show');
          setTimeout(function() {
            if (typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
          }, 300);
          bubble.classList.add('show');
        }, cumulativeDelay);
      } else {
        setTimeout(function() {
          bubble.classList.add('show');
        }, cumulativeDelay);
      }
    });

    // 显示结尾文案
    var lastDelay = cumulativeDelay + 1800;
    setTimeout(function() {
      var ending = document.getElementById('chat-ending');
      if (ending) {
        ending.classList.add('visible');
      }
    }, lastDelay);
  }

  // ========== 隐藏档案彩蛋 ==========
  function setupArchive() {
    var stages = (window.CONTENT_MAP && window.CONTENT_MAP.STAGES) || [];
    var archiveStage = stages.find(function(s) { return s.id === 'archive'; });
    if (!archiveStage) return;

    var itemsContainer = document.getElementById('archive-items');
    var header = document.getElementById('archive-header');
    if (!itemsContainer || !header) return;

    // 创建档案项
    archiveStage.photos.forEach(function(photo, index) {
      var item = document.createElement('div');
      item.className = 'archive-item';
      item.style.animationDelay = (index * 0.2) + 's';

      var number = document.createElement('div');
      number.className = 'archive-number';
      number.textContent = 'FILE #' + (photo.archiveNumber || '');

      var photoDiv = document.createElement('div');
      photoDiv.className = 'archive-photo';

      var img = document.createElement('img');
      img.className = 'lazy-img';
      img.src = encodeURI(photo.image);
      img.alt = photo.archiveTitle || '';
      img.onload = function() { img.classList.add('loaded'); };
      img.onerror = function() {
        var ph = document.createElement('div');
        ph.className = 'photo-placeholder';
        var fn = document.createElement('div');
        fn.className = 'filename';
        fn.textContent = photo.image.split('/').pop();
        ph.appendChild(fn);
        photoDiv.replaceChild(ph, img);
      };
      photoDiv.appendChild(img);

      var label = document.createElement('div');
      label.className = 'archive-label';
      label.textContent = photo.archiveTitle || '';

      item.appendChild(number);
      item.appendChild(photoDiv);
      item.appendChild(label);
      itemsContainer.appendChild(item);
    });

    // 档案文案
    if (archiveStage.texts) {
      archiveStage.texts.forEach(function(text, index) {
        var p = document.createElement('p');
        p.className = 'stage-text reveal';
        p.style.transitionDelay = (0.3 + index * 0.15) + 's';
        if (text.includes('（')) {
          p.style.fontSize = 'clamp(0.9rem, 2.5vw, 1.1rem)';
          p.style.color = 'var(--text-muted)';
          p.style.fontStyle = 'italic';
        }
        p.textContent = text;
        itemsContainer.appendChild(p);
        observer.observe(p);
      });
    }

    // 点击揭开/收起
    header.addEventListener('click', function() {
      itemsContainer.classList.toggle('revealed');
      var hint = header.querySelector('.archive-click-hint');
      if (hint) {
        hint.textContent = itemsContainer.classList.contains('revealed')
          ? '点击收起 ↑'
          : '点击查看 →';
      }
    });
  }

  // ========== 生日信渲染（增强版） ==========
  function renderLetter() {
    var chapters = (window.CONTENT_MAP && window.CONTENT_MAP.LETTER_CHAPTERS) || [];
    var container = document.getElementById('letter-chapters');
    if (!container) return;

    var romanNumerals = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'];

    chapters.forEach(function(chapter, chapterIndex) {
      var chapterDiv = document.createElement('div');
      chapterDiv.className = 'letter-chapter';
      chapterDiv.dataset.chapterNum = romanNumerals[chapterIndex] || (chapterIndex + 1);

      // 章节文案
      chapter.lines.forEach(function(line, lineIndex) {
        var p = document.createElement('p');
        p.className = 'letter-chapter-line';
        p.style.transitionDelay = (lineIndex * 0.15) + 's';

        if (chapter.isChatStyle) {
          p.style.fontFamily = 'var(--font-sans)';
          p.style.color = 'var(--rose-deep)';
          p.style.fontWeight = '500';
          p.style.fontSize = 'clamp(1rem, 2.5vw, 1.2rem)';
          p.style.background = 'rgba(232, 180, 184, 0.08)';
          p.style.padding = '12px 20px';
          p.style.borderRadius = '12px';
          p.style.borderLeft = '3px solid var(--rose)';
          p.style.marginBottom = '12px';
          p.style.textIndent = '0';
        }

        p.textContent = line;
        chapterDiv.appendChild(p);
      });

      // 闪回标签
      if (chapter.flashbacks) {
        var flashbackDiv = document.createElement('div');
        flashbackDiv.className = 'letter-flashback';

        chapter.flashbacks.forEach(function(tag, index) {
          var tagSpan = document.createElement('span');
          tagSpan.className = 'letter-flashback-tag';
          tagSpan.textContent = tag;
          tagSpan.style.transitionDelay = (index * 0.08) + 's';
          flashbackDiv.appendChild(tagSpan);

          var tagObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                tagObserver.unobserve(entry.target);
              }
            });
          }, { threshold: 0.3 });
          tagObserver.observe(tagSpan);
        });

        chapterDiv.appendChild(flashbackDiv);
      }

      // 彩蛋
      if (chapter.easterEgg) {
        var egg = document.createElement('div');
        egg.className = 'letter-easter-egg';

        var title = document.createElement('div');
        title.className = 'title';
        title.textContent = chapter.easterEgg.title;

        var icon = document.createElement('div');
        icon.className = 'icon';
        icon.textContent = chapter.easterEgg.icon;

        var text = document.createElement('div');
        text.className = 'text';
        text.textContent = chapter.easterEgg.text;

        egg.appendChild(title);
        egg.appendChild(icon);
        egg.appendChild(text);
        chapterDiv.appendChild(egg);
      }

      // 最终句
      if (chapter.finalLine) {
        var finalP = document.createElement('p');
        finalP.className = 'letter-final-line';
        finalP.textContent = chapter.finalLine;
        chapterDiv.appendChild(finalP);
      }

      container.appendChild(chapterDiv);
      observer.observe(chapterDiv);
    });
  }

  // ========== 未来引导 ==========
  function setupFuture() {
    var introTexts = (window.CONTENT_MAP && window.CONTENT_MAP.FUTURE_INTRO_TEXTS) || [];
    var container = document.getElementById('future-intro');
    if (!container) return;

    introTexts.forEach(function(text, index) {
      var p = document.createElement('p');
      p.style.transitionDelay = (index * 0.4) + 's';
      if (index === introTexts.length - 1) {
        p.style.fontStyle = 'italic';
        p.style.color = 'var(--gold-light)';
        p.style.marginTop = '24px';
      }
      p.textContent = text;
      container.appendChild(p);
      observer.observe(p);
    });

    observer.observe(container);
  }

  // ========== 19 → 20 数字动画 ==========
  function setupEnding() {
    var endingConfig = (window.CONTENT_MAP && window.CONTENT_MAP.ENDING_CONFIG) || {};
    var texts = endingConfig.texts || [];
    var container = document.getElementById('ending-texts');
    if (!container) return;

    var fromEl = document.getElementById('number-from');
    var toEl = document.getElementById('number-to');
    if (fromEl) fromEl.textContent = endingConfig.numberFrom || 19;
    if (toEl) toEl.textContent = endingConfig.numberTo || 20;

    texts.forEach(function(text, index) {
      var p = document.createElement('p');
      p.className = 'ending-text';
      p.style.transitionDelay = (1.5 + index * 0.6) + 's';
      p.textContent = text;

      if (index === 2) {
        p.classList.add('easter-egg');
      }
      if (index === texts.length - 1) {
        p.classList.add('final');
      }

      container.appendChild(p);
      observer.observe(p);
    });

    var numAnim = document.getElementById('number-animation');
    if (numAnim) {
      observer.observe(numAnim);
    }
  }

  function startNumberAnimation() {
    var fromEl = document.getElementById('number-from');
    var toEl = document.getElementById('number-to');
    var arrow = document.querySelector('.number-arrow');

    // 数字1: 淡出
    setTimeout(function() {
      if (fromEl) {
        fromEl.style.transition = 'all 0.8s var(--ease-soft)';
        fromEl.style.opacity = '0.3';
        fromEl.style.transform = 'translateY(-20px) scale(0.8)';
        fromEl.style.color = 'var(--text-muted)';
      }
    }, 300);

    // 箭头脉冲
    setTimeout(function() {
      if (arrow) {
        arrow.style.transition = 'all 0.6s var(--ease-soft)';
        arrow.style.color = 'var(--rose)';
        arrow.style.transform = 'scale(1.3)';
      }
    }, 600);

    // 数字2: 高亮出现
    setTimeout(function() {
      if (toEl) {
        toEl.style.transition = 'all 1s var(--ease-out)';
        toEl.style.color = 'var(--rose)';
        toEl.style.textShadow = '0 0 80px rgba(232, 180, 184, 0.5)';
        toEl.style.transform = 'scale(1.1)';
      }
      if (arrow) {
        arrow.style.color = 'var(--rose)';
      }
    }, 1000);

    // 数字2: 回到正常大小
    setTimeout(function() {
      if (toEl) {
        toEl.style.transform = 'scale(1)';
      }
    }, 2000);
  }

  function startEndingSequence() {
    if (window.FireworksEngine) {
      setTimeout(function() {
        FireworksEngine.burst(3);
      }, 1500);

      // 再来一波
      setTimeout(function() {
        FireworksEngine.burst(2);
      }, 3500);
    }
  }

  return {
    init: init
  };

})();

if (typeof window !== 'undefined') {
  window.InteractionsModule = InteractionsModule;
}
