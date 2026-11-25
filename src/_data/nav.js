// The header's menus and the footer's columns. Pages not built yet (phases
// 2–4) are linked already; they 404 until they exist.
export default {
  product: [
    { title: "Savings and contributions", text: "Savings types, savings plans, interest and dues.", icon: "piggy-bank", url: "/product/savings/" },
    { title: "Loans", text: "Applications, guarantors, approvals and repayments.", icon: "cash-coin", url: "/product/loans/" },
    { title: "Member payments", text: "Members pay online or by bank transfer, straight to you.", icon: "phone", url: "/product/payments/" },
    { title: "Branches and cash", text: "Cash hand-ins, cash at hand, and every branch in view.", icon: "diagram-3", url: "/product/branches/" },
    { title: "Reports and statements", text: "Member statements and society reports, as a PDF or spreadsheet.", icon: "file-earmark-bar-graph", url: "/product/reports/" },
    { title: "Shares and dividends", text: "Share capital, certificates and dividends.", icon: "pie-chart", url: "/product/shares/" },
    { title: "Empowerment and insurance", text: "Grants members apply for, and insurance cover.", icon: "heart-pulse", url: "/product/empowerment/" },
    { title: "Notices", text: "Announcements to the society, a branch or staff.", icon: "megaphone", url: "/product/notices/" },
  ],
  audiences: [
    { title: "Presidents and leadership", text: "See the whole society and approve what matters.", icon: "bank", url: "/for/leadership/" },
    { title: "Treasurers and financial secretaries", text: "Payments, approvals and accounts that add up.", icon: "calculator", url: "/for/treasurers/" },
    { title: "Branch staff", text: "Record payments and serve members quickly.", icon: "people", url: "/for/branch-staff/" },
    { title: "Members", text: "Your savings, loans and payments on your phone.", icon: "person-badge", url: "/for/members/" },
  ],
  company: [
    { title: "About", url: "/about/" },
    { title: "Security", url: "/security/" },
    { title: "Pricing", url: "/pricing/" },
    { title: "Contact us", url: "/contact/" },
  ],
  help: [
    { title: "Help Center", url: "/help/" },
    { title: "Help for staff", url: "/help/staff/" },
    { title: "Help for members", url: "/help/members/" },
  ],
  legal: [
    { title: "Privacy", url: "/privacy/" },
    { title: "Terms", url: "/terms/" },
    { title: "Cookies", url: "/cookies/" },
  ],
};
