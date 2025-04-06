import { useEffect } from "react";
import { uploadDSAQuestions } from "../lib/firebase";
import questions from "../data/leetcode_qns.json";

function UploadQuestions() {
  useEffect(() => {
    uploadDSAQuestions(questions).then(() => {
      console.log("✅ Upload complete");
    }).catch((error) => {
      console.error("❌ Upload error", error);
    });
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Uploading questions to Firestore...</h2>
      <p>If nothing happens, check the console for errors.</p>
    </div>
  );
}

export default UploadQuestions;
