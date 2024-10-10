import React from 'react';
import {
	Box,
	Button,
	Typography,
	List,
	ListItem,
	ListItemText,
} from '@mui/material';
import LogoutButton from '../components/LogoutButton';

const StudentDashboard: React.FC = () => {
	return (
		<Box sx={{ display: 'flex', minHeight: '100vh' }}>
			{/* Sidebar */}
			<Box
				sx={{
					width: '20%',
					backgroundColor: '#6a1b9a',
					color: 'white',
					padding: 2,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				}}
			>
				<Box>
					<Typography variant="h5" gutterBottom>
						Hi Student
					</Typography>
					<List>
						<ListItem component="button">
							<ListItemText primary="My Projects" />
						</ListItem>
						<ListItem component="button">
							<ListItemText primary="Paperwork" />
							<Box
								sx={{
									ml: 1,
									backgroundColor: 'red',
									borderRadius: '50%',
									width: 20,
									height: 20,
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									color: 'white',
								}}
							>
								1
							</Box>
						</ListItem>
						<ListItem component="button">
							<ListItemText primary="Account Settings" />
						</ListItem>
					</List>
				</Box>
				<LogoutButton variant="outlined" color="inherit" />
			</Box>

			{/* Main content area */}
			<Box sx={{ flexGrow: 1, padding: 4 }}>
				<Typography variant="h4" gutterBottom>
					My Projects!
				</Typography>

				<Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
					<Button variant="contained" sx={{ backgroundColor: '#512da8' }}>
						Create a New Project
					</Button>
					<Button
						variant="outlined"
						sx={{ borderColor: '#512da8', color: '#512da8' }}
					>
						Join an Existing Project
					</Button>
				</Box>

				<Typography variant="body1">2 / 5 Projects</Typography>

				<Box sx={{ border: '1px solid #ccc', padding: 2, marginTop: 2 }}>
					<List>
						<ListItem>
							<ListItemText primary="Baking Soda Volcano" secondary="Active" />
						</ListItem>
						<ListItem>
							<ListItemText primary="Magnet Project" secondary="Inactive" />
						</ListItem>
					</List>
				</Box>
			</Box>
		</Box>
	);
};

export default StudentDashboard;
