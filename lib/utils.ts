import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number): string {
  if (!date) return ""

  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text

  return text.substring(0, maxLength) + "..."
}

export function calculateAverageRating(ratings: number[]): number {
  if (!ratings.length) return 0

  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  return Number.parseFloat((sum / ratings.length).toFixed(1))
}
