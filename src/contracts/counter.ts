import {
    assert,
    ByteString,
    hash256,
    method,
    prop,
    SigHash,
    SmartContract,
} from 'scrypt-ts'

export class Counter extends SmartContract {
    // Stateful prop to store counters value.
    @prop(true)
    count: bigint

    constructor(count: bigint) {
        super(...arguments)
        this.count = count
    }

    @method(SigHash.ANYONECANPAY_SINGLE)
    public incrementOnChain() {
        // Increment counter value
        this.increment()

        // make sure balance in the contract does not change
        const amount: bigint = this.ctx.utxo.value
        // output containing the latest state
        const output: ByteString = this.buildStateOutput(amount)
        // verify current tx has this single output
        assert(this.ctx.hashOutputs == hash256(output), 'hashOutputs mismatch')
    }

    @method()
    increment(): void {
        this.count++
    }

    incrementOffChain() {
        this.increment()
    }
}
