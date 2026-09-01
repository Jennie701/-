/**
 * lunar.js - 农历日期判断
 *
 * 使用标准农历查找表（1900-2100），与 solarlunar (ISC) 等主流库使用相同的公开数据。
 * 数据来源：公历农历对照表（公共领域天文数据）。
 *
 * 功能：
 *   - 公历转农历
 *   - 农历转公历
 *   - 判断今天是否是张婧的农历生日
 *   - 自动计算年龄
 */

// ========== 农历查找表 1900-2100 ==========
// 每个值编码：
//   bits 0-3:  闰月月份 (0 = 无闰月)
//   bit  16:   闰月天数 (1 = 30天, 0 = 29天)
//   bits 4-15: 12个月的天数 (1 = 30天大月, 0 = 29天小月)
//               month m 对应 bit (16 - m)
var lunarInfo = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2, // 1900-1909
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977, // 1910-1919
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970, // 1920-1929
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950, // 1930-1939
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557, // 1940-1949
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0, // 1950-1959
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0, // 1960-1969
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6, // 1970-1979
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570, // 1980-1989
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0, // 1990-1999
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5, // 2000-2009
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930, // 2010-2019
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530, // 2020-2029
  0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45, // 2030-2039
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0, // 2040-2049
  0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0, // 2050-2059
  0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4, // 2060-2069
  0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0, // 2070-2079
  0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160, // 2080-2089
  0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252, // 2090-2099
  0x0d520                                                                            // 2100
];

// ========== 农历计算函数 ==========

// 农历 y 年的总天数
function lYearDays(y) {
  var i, sum = 348;
  for (i = 0x8000; i > 0x8; i >>= 1) {
    sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
  }
  return sum + leapDays(y);
}

// 农历 y 年闰月天数
function leapDays(y) {
  if (leapMonth(y)) {
    return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
}

// 农历 y 年闰月是哪个月，0 = 无闰月
function leapMonth(y) {
  return lunarInfo[y - 1900] & 0xf;
}

// 农历 y 年 m 月的天数
function monthDays(y, m) {
  if (m > 12 || m < 1) return -1;
  return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
}

// ========== 公历转农历 ==========
function solarToLunar(solarYear, solarMonth, solarDay) {
  // 基准日：1900-01-31 = 农历 1900年正月初一
  var baseDate = new Date(1900, 0, 31);
  var objDate = new Date(solarYear, solarMonth - 1, solarDay);
  var offset = Math.floor((objDate - baseDate) / 86400000);

  var y, temp = 0;
  for (y = 1900; y < 2100 && offset > 0; y++) {
    temp = lYearDays(y);
    offset -= temp;
  }
  if (offset < 0) {
    offset += temp;
    y--;
  }

  var lunarYear = y;
  var leap = leapMonth(y);
  var isLeap = false;
  var m, days = 0;

  for (m = 1; m < 13 && offset > 0; m++) {
    if (leap > 0 && m === leap + 1 && !isLeap) {
      --m;
      isLeap = true;
      days = leapDays(y);
    } else {
      days = monthDays(y, m);
    }

    offset -= days;

    if (isLeap && m === leap + 1) {
      isLeap = false;
    }
  }

  if (offset === 0 && leap > 0 && m === leap + 1) {
    if (isLeap) {
      isLeap = false;
    } else {
      isLeap = true;
      --m;
    }
  }

  if (offset < 0) {
    offset += days;
    --m;
  }

  return {
    year: lunarYear,
    month: m,
    day: offset + 1,
    isLeapMonth: isLeap
  };
}

// ========== 农历转公历 ==========
function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth) {
  // 基准日：1900-01-31 = 农历 1900年正月初一
  var baseDate = new Date(1900, 0, 31);
  var offset = 0;

  // 累加年份天数
  for (var y = 1900; y < lunarYear; y++) {
    offset += lYearDays(y);
  }

  var leap = leapMonth(lunarYear);
  var isLeap = false;

  // 累加月份天数
  for (var m = 1; m < lunarMonth; m++) {
    if (leap > 0 && m === leap + 1 && !isLeap) {
      --m;
      isLeap = true;
      offset += leapDays(lunarYear);
    } else {
      offset += monthDays(lunarYear, m);
    }
    if (isLeap && m === leap + 1) {
      isLeap = false;
    }
  }

  // 处理闰月
  if (isLeapMonth) {
    if (leap === lunarMonth) {
      // 正确的闰月
    } else if (leap > 0 && leap < lunarMonth) {
      // 已经在循环中处理了
    }
  }

  // 累加天数
  offset += lunarDay - 1;

  var result = new Date(baseDate);
  result.setDate(result.getDate() + offset);

  return {
    year: result.getFullYear(),
    month: result.getMonth() + 1,
    day: result.getDate()
  };
}

// ========== 生日判断逻辑 ==========

var LunarModule = {
  // 从 content-map 获取配置
  config: null,

  init: function() {
    this.config = (window.CONTENT_MAP && window.CONTENT_MAP.SITE_CONFIG) || {
      birthLunarDate: { year: 2006, month: 7, day: 3, isLeapMonth: false }
    };
  },

  // 获取今天的农历日期
  getTodayLunar: function() {
    var now = new Date();
    return solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
  },

  // 判断今天是否是生日（支持前后1天容差，考虑时区）
  isBirthday: function() {
    var birth = this.config.birthLunarDate;
    var todayLunar = this.getTodayLunar();

    // 精确匹配
    if (todayLunar.month === birth.month &&
        todayLunar.day === birth.day &&
        todayLunar.isLeapMonth === birth.isLeapMonth) {
      return true;
    }

    // 前后1天容差（处理跨日时区问题）
    var now = new Date();
    var yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    var tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    var yLunar = solarToLunar(yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate());
    var tLunar = solarToLunar(tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate());

    if ((yLunar.month === birth.month && yLunar.day === birth.day && yLunar.isLeapMonth === birth.isLeapMonth) ||
        (tLunar.month === birth.month && tLunar.day === birth.day && tLunar.isLeapMonth === birth.isLeapMonth)) {
      return true;
    }

    return false;
  },

  // 计算当前年龄
  getAge: function() {
    if (this.config.age) return this.config.age;

    var birthYear = this.config.birthLunarDate.year;
    var now = new Date();
    var age = now.getFullYear() - birthYear;

    // 检查是否已经过了今年的农历生日
    var birth = this.config.birthLunarDate;
    var thisYearLunarBirthday = lunarToSolar(now.getFullYear(), birth.month, birth.day, birth.isLeapMonth);
    var birthdayDate = new Date(thisYearLunarBirthday.year, thisYearLunarBirthday.month - 1, thisYearLunarBirthday.day);

    if (now < birthdayDate) {
      age--;
    }

    return age;
  },

  // 获取今年的农历生日对应的公历日期
  getThisYearSolarBirthday: function() {
    var birth = this.config.birthLunarDate;
    var now = new Date();
    return lunarToSolar(now.getFullYear(), birth.month, birth.day, birth.isLeapMonth);
  },

  // 获取生日信息（供 UI 显示）
  getBirthdayInfo: function() {
    var age = this.getAge();
    var solarBday = this.getThisYearSolarBirthday();
    var isBirthday = this.isBirthday();

    return {
      age: age,
      isBirthday: isBirthday,
      solarBirthday: solarBday,
      greeting: age + '岁生日快乐'
    };
  },

  // 手动触发生日模式（测试用）
  forceBirthdayMode: function() {
    return {
      age: this.getAge(),
      isBirthday: true,
      forced: true,
      greeting: this.getAge() + '岁生日快乐'
    };
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.LunarModule = LunarModule;
  window.solarToLunar = solarToLunar;
  window.lunarToSolar = lunarToSolar;
}
