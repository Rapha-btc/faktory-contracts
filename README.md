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
