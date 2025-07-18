const fs = require('fs');
const cloud = require('@cloudbase/node-sdk');
const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
const db = app.database();

// ⭕️ 偏差表：必须这样读取！（因为你json最外层是 location_offset_full）
const raw = JSON.parse(fs.readFileSync('./location_offset_map.json', 'utf8'));
const location_offset_map = raw["location_offset_full"];

// 可选别名表（可以空着，特殊别名再补）
const ALIAS_MAP = {
  // "羊城": "广东省-广州市-广州市",
};

// 🚩 地名最强智能模糊查找
function standardizeLocation(userInput) {
  let loc = userInput.trim().replace(/\s+/g, '');
  if (ALIAS_MAP[loc]) return ALIAS_MAP[loc];
  if (location_offset_map[loc] !== undefined) return loc;

  // ① 包含查找（“深圳”命中“广东省-深圳市-深圳市”）
  let keys = Object.keys(location_offset_map);
  let candidates = keys.filter(k => k.includes(loc));
  if (candidates.length > 0) {
    return candidates.sort((a, b) => a.length - b.length)[0];
  }

  // ② 汉字乱序查找（用户输“宝安深圳”“深圳宝安”都能命中）
  let words = loc.split('');
  let fuzzyCandidates = keys.filter(key => words.every(w => key.includes(w)));
  if (fuzzyCandidates.length > 0) {
    return fuzzyCandidates.sort((a, b) => a.length - b.length)[0];
  }

  // ③ 降级查2字（比如只填“宝安”也能匹配）
  if (loc.length > 2) {
    let shortCandidates = keys.filter(k => k.includes(loc.slice(0, 2)));
    if (shortCandidates.length > 0) {
      return shortCandidates.sort((a, b) => a.length - b.length)[0];
    }
  }

  return null;
}

function getOffset(userInput) {
  let stdLoc = standardizeLocation(userInput);
  if (stdLoc && location_offset_map[stdLoc] !== undefined) {
    return { stdLoc, offset: location_offset_map[stdLoc], isDefault: false };
  } else {
    return { stdLoc: "使用北京时间", offset: 0, isDefault: true };
  }
}

// 真太阳时校正
function correctToSolarTime(inputDatetime, offsetMinutes) {
  let dt = new Date(inputDatetime.replace(/-/g, '/'));
  dt.setMinutes(dt.getMinutes() - offsetMinutes);
  return dt;
}

// 查表用整点
function getLookupTime(dt) {
  let year = dt.getFullYear();
  let month = ('0' + (dt.getMonth() + 1)).slice(-2);
  let day = ('0' + dt.getDate()).slice(-2);
  let hour = ('0' + dt.getHours()).slice(-2);
  return `${year}-${month}-${day} ${hour}:00`;
}

// 数据库递减查找
async function findBaziRecordInDB(db, lookupTime) {
  let dt = new Date(lookupTime.replace(/-/g, '/'));
  for (let i = 0; i < 25; i++) {
    let datetimeStr = getLookupTime(dt);
    let res = await db.collection('bazi_data').where({ datetime: datetimeStr }).get();
    if (res.data && res.data.length > 0) {
      return { recTime: datetimeStr, record: res.data[0] };
    }
    dt.setHours(dt.getHours() - 1);
  }
  return { recTime: null, record: null };
}

// 主API
exports.main = async (event, context) => {
  try {
    // 🔥 支持多種格式自動識別
    let data = event;

    // 1. 支持 body 為字符串（平台常見格式）
    if (typeof event.body === 'string') {
      try { data = JSON.parse(event.body); } catch(e){}
    }

    // 2. 支持 body 為對象
    if (typeof event.body === 'object' && event.body !== null) {
      data = event.body;
    }

    // 3. 支持 queryStringParameters（API Gateway常見）
    if (event.queryStringParameters) {
      data = event.queryStringParameters;
    }

    // 4. 真正取參數
    const { datetime, location } = data || {};

    if (!datetime || !location) {
      return { error: '请提供 datetime 与 location' };
    }

    // ...下方原有代碼不變

    
    // 1. 地名标准化+偏差
    let { stdLoc, offset, isDefault } = getOffset(location);
    // 2. 真太阳时校正
    let solarDt = correctToSolarTime(datetime, offset);
    // 3. 查表用整点时间
    let lookupTime = getLookupTime(solarDt);
    // 4. 主表递减查找
    let { recTime, record } = await findBaziRecordInDB(db, lookupTime);

    if (record) {
      // 五行统计（支持“木土”两字，分拆计数）
      let wuxings = [
        record.year_wuxing, record.month_wuxing, record.day_wuxing, record.hour_wuxing
      ].filter(Boolean);
      let count = { "金": 0, "木": 0, "水": 0, "火": 0, "土": 0 };
      wuxings.forEach(w => {
        if (w) {
          w.split('').forEach(single => { if (count[single] !== undefined) count[single] += 1; });
        }
      });
      return {
        input: { datetime, location },
        corrected: {
          location: stdLoc,
          offset,
          solar_time: solarDt.toISOString().slice(0,16).replace('T',' '),
          lookup_time: recTime,
          note: isDefault ? "未能匹配地名，默认使用北京时间" : ""
        },
        bazi: record,
        summary: { five_elements_count: count }
      };
    } else {
      return {
        error: "查无命理数据",
        detail: `查表用时间：${lookupTime}，地名：${stdLoc}，请确认输入`
      }
    }
  } catch (e) {
    return { error: "云函数异常", detail: e.toString() }
  }
};
