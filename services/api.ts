
export const DOMAIN = 'https://medpulse-production.up.railway.app';
const BASE_URL = `${DOMAIN}/api`;

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || `API Error: ${response.status}`);
    } catch (e) {
      throw new Error(text || `API Error: ${response.status}`);
    }
  }
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return null;
  }
};

const jsonFetch = async (url: string, method = 'GET', data?: any) => {
  const options: RequestInit = {
    method,
    headers: getHeaders(true),
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  return handleResponse(await fetch(url, options));
};

const formDataFetch = async (url: string, method = 'POST', data: FormData) => {
  const options: RequestInit = {
    method,
    headers: getHeaders(false),
    body: data,
  };
  return handleResponse(await fetch(url, options));
};

export const api = {
  // Utility
  resolveImageUrl: (path: any | string | undefined, fallback: string = ''): string => {
    if (!path) return fallback;
    
    // Handle object format { id, url }
    let url = typeof path === 'string' ? path : (path.url || '');
    
    if (!url || url.trim() === '') return fallback;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${DOMAIN}${cleanPath}`;
  },

  // Static Content (Database Driven)
  getStaticPage: (title: string) => jsonFetch(`${BASE_URL}/static?title=${encodeURIComponent(title)}`),
  // FIXED: Update payload only contains "attributes" key as per backend spec
  updateStaticPage: (title: string, attributes: any) => jsonFetch(`${BASE_URL}/update-static?title=${encodeURIComponent(title)}`, 'POST', { attributes }),
  addStaticPage: (title: string, attributes: any) => jsonFetch(`${BASE_URL}/add-static`, 'POST', { title, attributes }),

  // Public
  getHomeContent: () => jsonFetch(`${BASE_URL}/events-articles/`), 
  getEvents: (page = 1) => jsonFetch(`${BASE_URL}/events?page=${page}`),
  getEvent: (id: number) => jsonFetch(`${BASE_URL}/event/${id}`), 
  getArticles: (page = 1) => jsonFetch(`${BASE_URL}/articles?page=${page}`),
  getArticle: (id: number) => jsonFetch(`${BASE_URL}/article/${id}`), 
  getExperts: (page = 1) => jsonFetch(`${BASE_URL}/experts?page=${page}`),
  getExpert: (id: number) => jsonFetch(`${BASE_URL}/expert/${id}`),
  getAuthors: () => jsonFetch(`${BASE_URL}/authors/`),
  
  // Categories 
  getCategories: () => jsonFetch(`${BASE_URL}/article-categories/`),
  createCategory: (data: any) => jsonFetch(`${BASE_URL}/create-category`, 'POST', data),
  updateCategory: (id: number, data: any) => jsonFetch(`${BASE_URL}/article-category/${id}`, 'POST', data), 
  deleteCategory: (id: number) => jsonFetch(`${BASE_URL}/article-category/${id}`, 'DELETE'),

  // Front Settings 
  getFrontSettings: () => jsonFetch(`${BASE_URL}/get-front-data/`),
  updateFrontSettings: (data: FormData | any) => {
      if (data instanceof FormData) {
          return formDataFetch(`${BASE_URL}/create-front-mode`, 'POST', data);
      }
      return jsonFetch(`${BASE_URL}/create-front-mode`, 'POST', data);
  },
  saveFrontVideo: (videoId: string, id: number) => jsonFetch(`${BASE_URL}/video`, 'POST', {
      name: videoId,
      type: 'front_sitting', 
      front_sittings_id: id,
      article_id: null,
      expert_id: null,
      event_id: null,
      author_id: null
  }),

  // Home Settings
  getHomeSettings: () => jsonFetch(`${BASE_URL}/home-settings`),
  updateHomeSettings: (events_number: number, posts_number: number) => jsonFetch(`${BASE_URL}/home-settings`, 'POST', { events_number, posts_number }),

  // Auth
  login: (email: string, password: string) => jsonFetch(`${BASE_URL}/login`, 'POST', { email, password }),
  forgetPassword: (email: string) => jsonFetch(`${BASE_URL}/forget`, 'POST', { email }),
  resetPassword: (email: string, token: string, password: string) => {
    const fd = new FormData();
    fd.append('email', email);
    fd.append('token', token);
    fd.append('password', password);
    return formDataFetch(`${BASE_URL}/reset`, 'POST', fd);
  },

  // Contact
  submitContactForm: (data: any) => jsonFetch(`${BASE_URL}/contact-form`, 'POST', data),
  getContactForms: (page = 1) => jsonFetch(`${BASE_URL}/contact-form?page=${page}`),
  getContactForm: (id: number) => jsonFetch(`${BASE_URL}/contact-form/${id}`),
  replyToContactForm: (id: number, message: string) => jsonFetch(`${BASE_URL}/contact-form/reply/${id}`, 'POST', { message }),

  // Notifications
  getNotifications: () => jsonFetch(`${BASE_URL}/notification`),

  // Media 
  createVideo: (data: any) => jsonFetch(`${BASE_URL}/video`, 'POST', data),
  uploadImage: (file: File, type: string, relatedId?: number, relatedIdField?: string) => {
    const fd = new FormData();
    fd.append('images[0][file]', file);
    fd.append('images[0][type]', type);
    if (relatedId !== undefined && relatedIdField) {
        fd.append(`images[0][${relatedIdField}]`, relatedId.toString());
    }
    return formDataFetch(`${BASE_URL}/image`, 'POST', fd); 
  },
  uploadImages: (files: File[], type: string, relatedId?: number, relatedIdField?: string) => {
    const fd = new FormData();
    files.forEach((file, index) => {
        fd.append(`images[${index}][file]`, file);
        fd.append(`images[${index}][type]`, type);
        if (relatedId !== undefined && relatedIdField) {
            fd.append(`images[${index}][${relatedIdField}]`, relatedId.toString());
        }
    });
    return formDataFetch(`${BASE_URL}/image`, 'POST', fd); 
  },
  deleteImage: (id: number) => jsonFetch(`${BASE_URL}/image/${id}`, 'DELETE'), 

  // Admin - Events
  createEvent: (data: any) => jsonFetch(`${BASE_URL}/event`, 'POST', data),
  updateEvent: (id: number, data: any) => jsonFetch(`${BASE_URL}/event/${id}`, 'POST', data),
  deleteEvent: (id: number) => jsonFetch(`${BASE_URL}/event/${id}`, 'DELETE'), 
  createEventAnalysis: (data: any) => jsonFetch(`${BASE_URL}/event-analysis`, 'POST', data),
  updateEventAnalysis: (id: number, data: any) => jsonFetch(`${BASE_URL}/event-analysis/update/${id}`, 'POST', data),
  attachAuthorToEvent: (eventId: number, authorId: number) => jsonFetch(`${BASE_URL}/attach-author-to-event`, 'POST', { event_id: eventId, author_id: authorId }),
  detachAuthorFromEvent: (eventId: number, authorId: number) => jsonFetch(`${BASE_URL}/detach-author-from-event`, 'POST', { event_id: eventId, author_id: authorId }),

  // Admin - Articles
  createArticle: (data: any) => jsonFetch(`${BASE_URL}/create-article`, 'POST', data),
  updateArticle: (id: number, data: any) => jsonFetch(`${BASE_URL}/article/${id}`, 'POST', data),
  deleteArticle: (id: number) => jsonFetch(`${BASE_URL}/article/${id}`, 'DELETE'), 
  attachAuthorToArticle: (articleId: number, authorId: number) => jsonFetch(`${BASE_URL}/attach-author-to-article`, 'POST', { article_id: articleId, author_id: authorId }), 
  detachAuthorFromArticle: (articleId: number, authorId: number) => jsonFetch(`${BASE_URL}/detach-author-from-article`, 'POST', { article_id: articleId, author_id: authorId }), 

  // Admin - Experts
  createExpert: (data: any) => jsonFetch(`${BASE_URL}/expert`, 'POST', data), 
  updateExpert: (id: number, data: any) => jsonFetch(`${BASE_URL}/expert/${id}`, 'POST', data), 
  deleteExpert: (id: number) => jsonFetch(`${BASE_URL}/expert/${id}`, 'DELETE'),
  
  // Expert Contacts
  createExpertContact: (data: any) => jsonFetch(`${BASE_URL}/contact`, 'POST', data),
  deleteExpertContact: (id: number) => jsonFetch(`${BASE_URL}/contact/${id}`, 'DELETE'),

  // Admin - Authors
  createAuthor: (data: any) => jsonFetch(`${BASE_URL}/create-author`, 'POST', data), 
  updateAuthor: (id: number, data: any) => jsonFetch(`${BASE_URL}/author/${id}`, 'POST', data), 
  deleteAuthor: (id: number) => jsonFetch(`${BASE_URL}/author/${id}`, 'DELETE'),

  // Admin - Users & Roles
  getUsers: () => jsonFetch(`${BASE_URL}/users/`),
  createUser: (data: any) => jsonFetch(`${BASE_URL}/create-user`, 'POST', data), 
  updateUser: (id: number, data: any) => jsonFetch(`${BASE_URL}/update-user/${id}`, 'POST', data), 
  deleteUser: (id: number) => jsonFetch(`${BASE_URL}/user/${id}`, 'DELETE'), 
  getRoles: () => jsonFetch(`${BASE_URL}/roles/`),
  createRole: (name: string, description: string) => jsonFetch(`${BASE_URL}/create-role`, 'POST', { name, description }), 
  deleteRole: (id: number) => jsonFetch(`${BASE_URL}/role/${id}`, 'DELETE'), 
  getPermissions: () => jsonFetch(`${BASE_URL}/permissions/`),
  attachPermissionsToRole: (roleId: number, permissions: number[]) => jsonFetch(`${BASE_URL}/role/attach-permission/${roleId}`, 'POST', { permissions }), 
};
