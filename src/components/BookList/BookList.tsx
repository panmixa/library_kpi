import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  LinearProgress,
  Tooltip,
  Alert,
} from '@mui/material';
import { Book } from '../../types/book';
import { getBooks } from '../../services/api';
import { readingService } from '../../services/ReadingService';
import BookCover from '../BookCover';

const BookList: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters = {
          ...(selectedGenre && { genre: selectedGenre }),
          ...(selectedAuthor && { author: selectedAuthor }),
        };
        console.log('Loading books with filters:', filters);
        const booksData = await getBooks(filters);
        console.log('Received books:', booksData);

        if (!Array.isArray(booksData)) {
          throw new Error('Invalid books data received');
        }

        setBooks(booksData);

        const uniqueGenres = [...new Set(booksData.map((book: Book) => book.genre))] as string[];
        const uniqueAuthors = [...new Set(booksData.map((book: Book) => book.author))] as string[];

        setGenres(uniqueGenres);
        setAuthors(uniqueAuthors);
      } catch (err: any) {
        console.error('Error loading books:', err);
        setError(err.message || 'Failed to load books');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [selectedGenre, selectedAuthor]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const allProgress = await readingService.getAllProgress();
        const progressMap = Object.entries(allProgress).reduce((acc, [bookId, progress]) => {
          acc[bookId] = progress.progress;
          return acc;
        }, {} as Record<string, number>);
        setReadingProgress(progressMap);
      } catch (error) {
        console.error('Error loading reading progress:', error);
      }
    };

    loadProgress();
  }, []);

  const handleGenreChange = (event: SelectChangeEvent<string>) => {
    setSelectedGenre(event.target.value);
  };

  const handleAuthorChange = (event: SelectChangeEvent<string>) => {
    setSelectedAuthor(event.target.value);
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                value={selectedGenre}
                label="Genre"
                onChange={handleGenreChange}
              >
                <MenuItem value="">All Genres</MenuItem>
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Author</InputLabel>
              <Select
                value={selectedAuthor}
                label="Author"
                onChange={handleAuthorChange}
              >
                <MenuItem value="">All Authors</MenuItem>
                {authors.map((author) => (
                  <MenuItem key={author} value={author}>
                    {author}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {books.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          No books found
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {books.map((book) => (
            <Grid item key={book.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <Box sx={{ p: 2, flex: 1 }}>
                  <BookCover
                    title={book.title}
                    author={book.author}
                    subtitle={book.genre}
                    year={book.publicationYear}
                    height={300}
                  />
                </Box>
                <CardContent>
                  {readingProgress[book.id] && (
                    <Tooltip title={`${Math.round(readingProgress[book.id])}% completed`}>
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={readingProgress[book.id]}
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
                    </Tooltip>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', gap: 1, pb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => handleBookClick(book.id)}
                    sx={{
                      color: '#2c1810',
                      borderColor: '#2c1810',
                      '&:hover': {
                        borderColor: '#2c1810',
                        backgroundColor: 'rgba(44, 24, 16, 0.04)'
                      }
                    }}
                    variant="outlined"
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    onClick={() => navigate(`/read/${book.id}`)}
                    sx={{
                      backgroundColor: '#2c1810',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: 'rgba(44, 24, 16, 0.9)'
                      }
                    }}
                    variant="contained"
                  >
                    {readingProgress[book.id] ? 'Continue Reading' : 'Start Reading'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default BookList;
