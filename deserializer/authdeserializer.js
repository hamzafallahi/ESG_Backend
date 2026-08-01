class AuthDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    if (attributes.name !== undefined) result.name = attributes.name;
    if (attributes.surname !== undefined) result.surname = attributes.surname;
    if (attributes.position !== undefined) result.position = attributes.position;
    if (attributes.sub_sector !== undefined) result.sub_sector = attributes.sub_sector;
    if (attributes.website_url !== undefined) result.website_url = attributes.website_url;
    if (attributes.organization_name !== undefined) result.organization_name = attributes.organization_name;
    if (attributes.organisation_phone_number !== undefined) result.organisation_phone_number = attributes.organisation_phone_number;
    if (attributes.organisation_email !== undefined) result.organisation_email = attributes.organisation_email;
    if (attributes.phone_number !== undefined) result.phone_number = attributes.phone_number;
    if (attributes.address !== undefined) result.address = attributes.address;
    if (attributes.postal_code !== undefined) result.postal_code = attributes.postal_code;
    if (attributes.city !== undefined) result.city = attributes.city;
    if (attributes.state !== undefined) result.state = attributes.state;
    if (attributes.country !== undefined) result.country = attributes.country;
    if (attributes.description !== undefined) result.description = attributes.description;
    if (attributes.tax_number !== undefined) result.tax_number = attributes.tax_number;
    if (attributes.linkedin !== undefined) result.linkedin = attributes.linkedin;
    if (attributes.facebook !== undefined) result.facebook = attributes.facebook;
    if (attributes.twitter !== undefined) result.twitter = attributes.twitter;
    if (attributes.logo_url !== undefined) result.logo_url = attributes.logo_url;
    if (attributes.video_url !== undefined) result.video_url = attributes.video_url;
    if (attributes.email !== undefined) result.email = attributes.email;
    if (attributes.password !== undefined) result.password = attributes.password;
    
    return result;
  }
}

module.exports = AuthDeserializer;
