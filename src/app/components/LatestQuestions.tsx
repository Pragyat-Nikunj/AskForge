import QuestionCard from "@/components/QuestionCard";
import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query } from "node-appwrite";
import React from 'react'

const LatestQuestions = async() => {
    const questions = await databases.listDocuments(db, questionCollection, [
        Query.orderDesc("$createdAt"),
        Query.limit(5)
    ]);
    console.log("Fetched latest questions:", questions);

    questions.documents = await Promise.all(
        questions.documents.map(async(ques) => {
            const [author, answers, votes] = await Promise.all([
                users.get<UserPrefs>(ques.authorId),
                databases.listDocuments(db, answerCollection, [
                    Query.equal("questionId", ques.$id),
                    Query.limit(1),
                ]),
                databases.listDocuments(db, voteCollection, [
                    Query.equal("type", "question"),
                    Query.equal("typeId", ques.$id),
                    Query.limit(1),
                ])
            ]);

            return {
                ...ques,
                answers: answers.total,
                votes: votes.total,
                author: {
                    $id: author.$id,
                    reputation: author.prefs.reputation,
                    name: author.name,
                }
            }
        })
    );
    
    console.log("Latest question")
    console.log(questions)
  return (
    <div className="space-y-6">
      {questions.documents.map(ques => (
        <QuestionCard ques={ques} key={ques.$id} />
      ))}
    </div>
  )
}

export default LatestQuestions
