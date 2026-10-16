import express from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./authMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";
import { userModel, organisationModel, boardModel, issueModel } from "./models.js"

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/frontend/signup.html");
})
app.get("/signin", (req, res) => {
    res.sendFile(__dirname + "/frontend/signin.html");
})
app.get("/onboarding", (req, res) => {
    res.sendFile(__dirname + "/frontend/onboarding.html");
})
app.get("/addtoorg", (req, res) => {
    res.sendFile(__dirname + "/frontend/organisation.html");
})
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/frontend/boards.html");
})
app.get("/createboard", (req, res) => {
    res.sendFile(__dirname + "/frontend/createboard.html");
})
app.get("/issue", (req, res) => {
    res.sendFile(__dirname + "/frontend/issue.html");
})

app.get("/createissue", (req, res) => {
    res.sendFile(__dirname + "/frontend/createIssue.html");
})

app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    //const userExists = users.find(u => u.username === username);

    const userExists = await userModel.findOne({
        username: username
    });

    if (userExists) {
        res.status(411).json({
            message: "User with this username already exists"
        })
        return;
    }

    // users.push({
    //     id: USER_ID++,
    //     username: username,
    //     password: password
    // })

    const newUser = await userModel.create({
        username: username,
        password: password
    })

    res.json({
        id: newUser._id,
        message: "User signed up successfully"
    })
});

app.post("/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    //const userExists = users.find(u => u.username === username && u.password === password);
    const userExists = await userModel.findOne({
        username: username,
        password: password
    });

    if (!userExists) {
        res.status(403).json("Incorrect credentials");
        return;
    }

    const token = jwt.sign({
        userId: userExists._id
    }, "Dhanik123")

    res.json({
        token: token
    })
})

//AUTHENTICATED ENDPOINT
app.post("/organisation", authMiddleware, async (req, res) => {
    const orgName = req.body.orgName;
    const orgDesc = req.body.orgDesc;
    const userId = req.userId;

    const newOrg = await organisationModel.create({
        name: orgName,
        desc: orgDesc,
        admin: userId,
        members: []
    })

    // organisations.push({
    //     id: ORGANISATION_ID++,
    //     name: orgName,
    //     desc: orgDesc,
    //     admin: userId,
    //     members: []
    // })

    res.json({
        message: "Organisation created successfully",
        id: newOrg._id
    })
})

app.get("/organisations", authMiddleware, async (req, res) => {
    const userId = req.userId;

    const organisations = await organisationModel.find({
        $or: [
            { admin: userId },
            { members: userId }
        ]
    }).select("name desc admin");

    res.json({
        organisations: organisations
    });
})

app.post("/add-members-to-organisation", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const orgId = req.body.orgId;
    const memberUsername = req.body.memberUsername;

    //const organisation = organisations.find(org => org.id === orgId);

    const organisation = await organisationModel.findOne({
        _id: orgId
    })

    if (!organisation || !organisation.admin.equals(userId)) {
        res.json({
            message: "Either organisation deoesn't exists or you are not the admin of this organisation"
        })
        return;
    }

    //const member = users.find(u => u.username === memberUsername);
    const member = await userModel.findOne({
        username: memberUsername
    })

    if (!member) {
        res.status(411).json({
            message: "User doesn't exists"
        })
        return;
    }

    if (organisation.members.some(id => id.equals(member._id))) {
        return res.status(409).json({
            message: "This user is already a member of the organisation"
        });
    }

    organisation.members.push(member._id);
    await organisation.save();

    res.json({
        message: "New member added"
    })
})

app.post("/board", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const orgId = req.body.orgId;
    const boardTitle = req.body.boardTitle;

    //const orgExists = organisations.find(org => org.id === orgId);
    const orgExists = await organisationModel.findOne({
        _id: orgId
    })
    if (!orgExists) {
        res.status(411).json({
            message: "Organisation Doesn't Exists"
        })
        return;
    }

    if (!orgExists.admin.equals(userId)) {
        res.status(411).json({
            message: "You are not admin of this org"
        })
        return;
    }

    // boards.push({
    //     id: BOARD_ID++,
    //     title: boardTitle,
    //     organisationId: orgId
    // })

    const newBoard = await boardModel.create({
        title: boardTitle,
        organisationId: orgId
    })

    res.json({
        message: "Board created successfully",
        id: newBoard._id
    })
})

app.post("/issue", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const issueTitle = req.body.issueTitle;
    const boardId = req.body.boardId;
    const state = req.body.status;

    //const boardExists = boards.find(b => b.id === boardId);

    const boardExists = await boardModel.findOne({
        _id: boardId
    })

    if (!boardExists) {
        res.status(403).json({
            message: "Board doesn't exists"
        })
        return;
    }

    // const organisation = organisations.find(
    //     org => org.id === boardExists.organisationId
    // );

    const organisation = await organisationModel.findOne({
        _id: boardExists.organisationId
    })

    // const isMember = organisation.members.find(
    //     memberId => memberId === userId
    // );

    const isMember = organisation.members.some(memberId => memberId.equals(userId))

    const isAdmin = organisation.admin.equals(userId);

    if (!isMember && !isAdmin) {
        res.status(411).json({
            message: "You are not permitted to create the issue"
        });
        return;
    }

    // issues.push({
    //     id: ISSUE_ID++,
    //     title: issueTitle,
    //     boardId: boardId,
    //     state: state
    //})

    await issueModel.create({
        title: issueTitle,
        boardId: boardId,
        state: state
    })

    res.json({
        message: "Issue created successfully"
    })
})

app.get("/organisation", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const organisationId = req.query.orgId;

    //const organisation = organisations.find(org => org.id === organisationId);
    const organisation = await organisationModel.findById(organisationId);

    if (!organisation || !organisation.admin.equals(userId)) {
        res.json({
            message: "Either organisation deoesn't exists or you are not the admin of this organisation"
        })
        return;
    }

    res.json({
        organisation: {
            ...organisation.toObject(),
            members: await Promise.all(
                organisation.members.map(async memberId => {
                    const user = await userModel.findById(memberId);

                    return {
                        id: user._id,
                        username: user.username
                    };
                })
            )
        }
    })
})

app.get("/boards", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const orgId = req.query.orgId;

    //const org = organisations.find(org => org.id === orgId);
    const org = await organisationModel.findById(orgId)

    if (!org) {
        res.json({
            message: "Organisation doesn't exist"
        });
        return;
    }

    // const isMember = org.members.find(
    //     memberId => memberId === userId
    // );
    const isMember = org.members.some(memberId => memberId.equals(userId))

    const isAdmin = org.admin.equals(userId);

    if (!isMember && !isAdmin) {
        res.status(411).json({
            message: "You are not permitted to view the board"
        });
        return;
    }

    // const organisationBoards = boards.filter(
    //     board => board.organisationId === orgId
    // );
    const organisationBoards = await boardModel.find({
        organisationId: org._id
    })

    res.json({
        organisationBoards: organisationBoards
    })
})

app.get("/issues", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const boardId = req.query.boardId;

    //const board = boards.find(b => b.id === boardId);
    const board = await boardModel.findById(boardId);

    if (!board) {
        res.status(411).json({
            message: "Board doesn't exist"
        });
        return;
    }

    // const organisation = organisations.find(
    //     org => org.id === board.organisationId
    // );
    const organisation = await organisationModel.findById(board.organisationId);

    // const isMember = organisation.members.find(
    //     memberId => memberId === userId
    // );

    const isMember = organisation.members.some(memberId => memberId.equals(userId))

    const isAdmin = organisation.admin.equals(userId);

    if (!isMember && !isAdmin) {
        res.status(411).json({
            message: "You are not permitted to view the issues"
        });
        return;
    }

    const issuesOfBoard = await issueModel.find({
        boardId: board._id
    });

    res.json({
        issuesOfBoard: issuesOfBoard
    })
})

app.get("/members", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const orgId = (req.query.orgId);

    //const org = organisations.find(org => org.id === orgId);
    const org = await organisationModel.findById(orgId);

    if (!org) {
        res.json({
            message: "Organisation doesn't exist"
        });
        return;
    }

    const isMember = org.members.find(
        memberId => memberId.equals(userId)
    );

    const isAdmin = org.admin.equals(userId);

    if (!isMember && !isAdmin) {
        res.status(411).json({
            message: "You are not permitted to view the members"
        });
        return;
    }

    const members = await Promise.all(
        org.members.map(async memberId => {
            const user = await userModel.findById(memberId);

            return {
                id: user._id,
                username: user.username
            };
        })
    );

    res.json({
        members: members
    });
})

app.put("/issue", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const issueId = req.query.issueId;
    const issueState = req.body.issueState;

    //const searchIssue = issues.find(i => i.id === issueId);
    const searchIssue = await issueModel.findById(req.query.issueId)

    if (!searchIssue) {
        res.status(411).json({
            message: "Issue dosen't Exists"
        })
        return;
    }

    const findBoard = await boardModel.findById(searchIssue.boardId);
    if (!findBoard) {
        res.status(404).json({ message: "Board doesn't exist" });
        return;
    }
    const findOrg = await organisationModel.findById(findBoard.organisationId);
    if (!findOrg) {
        res.status(404).json({ message: "Organisation doesn't exist" });
        return;
    }
    const isMember = findOrg.members.find(memberId => memberId.equals(userId));
    const isAdmin = findOrg.admin.equals(userId);

    if (!isMember && !isAdmin) {
        res.status(411).json({
            message: "You are not permitted to view the members"
        });
        return;
    }

    console.log(issueState);

    searchIssue.state = issueState;
    await searchIssue.save();

    res.json({
        message: "Issue updated successfully"
    })
})

app.delete("/members", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const orgId = req.body.orgId;
    const memberUsername = req.body.memberUsername;

    //const organisation = organisations.find(org => org.id === orgId);
    const organisation = await organisationModel.findById(orgId);

    if (!organisation || !organisation.admin.equals(userId)) {
        res.status(411).json({
            message: "Either this org doesn't exists or you are not the org admin"
        })
        return;
    }

    //const memberUser = users.find(usr => usr.username === memberUsername);
    const memberUser = await userModel.findOne({
        username: memberUsername
    })

    if (!memberUser) {
        res.status(411).json({
            message: "User doesn't exists"
        })
        return;
    }

    // const response = await organisation.updateOne({
    //     _id: orgId
    // }, {
    //     $pull: {
    //         "members": memberUser._id
    //     }
    // })

    organisation.members = organisation.members.filter(u => !u.equals(memberUser._id));
    await organisation.save();

    res.json({
        message: "Member removed successfully"
    });
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})
