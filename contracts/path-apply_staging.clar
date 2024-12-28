;; this is a mockup of the code that can be found here SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.path-apply_staging
(use-trait ft-trait .faktory-trait-v1.sip-010-trait)
(use-trait share-fee-to-trait .univ2-share-fee-to-trait.share-fee-to-trait)

(define-public
  (apply
   (path   (list 4 {a:(string-ascii 1),b:principal,c:uint,d:principal,e:principal,f:bool}))
   (amt-in uint)
   (token1         (optional <ft-trait>))
   (token2         (optional <ft-trait>))
   (token3         (optional <ft-trait>))
   (token4         (optional <ft-trait>))
   (token5         (optional <ft-trait>))
   (share-fee-to   (optional <share-fee-to-trait>))
   (univ2v2-pool-1 (optional uint))
   (univ2v2-pool-2 (optional uint))
   (univ2v2-pool-3 (optional uint))
   (univ2v2-pool-4 (optional uint))
   (univ2v2-fees-1 (optional uint))
   (univ2v2-fees-2 (optional uint))
   (univ2v2-fees-3 (optional uint))
   (univ2v2-fees-4 (optional uint))
   (curve-pool-1   (optional uint))
   (curve-pool-2   (optional uint))
   (curve-pool-3   (optional uint))
   (curve-pool-4   (optional uint))
   (curve-fees-1   (optional uint))
   (curve-fees-2   (optional uint))
   (curve-fees-3   (optional uint))
   (curve-fees-4   (optional uint))
   (ststx-pool-1   (optional uint))
   (ststx-pool-2   (optional uint))
   (ststx-pool-3   (optional uint))
   (ststx-pool-4   (optional uint))
   (ststx-proxy-1   (optional uint))
   (ststx-proxy-2   (optional uint))
   (ststx-proxy-3   (optional uint))
   (ststx-proxy-4   (optional uint)))
   ;; Either return err u0 or the success case
   (if (is-some token1)
       (ok {
           swap1: {amt-in: amt-in, amt-out: amt-in},
           swap2: {amt-in: amt-in, amt-out: amt-in},
           swap3: {amt-in: amt-in, amt-out: amt-in},
           swap4: {amt-in: amt-in, amt-out: amt-in}
       })
       (err u0)))