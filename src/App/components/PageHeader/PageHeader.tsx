/** ***** START: Import React and Dongles *******/
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useMoralis } from 'react-moralis';
/** ***** END: Import React and Dongles *********/

/** ***** START: Import Local Files *******/
import styles from './PageHeader.module.css';
import { useRive, useStateMachineInput } from 'rive-react';
/** ***** END: Import Local Files *********/

export default function PageHeader() {
    const { enableWeb3, isWeb3Enabled, authenticate, isAuthenticated, logout } = useMoralis();

    // function to authenticate wallet with Moralis server
    const clickLogin = async () => {
        if (!isAuthenticated || !isWeb3Enabled) {
            await authenticate({
                provider: 'metamask',
                signingMessage: 'Ambient API Authentication.',
                onSuccess: () => {
                    enableWeb3();
                },
                onError: () => {
                    authenticate({
                        provider: 'metamask',
                        signingMessage: 'Ambient API Authentication.',
                    });
                },
            });
        }
    };

    // function to sever connection between user wallet and Moralis server
    const clickLogout = async () => await logout();

    // rive component
    const STATE_MACHINE_NAME = 'Basic State Machine';
    const INPUT_NAME = 'Switch';

    const { rive, RiveComponent } = useRive({
        src: './hamburger.riv',
        stateMachines: STATE_MACHINE_NAME,
        autoplay: true,
    });

    const onClickInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_NAME);

    // end of rive component

    // Page Header states
    const [mobileNavToggle, setMobileNavToggle] = useState<boolean>(false);

    // End of Page Header States

    // Page Header functions
    function handleMobileNavToggle() {
        setMobileNavToggle(!mobileNavToggle);
        onClickInput?.fire();
    }

    // End of Page Header Functions

    return (
        <header data-testid={'page-header'} className={styles.primary_header}>
            <div className={styles.header_gradient}> </div>
            <div className={styles.logo_container}>
                <img src='ambient_logo.svg' alt='ambient' />
                <h1>ambient</h1>
            </div>
            <div
                className={styles.mobile_nav_toggle}
                aria-controls='primary_navigation'
                aria-expanded={mobileNavToggle}
            >
                <RiveComponent onClick={handleMobileNavToggle} />
                <span className='sr-only'>Menu</span>
            </div>
            <nav
                className={styles.primary_navigation}
                id='primary_navigation'
                data-visible={mobileNavToggle}
            >
                <NavLink to='/'>Home</NavLink>
                <NavLink to='/trade'>Trade</NavLink>
                <NavLink to='/analytics'>Analytics</NavLink>
                <NavLink to='/portfolio'>Portfolio</NavLink>
            </nav>
            <div className={styles.account}>Account Info</div>
            <button onClick={clickLogin}>Log In</button>
            <button onClick={clickLogout}>Log Out</button>
        </header>
    );
}
