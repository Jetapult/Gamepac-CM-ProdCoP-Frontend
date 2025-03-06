import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Select, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import './DataVisualization.css';
import api from '../../api';

const DataVisualization = () => {
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [boosterData, setBoosterData] = useState([]);
  const [gemData, setGemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const barChartInstance = useRef(null);
  const lineChartInstance = useRef(null);
  const gemChartRef = useRef(null);
  const gemChartInstance = useRef(null);
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedRange, setSelectedRange] = useState('1-100');

  const filterOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'milestone', label: 'Milestone Levels (Every 25th)' },
    { value: 'dropoff', label: 'High Drop-off Levels (>10%)' },
    { value: 'recent', label: 'Last 10 Levels' },
  ];

  const rangeOptions = [
    { value: '1-100', label: 'Levels 1-100' },
    { value: '101-200', label: 'Levels 101-200' },
    { value: '201-300', label: 'Levels 201-300' },
    { value: '301-400', label: 'Levels 301-400' },
  ];

  const getColumnFilters = (data, key) => {
    const uniqueValues = [...new Set(data.map(item => Math.floor(item[key])))];
    return uniqueValues
      .sort((a, b) => a - b)
      .map(value => ({
        text: value.toString(),
        value: value,
      }));
  };

  const columns = [
    {
      title: 'Level Number',
      dataIndex: 'level_number',
      fixed: 'left',
      width: 100,
      filters: [
        { text: '1-100', value: '1-100' },
        { text: '101-200', value: '101-200' },
        { text: '201-300', value: '201-300' },
        { text: '301-400', value: '301-400' },
      ],
      onFilter: (value, record) => {
        const [min, max] = value.split('-').map(Number);
        return record.level_number >= min && record.level_number <= max;
      },
      render: (val) => (
        <span style={{ color: '#fff' }}>{val}</span>
      ),
    },
    {
      title: 'User Count',
      dataIndex: 'user_count',
      width: 100,
      filters: [
        { text: '< 1000', value: '<1000' },
        { text: '1000-10000', value: '1000-10000' },
        { text: '> 10000', value: '>10000' },
      ],
      onFilter: (value, record) => {
        if (value === '<1000') return record.user_count < 1000;
        if (value === '1000-10000') return record.user_count >= 1000 && record.user_count <= 10000;
        if (value === '>10000') return record.user_count > 10000;
        return true;
      },
      render: (val) => val.toLocaleString(),
    },
    {
      title: 'Funnel Percentage',
      dataIndex: 'funnel_percentage',
      width: 120,
      filters: [
        { text: '0-50%', value: '0-50' },
        { text: '51-100%', value: '51-100' },
      ],
      onFilter: (value, record) => {
        const [min, max] = value.split('-').map(Number);
        return record.funnel_percentage >= min && record.funnel_percentage <= max;
      },
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'Drop Off Rate',
      dataIndex: 'drop_off_rate',
      width: 120,
      filters: [
        { text: '0-25%', value: '0-25' },
        { text: '> 25%', value: '>25' },
      ],
      onFilter: (value, record) => {
        if (value === '0-25') return record.drop_off_rate >= 0 && record.drop_off_rate <= 25;
        if (value === '>25') return record.drop_off_rate > 25;
        return true;
      },
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'Avg Level Time',
      dataIndex: 'avg_level_time',
      width: 120,
      render: (val) => `${val.toFixed(2)}s`,
    },
    {
      title: 'Failing Percentage',
      dataIndex: 'failing_percentage',
      width: 120,
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'Booster Percentage',
      dataIndex: 'booster_percentage',
      width: 120,
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'Trowel Percentage',
      dataIndex: 'trowel_percentage',
      width: 120,
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'Blower Percentage',
      dataIndex: 'blower_percentage',
      width: 120,
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'Sprinkler Percentage',
      dataIndex: 'sprinkler_percentage',
      width: 120,
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'HS Booster Percentage',
      dataIndex: 'hs_booster_percentage',
      width: 140,
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'HS Timefreeze Percentage',
      dataIndex: 'hs_timefreeze_percentage',
      width: 160,
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'HS Timewarp Percentage',
      dataIndex: 'hs_timewarp_percentage',
      width: 160,
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'HS Goldenclock Percentage',
      dataIndex: 'hs_goldenclock_percentage',
      width: 160,
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'Gem Sinkers Percentage',
      dataIndex: 'gem_sinkers_percentage',
      width: 160,
      render: (val) => `${val.toFixed(2)}%`,
    },
    {
      title: 'Avg Gems Per User',
      dataIndex: 'avg_gems_per_user',
      width: 140,
      render: (val) => val.toFixed(2),
    },
  ];

  // Detailed query for table
  const TABLE_QUERY = `
    WITH LevelMetrics AS (
      SELECT 
        level_number,
        users,
        users_failing,
        level_time_taken,
        booster_sinkers,
        trowel_sinkers,
        blower_sinkers,
        sprinkler_sinkers,
        users_sinking_hs_boosters,
        hs_timefreeze_sinkers,
        hs_timewarp_sinkers,
        hs_goldenclock_sinkers,
        total_gems_sunk,
        gem_sinkers,
        LAG(users) OVER (ORDER BY level_number) AS prev_users
      FROM garden-design-makeover.custom_tables.Level_Generation
    )
    SELECT 
      level_number,
      users as user_count,
      ROUND((users / (SELECT MAX(users) FROM LevelMetrics)) * 100, 2) as funnel_percentage,
      ROUND(
        CASE 
          WHEN prev_users IS NOT NULL AND prev_users > 0 
          THEN (1 - (users / prev_users)) * 100
          ELSE 0
        END, 2) as drop_off_rate,
      ROUND(level_time_taken, 2) as avg_level_time,
      ROUND((users_failing / NULLIF(users, 0)) * 100, 2) as failing_percentage,
      ROUND((booster_sinkers / NULLIF(users, 0)) * 100, 2) as booster_percentage,
      ROUND((trowel_sinkers / NULLIF(users, 0)) * 100, 2) as trowel_percentage,
      ROUND((blower_sinkers / NULLIF(users, 0)) * 100, 2) as blower_percentage,
      ROUND((sprinkler_sinkers / NULLIF(users, 0)) * 100, 2) as sprinkler_percentage,
      ROUND((users_sinking_hs_boosters / NULLIF(users, 0)) * 100, 2) as hs_booster_percentage,
      ROUND((hs_timefreeze_sinkers / NULLIF(users, 0)) * 100, 2) as hs_timefreeze_percentage,
      ROUND((hs_timewarp_sinkers / NULLIF(users, 0)) * 100, 2) as hs_timewarp_percentage,
      ROUND((hs_goldenclock_sinkers / NULLIF(users, 0)) * 100, 2) as hs_goldenclock_percentage,
      ROUND((gem_sinkers / NULLIF(users, 0)) * 100, 2) as gem_sinkers_percentage,
      ROUND(total_gems_sunk / NULLIF(gem_sinkers, 0), 2) as avg_gems_per_user
    FROM LevelMetrics
    ORDER BY level_number
  `;

  // Simplified query for chart
  const FUNNEL_QUERY = `
    WITH LevelMetrics AS (
      SELECT 
          level_number,
          users,
          LAG(users) OVER (ORDER BY level_number) AS prev_users
      FROM \`garden-design-makeover.custom_tables.Level_Generation\`
    )

    SELECT 
      level_number AS \`Level Number\`,
      users AS \`User Count\`,
      ROUND((users / (SELECT MAX(users) FROM LevelMetrics)) * 100, 2) AS \`Funnel %\`,
      ROUND(
          CASE 
              WHEN prev_users IS NOT NULL AND prev_users > 0 
              THEN (1 - (users / prev_users)) * 100
              ELSE 0
          END, 2) AS \`Drop Off Rate\`
    FROM LevelMetrics
    ORDER BY level_number;
  `;

  const BOOSTER_QUERY = `
    WITH BoosterUsage AS (
      SELECT 
          level_number,
          users,
          ROUND((booster_sinkers / NULLIF(users, 0)) * 100, 2) AS \`Booster Sinkers %\`,
          ROUND((trowel_sinkers / NULLIF(users, 0)) * 100, 2) AS \`Trowel Sinkers %\`,
          ROUND((blower_sinkers / NULLIF(users, 0)) * 100, 2) AS \`Blower Sinkers %\`,
          ROUND((sprinkler_sinkers / NULLIF(users, 0)) * 100, 2) AS \`Sprinkler Sinkers %\`
      FROM \`garden-design-makeover.custom_tables.Level_Generation\`
    )
    SELECT * FROM BoosterUsage ORDER BY level_number;
  `;

  const GEM_QUERY = `
    WITH GemUsage AS (
      SELECT 
          level_number,
          users,
          ROUND((users_sinking_hs_boosters / NULLIF(users, 0)) * 100, 2) AS \`HS Booster Sinkers %\`,
          ROUND((gem_sinkers / NULLIF(users, 0)) * 100, 2) AS \`Gem Sinkers %\`,
          ROUND(total_gems_sunk / NULLIF(gem_sinkers, 0), 2) AS \`Avg Gems Sunk Per User\`
      FROM \`garden-design-makeover.custom_tables.Level_Generation\`
    )
    SELECT * FROM GemUsage ORDER BY level_number;
  `;

  // Add data downsampling function
  const downsampleData = (data, threshold = 1000) => {
    if (data.length <= threshold) return data;
    
    const factor = Math.ceil(data.length / threshold);
    return data.filter((_, index) => index % factor === 0);
  };

  useEffect(() => {
    fetchData();
    
    const handleResize = () => {
      barChartInstance.current?.resize();
      lineChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      barChartInstance.current?.dispose();
      lineChartInstance.current?.dispose();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tableResponse, chartResponse, boosterResponse, gemResponse] = await Promise.all([
        api.post('/v1/bigquery/execute', { query: TABLE_QUERY }),
        api.post('/v1/bigquery/execute', { query: FUNNEL_QUERY }),
        api.post('/v1/bigquery/execute', { query: BOOSTER_QUERY }),
        api.post('/v1/bigquery/execute', { query: GEM_QUERY })
      ]);

      const [tableResult, chartResult, boosterResult, gemResult] = await Promise.all([
        tableResponse.data.data,
        chartResponse.data.data,
        boosterResponse.data.data,
        gemResponse.data.data
      ]);

      if (tableResult.data) setTableData(tableResult.data);
      if (chartResult.data) setChartData(chartResult.data);
      if (boosterResult.data) setBoosterData(boosterResult.data);
      if (gemResult.data) setGemData(gemResult.data);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredChartData = () => {
    let filtered = [...chartData];

    // Apply level range filter
    const [start, end] = selectedRange.split('-').map(Number);
    filtered = filtered.filter(item => 
      item.level_number >= start && item.level_number <= end
    );

    // Apply level type filter
    switch (levelFilter) {
      case 'milestone':
        filtered = filtered.filter(item => 
          item.level_number === 1 || item.level_number % 25 === 0
        );
        break;
      case 'dropoff':
        filtered = filtered.filter(item => item.drop_off_rate > 10);
        break;
      case 'recent':
        const maxLevel = Math.max(...chartData.map(item => item.level_number));
        filtered = filtered.filter(item => 
          item.level_number > maxLevel - 10
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  useEffect(() => {
    if (chartData.length > 0 && barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.dispose();
      }

      // Initialize with canvas renderer for better performance
      const chart = echarts.init(barChartRef.current, null, {
        renderer: 'canvas'
      });
      barChartInstance.current = chart;

      // Downsample data if needed
      const processedData = downsampleData(chartData);

      const option = {
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicInOut',
        title: {
          text: 'User Funnel & Drop-off Rate',
          subtext: 'Shows how users progress through levels and where they drop off',
          textStyle: {
            color: '#fff',
            fontSize: 16
          },
          subtextStyle: {
            color: '#8c8c8c',
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#283b56'
            }
          },
          formatter: function(params) {
            const level = params[0].name.replace('Level ', '');
            let result = `<div style="font-weight: bold; margin-bottom: 4px;">Level ${level}</div>`;
            
            params.forEach(param => {
              let value = '';
              let explanation = '';
              let color = param.color;
              
              if (param.seriesName === 'User Count') {
                value = param.value.toLocaleString();
                explanation = 'Total number of users who played this level';
                color = 'rgba(24, 144, 255, 0.9)';
              } else if (param.seriesName === 'Drop-off Rate') {
                value = param.value.toFixed(2) + '%';
                explanation = 'Percentage of users who stopped playing after this level';
              } else if (param.seriesName === 'Funnel %') {
                value = param.value.toFixed(2) + '%';
                explanation = 'Percentage of initial users remaining at this level';
              }

              result += `
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                  <span style="color: ${color}">● ${param.seriesName}:</span>
                  <span style="font-weight: bold">${value}</span>
                </div>
                <div style="color: #8c8c8c; font-size: 0.9em; margin-bottom: 4px;">
                  ${explanation}
                </div>
              `;
            });
            
            return result;
          },
          padding: [8, 12],
          backgroundColor: 'rgba(30, 30, 45, 0.9)',
          borderColor: '#555',
          borderWidth: 1,
          extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);'
        },
        legend: {
          data: ['User Count', 'Drop-off Rate', 'Funnel %'],
          textStyle: {
            color: '#fff'
          },
          top: 30,
          selected: {
            'User Count': true,
            'Drop-off Rate': true,
            'Funnel %': true
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: processedData.map(item => item['Level Number']),
          axisLabel: {
            color: '#fff',
            interval: Math.floor(processedData.length / 10),
            rotate: 0,
            fontSize: 12,
            formatter: function(value) {
              return 'Level ' + value;
            }
          },
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: [
          {
            type: 'value',
            name: 'User Count',
            position: 'left',
            axisLabel: {
              color: '#fff',
              formatter: value => value.toLocaleString()
            },
            nameTextStyle: {
              color: '#fff',
              padding: [0, 0, 0, 50]
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.1)',
                type: 'dashed'
              }
            }
          },
          {
            type: 'value',
            name: 'Percentage',
            position: 'right',
            min: 0,
            max: 100,
            axisLabel: {
              color: '#fff',
              formatter: '{value}%'
            },
            nameTextStyle: {
              color: '#fff',
              padding: [0, 50, 0, 0]
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: 'User Count',
            type: 'bar',
            data: processedData.map(item => item['User Count']),
            sampling: 'lttb',
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(24, 144, 255, 0.9)'
              }, {
                offset: 1,
                color: 'rgba(24, 144, 255, 0.4)'
              }]
            },
            barMaxWidth: 30,
            emphasis: {
              focus: 'series',
              itemStyle: {
                color: 'rgba(24, 144, 255, 1)'
              }
            }
          },
          {
            name: 'Drop-off Rate',
            type: 'line',
            yAxisIndex: 1,
            data: processedData.map(item => item['Drop Off Rate']),
            sampling: 'lttb',
            color: '#ff4d4f',
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: { 
              width: 3,
              shadowColor: 'rgba(255, 77, 79, 0.3)',
              shadowBlur: 10
            },
            emphasis: {
              scale: true,
              focus: 'series'
            },
            z: 3
          },
          {
            name: 'Funnel %',
            type: 'line',
            yAxisIndex: 1,
            data: processedData.map(item => item['Funnel %']),
            sampling: 'lttb',
            color: '#52c41a',
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: { 
              width: 3,
              shadowColor: 'rgba(82, 196, 26, 0.3)',
              shadowBlur: 10
            },
            emphasis: {
              scale: true,
              focus: 'series'
            },
            z: 2
          }
        ]
      };

      chart.setOption(option);

      // Handle resize
      const handleResize = () => {
        chart.resize();
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    }
  }, [chartData]);

  // Booster Line Chart
  useEffect(() => {
    if (boosterData.length > 0 && lineChartRef.current) {
      if (lineChartInstance.current) {
        lineChartInstance.current.dispose();
      }

      const chart = echarts.init(lineChartRef.current, null, {
        renderer: 'canvas'
      });
      lineChartInstance.current = chart;

      const processedData = downsampleData(boosterData);

      // Find significant spikes (more than 15% usage)
      const findSignificantSpikes = (data, key, threshold = 15) => {
        return data
          .map((item, index) => ({
            level: item.level_number,
            value: item[key],
            index
          }))
          .filter(item => item.value > threshold);
      };

      const option = {
        title: {
          text: 'Booster Usage Analysis',
          subtext: 'Displays the percentage of users using different boosters per level',
          textStyle: {
            color: '#fff',
            fontSize: 16
          },
          subtextStyle: {
            color: '#8c8c8c',
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function(params) {
            let result = `<div style="font-weight: bold; margin-bottom: 8px;">Level ${params[0].name}</div>`;
            params
              .sort((a, b) => b.value - a.value)
              .forEach(param => {
                result += `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
                    <span style="color: ${param.color}; font-size: 14px;">
                      ● ${param.seriesName}:
                    </span>
                    <span style="font-weight: bold; margin-left: 12px;">
                      ${param.value.toFixed(1)}%
                    </span>
                  </div>
                `;
              });
            return result;
          },
          backgroundColor: 'rgba(30, 30, 45, 0.95)',
          borderColor: '#555',
          borderWidth: 1,
          padding: [12, 16],
          textStyle: {
            fontSize: 13
          }
        },
        legend: {
          data: ['Trowel', 'Blower', 'Sprinkler', 'Booster'],
          textStyle: { 
            color: '#fff',
            fontSize: 14,
            fontWeight: 500
          },
          itemGap: 25,
          top: 30,
          selectedMode: 'multiple',
          selected: {
            'Trowel': true,
            'Blower': true,
            'Sprinkler': true,
            'Booster': true
          },
          itemStyle: {
            borderWidth: 2
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: processedData.map(item => item.level_number),
          axisLabel: {
            color: '#fff',
            interval: Math.floor(processedData.length / 10), // Show fewer labels
            rotate: 0,
            fontSize: 12,
            formatter: function(value) {
              return 'Level ' + value;
            }
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLabel: {
            color: '#fff',
            formatter: '{value}%',
            fontSize: 12
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              type: 'dashed',
              width: 0.5
            }
          },
          splitNumber: 4
        },
        series: [
          {
            name: 'Trowel',
            type: 'line',
            data: processedData.map(item => item['Trowel Sinkers %']),
            color: '#1890ff',
            lineStyle: { 
              width: 3,
              shadowColor: 'rgba(24, 144, 255, 0.3)',
              shadowBlur: 10
            },
            symbol: 'circle',
            symbolSize: 8,
            emphasis: {
              focus: 'series',
              scale: true
            },
            markPoint: {
              data: findSignificantSpikes(processedData, 'Trowel Sinkers %').map(spike => ({
                coord: [spike.index, spike.value],
                value: spike.value.toFixed(1) + '%',
                symbolSize: 40,
                label: {
                  fontSize: 12
                }
              }))
            }
          },
          {
            name: 'Blower',
            type: 'line',
            data: processedData.map(item => item['Blower Sinkers %']),
            color: '#ff4d4f',
            lineStyle: { 
              width: 3,
              shadowColor: 'rgba(255, 77, 79, 0.3)',
              shadowBlur: 10
            },
            symbol: 'circle',
            symbolSize: 8,
            emphasis: {
              focus: 'series',
              scale: true
            }
          },
          {
            name: 'Sprinkler',
            type: 'line',
            data: processedData.map(item => item['Sprinkler Sinkers %']),
            color: '#52c41a',
            lineStyle: { 
              width: 3,
              shadowColor: 'rgba(82, 196, 26, 0.3)',
              shadowBlur: 10
            },
            symbol: 'circle',
            symbolSize: 8,
            emphasis: {
              focus: 'series',
              scale: true
            }
          },
          {
            name: 'Booster',
            type: 'line',
            data: processedData.map(item => item['Booster Sinkers %']),
            color: '#faad14',
            lineStyle: { 
              width: 3,
              shadowColor: 'rgba(250, 173, 20, 0.3)',
              shadowBlur: 10
            },
            symbol: 'circle',
            symbolSize: 8,
            emphasis: {
              focus: 'series',
              scale: true
            }
          }
        ]
      };

      chart.setOption(option);
    }
  }, [boosterData]);

  // Update the gem chart useEffect
  useEffect(() => {
    if (gemData.length > 0 && gemChartRef.current) {
      if (gemChartInstance.current) {
        gemChartInstance.current.dispose();
      }

      const chart = echarts.init(gemChartRef.current, null, {
        renderer: 'canvas'
      });
      gemChartInstance.current = chart;

      const processedData = downsampleData(gemData);

      const option = {
        title: {
          text: 'Gems & HS Booster Usage',
          subtext: 'Highlights gem sinking and high-value booster usage trends',
          textStyle: {
            color: '#fff',
            fontSize: 16
          },
          subtextStyle: {
            color: '#8c8c8c',
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            animation: false
          },
          formatter: function(params) {
            let result = `<div style="font-weight: bold; margin-bottom: 8px;">Level ${params[0].name}</div>`;
            params
              .filter(param => param.value != null) // Filter out undefined values
              .sort((a, b) => (b.value || 0) - (a.value || 0))
              .forEach(param => {
                // Safely handle potentially undefined values
                const value = param.value != null ? (
                  param.seriesName === 'Avg Gems Sunk Per User' 
                    ? Number(param.value).toFixed(1)
                    : Number(param.value).toFixed(1) + '%'
                ) : 'N/A';
                
                result += `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
                    <span style="color: ${param.color}; font-size: 14px;">
                      ● ${param.seriesName}:
                    </span>
                    <span style="font-weight: bold; margin-left: 12px;">
                      ${value}
                    </span>
                  </div>
                `;
              });
            return result;
          },
          backgroundColor: 'rgba(30, 30, 45, 0.95)',
          borderColor: '#555',
          borderWidth: 1,
          padding: [12, 16],
          textStyle: {
            fontSize: 13
          }
        },
        legend: {
          data: [
            'Gem Sinkers %',
            'HS Booster Sinkers %',
            'Avg Gems Sunk Per User'
          ],
          textStyle: {
            color: '#fff',
            fontSize: 14,
            fontWeight: 500
          },
          itemGap: 25,
          top: 30,
          selectedMode: 'multiple',
          itemStyle: {
            borderWidth: 2
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: processedData.map(item => item.level_number),
          axisLabel: {
            color: '#fff',
            interval: Math.floor(processedData.length / 10),
            fontSize: 12,
            formatter: function(value) {
              return 'Level ' + value;
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.05)',
              type: 'dashed'
            }
          }
        },
        yAxis: [
          {
            type: 'value',
            name: 'Percentage',
            position: 'left',
            min: 0,
            max: 100,
            axisLabel: {
              color: '#fff',
              formatter: '{value}%',
              fontSize: 12
            },
            nameTextStyle: {
              color: '#fff',
              fontSize: 14,
              padding: [0, 0, 0, 50]
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.1)',
                type: 'dashed'
              }
            }
          },
          {
            type: 'value',
            name: 'Average Gems',
            position: 'right',
            nameLocation: 'start',
            nameTextStyle: {
              color: '#ffd700',
              fontSize: 14,
              padding: [0, 0, 0, 50],
              fontWeight: 500
            },
            axisLabel: {
              color: '#ffd700',
              fontSize: 12
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: 'Gem Sinkers %',
            type: 'bar',
            data: processedData.map(item => item['Gem Sinkers %']),
            color: '#40a9ff',
            barMaxWidth: 30,
            emphasis: {
              disabled: true
            }
          },
          {
            name: 'HS Booster Sinkers %',
            type: 'bar',
            data: processedData.map(item => item['HS Booster Sinkers %']),
            color: '#52c41a',
            barMaxWidth: 30,
            emphasis: {
              disabled: true
            }
          },
          {
            name: 'Avg Gems Sunk Per User',
            type: 'line',
            yAxisIndex: 1,
            data: processedData.map(item => item['Avg Gems Sunk Per User']),
            color: '#ffd700',
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 3,
              type: 'solid',
              shadowColor: 'rgba(255, 215, 0, 0.3)',
              shadowBlur: 10
            },
            emphasis: {
              disabled: true
            },
            animation: false
          }
        ]
      };

      chart.setOption(option);

      chart.setOption({
        axisPointer: {
          link: [{
            xAxisIndex: 'all'
          }]
        }
      });

      return () => {
        chart.dispose();
      };
    }
  }, [gemData]);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      if (gemChartInstance.current) {
        gemChartInstance.current.dispose();
      }
    };
  }, []);

  return (
    <div style={{ padding: '24px', background: '#1e1e2d', minHeight: '100vh' }}>
      <div style={{ 
        marginBottom: '32px', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '16px'
      }}>
        <h1 style={{ 
          color: '#fff',
          margin: '0 0 16px 0',
          fontSize: '28px',
          fontWeight: '600',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            background: 'linear-gradient(45deg, #1890ff, #52c41a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Level Analytics
          </span>
          <span style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.65)',
            fontWeight: '400'
          }}>
            Dashboard
          </span>
        </h1>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            color: 'rgba(255, 255, 255, 0.65)',
            fontSize: '14px'
          }}>
            Game:
          </span>
          <select
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              color: '#fff',
              padding: '6px 12px',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none'
            }}
            value="garden-design-makeover"
            onChange={(e) => console.log(e.target.value)}
          >
            <option value="garden-design-makeover">Garden Design Makeover</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '16px' }}>
          Error: {error}
        </div>
      )}

      {/* Charts Section */}
      <div className="chart-container" style={{ marginBottom: '32px' }}>
        <div 
          ref={barChartRef} 
          style={{ 
            height: '500px', 
            width: '100%',
            marginBottom: '24px'
          }}
        />
        <div 
          ref={lineChartRef} 
          style={{ 
            height: '500px', 
            width: '100%',
            marginBottom: '24px'
          }}
        />
        <div 
          ref={gemChartRef} 
          style={{ 
            height: '500px', 
            width: '100%',
            marginBottom: '24px'
          }}
        />
      </div>

      {/* Table Section */}
      <div style={{ marginTop: '32px' }}>
        <Table
          dataSource={tableData}
          columns={columns}
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1500 }}
          rowKey="level_number"
          size="small"
          style={{ 
            background: '#1e1e2d',
            color: '#fff'
          }}
        />
      </div>
    </div>
  );
};

export default DataVisualization;