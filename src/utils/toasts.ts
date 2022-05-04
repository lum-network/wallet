import { toast } from 'react-toastify';

export const showErrorToast = (content: string): void => {
    toast.error(content);
};

export const showSuccessToast = (content: string): void => {
    toast.success(content);
};

export const showInfoToast = (content: string): void => {
    toast.info(content);
};
