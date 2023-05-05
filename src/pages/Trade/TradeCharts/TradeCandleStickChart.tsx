import {
    DetailedHTMLProps,
    HTMLAttributes,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    CandleData,
    CandlesByPoolAndDuration,
} from '../../../utils/state/graphDataSlice';
import Chart from '../../Chart/Chart';
import './TradeCandleStickChart.css';

// import candleStikPlaceholder from '../../../assets/images/charts/candlestick.png';
import { LiquidityDataLocal } from './TradeCharts';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { getPinnedPriceValuesFromTicks } from '../Range/rangeFunctions';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { ChainSpec } from '@crocswap-libs/sdk';
import ChartSkeleton from './ChartSkeleton/ChartSkeleton';

import { candleDomain } from '../../../utils/state/tradeDataSlice';
import { chartSettingsMethodsIF } from '../../../App/hooks/useChartSettings';
import { IS_LOCAL_ENV } from '../../../constants';
import { diffHashSig } from '../../../utils/functions/diffHashSig';

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<
                HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
            >;
            'd3fc-svg': DetailedHTMLProps<
                HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
            >;
        }
    }
}

interface propsIF {
    isUserLoggedIn: boolean | undefined;
    chainData: ChainSpec;
    expandTradeTable: boolean;
    candleData: CandlesByPoolAndDuration | undefined;
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    chartItemStates: chartItemStates;
    limitTick: number | undefined;
    liquidityData: any;
    isAdvancedModeActive: boolean | undefined;
    simpleRangeWidth: number | undefined;
    truncatedPoolPrice: number | undefined;
    poolPriceDisplay: number | undefined;
    setCurrentData: React.Dispatch<
        React.SetStateAction<CandleData | undefined>
    >;
    setCurrentVolumeData: React.Dispatch<
        React.SetStateAction<number | undefined>
    >;
    upBodyColor: string;
    upBorderColor: string;
    downBodyColor: string;
    downBorderColor: string;
    upVolumeColor: string;
    downVolumeColor: string;
    baseTokenAddress: string;
    chainId: string;
    poolPriceNonDisplay: number | undefined;
    selectedDate: number | undefined;
    setSelectedDate: React.Dispatch<number | undefined>;
    rescale: boolean | undefined;
    setRescale: React.Dispatch<React.SetStateAction<boolean>>;
    latest: boolean | undefined;
    setLatest: React.Dispatch<React.SetStateAction<boolean>>;
    reset: boolean | undefined;
    setReset: React.Dispatch<React.SetStateAction<boolean>>;
    showLatest: boolean | undefined;
    setShowLatest: React.Dispatch<React.SetStateAction<boolean>>;
    setShowTooltip: React.Dispatch<React.SetStateAction<boolean>>;
    handlePulseAnimation: (type: string) => void;
    fetchingCandle: boolean;
    setFetchingCandle: React.Dispatch<React.SetStateAction<boolean>>;
    minPrice: number;
    maxPrice: number;
    setMaxPrice: React.Dispatch<React.SetStateAction<number>>;
    setMinPrice: React.Dispatch<React.SetStateAction<number>>;
    rescaleRangeBoundariesWithSlider: boolean;
    setRescaleRangeBoundariesWithSlider: React.Dispatch<
        React.SetStateAction<boolean>
    >;
    showSidebar: boolean;
    setCandleDomains: React.Dispatch<React.SetStateAction<candleDomain>>;
    setSimpleRangeWidth: React.Dispatch<React.SetStateAction<number>>;
    setRepositionRangeWidth: React.Dispatch<React.SetStateAction<number>>;
    repositionRangeWidth: number;
    setChartTriggeredBy: React.Dispatch<React.SetStateAction<string>>;
    chartTriggeredBy: string;
    chartSettings: chartSettingsMethodsIF;
    isMarketOrLimitModule: boolean;
}

type chartItemStates = {
    showTvl: boolean;
    showVolume: boolean;
    showFeeRate: boolean;
    liqMode: string;
};

export default function TradeCandleStickChart(props: propsIF) {
    const {
        isUserLoggedIn,
        chainData,
        baseTokenAddress,
        chainId,
        poolPriceNonDisplay,
        selectedDate,
        setSelectedDate,
        handlePulseAnimation,
        setFetchingCandle,
        minPrice,
        maxPrice,
        setMaxPrice,
        setMinPrice,
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
        showSidebar,
        setCandleDomains,
        setSimpleRangeWidth,
        setRepositionRangeWidth,
        repositionRangeWidth,
        poolPriceDisplay,
        setChartTriggeredBy,
        chartTriggeredBy,
        chartSettings,
        isMarketOrLimitModule,
    } = props;

    const unparsedCandleData = props.candleData?.candles;
    const period = props.candleData?.duration;

    const [scaleData, setScaleData] = useState<any>();
    const [liquidityScale, setLiquidityScale] = useState<any>();
    const [liquidityDepthScale, setLiquidityDepthScale] = useState<any>();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isCandleAdded, setIsCandleAdded] = useState<boolean>(false);
    const expandTradeTable = props?.expandTradeTable;

    const tradeData = useAppSelector((state) => state.tradeData);

    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const denominationsInBase = tradeData.isDenomBase;
    const isTokenABase = tokenPair?.dataTokenA.address === baseTokenAddress;

    const tokenA = tokenPair.dataTokenA;
    const tokenB = tokenPair.dataTokenB;
    const tokenADecimals = tokenA.decimals;
    const tokenBDecimals = tokenB.decimals;
    const baseTokenDecimals = isTokenABase ? tokenADecimals : tokenBDecimals;
    const quoteTokenDecimals = !isTokenABase ? tokenADecimals : tokenBDecimals;

    const currentPoolPriceTick =
        poolPriceNonDisplay === undefined
            ? 0
            : Math.log(poolPriceNonDisplay) / Math.log(1.0001);

    const candleTimeInSeconds: number = isMarketOrLimitModule
        ? chartSettings.candleTime.market.time
        : chartSettings.candleTime.range.time;

    useEffect(() => {
        setIsLoading(true);
    }, [candleTimeInSeconds, denominationsInBase]);

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('setting candle added to true');
        setIsCandleAdded(true);
    }, [diffHashSig(props.candleData), denominationsInBase]);

    // Parse liquidtiy data
    const liquidityData = useMemo(() => {
        if (
            props.liquidityData &&
            poolPriceDisplay !== undefined &&
            poolPriceDisplay > 0
        ) {
            IS_LOCAL_ENV && console.debug('parsing liquidity data');

            const liqAskData: LiquidityDataLocal[] = [];
            const liqBidData: LiquidityDataLocal[] = [];
            const depthLiqBidData: LiquidityDataLocal[] = [];
            const depthLiqAskData: LiquidityDataLocal[] = [];

            let topBoundary = 0;
            let lowBoundary = 0;

            const lowTick = currentPoolPriceTick - 100 * 101;
            const highTick = currentPoolPriceTick + 100 * 101;

            const rangeBoundary = getPinnedPriceValuesFromTicks(
                denominationsInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                lowTick,
                highTick,
                lookupChain(chainId).gridSize,
            );

            const limitBoundary = parseFloat(
                rangeBoundary.pinnedMaxPriceDisplay,
            );

            const barThreshold =
                poolPriceDisplay !== undefined ? poolPriceDisplay : 0;

            const domainLeft = Math.min(
                ...props.liquidityData.ranges.map((o: any) => {
                    return o.activeLiq !== undefined
                        ? parseFloat(o.activeLiq)
                        : Infinity;
                }),
            );
            const domainRight = Math.max(
                ...props.liquidityData.ranges.map((o: any) => {
                    return o.activeLiq !== undefined
                        ? parseFloat(o.activeLiq)
                        : 0;
                }),
            );

            const depthBidLeft = Math.min(
                ...props.liquidityData.ranges.map((o: any) => {
                    return o.cumBidLiq !== undefined && o.cumBidLiq !== '0'
                        ? parseFloat(o.cumBidLiq)
                        : Infinity;
                }),
            );
            const depthBidRight = Math.max(
                ...props.liquidityData.ranges.map((o: any) => {
                    return o.cumBidLiq !== undefined && o.cumBidLiq !== '0'
                        ? parseFloat(o.cumBidLiq)
                        : 0;
                }),
            );

            const depthAskLeft = Math.min(
                ...props.liquidityData.ranges.map((o: any) => {
                    return o.cumAskLiq !== undefined && o.cumAskLiq !== '0'
                        ? parseFloat(o.cumAskLiq)
                        : Infinity;
                }),
            );
            const depthAskRight = Math.max(
                ...props.liquidityData.ranges.map((o: any) => {
                    const price = denominationsInBase
                        ? o.upperBoundInvPriceDecimalCorrected
                        : o.upperBoundPriceDecimalCorrected;
                    if (price > barThreshold / 10 && price < limitBoundary) {
                        return o.cumAskLiq !== undefined && o.cumAskLiq !== '0'
                            ? parseFloat(o.cumAskLiq)
                            : 0;
                    }
                    return 0;
                }),
            );

            const liquidityScale = d3
                .scaleLog()
                .domain([domainLeft, domainRight])
                .range([30, 1000]);

            const depthLiquidityScale = d3
                .scaleLog()
                .domain([
                    depthAskLeft < depthBidLeft ? depthAskLeft : depthBidLeft,
                    depthBidRight > depthAskRight
                        ? depthBidRight
                        : depthAskRight,
                ])
                .range([30, 550]);

            const liqBoundaryData = props.liquidityData.ranges.find(
                (liq: any) => {
                    return denominationsInBase
                        ? liq.upperBoundInvPriceDecimalCorrected <
                              barThreshold &&
                              liq.lowerBoundInvPriceDecimalCorrected !== '-inf'
                        : liq.lowerBoundPriceDecimalCorrected > barThreshold &&
                              liq.upperBoundPriceDecimalCorrected !== '+inf';
                },
            );

            const liqBoundary =
                liqBoundaryData !== undefined
                    ? denominationsInBase
                        ? liqBoundaryData.lowerBoundInvPriceDecimalCorrected
                        : liqBoundaryData.upperBoundPriceDecimalCorrected
                    : barThreshold;
            let liqBoundaryDepth = liqBoundary;
            props.liquidityData.ranges.map((data: any) => {
                const liqUpperPrices = denominationsInBase
                    ? data.upperBoundInvPriceDecimalCorrected
                    : data.lowerBoundPriceDecimalCorrected;

                const liqLowerPrices = denominationsInBase
                    ? data.lowerBoundInvPriceDecimalCorrected
                    : data.upperBoundPriceDecimalCorrected;

                if (
                    liqUpperPrices >= liqBoundary &&
                    liqUpperPrices < liqBoundary * 10
                ) {
                    liqBidData.push({
                        activeLiq: liquidityScale(data.activeLiq),
                        liqPrices: liqUpperPrices,
                        deltaAverageUSD: data.deltaAverageUSD
                            ? data.deltaAverageUSD
                            : 0,
                        cumAverageUSD: data.cumAverageUSD
                            ? data.cumAverageUSD
                            : 0,
                        upperBound: data.upperBound,
                        lowerBound: data.lowerBound,
                    });
                } else {
                    if (
                        liqLowerPrices <= limitBoundary &&
                        liqLowerPrices > liqBoundary / 10
                    ) {
                        liqAskData.push({
                            activeLiq: liquidityScale(data.activeLiq),
                            liqPrices: liqLowerPrices,
                            deltaAverageUSD: data.deltaAverageUSD
                                ? data.deltaAverageUSD
                                : 0,
                            cumAverageUSD: data.cumAverageUSD
                                ? data.cumAverageUSD
                                : 0,
                            upperBound: data.upperBound,
                            lowerBound: data.lowerBound,
                        });
                    }
                }

                if (!denominationsInBase) {
                    if (
                        data.cumAskLiq !== undefined &&
                        data.cumAskLiq !== '0' &&
                        liqUpperPrices !== '+inf' &&
                        !Number.isNaN(depthLiquidityScale(data.cumAskLiq)) &&
                        liqUpperPrices < liqBoundary * 10
                    ) {
                        depthLiqBidData.push({
                            activeLiq: depthLiquidityScale(data.cumAskLiq),
                            liqPrices: liqUpperPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                            upperBound: data.upperBound,
                            lowerBound: data.lowerBound,
                        });
                        liqBoundaryDepth = depthLiqBidData[0].liqPrices;
                    }

                    if (
                        data.cumBidLiq !== undefined &&
                        !Number.isNaN(depthLiquidityScale(data.cumBidLiq)) &&
                        liqLowerPrices > liqBoundary / 10
                    ) {
                        depthLiqAskData.push({
                            activeLiq: depthLiquidityScale(data.cumBidLiq),
                            liqPrices: liqLowerPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                            upperBound: data.upperBound,
                            lowerBound: data.lowerBound,
                        });

                        liqBoundaryDepth = liqLowerPrices;
                    }
                } else {
                    if (
                        data.cumBidLiq !== undefined &&
                        data.cumBidLiq !== '0' &&
                        liqUpperPrices !== '+inf' &&
                        liqUpperPrices < liqBoundary * 10 &&
                        !Number.isNaN(depthLiquidityScale(data.cumBidLiq))
                    ) {
                        depthLiqBidData.push({
                            activeLiq: depthLiquidityScale(data.cumBidLiq),
                            liqPrices: liqUpperPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                            upperBound: data.upperBound,
                            lowerBound: data.lowerBound,
                        });
                        liqBoundaryDepth = liqUpperPrices;
                    }

                    if (
                        data.cumAskLiq !== undefined &&
                        data.cumAskLiq !== '0' &&
                        !Number.isNaN(depthLiquidityScale(data.cumAskLiq)) &&
                        liqUpperPrices <= limitBoundary &&
                        liqUpperPrices > liqBoundary / 10
                    ) {
                        depthLiqAskData.push({
                            activeLiq: depthLiquidityScale(data.cumAskLiq),
                            liqPrices: liqLowerPrices,
                            deltaAverageUSD: data.deltaAverageUSD,
                            cumAverageUSD: data.cumAverageUSD,
                            upperBound: data.upperBound,
                            lowerBound: data.lowerBound,
                        });
                        liqBoundaryDepth = depthLiqAskData[0].liqPrices;
                    }
                }
            });
            if (liqBidData.length > 1 && liqAskData.length > 1) {
                liqBidData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);

                liqAskData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);
                depthLiqBidData.sort(
                    (a: any, b: any) => b.liqPrices - a.liqPrices,
                );

                liqBidData.push({
                    activeLiq: liqBidData.find(
                        (liqData) => liqData.liqPrices < limitBoundary,
                    )?.activeLiq,
                    liqPrices: limitBoundary,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                    upperBound: 0,
                    lowerBound: 0,
                });

                depthLiqBidData.push({
                    activeLiq: depthLiqBidData.find(
                        (liqData) => liqData.liqPrices < limitBoundary,
                    )?.activeLiq,
                    liqPrices: limitBoundary,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                    upperBound: 0,
                    lowerBound: 0,
                });

                liqAskData.push({
                    activeLiq: liqAskData[liqAskData.length - 1].activeLiq,
                    liqPrices: 0,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                    upperBound: 0,
                    lowerBound: 0,
                });

                depthLiqAskData.push({
                    activeLiq:
                        depthLiqAskData[
                            !denominationsInBase
                                ? 0
                                : depthLiqAskData.length - 1
                        ]?.activeLiq,
                    liqPrices: 0,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                    upperBound: 0,
                    lowerBound: 0,
                });
            }
            topBoundary = limitBoundary;
            lowBoundary = parseFloat(rangeBoundary.pinnedMinPriceDisplay);

            liqAskData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);
            liqBidData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);
            depthLiqBidData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);
            depthLiqAskData.sort((a: any, b: any) => b.liqPrices - a.liqPrices);

            return {
                liqAskData: liqAskData,
                liqBidData: liqBidData,
                depthLiqBidData: depthLiqBidData,
                depthLiqAskData: depthLiqAskData,
                liqHighligtedAskSeries: [],
                liqHighligtedBidSeries: [],
                lineBidSeries: [],
                lineAskSeries: [],
                totalLiq: props.liquidityData?.totals?.totalLiq,
                topBoundary: topBoundary,
                lowBoundary: lowBoundary,
                liqBoundaryCurve: liqBoundary,
                liqBoundaryDepth: liqBoundaryDepth,
            };
        } else {
            setIsLoading(true);
            return undefined;
        }
    }, [
        diffHashSig(props.liquidityData),
        poolPriceDisplay,
        denominationsInBase,
        poolPriceDisplay !== undefined && poolPriceDisplay > 0,
    ]);

    useEffect(() => {
        IS_LOCAL_ENV &&
            console.debug(
                'resetting scale for chart because timeframe changed',
                period,
            );
        if (!(unparsedCandleData?.length && unparsedCandleData.length > 0)) {
            setScaleData(() => {
                return undefined;
            });
        } else {
            setScaleForChart(unparsedCandleData);
        }
    }, [period, unparsedCandleData?.length && unparsedCandleData.length > 0]);

    // Liq Scale
    useEffect(() => {
        if (liquidityData === undefined) {
            setLiquidityScale(() => {
                return undefined;
            });
        } else {
            setScaleForChartLiquidity(liquidityData);
        }
    }, [
        liquidityData === undefined,
        liquidityData?.liqAskData.length === 0,
        liquidityData?.liqBidData.length === 0,
        liquidityData?.depthLiqAskData.length === 0,
        liquidityData?.depthLiqAskData.length === 0,
    ]);

    const setScaleForChartLiquidity = (liquidityData: any) => {
        IS_LOCAL_ENV && console.debug('parse Liq Scale');
        if (liquidityData !== undefined) {
            const liquidityScale = d3.scaleLinear();
            const liquidityDepthScale = d3.scaleLinear();

            const liquidityExtent = d3fc
                .extentLinear()
                .include([0])
                .accessors([(d: any) => parseFloat(d.activeLiq)]);

            liquidityScale.domain(
                liquidityExtent(
                    liquidityData.liqBidData.concat(liquidityData.liqAskData),
                ),
            );
            liquidityDepthScale.domain(
                liquidityExtent(
                    liquidityData.depthLiqBidData.concat(
                        liquidityData.depthLiqAskData,
                    ),
                ),
            );

            setLiquidityScale(() => liquidityScale);
            setLiquidityDepthScale(() => liquidityDepthScale);
        }
    };

    // Scale
    const setScaleForChart = (unparsedCandleData: any) => {
        if (unparsedCandleData !== undefined && period) {
            const temp = [...unparsedCandleData];
            const boundaryCandles = temp.splice(0, 99);

            const priceRange = d3fc
                .extentLinear()
                .accessors([(d: any) => d.high, (d: any) => d.low])
                .pad([0.05, 0.05]);

            const xExtent = d3fc
                .extentLinear()
                .accessors([(d: any) => d.time * 1000])
                .padUnit('domain')
                .pad([period * 1000, (period / 2) * 80 * 1000]);

            const xScale = d3.scaleLinear();
            const xScaleTime = d3.scaleTime();
            const yScale = d3.scaleLinear();

            xScale.domain(xExtent(boundaryCandles));
            yScale.domain(priceRange(boundaryCandles));

            const xScaleCopy = xScale.copy();

            const volumeScale = d3.scaleLinear();

            const yExtentVolume = d3fc
                .extentLinear(props.candleData?.candles)
                .accessors([(d: any) => d.volumeUSD]);

            volumeScale.domain(yExtentVolume(props.candleData?.candles));

            // bar chart

            setScaleData(() => {
                return {
                    xScale: xScale,
                    xScaleTime: xScaleTime,
                    yScale: yScale,
                    xScaleCopy: xScaleCopy,
                    // ghostScale: ghostScale,
                    volumeScale: volumeScale,
                    lastDragedY: 0,
                    xExtent: xExtent,
                };
            });
        }
    };

    const loading = (
        <div
            style={{ height: '100%', width: '100%' }}
            className='animatedImg_container'
        >
            <ChartSkeleton />
            <div className='fetching_text'>Fetching chart data...</div>
        </div>
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            const shouldReload =
                scaleData === undefined ||
                liquidityScale === undefined ||
                liquidityDepthScale === undefined ||
                unparsedCandleData?.length === 0 ||
                poolPriceDisplay === 0 ||
                poolPriceNonDisplay === 0 ||
                liquidityData === undefined;

            if (isLoading !== shouldReload) {
                IS_LOCAL_ENV &&
                    console.debug('setting isLoading to ' + shouldReload);
                setIsLoading(shouldReload);
                setFetchingCandle(shouldReload);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [
        unparsedCandleData === undefined,
        unparsedCandleData?.length,
        poolPriceDisplay,
        poolPriceNonDisplay,
        scaleData === undefined,
        liquidityScale,
        liquidityDepthScale,
        liquidityData,
        isLoading,
    ]);

    return (
        <>
            <div style={{ height: '100%', width: '100%' }}>
                {!isLoading && props.candleData !== undefined ? (
                    <Chart
                        isUserLoggedIn={isUserLoggedIn}
                        chainData={chainData}
                        isTokenABase={isTokenABase}
                        expandTradeTable={expandTradeTable}
                        liquidityData={liquidityData}
                        changeState={props.changeState}
                        limitTick={props.limitTick}
                        denomInBase={denominationsInBase}
                        isAdvancedModeActive={props.isAdvancedModeActive}
                        rangeSimpleRangeWidth={props.simpleRangeWidth}
                        poolPriceDisplay={props.poolPriceDisplay}
                        truncatedPoolPrice={props.truncatedPoolPrice}
                        chartItemStates={props.chartItemStates}
                        setCurrentData={props.setCurrentData}
                        setCurrentVolumeData={props.setCurrentVolumeData}
                        upBodyColor={props.upBodyColor}
                        upBorderColor={props.upBorderColor}
                        downBodyColor={props.downBodyColor}
                        downBorderColor={props.downBorderColor}
                        upVolumeColor={props.upVolumeColor}
                        downVolumeColor={props.downVolumeColor}
                        isCandleAdded={isCandleAdded}
                        setIsCandleAdded={setIsCandleAdded}
                        scaleData={scaleData}
                        chainId={chainId}
                        poolPriceNonDisplay={poolPriceNonDisplay}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        rescale={props.rescale}
                        setRescale={props.setRescale}
                        latest={props.latest}
                        setLatest={props.setLatest}
                        reset={props.reset}
                        setReset={props.setReset}
                        showLatest={props.showLatest}
                        setShowLatest={props.setShowLatest}
                        setShowTooltip={props.setShowTooltip}
                        liquidityScale={liquidityScale}
                        liquidityDepthScale={liquidityDepthScale}
                        handlePulseAnimation={handlePulseAnimation}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
                        setMinPrice={setMinPrice}
                        rescaleRangeBoundariesWithSlider={
                            rescaleRangeBoundariesWithSlider
                        }
                        setRescaleRangeBoundariesWithSlider={
                            setRescaleRangeBoundariesWithSlider
                        }
                        showSidebar={showSidebar}
                        setCandleDomains={setCandleDomains}
                        setRangeSimpleRangeWidth={setSimpleRangeWidth}
                        setRepositionRangeWidth={setRepositionRangeWidth}
                        repositionRangeWidth={repositionRangeWidth}
                        setChartTriggeredBy={setChartTriggeredBy}
                        chartTriggeredBy={chartTriggeredBy}
                        candleTime={
                            isMarketOrLimitModule
                                ? chartSettings.candleTime.market
                                : chartSettings.candleTime.range
                        }
                        unparsedData={props.candleData}
                    />
                ) : (
                    <>{loading}</>
                )}
            </div>
        </>
    );
}
