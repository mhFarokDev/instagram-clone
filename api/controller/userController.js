import User from "../models/userModel.js"
import Token from "../models/verifyToken.js"
import errorController from "./errorController.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import sendEmail from "../utility/sendEmail.js"
import sendEmailByGmail from "../utility/sendMailByGmail.js"
import phoneToken from "generate-sms-verification-code"
 

// get all user data
/**
 * 
 * @access admin
 * @routes /api/user
 * @method GET
 */
export const getAllUser = async ( req, res, next) =>{
    const user = await User.find()
    if (!user) {
        return next(errorController(401, "User Data not found."))
    }
    res.status(200).json(user)
    
}

// get single user
/**
 * 
 * @access public
 * @routes /api/user/:id
 * @method GET
 */
export const getSingleUser = async(req, res, next) =>{
    const id = req.params.id;
    try {
        const user = await User.findById(id)
        if (!user) {
            return next(errorController(402, "User not find"))
        }
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
    
}

// add new user
/**
 * 
 * @access public
 * @routes /api/user
 * @method POST
 */
export const addNewUser = async (req, res, next) =>{
    try {
        const saltGen = await bcrypt.genSalt(10);
        const hasPass = await bcrypt.hash(req.body.password, saltGen)
        const addPass = await User.create({...req.body, password : hasPass})
        if (!addPass) {
            return next(errorController(401, "user creation error."))
        }
        sendEmail(addPass.email, 'Wealcome Instogram', `Hi ${addPass.name} you are new regiister on instogram. wealcome to Instogram.`)
        res.status(200).json({message : "successfully created account.", userId : addPass._id})
    } catch (error) {
        next(error)
    }
}

// put/patch edit a user data
/**
 * 
 * @access public
 * @routes /api/user/:id
 * @method PUT/PATCH
 */
export const updateUser = async(req, res, next) =>{
    try {
        const id = req.params.id;
        const userData = await User.findOne({_id : id})
        if (!userData) {
           return next(errorController(401, "user not found."))
        }
        const user = await User.findByIdAndUpdate(id, {userData, ...req.body, password : userData.password},{new : true})
        if (!user) {
           return next(errorController(401, "data updated error."))
        }
        res.status(200).send(user)
    } catch (error) {
        next(error)
    }
}


// delete data
/**
 * 
 * @access public
 * @routes /api/user/:id
 * @method DELETE
 */
export const deleteUser = async (req, res, next) =>{

    try {
        const id = req.params.id;
        const deletedData = await User.findByIdAndDelete(id);
        if (!deletedData) {
            return next(errorController(402, "delete user worng!"))
        }
        res.status(200).json(deletedData)
    } catch (error) {
        next(error)
    }
}



// Authintation and registation

export const loginUser = async(req, res, next) =>{
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email});
        if (!userData) {
            return next(errorController(402, "Incurrect email."))
        }
        const passCheck = await bcrypt.compare(password, userData.password)
        if (!passCheck) {
            return next(errorController(402, "worng password."))
        }
        if (userData && passCheck) {
            const {password, ...otherInfo} = userData._doc
            const access_token = jwt.sign({id : userData._id, isAdmin : userData.isAdmin}, process.env.JWT_SECRAT)
            res.cookie("access_token", access_token).status(200).json({
                token : access_token,
                user : otherInfo
            })
        }
    } catch (error) {
        next(error)
    }
}



// user login check and pass user info by cookies
export const getLoggedInUser = async (req, res, next) =>{
    try {
        const bearer_token = req.headers.authorization;

        let token = ''
        if (bearer_token) {
            token  = bearer_token.split(' ')[1]
        }

        if (!bearer_token) {
            return next(errorController(404, 'token not found.'))
        }

        if (bearer_token) {
            // check loggedin user verify
            const loggeding_user = jwt.verify(token, process.env.JWT_SECRAT)

            // user check
            if (!loggeding_user) {
                return next(errorController(404, 'Invalid token'))
            }


            if (loggeding_user) {
                
                const user = await User.findById(loggeding_user.id)
                res.status(200).json(user)
            }
            
        }
        
    } catch (error) {
        next(error)
    }
    
}


// verification page check and Send email to verify
export const verifyMessageSend = async (req, res, next) =>{
    try {
        const _id = req.params.id;
        const isVerifyed = false
        const checkId = await User.findOne({_id , isVerifyed})
        if (!checkId) {
            return next(errorController(404, 'already verify'))
        }
        if (checkId) {
            
            const phoneTokenCode = phoneToken(5, {type: 'string'})
            const token = jwt.sign({id : checkId._id, code : phoneTokenCode}, process.env.JWT_SECRAT, {expiresIn : '10m'})
            const addToken = await Token.create({userId : checkId._id, token : token}) 
            if (!addToken) {
                next(errorController(400, 'token not addedd'))
            }
            sendEmailByGmail(checkId.email, "Instogram Verify", `Hello ${checkId.name}<br/> Your Verification Code Is <b style="color : green; font-size : 20px"> ${phoneTokenCode} </b> <br/> Or you can Login by click here <b>Link - </b> http://localhost:3000/verifyyouraccount/${token}`)

            res.status(200).json({
                message : "mail send success",
                email : checkId.email
            })
        }
        
    } catch (error) {
        next(error)
    }
}

// user verification by code
export const verifyByCode = async (req, res, next) =>{
    const {id, code} = req.body;
    const token = await Token.findOne({userId : id})

    try {
        if (!token) {
            return next(errorController(400, 'token not found!'))
        }
        const verifyToken = jwt.verify(token.token, process.env.JWT_SECRAT)
        if (!verifyToken) {
            token.remove()
            return next(errorController(400, 'session timeout!'))
        }

        if (verifyToken.code == code) {
            const userUpdate = await User.findByIdAndUpdate(id, {isVerifyed : true})
            token.remove()
            return res.status(200).json({
                message : 'account verify successfull'
            })
        }
        if (verifyToken.code != code) {
            token.remove()
            next(400, 'request timeout!')
        }
    } catch (error) {
        if (error.message == "jwt expired") {
            token.remove()
        }
        next(error)
    }
}


// verify user by link
export const verifyByLink = async (req, res, next) =>{
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verifyToken = jwt.verify(token, process.env.JWT_SECRAT)
        if (!verifyToken) {
            next(errorController(400, "request timeout."))
        }
        const storeToken = await Token.findOne({userId : verifyToken.id})
        if (!storeToken) {
            return next(errorController(400, `session expire!`))
        }
        if (storeToken) {
            const usUpdate = await User.findByIdAndUpdate(storeToken.userId, {isVerifyed : true})
            if (usUpdate) {
                storeToken.remove()
            }
            res.status(200).json({
                message : "Verifyed successfull!"
            })
            
        }
        
    } catch (error) {
        next(error)
    }
}

export const updatePassMailsend = async (req, res, next) =>{
    const {email} = req.body;

    try {
        const finUser = await User.findOne({email})
        if (!finUser) {
            next(errorController(400, "Invalid user."))
        }
        const token = jwt.sign({id : finUser._id}, process.env.JWT_SECRAT, {expiresIn : "1h"})

        sendEmailByGmail(finUser.email, "Change Password", `Hello ${finUser.name}<br/> Your password change Link is  <b>Link - </b> http://localhost:3000/forget-password/${token}`);

        res.status(200).json({message : `mail send to ${finUser.email}`})
    } catch (error) {
        next(error)
    }
    
}
// check update token password
export const PassUpTokenCheck = (req, res, next) => {
    const token = req.body.token;
    try {
        const verifyToken = jwt.verify(token, process.env.JWT_SECRAT)
        if (!verifyToken) {
            next(errorController(400, 'request timeout'))
        }
        res.status(200).json({message : 'Request success'})
    } catch (error) {
        next(errorController(400, "invalid token"))
    }
}

export const updatePassword = async (req, res, next) =>{
    const {password, token} = req.body;

    try {
        
        const userInfo = jwt.verify(token, process.env.JWT_SECRAT)
        if (!userInfo) {
            next(errorController(400, 'request timeout!'))
        }
        const genSalt = await bcrypt.genSalt(10)
        const hasPass = await bcrypt.hash(password, genSalt)
        const updatePass = await User.findByIdAndUpdate(userInfo.id, {password : hasPass})
        if (!updatePass) {
            next(errorController(400, "Password change paild"))
        }
        res.status(200).json({message : "Update successful"})
    } catch (error) {
        next(error)
    }
}



