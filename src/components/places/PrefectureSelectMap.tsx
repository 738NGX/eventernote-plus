import { useEffect, useRef, useState } from "react";
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { prefectureList, getIdByPrefectureName } from "../../utils/prefecture";

export default function PrefectureSelectMap({ isDark, selectedPref, onSelect }: {
  isDark: boolean;
  selectedPref: string;
  onSelect: (pref: string) => void;
}) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredPref, setHoveredPref] = useState<string | null>(null);
  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<{ prefecture: string }>();

  useEffect(() => {
    const loadSvg = async () => {
      try {
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
        prefectureList.forEach(pref => {
          const id = getIdByPrefectureName(pref, true);
          const path = svgElement.querySelector(`#JP${id}`) as SVGPathElement | null;
          if (path) {
            path.setAttribute('fill', isDark ? '#444' : '#e5e7eb');
            path.style.transition = 'opacity 0.3s, filter 0.3s';
            path.style.cursor = 'pointer';
            path.replaceWith(path.cloneNode(true));
            const newPath = svgElement.querySelector(`#JP${id}`) as SVGPathElement | null;
            if (newPath) {
              newPath.addEventListener('mouseenter', (e) => {
                setHoveredPref(pref);
                const containerRect = svgContainerRef.current!.getBoundingClientRect();
                showTooltip({
                  tooltipLeft: (e as MouseEvent).clientX - containerRect.left + 8,
                  tooltipTop: (e as MouseEvent).clientY - containerRect.top + 8,
                  tooltipData: { prefecture: pref },
                });
              });
              newPath.addEventListener('mousemove', (e) => {
                const containerRect = svgContainerRef.current!.getBoundingClientRect();
                showTooltip({
                  tooltipLeft: (e as MouseEvent).clientX - containerRect.left + 8,
                  tooltipTop: (e as MouseEvent).clientY - containerRect.top + 8,
                  tooltipData: { prefecture: pref },
                });
              });
              newPath.addEventListener('mouseleave', () => {
                setHoveredPref(null);
                hideTooltip();
              });
              newPath.addEventListener('click', () => onSelect(pref));
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

  useEffect(() => {
    const svg = svgContainerRef.current?.querySelector('svg');
    if (!svg) return;
    prefectureList.forEach(pref => {
      const id = getIdByPrefectureName(pref, true);
      const path = svg.querySelector(`#JP${id}`) as SVGPathElement | null;
      if (path) {
        if (hoveredPref) {
          if (pref === hoveredPref) {
            path.style.opacity = '1';
          } else {
            path.style.opacity = '0.2';
          }
        } else {
          path.style.opacity = '1';
        }
      }
    });
  }, [hoveredPref]);

  return (
    <div style={{ width: '100%', height: 'auto', position: 'relative' }}>
      <div ref={svgContainerRef} style={{ width: '100%', height: 'auto' }} />
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
          <strong>{tooltipData.prefecture}</strong>
        </TooltipWithBounds>
      )}
    </div>
  );
}
