import { Avatar, Card, Divider } from "antd";
import GitHubRepoCard from "../github-repo-card"
import { MailOutlined, QqOutlined } from "@ant-design/icons";

export const About = () => {
  return (
    <div>
      <h1>关于本项目</h1>
      <p>感谢阅读本项目的介绍文档！你可以随时从页面底栏的“关于”回到本页。</p>
      <p>EventerNote Plus是一款让www.eventernote.com更好用的浏览器插件，重新制作了页面并且增加了更多新功能。未来即将上线手机版。</p>
      <p>本项目遵循MIT协议开源。</p>
      <GitHubRepoCard url="https://github.com/738NGX/eventernote-plus" />
      <h2>开发者</h2>
      <p>738NGX from 上海财经大学偶像研究部</p>
      <div className="grid grid-cols-2 my-2 gap-2">
        <Card
          hoverable
        >
          <Card.Meta
            avatar={<Avatar shape="square" size={64} src="https://eventernote.s3.ap-northeast-1.amazonaws.com/images/users/206530/icon_s.jpg?1748877661" />}
            title={<a href="/users/jny_738ngx">738NGX</a>}
            description="@jny_738ngx"
          />
          <p>未来ずら～！</p>
          <p><QqOutlined className="mr-2" />2857323020 <Divider vertical /> <MailOutlined className="mr-2" />jny738ngx@gmail.com</p>
        </Card>
        <Card
          hoverable
        >
          <Card.Meta
            avatar={<Avatar shape="square" size={64} src="https://eventernote.s3.ap-northeast-1.amazonaws.com/images/users/216247/icon_s.jpg?1754139131" />}
            title={<a href="/users/SUFE_IDOL">上海財経大学アイドル研究部</a>}
            description="@SUFE_IDOL"
          />
          <p>上海財経大学アイドル研究部の公式アカウントです。メンバーが参加したイベントを記録する。</p>
        </Card>
      </div>
      <h2>FAQ</h2>
      <p>Q: 为什么一部分艺人没有头像显示？</p>
      <p>A: 目前项目的图片资源存储在以下仓库中，你可以自由上传你想要的艺人头像。具体流程参考仓库README文件。</p>
      <GitHubRepoCard url="https://github.com/738NGX/enplus-images" />
      <p>Q: 如果仍想要使用原版UI，但是又需要年度报告等额外功能，应该怎么做？</p>
      <p>A: 点击浏览器地址栏右侧按钮呼出浏览器扩展菜单。在列表中找到EventerNote Plus点击。在弹出菜单中关闭UI替换功能，然后刷新页面即可。</p>
    </div>
  );
};