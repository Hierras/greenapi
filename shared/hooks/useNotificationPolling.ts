"use client";

import { useEffect, useRef } from "react";
import { receiveNotification } from "@/shared/actions/receiveNotification";
import { deleteNotification } from "@/shared/actions/deleteNotification";
import type { ReceiveNotificationResponse } from "../lib/green-api/types";

export interface UseNotificationPollingOptions {
    onNotification: (n: ReceiveNotificationResponse) => void | Promise<void>;
    onError?: (e: unknown) => void;
    enabled?: boolean;
}

export function useNotificationPolling({
    onNotification,
    onError,
    enabled = true,
}: UseNotificationPollingOptions) {
    const onNotificationRef = useRef(onNotification);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onNotificationRef.current = onNotification;
        onErrorRef.current = onError;
    }, [onError, onNotification]);

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const loop = async () => {
            if (cancelled) return;

            try {
                const notification = await receiveNotification({
                    receiveTimeout: 5,
                });

                if (cancelled) return;

                if (notification) {
                    await onNotificationRef.current(notification);

                    await deleteNotification({
                        receiptId: notification.receiptId,
                    });
                }
            } catch (e) {
                if (!cancelled) onErrorRef.current?.(e);
            }

            if (!cancelled) {
                timer = setTimeout(loop, 5000);
            }
        };

        loop();

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [enabled]);
}