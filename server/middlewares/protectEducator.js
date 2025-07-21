
const protectEducator = async (req, res, next) => {
    try {
        const isEducator = req.user.isEducator;
        if (isEducator) {
            next();
        } 
        else {
            return res.json({success: false, message: "Unauthorized Access"});
        }
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
} 

export default protectEducator;