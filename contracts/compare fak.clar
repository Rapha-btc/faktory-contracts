;; Faktory DOT Fun 
;; @version 1.0
;; @hash 

;; Errors 
(define-constant ERR-UNAUTHORIZED u401)
(define-constant ERR-NOT-OWNER u402)

(impl-trait .sip-010-trait-ft-standard.sip-010-trait) ;;'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.

;; Constants
(define-constant MAXSUPPLY u1000000000000000) ;; 1B ~ 15 zeros

;; Variables
(define-fungible-token fak MAXSUPPLY)
(define-data-var contract-owner principal tx-sender) 


;; SIP-10 Functions
(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq from tx-sender) (err ERR-UNAUTHORIZED))
        (ft-transfer? fak amount from to)
    )
)

;; DEFINE METADATA
(define-data-var token-uri (optional (string-utf8 256)) (some u""))

(define-public (set-token-uri (value (string-utf8 256)))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-UNAUTHORIZED))
        (var-set token-uri (some value))
        (ok (print {
              notification: "token-metadata-update",
              payload: {
                contract-id: (as-contract tx-sender),
                token-class: "ft"
              }
            })
        )
    )
)

(define-read-only (get-balance (owner principal))
  (ok (ft-get-balance fak owner))
)

(define-read-only (get-name)
  (ok "Fak")
)

(define-read-only (get-symbol)
  (ok "fak")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply fak))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; transfer ownership
(define-public (transfer-ownership (new-owner principal))
  (begin
    ;; Checks if the sender is the current owner
    (if (is-eq tx-sender (var-get contract-owner))
      (begin
        ;; Sets the new owner
        (var-set contract-owner new-owner)
        ;; Returns success message
        (ok "Ownership transferred successfully"))
      ;; Error if the sender is not the owner
      (err ERR-NOT-OWNER)))
)


;; ---------------------------------------------------------
;; Utility Functions
;; ---------------------------------------------------------
(define-public (send-many (recipients (list 200 { to: principal, amount: uint, memo: (optional (buff 34)) })))
  (fold check-err (map send-token recipients) (ok true))
)

(define-private (check-err (result (response bool uint)) (prior (response bool uint)))
  (match prior ok-value result err-value (err err-value))
)

(define-private (send-token (recipient { to: principal, amount: uint, memo: (optional (buff 34)) }))
  (send-token-with-memo (get amount recipient) (get to recipient) (get memo recipient))
)

(define-private (send-token-with-memo (amount uint) (to principal) (memo (optional (buff 34))))
  (let ((transferOk (try! (transfer amount tx-sender to memo))))
    (ok transferOk)
  )
)

;; ---------------------------------------------------------
;; Mint
;; ---------------------------------------------------------
(define-private (send-stx (recipient principal) (amount uint))
  (begin
    (try! (stx-transfer? amount tx-sender recipient))
    (ok true) 
  )
)

(begin
    (try! (send-stx 'STV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RJ5XDY2 u1000000)) ;; costs 1 STX to deploy token
    (try! (ft-mint? fak u930521091811414 .fak-dex)) ;; 93.1% to dex
    
    (try! (ft-mint? fak u69478908188586 'ST1G655MB1JVQ5FBE2JJ3E01HEA6KBM4H394VWAD6)) ;;First buy: 6.9% to deployer
    (try! (send-stx .fak-dex u74666667)) ;; 74.67 STX to dex

    (try! (send-stx 'SP1WTA0YBPC5R6GDMPPJCEDEA6Z2ZEPNMQ4C39W6M u37333333)) ;; First buy premium: 50% 
 
)