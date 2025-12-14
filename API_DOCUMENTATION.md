# Eventernote 搜索建议 API 文档

## API 概述

Eventernote 网站使用一个名为"垂直搜索"(Vertical Search)的 API 来提供实时搜索建议功能。

## API 端点

### 搜索建议 API

**URL:** `https://www.eventernote.com/api/vertical/search`

**请求方法:** GET

**参数:**
- `keyword` (必需): 搜索关键词字符串
- `crumb` (可选): CSRF 保护令牌，从页面 meta 标签获取

## 请求示例

### 基本请求（推荐）
```
GET https://www.eventernote.com/api/vertical/search?keyword=水樹
```

### 带 CSRF 令牌的请求
```
GET https://www.eventernote.com/api/vertical/search?keyword=水樹&crumb=ce5a5005b08218f781f8222df91379e8da02baef
```

## 响应格式

### 响应结构
```json
{
  "info": {
    "total": 1,
    "return_count": 1,
    "offset": 1,
    "page": 1,
    "total_page": 1
  },
  "results": [
    {
      "events": [...],    // 匹配的活动/イベント列表
      "actors": [...],    // 匹配的声优/艺术家列表
      "places": [...]     // 匹配的场地列表
    }
  ],
  "code": 200
}
```

### 响应示例 - 搜索"水樹"

```json
{
  "info": {
    "total": 1,
    "return_count": 1,
    "offset": 1,
    "page": 1,
    "total_page": 1
  },
  "results": [
    {
      "events": [
        {
          "id": 445437,
          "event_name": "NANA MIZUKI LIVE VISION 2025-2026＋ 台北公演 Day.2",
          "event_date": "2026-04-12",
          "user_id": 28548,
          "actor_id": "28",
          "place_id": 4296,
          "url": "https://www.eventernote.com/events/445437",
          "image_url": "https://eventernote.s3.amazonaws.com/images/events/445437.jpg",
          "thumb_url": "https://eventernote.s3.amazonaws.com/images/events/445437_s.jpg",
          "actors": [
            {
              "id": 28,
              "name": "水樹奈々",
              "kana": "みずきなな",
              "initial": "み",
              "sex": 1,
              "favorite_count": 6072,
              "has_image": 0
            }
          ],
          "place": {
            "id": 4296,
            "place_name": "台北國際會議中心 (TICC / Taipei International Convention Center)",
            "prefecture": 90,
            "address": "11049 台北市信義路五段1號"
          }
        }
      ],
      "actors": [
        {
          "id": 28,
          "name": "水樹奈々",
          "kana": "みずきなな",
          "initial": "み",
          "sex": 1,
          "favorite_count": 6072,
          "keyword": "近藤奈々,こんどうなな",
          "has_image": 0
        }
      ],
      "places": null
    }
  ],
  "code": 200
}
```

### 响应示例 - 搜索"田村"

```json
{
  "results": [
    {
      "events": [
        {
          "id": 454565,
          "event_name": "『Dancing☆Starプリキュア』The Stage3 Blu-ray/DVD発売記念イベント プリキュアとハイタッチ会",
          "event_date": "2026-08-02"
        }
      ],
      "actors": [
        {
          "id": 3,
          "name": "田村ゆかり",
          "kana": "たむらゆかり",
          "initial": "た",
          "sex": 1,
          "favorite_count": 3954,
          "keyword": "田村由香里"
        },
        {
          "id": 2395,
          "name": "田村睦心",
          "kana": "たむらむつみ",
          "favorite_count": 95
        }
      ],
      "places": [
        {
          "id": 2632,
          "place_name": "長浜バイオ大学",
          "prefecture": 25,
          "address": "滋賀県長浜市田村町1266"
        }
      ]
    }
  ]
}
```

## 前端实现

### JavaScript 实现 (来自 eventernote.js)

```javascript
// VerticalSearch 类初始化
var vsOptions = {
  keyword_box: ".search_box .vertical_search_box",
  result_box: ".search_box .vertical_search_result"
};
window.vertical_search = new VerticalSearch(vsOptions);

// 搜索触发机制
VerticalSearch.prototype.observeBox = function() {
  var _this = this;
  var timer = null;
  var input_box = $(this.keyword_box);
  var prev_val = $(input_box).val();

  $(input_box).on("focus", function() {
    window.clearInterval(timer);
    // 每 20ms 检查一次输入框的值
    timer = window.setInterval(function() {
      var new_val = $(input_box).val();
      if ( new_val == '' ) _this.clearResultBox();
      if ( prev_val != new_val ) {
        _this.search();
      }
      prev_val = new_val;
    }, 20);
  });
};

// 调用搜索 API
VerticalSearch.prototype.search = function(e){
  var _this = this;
  var keyword = $(_this.keyword_box).val();
  if (!keyword) {
    return _this.clearResultBox();
  }
  
  _this.searching = true;
  _this.clearResultBox();
  
  var params = {};
  params.keyword = keyword;
  
  Eventernote.verticalSearch(params, success, failure);
}
```

## 搜索触发条件

根据源代码分析，搜索建议的触发机制如下：

1. **触发时机**: 用户在搜索框获得焦点(focus)时
2. **检测间隔**: 每 20 毫秒检查一次输入框的值
3. **最小字符数**: 无最小字符数限制（只要不为空即可触发）
4. **输入延迟**: 实际上采用轮询机制，每 20ms 检查一次变化
5. **空值处理**: 当输入框为空时，清空结果框

## 实际使用建议

为了减少 API 调用次数和优化用户体验，建议：

1. **添加防抖(debounce)**: 在用户停止输入后 200-300ms 再发起请求
2. **设置最小字符数**: 至少 2 个字符后再开始搜索
3. **请求缓存**: 缓存最近的搜索结果
4. **取消旧请求**: 当新的搜索开始时，取消正在进行的旧请求

## 注意事项

1. API 不需要身份验证
2. `crumb` 参数是可选的，用于 CSRF 保护
3. 返回结果同时包含活动(events)、声优/艺术家(actors)和场地(places)三类数据
4. 原网站使用每 20ms 的轮询机制，这可能导致频繁的 API 调用
5. 响应数据为 JSON 格式，编码为 UTF-8

## 数据字段说明

### Actor (声优/艺术家) 字段
- `id`: 声优 ID
- `name`: 声优名称
- `kana`: 假名读音
- `initial`: 首字母
- `sex`: 性别 (1=女性, 2=男性)
- `favorite_count`: 收藏数量
- `keyword`: 关键词/别名
- `has_image`: 是否有头像

### Event (活动) 字段
- `id`: 活动 ID
- `event_name`: 活动名称
- `event_date`: 活动日期
- `place_id`: 场地 ID
- `actor_id`: 参与的声优 ID
- `url`: 活动详情页 URL
- `image_url`: 活动图片 URL
- `thumb_url`: 缩略图 URL

### Place (场地) 字段
- `id`: 场地 ID
- `place_name`: 场地名称
- `prefecture`: 都道府县
- `address`: 地址
- `postalcode`: 邮编
- `capacity`: 容量

## 测试命令 (PowerShell)

```powershell
# 测试基本搜索
Invoke-WebRequest -Uri "https://www.eventernote.com/api/vertical/search?keyword=水樹" -Method GET -UseBasicParsing

# 测试不同关键词
Invoke-WebRequest -Uri "https://www.eventernote.com/api/vertical/search?keyword=田村" -Method GET -UseBasicParsing

# 格式化输出
$response = Invoke-WebRequest -Uri "https://www.eventernote.com/api/vertical/search?keyword=水樹" -Method GET -UseBasicParsing
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```
