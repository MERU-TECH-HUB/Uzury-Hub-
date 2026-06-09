'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
  ArrowLeft, Globe, Phone, Mail, MapPin, Linkedin,
  Edit2, Plus, Calendar, Briefcase, FileText,
  ExternalLink, Star, Tag, Users2
} from 'lucide-react';
import {
  getStakeholder, getContactsForStakeholder, getEngagementsForStakeholder,
  getOpportunitiesForStakeholder, getFollowUpsForStakeholder
} from '@/lib/db';
import { Badge } from '@/components/ui/Badge';
import { Button, Card, LoadingSpinner } from '@/components/ui/index';
import { cn, formatDate, formatRelativeDate, formatCurrency, OPPORTUNITY_STATUS_COLORS } from '@/lib/utils';
import type { Stakeholder, Contact, Engagement, Opportunity, FollowUp } from '@/lib/supabase';

const TABS = ['Overview', 'Contacts', 'Engagements', 'Opportunities', 'Follow-Ups'];

export default function StakeholderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  
  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [tab, setTab] = useState('Overview');

  useEffect(() => {
    Promise.all([
      getStakeholder(id),
      getContactsForStakeholder(id),
      getEngagementsForStakeholder(id),
      getOpportunitiesForStakeholder(id),
      getFollowUpsForStakeholder(id),
    ])
      .then(([s, c, e, o, f]) => {
        setStakeholder(s);
        setContacts(c);
        setEngagements(e);
        setOpportunities(o);
        setFollowups(f);
      })
      .catch((e) => {
        console.error(e);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error || !stakeholder) {
    notFound();
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link href="/stakeholders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div className="flex-1 flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-sky-400 font-bold text-2xl shrink-0">
            {stakeholder.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-white">{stakeholder.name}</h1>
              <Badge label={stakeholder.status} type="status" />
            </div>
            <div className="flex items-center gap-4 mt-1 flex-wrap text-xs text-slate-400">
              {stakeholder.organization_type && <span>{stakeholder.organization_type}</span>}
              {stakeholder.country && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{stakeholder.county ? `${stakeholder.county}, ` : ''}{stakeholder.country}</span>
              )}
              {stakeholder.website && (
                <a href={stakeholder.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sky-400 transition-colors">
                  <Globe className="h-3 w-3" />{stakeholder.website.replace('https://', '')}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge label={stakeholder.category} type="category" />
              {stakeholder.tags?.map((t) => (
                <span key={t} className="badge-base bg-white/5 text-slate-400 border-white/10 text-[10px]">
                  <Tag className="h-2.5 w-2.5" />{t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" size="sm"><Edit2 className="h-4 w-4" /> Edit</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            )}
          >
            {t}
            {t === 'Contacts' && contacts.length > 0 && (
              <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">{contacts.length}</span>
            )}
            {t === 'Engagements' && engagements.length > 0 && (
              <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">{engagements.length}</span>
            )}
            {t === 'Opportunities' && opportunities.length > 0 && (
              <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">{opportunities.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Strategic info */}
            <Card title="Strategic Information">
              <div className="px-5 py-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Strategic Alignment</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{stakeholder.strategic_alignment ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Areas of Interest</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stakeholder.areas_of_interest && Array.isArray(stakeholder.areas_of_interest) && stakeholder.areas_of_interest.length > 0 ? stakeholder.areas_of_interest.map((a: string) => (
                      <span key={a} className="badge-base bg-sky-500/10 text-sky-300 border-sky-500/20">{a}</span>
                    )) : <span className="text-sm text-slate-500">—</span>}
                  </div>
                </div>
                {stakeholder.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notes</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{stakeholder.notes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent engagements preview */}
            {engagements.length > 0 && (
              <Card title="Recent Engagements" action={
                <button onClick={() => setTab('Engagements')} className="text-xs text-sky-400 hover:text-sky-300">View all</button>
              }>
                <div className="px-5 py-3 space-y-3">
                  {engagements.slice(0, 3).map((e) => (
                    <div key={e.id} className="flex gap-3 py-2 border-b border-white/[0.05] last:border-0">
                      <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                        <Briefcase className="h-3.5 w-3.5 text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{e.engagement_type}</span>
                          <span className="text-[10px] text-slate-500">{formatDate(e.date)}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{e.summary}</p>
                        {e.outcome && (
                          <p className="text-[11px] text-emerald-400 mt-0.5">→ {e.outcome}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Quick stats */}
            <Card>
              <div className="px-5 py-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 text-xs">Assigned Officer</span>
                  <span className="text-white font-medium text-xs">{stakeholder.assigned_officer ?? '—'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 text-xs">Contacts</span>
                  <span className="text-white font-medium text-xs">{contacts.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 text-xs">Engagements</span>
                  <span className="text-white font-medium text-xs">{engagements.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 text-xs">Opportunities</span>
                  <span className="text-white font-medium text-xs">{opportunities.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-white/[0.06]">
                  <span className="text-slate-400 text-xs">Last Updated</span>
                  <span className="text-slate-400 text-xs">{formatRelativeDate(stakeholder.updated_at)}</span>
                </div>
              </div>
            </Card>

            {/* Primary contact */}
            {contacts.filter((c) => c.is_primary).length > 0 && (
              <Card title="Primary Contact">
                <div className="px-5 py-4 space-y-2">
                  {contacts.filter((c) => c.is_primary).map((c) => (
                    <div key={c.id} className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{c.full_name}</p>
                        <p className="text-xs text-slate-400">{c.position}</p>
                      </div>
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs text-slate-400 hover:text-sky-400 transition-colors">
                          <Mail className="h-3.5 w-3.5" />{c.email}
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-xs text-slate-400 hover:text-sky-400 transition-colors">
                          <Phone className="h-3.5 w-3.5" />{c.phone}
                        </a>
                      )}
                      {c.linkedin && (
                        <a href={`https://${c.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-slate-400 hover:text-sky-400 transition-colors">
                          <Linkedin className="h-3.5 w-3.5" />LinkedIn
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'Contacts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href={`/contacts/new?stakeholder=${id}`}>
              <Button size="sm"><Plus className="h-4 w-4" /> Add Contact</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {contacts.map((c) => (
              <Card key={c.id}>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-violet-400 font-bold">
                      {c.full_name.charAt(0)}
                    </div>
                    {c.is_primary && (
                      <span className="badge-base bg-amber-500/10 text-amber-300 border-amber-500/20 text-[10px]">
                        <Star className="h-2.5 w-2.5" /> Primary
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.full_name}</p>
                    <p className="text-xs text-slate-400">{c.position}</p>
                  </div>
                  <div className="space-y-1.5">
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs text-slate-400 hover:text-sky-400 transition-colors truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0" />{c.email}
                      </a>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone className="h-3.5 w-3.5 shrink-0" />{c.phone}
                      </div>
                    )}
                    {c.preferred_contact && (
                      <div className="text-xs text-slate-500">Preferred: {c.preferred_contact}</div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {contacts.length === 0 && (
              <div className="col-span-full">
                <Card>
                  <div className="p-8 text-center text-slate-500 text-sm">No contacts added yet.</div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Engagements' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href={`/engagements/new?stakeholder=${id}`}>
              <Button size="sm"><Plus className="h-4 w-4" /> Log Engagement</Button>
            </Link>
          </div>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-white/[0.08]" />
            {engagements.map((e) => (
              <div key={e.id} className="relative">
                <div className="absolute -left-5 top-3 h-3 w-3 rounded-full border-2 border-sky-500 bg-background" />
                <Card>
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{e.engagement_type}</span>
                          <span className="text-[11px] text-slate-500">{formatDate(e.date)}</span>
                          {e.responsible_officer && (
                            <span className="text-[11px] text-slate-500">· {e.responsible_officer}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mt-2 leading-relaxed">{e.summary}</p>
                        {e.outcome && (
                          <div className="mt-2 flex items-start gap-2">
                            <span className="text-[11px] font-semibold text-emerald-400 shrink-0">Outcome:</span>
                            <span className="text-[11px] text-slate-400">{e.outcome}</span>
                          </div>
                        )}
                        {e.follow_up_required && e.follow_up_date && (
                          <div className="mt-2 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-amber-400" />
                            <span className="text-[11px] text-amber-300">Follow-up due {formatDate(e.follow_up_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
            {engagements.length === 0 && (
              <Card>
                <div className="p-8 text-center text-slate-500 text-sm">No engagements recorded yet.</div>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'Opportunities' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href={`/opportunities/new?stakeholder=${id}`}>
              <Button size="sm"><Plus className="h-4 w-4" /> Add Opportunity</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((o) => (
              <Card key={o.id}>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white leading-snug">{o.name}</h3>
                    <Badge label={o.status} type="opportunity" />
                  </div>
                  {o.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{o.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {o.funding_amount && (
                      <div>
                        <span className="text-slate-500">Amount</span>
                        <div className="text-emerald-400 font-semibold mt-0.5">{formatCurrency(o.funding_amount, o.currency)}</div>
                      </div>
                    )}
                    {o.deadline && (
                      <div>
                        <span className="text-slate-500">Deadline</span>
                        <div className="text-white mt-0.5">{formatDate(o.deadline)}</div>
                      </div>
                    )}
                  </div>
                  {o.responsible_officer && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Users2 className="h-3 w-3" />{o.responsible_officer}
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {opportunities.length === 0 && (
              <div className="col-span-full">
                <Card>
                  <div className="p-8 text-center text-slate-500 text-sm">No opportunities linked yet.</div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Follow-Ups' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link href={`/followups/new?stakeholder=${id}`}>
              <Button size="sm"><Plus className="h-4 w-4" /> Add Follow-Up</Button>
            </Link>
          </div>
          {followups.map((f) => (
            <Card key={f.id}>
              <div className="px-5 py-4 flex items-start gap-4">
                <div className={cn(
                  'h-5 w-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center',
                  f.completed ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-600 bg-white/5'
                )}>
                  {f.completed && <div className="h-2 w-2 rounded-full bg-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', f.completed ? 'line-through text-slate-500' : 'text-slate-200')}>{f.title}</p>
                  {f.notes && <p className="text-xs text-slate-500 mt-0.5">{f.notes}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                    <span className={cn(f.completed ? 'text-slate-500' : isOverdue(f.due_date) ? 'text-red-400' : 'text-slate-400')}>
                      {f.completed ? 'Completed' : `Due ${formatDate(f.due_date)}`}
                    </span>
                    {f.responsible_officer && <span className="text-slate-500">· {f.responsible_officer}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {followups.length === 0 && (
            <Card>
              <div className="p-8 text-center text-slate-500 text-sm">No follow-ups scheduled.</div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}
