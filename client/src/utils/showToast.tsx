import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning";

interface ShowToastProps {
    type: ToastType;
    message: string;
}

export const showToast = ({ type, message }: ShowToastProps) => {
    const config = {
        success: {
            icon: <CheckCircle className="text-green-600 dark:text-green-400 mr-2" />,
        },
        error: {
            icon: <XCircle className="text-red-600 dark:text-red-400 mr-2" />,
        },
        warning: {
            icon: <AlertTriangle className="text-yellow-600 dark:text-yellow-400 mr-2" />,
        },
    };

    toast[type](message, {
        icon: config[type].icon
    });
};
