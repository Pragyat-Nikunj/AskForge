"use client";
import { databases } from "@/models/server/config";
import { db, questionCollection } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import  Link  from "next/link";
import slugify  from "@/utils/slugify";
import { FaEdit } from "react-icons/fa";
import React from 'react'

function EditQuestion({questionId, authorId, questionTitle}: {questionId: string, authorId: string, questionTitle: string}) {
    const router = useRouter();
    const { user } = useAuthStore();

  return user?.$id === authorId ? (
    <div>
      <Link
            href={`/questions/${questionId}/${slugify(questionTitle)}/edit`}
            className="flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10"
        >
            <FaEdit
                className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors duration-200"
                size={24}
            />
        </Link>
    </div>
  ) : null;
}

export default EditQuestion
