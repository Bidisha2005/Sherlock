/* src/styles/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .container {
    @apply max-w-7xl mx-auto;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .card-title {
    @apply text-lg font-semibold text-gray-900 mb-4;
  }
  
  .stat-value {
    @apply text-2xl font-bold text-gray-900;
  }
  
  .stat-label {
    @apply text-sm text-gray-500;
  }
}

@layer utilities {
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
}