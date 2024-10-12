import React, { useState } from 'react';
import {
	Box,
	Button,
	Typography,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Input,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const PdfUploadPage: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			setSelectedFile(event.target.files[0]);
		}
	};

	const handleUpload = () => {
		if (selectedFile) {
			// Here you would implement the actual file upload logic
			console.log('Uploading file:', selectedFile.name);
			// Reset the selected file after upload
			setSelectedFile(null);
		}
	};

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
						Hi User 
            {/* TODO: ADD SPECIFIC USER NAME*/}
					</Typography>
					<List>
						<ListItem disablePadding>
							<ListItemButton>
								<ListItemText primary="My Documents" />
							</ListItemButton>
						</ListItem>
						<ListItem disablePadding>
							<ListItemButton>
								<ListItemText primary="Account Settings" />
							</ListItemButton>
						</ListItem>
					</List>
				</Box>
				<Button variant="outlined" color="inherit">
					Logout
				</Button>
			</Box>

			{/* Main content area */}
			<Box
				sx={{
					flexGrow: 1,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center', // Vertically center
					alignItems: 'center', // Horizontally center
					padding: 4,
				}}
			>
				<Typography variant="h4" gutterBottom>
					Upload PDF
				</Typography>

				<Box sx={{ marginTop: 4, textAlign: 'center', width: '80%', maxWidth: '500px' }}>
					<Input
						type="file"
						onChange={handleFileChange}
						sx={{ display: 'none' }}
						id="pdf-upload-input"
						inputProps={{ accept: '.pdf' }}
					/>
					<label htmlFor="pdf-upload-input">
						<Button
							variant="contained"
							component="span"
							startIcon={<CloudUploadIcon />}
							sx={{
                backgroundColor: '#512da8',
                marginRight: 2,
                fontSize: '1.5rem',
                padding: '12px 24px',
                width: '100%',
                height: '100px',
                '&:hover': {
                  backgroundColor: '#4527a0',
                },
              }}
            >
							Select PDF
						</Button>
					</label>
					{selectedFile && (
						<Typography variant="body1" sx={{ display: 'inline' }}>
							{selectedFile.name}
						</Typography>
					)}
				</Box>

				<Box sx={{ marginTop: 2 }}>
					<Button
						variant="contained"
						onClick={handleUpload}
						disabled={!selectedFile}
						sx={{ backgroundColor: '#512da8',  width: '100%',
              height: '60px' }}
					>
						Upload PDF
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default PdfUploadPage;
