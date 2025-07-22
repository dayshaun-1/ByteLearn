import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import validator from 'validator'
import Stripe from "stripe";
import Course from "../models/course.js";
import Purchase from "../models/purchase.js";


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, isEducator: user.isEducator },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, isEducator: user.isEducator });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const signupUser = async (req, res) => {
  const { name, email, password, isEducator } = req.body;
  try {
    const exists = await User.findOne({ email: email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter valid Email" });
    }

    if (password.length < 4) {
      return res.json({ success: false, message: "Enter minimum 4 digit password" });
    }

    // hasing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      isEducator
    });

    const token = jwt.sign(
      { id: newUser._id, isEducator: newUser.isEducator },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, isEducator: newUser.isEducator });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

export const becomeEducator = async (req, res) => {
  try {
    const { userId } = req.user;
    await User.findByIdAndUpdate(userId, { isEducator: true });
    const token = jwt.sign(
      { id: req.user.userId, isEducator: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, message: "Role Updated To Educator", token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found!' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const userEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.user;

    const userData = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'enrolledCourses',
        // select: 'courseTitle courseThumbnail coursePrice isPublished', // optional projection
      })
      .lean();

    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found!' });
    }

    return res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// export const purchaseCourse = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const { userId } = req.user;

//     // 1. Validate user
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // 2. Validate course
//     const course = await Course.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     // 3. Check if already enrolled
//     if (user.enrolledCourses.includes(courseId)) {
//       return res.status(400).json({ success: false, message: "Already enrolled in this course." });
//     }

//     // 4. Calculate discounted price (rounded to 2 decimals)
//     const discount = course.discount || 0;
//     const originalPrice = course.coursePrice;
//     const discountedAmount = Number((originalPrice * (1 - discount / 100)).toFixed(2));

//     // 5. Create Purchase
//     const purchase = await Purchase.create({
//       courseId,
//       userId,
//       amount: discountedAmount,
//       status: 'pending',
//     });

//     // 6. Simulate payment outcome
//     const paymentSuccess = Math.random() < 0.7;

//     if (paymentSuccess) {
//       // Update enrollment
//       user.enrolledCourses.push(courseId);
//       course.enrolledStudents.push(userId);

//       // Save updates
//       await user.save();
//       await course.save();

//       // Update purchase status
//       purchase.status = 'completed';
//       await purchase.save();

//       return res.status(200).json({ success: true, message: "Payment successful" });
//     } else {
//       // Mark payment as failed (optional: store failure reason)
//       purchase.status = 'failed';
//       await purchase.save();

//       return res.status(400).json({ success: false, message: "Payment failed" });
//     }

//   } catch (error) {
//     console.error("Purchase error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const { userId } = req.user;

    const userData = await User.findById(userId);
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }
    const courseData = await Course.findById(courseId);
    if (!courseData) {
      return res.json({ success: false, message: "Course not found" });
    }

    // Check if already enrolled
    if (userData.enrolledCourses.includes(courseId)) {
      return res.json({ success: false, message: "Already enrolled in this course." });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: Number((courseData.coursePrice * (1 - 0.01 * courseData.discount)).toFixed(2)),
    }

    const newPurchase = await Purchase.create(purchaseData);

    // Stripe Gateway Initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY.toLowerCase();

    const line_items = [{
      price_data: {
        currency,
        product_data: {
          name: courseData.courseTitle
        },
        unit_amount: Math.floor(newPurchase.amount * 100)
      },
      quantity: 1
    }]

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}`,
      line_items: line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString()
      }
    })

    if (!session.url) {
      return res.status(400).json({ success: false, message: "Error while creating session" });
    }

    res.json({ success: true, session_url: session.url })
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}
