import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Loader2, Globe } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { path: '/courses', labelKey: 'nav.courses' as const },
    { path: '/train', labelKey: 'nav.train' as const },
  ];

  const isActive = (path: string) => location.pathname === path;
  const currentLang = languages.find(l => l.code === language);

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
            <img src={logo} alt="Openings4Free" className="h-12 w-12 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold">Openings
              <span className="text-primary">4Free</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant={isActive(link.path) ? 'secondary' : 'ghost'}
                  size="sm"
                  className={isActive(link.path) ? 'bg-primary/10 text-primary' : ''}
                >
                  {t(link.labelKey)}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{currentLang?.flag}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? 'bg-primary/10 text-primary' : ''}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {user?.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="default" size="sm">
                    {t('nav.signup')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(link.path) ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${isActive(link.path) ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    {t(link.labelKey)}
                  </Button>
                </Link>
              ))}

              {/* Mobile Language Switcher */}
              <div className="flex flex-wrap gap-1 py-2 border-t border-border/50 mt-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLanguage(lang.code)}
                    className="text-xs px-2"
                  >
                    {lang.flag}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <span className="flex-1 text-sm text-muted-foreground flex items-center truncate">
                      {user?.email}
                    </span>
                    <Button variant="ghost" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-1" />
                      {t('nav.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        {t('nav.login')}
                      </Button>
                    </Link>
                    <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full">
                        {t('nav.signup')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
