import { useContext, useEffect, useState } from 'react';
import styles from './TickerComponent.module.css';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { TokenBalanceContext } from '../../../contexts/TokenBalanceContext';
import { useParams } from 'react-router-dom';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import {
    DEFAULT_MAINNET_GAS_PRICE_IN_GWEI,
    DEFAULT_SCROLL_GAS_PRICE_IN_GWEI,
    DEPOSIT_BUFFER_MULTIPLIER_MAINNET,
    DEPOSIT_BUFFER_MULTIPLIER_L2,
    GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE,
    GAS_DROPS_ESTIMATE_RANGE_HARVEST,
    NUM_GWEI_IN_ETH,
    NUM_GWEI_IN_WEI,
    NUM_WEI_IN_GWEI,
    supportedNetworks,
} from '../../../ambient-utils/constants';
import {
    AuctionDataIF,
    calcBidImpact,
    getFormattedNumber,
} from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import useDebounce from '../../../App/hooks/useDebounce';
import { CrocEnv, fromDisplayQty, toDisplayQty } from '@crocswap-libs/sdk';

import BreadCrumb from '../Breadcrumb/Breadcrumb';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Comments from '../Comments/Comments';
import { tickerDisplayElements } from './tickerDisplayElements';
import moment from 'moment';
import {
    getFreshAuctionDetailsForAccount,
    MARKET_CAP_MULTIPLIER_BIG_INT,
} from '../../../pages/platformFuta/mockAuctionData';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

interface PropsIF {
    isAuctionPage?: boolean;
    placeholderTicker?: boolean;
}

// Contexts
const useAuctionContexts = () => {
    const {
        showComments,
        setShowComments,
        globalAuctionList,
        accountData,
        getAuctionData,
        auctionStatusData,
        setSelectedTicker,
    } = useContext(AuctionsContext);
    const {
        chainData: { chainId },
        crocEnv,
    } = useContext(CrocEnvContext);

    const { isUserConnected } = useContext(UserDataContext);
    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);
    const { tokenBalances } = useContext(TokenBalanceContext);
    const { userAddress } = useContext(UserDataContext);
    const {
        gasPriceInGwei,
        isActiveNetworkL2,
        nativeTokenUsdPrice,
        lastBlockNumber,
    } = useContext(ChainDataContext);

    return {
        crocEnv,
        getAuctionData,
        auctionStatusData,
        accountData,
        globalAuctionList,
        chainId,
        showComments,
        setShowComments,
        isUserConnected,
        openWalletModal,
        tokenBalances,
        userAddress,
        gasPriceInGwei,
        isActiveNetworkL2,
        nativeTokenUsdPrice,
        lastBlockNumber,
        setSelectedTicker,
    };
};

// States
const useAuctionStates = () => {
    const { isActiveNetworkL2, auctionStatusData } = useAuctionContexts();
    const [isMaxDropdownOpen, setIsMaxDropdownOpen] = useState(false);
    const [bidQtyNonDisplay, setBidQtyNonDisplay] = useState<
        string | undefined
    >('');
    const [auctionDetails, setAuctionDetails] = useState<
        AuctionDataIF | undefined
    >();
    const [auctionDetailsForConnectedUser, setAuctionDetailsForConnectedUser] =
        useState<AuctionDataIF | undefined>();
    const [bidGasPriceinDollars, setBidGasPriceinDollars] = useState<
        string | undefined
    >();
    const [inputValue, setInputValue] = useState('');
    const [isValidationInProgress, setIsValidationInProgress] =
        useState<boolean>(false);
    const [isPriceImpactQueryInProgress, setIsPriceImpactQueryInProgress] =
        useState<boolean>(false);
    const [bidValidityStatus, setBidValidityStatus] = useState<{
        isValid: boolean;
        reason?: string;
    }>({ isValid: false });
    const [priceImpact, setPriceImpact] = useState<number | undefined>();
    const [
        selectedMaxMarketCapInWeiBigInt,
        setSelectedMaxMarketCapInWeiBigInt,
    ] = useState<bigint | undefined>();
    const [l1GasFeeLimitInGwei] = useState<number>(
        isActiveNetworkL2 ? 0.0002 * 1e9 : 0,
    );

    const openBidClearingPriceInWeiBigInt =
        auctionStatusData.openBidClearingPriceInNativeTokenWei
            ? BigInt(auctionStatusData.openBidClearingPriceInNativeTokenWei)
            : undefined;

    const openBidMarketCapInWeiBigInt = openBidClearingPriceInWeiBigInt
        ? openBidClearingPriceInWeiBigInt * MARKET_CAP_MULTIPLIER_BIG_INT
        : undefined;

    //   const openBidMarketCapInEth = openBidMarketCapInWeiBigInt
    //       ? toDisplayQty(openBidMarketCapInWeiBigInt, 18)
    //       : undefined;

    useEffect(() => {
        setSelectedMaxMarketCapInWeiBigInt(openBidMarketCapInWeiBigInt);
    }, [openBidMarketCapInWeiBigInt]);

    return {
        isMaxDropdownOpen,
        setIsMaxDropdownOpen,
        bidQtyNonDisplay,
        setBidQtyNonDisplay,
        auctionDetails,
        setAuctionDetails,
        auctionDetailsForConnectedUser,
        setAuctionDetailsForConnectedUser,
        bidGasPriceinDollars,
        setBidGasPriceinDollars,
        inputValue,
        setInputValue,
        isValidationInProgress,
        setIsValidationInProgress,
        isPriceImpactQueryInProgress,
        setIsPriceImpactQueryInProgress,
        bidValidityStatus,
        setBidValidityStatus,
        priceImpact,
        setPriceImpact,
        selectedMaxMarketCapInWeiBigInt,
        setSelectedMaxMarketCapInWeiBigInt,
        l1GasFeeLimitInGwei,
        openBidClearingPriceInWeiBigInt,
    };
};

// Component
export default function TickerComponent(props: PropsIF) {
    const { isAuctionPage, placeholderTicker } = props;
    const desktopScreen = useMediaQuery('(min-width: 1280px)');
    const {
        auctionStatusData,
        getAuctionData,
        chainId,
        crocEnv,
        showComments,
        isUserConnected,
        openWalletModal,
        tokenBalances,
        userAddress,
        gasPriceInGwei,
        isActiveNetworkL2,
        nativeTokenUsdPrice,
        lastBlockNumber,
        accountData,
        globalAuctionList,
        setSelectedTicker,
    } = useAuctionContexts();

    const {
        isMaxDropdownOpen,
        setIsMaxDropdownOpen,
        bidQtyNonDisplay,
        setBidQtyNonDisplay,
        auctionDetails,
        setAuctionDetails,
        auctionDetailsForConnectedUser,
        setAuctionDetailsForConnectedUser,
        bidGasPriceinDollars,
        setBidGasPriceinDollars,
        inputValue,
        setInputValue,
        isValidationInProgress,
        setIsValidationInProgress,
        isPriceImpactQueryInProgress,
        setIsPriceImpactQueryInProgress,
        bidValidityStatus,
        setBidValidityStatus,
        priceImpact,
        setPriceImpact,
        selectedMaxMarketCapInWeiBigInt,
        setSelectedMaxMarketCapInWeiBigInt,
        l1GasFeeLimitInGwei,
        openBidClearingPriceInWeiBigInt,
    } = useAuctionStates();

    // Utility functions
    const getAuctionDetails = async (ticker: string) => {
        return globalAuctionList.data
            ? globalAuctionList.data.find(
                  (data) => data.ticker.toLowerCase() === ticker.toLowerCase(),
              )
            : undefined;
    };

    const { ticker: tickerFromParams } = useParams();

    useEffect(() => {
        if (!tickerFromParams) return;
        Promise.resolve(getAuctionData(tickerFromParams)).then(() => {
            // console.log('fetched data for ' + tickerFromParams);
        });
        setSelectedTicker(tickerFromParams);
    }, [tickerFromParams]);

    const auctionedTokenQtyUnclaimedByUser =
        auctionDetailsForConnectedUser?.qtyUnclaimedByUserInAuctionedTokenWei
            ? toDisplayQty(
                  auctionDetailsForConnectedUser?.qtyUnclaimedByUserInAuctionedTokenWei,
                  18,
              )
            : undefined;

    const unclaimedTokenNum = auctionedTokenQtyUnclaimedByUser
        ? parseFloat(auctionedTokenQtyUnclaimedByUser)
        : 0;

    const formattedUnclaimedTokenAllocationForConnectedUser =
        unclaimedTokenNum.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        }) +
        ' ' +
        auctionDetailsForConnectedUser?.ticker;

    const qtyUnreturnedToUser =
        auctionDetailsForConnectedUser?.qtyUnreturnedToUserInNativeTokenWei
            ? toDisplayQty(
                  auctionDetailsForConnectedUser?.qtyUnreturnedToUserInNativeTokenWei,
                  18,
              )
            : undefined;

    const unreturnedTokenNum = qtyUnreturnedToUser
        ? parseFloat(qtyUnreturnedToUser)
        : 0;

    const formattedQtyUnreturnedToUser =
        unreturnedTokenNum.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        }) +
        ' ' +
        'ETH';

    const filledClearingPriceInWeiBigInt =
        auctionStatusData.filledClearingPriceInNativeTokenWei
            ? BigInt(auctionStatusData.filledClearingPriceInNativeTokenWei)
            : undefined;

    const filledMarketCapInWeiBigInt = filledClearingPriceInWeiBigInt
        ? filledClearingPriceInWeiBigInt * MARKET_CAP_MULTIPLIER_BIG_INT
        : undefined;

    const filledMarketCapInEth = filledMarketCapInWeiBigInt
        ? toDisplayQty(filledMarketCapInWeiBigInt, 18)
        : undefined;

    const [timeRemainingInSeconds, setTimeRemainingInSeconds] = useState<
        number | undefined
    >();

    const refreshTimeRemaining = () => {
        if (auctionDetails) {
            const timeRemainingInSeconds = moment(
                auctionDetails.createdAt * 1000,
            ).diff(Date.now() - auctionDetails.auctionLength * 1000, 'seconds');

            setTimeRemainingInSeconds(timeRemainingInSeconds);
        }
    };

    useEffect(() => {
        // refresh time remaining every 1 second
        refreshTimeRemaining();
        const interval = setInterval(() => {
            refreshTimeRemaining();
        }, 1000);
        return () => clearInterval(interval);
    }, [tickerFromParams, auctionDetails]);

    const isAuctionCompleted =
        timeRemainingInSeconds !== undefined
            ? timeRemainingInSeconds <= 0
            : undefined;

    useEffect(() => {
        if (!tickerFromParams) return;
        Promise.resolve(getAuctionDetails(tickerFromParams)).then((details) => {
            setAuctionDetails(details);
        });
    }, [tickerFromParams, globalAuctionList.data]);

    useEffect(() => {
        if (!tickerFromParams) return;
        if (userAddress) {
            Promise.resolve(
                getFreshAuctionDetailsForAccount(tickerFromParams, accountData),
            ).then((details) => {
                setAuctionDetailsForConnectedUser(
                    details ? details : undefined,
                );
            });
        } else {
            setAuctionDetailsForConnectedUser(undefined);
        }
    }, [tickerFromParams, userAddress, accountData]);

    const averageGasUnitsForBidTxInGasDrops = GAS_DROPS_ESTIMATE_RANGE_HARVEST;

    useEffect(() => {
        if (gasPriceInGwei && nativeTokenUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                averageGasUnitsForBidTxInGasDrops *
                NUM_GWEI_IN_WEI *
                nativeTokenUsdPrice;

            setBidGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, nativeTokenUsdPrice]);

    const nativeToken = supportedNetworks[chainId]?.defaultPair[0];

    const nativeData: TokenIF | undefined =
        tokenBalances &&
        tokenBalances.find(
            (tkn: TokenIF) => tkn.address === nativeToken.address,
        );

    const nativeTokenWalletBalance = nativeData?.walletBalance;

    const bidDisplayNum = inputValue
        ? parseFloat(inputValue ?? '0')
        : undefined;

    const bidUsdValue =
        nativeTokenUsdPrice !== undefined && bidDisplayNum !== undefined
            ? nativeTokenUsdPrice * bidDisplayNum
            : undefined;

    const nativeTokenDecimals = nativeToken.decimals;

    const checkBidValidity = async (
        bidQtyNonDisplay: string,
    ): Promise<{ isValid: boolean; reason?: string }> => {
        const isNonZero =
            !!bidQtyNonDisplay && parseFloat(bidQtyNonDisplay) > 0;

        if (!isNonZero)
            return {
                isValid: false,
                reason: 'Bid size must be greater than 0',
            };

        const inputValueInWei = fromDisplayQty(inputValue, 18);
        const inputValueGreaterThanSelectedClearingPrice =
            inputValueInWei >
            (selectedMaxMarketCapInWeiBigInt ?? 0n) /
                MARKET_CAP_MULTIPLIER_BIG_INT;

        if (inputValueGreaterThanSelectedClearingPrice)
            return {
                isValid: false,
                reason: 'Increase max market cap',
            };

        if (!isUserConnected) {
            return { isValid: true };
        } else {
            if (!nativeTokenWalletBalanceAdjustedNonDisplayString)
                return { isValid: false, reason: 'No balance' };

            const bidSizeLessThanAdjustedBalance =
                BigInt(nativeTokenWalletBalanceAdjustedNonDisplayString) >
                BigInt(bidQtyNonDisplay);

            return {
                isValid: bidSizeLessThanAdjustedBalance,
                reason: 'Insufficient balance',
            };
        }
    };

    const getPriceImpact = async (
        crocEnv: CrocEnv | undefined,
        bidQtyNonDisplay: string,
    ) => {
        if (!crocEnv || !tickerFromParams || !selectedMaxMarketCapInWeiBigInt)
            return undefined;
        const isNonZero =
            !!bidQtyNonDisplay && parseFloat(bidQtyNonDisplay) > 0;

        if (!isNonZero || !openBidClearingPriceInWeiBigInt) return undefined;

        const priceImpact = calcBidImpact(
            crocEnv,
            tickerFromParams,
            selectedMaxMarketCapInWeiBigInt.toString(),
            bidQtyNonDisplay,
        );

        return priceImpact;
    };

    const debouncedBidInput: string | undefined = useDebounce(
        bidQtyNonDisplay,
        500,
    );

    const nativeTokenWalletBalanceDisplay = nativeTokenWalletBalance
        ? toDisplayQty(nativeTokenWalletBalance, nativeTokenDecimals)
        : undefined;

    const nativeTokenWalletBalanceDisplayNum = nativeTokenWalletBalanceDisplay
        ? parseFloat(nativeTokenWalletBalanceDisplay)
        : undefined;

    const nativeTokenWalletBalanceTruncated = getFormattedNumber({
        value: nativeTokenWalletBalanceDisplayNum,
    });

    const amountToReduceNativeTokenQtyMainnet =
        BigInt(Math.ceil(gasPriceInGwei || DEFAULT_MAINNET_GAS_PRICE_IN_GWEI)) *
        BigInt(NUM_WEI_IN_GWEI) *
        BigInt(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE) *
        BigInt(DEPOSIT_BUFFER_MULTIPLIER_MAINNET);

    const amountToReduceNativeTokenQtyL2 =
        BigInt(Math.ceil(gasPriceInGwei || DEFAULT_SCROLL_GAS_PRICE_IN_GWEI)) *
        BigInt(NUM_WEI_IN_GWEI) *
        BigInt(GAS_DROPS_ESTIMATE_DEPOSIT_NATIVE) *
        BigInt(DEPOSIT_BUFFER_MULTIPLIER_L2);

    const amountToReduceNativeTokenQty = isActiveNetworkL2
        ? amountToReduceNativeTokenQtyL2
        : amountToReduceNativeTokenQtyMainnet;

    const isTokenWalletBalanceGreaterThanZero = nativeTokenWalletBalance
        ? parseFloat(nativeTokenWalletBalance) > 0
        : false;

    const nativeTokenWalletBalanceAdjustedNonDisplayString =
        nativeTokenWalletBalance
            ? (
                  BigInt(nativeTokenWalletBalance) -
                  amountToReduceNativeTokenQty -
                  BigInt(l1GasFeeLimitInGwei * NUM_GWEI_IN_ETH)
              ).toString()
            : nativeTokenWalletBalance;

    const adjustedTokenWalletBalanceDisplay = useDebounce(
        nativeTokenWalletBalanceAdjustedNonDisplayString
            ? toDisplayQty(
                  nativeTokenWalletBalanceAdjustedNonDisplayString,
                  nativeTokenDecimals,
              )
            : undefined,
        500,
    );

    useEffect(() => {
        if (!debouncedBidInput) return;
        checkBidValidity(debouncedBidInput).then((result) => {
            setIsValidationInProgress(false);
            setBidValidityStatus(result);
        });
        getPriceImpact(crocEnv, debouncedBidInput).then((impact) => {
            setIsPriceImpactQueryInProgress(false);
            setPriceImpact(impact?.priceImpactPercentage);
        });
    }, [
        debouncedBidInput,
        nativeTokenWalletBalanceAdjustedNonDisplayString,
        lastBlockNumber,
        selectedMaxMarketCapInWeiBigInt,
    ]);

    useEffect(() => {
        setIsValidationInProgress(true);
    }, [bidQtyNonDisplay]);

    const handleBalanceClick = () => {
        if (isTokenWalletBalanceGreaterThanZero) {
            setBidQtyNonDisplay(
                nativeTokenWalletBalanceAdjustedNonDisplayString,
            );

            if (adjustedTokenWalletBalanceDisplay)
                setInputValue(adjustedTokenWalletBalanceDisplay);
        }
    };

    const formattedPriceImpact =
        !priceImpact || isPriceImpactQueryInProgress
            ? '-'
            : getFormattedNumber({
                  value: priceImpact * 100,
                  isPercentage: true,
              }) + '%';

    const filledMarketCapUsdValue =
        nativeTokenUsdPrice !== undefined && filledMarketCapInEth !== undefined
            ? nativeTokenUsdPrice * parseFloat(filledMarketCapInEth)
            : undefined;

    const isAllocationAvailableToClaim =
        auctionedTokenQtyUnclaimedByUser &&
        parseFloat(auctionedTokenQtyUnclaimedByUser) > 0;

    const isNativeTokenAvailableToReturn =
        qtyUnreturnedToUser && parseFloat(qtyUnreturnedToUser) > 0;

    const showTradeButton =
        (isAuctionCompleted && !isUserConnected) ||
        (isUserConnected &&
            isAuctionCompleted &&
            !isAllocationAvailableToClaim &&
            !isNativeTokenAvailableToReturn);

    const isButtonDisabled =
        isUserConnected &&
        !isAuctionCompleted &&
        (isValidationInProgress || !bidValidityStatus.isValid);

    const buttonLabel =
        !tickerFromParams && isUserConnected
            ? 'Select an Auction'
            : isAllocationAvailableToClaim
              ? 'Claim'
              : isNativeTokenAvailableToReturn
                ? 'Return'
                : showTradeButton
                  ? 'Trade'
                  : !isUserConnected
                    ? 'Connect Wallet'
                    : !bidQtyNonDisplay || parseFloat(bidQtyNonDisplay) === 0
                      ? 'Enter a Bid Size'
                      : isValidationInProgress
                        ? 'Validating Bid...'
                        : bidValidityStatus.isValid
                          ? 'Bid'
                          : bidValidityStatus.reason || 'Invalid Bid';

    const bidButton = (
        <button
            className={`${styles.bidButton} ${
                isButtonDisabled ? styles.bidButtonDisabled : ''
            } ${desktopScreen ? styles.bidButtonDesktop : ''}`}
            onClick={() =>
                isAllocationAvailableToClaim
                    ? console.log(
                          `clicked claim for amount: ${formattedUnclaimedTokenAllocationForConnectedUser}`,
                      )
                    : isNativeTokenAvailableToReturn
                      ? console.log(
                            `clicked return for amount: ${formattedQtyUnreturnedToUser}`,
                        )
                      : showTradeButton
                        ? console.log(
                              `clicked Trade for ticker: ${tickerFromParams}`,
                          )
                        : !isUserConnected
                          ? openWalletModal()
                          : console.log(
                                `clicked Bid for display qty: ${inputValue}`,
                            )
            }
            disabled={isButtonDisabled}
        >
            {buttonLabel}
        </button>
    );

    const tickerDisplayElementsProps = {
        auctionStatusData,
        auctionDetailsForConnectedUser,
        filledMarketCapInEth,
        filledMarketCapUsdValue,
        timeRemainingInSeconds,
        isAuctionCompleted,
        placeholderTicker,
        auctionDetails,
        bidGasPriceinDollars,
        formattedPriceImpact,
        isAuctionPage,
        isMaxDropdownOpen,
        setIsMaxDropdownOpen,
        selectedMaxMarketCapInWeiBigInt,
        setSelectedMaxMarketCapInWeiBigInt,
        bidUsdValue,
        handleBalanceClick,
        nativeTokenWalletBalanceTruncated,
        bidQtyNonDisplay,
        setBidQtyNonDisplay,
        inputValue,
        setInputValue,
    };

    const {
        maxFdvDisplay,
        bidSizeDisplay,
        extraInfoDisplay,
        tickerDisplay,
        openedBidDisplay,
        yourBidDisplay,
    } = tickerDisplayElements(tickerDisplayElementsProps);

    const allocationOrReturnDisplay = (
        <div className={styles.allocationContainer}>
            <h3>{unclaimedTokenNum ? 'ALLOCATION' : 'RETURN'} </h3>
            <div className={styles.allocationDisplay}>
                {unclaimedTokenNum
                    ? formattedUnclaimedTokenAllocationForConnectedUser
                    : formattedQtyUnreturnedToUser}
            </div>
            {extraInfoDisplay}
        </div>
    );

    const QTY_INPUT_ID = 'exchangeBalance_qty';
    const bidQtyInputField = document.getElementById(
        QTY_INPUT_ID,
    ) as HTMLInputElement;

    useEffect(() => {
        /* auto-focus the bid qty input field on first load
                                   and when the max market cap value changes,
                                   but only when the input field is empty */
        // could be improved by first checking if the field is visible, rather than auto scrolling
        if (bidQtyInputField && !inputValue) bidQtyInputField.focus();
    }, [bidQtyInputField, selectedMaxMarketCapInWeiBigInt, inputValue]);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.flexColumn}>
                    {!isAuctionPage && <BreadCrumb />}
                    {tickerDisplay}
                    {showComments && <Comments />}
                </div>

                {!showComments && (
                    <>
                        {!isAuctionCompleted && openedBidDisplay}
                        {!isAuctionCompleted && yourBidDisplay}
                        <div className={styles.flexColumn}>
                            {!isAuctionCompleted && maxFdvDisplay}
                            {!isAuctionCompleted && bidSizeDisplay}
                            {isUserConnected &&
                                isAuctionCompleted &&
                                !showTradeButton &&
                                allocationOrReturnDisplay}
                            {!isAuctionCompleted && extraInfoDisplay}
                        </div>
                    </>
                )}
            </div>
            {!showComments && bidButton}
        </div>
    );
}