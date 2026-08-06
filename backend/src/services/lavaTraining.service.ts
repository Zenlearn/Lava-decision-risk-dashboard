import logger from '../configs/logger.config';
import { getEnvVar } from '../helpers/env';

function zenlearnBase(): string {
  return getEnvVar('PATHWAYS_BACKEND_URL', 'http://app3001:3001');
}

async function zlFetch(path: string, opts?: RequestInit): Promise<any | null> {
  try {
    const r = await fetch(`${zenlearnBase()}${path}`, opts);
    if (!r.ok) {
      logger.warn('ZenLearn upstream non-OK', { path, status: r.status });
      return null;
    }
    return r.json();
  } catch (err: any) {
    logger.error('ZenLearn upstream unreachable', { path, error: err.message });
    return null;
  }
}

export interface TrainingStatusRow {
  name: string;
  lava_role: string;
  assigned: number;
  completed: number;
  completionPct: number;
}

export interface TrainingRule {
  id: string;
  lava_role: string;
  programme_id: string;
  programme_title: string;
  is_active: boolean;
}

export async function fetchTrainingStatus(
  scope: { busmName: string; asmName: string },
): Promise<TrainingStatusRow[]> {
  const qs = `?busmName=${encodeURIComponent(scope.busmName)}&asmName=${encodeURIComponent(scope.asmName)}`;
  const data = await zlFetch(`/lava-training/status${qs}`);
  return (data?.result?.rows ?? []) as TrainingStatusRow[];
}

export async function fetchTrainingRules(): Promise<TrainingRule[]> {
  const data = await zlFetch('/lava-training/rules');
  return (data?.rules ?? []) as TrainingRule[];
}

export async function createTrainingRule(
  body: { lava_role: string; programme_id: string; programme_title: string },
  adminToken: string,
): Promise<TrainingRule | null> {
  const data = await zlFetch('/lava-training/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(body),
  });
  return data?.rule ?? null;
}

export async function deleteTrainingRule(id: string, adminToken: string): Promise<boolean> {
  try {
    const r = await fetch(`${zenlearnBase()}/lava-training/rules/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return r.ok;
  } catch (err: any) {
    logger.error('deleteTrainingRule failed', { id, error: err.message });
    return false;
  }
}

export async function manualAssignTraining(
  body: { user_id: string; programme_id: string; duration_days?: number },
  adminToken: string,
): Promise<boolean> {
  try {
    const r = await fetch(`${zenlearnBase()}/lava-training/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(body),
    });
    return r.ok;
  } catch (err: any) {
    logger.error('manualAssignTraining failed', { error: err.message });
    return false;
  }
}

export async function fetchMyProgrammes(userId: string, token: string): Promise<any[]> {
  const data = await zlFetch(`/program-assignments/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data?.result?.assignments ?? [];
}

export async function fetchProgrammeProgress(
  userId: string,
  programmeId: string,
  token: string,
): Promise<any[]> {
  const data = await zlFetch(`/user-module-results/${userId}/programme/${programmeId}/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data?.result ?? [];
}
