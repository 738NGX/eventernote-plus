import { useEffect, useRef } from "react";
import { getIdByPrefectureName } from "../../utils/prefecture";

const allPrefNames = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県', '海外'
];

export default function PrefectureSelectMap({ isDark, selectedPref, onSelect }: {
  isDark: boolean;
  selectedPref: string;
  onSelect: (pref: string) => void;
}) {
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        // 这里假定 svg 路径和 PrefectureMap 一致
        const svgPath = chrome.runtime?.getURL?.('dist/jp.svg') || '/dist/jp.svg';
        const response = await fetch(svgPath);
        if (!response.ok) throw new Error('无法加载SVG文件');
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        svgElement.setAttribute('viewBox', '0 0 1000 846');
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', 'auto');
        // 统一灰色
        allPrefNames.forEach(pref => {
          const id = getIdByPrefectureName(pref, true);
          const path = svgElement.querySelector(`#JP${id}`) as SVGPathElement | null;
          if (path) {
            path.setAttribute('fill', isDark ? '#444' : '#e5e7eb');
            path.style.transition = 'opacity 0.3s, filter 0.3s';
            path.style.cursor = 'pointer';
            // 事件绑定前先移除旧事件（可选，防止重复绑定）
            path.replaceWith(path.cloneNode(true));
            const newPath = svgElement.querySelector(`#JP${id}`) as SVGPathElement | null;
            if (newPath) {
              newPath.addEventListener('mouseenter', () => {
                if (pref !== selectedPref) newPath.style.opacity = '0.3';
              });
              newPath.addEventListener('mouseleave', () => {
                newPath.style.opacity = '1';
              });
              newPath.addEventListener('click', () => {
                onSelect(pref);
              });
              // 选中高亮
              if (pref === selectedPref) {
                newPath.setAttribute('fill', '#f472b6');
                newPath.style.opacity = '1';
                newPath.style.filter = 'drop-shadow(0 0 6px #f472b6)';
              } else {
                newPath.style.filter = '';
              }
            }
          }
        });
        svgContainerRef.current!.innerHTML = '';
        svgContainerRef.current!.appendChild(svgElement);
      } catch (e) {
        svgContainerRef.current!.innerHTML = '<p>无法加载地图</p>';
      }
    };
    loadSvg();
  }, [isDark, selectedPref, onSelect]);

  return (
    <div style={{ width: '100%', height: 'auto', position: 'relative' }}>
      <div ref={svgContainerRef} style={{ width: '100%', height: 'auto' }} />
    </div>
  );
}
