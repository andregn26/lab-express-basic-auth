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

	// make sure users fill all mandatory fields:
	if (!username || !password) {
		res.render("auth/signup", { errorMessage: "All fields are mandatory. Please provide your username and password." });
		return;
	}

	// make sure passwords are strong:
	const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
	if (!regex.test(password)) {
		res.status(500).render("auth/signup", {
			errorMessage:
				"Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.",
		});
		return;
	}
	bcryptjs.genSalt(saltRounds)
		.then((salt) => bcryptjs.hash(password, salt))
		.then((hashedPassword) => {
			// console.log("hashed password -->", hashedPassword);
			return User.create({ username, hashedPassword }).then((newUserInDB) => {
				console.log("Newly created user is: ", newUserInDB);
			});
		})
		.catch((err) => {
			if (err.code === 11000) {
				res.status(500).render("auth/signup", {
					errorMessage: "Username need to be unique. Username is already used.",
				});
			}
			next(err);
		});
});

router.get("/login", (req, res) => {
	res.render("auth/login");
});

router.post("/login", (req, res) => {
	const { username, password } = req.body;
	console.log("SESSION =====> ", req.session);

	if (username === "" || password === "") {
		res.render("auth/login", { errorMessage: "Please enter both, email and password to login." });
		return;
	}

	User.findOne({ username }).then((userFoundInDB) => {
		if (!userFoundInDB) {
			//logic for user not founded
			res.render("auth/login", { errorMessage: "Email is not registered. Try with other email." });
		} else if (bcryptjs.compareSync(password, userFoundInDB.hashedPassword)) {
			req.session.currentUser = userFoundInDB;
			res.redirect("/my-profile");
		} else {
			// password does not match
			res.render("auth/login", { errorMessage: "Incorrect password." });
		}
	});
});

router.post("/logout", (req, res, next) => {
	req.session.destroy((err) => {
		if (err) next(err);
		res.redirect("/");
	});
});

module.exports = router;
