import {
  bufferCVFromString,
  listCV,
  noneCV,
  principalCV,
  someCV,
  stringAsciiCV,
  stringUtf8CV,
  trueCV,
  tupleCV,
  uintCV,
} from "@stacks/transactions";
import {
  generateNewAccount,
  generateSecretKey,
  generateWallet,
  getStxAddress,
} from "@stacks/wallet-sdk";
import fs from "fs";
import _ from "lodash";
import path from "path";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const account1 = accounts.get("wallet_1")!;

const contract = fs
  .readFileSync(path.resolve(__dirname, "../contracts/name-faktory.clar"))
  .toString();

const deployContract = () =>
  simnet.deployContract("fak", contract, { clarityVersion: 2 }, deployer);

describe("fungible token", () => {
  describe("on deployment", async () => {
    it("should print the contract data", () => {
      const { result } = deployContract();
      expect(result).toStrictEqual(
        tupleCV({
          type: stringAsciiCV("faktory-trait-v1"),
          name: stringAsciiCV("name"),
          symbol: stringAsciiCV("fak"),
          ["token-uri"]: stringUtf8CV(
            "https://szigdtxfspmofhxoytra.supabase.co/storage/v1/object/public/uri/c7qwl5oz-metadata.json"
          ),
          tokenContract: principalCV(`${deployer}.fak`),
          supply: uintCV(69000000000000),
          targetStx: uintCV(6000),
          tokenToDex: uintCV(68961687931993),
          tokenToDeployer: uintCV(38312068007),
          stxToDex: uintCV(666667),
          stxBuyFirstFee: uintCV(333333),
          hash: stringAsciiCV(
            "363acbe80e3698b90cd0500fd8c64c56ec3d2caa674483aeb86d8772e8cf6fe3"
          ),
        })
      );
    });

    it("should mint a small part of the supply to the deployer", () => {
      const { events } = deployContract();
      expect(events[0]).toMatchInlineSnapshot(`
        {
          "data": {
            "amount": "38312068007",
            "asset_identifier": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fak::fak",
            "recipient": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          },
          "event": "ft_mint_event",
        }
      `);
    });

    it("should mint the remainder of the supply to the corresponding dex", () => {
      const { events } = deployContract();
      expect(events[1]).toMatchInlineSnapshot(`
        {
          "data": {
            "amount": "68961687931993",
            "asset_identifier": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fak::fak",
            "recipient": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-faktory-dex",
          },
          "event": "ft_mint_event",
        }
      `);
    });

    it("should transfer 33% of the first buy stx fee to the dex", () => {
      const { events } = deployContract();
      expect(events[2]).toMatchInlineSnapshot(`
        {
          "data": {
            "amount": "666667",
            "memo": "",
            "recipient": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-faktory-dex",
            "sender": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          },
          "event": "stx_transfer_event",
        }
      `);
    });

    it("should transfer 66% of the first buy stx fee to the protocol", () => {
      const { events } = deployContract();
      expect(events[3]).toMatchInlineSnapshot(`
        {
          "data": {
            "amount": "333333",
            "memo": "",
            "recipient": "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ",
            "sender": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          },
          "event": "stx_transfer_event",
        }
      `);
    });

    it("should transfer the fixed 1 stx fee to the protocol admin", () => {
      const { events } = deployContract();
      expect(events[4]).toMatchInlineSnapshot(`
        {
          "data": {
            "amount": "1000000",
            "memo": "",
            "recipient": "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP",
            "sender": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
          },
          "event": "stx_transfer_event",
        }
      `);
    });
  });

  describe("send-many", async () => {
    const password = "password";
    const secretKey = generateSecretKey();

    let wallet = await generateWallet({
      secretKey,
      password,
    });

    _.range(199).forEach(() => {
      // Generating 199 accounts + the original to test the send many
      wallet = generateNewAccount(wallet);
    });

    it("should send the token from a sender to many recipients", () => {
      const amount = 1000;
      const { result, events } = simnet.callPublicFn(
        "name-faktory",
        "send-many",
        [
          listCV(
            wallet.accounts.map((account) =>
              tupleCV({
                to: principalCV(getStxAddress({ account, network: "testnet" })),
                amount: uintCV(amount),
                memo: noneCV(),
              })
            )
          ),
        ],
        deployer
      );

      expect(result).toBeOk(trueCV());
      expect(events.length).toBe(200);
    });
  });

  describe("get-token-uri", () => {
    it("shoulr return the token-uri", () => {
      const { result } = simnet.callReadOnlyFn(
        "name-faktory",
        "get-token-uri",
        [],
        deployer
      );

      expect(result).toBeOk(
        someCV(
          stringUtf8CV(
            "https://szigdtxfspmofhxoytra.supabase.co/storage/v1/object/public/uri/c7qwl5oz-metadata.json"
          )
        )
      );
    });
  });

  describe("get-total-supply", () => {
    it("should return the total supply", () => {
      const { result } = simnet.callReadOnlyFn(
        "name-faktory",
        "get-total-supply",
        [],
        deployer
      );

      expect(result).toBeOk(uintCV(69000000000000));
    });
  });

  describe("get-decimals", () => {
    it("should return the decimals", () => {
      const { result } = simnet.callReadOnlyFn(
        "name-faktory",
        "get-decimals",
        [],
        deployer
      );

      expect(result).toBeOk(uintCV(6));
    });
  });

  describe("get-symbol", () => {
    it("should return the symbol", () => {
      const { result } = simnet.callReadOnlyFn(
        "name-faktory",
        "get-symbol",
        [],
        deployer
      );

      expect(result).toBeOk(stringAsciiCV("fak"));
    });
  });

  describe("get-name", () => {
    it("should return the name", () => {
      const { result } = simnet.callReadOnlyFn(
        "name-faktory",
        "get-name",
        [],
        deployer
      );

      expect(result).toBeOk(stringAsciiCV("fak dot fun"));
    });
  });

  describe("get-balance", () => {
    it("should return the balance of a given account", () => {
      const { result } = simnet.callReadOnlyFn(
        "name-faktory",
        "get-balance",
        [principalCV(deployer)],
        deployer
      );
      expect(result).toBeOk(uintCV(38_312_068_007));

      simnet.callPublicFn(
        "name-faktory",
        "transfer",
        [
          uintCV(1_000_000),
          principalCV(deployer),
          principalCV(account1),
          someCV(bufferCVFromString("memo")),
        ],
        deployer
      );

      const { result: result2 } = simnet.callReadOnlyFn(
        "name-faktory",
        "get-balance",
        [principalCV(deployer)],
        deployer
      );
      expect(result2).toBeOk(uintCV(38_311_068_007));
    });
  });

  describe("set-token-uri", () => {
    it("should only allow the contract owner", () => {
      const { result } = simnet.callPublicFn(
        "name-faktory",
        "set-token-uri",
        [stringUtf8CV("new-uri")],
        account1
      );

      expect(result).toBeErr(uintCV(401));
    });

    it("should set a new token uri when called", () => {
      expect(simnet.getDataVar("name-faktory", "token-uri")).toBeSome(
        stringUtf8CV(
          "https://szigdtxfspmofhxoytra.supabase.co/storage/v1/object/public/uri/c7qwl5oz-metadata.json"
        )
      );
      const { result } = simnet.callPublicFn(
        "name-faktory",
        "set-token-uri",
        [stringUtf8CV("https://new.domain/metadata.json")],
        deployer
      );

      expect(result).toBeOk(trueCV());

      expect(simnet.getDataVar("name-faktory", "token-uri")).toBeSome(
        stringUtf8CV("https://new.domain/metadata.json")
      );
    });
  });

  describe("set-contract-owner", () => {
    it("should only allow the contract owner", () => {
      const { result } = simnet.callPublicFn(
        "name-faktory",
        "set-contract-owner",
        [principalCV(account1)],
        account1
      );

      expect(result).toBeErr(uintCV(401));
    });

    it("should set a new owner when called", () => {
      const { result } = simnet.callPublicFn(
        "name-faktory",
        "set-contract-owner",
        [principalCV(account1)],
        deployer
      );

      expect(result).toBeOk(trueCV());

      expect(simnet.getDataVar("name-faktory", "contract-owner")).toBePrincipal(
        account1
      );
    });
  });

  describe("transfer", () => {
    it("should not allow the transfer if sender is not the caller", () => {
      const { result } = simnet.callPublicFn(
        "name-faktory",
        "transfer",
        [
          uintCV(1_000_000),
          principalCV(deployer),
          principalCV(account1),
          someCV(bufferCVFromString("memo")),
        ],
        account1
      );

      expect(result).toBeErr(uintCV(401));
    });

    it("should transfer tokens from one account to another", () => {
      const { result } = simnet.callPublicFn(
        "name-faktory",
        "transfer",
        [
          uintCV(1_000_000),
          principalCV(deployer),
          principalCV(account1),
          someCV(bufferCVFromString("memo")),
        ],
        deployer
      );

      expect(result).toBeOk(trueCV());
    });
  });
});
