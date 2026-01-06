const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");

const options = {
    swaggerOptions: {
        url: "/swagger-api-docs"
    },
};

const setupSwagger = (app) => {
        app.get("/swagger-api-docs", (req, res) => res.json(swaggerDocument));
        app.use(
            "/swagger-ui", 
            swaggerUi.serveFiles(null, options), 
            swaggerUi.setup(null, options)
        );
        console.log('Swagger UI initialized in development mode');
};

module.exports = setupSwagger;