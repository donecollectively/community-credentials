import {
    Program,
    Datum,
    TxId,
    TxOutputId,
    Address,
    Value,
    TxOutput,
    MintingPolicyHash,
    Assets,
    Crypto,
    UTxO,
} from "@hyperionbt/helios";

import {
    Activity,
    DefaultMinter,
    StellarTxnContext,
} from "@donecollectively/stellar-contracts";
import type {
    valuesEntry,
    tokenNamesOrValuesEntry,
    isActivity,
} from "@donecollectively/stellar-contracts";

//@ts-expect-error
import contract from "./StellarOrgMinter.hl";

//! Serves the Community Credential Registry
//!  issues UUTs (unique utility tokens) as handles for each Registered Credential,
//   ... used for uniquely identifying a particular UTxO in the Registry contract
//  issues LITs (linked interaction tokens) for each registered credential
//  ... used for trustees (and/or other parties) to easily connect from their wallets
//  ... to the credential information / details / maintenance page
export class CCRMinter extends DefaultMinter {
    contractSource() {
        return contract;
    }

    @Activity.redeemer
    protected commissioningNewCred(credId: string): isActivity {
        const t = new this.configuredContract.types.Redeemer.commissioningNewCred(
            credId
        );

        return { redeemer: t._toUplcData() };
    }

    @Activity.redeemer
    protected mintingLIT(credId: string): isActivity {
        const t = new this.configuredContract.types.Redeemer.mintLIT({
            credId
        });

        return { redeemer: t._toUplcData() };
    }

    //!!! todo: eliminate these duplicate functions one way or other
    tnCredUUT(credId: string) {
        return `cred-${credId}`;
    }
    tnLIT(credId: string) {
        return `link:cred${credId}`;
    }

    @Activity.partialTxn
    async txnCommissioningNewCred(
        tcx: StellarTxnContext,
        credId: string
    ): Promise<StellarTxnContext> {
        let namesAndCounts: tokenNamesOrValuesEntry[] = [
            [this.tnCredUUT(credId), 1n],
             [this.tnLIT(credId), 1n],
        ];
        const values: valuesEntry[] = namesAndCounts.map(([name, count]) => {
            if (Array.isArray(name)) return [name, count] as valuesEntry;
            const v: valuesEntry = this.mkValuesEntry(name, count);
            return v;
        });
        const value = this._mkMintingValue(values);

        return tcx
            .mintTokens(
                this.mintingPolicyHash!,
                values,
                this.commissioningNewCred(credId).redeemer
            )
            .attachScript(this.compiledContract);
    }

    
    private _mkMintingValue(values: valuesEntry[]) {
        return new Value(0, new Assets([[this.mintingPolicyHash, values]]));
    }

    @Activity.partialTxn
    async txnLinkedInteractionToken(
        tcx: StellarTxnContext,
        credId: string,
        count?: bigint
    ): Promise<StellarTxnContext> {
        let value = [
            this.mkValuesEntry(this.tnLIT(credId), count)
        ];

        return tcx
            .mintTokens(
                this.mintingPolicyHash!,
                value,
                this.mintingLIT(credId).redeemer
            )
            .attachScript(this.compiledContract);
    }
    
}
