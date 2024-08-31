import { ApiConfig } from "config/ApiConfig";

export const pricingData = [
  {
    id: 0,
    title: "Starter",
    // subTitle: "For teams that need to create project plans with confidence.",
    priceMonthly: 10,
    priceYearly: 100,
    urlMonthly: ApiConfig.staterMonth,
    urlYearly: ApiConfig.staterYear,
    buttonText: "Purchase",
    isFeatured: false,
    // featureTitle: "Track team projects with free:",
    features: [
      {
        id: 1,
        title: "Ask-AI: 10 chats/day per agent",
        detail:
          "Engage with our AI assistant up to 10 times per day per agent, providing quick answers to common queries.",
      },
      {
        id: 2,
        title: "Intelli-Search: 2 regenerates/day per agent",
        detail:
          "Leverage intelligent search capabilities with the ability to refine searches up to 2 times per day per agent.",
      },
      {
        id: 3,
        title: "Agents Limit: 9",
        detail:
          "Support for up to 9 agents, allowing a small team to utilize our platform effectively.",
      },
      {
        id: 4,
        title: "Historical Ticket Ingestion: 5000",
        detail:
          "Ingest and manage up to 5000 historical tickets, ensuring a comprehensive support history.",
      },
      {
        id: 5,
        title: "Analytics Dashboard: Past 3 weeks",
        detail:
          "Access an analytics dashboard with data from the past 3 weeks, providing insights into recent performance.",
      },
      {
        id: 6,
        title: "TopCX Surveys: 50/Month",
        detail:
          "Distribute up to 50 customer satisfaction surveys per month to gather valuable feedback.",
      },
      {
        id: 7,
        title: "Smart AI Response: 10 Response/day per agent",
        detail:
          "Receive up to 10 AI-generated responses per day per agent, enhancing response efficiency.",
      },
    ],
  },
  {
    id: 1,
    title: "Standard",
    // subTitle:
    //   "For teams and companies that need to manage work across initiatives.",
    priceMonthly: 15,
    priceYearly: 150,
    urlMonthly: ApiConfig.standardMonth,
    urlYearly: ApiConfig.staterYear,
    buttonText: "Purchase",
    isFeatured: true,
    // featureTitle: "Everything in Premium, plus:",
    features: [
      {
        id: 1,
        title: "Ask-AI: 30 chats/day per agent",
        detail:
          "Interact with our AI assistant up to 30 times per day per agent for enhanced support and productivity.",
      },
      {
        id: 2,
        title: "Intelli-Search: 5 regenerates/day per agent",
        detail:
          "Utilize advanced search functions with the ability to refine searches up to 5 times per day per agent.",
      },
      {
        id: 3,
        title: "Agents Limit: Custom",
        detail:
          "Set custom agent limits to align with the size and needs of your organization.",
      },
      {
        id: 4,
        title: "Historical Ticket Ingestion: 15000",
        detail:
          "Manage up to 15000 historical tickets, providing a deep and comprehensive support history.",
      },
      {
        id: 5,
        title: "Analytics Dashboard: Past 1 year",
        detail:
          "Gain insights from an analytics dashboard with data spanning the past year, offering long-term performance tracking.",
      },
      {
        id: 6,
        title: "TopCX Surveys: Unlimited",
        detail:
          "Send an unlimited number of customer satisfaction surveys each month to continually gather feedback and improve.",
      },
      {
        id: 7,
        title: "Smart AI Response: 20 Response/day per agent",
        detail:
          "Enhance response times with up to 20 AI-generated responses per day per agent.",
      },
      {
        id: 8,
        title: "Topic Analysis",
        detail:
          "Analyze customer interactions and support tickets to identify key topics and trends, improving service strategies.",
      },
    ],
  },
  {
    id: 2,
    title: "Enterprise",
    // subTitle: "For organizations that need additional security and support.",
    priceMonthly: "XX",
    priceYearly: "XX",
    urlMonthly: ApiConfig.enterpriseMonth,
    urlYearly: ApiConfig.enterpriseYear,
    buttonText: "Contact Us",
    isFeatured: false,
    featureTitle: "Everything is Custom",
    features: [
      {
        id: 1,
        title: "Ask-AI: Custom",
        detail:
          "Tailor the number of AI interactions per day per agent to suit your organization's specific needs.",
      },
      {
        id: 2,
        title: "Intelli-Search: Custom",
        detail:
          "Customize the number of intelligent search refinements per day per agent, based on your requirements.",
      },
      {
        id: 3,
        title: "Agents Limit: Custom",
        detail:
          "Set custom agent limits to align with the size and needs of your organization.",
      },
      {
        id: 4,
        title: "Historical Ticket Ingestion: Custom",
        detail:
          "Define the amount of historical ticket data to be ingested, ensuring comprehensive support history management.",
      },
      {
        id: 5,
        title: "Analytics Dashboard: Custom",
        detail:
          "Customize analytics dashboard settings to track and analyze performance metrics most relevant to your organization.",
      },
      {
        id: 6,
        title: "TopCX Surveys: Custom",
        detail:
          "Set custom survey capabilities to gather feedback at the frequency and volume that best suits your needs.",
      },
      {
        id: 7,
        title: "Smart AI Response: Custom",
        detail:
          "Define the number of AI-generated responses per day per agent, optimizing efficiency and support quality.",
      },
      {
        id: 8,
        title: "Topic Analysis",
        detail:
          "Utilize customizable topic analysis features to better understand and address key trends in customer interactions.",
      },
    ],
  },
];
