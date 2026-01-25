import Image from "next/image";


interface AvatarProps {
    userAvatar?: string | null;
}

const Avatar = ({ userAvatar }: AvatarProps) => {

    const imageSrc = userAvatar || "/default-avatar.png";

    return (
        <Image
            src={imageSrc}
            height={50}
            width={50}
            alt="avatar"
            className="w-10 h-10 rounded-full"
        />
    );
};


export default Avatar;