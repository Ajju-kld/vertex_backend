// middelware/middelware.mjs


const requestLogger = (request, response, next) => {
  console.log("[api]", request.method, request.path);
  console.log("[api]", "body:  ", request.body);
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Unknown Endpoint" });
};

// eslint-disable-next-line consistent-return
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ message: "malformatted id" ,success:false},);
  }
  if (error.name === "ValidationError") {
    const errors = {};

    Object.keys(error.errors).forEach((key) => {
      errors[key] = error.errors[key].message;
    });

    return response
      .status(400)
      .json({ message: JSON.stringify(errors), success: false });
  }
  if (error.name === "JsonWebTokenError") {
    return response
      .status(400)
      .json({ message: error.message, success: false });
  }
  if (error.name === "TokenExpiredError") {
    return response.status(401).json({ message: "token expired", success: false });
  }
  return response.status(401).json({ message: error.message , success: false });
  // next(error);
};

export  {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
