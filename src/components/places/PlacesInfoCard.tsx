import React from "react";
import { Card, Typography, Tag, Divider } from "antd";

const { Title, Paragraph, Text } = Typography;

const infoMap: Record<string, { desc: string; venues: string }> = {
  '北海道': {
    desc: '日本最北端，拥有广阔的自然风光、顶级美食（海鲜、拉面、汤咖喱）和漫长的雪季。活动规模宏大，与自然紧密结合。',
    venues: '札幌巨蛋、Zepp Sapporo、真驹内屋内竞技场',
  },
  '青森県': {
    desc: '以苹果产量第一和震撼的“睡魔祭”闻名。本州岛的最北端，冬季多雪，民风淳朴有力。',
    venues: 'Link Station Hall Aomori',
  },
  '岩手県': {
    desc: '宫泽贤治的故乡，拥有雄伟的岩手山和利亚斯式海岸。地广人稀，文化底蕴深厚。',
    venues: '盛冈市民文化Hall、岩手产业文化中心',
  },
  '宮城県': {
    desc: '东北地区的中心，首府仙台被称为“杜之都”。牛舌和毛豆泥是必尝美食。',
    venues: '宫城积水海姆超级竞技场、Sendai GIGS',
  },
  '秋田県': {
    desc: '以“秋田美人”、秋田犬和优质大米/清酒著称。拥有独特的生剥鬼传统。',
    venues: '秋田艺术剧场',
  },
  '山形県': {
    desc: '樱桃王国，也是拉面消费量极高的地方。以藏王树冰和温泉闻名。',
    venues: '山形县综合文化艺术馆',
  },
  '福島県': {
    desc: '水果王国（尤其是桃子），拥有会津若松的历史底蕴和夏威夷温泉度假村。',
    venues: 'Big Palette Fukushima、猪苗代野外音乐堂',
  },
  '茨城県': {
    desc: '纳豆的故乡，拥有筑波科学城和国营常陆海滨公园。',
    venues: 'Adastria Mito Arena',
  },
  '栃木県': {
    desc: '草莓产量第一，拥有世界遗产日光东照宫和鬼怒川温泉，以及著名的“宇都宫饺子”。',
    venues: '宇都宫市文化会馆',
  },
  '群馬県': {
    desc: '温泉大县（草津、伊香保），也是达摩娃娃的产地。自然资源丰富。',
    venues: 'Beisia Cultural Hall、G Messe Gunma',
  },
  '埼玉県': {
    desc: '东京的卧城，也是动画圣地巡礼的热门地。活动承载力极强。',
    venues: '埼玉超级竞技场、Belluna Dome',
  },
  '千葉県': {
    desc: '东京迪士尼乐园和成田机场的所在地。拥有漫长的海岸线和丰富的水产。',
    venues: '幕张展览馆、ZOZO Marine Stadium',
  },
  '東京都': {
    desc: '日本的政治、经济、文化中心。从秋叶原的亚文化到银座的奢华，这里汇聚了一切。',
    venues: '东京巨蛋、日本武道馆、国立竞技场、Zepp DiverCity',
  },
  '神奈川県': {
    desc: '拥有港口城市横滨、古都镰仓和温泉胜地箱根。横滨的中华街和未来港景色极佳。',
    venues: '横滨Arena、K-Arena Yokohama、PIA Arena MM',
  },
  '新潟県': {
    desc: '日本著名的米仓和酒豪之地。冬季豪雪是一大特色。',
    venues: '朱鹭展览馆',
  },
  '富山県': {
    desc: '拥有立山黑部阿尔卑斯路线，海鲜极鲜美。',
    venues: 'Aubade Hall',
  },
  '石川県': {
    desc: '首府金泽即“小京都”，以兼六园、金箔工艺和加贺友禅闻名。',
    venues: '本多之森北电Hall',
  },
  '福井県': {
    desc: '恐龙化石发现地，越前蟹是冬季顶级美味。幸福度排名常居日本前列。',
    venues: 'Sundome Fukui',
  },
  '山梨県': {
    desc: '富士山的北侧门户，水果王国，拥有富士急乐园。',
    venues: '河口湖 Stellar Theater',
  },
  '長野県': {
    desc: '日本的屋脊，拥有轻井泽避暑地和冬奥会举办地，荞麦面很有名。',
    venues: '长野 Big Hat、M-Wave',
  },
  '岐阜県': {
    desc: '拥有世界遗产白川乡合掌造，飞景牛肉质极佳。',
    venues: '长良川国际会议中心',
  },
  '静岡県': {
    desc: '富士山南侧，茶园遍布。也是模型之都。',
    venues: 'Ecopa Arena',
  },
  '愛知県': {
    desc: '以名古屋为中心，丰田汽车大本营。有独特的“名古屋饭”饮食文化。',
    venues: 'Vantelin Dome Nagoya、Aichi Sky Expo、日本碍子Hall',
  },
  '三重県': {
    desc: '拥有日本神社之首“伊势神宫”，松阪牛和铃鹿赛道也是其标志。',
    venues: '三重县营 Sun Arena',
  },
  '滋賀県': {
    desc: '拥有日本最大的湖泊“琵琶湖”，近江牛是著名特产。',
    venues: '滋贺县立艺术剧场 Biwako Hall',
  },
  '京都府': {
    desc: '千年古都，寺庙神社林立，日本传统文化的绝对核心。',
    venues: 'ROHM Theatre Kyoto',
  },
  '大阪府': {
    desc: '西日本中心，被称为“天下的厨房”。民风热情幽默，是漫才的发源地。',
    venues: '京瓷巨蛋、大阪城Hall、Zepp Osaka Bayside',
  },
  '兵庫県': {
    desc: '拥有港口城市神户和世界遗产姬路城。甲子园球场也位于此。',
    venues: 'World Memorial Hall、阪神甲子园球场',
  },
  '奈良県': {
    desc: '比京都更古老的都城，以奈良公园的鹿和东大寺大佛闻名。',
    venues: '奈良百年会馆',
  },
  '和歌山県': {
    desc: '蜜橘产量第一，拥有高野山和熊野古道等灵修圣地，白滨海滩也很著名。',
    venues: '和歌山 Big Whale',
  },
  '鳥取県': {
    desc: '人口最少的县，以“鸟取沙丘”和《名侦探柯南》作者故乡闻名。',
    venues: '米子会展中心',
  },
  '島根県': {
    desc: '拥有求姻缘最灵验的“出云大社”，神话色彩浓厚。',
    venues: '岛根县民会馆',
  },
  '岡山県': {
    desc: '“晴天之国”，桃太郎传说的发源地，也是西日本重要的交通枢纽。',
    venues: '冈山市民会馆、CRAZYMAMA KINGDOM',
  },
  '広島県': {
    desc: '拥有两处世界遗产（原爆圆顶、严岛神社）。广岛烧和牡蛎是必吃美食。',
    venues: '广岛 Green Arena',
  },
  '山口県': {
    desc: '本州最西端，以河豚料理和绝景“角岛大桥”著称。',
    venues: 'KDDI Ishin Hall',
  },
  '徳島県': {
    desc: '以著名的“阿波舞”和鸣门海峡的漩涡闻名。',
    venues: 'Asty Tokushima',
  },
  '香川県': {
    desc: '全日本面积最小的县，被称为“乌冬县”，艺术岛屿很有名。',
    venues: 'Rexxam Hall、Sanuki City Hall',
  },
  '愛媛県': {
    desc: '蜜橘王国，拥有古老的道后温泉和文豪夏目漱石的足迹。',
    venues: '爱媛县武道馆',
  },
  '高知県': {
    desc: '坂本龙马的故乡，拥有清澈的四万十川，民风豪爽，爱喝且擅饮。',
    venues: '高知县立县民文化Hall',
  },
  '福岡県': {
    desc: '九州的门户，美食天堂。离韩国和中国很近，交通便利。',
    venues: '福冈 PayPay Dome、Marine Messe 福冈、Zepp Fukuoka',
  },
  '佐賀県': {
    desc: '以有田烧和佐贺牛闻名。近年来因动画《佐贺偶像是传奇》而圣地化。',
    venues: 'SAGA Arena',
  },
  '長崎県': {
    desc: '异国情调浓郁的港口，拥有豪斯登堡、夜景和独特的“强棒面”饮食文化。',
    venues: '长崎 Brick Hall',
  },
  '熊本県': {
    desc: '拥有阿苏火山和熊本城，吉祥物“熊本熊”世界闻名。',
    venues: '熊本城 Hall、Grandmesse Kumamoto',
  },
  '大分県': {
    desc: '“温泉县”，别府和由布院是日本顶级的温泉胜地。',
    venues: '别府 B-Con Plaza、iichiko Grancia',
  },
  '宮崎県': {
    desc: '充满南国风情，芒果和地鸡炭火烧非常有名。',
    venues: '宫崎市民文化Hall',
  },
  '鹿児島県': {
    desc: '樱岛火山喷烟不断，黑猪肉和烧酒是当地名片。西乡隆盛的故乡。',
    venues: '川商 Hall',
  },
  '沖縄県': {
    desc: '曾经的琉球王国，拥有独特的岛屿文化、翡翠色的大海和美军基地文化。',
    venues: '冲绳 Arena',
  },
  '海外': {
    desc: '在日本娱乐和演出语境下，“海外”通常指针对外国粉丝的活动，包括世界巡演及Live Viewing。',
    venues: '梅赛德斯-奔驰文化中心',
  },
};

export default function PlacesInfoCard({ selectedPref }: { selectedPref: string }) {
  const info = infoMap[selectedPref] || { desc: '暂无数据', venues: '' };
  return (
    <Card
      style={{ width: '100%', minHeight: 320 }}
      hoverable
    >
      <Title level={3} style={{ marginBottom: 8 }}>{selectedPref}</Title>
      <Divider style={{ margin: '8px 0' }} />
      <Paragraph style={{ fontSize: 16, marginBottom: 16 }}>{info.desc}</Paragraph>
      <Text type="secondary" style={{ fontWeight: 500 }}>代表场馆：</Text>
      <div className="flex flex-wrap gap-2">
        {info.venues.split('、').map((venue, idx) => (
          <Tag color="pink" key={venue+idx} style={{ marginBottom: 4 }}>{venue}</Tag>
        ))}
      </div>
    </Card>
  );
}
