import {
    Activity,
    RoleMap,
    SeedTxnParams,
    StellarTxnContext,
    datum,
    txn,
    mkHeliosModule,
    DefaultCapo,
    variantMap,
    hasReqts,
} from "@donecollectively/stellar-contracts"

import type {
    isActivity,
    stellarSubclass,
    strategyValidation,
} from "@donecollectively/stellar-contracts";

import contract from "./CCRegistry.hl" assert {type: "text"};
import { CCRMinter } from "./CCRMinter.js";
import { RCPolicy } from "./RCPolicy.js";
import { Address, Datum } from "@hyperionbt/helios"

export type CCRegDatumProps = {
    governancePolicy: Address
    govUUT: string,
}

export class CCRegistry extends DefaultCapo<CCRMinter> {
    contractSource() {
        return mkHeliosModule(contract, "src/contracts/CCRegistry.hl")
    }

    get minterClass(): stellarSubclass<CCRMinter, SeedTxnParams> {
        return CCRMinter
    }
    declare minter: CCRMinter

    static get defaultParams() {
        return {}
    }

    get roles(): RoleMap {
        return {
            noDefault: variantMap<RCPolicy>({}),
            regCredPolicy: variantMap<RCPolicy>({
                default: {
                    delegateClass: RCPolicy,
                    partialConfig: {},
                    validateConfig(args): strategyValidation {

                        return undefined
                    },
                },
            }),
        }
    }

    // @txn
    // async mkTxnUpdateCharter(
    //     args: Partial<CCRegDatumProps>,
    //     tcx: StellarTxnContext = new StellarTxnContext()
    // ): Promise<StellarTxnContext> {
    //     console.log("minting named token")
    //     return this.txnMustUseCharterUtxo(
    //         tcx,
    //         this.updatingCharter(args)
    //     ).then(async (_sameTcx) => {
    //         return this.minter!.txnMintingNamedToken(tcx, tokenName, count)
    //     })
    // }

    requirements() {
        return hasReqts({
            "people can post credentials to be listed in the creds Registry": {
                purpose: "testnet: create a project-based learning zone for credentials and a useful creds registry",
                details: [
                    "People can post credentials into the registry ",
                    "  ... to share information about the credentials they have ",
                    "  ... or that they would like to offer.",
                    "Provides directory of verifiable credentials and their issuers ",
                    "  ... for use by Web 3 communities in Cardano and beyond.",
                    "People can use the directory to understand what credentials mean",
                    "  ... and how to acquire and verify them",
                    "The registry is operated by people who can exercise oversight authority over the registry",
                ],
                mech: ["per nested requirements"],
                requires: [
                    "allows anyone to post information about a credential, for listing in the registry",
                    "creates validated credential listings",
                    "enforces an automatic expiration for every listing",
                    "creates a policy-delegate to govern each listing, in a separate contract",
                    "a listing can be freshened by its policy-delegate",
                    "the registry's trustee group can govern listed credentials",
                ],
            },
            "allows anyone to post information about a credential, for listing in the registry": {
                purpose: "Enables openness",
                details: [
                    "People are expected to use a web UI for filling out details.",
                    "The UI code should mkTxnCreatingRegisteredCredential() with the details.",
                    "The Create transaction makes an identifiable UTxO in the contract for the listing, ",
                    "  ... and sends an NFT-like token to the user's wallet for positive linkage with the listing.",
                ],
                mech: [
                    "The person who posts the credential is the default trustee for that credential's policy-delegate",
                    "Creates a RegisteredCredential datum in the contract, with a rcred-xxxxx UUT",
                ],
                requires: [
                    "creates validated credential listings",
                    "creates a policy-delegate to govern each listing, in a separate contract",
                    "issues a Linked Interaction Token for the creator's wallet"
                ],
            },

            "creates validated credential listings": {
                purpose: "Provides baseline assurance of having key details for a listing",
                details: [
                    "Required fields must be filled, for a listing to be valid",
                    "Other validations may also be enforced",
                    "Validation problems in mkTxnCreatingRegisteredCredential() should be made visible to the UI layer",
                    "It should be possible for people to experiment with credential listings even if they do not yet have an issuing service or dID"
                ],
                mech: [
                    "type, name, issuer name, and description are required as essential information about the credential",
                    "at least one Expectation for the subject of a credential must be specified",
                    "other fields are optional, to support experimentation",
                ],
                requires: [],
            },

            "issues a Linked Interaction Token for the creator's wallet": {
                purpose: "to enable a person to easily connect in the future with their listings",
                details: [
                    "Each created listing also issues an NFT-like token, sent to the creator's wallet",
                    "The minted metadata can contain or reference HTML/Javascript to show in-wallet details",
                    "That token can be re-minted later, to update its metadata as needed",
                    "Additional mints of the same token can be issued to other trustees on that listing,",
                    "  ... or for interested people to use like a bookmark for that listing"
                ],
                mech: [
                    "uses token name link:rcred-xxxxx, where xxxxx matches the rcred-  UUT identifier",
                    "more detailed reqts TBD",
                ],
                requires: [],
            },

            "enforces an automatic expiration for every listing": {
                purpose: "provides a dead-man-switch convention to ensure freshness of displayed listings",
                details: [
                    "Issuing parties must freshen their credential listings periodically",
                    "  ... to guard against obsolete registry listings.",
                    "At that time, they may choose to freshen certain details of their listings also."
                ],
                mech: [
                    "expiration is 45 days, and may not be modified by the creator",
                    "queries for active listings SHOULD filter out past-expiry records"
                ],
                requires: [
                    "a listing can be freshened by its policy-delegate"
                ],
            },

            "a listing can be revoked": {
                purpose: "for proactive assurance of freshness and quality of the listing and the registry overall",
                details: [
                    "The registry's trustees and a listing's policy-delegate can revoke a listing.",
                    "A revoked listing MUST NOT be considered an active item in the registry."
                ],
                mech: [
                    "A revocation is allowed by authority of the policy-delegate's UUT",
                    "A revocation is allowed by authority of the registry's trustees"
                ],
                requires: [
                    "the registry's trustee group can govern listed credentials",
                    "creates a policy-delegate to govern each listing, in a separate contract",
                ],
            },

            "creates a policy-delegate to govern each listing, in a separate contract": {
                purpose: "to keep the main contract simple and allow richness of delegates",
                details: [
                    "The main contract allows updates to listings on delegated authority of a UUT",
                    "That UUT is assigned to a known contract implementing an authorization policy",
                    "Other contracts could be used as delegates.",
                    "The delegate contract can have unlimited policy richness without affecting the main contract.",
                    "The delegate contract is self-sovereign with regard to its own authority",
                    "Note that the main contract retains governance authority, guarding for data quality and against abuse.",
                    "The Stellar contract class records the delegate contract address, ",
                    "  ... creating positive linkage to the on-chain delegate, ",
                    "  ... and allowing off-chain resolution of txn-building code for it"
                ],
                mech: [
                    "authority is granted IFF the RegCredUUT is spendable",
                    "the contract address of the delegate is stored in the listing",
                ],
                requires: [],
            },

            "a listing can be freshened by its policy-delegate": {
                purpose: "allowing update and preventing the expiration of a listing",
                details: [

                ],
                mech: [],
                requires: [],
            },

            "the registry's trustee group can govern listed credentials": {
                purpose: "to guard for quality and against abuse",
                details: [
                    "TODO - use Capo multisig strategy"
                ],
                mech: [

                ],
                requires: [],
            },
        });
    }
}
