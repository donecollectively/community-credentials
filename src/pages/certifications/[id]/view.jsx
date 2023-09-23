import { NextPageContext } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import { createPortal } from "react-dom"
import { Prose } from "../../../components/Prose"

// ViewCert.getPageProps = async (ctx) => {
ViewCert.getInitialPXXrops = async (ctx) => {
    debugger
    const { id } = ctx.query
    if ("undefined" == typeof window) return {}

    await new Promise((r) => setTimeout(r, 400))
    return { sidebar: [<div>hi sidebar {id}</div>] }
    const res = await fetch("https://api.github.com/repos/vercel/next.js")
    const json = await res.json()
    return { stars: json.stargazers_count }
}

export default function ViewCert(props) {
    const { query } = useRouter()
    const [rendered, firstRender] = useState(null)
    if (!rendered) setTimeout(() => firstRender(true), 10)
    // const [posts, setPosts] = useState(null);

    // useEffect(() => {    fetchPosts().then(p => setPosts(p));  }, []);
    const metaTable = (
        <Prose>
            <table className="mt-16 text-gray-400 table-auto">
                <tbody>
                    <tr>
                        <th>Issued by<br/><br/></th>
                        <td>
                            <strong>LearnerShape SkillsGraph</strong>
                        </td>
                    </tr>
                    <tr>
                        <th>Registration space</th>
                        <td>
                            <strong>Cardano on-chain</strong>
                        </td>
                    </tr>
                    <tr>
                        <th>Issuance platform</th>
                        <td>
                            <strong>AtalaPRISM via LearnerShape</strong>
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
    )

    let sidebarMetaTable
    {
        if (!rendered || "undefined" == typeof window) {
            sidebarMetaTable = <div suppressHydrationWarning />
        } else {
            const portalTarget = document?.getElementById("sidebar")
            sidebarMetaTable = (
                <div suppressHydrationWarning>
                    {createPortal(metaTable, portalTarget)}
                </div>
            )
        }
    }

    return (
        <div>
            <Head>
                <title>
                    Certificate: Cardano Smart Contract dApp Architect by
                    SkillsGraph
                </title>
            </Head>
            <span className="text-slate-700">
                        [EXAMPLE]</span>
            <h2>Cardano Smart Contract dApp Architect</h2>
                <div >
                    <h4>Certificate Description <span className="text-slate-700">
                        [same as on List page]</span>
                    </h4>

                    <p>
                        The holder is a experienced software engineer with
                        expertise in web application development, Cardano ledger
                        principles, Plutus smart-contract design, and other
                        technologies needed to create fully-functional
                        decentralized applications for the Cardano blockchain.
                    </p>

                    <h4>Expectations of a Credential Holder</h4>
                    <div className="hidden">Skills, Capabilities / Experience</div>
                    <ul className="list-none">
                        <li>☐&nbsp;&nbsp;&nbsp;Can create technical design of complete dApp systems</li>
                        <li>☐&nbsp;&nbsp;&nbsp;Proficient with web technologies</li>
                        <li>☐&nbsp;&nbsp;&nbsp;Can design Cardano smart contracts</li>
                        <li>☐&nbsp;&nbsp;&nbsp;Familiar with on- and off-chain operational and data models</li>
                    </ul>
            </div>
            <h4>Issuance requirements / Governance Process</h4>

            <p>
                SkillsGraph's knowledge-certification platform uses a rigorous
                testing process to verify the candidate's experience. It
                includes an automated examination questionnaire as well as
                multiple task-based tests requiring a candidate to produce
                functioning code; its results are rigorously verified for
                objective indications of successful achievement.
            </p>
            {sidebarMetaTable}
            <div className="xl:hidden">{metaTable}</div>
        </div>
    )
}
