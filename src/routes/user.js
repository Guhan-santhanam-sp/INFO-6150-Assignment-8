const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const upload = require("../middleware/upload");

/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create a new user
 *     description: This API allows you to create a new user by providing email, full name, and password.
 *     operationId: createUser
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: "johndoe@example.com"
 *               fullName:
 *                 type: string
 *                 description: The full name of the user
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: "Password123!"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation failed or email already registered
 *       500:
 *         description: Server error
 */

router.post(
  "/create",
  [
    check("email").isEmail().normalizeEmail(),
    check("fullName").matches(/^[A-Za-z\s]+$/),
    check("password").isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
      });
    }

    try {
      const { fullName, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      console.error("Creation error:", err);
      res.status(500).json({
        error: "User creation failed",
        details: err.message,
      });
    }
  }
);

/**
 * @swagger
 * /edit:
 *   put:
 *     summary: edit a existing user
 *     description: This API allows you to edit a existing user by providing  full name, and password.
 *     operationId: editUser
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: "johndoe@example.com"
 *               fullName:
 *                 type: string
 *                 description: The full name of the user
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: "Password123!"
 *     responses:
 *       201:
 *         description: User updated successfully
 *       400:
 *         description: Validation failed or user does not exist
 *       500:
 *         description: Server error
 */
router.put(
  "/edit",
  [
    check("fullName").matches(/^[A-Za-z\s]+$/),
    check("password").isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
      });
    }

    try {
      const { fullName, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.fullName = fullName;
      existingUser.password = hashedPassword;
      console.log(existingUser.fullName);
      await existingUser.save();

      res.status(200).json({ message: "User updated successfully." });
    } catch (err) {
      console.error("Updation error:", err);
      res.status(500).json({
        error: "User Updation failed",
        details: err.message,
      });
    }
  }
);

/**
 * @swagger
 * /delete:
 *   delete:
 *     summary: delete a existing user
 *     description: This API allows you to delete a existing user by providing  full name, and password.
 *     operationId: deleteUser
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: "johndoe@example.com"
 *               fullName:
 *                 type: string
 *                 description: The full name of the user
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: "Password123!"
 *     responses:
 *       201:
 *         description: User deleted successfully
 *       400:
 *         description: Validation failed or user does not exist
 *       500:
 *         description: Server error
 */
router.delete(
  "/delete",
  [check("email").isEmail().normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
      });
    }

    try {
      const { email } = req.body;

      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      await existingUser.deleteOne();

      res.status(200).json({ message: "User deletion successful." });
    } catch (err) {
      console.error("deletion error:", err);
      res.status(500).json({
        error: "User deletion failed",
        details: err.message,
      });
    }
  }
);

/**
 * @swagger
 * /getAll:
 *   get:
 *     summary: delete a existing user
 *     description: This API allows you to delete a existing user by providing  full name, and password.
 *     operationId: deleteUser
 *     tags:
 *       - User
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: "johndoe@example.com"
 *               fullName:
 *                 type: string
 *                 description: The full name of the user
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: "Password123!"
 *     responses:
 *       201:
 *         description:
 *       500:
 *         description: Server error
 */

router.get("/getAll", async (req, res) => {
  try {
    const users = await User.find({}, "fullName email password ");
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({ error: "Server error" });
  }
});


/**
 * @swagger
 * /uploadImage:
 *   post:
 *     summary: upload Profile Picture to existing user
 *     description: This API allows you to upload Profile Picture to existing user
 *     operationId: uploadImage
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: "johndoe@example.com"
 *               fullName:
 *                 type: string
 *                 description: The full name of the user
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 description: The password of the user
 *                 example: "Password123!"
 *     responses:
 *       201:
 *         description: Image uploaded successfully.
 *       400:
 *         description: Image already exists for this user.
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.post(
  "/uploadImage",
  upload.single("image"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
      });
    }

    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (user.imagePath) {
        return res
          .status(400)
          .json({ error: "Image already exists for this user." });
      }

      // Save the file path in the user's document
      user.imagePath = req.file.path;
      await user.save();

      res.status(201).json({
        message: "Image uploaded successfully.",
        filePath: `/images/${req.file.filename}`,
      });
    } catch (err) {
      if (err.message.includes("Invalid file format")) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Server error." });
    }
  }
);

module.exports = router;
