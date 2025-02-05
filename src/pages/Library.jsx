import React, { useState } from "react";
import { Box, Grid, Typography, Card, CardContent, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Codingvector from "../../src/assets/codingsvg.svg"; // Adjust the path as necessary
import SkillQuestionvector from "../../src/assets/SkillQuestionvectorsvg.svg"; // Adjust the path as necessary

const Library = () => {
  const navigate = useNavigate();
  const [showButtons, setShowButtons] = useState(false);

  const handleCardClick = () => {
    setShowButtons(true);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", paddingTop: '5rem' }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: "bold", mb: 1, color: "#00296B" }}
      >
        Library
      </Typography>

      <Typography
        variant="h6"
        align="center"
        sx={{ fontWeight: "thin", mb: 4, color: "#00296B" }}
      >
        Select from skill-based questions or coding challenges to tailor your assessment effortlessly.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* MCQ Library Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '200px',
              borderRadius: "16px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              "&:hover": { transform: "scale(1.02)", transition: "0.3s" },
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={handleCardClick}
          >
            {!showButtons ? (
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: "1rem",
                  paddingTop: "2rem",
                }}
              >
                <img src={SkillQuestionvector} alt="Quiz" style={{ width: '128px', height: '128px', marginRight: '1rem' }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#00296B", paddingLeft: "2rem" }}
                >
                  Skill Based<br/> Assessment Library
                </Typography>
              </CardContent>
            ) : (
              <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Button
                  onClick={() => handleNavigate("/library/mcq")}
                  sx={{
                    bgcolor: "white",
                    color: "#00296B",
                    border: "2px solid #00296B",
                    "&:hover": { bgcolor: "#FDC500", borderColor: "#FDC500", transition: "0.3s" },
                    marginBottom: "1rem",
                    width: "200%", // Increase the width of the button
                    borderRadius: "10px",
                  }}
                >
                  Question Library
                </Button>
                <Button
                  onClick={() => handleNavigate("/library/mcq/test")}
                  sx={{
                    bgcolor: "white",
                    color: "#00296B",
                    border: "2px solid #00296B",
                    "&:hover": { bgcolor: "#FDC500", borderColor: "#FDC500", transition: "0.3s" },
                    width: "200%", // Increase the width of the button
                    borderRadius: "10px",
                  }}
                >
                  Test Library
                </Button>
              </CardContent>
            )}
          </Card>
        </Grid>
        {/* Coding Library Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '200px',
              borderRadius: "16px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              "&:hover": { transform: "scale(1.02)", transition: "0.3s" },
              cursor: "pointer",
            }}
            onClick={() => navigate("/library/coding")}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: "2rem",
                paddingTop: "2rem",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#00296B", justifyContent: "left", paddingRight: "3rem" }}
              >
                Coding<br /> Assessment Library
              </Typography>
              <img src={Codingvector} alt="Coding" style={{ width: '128px', height: '128px', marginRight: '1rem' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Library;
