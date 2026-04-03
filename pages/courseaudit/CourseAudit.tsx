import { CourseAuditProvider, useCourseAudit } from '../../context/CourseAuditContext';
import { AuditLanding }   from './AuditLanding';
import { AuditContact }   from './AuditContact';
import { AuditUpload }    from './AuditUpload';
import { AuditSubmitted } from './AuditSubmitted';

function AuditRouter() {
  const { state } = useCourseAudit();
  switch (state.step) {
    case 'landing':   return <AuditLanding />;
    case 'contact':   return <AuditContact />;
    case 'upload':    return <AuditUpload />;
    case 'submitted': return <AuditSubmitted />;
  }
}

export function CourseAudit() {
  return (
    <CourseAuditProvider>
      <AuditRouter />
    </CourseAuditProvider>
  );
}
