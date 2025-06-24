"use client";
import { databases } from "@/models/client/config";
import { useAuthStore } from "@/store/Auth";
import { db, commentCollection } from "@/models/name";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ID, Models } from "appwrite";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import React, { use } from 'react'
import { useState } from "react";
import toast from "react-hot-toast";
import slugify from "@/utils/slugify";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function Comments({
    comments: _comments,
    className,
    type,
    typeId,
}: {
    comments: Models.DocumentList<Models.Document>,
    className?: string,
    type: "answer" | "question",
    typeId: string,
}) {
    const router = useRouter();
    const [comments, setComments] = useState(_comments);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");
    const { user } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (!user) {
                toast.error("You must be logged in to comment");
                router.push("/login");
                return;
            }

            if (!newComment.trim()) {
                toast.error("Comment cannot be empty");
                return;
            }

            if (newComment.length > 10000) {
                toast.error("Comment exceeds maximum length of 10000 characters");
                return;
            }

            const response = await databases.createDocument(
                db, commentCollection,
                ID.unique(),
                {
                    content: newComment,
                    type,
                    typeId,
                    authorId: user.$id
                }
            );

            setNewComment("");
            setComments(prev => ({
                total: prev.total + 1,
                documents: [{ ...response, author: user }, ...prev.documents],
            }));
        } catch (error: any) {
            toast.error(error.message || "Failed to create comment");
        }
    }

    const deleteComment = async (commentId: string) => {
        try {
            if (!user) {
                toast.error("You must be logged in to delete a comment");
                router.push("/login");
                return;
            }

            const response = await databases.deleteDocument(db, commentCollection, commentId);

            if (!response) {
                toast.error("Failed to delete comment");
                return;
            }

            setComments(prev => ({
                total: prev.total - 1,
                documents: prev.documents.filter(comment => commentId !== comment.$id),
            }));

        } catch (error: any) {
            toast.error("Something went wrong while deleting comment");
        }
    }

    const editComment = async (commentId: string, content: string) => {
        try {
            if (!user) {
                toast.error("You must be logged in to edit a comment");
                router.push("/login");
                return;
            }

            if (!content.trim()) {
                toast.error("Comment cannot be empty");
                return;
            }

            if (content.length > 10000) {
                toast.error("Comment exceeds maximum length of 10000 characters");
                return;
            }

            const response = await databases.updateDocument(
                db,
                commentCollection,
                commentId,
                { content }
            );

            if (!response) {
                toast.error("Failed to edit comment");
                return;
            }

            setComments(prev => ({
                total: prev.total,
                documents: prev.documents.map(comment =>
                    comment.$id === commentId ? { ...comment, content } : comment
                ),
            }));
        } catch (error: any) {
            toast.error("Something went wrong while edit comment");
        }
    }

    return (
        <div className={cn("flex flex-col gap-2 pl-4", className)}>
            {comments.documents.map(comment => (
                <React.Fragment key={comment.$id}>
                    <hr className="border-white/40" />
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Link
                                href={`/users/${comment.authorId}/${slugify(comment.author.name)}`}
                                className="text-orange-500 hover:text-orange-600 text-sm flex justify-start"
                            >
                                {comment.author.name}
                            </Link>
                            <span className="opacity-60">
                                {dayjs(comment.$createdAt).fromNow()}
                            </span>
                        </div>
                        {editingCommentId === comment.$id ? (
                            <div className="flex flex-col gap-2">
                                <textarea
                                    className="w-full p-2 bg-transparent border border-white/20 rounded-md text-sm focus:outline-none focus:border-orange-500"
                                    rows={2}
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(() => e.target.value)}
                                />
                                <button
                                    className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                                    onClick={async () => {
                                        await editComment(comment.$id, editingContent);
                                        setEditingCommentId(null);
                                        setEditingContent("");
                                    }}>
                                    Save
                                </button>
                                <button
                                    type="submit"
                                    className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                                    onClick={() => {
                                        setEditingCommentId(null);
                                        setEditingContent("");
                                    }}>
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm">{comment.content}</p>
                        )}
                        {user && user.$id === comment.authorId && (
                            <div className="flex gap-2">
                                <button
                                    className="shrink-0 text-red-500 hover:text-red-600"
                                    onClick={() => {
                                        setEditingCommentId(comment.$id);
                                        setEditingContent(comment.content);
                                    }}
                                >
                                    <FaEdit className="inline-block" />
                                </button>
                                <button
                                    className="shrink-0 text-red-500 hover:text-red-600"
                                    onClick={() => deleteComment(comment.$id)}
                                >
                                    <MdDelete className="inline-block" />
                                </button>
                            </div>
                        )}
                    </div>
                </React.Fragment>
            ))}
            {comments.total === 0 && (
                <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
            )}
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full p-2 bg-transparent border border-white/20 rounded-md text-sm focus:outline-none focus:border-orange-500"
                    rows={1}
                    value={newComment}
                    onChange={(e) => setNewComment(() => e.target.value)}
                />
                <button
                    type="submit"
                    className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                    ➕ Add Comment
                </button>
            </form>
        </div>
    )
}

export default Comments;
