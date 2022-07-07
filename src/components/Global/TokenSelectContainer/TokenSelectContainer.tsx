import { Dispatch, SetStateAction } from 'react';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB, setDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import styles from './TokenSelectContainer.module.css';
import TokenSelect from '../TokenSelect/TokenSelect';
import TokenSelectSearchable from '../TokenSelect/TokenSelectSearchable';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import TokenList from '../../Global/TokenList/TokenList';
import { useSearch } from './useSearch';
import { importToken } from './importToken';
// import { removeToken } from './removeToken';

interface TokenSelectContainerPropsIF {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    tokenList?: Array<TokenIF>;
    chainId: string;
    tokenToUpdate: string;
    closeModal: () => void;
    reverseTokens: () => void;
    showManageTokenListContent: boolean;
    setShowManageTokenListContent: Dispatch<SetStateAction<boolean>>;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

export default function TokenSelectContainer(props: TokenSelectContainerPropsIF) {
    const {
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        tokenToUpdate,
        closeModal,
        reverseTokens,
        showManageTokenListContent,
        // setShowManageTokenListContent,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    const dispatch = useAppDispatch();

    const [matchingImportedTokens, matchingSearchableTokens, setSearchInput] = useSearch(
        tokensBank,
        searchableTokens,
        chainId,
    );

    // const handleClickSearchable = (tkn: TokenIF) => {
    //     // look inside tokensBank to see if clicked token is already imported
    //     const importedTokenAddresses = tokensBank.map((token: TokenIF) => token.address);
    //     const newImportedTokensArray = importedTokenAddresses.includes(tkn.address)
    //         ? // TRUE: make new array with it removed
    //           tokensBank.filter((token: TokenIF) => token.address !== tkn.address)
    //         : // FALSE: make new array with it added
    //           [tkn, ...tokensBank];
    //     setImportedTokens(newImportedTokensArray);
    //     // sync local storage and local state inside App.tsx with new array
    //     const userData = JSON.parse(localStorage.getItem('user') as string);
    //     userData.tokens = newImportedTokensArray;
    //     // console.log('before', JSON.parse(localStorage.getItem('user') as string));
    //     localStorage.setItem('user', JSON.stringify(userData));
    //     // console.log('after', JSON.parse(localStorage.getItem('user') as string));

    const importedTokensAddresses = tokensBank.map((token: TokenIF) => token.address);

    const chooseToken = (tok: TokenIF) => {
        if (tokenToUpdate === 'A') {
            if (tokenPair.dataTokenB.address === tok.address) {
                reverseTokens();
                dispatch(setTokenA(tok));
                dispatch(setTokenB(tokenPair.dataTokenA));
            } else {
                dispatch(setTokenA(tok));
                dispatch(setDidUserFlipDenom(false));
            }
        } else if (tokenToUpdate === 'B') {
            if (tokenPair.dataTokenA.address === tok.address) {
                reverseTokens();
                dispatch(setTokenB(tok));
                dispatch(setTokenA(tokenPair.dataTokenB));
            } else {
                dispatch(setTokenB(tok));
                dispatch(setDidUserFlipDenom(false));
            }
        } else {
            console.warn(
                'Error in TokenSelectContainer.tsx, failed to find proper dispatch function.',
            );
        }
        closeModal();
    };

    const tokenListContent = (
        <>
            <div className={styles.title}>Your Tokens</div>
            <div className={styles.tokens_container}>
                {matchingImportedTokens.map((token: TokenIF, idx: number) => (
                    <>
                        <TokenSelect
                            key={idx}
                            token={token}
                            chooseToken={chooseToken}
                            tokensBank={tokensBank}
                            chainId={chainId}
                            setImportedTokens={setImportedTokens}
                        />
                        {/* <button
                            key={idx + 'remove'}
                            onClick={() =>
                                removeToken(token, tokensBank, chainId, setImportedTokens)
                            }
                        >
                            Remove {token.name}
                        </button> */}
                    </>
                ))}
            </div>
            {matchingSearchableTokens.length ? <h3>Searched Tokens</h3> : null}
            {matchingSearchableTokens
                .filter((token: TokenIF) => !importedTokensAddresses.includes(token.address))
                .map((tkn: TokenIF, idx: number) => (
                    <TokenSelectSearchable
                        key={`tss_${idx}`}
                        token={tkn}
                        clickHandler={() =>
                            importToken(tkn, tokensBank, setImportedTokens, () => chooseToken(tkn))
                        }
                    />
                ))}
        </>
    );

    const tokenListContainer = (
        <>
            <div className={styles.search_input}>
                <input
                    type='text'
                    placeholder='Search name or paste address'
                    onChange={(event) => setSearchInput(event.target.value)}
                />
            </div>
            {tokenListContent}
        </>
    );

    return (
        <div className={styles.token_select_container}>
            {showManageTokenListContent ? (
                <TokenList
                    activeTokenListsChanged={activeTokenListsChanged}
                    indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
                />
            ) : (
                tokenListContainer
            )}
        </div>
    );
}
