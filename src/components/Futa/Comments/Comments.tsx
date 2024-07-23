import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Comments.module.css';
import useCommentsWS from './useCommentsWS';
import CommentCard from './CommentCard/CommentCard';
import CommentInput from './CommentInput/CommentInput';
import { UserDataContext } from '../../../contexts/UserDataContext';
import useChatApi from '../../Chat/Service/ChatApi';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import DomDebugger from '../../Chat/DomDebugger/DomDebugger';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { domDebug } from '../../Chat/DomDebugger/DomDebuggerUtils';
import {
    checkVisibilityWithBottom,
    dropFromCssClasses,
} from '../../Chat/ChatUtils';

type ShimmerListProps = {
    count: number;
};

const ShimmerList: React.FC<ShimmerListProps> = ({ count }) => {
    return (
        <div className={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <div className={styles.shimmer} key={index}></div>
            ))}
        </div>
    );
};

function Comments() {
    const { ticker } = useParams();
    const room = ticker + ' / ETH';

    const messageListRef = useRef<HTMLDivElement | null>(null);

    const [page, setPage] = useState(0);
    const [fetchedAllPages, setFetchedAllPages] = useState(false);
    const [showPrevButton, setShowPrevButton] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [scrollBackTarget, setScrollBackTarget] = useState('');
    const [panelScrollTop, setPanelScrollTop] = useState(0);
    const [panelScrollToBottomDist, setPanelScrollToBottomDist] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    const fetchListener = () => {
        if (messageListRef && messageListRef.current) {
            messageListRef.current.scrollTo({
                top: messageListRef.current.scrollHeight,
                left: 0,
                behavior: 'instant' as ScrollBehavior,
            });
        }
    };
    const {
        messages,
        isLoading,
        sendMsg,
        isWsConnected,
        getMsgWithRestWithPagination,
    } = useCommentsWS(room ? room : '', fetchListener, '');
    const [userId, setUserId] = useState('');
    const { userAddress, ensName, isUserConnected } =
        useContext(UserDataContext);
    const { selectedNetwork } = useContext(CrocEnvContext);
    const { saveUser } = useChatApi();
    const [fetchedMessageCount, setFetchedMessageCount] = useState(0);

    const autoScrollTreshold = 100;

    const initialSave = async () => {
        if (userAddress && userAddress.length > 0) {
            const data = await saveUser(userAddress, ensName ? ensName : '');
            setUserId(data.userData._id);
        } else {
            setUserId('');
        }
    };
    useEffect(() => {
        initialSave();
    }, []);

    useEffect(() => {
        // handle auto scroll to bottom
        if (messageListRef && messageListRef.current) {
            const diff = assignPanelScrollDistances();
            if (diff < autoScrollTreshold) {
                scrollToBottom();
            }
        }
        setTimeout(() => {
            handleUnreadMessages();
        }, 500);
    }, [messages]);

    useEffect(() => {
        initialSave();
    }, [userAddress]);

    useEffect(() => {
        setShowPrevButton(false);
        setPage(0);
        setFetchedAllPages(false);
        setFetchedMessageCount(0);
        setUnreadMessageCount(0);
    }, [room]);

    useEffect(() => {
        domDebug('fetchedMsgCount', fetchedMessageCount);
    }, [fetchedMessageCount]);

    useEffect(() => {
        assignScrollButtonVisibility();
    }, [panelScrollToBottomDist, panelScrollTop]);

    const assignScrollButtonVisibility = () => {
        setShowScrollToBottom(panelScrollToBottomDist > 50);
        setShowPrevButton(panelScrollTop < 20 && panelScrollToBottomDist > 50);
    };

    const calculateScrollTarget = (messageId: string) => {
        if (
            messageListRef &&
            messageListRef.current &&
            messageId &&
            messageId.length > 0
        ) {
            const msgEl = document.querySelector(
                '.commentBubble[data-message-id="' + messageId + '"]',
            );
            if (msgEl) {
                const msgElOffsetTop = (msgEl as HTMLElement).offsetTop;
                const target = msgElOffsetTop;

                return target;
            }
            return messageListRef.current.scrollHeight;
        }
        return 0;
    };

    const scrollToMessage = (messageId: string, instant: boolean) => {
        const scrollTopPadding = -100;
        const msgEl = document.querySelector(
            '.commentBubble[data-message-id="' + messageId + '"]',
        );
        if (msgEl && messageListRef.current) {
            // messageListWrapper.current.scrollTop = messageListWrapper.current.scrollHeight - msgElOffsetTop + msgElHeight - messageListWrapper.current.getBoundingClientRect().height;
            setTimeout(() => {
                const target = calculateScrollTarget(messageId);
                if (messageListRef && messageListRef.current) {
                    if (instant) {
                        messageListRef.current.scrollTo({
                            top: target + scrollTopPadding,
                            left: 0,
                            behavior: 'instant' as ScrollBehavior,
                        });
                    } else {
                        messageListRef.current.scrollTop =
                            target + scrollTopPadding;
                    }
                }
            }, 100);
        }
    };

    const assignLastSeenMessage = () => {
        if (messageListRef && messageListRef.current) {
            const rect = messageListRef.current.getBoundingClientRect();
            const bubbles = document.querySelectorAll('.commentBubble');
            for (let i = 0; i < bubbles.length; i++) {
                const el = bubbles[i];
                if (el.getBoundingClientRect().top > rect.top) {
                    const msgId = el.getAttribute('data-message-id');
                    setScrollBackTarget(msgId ? msgId : '');
                    break;
                }
            }
        }
    };

    const assignPanelScrollDistances = () => {
        if (messageListRef && messageListRef.current) {
            const scrollTop = messageListRef.current.scrollTop;
            const scrollHeight = messageListRef.current.scrollHeight;
            const clientHeight = messageListRef.current.clientHeight;
            const scrollToBottomDist = scrollHeight - scrollTop - clientHeight;
            setPanelScrollToBottomDist(scrollToBottomDist);
            setPanelScrollTop(scrollTop);
        }

        return panelScrollToBottomDist;
    };

    const scrollToBottom = () => {
        if (messageListRef && messageListRef.current) {
            messageListRef.current.scrollTop =
                messageListRef.current.scrollHeight;
        }
    };

    const commentInputDispatch = (msg: string) => {
        if (room && userAddress && msg.length > 0) {
            sendMsg(
                userId,
                msg,
                room,
                ensName ? ensName : '',
                userAddress,
                null,
                null,
                selectedNetwork.chainId,
            );
            setTimeout(() => {
                scrollToBottom();
            }, 200);
        }
    };

    const fetchPrevious = async () => {
        setFetchedMessageCount(messages.length);
        const data = await getMsgWithRestWithPagination(room, page + 1);
        setPage(page + 1);
        if (data.length == 0) {
            setShowPrevButton(false);
            setFetchedAllPages(true);
        }
        scrollToMessage(scrollBackTarget, true);
        setScrollBackTarget('');
    };

    const handleUnreadMessages = () => {
        setTimeout(() => {
            document.querySelectorAll('.unreadComment').forEach((el) => {
                if (
                    checkVisibilityWithBottom(
                        el as HTMLElement,
                        messageListRef.current,
                    )
                ) {
                    setTimeout(() => {
                        dropFromCssClasses(el as HTMLElement, 'unread');
                        setUnreadMessageCount(
                            document.querySelectorAll('.unreadComment').length,
                        );
                    }, 1000);
                }
            });

            setTimeout(() => {
                setUnreadMessageCount(
                    document.querySelectorAll('.unreadComment').length,
                );
            }, 500);
        }, 1000);
    };

    const goToUnreadMessages = () => {
        const unreadComments = document.querySelectorAll('.unreadComment');
        if (unreadComments.length > 0) {
            const firstUnread = unreadComments[0];
            scrollToMessage(
                (firstUnread as HTMLElement).getAttribute(
                    'data-message-id',
                ) as string,
                false,
            );
        }

        handleUnreadMessages();
    };

    const _handleScroll = () => {
        assignPanelScrollDistances();
        assignLastSeenMessage();
        handleUnreadMessages();
    };

    return (
        <>
            <div className={styles.comments_outer}>
                {userAddress && userAddress.length > 0 && (
                    <div className={styles.connection_status}>
                        {isWsConnected ? (
                            <>
                                <div className={styles.connection_dot}></div>
                                <div
                                    className={styles.connection_dot_anim}
                                ></div>
                            </>
                        ) : (
                            <>
                                <div className={styles.loading_dots_wrapper}>
                                    <div className={styles.loading_dot}></div>
                                    <div className={styles.loading_dot}></div>
                                    <div className={styles.loading_dot}></div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className={styles.mainContainer}>
                    {isLoading ? (
                        <ShimmerList count={25} />
                    ) : (
                        <>
                            <div
                                ref={messageListRef}
                                className={`${styles.commentsWrapper} ${messages.length == 0 ? styles.no_comments_wrapper : ''} `}
                                onScroll={_handleScroll}
                            >
                                {messages.length == 0 ? (
                                    <span className={styles.no_comment_section}>
                                        {isUserConnected
                                            ? `Start the ${ticker} comment thread below`
                                            : `Connect your wallet to comment on ${ticker}`}
                                    </span>
                                ) : (
                                    <>
                                        <div
                                            className={styles.comments_content}
                                        >
                                            {fetchedAllPages && (
                                                <div
                                                    className={
                                                        styles.all_fetched
                                                    }
                                                >
                                                    {' '}
                                                    All comments fetched.
                                                </div>
                                            )}
                                            {messages.map((msg, index) => {
                                                return (
                                                    <CommentCard
                                                        key={msg._id}
                                                        style={{
                                                            animationDelay: `${(messages.length - index - fetchedMessageCount) * 0.015}s`,
                                                        }}
                                                        message={msg}
                                                        previousMessage={
                                                            index > 0
                                                                ? messages[
                                                                      index - 1
                                                                  ]
                                                                : undefined
                                                        }
                                                        currentUserID={userId}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>

                            {showPrevButton && !fetchedAllPages && (
                                <IoIosArrowUp
                                    title='Get Previous Messages'
                                    className={`${styles.floating_scroll_btn} ${styles.show_previous_comments_btn}`}
                                    onClick={fetchPrevious}
                                />
                            )}

                            {showScrollToBottom && (
                                <IoIosArrowDown
                                    title='Scroll to Bottom'
                                    className={`${styles.floating_scroll_btn} ${styles.scroll_to_bottom_btn}`}
                                    onClick={scrollToBottom}
                                />
                            )}

                            {unreadMessageCount > 0 &&
                                panelScrollToBottomDist > 50 && (
                                    <div
                                        className={styles.unread_messages_info}
                                        onClick={goToUnreadMessages}
                                    >
                                        {' '}
                                        {unreadMessageCount} new message
                                        {unreadMessageCount > 1 ? 's' : ''}
                                    </div>
                                )}

                            {/* <div className={styles.debug_btn} onClick={() => {scrollToMessage('669112bc1ce48e351edddd2d')}}></div> */}

                            {/* </div> */}
                            <CommentInput
                                commentInputDispatch={commentInputDispatch}
                                currentUserID={userId}
                            />
                        </>
                    )}
                    <DomDebugger />
                </div>
            </div>
        </>
    );
}

export default memo(Comments);