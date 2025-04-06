import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Props {
  show: boolean;
  onHide: () => void;
  onSave: () => void; // ✅ NEW: callback to trigger after saving
  job: {
    id: string;
    job_title: string;
    employer_name: string;
    status: string;
    documents?: string[];
  };
  userId: string;
}

function JobStatusModal({ show, onHide, onSave, job, userId }: Props) {
  const [status, setStatus] = useState(job.status);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    const jobRef = doc(db, "users", userId, "applied_jobs", job.id);
    const update: any = { status };

    if (file) {
      setUploading(true);
      const fakeUrl = `https://fake-url.com/${file.name}`; // Replace with real upload logic
      update.documents = arrayUnion(fakeUrl);
    }

    await updateDoc(jobRef, update);
    setUploading(false);
    onSave(); // ✅ Notify parent of save
    onHide();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      setFile(input.files[0]);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Update Job Application</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>{job.job_title}</strong> @ {job.employer_name}
        </p>

        <Form.Group>
          <Form.Label>Status</Form.Label>
          <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="applied">Applied</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="ghosted">Ghosted</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>Upload Document (Optional)</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>

        {Array.isArray(job.documents) && job.documents.length > 0 && (
  <div className="mt-3">
    <strong>Uploaded Documents:</strong>
    {job.documents.map((doc, i) => (
      <div key={i}>
        <a href={doc} target="_blank" rel="noreferrer">
          📎 Document {i + 1}
        </a>
      </div>
    ))}
  </div>
)}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={uploading}>
          {uploading ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default JobStatusModal;
