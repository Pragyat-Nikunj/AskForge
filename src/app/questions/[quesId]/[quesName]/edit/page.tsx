import { db, questionCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import EditQues from "./EditQues";
import React from 'react'

const page = async ({ params }: { params: { quesId: string, quesName: string } }) => {
  const question = await databases.getDocument(db, questionCollection, params.quesId);
  return (
    <div>
      <EditQues question={question} />
    </div>
  )
}

export default page
