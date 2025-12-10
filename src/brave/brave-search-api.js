/**
 * Brave Search API Integration for THEOS Chariot
 * Based on MCP Brave Search server implementation
 */

const axios = require('axios');

class BraveSearchAPI {
  constructor(opts = {}) {
    this.apiKey = opts.apiKey || process.env.BRAVE_API_KEY;
    this.apiBase = opts.apiBase || 'https://api.search.brave.com/res/v1';
    this.country = opts.country || 'US';
    this.searchLang = opts.searchLang || 'en';
    this.safesearch = opts.safesearch || 'moderate';
    this.freshness = opts.freshness || null;
    this.textDecorations = opts.textDecorations !== false;
    this.resultFilter = opts.resultFilter || null;
  }

  /**
   * Test Brave Search connection
   */
  async testConnection() {
    try {
      const response = await this.client.get('/web/search', {
        params: {
          q: 'test',
          count: 1
        }
      });
      return {
        success: true,
        message: 'Connected to Brave Search API'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create axios client with authentication
   */
  get client() {
    if (!this._client) {
      this._client = axios.create({
        baseURL: this.apiBase,
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': this.apiKey
        }
      });
    }
    return this._client;
  }

  /**
   * Web search
   */
  async webSearch(query, options = {}) {
    try {
      const params = {
        q: query,
        count: options.count || 10,
        offset: options.offset || 0,
        country: options.country || this.country,
        search_lang: options.searchLang || this.searchLang,
        safesearch: options.safesearch || this.safesearch,
        freshness: options.freshness || this.freshness,
        text_decorations: options.textDecorations !== false ? this.textDecorations : false,
        result_filter: options.resultFilter || this.resultFilter
      };

      // Remove null/undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await this.client.get('/web/search', { params });
      
      return {
        success: true,
        query: query,
        results: response.data.web?.results || [],
        queryContext: response.data.queryContext || {},
        totalResults: response.data.web?.totalResults || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  /**
   * Image search
   */
  async imageSearch(query, options = {}) {
    try {
      const params = {
        q: query,
        count: options.count || 10,
        offset: options.offset || 0,
        country: options.country || this.country,
        search_lang: options.searchLang || this.searchLang,
        safesearch: options.safesearch || this.safesearch,
        freshness: options.freshness || this.freshness
      };

      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await this.client.get('/web/search', { 
        params: { ...params, result_filter: 'images' }
      });
      
      return {
        success: true,
        query: query,
        results: response.data.images?.results || [],
        totalResults: response.data.images?.totalResults || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  /**
   * Video search
   */
  async videoSearch(query, options = {}) {
    try {
      const params = {
        q: query,
        count: options.count || 10,
        offset: options.offset || 0,
        country: options.country || this.country,
        search_lang: options.searchLang || this.searchLang,
        safesearch: options.safesearch || this.safesearch,
        freshness: options.freshness || this.freshness
      };

      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await this.client.get('/web/search', { 
        params: { ...params, result_filter: 'videos' }
      });
      
      return {
        success: true,
        query: query,
        results: response.data.videos?.results || [],
        totalResults: response.data.videos?.totalResults || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  /**
   * News search
   */
  async newsSearch(query, options = {}) {
    try {
      const params = {
        q: query,
        count: options.count || 10,
        offset: options.offset || 0,
        country: options.country || this.country,
        search_lang: options.searchLang || this.searchLang,
        safesearch: options.safesearch || this.safesearch,
        freshness: options.freshness || this.freshness
      };

      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await this.client.get('/web/search', { 
        params: { ...params, result_filter: 'news' }
      });
      
      return {
        success: true,
        query: query,
        results: response.data.news?.results || [],
        totalResults: response.data.news?.totalResults || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query) {
    try {
      const response = await this.client.get('/suggest', {
        params: { q: query }
      });
      
      return {
        success: true,
        suggestions: response.data[1] || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if rate limited
   */
  async isRateLimited() {
    try {
      await this.client.get('/web/search', {
        params: { q: 'test', count: 1 }
      });
      return false;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return true;
      }
      return false;
    }
  }
}

module.exports = { BraveSearchAPI };
