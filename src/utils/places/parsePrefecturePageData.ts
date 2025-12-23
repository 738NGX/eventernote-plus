import { getPrefectureNameById } from "../../utils/prefecture";

export interface PlaceInfo {
  id: string;
  name: string;
}

export interface PrefecturePageData {
  prefectureName: string;
  prefectureId: string;
  places: PlaceInfo[];
}

export const parsePrefecturePageData = (): PrefecturePageData => {
  const emptyData = { prefectureName: '', prefectureId: '', places: [] };

  const page = document.querySelector('.span8.page');
  if (!page) return emptyData;

  // 都道府县名字
  const header = page.querySelector('.page-header h2');
  if (!header) return emptyData;
  // 例：鳥取県のイベント・ライブ会場一覧 74件
  const url = window.location.href.split('?')[0];
  const idMatch = url.match(/\/places\/prefecture\/(\d+)/);
  let prefectureId = '';
  if (idMatch) {
    prefectureId = idMatch[1];
  }
  if (!prefectureId) return emptyData;
  const prefectureName = getPrefectureNameById(prefectureId);

  // 场馆列表
  const places: PlaceInfo[] = [];
  const placeLinks = page.querySelectorAll('.gb_places_list li a');
  placeLinks.forEach(a => {
    const href = a.getAttribute('href') || '';
    const idMatch = href.match(/\/places\/(\d+)/);
    if (idMatch) {
      places.push({
        id: idMatch[1],
        name: a.textContent?.trim() || ''
      });
    }
  });

  return {
    prefectureName,
    prefectureId,
    places
  };
}