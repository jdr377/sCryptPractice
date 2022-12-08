import { expect } from 'chai';
import { Counter } from '../../src/contracts/counterRaw';
import { num2bin, SigHashPreimage } from 'scrypt-ts';
import { dummyUTXO } from '../txHelper';


describe('Test SmartContract `Counter`', () => {

  before(async () => {
    await Counter.compile();
  })

  it('should pass the public method unit test successfully.', async () => {
    let counter = new Counter();

    const utxos = [dummyUTXO];

    // construct a transaction for deployment
    const deployTx = counter.getDeployTx(utxos, 1000);

    let prevTx = deployTx;
    let prevInstance = counter;

    // multiple calls    
    for (let i = 0; i < 3; i++) {
      // 1. build a new contract instance
      const newCounter = prevInstance.next();
      // 2. apply the updates on the new instance.
      newCounter.setDataPartInASM(num2bin(BigInt(i + 1), 1n))
      // 3. construct a transaction for contract call
      const callTx = prevInstance.getCallTx(prevTx, newCounter);
      // 4. run `verify` method on `prevInstance`
      const result = prevInstance.verify(self => {
        self.increment(new SigHashPreimage(callTx.getPreimage(0)), BigInt(callTx.getOutputAmount(0)));
      });

      expect(result.success, result.error).to.be.true;

      // prepare for the next iteration
      prevTx = callTx;
      prevInstance = newCounter;
    }
  });
})