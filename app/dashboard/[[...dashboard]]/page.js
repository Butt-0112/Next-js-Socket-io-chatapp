import { SignOutButton, UserButton, UserProfile } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import '../../../css/clerkcomps.css'
async function Dashboard() {
  const user = await currentUser()
 
  if (!user) return <div>Not signed in</div>

  return (

    <div className=" flex justify-center items-center user-profile-container w-screen h-screen">
    <UserProfile />
  </div>
  )
}
export default Dashboard