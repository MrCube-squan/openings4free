import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Profile {
  id: string;
  display_name: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender_profile?: Profile;
  receiver_profile?: Profile;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  lines_learned: number;
}

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setMyProfile(data as Profile);
  }, [user]);

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id);
    
    if (data && data.length > 0) {
      const friendIds = data.map(f => f.friend_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);
      if (profiles) setFriends(profiles as Profile[]);
    } else {
      setFriends([]);
    }
  }, [user]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    
    // Pending requests received
    const { data: incoming } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending');
    
    if (incoming && incoming.length > 0) {
      const senderIds = incoming.map(r => r.sender_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', senderIds);
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      setPendingRequests(incoming.map(r => ({
        ...r,
        sender_profile: profileMap.get(r.sender_id) as Profile | undefined
      })));
    } else {
      setPendingRequests([]);
    }

    // Sent requests
    const { data: outgoing } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('sender_id', user.id)
      .eq('status', 'pending');
    
    if (outgoing && outgoing.length > 0) {
      const receiverIds = outgoing.map(r => r.receiver_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', receiverIds);
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      setSentRequests(outgoing.map(r => ({
        ...r,
        receiver_profile: profileMap.get(r.receiver_id) as Profile | undefined
      })));
    } else {
      setSentRequests([]);
    }
  }, [user]);

  const fetchLeaderboards = useCallback(async () => {
    if (!user) return;
    
    // Weekly: start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    // Monthly: start of current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: weekly } = await supabase.rpc('get_friend_leaderboard', {
      p_user_id: user.id,
      p_start_date: weekStart.toISOString()
    });

    const { data: monthly } = await supabase.rpc('get_friend_leaderboard', {
      p_user_id: user.id,
      p_start_date: monthStart.toISOString()
    });

    if (weekly) setWeeklyLeaderboard(weekly as LeaderboardEntry[]);
    if (monthly) setMonthlyLeaderboard(monthly as LeaderboardEntry[]);
  }, [user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchFriends(), fetchRequests(), fetchLeaderboards()]);
    setLoading(false);
  }, [fetchProfile, fetchFriends, fetchRequests, fetchLeaderboards]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const searchUsers = async (query: string): Promise<Profile[]> => {
    if (!query || query.length < 2 || !user) return [];
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('display_name', `%${query}%`)
      .neq('id', user.id)
      .limit(10);
    return (data || []) as Profile[];
  };

  const sendRequest = async (receiverId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('friend_requests')
      .insert({ sender_id: user.id, receiver_id: receiverId });
    if (error) {
      if (error.code === '23505') toast.error('Friend request already sent');
      else toast.error('Failed to send request');
    } else {
      toast.success('Friend request sent!');
      await fetchRequests();
    }
  };

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase.rpc('accept_friend_request', { request_id: requestId });
    if (error) toast.error('Failed to accept request');
    else {
      toast.success('Friend added!');
      await refresh();
    }
  };

  const rejectRequest = async (requestId: string) => {
    await supabase.from('friend_requests').delete().eq('id', requestId);
    toast.success('Request rejected');
    await fetchRequests();
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;
    await supabase.from('friendships').delete().or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);
    toast.success('Friend removed');
    await refresh();
  };

  const updateDisplayName = async (name: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', user.id);
    if (error) toast.error('Failed to update name');
    else {
      toast.success('Display name updated!');
      await fetchProfile();
    }
  };

  return {
    friends,
    pendingRequests,
    sentRequests,
    weeklyLeaderboard,
    monthlyLeaderboard,
    loading,
    myProfile,
    searchUsers,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    updateDisplayName,
    refresh,
  };
};
