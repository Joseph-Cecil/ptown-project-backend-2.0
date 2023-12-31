const User = require("../models/User")
const Order = require("../models/Order");
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcrypt');

//Getting all users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if(!users?.length){
        return res.status(400).json({message: "No users found"})
    }
    res.json(users)
})


//Creating a new user
const createNewUser = asyncHandler(async (req, res) => {
 
    const {username, password, roles} = req.body;

//Confirming incoming data
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({message: "All fields are required"})
    }

//Checking for already in use usernames
    const duplicate = await User.findOne({username}).lean().exec();

    if(duplicate){
       return res.status(409).json({message: "Username is already in use, Please use use another name"})
    }


//Encrypting the password
    const hashedPassword = await bcrypt.hash(password, 10)

    const userObject = {username, "password": hashedPassword, roles}

// Creating and saving new user 
    const user = await User.create(userObject);

    if(user){
        res.status(201).json({message: `New User ${username} has been created`})
    }else{
        res.status(400).json({message: "Invalid user data recieved"})
    }
})



//Updating user info
const updateUser = asyncHandler(async(req, res) => {
    const {id, username, roles, active, password} = req.body

    //confirming data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
        return res.status(400).json({message: "All fields are required"})
    }

    const user = await User.findById(id).exec();

    if(!user){
        return res.status(400).json({message: "User not found"})
    }

    //check for duplicates
    const duplicate = await User.findOne({username}).lean().exec();

    // Allow updates to the original user
    if(duplicate & duplicate?._id.toString() !== id){
        return res.status(409).json({message: "Duplicate username"})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password){
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({message: `${updatedUser.username} updated successfully`})
})

//Deleting a user
const deleteUser = asyncHandler(async(req, res) => {
    const {id} = req.body

    if(!id){
        return res.status(400).json({message: "User id is required to a user and it wasnt found"})
    }

    const order = await Order.findOne({user: id}).lean().exec()
    if(order){
        return res.status(400).json({message: "User has assigned orders"})
    }

    const user = await User.findById(id).exec() 

    if(!user){
        return res.status(400).json({message: 'User not found'})
    }

    const result = await user.deleteOne()

    const reply = `User ${result.username} with ID ${result._id} has been deleted successfully`

    res.json(reply)
})

module.exports ={getAllUsers, createNewUser, updateUser, deleteUser}