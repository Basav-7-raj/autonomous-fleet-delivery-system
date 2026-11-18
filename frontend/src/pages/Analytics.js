import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Define colors for the Pie Chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF69B4'];

function Analytics() {
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [fleetStatus, setFleetStatus] = useState({ active: 0, maintenance: 0, total: 0, idle: 0, inTransit: 0, damaged: 0, inactive: 0 });
  const [recentIssues, setRecentIssues] = useState([]);
  const [deliveryPerformanceChartData, setDeliveryPerformanceChartData] = useState([]);
  const [fleetHealthChartData, setFleetHealthChartData] = useState([]);
  const [vehicleStatusChartData, setVehicleStatusChartData] = useState([]);
  const [issueTypeChartData, setIssueTypeChartData] = useState([]);
  const [dailyDeliveryTrendsChartData, setDailyDeliveryTrendsChartData] = useState([]);
  const [productStatusByVehicleChartData, setProductStatusByVehicleChartData] = useState([]);
  const [vehicleLocationsChartData, setVehicleLocationsChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found.');
        }

        // Fetch Deliveries
        const deliveriesResponse = await fetch('/api/deliveries', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!deliveriesResponse.ok) throw new Error(`HTTP error fetching deliveries! status: ${deliveriesResponse.status}`);
        const deliveriesData = await deliveriesResponse.json();

        // Calculate Delivery Metrics
        const totalDeliveries = deliveriesData.length;
        const deliveredCount = deliveriesData.filter(d => d.status === 'DELIVERED').length;
        const successRate = totalDeliveries > 0 ? ((deliveredCount / totalDeliveries) * 100).toFixed(2) : 0;

        // Calculate Average Delivery Time (requires 'deliveredAt' or similar timestamp in Delivery model)
        let totalDeliveryDuration = 0;
        let completedDeliveriesWithDuration = 0;
        deliveriesData.forEach(d => {
          // Assuming 'estimatedDelivery' is when it was expected and 'createdAt' is when it was created.
          // For actual average delivery time, you'd need a 'deliveredAt' timestamp when status changes to 'DELIVERED'.
          // For this demo, we'll use a placeholder or calculate based on mockable data.
          if (d.status === 'DELIVERED' && d.estimatedDelivery && d.createdAt) {
            // Placeholder logic: difference between creation and estimated, this is not accurate for real-time
            const created = new Date(d.createdAt).getTime();
            const estimated = new Date(d.estimatedDelivery).getTime();
            if (estimated > created) {
              totalDeliveryDuration += (estimated - created); // duration in milliseconds
              completedDeliveriesWithDuration++;
            }
          }
        });

        let avgDeliveryTime = 'N/A';
        if (completedDeliveriesWithDuration > 0) {
          const avgDurationMs = totalDeliveryDuration / completedDeliveriesWithDuration;
          const avgDurationMinutes = Math.round(avgDurationMs / (1000 * 60));
          avgDeliveryTime = `${avgDurationMinutes} mins`;
        }

        setPerformanceMetrics(prevMetrics => [
          { title: 'Delivery Success Rate', value: `${successRate}%`, trend: 'up', change: '+0%' },
          { title: 'Average Delivery Time', value: avgDeliveryTime, trend: 'neutral', change: '0' },
          ...prevMetrics.filter(m => !['Delivery Success Rate', 'Average Delivery Time', 'Fleet Utilization', 'Energy Efficiency'].includes(m.title))
        ]);

        // Prepare data for Delivery Performance Chart (e.g., deliveries per month)
        const monthlyDeliveries = {};
        deliveriesData.forEach(d => {
          const month = new Date(d.createdAt).toLocaleString('default', { month: 'short' });
          monthlyDeliveries[month] = (monthlyDeliveries[month] || 0) + 1;
        });
        const chartData = Object.keys(monthlyDeliveries).map(month => ({
          name: month,
          deliveries: monthlyDeliveries[month],
        }));
        setDeliveryPerformanceChartData(chartData);

        // Fetch Vehicles
        const vehiclesResponse = await fetch('/api/vehicles', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!vehiclesResponse.ok) throw new Error(`HTTP error fetching vehicles! status: ${vehiclesResponse.status}`);
        const vehiclesData = await vehiclesResponse.json();

        // Calculate Fleet Status and Utilization
        const totalVehicles = vehiclesData.length;
        const activeVehicles = vehiclesData.filter(v => v.status === 'active').length;
        const maintenanceVehicles = vehiclesData.filter(v => v.status === 'maintenance').length;
        const idleVehicles = vehiclesData.filter(v => v.status === 'idle').length;
        const inTransitVehicles = vehiclesData.filter(v => v.status === 'in_transit').length;
        const damagedVehicles = vehiclesData.filter(v => v.status === 'damaged').length;
        const inactiveVehicles = vehiclesData.filter(v => v.status === 'inactive').length;

        const utilizationRate = totalVehicles > 0 ? ((activeVehicles / totalVehicles) * 100).toFixed(2) : 0;

        setFleetStatus({
          active: activeVehicles,
          maintenance: maintenanceVehicles,
          total: totalVehicles,
          idle: idleVehicles,
          inTransit: inTransitVehicles,
          damaged: damagedVehicles,
          inactive: inactiveVehicles
        });

        setPerformanceMetrics(prevMetrics => {
          const newMetrics = [...prevMetrics];
          const utilizationMetricIndex = newMetrics.findIndex(m => m.title === 'Fleet Utilization');
          if (utilizationMetricIndex !== -1) {
            newMetrics[utilizationMetricIndex] = { ...newMetrics[utilizationMetricIndex], value: `${utilizationRate}%`, trend: 'up', change: '+0%' };
          } else {
            newMetrics.push({ title: 'Fleet Utilization', value: `${utilizationRate}%`, trend: 'up', change: '+0%' });
          }
          const energyEfficiencyIndex = newMetrics.findIndex(m => m.title === 'Energy Efficiency');
          if (energyEfficiencyIndex === -1) {
            newMetrics.push({ title: 'Energy Efficiency', value: 'N/A', trend: 'neutral', change: '0' });
          }
          return newMetrics;
        });

        // Prepare data for Fleet Health Chart
        const healthChartData = [
          { name: 'Active', value: activeVehicles },
          { name: 'In Maintenance', value: maintenanceVehicles },
          { name: 'Idle', value: idleVehicles },
          { name: 'In Transit', value: inTransitVehicles },
        ];
        setFleetHealthChartData(healthChartData);

        // Prepare data for Vehicle Status Chart (Pie Chart)
        const statusData = {};
        vehiclesData.forEach(vehicle => {
          const status = vehicle.status || 'unknown';
          if (!statusData[status]) {
            statusData[status] = {
              count: 0,
              vehicleIds: []
            };
          }
          statusData[status].count++;
          statusData[status].vehicleIds.push(vehicle.vehicleNumber);
        });

        const statusChartData = Object.entries(statusData)
          .map(([status, data]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: data.count,
            vehicleIds: data.vehicleIds.join(', ')
          }))
          .filter(item => item.value > 0); // Only show statuses that have vehicles

        setVehicleStatusChartData(statusChartData);

        // Prepare data for Vehicle Locations Chart
        const locationData = {};
        vehiclesData.forEach(vehicle => {
          const location = vehicle.currentLocation || 'Unknown';
          if (!locationData[location]) {
            locationData[location] = {
              count: 0,
              vehicleIds: []
            };
          }
          locationData[location].count++;
          locationData[location].vehicleIds.push(vehicle.vehicleNumber);
        });

        const locationChartData = Object.entries(locationData).map(([location, data]) => ({
          name: location,
          vehicles: data.count,
          vehicleIds: data.vehicleIds.join(', ')
        }));

        setVehicleLocationsChartData(locationChartData);

        // Fetch Damage Reports for Recent Issues
        const damageResponse = await fetch('/api/damage', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!damageResponse.ok) throw new Error(`HTTP error fetching damage reports! status: ${damageResponse.status}`);
        const damageData = await damageResponse.json();

        const issues = damageData.map(report => ({
          type: report.status === 'resolved' ? 'success' : 'error',
          message: `Vehicle ${report.vehicleId?.vehicleNumber || 'N/A'} - ${report.description}`,
          time: new Date(report.createdAt).toLocaleString(),
        }));
        setRecentIssues(issues);

      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
        setError(err);
        setSnackbar({ open: true, message: `Error: ${err.message}` });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <TrendingUpIcon color="success" />
    ) : trend === 'down' ? (
      <TrendingDownIcon color="error" />
    ) : (
      null
    );
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Alert severity="error">
          <Typography variant="h6">Failed to load analytics data.</Typography>
          <Typography>{error.message}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Performance Metrics */}
        {performanceMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {metric.title}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="h4">{metric.value}</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: metric.trend === 'up' ? 'success.main' : 'error.main',
                    }}
                  >
                    {getTrendIcon(metric.trend)}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {metric.change}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Fleet Status Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Fleet Status Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Active Vehicles
                    </Typography>
                    <Typography variant="h4">{fleetStatus.active}/{fleetStatus.total}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Maintenance Required
                    </Typography>
                    <Typography variant="h4">{fleetStatus.maintenance}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Issues */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Issues
            </Typography>
            <List>
              {recentIssues.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No recent issues found." />
                </ListItem>
              ) : (
                recentIssues.map((issue, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>{getIssueIcon(issue.type)}</ListItemIcon>
                      <ListItemText
                        primary={issue.message}
                        secondary={issue.time}
                      />
                    </ListItem>
                    {index < recentIssues.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Delivery Performance Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Delivery Performance
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {deliveryPerformanceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={deliveryPerformanceChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="deliveries" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">
                  No delivery performance data available.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Overall Fleet Health Chart (Bar Chart) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Overall Fleet Health
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {fleetHealthChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={fleetHealthChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">
                  No fleet health data available.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Vehicles by Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Vehicles by Status
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {vehicleStatusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleStatusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value, percent }) => 
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {vehicleStatusChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <Box sx={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              padding: '8px'
                            }}>
                              <Typography variant="subtitle2">Status: {data.name}</Typography>
                              <Typography variant="body2">Vehicles: {data.value}</Typography>
                              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                Vehicle IDs:
                              </Typography>
                              <Typography variant="body2" sx={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                                {data.vehicleIds}
                              </Typography>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">
                  No vehicle status data available.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Vehicle Locations Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Vehicle Locations
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {vehicleLocationsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={vehicleLocationsChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (name === 'vehicles') {
                          return [`${value} vehicles`, 'Number of Vehicles'];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Location: ${label}`}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <Box sx={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              padding: '8px'
                            }}>
                              <Typography variant="subtitle2">Location: {label}</Typography>
                              <Typography variant="body2">Vehicles: {data.vehicles}</Typography>
                              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                Vehicle IDs:
                              </Typography>
                              <Typography variant="body2" sx={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                                {data.vehicleIds}
                              </Typography>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="vehicles" fill="#8884d8" name="Number of Vehicles" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">
                  No vehicle location data available.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Analytics;