import { CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { performSwap } from '../../../dataLayer/transactions/swap';
import { goerliETH, goerliUSDC } from '../../../constants';
import { isNetworkAccessDisabled } from '../../config';

describe('perform swap on Goerli', () => {
    let crocEnv: CrocEnv;
    let signer: ethers.Wallet;

    beforeAll(() => {
        const providerUrl =
            process.env.GOERLI_PROVIDER_URL ||
            'https://goerli.infura.io/v3/c2d502344b024adf84b313c663131ada';
        const walletPrivateKey =
            process.env.GOERLI_PRIVATE_KEY ||
            'f95fc54b0f7c16b5b81998b084c1d17e27b0252c6578cebcfdf02cd1ba50221a';

        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        signer = new ethers.Wallet(walletPrivateKey, provider);

        crocEnv = new CrocEnv(provider, signer);
    });

    if (isNetworkAccessDisabled()) {
        it.skip('skipping all swap tests -- network access disabled', () => {});
    } else {
        it('performs a swap transaction', async () => {
            const initialEthBalance = await signer.provider.getBalance(
                signer.address,
            );
            console.log(
                'Initial balance:',
                ethers.utils.formatEther(initialEthBalance),
            );

            const params = {
                crocEnv,
                qty: '1000',
                buyTokenAddress: goerliETH.address,
                sellTokenAddress: goerliUSDC.address,
                slippageTolerancePercentage: 1,
                isWithdrawFromDexChecked: false,
                isSaveAsDexSurplusChecked: false,
            };

            const tx = await performSwap(params);
            expect(tx).toBeDefined();
            expect(tx.hash).toBeDefined();

            const receipt = await tx.wait();
            expect(receipt.status).toEqual(1);

            const finalEthBalance = await signer.provider.getBalance(
                signer.address,
            );
            console.log(
                'Final balance:',
                ethers.utils.formatEther(finalEthBalance),
            );

            expect(finalEthBalance.gt(initialEthBalance)).toBe(true);
            // TODO: add another assertion for a minimum increase in balance i.e. 0.01 ETH
        }, 60_000);
    }
});
