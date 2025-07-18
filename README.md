# bazi-mcp-plugin

## 八字命理 API（腾讯MCP 插件）

本插件基于真实数据库查表法，结合地理偏差校正与真太阳时换算，精准推算出四柱八字、五行分布与十神结构。  
适用于命理智能体接入、个性化命盘生成、命理工具插件等应用场景。

📁 数据库样本文件：`data/bazi_data_sample.json`  
（完整数据库请部署于 CloudBase，不公开托管）

---

## ✨ 插件功能特色

- 输入阳历生日 `datetime` + 中文地点 `location` 即可自动完成：
  - ✅ 城市地理偏差匹配（例：「深圳」 → 「广东省-深圳市-龙岗区」）
  - ✅ 真太阳时校正
  - ✅ 节气换年换月
  - ✅ 推算完整四柱、五行、十神、藏干
  - ✅ 附带五行统计结果（木火土金水数量）

---

## 🚀 API 调用说明（无需 Key）

- **接口地址**：

https://bazi-api-1gzleh3n9afc85a9-1322048228.ap-shanghai.app.tcloudbase.com/getBaziFull

pgsql
复制
编辑

- **请求方法**：POST

- **请求参数**（JSON）：

```json
{
  "datetime": "1994-02-07 19:20",
  "location": "深圳"
}
返回示例（结构）：

json
复制
编辑
{
  "input": {...},
  "corrected": {...},
  "bazi": {...},
  "summary": {
    "five_elements_count": {
      "金": 0,
      "木": 4,
      "水": 1,
      "火": 1,
      "土": 2
    }
  }
}
🧪 API 示例返回（完整）
json
复制
编辑
{
  "input": {
    "datetime": "1994-02-07 19:20",
    "location": "深圳"
  },
  "corrected": {
    "location": "广东省-深圳市-龙岗区",
    "offset": -22.916666666666668,
    "solar_time": "1994-02-07 19:42",
    "lookup_time": "1994-02-07 19:00",
    "note": ""
  },
  "bazi": {
    "datetime": "1994-02-07 19:00",
    "year_ganzhi": "甲戌",
    "month_ganzhi": "丙寅",
    "day_ganzhi": "甲子",
    "hour_ganzhi": "甲戌",
    "year_wuxing": "木土",
    "month_wuxing": "火木",
    "day_wuxing": "木水",
    "hour_wuxing": "木土",
    "year_canggan": ["戊", "辛", "丁"],
    "month_canggan": ["甲", "丙", "戊"],
    "day_canggan": ["癸"],
    "hour_canggan": ["戊", "辛", "丁"],
    "year_shishen_gan": "比肩",
    "month_shishen_gan": "食神",
    "day_shishen_gan": "日主",
    "hour_shishen_gan": "比肩",
    "year_shishen_zhi": ["偏财", "正官", "伤官"],
    "month_shishen_zhi": ["比肩", "食神", "偏财"],
    "day_shishen_zhi": ["正印"],
    "hour_shishen_zhi": ["偏财", "正官", "伤官"]
  },
  "summary": {
    "five_elements_count": {
      "金": 0,
      "木": 4,
      "水": 1,
      "火": 1,
      "土": 2
    }
  }
}
📬 联系方式
如需协助或集成支持，请联系：
📩 [微信]13241113386

🛠 技术部署说明
本插件为无密钥调用（可直接在 MCP 平台使用）

云函数部署平台：腾讯云 CloudBase

支持标准 POST JSON 请求，无需额外鉴权
