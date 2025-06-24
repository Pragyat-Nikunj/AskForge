"use client";
import { ID, Models } from "appwrite";
import React from "react";
import VoteButtons from "./VoteButtons";
import { useAuthStore } from "@/store/Auth";
import { avatars, databases } from "@/models/client/config";
import { answerCollection, db } from "@/models/name";
import RTE, { MarkdownPreview } from "./RTE";
import Comments from "./Comments";
import slugify from "@/utils/slugify";
import Link from "next/link";
import { IconTrash } from "@tabler/icons-react";
import {useState} from "react"
import toast from "react-hot-toast";
function Answers({
    answers: _answers,
    questionId,
}: {
    answers: Models.DocumentList<Models.Document>;
    questionId: string;
}) {
    const [answers, setAnswers] = useState<Models.DocumentList<Models.Document>>(_answers);
    const [newAnswer, setNewAnswer] = useState("");
    const {user} = useAuthStore();

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newAnswer || !user) return;

        try {
            const response = await fetch(`/api/answer`, 
                {method: "POST",
                body: JSON.stringify({
                    questionId,
                    answer: newAnswer,
                    authorId: user.$id,
                })
            });

            const data = await response.json()
            if (!response.ok) throw data;
            
            setAnswers((prev) => ({
                total: prev.total + 1,
                documents: [{
                    ...data,
                    author: user,
                    upvotesDocuments: { documents: [], total: 0 },
                    downvotesDocuments: { documents: [], total: 0 },
                    comments: { documents: [], total: 0 },
                }]
            }));
            setNewAnswer("");
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong")
        }
    }

    const deleteAnswer = async(answerId: string) => {
        try {
            const response = await fetch(`/api/answer`, {
                method: "DELETE",
                body: JSON.stringify({
                    answerId: answerId
                })
            });

            const data = await response.json();

            if (!response.ok) throw data;

            setAnswers((prev) => ({
            total: prev.total - 1,
            documents: prev.documents.filter(answer => answer.$id !== answerId)
            }));


        } catch (error: any) {
            toast.error(error?.message || "Something went wrong. Please try again")
        }
    }
  return (
    <div>
        <h2 className="font-semibold text-2xl mb-4">Answers</h2>
        {answers && answers.documents.map((answer, index) => (
            <div key={index} className="flex flex-col gap-4">
                <div className="w-full overflow-auto">
                    <MarkdownPreview className="rounded-xl p-4" source={answer.content} />
                    <div className="mt-4 flex items-center justify-end gap-1">
                        <picture>
                            <img
                                src={avatars.getInitials(answer.author.name, 36, 36)}
                                alt={answer.author.name}
                                className="rounded-lg"
                            />
                        </picture>
                        <div className="block leading-tight">
                            <Link
                                href={`/users/${answer.author.$id}/${slugify(answer.author.name)}`}
                                className="text-orange-500 hover:text-orange-600"
                            >
                                {answer.author.name}
                            </Link>
                            <p>
                                <strong>{answer.author.reputation}</strong>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-start gap-2 mt-4">
                        <VoteButtons
                            type="answer"
                            id={answer.$id}
                            upvotes={answer.upvotesDocuments}
                            downvotes={answer.downvotesDocuments}
                        />
                        {user && user.$id === answer.authorId ? (
                            <button
                                className="rounded-xl bg-gradient-to-br from-[#FF416C] to-[#FF4B2B] px-5 py-3 text-base font-medium text-white transition duration-200 hover:shadow-lg hover:shadow-[#FF416C]/50"
                                onClick={() => deleteAnswer(answer.$id)}
                            >
                                <IconTrash className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                    <Comments
                        comments={answer.comments}
                        type="answer"
                        typeId={answer.$id}
                        className="mt-4"
                    />
                    <hr className="my-4 border-white/40"/>
                </div>
            </div>
        ))}
          <hr className="my-4 border-white/40" />
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold mb-4">Your Answer</h2>
            <RTE value={newAnswer} onChange={(value) => setNewAnswer(() => value || "")} />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              type="submit"
              disabled={!newAnswer || !user}
              >
                  Post Answer
              </button>

          </form>
    </div>
  )
}

export default Answers

