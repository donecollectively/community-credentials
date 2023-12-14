import { BasicMintDelegate, HeliosModuleSrc, mkHeliosModule } from "stellar-contracts-v0.8.4";

//@ts-expect-error because TS doesn't understand helios
import CcrSpecialMintDelegate from "./specializedMintDelegate.hl";

//@ts-expect-error because TS doesn't understand helios
import CcrSpecialCapo from "./specializedCCRegistry.hl";

export class CCRMintDelegateV05 extends BasicMintDelegate {

    _m : HeliosModuleSrc 
    get specializedMintDelegate(): HeliosModuleSrc {
        if (this._m) return this._m

        return this._m = mkHeliosModule(CcrSpecialMintDelegate, "specializedMintDelegate");
    }

    _c : HeliosModuleSrc
    get specializedCapo(): HeliosModuleSrc {
        if (this._c) return this._c;

        return this._c = mkHeliosModule(CcrSpecialCapo, "specializedCapo")
    }

}