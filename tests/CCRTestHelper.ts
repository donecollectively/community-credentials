import {
    ADA,
    CapoTestHelper,
    DefaultCapoTestHelper,
    StellarTestContext,
    StellarTxnContext,
} from "@donecollectively/stellar-contracts"
import { CCRegDatumProps, CCRegistry } from "../src/contracts/CCRegistry.js"

export class CCRTestHelper extends DefaultCapoTestHelper<CCRegistry> {
    get stellarClass() {
        return CCRegistry
    }

    setupActors() {
        // community certs Administrators
        this.addActor("anton", 1300n * ADA)
        this.addActor("azizi", 1100n * ADA)

        // community certs registrants
        this.addActor("ryu", 120n * ADA)
        this.addActor("rohit", 120n * ADA)
        this.addActor("roger", 13n * ADA)

        // public visitors
        this.addActor("pablo", 120n * ADA)
        this.addActor("peng", 120n * ADA)
        this.addActor("panuk", 120n * ADA)

        this.currentActor = "anton"
    }

    async mkCharterSpendTx(): Promise<StellarTxnContext> {
        await this.mintCharterToken()

        const treasury = this.strella!
        const tcx: StellarTxnContext = new StellarTxnContext()

        return treasury.txnAddGovAuthority(tcx)
    }

    async updateRegistryDatum(
        args: Partial<CCRegDatumProps>
    ): Promise<StellarTxnContext> {
        await this.mintCharterToken()
        const registry = this.strella!

        const { signers } = this.state

        return new StellarTxnContext();
        // const tcx = await registry.mkTxnUpdateSettings(args)
        // return registry.submit(tcx, { signers }).then(() => {
        //     this.network.tick(1n)
        //     return tcx
        // })
    }
}
