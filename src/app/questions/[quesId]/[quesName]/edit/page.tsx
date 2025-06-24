import {db, questionCollection} from "@/models/name";
import {databases} from "@/models/server/config";
import EditQues from "./EditQues";
import React from 'react'

const page = async({params}: {params: Promise<{quesId: string, quesName: string}>}) => {
    const resolvedParams = await params;
    const question = await databases.getDocument(db, questionCollection, resolvedParams.quesId);
  return (
    <div>
      <EditQues question={question} />
    </div>
  )
}

export default page
