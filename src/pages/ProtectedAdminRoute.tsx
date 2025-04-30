import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { Spinner } from "react-bootstrap";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate("/");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (!userDoc.exists() || userDoc.data()?.role !== "admin") {
        navigate("/");
      } else {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  if (loading) {
    return <Spinner animation="border" />;
  }

  return <>{children}</>;
}

export default ProtectedAdminRoute;
