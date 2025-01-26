import { SignOutButton, UserButton, UserProfile } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'

async function Dashboard() {
  const user = await currentUser()
 
  if (!user) return <div>Not signed in</div>

  return (

  <div>
   {/* <UserButton /> */}
   <UserProfile />
  </div>
  )
}
export default Dashboard