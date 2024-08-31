// const apiBaseURL = "https://ft1.cxchatgpt.ai/api";
const apiBaseURL = "https://staging.cxchatgpt.ai/api";
const urlBackendAPI = `${apiBaseURL}/main`;
const urlAuth = `${apiBaseURL}/auth`;
const urlStripe = `${apiBaseURL}/stripe`;
const urlAnalytics = `${apiBaseURL}/dashboard/dashboard`;
const urlSendEmail = `${apiBaseURL}/email`;
const tpCookieURL = `https://tpcookie.cxchatgpt.ai/`;

export const ApiConfig = {
  // Authentication
  login: `${urlAuth}/zen_admin_screen_auth`,

  // ------------- Subscription Management ----------------
  orgStatus: `${urlStripe}/update_org_status`,
  paymentStatus: `${urlStripe}/sub_create_update`,
  paymentUpdate: `${urlStripe}/create-customer-portal-session`,
  urlContactUs: `${urlSendEmail}/contact_us`,
  pricingTable: `${urlStripe}/create-pricing-table`,

  //Stater
  staterMonth: `https://buy.stripe.com/<change_me>?client_reference_id=${sessionStorage.getItem(
    "subdomain"
  )}&prefilled_email=${sessionStorage.getItem("email")}`,

  staterYear: `https://buy.stripe.com/<change_me>?client_reference_id=${sessionStorage.getItem(
    "subdomain"
  )}&prefilled_email=${sessionStorage.getItem("email")}`,

  //Standard
  standardMonth: `https://buy.stripe.com/<change_me>?client_reference_id=${sessionStorage.getItem(
    "subdomain"
  )}&prefilled_email=${sessionStorage.getItem("email")}`,

  standardYear: `https://buy.stripe.com/<change_me>?client_reference_id=${sessionStorage.getItem(
    "subdomain"
  )}&prefilled_email=${sessionStorage.getItem("email")}`,

  //Enterprise
  enterpriseMonth: `https://topcx.ai/contact`,
  enterpriseYear: `https://topcx.ai/contact`,

  //PricingTable
  // pricingTable: `
  //                <stripe-pricing-table
  //   pricing-table-id="abc"
  //   publishable-key="abc"
  // customer-email=${sessionStorage.getItem("email")}
  // client-reference-id=${sessionStorage.getItem("subdomain")}
  //   >
  //   </stripe-pricing-table>
  // `,

  // ------------- Feature Management ----------------
  //Features
  features: `${urlBackendAPI}/feature_preview`,
  featureUpdate: `${urlBackendAPI}/feature_selection`,
  KnowledgeBase: `${urlBackendAPI}/Admin_KnowledgeBase/`,
  ticketIngestionStatus: `${urlBackendAPI}/ticket_ingestion_status`,

  kbIngestionStatus: `${urlBackendAPI}/kb_ingestion_status`,
  kbDeletion: `${urlBackendAPI}/files/delete`,

  ingestionRunningStatus: `${urlBackendAPI}/get_ingestion_status`,

  // ------------- Role Management ----------------
  // Agent Screen
  agentsDetailsFetch: `${urlBackendAPI}/roleManagement_getAgents`,

  agentsDetailsRefresh: `${urlBackendAPI}/roleManagement_getAgents`,

  agentsDetailsReset: `${urlBackendAPI}/roleManagement_getAgents`,

  agentsDetailsSubmit: `${urlBackendAPI}/roleManagement_updateAgentStatus`,

  agentsDetailsTeam: `${urlBackendAPI}/roleManagement_assignTeam`,

  agentsDetailsTeamLead: `${urlBackendAPI}/roleManagement_assignTeamLeadof`,

  agentsDetailsRole: `${urlBackendAPI}/roleManagement_assignRole`,

  // Team Screen
  createTeam: `${urlBackendAPI}/roleManagement_createTeam`,
  deleteTeam: `${urlBackendAPI}/roleManagement_updateTeam`,
  updateTeamLead: `${urlBackendAPI}/roleManagement_assignTeamLeadof`,

  addTeamMember: `${urlBackendAPI}/roleManagement_assignTeam`,

  //Role Screen
  createRole: `${urlBackendAPI}/roleManagement_createRole`,
  deleteRole: `${urlBackendAPI}/roleManagement_updateRole`,
  updateRole: `${urlBackendAPI}/roleManagement_updateRole`,
  updateAgent: `${urlBackendAPI}/roleManagement_assignRole`,

  // ------------- Analytics ----------------
  analyticsFilter: `${urlAnalytics}/filter_data`,
  analyticsGraph: `${urlAnalytics}/card_data/graph/`,
  analyticsAgentList: `${urlAnalytics}/card_data/agent_list/`,

  analyticsTopBarData: `${urlAnalytics}/top_bar_data/`,
  analyticsTicketData: `${urlAnalytics}/ticket_data/`,
  analyticsTotalValue: `${urlAnalytics}/total_kpi_value/`,

  analyticsTooltips: `${urlBackendAPI}/tooltips/analytics`,

  tpCookieURL: `${tpCookieURL}`,
};
