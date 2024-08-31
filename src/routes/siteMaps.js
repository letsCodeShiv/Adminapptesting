export const dashboardRoutes = {
  label: "Dashboard",
  labelDisable: true,
  children: [
    {
      name: "Home",
      icon: "globe",
      to: "/landingpage",
      active: true,
    },
    // {
    //   name: "Feature Management",
    //   icon: "star",
    //   to: "/featuremanagement",
    //   active: true,
    // },
    // {
    //   name: "Feature Management 2",
    //   icon: "star",
    //   to: "/featuremanagement2",
    //   active: true,
    // },
    // {
    //   name: "Role Management",
    //   icon: "user",
    //   to: "/rolemanagement",
    //   active: true,
    // },
    {
      name: "XAnalytics",
      active: true,
      icon: "chart-pie",
      to: "/analytics-dashboard",
    },
    {
      name: "Settings",
      icon: "wrench",
      active: true,
      children: [
        {
          name: "Modules",
          to: "/featuremanagement",
          active: true,
        },
        {
          name: "Role Management",
          to: "/rolemanagement",
          active: true,
        },
      ],
    },
    {
      name: "Billing & Payments",
      icon: "tags",
      to: "/pricing",
      active: true,
    },
    {
      name: "Policies",
      icon: "file",
      active: true,
      children: [
        {
          name: "Privacy Policy",
          to: "/privacypolicy",
          active: true,
        },
        {
          name: "Terms and Conditions",
          to: "/tnc",
          active: true,
        },
      ],
    },
    {
      name: "Help",
      icon: "question-circle",
      to: "/help",
      active: true,
    },
  ],
};

export default [dashboardRoutes];
