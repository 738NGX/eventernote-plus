import { useState, useRef, useEffect } from "react";
import { getIdByPrefectureName } from "../../utils/prefecture";
import { EventData } from "../../utils/events/eventdata";

export interface PrefectureCount {
  [key: string]: number;
}

export const generatePrefectureMapData = (events: EventData[]): PrefectureCount => {
  const prefectureCount: PrefectureCount = {};
  events.forEach((event: EventData) => {
    if (!event.venue || !event.venue.prefecture) return;

    const prefectureName = event.venue.prefecture.name?.trim(); // 确保名称没有多余空格
    if (prefectureName) {
      if (prefectureCount[prefectureName]) {
        prefectureCount[prefectureName] += 1;
      } else {
        prefectureCount[prefectureName] = 1;
      }
    }
  });
  return prefectureCount;
};

export const PrefectureMap = ({ data }: { data: PrefectureCount }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const svgPath = chrome.runtime.getURL('dist/jp.svg'); // 保留dist路径
        const response = await fetch(svgPath);
        if (!response.ok) {
          throw new Error('无法加载SVG文件');
        }
        const svgText = await response.text();
        setSvgContent(svgText);
      } catch (error) {
        console.error('加载SVG文件时出错:', error);
      }
    };

    loadSvg();
  }, []);

  useEffect(() => {
    if (!svgContainerRef.current || !svgContent) return;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // 确保SVG有viewBox和preserveAspectRatio
    if (!svgElement.hasAttribute('viewBox')) {
      svgElement.setAttribute('viewBox', '0 0 1000 846');
    }
    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // 设置宽度为100%，高度自动
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', 'auto');

    // 获取颜色深度函数
    const getColor = (count: number): string => {
      if (count === 0) return '#e5e7eb'; // Gray-100
      if (count <= 2) return '#93c5fd'; // Blue-300
      if (count <= 5) return '#3b82f6'; // Blue-500
      return '#1e40af'; // Blue-900
    };

    // 应用热力图数据
    Object.entries(data).forEach(([prefecture, count]) => {
      if (!prefecture) return;
      const prefectureId = getIdByPrefectureName(prefecture, true)
      const path = svgElement.querySelector(`#JP${prefectureId}`) as SVGPathElement | null;
      if (path) {
        path.setAttribute('fill', getColor(count));

        // 添加鼠标悬停事件
        path.addEventListener('mouseenter', (e: MouseEvent) => {
          path.setAttribute('stroke', '#000'); // 鼠标悬停时添加边框
          path.setAttribute('stroke-width', '2');
          const tooltip = document.createElement('div');
          tooltip.id = 'svg-tooltip';
          tooltip.style.position = 'absolute';
          tooltip.style.background = 'rgba(0, 0, 0, 0.7)';
          tooltip.style.color = '#fff';
          tooltip.style.padding = '4px 8px';
          tooltip.style.borderRadius = '4px';
          tooltip.style.fontSize = '12px';
          tooltip.style.pointerEvents = 'none';
          tooltip.style.top = `${e.clientY + 10}px`; // 鼠标位置 + 偏移量
          tooltip.style.left = `${e.clientX + 10}px`;
          tooltip.innerText = `${prefecture}: ${count} 次活动`;
          document.body.appendChild(tooltip);
        });

        path.addEventListener('mouseleave', () => {
          path.removeAttribute('stroke');
          path.removeAttribute('stroke-width');
          const tooltip = document.getElementById('svg-tooltip');
          if (tooltip) {
            tooltip.remove();
          }
        });
      } else {
        console.warn(`SVG中找不到id或name为${prefecture}的元素`);
      }
    });

    // 清空容器并插入SVG
    svgContainerRef.current.innerHTML = '';
    svgContainerRef.current.appendChild(svgElement);
  }, [svgContent, data]);

  return (
    <div ref={svgContainerRef} style={{ width: '100%', height: 'auto', position: 'relative' }}>
      {!svgContent && <p>无法加载地图，请检查路径或文件。</p>}
    </div>
  );
};