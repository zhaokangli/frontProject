import { DataProcessor } from './data-processor.js';
import { CONFIG } from './constants.js';

// 线配置定义 - 每条线的数据获取和样式配置
export const LINE_CONFIGS = {
    // K线相关
    candlestick: {
        name: 'K线',
        dataSource: 'kline',
        processor: (data) => DataProcessor.processKlineData(data.kline),
        type: 'candlestick',
        dataMapper: (item) => [item.open, item.close, item.low, item.high],
        style: {
            itemStyle: {
                color: CONFIG.CHART.COLORS.negative,
                color0: CONFIG.CHART.COLORS.positive,
                borderColor: CONFIG.CHART.COLORS.negative,
                borderColor0: CONFIG.CHART.COLORS.positive,
                borderWidth: CONFIG.CHART.STYLES.border.width
            }
        }
    },
    
    // 趋势线
    zxdq: {
        name: 'ZXDQ',
        dataSource: 'zxqs',
        processor: (data) => DataProcessor.processIndicatorData(data.zxqs, ['zxdq', 'zxdk']),
        type: 'line',
        dataMapper: (item) => item.zxdq,
        style: {
            symbol: 'none',
            lineStyle: {
                color: CONFIG.CHART.COLORS.zxdq,
                width: CONFIG.CHART.STYLES.line.zxdqWidth
            }
        }
    },
    
    zxdk: {
        name: 'ZXDK', 
        dataSource: 'zxqs',
        processor: (data) => DataProcessor.processIndicatorData(data.zxqs, ['zxdq', 'zxdk']),
        type: 'line',
        dataMapper: (item) => item.zxdk,
        style: {
            symbol: 'none',
            lineStyle: {
                color: CONFIG.CHART.COLORS.zxdk,
                width: CONFIG.CHART.STYLES.line.zxdkWidth
            }
        }
    },
    
    // 成交量
    volume: {
        name: '成交量',
        dataSource: 'kline', 
        processor: (data) => DataProcessor.processKlineData(data.kline),
        type: 'bar',
        dataMapper: (item) => ({
            value: item.volume,
            itemStyle: {
                color: item.close <= item.open 
                    ? CONFIG.CHART.COLORS.positive 
                    : CONFIG.CHART.COLORS.negative
            }
        })
    },
    
    // KDJ指标
    k: {
        name: 'K',
        dataSource: 'kdj',
        processor: (data) => DataProcessor.processIndicatorData(data.kdj, ['k', 'd', 'j']),
        type: 'line',
        dataMapper: (item) => item.k,
        style: {
            symbol: 'none',
            lineStyle: {
                color: CONFIG.CHART.COLORS.kdj[0],
                width: CONFIG.CHART.STYLES.line.width
            }
        }
    },
    
    d: {
        name: 'D',
        dataSource: 'kdj', 
        processor: (data) => DataProcessor.processIndicatorData(data.kdj, ['k', 'd', 'j']),
        type: 'line',
        dataMapper: (item) => item.d,
        style: {
            symbol: 'none', 
            lineStyle: {
                color: CONFIG.CHART.COLORS.kdj[1],
                width: CONFIG.CHART.STYLES.line.width
            }
        }
    },
    
    j: {
        name: 'J',
        dataSource: 'kdj',
        processor: (data) => DataProcessor.processIndicatorData(data.kdj, ['k', 'd', 'j']),
        type: 'line',
        dataMapper: (item) => item.j, 
        style: {
            symbol: 'none',
            lineStyle: {
                color: CONFIG.CHART.COLORS.kdj[2],
                width: CONFIG.CHART.STYLES.line.width
            }
        }
    },
    
    // MACD指标
    dif: {
        name: 'DIF',
        dataSource: 'macd',
        processor: (data) => DataProcessor.processIndicatorData(data.macd, ['dif', 'dea', 'macd']),
        type: 'line',
        dataMapper: (item) => item.dif,
        style: {
            symbol: 'none',
            lineStyle: {
                color: CONFIG.CHART.COLORS.macd[0],
                width: CONFIG.CHART.STYLES.line.width
            }
        }
    },
    
    dea: {
        name: 'DEA', 
        dataSource: 'macd',
        processor: (data) => DataProcessor.processIndicatorData(data.macd, ['dif', 'dea', 'macd']),
        type: 'line',
        dataMapper: (item) => item.dea,
        style: {
            symbol: 'none',
            lineStyle: {
                color: CONFIG.CHART.COLORS.macd[1],
                width: CONFIG.CHART.STYLES.line.width
            }
        }
    },
    
    macd: {
        name: 'MACD',
        dataSource: 'macd',
        processor: (data) => DataProcessor.processIndicatorData(data.macd, ['dif', 'dea', 'macd']),
        type: 'bar',
        dataMapper: (item) => ({
            value: item.macd,
            itemStyle: {
                color: item.macd >= 0 
                    ? CONFIG.CHART.COLORS.negative 
                    : CONFIG.CHART.COLORS.positive
            }
        })
    },
    
    // 单针下20指标
    rsvshort: {
        name: '短期波动',
        dataSource: 'dzx20',
        processor: (data) => DataProcessor.processIndicatorData(data.dzx20, ['rsvshort', 'rsvlong']),
        type: 'line', 
        dataMapper: (item) => item.rsvshort,
        style: {
            symbol: 'none',
            lineStyle: {
                color: CONFIG.CHART.COLORS.dzx20[0],
                width: CONFIG.CHART.STYLES.line.width
            }
        }
    },
    
    rsvlong: {
        name: '长期波动',
        dataSource: 'dzx20',
        processor: (data) => DataProcessor.processIndicatorData(data.dzx20, ['rsvshort', 'rsvlong']),
        type: 'line',
        dataMapper: (item) => item.rsvlong,
        style: {
            symbol: 'none',
            lineStyle: {
                color: CONFIG.CHART.COLORS.dzx20[1],
                width: CONFIG.CHART.STYLES.line.width
            }
        }
    },
    
    // 水平线
    level20: {
        name: '20水平线',
        dataSource: 'dzx20',
        type: 'line',
        dataMapper: () => 20,
        style: {
            symbol: 'none',
            lineStyle: {
                color: CONFIG.CHART.COLORS.dzx20Lines,
                width: 1
            }
        }
    },
    
    level80: {
        name: '80水平线', 
        dataSource: 'dzx20',
        type: 'line',
        dataMapper: () => 80,
        style: {
            symbol: 'none',
            lineStyle: {
                color: CONFIG.CHART.COLORS.dzx20Lines, 
                width: 1
            }
        }
    }
};

// 图表配置 - 现在只需要配置包含哪些线
export const CHART_CONFIG = {
    main: {
        name: 'K线图',
        type: 'main',
        lines: ['candlestick', 'zxdq', 'zxdk'], // 只需要配置线名
        alwaysVisible: true,
        showXAxisLabel: true
    },
    volume: {
        name: '成交量',
        type: 'sub', 
        lines: ['volume'],
        legend: ['成交量']
    },
    kdj: {
        name: 'KDJ',
        type: 'sub',
        lines: ['k', 'd', 'j'],
        legend: ['K', 'D', 'J']
    },
    macd: {
        name: 'MACD', 
        type: 'sub',
        lines: ['dif', 'dea', 'macd'],
        legend: ['DIF', 'DEA', 'MACD']
    },
    dzx20: {
        name: '单针下20',
        type: 'sub',
        lines: ['rsvshort', 'rsvlong', 'level20', 'level80'],
        legend: ['短期波动', '长期波动']
    }
};