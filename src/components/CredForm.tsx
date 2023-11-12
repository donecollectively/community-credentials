import React, {
    createRef,
    ChangeEvent,
    ChangeEventHandler,
    Component,
} from "react";
import { createPortal } from "react-dom";
import {
    CCRegistry,
    RegisteredCredential,
    RegisteredCredentialOnchain,
} from "../contracts/CCRegistry.js";
import { Prose } from "./Prose.jsx";
import head from "next/head.js";  const Head = head.default;

import { Wallet, dumpAny } from "@donecollectively/stellar-contracts";

type propsType = {
    credsRegistry: CCRegistry;
    wallet: Wallet;
    cred?: RegisteredCredentialOnchain;
    create?: boolean;
    onSave: Function;
    onClose: Function;
};
type stateType = {
    modified: boolean;
    gen: number;
    error?: string;
    current: RegisteredCredential;
};

type FieldProps = {
    rec: RegisteredCredential;
    fn: string;
    as?: React.ElementType;
    rows: number;
    placeholder?: string;
    label: string;
    defaultValue: string;

    helpText: string;
    index?: number;
    onChange: ChangeEventHandler<HTMLInputElement>;
};

const testCredInfo = {
// first - DEMU
    // credDesc: "Certifies a person's knowledge and ability to operate DEMU's Munode and administer the delegations and other music-related activities",
    // credName: "DEMU Certified Node Operator",
    // credSummary: "Certifies administrative and technical understanding of operating Munode",
    // credType: "skill",
    // expectations: [
    //     "has a practical understanding of general unix system administration",
    //     "can operate a nodejs-based service, including handling of version upgrades, with Docker",
    //     "has learned about delegation and music-inventory mechanics of DEMU's content network",
    //     "owns a $DEMU.munodeOperator token"
    // ],
    // issuerName: "DEMU",
    // issuingGovInfo: "Candidates will attend a node-operator training program and get their Munode running on testnet.\n\nAfter they demonstrate music-inventory delegation activities, DEMU staff will issue the certificate",

    credName: `Sample ${new Date().toUTCString()}`,
    credDesc: "test description",
    credSummary: "tester",
    credType: "testing",
    expectations: ["none"],
    issuerName: "nobody",
    issuingGovInfo: "hi!",
    credIssuerDID: "n/a",
};


const buttonStyle = {
    padding: "0.75em",
    marginLeft: "0.5em",
    minWidth: "8em",
    // marginTop: '-0.75em',
    // border: '1px solid #0000ff',
    // borderRadius: '0.25em',
    // backgroundColor: '#1e244c',

    border: "1px solid #162ed5",
    borderRadius: "0.5em",
    backgroundColor: "#142281",
};

type fieldOptions =
    | {
          array?: true;
          helpText?: string;
          length?: number;
          placeholder?: string;
          defaultValue?: string;
          rows?: number;
          type?: "textarea" | "input";
      }
    | undefined;

let mountCount = 0

export class CredForm extends React.Component<propsType, stateType> {
    form = createRef<HTMLFormElement>();
    i : number
    constructor(props) {
        super(props);
        this.i = mountCount += 1;
        this.save = this.save.bind(this);
        this.form = React.createRef();
    }

    async componentDidMount() {
        const { cred, credsRegistry } = this.props;
        // console.error(`MOUNTED CredForm ${this.i}`)
        const current =
            cred?.cred ||
            ({
                ...testCredInfo,
                // expectations: ["", ""],
            } as RegisteredCredential);
        await new Promise((res) => {
            this.setState({
                current,
            }, res as any)
        });
        if (this._unmounting) return;

        let tcx: any;
        try {
            const env = process.env.NODE_ENV;
            const minter = await credsRegistry.getMintDelegate();
            // tcx = await credsRegistry.mkTxnCreatingRegistryEntry(testCredInfo);
            // console.warn(dumpAny(tcx));
            debugger;
            // await credsRegistry.submit(tcx);
        } catch (error) {
            console.error(error.stack);
            debugger;
            this.setState({ error: error.message });
        }
    }
    _unmounting? : true
    componentWillUnmount(): void {
        // console.error(`UNMOUNTing CredForm ${this.i}`)
        // this._unmounting = true;
    }

    render() {
        const { current: rec, modified, error } = this.state || {};
        const { create, onClose, onSave } = this.props;
        if (!rec) return ""; //wait for didMount
        const showTitle = (
            <>
                {create && "Creating"} Credential Listing
                {create || `: ${rec.credName}`}
            </>
        );
        let sidebarContent;
        {
            if ("undefined" == typeof window) {
                sidebarContent = <div suppressHydrationWarning />;
            } else {
                const portalTarget = document?.getElementById("sidebar");
                sidebarContent = (
                    <div suppressHydrationWarning>
                        {createPortal(
                            <Prose
                                className="prose-slate"
                                style={{ fontSize: "85%" }}
                            >
                                <p
                                    style={{
                                        fontStyle: "italic",
                                        marginTop: "4em",
                                    }}
                                >
                                    Your credential will be listed on our
                                    website and visible in the Cardano
                                    blockchain. We'll create a bearer token in
                                    your wallet and a registry entry in our
                                    Registry smart contract.
                                </p>
                                <p style={{ fontStyle: "italic" }}>
                                    The listing will have an expiration date,
                                    and you can update details or extend its
                                    lifetime just by coming back here, with the
                                    bearer token still in your Cardano wallet.
                                </p>
                            </Prose>,
                            portalTarget
                        )}
                    </div>
                );
            }
        }

        return (
            <div>
                <Head>
                    <title>{showTitle}</title>
                </Head>
                <header className="mb-9 space-y-1">
                    <p className="font-display text-sm font-medium text-sky-500">
                        Certifications
                    </p>
                </header>
                {sidebarContent}
                <Prose
                    className="prose-slate"
                    style={{
                        marginTop: "-2em",
                        backgroundColor: "#1e244c",
                        borderRadius: "0.5em",
                        padding: "0.75em",
                    }}
                >
                    <div style={{ float: "right", fontSize: "80%" }}>
                        {(modified && (
                            <button
                                style={buttonStyle}
                                type="button"
                                onClick={onClose as any}
                            >
                                Cancel
                            </button>
                        )) || (
                            <button
                                style={buttonStyle}
                                type="button"
                                onClick={onClose as any}
                            >
                                {create ? "Cancel" : "Back"}
                            </button>
                        )}
                    </div>
                    <h1
                        className="font-display text-3xl tracking-tight text-slate-900 dark:text-white"
                        style={{
                            marginBottom: "0",
                        }}
                    >
                        {showTitle}
                    </h1>
                    <form
                        ref={this.form}
                        onSubmit={this.save}
                        style={{
                            padding: "0.75em",
                        }}
                    >
                        <table>
                            <tbody>
                                {this.field("Credential Type", "credType", {
                                    placeholder:
                                        "e.g. person, skill, experience, aptitude",
                                })}
                                {this.field("Credential Name", "credName", {
                                    placeholder: "Short onscreen label",
                                })}
                                {this.field("Description", "credDesc", {
                                    type: "textarea",
                                    rows: 3,
                                })}
                                {this.field("Issuer Name", "issuerName")}
                                {this.field("Issuing Entity DID", "credDID", {
                                    placeholder: "e.g. did:prism: ...",
                                })}
                                {this.field("Expectations", "expectations", {
                                    helpText:
                                        "credential holders will have demonstrated these skills, capabilities, or evidence",
                                    array: true,
                                    length: rec.expectations?.length,
                                })}
                                {this.field(
                                    "Governance Details",
                                    "issuingGovInfo",
                                    { type: "textarea", rows: 8,
                                        helpText: "describe how you govern the issuance of this credential"
                                    }
                                )}
                                <tr>
                                    <th></th>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td></td>
                                    <td>
                                        {modified && (
                                            <>
                                                <button
                                                    style={buttonStyle}
                                                    type="submit"
                                                >
                                                    {create
                                                        ? "Create"
                                                        : "Save Changes"}
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                                {error && (
                                    <tr>
                                        <td></td>
                                        <td>
                                            <div
                                                className="error border rounded relative mb-4"
                                                role="alert"
                                                style={{
                                                    marginBottom: "0.75em",
                                                }}
                                            >
                                                <strong className="font-bold">
                                                    Whoops! &nbsp;&nbsp;
                                                </strong>
                                                <span className="block inline">
                                                    {error}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </form>
                </Prose>
            </div>
        );
    }

    field(label: string, fn: string, options?: fieldOptions) {
        const { current: rec } = this.state;
        const { 
            array, type: as = 'input',  
            rows, helpText, placeholder, defaultValue, 
        } = options || {}; //prettier-ignore

        if (!array)
            return (
                <Field
                    key={fn}
                    {...{
                        rec,
                        as,
                        fn,
                        label,
                        placeholder,
                        defaultValue,
                        helpText,
                        rows,
                        onChange: this.changed,
                    }}
                />
            );
        const items = rec[fn];
        if (!!items.at(-1)) {
            items.push("")
        }
        
        return (
            <>
                {items.map((oneValue, index) => {
                    return (
                        <Field
                            key={`${fn}.${index} `}
                            {...{
                                rec,
                                as,
                                fn,
                                index,
                                label,
                                placeholder,
                                defaultValue,
                                helpText,
                                rows,
                                onChange: this.changed,
                            }}
                        />
                    );
                })}
            </>
        );

        // return "array"
    }

    changed: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        //! adds an empty item at the end of the list of expectations
        const {
            current: { expectations },
            gen = 0,
        } = this.state;

        const f = this.form.current;
        const fd = new FormData(f);

        if (fd.getAll("expectations").at(-1)) expectations.push("");
        this.setState({
            modified: true,
            gen: 1 + gen,
        });
    };

    async save(e: React.SyntheticEvent) {
        const { current: rec } = this.state;
        const { cred: original, credsRegistry, create, wallet } = this.props;
        e.preventDefault();
        e.stopPropagation();

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const cred: RegisteredCredential = Object.fromEntries(
            formData.entries()
        ) as unknown as RegisteredCredential;
        const exp = formData.getAll("expectations") as string[];
        while (!exp.at(-1)) exp.pop();
        cred.expectations = exp;

        try {
            debugger;
            const tcx = create
                ? await credsRegistry.mkTxnCreatingRegistryEntry(cred)
                : await credsRegistry.mkTxnUpdatingCredEntry({
                      cred,
                      original,
                      //  cred: original!,
                      //  id: cred.credAuthority.uutName,
                      //  utxo:
                  });
            await credsRegistry.submit(tcx);
            // this.setState({modified: true})
        } catch (error) {
            console.error(error.stack);
            debugger;
            this.setState({ error: error.message });
        }
    }
}

function Field({
    rec,
    fn,
    as: As = "input",
    helpText,
    index,
    placeholder,
    defaultValue,
    rows,
    label,
    onChange,
}: FieldProps) {
    const fieldId = `${fn}.${index || ""}`;
    const rVal = rec[fn];
    let value = rVal;

    if ("undefined" !== typeof index)
        value = rec[fn][index] || (rec[fn][index] = "");    
        
    const isOnlyOrLastRow = !Array.isArray(rVal) || index + 1 == rVal.length;
    const noBottomBorder = {
        style: { borderBottom: "none" },
    };
    const arrayTableStyle = isOnlyOrLastRow ? {} : noBottomBorder;

    return (
        <tr {...arrayTableStyle}>
            <th>{!!index || <label htmlFor={fieldId}> {label}</label>}</th>
            <td>
                <As
                    autoComplete="off"
                    style={{
                        width: "100%",
                        color: "#ccc",
                        fontWeight: "bold",
                        padding: "0.4em",
                        background: "#000",
                    }}
                    id={fieldId}
                    rows={rows}
                    name={fn}
                    onInput={onChange}
                    {...{ placeholder, defaultValue: value || defaultValue }}
                ></As>
                {isOnlyOrLastRow && helpText && (
                    <div
                        style={{
                            marginTop: "0.5em",
                            fontSize: "91%",
                            fontStyle: "italic",
                        }}
                    >
                        {helpText}
                    </div>
                )}
            </td>
        </tr>
    );
}
