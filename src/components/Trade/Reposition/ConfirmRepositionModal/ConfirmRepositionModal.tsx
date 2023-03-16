import styles from './ConfirmRepositionModal.module.css';
import Button from '../../../Global/Button/Button';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { Dispatch, SetStateAction, useState } from 'react';
import { CrocEnv } from '@crocswap-libs/sdk';
import TransactionSubmitted from '../../../Global/TransactionSubmitted/TransactionSubmitted';
import { TokenPairIF } from '../../../../utils/interfaces/TokenPairIF';
import TransactionDenied from '../../../Global/TransactionDenied/TransactionDenied';
import TransactionException from '../../../Global/TransactionException/TransactionException';
import WaitingConfirmation from '../../../Global/WaitingConfirmation/WaitingConfirmation';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import SelectedRange from '../../Range/ConfirmRangeModal/SelectedRange/SelectedRange';
import ConfirmationModalControl from '../../../Global/ConfirmationModalControl/ConfirmationModalControl';

interface propsIF {
    onClose: () => void;
    crocEnv: CrocEnv | undefined;
    position: PositionIF;
    newRepositionTransactionHash: string;
    tokenPair: TokenPairIF;
    ambientApy: number | undefined;
    dailyVol: number | undefined;
    rangeWidthPercentage: number;
    currentPoolPriceTick: number;
    currentPoolPriceDisplay: string;
    onSend: () => void;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
    showConfirmation: boolean;
    setShowConfirmation: Dispatch<SetStateAction<boolean>>;
    resetConfirmation: () => void;
    txErrorCode: string;
    txErrorMessage: string;
    minPriceDisplay: string;
    maxPriceDisplay: string;
    currentBaseQtyDisplayTruncated: string;
    currentQuoteQtyDisplayTruncated: string;
    pinnedMinPriceDisplayTruncatedInBase: string;
    pinnedMinPriceDisplayTruncatedInQuote: string;
    pinnedMaxPriceDisplayTruncatedInBase: string;
    pinnedMaxPriceDisplayTruncatedInQuote: string;
    poolPriceDisplayNum: number;
    newBaseQtyDisplay: string;
    newQuoteQtyDisplay: string;
    isDenomBase: boolean;
    isTokenABase: boolean;
    isPositionInRange: boolean;
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
}

export default function ConfirmRepositionModal(props: propsIF) {
    const {
        tokenPair,
        poolPriceDisplayNum,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
        onSend,
        showConfirmation,
        setShowConfirmation,
        newRepositionTransactionHash,
        resetConfirmation,
        txErrorCode,
        minPriceDisplay,
        maxPriceDisplay,
        currentBaseQtyDisplayTruncated,
        currentQuoteQtyDisplayTruncated,
        newBaseQtyDisplay,
        newQuoteQtyDisplay,
        isDenomBase,
        isTokenABase,
        isPositionInRange,
        bypassConfirm,
        toggleBypassConfirm,
    } = props;

    const { dataTokenA, dataTokenB } = tokenPair;

    const transactionApproved = newRepositionTransactionHash !== '';

    const isTransactionDenied = txErrorCode === 'ACTION_REJECTED';
    const isTransactionException = txErrorCode === 'CALL_EXCEPTION';
    const isGasLimitException = txErrorCode === 'UNPREDICTABLE_GAS_LIMIT';
    const isInsufficientFundsException = txErrorCode === 'INSUFFICIENT_FUNDS';

    const transactionSubmitted = (
        <TransactionSubmitted
            hash={newRepositionTransactionHash}
            tokenBSymbol={dataTokenB.symbol}
            tokenBAddress={dataTokenB.address}
            tokenBDecimals={dataTokenB.decimals}
            tokenBImage={dataTokenB.logoURI}
        />
    );

    const confirmSendMessage = (
        <WaitingConfirmation content={'Repositioning'} />
    );

    const transactionDenied = (
        <TransactionDenied resetConfirmation={resetConfirmation} />
    );
    const transactionException = (
        <TransactionException resetConfirmation={resetConfirmation} />
    );

    const confirmationDisplay =
        isTransactionException ||
        isGasLimitException ||
        isInsufficientFundsException
            ? transactionException
            : isTransactionDenied
            ? transactionDenied
            : transactionApproved
            ? transactionSubmitted
            : confirmSendMessage;

    // ------------------------------------

    const tokenAmountDisplay = (
        <section className={styles.fee_tier_display}>
            <div className={styles.fee_tier_container}>
                <div className={styles.detail_line}>
                    <div>
                        {dataTokenA.logoURI ? (
                            <img
                                src={dataTokenA.logoURI}
                                alt={dataTokenA.name}
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={dataTokenA.symbol.charAt(0)}
                                width='20px'
                            />
                        )}
                        <span>Current {dataTokenA.symbol} Collateral</span>
                    </div>
                    <span>{currentBaseQtyDisplayTruncated}</span>
                </div>

                <div className={styles.detail_line}>
                    <div>
                        {dataTokenA.logoURI ? (
                            <img
                                src={dataTokenA.logoURI}
                                alt={dataTokenA.name}
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={dataTokenA.symbol.charAt(0)}
                                width='20px'
                            />
                        )}
                        <span> {dataTokenA.symbol} After Reposition</span>
                    </div>
                    <span>{newBaseQtyDisplay}</span>
                </div>
                <p className={styles.divider} />

                <div className={styles.detail_line}>
                    <div>
                        {dataTokenB.logoURI ? (
                            <img
                                src={dataTokenB.logoURI}
                                alt={dataTokenB.name}
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={dataTokenB.symbol.charAt(0)}
                                width='20px'
                            />
                        )}
                        <span>Current {dataTokenB.symbol} Collateral</span>
                    </div>
                    <span>{currentQuoteQtyDisplayTruncated}</span>
                </div>
                <div className={styles.detail_line}>
                    <div>
                        {dataTokenB.logoURI ? (
                            <img
                                src={dataTokenB.logoURI}
                                alt={dataTokenB.name}
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={dataTokenB.symbol.charAt(0)}
                                width='20px'
                            />
                        )}
                        <span>{dataTokenB.symbol} After Reposition</span>
                    </div>
                    <span>{newQuoteQtyDisplay}</span>
                </div>
            </div>
        </section>
    );

    const isAmbient = false;
    const selectedRangeOrNull = !isAmbient ? (
        <SelectedRange
            minPriceDisplay={minPriceDisplay}
            maxPriceDisplay={maxPriceDisplay}
            poolPriceDisplayNum={poolPriceDisplayNum}
            tokenPair={tokenPair}
            denominationsInBase={isDenomBase}
            isTokenABase={isTokenABase}
            isAmbient={isAmbient}
            pinnedMinPriceDisplayTruncatedInBase={
                pinnedMinPriceDisplayTruncatedInBase
            }
            pinnedMinPriceDisplayTruncatedInQuote={
                pinnedMinPriceDisplayTruncatedInQuote
            }
            pinnedMaxPriceDisplayTruncatedInBase={
                pinnedMaxPriceDisplayTruncatedInBase
            }
            pinnedMaxPriceDisplayTruncatedInQuote={
                pinnedMaxPriceDisplayTruncatedInQuote
            }
        />
    ) : null;

    const [currentSkipConfirm, setCurrentSkipConfirm] =
        useState<boolean>(bypassConfirm);

    const toggleFor = 'repo';

    const fullTxDetails2 = (
        <>
            <section className={styles.position_display}>
                <div className={styles.token_display}>
                    <div className={styles.tokens}>
                        {dataTokenA.logoURI ? (
                            <img
                                src={dataTokenA.logoURI}
                                alt={dataTokenA.name}
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={dataTokenA.symbol.charAt(0)}
                                width='30px'
                            />
                        )}
                        {dataTokenB.logoURI ? (
                            <img
                                src={dataTokenB.logoURI}
                                alt={dataTokenB.name}
                            />
                        ) : (
                            <NoTokenIcon
                                tokenInitial={dataTokenB.symbol.charAt(0)}
                                width='30px'
                            />
                        )}
                    </div>
                    <span className={styles.token_symbol}>
                        {dataTokenA.symbol}/{dataTokenB.symbol}
                    </span>
                </div>
                <RangeStatus
                    isInRange={true}
                    isEmpty={false}
                    isAmbient={false}
                />
            </section>
            {tokenAmountDisplay}
            {selectedRangeOrNull}
            <ConfirmationModalControl
                currentSkipConfirm={currentSkipConfirm}
                setCurrentSkipConfirm={setCurrentSkipConfirm}
                toggleFor={toggleFor}
            />
        </>
    );

    return (
        <div className={styles.confirm_range_modal_container}>
            <div>{showConfirmation ? fullTxDetails2 : confirmationDisplay}</div>
            <footer className={styles.modal_footer}>
                {showConfirmation && (
                    <Button
                        title={
                            isPositionInRange
                                ? 'Position Currently In Range'
                                : 'Send Reposition'
                        }
                        action={() => {
                            toggleBypassConfirm(toggleFor, currentSkipConfirm);
                            setShowConfirmation(false);
                            onSend();
                        }}
                        disabled={isPositionInRange}
                        flat
                    />
                )}
            </footer>
        </div>
    );
}
