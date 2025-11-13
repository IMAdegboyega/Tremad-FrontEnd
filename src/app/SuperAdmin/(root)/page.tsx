import { redirect } from 'next/navigation'

export default function SuperAdminIndexPage() {
  return (
    redirect('/SuperAdmin/home')
  )
}
