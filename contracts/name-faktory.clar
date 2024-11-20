;; fak Powered By Faktory.fun
;; v1.0 hash 363acbe80e3698b90cd0500fd8c64c56ec3d2caa674483aeb86d8772e8cf6fe3

(impl-trait .sip-010-trait-ft-standard.sip-010-trait) ;;'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE

(define-constant ERR-NOT-AUTHORIZED u401)
(define-constant ERR-NOT-OWNER u402)

(define-fungible-token fak MAX)
(define-constant MAX u69000000000000)
(define-data-var contract-owner principal tx-sender) 
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://szigdtxfspmofhxoytra.supabase.co/storage/v1/object/public/uri/c7qwl5oz-metadata.json"))

;; SIP-10 Functions
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
       (asserts! (is-eq tx-sender sender) (err ERR-NOT-AUTHORIZED))
        (ft-transfer? fak amount sender recipient)
    )
)

(define-public (set-token-uri (value (string-utf8 256)))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
        (var-set token-uri (some value))
        (print {
              notification: "uri-update",
              contract-id: (as-contract tx-sender),
              token-uri: value})
        (ok true)
    )
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance fak account))
)

(define-read-only (get-name)
  (ok "fak dot fun")
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

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (print {new-owner: new-owner})
    (ok (var-set contract-owner new-owner))
  )
)

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

;; Burn cant-be-evil.stx

;; ---------------------------------------------------------

(define-private (stx-transfer-to (recipient principal) (amount uint))
  (begin
    (try! (stx-transfer? amount tx-sender recipient))
    (ok true) 
  )
)

(begin 
    ;; ft distribution (first buy)
    (try! (ft-mint? fak u68961687931993 .name-faktory-dex)) ;; supply-left (putting full address better?)
    (try! (ft-mint? fak u38312068007 tx-sender)) ;; ft-amount-bought (putting full address better?)

    
    ;; STX distribution (first buy premium fee)
    (try! (stx-transfer-to .name-faktory-dex u666667)) ;; stx-in-dex (putting full address better?)
    (try! (stx-transfer-to 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ u333333)) ;; premium-first-buy / SP37Y7SH0KBPCVMYQNZWCA0AQJ4CD2K6YTWX2QEWD
  

    ;; deploy fixed fee
    (try! (stx-transfer-to 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP u1000000)) ;; SP37Y7SH0KBPCVMYQNZWCA0AQJ4CD2K6YTWX2QEWD
)