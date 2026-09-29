import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  Notifications,
  Security,
  Language,
  Palette,
  Save,
  Edit,
  Camera,
} from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';

const Settings = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    name: 'John Dispatcher',
    email: 'john.dispatcher@sars.com',
    phone: '+91 98765 43210',
    role: 'Dispatcher',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    criticalAlerts: true,
    highPriorityAlerts: true,
    mediumPriorityAlerts: false,
    twoFactorAuth: true,
    sessionTimeout: '30',
    language: 'en',
    timezone: 'Asia/Kolkata',
    theme: 'light',
    mapStyle: 'standard',
  });

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const TabPanel = ({ children, value, index }) => (
    <Box hidden={value !== index} sx={{ py: 3 }}>
      {value === index && children}
    </Box>
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
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account and application preferences
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: '1px solid #e5e7eb', px: 2 }}
          >
            <Tab icon={<Person />} iconPosition="start" label="Profile" />
            <Tab icon={<Notifications />} iconPosition="start" label="Notifications" />
            <Tab icon={<Security />} iconPosition="start" label="Security" />
            <Tab icon={<Palette />} iconPosition="start" label="Preferences" />
          </Tabs>

          {/* Profile Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: 3 }}>
              <Box display="flex" alignItems="center" mb={4}>
                <Box position="relative">
                  <Avatar sx={{ width: 100, height: 100, bgcolor: '#3b82f6' }}>
                    <Person sx={{ fontSize: 60 }} />
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'white',
                      border: '2px solid #e5e7eb',
                      '&:hover': { bgcolor: '#f3f4f6' },
                    }}
                    size="small"
                  >
                    <Camera fontSize="small" />
                  </IconButton>
                </Box>
                <Box ml={3}>
                  <Typography variant="h6" fontWeight={600}>
                    {settings.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {settings.role}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={settings.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={settings.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={settings.role}
                      label="Role"
                      onChange={(e) => handleChange('role', e.target.value)}
                    >
                      <MenuItem value="Admin">Administrator</MenuItem>
                      <MenuItem value="Dispatcher">Dispatcher</MenuItem>
                      <MenuItem value="Supervisor">Supervisor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Change Password
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Current Password" type="password" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="New Password" type="password" />
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Notification Channels
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Choose how you want to receive notifications
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            Email Notifications
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Receive updates via email
                          </Typography>
                        </Box>
                        <Switch
                          checked={settings.emailNotifications}
                          onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            SMS Notifications
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Receive alerts via SMS
                          </Typography>
                        </Box>
                        <Switch
                          checked={settings.smsNotifications}
                          onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            Push Notifications
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Get push notifications in browser
                          </Typography>
                        </Box>
                        <Switch
                          checked={settings.pushNotifications}
                          onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 4 }}>
                Alert Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Select which priority levels trigger notifications
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.criticalAlerts}
                        onChange={(e) => handleChange('criticalAlerts', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Critical Priority Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Always notify for critical emergencies
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.highPriorityAlerts}
                        onChange={(e) => handleChange('highPriorityAlerts', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">High Priority Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Notify for high priority emergencies
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.mediumPriorityAlerts}
                        onChange={(e) => handleChange('mediumPriorityAlerts', e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Medium Priority Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Notify for medium priority emergencies
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Security Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Manage your account security and authentication
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            Two-Factor Authentication
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Add an extra layer of security to your account
                          </Typography>
                        </Box>
                        <Switch
                          checked={settings.twoFactorAuth}
                          onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1" fontWeight={500} gutterBottom>
                        Session Timeout
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Automatically log out after period of inactivity
                      </Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>Timeout Duration</InputLabel>
                        <Select
                          value={settings.sessionTimeout}
                          label="Timeout Duration"
                          onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                        >
                          <MenuItem value="15">15 minutes</MenuItem>
                          <MenuItem value="30">30 minutes</MenuItem>
                          <MenuItem value="60">1 hour</MenuItem>
                          <MenuItem value="120">2 hours</MenuItem>
                          <MenuItem value="never">Never</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1" fontWeight={500} gutterBottom>
                        Active Sessions
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Manage devices where you're currently logged in
                      </Typography>
                      <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1, mb: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          Current Session
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Windows PC - Chrome Browser
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Last active: Just now
                        </Typography>
                      </Box>
                      <Button variant="outlined" size="small" color="error">
                        Log Out All Other Devices
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Preferences Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Application Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Customize your application experience
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.language}
                      label="Language"
                      onChange={(e) => handleChange('language', e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                      <MenuItem value="es">Español (Spanish)</MenuItem>
                      <MenuItem value="fr">Français (French)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.timezone}
                      label="Timezone"
                      onChange={(e) => handleChange('timezone', e.target.value)}
                    >
                      <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                      <MenuItem value="America/New_York">America/New York (EST)</MenuItem>
                      <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                      <MenuItem value="Asia/Tokyo">Asia/Tokyo (JST)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={settings.theme}
                      label="Theme"
                      onChange={(e) => handleChange('theme', e.target.value)}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">Auto (System)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Map Style</InputLabel>
                    <Select
                      value={settings.mapStyle}
                      label="Map Style"
                      onChange={(e) => handleChange('mapStyle', e.target.value)}
                    >
                      <MenuItem value="standard">Standard</MenuItem>
                      <MenuItem value="satellite">Satellite</MenuItem>
                      <MenuItem value="hybrid">Hybrid</MenuItem>
                      <MenuItem value="terrain">Terrain</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 4 }}>
                Data & Privacy
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1" fontWeight={500} gutterBottom>
                        Data Usage
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Manage how your data is used and stored
                      </Typography>
                      <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                        Download My Data
                      </Button>
                      <Button variant="outlined" size="small" color="error">
                        Delete Account
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <Divider />
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', bgcolor: '#f9fafb' }}>
            <Button variant="outlined" sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
              Save Changes
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Settings;
