import { avatars } from "@/models/client/config";
import { users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import EditButton from "./EditButton";
import Navbar from "./Navbar";
import { IconClockFilled, IconUserFilled } from "@tabler/icons-react";
import React from 'react'
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
const layout = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ userId: string; userSlug: string }>;

}) => {
    const resolvedParams = await params;
    const user = await users.get<UserPrefs>(resolvedParams.userId);

    return (
        <div className="container mx-auto space-y-4 px-4 pb-20 pt-32">
            <div className="flex flex-col gap-4 sm:flex-row">
                <picture className="w-40 shrink-0">
                    <img
                        src={avatars.getInitials(user.name, 200, 200)}
                        alt={user.name}
                        className="rounded-xl w-full h-full border-2 object-cover border-gray-200"
                    />
                </picture>
            </div>
            <div className="w-full">
                <div className="flex items-start justify-between">
                    <div className="block space-y-0.5">
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <p className="text-gray-500 items-center text-lg">{user.email}</p>
                        <p className="flex text-gray-500 items-center text-sm gap-1">
                            <IconClockFilled className="w-4 shrink-0" /> Dropped {" "}
                            {dayjs(user.$createdAt).fromNow()}
                        </p>
                        <p className="flex text-gray-500 items-center text-sm gap-1">
                            <IconUserFilled className="w-4 shrink-0" /> Last Activity {" "}
                            {dayjs(user.$updatedAt).fromNow()}
                        </p>
                    </div>
                    <div className="shrink-0">
                        <EditButton />
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
                <Navbar />
                <div className="w-full">{children}</div>
            </div>
        </div>
    );
}

export default layout
