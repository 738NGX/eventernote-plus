import { useState, useRef, useEffect, useCallback } from "react";
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { getIdByPrefectureName, prefectureList } from "../../utils/prefecture";
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

export const PrefectureMap = ({ data, isDark }: { data: PrefectureCount, isDark?: boolean }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const allPrefNames = prefectureList;
  const fullData: PrefectureCount = {};
  allPrefNames.forEach(name => {
    fullData[name] = data[name] || 0;
  });
  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{ prefecture: string; count: number }>();
  const [hoveredPref, setHoveredPref] = useState<string | null>(null);

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
    const getColor = (count: number, isDark: boolean | undefined): string => {
      if (count === 0) return isDark ? '#031125' : '#E3E4E6';
      if (count <= 5) return isDark ? '#831843' : '#F9A8D4';
      if (count <= 15) return isDark ? '#BE185D' : '#EC4899';
      if (count <= 30) return isDark ? '#EC4899' : '#BE185D';
      return isDark ? '#F9A8D4' : '#831843';
    };

    // 应用热力图数据
    Object.entries(fullData).forEach(([prefecture, count]) => {
      const prefectureId = getIdByPrefectureName(prefecture, true)
      const path = svgElement.querySelector(`#JP${prefectureId}`) as SVGPathElement | null;
      if (path) {
        path.setAttribute('fill', getColor(count, isDark));
        // 统一 transition 效果
        path.style.transition = 'opacity 0.3s ease';

        // 移除旧事件，防止重复绑定
        path.onmouseenter = null;
        path.onmousemove = null;
        path.onmouseleave = null;

        path.addEventListener('mouseenter', (e: MouseEvent) => {
          setHoveredPref(prefecture);
        });
        path.addEventListener('mousemove', (e: MouseEvent) => {
          // 让 tooltip 基于 svg 容器定位，消除页面滚动和布局偏移
          const containerRect = svgContainerRef.current!.getBoundingClientRect();
          showTooltip({
            tooltipLeft: e.clientX - containerRect.left + 8,
            tooltipTop: e.clientY - containerRect.top + 8,
            tooltipData: { prefecture, count },
          });
        });
        path.addEventListener('mouseleave', () => {
          setHoveredPref(null);
          hideTooltip();
        });
      } else {
        console.warn(`SVG中找不到id或name为${prefecture}的元素`);
      }
    });

    // 清空容器并插入SVG
    svgContainerRef.current.innerHTML = '';
    svgContainerRef.current.appendChild(svgElement);
  }, [svgContent, data, isDark]);

  // 高亮与淡化处理，响应 hoveredPref 变化
  useEffect(() => {
    if (!svgContainerRef.current) return;
    const svg = svgContainerRef.current.querySelector('svg');
    if (!svg) return;
    if (hoveredPref) {
      Object.entries(fullData).forEach(([prefecture]) => {
        const prefectureId = getIdByPrefectureName(prefecture, true)
        const path = svg.querySelector(`#JP${prefectureId}`) as SVGPathElement | null;
        if (path) {
          if (prefecture === hoveredPref) {
            path.style.opacity = '1';
            path.style.filter = 'drop-shadow(0 0 6px #f472b6)';
          } else {
            path.style.opacity = '0.15';
            path.style.filter = '';
          }
        }
      });
    } else {
      Object.entries(fullData).forEach(([prefecture]) => {
        const prefectureId = getIdByPrefectureName(prefecture, true)
        const path = svg.querySelector(`#JP${prefectureId}`) as SVGPathElement | null;
        if (path) {
          path.style.opacity = '1';
          path.style.filter = '';
        }
      });
    }
  }, [hoveredPref, data]);

  return (
    <div style={{ width: '100%', height: 'auto', position: 'relative' }}>
      <style>{`
        /* 兼容 SSR/CSR 淡化动画 */
        .jp-pref-map path {
          transition: opacity 0.3s, filter 0.3s;
        }
      `}</style>
      <div ref={svgContainerRef} className="jp-pref-map" style={{ width: '100%', height: 'auto' }} />
      {!svgContent && <p>无法加载地图，请检查路径或文件。</p>}
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: isDark ? '#333' : '#222',
            color: '#fff',
            padding: '8px',
            borderRadius: '4px',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <strong>{tooltipData.prefecture}</strong>: {tooltipData.count} 次活动
        </TooltipWithBounds>
      )}
    </div>
  );
};