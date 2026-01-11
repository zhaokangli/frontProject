import { CONFIG } from './constants.js';

// 数据处理器
export class DataProcessor {
    static processKlineData(klineArray) {
        return klineArray.map(item => ({
            time: item[0],
            open: this.parseFloat(item[1]),
            close: this.parseFloat(item[2]),
            low: this.parseFloat(item[3]),
            high: this.parseFloat(item[4]),
            volume: this.parseFloat(item[5])
        }));
    }

    static processIndicatorData(indicatorArray, fields) {
        if (!indicatorArray) return [];
        
        return indicatorArray.map(item => {
            const result = { time: item[0] };
            fields.forEach((field, index) => {
                result[field] = this.formatDecimal(
                    this.parseFloat(item[index + 1]),
                    CONFIG.DATA.DECIMAL_PLACES
                );
            });
            return result;
        });
    }

    static parseFloat(value) {
        return parseFloat(value);
    }

    static formatDecimal(value, decimalPlaces = CONFIG.DATA.DECIMAL_PLACES) {
        if (value === null || value === undefined || isNaN(value)) return null;
        return parseFloat(value.toFixed(decimalPlaces));
    }
}