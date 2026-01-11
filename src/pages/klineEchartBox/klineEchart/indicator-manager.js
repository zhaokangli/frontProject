import { CONFIG } from './constants.js';

// 技术指标计算管理器
export class IndicatorManager {
    /**
     * 计算简单移动平均线 (SMA)
     * @param {Array} data - 数据数组
     * @param {number} period - 周期
     * @param {string} field - 数据字段名（可选）
     * @returns {Array} 移动平均线数据
     */
    static calculateMA(data, period, field = null) {
        if (!data || data.length < period) return [];
        
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                result.push(null);
            } else {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    const value = field ? data[i - j][field] : data[i - j];
                    sum += value;
                }
                const maValue = parseFloat((sum / period).toFixed(CONFIG.DATA.DECIMAL_PLACES));
                result.push(maValue);
            }
        }
        return result;
    }

    /**
     * 计算指数移动平均线 (EMA)
     * @param {Array} data - 数据数组
     * @param {number} period - 周期
     * @param {string} field - 数据字段名（可选）
     * @returns {Array} 指数移动平均线数据
     */
    static calculateEMA(data, period, field = null) {
        if (!data || data.length < period) return [];
        
        const result = [];
        const multiplier = 2 / (period + 1);
        
        // 第一个EMA值使用SMA
        let firstSMA = 0;
        for (let i = 0; i < period; i++) {
            const value = field ? data[i][field] : data[i];
            firstSMA += value;
        }
        firstSMA = firstSMA / period;
        result.push(firstSMA);
        
        // 计算后续EMA值
        for (let i = period; i < data.length; i++) {
            const currentValue = field ? data[i][field] : data[i];
            const prevEMA = result[i - period];
            const ema = (currentValue - prevEMA) * multiplier + prevEMA;
            result.push(parseFloat(ema.toFixed(CONFIG.DATA.DECIMAL_PLACES)));
        }
        
        // 补齐前面的null值
        const nullArray = new Array(period - 1).fill(null);
        return [...nullArray, ...result];
    }

    /**
     * 计算布林带 (Bollinger Bands)
     * @param {Array} data - 数据数组（需要包含close价格）
     * @param {number} period - 周期
     * @param {number} multiplier - 标准差乘数
     * @returns {Object} 包含上轨、中轨、下轨的对象
     */
    static calculateBollingerBands(data, period = 20, multiplier = 2) {
        if (!data || data.length < period) return { upper: [], middle: [], lower: [] };
        
        const middle = this.calculateMA(data, period, 'close');
        const upper = [];
        const lower = [];
        
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                upper.push(null);
                lower.push(null);
            } else {
                // 计算标准差
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    const deviation = data[i - j].close - middle[i];
                    sum += deviation * deviation;
                }
                const stdDev = Math.sqrt(sum / period);
                
                upper.push(parseFloat((middle[i] + stdDev * multiplier).toFixed(CONFIG.DATA.DECIMAL_PLACES)));
                lower.push(parseFloat((middle[i] - stdDev * multiplier).toFixed(CONFIG.DATA.DECIMAL_PLACES)));
            }
        }
        
        return { upper, middle, lower };
    }

    /**
     * 计算相对强弱指数 (RSI)
     * @param {Array} data - 数据数组（需要包含close价格）
     * @param {number} period - 周期
     * @returns {Array} RSI数据
     */
    static calculateRSI(data, period = 14) {
        if (!data || data.length <= period) return [];
        
        const gains = [];
        const losses = [];
        const rsi = [];
        
        // 计算价格变化
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        // 计算初始RSI
        let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
        
        rsi.push(avgLoss === 0 ? 100 : parseFloat((100 - (100 / (1 + avgGain / avgLoss))).toFixed(2)));
        
        // 计算后续RSI
        for (let i = period; i < gains.length; i++) {
            avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
            avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
            const currentRSI = avgLoss === 0 ? 100 : parseFloat((100 - (100 / (1 + avgGain / avgLoss))).toFixed(2));
            rsi.push(currentRSI);
        }
        
        // 补齐前面的null值
        const nullArray = new Array(period).fill(null);
        return [...nullArray, ...rsi];
    }
}