import { databases, users } from "@/models/server/config";
import { answerCollection, db, voteCollection, questionCollection } from "@/models/name";
import { Query } from "node-appwrite";
import Link from "next/link";
import QuestionCard from "@/components/QuestionCard";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { UserPrefs } from "@/store/Auth";
import Pagination from "@/components/Pagination";
import Search from "./Search"
import React from 'react'
import TopContributors from "@/app/components/TopContributors";

const page = async ({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; tag?: string; search?: string }>;
}) => {
    const resolvedSearchParams = await searchParams;

    const queries = [
        Query.orderDesc("$createdAt"),
        Query.offset((+(resolvedSearchParams.page ?? "1") - 1) * 25),
        Query.limit(25),
    ];

    if (resolvedSearchParams.tag) queries.push(Query.equal("tags", resolvedSearchParams.tag));
    if (resolvedSearchParams.search) 
        queries.push(
            Query.or([
                Query.search("title", resolvedSearchParams.search),
                Query.search("content", resolvedSearchParams.search)

            ])
    );

    const questions = await databases.listDocuments(db, questionCollection, queries);

    questions.documents = await Promise.all(
        questions.documents.map(async ques => {
            const [author, answers, votes] = await Promise.all([
                users.get<UserPrefs>(ques.authorId),
                databases.listDocuments(db, answerCollection, [
                    Query.equal("questionId", ques.$id),
                    Query.limit(1), // for optimization
                ]),
                databases.listDocuments(db, voteCollection, [
                    Query.equal("type", "question"),
                    Query.equal("typeId", ques.$id),
                    Query.limit(1), // for optimization
                ]),
            ]);

            return {
                ...ques,
                totalAnswers: answers.total,
                totalVotes: votes.total,
                author: {
                    $id: author.$id,
                    reputation: author.prefs.reputation,
                    name: author.name,
                },
            };
        })
    );

    return (
        <div className="container mx-auto px-4 pb-20 pt-36">
            <div className="mb-10 flex items-center justify-between">
                <h1 className="text-3xl font-bold">All Questions</h1>
                <Link href="/questions/ask">
                    <InteractiveHoverButton>
                        <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight lg:text-lg">
                            Ask Question
                        </span>
                    </InteractiveHoverButton>
                </Link>
            </div>
            <div className="mb-4">
                <Search />
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-1/2 mb-4 max-w-3xl space-y-6">
                    {questions.documents.map(ques => (
                        <QuestionCard key={ques.$id} ques={ques} />
                    ))}
                    <Pagination total={questions.total} limit={25} />
                </div>
                <div className="w-full lg:w-1/2 flex justify-center">
                    <TopContributors />
                </div>
            </div>
        </div>
    )
}

export default page

