"use client";

import api from '@/config/axios';
import { useEffect, useRef } from 'react';

interface UsePostViewProps {
    postId: string;
    onView?: () => void;
    enabled?: boolean;
}

export const usePostView = ({ postId, onView, enabled = true }: UsePostViewProps) => {

    const hasTracked = useRef(false);
    const viewTimer = useRef<NodeJS.Timeout | null>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (!enabled || hasTracked.current || !elementRef.current) return;

        const observer = new IntersectionObserver(([entry]) => {

            if (entry.isIntersecting) {

                viewTimer.current = setTimeout(() => {
                    if (!hasTracked.current) {
                        trackView();
                        hasTracked.current = true;
                    }
                }, 3000);

            } else {
                if (viewTimer.current) {
                    clearTimeout(viewTimer.current);
                    viewTimer.current = null;
                }
            }
        },
            {
                threshold: 0.5, // 50% visible
                rootMargin: '0px'
            }
        );

        observer.observe(elementRef.current);

        return () => {
            if (viewTimer.current) clearTimeout(viewTimer.current);
            observer.disconnect();
        };

    }, [postId, enabled]);


    // Track view function
    const trackView = async () => {
        try {
            const response = await api.post(`/posts/${postId}/view`);

            if (response.data.success) {
                console.log('View tracked:', postId);
                onView?.();
            }
        } catch (error) {
            console.error('Failed to track view:', error);
        }
    };

    return { elementRef };

};