import { CandleDataChart } from '../../../pages/platformAmbient/Chart/ChartUtils/chartUtils';

export interface CandlesByPoolAndDurationIF {
    pool: {
        baseAddress: string;
        quoteAddress: string;
        poolIdx: number;
        chainId: string;
    };
    duration: number;
    candles: Array<CandleDataChart>;
}
