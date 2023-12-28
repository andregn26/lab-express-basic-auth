const router = require("express").Router();

router.get("/my-profile", (req, res) => {
	res.render("users/user-profile", { userInSession: req.session.currentUser });
});

module.exports = router;
