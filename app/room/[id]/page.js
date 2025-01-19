
import Room from '@/components/Room'
import React from 'react'

const Page = async({params}) => {
  const roomId = (await params).id
  console.log(roomId)
  return (
    <div>
        <Room roomId={roomId} />
    </div>
  )
}

export default Page
