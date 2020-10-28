<template>
  <div id="app">
    <div  class="nav-search">
      <the-navbar
        v-show="showNavbar"
        @clickToggleRecentSearchBox="toggleRecentSearchBox"
        @clickShowBookmarks="showBookmarks"
        @clickSettings="showSettingsModal"
        @clickTitle="setPageType('search')"
        @clickCandidateUsername='getBioDetails'
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
        @clickCandidateUsername='getBioDetails'
        :clickBookmarkCandidate="bookmarkCandidate"
        :isInBookmark="isInBookmark"
        :candidates="pageType === 'search' ? candidates: bookmarkCandidates"
        :pageType="pageType"
        :isCandidateLoading="isCandidateLoading"
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
      <!-- Bio detail modal -->
      <b-modal
        :active.sync="isBioDetailsModalActive"
        :canCancel=true has-modal-card
        :onCancel="resetBioDetails"
        scroll="clip"
        >
        <div class="columns is-mobile is-centered" v-if="!bioDetailsFailed && bioDetails.length === 0" >
          <div class="columns is-mobile"  >
            <div class="column loading">
                <b-loading :is-full-page="false" :active.sync="isBioDetailsLoading" :can-cancel="false"></b-loading>
            </div>
          </div>
        </div>
        <div class="container" v-else-if="bioDetailsFailed">
          <div class="columns is-mobile is-centered"  >
            <div class="column is-4">
              <b-message  type="is-danger" has-icon >
                Error loading bio detail. <br>
                Please check again later.
              </b-message>
            </div>
          </div>
        </div>
        <bio-detail  v-else
          :bioDetails="bioDetails"
          :clickBookmarkCandidate="bookmarkCandidate"
          :isInBookmark="isInBookmark"
          :settings="settings"
          :isMobile="isMobile"
          >
        </bio-detail>
      </b-modal>
    </main>
    <the-footer :class="{'footer-fixed': pageType === 'search' && candidates.length === 0 || pageType === 'bookmarks' && bookmarkCandidates.length === 0 || isCandidateLoading }"></the-footer>
  </div>
</template>

<script>
import TheNavbar from './components/TheNavbar'
import TheSearchbar from './components/TheSearchbar'
import RecentSearchBox from './components/RecentSearchBox'
import CandidateList from './components/CandidateList'
import TheSettings from './components/TheSettings'
import BioDetail from './components/BioDetail'
import TheFooter from './components/TheFooter'
import { mapGetters } from 'vuex'
export default {
  name: 'app',
  data () {
    return {
      isSettingsModalActive: false,
      isBioDetailsModalActive: false,
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
    BioDetail,
    TheFooter
  },
  computed: {
    ...mapGetters({
      recentSearch: 'GET_RECENT_SEARCH',
      candidates: 'GET_CANDIDATES',
      bioDetails: 'GET_BIO_DETAILS',
      searchQuery: 'SEARCH_QUERY',
      initialSearchQuery: 'INITIAL_SEARCH_QUERY',
      bookmarkCandidates: 'BOOKMARK_CANDIDATES',
      pageType: 'PAGE_TYPE',
      showRecentSearchBox: 'SHOW_RECENT_SEARCH_BOX',
      isCandidateLoading: 'IS_CANDIDATE_LOADING',
      isBioDetailsLoading: 'IS_BIO_DETAILS_LOADING',
      searchFailed: 'SEARCH_FAILED',
      bioDetailsFailed: 'BIO_DETAILS_FAILED',
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
        const payload = { 'url': `https://floating-everglades-26974.herokuapp.com/candidate/search`, 'query': query }
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
    bookmarkCandidate (candidate) {
      if (this.isInBookmark(candidate.username)) {
        this.$dialog.confirm({
          message: `Are you sure you want to unbookmark '<b>${candidate.username}</b>' candidate?`,
          type: 'is-danger',
          hasIcon: true,
          onConfirm: () => {
            this.$store.dispatch('BOOKMARK_CANDIDATE', { 'candidate': candidate, 'status': 'unbookmarked' })
            this.$toast.open({
              duration: 3000,
              message: `"${candidate.username}" candidate has been unbookmark!`,
              position: 'is-bottom-right',
              type: 'is-danger'
            })
          }
        })
      } else {
        this.$toast.open({
          duration: 3000,
          message: `"${candidate.username} candidate" bookmarked!`,
          position: 'is-bottom',
          type: 'is-info'
        })
        this.$store.dispatch('BOOKMARK_CANDIDATE', { 'candidate': candidate, 'status': 'bookmark' })
      }
    },
    isInBookmark (username) {
      return this.bookmarkCandidates.findIndex(candidate => candidate.username === username) > -1
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
    getBioDetails (username) {
      if (username) {
        this.isBioDetailsModalActive = true
        const payload = { 'url': `https://floating-everglades-26974.herokuapp.com/candidate/extended/${username}` }
        this.$store.dispatch('GET_BIO_DETAILS', payload)
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
    resetBioDetails () {
      this.$store.commit('RESET_BIO_DETAILS')
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
