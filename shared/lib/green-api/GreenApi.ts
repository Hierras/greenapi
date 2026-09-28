import 'server-only'
import type { GetStateInstanceResponse, SendMessageResponse, SendMessageRequest, ChatMessage, GetChatHistoryRequest, ReceiveNotificationResponse, DeleteNotificationResponse, CheckAccountResponse } from './types';

export class GreenApi {
    private readonly DEFAULT_URL: string;
    private apiTokenInstance: string;
    private idInstance: string;

    constructor(aTI: string, iI: string) {
        this.apiTokenInstance = aTI;
        this.idInstance = iI;
        this.DEFAULT_URL = process.env.GREEN_API_URL ?? "https://api.green-api.com";
    }

    private buildFullURL(methodName: string): string {
        return `${this.DEFAULT_URL}/waInstance${this.idInstance}/${methodName}/${this.apiTokenInstance}`;
    }

    private async request<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GREEN-API error ${response.status}: ${errorText}`);
        }

        const text = await response.text();
        if (text.length === 0) {
            return null as T;
        }


        return JSON.parse(text) as T;
    }

    async getStateInstance(): Promise<GetStateInstanceResponse> {
        const url = this.buildFullURL("getStateInstance");
        return this.request<GetStateInstanceResponse>(url, { method: "GET" });
    }

    async sendMessage(
        chatId: string,
        message: string,
        linkPreview = true
    ): Promise<SendMessageResponse> {
        const url = this.buildFullURL("sendMessage");
        const body: SendMessageRequest = { chatId, message, linkPreview };

        return this.request<SendMessageResponse>(url, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    async checkAccount(phoneNumber: string | number): Promise<CheckAccountResponse> {
        const url = this.buildFullURL("checkAccount");

        const numeric = typeof phoneNumber === "number"
            ? phoneNumber
            : Number(phoneNumber.replace(/\D/g, ""));

        if (!Number.isFinite(numeric) || numeric <= 0) {
            throw new Error(`Invalid phoneNumber: ${phoneNumber}`);
        }

        return this.request<CheckAccountResponse>(url, {
            method: "POST",
            body: JSON.stringify({ phoneNumber: numeric }),
        });
    }

    async getChatHistory(
        chatId: string,
        count = 100
    ): Promise<ChatMessage[]> {
        const url = this.buildFullURL("getChatHistory");
        const body: GetChatHistoryRequest = { chatId, count };

        return this.request<ChatMessage[]>(url, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    async receiveNotification(
        receiveTimeout = 5
    ): Promise<ReceiveNotificationResponse | null> {
        const url = `${this.buildFullURL("receiveNotification")}?receiveTimeout=${receiveTimeout}`;
        const result = await this.request<ReceiveNotificationResponse | null>(url, {
            method: "GET",
        });

        return result && result.receiptId ? result : null;
    }

    async deleteNotification(
        receiptId: number
    ): Promise<DeleteNotificationResponse> {
        const url = `${this.buildFullURL("deleteNotification")}/${receiptId}`;
        return this.request<DeleteNotificationResponse>(url, { method: "DELETE" });
    }
}