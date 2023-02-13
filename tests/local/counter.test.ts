import { expect } from 'chai'
import { Counter } from '../../src/contracts/counter'
import { dummySigner, getDummyContractUTXO } from './util/txHelper'
import { MethodCallOptions } from 'scrypt-ts'

describe('Test SmartContract `Counter`', () => {
    const balance = 1

    before(async () => {
        await Counter.compile()
    })

    it('should pass the public method unit test successfully.', async () => {
        const counter = new Counter(0n)
        await counter.connect(dummySigner())

        // set current instance to be the deployed one
        let currentInstance = counter

        // call the method of current instance to apply the updates on chain
        for (let i = 0; i < 3; ++i) {
            // create the next instance from the current
            const nextInstance = currentInstance.next()

            // apply updates on the next instance off chain
            nextInstance.incrementOffChain()

            // call the method of current instance to apply the updates on chain
            const { tx: tx_i, atInputIndex } =
                await currentInstance.methods.incrementOnChain({
                    fromUTXO: getDummyContractUTXO(balance),
                    next: {
                        instance: nextInstance,
                        balance,
                    },
                } as MethodCallOptions<Counter>)

            const result = tx_i.verifyInputScript(atInputIndex)
            expect(result.success, result.error).to.eq(true)

            // update the current instance reference
            currentInstance = nextInstance
        }
    })
})
