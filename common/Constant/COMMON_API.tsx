export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const COMMON_API = {
  // Auth
  login: `${BASE_URL}/api/auth/login`,
  register: `${BASE_URL}/api/auth/register`,
  profile: `${BASE_URL}/api/auth/me`,
  refreshToken: `${BASE_URL}/api/auth/refresh-token`,
  // Posts - /api/v1/posts
  posts: `${BASE_URL}/api/v1/posts`,
  postDetail: (idOrSlug: string) => `${BASE_URL}/api/v1/posts/${idOrSlug}`,
  myPosts: `${BASE_URL}/api/v1/posts/my-posts`,
  nearbyPosts: `${BASE_URL}/api/v1/posts/nearby`,
  postView: (id: number) => `${BASE_URL}/api/v1/posts/${id}/view`,
  postImages: (id: number) => `${BASE_URL}/api/v1/posts/${id}/images`,
  postImageDelete: (postId: number, imageId: number) => `${BASE_URL}/api/v1/posts/${postId}/images/${imageId}`,
  postReaction: (id: number, type?: string) =>
    `${BASE_URL}/api/v1/posts/${id}/reactions${type ? `?type=${type}` : ""}`,
  postFavorite: (id: number) => `${BASE_URL}/api/v1/posts/${id}/favorite`,
  favoritePosts: `${BASE_URL}/api/v1/posts/favorites`,
  likedPosts: `${BASE_URL}/api/v1/posts/liked`,
  postComments: (postId: number) => `${BASE_URL}/api/posts/${postId}/comments`,

  // Fundraising - /api/v1/fundraising
  fundraisingCampaigns: `${BASE_URL}/api/v1/fundraising/campaigns`,
  fundraisingCampaignDetail: (idOrSlug: string) => `${BASE_URL}/api/v1/fundraising/campaigns/${idOrSlug}`,
  fundraisingDonate: (id: number) => `${BASE_URL}/api/v1/fundraising/campaigns/${id}/donate`,
  fundraisingDonations: (id: number) => `${BASE_URL}/api/v1/fundraising/campaigns/${id}/donations`,
  fundraisingUpdates: (id: number) => `${BASE_URL}/api/v1/fundraising/campaigns/${id}/updates`,

  // Pet Health - /api/v1/pets
  petHealth: (petId: number) => `${BASE_URL}/api/v1/pets/${petId}/health`,
  petVaccinations: (petId: number) => `${BASE_URL}/api/v1/pets/${petId}/health/vaccinations`,
  petVaccinationsUpcoming: (petId: number) => `${BASE_URL}/api/v1/pets/${petId}/health/vaccinations/upcoming`,
  petMedicalHistory: (petId: number) => `${BASE_URL}/api/v1/pets/${petId}/health/medical-history`,
  petWeight: (petId: number) => `${BASE_URL}/api/v1/pets/${petId}/health/weight`,
  petQRCode: (petId: number) => `${BASE_URL}/api/v1/pets/${petId}/qr-code`,

  // Reports - /api/v1/reports
  reports: `${BASE_URL}/api/v1/reports`,
  reportDetail: (id: number) => `${BASE_URL}/api/v1/reports/${id}`,
  myReports: `${BASE_URL}/api/v1/reports/my-reports`,

  // Organizations - /api/v1/organizations
  organizations: `${BASE_URL}/api/v1/organizations`,
  organizationDetail: (id: number) => `${BASE_URL}/api/v1/organizations/${id}`,

  // Rescue Centers - /api/v1/rescue-centers
  rescueCenters: `${BASE_URL}/api/v1/rescue-centers`,
  rescueCenterDetail: (id: number) => `${BASE_URL}/api/v1/rescue-centers/${id}`,
  rescueCenterReviews: (id: number) => `${BASE_URL}/api/v1/rescue-centers/${id}/reviews`,

  // Map - /api/v1/map
  mapLocations: `${BASE_URL}/api/v1/map/locations`,

  // Locations - /api/v1/locations
  cities: `${BASE_URL}/api/v1/locations/cities`,
  districts: `${BASE_URL}/api/v1/locations/districts`,

  // Notifications - /api/notifications
  notifications: `${BASE_URL}/api/notifications`,
  notificationsUnread: `${BASE_URL}/api/notifications/unread`,
  notificationsUnreadCount: `${BASE_URL}/api/notifications/unread/count`,
  notificationRead: (id: string | number) => `${BASE_URL}/api/notifications/${id}/read`,
  notificationsReadAll: `${BASE_URL}/api/notifications/read-all`,
  notificationDelete: (id: string | number) => `${BASE_URL}/api/notifications/${id}`,
  notificationsClear: `${BASE_URL}/api/notifications`,
};
