import React, { createContext, useContext, useEffect, useState } from 'react';
// import { fetchAuctionsData } from '../ambient-utils/api';
import { CrocEnvContext } from './CrocEnvContext';
import {
    mockAccountData,
    mockAuctionData,
    mockAuctionStatus1,
    mockAuctionStatus2,
    mockAuctionStatus3,
    mockAuctionStatus4,
    mockAuctionStatus5,
} from '../pages/platformFuta/mockAuctionData';
import { UserDataContext } from './UserDataContext';

interface AuctionsContextIF {
    auctions: AuctionsDataIF;
    accountData: AccountDataIF;
    getAuctions(): void;
    getAuctionData(ticker: string): void;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    showComments: boolean;
    setShowComments: React.Dispatch<React.SetStateAction<boolean>>;
    tickerInput: string;
    setTickerInput: React.Dispatch<React.SetStateAction<string>>;
    auctionStatusData: AuctionStatusDataIF;
    selectedTicker: string | undefined;
    setSelectedTicker: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export interface AuctionDataIF {
    ticker: string;
    marketCap: number;
    createdAt: number;
    auctionLength: number;
    status?: null;
    currentUserBid?: number;
    unclaimedTokenAllocation?: number;
    unclaimedEthAllocation?: number;
}

export interface AuctionsDataIF {
    dataReceived: boolean;
    chainId: string;
    data: AuctionDataIF[];
}

export interface AccountDataIF {
    dataReceived: boolean;
    chainId: string;
    auctions: AuctionDataIF[];
}

export interface AuctionStatusDataServerIF {
    openBidMarketCap: number | undefined;
    openBidSize: number | undefined;
    openBidAmountFilled: number | undefined;
}

export interface AuctionStatusDataIF {
    dataReceived: boolean;
    chainId: string;
    openBidMarketCap: number | undefined;
    openBidSize: number | undefined;
    openBidAmountFilled: number | undefined;
}
// export interface AuctionsDataIF {
//     global: XpLeaderboardDataIF;
//     byWeek: XpLeaderboardDataIF;
//     byChain: XpLeaderboardDataIF;
//     getAuctions: (xpLeaderboardType: string) => void;
// }

export interface AuctionIF {
    status: string;
}

export const AuctionsContext = createContext<AuctionsContextIF>(
    {} as AuctionsContextIF,
);

export const AuctionsContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { userAddress } = useContext(UserDataContext);

    const [auctionsData, setAuctionsData] = React.useState<AuctionsDataIF>({
        dataReceived: false,
        chainId: chainId,
        data: [],
    });

    const [accountData, setAccountData] = React.useState<AccountDataIF>({
        dataReceived: false,
        chainId: chainId,
        auctions: [],
    });

    const [auctionStatusData, setAuctionStatusData] =
        React.useState<AuctionStatusDataIF>({
            dataReceived: false,
            chainId: chainId,
            openBidMarketCap: undefined,
            openBidSize: undefined,
            openBidAmountFilled: undefined,
        });

    const [isLoading, setIsLoading] = useState(true);
    const [tickerInput, setTickerInput] = useState('');
    const [showComments, setShowComments] = useState(false);

    const [selectedTicker, setSelectedTicker] = useState<string | undefined>();

    // const [auctionsGlobal, setAuctionsGlobal] =
    //     React.useState<XpLeaderboardDataIF>({
    //         dataReceived: false,
    //         data: undefined,
    //     });
    // const [auctionsByWeek, setAuctionsByWeek] =
    //     React.useState<XpLeaderboardDataIF>({
    //         dataReceived: false,
    //         data: undefined,
    //     });
    // const [auctionsByChain, setAuctionsByChain] =
    //     React.useState<XpLeaderboardDataIF>({
    //         dataReceived: false,
    //         data: undefined,
    //     });

    const fetchAuctionsData = async () => {
        return mockAuctionData;
    };

    const fetchAccountData = async () => {
        return mockAccountData;
    };

    const fetchAuctionStatusData = async (ticker: string) => {
        if (
            ticker.toLowerCase().includes('apu') ||
            ticker.toLowerCase().includes('degen')
        ) {
            return mockAuctionStatus1;
        } else if (
            ticker.toLowerCase().includes('usa') ||
            ticker.toLowerCase().includes('ben')
        ) {
            return mockAuctionStatus2;
        } else if (
            ticker.toLowerCase().includes('lockin') ||
            ticker.toLowerCase().includes('emily')
        ) {
            return mockAuctionStatus4;
        } else if (
            ticker.toLowerCase().includes('junior') ||
            ticker.toLowerCase().includes('trump')
        ) {
            return mockAuctionStatus5;
        } else {
            return mockAuctionStatus3;
        }
    };

    function getAuctionsData() {
        fetchAuctionsData().then((data) => {
            setAuctionsData({
                dataReceived: true,
                chainId: chainId,
                data: data,
            });
        });
    }

    function getAccountData() {
        fetchAccountData().then((data) => {
            setAccountData({
                dataReceived: true,
                chainId: chainId,
                auctions: data,
            });
        });
    }

    function getAuctionData(ticker: string) {
        fetchAuctionStatusData(ticker).then((data) => {
            setAuctionStatusData({
                dataReceived: true,
                chainId: chainId,
                openBidMarketCap: data.openBidMarketCap,
                openBidSize: data.openBidSize,
                openBidAmountFilled: data.openBidAmountFilled,
            });
        });
    }

    // useEffect to fetch auctions  data every 30 seconds
    useEffect(() => {
        getAuctionsData();
        const interval = setInterval(() => {
            getAuctionsData();
        }, 30000);
        return () => clearInterval(interval);
    }, [chainId]);

    // useEffect to fetch account data every 30 seconds
    useEffect(() => {
        getAccountData();
        const interval = setInterval(() => {
            getAccountData();
        }, 30000);
        return () => clearInterval(interval);
    }, [chainId, userAddress]);

    const auctionsContext: AuctionsContextIF = {
        auctionStatusData: auctionStatusData,
        auctions: auctionsData,
        accountData: accountData,
        getAuctions: getAuctionsData,
        getAuctionData: getAuctionData,
        isLoading: isLoading,
        setIsLoading: setIsLoading,
        tickerInput: tickerInput,
        setTickerInput: setTickerInput,
        showComments: showComments,
        setShowComments: setShowComments,
        selectedTicker: selectedTicker,
        setSelectedTicker: setSelectedTicker,
    };

    return (
        <AuctionsContext.Provider value={auctionsContext}>
            {props.children}
        </AuctionsContext.Provider>
    );
};
