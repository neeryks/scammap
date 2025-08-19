"use client"
import { ReactNode } from 'react'
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import Link from 'next/link'

export default function AppShell({ children, fontClass }: { children: ReactNode, fontClass?: string }) {
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#0f766e' },
      secondary: { main: '#f59e0b' },
      background: { default: '#f7f7f7' }
    },
    shape: { borderRadius: 10 },
    typography: { fontFamily: fontClass || 'system-ui, -apple-system' }
  })
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="sticky" color="default" elevation={1}>
          <Toolbar sx={{ gap: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 0 }}>
              <Link href="/">ScamMapper</Link>
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button href="/map" color="inherit">Map</Button>
              <Button href="/report" variant="contained" color="primary">Report</Button>
              <Button href="/venues" color="inherit">Venues</Button>
              <Button href="/education" color="inherit">Education</Button>
              <Button href="/data" color="inherit">Data & Research</Button>
              <Button href="/policies" color="inherit">Policies</Button>
            </Box>
            <Box component="form" action="/search" method="GET" sx={{ ml: 'auto', width: '100%', maxWidth: 520 }}>
              <Box sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <SearchIcon fontSize="small" />
                <InputBase name="q" placeholder="Search venues, tactics, UPI IDs…" sx={{ flexGrow: 1 }} />
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ my: 3 }}>
          {children}
        </Container>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
