# EventerNote Plus

🚀 为 [EventerNote](https://www.eventernote.com/) 网站提供全新的现代化UI界面和高级搜索功能的浏览器插件。

## ✨ 功能特性

### 🎨 UI重构
- **现代化设计语言** - 采用流行的设计系统，提供更优雅的视觉体验
- **深色模式** - 支持浅色/深色主题切换，保护眼睛
- **流畅动画** - 精心设计的过渡动画，提升交互体验
- **响应式布局** - 完美适配各种屏幕尺寸
- **紧凑模式** - 可选的紧凑布局，在小屏幕上显示更多内容

### 🔍 高级搜索
- **模糊匹配** - 智能搜索算法，即使拼写不准确也能找到结果
- **实时建议** - 输入时即时显示搜索建议
- **高级筛选** - 支持日期范围、标签、分类等多维度筛选
- **多种排序** - 按相关度、日期、标题等方式排序
- **搜索历史** - 自动记录搜索历史，快速重复搜索
- **搜索统计** - 显示搜索结果数量和匹配情况
- **结果高亮** - 搜索关键词自动高亮显示

### 🛡️ 原网站兼容
- **无侵入式设计** - 仅增强UI，不破坏原有功能
- **命名空间隔离** - 所有CSS类名带有前缀，避免冲突
- **动态监听** - 自动适配网站的动态内容更新
- **优雅降级** - 即使插件失效，原网站功能仍可正常使用

## 📦 安装方法

### Chrome/Edge 浏览器

1. 下载本项目代码：
   ```bash
   git clone https://github.com/yourusername/eventernote-plus.git
   cd eventernote-plus
   ```

2. 打开浏览器扩展管理页面：
   - Chrome: 访问 `chrome://extensions/`
   - Edge: 访问 `edge://extensions/`

3. 开启"开发者模式"（右上角开关）

4. 点击"加载已解压的扩展程序"

5. 选择项目文件夹

6. 访问 [EventerNote](https://www.eventernote.com/) 即可看到增强效果！

### Firefox 浏览器

1. 下载项目代码（同上）

2. 访问 `about:debugging#/runtime/this-firefox`

3. 点击"临时载入附加组件"

4. 选择项目中的 `manifest.json` 文件

## 🎯 使用指南

### 基础使用

插件安装后会自动在 EventerNote 网站上激活，无需额外配置。

### 搜索功能

1. **基础搜索**
   - 在增强的搜索框中输入关键词
   - 实时显示匹配建议
   - 按回车执行完整搜索

2. **高级筛选**
   - 点击搜索框右侧的筛选图标
   - 设置日期范围、排序方式等
   - 点击"应用"执行筛选

3. **搜索历史**
   - 在筛选面板中查看最近搜索
   - 点击历史记录快速重复搜索
   - 点击 × 删除单条历史

### 主题切换

1. 点击浏览器工具栏中的插件图标
2. 在弹出窗口中选择浅色或深色主题
3. 主题会立即应用到页面

### 紧凑模式

在 Popup 面板中切换"紧凑模式"开关，页面会减少间距，显示更多内容。

## 🏗️ 项目结构

```
eventernote-plus/
├── manifest.json           # 插件配置文件
├── background.js          # 后台服务脚本
├── scripts/               # 内容脚本
│   ├── utils.js          # 工具函数库
│   ├── ui-rebuild.js     # UI重构核心
│   ├── search-enhancement.js  # 搜索增强
│   └── content.js        # 主入口
├── styles/                # 样式文件
│   ├── reset.css         # 样式重置
│   ├── modern-ui.css     # 现代化UI样式
│   └── components.css    # 组件样式
├── popup/                 # 弹出窗口
│   ├── popup.html        # 界面结构
│   ├── popup.css         # 样式
│   └── popup.js          # 交互逻辑
└── icons/                 # 图标资源
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🛠️ 技术栈

- **Manifest V3** - 最新的浏览器插件标准
- **Vanilla JavaScript** - 纯原生JS，无依赖
- **CSS Variables** - 现代化的样式管理
- **Chrome Storage API** - 数据持久化
- **MutationObserver** - 监听DOM变化

## 🔧 开发指南

### 本地开发

1. 克隆项目并安装（无需依赖）
2. 按照上述安装方法加载插件
3. 修改代码后，在扩展管理页面点击"重新加载"按钮
4. 刷新 EventerNote 页面查看效果

### 调试技巧

- **Content Script 调试**: 在网页上右键 → 检查 → Console
- **Popup 调试**: 右键插件图标 → 检查弹出内容
- **Background 调试**: 扩展管理页面 → 服务工作进程 → 检查

### 代码规范

- 所有自定义类名必须以 `enplus-` 开头
- 使用 CSS Variables 定义颜色和尺寸
- 函数和变量使用驼峰命名
- 添加必要的注释

## 📝 待办事项

- [ ] 添加更多主题选项
- [ ] 支持自定义快捷键
- [ ] 导出/导入搜索历史
- [ ] 添加数据统计功能
- [ ] 支持更多语言
- [ ] 性能优化
- [ ] 单元测试

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [EventerNote](https://www.eventernote.com/) - 原始网站
- Chrome Extension 文档
- 所有贡献者

## 📧 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/yourusername/eventernote-plus/issues)
- 发送邮件到: your.email@example.com

## 🌟 Star History

如果这个项目对你有帮助，欢迎给个 Star ⭐️

---

**注意**: 本插件为第三方开发，与 EventerNote 官方无关。使用前请确保符合网站的使用条款。