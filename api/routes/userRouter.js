import express from "express";
import { getAllUser, addNewUser, getSingleUser, updateUser, deleteUser, loginUser, getLoggedInUser, verifyMessageSend, verifyByCode, verifyByLink, PassUpTokenCheck, updatePassMailsend, updatePassword } from "../controller/userController.js";



// get user routers
const routes = express.Router()

// checking cookies every time and pass user info
routes.get('/me', getLoggedInUser)

// verify id check
routes.get('/verify/:id', verifyMessageSend)
routes.post('/verifyuser', verifyByCode)
routes.get('/verifyuserLink', verifyByLink)
routes.post('/updatepassemailsend', updatePassMailsend)
routes.post('/updatepasstokencheck', PassUpTokenCheck)
routes.post('/updatepassword', updatePassword)

routes.route('/').get(getAllUser).post(addNewUser)
routes.route('/:id').get(getSingleUser).put(updateUser).patch(updateUser).delete(deleteUser)

// AUTH
routes.route('/login').post(loginUser)






export default routes;