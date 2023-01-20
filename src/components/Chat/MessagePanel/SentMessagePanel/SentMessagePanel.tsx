import styles from './SentMessagePanel.module.css';
import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { Message } from '../../Model/MessageModel';
import PositionBox from '../PositionBox/PositionBox';
import { useEffect, useState } from 'react';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../Global/SnackbarComponent/SnackbarComponent';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import Blockies from 'react-blockies';

interface SentMessageProps {
    message: Message;
    name: string;
    isCurrentUser: boolean;
    currentUser: string | undefined;
    userImageData: string[];
    resolvedAddress: string | undefined;
    connectedAccountActive: any;
}

export default function SentMessagePanel(props: SentMessageProps) {
    const [isPosition, setIsPosition] = useState(false);
    const [sliceWalletID, setSliceWalletID] = useState('');

    const { userImageData, resolvedAddress, connectedAccountActive } = props;

    function namerOrWalletID(content: string) {
        if (content.includes('0x')) {
            return content.slice(0, 6) + '...';
        } else {
            return content;
        }
    }
    useEffect(() => {
        setSliceWalletID(props.message.walletID.slice(0, 6) + '...');
    }, [props.message.mentionedName]);

    useEffect(() => {
        console.log('props name: ', props.name, 'current user', props.currentUser);
        console.log(props.message.mentionedName, props.name);
    }, []);

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

    const [value, copy] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {props.message.ensName} copied
        </SnackbarComponent>
    );
    function handleCopyAddress(item: string) {
        copy(item);
        setOpenSnackbar(true);
    }

    function mentionedMessage() {
        const messagesArray = props.message.message.split(' ');
        if (props.message.isMentionMessage === true) {
            return (
                <p className={styles.message}>
                    {messagesArray.map((word, index) => (
                        <span
                            key={index}
                            className={` ${
                                word === props.message.mentionedName
                                    ? styles.mention_message
                                    : styles.message
                            }`}
                        >
                            {'' + word}
                        </span>
                    ))}
                </p>
            );
        } else {
            return <p className={styles.message}>{props.message.message}</p>;
        }
    }

    const myBlockies = <Blockies seed={props.message.walletID} scale={3} bgColor={'#171D27'} />;

    return (
        <div
            className={
                props.message.isMentionMessage === false
                    ? styles.sent_message_body
                    : props.message.mentionedName.trim() === props.name.trim()
                    ? styles.sent_message_body_with_mention
                    : styles.sent_message_body
            }
        >
            <div className={styles.nft_container}>
                {userImageData[1] ? <img src={userImageData[1]} alt='nft' /> : null}
                {userImageData[2] ? <img src={userImageData[2]} alt='nft' /> : null}
                {userImageData[3] ? <img src={userImageData[3]} alt='nft' /> : null}
                {(resolvedAddress || connectedAccountActive) && myBlockies ? myBlockies : null}
            </div>
            <div className={styles.message_item}>
                <div
                    className={props.isCurrentUser ? styles.current_user_name : styles.name}
                    onClick={() => handleCopyAddress(props.message.ensName)}
                >
                    {props.name !== 'defaultValue' ? sliceWalletID : props.message.ensName}
                </div>
                <PositionBox
                    message={props.message.message}
                    isInput={false}
                    isPosition={isPosition}
                    setIsPosition={setIsPosition}
                />
                {!isPosition && mentionedMessage()}
            </div>
            <p className={styles.message_date}>{formatAMPM(props.message.createdAt)}</p>
            {snackbarContent}
        </div>
    );
}
