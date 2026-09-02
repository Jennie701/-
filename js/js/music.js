/**
 * music.js
 * 多轨音乐播放器（真实音频文件版）
 * 支持按阶段切换音乐、交叉淡入淡出、片段播放
 */

(function() {
  var state = {
    enabled: false,
    isPlaying: false,
    currentTrack: null,
    audioElements: {},
    volume: 0.5,
    userInitiated: false,
    fadeTime: 1500
  };

  var MUSIC_FILES = {
    birthday: { src: 'audio/birthday-song.mp3', name: '生日歌', volume: 0.6 },
    childhood: { src: 'audio/we-met-before.mp3', name: '我们好像在哪里见过', volume: 0.5, startTime: 0, duration: 20 },
    main: { src: 'audio/yu-jian.mp3', name: '遇见 - 孙燕姿', volume: 0.4 }
  };

  var STAGE_MUSIC = {
    'childhood': 'childhood',
    'highschool': 'main',
    'pandemic': 'main',
    'graduation': 'main',
    'university': 'main',
    'archive': 'main',
    'mimi': 'main',
    'daily': 'main',
    'chengdu': 'main',
    'beijing': 'main',
    'changzhou': 'main',
    'chat': 'main',
    'wish': 'main',
    'letter': 'main',
    'future': 'main'
  };

  function init() {
    state.enabled = true;

    // 预加载所有音频
    for (var key in MUSIC_FILES) {
      if (MUSIC_FILES.hasOwnProperty(key)) {
        var audio = new Audio();
        audio.src = encodeURI(MUSIC_FILES[key].src);
        audio.loop = true;
        audio.volume = 0;
        audio.preload = 'auto';
        state.audioElements[key] = audio;

        audio.addEventListener('error', function() {
          console.warn('音乐文件加载失败:', this.src);
        });
      }
    }

    createPlayerUI();
    setupStageSwitching();
  }

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
        var track = state.currentTrack || 'main';
        playTrack(track);
      }
    });

    volumeSlider.addEventListener('input', function() {
      state.volume = this.value / 100;
      if (state.isPlaying && state.currentTrack) {
        var audio = state.audioElements[state.currentTrack];
        if (audio) {
          var config = MUSIC_FILES[state.currentTrack];
          audio.volume = state.volume * (config.volume || 0.5);
        }
      }
    });
  }

  function playTrack(trackName) {
    if (!state.enabled || !state.userInitiated) return;
    if (!state.audioElements[trackName]) return;

    if (state.currentTrack === trackName && state.isPlaying) return;

    // 淡出当前
    if (state.currentTrack && state.isPlaying) {
      fadeOut(state.currentTrack, state.fadeTime);
    }

    var config = MUSIC_FILES[trackName];
    var newAudio = state.audioElements[trackName];

    // 设置起始时间
    if (config.startTime !== undefined) {
      try { newAudio.currentTime = config.startTime; } catch(e) {}
    }

    state.currentTrack = trackName;
    state.isPlaying = true;
    updateUI(trackName);

    var targetVolume = state.volume * (config.volume || 0.5);
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

    // 片段模式
    if (config.duration && config.duration > 0) {
      setTimeout(function() {
        if (state.currentTrack === trackName && state.isPlaying) {
          playTrack('main');
        }
      }, config.duration * 1000 - state.fadeTime);
    }
  }

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

  function fadeIn(trackName, duration, targetVolume) {
    var audio = state.audioElements[trackName];
    if (!audio) return;

    var startTime = Date.now();
    function tick() {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(elapsed / duration, 1);
      progress = 1 - (1 - progress) * (1 - progress);
      audio.volume = targetVolume * progress;
      if (progress < 1 && state.isPlaying && state.currentTrack === trackName) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }

  function fadeOut(trackName, duration) {
    var audio = state.audioElements[trackName];
    if (!audio) return;

    var startTime = Date.now();
    var startVolume = audio.volume;
    function tick() {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(elapsed / duration, 1);
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

  function updateUI(trackName) {
    var toggleBtn = document.getElementById('musicToggle');
    var nameEl = document.getElementById('musicName');
    if (!toggleBtn || !nameEl) return;

    if (state.isPlaying && trackName) {
      var config = MUSIC_FILES[trackName];
      toggleBtn.classList.add('playing');
      toggleBtn.setAttribute('title', '暂停音乐');
      nameEl.textContent = config ? config.name : '播放中';
    } else {
      toggleBtn.classList.remove('playing');
      toggleBtn.setAttribute('title', '播放音乐');
      nameEl.textContent = '点击播放音乐';
    }
  }

  function setupStageSwitching() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && state.isPlaying && state.userInitiated) {
          var stageId = entry.target.getAttribute('data-stage-id');
          if (stageId && STAGE_MUSIC[stageId]) {
            var targetTrack = STAGE_MUSIC[stageId];
            if (targetTrack !== state.currentTrack) {
              playTrack(targetTrack);
            }
          }
        }
      });
    }, { threshold: 0.3 });

    setTimeout(function() {
      var stages = document.querySelectorAll('.stage[data-stage-id]');
      stages.forEach(function(stage) {
        observer.observe(stage);
      });
    }, 2000);
  }

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
    isPlaying: function() { return state.isPlaying; },
    getCurrentTrack: function() { return state.currentTrack; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
