import React, { createContext, useContext, useState } from 'react';
import type { AuditState, AuditContact, AuditUpload } from '../types/audit';

interface CourseAuditContextValue {
  state: AuditState;
  setStep: (step: AuditState['step']) => void;
  setContact: (contact: Partial<AuditContact>) => void;
  setUpload: (upload: Partial<AuditUpload>) => void;
  setJobId: (id: string) => void;
  setSubmitting: (v: boolean) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

const defaultState: AuditState = {
  step: 'landing',
  contact: { name: '', email: '', company: '', role: '', courseType: '' },
  upload: { file: null, fileName: '' },
  jobId: null,
  submitting: false,
  error: null,
};

const CourseAuditContext = createContext<CourseAuditContextValue | null>(null);

export function CourseAuditProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuditState>(defaultState);

  const setStep    = (step: AuditState['step']) => setState(s => ({ ...s, step }));
  const setContact = (c: Partial<AuditContact>) => setState(s => ({ ...s, contact: { ...s.contact, ...c } }));
  const setUpload  = (u: Partial<AuditUpload>)  => setState(s => ({ ...s, upload: { ...s.upload, ...u } }));
  const setJobId   = (id: string) => setState(s => ({ ...s, jobId: id }));
  const setSubmitting = (v: boolean) => setState(s => ({ ...s, submitting: v }));
  const setError   = (msg: string | null) => setState(s => ({ ...s, error: msg }));
  const reset      = () => setState(defaultState);

  return (
    <CourseAuditContext.Provider value={{ state, setStep, setContact, setUpload, setJobId, setSubmitting, setError, reset }}>
      {children}
    </CourseAuditContext.Provider>
  );
}

export function useCourseAudit() {
  const ctx = useContext(CourseAuditContext);
  if (!ctx) throw new Error('useCourseAudit must be used inside CourseAuditProvider');
  return ctx;
}
