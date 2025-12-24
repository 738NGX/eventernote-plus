import { parseBreadcrumb } from "../parseBreadcrumb";

/**
 * 解析当前页面上的用户列表和面包屑。
 * @returns { usersList, breadcrumb }
 */
export const parseUsersList = () => {
	const usersList: Array<{
		id: string;
		name: string;
		profileUrl: string;
		avatar: string;
	}> = [];

	// 解析用户列表
	const listItems = document.querySelectorAll('div.gb_users_list ul li.border');
	listItems.forEach((element) => {
		const id = element.id?.replace('user_', '') || '';
		const a = element.querySelector('a');
		const name = a?.textContent?.trim() || '';
		const profileUrl = a?.getAttribute('href') || '';
		const img = element.querySelector('img.img');
		const avatar = img?.getAttribute('src') || '';
		usersList.push({ id, name, profileUrl, avatar });
	});

	// 解析面包屑
	const breadcrumb = parseBreadcrumb();

	return { usersList, breadcrumb };
}