/**
 * content-map.js
 * 网站所有照片和文案的中央映射文件
 * 每年更新只需要修改这个文件即可
 */

// ========== 全局配置 ==========
const SITE_CONFIG = {
  name: '张婧',
  birthLunarDate: {
    year: 2006,
    month: 7,
    day: 3,
    isLeapMonth: false
  },
  currentYear: 2026,
  // age 由 lunar.js 自动计算，也可手动覆盖
  // age: 20,
};

// ========== 音乐配置 ==========
// 把你合法拥有的音乐文件放到 audio/ 目录下
// 然后修改下面的文件名即可
const MUSIC_CONFIG = {
  // 是否启用音乐
  enabled: true,

  // 各阶段对应的音乐
  // 音乐切换规则：滚动到对应STAGE时切换
  tracks: {
    // PART 01 开场：生日歌（出现"祝炸鸡生日快乐"时播放）
    birthday: {
      src: 'audio/birthday-song.mp3',
      name: '生日歌',
      volume: 0.6
    },
    // 小时候STAGE：我们好像在哪里见过 片段
    childhood: {
      src: 'audio/we-met-before.mp3',
      name: '我们好像在哪里见过',
      volume: 0.5,
      // 从第几秒开始播放（片段模式）
      startTime: 0,
      // 播放多少秒后淡出（0表示整首）
      duration: 15
    },
    // 其余部分：遇见 - 孙燕姿
    main: {
      src: 'audio/yu-jian.mp3',
      name: '遇见 - 孙燕姿',
      volume: 0.4
    }
  },

  // STAGE与音乐的对应关系
  // 滚动到这些STAGE时切换到对应音乐
  stageMusic: {
    childhood: 'childhood',   // 小时候 -> 我们好像在哪里见过
    highschool: 'main',       // 高中 -> 遇见
    pandemic: 'main',         // 疫情 -> 遇见
    graduation: 'main',       // 毕业 -> 遇见
    university: 'main',       // 大学 -> 遇见
    archive: 'main',          // 搞怪 -> 遇见
    mimi: 'main',             // 咪咪 -> 遇见
    daily: 'main',            // 日常 -> 遇见
    chengdu: 'main',          // 成都 -> 遇见
    beijing: 'main',          // 北京 -> 遇见
    changzhou: 'main',        // 常州 -> 遇见
    chat: 'main',             // 聊天 -> 遇见
    wish: 'main',             // 许愿 -> 遇见
    letter: 'main',           // 信件 -> 遇见
    future: 'main'            // 未来 -> 遇见
  }
};

// ========== PART 01: 烟花开场配置 ==========
const OPENING_SEQUENCE = [
  { text: '正在寻找一个特别的人……', delay: 1200, duration: 2800 },
  // 以下在用户输入正确姓名后显示
  { text: '找到了。', delay: 1000, duration: 2000 },
  { text: '祝炸鸡20岁生日快乐', delay: 1200, duration: 3000, isGreeting: true },
];

// 开场祝福语之后展示的照片
const OPENING_PHOTO = 'birthday/仙女生日快乐.jpg';

const OPENING_INPUT = {
  prompt: '请输入你的姓名',
  expectedAnswer: '张婧',
  hintWrong: '嗯？不对哦，再试试？',
  hintAlmost: '接近了！再想想？',
  placeholder: '在这里输入名字…',
  buttonText: '确认'
};

// ========== PART 02: 五年回忆引导文案 ==========
const MEMORIES_INTRO = [
  { text: '嘿，张婧。', delay: 800, duration: 2000 },
  { text: '你有没有想过，我们认识多久了？', delay: 1400, duration: 2400 },
  { text: '5 YEARS', delay: 1400, duration: 3000, isHighlight: true },
  { text: '好像一眨眼，就认识你五年了。', delay: 1200, duration: 2400 },
  { text: '从高一那个秋天开始。', delay: 1200, duration: 2200 },
  { text: '然后就这样，不知不觉，一起走到了20岁。', delay: 1400, duration: 2600 },
];

// ========== PART 02 各 STAGE 定义 ==========
const STAGES = [
  // --- STAGE 01: 小时候 ---
  {
    id: 'childhood',
    subtitle: 'CHILDHOOD · 小时候',
    photos: [
      {
        image: 'childhood/小时候照片.png',
        section: 'childhood',
        caption: '',
        displayMode: 'hero-vintage',
        order: 1
      }
    ],
    texts: [
      '在认识你之前，你就已经是一个小朋友了。',
      '虽然那个时候，我还完全不知道你是谁。',
      '更不知道以后，你会一直听我叭叭叭不停直到现在。'
    ],
    interactive: {
      type: 'guess',
      question: '这是谁小时候啊？',
      subtext: '这也太萌了吧 🌸',
      options: ['张婧', '不是我', '让我看看'],
      correctIndex: 0,
      revealText: '没错，就是你呀！'
    }
  },

  // --- STAGE 02: 高中 ---
  {
    id: 'highschool',
    subtitle: 'HIGH SCHOOL · 高中',
    photos: [
      {
        image: 'highschool/高中最有氛围的照片.jpg',
        section: 'highschool',
        caption: '',
        displayMode: 'hero',
        order: 1
      },
      {
        image: 'highschool/成人礼.jpg',
        section: 'highschool',
        caption: '',
        displayMode: 'normal',
        order: 2
      },
      {
        image: 'highschool/毕业合照.jpg',
        section: 'highschool',
        caption: '',
        displayMode: 'fullscreen',
        order: 3
      }
    ],
    texts: [
      '故事，是从高一开始的。',
      '还记得高一那会儿，我们就很有缘分。',
      '后来我们都喜欢地理，选了物化地，又分在了同一个班，一起上课。',
      '那时候觉得好巧，现在想想，可能就是命中注定要做好朋友吧。'
    ]
  },

  // --- STAGE 03: 疫情 / 高中生活 ---
  {
    id: 'pandemic',
    subtitle: '',
    photos: [
      {
        image: 'pandemic/疫情照片1.jpg',
        section: 'pandemic',
        caption: '',
        displayMode: 'polaroid',
        order: 1
      },
      {
        image: 'pandemic/疫情照片2.jpg',
        section: 'pandemic',
        caption: '',
        displayMode: 'polaroid',
        order: 2
      }
    ],
    texts: [
      '高中三年，真的经历了很多人生的第一次与难忘瞬间。',
      '疫情期间，突然封校。',
      '待在宿舍里有了超多开心的回忆。',
      '排队做核酸。',
      '吃学校超级难吃的饭菜。',
      '等等等等。',
      '是永远不会忘的美好回忆。'
    ]
  },

  // --- STAGE 04: 毕业 ---
  {
    id: 'graduation',
    subtitle: '',
    photos: [
      {
        image: 'highschool/毕业合照新.jpg',
        section: 'graduation',
        caption: '',
        displayMode: 'fullscreen',
        order: 1
      }
    ],
    texts: [
      '然后，三年就这样过去了。',
      '一起上课。',
      '一起封校。',
      '一起测核酸。',
      '一起写小纸条。',
      '一起知道对方好多好多小秘密。',
      '有些秘密，到现在也只有我们知道。',
      '然后，毕业了。'
    ]
  },

  // --- STAGE 05: 大学 / 第一个寒假 ---
  {
    id: 'university',
    subtitle: 'UNIVERSITY · 大学',
    photos: [
      {
        image: 'university/第一个寒假.jpg',
        section: 'university',
        caption: '',
        displayMode: 'hero',
        order: 1
      },
      {
        image: 'university/大学照片1.jpg',
        section: 'university',
        caption: '',
        displayMode: 'duo-left',
        order: 2
      },
      {
        image: 'university/大学照片2.jpg',
        section: 'university',
        caption: '',
        displayMode: 'duo-right',
        order: 3
      }
    ],
    texts: [
      '高中毕业以后，我们去了不同的城市。',
      '你在南京。',
      '我在北京。',
      '隔了一千多公里。',
      '但好像……也没有因此变得不熟。',
      '消息还是随时发，电话还是随时打。',
      '距离这种东西，对我们来说好像不太管用。'
    ]
  },

  // --- STAGE 06: 搞怪档案 ---
  {
    id: 'archive',
    subtitle: 'ARCHIVED FILE · 机密档案',
    photos: [
      {
        image: 'memories/深夜搞怪.jpg',
        section: 'archive',
        caption: '档案 #001 深夜搞怪',
        displayMode: 'archive',
        order: 1,
        archiveNumber: '001',
        archiveTitle: '深夜搞怪'
      },
      {
        image: 'memories/豆包爆炸头限定款.jpg',
        section: 'archive',
        caption: '档案 #002 豆包爆炸头限定款',
        displayMode: 'archive',
        order: 2,
        archiveNumber: '002',
        archiveTitle: '豆包爆炸头限定款'
      }
    ],
    texts: [
      '以下部分历史影像不建议公开。',
      '证据已经留存。',
      '请勿对当事人进行二次伤害。',
      '（但真的好好笑。）'
    ]
  },

  // --- STAGE 06.5: 你和咪咪 ---
  {
    id: 'mimi',
    subtitle: '',
    photos: [
      {
        image: 'memories/你和咪咪.jpg',
        section: 'mimi',
        caption: '',
        displayMode: 'hero',
        order: 1
      }
    ],
    texts: [
      '看你和咪咪的暖心画面。',
      '不知道咪咪还记得我的咪咪死亡召唤吗。'
    ]
  },

  // --- STAGE 07: 日常 ---
  {
    id: 'daily',
    subtitle: 'EVERYDAY · 日常',
    photos: [
      {
        image: 'memories/eat.jpg',
        section: 'daily',
        caption: '',
        displayMode: 'polaroid',
        order: 1
      },
      {
        image: 'memories/不知何时拍的.jpg',
        section: 'daily',
        caption: '',
        displayMode: 'polaroid',
        order: 2
      }
    ],
    texts: [
      '那些没有发生什么大事的日子。',
      '没有旅行，没有考试，没有毕业。',
      '只是待在一起，就很快乐。',
      '和你在一起的每天都很快乐。',
      '是发自内心的笑。',
      '我其实不太会说话。',
      '也和很多人都没有什么话题。',
      '但是和你在一起……',
      '我就是很喜欢说话。',
      '说很多很多废话。',
      '很开心。',
      '很开心很开心。',
      '而且总是会发生一些奇奇怪怪的故事。'
    ]
  },

  // --- STAGE 08: 成都 ---
  {
    id: 'chengdu',
    subtitle: 'SOMEWHERE WE WENT · 成都',
    photos: [
      {
        image: 'chengdu/微信图片_20260901091928_155_33.jpg',
        section: 'chengdu',
        caption: '',
        displayMode: 'gallery',
        order: 1
      },
      {
        image: 'chengdu/成都旅行.jpg',
        section: 'chengdu',
        caption: '',
        displayMode: 'gallery',
        order: 2
      },
      {
        image: 'chengdu/成都旅行第二弹.jpg',
        section: 'chengdu',
        caption: '',
        displayMode: 'gallery',
        order: 3
      },
      {
        image: 'chengdu/成都额外照片.png',
        section: 'chengdu',
        caption: '',
        displayMode: 'gallery',
        order: 4
      }
    ],
    texts: [
      '我们也一起去了好多地方。',
      '每一段旅程都有属于自己的故事。'
    ]
  },

  // --- STAGE 09: 北京 ---
  {
    id: 'beijing',
    subtitle: 'ANOTHER MEMORY · 北京',
    photos: [
      {
        image: 'beijing/微信图片_20260901091928_147_33.jpg',
        section: 'beijing',
        caption: '',
        displayMode: 'polaroid',
        order: 1,
        isMain: true
      },
      {
        image: 'beijing/微信图片_20260901091928_148_33.jpg',
        section: 'beijing',
        caption: '',
        displayMode: 'polaroid',
        order: 2
      },
      {
        image: 'beijing/微信图片_20260901091928_149_33.jpg',
        section: 'beijing',
        caption: '',
        displayMode: 'polaroid',
        order: 3
      },
      {
        image: 'beijing/微信图片_20260901091928_150_33.jpg',
        section: 'beijing',
        caption: '',
        displayMode: 'polaroid',
        order: 4
      },
      {
        image: 'beijing/微信图片_20260901091928_151_33.jpg',
        section: 'beijing',
        caption: '',
        displayMode: 'polaroid',
        order: 5
      },
      {
        image: 'beijing/微信图片_20260901091928_152_33.jpg',
        section: 'beijing',
        caption: '',
        displayMode: 'polaroid',
        order: 6
      }
    ],
    texts: []
  },

  // --- STAGE 10: 来常州找你 ---
  {
    id: 'changzhou',
    subtitle: '',
    photos: [
      {
        image: 'changzhou/微信图片_20260901091928_153_33.jpg',
        section: 'changzhou',
        caption: '',
        displayMode: 'polaroid',
        order: 1
      },
      {
        image: 'changzhou/微信图片_20260901091928_154_33.jpg',
        section: 'changzhou',
        caption: '',
        displayMode: 'polaroid',
        order: 2
      }
    ],
    texts: [
      '你来找我。',
      '我找你。',
      '以后也要继续这样。',
      '继续互相去对方的城市。',
      '继续去对方家里玩。',
      '继续一起吃好吃的，逛好逛的。',
      '这个约定，不会变的。'
    ]
  },
];

// ========== PART 02 STAGE 11: 情感大师聊天记录 ==========
const CHAT_MESSAGES = [
  { sender: 'me', text: '张婧！！！！！！', delay: 600 },
  { sender: 'me', text: '我跟你说！！！！', delay: 700 },
  { sender: 'me', text: '你知道吗你知道吗！！', delay: 800 },
  { sender: 'me', text: '今天发生了一个超级离谱的事情', delay: 900 },
  { sender: 'me', text: '就是那个……', delay: 800 },
  { sender: 'me', text: '等等我组织一下语言', delay: 700 },
  { sender: 'me', text: '算了说不清楚', delay: 600 },
  { sender: 'me', text: '反正就是啊啊啊啊啊啊', delay: 800 },
  { sender: 'zhangjing', text: '……', delay: 1200 },
  { sender: 'zhangjing', text: '你慢慢说', delay: 800 },
  { sender: 'zhangjing', text: '我听着呢。', delay: 1000 },
];

const CHAT_ENDING_TEXT = '就这样，听我叭叭叭了三年。';

// ========== PART 03: 吹蜡烛交互 ==========
const CANDLE_CONFIG = {
  photo: 'birthday/仙女生日快乐.jpg',
  number: 20,
  prompts: [
    '好，现在闭上眼睛。',
    '认真许愿。',
    '不能偷看哦。',
    '……',
    '你许完了吗？',
    '行了行了，吹吧。'
  ],
  afterBlow: [
    '愿望会实现的。',
    '20岁，要每天开心。'
  ]
};

// ========== PART 04: 生日信章节拆分 ==========
const LETTER_CHAPTERS = [
  {
    id: 1,
    lines: ['张婧20岁生日快乐，天天开心呀！']
  },
  {
    id: 2,
    lines: [
      '这是我们认识的第五年。',
      '还记得高一我们就很有缘分，',
      '后边更是有一样的选课规划。',
      '那时候大概也没想到，会一走就走这么久。'
    ]
  },
  {
    id: 3,
    lines: [
      '我很依赖很依赖你。',
      '把你当情感大师哈哈哈哈。'
    ]
  },
  {
    id: 4,
    lines: [
      '是你一直在安慰我，',
      '你能很好的感受到我的敏感与情绪，',
      '也不嫌麻烦，',
      '就听我在你耳边叭叭叭了三年。'
    ],
    isChatStyle: true
  },
  {
    id: 5,
    lines: [
      '和你在一起的每天都很快乐，',
      '发自内心的笑。'
    ]
  },
  {
    id: 6,
    lines: [
      '我不太会说话，',
      '也和很多人都没有什么话题，',
      '但是和你在一起就是喜欢说话，',
      '很开心很开心，',
      '很搞笑，总是会发生一些奇妙的故事。'
    ]
  },
  {
    id: 7,
    lines: [
      '我们经历过很多很多。'
    ],
    flashbacks: [
      '高中', '疫情', '封校', '宿舍', '核酸',
      '小纸条', '小长文', '高中暗恋小心思',
      '高中小秘密', '一起上课', '去你家玩'
    ]
  },
  {
    id: 8,
    lines: [
      '你的情感很细腻，',
      '可能因为这份细腻，你的共情力也很强。'
    ]
  },
  {
    id: 9,
    lines: [
      '希望你以后可以不为情感所束缚，',
      '可以每天都开开心心的，',
      '遇到的人都很好。'
    ],
    easterEgg: {
      title: '20岁人生守则 #01',
      icon: '🌸',
      text: '远离烂桃花。'
    }
  },
  {
    id: 10,
    lines: [
      '也希望我们的友谊一直一直长存，',
      '未来可以一起旅游一起玩，',
      '互相去对方的城市与家里玩。'
    ],
    finalLine: '很幸运遇见你，并且和你成为了很好的朋友。'
  }
];

// ========== PART 05: 未来目的地 ==========
const FUTURE_DESTINATIONS = [
  {
    name: '待解锁',
    image: '',
    status: 'locked',
    caption: '未来真正一起去了以后，可以替换成真实照片。'
  }
];

const FUTURE_INTRO_TEXTS = [
  '过去五年，我们已经一起经历了很多。',
  '有笑有泪，有闹有甜。',
  '但还有很多照片，现在还不存在。',
  '那些是我们还没一起去的的地方，还没一起做的事。',
  '不过没关系。'
];

// ========== PART 05: 19 → 20 数字动画 ==========
const ENDING_CONFIG = {
  numberFrom: 19,
  numberTo: 20,
  texts: [
    '19岁的故事结束了。',
    '20岁的故事，现在开始。',
    '友情提示：该副本暂不支持退出。',
    '下一章，我们继续写。',
    '明年见。'
  ]
};

// ========== 导出 ==========
if (typeof window !== 'undefined') {
  window.CONTENT_MAP = {
    SITE_CONFIG,
    OPENING_SEQUENCE,
    OPENING_PHOTO,
    OPENING_INPUT,
    MEMORIES_INTRO,
    STAGES,
    CHAT_MESSAGES,
    CHAT_ENDING_TEXT,
    CANDLE_CONFIG,
    LETTER_CHAPTERS,
    FUTURE_DESTINATIONS,
    FUTURE_INTRO_TEXTS,
    ENDING_CONFIG,
    MUSIC_CONFIG
  };
}
