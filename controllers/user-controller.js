const User = require('../models/usersModel').User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 8;
const maxAge = 3*60*60;

const createToken = (payload) => {
    return jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: maxAge });
}

const registerUser = async (req, res, next) => {
    try {
        await User.findOne({username: req.body.username})
        .exec()
        .then((foundUser) => {
            if(foundUser){
                return res.status(201).json({
                    status: 409,
                    message: "username already exists"
                })
            }
            else{
                bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                    if (err) {
                        console.log(err); 
                        return res.status(500).json({
                            status: 500,
                            message: err
                        });
                    }
                    else{
                        const user = new User({
                            username: req.body.username,
                            password: hash
                        })
                        user.save()
                        .then((newUser) => {
                            const payload = { id: newUser._id, name: newUser.username };
                            const token = createToken(payload);
                            res.cookie("JWToken", token, { httpOnly: true, maxAge: maxAge*1000 });
                            return res.status(201).json({
                                status: 201,
                                message: "user registered succesfully",
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.status(500).json({
                                status: 500,
                                message: err
                            });
                        })
                    }
                });
            }
        })
    } 
    catch (err) {
        console.log(err); 
        return res.status(500).json({
            status: 500,
            message: err
        });
    }
}

const loginUser = async (req, res, next) => {
    try {
        await User.findOne({username: req.body.username})
        .exec()
        .then((foundUser) => {
            if(foundUser){
                bcrypt.compare(req.body.password, foundUser.password, (err, match) => {
                    if(err){
                        console.log(err); 
                        return res.status(500).json({
                            status: 500,
                            message: err
                        });
                    }
                    else if(!match){
                        return res.status(401).json({
                            status: 401,
                            message: "incorrect username or password"
                        });
                    }
                    else{
                        const payload = { id: foundUser._id, name: foundUser.username };
                        const token = createToken(payload);
                        res.cookie("JWToken", token, { httpOnly: true, maxAge: maxAge*1000 });
                        return res.status(201).json({
                            status: 201,
                            message: "user logged in successfully"
                        });
                    }
                });
            }
            else{
                return res.status(401).json({
                    status: 401,
                    message: "incorrect username or password"
                });
            }
        })
    } 
    catch (err) {
        console.log(err); 
        return res.status(500).json({
            status: 500,
            message: err
        });
    }
}

const logoutUser = async (req, res, next) => {
    res.cookie("JWToken", "", {maxAge: 10});
    res.redirect("/");
}

module.exports = {
    loginUser,
    registerUser,
    logoutUser
}


