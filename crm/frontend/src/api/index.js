import axios from 'axios';
const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Attach token to every request automatically
http.interceptors.request.use(config => {
  const token = localStorage.getItem('crm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Companies
export const getCompanies  = ()      => http.get('/companies');
export const getCompany    = (id)    => http.get(`/companies/${id}`);
export const createCompany = (data)  => http.post('/companies', data);
export const updateCompany = (id, d) => http.put(`/companies/${id}`, d);
export const deleteCompany = (id)    => http.delete(`/companies/${id}`);
export const uploadQuotation = (id, data) => http.post(`/deals/${id}/quotation`, data);
export const deleteQuotation = (id)       => http.delete(`/deals/${id}/quotation`);

// Contacts
export const getContacts   = ()      => http.get('/contacts');
export const createContact = (data)  => http.post('/contacts', data);
export const updateContact = (id, d) => http.put(`/contacts/${id}`, d);
export const deleteContact = (id)    => http.delete(`/contacts/${id}`);

// Deals
export const getDeals   = (params) => http.get('/deals', { params });
export const getDeal    = (id)     => http.get(`/deals/${id}`);
export const createDeal = (data)   => http.post('/deals', data);
export const updateDeal = (id, d)  => http.put(`/deals/${id}`, d);
export const deleteDeal = (id)     => http.delete(`/deals/${id}`);

// Activities
export const getActivities   = ()      => http.get('/activities');
export const createActivity  = (data)  => http.post('/activities', data);
export const updateActivity  = (id, d) => http.put(`/activities/${id}`, d);
export const toggleActivity  = (id)    => http.patch(`/activities/${id}/toggle`);
export const deleteActivity  = (id)    => http.delete(`/activities/${id}`);

// Dashboard
export const getDashStats    = () => http.get('/dashboard/stats');
export const getDashUpcoming = () => http.get('/dashboard/upcoming');

// Grants
export const getGrants   = ()      => http.get('/grants');
export const getGrantStats = ()    => http.get('/grants/stats');
export const createGrant = (data)  => http.post('/grants', data);
export const updateGrant = (id, d) => http.put(`/grants/${id}`, d);
export const deleteGrant = (id)    => http.delete(`/grants/${id}`);
// Auth
export const login    = (data) => http.post('/auth/login', data);
export const register = (data) => http.post('/auth/register', data);
export const getMe    = ()     => http.get('/auth/me');