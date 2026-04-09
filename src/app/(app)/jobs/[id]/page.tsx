import { JobDetailPage } from '@/components/jobs/JobDetailPage'
export default function JobDetail({ params }: { params: { id: string } }) {
  return <JobDetailPage id={params.id} />
}
