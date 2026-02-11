export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="8" r="6"></circle>
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18.06"></path>
      <path d="M9 14.29V22l3-3 3 3V14.29"></path>
      <path d="M15.31 6.74A6 6 0 0 1 17.26 13"></path>
      <path d="m19 12 1 6-2-2-2 2 1-6"></path>
    </svg>
  )
}
