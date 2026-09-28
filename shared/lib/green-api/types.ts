
/* ============================================================
 *  Общие типы
 * ============================================================ */

export type NotificationType =
  | "incomingMessageReceived"
  | "outgoingMessageStatus"
  | "outgoingAPIMessageReceived"
  | "outgoingMessageReceived"
  | "stateInstanceChanged"
  | "deviceInfo"
  | "incomingCall"
  | "contactSyncRequest"
  | "contactSyncResponse";

export type InstanceState =
  | "notAuthorized"
  | "authorized"
  | "blocked"
  | "starting"
  | "yellowCard"
  | "sleepMode";

export type ChatType = "user" | "group" | "supergroup" | "channel" | "bot";

export type SenderType = ChatType;

export type OutgoingMessageStatusType =
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "noAccount"
  | "notInGroup"
  | "unknown";

export type MessageType =
  | "textMessage"
  | "extendedTextMessage"
  | "imageMessage"
  | "videoMessage"
  | "documentMessage"
  | "audioMessage"
  | "voiceMessage"
  | "stickerMessage"
  | "contactMessage"
  | "locationMessage"
  | "pollMessage"
  | "buttonsMessage"
  | "templateMessage"
  | "listMessage"
  | "reactionMessage"
  | "quotedMessage";

/* ============================================================
 *  Данные инстанса
 * ============================================================ */

export interface InstanceData {
  idInstance: number;
  wid: string;
  typeInstance: string;
}

/* ============================================================
 *  Отправитель / чат
 * ============================================================ */

export interface SenderData {
  chatId: string;
  chatName?: string;
  sender: string;
  senderName?: string;
  senderContactName?: string;
  senderType?: SenderType;
  phone?: number;
}

export interface ChatData {
  chatId: string;
  chatName?: string;
  chatType?: ChatType;
  sender?: string;
}

/* ============================================================
 *  messageData — по типам сообщений
 * ============================================================ */

export interface TextMessageData {
  textMessage: string;
}

export interface ExtendedTextMessageData {
  text: string;
  description?: string;
  title?: string;
  previewType?: string;
  jpegThumbnail?: string;
  forwardingScore?: number;
  isForwarded?: boolean;
}

export interface QuotedMessageData {
  stanzaId: string;
  participant?: string;
  typeMessage: MessageType;
  textMessage?: string;
  downloadUrl?: string;
  caption?: string;
  fileName?: string;
  jpegThumbnail?: string;
  mimeType?: string;
  isAnimated?: boolean;
}

export interface FileMessageData {
  downloadUrl: string;
  caption?: string;
  fileName?: string;
  jpegThumbnail?: string;
  mimeType?: string;
  isAnimated?: boolean;
  forwardingScore?: number;
  isForwarded?: boolean;
}

export interface LocationMessageData {
  latitude: number;
  longitude: number;
  address?: string;
  live?: boolean;
  accuracy?: number;
  nameLocation?: string;
  jpegThumbnail?: string;
}

export interface ContactMessageData {
  contactName: string;
  contactId: string;
  vcard?: string;
}

export interface PollMessageData {
  name: string;
  options: { optionName: string }[];
  multipleAnswers?: boolean;
}

export interface ReactionMessageData {
  text: string;
}

/* ============================================================
 *  messageData — discriminated union
 * ============================================================ */

export type MessageData =
  | {
      typeMessage: "textMessage";
      textMessageData: TextMessageData;
      quotedMessage?: QuotedMessageData;
    }
  | {
      typeMessage: "extendedTextMessage";
      extendedTextMessageData: ExtendedTextMessageData;
      quotedMessage?: QuotedMessageData;
    }
  | ({ typeMessage: "imageMessage" } & FileMessageData & {
        quotedMessage?: QuotedMessageData;
      })
  | ({ typeMessage: "videoMessage" } & FileMessageData & {
        quotedMessage?: QuotedMessageData;
      })
  | ({ typeMessage: "documentMessage" } & FileMessageData & {
        quotedMessage?: QuotedMessageData;
      })
  | ({ typeMessage: "audioMessage" } & FileMessageData & {
        quotedMessage?: QuotedMessageData;
      })
  | ({ typeMessage: "voiceMessage" } & FileMessageData & {
        quotedMessage?: QuotedMessageData;
      })
  | ({ typeMessage: "stickerMessage" } & FileMessageData & {
        quotedMessage?: QuotedMessageData;
      })
  | {
      typeMessage: "locationMessage";
      locationMessageData: LocationMessageData;
      quotedMessage?: QuotedMessageData;
    }
  | {
      typeMessage: "contactMessage";
      contactMessageData: ContactMessageData;
      quotedMessage?: QuotedMessageData;
    }
  | {
      typeMessage: "pollMessage";
      pollMessageData: PollMessageData;
      quotedMessage?: QuotedMessageData;
    }
  | {
      typeMessage: "reactionMessage";
      reactionMessageData: ReactionMessageData;
      quotedMessage?: QuotedMessageData;
    };

/* ============================================================
 *  Базовое уведомление
 * ============================================================ */

export interface BaseNotification {
  typeWebhook: NotificationType;
  instanceData: InstanceData;
  timestamp: number;
  idMessage?: string;
  idInstance?: number;
  typeInstance?: string;
}

/* ============================================================
 *  Конкретные уведомления
 * ============================================================ */

export interface IncomingMessageReceived extends BaseNotification {
  typeWebhook: "incomingMessageReceived";
  senderData: SenderData;
  messageData: MessageData;
}

export interface OutgoingMessageReceived extends BaseNotification {
  typeWebhook: "outgoingMessageReceived";
  senderData: SenderData;
  messageData: MessageData;
}

export interface OutgoingAPIMessageReceived extends BaseNotification {
  typeWebhook: "outgoingAPIMessageReceived";
  senderData: SenderData;
  messageData: MessageData;
}

export interface OutgoingMessageStatus extends BaseNotification {
  typeWebhook: "outgoingMessageStatus";
  status: OutgoingMessageStatusType;
  description?: string;
  chatId: string;
}

export interface StateInstanceChanged extends BaseNotification {
  typeWebhook: "stateInstanceChanged";
  stateInstance: InstanceState;
}

export interface DeviceInfoData {
  platform: string;
  deviceManufacturer: string;
  deviceModel: string;
  osVersion: string;
  waVersion: string;
  battery: number;
}

export interface DeviceInfo extends BaseNotification {
  typeWebhook: "deviceInfo";
  deviceData: DeviceInfoData;
}

export interface IncomingCall extends BaseNotification {
  typeWebhook: "incomingCall";
  from: string;
  callId: string;
}

export interface ContactSyncRequest extends BaseNotification {
  typeWebhook: "contactSyncRequest";
}

export interface ContactSyncResponse extends BaseNotification {
  typeWebhook: "contactSyncResponse";
  contacts: {
    contactId: string;
    contactName: string;
  }[];
}

/* ============================================================
 *  Union уведомлений и обёртка receiveNotification
 * ============================================================ */

export type NotificationBody =
  | IncomingMessageReceived
  | OutgoingMessageReceived
  | OutgoingAPIMessageReceived
  | OutgoingMessageStatus
  | StateInstanceChanged
  | DeviceInfo
  | IncomingCall
  | ContactSyncRequest
  | ContactSyncResponse;

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: NotificationBody;
}

export interface DeleteNotificationResponse {
  result: boolean;
  reason: string;
}

/* ============================================================
 *  Запросы / ответы методов API
 * ============================================================ */

export interface GetStateInstanceResponse {
  stateInstance: InstanceState;
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
  linkPreview?: boolean;
  typingTime?: number;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface GetChatHistoryRequest {
  chatId: string;
  count?: number;
}

export interface ChatMessage {
  type: "outgoing" | "incoming";
  idMessage: string;
  timestamp: number;
  typeMessage: MessageType;
  chatId: string;
  chatType: ChatType;
  textMessage?: string;
  senderName?: string;
  senderContactName?: string;
  statusMessage?: OutgoingMessageStatusType;
  sendByApi?: boolean;
  downloadUrl?: string;
  caption?: string;
  fileName?: string;
  jpegThumbnail?: string;
  mimeType?: string;
  isAnimated?: boolean;
  deletedMessageId?: string;
  editedMessageId?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

/* ============================================================
 *  Type guards
 * ============================================================ */

export function isIncomingMessage(
  n: NotificationBody
): n is IncomingMessageReceived {
  return n.typeWebhook === "incomingMessageReceived";
}

export function isOutgoingMessage(
  n: NotificationBody
): n is OutgoingMessageReceived {
  return n.typeWebhook === "outgoingMessageReceived";
}

export function isOutgoingAPIMessage(
  n: NotificationBody
): n is OutgoingAPIMessageReceived {
  return n.typeWebhook === "outgoingAPIMessageReceived";
}

export function isOutgoingStatus(
  n: NotificationBody
): n is OutgoingMessageStatus {
  return n.typeWebhook === "outgoingMessageStatus";
}

export function isStateChanged(
  n: NotificationBody
): n is StateInstanceChanged {
  return n.typeWebhook === "stateInstanceChanged";
}

export function isTextMessage(
  m: MessageData
): m is Extract<MessageData, { typeMessage: "textMessage" }> {
  return m.typeMessage === "textMessage";
}

export function isExtendedTextMessage(
  m: MessageData
): m is Extract<MessageData, { typeMessage: "extendedTextMessage" }> {
  return m.typeMessage === "extendedTextMessage";
}

export function isFileMessage(
  m: MessageData
): m is Extract<
  MessageData,
  { typeMessage: "imageMessage" | "videoMessage" | "documentMessage" | "audioMessage" | "voiceMessage" | "stickerMessage" }
> {
  return (
    m.typeMessage === "imageMessage" ||
    m.typeMessage === "videoMessage" ||
    m.typeMessage === "documentMessage" ||
    m.typeMessage === "audioMessage" ||
    m.typeMessage === "voiceMessage" ||
    m.typeMessage === "stickerMessage"
  );
}

export function isLocationMessage(
  m: MessageData
): m is Extract<MessageData, { typeMessage: "locationMessage" }> {
  return m.typeMessage === "locationMessage";
}

export function isContactMessage(
  m: MessageData
): m is Extract<MessageData, { typeMessage: "contactMessage" }> {
  return m.typeMessage === "contactMessage";
}