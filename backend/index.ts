import express, { Request, Response } from "express";
import * as admin from "firebase-admin";
import cors from "cors";
import serviceAccount from "./hustlehub-3db32-firebase-adminsdk-fbsvc-7d025e933d.json";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["POST"],
  credentials: true,
}));
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

// 👇 MAIN HANDLER - without returning Promise
app.post("/deleteUser", (req: Request, res: Response) => {
  const { uid } = req.body;

  if (!uid) {
    res.status(400).json({ error: "UID missing." });
    return;
  }

  admin.auth().deleteUser(uid)
    .then(() => {
      console.log(`✅ Deleted user ${uid}`);
      res.json({ message: "User deleted successfully." });
    })
    .catch((error) => {
      console.error("❌ Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user from Firebase Auth." });
    });
});

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
