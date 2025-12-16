// ActorWordCloud.tsx
import React, { useCallback, useMemo } from 'react';
import { Wordcloud } from '@visx/wordcloud';
import { scaleLog } from '@visx/scale';
import { ParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';

// 1. 定义接口类型
export interface WordData {
  text: string;
  value: number;
}

interface CloudInnerProps {
  width: number;
  height: number;
  data: WordData[];
  onWordMove: (event: React.MouseEvent, word: any) => void;
  onWordOut: () => void;
}

// 2. 模拟数据 (带类型)
const rawData: WordData[] = [
  { text: 'React', value: 100 },
  { text: 'TypeScript', value: 90 },
  { text: 'GraphQL', value: 80 },
  { text: 'Node.js', value: 70 },
  { text: 'Next.js', value: 60 },
  { text: 'Vite', value: 50 },
  { text: 'Webpack', value: 40 },
  { text: 'Three.js', value: 30 },
  { text: 'D3', value: 85 },
  { text: 'CSS', value: 45 },
];

// 3. 纯展示组件
const CloudInner = React.memo(({ width, height, data, onWordMove, onWordOut }: CloudInnerProps) => {
  const fontScale = useMemo(() => scaleLog({
    domain: [Math.min(...data.map((w) => w.value)), Math.max(...data.map((w) => w.value))],
    range: [20, 80],
  }), [data]);

  // 固定随机数种子
  const fixedRandom = useCallback(() => 0.5, []);

  return (
    <div className="wordcloud-wrapper">
      <Wordcloud
        words={data}
        width={width}
        height={height}
        fontSize={(d) => fontScale(d.value)}
        font="Impact"
        padding={2}
        spiral="archimedean"
        rotate={0}
        random={fixedRandom}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <text
              key={w.text}
              className="cloud-word"
              fill={['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'][i % 4]}
              textAnchor="middle"
              dominantBaseline="middle"
              // @ts-ignore: visx 的类型定义里 w.x 可能是 undefined，但实际一定会有的，忽略它
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              style={{
                fontSize: w.size,
                fontFamily: w.font,
                cursor: 'pointer',
                transition: 'opacity 0.3s ease'
              }}
              onMouseMove={(e) => onWordMove(e, w)}
              onMouseLeave={onWordOut}
            >
              {w.text}
            </text>
          ))
        }
      </Wordcloud>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
});


// 4. 主组件
export function ActorWordCloud({ data }: { data: WordData[] }) {
  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<WordData>(); // 这里传入泛型

  const handleWordMove = useCallback((event: React.MouseEvent, word: any) => {
    const svgElement = event.target as SVGElement;
    const owner = svgElement.ownerSVGElement;
    if (!owner) return;

    const coords = localPoint(owner, event);
    if (!coords) return;

    showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: word,
    });
  }, [showTooltip]);

  const handleWordOut = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  return (
    <div style={{ width: '100%', height: '500px', background: 'rgba(255,255,255,0.5)', position: 'relative' }}>
      <style>{`
        .wordcloud-wrapper:hover .cloud-word {
          opacity: 0.1;
        }
        .wordcloud-wrapper .cloud-word:hover {
          opacity: 1 !important;
        }
      `}</style>

      <ParentSize>
        {({ width, height }) => (
          <CloudInner
            width={width}
            height={height}
            data={data}
            onWordMove={handleWordMove}
            onWordOut={handleWordOut}
          />
        )}
      </ParentSize>

      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: '#222',
            color: '#fff',
            padding: '8px',
            borderRadius: '4px',
          }}
        >
          <strong>{tooltipData.text}</strong>: {tooltipData.value}
        </TooltipWithBounds>
      )}
    </div>
  );
}