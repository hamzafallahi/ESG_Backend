const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const swaggerAdminDocument = require("../swagger-admin.json");

// Options for User Swagger UI
const userOptions = {
    swaggerOptions: {
        url: "/swagger-api-docs"
    },
};

// Options for Admin Swagger UI
const adminOptions = {
    swaggerOptions: {
        url: "/swagger-admin-api-docs"
    },
};

const setupSwagger = (app) => {
    // User API Documentation
    app.get("/swagger-api-docs", (req, res) => res.json(swaggerDocument));
    app.use(
        "/swagger-ui", 
        swaggerUi.serveFiles(null, userOptions), 
        swaggerUi.setup(null, userOptions)
    );

    // Admin API Documentation
    app.get("/swagger-admin-api-docs", (req, res) => res.json(swaggerAdminDocument));
    app.use(
        "/swagger-admin-ui", 
        swaggerUi.serveFiles(null, adminOptions), 
        swaggerUi.setup(null, adminOptions)
    );

    console.log('Swagger UI initialized in development mode');
    console.log('  - User API docs: /swagger-ui');
    console.log('  - Admin API docs: /swagger-admin-ui');
};

module.exports = setupSwagger;