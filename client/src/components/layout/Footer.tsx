import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Chef's Arsenal. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <MuiLink
              component={RouterLink}
              to="/about"
              color="text.secondary"
              variant="body2"
            >
              About
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/privacy"
              color="text.secondary"
              variant="body2"
            >
              Privacy
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/terms"
              color="text.secondary"
              variant="body2"
            >
              Terms
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/contact"
              color="text.secondary"
              variant="body2"
            >
              Contact
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
