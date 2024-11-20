# faktory.fun DEX

A bonding curve DEX adapted optimized for faktory.fun implementation.

## Overview

This project contains bonding curve DEX contracts that enable:

- SIP-010 token trading via bonding curve
- Customizable configuration
- First Buy in by the contract owner

## Contract Architecture

Core contracts:

- `name-faktory-dex.clar`: Main bonding curve implementation with buy/sell functions
- `name-faktory.clar`: Token contract associated with the DEX

## Key Functions

```clarity
;; Core DEX trait
    ;; buy from the bonding curve dex
    (buy (<faktory-token> uint) (response bool uint))

    ;; sell from the bonding curve dex
    (sell (<faktory-token> uint) (response bool uint))

    ;; the status of the dex
    (get-open () (response bool uint))

    ;; data to inform a buy
    (get-in (uint) (response {
        stx-in: uint,
        fee: uint,
        tokens-out: uint,
        ft-balance: uint,
        new-ft: uint,
        total-stx: uint,
        new-stx: uint,
        stx-to-grad: uint
    } uint))

    ;; data to inform a sell
    (get-out (uint) (response {
        amount-in: uint,
        stx-out: uint,
        fee: uint,
        stx-to-receiver: uint,
        total-stx: uint,
        new-stx: uint,
        ft-balance: uint,
        new-ft: uint
    } uint))


# Run console
clarinet console
```

License
MIT License

+----------------------------------------------------------------+------------------------------------------------------------------------------------------------------+
| Contract identifier | Public functions |
+----------------------------------------------------------------+------------------------------------------------------------------------------------------------------+
| ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.faktory-dex-trait-v1 | |
+----------------------------------------------------------------+------------------------------------------------------------------------------------------------------+
| ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.faktory-trait-v1 | |
+----------------------------------------------------------------+------------------------------------------------------------------------------------------------------+
| ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-faktory | (get-balance (account principal)) |
| | (get-decimals) |
| | (get-name) |
| | (get-symbol) |
| | (get-token-uri) |
| | (get-total-supply) |
| | (send-many (recipients (list 200 (tuple (amount uint) (memo (optional (buff 34))) (to principal))))) |
| | (set-contract-owner (new-owner principal)) |
| | (set-token-uri (value (string-utf8 256))) |
| | (transfer |
| | (amount uint) |
| | (sender principal) |
| | (recipient principal) |
| | (memo (optional (buff 34)))) |
+----------------------------------------------------------------+------------------------------------------------------------------------------------------------------+
| ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-faktory-dex | (buy |
| | (ft <ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.faktory-trait-v1.sip-010-trait>) |
| | (ustx uint)) |
| | (get-in (ustx uint)) |
| | (get-open) |
| | (get-out (amount uint)) |
| | (sell |
| | (ft <ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.faktory-trait-v1.sip-010-trait>) |
| | (amount uint)) |
+----------------------------------------------------------------+------------------------------------------------------------------------------------------------------+
