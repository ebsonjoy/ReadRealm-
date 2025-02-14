import asyncHandler from "express-async-handler";
import User  from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const register = asyncHandler(async(req,res)=>{

    try {
        const { firstName, lastName, phone, email, dob, password, preferences } = req.body;
        const existingUser = await User.findOne({$or:[{email},{phone}]});
        if (existingUser) {
            return res.status(400).json({ message: "Email or phone already in use." });
          }
          const newUser = await User.create({
            firstName,
            lastName,
            phone,
            email,
            dob,
            password,
            preferences,
          });
          res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
})

const login = asyncHandler(async(req,res)=>{
    try {
        const { emailOrPhone, password } = req.body;
        const user = await User.findOne({$or:[{email:emailOrPhone},{phone:emailOrPhone}]});
        if (!user) {
            return res.status(400).json({ message: "Invalid email/phone or password." });
          }

          if(user &&(await user.matchPassword(password))){
            const token = generateToken(res, user._id);
            res.status(200).json({message:'login successfully',userData:{
              _id: user._id,
              name: user.firstName,
              email: user.email,},
              token
            })
          }else{
            return res.status(400).json({ message: "Invalid email/phone or password." });

          }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error", error });


    }

})

const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "User Logged Out" });
  });

  const getUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findById(userId).select('-password').populate('preferences');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
  
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });


  const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, phone, email, dob, preferences } = req.body;
        if (email) {
          const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
          if (existingUser) {
              return res.status(400).json({ message: 'Email already in use' });
          }
      }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (email) user.email = email;
        if (dob) user.dob = dob;
        if (preferences) user.preferences = preferences;
        await user.save();
        res.json({ message: 'Profile updated successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const changePassword = asyncHandler(async (req, res) => {
  try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
          return res.status(400).json({ message: 'Incorrect old password' });
      }

      if(newPassword){
        user.password = newPassword
      }
      await user.save();
      res.json({ message: 'Password updated successfully' });

  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

export {register,login,logoutUser,getUser,updateUserProfile,changePassword}