import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/users.js';
import { userSendMail } from './userSendMail.js';

const { DEFAULT_CLIENT_URL } = process.env;

// check password and confirmPassword
function isMatch(password, confirm_password) {
    return password === confirm_password;
}

// validate email
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// validate password
function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    return re.test(password);
}

// create activation token
function createActivationToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
}

// create refresh token
function createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
}

// user sign-up (register & send activation email)
export const signUp = async (req, res) => {
    try {
        const { personal_id, name, email, password, confirmPassword, address, phone_number } = req.body;

        if (!personal_id || !name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        if (name.length < 3) return res.status(400).json({ message: "Your name must be at least 3 letters long" });

        if (!isMatch(password, confirmPassword)) return res.status(400).json({ message: "Password did not match" });

        if (!validateEmail(email)) return res.status(400).json({ message: "Invalid email" });

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter"
            });
        }

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "This email is already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create activation token
        const activation_token = createActivationToken({
            personal_id,
            name,
            email,
            password: hashedPassword,
            address,
            phone_number
        });

        const url = `${DEFAULT_CLIENT_URL}/user/activate/${activation_token}`;

        await userSendMail(email, url, "Verify your email address", "Activate Account");

        res.json({ message: "Register Success! Please check your email to activate your account." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// email activation
export const activateEmail = async (req, res) => {
    try {
        const { activation_token } = req.body;
        const user = jwt.verify(activation_token, process.env.REFRESH_TOKEN_SECRET);

        const { personal_id, name, email, password, address, phone_number } = user;

        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "This email already exists." });
        }

        const newUser = new Users({
            personal_id,
            name,
            email,
            password,
            address,
            phone_number
        });

        await newUser.save();

        res.json({ message: "Account has been activated. Please login now!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// user sign-in
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).json({ message: "Please fill in all fields" });

        const user = await Users.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        // No need to check isVerified, since only activated users are in the database

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const refresh_token = createRefreshToken({ id: user._id });

        const expiry = 24 * 60 * 60 * 1000; // 1 day

        res.cookie('refreshtoken', refresh_token, {
            httpOnly: true,
            path: '/api/user/refresh_token',
            maxAge: expiry,
            expires: new Date(Date.now() + expiry)
        });

        // Return the token in the response for frontend auth
        res.json({
            message: "Sign In successfully!",
            token: refresh_token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// get user info
export const userInfor = async (req, res) => {
    try {
        const userId = req.user.id;
        const userInfor = await Users.findById(userId).select("-password");
        res.json(userInfor);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = await Users.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User updated", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Users.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};