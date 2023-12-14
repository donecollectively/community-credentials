import { TxInput, WalletHelper, helios } from "@donecollectively/stellar-contracts";
import { CCRegistryV05 } from "../../../contracts/v0.5/CCRegistry.js"

const { BlockfrostV0, Cip30Wallet, TxChain } = helios;
type hBlockfrost = typeof BlockfrostV0.prototype;
type hTxChain = typeof TxChain.prototype;
type hWallet = typeof Cip30Wallet.prototype;

export type credRegistryProps = {
    credsRegistry: CCRegistryV05;
    wallet? : hWallet;
    walletUtxos? : TxInput[],
    walletHelper? : WalletHelper
}