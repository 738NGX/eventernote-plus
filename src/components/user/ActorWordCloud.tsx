import React, { useCallback, useMemo } from 'react';
import { Wordcloud } from '@visx/wordcloud';
import { scaleLog } from '@visx/scale';
import { ParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';

export interface ActorCountData {
  id: string;
  text: string;
  value: number;
}

interface CloudInnerProps {
  width: number;
  height: number;
  data: ActorCountData[];
  onWordMove: (event: React.MouseEvent, word: any) => void;
  onWordOut: () => void;
  colors: string[];
}

const CloudInner = React.memo(
  ({ width, height, data, onWordMove, onWordOut, colors }: CloudInnerProps) => {
    const fontScale = useMemo(
      () =>
        scaleLog({
          domain: [Math.min(...data.map((w) => w.value)), Math.max(...data.map((w) => w.value))],
          range: [12, 36],
        }),
      [data]
    );

    const fixedRandom = useCallback(() => 0.5, []);

    return (
      <div className="wordcloud-wrapper">
        <Wordcloud
          words={data}
          width={width}
          height={height}
          fontSize={(d) => fontScale(d.value)}
          padding={4}
          spiral="rectangular"
          rotate={0}
          random={fixedRandom}
        >
          {(cloudWords) =>
            cloudWords.map((w, i) => (
              <text
                key={w.text}
                className="cloud-word"
                fill={colors[i % colors.length]}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                style={{
                  fontSize: w.size,
                  fontFamily: w.font,
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease',
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.data === nextProps.data
    );
  }
);

export function ActorWordCloud({ data, dark }: { data: ActorCountData[]; dark?: boolean }) {
  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<ActorCountData>(); // 这里传入泛型

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

  // 动态配色方案
  const colors = dark
    ? ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'] // 深色模式配色
    : ['#3182bd', '#fdae6b', '#74c476', '#e6550d']; // 浅色模式配色

  return (
    <div
      style={{
        width: '100%',
        height: '500px',
        background: dark ? '#141414' : '#ffffff',
        position: 'relative',
      }}
    >
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
            colors={colors}
          />
        )}
      </ParentSize>

      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: dark ? '#333' : '#222',
            color: dark ? '#fff' : '#fff',
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