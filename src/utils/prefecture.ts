const prefectureMap: Record<string, string> = {
  '1': '北海道',
  '2': '青森县',
  '3': '岩手县',
  '4': '宫城县',
  '5': '秋田县',
  '6': '山形县',
  '7': '福岛县',
  '8': '茨城县',
  '9': '枥木县',
  '10': '群马县',
  '11': '埼玉县',
  '12': '千叶县',
  '13': '东京都',
  '14': '神奈川县',
  '15': '新潟县',
  '16': '富山县',
  '17': '石川县',
  '18': '福井县',
  '19': '山梨县',
  '20': '长野县',
  '21': '岐阜县',
  '22': '静冈县',
  '23': '爱知县',
  '24': '三重县',
  '25': '滋贺县',
  '26': '京都府',
  '27': '大阪府',
  '28': '兵库县',
  '29': '奈良县',
  '30': '和歌山县',
  '31': '鸟取县',
  '32': '岛根县',
  '33': '冈山县',
  '34': '广岛县',
  '35': '山口县',
  '36': '德岛县',
  '37': '香川县',
  '38': '爱媛县',
  '39': '高知县',
  '40': '福冈县',
  '41': '佐贺县',
  '42': '长崎县',
  '43': '熊本县',
  '44': '大分县',
  '45': '宫崎县',
  '46': '鹿儿岛县',
  '47': '冲绳县',
  '90': '海外',
};

export function getPrefectureNameById(id: string): string {
  return prefectureMap[id] || '';
}

export function getIdByPrefectureName(name: string, prefixZero: boolean = false): string | null {
  const entry = Object.entries(prefectureMap).find(([_, prefectureName]) => prefectureName === name);
  if (!entry) return null;
  const id = entry[0];
  return prefixZero && id.length === 1 ? `0${id}` : id;
}

export const prefectureList: string[] = Object.values(prefectureMap);