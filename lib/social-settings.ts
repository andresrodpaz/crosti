export interface SocialSettings {
  instagram_url: string
  pinterest_url: string
  reels_title: string
  instagram_cta_text: string
}

export const defaultSocialSettings: SocialSettings = {
  instagram_url: "https://www.instagram.com/crosticookies/",
  pinterest_url: "https://pinterest.com",
  reels_title: "Crosti en Imagenes",
  instagram_cta_text: "Siguenos en Instagram",
}

export function getSocialSettingsFromSections(sections: unknown): SocialSettings {
  if (!Array.isArray(sections)) return defaultSocialSettings
  const social = sections.find((item: any) => item?.id === "social_settings")
  if (!social) return defaultSocialSettings

  return {
    instagram_url: social.instagram_url || defaultSocialSettings.instagram_url,
    pinterest_url: social.pinterest_url || defaultSocialSettings.pinterest_url,
    reels_title: social.reels_title || defaultSocialSettings.reels_title,
    instagram_cta_text: social.instagram_cta_text || defaultSocialSettings.instagram_cta_text,
  }
}

export function upsertSocialSettingsInSections(
  sections: unknown,
  settings: SocialSettings,
): Array<Record<string, unknown>> {
  const list = Array.isArray(sections) ? [...sections] : []
  const index = list.findIndex((item: any) => item?.id === "social_settings")
  const payload = { id: "social_settings", ...settings, type: "feature", title: "Redes sociales", description: "" }

  if (index >= 0) {
    list[index] = payload
  } else {
    list.push(payload)
  }

  return list
}
