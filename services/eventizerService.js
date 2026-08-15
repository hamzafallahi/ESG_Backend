const axios = require('axios');
const config = require('../config/app-config');

const EVENTIZER_BASE_URL = (config.EVENTIZER_BASE_URL || 'https://api.sourcebook-taa.tn').replace(/\/$/, '');

const eventizerApi = axios.create({
  baseURL: EVENTIZER_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const buildOrganizationPayload = (payload = {}) => {
  const normalized = { ...payload };
  delete normalized.password;
  delete normalized.id;

  const subSector = String(normalized.sub_sector || '').toUpperCase();
  const activityId = {
    TS: 'actv_Yo306gLRDb53Ew1Tv3Fr',
    FF: 'actv_SrKZeZSRijvw9y4dZkil',
    PL: 'actv_duAXQvvQvtpxo0WPwlGc',
    CA: 'actv_duAXQvvQvtpxo0WPwlGc',
    EE: 'actv_duAXQvvQvtpxo0WPwlGc',
    MP: 'actv_duAXQvvQvtpxo0WPwlGc',
  }[subSector] || null;

  const organizationName = normalized.organization_name || normalized.organisation_name || normalized.name || '';
  const email = normalized.email || '';
  const phoneNumber = normalized.phone_number || normalized.organisation_phone_number || '';
  const mappedPayload = {
    ...normalized,
    name: organizationName,
    organizationName,
    companyName: organizationName,
    email,
    phoneNumber,
    phone_number: phoneNumber,
    organization_name: organizationName,
    organisation_name: organizationName,
    activities: activityId ? [activityId] : [],
    activityId,
    activity_ids: activityId ? [activityId] : [],
  };

  return mappedPayload;
};

const getTokenFromResponse = (data) => {
  if (!data) return null;
  return data.token || data.accessToken || data.access_token || data.jwt || data.data?.token || data.data?.accessToken || null;
};

const request = async (method, url, data = null, token = null) => {
  const configOptions = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined;

  const response = await eventizerApi({ method, url, data, ...configOptions });
  return response.data;
};

module.exports = {
  buildOrganizationPayload,
  getTokenFromResponse,
  async createOrganization(payload) {
    return request('post', '/organizations', buildOrganizationPayload(payload));
  },
  async signIn(payload) {
    return request('post', '/auth/sign-in', payload);
  },
  async getMe(token) {
    return request('get', '/me', null, token);
  },
  async updateMe(token, payload) {
    return request('put', '/me', payload, token);
  },
  async changePassword(token, payload) {
    return request('put', '/auth/change-password', payload, token);
  },
  async forgotPassword(payload) {
    return request('post', '/auth/forgot-password', payload);
  },
  getBaseUrl() {
    return EVENTIZER_BASE_URL;
  },
};
