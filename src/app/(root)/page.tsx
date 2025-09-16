import { redirect } from 'next/navigation'

export default function studentIndexPage() {
  return (
    redirect('/home')
  )
}
