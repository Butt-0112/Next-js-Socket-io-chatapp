import {  createClerkClient } from '@clerk/nextjs/server'
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const client =   createClerkClient({secretKey: process.env.CLERK_SECRET_KEY})
    const list = await client.users.getUserList()
    console.log(list)
    res.status(200).json({ message: "User data fetched successfully" ,list:list});
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}