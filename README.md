# faktory.fun DEX

A bonding curve DEX optimized for faktory.fun implementation.

## Overview

This project contains bonding curve DEX contracts that enable:

- SIP-010 token trading via bonding curve
- Customizable configuration
- First Buy in by the contract owner

## Contract Architecture

Core contracts:

- `name-faktory-dex.clar`: Main bonding curve DEX implementation with buy/sell functions
- `name-faktory.clar`: Token contract associated with the DEX

## Core DEX trait

```clarity
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
```

## Run console

```bash
clarinet console
```

## License

MIT License
