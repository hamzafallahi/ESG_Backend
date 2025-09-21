
const defaultConfig = {
  
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialect: process.env.DB_DIALECT
    },
    JWT_SECRET: process.env.JWT_SECRET || 'esg-secret-key',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
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
        httpPort: process.env.SERVICE_PORT
    },
};