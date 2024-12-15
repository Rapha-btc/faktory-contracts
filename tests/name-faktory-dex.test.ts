import { ParsedTransactionResult } from "@hirosystems/clarinet-sdk";
import {
  falseCV,
  principalCV,
  stringAsciiCV,
  trueCV,
  tupleCV,
  uintCV,
} from "@stacks/transactions";
import exp from "constants";
import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const buyer = accounts.get("wallet_2")!;
const seller = accounts.get("wallet_5")!;

const deployer = accounts.get("deployer")!;
const token = `${deployer}.name-faktory`;
const dexContract = `${deployer}.name-faktory-dex`;
const amm = "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC";
const notToken = `${deployer}.not-name-faktory`;
const cantBeEvil = "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND";
const feeReceiver = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
const admin = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";
const targetAmount = 6_000_000_000;

const contract = fs
  .readFileSync(path.resolve(__dirname, "../contracts/name-faktory-dex.clar"))
  .toString();

const tokenContract = fs
  .readFileSync(path.resolve(__dirname, "../contracts/name-faktory.clar"))
  .toString();

const deployNotTokenContract = () =>
  simnet.deployContract(
    "not-name-faktory",
    tokenContract,
    { clarityVersion: 2 },
    deployer
  );

const deployContract = () =>
  simnet.deployContract(
    "fak-test-dex",
    contract,
    { clarityVersion: 2 },
    deployer
  );

const buy = (
  amount: number,
  caller: string = buyer
): ParsedTransactionResult => {
  const { result, events } = simnet.callPublicFn(
    "name-faktory-dex",
    "buy",
    [principalCV(token), uintCV(amount)],
    caller
  );

  return { result, events };
};

const sell = (
  amount: number,
  caller: string = seller
): ParsedTransactionResult => {
  const { result, events } = simnet.callPublicFn(
    "name-faktory-dex",
    "sell",
    [principalCV(token), uintCV(amount)],
    caller
  );
  return { result, events };
};

// Target amount + margin to account for fees
const finish = () => buy(targetAmount + 300_000_000);

describe("dex", () => {
  describe("on deployment", () => {
    it("should print the contract data", () => {
      const { events } = deployContract();
      expect(events[1].data.value).toStrictEqual(
        tupleCV({
          type: stringAsciiCV("faktory-dex-trait-v1"),
          dexContract: principalCV(`${deployer}.fak-test-dex`),
          ammReceiver: principalCV("ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC"),
        })
      );
    });

    it("should transfer 1 stx to the admin", () => {
      const { events } = deployContract();
      expect(events[0].event).toBe("stx_transfer_event");
      expect(events[0].data).toStrictEqual({
        amount: "1000000",
        memo: "",
        recipient: "ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB",
        sender: deployer,
      });
    });

    it("should initialize balances, rate and premium", () => {
      const fakStx = simnet.getDataVar("name-faktory-dex", "fak-ustx");
      const ftBalance = simnet.getDataVar("name-faktory-dex", "ft-balance");
      const stxBalance = simnet.getDataVar("name-faktory-dex", "stx-balance");
      const open = simnet.getDataVar("name-faktory-dex", "open");
      const burnRate = simnet.getDataVar("name-faktory-dex", "burn-rate");
      const devPremium = simnet.getDataVar("name-faktory-dex", "dev-premium");

      expect(fakStx).toBeUint(1200000000);
      expect(ftBalance).toBeUint(68961687931993);
      expect(stxBalance).toBeUint(666667);
      expect(open).toBeBool(true);
      expect(burnRate).toBeUint(20);
      expect(devPremium).toBeUint(10);
    });
  });

  describe("get-open", () => {
    it("should return the open status", () => {
      const { result } = simnet.callReadOnlyFn(
        "name-faktory-dex",
        "get-open",
        [],
        deployer
      );
      expect(result).toBeOk(trueCV());
      buy(targetAmount + 10_000_000_000);

      const { result: result2 } = simnet.callReadOnlyFn(
        "name-faktory-dex",
        "get-open",
        [],
        deployer
      );
      expect(result2).toBeOk(falseCV());
    });
  });

  describe("get-in", () => {
    /* Should be easy to test various cases and make sure the calculation is correct */
    it("should accurately calculate the theoretical new balances for a given stx buy", () => {
      const buyAmount = uintCV(10_000_000);
      const { result } = simnet.callReadOnlyFn(
        "name-faktory-dex",
        "get-in",
        [buyAmount],
        buyer
      );

      expect(result).toBeOk(
        tupleCV({
          "stx-in": uintCV(9_800_000),
          fee: uintCV(200_000),
          "tokens-out": uintCV(558317349960),
          "ft-balance": uintCV(68961687931993),
          "new-ft": uintCV(68403370582033),
          "total-stx": uintCV(666667),
          "new-stx": uintCV(10466667),
          "stx-to-grad": uintCV(6179313332),
        })
      );
    });
  });

  describe("get-out", () => {
    it("should accurately calculate the theoretical new balances for a given ft sell", () => {
      buy(targetAmount / 2);

      const sellAmount = uintCV(10_000_000);
      const { result } = simnet.callReadOnlyFn(
        "name-faktory-dex",
        "get-out",
        [sellAmount],
        buyer
      );

      expect(result).toBeOk(
        tupleCV({
          "amount-in": uintCV(10000000),
          fee: uintCV(41),
          "ft-balance": uintCV(19996779905007),
          "new-ft": uintCV(19996789905007),
          "new-stx": uintCV(2940664597),
          "stx-out": uintCV(2070),
          "stx-to-receiver": uintCV(2029),
          "total-stx": uintCV(2940666667),
        })
      );
    });
  });

  describe("buy", () => {
    it("should only allow buying the given dex token", () => {
      deployNotTokenContract();
      const { result } = simnet.callPublicFn(
        "name-faktory-dex",
        "buy",
        [principalCV(notToken), uintCV(10000)],
        buyer
      );

      expect(result).toBeErr(uintCV(401));
    });

    it("should not allow buying when the dex is closed", () => {
      buy(targetAmount + 10_000_000_000);
      const { result } = buy(10000);
      expect(result).toBeErr(uintCV(1001));
    });

    it("should not allow buying 0 ustx", () => {
      const { result } = buy(0);
      expect(result).toBeErr(uintCV(1002));
    });

    it("should transfer ustx to the fee receiver and to the contract, and transfer the ft back to the sender on call", () => {
      const { events } = buy(10_000_000);
      expect(events[0].event).toBe("stx_transfer_event");
      expect(events[0].data).toStrictEqual({
        amount: "200000",
        memo: "",
        recipient: feeReceiver,
        sender: buyer,
      });

      expect(events[1].event).toBe("stx_transfer_event");
      expect(events[1].data).toStrictEqual({
        amount: "9800000",
        memo: "",
        recipient: dexContract,
        sender: buyer,
      });

      expect(events[2].event).toBe("ft_transfer_event");
      expect(events[2].data).toStrictEqual({
        amount: "558317349960",
        asset_identifier: `${token}::fak`,
        recipient: buyer,
        sender: dexContract,
      });
    });

    it("should print the new balances", () => {
      const { events } = buy(10_000_000);
      expect(events[3].data).toMatchInlineSnapshot(`
        {
          "contract_identifier": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-faktory-dex",
          "raw_value": "0x0c00000005036665650100000000000000000000000000030d400a66742d62616c616e636501000000000000000000003e36669ae011046f70656e030b7374782d62616c616e636501000000000000000000000000009fb56b0a746f6b656e732d6f757401000000000000000000000081fe4eac48",
          "topic": "print",
          "value": {
            "data": {
              "fee": {
                "type": 1,
                "value": 200000n,
              },
              "ft-balance": {
                "type": 1,
                "value": 68403370582033n,
              },
              "open": {
                "type": 3,
              },
              "stx-balance": {
                "type": 1,
                "value": 10466667n,
              },
              "tokens-out": {
                "type": 1,
                "value": 558317349960n,
              },
            },
            "type": 12,
          },
        }
      `);
    });

    it("should update the balances correctly", () => {
      buy(10_000_000);
      const ftBalance = simnet.getDataVar("name-faktory-dex", "ft-balance");
      const stxBalance = simnet.getDataVar("name-faktory-dex", "stx-balance");

      expect(ftBalance).toBeUint(68403370582033);
      expect(stxBalance).toBeUint(10466667);
    });

    describe("when the target amount is reached", () => {
      it("should close the dex", () => {
        finish();
        const { result } = buy(10_000_000);
        expect(result).toBeErr(uintCV(1001));
      });

      it("should burn a percentage of the ft", () => {
        const { events } = finish();
        const burnEvent = events[3];
        expect(burnEvent.event).toBe("ft_transfer_event");
        expect(burnEvent.data).toStrictEqual({
          amount: "2020972699240",
          asset_identifier: `${token}::fak`,
          recipient: cantBeEvil,
          sender: dexContract,
        });
      });

      it("should send a percentage of the ft to the dev", () => {
        const { events } = finish();
        const devFee = events[4];
        expect(devFee.event).toBe("ft_transfer_event");
        expect(devFee.data).toStrictEqual({
          amount: "224552522137",
          asset_identifier: `${token}::fak`,
          recipient: deployer,
          sender: dexContract,
        });
      });

      it("should send a the remaining ft to the amm", () => {
        const { events } = finish();
        const ammTransfer = events[5];
        expect(ammTransfer.event).toBe("ft_transfer_event");
        expect(ammTransfer.data).toStrictEqual({
          amount: "8982100885510",
          asset_identifier: `${token}::fak`,
          recipient: amm,
          sender: dexContract,
        });
      });

      it("should send ustx to the amm", () => {
        const { events } = finish();
        const ammTransfer = events[6];
        expect(ammTransfer.event).toBe("stx_transfer_event");
        expect(ammTransfer.data).toStrictEqual({
          amount: "6054666667",
          memo: "",
          recipient: amm,
          sender: dexContract,
        });
      });

      it("should send ustx to the amm", () => {
        const { events } = finish();
        const adminTransfer = events[7];
        expect(adminTransfer.event).toBe("stx_transfer_event");
        expect(adminTransfer.data).toStrictEqual({
          amount: "120000000",
          memo: "",
          recipient: admin,
          sender: dexContract,
        });
      });

      it("should print the corresponding data", () => {
        const { events } = finish();
        const printEvent = events[8];
        expect(printEvent.data).toMatchInlineSnapshot(`
          {
            "contract_identifier": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-faktory-dex",
            "raw_value": "0x0c000000090a616d6d2d616d6f756e740100000000000000000000082b4eeec00608616d6d2d757374780100000000000000000000000168e2e1ab0b6275726e2d616d6f756e74010000000000000000000001d68b5c1e68036665650100000000000000000000000007829b800a66742d62616c616e6365010000000000000000000000000000000008677261642d6665650100000000000000000000000007270e00046f70656e040b7374782d62616c616e636501000000000000000000000000000000000a746f6b656e732d6f757401000000000000000000003482423f1c52",
            "topic": "print",
            "value": {
              "data": {
                "amm-amount": {
                  "type": 1,
                  "value": 8982100885510n,
                },
                "amm-ustx": {
                  "type": 1,
                  "value": 6054666667n,
                },
                "burn-amount": {
                  "type": 1,
                  "value": 2020972699240n,
                },
                "fee": {
                  "type": 1,
                  "value": 126000000n,
                },
                "ft-balance": {
                  "type": 1,
                  "value": 0n,
                },
                "grad-fee": {
                  "type": 1,
                  "value": 120000000n,
                },
                "open": {
                  "type": 4,
                },
                "stx-balance": {
                  "type": 1,
                  "value": 0n,
                },
                "tokens-out": {
                  "type": 1,
                  "value": 57734061825106n,
                },
              },
              "type": 12,
            },
          }
        `);
      });
    });
  });

  describe("sell", () => {
    it("should only allow selling the given dex token", () => {
      deployNotTokenContract();
      const { result } = simnet.callPublicFn(
        "name-faktory-dex",
        "sell",
        [principalCV(notToken), uintCV(10000)],
        buyer
      );

      expect(result).toBeErr(uintCV(401));
    });

    it("should only allow selling if the dex is open", () => {
      finish();
      const { result } = sell(10000);
      expect(result).toBeErr(uintCV(1001));
    });

    it("should not allow selling 0 ft", () => {
      const { result } = sell(0);
      expect(result).toBeErr(uintCV(1004));
    });

    // Trying to trigger a ERR-STX-BALANCE-TOO-LOW error, but I can't figure out how
    it.skip("should not allow selling if there is no stx balance available", () => {
      buy(100_000_000, buyer);
      buy(10_000_000, seller);
      sell(5_203_987_743_019, buyer);
      const { result } = sell(56_241_535_911, seller);

      expect(result).toBeErr(uintCV(1003));
    });

    it("should allow selling your ft tokens back to the dex", () => {
      buy(10_000_000, seller);
      const { result } = sell(56_241_535_911, seller);
      expect(result).toBeOk(trueCV());
    });

    it("should transfer the corresponding ft back to the dex", () => {
      buy(10_000_000, seller);
      const { events } = sell(56_241_535_911, seller);
      const ftTransfer = events[0];
      expect(ftTransfer.event).toBe("ft_transfer_event");
      expect(ftTransfer.data).toStrictEqual({
        amount: "56241535911",
        asset_identifier: `${token}::fak`,
        recipient: dexContract,
        sender: seller,
      });
    });

    it("should transfer stx to the seller", () => {
      buy(10_000_000, seller);
      const { events } = sell(56_241_535_911, seller);
      const ftTransfer = events[1];
      expect(ftTransfer.event).toBe("stx_transfer_event");
      expect(ftTransfer.data).toStrictEqual({
        amount: "974545",
        memo: "",
        recipient: seller,
        sender: dexContract,
      });
    });

    it("should transfer a fee to the admin", () => {
      buy(10_000_000, seller);
      const { events } = sell(56_241_535_911, seller);
      const feeTransfer = events[2];
      expect(feeTransfer.event).toBe("stx_transfer_event");
      expect(feeTransfer.data).toStrictEqual({
        amount: "19888",
        memo: "",
        recipient: feeReceiver,
        sender: dexContract,
      });
    });

    it("should update the balances after a sell", () => {
      buy(10_000_000, seller);
      const stxBalance = simnet.getDataVar("name-faktory-dex", "stx-balance");
      const ftBalance = simnet.getDataVar("name-faktory-dex", "ft-balance");

      expect(stxBalance).toBeUint(10_466_667);
      expect(ftBalance).toBeUint(68_403_370_582_033);

      sell(56_241_535_911, seller);

      const stxBalanceAfter = simnet.getDataVar(
        "name-faktory-dex",
        "stx-balance"
      );
      const ftBalanceAfter = simnet.getDataVar(
        "name-faktory-dex",
        "ft-balance"
      );
      expect(stxBalanceAfter).toBeUint(9_472_234);
      expect(ftBalanceAfter).toBeUint(68_459_612_117_944);
    });

    it("should print the new balances after a sell", () => {
      buy(10_000_000, seller);
      const { events } = sell(56_241_535_911, seller);
      expect(events[3].data).toMatchInlineSnapshot(`
        {
          "contract_identifier": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-faktory-dex",
          "raw_value": "0x0c00000005036665650100000000000000000000000000004db00a66742d62616c616e636501000000000000000000003e437edc9bb8046f70656e030b7374782d62616c616e636501000000000000000000000000009088ea0f7374782d746f2d726563656976657201000000000000000000000000000eded1",
          "topic": "print",
          "value": {
            "data": {
              "fee": {
                "type": 1,
                "value": 19888n,
              },
              "ft-balance": {
                "type": 1,
                "value": 68459612117944n,
              },
              "open": {
                "type": 3,
              },
              "stx-balance": {
                "type": 1,
                "value": 9472234n,
              },
              "stx-to-receiver": {
                "type": 1,
                "value": 974545n,
              },
            },
            "type": 12,
          },
        }
      `);
    });
  });
});
