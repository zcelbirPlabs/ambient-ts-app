import { useRef } from 'react';
import styles from './Create.module.css';
import CreateField, { CreateFieldPropsIF } from './CreateField';
import { FaAngleLeft } from 'react-icons/fa6';

export default function Create() {
    const token = useRef({
        ticker: '',
        name: '',
        description: '',
        twitter: '',
        telegram: '',
        website: '',
    });

    function takeInput(k: keyof typeof token.current, payload: string) {
        token.current[k] = payload;
    }

    const inputs: CreateFieldPropsIF[] = [
        {
            inputId: 'ticker_input',
            label: 'Token Ticker',
            charLimit: 14,
            updateRef: (s: string) => takeInput('ticker', s),
            rows: 1,
        },
        {
            inputId: 'token_name_input',
            label: 'Token Name',
            charLimit: 30,
            updateRef: (s: string) => takeInput('name', s),
            rows: 1,
        },
        {
            inputId: 'description_input',
            label: 'Description',
            charLimit: 280,
            updateRef: (s: string) => takeInput('description', s),
            rows: 8,
        },
        {
            inputId: 'twitter_url_input',
            label: 'Twitter Link',
            updateRef: (s: string) => takeInput('twitter', s),
            rows: 1,
        },
        {
            inputId: 'telegram_url_input',
            label: 'Telegram Link',
            updateRef: (s: string) => takeInput('telegram', s),
            rows: 1,
        },
        {
            inputId: 'website_url_input',
            label: 'Website Link',
            updateRef: (s: string) => takeInput('website', s),
            rows: 1,
        },
    ];

    return (
        <section className={styles.create_token}>
            <div className={styles.style_wrapper}>
                <div className={styles.on_back}>
                    <FaAngleLeft size={60} />
                </div>
                <div className={styles.create_form}>
                    <div className={styles.form_left}>
                        <div className={styles.description}>
                            Some text here describing how launching a token
                            works and what things will happen.
                        </div>
                        <CreateField
                            inputId='token_image_input'
                            label='Token Image'
                            updateRef={() => null}
                            rows={6}
                            box
                        />
                    </div>
                    <div className={styles.form_right}>
                        {inputs.map((inp: CreateFieldPropsIF) => (
                            <CreateField key={JSON.stringify(inp)} {...inp} />
                        ))}
                        <button
                            className={styles.submit_btn}
                            onClick={() => console.log(token.current)}
                        >
                            Create Token
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
