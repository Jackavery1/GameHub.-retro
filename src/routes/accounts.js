const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const ctrl = require("../controllers/accountsController");

router.get("/", ensureAuth, ctrl.index);
router.get("/access", ensureAuth, ctrl.generateAccess);
router.post("/link", ensureAuth, ctrl.link);
router.post("/unlink", ensureAuth, ctrl.unlink);

module.exports = router;
