"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/lib/data-service';
import { Profile } from '@/types';
import { User } from '@supabase/supabase-js';

export function useProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchAll() {
            setLoading(true);
            try {
                // 1. Check local session (fast)
                const { data: { session } } = await supabase.auth.getSession();
                let currentUser = session?.user || null;

                // 2. Verify with server if no session (backup)
                if (!currentUser) {
                    const { data: { user: serverUser } } = await supabase.auth.getUser();
                    currentUser = serverUser;
                }

                if (isMounted) setUser(currentUser);

                if (currentUser) {
                    // 3. Load or Create Profile
                    let p = await getProfile(currentUser.id);

                    if (!p && isMounted) {
                        console.log("Profile missing, creating fail-safe...");
                        const { error } = await supabase.from('profiles').upsert({
                            id: currentUser.id,
                            email: currentUser.email || '',
                            role: 'user'
                        });
                        if (!error) p = await getProfile(currentUser.id);
                    }

                    if (isMounted) setProfile(p);
                }
            } catch (error) {
                console.error("useProfile fetchAll error:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchAll();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            const currentUser = session?.user || null;
            setUser(currentUser);

            if (currentUser) {
                const p = await getProfile(currentUser.id);
                setProfile(p);
                setLoading(false);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return { profile, user, loading };
}
