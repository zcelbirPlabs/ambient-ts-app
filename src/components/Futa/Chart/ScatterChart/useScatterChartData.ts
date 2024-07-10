import { MARKET_CAP_MULTIPLIER_BIG_INT } from './../../../../pages/platformFuta/mockAuctionData';
import { useContext, useMemo } from 'react';
import { AuctionsContext } from '../../../../contexts/AuctionsContext';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { scatterDotDefaultSize } from './ScatterChart';
import { AuctionDataIF } from '../../../../ambient-utils/dataLayer';

const useScatterChartData = () => {
    const { globalAuctionList, filteredAuctionList } =
        useContext(AuctionsContext);
    const { nativeTokenUsdPrice } = useContext(ChainDataContext);

    const data = useMemo(() => {
        const localData = globalAuctionList.data?.map((element) => {
            const filledClearingPriceInWeiBigInt =
                element.filledClearingPriceInNativeTokenWei
                    ? BigInt(element.filledClearingPriceInNativeTokenWei)
                    : undefined;
            const filledMarketCapInWeiBigInt = filledClearingPriceInWeiBigInt
                ? filledClearingPriceInWeiBigInt * MARKET_CAP_MULTIPLIER_BIG_INT
                : undefined;
            const filledMarketCapInEth = filledMarketCapInWeiBigInt
                ? toDisplayQty(filledMarketCapInWeiBigInt, 18)
                : undefined;
            const filledMarketCapUsdValue =
                nativeTokenUsdPrice !== undefined &&
                filledMarketCapInEth !== undefined
                    ? nativeTokenUsdPrice * parseFloat(filledMarketCapInEth)
                    : undefined;

            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const auctionEndTime = element.createdAt + element.auctionLength;
            const timeRemainingInSec = auctionEndTime - currentTimeInSeconds;

            return {
                name: element.ticker,
                price: filledMarketCapUsdValue ? filledMarketCapUsdValue : 0,
                timeRemaining: timeRemainingInSec,
                size: scatterDotDefaultSize,
                isShow: filteredAuctionList
                    ? filteredAuctionList.some((val: AuctionDataIF) =>
                          val.ticker.includes(element.ticker),
                      )
                    : true,
            };
        });

        if (localData && nativeTokenUsdPrice) {
            return localData;
        }

        return [];
    }, [globalAuctionList, nativeTokenUsdPrice, filteredAuctionList]);

    return data;
};

export default useScatterChartData;
