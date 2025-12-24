export const parseBreadcrumb = () => {
  const breadcrumb: Array<{ title: string; href?: string }> = [];
	const breadcrumbItems = document.querySelectorAll('ul.breadcrumb > li');
	breadcrumbItems.forEach((li) => {
		const a = li.querySelector('a');
		if (a) {
			breadcrumb.push({ title: a.textContent?.trim() || '', href: a.getAttribute('href') || undefined });
		} else {
			// 末尾无链接
			breadcrumb.push({ title: li.textContent?.replace(/\s*[›>].*$/, '').trim() || '' });
		}
	});
  return breadcrumb;
}