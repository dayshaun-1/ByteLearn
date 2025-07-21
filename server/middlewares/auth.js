import jwt from 'jsonwebtoken'

const authentication = async (req, res, next) => {
    const {token} = req.headers;
    if (!token) {
        return res.json({success: false, message: "Please Login"});
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decode.id,
            isEducator: decode.isEducator
        };
        next();
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
} 

export default authentication;