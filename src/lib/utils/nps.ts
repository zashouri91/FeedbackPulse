export function calculateNPS(ratings: number[]): number {
  if (ratings.length === 0) return 0;

  const promoters = ratings.filter(r => r >= 4).length;
  const detractors = ratings.filter(r => r <= 2).length;
  const total = ratings.length;

  return Math.round(((promoters - detractors) / total) * 100);
}

export function getNPSCategory(score: number): {
  label: string;
  color: string;
} {
  if (score >= 70) return { label: 'Excellent', color: 'text-green-500' };
  if (score >= 30) return { label: 'Good', color: 'text-blue-500' };
  if (score >= 0) return { label: 'Neutral', color: 'text-yellow-500' };
  return { label: 'Needs Improvement', color: 'text-red-500' };
}
