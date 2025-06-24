import Pagination from "@/components/Pagination";
import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases } from "@/models/server/config";
import slugify from "@/utils/slugify";
import Link from "next/link";
import { Query } from "node-appwrite";
import React from 'react'
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const page = async ({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string; userSlug: string }>,
    searchParams: Promise<{ page?: string; voteStatus?: "upvoted" | "downvoted" }>,
}) => {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const pageNum = +(resolvedSearchParams.page ?? "1");

    const query = [
        Query.equal("votedById", resolvedParams.userId),
        Query.orderDesc("$createdAt"),
        Query.offset((pageNum - 1) * 25),
        Query.limit(25),
    ];

    if (resolvedSearchParams.voteStatus) query.push(Query.equal("voteStatus", resolvedSearchParams.voteStatus));

    const votes = await databases.listDocuments(db, voteCollection, query);

    votes.documents = await Promise.all(
        votes.documents.map(async (vote) => {
            const questionOfTypeQuestion = vote.type === "question"
                ? await databases.getDocument(db, questionCollection, vote.typeId, [Query.select(["title"])])
                : null;
            if (questionOfTypeQuestion) {
                return { ...vote, question: questionOfTypeQuestion }
            }
            const answer = await databases.getDocument(db, answerCollection, vote.typeId);
            const questionOfTypeAnswer = await databases.getDocument(
                db,
                questionCollection,
                answer.questionId,
                [Query.select(["title"])]
            );
            return { ...vote, question: questionOfTypeAnswer }
        })
    );

    return (
        <div className="px-4">
            <div className="mb-4 flex justify-between">
                <p>{votes.total} votes</p>
                <ul className="flex gap-1">
                    <li>
                        <Link
                            href={`/users/${resolvedParams.userId}/${resolvedParams.userSlug}/votes`}
                            className={`block w-full rounded-full px-3 py-0.5 duration-200 ${!resolvedSearchParams.voteStatus ? "bg-white/20" : "hover:bg-white/20"
                                }`}
                        >
                            All
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={`/users/${resolvedParams.userId}/${resolvedParams.userSlug}/votes?voteStatus=upvoted`}
                            className={`block w-full rounded-full px-3 py-0.5 duration-200 ${resolvedSearchParams?.voteStatus === "upvoted"
                                ? "bg-white/20"
                                : "hover:bg-white/20"
                                }`}
                        >
                            Upvotes
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={`/users/${resolvedParams.userId}/${resolvedParams.userSlug}/votes?voteStatus=downvoted`}
                            className={`block w-full rounded-full px-3 py-0.5 duration-200 ${resolvedSearchParams?.voteStatus === "downvoted"
                                ? "bg-white/20"
                                : "hover:bg-white/20"
                                }`}
                        >
                            Downvotes
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="mb-4 max-w-3xl space-y-6">
                {votes.documents.map(vote => (
                    <div
                        key={vote.$id}
                        className="rounded-xl border border-white/40 p-4 duration-200 hover:bg-white/10"
                    >
                        <div className="flex">
                            <p className="mr-4 shrink-0">{vote.voteStatus}</p>
                            <p>
                                <Link
                                    href={`/questions/${vote.question.$id}/${slugify(vote.question.title)}`}
                                    className="text-orange-500 hover:text-orange-600"
                                >
                                    {vote.question.title}
                                </Link>
                            </p>
                        </div>
                        <p className="text-right text-sm">
                            {dayjs(vote.$createdAt).fromNow()}
                        </p>
                    </div>
                ))}
            </div>
            <Pagination total={votes.total} limit={25} />
        </div>
    )
}

export default page
