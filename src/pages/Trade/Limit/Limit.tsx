// START: Import React and Dongles
import { useMoralis } from 'react-moralis';
import { motion } from 'framer-motion';
import { useState } from 'react';

// START: Import React Functional Components
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import LimitButton from '../../../components/Trade/Limit/LimitButton/LimitButton';
import LimitCurrencyConverter from '../../../components/Trade/Limit/LimitCurrencyConverter/LimitCurrencyConverter';
import DenominationSwitch from '../../../components/Swap/DenominationSwitch/DenominationSwitch';
import LimitExtraInfo from '../../../components/Trade/Limit/LimitExtraInfo/LimitExtraInfo';
import LimitHeader from '../../../components/Trade/Limit/LimitHeader/LimitHeader';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';
import Modal from '../../../components/Global/Modal/Modal';
import ConfirmLimitModal from '../../../components/Trade/Limit/ConfirmLimitModal/ConfirmLimitModal';
import { JsonRpcProvider } from '@ethersproject/providers';

import truncateDecimals from '../../../utils/data/truncateDecimals';

// START: Import Local Files
// import { useTradeData } from '../Trade';
import { useModal } from '../../../components/Global/Modal/useModal';
import { TokenIF } from '../../../utils/interfaces/exports';

interface LimitPropsIF {
    importedTokens: Array<TokenIF>;
    provider: JsonRpcProvider;
    isOnTradeRoute?: boolean;
    gasPriceinGwei: string;
    nativeBalance: string;
    lastBlockNumber: number;
    tokenABalance: string;
    tokenBBalance: string;
    isSellTokenBase: boolean;
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    poolPriceDisplay: number;
}

export default function Limit(props: LimitPropsIF) {
    const {
        importedTokens,
        isSellTokenBase,
        tokenABalance,
        tokenBBalance,
        tokenPair,
        gasPriceinGwei,
        poolPriceDisplay,
    } = props;
    // const { tradeData } = useTradeData();
    const { chainId } = useMoralis();
    const [isModalOpen, openModal, closeModal] = useModal();
    const [limitAllowed, setLimitAllowed] = useState<boolean>(false);

    const confirmLimitModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Limit Confirmation'>
            <ConfirmLimitModal onClose={closeModal} tokenPair={tokenPair} />
        </Modal>
    ) : null;

    return (
        <motion.section
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.6 } }}
            data-testid={'limit'}
        >
            <ContentContainer isOnTradeRoute>
                <LimitHeader tokenPair={tokenPair} />
                <DenominationSwitch tokenPair={tokenPair} />
                <DividerDark />
                <LimitCurrencyConverter
                    tokenPair={tokenPair}
                    poolPriceDisplay={poolPriceDisplay}
                    isSellTokenBase={isSellTokenBase}
                    tokensBank={importedTokens}
                    chainId={chainId ?? '0x2a'}
                    setLimitAllowed={setLimitAllowed}
                    tokenABalance={truncateDecimals(parseFloat(tokenABalance), 4).toString()}
                    tokenBBalance={truncateDecimals(parseFloat(tokenBBalance), 4).toString()}
                />
                <LimitExtraInfo tokenPair={tokenPair} gasPriceinGwei={gasPriceinGwei} />
                <LimitButton onClickFn={openModal} limitAllowed={limitAllowed} />
            </ContentContainer>
            {confirmLimitModalOrNull}
        </motion.section>
    );
}
