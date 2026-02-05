import { toast } from "sonner";
import { AlertTriangle, LucideBadgeCheck, LucideBadgeAlert } from "lucide-react";



type ToastType = "success" | "error" | "warning";



interface ShowToastProps {
    type: ToastType;
    message: string;
}


export const showToast = ({ type, message }: ShowToastProps) => {
    const config = {
        success: {
            icon: <LucideBadgeCheck className="text-green-300 fill-green-600 mr-2" />,
        },
        error: {
            icon: <LucideBadgeAlert className="text-red-300 fill-red-600 mr-2" />,
        },
        warning: {
            icon: <AlertTriangle className="text-yellow-600 mr-2" />
        },
    };

    toast[type](message, {
        icon: config[type].icon
    });
};
