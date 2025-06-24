"use client";

import RTE from "./RTE";
import { MagicCard } from "./magicui/magic-card";
import { useAuthStore } from "@/store/Auth";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import slugify from "@/utils/slugify";
import { IconX } from "@tabler/icons-react";
import { Models, ID } from "appwrite";
import { useRouter } from "next/navigation";
import { Confetti } from "@/components/magicui/confetti";
import { databases, storage } from "@/models/client/config";
import { db, questionAttachmentBucket, questionCollection } from "@/models/name";
import React from 'react'
import toast from "react-hot-toast";
import { FaPray } from "react-icons/fa";

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (

        <div
            className={cn(
                "relative flex w-full flex-col space-y-2 overflow-hidden rounded-xl border border-white/20 bg-slate-950 p-4",
                className
            )}
        >
            <MagicCard className={cn("flex w-full flex-col space-y-2", className)}>
                {children}
            </MagicCard>
        </div>

    );
};

function QuestionForm({ question }: { question?: Models.Document }) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [tag, setTag] = useState("");
    const [formData, setFormData] = useState({
        title: String(question?.title || ""),
        content: String(question?.content || ""),
        tags: new Set((question?.tags || []) as string[]),
        attachment: null as File | null
    })
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState("");


    const loadConfetti = (timeInMS = 3000) => {
        const end = Date.now() + timeInMS; // 3 seconds
        const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

        const frame = () => {
            if (Date.now() > end) return;

            Confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                startVelocity: 60,
                origin: { x: 0, y: 0.5 },
                colors: colors,
            });
            Confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                startVelocity: 60,
                origin: { x: 1, y: 0.5 },
                colors: colors,
            });

            requestAnimationFrame(frame);
        };

        frame();
    };

    const create = async () => {
        if (!formData.attachment) throw new Error("Please upload an image");
        if (!user) {
            toast.error("You must be logged in.");
            router.push("/login");
            return;
        }

        const storageResponse = await storage.createFile(questionAttachmentBucket,
            ID.unique(),
            formData.attachment
        );

        const response = await databases.createDocument(db, questionCollection, ID.unique(), {
            title: formData.title,
            content: formData.content,
            authorId: user.$id, 
            tags: Array.from(formData.tags),
            attachmentId: storageResponse.$id,
        });

        loadConfetti();

        return response;
    }

    const update = async () => {
        if (!user) {
            toast.error("You must be logged in.");
            router.push("/login");
            return;
        }
        if (!question) throw new Error("Please provide a question");
        const attachmentId = await (async () => {
            if (!formData.attachment) return question?.attachmentId as string;

            await storage.deleteFile(questionAttachmentBucket, question.attachmentId);

            const file = await storage.createFile(questionAttachmentBucket,
                ID.unique(), formData.attachment);

            return file.$id;
        })();

        const response = await databases.updateDocument(db, questionCollection, question.$id, {
            title: formData.title,
            content: formData.content,
            authorId: user.$id, // use latest user.$id
            tags: Array.from(formData.tags),
            attachmentId: attachmentId,
        });

        loadConfetti();

        return response;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const authorId = user?.$id;

        if (!formData.title || !formData.content || !authorId) {
            setError(() => "Please fill out all fields");
            return;
        }

        setLoading(true);
        setError(() => "")
        try {
           
            const response = question
                ? await update()
                : await create();

            router.push(`/questions/${response?.$id}/${slugify(formData.title)}`);
        } catch (error: any) {
            setError(() => error.message);
        }
        setLoading(false);
    }
    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <LabelInputContainer>
                <Label className="text-lg font-semibold" htmlFor="title">
                    Title
                </Label>
                <br />
                <small>
                    Be specific and imagine you&apos;re asking a question to another person.
                </small>
                <Input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter the title of your question"
                />
            </LabelInputContainer>
            <LabelInputContainer>
                <Label htmlFor="content">
                    What are the details of your problem?
                    <br />
                    <small>
                        Introduce the problem and expand on what you put in the title. Minimum 20
                        characters.
                    </small>
                </Label>
                <RTE
                    value={formData.content}
                    onChange={(value) => setFormData((prev) => ({ ...prev, content: value || "" }))}
                />
            </LabelInputContainer>
            <LabelInputContainer>
                <Label htmlFor="image">
                    Attach an image
                    <br />
                    <small>
                        If applicable, add an image to help explain your problem.
                    </small>
                </Label>
                <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    placeholder="Upload an image"
                    onChange={(e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        setFormData((prev) => ({
                            ...prev, attachment: files[0]
                        }))
                    }}
                />
            </LabelInputContainer>
            <LabelInputContainer>
                <Label htmlFor="tags">
                    Tags
                    <br />
                    <small>
                        Add tags to describe what your question is about. Start typing to see
                        suggestions.
                    </small>
                </Label>
                <div className="flex w-full gap-4">
                    <div className="w-full">
                        <Input
                            id="tags"
                            name="tags"
                            type="text"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            placeholder="e.g. (java c objective-c)"
                        />
                    </div>
                    <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                        onClick={() => {
                            if (tag.length === 0) return;
                            setFormData((prev) => ({
                                ...prev,
                                tags: new Set([...prev.tags, tag.trim().toLowerCase()])

                            }))
                        }}>
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                            Add
                        </span>
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {Array.from(formData.tags).map((tag, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="group relative inline-block rounded-full bg-slate-800 p-px text-xs font-semibold leading-6 text-white no-underline shadow-2xl shadow-zinc-900">
                                <span className="absolute inset-0 overflow-hidden rounded-full">
                                    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                </span>
                                <div className="relative z-10 flex items-center space-x-2 rounded-full bg-zinc-950 px-4 py-0.5 ring-1 ring-white/10">
                                    <span>{tag}</span>
                                    <button
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                tags: new Set(
                                                    Array.from(prev.tags).filter(t => t !== tag)
                                                ),
                                            }));
                                        }}
                                        type="button"
                                    >
                                        <IconX size={12} />
                                    </button>
                                </div>
                                <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                            </div>
                        </div>
                    ))}
                </div>
                {error &&
                    <LabelInputContainer>
                        <div className="text-center">
                            <span className="text-red-500">{error}</span>
                        </div>
                    </LabelInputContainer>}

            </LabelInputContainer>
            <button className="group relative inline-flex h-[calc(48px+8px)] items-center justify-center rounded-full bg-neutral-950 py-1 pl-6 pr-14 font-medium text-neutral-50"
                type="submit"
                disabled={loading}>
                <span className="z-10 pr-2">{question ? "Update" : "Publish"}</span>
                <div className="absolute right-1 inline-flex h-12 w-12 items-center justify-end rounded-full bg-neutral-700 transition-[width] group-hover:w-[calc(100%-8px)]">
                    <div className="mr-3.5 flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-50">
                        <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                        </svg>
                        </div>
                    </div>
                </button>
        </form>
    )
}

export default QuestionForm;
