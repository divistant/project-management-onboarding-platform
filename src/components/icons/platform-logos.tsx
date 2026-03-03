import type { SVGProps } from "react";

export function GitLabLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M190.4 350.8L253.3 157.2H127.5L190.4 350.8Z" fill="#E24329" />
      <path d="M190.4 350.8L127.5 157.2H30.6L190.4 350.8Z" fill="#FC6D26" />
      <path d="M30.6 157.2L10.5 218.9C8.7 224.4 10.5 230.5 15.2 234.0L190.4 350.8L30.6 157.2Z" fill="#FCA326" />
      <path d="M30.6 157.2H127.5L85.5 28.0C83.5 22.1 75.1 22.1 73.1 28.0L30.6 157.2Z" fill="#E24329" />
      <path d="M190.4 350.8L253.3 157.2H350.2L190.4 350.8Z" fill="#FC6D26" />
      <path d="M350.2 157.2L370.3 218.9C372.1 224.4 370.3 230.5 365.6 234.0L190.4 350.8L350.2 157.2Z" fill="#FCA326" />
      <path d="M350.2 157.2H253.3L295.3 28.0C297.3 22.1 305.7 22.1 307.7 28.0L350.2 157.2Z" fill="#E24329" />
    </svg>
  );
}

export function JiraLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="jira-a" x1="51%" y1="8%" x2="29%" y2="54%">
          <stop offset="18%" stopColor="#0052CC" />
          <stop offset="100%" stopColor="#2684FF" />
        </linearGradient>
        <linearGradient id="jira-b" x1="43%" y1="97%" x2="66%" y2="44%">
          <stop offset="18%" stopColor="#0052CC" />
          <stop offset="100%" stopColor="#2684FF" />
        </linearGradient>
      </defs>
      <path d="M244.658 0H121.707a55.502 55.502 0 0 0 55.502 55.502h22.649V77.37c.02 30.625 24.841 55.447 55.466 55.502V11.334C255.324 5.076 250.248 0 243.99 0h.668Z" fill="#2684FF" />
      <path d="M183.822 61.262H60.872c.019 30.625 24.84 55.447 55.466 55.502h22.648v21.868c.02 30.597 24.798 55.426 55.394 55.502V72.596c0-6.258-5.076-11.334-11.334-11.334h.776Z" fill="url(#jira-a)" />
      <path d="M122.951 122.489H0c0 30.653 24.85 55.502 55.502 55.502h22.72v21.904c.02 30.597 24.798 55.426 55.394 55.502V133.823c0-6.258-5.076-11.334-11.334-11.334h.669Z" fill="url(#jira-b)" />
    </svg>
  );
}

export function AzureDevOpsLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="ado-grad" x1="7.5" y1="1" x2="7.5" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0078D4" />
          <stop offset="1" stopColor="#5EA0EF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ado-grad)"
        d="M15 3.622v8.512L11.5 15l-5.425-1.975v1.958L3.004 10.97l8.951.7V4.005L15 3.622zm-2.984.428L6.994 1v2.001L2.382 4.356 1 6.13v4.029l1.978.873V5.869l9.038-1.818z"
      />
    </svg>
  );
}

export function TrelloLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="256" height="256" rx="25" fill="#0079BF" />
      <rect x="28" y="28" width="88" height="180" rx="12" fill="white" />
      <rect x="140" y="28" width="88" height="120" rx="12" fill="white" />
    </svg>
  );
}
