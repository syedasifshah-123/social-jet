export const useTimeAgo = (date: string | Date) => {
    if (!date) return "";

    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    // Agar diff negative hai (future date), toh just now dikhayen
    if (diffInSeconds < 0) return "just now";

    // Time calculations
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    // Edge Cases Logic (Social Media Style: 1m, 1h, 1d, 1w)
    if (diffInSeconds < 60) return `Just posted`; // Seconds
    if (minutes < 60) return `${minutes}m`;           // Minutes
    if (hours < 24) return `${hours}h`;               // Hours
    if (days < 7) return `${days}d`;                 // Days
    if (weeks < 4) return `${weeks}w`;               // Weeks

    // Agar 1 saal se purana ho
    if (years >= 1) return `${years}y`;

    // Agar weeks se upar ho jaye toh months dikhayen
    return `${months}mo`;
};
