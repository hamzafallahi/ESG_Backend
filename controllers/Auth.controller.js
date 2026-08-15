const db = require('../models');
const User = db.user;
const Admin = db.admin;
const SuperAdmin = db.super_admin;
const jwt = require('jsonwebtoken');
const AuthSerializer = require('../serializer/authserializer');
const config = require('../config/app-config');
const NotFoundError = require('../error/exception/NotFound');
const BusinessError = require('../error/BusinessError');
const TechnicalError = require('../error/TechnicalError');
const { isValidSubSector } = require('../utils/subSectorValidation');
const eventizerService = require('../services/eventizerService');

const signLocalAdminToken = (user, role) => {
  const privateKey = config.JWT_PRIVATE_KEY || config.JWT_SECRET;
  if (!privateKey) {
    throw new TechnicalError('JWT private key is not configured');
  }

  return jwt.sign(
    { id: user.id, email: user.email, role },
    privateKey,
    { algorithm: 'RS256', expiresIn: config.JWT_EXPIRATION || '8h' }
  );
};

const verifyAdminToken = (token) => {
  const publicKey = config.JWT_PUBLIC_KEY || config.JWT_SECRET;
  if (!publicKey) {
    throw new TechnicalError('JWT public key is not configured');
  }

  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
};

const setAuthCookie = (res, name, token, expiresAt = null) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt || undefined,
  };

  res.cookie(name, token, cookieOptions);
};

const syncUserFromEventizerProfile = async (email, profile) => {
  const normalizedEmail = (profile?.email || email || '').toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  let user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    user = await User.create({
      email: normalizedEmail,
      organization_name: profile?.organization_name || profile?.companyName || profile?.name || 'Eventizer User',
      phone_number: profile?.phone_number || profile?.phoneNumber || '',
      country: profile?.country || 'Tunisia',
      city: profile?.city || '',
      state: profile?.state || '',
      postal_code: profile?.postal_code || '',
      address: profile?.address || '',
      organisation_email: normalizedEmail,
      tax_number: profile?.tax_number || profile?.taxNumber || '',
      description: profile?.description || '',
      name: profile?.name?.split(' ')[0] || 'User',
      surname: profile?.name?.split(' ').slice(1).join(' ') || 'Profile',
      position: profile?.position || '',
      sub_sector: profile?.sub_sector || profile?.sector || null,
      website_url: profile?.website_url || profile?.websiteUrl || '',
      organisation_phone_number: profile?.organisation_phone_number || profile?.phone_number || '',
      linkedin: profile?.linkedin || '',
      facebook: profile?.facebook || '',
      twitter: profile?.twitter || '',
      logo_url: profile?.logo_url || profile?.logoUrl || '',
      video_url: profile?.video_url || profile?.videoUrl || '',
      password: null,
      organisation_id: profile?.id || profile?.organization_id || null,
      adherent_id: profile?.adherentId || profile?.adherent_id || null,
    });
  } else {
    const updates = {};
    const eventizerOrgId = profile?.id || profile?.organization_id || profile?.organisation_id;
    const eventizerAdherentId = profile?.adherentId || profile?.adherent_id;

    if (eventizerOrgId && !user.organisation_id) updates.organisation_id = eventizerOrgId;
    if (eventizerAdherentId && !user.adherent_id) updates.adherent_id = eventizerAdherentId;
    if (profile?.organization_name && !user.organization_name) updates.organization_name = profile.organization_name;
    if (profile?.phone_number && !user.phone_number) updates.phone_number = profile.phone_number;
    if (profile?.email && !user.email) updates.email = profile.email;

    if (Object.keys(updates).length) {
      await user.update(updates);
    }
  }

  return user;
};

const mapSubSectorToActivity = (subSector) => {
  const normalized = String(subSector || '').toUpperCase();
  const mapping = {
    TS: 'actv_Yo306gLRDb53Ew1Tv3Fr',
    FF: 'actv_SrKZeZSRijvw9y4dZkil',
    PL: 'actv_duAXQvvQvtpxo0WPwlGc',
    CA: 'actv_duAXQvvQvtpxo0WPwlGc',
    EE: 'actv_duAXQvvQvtpxo0WPwlGc',
    MP: 'actv_duAXQvvQvtpxo0WPwlGc',
  };

  return mapping[normalized] || null;
};

exports.signup = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const attributes = payload.data && payload.data.attributes ? payload.data.attributes : payload;
    const email = (attributes.email || '').toLowerCase();

    if (!email) {
      throw new BusinessError(400, 'INVALID_REQUEST', 'Email is required');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const businessError = new BusinessError(409, 'EMAIL_IN_USE', 'Email already in use');
      businessError.addError('attributes.email', 'A user with this email already exists');
      throw businessError;
    }

    if (attributes.sub_sector) {
      const subSector = String(attributes.sub_sector).toUpperCase();
      if (!(await isValidSubSector(subSector))) {
        const businessError = new BusinessError(400, 'Bad Request');
        businessError.addError('attributes.sub_sector', 'Invalid or inactive sub-sector');
        throw businessError;
      }
    }

    const eventizerPayload = {
      ...attributes,
      email,
      activities: mapSubSectorToActivity(attributes.sub_sector) ? [mapSubSectorToActivity(attributes.sub_sector)] : [],
      sub_sector: attributes.sub_sector,
      password: undefined,
    };

    delete eventizerPayload.password;

    const eventizerResponse = await eventizerService.createOrganization(eventizerPayload);
    const eventizerToken = eventizerService.getTokenFromResponse(eventizerResponse);
    const organizationId = eventizerResponse?.id || eventizerResponse?.data?.id || null;
    const adherentId = eventizerResponse?.adherentId || eventizerResponse?.adherent_id || eventizerResponse?.data?.adherentId || null;

    const user = await User.create({
      ...attributes,
      email,
      password: null,
      organisation_id: organizationId,
      adherent_id: adherentId,
      organization_name: attributes.organization_name,
      phone_number: attributes.phone_number,
      country: attributes.country,
      city: attributes.city,
      state: attributes.state,
      postal_code: attributes.postal_code,
      address: attributes.address,
      organisation_email: email,
      tax_number: attributes.tax_number,
      description: attributes.description || '',
      name: attributes.name,
      surname: attributes.surname,
      position: attributes.position || null,
      sub_sector: attributes.sub_sector || null,
      website_url: attributes.website_url || '',
      organisation_phone_number: attributes.organisation_phone_number || attributes.phone_number,
      linkedin: attributes.linkedin || '',
      facebook: attributes.facebook || '',
      twitter: attributes.twitter || '',
      logo_url: attributes.logo_url || '',
      video_url: attributes.video_url || '',
    });

    if (eventizerToken) {
      setAuthCookie(res, 'user_token', eventizerToken, new Date(Date.now() + 60 * 60 * 1000));
    }

    const serializedUser = AuthSerializer.serialize(user.toJSON());
    return res.status(201).json({
      ...serializedUser,
      eventizer: {
        organizationId,
        adherentId,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const attributes = payload.data && payload.data.attributes ? payload.data.attributes : payload;
    const email = (attributes.email || '').toLowerCase();
    const password = attributes.password;

    if (!email || !password) {
      throw new BusinessError(400, 'INVALID_CREDENTIALS', 'Email and password are required');
    }

    const eventizerResponse = await eventizerService.signIn({ email, password });
    const eventizerToken = eventizerService.getTokenFromResponse(eventizerResponse);

    if (!eventizerToken) {
      throw new BusinessError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const localUser = await User.findOne({ where: { email } });
    let user = localUser;

    if (!user) {
      const profile = await eventizerService.getMe(eventizerToken);
      user = await syncUserFromEventizerProfile(email, profile);
    }

    if (!user) {
      throw new BusinessError(401, 'INVALID_CREDENTIALS', 'Unable to load user profile');
    }

    setAuthCookie(res, 'user_token', eventizerToken, new Date(Date.now() + 60 * 60 * 1000));

    const serializedUser = AuthSerializer.serialize(user.toJSON());
    return res.status(200).json(serializedUser);
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    if (req.userRole !== 'user') {
      const businessError = new BusinessError(401, 'INVALID_TOKEN', 'Invalid token for user endpoint');
      businessError.addError('token', 'User token is required');
      throw businessError;
    }

    const user = await User.findByPk(req.userId);
    
    if (!user) {
      throw new NotFoundError('User not found', 'User');
    }

    const serializedUser = AuthSerializer.serialize(user.toJSON());
    return res.status(200).json(serializedUser);
  } catch (error) {
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    let user = await SuperAdmin.findOne({ where: { email } });
    let role = 'super_admin';
    
    if (!user) {
      user = await Admin.findOne({ where: { email } });
      role = 'admin';
    }
    
    if (!user) {
      const businessError = new BusinessError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
      businessError.addError('attributes.email', 'Email or password is incorrect');
      throw businessError;
    }

    if (!user.is_active) {
      const businessError = new BusinessError(403, 'ACCOUNT_INACTIVE', 'Account is inactive');
      businessError.addError('attributes.is_active', 'This account has been deactivated');
      throw businessError;
    }

    const isValidPassword = await user.validPassword(password);
    
    if (!isValidPassword) {
      const businessError = new BusinessError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
      businessError.addError('attributes.password', 'Email or password is incorrect');
      throw businessError;
    }

    const token = signLocalAdminToken(user, role);
    setAuthCookie(res, 'admin_token', token, new Date(Date.now() + 8 * 60 * 60 * 1000));

    const userData = user.toJSON();
    return res.status(200).json({
      data: {
        type: role === 'super_admin' ? 'super_admins' : 'admins',
        id: userData.id,
        attributes: {
          username: userData.username,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          is_active: userData.is_active,
          role: role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentAdmin = async (req, res, next) => {
  try {
    if (req.userRole !== 'admin' && req.userRole !== 'super_admin') {
      const businessError = new BusinessError(401, 'INVALID_TOKEN', 'Invalid token for admin endpoint');
      businessError.addError('token', 'Admin token is required');
      throw businessError;
    }

    let user;
    let role;
    user = await SuperAdmin.findByPk(req.userId);
    if (user) {
      role = 'super_admin';
    } else {
      user = await Admin.findByPk(req.userId);
      role = 'admin';
    }
    
    if (!user) {
      throw new NotFoundError('Admin not found', 'Admin');
    }

    const userData = user.toJSON();
    return res.status(200).json({
      data: {
        type: role === 'super_admin' ? 'super_admins' : 'admins',
        id: userData.id,
        attributes: {
          username: userData.username,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          is_active: userData.is_active,
          role: role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const attributes = payload.data && payload.data.attributes ? payload.data.attributes : payload;

    if (!attributes.email) {
      const businessError = new BusinessError(400, 'INVALID_REQUEST', 'Email is required');
      businessError.addError('attributes.email', 'Email is required');
      throw businessError;
    }

    await eventizerService.forgotPassword({ email: attributes.email });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('user_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.clearCookie('admin_token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
