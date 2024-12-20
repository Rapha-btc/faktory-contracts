;; 1) assume bonding curves implement a trait which exposes (buy stx-amount)
;; function
;; 2) user inputs toke he wishes to buy with (and amount)
;; 3) call velar sdk, get route & min out amount
;; 4) call proxy/buy
(use-trait faktory-dex .faktory-dex-trait-v1.dex-trait)
(use-trait faktory-token .faktory-trait-v1.sip-010-trait)

(define-public ;; velar args - all of these come from sdk



  (buy 
   (path           (list 4 {a:(string-ascii 1),b:principal,c:uint,d:principal,e:principal,f:bool})) 
   (amt-in         uint)
   (amt-out-min    uint) ;;always stx
   (token1         (optional <ft-trait>))
   (token2         (optional <ft-trait>))
   (token3         (optional <ft-trait>))
   (token4         (optional <ft-trait>))
   (token5         (optional <ft-trait>))
   (share-fee-to   (optional <share-fee-to-trait>))
   (univ2v2-pool-1 (optional <univ2v2-pool-trait>))
   (univ2v2-pool-2 (optional <univ2v2-pool-trait>))
   (univ2v2-pool-3 (optional <univ2v2-pool-trait>))
   (univ2v2-pool-4 (optional <univ2v2-pool-trait>))
   (univ2v2-fees-1 (optional <univ2v2-fees-trait>))
   (univ2v2-fees-2 (optional <univ2v2-fees-trait>))
   (univ2v2-fees-3 (optional <univ2v2-fees-trait>))
   (univ2v2-fees-4 (optional <univ2v2-fees-trait>))
   (curve-pool-1   (optional <curve-pool-trait>))
   (curve-pool-2   (optional <curve-pool-trait>))
   (curve-pool-3   (optional <curve-pool-trait>))
   (curve-pool-4   (optional <curve-pool-trait>))
   (curve-fees-1   (optional <curve-fees-trait>))
   (curve-fees-2   (optional <curve-fees-trait>))
   (curve-fees-3   (optional <curve-fees-trait>))
   (curve-fees-4   (optional <curve-fees-trait>))
   (ststx-pool-1   (optional <ststx-pool-trait>))
   (ststx-pool-2   (optional <ststx-pool-trait>))
   (ststx-pool-3   (optional <ststx-pool-trait>))
   (ststx-pool-4   (optional <ststx-pool-trait>))
   (ststx-proxy-1  (optional <ststx-proxy-trait>))
   (ststx-proxy-2  (optional <ststx-proxy-trait>))
   (ststx-proxy-3  (optional <ststx-proxy-trait>))
   (ststx-proxy-4  (optional <ststx-proxy-trait>))

   ;; args
   (dex <faktory-dex>)
   (ft <faktory-token>) 
   )
  (begin

   ;; we know this will result in the user receiving >= amt-out-min stx
   (try!
    (contract-call?
     .path-apply apply
     path
     amt-in
     token1 token2 token3 token4 token5
     share-fee-to
     univ2-pool-1 univ2-pool-2 univ2-pool-3 univ2-pool-4
     univ2-fees-1 univ2-fees-2 univ2-fees-3 univ2-fees-4
     curve-pool-1 curve-pool-2 curve-pool-3 curve-pool-4
     curve-fees-1 curve-fees-2 curve-fees-3 curve-fees-4
     ststx-pool-1 ststx-pool-2 ststx-pool-3 ststx-pool-4
     ststx-proxy-1 ststx-proxy-2 ststx-proxy-3 ststx-proxy-4
     ))

   ;; obv can do various asserts etc here

   ;; always in stx
   (try!
    (contract-call?
     dex
     buy
     ft
     ustx))

   ))

;;; eof
