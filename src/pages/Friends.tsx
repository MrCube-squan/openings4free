import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, UserPlus, UserCheck, UserX, Trophy, Crown, 
  Medal, Clock, Users, Flame, Share2, Loader2, Pencil, Check, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Profile {
  id: string;
  display_name: string;
}

const Friends = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    friends, pendingRequests, sentRequests,
    weeklyLeaderboard, monthlyLeaderboard,
    loading, myProfile, searchUsers, sendRequest,
    acceptRequest, rejectRequest, removeFriend,
    updateDisplayName,
  } = useFriends();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    const results = await searchUsers(searchQuery);
    // Filter out existing friends and pending requests
    const friendIds = new Set(friends.map(f => f.id));
    const sentIds = new Set(sentRequests.map(r => r.receiver_id));
    setSearchResults(results.filter(r => !friendIds.has(r.id) && !sentIds.has(r.id)));
    setSearching(false);
  };

  const handleShare = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({ title: 'Openings4Free', text: t('friends.shareText'), url });
    } else {
      navigator.clipboard.writeText(url);
      import('sonner').then(({ toast }) => toast.success(t('friends.linkCopied')));
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-primary" />;
    if (index === 1) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (index === 2) return <Medal className="h-5 w-5 text-accent-foreground" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{index + 1}</span>;
  };

  const LeaderboardSection = ({ 
    entries, title, icon 
  }: { 
    entries: Array<{ user_id: string; display_name: string; lines_learned: number }>;
    title: string;
    icon: React.ReactNode;
  }) => (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('friends.noFriendsYet')}</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                entry.user_id === user?.id 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${entry.user_id === user?.id ? 'text-primary' : ''}`}>
                  {entry.display_name}
                  {entry.user_id === user?.id && <span className="text-xs ml-1 text-muted-foreground">({t('friends.you')})</span>}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">{entry.lines_learned}</span>
                <span className="text-xs text-muted-foreground">{t('friends.lines')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-4">{t('friends.title')}</h1>
          <p className="text-muted-foreground mb-8">{t('friends.loginRequired')}</p>
          <Link to="/auth?mode=login">
            <Button variant="default" size="lg">{t('nav.login')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('friends.title')}</h1>
            <p className="text-muted-foreground">{t('friends.subtitle')}</p>
            
            {/* Display name editor */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('friends.yourName')}:</span>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-8 w-48"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={async () => {
                    if (newName.trim()) await updateDisplayName(newName.trim());
                    setEditingName(false);
                  }}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{myProfile?.display_name || '...'}</span>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setNewName(myProfile?.display_name || '');
                    setEditingName(true);
                  }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="leaderboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="leaderboard" className="gap-1">
                <Trophy className="h-4 w-4" />
                {t('friends.leaderboard')}
              </TabsTrigger>
              <TabsTrigger value="friends" className="gap-1">
                <Users className="h-4 w-4" />
                {t('friends.friendsList')}
                {pendingRequests.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="search" className="gap-1">
                <Search className="h-4 w-4" />
                {t('friends.findFriends')}
              </TabsTrigger>
            </TabsList>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <LeaderboardSection 
                  entries={weeklyLeaderboard}
                  title={t('friends.weeklyChallenge')}
                  icon={<Flame className="h-5 w-5 text-orange-500" />}
                />
                <LeaderboardSection 
                  entries={monthlyLeaderboard}
                  title={t('friends.monthlyChallenge')}
                  icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                />
              </div>

              {/* Share CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 p-6 text-center"
              >
                <Share2 className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="text-lg font-bold mb-2">{t('friends.shareCta')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('friends.shareCtaDesc')}</p>
                <Button variant="default" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('friends.shareButton')}
                </Button>
              </motion.div>
            </TabsContent>

            {/* Friends List Tab */}
            <TabsContent value="friends" className="space-y-6">
              {/* Pending requests */}
              {pendingRequests.length > 0 && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {t('friends.pendingRequests')} ({pendingRequests.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-card">
                        <span className="font-medium">{req.sender_profile?.display_name || 'Unknown'}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={() => acceptRequest(req.id)}>
                            <UserCheck className="h-4 w-4 mr-1" />
                            {t('friends.accept')}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => rejectRequest(req.id)}>
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sent requests */}
              {sentRequests.length > 0 && (
                <div className="rounded-xl border border-border p-4">
                  <h3 className="font-bold mb-3 text-muted-foreground">{t('friends.sentRequests')}</h3>
                  <div className="space-y-2">
                    {sentRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span>{req.receiver_profile?.display_name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{t('friends.pending')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends list */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-bold mb-3">{t('friends.friendsList')} ({friends.length})</h3>
                {friends.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">{t('friends.noFriendsYet')}</p>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                        <span className="font-medium">{friend.display_name}</span>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removeFriend(friend.id)}>
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('friends.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching || searchQuery.length < 2}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  {searchResults.map(profile => (
                    <div key={profile.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <span className="font-medium">{profile.display_name}</span>
                      <Button size="sm" variant="default" onClick={() => sendRequest(profile.id)}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        {t('friends.addFriend')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                <p className="text-center text-muted-foreground py-8">{t('friends.noResults')}</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Friends;
