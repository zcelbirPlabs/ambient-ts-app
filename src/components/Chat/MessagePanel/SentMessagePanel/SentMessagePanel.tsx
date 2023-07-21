import styles from './SentMessagePanel.module.css';
import { Message } from '../../Model/MessageModel';
import PositionBox from '../PositionBox/PositionBox';
import { Dispatch, SetStateAction, memo, useEffect, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { FiDelete } from 'react-icons/fi';
import useChatApi from '../../Service/ChatApi';
import { useLocation, useNavigate } from 'react-router-dom';
import { BiBlock } from 'react-icons/bi';
import { BsFillReplyFill } from 'react-icons/bs';
import ReplyMessage from '../ReplyMessage/ReplyMessage';
import { IoReturnUpForwardSharp } from 'react-icons/io5';

interface SentMessageProps {
    message: Message;
    ensName: string;
    isCurrentUser: boolean;
    currentUser: string | undefined;
    resolvedAddress: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connectedAccountActive: any;
    isUserLoggedIn: boolean;
    moderator: boolean;
    room: string;
    isMessageDeleted: boolean;
    setIsMessageDeleted: Dispatch<SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    previousMessage: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nextMessage: any;
    deleteMsgFromList: (id: string) => void;
    isLinkInCrocodileLabsLinks(word: string): boolean;
    formatURL(url: string): void;
    isLinkInCrocodileLabsLinksForInput(word: string): boolean;
    showPopUp: boolean;
    setShowPopUp: Dispatch<SetStateAction<boolean>>;
    popUpText: string;
    setPopUpText: Dispatch<SetStateAction<string>>;
    isReplyButtonPressed: boolean;
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    replyMessageContent: Message | undefined;
    setReplyMessageContent: Dispatch<SetStateAction<Message | undefined>>;
}

function SentMessagePanel(props: SentMessageProps) {
    const [hasSeparator, setHasSeparator] = useState(false);
    const [isPosition, setIsPosition] = useState(false);
    const [showAvatar, setShowAvatar] = useState<boolean>(true);
    const [showName, setShowName] = useState<boolean>(true);
    const [daySeparator, setdaySeparator] = useState('');
    const [ok, setOk] = useState(false);
    const [count, setCount] = useState(0);
    const [repliedMessageText, setRepliedMessageText] = useState<string>('');
    const [repliedMessageEnsName, setRepliedMessageEnsName] =
        useState<string>('');
    const [repliedMessageDate, setRepliedMessageDate] = useState<string>('');
    const [repliedMessageWalletID, setRepliedMessageWalletID] =
        useState<string>('');

    const { deleteMessage, getRepliedMessageInfo } = useChatApi();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const previousMessageDate = new Date(props.previousMessage?.createdAt);
        const currentMessageDate = new Date(props.message?.createdAt);
        const nextMessageDate = new Date(props.nextMessage?.createdAt);
        const currentPreviousDiffInMs = Math.abs(
            currentMessageDate.getTime() - previousMessageDate.getTime(),
        );
        const nextCurrentDiffInMs = Math.abs(
            nextMessageDate.getTime() - currentMessageDate.getTime(),
        );
        getDayAndName(
            props.previousMessage?.createdAt,
            props.message?.createdAt,
        );

        if (props.previousMessage?.sender === props.message?.sender) {
            if (currentPreviousDiffInMs < 1 * 60 * 1000) {
                setShowAvatar(false);
                setShowName(false);
                setOk(true);
                if (
                    nextCurrentDiffInMs < 1 * 60 * 1000 &&
                    props.nextMessage?.sender === props.message?.sender
                ) {
                    setHasSeparator(false);
                } else {
                    setHasSeparator(true);
                }
            } else {
                if (
                    nextCurrentDiffInMs < 1 * 60 * 1000 &&
                    props.message?.sender === props.nextMessage?.sender
                ) {
                    setShowAvatar(true);
                    setShowName(true);
                    setHasSeparator(false);
                } else {
                    setShowAvatar(true);
                    setShowName(true);
                    setHasSeparator(true);
                }
            }
        } else {
            setShowAvatar(true);
            setShowName(true);
            if (
                nextCurrentDiffInMs < 1 * 60 * 1000 &&
                props.nextMessage?.sender === props.message?.sender
            ) {
                setHasSeparator(false);
            } else {
                setHasSeparator(true);
            }
        }
    }, [props.message, props.nextMessage, props.previousMessage]);

    useEffect(() => {
        if (
            props.previousMessage &&
            props.message &&
            props.previousMessage.sender === props.message.sender
        ) {
            const previousMessageDate = new Date(
                props.previousMessage.createdAt,
            );
            const currentMessageDate = new Date(props.message.createdAt);
            const currentPreviousDiffInMs = Math.abs(
                currentMessageDate.getTime() - previousMessageDate.getTime(),
            );

            if (currentPreviousDiffInMs < 1 * 60 * 1000) {
                setCount((prevCount) => prevCount + 1);
            } else {
                setCount(0);
            }
        } else {
            setCount(0);
        }
    }, [props.previousMessage, props.message]);

    useEffect(() => {
        if ('repliedMessage' in props.message) {
            console.log(
                getReplyMessageInfo(props.message.repliedMessage as string),
            );
            getReplyMessageInfo(props.message.repliedMessage as string);
        }
    }, [props.message]);

    const formatAMPM = (str: string) => {
        const date = new Date(str);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const _min = minutes.toString().padStart(2, '0');
        const strTime = hours + ':' + _min + ' ' + ampm;
        return strTime;
    };

    function setReplyMessage() {
        props.setIsReplyButtonPressed(!props.isReplyButtonPressed);
        props.setReplyMessageContent(props.message);
    }

    const getDayAndName = (previousDay: string, currentDay: string) => {
        const today = new Date();
        const previousMessageDate = new Date(previousDay);
        const currentMessageDate = new Date(currentDay);
        const todayDayNumber = today.getUTCDate();
        const todayMonthNumber = today.toLocaleString('default', {
            month: 'long',
        });
        const previousDayNumber = previousMessageDate.getUTCDate();
        const currentDayNumber = currentMessageDate.getUTCDate();
        const currentDayMonthNumber = currentMessageDate.toLocaleString(
            'default',
            {
                month: 'long',
            },
        );
        if (
            todayDayNumber === currentDayNumber &&
            todayMonthNumber === currentDayMonthNumber &&
            previousDayNumber !== currentDayNumber
        ) {
            setdaySeparator('Today');
        } else {
            if (previousDayNumber !== currentDayNumber) {
                setdaySeparator(currentDayNumber + ' ' + currentDayMonthNumber);
            } else {
                setdaySeparator('');
            }
        }
    };

    function getName() {
        if (
            props.message.ensName === 'defaultValue' ||
            props.message.ensName === null ||
            props.message.ensName === 'null' ||
            props.message.ensName === undefined ||
            props.message.ensName === 'undefined'
        ) {
            return props.message.walletID.slice(0, 6) + '...';
        } else {
            return props.message.ensName;
        }
    }

    function handleOpenExplorer(url: string) {
        window.open(url);
    }

    function handleOpenExplorerAddHttp(url: string) {
        window.open(convertToFullUrl(url));
    }

    function convertToFullUrl(domain: string): string {
        const protocol = 'https://';
        return protocol + domain;
    }

    function returnDomain(word: string) {
        if (props.isLinkInCrocodileLabsLinks(word)) {
            const url = new URL(word);
            return url.hostname + url.pathname;
        } else {
            return word;
        }
    }

    function detectLinksFromMessage(url: string) {
        if (url.includes(' ')) {
            const words: string[] = url.split(' ');
            return (
                <>
                    {words.map((word, index) => (
                        <span
                            onClick={() =>
                                props.isLinkInCrocodileLabsLinks(word)
                                    ? handleOpenExplorer(word)
                                    : props.isLinkInCrocodileLabsLinksForInput(
                                          word,
                                      )
                                    ? handleOpenExplorerAddHttp(word)
                                    : ''
                            }
                            key={index}
                            style={
                                props.isLinkInCrocodileLabsLinks(word) ||
                                props.isLinkInCrocodileLabsLinksForInput(word)
                                    ? { color: '#ab7de7', cursor: 'pointer' }
                                    : { color: 'white', cursor: 'default' }
                            }
                        >
                            {' ' + returnDomain(word)}
                            {}
                        </span>
                    ))}
                </>
            );
        } else {
            if (
                props.isLinkInCrocodileLabsLinks(url) ||
                props.isLinkInCrocodileLabsLinksForInput(url)
            ) {
                return (
                    <p
                        style={{ color: '#ab7de7', cursor: 'pointer' }}
                        onClick={() =>
                            props.isLinkInCrocodileLabsLinks(url)
                                ? handleOpenExplorer(url)
                                : props.isLinkInCrocodileLabsLinksForInput(url)
                                ? handleOpenExplorerAddHttp(url)
                                : ''
                        }
                    >
                        {returnDomain(url)}
                    </p>
                );
            } else {
                return url;
            }
        }
    }

    function mentionedMessage() {
        const messagesArray = props.message.message.split(' ');
        if (showAvatar === true) {
            if (props.message.isMentionMessage === true) {
                return (
                    <div className={` ${styles.mention_message_block}`}>
                        {messagesArray.map((word, index) => (
                            <span
                                key={index}
                                className={` ${styles.mention_message}`}
                                style={{
                                    color:
                                        word.slice(1) === props.ensName ||
                                        word.slice(1) ===
                                            props.connectedAccountActive
                                            ? '#7371FC'
                                            : 'white',
                                }}
                            >
                                {' ' + detectLinksFromMessage(word)}
                            </span>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className={styles.message}>
                        {detectLinksFromMessage(props.message.message)}
                    </div>
                );
            }
        } else {
            if (props.message.isMentionMessage === true) {
                return (
                    <div
                        className={` ${styles.mention_message_block_without_avatar}`}
                    >
                        {messagesArray.map((word, index) => (
                            <span
                                key={index}
                                className={` ${styles.mention_message}`}
                                style={{
                                    color:
                                        word.slice(1) === props.ensName ||
                                        word.slice(1) ===
                                            props.connectedAccountActive
                                            ? '#7371FC'
                                            : 'white',
                                }}
                            >
                                {' ' + detectLinksFromMessage(word)}
                            </span>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className={styles.message_without_avatar}>
                        {detectLinksFromMessage(props.message.message)}
                    </div>
                );
            }
        }
    }

    function deleteMessages(id: string) {
        console.log('deleteMessage', id);
        // eslint-disable-next-line
        // props.setIsMessageDeleted(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        deleteMessage(id).then((result: any) => {
            if (result.status === 'OK') {
                props.setIsMessageDeleted(true);
                props.deleteMsgFromList(id);
                return result;
            } else {
                props.setIsMessageDeleted(false);
            }
        });
    }

    const jazziconsSeed = props.message.walletID.toLowerCase();

    const myJazzicon = (
        <Jazzicon diameter={25} seed={jsNumberForAddress(jazziconsSeed)} />
    );

    const repliedJazzicon =
        'repliedMessage' in props.message ? (
            <Jazzicon
                svgStyles={{ marginBottom: '8px' }}
                diameter={10}
                seed={jsNumberForAddress(repliedMessageWalletID.toLowerCase())}
            />
        ) : undefined;

    // function blockUser(userId: string) {

    // }
    function getReplyMessageInfo(_id: string) {
        getRepliedMessageInfo(_id).then((result: any) => {
            setRepliedMessageText(result[0].message);
            setRepliedMessageDate(formatAMPM(result[0].createdAt));
            setRepliedMessageEnsName(result[0].ensName);
            setRepliedMessageWalletID(result[0].walletID);
            console.log(repliedMessageWalletID);
        });
        return repliedMessageText;
    }

    return (
        <div className={styles.msg_bubble_container}>
            <div>
                {daySeparator === '' ? (
                    ''
                ) : daySeparator !== '' ? (
                    <p className={styles.separator}>{daySeparator}</p>
                ) : (
                    ''
                )}
                {'repliedMessage' in props.message && (
                    <IoReturnUpForwardSharp
                        style={{
                            position: 'absolute',
                            top: '-0.3rem',
                            left: '0.6rem',
                        }}
                    />
                )}

                {'repliedMessage' in props.message ? (
                    <div className={styles.replied_box}>
                        <ReplyMessage
                            message={repliedMessageText}
                            ensName={repliedMessageEnsName}
                            time={repliedMessageDate}
                            setIsReplyButtonPressed={
                                props.setIsReplyButtonPressed
                            }
                            isReplyButtonPressed={false}
                            myJazzicon={repliedJazzicon}
                            walletID={repliedMessageWalletID}
                        />
                    </div>
                ) : (
                    ''
                )}

                <div
                    className={
                        props.isUserLoggedIn
                            ? props.message.isMentionMessage === false
                                ? styles.sent_message_body
                                : props.message.mentionedName?.trim() ===
                                      props.ensName?.trim() ||
                                  props.message.mentionedName?.trim() ===
                                      props.connectedAccountActive?.trim()
                                ? styles.sent_message_body_with_mention
                                : styles.sent_message_body
                            : styles.sent_message_body
                    }
                >
                    {showAvatar && (
                        <div className={styles.avatar_jazzicons}>
                            {myJazzicon}
                        </div>
                    )}
                    {!showAvatar && (
                        <div style={{ display: 'none', marginLeft: '10px' }}>
                            <div className={styles.nft_container}>
                                {myJazzicon}
                            </div>
                        </div>
                    )}
                    <div className={styles.message_item}>
                        <div
                            className={
                                showName && props.isCurrentUser
                                    ? styles.current_user_name
                                    : showName && !props.isCurrentUser
                                    ? styles.name
                                    : !showName && !props.isCurrentUser
                                    ? ''
                                    : ''
                            }
                            onClick={() => {
                                if (
                                    location.pathname !==
                                    `/${
                                        props.message.ensName === 'defaultValue'
                                            ? props.message.walletID
                                            : props.message.ensName
                                    }`
                                ) {
                                    navigate(
                                        `/${
                                            props.isCurrentUser
                                                ? 'account'
                                                : props.message.ensName ===
                                                  'defaultValue'
                                                ? props.message.walletID
                                                : props.message.ensName
                                        }`,
                                    );
                                }
                            }}
                        >
                            {showName && getName()}

                            <div>
                                {' '}
                                {props.moderator && showName ? (
                                    <BiBlock size={13} color='red' />
                                ) : (
                                    ''
                                )}
                            </div>
                        </div>

                        <PositionBox
                            message={props.message.message}
                            isInput={false}
                            isPosition={isPosition}
                            setIsPosition={setIsPosition}
                            walletExplorer={getName()}
                            isCurrentUser={props.isCurrentUser}
                            showAvatar={showAvatar}
                        />
                        {!isPosition && mentionedMessage()}
                    </div>
                    {props.moderator ? (
                        <FiDelete
                            color='red'
                            onClick={() => deleteMessages(props.message._id)}
                            style={{ cursor: 'pointer' }}
                        />
                    ) : (
                        ''
                    )}
                    <div className={styles.reply_message}>
                        <p className={styles.message_date}>
                            {formatAMPM(props.message.createdAt)}
                        </p>
                        <BsFillReplyFill
                            size={10}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setReplyMessage()}
                        />
                    </div>

                    {/* {snackbarContent} */}
                </div>
                <div>
                    {hasSeparator ? <hr style={{ cursor: 'default' }} /> : ''}
                </div>
            </div>
        </div>
    );
}

export default memo(SentMessagePanel);
