import { parseEventList } from "../events/parseEventList";
import type { EventData } from "../events/eventdata";
import { getPrefectureNameById } from "../../utils/prefecture";

export interface PlaceDetailHistory {
	id: string;
	username: string;
	avatarUrl: string;
	profileUrl: string;
	updatedAgo: string;
}
export interface PlaceDetailData {
	id: string;
	name: string;
	address: string;
	tel: string;
	website: string;
	capacity: string;
	seatInfoUrl: string;
	tips: string;
	googleMapUrl: string;
	latitude?: string;
	longitude?: string;
	prefectureId: string;
	prefectureName: string;
	editors: PlaceDetailHistory[];
	events: EventData[];
}

export const parsePlacesDetailData = (): PlaceDetailData => {
	const page = document.querySelector('.span8.page');

	// id from url
	const url = window.location.pathname;
	const idMatch = url.match(/\/places\/(\d+)/);
	const id = idMatch ? idMatch[1] : '';

	// 名称
	const name = page!.querySelector('.gb_place_detail_title h2')?.textContent?.trim() || '';

	// 都道府县信息（从面包屑）
	let prefectureId = '', prefectureName = '';
	const breadcrumb = document.querySelector('.breadcrumb');
	if (breadcrumb) {
		const prefA = breadcrumb.querySelector('a[href^="/places/prefecture/"]');
		if (prefA) {
			const prefMatch = prefA.getAttribute('href')?.match(/\/places\/prefecture\/(\d+)/);
			if (prefMatch) {
				prefectureId = prefMatch[1];
				prefectureName = getPrefectureNameById(prefectureId);
			}
		}
	}

	// 详情表格
	let address = '', tel = '', website = '', capacity = '', seatInfoUrl = '', tips = '', googleMapUrl = '';
	// 只遍历 .gb_place_detail_table 下的表格行
	const tableRows = page?.querySelector('.gb_place_detail_table')?.querySelectorAll('tr') || [];
	tableRows.forEach(tr => {
		const th = tr.querySelector('td')?.textContent?.trim();
		const td = tr.querySelectorAll('td')[1];
		if (!th || !td) return;
		if (th.includes('所在地')) {
			address = td.textContent?.trim() || '';
			const a = td.querySelector('a');
			if (a) {
				address = a.textContent?.trim() || address;
				if (a.href && a.href.includes('maps.google.com')) {
					googleMapUrl = a.href;
				}
			}
		} else if (th.includes('電話番号')) {
			tel = td.textContent?.trim() || '';
		} else if (th.includes('公式サイト')) {
			const a = td.querySelector('a');
			website = a?.getAttribute('href') || '';
		} else if (th.includes('収容人数')) {
			capacity = td.textContent?.trim() || '';
		} else if (th.includes('座席情報')) {
			const a = td.querySelector('a');
			seatInfoUrl = a?.getAttribute('href') || '';
		} else if (th.includes('会場TIPS')) {
			// 保留换行和链接文本
			let html = td.innerHTML;
			// <br>转为\n
			html = html.replace(/<br\s*\/?>/gi, '\n');
			// a标签转为文本(链接)
			html = html.replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)');
			// 去除其他标签
			html = html.replace(/<[^>]+>/g, '');
			tips = html.trim();
		}
	});

	// 右侧地图按钮（如有）
	if (!googleMapUrl) {
		const mapBtn = document.querySelector('.span4.page .btn[href*="maps.google.com"]');
		if (mapBtn) {
			googleMapUrl = mapBtn.getAttribute('href') || '';
		}
	}

	// 编辑历史
	const editors: PlaceDetailHistory[] = [];
	page!.querySelectorAll('.gb_history_editor_list ul#authors li').forEach(li => {
		const a = li.querySelector('a.noline');
		const img = a?.querySelector('img');
		const username = img?.alt || a?.textContent?.trim() || '';
		const avatarUrl = img?.getAttribute('src') || '';
		const profileUrl = a?.getAttribute('href') || '';
		const updatedAgo = a?.querySelector('span.s.color2')?.textContent?.trim() || '';
		if (profileUrl && username) {
			// id from url
			const idMatch = profileUrl.match(/\/users\/([^/]+)/);
			editors.push({
				id: idMatch ? idMatch[1] : '',
				username,
				avatarUrl,
				profileUrl,
				updatedAgo
			});
		}
	});


	// 经纬度提取
	let latitude: string | undefined = undefined;
	let longitude: string | undefined = undefined;
	const scripts = Array.from(document.querySelectorAll('script'));
	for (const script of scripts) {
		const text = script.textContent || '';
		// 匹配 var lat = '...'; var lon = '...';
		const latMatch = text.match(/var\s+lat\s*=\s*['"]([\d.\-]+)['"]/);
		const lonMatch = text.match(/var\s+lon\s*=\s*['"]([\d.\-]+)['"]/);
		if (latMatch && lonMatch) {
			latitude = latMatch[1];
			longitude = lonMatch[1];
			break;
		}
	}

	// 活动列表
	const events = parseEventList(page!.querySelector('.gb_event_list'));

	return {
		id,
		name,
		address,
		tel,
		website,
		capacity,
		seatInfoUrl,
		tips,
		googleMapUrl,
		latitude,
		longitude,
		prefectureId,
		prefectureName,
		editors,
		events
	};
}
