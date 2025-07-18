# bazi-mcp-plugin
八字命理API
# 八字命理 API（腾讯MCP插件）

本插件基于真实数据库查表法，结合地理偏差校正与真太阳时换算，精准推算出四柱八字、五行分布与十神结构。适用于命理智能体接入、个性化命盘生成、命理工具插件等应用场景。
> 📌 数据库样本文件见 `data/bazi_data_sample.json`，完整数据库请部署于 CloudBase，不公开托管。

---

## 🚀 插件功能特色

- 输入阳历生日 `datetime` + 中文地点 `location` 即可自动：
  - 匹配城市地理偏差（如“深圳” → “广东省-深圳市-龙岗区”）
  - 校正真太阳时
  - 节气换年换月
  - 返回完整四柱、五行、十神、藏干
  - 附带五行统计结果

---
🚀 API 調用說明（無需 Key）
接口地址：

bash
复制
编辑
https://bazi-api-1gzleh3n9afc85a9-1322048228.ap-shanghai.app.tcloudbase.com/getBaziFull
請求方法：POST

請求參數格式（JSON）：

json
复制
编辑
{
  "datetime": "1994-02-07 19:20",
  "location": "深圳"
}
回傳範例：

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
    "solar_time": "1994-02-07 19:42"
  },
  "bazi": {
    "year_ganzhi": "甲戌",
    "month_ganzhi": "丙寅",
    "day_ganzhi": "甲子",
    "hour_ganzhi": "甲戌",
    "year_wuxing": "木土",
    ...
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

## 🧪 API 示例返回（真实格式）

```json
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
    "year_canggan": "[戊, 辛, 丁]",
    "month_canggan": "[甲, 丙, 戊]",
    "day_canggan": "[癸]",
    "hour_canggan": "[戊, 辛, 丁]",
    "year_shishen_gan": "比肩",
    "month_shishen_gan": "食神",
    "day_shishen_gan": "日主",
    "hour_shishen_gan": "比肩",
    "year_shishen_zhi": "[偏财, 正官, 伤官]",
    "month_shishen_zhi": "[比肩, 食神, 偏财]",
    "day_shishen_zhi": "[正印]",
    "hour_shishen_zhi": "[偏财, 正官, 伤官]"
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
