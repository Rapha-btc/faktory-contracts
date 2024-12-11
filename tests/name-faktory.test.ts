import {
  principalCV,
  stringAsciiCV,
  stringUtf8CV,
  uintCV,
} from "@stacks/transactions";
import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;

const contract = fs
  .readFileSync(path.resolve(__dirname, "../contracts/name-faktory.clar"))
  .toString();

const deployContract = () =>
  simnet.deployContract("fak", contract, { clarityVersion: 2 }, deployer);

describe("fungible token", () => {
  describe("on deployment", async () => {
    it("should print the contract data", () => {
      const { result } = deployContract();
      expect(result).toBeTuple({
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
      });
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
});
