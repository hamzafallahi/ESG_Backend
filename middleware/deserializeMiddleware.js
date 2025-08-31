const deserializeMiddleware = (deserializer) => {
  return async (req, res, next) => {
    try {

      const deserializedData = await deserializer.deserialize(req.body, req);
      req.body = deserializedData;
      next();
    } catch (error) {
    
      next(error);
    }
  };
};

module.exports = deserializeMiddleware;
