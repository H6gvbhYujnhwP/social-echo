"use client";

interface UsageCounterProps {
  usage: {
    posts_used: number;
    posts_allowance: number;
    posts_left: number;
    cycle_end: string;
    plan?: string;
  } | null;
}

export default function UsageCounter({ usage }: UsageCounterProps) {
  if (!usage) return null;

  const { posts_used, posts_allowance, posts_left, cycle_end, plan } = usage;
  
  // Hide usage counter for Ultimate plan (unlimited = 1000000)
  if (posts_allowance >= 1000000) return null;
  
  // Calculate percentage for visual indicator
  const percentage = (posts_used / posts_allowance) * 100;
  
  // Color coding based on usage
  const getColor = () => {
    if (percentage >= 100) return "text-red-600";
    if (percentage >= 80) return "text-orange-600";
    return "text-gray-600";
  };

  // Format cycle end date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Check if user is on free trial (don't show reset date)
  const isFreeTrial = plan === 'starter' || plan === 'free_trial';

  return (
    <div className="flex flex-col items-end gap-1">
      <div className={`text-sm font-medium ${getColor()}`}>
        Posts left: {posts_left} of {posts_allowance}
      </div>
      {!isFreeTrial && (
        <p className="text-xs text-gray-500">
          Resets on {formatDate(cycle_end)}
        </p>
      )}
    </div>
  );
}

