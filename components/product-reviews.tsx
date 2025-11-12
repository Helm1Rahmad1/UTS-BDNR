"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Review {
  _id: string
  user: { name: string }
  rating: number
  comment: string
  createdAt: string
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?product=${productId}`)
      const data = await res.json()
      setReviews(data)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: productId,
          rating,
          comment,
        }),
      })

      if (res.ok) {
        setComment("")
        setRating(5)
        fetchReviews()
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return

    try {
      await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" })
      fetchReviews()
    } catch (error) {
      console.error("Error deleting review:", error)
    }
  }

  if (loading) {
    return <div>Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Reviews ({reviews.length})</h3>

      {/* Review Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Write a Review</h4>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setRating(r)} className="focus:outline-none">
                  <Star
                    className={`h-6 w-6 ${r <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Share your thoughts..."
            />
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to leave a review</p>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border border-border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{review.user.name}</p>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {session?.user?.id === review.user?.toString() && (
                <button onClick={() => handleDelete(review._id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(review.createdAt).toLocaleDateString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
