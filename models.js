import mongoose from "mongoose";
import "dotenv/config";

mongoose.connect(process.env.MONGODB_URL);

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

const organisationSchema = new mongoose.Schema({
    name: String,
    desc: String,
    admin: mongoose.Schema.Types.ObjectId,
    members: [mongoose.Schema.Types.ObjectId]
})

const boards = new mongoose.Schema({
    title: String,
    organisationId: mongoose.Schema.Types.ObjectId
})

const issues = new mongoose.Schema({
    title: String,
    boardId: mongoose.Schema.Types.ObjectId,
    state: String
})

const userModel = mongoose.model("users", UserSchema);
const organisationModel = mongoose.model("organisations", organisationSchema);
const boardModel = mongoose.model("boards", boards);
const issueModel = mongoose.model("issues", issues);

export { userModel, organisationModel, boardModel, issueModel };