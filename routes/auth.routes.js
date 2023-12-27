const router = require("express").Router();
const User = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const saltRounds = 10;

router.get("/signup", (req, res) => {
	res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
	const { username, password } = req.body;
	// console.log("password -->", password);
	bcryptjs.genSalt(saltRounds)
		.then((salt) => bcryptjs.hash(password, salt))
		.then((hashedPassword) => {
			// console.log("hashed password -->", hashedPassword);
			return User.create({ username, hashedPassword }).then((newUserInDB) => {
				console.log("Newly created user is: ", newUserInDB);
			});
		})
		.catch((err) => {
			next(err);
		});
});

module.exports = router;
