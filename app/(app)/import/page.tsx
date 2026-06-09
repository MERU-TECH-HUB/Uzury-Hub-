'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import {
  Upload, FileSpreadsheet, ArrowRight, CheckCircle2, RefreshCw, Loader2, Database
} from 'lucide-react';
import { Button, Card } from '@/components/ui/index';
import { cn, STAKEHOLDER_CATEGORIES } from '@/lib/utils';
import * as XLSX from 'xlsx';
import Fuse from 'fuse.js';
import { 
  getStakeholders, 
  bulkInsertStakeholders, 
  bulkInsertContacts, 
  bulkInsertEngagements, 
  bulkInsertOpportunities 
} from '@/lib/db';

type Step = 1 | 2 | 3;

const STEPS = [
  { n: 1, label: 'Upload File' },
  { n: 2, label: 'Review Data' },
  { n: 3, label: 'Import' },
];

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  
  // Parsed data by entity type
  const [parsedStakeholders, setParsedStakeholders] = useState<any[]>([]);
  const [parsedContacts, setParsedContacts] = useState<any[]>([]);
  const [parsedEngagements, setParsedEngagements] = useState<any[]>([]);
  const [parsedOpportunities, setParsedOpportunities] = useState<any[]>([]);
  
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importStats, setImportStats] = useState({ stakeholders: 0, contacts: 0, engagements: 0, opportunities: 0 });

  useEffect(() => {
    getStakeholders().then((s) => setExistingNames(s.map((st) => st.name))).catch(() => {});
  }, []);

  const guessColumn = (row: any, keywords: string[]) => {
    const keys = Object.keys(row);
    for (const key of keys) {
      const lc = key.toLowerCase();
      if (keywords.some(k => lc.includes(k))) return row[key];
    }
    return undefined;
  };

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      
      let st: any[] = [];
      let co: any[] = [];
      let en: any[] = [];
      let op: any[] = [];

      wb.SheetNames.forEach(sheetName => {
        const ws = wb.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        
        const nameLc = sheetName.toLowerCase();
        if (nameLc.includes('stakeholder') || nameLc.includes('organi')) st = st.concat(json);
        else if (nameLc.includes('contact') || nameLc.includes('people')) co = co.concat(json);
        else if (nameLc.includes('engage') || nameLc.includes('meeting') || nameLc.includes('activity')) en = en.concat(json);
        else if (nameLc.includes('opportunit') || nameLc.includes('grant') || nameLc.includes('fund')) op = op.concat(json);
        else {
          // If the sheet name is ambiguous, try to guess based on headers of first row
          if (json.length > 0) {
            const keys = Object.keys(json[0]).map(k => k.toLowerCase());
            if (keys.some(k => k.includes('amount') || k.includes('funding'))) op = op.concat(json);
            else if (keys.some(k => k.includes('meeting') || k.includes('summary'))) en = en.concat(json);
            else if (keys.some(k => k.includes('email') || k.includes('phone'))) co = co.concat(json);
            else st = st.concat(json); // Default to stakeholders
          }
        }
      });

      setParsedStakeholders(st);
      setParsedContacts(co);
      setParsedEngagements(en);
      setParsedOpportunities(op);
      setStep(2);
    };
    reader.readAsArrayBuffer(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], 'application/vnd.ms-excel': [], 'text/csv': [] },
    multiple: false,
  });

  const handleImport = async () => {
    setImporting(true);
    setImportError(null);
    
    try {
      // 1. Process Stakeholders
      const stakeholdersToInsert = parsedStakeholders.map(row => {
        const cat = guessColumn(row, ['categ', 'type']);
        const validCats = STAKEHOLDER_CATEGORIES as readonly string[];
        return {
          name: guessColumn(row, ['name', 'organiza', 'company']) || 'Unknown Organization',
          category: (validCats.includes(cat ?? '') ? cat : 'Strategic Partner') as any,
          country: guessColumn(row, ['country']),
          county: guessColumn(row, ['county', 'region']),
          website: guessColumn(row, ['web', 'url', 'site']),
          notes: guessColumn(row, ['note', 'desc']),
          status: 'Active' as const,
        };
      }).filter(s => s.name !== 'Unknown Organization');

      // Prevent exact duplicates in new inserts
      const uniqueStakeholders: any[] = [];
      const seenNames = new Set(existingNames.map(n => n.toLowerCase()));
      for (const s of stakeholdersToInsert) {
        if (!seenNames.has(s.name.toLowerCase())) {
          uniqueStakeholders.push(s);
          seenNames.add(s.name.toLowerCase());
        }
      }

      let insertedStakeholders: any[] = [];
      if (uniqueStakeholders.length > 0) {
        insertedStakeholders = await bulkInsertStakeholders(uniqueStakeholders);
      }

      // Fetch all stakeholders again to resolve IDs for relations
      const allStakeholders = await getStakeholders();
      const fuse = new Fuse(allStakeholders, { keys: ['name'], threshold: 0.3 });

      const resolveStakeholderId = (row: any) => {
        const orgName = guessColumn(row, ['organiza', 'stakeholder', 'company']);
        if (!orgName) return null;
        
        // Exact match first
        const exact = allStakeholders.find(s => s.name.toLowerCase() === orgName.toLowerCase());
        if (exact) return exact.id;

        // Fuzzy match
        const results = fuse.search(orgName);
        if (results.length > 0) return results[0].item.id;

        return null;
      };

      // 2. Process Contacts
      const contactsToInsert = parsedContacts.map(row => {
        const sid = resolveStakeholderId(row);
        if (!sid) return null;
        return {
          stakeholder_id: sid,
          full_name: guessColumn(row, ['name', 'person', 'contact']) || 'Unknown',
          email: guessColumn(row, ['email']),
          phone: guessColumn(row, ['phone', 'tel', 'mobile']),
          position: guessColumn(row, ['position', 'title', 'role']),
          is_primary: String(guessColumn(row, ['primary', 'main'])).toLowerCase() === 'yes',
        };
      }).filter(Boolean);

      let insertedContacts: any[] = [];
      if (contactsToInsert.length > 0) insertedContacts = await bulkInsertContacts(contactsToInsert as any[]);

      // 3. Process Engagements
      const engagementsToInsert = parsedEngagements.map(row => {
        const sid = resolveStakeholderId(row);
        if (!sid) return null;
        return {
          stakeholder_id: sid,
          engagement_type: guessColumn(row, ['type', 'format', 'method']) || 'Meeting',
          date: guessColumn(row, ['date', 'time']) || new Date().toISOString(),
          summary: guessColumn(row, ['summary', 'desc', 'note']) || 'No summary provided',
          outcome: guessColumn(row, ['outcome', 'result']),
        };
      }).filter(Boolean);

      let insertedEngagements: any[] = [];
      if (engagementsToInsert.length > 0) insertedEngagements = await bulkInsertEngagements(engagementsToInsert as any[]);

      // 4. Process Opportunities
      const opsToInsert = parsedOpportunities.map(row => {
        const sid = resolveStakeholderId(row);
        if (!sid) return null;
        const amountStr = guessColumn(row, ['amount', 'fund', 'value']);
        const amount = amountStr ? parseFloat(String(amountStr).replace(/[^0-9.-]+/g, "")) : undefined;
        return {
          stakeholder_id: sid,
          name: guessColumn(row, ['name', 'title', 'opp']) || 'Unnamed Opportunity',
          status: guessColumn(row, ['status', 'stage']) || 'Identified',
          funding_amount: isNaN(amount as number) ? undefined : amount,
          description: guessColumn(row, ['desc', 'detail']),
        };
      }).filter(Boolean);

      let insertedOps: any[] = [];
      if (opsToInsert.length > 0) insertedOps = await bulkInsertOpportunities(opsToInsert as any[]);

      setImportStats({
        stakeholders: insertedStakeholders.length,
        contacts: insertedContacts.length,
        engagements: insertedEngagements.length,
        opportunities: insertedOps.length,
      });
      
      setStep(3);
      setImportDone(true);
    } catch (e: any) {
      console.error(e);
      setImportError(e.message || 'An error occurred during import.');
    } finally {
      setImporting(false);
    }
  };

  const totalRecords = parsedStakeholders.length + parsedContacts.length + parsedEngagements.length + parsedOpportunities.length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all',
                step > s.n ? 'wizard-step-complete' : step === s.n ? 'wizard-step-active' : 'wizard-step-inactive'
              )}>
                {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
              </div>
              <span className={cn(
                'text-xs font-medium hidden sm:block whitespace-nowrap',
                step === s.n ? 'text-white' : step > s.n ? 'text-emerald-400' : 'text-slate-500'
              )}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px mx-3', step > s.n ? 'bg-emerald-500/40' : 'bg-white/10')} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <Card title="Upload Relational Data" subtitle="Supported: XLSX, CSV (multiple sheets automatically parsed)">
          <div className="p-6">
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
                isDragActive ? 'dropzone-active' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-12 w-12 text-slate-500" />
                <p className="text-sm font-medium text-slate-300">Drag and drop your Excel workbook here</p>
                <p className="text-xs text-slate-500">The system will automatically scan sheets named Stakeholders, Contacts, Engagements, etc.</p>
                <Button variant="secondary" size="sm" className="mt-2">Browse Files</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <Card title="Data Overview" subtitle={`Found ${totalRecords} total records across sheets`}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="metric-card bg-white/[0.02] border border-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-sky-400 mb-2"><Database className="h-4 w-4" /> Stakeholders</div>
                <p className="text-3xl font-bold text-white">{parsedStakeholders.length}</p>
              </div>
              <div className="metric-card bg-white/[0.02] border border-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-violet-400 mb-2"><Database className="h-4 w-4" /> Contacts</div>
                <p className="text-3xl font-bold text-white">{parsedContacts.length}</p>
              </div>
              <div className="metric-card bg-white/[0.02] border border-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 mb-2"><Database className="h-4 w-4" /> Engagements</div>
                <p className="text-3xl font-bold text-white">{parsedEngagements.length}</p>
              </div>
              <div className="metric-card bg-white/[0.02] border border-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 mb-2"><Database className="h-4 w-4" /> Opportunities</div>
                <p className="text-3xl font-bold text-white">{parsedOpportunities.length}</p>
              </div>
            </div>

            <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sm text-sky-300">
              <strong>Smart Relationship Mapping:</strong> The system will automatically link your Contacts, Engagements, and Opportunities to the correct Stakeholder based on the "Organization Name" column in your sheets.
            </div>

            {importError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                {importError}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Button variant="secondary" onClick={() => setStep(1)}>Cancel</Button>
              <Button onClick={handleImport} disabled={importing || totalRecords === 0}>
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {importing ? 'Processing & Linking Data...' : 'Confirm & Import All'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Success */}
      {step === 3 && importDone && (
        <Card>
          <div className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Multi-Sheet Import Complete!</h2>
            <p className="text-sm text-slate-400 mb-8">All sheets have been processed and relationships have been linked successfully.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              <div><p className="text-2xl font-bold text-emerald-400">{importStats.stakeholders}</p><p className="text-xs text-slate-400">New Stakeholders</p></div>
              <div><p className="text-2xl font-bold text-sky-400">{importStats.contacts}</p><p className="text-xs text-slate-400">Contacts Linked</p></div>
              <div><p className="text-2xl font-bold text-violet-400">{importStats.engagements}</p><p className="text-xs text-slate-400">Engagements</p></div>
              <div><p className="text-2xl font-bold text-amber-400">{importStats.opportunities}</p><p className="text-xs text-slate-400">Opportunities</p></div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setStep(1); setFile(null); setImportDone(false); }} variant="secondary">
                <RefreshCw className="h-4 w-4" /> Import Another
              </Button>
              <Button onClick={() => router.push('/stakeholders')}><ArrowRight className="h-4 w-4" /> View Directory</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
