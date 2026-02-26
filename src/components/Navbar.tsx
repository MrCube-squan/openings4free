import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, Menu, X, LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, signOut, isAuthenticated } = useAuth();

  const navLinks = [
  { path: '/courses', label: 'Courses' },
  { path: '/train', label: 'Train' }];


  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Crown className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
            </div>
            <span className="text-xl font-bold">Openings4free
              <span className="text-primary">4Free</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
            <Link key={link.path} to={link.path}>
                <Button
                variant={isActive(link.path) ? 'secondary' : 'ghost'}
                size="sm"
                className={isActive(link.path) ? 'bg-primary/10 text-primary' : ''}>

                  {link.label}
                </Button>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {loading ?
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> :
            isAuthenticated ?
            <>
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {user?.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Log out
                </Button>
              </> :

            <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="default" size="sm">
                    Sign up free
                  </Button>
                </Link>
              </>
            }
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>

            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">

            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) =>
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}>

                  <Button
                variant={isActive(link.path) ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${isActive(link.path) ? 'bg-primary/10 text-primary' : ''}`}>

                    {link.label}
                  </Button>
                </Link>
            )}
              <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                {loading ?
              <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div> :
              isAuthenticated ?
              <>
                    <span className="flex-1 text-sm text-muted-foreground flex items-center truncate">
                      {user?.email}
                    </span>
                    <Button variant="ghost" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-1" />
                      Log out
                    </Button>
                  </> :

              <>
                    <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full">
                        Sign up
                      </Button>
                    </Link>
                  </>
              }
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </nav>);

};

export default Navbar;