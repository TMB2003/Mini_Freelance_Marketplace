import jwt from "jsonwebtoken";
import { User } from "../model/user.js";
import TryCatch from "../tryCatch.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();


export const register = TryCatch(async(req, res) => {
    const {name, email, password} = req.body; 
    let user = await User.findOne({email});

    if(user){
        return res.status(400).json({message: "User already exists"});
    }
    
    const hashPassword = await bcrypt.hash(password, 10);
    user = await User.create({name, email, password: hashPassword});
    
    const token = jwt.sign({id: user._id}, process.env['JWT_SECRET'] as string, {expiresIn: "7d"});

    if(!token){
        return res.status(500).json({message: "Failed to generate token"});
    }
    return res.status(201).json({token});
});

export const login = TryCatch(async(req, res) => {
    const {email, password} = req.body; 
    let user = await User.findOne({email});

    if(!user){
        return res.status(400).json({message: "User not found"});
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(400).json({message: "Invalid password"});
    }
    
    const token = jwt.sign({id: user._id}, process.env['JWT_SECRET'] as string, {expiresIn: "7d"});

    return res.status(201).json({token});
});