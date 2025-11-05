/**
 * Convert Monday.com status color (hex) to Tailwind-compatible color classes
 * Monday.com provides hex colors like #579bfc, #fdab3d, etc.
 *
 * This is a client-side utility for mapping Monday.com colors to Tailwind classes
 */
export function getMondayColorClasses(mondayColor: string | null): string {
  if (!mondayColor) {
    return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
  }

  // Map Monday.com hex colors to similar Tailwind classes
  // Based on common Monday.com status colors
  const hexColorMap: Record<string, string> = {
    // Blue shades (First Concept, Revision 1)
    '#579bfc': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    '#007eb5': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    '#0086c0': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',

    // Orange shades (Working on it)
    '#fdab3d': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
    '#ff9000': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',

    // Gray shades (Assigned)
    '#c4c4c4': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
    '#808080': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',

    // Green shades (Done, Complete)
    '#00c875': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    '#9cd326': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    '#037f4c': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',

    // Red shades (Stuck, Critical)
    '#df2f4a': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
    '#e44258': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',

    // Purple/Pink shades (Revision 4+)
    '#e484bd': 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-700',
    '#a25ddc': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
    '#784bd1': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',

    // Yellow shades
    '#ffcb00': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    '#cab641': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  };

  // Return exact match or fallback to gray
  return hexColorMap[mondayColor.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
}
