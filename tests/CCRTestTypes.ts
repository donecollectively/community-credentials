import { ADA, StellarCapoTestHelper, StellarTestContext, StellarTxnContext } from "@donecollectively/stellar-contracts";
import { CCRegDatumProps, CCRegistry } from "../src/contracts/CCRegistry";

export type localTC = StellarTestContext<CCRTestHelper>;


class CCRTestHelper extends StellarCapoTestHelper<CCRegistry> {
    get stellarClass() {
        return CCRegistry;
    }
    setupActors() {
        this.addActor("tina", 1100n * ADA);
        this.addActor("tracy", 13n * ADA);
        this.addActor("tom", 120n * ADA);
        this.currentActor = "tina";
    }

    async mkCharterSpendTx(): Promise<StellarTxnContext> {
        await this.mintCharterToken();

        const treasury = this.strella!;
        const tcx: StellarTxnContext = new StellarTxnContext();

        return treasury.txnAddAuthority(tcx);
    }

    async updateRegistryDatum(
        args: Partial<CCRegDatumProps>)
    : Promise<StellarTxnContext> {
        await this.mintCharterToken();
        const registry = this.strella!;

        const { signers } = this.state;

        const tcx = await registry.mkTxnUpdateSettings(args);
        return registry.submit(tcx, { signers }).then(() => {
            this.network.tick(1n);
            return tcx;
        });
    }
}