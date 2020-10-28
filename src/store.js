import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { Snackbar } from 'buefy/dist/components/snackbar'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    settings: {
      initialSearchQuery: 'Developer',
      searchQuery: '',
      panelType: 'card',
      bookmarkIcon: 'fa-star',
      perPage: 20,
      offset: 0
    },
    candidates: [],
    bioDetails: [],
    bookmarkCandidates: [],
    searchFailed: false,
    bioDetailsFailed: false,
    recentSearch: [],
    showRecentSearchBox: false,
    isCandidateLoading: false,
    isBioDetailsLoading: false,
    language: 'en_us',
    pageType: 'search',
    appError: null
  },
  getters: {
    SEARCH_QUERY: (state) => {
      return state.settings.searchQuery
    },
    INITIAL_SEARCH_QUERY: (state) => {
      return state.settings.initialSearchQuery
    },
    GET_CANDIDATES: (state) => {
      return state.candidates
    },
    GET_BIO_DETAILS: (state) => {
      return state.bioDetails
    },
    GET_RECENT_SEARCH: (state) => {
      return state.recentSearch
    },
    IS_CANDIDATE_LOADING: (state) => {
      return state.isCandidateLoading
    },
    IS_BIO_DETAILS_LOADING: (state) => {
      return state.isBioDetailsLoading
    },
    SEARCH_FAILED: (state) => {
      return state.searchFailed
    },
    BIO_DETAILS_FAILED: (state) => {
      return state.bioDetailsFailed
    },
    BOOKMARK_CANDIDATES: (state) => {
      return state.bookmarkCandidates.reverse()
    },
    PAGE_TYPE: (state) => {
      return state.pageType
    },
    SHOW_RECENT_SEARCH_BOX: (state) => {
      return state.showRecentSearchBox
    },
    GET_SETTINGS: (state) => {
      return state.settings
    }
  },
  mutations: {
    SET_SEARCH_QUERY: (state, query) => {
      state.pageType = 'search'
      state.settings.searchQuery = query
    },
    SET_CANDIDATE: (state, data) => {
      state.candidates = data
    },
    SET_BIO_DETAILS: (state, data) => {
      state.bioDetails = data
    },
    SEARCH_FAILED: (state, action) => {
      state.searchFailed = action
    },
    SET_RECENT_SEARCH: (state, data) => {
      state.pageType = 'search'
      state.recentSearch = data
    },
    CLEAR_SEARCH: (state) => {
      state.candidates = []
      state.settings.searchQuery = ''
    },
    TOGGLE_RECENT_SEARCH: (state) => {
      state.showRecentSearchBox = !state.showRecentSearchBox
    },
    SET_BOOKMARK_CANDIDATES: (state, candidates) => {
      state.bookmarkCandidates = candidates
    },
    IS_CANDIDATE_LOADING: (state, action) => {
      state.isCandidateLoading = action
    },
    IS_BIO_DETAILS_LOADING: (state, action) => {
      state.isBioDetailsLoading = action
    },
    SET_PAGE_TYPE: (state, type) => {
      if (type === 'bookmarks') { state.settings.searchQuery = '' }
      state.pageType = type
    },
    SET_SETTINGS: (state, settings) => {
      state.settings = settings
    },
    SET_BIO_DETAILS_FAILED: (state, action) => {
      state.bioDetailsFailed = action
      state.bioDetails = []
    },
    RESET_BIO_DETAILS: (state) => {
      state.bioDetails = []
    },
    APP_ERROR: (state, message) => {
      state.appError = message
      Snackbar.open({
        message: message,
        type: 'is-danger',
        position: 'is-top',
        actionText: 'Reload App',
        indefinite: true,
        onAction: () => {
          window.location.reload()
        }
      })
    }
  },
  actions: {
    SEARCH_CANDIDATES: async ({ commit, dispatch }, payload) => {
      try {
        // show loading animation
        commit('IS_CANDIDATE_LOADING', true)
        const { data } = await axios.post(`${payload.url}`, {
          skills: payload.query,
          size: parseInt(JSON.parse(localStorage.getItem('settings')).perPage),
          offset: parseInt(JSON.parse(localStorage.getItem('settings')).offset)
        })
        // console.log(data)
        if (data.results.length === 0) {
          // if search response data results is empty commit search failed and clear the search input
          commit('CLEAR_SEARCH')
          commit('SEARCH_FAILED', true)
          commit('IS_CANDIDATE_LOADING', false)
        } else {
          // assign the search data results to set candidate state and query to set search query state
          commit('IS_CANDIDATE_LOADING', false)
          commit('SEARCH_FAILED', false)
          commit('SET_CANDIDATE', data.results)
          commit('SET_SEARCH_QUERY', payload.query)
          dispatch('SAVE_TO_RECENT_SEARCH', payload.query)
        }
      } catch (err) {
        // if error commit search failed and clear the search input
        commit('CLEAR_SEARCH')
        commit('IS_CANDIDATE_LOADING', false)
        commit('APP_ERROR', err.message)
      }
    },
    SAVE_TO_RECENT_SEARCH: ({ commit }, payload) => {
      try {
        let recentSearch = []
        // check if localstorage have recent search datas
        if (localStorage.getItem('recent_search') === null) {
          // if localstorage is null push the new recent search to empty array
          recentSearch.push(payload)
          localStorage.setItem('recent_search', JSON.stringify(recentSearch))
        } else {
          // if localstorage is not null append the new recent search to the end of array
          recentSearch = JSON.parse(localStorage.getItem('recent_search'))
          recentSearch.push(payload)
          // check if the new recent search is already in the array then remove duplicate and save to localstorage
          let newRecentSearch = (recentSearch) = recentSearch.filter((item, i) => recentSearch.indexOf(item) === i)
          localStorage.setItem('recent_search', JSON.stringify(newRecentSearch))
        }
        // assign a new array to the set recent search state
        commit('SET_RECENT_SEARCH', recentSearch)
      } catch (err) {
        commit('APP_ERROR', err.message)
      }
    },
    GET_RECENT_SEARCH: ({ commit }) => {
      try {
        // assign recent_search localstorage dato to a recentSearch variable
        const recentSearch = localStorage.getItem('recent_search')
        // check if recentSearch variable is not null
        if (recentSearch !== null) {
          // if not null assign a new array to the  recentSearch state
          commit('SET_RECENT_SEARCH', JSON.parse(recentSearch))
        }
      } catch (err) {
        commit('APP_ERROR', err.message)
      }
    },
    REMOVE_RECENT_SEARCH_ITEM: ({ commit }, item) => {
      try {
        // assign recent_search localstorage to recentSearchItems variable
        const recentSearchItems = JSON.parse(localStorage.getItem('recent_search'))
        // get the index location of the item in recentSearchItems array
        const recentSearchItemsIndex = recentSearchItems.indexOf(item)
        // remove if item is in the recentSearchItems array
        if (recentSearchItemsIndex !== -1) recentSearchItems.splice(recentSearchItemsIndex, 1)
        // assign the new recentSearchItems array to the recent_search localstorage
        localStorage.setItem('recent_search', JSON.stringify(recentSearchItems))
        // if recentSearchItems is empty remove recent search box
        if (recentSearchItems.length === 0) {
          commit('TOGGLE_RECENT_SEARCH')
        }
        // assign the new recentSearchItems array to the the set recent search state
        commit('SET_RECENT_SEARCH', recentSearchItems)
      } catch (err) {
        commit('APP_ERROR', err.message)
      }
    },
    BOOKMARK_CANDIDATE: ({ commit }, payload) => {
      try {
        // destructure and assign payload candidate objects to the new variables
        const { name, username, pictureThumbnail, professionalHeadline, location, candidateId } = payload.candidate
        // assign the new payload candidate variables as object items to newBookmarkItem variable
        const newBookmarkItem = { name, username, pictureThumbnail, professionalHeadline, location, candidateId }
        let bookmarkCandidates = []
        // check payload status
        if (payload.status === 'unbookmarked') {
          // if status is unbookmarked assign bookmark_candidates localstorage to bookmarkCandidates
          bookmarkCandidates = JSON.parse(localStorage.getItem('bookmark_candidates'))
          // check if the bookmarkCandidates item is already in the array
          const oldBookmarkCandidates = bookmarkCandidates.map((e) => { return e.username }).indexOf(username)
          // if is in the array remove payload item to bookmarkCandidates
          if (oldBookmarkCandidates !== -1) bookmarkCandidates.splice(oldBookmarkCandidates, 1)
          // set the new bookmarkCandidates array to the localstorage
          localStorage.setItem('bookmark_candidates', JSON.stringify(bookmarkCandidates))
        } else {
          // if status is bookmark
          // check if bookmark storage is null
          if (localStorage.getItem('bookmark_candidates') === null) {
            // push the newBookmarkItem to bookmarkCandidates
            bookmarkCandidates.push(newBookmarkItem)
            // set the new bookmarkCandidates array to the localstorage
            localStorage.setItem('bookmark_candidates', JSON.stringify(bookmarkCandidates))
          } else {
            // if bookmark storage have datas
            // assign bookmark_candidate localstorage data to bookmarkCandidates
            bookmarkCandidates = JSON.parse(localStorage.getItem('bookmark_candidates'))
            // push the newBookmarkItem to bookmarkCandidates
            bookmarkCandidates.push(newBookmarkItem)
            // push the newBookmarkItem to bookmarkCandidates
            localStorage.setItem('bookmark_candidates', JSON.stringify(bookmarkCandidates))
          }
        }
        commit('SET_BOOKMARK_CANDIDATES', bookmarkCandidates)
      } catch (err) {
        commit('APP_ERROR', err.message)
      }
    },
    GET_BOOKMARK_CANDIDATES: ({ commit }) => {
      try {
        // assign bookmark_candidates localstorage to bookmarkCandidates variable
        const bookmarkCandidates = localStorage.getItem('bookmark_candidates')
        if (bookmarkCandidates !== null) {
          // if not null assign the new bookmark candidates array to the bookmark candidates state
          commit('SET_BOOKMARK_CANDIDATES', JSON.parse(bookmarkCandidates))
        }
      } catch (err) {
        commit('APP_ERROR', err.message)
      }
    },
    GET_SETTINGS: ({ commit, state }) => {
      try {
        // assign settings localstorage to settings variable
        const settings = localStorage.getItem('settings')
        // check if settings variable is not null
        if (settings !== null) {
          // if not null assign the new setting array to the setting state
          commit('SET_SETTINGS', JSON.parse(settings))
        } else {
          // if null set the default state settings to localstorage
          localStorage.setItem('settings', JSON.stringify(state.settings))
        }
      } catch (err) {
        commit('APP_ERROR', err.message)
      }
    },
    UPDATE_SETTINGS: ({ commit, state }, payload) => {
      try {
      // destructure and assign payload objects and state to the new variables
        const { settingValue, settingName } = payload
        const { settings } = state
        // update settings by reassigning the settings object name to the payload object name
        settings[settingName] = settingValue
        // assign the new settings array to the settings state
        commit('SET_SETTINGS', settings)
        // assign the new settings array to the settings localstorage
        localStorage.setItem('settings', JSON.stringify(settings))
      } catch (err) {
        commit('APP_ERROR', err.message)
      }
    },
    GET_BIO_DETAILS: async ({ commit, state }, payload) => {
      try {
        // show loading animation
        commit('IS_BIO_DETAILS_LOADING', true)
        // reset bioDetails
        if (state.bioDetails.length > 0) {
          commit('RESET_BIO_DETAILS')
        }
        const { data } = await axios.get(`${payload.url}`)
        console.log(data)
        if (data.length === 0) {
          commit('SET_BIO_DETAILS_FAILED', true)
          commit('IS_BIO_DETAILS_LOADING', false)
        } else {
          commit('SET_BIO_DETAILS', data)
          commit('IS_BIO_DETAILS_LOADING', false)
        }
      } catch (err) {
        commit('IS_BIO_DETAILS_LOADING', false)
        commit('APP_ERROR', err.message)
      }
    }
  }
})
