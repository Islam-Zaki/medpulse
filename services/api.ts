const BASE_URL = 'https://medpulse-production.up.railway.app/api';

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
  // GitHub CMS Integration
  getSiteConfig: async (owner?: string, repo?: string) => {
    // Attempt to fetch live from GitHub if configured, else fallback to local
    if (owner && repo) {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/siteconfig.json?v=${Date.now()}`);
        if (res.ok) return await res.json();
      } catch (e) { console.warn("GitHub fetch failed, falling back to local file."); }
    }
    const localRes = await fetch('/siteconfig.json');
    return await localRes.json();
  },

  updateGitConfig: async (token: string, owner: string, repo: string, data: any) => {
    const path = 'siteconfig.json';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    // 1. Get current SHA
    const getRes = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!getRes.ok) throw new Error("Could not find file on GitHub to update.");
    const fileData = await getRes.json();
    
    // 2. Commit Update
    const commitRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Update site config: ${new Date().toISOString()}`,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
        sha: fileData.sha
      })
    });
    return handleResponse(commitRes);
  },

  // Public
  getHomeContent: () => jsonFetch(`${BASE_URL}/events-articles/`), 
  getEvents: (page = 1) => jsonFetch(`${BASE_URL}/events?page=${page}`),
  getEvent: (id: number) => jsonFetch(`${BASE_URL}/event/${id}`), 
  getArticles: (page = 1) => jsonFetch(`${BASE_URL}/articles?page=${page}`),
  getArticle: (id: number) => jsonFetch(`${BASE_URL}/article/${id}`), 
  getExperts: () => jsonFetch(`${BASE_URL}/experts/`),
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

  // Static Pages Content (Backend fallback - not used with Git logic)
  getStaticPageContent: (pageName: string) => jsonFetch(`${BASE_URL}/static-content/${pageName}`),
  updateStaticPageContent: (pageName: string, data: any) => jsonFetch(`${BASE_URL}/static-content`, 'POST', { page: pageName, ...data }),

  // Auth
  login: (email: string, password: string) => jsonFetch(`${BASE_URL}/login`, 'POST', { email, password }),

  // Contact
  submitContactForm: (data: any) => jsonFetch(`${BASE_URL}/contact-form`, 'POST', data),
  getContactForms: (page = 1) => jsonFetch(`${BASE_URL}/contact-form?page=${page}`),

  // Media 
  createVideo: (data: any) => jsonFetch(`${BASE_URL}/video`, 'POST', data),
  uploadImage: (file: File, type: string, relatedId: number, relatedIdField = 'id') => {
    const fd = new FormData();
    fd.append('images[0][file]', file);
    fd.append('images[0][type]', type);
    fd.append(`images[0][${relatedIdField}]`, relatedId.toString());
    return formDataFetch(`${BASE_URL}/image`, 'POST', fd); 
  },
  uploadImages: (files: File[], type: string, relatedId: number, relatedIdField = 'id') => {
    const fd = new FormData();
    files.forEach((file, index) => {
        fd.append(`images[${index}][file]`, file);
        fd.append(`images[${index}][type]`, type);
        fd.append(`images[${index}][${relatedIdField}]`, relatedId.toString());
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