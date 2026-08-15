
const fs = require('fs');
const path = require('path');

const readPem = (value, fallbackRelativePath) => {
    if (!value) {
        const fallbackPath = fallbackRelativePath ? path.join(__dirname, fallbackRelativePath) : null;
        if (fallbackPath && fs.existsSync(fallbackPath)) {
            return fs.readFileSync(fallbackPath, 'utf8');
        }
        return undefined;
    }
    return value.replace(/\\n/g, '\n');
};

const defaultConfig = {
  
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialect: process.env.DB_DIALECT,
        dialectOptions: {
            ssl: {
                require: true,              // Enforce SSL
                rejectUnauthorized: false   // Allow self-signed certs (Render usually needs this)
            }
        }
    },
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_PRIVATE_KEY: readPem(process.env.JWT_PRIVATE_KEY || process.env.LOCAL_JWT_PRIVATE_KEY, '../env/dev.private_key.pem'),
    JWT_PUBLIC_KEY: readPem(process.env.JWT_PUBLIC_KEY || process.env.LOCAL_JWT_PUBLIC_KEY, '../env/dev.public_key.pem'),
    EVENTIZER_PUBLIC_KEY: readPem(process.env.EVENTIZER_PUBLIC_KEY || process.env.EVENTIZER_JWT_PUBLIC_KEY, '../env/eventizer.public_key.pem'),
    EVENTIZER_BASE_URL: process.env.EVENTIZER_BASE_URL || 'https://api.sourcebook-taa.tn',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION,
    port: process.env.SERVICE_PORT,
    limit: 10,
    offset: 0,
    SortBy: "created_at",
    OrderBy: "DESC",
    authServer: process.env.AUTH_SERVICE_URL,
    realm: process.env.REALM,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || '',
        ttl: process.env.REDIS_TTL || 3600, 
    },
    rabbitmq: {
        url: process.env.RABBITMQ_URL,
        exchangeName: process.env.EXCHANGE_NAME,
        exchangeType: process.env.EXCHANGE_TYPE,
        routingKeyPost: process.env.ROUTING_KEY_POST,
        queueName: process.env.QUEUE_NAME,
        receivedQueueName: process.env.RECEIVED_QUEUE_NAME,
    },
};

module.exports = {
    ...defaultConfig,
    default: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST ,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT ,
        httpPort: process.env.SERVICE_PORT,
        dialectOptions: {
            ssl: {
                require: true,              // Enforce SSL
                rejectUnauthorized: false   // Allow self-signed certs (Render usually needs this)
            }
        }
    },
};