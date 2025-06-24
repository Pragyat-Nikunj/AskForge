"use client";
import { databases } from "@/models/server/config";
import { db, questionCollection } from "@/models/name";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { MdDelete } from "react-icons/md";
import React from "react";
import toast from "react-hot-toast";

function DeleteQuestion({questionId, authorId}: {questionId: string, authorId: string}) {
  const router = useRouter();
  const {user} = useAuthStore();

  const deleteQuestion = async() => {
    if (!user) return;

    const response = await databases.deleteDocument(
        db, questionCollection, questionId
    )

    if (response) {
      toast.success("Question deleted successfully");
      router.push("/questions");
    }
  }
  return user?.$id === authorId ? (
    <div>
      <MdDelete
        className="text-red-500 hover:text-red-700 cursor-pointer transition-colors duration-200"
        size={24}
        onClick={deleteQuestion}
        />
    </div>
  ) : null;
}

export default DeleteQuestion
