import jwt from "jsonwebtoken";

const softAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {      
      return next();
    }
    
    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    if (decode) {
        req.id = decode.userId;
    }
    
    next();
  } catch (error) {
    console.log("Soft auth error (token invalid):", error.message);
    next();
  }
};

export default softAuth;