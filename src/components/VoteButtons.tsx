"use client";
import { databases } from "@/models/server/config";
import {db, voteCollection} from "@/models/name"
import { useAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import {ID, Models, Query} from "appwrite";
import { BiUpvote } from "react-icons/bi";
import { BiSolidUpvote } from "react-icons/bi";
import { BiDownvote } from "react-icons/bi";
import { BiSolidDownvote } from "react-icons/bi";
import React, { useEffect, useState } from 'react'
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function VoteButtons({
    type,
    id,
    upvotes,
    downvotes,
    className,
}: {
    type: "question" | "answer",
    id: string,
    upvotes: Models.DocumentList<Models.Document> ,
    downvotes: Models.DocumentList<Models.Document>,
    className?: string
}) {
    const router = useRouter();
    const {user} = useAuthStore();
    const [votedResult, setVotedResult] = useState<number>(upvotes.total - downvotes.total);
    const [votedDocument, setVotedDocument] = useState<Models.Document | null>(null);

    useEffect(() =>
        {(async() => {
            if (!user)
                return;

        const response = await databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", id),
            Query.equal("votedById", user.$id),
        ]);

        setVotedDocument(() => response.documents[0] || null);
    })})
    const toggleUpvote = async() => {
        try {
            if (!user) {
                toast.error("You must be logged in to upvote");
                router.push("/login");
                return;
            }

            const response = await fetch('/api/vote', {
                method: "POST",
                body: JSON.stringify({
                    votedById: user.$id,
                    voteStatus: "upvoted",
                    type,
                    typeId: id
                })
            });

            const data = await response.json();

            if (!response.ok) throw data;

            setVotedResult(data.data.voteResult);
            setVotedDocument(() => data.data.document);
        } catch (error: any) {
            toast.error("Something went wrong while voting");
        }
    }

    const toggleDownvote = async() => {
        try {
            if (!user) {
                toast.error("You must be logged in to downvote");
                router.push("/login");
                return;
            }

            const response = await fetch(`/api/vote`, {
                method: "POST",
                body: JSON.stringify({
                    votedById: user.$id,
                    voteStatus: "downvoted",
                    type,
                    typeId: id
                })
            });

            const data = await response.json();

            if (!response.ok) throw data;

            setVotedResult(data.data.voteResult);
            setVotedDocument(() => data.data.document);
            }
         catch (error: any) {
            toast.error("Something went wrong while voting");
        }
    }
  return (
    <div className={cn("flex gap-2 shrink-0 items-center justify-start", className)}>
      <button onClick={toggleUpvote} className="flex items-center justify-center text-2xl text-gray-500 hover:text-gray-700">
              {votedDocument && votedDocument.voteStatus === "upvoted" ? <BiSolidUpvote /> : <BiUpvote />}
      </button>
      <span className="text-base font-semibold">
        {votedResult}
      </span>
      <button onClick={toggleDownvote} className="flex items-center justify-center text-2xl text-gray-500 hover:text-gray-700">
              {votedDocument && votedDocument.voteStatus === "downvoted" ? <BiSolidDownvote /> : <BiDownvote />}
      </button>
    </div>
  )
}

export default VoteButtons
