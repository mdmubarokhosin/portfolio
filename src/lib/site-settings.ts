/** Site settings keys shared by the client store, admin UI and server API. */
export interface SiteSettings {
  site_name?: string;
  site_description?: string;
  seo_keywords?: string;
  og_image?: string;
  footer_text?: string;
  chatbot_enabled?: string;
  chatbot_name?: string;
  chatbot_system_prompt?: string;
  youtube_channel_id?: string;
  youtube_api_key?: string;
  youtube_videos_limit?: string;
  [key: string]: string | undefined;
}

/** Settings the site actually reads — anything else shows up in cleanup. */
export const KNOWN_SETTINGS_KEYS = [
  "chatbot_provider", "chatbot_model", "chatbot_apiKey", "chatbot_base_url",
  "chatbot_system_prompt", "chatbot_welcomeMessage", "chatbot_welcomeMessageBn",
  "chatbot_placeholder", "chatbot_placeholderBn", "chatbot_maxTokens",
  "chatbot_temperature", "chatbot_enabled", "chatbot_name",
  "site_name", "site_description", "seo_keywords", "og_image", "footer_text",
  "telegram_bot_token", "telegram_chat_id",
  "custom_font_url", "custom_font_family",
  "youtube_channel_id", "youtube_api_key", "youtube_videos_limit",
];
