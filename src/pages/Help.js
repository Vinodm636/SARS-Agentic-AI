import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Help as HelpIcon,
  Book,
  VideoLibrary,
  Phone,
  Email,
  Chat,
  Description,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';

const Help = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState('panel1');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      id: 'panel1',
      question: 'How do I create a new emergency dispatch?',
      answer:
        'To create a new emergency dispatch, navigate to the Dashboard and click the "Upload Call Recording" button. Upload the MP3 file of the emergency call, and the AI will automatically transcribe and extract patient information. Review the details in the dispatch form and select an available ambulance on the map.',
    },
    {
      id: 'panel2',
      question: 'How does the AI transcription work?',
      answer:
        'The system uses OpenAI Whisper for speech-to-text conversion and GPT-4 for extracting structured patient data. Simply upload an MP3 recording of the emergency call, and the AI will automatically transcribe it and populate the dispatch form with patient details, emergency type, location, and other relevant information.',
    },
    {
      id: 'panel3',
      question: 'How do I track ambulance locations in real-time?',
      answer:
        'Ambulance locations are displayed on the interactive map view. Active ambulances appear with color-coded markers indicating their status. Click on any marker to view details including crew information, current assignment, and estimated arrival time.',
    },
    {
      id: 'panel4',
      question: 'What do the priority levels mean?',
      answer:
        'Priority levels indicate emergency severity: Critical (immediate life-threatening), High (serious but stable), Medium (urgent but not critical), and Low (non-urgent). The system uses color coding - red for critical, orange for high, yellow for medium, and green for low priority.',
    },
    {
      id: 'panel5',
      question: 'How are routes calculated?',
      answer:
        'Routes are calculated using TomTom routing API with real-time traffic data. The system considers current traffic conditions, road closures, and estimated travel times to recommend the fastest route to the emergency location and nearest appropriate hospital.',
    },
    {
      id: 'panel6',
      question: 'Can I manually dispatch an ambulance?',
      answer:
        'Yes, you can manually dispatch ambulances from the Active Emergencies page. Click on any emergency without an assigned ambulance, then click the "Dispatch" button. The system will show available ambulances and their estimated arrival times.',
    },
    {
      id: 'panel7',
      question: 'How do I update ambulance status?',
      answer:
        'Ambulance status is automatically updated based on GPS tracking and dispatch events. However, dispatchers can manually update status from the ambulance details panel. Available statuses include: Available, En Route, At Scene, Transporting, and Out of Service.',
    },
    {
      id: 'panel8',
      question: 'What analytics are available?',
      answer:
        'The Analytics dashboard provides comprehensive metrics including average response times, emergency type distribution, ambulance utilization rates, response time by district, and daily emergency trends. You can filter data by date range and export reports.',
    },
    {
      id: 'panel9',
      question: 'How do I change notification settings?',
      answer:
        'Go to Settings > Notifications to customize your alert preferences. You can enable/disable email, SMS, and push notifications, and choose which priority levels trigger alerts. Critical alerts are always enabled for safety.',
    },
    {
      id: 'panel10',
      question: 'What should I do if the system is not responding?',
      answer:
        'First, check your internet connection. Refresh the page (F5) to reload the application. If the issue persists, clear your browser cache or try a different browser. For persistent technical issues, contact support at support@sars.com or call +91 1800-SARS-HELP.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f4f6' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <TopNavBar onMenuClick={() => setMobileOpen(true)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: { xs: 8, md: 0 },
          ml: { md: '260px' },
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Help & Support
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find answers and get support for the SARS platform
          </Typography>
        </Box>

        {/* Quick Access Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
              }}
            >
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Book sx={{ fontSize: 30, color: '#3b82f6' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Documentation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comprehensive guides and API references
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
              }}
            >
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: '#fef3c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <VideoLibrary sx={{ fontSize: 30, color: '#f59e0b' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Video Tutorials
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Step-by-step video guides
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
              }}
            >
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: '#d1fae5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Chat sx={{ fontSize: 30, color: '#10b981' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Live Chat
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chat with our support team
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 },
              }}
            >
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Phone sx={{ fontSize: 30, color: '#ef4444' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Phone Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Call us for urgent assistance
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Contact Information */}
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Contact Support
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Phone sx={{ color: '#3b82f6' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    +91 1800-SARS-HELP
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Email sx={{ color: '#3b82f6' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    support@sars.com
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Description sx={{ color: '#3b82f6' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Hours
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    24/7 Available
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* FAQ Section */}
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Find quick answers to common questions
          </Typography>

          <TextField
            fullWidth
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expanded === faq.id}
                onChange={handleChange(faq.id)}
                sx={{
                  mb: 1,
                  border: '1px solid #e5e7eb',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography fontWeight={500}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HelpIcon sx={{ fontSize: 60, color: '#9ca3af', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No FAQs found matching your search
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Additional Resources */}
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', mt: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Additional Resources
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Book />}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                User Manual (PDF)
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<VideoLibrary />}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                Training Videos
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Description />}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                API Documentation
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HelpIcon />}
                sx={{ justifyContent: 'flex-start', py: 1.5 }}
              >
                System Requirements
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Help;
