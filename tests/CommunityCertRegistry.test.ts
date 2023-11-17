import {
    describe as descrWithContext,
    expect,
    it as itWithContext,
    beforeEach,
    vi,
    afterEach,
} from "vitest"

import {
    StellarTestContext,
    addTestContext,
} from "@donecollectively/stellar-contracts/testing"

// import { Address, TxId, TxOutput, Value, bytesToText } from "@hyperionbt/helios"
import { CCRTestHelper } from "./CCRTestHelper.js"

type localTC = StellarTestContext<CCRTestHelper>
// DefaultCapoTestHelper<DelegationTestCapo>

const describe = descrWithContext<localTC>
const it = itWithContext<localTC>
const fit = itWithContext.only

describe("Community cert registry", async () => {
    beforeEach<localTC>(async (context) => {
        return addTestContext(context, CCRTestHelper)
    })

    it("can be instantiated based on result of original charterMint", async (context: localTC) => {
        const {
            h,
            h: { network, actors, delay, state },
        } = context

        const tcx = await h.mintCharterToken()
        const config = tcx.state.bootstrappedConfig;
        const addr = h.strella.address;

        expect(config).toBeTruthy();
        await h.initialize({randomSeed: 19, config});
        expect(h.strella.address.eq(addr), "address mismatch").toBeTruthy()
    })

})
