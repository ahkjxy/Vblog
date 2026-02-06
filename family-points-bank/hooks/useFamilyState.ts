import { useState, useCallback } from 'react';
import { FamilyState, Profile } from '../types';


export function useFamilyState(initialSyncId: string) {
  const [state, setState] = useState<FamilyState>({
    currentProfileId: null,
    profiles: [],
    tasks: [],
    rewards: [],
    syncId: initialSyncId,
  });

  const resolveFamilyId = useCallback(() => state.syncId || '', [state.syncId]);

  const ensureCurrentProfileId = useCallback((profiles: Profile[], preferredId?: string): string => {
    if (!profiles.length) return '';
    if (preferredId && profiles.some((p) => p.id === preferredId)) return preferredId;
    const admin = profiles.find((p) => p.role === 'admin');
    return admin?.id ?? profiles[0].id;
  }, []);

  const updateState = useCallback((updates: Partial<FamilyState>) => {
    setState((prev: FamilyState) => ({ ...prev, ...updates }));
  }, []);

  const updateProfile = useCallback((profileId: string, updates: Partial<Profile>) => {
    setState((prev: FamilyState) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === profileId ? { ...p, ...updates } : p)),
    }));
  }, []);

  return {
    state,
    setState,
    resolveFamilyId,
    ensureCurrentProfileId,
    updateState,
    updateProfile,
  };
}
