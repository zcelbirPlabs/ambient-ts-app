import { useRef, useState } from 'react';
import { auctionDataIF } from './Auctions';

export type auctionSorts = 'recent' | 'ticker' | 'mCap' | 'timeLeft';
export interface sortByIF {
    method: auctionSorts;
    reverse: boolean;
}
export interface sortedAuctions {
    data: auctionDataIF[];
    update: (sortType: auctionSorts) => void;
}

export function useSortedAuctions(unsorted: auctionDataIF[]) {
    const [sorted, setSorted] = useState<auctionDataIF[]>(unsorted);

    const DEFAULT_SORT: auctionSorts = 'recent';
    const sortBy = useRef<auctionSorts>(DEFAULT_SORT);

    function sortByTicker(d: auctionDataIF[]): auctionDataIF[] {
        return d.sort((a: auctionDataIF, b: auctionDataIF) =>
            b.ticker.localeCompare(a.ticker),
        );
    }

    function updateSort(sortType: auctionSorts): void {
        let s: auctionDataIF[];

        if (sortBy.current === sortType) {
            s = unsorted;
        } else {
            switch (sortType) {
                case 'ticker':
                    s = sortByTicker(unsorted);
                    break;
                default:
                    s = unsorted;
                    break;
            }
        }

        setSorted(s);
    }

    return {
        data: sorted,
        update: updateSort,
    };
}
