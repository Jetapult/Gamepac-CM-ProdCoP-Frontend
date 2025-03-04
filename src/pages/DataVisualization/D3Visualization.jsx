import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3Visualization = ({ data, type }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || !data.labels || !data.datasets) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 50, right: 150, bottom: 80, left: 80 }; // Increased margins
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    // Add title with better visibility
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '22px')
      .style('font-weight', 'bold')
      .style('fill', '#ffffff')
      .text('BigQuery Data Visualization');
    
    // More robust data check
    const hasValidData = data.datasets.some(ds => 
      ds.data && ds.data.length > 0 && ds.data.some(d => d !== null && d !== undefined)
    );
    
    if (!hasValidData) {
      // Show a message if there's no valid data
      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#ff6b6b')
        .text('No valid data to display. Try a different query.');
      return;
    }
    
    if (type === 'pie') {
      createPieChart(g, data, chartWidth, chartHeight);
    } else if (type === 'bar') {
      createBarChart(g, data, chartWidth, chartHeight);
    } else if (type === 'line') {
      createLineChart(g, data, chartWidth, chartHeight);
    }
    
  }, [data, type]);
  
  const createPieChart = (g, data, width, height) => {
    // Process data for the pie chart
    // Filter out any null or undefined values
    let pieData = [];
    data.labels.forEach((label, i) => {
      let total = 0;
      data.datasets.forEach(dataset => {
        const value = dataset.data[i];
        if (value !== null && value !== undefined) {
          total += parseFloat(value) || 0;
        }
      });
      if (total > 0) {
        pieData.push({ label, value: total });
      }
    });
    
    // If no data after filtering, show a message
    if (pieData.length === 0) {
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#ff6b6b')
        .text('No valid data for pie chart. Try a different query or chart type.');
      return;
    }
    
    const radius = Math.min(width, height) / 2 * 0.8; // Slightly smaller for better visibility
    g.attr('transform', `translate(${width/2},${height/2})`);
    
    // Better color scheme
    const color = d3.scaleOrdinal()
      .domain(pieData.map(d => d.label))
      .range([
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
        '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5'
      ]);
    
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)
      .padAngle(0.02); // Add some padding between slices
    
    const arc = d3.arc()
      .innerRadius(radius * 0.4) // Donut chart
      .outerRadius(radius * 0.8)
      .cornerRadius(8);
    
    const outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);
    
    // Add drop shadow filter for better aesthetics
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'drop-shadow')
      .attr('height', '130%');
    
    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3)
      .attr('result', 'blur');
    
    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
    
    // Create arcs with better styling and animation
    const arcs = g.selectAll('.arc')
      .data(pie(pieData))
      .enter().append('g')
      .attr('class', 'arc');
    
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .attr('stroke', 'rgba(255, 255, 255, 0.5)')
      .style('stroke-width', '2px')
      .style('filter', 'url(#drop-shadow)')
      .style('opacity', 0)
      .transition()
      .duration(600)
      .delay((d, i) => i * 100)
      .style('opacity', 0.9)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate(
          {startAngle: d.startAngle, endAngle: d.startAngle},
          {startAngle: d.startAngle, endAngle: d.endAngle}
        );
        return function(t) {
          return arc(interpolate(t));
        };
      });
    
    // Add clearly visible percentage labels inside the pie slices
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#FFFFFF')
      .style('text-shadow', '0px 0px 2px rgba(0,0,0,0.8)')
      .style('opacity', 0)
      .transition()
      .delay((d, i) => 600 + i * 100)
      .duration(500)
      .style('opacity', 1)
      .text(d => {
        const percent = (d.data.value / d3.sum(pieData, d => d.value) * 100).toFixed(1);
        return percent > 5 ? `${percent}%` : '';
      });
    
    // Add external labels with lines for slices that are large enough
    const legendData = pieData.filter(d => 
      d.value / d3.sum(pieData, item => item.value) >= 0.03
    );
    
    const legend = g.selectAll('.legend')
      .data(pie(legendData))
      .enter().append('g')
      .attr('class', 'legend')
      .style('opacity', 0)
      .transition()
      .delay((d, i) => 1000 + i * 100)
      .duration(500)
      .style('opacity', 1);
    
    legend.append('line')
      .attr('x1', d => arc.centroid(d)[0] * 1.2)
      .attr('y1', d => arc.centroid(d)[1] * 1.2)
      .attr('x2', d => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        const x = pos[0] + (midAngle < Math.PI ? 1 : -1) * 120;
        return x;
      })
      .attr('y2', d => outerArc.centroid(d)[1])
      .attr('stroke', 'white')
      .style('stroke-width', '1px')
      .style('opacity', 0.7);
    
    legend.append('text')
      .attr('x', d => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        const x = pos[0] + (midAngle < Math.PI ? 1 : -1) * 130;
        return x;
      })
      .attr('y', d => outerArc.centroid(d)[1])
      .attr('dy', '.35em')
      .style('text-anchor', d => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      })
      .style('fill', 'white')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(d => {
        const label = d.data.label;
        // Truncate long labels
        return label.length > 20 ? label.substring(0, 20) + '...' : label;
      });
    
    // Add value labels
    legend.append('text')
      .attr('x', d => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        const x = pos[0] + (midAngle < Math.PI ? 1 : -1) * 130;
        return x;
      })
      .attr('y', d => outerArc.centroid(d)[1] + 16)
      .attr('dy', '.35em')
      .style('text-anchor', d => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      })
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('font-size', '12px')
      .text(d => `(${d.data.value.toLocaleString()})`);
  };
  
  const createBarChart = (g, data, width, height) => {
    // Prep data - get max value for scaling
    const maxValue = d3.max(data.datasets, d => d3.max(d.data)) * 1.1;
    
    // Create scales
    const x0 = d3.scaleBand()
      .domain(data.labels)
      .range([0, width])
      .paddingInner(0.1)
      .paddingOuter(0.2);
    
    const x1 = d3.scaleBand()
      .domain(data.datasets.map(d => d.label))
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);
    
    const y = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height, 0]);
    
    // Generate a rich color palette
    const color = d3.scaleOrdinal()
      .domain(data.datasets.map(d => d.label))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.datasets.length));
    
    // Add gradient definitions for bars
    const defs = g.append('defs');
    
    data.datasets.forEach((dataset, i) => {
      const gradientId = `barGradient-${i}`;
      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.rgb(color(dataset.label)).brighter(0.2))
        .attr('stop-opacity', 1);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.rgb(color(dataset.label)).darker(0.2))
        .attr('stop-opacity', 1);
    });
    
    // Add the grid lines with lower opacity
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat('')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', 'rgba(255, 255, 255, 0.1)')
        .attr('stroke-dasharray', '2,2')
      );
    
    // Add x axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))
      .call(g => g.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.3)'))
      .call(g => g.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.3)'))
      .call(g => g.selectAll('.tick text').attr('fill', 'rgba(255, 255, 255, 0.7)'))
      .selectAll('text')
      .attr('transform', 'rotate(-20)')
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em');
    
    // Add y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? `${d/1000}k` : d))
      .call(g => g.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.3)'))
      .call(g => g.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.3)'))
      .call(g => g.selectAll('.tick text').attr('fill', 'rgba(255, 255, 255, 0.7)'));
    
    // Add the bars
    const groups = g.selectAll('.bar-group')
      .data(data.labels)
      .enter().append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => `translate(${x0(d)},0)`);
    
    groups.selectAll('.bar')
      .data((label, i) => data.datasets.map(dataset => ({
        dataset: dataset,
        value: dataset.data[i]
      })))
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x1(d.dataset.label))
      .attr('width', x1.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('rx', 3) // Rounded corners
      .attr('ry', 3)
      .attr('fill', (d, i) => `url(#barGradient-${i})`)
      .attr('stroke', 'rgba(255, 255, 255, 0.2)')
      .attr('stroke-width', 0.5)
      .style('filter', 'drop-shadow(0 3px 3px rgba(0,0,0,0.2))')
      // Animation
      .transition()
      .duration(800)
      .delay((d, i) => i * 25)
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value));
    
    // Add hover effect and tooltips
    groups.selectAll('.bar')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('filter', 'brightness(1.2)')
          .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))');
        
        const [x, y] = d3.pointer(event, g.node());
        
        g.append('text')
          .attr('class', 'tooltip-text')
          .attr('x', x)
          .attr('y', y - 15)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .style('fill', '#ffffff')
          .text(`${d.dataset.label}: ${d.value.toLocaleString()}`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('filter', null)
          .style('filter', 'drop-shadow(0 3px 3px rgba(0,0,0,0.2))');
        
        g.selectAll('.tooltip-text').remove();
      });
    
    // Add legend
    if (data.datasets.length <= 8) {
      const legend = g.append('g')
        .attr('transform', `translate(${width - 100}, -30)`);
      
      legend.selectAll('rect')
        .data(data.datasets)
        .enter().append('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * 20)
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', (d, i) => `url(#barGradient-${i})`);
      
      legend.selectAll('text')
        .data(data.datasets)
        .enter().append('text')
        .attr('x', 20)
        .attr('y', (d, i) => i * 20 + 9)
        .style('fill', 'rgba(255, 255, 255, 0.8)')
        .style('font-size', '10px')
        .text(d => d.label);
    }
  };
  
  const createLineChart = (g, data, width, height) => {
    // Check if we have data to work with
    if (!data.datasets.some(d => d.data.some(v => v !== null && v !== undefined))) {
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'rgba(255, 255, 255, 0.6)')
        .text('Insufficient data for line chart');
      return;
    }
    
    // Determine min/max values
    const allValues = [];
    data.datasets.forEach(dataset => {
      dataset.data.forEach(v => {
        if (v !== null && v !== undefined) allValues.push(v);
      });
    });
    
    const yMin = d3.min(allValues) * 0.9;
    const yMax = d3.max(allValues) * 1.1;
    
    // Create scales
    const x = d3.scaleBand()
      .domain(data.labels)
      .range([0, width])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([yMin < 0 ? yMin : 0, yMax])
      .nice()
      .range([height, 0]);
    
    const color = d3.scaleOrdinal()
      .domain(data.datasets.map(d => d.label))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.datasets.length));
    
    // Create gradient definitions
    const defs = g.append('defs');
    
    data.datasets.forEach((dataset, i) => {
      // Line gradient
      const gradientId = `lineGradient-${i}`;
      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.rgb(color(dataset.label)).darker(0.2))
        .attr('stop-opacity', 1);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.rgb(color(dataset.label)).brighter(0.5))
        .attr('stop-opacity', 1);
      
      // Area gradient
      const areaGradientId = `areaGradient-${i}`;
      const areaGradient = defs.append('linearGradient')
        .attr('id', areaGradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      
      areaGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color(dataset.label))
        .attr('stop-opacity', 0.5);
      
      areaGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color(dataset.label))
        .attr('stop-opacity', 0.1);
    });
    
    // Add the grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat('')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', 'rgba(255, 255, 255, 0.1)')
        .attr('stroke-dasharray', '2,2')
      );
    
    // Add x axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.3)'))
      .call(g => g.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.3)'))
      .call(g => g.selectAll('.tick text').attr('fill', 'rgba(255, 255, 255, 0.7)'))
      .selectAll('text')
      .attr('transform', 'rotate(-20)')
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em');
    
    // Add y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? `${d/1000}k` : d))
      .call(g => g.select('.domain').attr('stroke', 'rgba(255, 255, 255, 0.3)'))
      .call(g => g.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.3)'))
      .call(g => g.selectAll('.tick text').attr('fill', 'rgba(255, 255, 255, 0.7)'));
    
    // Create line generator
    const line = d3.line()
      .x((d, i) => x(data.labels[i]) + x.bandwidth() / 2)
      .y(d => y(d))
      .curve(d3.curveCardinal.tension(0.4))
      .defined(d => d !== null && d !== undefined);
    
    // Create area generator for the shaded area below the line
    const area = d3.area()
      .x((d, i) => x(data.labels[i]) + x.bandwidth() / 2)
      .y0(height)
      .y1(d => y(d))
      .curve(d3.curveCardinal.tension(0.4))
      .defined(d => d !== null && d !== undefined);
    
    // Add lines and areas
    data.datasets.forEach((dataset, datasetIndex) => {
      // Add the shaded area below the line
      g.append('path')
        .datum(dataset.data)
        .attr('class', 'area')
        .attr('fill', `url(#areaGradient-${datasetIndex})`)
        .attr('d', area)
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .style('opacity', 1);
      
      // Add the line with animation
      const path = g.append('path')
        .datum(dataset.data)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', `url(#lineGradient-${datasetIndex})`)
        .attr('stroke-width', 3)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
      
      // Create line drawing animation
      const pathLength = path.node().getTotalLength();
      
      path
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .attr('d', line)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);
      
      // Add points
      const points = g.selectAll(`.point-${datasetIndex}`)
        .data(dataset.data.filter((d, i) => d !== null && d !== undefined))
        .enter().append('circle')
        .attr('class', `point-${datasetIndex}`)
        .attr('cx', (d, i) => {
          // Find the original index in the dataset array
          const originalIndex = dataset.data.findIndex((val, idx) => val === d && idx >= i);
          return x(data.labels[originalIndex]) + x.bandwidth() / 2;
        })
        .attr('cy', d => y(d))
        .attr('r', 0)
        .attr('fill', color(dataset.label))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))');
      
      points
        .transition()
        .delay((d, i) => 1000 + i * 100)
        .duration(500)
        .attr('r', 5);
      
      // Add hover effect and tooltips to points
      points
        .on('mouseover', function(event, d) {
          const [cx, cy] = d3.pointer(event, g.node());
          
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 8);
          
          g.append('text')
            .attr('class', 'tooltip-text')
            .attr('x', cx)
            .attr('y', cy - 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#ffffff')
            .text(`${dataset.label}: ${d.toLocaleString()}`);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(100)
            .attr('r', 5);
          
          g.selectAll('.tooltip-text').remove();
        });
    });
    
    // Add legend
    if (data.datasets.length <= 8) {
      const legend = g.append('g')
        .attr('transform', `translate(${width - 100}, -30)`);
      
      legend.selectAll('line')
        .data(data.datasets)
        .enter().append('line')
        .attr('x1', 0)
        .attr('y1', (d, i) => i * 20 + 6)
        .attr('x2', 15)
        .attr('y2', (d, i) => i * 20 + 6)
        .attr('stroke', (d, i) => `url(#lineGradient-${i})`)
        .attr('stroke-width', 3);
      
      legend.selectAll('text')
        .data(data.datasets)
        .enter().append('text')
        .attr('x', 20)
        .attr('y', (d, i) => i * 20 + 9)
        .style('fill', 'rgba(255, 255, 255, 0.8)')
        .style('font-size', '10px')
        .text(d => d.label);
    }
  };
  
  return (
    <svg ref={svgRef} width="100%" height="100%" style={{ minHeight: '500px' }} />
  );
};

export default D3Visualization; 