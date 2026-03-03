import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { ArrowRight, Zap, Target, TrendingUp, Users, BookOpen, Brain, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Target, titleKey: 'feature.realGameLines' as const, descKey: 'feature.realGameLinesDesc' as const },
    { icon: Brain, titleKey: 'feature.spacedRepetition' as const, descKey: 'feature.spacedRepetitionDesc' as const },
    { icon: TrendingUp, titleKey: 'feature.progressTracking' as const, descKey: 'feature.progressTrackingDesc' as const },
    { icon: BookOpen, titleKey: 'feature.curatedCourses' as const, descKey: 'feature.curatedCoursesDesc' as const },
    { icon: Zap, titleKey: 'feature.fastReps' as const, descKey: 'feature.fastRepsDesc' as const },
    { icon: Users, titleKey: 'feature.communityCourses' as const, descKey: 'feature.communityCoursesDesc' as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 via-transparent to-transparent blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              {t('home.badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              {t('home.title')}
              <span className="text-gradient">{t('home.titleHighlight')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              {t('home.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center"
            >
              <Link to="/courses">
                <Button variant="hero" size="xl">
                  {t('home.browseCourses')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-10 text-8xl opacity-5 animate-float">♞</div>
        <div className="absolute top-40 right-20 text-6xl opacity-5 animate-float" style={{ animationDelay: '1s' }}>♛</div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.whyWorks')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.whyWorksSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card-hover transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground text-sm">{t(feature.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('home.ctaTitle')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                {t('home.ctaSubtitle')}
              </p>
              <Link to="/courses">
                <Button variant="hero" size="xl">
                  {t('home.ctaButton')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                Openings<span className="text-primary">4Free</span>
              </span>
            </div>
            
            {/* Credit */}
            <p className="text-sm text-muted-foreground text-center">
              {t('home.credit')}
            </p>

            {/* Contact */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{t('home.contact')}</span>
              <a 
                href="mailto:mr.cubek6j@gmail.com" 
                className="text-primary hover:underline"
              >
                mr.cubek6j@gmail.com
              </a>
            </div>

            <div className="text-sm text-muted-foreground">
              © 2025 Openings4Free. Train like you play.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
