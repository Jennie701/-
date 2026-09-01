/**
 * music.js
 * 多轨音乐播放器
 * 支持按阶段切换音乐、交叉淡入淡出、片段播放
 */

(function() {
  var state = {
    enabled: false,
    isPlaying: false,
    currentTrack: null,
    audioElements: {},
    volume: 0.5,
    userInitiated: false,  // 用户是否主动点击过播放
    fadeTime: 1500         // 交叉淡入淡出时长 ms
  };

  // ========== 初始化 ==========
  function init() {
    if (typeof MUSIC_CONFIG === 'undefined' || !MUSIC_CONFIG.enabled) {
      return;
    }

    state.enabled = true;

    // 预加载所有音频
    var tracks = MUSIC_CONFIG.tracks;
    for (var key in tracks) {
      if (tracks.hasOwnProperty(key)) {
        var audio = new Audio();
        audio.src = tracks[key].src;
        audio.loop = true;
        audio.volume = 0;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        state.audioElements[key] = audio;

        // 错误处理：文件不存在时静默跳过
        audio.addEventListener('error', function() {
          console.warn('音乐文件加载失败:', this.src);
        });
      }
    }

    createPlayerUI();
    setupStageSwitching();
  }

  // ========== 创建播放器UI ==========
  function createPlayerUI() {
    var player = document.createElement('div');
    player.className = 'music-player';
    player.id = 'musicPlayer';
    player.innerHTML =
      '<button class="music-toggle" id="musicToggle" title="播放音乐">' +
        '<span class="music-icon">♪</span>' +
      '</button>' +
      '<div class="music-info">' +
        '<span class="music-name" id="musicName">点击播放音乐</span>' +
        '<div class="music-controls">' +
          '<input type="range" class="music-volume" id="musicVolume" min="0" max="100" value="50" />' +
        '</div>' +
      '</div>';

    document.body.appendChild(player);

    var toggleBtn = document.getElementById('musicToggle');
    var volumeSlider = document.getElementById('musicVolume');

    toggleBtn.addEventListener('click', function() {
      state.userInitiated = true;
      if (state.isPlaying) {
        pauseAll();
      } else {
        // 从当前位置开始播放
        var track = state.currentTrack || 'main';
        playTrack(track);
      }
    });

    volumeSlider.addEventListener('input', function() {
      state.volume = this.value / 100;
      if (state.isPlaying && state.currentTrack) {
        var audio = state.audioElements[state.currentTrack];
        if (audio) {
          var trackConfig = MUSIC_CONFIG.tracks[state.currentTrack];
          audio.volume = state.volume * (trackConfig.volume || 0.5);
        }
      }
    });
  }

  // ========== 播放指定曲目 ==========
  function playTrack(trackName, options) {
    if (!state.enabled || !state.userInitiated) return;
    if (!state.audioElements[trackName]) return;

    options = options || {};
    var trackConfig = MUSIC_CONFIG.tracks[trackName];
    var newAudio = state.audioElements[trackName];

    // 如果已经在播放这首，不处理
    if (state.currentTrack === trackName && state.isPlaying) return;

    // 淡出当前曲目
    if (state.currentTrack && state.isPlaying) {
      fadeOut(state.currentTrack, state.fadeTime);
    }

    // 设置起始时间
    if (trackConfig.startTime !== undefined) {
      try {
        newAudio.currentTime = trackConfig.startTime;
      } catch(e) {}
    } else if (options.startTime !== undefined) {
      try {
        newAudio.currentTime = options.startTime;
      } catch(e) {}
    }

    // 淡入新曲目
    state.currentTrack = trackName;
    state.isPlaying = true;
    updateUI(trackName);

    var targetVolume = state.volume * (trackConfig.volume || 0.5);
    newAudio.volume = 0;

    var playPromise = newAudio.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function(err) {
        console.warn('播放失败:', err);
        state.isPlaying = false;
        updateUI(null);
      });
    }

    fadeIn(trackName, state.fadeTime, targetVolume);

    // 片段模式：duration秒后淡出并切换到main
    if (trackConfig.duration && trackConfig.duration > 0) {
      setTimeout(function() {
        if (state.currentTrack === trackName && state.isPlaying) {
          switchToMain();
        }
      }, trackConfig.duration * 1000 - state.fadeTime);
    }
  }

  // ========== 切换到main曲目 ==========
  function switchToMain() {
    playTrack('main');
  }

  // ========== 暂停所有 ==========
  function pauseAll() {
    state.isPlaying = false;
    for (var key in state.audioElements) {
      if (state.audioElements.hasOwnProperty(key)) {
        var audio = state.audioElements[key];
        audio.pause();
        audio.volume = 0;
      }
    }
    updateUI(null);
  }

  // ========== 淡入 ==========
  function fadeIn(trackName, duration, targetVolume) {
    var audio = state.audioElements[trackName];
    if (!audio) return;

    var startTime = Date.now();
    var startVolume = 0;

    function tick() {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      progress = 1 - (1 - progress) * (1 - progress);
      audio.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress < 1 && state.isPlaying && state.currentTrack === trackName) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }

  // ========== 淡出 ==========
  function fadeOut(trackName, duration) {
    var audio = state.audioElements[trackName];
    if (!audio) return;

    var startTime = Date.now();
    var startVolume = audio.volume;

    function tick() {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // easeInQuad
      progress = progress * progress;
      audio.volume = startVolume * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        audio.pause();
        audio.volume = 0;
      }
    }
    requestAnimationFrame(tick);
  }

  // ========== 更新UI ==========
  function updateUI(trackName) {
    var toggleBtn = document.getElementById('musicToggle');
    var nameEl = document.getElementById('musicName');

    if (!toggleBtn || !nameEl) return;

    if (state.isPlaying && trackName) {
      var trackConfig = MUSIC_CONFIG.tracks[trackName];
      toggleBtn.classList.add('playing');
      toggleBtn.setAttribute('title', '暂停音乐');
      nameEl.textContent = trackConfig ? trackConfig.name : '播放中';
    } else {
      toggleBtn.classList.remove('playing');
      toggleBtn.setAttribute('title', '播放音乐');
      nameEl.textContent = '点击播放音乐';
    }
  }

  // ========== 按STAGE切换音乐 ==========
  function setupStageSwitching() {
    // 使用IntersectionObserver监听stage进入视口
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && state.isPlaying && state.userInitiated) {
          var stageId = entry.target.getAttribute('data-stage-id');
          if (stageId && MUSIC_CONFIG.stageMusic && MUSIC_CONFIG.stageMusic[stageId]) {
            var targetTrack = MUSIC_CONFIG.stageMusic[stageId];
            if (targetTrack !== state.currentTrack) {
              playTrack(targetTrack);
            }
          }
        }
      });
    }, {
      threshold: 0.3 // 进入30%时触发
    });

    // 等stage渲染完再监听
    setTimeout(function() {
      var stages = document.querySelectorAll('.stage[data-stage-id]');
      stages.forEach(function(stage) {
        observer.observe(stage);
      });
    }, 2000);
  }

  // ========== 公开API ==========
  window.MusicPlayer = {
    init: init,
    play: function(trackName) {
      state.userInitiated = true;
      playTrack(trackName || 'main');
    },
    pause: pauseAll,
    playBirthday: function() {
      state.userInitiated = true;
      playTrack('birthday');
    },
    isPlaying: function() {
      return state.isPlaying;
    },
    getCurrentTrack: function() {
      return state.currentTrack;
    }
  };

  // 页面加载后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
