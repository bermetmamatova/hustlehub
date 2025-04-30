import { useEffect, useState } from "react";
import { auth, getUserProfile, saveUserProfile } from "../lib/firebase"; 
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Row,
  Col,
  ProgressBar,
  Card,
  Spinner, 
  Alert, 
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion"; 
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'; 
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaCheck, 
  FaBuilding, FaCity, FaClock, FaHourglassHalf, FaBriefcase 
} from "react-icons/fa"; 

const steps = [
  { name: "Job Type", icon: <FaBriefcase /> },
  { name: "Experience", icon: <FaClock /> },
  { name: "Top Companies", icon: <FaBuilding /> },
  { name: "Location", icon: <FaCity /> },
  { name: "Study Time", icon: <FaHourglassHalf /> },
];

const techCompanies = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Salesforce", "Adobe", "Uber", "Airbnb","Cloudera","Wise","Spotify","Bloombrg","IBM",
  "NVIDIA","Genesys","Palantir"
];

const europeanCities = [
  "Berlin", "Paris", "London", "Madrid", "Rome", "Amsterdam", "Dublin", "Zurich", "Munich", "Barcelona", "Vienna", "Stockholm"
];

const primaryColor = "#7A8D63"; 


const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%', 
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};


function UpdatePreferencesPage() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

 
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); 
  const [formData, setFormData] = useState({
    jobType: "",
    experienceYears: "", 
    companies: [] as string[],
    location: "",
    learningHours: 1,
    onboardingComplete: false 
  });
  const [isFetching, setIsFetching] = useState(true); 
  const [isSaving, setIsSaving] = useState(false); 
  const [showConfetti, setShowConfetti] = useState(false); 
  const [error, setError] = useState<string | null>(null); 

  
  useEffect(() => {
    if (!user) {
      navigate("/login"); 
      return;
    }

    setIsFetching(true); 
    setError(null); 
    getUserProfile(user.uid)
      .then((data) => {
        if (data) {
          const initialData = {
              jobType: data.jobType || "",
              experienceYears: "",
              companies: data.companies || [],
              location: data.location || "",
              learningHours: data.learningHours || 1,
              onboardingComplete: data.onboardingComplete || false,
          };
          setFormData(initialData);
        }
      })
      .catch(err => {
          console.error("Error fetching profile:", err);
          setError("Could not load your profile data. Please try again later."); 
      })
      .finally(() => setIsFetching(false)); 

  }, [user, navigate]); 

  const handleNext = () => {
    setDirection(1); 
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1)); 
  };
  const handleBack = () => {
    setDirection(-1); 
    setCurrentStep((s) => Math.max(s - 1, 0)); 
  };

  const handleSave = async () => {
    if (!user) return; 
    setIsSaving(true); 
    setError(null); 
    try { 
      const dataToSave = { ...formData, onboardingComplete: true };
      await saveUserProfile(user.uid, dataToSave); 
      setShowConfetti(true); 
      setTimeout(() => {
          navigate("/mydata", { state: { updated: true } }); 
      }, 3500);
    } catch(err) {
        console.error("Error saving profile:", err);
        setError("Failed to save preferences. Please try again."); 
        setIsSaving(false); 
    }
  };

  const toggleCompany = (company: string) => {
    setFormData((prev) => {
      const exists = prev.companies.includes(company);
      if (exists) {
        return { ...prev, companies: prev.companies.filter((c) => c !== company) };
      } else if (prev.companies.length < 5) {
        return { ...prev, companies: [...prev.companies, company] };
      } else {
        alert("You can select a maximum of 5 companies.");
        return prev;
      }
    });
  };

  const renderStep = () => {
    const commonButtonProps = (isSelected: boolean) => ({
      variant: isSelected ? "hustle-primary" : "outline-secondary",
      className: `w-100 py-3 step-button d-flex align-items-center justify-content-center ${isSelected ? 'selected' : ''}`, 
    });


    const commonColProps = { xs: 12, sm: 6, md: 4, lg: 3 };

    switch (currentStep) {
      case 0: 
        return (
          <>
            <h3 className="step-title mb-3"><FaBriefcase className="me-2"/>Full-time or Part-time?</h3>
            <p className="text-muted mb-4">How much time are you looking to dedicate?</p>
            <Row className="g-3 justify-content-center">
              {["Part time", "Full time"].map((type) => (
                <Col key={type} xs={10} sm={6} md={4}>
                  <Button
                    {...commonButtonProps(formData.jobType === type)}
                    onClick={() => setFormData({ ...formData, jobType: type })}
                  >
                    {type} {formData.jobType === type && <FaCheck className="ms-2"/>}
                  </Button>
                </Col>
              ))}
            </Row>
          </>
        );
      case 1: 
        return (
          <>
            <h3 className="step-title mb-3"><FaClock className="me-2"/>Years of IT Experience?</h3>
            <p className="text-muted mb-4">This helps tailor recommendations for you.</p>
            <Row className="g-3 justify-content-center">
              {["None", "0-2", "2-4", "4+"].map((val) => (
                <Col key={val} xs={6} sm={4} md={3}>
                  <Button
                    {...commonButtonProps(formData.experienceYears === val)}
                    onClick={() => setFormData({ ...formData, experienceYears: val })}
                  >
                    {val} {formData.experienceYears === val && <FaCheck className="ms-2"/>}
                  </Button>
                </Col>
              ))}
            </Row>
          </>
        );
      case 2: 
        return (
          <>
            <h3 className="step-title mb-3"><FaBuilding className="me-2"/>Target Companies? (Max 5)</h3>
             <p className="text-muted mb-4">Select companies you're aiming for.</p>
            <Row className="g-3">
              {techCompanies.map((company) => (
                <Col key={company} {...commonColProps}>
                  <Button
                     {...commonButtonProps(formData.companies.includes(company))}
                     onClick={() => toggleCompany(company)}
                  >
                    {company} {formData.companies.includes(company) && <FaCheck className="ms-2"/>}
                  </Button>
                </Col>
              ))}
            </Row>
          </>
        );
      case 3:
        return (
          <>
            <h3 className="step-title mb-3"><FaCity className="me-2"/>Preferred Work Location?</h3>
             <p className="text-muted mb-4">Where in Europe would you like to work?</p>
            <Row className="g-3">
              {europeanCities.map((city) => (
                <Col key={city} {...commonColProps}>
                  <Button
                     {...commonButtonProps(formData.location === city)}
                     onClick={() => setFormData({ ...formData, location: city })}
                  >
                    {city} {formData.location === city && <FaCheck className="ms-2"/>}
                  </Button>
                </Col>
              ))}
            </Row>
          </>
        );
      case 4: 
        return (
          <>
            <h3 className="step-title mb-3"><FaHourglassHalf className="me-2"/>Daily Study Goal?</h3>
            <p className="text-muted mb-4">How many hours can you realistically commit per day?</p>
            <Row className="g-3 justify-content-center">
              {[1, 2, 3, 4, 5, 6].map((hrs) => ( 
                <Col key={hrs} xs={4} sm={3} md={2}>
                  <Button
                    {...commonButtonProps(formData.learningHours === hrs)}
                    onClick={() => setFormData({ ...formData, learningHours: hrs })}
                  >
                    {hrs}h {formData.learningHours === hrs && <FaCheck className="ms-2"/>}
                  </Button>
                </Col>
              ))}
            </Row>
          </>
        );
      default: 
        return null;
    }
  };

  if (isFetching) {
     return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
              <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem', color: primaryColor }}>
                  <span className="visually-hidden">Loading Preferences...</span>
              </Spinner>
          </Container>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", overflowX: 'hidden' }}> {}
      {}
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} tweenDuration={3000}/>}

      <Container className="py-4 py-lg-5 text-center" style={{ maxWidth: "900px" }}>
        {}
        <div className="progress-container mb-4 mx-auto" style={{ maxWidth: '600px' }}>
            <ProgressBar
                now={((currentStep + 1) / steps.length) * 100} 
                className="mb-2 progress-themed"
                animated={!isSaving} 
                style={{ height: '10px' }}
            />
            {}
            <span className="text-muted small d-flex align-items-center justify-content-center">
                 {steps[currentStep].icon} <span className="mx-2 fw-bold">{steps[currentStep].name}</span> (Step {currentStep + 1} of {steps.length})
            </span>
        </div>

        {}
        {error && <Alert variant="danger" className="my-3">{error}</Alert>}

        {}
        <Card className="border-0 shadow-sm rounded-lg mb-4 preference-card">
            <Card.Body className="p-4 p-lg-5 position-relative" style={{ minHeight: '400px' }}> {}
                {}
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentStep} 
                        custom={direction}
                        variants={stepVariants} 
                        initial="enter" 
                        animate="center" 
                        exit="exit" 
                        transition={{ 
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.3 }
                        }}

                        style={{ position: 'absolute', width: 'calc(100% - 4rem)', left: '2rem' }} 
                    >
                        {renderStep()} {}
                    </motion.div>
                </AnimatePresence>
            </Card.Body>
        </Card>


        {}
        <div className="d-flex justify-content-between align-items-center mt-4">
          {}
          <Button
            variant="outline-secondary"
            onClick={handleBack}
            disabled={currentStep === 0 || isSaving} 
            className="nav-button"
          >
            <FaArrowLeft className="me-1" /> Back
          </Button>
          {}
          {currentStep === steps.length - 1 ? (
            <Button
              variant="hustle-success" 
              onClick={handleSave}
              disabled={isSaving} 
              className="nav-button"
            >
              {isSaving ? <Spinner as="span" animation="border" size="sm" className="me-2"/> : <FaCheckCircle className="me-1"/>}
              {isSaving ? 'Saving...' : 'Finish & Save'}
            </Button>
          ) : (
            <Button
              variant="hustle-primary" 
              onClick={handleNext}
              disabled={isSaving} 
              className="nav-button"
            >
               Next <FaArrowRight className="ms-1" />
            </Button>
          )}
        </div>
      </Container>

      {}
      <style jsx global>{`
        /* Progress Bar Customization */
        .progress-themed .progress-bar {
            background-color: ${primaryColor} !important;
        }
        /* Step Titles */
        .step-title {
            color: #343a40; /* Darker heading */
            font-weight: 600;
            margin-bottom: 0.75rem;
        }
        /* Buttons within steps */
        .step-button {
           transition: all 0.2s ease-in-out;
           font-weight: 500;
           border-width: 1.5px; /* Slightly thinner border for outline */
           padding-top: 0.75rem; /* Adjust padding if needed */
           padding-bottom: 0.75rem;
        }
        .step-button:hover:not(.selected) {
             transform: translateY(-2px);
             box-shadow: 0 3px 6px rgba(0,0,0,0.07);
        }

        /* Custom Primary Button (Selected State & Next/Finish) */
        .btn-hustle-primary {
             --bs-btn-color: #fff;
             --bs-btn-bg: ${primaryColor};
             --bs-btn-border-color: ${primaryColor};
             --bs-btn-hover-color: #fff;
             --bs-btn-hover-bg: #657952; /* Darker shade */
             --bs-btn-hover-border-color: #5a6f48;
             --bs-btn-active-color: #fff;
             --bs-btn-active-bg: #5a6f48;
             --bs-btn-active-border-color: #516341;
             --bs-btn-disabled-color: #fff;
             --bs-btn-disabled-bg: ${primaryColor};
             --bs-btn-disabled-border-color: ${primaryColor};
             color: var(--bs-btn-color);
             background-color: var(--bs-btn-bg);
             border-color: var(--bs-btn-border-color);
        }
         /* Add hover/active styles directly for simplicity */
         .btn-hustle-primary:hover:not(:disabled) {
            background-color: var(--bs-btn-hover-bg);
            border-color: var(--bs-btn-hover-border-color);
         }
          .btn-hustle-primary:active:not(:disabled) {
            background-color: var(--bs-btn-active-bg);
            border-color: var(--bs-btn-active-border-color);
         }


        /* Outline Secondary Button (Unselected State) */
        .btn-outline-secondary {
            border-color: #ced4da; /* Lighter grey border */
            color: #495057; /* Dark grey text */
            --bs-btn-color: #495057;
            --bs-btn-border-color: #ced4da;
            --bs-btn-hover-color: #fff;
            --bs-btn-hover-bg: #6c757d; /* Standard secondary color */
            --bs-btn-hover-border-color: #6c757d;
            --bs-btn-active-color: #fff;
            --bs-btn-active-bg: #5c636a;
            --bs-btn-active-border-color: #565e64;
            --bs-btn-disabled-color: #6c757d;
            --bs-btn-disabled-bg: transparent;
            --bs-btn-disabled-border-color: #ced4da;
        }
         .btn-outline-secondary:hover:not(:disabled) {
             color: var(--bs-btn-hover-color);
             background-color: var(--bs-btn-hover-bg);
             border-color: var(--bs-btn-hover-border-color);
         }

        /* Add visual cue for selected state button */
        .step-button.selected {
             box-shadow: 0 0 0 2px rgba(122, 141, 99, 0.4); /* Use primary color with alpha */
        }

        /* Navigation Buttons */
        .nav-button {
            min-width: 110px;
            font-weight: 500;
            transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        .nav-button:hover:not(:disabled) {
             transform: scale(1.03);
             box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

         /* Custom Success Button */
         .btn-hustle-success {
             --bs-btn-color: #fff;
             --bs-btn-bg: #198754;
             --bs-btn-border-color: #198754;
             --bs-btn-hover-color: #fff;
             --bs-btn-hover-bg: #157347;
             --bs-btn-hover-border-color: #146c43;
             --bs-btn-active-color: #fff;
             --bs-btn-active-bg: #146c43;
             --bs-btn-active-border-color: #13653f;
             --bs-btn-disabled-color: #fff;
             --bs-btn-disabled-bg: #198754;
             --bs-btn-disabled-border-color: #198754;
              color: var(--bs-btn-color);
              background-color: var(--bs-btn-bg);
              border-color: var(--bs-btn-border-color);
        }
        .btn-hustle-success:hover:not(:disabled) {
            background-color: var(--bs-btn-hover-bg);
            border-color: var(--bs-btn-hover-border-color);
        }
        .btn-hustle-success:active:not(:disabled) {
            background-color: var(--bs-btn-active-bg);
            border-color: var(--bs-btn-active-border-color);
        }

        /* Ensure the card body allows absolute positioning */
        .preference-card .card-body {
            position: relative; /* Needed for absolute positioning of motion.div */
            overflow: hidden; /* Clip exiting animation */
        }

      `}</style>
    </div>
  );
}

export default UpdatePreferencesPage;