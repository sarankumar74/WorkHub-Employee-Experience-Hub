import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Check, Flame, Trophy } from 'lucide-react';
import { PollOption } from '../../types/workhub';

interface D3PollBarChartProps {
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
  onSelectOption?: (optionId: string) => void;
  interactive?: boolean;
}

export const D3PollBarChart: React.FC<D3PollBarChartProps> = ({
  options,
  totalVotes,
  userVotedOptionId,
  onSelectOption,
  interactive = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(500);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);

  // ResizeObserver to keep chart responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const newWidth = entries[0].contentRect.width;
      if (newWidth > 0) {
        setContainerWidth(newWidth);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Find leading option
  const maxVotes = Math.max(...options.map((o) => o.votes), 1);
  const leadingOption = options.find((o) => o.votes === maxVotes);

  // Render D3 chart
  useEffect(() => {
    if (!svgRef.current || containerWidth <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear prior elements

    const margin = { top: 12, right: 70, bottom: 20, left: 16 };
    const width = Math.max(containerWidth, 280);
    const barHeight = 36;
    const barSpacing = 44;
    const chartHeight = options.length * (barHeight + barSpacing) + margin.top + margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${chartHeight}`).attr('width', '100%').attr('height', chartHeight);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;

    // X Scale: 0 to 100% (or max percentage with headroom)
    const maxPercent = Math.max(
      ...options.map((o) => (totalVotes > 0 ? (o.votes / totalVotes) * 100 : 0)),
      10
    );
    const xMax = Math.min(100, Math.ceil(maxPercent / 10) * 10 + 10);

    const xScale = d3.scaleLinear().domain([0, xMax]).range([0, innerWidth]);

    // Background track grid lines
    const gridTicks = [25, 50, 75, 100].filter((t) => t <= xMax);
    const gridGroup = g.append('g').attr('class', 'grid-lines').attr('opacity', 0.25);

    gridGroup
      .selectAll('line')
      .data(gridTicks)
      .enter()
      .append('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', options.length * (barHeight + barSpacing) - barSpacing / 2)
      .attr('stroke', '#94A3B8')
      .attr('stroke-dasharray', '3,3');

    // Render each option row
    options.forEach((opt, i) => {
      const y = i * (barHeight + barSpacing);
      const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
      const isUserChoice = opt.id === userVotedOptionId;
      const isLeader = opt.id === leadingOption?.id;
      const isHovered = opt.id === hoveredOptionId;

      const row = g
        .append('g')
        .attr('class', `poll-row-${opt.id}`)
        .attr('transform', `translate(0, ${y})`)
        .style('cursor', interactive ? 'pointer' : 'default')
        .on('mouseenter', () => setHoveredOptionId(opt.id))
        .on('mouseleave', () => setHoveredOptionId(null))
        .on('click', () => {
          if (interactive && onSelectOption) {
            onSelectOption(opt.id);
          }
        });

      // 1. Text Label (above bar)
      const labelText = row
        .append('text')
        .attr('x', 0)
        .attr('y', -8)
        .attr('font-size', '12px')
        .attr('font-weight', isUserChoice ? '700' : '600')
        .attr('fill', isUserChoice ? '#0F172A' : '#334155');

      labelText.text(opt.text);

      // User Pick Indicator
      if (isUserChoice) {
        row
          .append('text')
          .attr('x', innerWidth + 4)
          .attr('y', -8)
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .attr('fill', '#059669')
          .attr('text-anchor', 'end')
          .text('✓ YOUR VOTE');
      } else if (isLeader && totalVotes > 0) {
        row
          .append('text')
          .attr('x', innerWidth + 4)
          .attr('y', -8)
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .attr('fill', '#6366F1')
          .attr('text-anchor', 'end')
          .text('★ LEADING');
      }

      // 2. Bar Track (Background)
      row
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', innerWidth)
        .attr('height', barHeight)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', isHovered ? '#F1F5F9' : '#F8FAFC')
        .attr('stroke', isUserChoice ? '#10B981' : isHovered ? '#CBD5E1' : '#E2E8F0')
        .attr('stroke-width', isUserChoice ? 1.5 : 1)
        .attr('stroke-dasharray', isUserChoice ? 'none' : 'none');

      // 3. Colored Fill Bar
      const targetWidth = Math.max(xScale(percent), percent > 0 ? 10 : 0);
      const barColor = opt.color || (isLeader ? '#3B82F6' : '#64748B');

      const bar = row
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 0) // starts at 0 for D3 transition
        .attr('height', barHeight)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', isUserChoice ? '#10B981' : barColor)
        .attr('opacity', isUserChoice ? 0.95 : isHovered ? 0.9 : 0.82);

      // Smooth animated transition
      bar
        .transition()
        .duration(650)
        .ease(d3.easeCubicOut)
        .attr('width', targetWidth);

      // 4. Percentage & Votes Label (Right side of bar)
      const countLabel = row
        .append('text')
        .attr('x', innerWidth + 14)
        .attr('y', barHeight / 2 + 5)
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('fill', isUserChoice ? '#047857' : '#0F172A')
        .text('0%');

      // Counter animation
      countLabel
        .transition()
        .duration(650)
        .tween('text', function () {
          const interpolator = d3.interpolateRound(0, percent);
          return function (t) {
            countLabel.text(`${interpolator(t)}%`);
          };
        });

      // 5. Vote Count inside or beside bar
      const voteCountText = `${opt.votes} ${opt.votes === 1 ? 'vote' : 'votes'}`;
      row
        .append('text')
        .attr('x', Math.max(12, Math.min(targetWidth - 10, innerWidth - 75)))
        .attr('y', barHeight / 2 + 4)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', targetWidth > 80 ? '#FFFFFF' : '#64748B')
        .attr('opacity', 0)
        .text(voteCountText)
        .transition()
        .delay(200)
        .duration(400)
        .attr('opacity', 1);
    });
  }, [options, totalVotes, userVotedOptionId, containerWidth, hoveredOptionId, interactive]);

  return (
    <div ref={containerRef} className="w-full relative">
      <svg ref={svgRef} className="overflow-visible block w-full" />
    </div>
  );
};
