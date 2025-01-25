import { currentUser } from '@clerk/nextjs/server'

async function Dashboard() {
  const user = await currentUser()
  console.log(user)
  if (!user) return <div>Not signed in</div>

  return <div>Hello {user?.firstName}</div>
}
export default Dashboard