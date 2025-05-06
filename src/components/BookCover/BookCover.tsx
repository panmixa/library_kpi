import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface BookCoverProps {
  title: string;
  author: string;
  subtitle?: string;
  publisher?: string;
  publisherLocation?: string;
  year?: number;
  width?: number | string;
  height?: number | string;
}

const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  subtitle,
  publisher,
  publisherLocation,
  year,
  width = 300,
  height = 400,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 4,
        backgroundColor: '#f4f1ea',
        border: '1px solid #d3d3d3',
        borderRadius: 1,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.02) 75%), linear-gradient(45deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.02) 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
          pointerEvents: 'none',
        }
      }}
    >
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontFamily: 'serif',
            fontWeight: 'bold',
            mb: 2,
            color: '#2c1810',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'serif',
              mb: 2,
              color: '#2c1810',
              fontStyle: 'italic'
            }}
          >
            {subtitle}
          </Typography>
        )}

        <Typography
          variant="h6"
          sx={{
            fontFamily: 'serif',
            mt: 4,
            color: '#2c1810',
          }}
        >
          {author}
        </Typography>
      </Box>

      {(publisher || publisherLocation) && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            component="img"
            src="/publisher-logo.png"
            alt="Publisher Logo"
            sx={{
              width: 50,
              height: 50,
              mb: 1,
              opacity: 0.8
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'serif',
              color: '#2c1810',
              fontSize: '0.9rem'
            }}
          >
            {publisher}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'serif',
              color: '#2c1810',
              fontSize: '0.8rem'
            }}
          >
            {publisherLocation}
            {year && `, ${year}`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default BookCover;
