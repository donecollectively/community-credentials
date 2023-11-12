import { BasicMintDelegate, HeliosModuleSrc, mkHeliosModule } from "@donecollectively/stellar-contracts";

//@ts-expect-error because TS doesn't understand helios
import CcrSpecialMintDelegate from "./specializedMintDelegate.hl";

export class CCRMintDelegate extends BasicMintDelegate {

    _m : HeliosModuleSrc 
    get specializedMintDelegate(): HeliosModuleSrc {
        if (this._m) return this._m

        return this._m = mkHeliosModule(CcrSpecialMintDelegate, "specializedMintDelegate");
    }
}