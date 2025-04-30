import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { Container, Button, Table, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

interface UserType {
  id: string;
  email: string;
  role: string;
}

function AdminDashboard() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return navigate("/");

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists() || userDoc.data()?.role !== "admin") {
          console.error("Unauthorized access. Not an admin.");
          return navigate("/practice"); // safer default
        }

        const snapshot = await getDocs(collection(db, "users"));
        const userList = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as UserType[];

        setUsers(userList);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;

    try {
      // 1. Delete user profile from Firestore
      await deleteDoc(doc(db, "users", userId));

      // 2. Delete user authentication account via backend
      await axios.post("http://localhost:5001/deleteUser", { uid: userId });


      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user from auth. You must be an admin.");
    }
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4 text-center">Admin Dashboard - User Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role || "user"}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default AdminDashboard;
