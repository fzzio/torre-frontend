<template>
  <div id="app">
    <div  class="nav-search">
      <the-navbar
        v-show="showNavbar"
        @clickToggleRecentSearchBox="toggleRecentSearchBox"
        @clickShowBookmarks="showBookmarks"
        @clickSettings="showSettingsModal"
        @clickTitle="setPageType('search')"
        @clickCandidateName='getCandidateBio'
        :pageType="pageType"
        :recentSearch="recentSearch"
        :bookmarkCandidates="bookmarkCandidates"
        :settings="settings"
        :isMobile="isMobile"
        :showRecentSearchBox="showRecentSearchBox">
      </the-navbar>
      <the-searchbar
        @clickSearch="searchCandidates"
        @clickClearSearch="clearSearch"
        :recentSearch="recentSearch"
        :newSearchQuery="searchQuery"
        :settings="settings"
        >
      </the-searchbar>
    </div>
    <main>
      <transition name="fade">
        <recent-search-box
          v-if="showRecentSearchBox && recentSearch.length > 0"
          :recentSearch="recentSearch"
          @clickSearchItem="searchCandidates"
          @clickRemoveRecentSearchItem="removeRecentSearchItem">
        </recent-search-box>
      </transition>
      <candidate-list
        @clickUpdateSettings="updateSettings"
        @clickCandidateName='getCandidateBio'
        :clickBookmarkCandidate="bookmarkCandidate"
        :replaceArtworkUrlSize="replaceArtworkUrlSize"
        :isInBookmark="isInBookmark"
        :candidates="pageType === 'search' ? candidates: bookmarkCandidates"
        :pageType="pageType"
        :isCandidatesLoading="isCandidatesLoading"
        :searchFailed="searchFailed"
        :bookmarkCandidates="bookmarkCandidates"
        :settings="settings"
        :isMobile="isMobile"
        >
      </candidate-list>
      <!-- settings modal -->
      <b-modal
        :active.sync="isSettingsModalActive"
        :canCancel=true has-modal-card >
        <the-settings
          :settings="settings"
          @clickUpdateSettings="updateSettings">
        </the-settings>
      </b-modal>
      <!-- CandidateBio modal -->
      <b-modal
        :active.sync="isCandidateBioModalActive"
        :canCancel=true has-modal-card
        :onCancel="resetCandidateBio"
        scroll="clip"
        >
        <div class="columns is-mobile is-centered" v-if="!candidateBioFailed && candidateBio.length === 0" >
          <div class="columns is-mobile"  >
            <div class="column loading">
                <b-loading :is-full-page="false" :active.sync="isCandidateBioLoading" :can-cancel="false"></b-loading>
            </div>
          </div>
        </div>
        <div class="container" v-else-if="candidateBioFailed">
          <div class="columns is-mobile is-centered"  >
            <div class="column is-4">
              <b-message  type="is-danger" has-icon >
                Error loading album track list. <br>
                Please check again later.
              </b-message>
            </div>
          </div>
        </div>
        <candidate-bio  v-else
          :candidateBio="candidateBio"
          :clickBookmarkCandidate="bookmarkCandidate"
          :isInBookmark="isInBookmark"
          :replaceArtworkUrlSize="replaceArtworkUrlSize"
          :settings="settings"
          :isMobile="isMobile"
          >
        </candidate-bio>
      </b-modal>
    </main>
    <the-footer :class="{'footer-fixed': pageType === 'search' && candidates.length === 0 || pageType === 'bookmarks' && bookmarkCandidates.length === 0 || isCandidatesLoading }"></the-footer>
  </div>
</template>

<script>
import TheNavbar from './components/TheNavbar'
import TheSearchbar from './components/TheSearchbar'
import RecentSearchBox from './components/RecentSearchBox'
import CandidateList from './components/CandidateList'
import TheSettings from './components/TheSettings'
import CandidateBio from './components/CandidateBio'
import TheFooter from './components/TheFooter'
import { mapGetters } from 'vuex'
export default {
  name: 'app',
  data () {
    return {
      isSettingsModalActive: false,
      isCandidateBioModalActive: false,
      windowWidth: window.innerWidth,
      showNavbar: true
    }
  },
  components: {
    TheNavbar,
    TheSearchbar,
    RecentSearchBox,
    TheSettings,
    CandidateList,
    CandidateBio,
    TheFooter
  },
  computed: {
    ...mapGetters({
      recentSearch: 'GET_RECENT_SEARCH',
      candidates: 'GET_CANDIDATES',
      candidateBio: 'GET_CANDIDATE_BIO',
      searchQuery: 'SEARCH_QUERY',
      initialSearchQuery: 'INITIAL_SEARCH_QUERY',
      bookmarkCandidates: 'BOOKMARK_CANDIDATES',
      pageType: 'PAGE_TYPE',
      showRecentSearchBox: 'SHOW_RECENT_SEARCH_BOX',
      isCandidatesLoading: 'IS_CANDIDATES_LOADING',
      isCandidateBioLoading: 'IS_CANDIDATE_BIO_LOADING',
      searchFailed: 'SEARCH_FAILED',
      candidateBioFailed: 'CANDIDATE_BIO_FAILED',
      settings: 'GET_SETTINGS',
      isAppError: 'IS_APP_ERROR'
    }),
    showRecentSearchBox () {
      return this.$store.state.showRecentSearchBox
    },
    isMobile () {
      return this.$mq === 'mobile'
    }
  },
  created () {
    this.$store.dispatch('GET_SETTINGS')
    this.$store.dispatch('GET_RECENT_SEARCH')
    this.$store.dispatch('GET_BOOKMARK_CANDIDATES')
    window.addEventListener('scroll', this.toggleNavbar)
  },
  destroyed () {
    window.removeEventListener('scroll', this.toggleNavbar)
  },
  methods: {
    searchCandidates (query) {
      if (query) {
        const payload = { 'url': `/api/search?term=${query}&entity=album&media=music`, 'query': query }
        this.$store.dispatch('SEARCH_CANDIDATES', payload)
      }
      this.$store.commit('SET_PAGE_TYPE', 'search')
    },
    clearSearch () {
      this.$store.commit('CLEAR_SEARCH')
    },
    toggleRecentSearchBox () {
      this.$store.commit('TOGGLE_RECENT_SEARCH')
    },
    removeRecentSearchItem (item) {
      this.$store.dispatch('REMOVE_RECENT_SEARCH_ITEM', item)
    },
    bookmarkCandidate (album) {
      if (this.isInBookmark(album.collectionCensoredName)) {
        this.$dialog.confirm({
          message: `Are you sure you want to unbookmark this album? <b>${album.collectionCensoredName} album</b>`,
          type: 'is-danger',
          hasIcon: true,
          onConfirm: () => {
            this.$store.dispatch('BOOKMARK_CANDIDATE', { 'album': album, 'status': 'unbookmarked' })
            this.$toast.open({
              duration: 3000,
              message: `"${album.collectionCensoredName} album" has been unbookmark!`,
              position: 'is-bottom-right',
              type: 'is-danger'
            })
          }
        })
      } else {
        this.$toast.open({
          duration: 3000,
          message: `"${album.collectionCensoredName} album" bookmarked!`,
          position: 'is-bottom',
          type: 'is-info'
        })
        this.$store.dispatch('BOOKMARK_CANDIDATE', { 'album': album, 'status': 'bookmark' })
      }
    },
    isInBookmark (albumName) {
      return this.bookmarkCandidates.findIndex(album => album.collectionCensoredName === albumName) > -1
    },
    showBookmarks () {
      this.$store.commit('SET_PAGE_TYPE', 'bookmarks')
    },
    updateSettings (settingName, settingValue) {
      const payload = { 'settingName': settingName, 'settingValue': settingValue }
      this.$store.dispatch('UPDATE_SETTINGS', payload)
    },
    showSettingsModal () {
      this.isSettingsModalActive = true
    },
    getCandidateBio (candidateId) {
      if (candidateId) {
        this.isCandidateBioModalActive = true
        const payload = { 'url': `/api/lookup?id=${candidateId}&entity=song` }
        this.$store.dispatch('GET_CANDIDATE_BIO', payload)
      }
    },
    setPageType (pageType) {
      if (pageType !== this.pageType) {
        this.$store.commit('SET_PAGE_TYPE', pageType)
      }

      if (pageType === 'search' && this.initialSearchQuery !== this.searchQuery) {
        this.searchCandidates(this.initialSearchQuery)
      }
    },
    resetCandidateBio () {
      this.$store.commit('RESET_CANDIDATE_BIO')
    },
    replaceArtworkUrlSize (albumArtwork, newSize) {
      return albumArtwork.replace('100x100', newSize)
    },
    toggleNavbar () {
      let scrollBarPosition = window.pageYOffset | document.body.scrollTop
      if (scrollBarPosition > 100) {
        this.showNavbar = false
      } else {
        this.showNavbar = true
      }
    }
  }
}
</script>
<style lang="scss">
  // Import Bulma's core
@import "~bulma/sass/utilities/_all";

// Set your colors
$primary: #008a94;
$primary-invert: findColorInvert($primary);

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: (
    "white": ($white, $black),
    "black": ($black, $white),
    "light": ($light, $light-invert),
    "dark": ($dark, $dark-invert),
    "primary": ($primary, $primary-invert),
    "info": ($info, $info-invert),
    "success": ($success, $success-invert),
    "warning": ($warning, $warning-invert),
    "danger": ($danger, $danger-invert),
);

// Links
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";

// transitions
.list-enter-active,
{
  transition: all .5s;
}
.list-leave-active {
  transition: all .5s;
}
.list-enter,
.list-leave-to {
  opacity: 0;
   transform: translateY(20px);
}
.fade-enter-active, .component-fade-leave-active {
  transition: opacity .3s ease;
}
.fade-enter, .component-fade-leave-to
{
  opacity: 0;
}
</style>
