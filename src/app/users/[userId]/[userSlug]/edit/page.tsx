"use client"

import React, { useState } from "react";
import { UserPrefs } from "@/store/Auth";
import { account } from "@/models/client/config";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";

const Page = ({
    params,
    searchParams,
}: {
    params: Promise<{ userId: string; userSlug: string }>;
    searchParams: { page?: string };
}) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Unwrap params using React.use()
    const resolvedParams = React.use(params);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name && !email) {
            setError("Please enter a new name or email.");
            return;
        }
        if (email && !password) {
            setError("Password is required to change email.");
            return;
        }
        const userId = resolvedParams.userId;
        try {
            setLoading(true);
            setError(null);
            let updated = false;
            if (name) {
                await account.updateName(name);
                updated = true;
            }
            if (email) {
                await account.updateEmail(email, password);
                updated = true;
            }
            if (updated) {
                toast.success("Profile updated successfully");
                router.push(`/users/${userId}/${resolvedParams.userSlug}`);
                router.refresh();
            } else {
                setError("No changes made.");
            }
            setName("");
            setEmail("");
            setPassword("");
        } catch (error: any) {
            setError(error?.message || "Update failed");
            toast.error(error?.message || "Update failed");
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-transparent">
            <NeonGradientCard className="max-w-4xl w-full p-6 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold my-10">Edit Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col md:flex-row md:space-x-4">
                    <div className="flex flex-col space-y-2 w-full md:w-1/2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>
                    <div className="flex flex-col space-y-2 w-full md:w-1/2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your new email"
                        />
                    </div>
                    <div className="flex flex-col space-y-2 w-full md:w-1/2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password to confirm email change"
                            required={!!email}
                        />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 bg-blue-500 text-white rounded ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? "Updating..." : "Update Profile"}
                    </button>
                </form>
            </NeonGradientCard>
        </div>
    );
};

export default Page;