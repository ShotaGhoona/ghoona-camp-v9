/**
 * Event API Client
 */

import httpClient from '@/shared/api/client/http-client';
import type {
  EventSearchParams,
  EventListResponse,
  EventDetailResponse,
  CreateEventRequest,
  CreateEventResponse,
  UpdateEventRequest,
  UpdateEventResponse,
  DeleteEventResponse,
  JoinEventResponse,
  LeaveEventResponse,
  MyEventsParams,
  MyEventsResponse,
} from '../model/types';

export const eventApi = {
  // ========================================
  // イベント一覧・詳細
  // ========================================

  /** イベント一覧取得（月ベース） */
  getEvents: async (params: EventSearchParams): Promise<EventListResponse> => {
    const response = await httpClient.get<EventListResponse>('/api/v1/events', {
      params,
    });
    return response.data;
  },

  /** イベント詳細取得 */
  getEventById: async (eventId: string): Promise<EventDetailResponse> => {
    const response = await httpClient.get<EventDetailResponse>(
      `/api/v1/events/${eventId}`,
    );
    return response.data;
  },

  // ========================================
  // イベントCRUD
  // ========================================

  /** イベント作成 */
  createEvent: async (
    data: CreateEventRequest,
  ): Promise<CreateEventResponse> => {
    const response = await httpClient.post<CreateEventResponse>(
      '/api/v1/events',
      data,
    );
    return response.data;
  },

  /** イベント更新 */
  updateEvent: async (
    eventId: string,
    data: UpdateEventRequest,
  ): Promise<UpdateEventResponse> => {
    const response = await httpClient.put<UpdateEventResponse>(
      `/api/v1/events/${eventId}`,
      data,
    );
    return response.data;
  },

  /** イベント削除 */
  deleteEvent: async (eventId: string): Promise<DeleteEventResponse> => {
    const response = await httpClient.delete<DeleteEventResponse>(
      `/api/v1/events/${eventId}`,
    );
    return response.data;
  },

  // ========================================
  // 参加管理
  // ========================================

  /** イベント参加 */
  joinEvent: async (eventId: string): Promise<JoinEventResponse> => {
    const response = await httpClient.post<JoinEventResponse>(
      `/api/v1/events/${eventId}/participants`,
    );
    return response.data;
  },

  /** 参加キャンセル */
  leaveEvent: async (eventId: string): Promise<LeaveEventResponse> => {
    const response = await httpClient.delete<LeaveEventResponse>(
      `/api/v1/events/${eventId}/participants`,
    );
    return response.data;
  },

  // ========================================
  // 自分のイベント
  // ========================================

  /** 自分が参加登録 or 主催のイベントを取得 */
  getMyEvents: async (params: MyEventsParams): Promise<MyEventsResponse> => {
    const response = await httpClient.get<MyEventsResponse>(
      '/api/v1/events/me',
      { params },
    );
    return response.data;
  },
};
