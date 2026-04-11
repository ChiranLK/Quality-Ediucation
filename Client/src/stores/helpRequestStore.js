import { create } from 'zustand';

const INITIAL_FORM = {
  title: '',
  message: '',
  category: '',
  language: '',
};

export const useHelpRequestStore = create((set) => ({
  // Form state
  form: INITIAL_FORM,
  setForm: (form) => set({ form }),
  updateFormField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),
  resetForm: () => set({ form: INITIAL_FORM }),

  // Editing state
  editingMessage: null,
  setEditingMessage: (message) => set({ editingMessage: message }),
  clearEditingMessage: () => set({ editingMessage: null }),

  // UI state
  showMessagesModal: false,
  setShowMessagesModal: (show) => set({ showMessagesModal: show }),

  // Form submission state
  loading: false,
  setLoading: (loading) => set({ loading }),

  submitted: false,
  setSubmitted: (submitted) => set({ submitted }),

  // Validation errors
  errors: {},
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
  clearFieldError: (field) =>
    set((state) => ({
      errors: { ...state.errors, [field]: '' },
    })),

  // Language preference
  formUILanguage: 'English',
  setFormUILanguage: (language) => set({ formUILanguage: language }),

  // Modal refresh trigger
  refreshTrigger: 0,
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));

// Tutor dashboard store (for viewing help requests)
export const useTutorHelpRequestsStore = create((set) => ({
  // Help requests list
  requests: [],
  setRequests: (requests) => set({ requests }),

  // Loading & error
  loading: true,
  setLoading: (loading) => set({ loading }),

  error: null,
  setError: (error) => set({ error }),

  // Filters
  selectedCategory: 'All',
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  selectedLanguage: 'All',
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),

  // UI
  expandedId: null,
  setExpandedId: (id) => set({ expandedId: id }),
  toggleExpanded: (id) =>
    set((state) => ({
      expandedId: state.expandedId === id ? null : id,
    })),

  // Reset filters
  resetFilters: () =>
    set({
      selectedCategory: 'All',
      selectedLanguage: 'All',
    }),
}));
