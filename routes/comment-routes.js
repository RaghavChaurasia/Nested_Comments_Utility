const router = require("express").Router();
const commentCtrl = require("../controllers/comment-controller");

router.post("/add", commentCtrl.addComment, commentCtrl.getComments);

router.post("/edit", commentCtrl.updateComment, commentCtrl.getComments);

router.get("/get", commentCtrl.getComments);

module.exports = router;