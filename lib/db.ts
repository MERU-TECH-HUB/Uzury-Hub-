import { supabase } from './supabase';
import type {
  Stakeholder, StakeholderInsert,
  Contact, ContactInsert,
  Engagement, EngagementInsert,
  Opportunity, OpportunityInsert,
  FollowUp, FollowUpInsert,
  Document, DocumentInsert,
} from './supabase';

// ─── Stakeholders ────────────────────────────────────────────

export async function getStakeholders() {
  const { data, error } = await supabase
    .from('stakeholders')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as Stakeholder[];
}

export async function getStakeholder(id: string) {
  const { data, error } = await supabase
    .from('stakeholders')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Stakeholder;
}

export async function createStakeholder(input: StakeholderInsert) {
  const { data, error } = await supabase
    .from('stakeholders')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Stakeholder;
}

export async function updateStakeholder(id: string, input: Partial<StakeholderInsert>) {
  const { data, error } = await supabase
    .from('stakeholders')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Stakeholder;
}

export async function deleteStakeholder(id: string) {
  const { error } = await supabase.from('stakeholders').delete().eq('id', id);
  if (error) throw error;
}

// ─── Contacts ────────────────────────────────────────────────

export async function getContactsForStakeholder(stakeholderId: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('stakeholder_id', stakeholderId)
    .order('is_primary', { ascending: false });
  if (error) throw error;
  return data as Contact[];
}

export async function createContact(input: ContactInsert) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(id: string) {
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw error;
}

// ─── Engagements ─────────────────────────────────────────────

export async function getEngagements() {
  const { data, error } = await supabase
    .from('engagements')
    .select('*, stakeholders(name)')
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Engagement[];
}

export async function getEngagementsForStakeholder(stakeholderId: string) {
  const { data, error } = await supabase
    .from('engagements')
    .select('*')
    .eq('stakeholder_id', stakeholderId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Engagement[];
}

export async function createEngagement(input: EngagementInsert) {
  const { data, error } = await supabase
    .from('engagements')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Engagement;
}

// ─── Opportunities ────────────────────────────────────────────

export async function getOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, stakeholders(name)')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as Opportunity[];
}

export async function getOpportunitiesForStakeholder(stakeholderId: string) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('stakeholder_id', stakeholderId)
    .order('deadline', { ascending: true });
  if (error) throw error;
  return data as Opportunity[];
}

export async function createOpportunity(input: OpportunityInsert) {
  const { data, error } = await supabase
    .from('opportunities')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Opportunity;
}

export async function updateOpportunityStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('opportunities')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Opportunity;
}

// ─── Follow-Ups ───────────────────────────────────────────────

export async function getFollowUps() {
  const { data, error } = await supabase
    .from('followups')
    .select('*, stakeholders(name)')
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data as FollowUp[];
}

export async function getFollowUpsForStakeholder(stakeholderId: string) {
  const { data, error } = await supabase
    .from('followups')
    .select('*')
    .eq('stakeholder_id', stakeholderId)
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data as FollowUp[];
}

export async function createFollowUp(input: FollowUpInsert) {
  const { data, error } = await supabase
    .from('followups')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as FollowUp;
}

export async function completeFollowUp(id: string) {
  const { data, error } = await supabase
    .from('followups')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as FollowUp;
}

// ─── Documents ────────────────────────────────────────────────

export async function getDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*, stakeholders(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Document[];
}

export async function getDocumentsForStakeholder(stakeholderId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('stakeholder_id', stakeholderId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Document[];
}

export async function createDocument(input: DocumentInsert) {
  const { data, error } = await supabase
    .from('documents')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Document;
}

export async function uploadDocumentFile(file: File, input: Omit<DocumentInsert, 'file_path' | 'name' | 'file_size' | 'file_type'> & { name?: string }) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);
    
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  return await createDocument({
    ...input,
    name: input.name || file.name,
    file_path: urlData.publicUrl,
    file_size: file.size,
    file_type: file.type,
  });
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
}

// ─── Dashboard aggregates ─────────────────────────────────────

export async function getDashboardStats() {
  const [
    { count: totalStakeholders },
    { count: activeStakeholders },
    { count: totalOpportunities },
    { count: overdueFollowUps },
    opportunityData,
    stakeholdersByCategory,
  ] = await Promise.all([
    supabase.from('stakeholders').select('*', { count: 'exact', head: true }),
    supabase.from('stakeholders').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }),
    supabase.from('followups').select('*', { count: 'exact', head: true })
      .eq('completed', false)
      .lt('due_date', new Date().toISOString().split('T')[0]),
    supabase.from('opportunities').select('status, funding_amount, currency'),
    supabase.from('stakeholders').select('category'),
  ]);

  const funding = (opportunityData.data ?? []).reduce((acc, o) => {
    acc.total += o.funding_amount ?? 0;
    if (o.status === 'Approved') acc.approved += o.funding_amount ?? 0;
    return acc;
  }, { total: 0, approved: 0 });

  const categoryMap: Record<string, number> = {};
  (stakeholdersByCategory.data ?? []).forEach((s) => {
    categoryMap[s.category] = (categoryMap[s.category] ?? 0) + 1;
  });

  return {
    totalStakeholders: totalStakeholders ?? 0,
    activeStakeholders: activeStakeholders ?? 0,
    totalOpportunities: totalOpportunities ?? 0,
    overdueFollowUps: overdueFollowUps ?? 0,
    totalFunding: funding.total,
    approvedFunding: funding.approved,
    categoryBreakdown: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
  };
}

// ─── Bulk import ─────────────────────────────────────────────

export async function bulkInsertStakeholders(rows: StakeholderInsert[]) {
  const { data, error } = await supabase
    .from('stakeholders')
    .insert(rows)
    .select();
  if (error) throw error;
  return data as Stakeholder[];
}

export async function bulkInsertContacts(rows: ContactInsert[]) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(rows)
    .select();
  if (error) throw error;
  return data as Contact[];
}

export async function bulkInsertEngagements(rows: EngagementInsert[]) {
  const { data, error } = await supabase
    .from('engagements')
    .insert(rows)
    .select();
  if (error) throw error;
  return data as Engagement[];
}

export async function bulkInsertOpportunities(rows: OpportunityInsert[]) {
  const { data, error } = await supabase
    .from('opportunities')
    .insert(rows)
    .select();
  if (error) throw error;
  return data as Opportunity[];
}
