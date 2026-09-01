# 张婧20岁生日纪念网站

一个只属于我们两个人的数字回忆录。从小时候到高一认识，到高中，到疫情，到毕业，到大学，到一起旅行，到20岁，再到未来。

---

## 📁 项目结构

```
zhangjing-birthday/
├── index.html              # 主页面
├── README.md               # 就是这个文件
├── assets/
│   ├── photos/             # 所有照片
│   │   ├── childhood/      # 小时候
│   │   ├── highschool/     # 高中
│   │   ├── pandemic/       # 疫情
│   │   ├── university/     # 大学
│   │   ├── memories/       # 日常/搞怪
│   │   ├── chengdu/        # 成都
│   │   ├── beijing/        # 北京
│   │   ├── changzhou/      # 常州
│   │   ├── birthday/       # 生日照片
│   │   └── future/         # 未来目的地
│   └── audio/              # 音乐文件（自己放）
│       └── README.txt      # 音乐放置说明
├── css/                    # 样式文件
└── js/
    ├── content-map.js      # ★ 每年更新只改这个
    ├── main.js             # 主逻辑
    ├── fireworks.js        # 烟花
    ├── lunar.js            # 农历判断
    ├── birthday.js         # 吹蜡烛
    ├── photos.js           # 照片展示
    ├── music.js            # 音乐播放器
    └── interactions.js     # 聊天/彩蛋
```

---

## 🎵 音乐文件放置说明

由于版权原因，项目不包含任何音乐文件。你需要自己准备合法拥有/获得授权的音乐文件，放到 `assets/audio/` 目录下。

### 需要的音乐文件

| 文件名 | 用途 | 对应阶段 |
|--------|------|----------|
| `birthday-song.mp3` | 生日歌 | PART 01 开场，出现"祝炸鸡生日快乐"时自动播放 |
| `we-met-before.mp3` | 我们好像在哪里见过 | 小时候STAGE（片段模式，约15秒） |
| `yu-jian.mp3` | 遇见 - 孙燕姿 | 其余所有部分（循环播放） |

### 操作步骤

1. 准备好3首歌的mp3文件
2. 分别重命名为上面的文件名
3. 放到 `assets/audio/` 文件夹里
4. 刷新网页即可

### 想换歌怎么办？

打开 `js/content-map.js`，找到 `MUSIC_CONFIG`，修改 `tracks` 里的 `src` 和 `name` 即可。

### 想调整"我们好像在哪里见过"的片段位置？

在 `MUSIC_CONFIG.tracks.childhood` 里修改：
- `startTime`: 从第几秒开始播放（单位：秒）
- `duration`: 播放多少秒后淡出切回遇见（单位：秒，0=整首）

---

## 🚀 部署到 GitHub Pages（手机可访问）

### 第一步：注册 GitHub 账号

如果你还没有 GitHub 账号：
1. 打开 https://github.com
2. 点击右上角 "Sign up"
3. 用邮箱注册一个免费账号

### 第二步：创建新仓库

1. 登录 GitHub 后，点击右上角 **+** 号
2. 选择 **New repository**
3. Repository name 填：`zhangjing-birthday`（或你喜欢的名字）
4. 选择 **Public**（公开，手机才能访问）
5. 勾选 **Add a README file**（可选）
6. 点击最下面绿色按钮 **Create repository**

### 第三步：上传文件（最简单的方法：网页上传）

1. 在刚创建好的仓库页面，点击 **Add file** 按钮
2. 选择 **Upload files**
3. 打开你电脑上的项目文件夹
4. **把所有文件和文件夹一起拖进去**（包括 index.html、assets、css、js 等）
5. 页面底部，点击绿色按钮 **Commit changes**

### 第四步：开启 GitHub Pages

1. 在仓库页面，点击顶部的 **Settings**（设置）
2. 左边菜单找到 **Pages**（在最下面，慢慢往下滑）
3. 在 "Build and deployment" 下面：
   - Source 选择 **Deploy from a branch**
   - Branch 选择 **main** （或 master）
   - 右边选择 **/ (root)**
4. 点击 **Save**
5. 等 1-2 分钟，页面顶部会出现一个绿色的网址，类似：
   ```
   https://你的用户名.github.io/zhangjing-birthday/
   ```
6. 复制这个网址，手机浏览器打开就行啦！

### 第五步：发给朋友

- 直接把上面的网址发给张婧
- 手机上用 Safari 或 Chrome 打开都可以
- 建议用 WiFi 打开，第一次加载照片需要一点时间

---

## 📱 手机浏览提示

1. **第一次打开**：需要加载照片和资源，耐心等几秒钟
2. **音乐**：点击右下角的音乐按钮才会播放（浏览器规定不能自动播放）
3. **横屏不行**：网站是竖屏设计的，请竖屏浏览
4. **添加到主屏幕**：
   - iPhone：Safari 打开 → 底部分享按钮 → 添加到主屏幕
   - Android：Chrome 打开 → 右上角菜单 → 添加到主屏幕
   - 这样就像一个 App 一样，点开就能看

---

## 📅 每年怎么更新

每年张婧生日之前，你只需要修改一个文件：`js/content-map.js`

### 更新年龄

找到 `SITE_CONFIG`：
```js
currentYear: 2026,  // 改成当年
```

年龄会根据出生年份自动计算，不用改。

### 添加新照片

1. 把新照片放到 `assets/photos/` 对应目录下
2. 打开 `js/content-map.js`
3. 找到对应分类的数组，在末尾加一项：
```js
{
  image: 'assets/photos/chengdu/新照片.jpg',
  section: 'chengdu',
  caption: '',
  displayMode: 'gallery',
  order: 99   // 顺序号，越大越靠后
}
```

### 添加新的生日信 / 未来目的地

在 `content-map.js` 里找到对应的部分，追加内容即可。结构很清晰，看一眼就懂。

### 更新后重新部署

1. 打开 GitHub 仓库页面
2. 找到修改的文件，点击右上角铅笔图标编辑
3. 改完之后滚动到底部，点击 **Commit changes**
4. 等 1-2 分钟，网站自动更新

---

## 🎆 生日模式

网站会自动检测农历七月初三：

- **生日当天**：自动进入生日模式，有特别烟花效果
- **不是生日**：正常打开也可以看
- **手动测试**：页面左下角有"测试生日模式"按钮，可以预览效果

农历判断使用内置的 1900-2100 年农历查找表，支持闰月。

---

## 🛠️ 技术说明

- 纯前端静态网站，不需要后端
- 烟花：自实现 Canvas 粒子系统
- 农历：自实现 1900-2100 农历查找表
- 图片懒加载：IntersectionObserver
- 动画：CSS + requestAnimationFrame
- 响应式：768px 断点，移动端自动降级粒子数量

### 第三方代码声明

无第三方依赖。所有代码均为项目编写。

---

## ❤️ 最后

这个网站是一份礼物。

不是模板，不是随便找的网页。

是有人真的花了很多时间，为她做了一整个网站。

**下一章，我们继续写。**
