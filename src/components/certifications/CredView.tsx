"use client";

import { NextPageContext } from "next";
import head from "next/head.js";
const Head = head.default;
import { useRouter } from "next/router.js";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Prose } from "@/components/Prose.jsx";
import { useLiveQuery } from "dexie-react-hooks";
import { RegisteredCredentialOnchain } from "../../contracts/CCRegistry.js";
import { Markdoc } from "../Markdoc.jsx";
import { helios } from "@donecollectively/stellar-contracts";
import { ClientSideOnly } from "../ClientSideOnly.jsx";
import { inPortal } from "../../inPortal.jsx";

// ViewCert.getInitialPXXrops = async (ctx) => {
//     const { id } = ctx.query
//     if ("undefined" == typeof window) return {}

//     await new Promise((r) => setTimeout(r, 400))
//     return { sidebar: [<div>hi sidebar {id}</div>] }
//     const res = await fetch("https://api.github.com/repos/vercel/next.js")
//     const json = await res.json()
//     return { stars: json.stargazers_count }
// }
const { BlockfrostV0, Cip30Wallet, TxChain } = helios;
type hWallet = typeof Cip30Wallet.prototype;

type propsType = {
    cred: RegisteredCredentialOnchain;
    wallet?: hWallet;
};
type stateType = {
    rendered: boolean
}

export class CredView extends React.Component<propsType, stateType> {
    render() {
        const {rendered} = this.state || {}
        if (!rendered) setTimeout(() => this.setState({rendered:true}), 10);
        // const [posts, setPosts] = useState(null);
        // useEffect(() => {    fetchPosts().then(p => setPosts(p));  }, []);
        console.log(
            "--------------------------------------------------------------------------------- cert view render"
        );
        const {
            cred: { cred },
            wallet,
        } = this.props;
        const metaTable = (
            <Prose className="">
                <table className="mt-16 table-auto text-gray-400">
                    <tbody>
                        <tr>
                            <th>
                                Issued by
                                <br />
                                <br />
                            </th>
                            <td>
                                <strong>{cred.issuerName}</strong>
                            </td>
                        </tr>
                        <tr>
                            <th>Registration space</th>
                            <td>
                                <strong>???? Cardano on-chain</strong>
                            </td>
                        </tr>
                        <tr>
                            <th>Issuance platform</th>
                            <td>
                                <strong>??? AtalaPRISM via LearnerShape</strong>
                            </td>
                        </tr>
                        <tr>
                            <th>Issuance URL</th>
                            <td>
                                <strong>???</strong>
                            </td>
                        </tr>
                        <tr>
                            <th>Verification Service</th>
                            <td>
                                <strong>???</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Prose>
        );

        let sidebarMetaTable = (
            <ClientSideOnly>
                {inPortal(
                    "sidebar",
                    <div className="hidden lg:block">{metaTable}</div>
                )}
            </ClientSideOnly>
        );

        // const tt =  new Address("addr1qx6p9k4rq077r7q4jdkv7xfz639tts6jzxsr3fatqxdp2y9w9cdd2uueqwnv0cw9gne02c0mzrvfsrk884lry7kpka8shpy5qw")
        // const ttt = Address.fromHash(tt.pubKeyHash, false)
        // {ttt.toBech32()}

        return (
            <>
                <Head>
                    <title>
                        Certificate:
                        {cred.credName} by {cred.issuerName}
                    </title>
                </Head>

                {wallet && (
                    <div className="float-right">
                        {this.possibleEditButton()}
                    </div>
                )}
                <h2>{cred.credName}</h2>
                <div>
                    <h4>
                        Certificate Description{" "}
                        <span className="text-slate-700">
                            {cred.credSummary}
                        </span>
                    </h4>
                    <Markdoc content={cred.credDesc} />
                    <h4>Expectations of a Credential Holder</h4>
                    <div className="hidden">
                        Skills, Capabilities / Experience
                    </div>
                    <ul className={`not-prose checklist`}>
                        {cred.expectations
                            .filter((x) => !!x)
                            .map((expectation, i) => (
                                <li key={`exp-${i}`}>{expectation}</li>
                            ))}
                    </ul>
                </div>
                <h4>Issuance requirements / Governance Process</h4>

                {cred.issuingGovInfo}

                <div className="block lg:hidden">
                    <hr />
                    {metaTable}
                </div>
                {sidebarMetaTable}
            </>
        );
    }

    possibleEditButton() {

    }
}
