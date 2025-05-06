import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  LinearProgress,
  Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Book } from '../types/book';
import { getBookById } from '../services/api';
import { readingService } from '../services/ReadingService';
import BookCover from '../components/BookCover';

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const bookData = await getBookById(id);
        setBook(bookData);

        const progress = await readingService.getProgress(id);
        if (progress) {
          setReadingProgress(progress.progress);
        }
      } catch (error) {
        console.error('Error loading book:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  if (loading) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mb: 2 }}>Loading book details...</Typography>
        <LinearProgress />
      </Container>
    );
  }

  if (!book) {
    return (
      <Container>
        <Typography variant="h5">Book not found</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>
          Back to Library
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{
          mb: 4,
          color: '#2c1810',
          '&:hover': {
            backgroundColor: 'rgba(44, 24, 16, 0.04)'
          }
        }}
      >
        Back to Library
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <BookCover
              title={book.title}
              author={book.author}
              subtitle={book.genre}
              year={book.publicationYear}
              height={400}
            />
            {readingProgress > 0 && (
              <Paper sx={{ mt: 2, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Reading Progress: {Math.round(readingProgress)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={readingProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#2c1810'
                    }
                  }}
                />
              </Paper>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => navigate(`/read/${book.id}`)}
                sx={{
                  backgroundColor: '#2c1810',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(44, 24, 16, 0.9)'
                  }
                }}
              >
                {readingProgress > 0 ? 'Continue Reading' : 'Start Reading'}
              </Button>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              by {book.author}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Genre
              </Typography>
              <Typography variant="body1">
                {book.genre}
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Publication Year
              </Typography>
              <Typography variant="body1">
                {book.publicationYear}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {book.description}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookDetails;
