import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { ArrowRight, Zap, Target, TrendingUp, Users, BookOpen, Brain } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-hero-pattern opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 via-transparent to-transparent blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">

              <Zap className="h-4 w-4" />
              Train like you play
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight">

              Master openings with{' '}
              <span className="text-gradient">Best Way</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">

              Stop memorizing engine lines nobody plays. Train openings from millions of real games.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center">

              <Link to="/courses">
                <Button variant="hero" size="xl">
                  Browse Courses
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Floating chess pieces decoration */}
        <div className="absolute bottom-0 left-10 text-8xl opacity-5 animate-float">♞</div>
        <div className="absolute top-40 right-20 text-6xl opacity-5 animate-float" style={{ animationDelay: '1s' }}>♛</div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why openings4free works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No more "this never happens in my games." Every line is built from real moves.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
            {
              icon: Target,
              title: 'Real-Game Lines',
              description: 'Moves extracted from millions of Lichess games. Learn what you\'ll actually face.'
            },
            {
              icon: Brain,
              title: 'Spaced Repetition',
              description: 'Smart scheduling based on your accuracy. Difficult lines come back more often until they stick.'
            },
            {
              icon: TrendingUp,
              title: 'Progress Tracking',
              description: 'See exactly which lines you\'ve mastered and which need work. Watch your accuracy climb.'
            },
            {
              icon: BookOpen,
              title: 'Curated Courses',
              description: 'Pre-built repertoires with punchy descriptions. From London to Sicilian Dragon.'
            },
            {
              icon: Zap,
              title: 'Fast Reps',
              description: 'Quick, focused drilling. 5 minutes a day builds permanent opening knowledge.'
            },
            {
              icon: Users,
              title: 'Community Courses',
              description: 'Create your own repertoires or train courses made by other players.'
            }].
            map((feature, index) =>
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card-hover transition-all duration-300">

                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            )}
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
            className="relative max-w-4xl mx-auto rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 p-12 text-center overflow-hidden">

            <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to stop blundering the opening?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of players who've turned opening prep from a chore into a game.
              </p>
              <Link to="/courses">
                <Button variant="hero" size="xl">
                  Start Training Free
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                openings<span className="text-primary">4free</span>
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 openings4free. Train like you play.
            </div>
          </div>
        </div>
      </footer>
    </div>);

};

export default Index;