import { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { doc, setDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const applicationStatuses = ["accepted", "rejected", "ghosted"] as const;
type JobApplicationStatus = typeof applicationStatuses[number];

interface ModalJobData {
  id: string;
  job_title?: string;
  employer_name?: string;
  status: JobApplicationStatus;
  documents?: string[];
}

interface Props {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  job: ModalJobData | null;
  userId: string;
}

function JobStatusModal({ show, onHide, onSave, job, userId }: Props) {
  const [status, setStatus] = useState<JobApplicationStatus>("accepted");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setStatus(job.status);
      setFile(null);
      setError(null);
    }
  }, [job]);

  const handleSave = async () => {
    if (!job) {
      setError("No job selected.");
      return;
    }

    setSaving(true);
    setError(null);

    const jobRef = doc(db, "users", userId, "applied_jobs", job.id);

    try {
      const updateData = {
        status,
        updatedAt: Timestamp.now(),
        job_id: job.id,
        job_title: job.job_title || "N/A",
        employer_name: job.employer_name || "N/A",
      };

      // Save job details
      await setDoc(jobRef, updateData, { merge: true });

      // Upload document if selected
      if (file) {
        const storage = getStorage();
        const filePath = `documents/${userId}/${job.id}/${file.name}`;
        const fileRef = ref(storage, filePath);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);

        await updateDoc(jobRef, {
          documents: arrayUnion(downloadURL)
        });
      }

      onSave(); // Refresh parent
      onHide();
    } catch (err) {
      console.error("Upload/save error:", err);
      setError("Could not upload document or save changes.");
    } finally {
      setSaving(false);
      setFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
  };

  const handleClose = () => {
    setError(null);
    onHide();
  };

  if (!job) return null;

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Update Job Application</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>{job.job_title || "N/A"}</strong> @ {job.employer_name || "N/A"}</p>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={status}
            onChange={(e) => setStatus(e.target.value as JobApplicationStatus)}
            disabled={saving}
          >
            {applicationStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload Document (optional)</Form.Label>
          <Form.Control
            type="file"
            onChange={handleFileChange}
            disabled={saving}
            accept=".pdf,.doc,.docx,.txt,.jpg,.png"
          />
          {file && <small className="text-muted mt-1 d-block">📎 {file.name}</small>}
        </Form.Group>

        {Array.isArray(job.documents) && job.documents.length > 0 && (
          <div className="mt-3 border-top pt-3">
            <strong>Uploaded Documents:</strong>
            {job.documents.map((doc, i) => (
              <div key={i} className="d-flex justify-content-between">
                <a
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-success text-truncate"
                  style={{ maxWidth: "85%" }}
                >
                  📄 Document {i + 1}
                </a>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner as="span" animation="border" size="sm" /> : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default JobStatusModal;
