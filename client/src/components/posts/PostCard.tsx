"use client";

import Image from "next/image";
import {
    MessageCircle,
    Repeat2,
    Heart,
    BarChart2,
    Bookmark,
    Share
} from "lucide-react";
import Avatar from "../Avatar";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import Link from "next/link";
import { useParams } from "next/navigation";


type PostCardProps = {
    avatar: string;
    name: string;
    username: string;
    time: string;
    content: string;
    media?: string;
    verified?: boolean;
};

const PostCard = ({
    avatar,
    name,
    username,
    time,
    content,
    media,
    verified = false,
}: PostCardProps) => {


    return (
        <div className="flex gap-3 px-4 py-3 border-b border-(--input-border) hover:bg-(--hover)/50 transition cursor-pointer">

            {/* Avatar */}
            <div className="w-10 h-10">
                <Avatar userAvatar={avatar} />
            </div>

            {/* Content */}
            <div className="flex-1">

                {/* Header */}
                <div className="flex items-center gap-2 text-sm">
                    <Link href={username} className="font-semibold text-(--text-color) text-[17px] hover:underline">{name}</Link>
                    <span className="text-(--secondary-text) text-[16px]">· {username}</span>
                    <span className="text-(--secondary-text)">· {useTimeAgo(time)}</span>
                </div>

                {/* Text */}
                <p className="mt-1 text-(--text-color) leading-relaxed whitespace-pre-line">
                    {content}
                </p>

                {/* Media */}
                {media && (
                    <div className="h-87.5 w-125 max-md:w-75 max-md:h-62.5 mt-3 rounded-xl overflow-hidden border border-(--input-border)">
                        <Image
                            src={media}
                            alt="post media"
                            width={600}
                            height={400}
                            className="w-full object-cover"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between max-w-md mt-3 text-(--secondary-text)">
                    <Action icon={<Heart size={18} />} />
                    <Action icon={<MessageCircle size={18} />} />
                    <Action icon={<Bookmark size={18} />} />
                    <Action icon={<Share size={18} />} />
                </div>
            </div>
        </div>
    );
};

export default PostCard;

const Action = ({ icon }: { icon: React.ReactNode }) => (
    <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
        {icon}
    </div>
);
