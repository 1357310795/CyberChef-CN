/**
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";
import { MD_ALGORITHMS } from "../lib/RSA.mjs";

/**
 * RSA Verify operation
 */
class RSAVerify extends Operation {

    /**
     * RSAVerify constructor
     */
    constructor() {
        super();

        this.name = "RSA 签名验证";
        this.module = "Ciphers";
        this.description = "Verify a message against a signature and a public PEM encoded RSA key.";
        this.infoURL = "https://wikipedia.org/wiki/RSA_(cryptosystem)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "RSA Public Key (PEM)",
                type: "text",
                value: "-----BEGIN RSA PUBLIC KEY-----"
            },
            {
                name: "Message",
                type: "text",
                value: ""
            },
            {
                name: "Message Digest Algorithm",
                type: "option",
                value: Object.keys(MD_ALGORITHMS)
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [pemKey, message, mdAlgo] = args;
        if (pemKey.replace("-----BEGIN RSA PUBLIC KEY-----", "").length === 0) {
            throw new OperationError("Please enter a public key.");
        }
        try {
            // Load public key
            const pubKey = forge.pki.publicKeyFromPem(pemKey);
            // Generate message digest
            const md = MD_ALGORITHMS[mdAlgo].create();
            md.update(message, "utf8");
            // Compare signed message digest and generated message digest
            const result = pubKey.verify(md.digest().bytes(), input);
            return result ? "Verified OK" : "Verification Failure";
        } catch (err) {
            if (err.message === "Encrypted message length is invalid.") {
                throw new OperationError(`Signature length (${err.length}) does not match expected length based on key (${err.expected}).`);
            }
            throw new OperationError(err);
        }
    }

}

export default RSAVerify;
