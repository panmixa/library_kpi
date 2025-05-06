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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  ArrowBackIos,
  ArrowForwardIos,
  BookmarkBorder,
} from '@mui/icons-material';
import { Book } from '../types/book';
import { getBookById } from '../services/api';
import { readingService } from '../services/ReadingService';
import BookCover from '../components/BookCover';

const ReadBook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const defaultContent = [
    "Chapter 1: The clocks were striking thirteen. Winston Smith, his chin nuzzled into his chest, hurried home through the biting wind. The telescreens watched, the Party listened. Every thought, every whisper could be scrutinized. The past was mutable, rewritten at will. Winston, already a thought-criminal in his heart, knew this.",
    "Chapter 2: At work, Winston altered past newspaper records to fit the Party's ever-changing narrative. The lies piled up, each one building a reality more detached from truth. He scrawled in his hidden journal: \"DOWN WITH BIG BROTHER.\" It was rebellion, and he knew the consequences. Thoughtcrime was death.",
    "Chapter 3: Winston dreamt of the Golden Country, an untouched land beyond Party control. He saw Julia there, running freely. Yet, reality was cold and gray. The Party dictated love, hate, even history. Two plus two equaled five if the Party said so.",
    "Chapter 4: Winston encountered O'Brien, a man who seemed to understand his unspoken rebellion. Was he a friend, a foe, or a member of the Thought Police? The Brotherhood, whispered about in fear, might be real. Could Winston escape the iron grip of Big Brother?",
    "Chapter 5: Winston and Julia found solace in a small rented room above Mr. Charrington's shop. It was a sanctuary, free from the Party's watchful eyes—or so they thought. They whispered dreams of revolution, unaware that betrayal lurked in the walls, that the Party always heard, always saw."
  ];

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const bookData = await getBookById(id);
        // Якщо контент не прийшов з бекенду, використовуємо запасний варіант
        if (!bookData.content || bookData.content.length === 0) {
          bookData.content = defaultContent;
        }
        setBook(bookData);

        // Завантажуємо прогрес читання
        const progress = await readingService.getProgress(id);
        if (progress) {
          setCurrentPage(progress.currentPage || 1);
        }
      } catch (error) {
        console.error('Error loading book:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePageChange('prev');
      } else if (event.key === 'ArrowRight') {
        handlePageChange('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage]);

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (!book?.content) return;

    let newPage = currentPage;
    if (direction === 'prev' && currentPage > 1) {
      newPage = currentPage - 1;
    } else if (direction === 'next' && currentPage < book.content.length) {
      newPage = currentPage + 1;
    }

    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      saveProgress(newPage);
    }
  };

  const saveProgress = async (page: number) => {
    if (!id || !book?.content) return;

    try {
      await readingService.saveProgress({
        bookId: id,
        currentPage: page,
        progress: (page / book.content.length) * 100,
        totalPages: book.content.length
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    navigate(`/book/${id}`);
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mb: 2 }}>Loading book...</Typography>
        <LinearProgress />
      </Container>
    );
  }

  if (!book?.content) {
    return (
      <Container>
        <Typography variant="h5">Book content is not available</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/book/${id}`)}>
          Back to Book Details
        </Button>
      </Container>
    );
  }

  const currentContent = book.content[currentPage - 1];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleExit}
          sx={{
            color: '#2c1810',
            '&:hover': {
              backgroundColor: 'rgba(44, 24, 16, 0.04)'
            }
          }}
        >
          Back to Details
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {currentPage} of {book.content.length}
          </Typography>
          <Box sx={{ width: 200 }}>
            <LinearProgress
              variant="determinate"
              value={(currentPage / book.content.length) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#2c1810'
                }
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {Math.round((currentPage / book.content.length) * 100)}%
          </Typography>
        </Box>
      </Box>

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
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              minHeight: '70vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              backgroundColor: '#fffef9'
            }}
          >
            <Box sx={{ flex: 1, my: 4, position: 'relative' }}>
              <Typography 
                variant="body1" 
                paragraph
                sx={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  color: '#2c1810'
                }}
              >
                {currentContent || 'Content not available'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Tooltip title="Previous Page (←)">
                <span>
                  <IconButton 
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                    sx={{
                      color: '#2c1810',
                      '&:hover': {
                        backgroundColor: 'rgba(44, 24, 16, 0.04)'
                      }
                    }}
                  >
                    <ArrowBackIos />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Next Page (→)">
                <span>
                  <IconButton 
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === book.content.length}
                    sx={{
                      color: '#2c1810',
                      '&:hover': {
                        backgroundColor: 'rgba(44, 24, 16, 0.04)'
                      }
                    }}
                  >
                    <ArrowForwardIos />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
        <DialogTitle>Exit Reading Mode</DialogTitle>
        <DialogContent>
          <Typography>
            Your reading progress has been saved. Would you like to exit reading mode?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowExitDialog(false)}
            sx={{
              color: '#2c1810',
              '&:hover': {
                backgroundColor: 'rgba(44, 24, 16, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmExit} 
            variant="contained"
            sx={{
              backgroundColor: '#2c1810',
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(44, 24, 16, 0.9)'
              }
            }}
          >
            Exit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReadBook;
