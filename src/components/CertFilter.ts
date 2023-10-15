import React, { Component } from "react"

const knownCertTypes = [
    "humanity",
    "fact",
    "identity",
    "role",
    "skill",
    "other",
] as const
type certType = typeof knownCertTypes

type myProps = {}

type myState = {
    certType: certType,

}

export class CertFilter extends Component<myProps, myState> {}
