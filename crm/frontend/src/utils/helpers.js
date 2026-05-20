export const formatCurrency = (v = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const today = () => new Date().toISOString().split('T')[0];

export const isOverdue = (d) => d && new Date(d) < new Date();

export const id = (obj) => obj?._id || obj?.id || '';

export const STAGES = ['Prospecting','Qualified','Quotation','Demo','Proposal','Negotiation','Closed Won','Closed Lost'];
export const ACT_TYPES = ['Call','Email','Meeting','Demo','Follow-up','Note'];
export const INDUSTRIES = ['SaaS','Manufacturing','Healthcare','Retail','Finance','Education','Other'];
export const SIZES = ['1-10','10-50','50-200','200-500','500-1000','1000+'];

export const STAGE_COLORS = {
  Prospecting:   { bg:'#E6F1FB', text:'#185FA5', border:'#378ADD' },
  Qualified:     { bg:'#EEEDFE', text:'#534AB7', border:'#7F77DD' },
  Quotation:     { bg:'#F0FBF4', text:'#1A6B3C', border:'#3DAA6A' },
  Demo:          { bg:'#FAEEDA', text:'#854F0B', border:'#EF9F27' },
  Proposal:      { bg:'#FBEAF0', text:'#993556', border:'#D4537E' },
  Negotiation:   { bg:'#E1F5EE', text:'#0F6E56', border:'#1D9E75' },
  'Closed Won':  { bg:'#EAF3DE', text:'#3B6D11', border:'#639922' },
  'Closed Lost': { bg:'#FCEBEB', text:'#A32D2D', border:'#E24B4A' },
};

export const ACT_COLORS = {
  Call:'#378ADD', Email:'#7F77DD', Meeting:'#1D9E75',
  Demo:'#EF9F27', 'Follow-up':'#D4537E', Note:'#888780',
};

const PAL = [
  {bg:'#E6F1FB',text:'#185FA5'},{bg:'#EEEDFE',text:'#534AB7'},
  {bg:'#E1F5EE',text:'#0F6E56'},{bg:'#FAEEDA',text:'#854F0B'},
  {bg:'#FBEAF0',text:'#993556'},{bg:'#FCEBEB',text:'#A32D2D'},
];
export const avatarColor = (name = '') => PAL[(name.charCodeAt(0) || 0) % PAL.length];