import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { MagicCard } from "@/components/magicui/magic-card";
import {NumberTicker} from "@/components/magicui/number-ticker";
import { answerCollection, db, questionCollection } from "@/models/name";
import { Query } from "node-appwrite";
import React from 'react'

const page = async({params}: {params: Promise<{userId: string, userSlug: string}>}) => {
    const resolvedParams = await params;
    const [user, answers, questions] = await Promise.all([
        users.get<UserPrefs>(resolvedParams.userId),
        databases.listDocuments(db, answerCollection, [
            Query.equal("authorId", resolvedParams.userId),
            Query.limit(1)
        ]),
        databases.listDocuments(db, questionCollection, [
            Query.equal("authorId", resolvedParams.userId),
            Query.limit(1)
        ]),
    ])
  return (
    <div className="flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row">
        <MagicCard className="flex w-full items-center justify-center shadow-2xl overflow-hidden p-20">
            <div className="absolute inset-x-4 top-4">
                <h2 className="font-bold text-2xl">Reputation</h2>
            </div>
              <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                  <NumberTicker value={user.prefs.reputation || 0} />
              </p>
        </MagicCard>
        <MagicCard className="flex w-full items-center justify-center shadow-2xl overflow-hidden p-20">
              <div className="absolute inset-x-4 top-4">
                  <h2 className="font-bold text-2xl">Questions</h2>
              </div>
              <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                  <NumberTicker value={questions.total || 0} />
              </p>
        </MagicCard>
        <MagicCard className="flex w-full items-center justify-center shadow-2xl overflow-hidden p-20">
              <div className="absolute inset-x-4 top-4">
                  <h2 className="font-bold text-2xl">Answers</h2>
              </div>
              <p className="z-10 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
                  <NumberTicker value={answers.total || 0} />
              </p>
        </MagicCard>
    </div>
  )
}

export default page
