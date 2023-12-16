"use client";

const defaultNetwork = "mainnet";

const preprodConfig = {
    mph: {
        bytes: "56e28114e549bdb5fd437beab6124ac7009c591bbe5acbda914ecd08",
    },
    rev: "1",
    seedTxn: {
        bytes: "389f7fda149b55f850a5c26ab0f1094c9aa8d4c0b722bae7a72444651e71e44f",
    },
    seedIndex: "3",
    rootCapoScriptHash: {
        bytes: "7cbc68d3ea45b21cfb357c69d63810b7e80f400e2e8d56d3c1e99b51",
    },
};

const mainnetConfig = {
    mph: {
        bytes: "2c832cb58aca2126e2e2064a60d7c55625094d5b788670fa816cdddf",
    },
    rev: "1",
    seedTxn: {
        bytes: "6a38bf0ea70dbdf6c8a21012d3d59db7886969c76f3b3196bc95dbf57d4ab28e",
    },
    seedIndex: "3",
    rootCapoScriptHash: {
        bytes: "0f6244e28379ceebac20caa0d91b0c577236939dc7f3b932dffbdfa0",
    },
};

const preprodConfigPrev = {
    network: "preprod",
    mph: {
        bytes: "b1a0634ae5601f1922724edd9b29a097dd9b7ffa0b481dfaac4aaec6",
    },
    rev: "1",
    seedTxn: {
        bytes: "8aa1c2ad2cb24794640f80903c61e2f06a172634e472adec5dd00fadc2fa1eb0",
    },
    seedIndex: "1",
    rootCapoScriptHash: {
        bytes: "aeda5453e72ca3aa62b1aed0add11f51f1c81562f78d07d78d51938f",
    },
    scriptContent: {
        capo: {
            bytes: "tbd",
        },
        minter: {
            bytes: "tbd",
        },
        mintDelegate: {
            bytes: "tbd",
        },
    },
};

const mainnetConfigPrev = {
    network: "mainnet",
    mph: {
        bytes: "490b752ffdfdcbab4502a6e2ab219257fd17151c2e448e658b34b989",
    },
    rev: "1",
    seedTxn: {
        bytes: "411b895edb1847f297cb43922a9b08bd415f01696bc9d48942d59835e99507d7",
    },
    seedIndex: "0",
    rootCapoScriptHash: {
        bytes: "08ec3975a0755b653c4709aa65b7bc77b236c6c41b9e9a54cd044877",
    },
};

import { NextPageContext } from "next";
import { NextRouter, withRouter } from "next/router.js";
import head from "next/head.js";
const Head = head.default;
import link from "next/link.js";
const Link = link.default;

import { useRouter } from "next/router.js";
import React, {
    ChangeEventHandler,
    MouseEventHandler,
    use,
    useEffect,
    useState,
} from "react";
import { Prose } from "@/components/Prose.jsx";
import { useLiveQuery } from "dexie-react-hooks";
import {
    Address,
    ConfigFor,
    StellarConstructorArgs,
    StellarTxnContext,
    TxInput,
    WalletHelper,
    dumpAny,
    helios,
} from "@donecollectively/stellar-contracts";
import {
    CCRegistryV06,
    RegisteredCredentialForUpdate,
    RegisteredCredentialOnchain,
} from "../../contracts/current/CCRegistry.js";
import { CredForm } from "../../components/certifications/current/CredForm.jsx";
import { CredsList } from "../../components/certifications/current/CredsList.jsx";
import { CredView } from "../../components/certifications/current/CredView.jsx";
import { Button } from "../../components/Button.js";
import { ClientSideOnly } from "../../components/ClientSideOnly.js";
import { inPortal } from "../../inPortal.js";
import { Progress } from "../../components/Progress.js";
import { Switch } from "../../components/Switch.jsx";

// Helios types
const { BlockfrostV0, Cip30Wallet, TxChain } = helios;
type hBlockfrost = typeof BlockfrostV0.prototype;
type hTxChain = typeof TxChain.prototype;
type hWallet = typeof Cip30Wallet.prototype;

type paramsType = {
    router: NextRouter;
};
type NetParams = Awaited<ReturnType<hBlockfrost["getParameters"]>>;

export type PageStatus = {
    status?: string;
    error?: true;
    progressBar?: true | string;
};

type NetworkName = "preprod" | "mainnet";

type stateType = PageStatus & {
    credsRegistry?: CCRegistryV06;
    networkParams?: NetParams;
    selectedWallet?: string;
    wallet?: hWallet;
    walletHelper?: WalletHelper;
    walletUtxos?: TxInput[];
    networkName?: NetworkName;
    connectingWallet?: boolean;
    showDetail?: string;
    tcx?: StellarTxnContext<any>;

    allCreds?: RegisteredCredentialForUpdate[];
    credsIndex?: { [k: string]: RegisteredCredentialForUpdate };

    nextAction?: keyof typeof actionLabels;
    moreInstructions?: string;
    actionLabel?: string;
};

const actionLabels = {
    initializeRegistry: "Create Registry",
    retryRegistry: "Retry",
};

const networkNames = {
    0: "preprod",
    1: "mainnet",
};

let mountCount = 0;
// TODO:
//   _x_   1.  change Stellar {signers} to be a list of addresses, not Wallets
//   _x_   2.  avoid using Wallet's selected collateral utxo implicitly during findUtxo
//   _x_   3.  finish contract init
//   _x_   4.  show init results for deployment
//   _x_   5. create form
//   _x_   6.  do first registration
//   _x_   7.  do second registration
//   _x_   8.  update a registration
//   _x_   9.  implement registration timeout
//   _x_ 10. implement validations on listings

//   _x_   ?.  add actor collateral to TCX, on-demand and/or during addScript (when??)

const bfKeys = {
    mainnet: "mainnetvtlJdtsOo7nNwf58Az9F5HRDGCIkxujZ",
    preprod: "preprodCwAM4ABR6SowGsmURORvDJvQTyWmCHJP",
};

export class CertsPage extends React.Component<paramsType, stateType> {
    bf: hBlockfrost;
    bfFast: hTxChain;
    static notProse = true;
    i: number;
    mountedAt = Date.now();
    constructor(props) {
        super(props);
        this.i = mountCount += 1;
        this.updateState = this.updateState.bind(this);
        this.createCredential = this.createCredential.bind(this);
        this.fetchRegistryEntries = this.fetchRegistryEntries.bind(this);
        this.closeForm = this.closeForm.bind(this);
        this.connectWallet = this.connectWallet.bind(this);
        this.state = { status: "connecting to blockfrost" };

        // this.bf = new BlockfrostV0(
        //     "preprod",
        //     "preprodCwAM4ABR6SowGsmURORvDJvQTyWmCHJP"
        // );

        this.setupBlockfrost();
    }

    get router() {
        return this.props.router;
    }

    setupBlockfrost(forceNetworkName?: NetworkName) {
        const { networkName: cnn = defaultNetwork } = this.state || {};
        const nn = forceNetworkName || cnn;

        this.bf = new BlockfrostV0(nn, bfKeys[nn]);
        this.bfFast = new TxChain(this.bf);
    }

    async createCredential() {
        const { wallet } = this.state;
        if (!wallet) {
            await this.connectWallet(false);
        }

        await this.updateState("", {}, "//triggering creation screen");
        this.router.push(`/certifications/create`, "", { shallow: true });
        // window.history.pushState("", "", "/certifications/create")
    }

    editCredential(id: string) {
        throw new Error(`unused`);
        this.updateState("", {}, "//edit credential via router");
        // this.router.push(`/certifications/${id}/edit`);
    }

    closeForm() {
        this.updateState(undefined, {}, "//closing form");
        this.router.back();
    }

    saved(isNew: boolean) {
        this.updateState(
            `Submitted ${isNew ? "new" : "updated"} listing to ${
                this.bf.networkName
            } network`,
            {},
            "//saved!  : )"
        );
    }

    refreshCreds() {
        throw new Error(`TODO`);
    }

    get currentRoute(): [
        "list" | "view" | "create" | "edit",
        string | undefined
    ] {
        const { router } = this.props;
        const [arg1, arg2] = router.query.args || [];

        if ("create" == arg1) {
            return ["create", undefined];
        }
        if ("edit" == arg2) {
            const id = arg1;
            return ["edit", id];
        }
        if (arg1) {
            return ["view", arg1];
        }
        return ["list", undefined];
    }

    render() {
        let {
            tcx,
            credsRegistry,
            allCreds,
            wallet,
            progressBar,
            walletUtxos,
            walletHelper,
            status,
            showDetail,
            error,
            nextAction,
            actionLabel: actionMessage,
            moreInstructions,
        } = this.state;

        // console.warn(`-------------------------- RENDER ---------------------------\n ---> ${status}`);
        const { router } = this.props;
        const [arg1, arg2] = router.query.args || [];
        const [route, id] = this.currentRoute;

        let results;
        if (error) {
            results = <div>Fix the problem before continuing.</div>;
        }

        const loading = <Progress key={status}>loading</Progress>;
        const walletInfo = inPortal("topRight", this.renderWalletInfo());
        const showProgressBar = !!progressBar;

        const doNextAction = !!nextAction && (
            <button
                className="btn border rounded float-right"
                style={{
                    float: "right",
                    padding: "0.75em",
                    marginLeft: "0.5em",
                    // marginTop: '-0.75em',
                    border: "1px solid #0000ff",
                    borderRadius: "0.25em",
                    backgroundColor: "#007",
                }}
                onClick={() => this.doAction(nextAction)}
            >
                {actionMessage || actionLabels[nextAction]}
            </button>
        );
        const showMoreInstructions = moreInstructions ? (
            <>
                <br />
                {moreInstructions}
            </>
        ) : null;

        const progressLabel = "string" == typeof progressBar ? progressBar : "";
        const renderedStatus =
            (status &&
                inPortal(
                    "topCenter",
                    <>
                        {showProgressBar ? (
                            <Progress>{progressLabel}</Progress>
                        ) : (
                            ""
                        )}
                        {error ? (
                            <div
                                className="error border rounded relative mb-4"
                                role="alert"
                                style={{ marginBottom: "0.75em" }}
                            >
                                {doNextAction}
                                <strong className="font-bold">
                                    Whoops! &nbsp;&nbsp;
                                </strong>
                                <span className="block inline">{status}</span>

                                {showMoreInstructions}
                            </div>
                        ) : (
                            <div
                                className="status border rounded relative mb-4"
                                role="banner"
                                // style={{ marginBottom: "-7em" }}
                            >
                                {doNextAction}
                                <span className="block sm:inline">
                                    {status}
                                </span>

                                {showMoreInstructions}
                            </div>
                        )}
                    </>
                )) ||
            "";

        if (!allCreds) {
            results = inPortal("topCenter", loading);
        } else if ("create" == route) {
            if (wallet) {
                results = (
                    <CredForm
                        {...{
                            credsRegistry,
                            wallet,
                            walletHelper,
                            walletUtxos,
                            updateState: this.updateState,
                            refresh: this.fetchRegistryEntries,
                            router,
                        }}
                        create
                        onSave={this.saved}
                        onClose={this.closeForm}
                    />
                );
            } else {
                this.connectWallet(false);
            }
        } else if ("edit" == route) {
            if (wallet) {
                const { updateState } = this;
                const editing = this.state.credsIndex[id];
                results = (
                    <CredForm
                        {...{
                            credsRegistry,
                            wallet,
                            updateState,
                            refresh: this.fetchRegistryEntries,
                            router,
                        }}
                        cred={editing}
                        onSave={this.saved}
                        onClose={this.closeForm}
                    />
                );
            } else {
                this.connectWallet(false);
                results = loading;
            }
        } else if ("view" == route) {
            // status = "";
            const cred = this.state.credsIndex[id];
            results = (
                <CredView {...{ cred, wallet, walletUtxos, credsRegistry }} />
            );
        } else {
            results = (
                <CredsList
                    {...{
                        allCreds,
                        createCredential: this.createCredential,
                        credsRegistry,
                        credsStatus: status,
                        editCredId: this.editCredential,
                        // refreshCreds
                    }}
                />
            );
        }

        const detail = showDetail ? (
            <Prose className={``}>
                DETAIL
                <pre>{showDetail}</pre>
            </Prose>
        ) : (
            ""
        );
        return (
            <div>
                <Head>
                    <title>Credentials Registry</title>
                </Head>
                {renderedStatus}
                {walletInfo}
                {detail}
                {results}
                {this.txnDump()}
                {/* <Prose className="">
                    <div className="suppressHydrationWarning"> instance {this.i} </div>
                </Prose> */}
            </div>
        );
    }

    doAction(action) {
        const actions = {
            initializeRegistry: this.bootstrapRegistry,
            retryRegistry: this.connectCredsRegistry,
        };
        const thisAction = actions[action];
        thisAction.call(this);
    }

    renderWalletInfo() {
        const {
            wallet,
            networkName = defaultNetwork,
            connectingWallet,
        } = this.state;

        let networkIndicator = (
            <span
                key="chip-networkName"
                className="inline-block text-center min-w-[5em] mb-0 rounded border border-slate-500 text-slate-400 text-sm px-2 py-0 bg-blue-900 shadow-none outline-none transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:cursor-text"
            >
                {networkName}
            </span>
        );

        if (connectingWallet) {
            return (
                <div>
                    <Button variant="secondary" disabled className="-mt-3">
                        ... connecting ...
                    </Button>
                </div>
            );
        } else if (wallet) {
            return networkIndicator;
        } else {
            return (
                <div>
                    {this.networkSwitcher()}
                    <Button
                        variant="secondary"
                        className="-mt-3"
                        onClick={this.onConnectButton}
                    >
                        Connect Wallet
                    </Button>
                </div>
            );
        }
    }

    onConnectButton: MouseEventHandler<HTMLButtonElement> = async (event) => {
        this.connectWallet();
    };

    networkSwitcher() {
        const { networkName = defaultNetwork } = this.state;
        const isMainnet = networkName == "mainnet";
        const networkNameUc =
            networkName.slice(0, 1).toUpperCase() + networkName.slice(1);
        const canBePreprod = (
            <div
                key={`chip-preprod`}
                className="inline-block text-[#999] mx-2 text-sm hover:cursor-pointer text-center min-w-[5em]"
            >
                Preprod
            </div>
        );
        const canBeMainnet = (
            <div
                key={`chip-mainnet`}
                className="inline-block text-[#999] mx-2 text-sm hover:cursor-pointer text-center min-w-[5em]"
            >
                Mainnet
            </div>
        );

        let networkIndicator = (
            <span
                key={`chip-${networkName}`}
                className="inline-block mx-2 hover:cursor-pointer text-center min-w-[5em] mb-0 rounded border border-slate-500 text-slate-400 text-sm px-2 py-0 bg-blue-900 shadow-none outline-none transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] "
            >
                {networkNameUc}
            </span>
        );
        if (isMainnet) {
            return (
                <div className="inline-block mr-4">
                    <Switch
                        id="network-switcher"
                        checked
                        before={canBePreprod}
                        after={networkIndicator}
                        onChange={this.changeNetwork}
                    />
                </div>
            );
        } else {
            return (
                <div className="inline-block mr-4">
                    <Switch
                        id="network-switcher"
                        before={networkIndicator}
                        after={canBeMainnet}
                        onChange={this.changeNetwork}
                    />
                </div>
            );
        }
    }

    changeNetwork: ChangeEventHandler<HTMLInputElement> = async (e) => {
        const { networkName: old = defaultNetwork } = this.state;
        const networkName = old == "mainnet" ? "preprod" : "mainnet";
        this.setupBlockfrost(networkName);
        await this.updateState(
            `switching to ${networkName}`,
            { networkName },
            "//user switched network pref"
        );
        this.connectCredsRegistry();
    };

    txnDump() {
        const { tcx } = this.state;
        if (!tcx) return;

        const txnDump = tcx && dumpAny(tcx);
        {
            txnDump && (
                <pre
                    style={{
                        color: "#999",
                        border: "1px dashed #505",
                        borderRadius: "0.5em",
                    }}
                >
                    {txnDump}

                    {tcx.state.bsc &&
                        JSON.stringify(tcx.state.bootstrappedConfig, null, 2)}
                </pre>
            );
        }
    }

    //  ---- Component setup sequence starts here
    //  -- step 1: get blockfrost's network params
    async componentDidMount() {
        const networkParams: NetParams = await this.bf.getParameters();
        console.log("ok: got blockfrost network params");

        // await this.updateState('connecting to wallet', {
        // this.connectWallet();
        await this.updateState(
            "initializing registry",
            {
                networkParams,
            },
            "//component did mount"
        );
        this.connectCredsRegistry();
    }

    _unmounted?: true;
    async componentWillUnmount() {
        this._unmounted = true;
        console.error("CCR list unmounted"); // not really an error
        // debugger
    }

    newWalletSelected(selectedWallet: string = "eternl") {
        this.setState({ selectedWallet }, this.connectWallet.bind(this));
    }

    //  -- step 2: connect to Cardano wallet
    connectingWallet: Promise<any>;
    async connectWallet(autoNext = true) {
        const { networkName: pnn, selectedWallet = "eternl" } = this.state;

        //! it suppresses lame nextjs/react-sourced double-trigger of mount sequence
        // if (this._unmounted) return
        // debugger
        if (this.connectingWallet) {
            console.warn(
                "suppressing redundant wallet connect, already pending"
            );

            return this.connectingWallet;
        }

        await this.updateState("connecting to Cardano wallet", {
            connectingWallet: true,
            progressBar: true,
        });
        const connecting = (this.connectingWallet =
            //@ts-expect-error on Cardano
            window.cardano[selectedWallet].enable());
        const handle: helios.Cip30Handle = await connecting;

        const networkName = networkNames[await handle.getNetworkId()];
        this.setupBlockfrost(networkName);
        // if (networkName !== "preprod") {
        // if (networkName !== "mainnet") {
        //         return this.updateState(
        //         // `This application is only released on the preprod testnet for now.  Please switch to a preprod wallet.`,
        //         `Wallet needs to be on mainnet`,
        //             { error: true }
        //     );
        // }
        // if (this.bf.networkName !== networkName) {
        //     //! checks that wallet network matches network params / bf
        //     this.updateState(
        //         `wallet network mismatch; expected ${this.bf.networkName}, wallet ${networkName}`,
        //         { error: true }
        //     );
        //     return
        // }
        const wallet = new helios.Cip30Wallet(handle);

        const collateralUtxos = await handle.getCollateral();
        if (!collateralUtxos?.length) {
            this.updateState(`Error: no collateral UTxO set in wallet config`, {
                error: true,
            });
            return;
        }

        const walletHelper = new helios.WalletHelper(wallet);
        await this.updateState("initializing registry with wallet connected", {
            wallet,
            connectingWallet: false,
            walletHelper,
            networkName,
        });
        walletHelper.getUtxos().then((walletUtxos) => {
            this.updateState(undefined, { walletUtxos });
        });
        return this.connectCredsRegistry(autoNext).then(() => {
            if (pnn !== networkName) {
                // this.updateState(
                //     `NOTE: wallet's network forced a switch to ${
                //         networkName
                //     }`, {clearAfter: 5000
                // }, "//network-did-switch-notice");
                // this.updateState("", {delay: 5000}, "//clear network-did-switch-notice");
            }
        });
    }

    // -- step 3 - check if the creds registry is ready for use
    async connectCredsRegistry(autoNext = true) {
        const [route] = this.currentRoute;
        if ("create" == route || "edit" == route) {
            await this.connectWallet();
        }
        const {
            networkParams,
            wallet,
            networkName = defaultNetwork,
        } = this.state;
        const isMainnet = wallet
            ? await wallet.isMainnet()
            : networkName == "mainnet";

        const ccrConfig = isMainnet ? mainnetConfig : preprodConfig;
        let config = ccrConfig
            ? { config: CCRegistryV06.parseConfig(ccrConfig) }
            : { partialConfig: {} };

        if (!wallet) console.warn("connecting to registry with no wallet");
        let cfg: StellarConstructorArgs<ConfigFor<CCRegistryV06>> = {
            setup: {
                network: this.bfFast,
                networkParams,
                isMainnet,
                myActor: wallet,
                isDev: "development" == process.env.NODE_ENV,
                optimize: false,
            },
            // partialConfig: {},
            ...config,
        };
        try {
            const credsRegistry = new CCRegistryV06(cfg);
            if (wallet) await credsRegistry.walletNetworkCheck;
            const isConfigured = await credsRegistry.isConfigured;
            if (!isConfigured) {
                // alert("not configured");
                await this.updateState(
                    `Creds Registry contract isn't yet created or configured.  Add a configuration if you have it, or create the registry now.`,
                    { credsRegistry, nextAction: "initializeRegistry" }
                );
                return;
                // return this.stellarSetup();
            }
            if (!autoNext)
                return this.updateState(
                    "",
                    { credsRegistry },
                    "//creds registry connected to wallet, ready to do an on-chain activity"
                );

            await this.updateState(
                "... searching ...",
                {
                    credsRegistry,
                },
                "//searching (or freshening search after wallet connection)"
            );

            return this.fetchRegistryEntries();
        } catch (error) {
            this.reportError(error, "checking registry configuration: ", {
                nextAction: "initializeRegistry",
                actionLabel: "Create New Registry",
            });
        }
    }

    //  -- step 3a - initialize the registry if needed
    async bootstrapRegistry() {
        if (!this.state.wallet) await this.connectWallet();

        await this.updateState(
            "creating Creds Registry charter transaction ...",
            { progressBar: true }
        );

        const { credsRegistry, wallet } = this.state;
        let tcx: Awaited<
            ReturnType<stateType["credsRegistry"]["mkTxnMintCharterToken"]>
        >;
        try {
            const used = await wallet.usedAddresses;
            const unused = await wallet.unusedAddresses;

            tcx = await credsRegistry.mkTxnMintCharterToken({
                govAuthorityLink: {
                    strategyName: "address",
                    config: {
                        addrHint: [...unused, ...used],
                    },
                },
                // mintDelegateLink: {
                //     strategyName: "default"
                // }
            });
        } catch (e) {
            console.error(e);
            this.reportError(e, "creating charter: ", {
                nextAction: "retryRegistry",
            });
            debugger;
            return;
        }
        await this.updateState(
            "Bootstrap transaction loading into your wallet...",
            {
                tcx,
                progressBar: true,
                moreInstructions:
                    "If it looks right, sign the transaction to finish initializing the registry.",
            }
        );
        try {
            await credsRegistry.submit(tcx);
            await this.updateState(
                `Registry creation submitted.  Deploy the following details...`,
                {
                    showDetail: JSON.stringify(
                        tcx.state.bootstrappedConfig,
                        null,
                        2
                    ),
                }
            );
            console.warn(
                "------------------- Boostrapped Config -----------------------\n",
                tcx.state.bootstrappedConfig,
                "\n------------------- deploy this! -----------------------\n"
            );

            // this.seekConfirmation()
        } catch (e) {
            console.error(e);
            this.updateState(`wallet reported "${e.message}"`, {
                credsRegistry: undefined,
                error: true,
                nextAction: "retryRegistry",
            });
        }
    }

    reportError(e: Error, prefix: string, addlAttrs: Partial<stateType>) {
        console.error(e.stack || e.message);
        return this.updateState(`${prefix} "${e.message}"`, {
            error: true,
            ...addlAttrs,
        });
    }

    //  -- step 4: Read registry entries from chain
    async fetchRegistryEntries() {
        const { credsRegistry } = this.state;

        const found = await this.bf.getUtxos(credsRegistry.address);
        const { mph } = credsRegistry;

        const allCreds: RegisteredCredentialForUpdate[] = [];
        const credsIndex = {};
        const waiting: Promise<any>[] = [];
        for (const utxo of found) {
            waiting.push(
                credsRegistry.readRegistryEntry(utxo).then((cred) => {
                    if (!cred) return;
                    allCreds.push(cred);
                    credsIndex[cred.id] = cred;
                })
            );
        }
        await Promise.all(waiting);
        return this.updateState("", { allCreds, credsIndex });
    }

    /**
     * Promise-based wrapper for setState, with status message implicit
     * @remarks
     *
     * sets the status message in state.status, along with any other state props
     *
     * automatically clears nextAction, error, and actionLabels if they aren't
     * explicitly set.
     *
     * returns an await-able promise for setting the indicated state
     *
     * @public
     **/
    updateState(
        status?: string,
        stateProps: Omit<stateType, "status"> & {
            clearAfter?: number;
            delay?: number;
        } = {},
        extraComment?: string
    ): Promise<any> {
        const {
            nextAction = undefined,
            moreInstructions = undefined,
            progressBar = undefined,
            error = undefined,
            actionLabel = undefined,
            delay,
            clearAfter,
        } = stateProps;

        // if (this._unmounted) {
        //     console.warn(`suppressing state update after unmount (\"${status}\")`)
        //     return
        // }
        console.log(`instance ${this.i}`, { status, delay, clearAfter });
        const stateUpdate =
            "undefined" === typeof status
                ? {}
                : {
                      status,
                      nextAction,
                      error,
                      actionLabel,
                      moreInstructions,
                      progressBar,
                  };
        const newState = {
            ...stateProps,
            ...stateUpdate,
        };
        return new Promise<void>(async (resolve) => {
            console.error(extraComment || "", { newState });
            if (delay) {
                await new Promise((res) => setTimeout(res, delay));
            }
            if (clearAfter) {
                setTimeout(() => {
                    if (this.state.status == status)
                        this.updateState(
                            status,
                            {},
                            "//clear previous message"
                        );
                });
            }

            this.setState(newState, resolve);
        });
    }
    static nextPrev = false;
}
const certsPageWithRouter = withRouter(CertsPage);
//@ts-expect-error
certsPageWithRouter.nextPrev = false;
export default certsPageWithRouter;
