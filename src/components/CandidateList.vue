  <template>
    <section class="section">
      <div class="container" style="margin-top:0px;">
        <div class="columns is-multiline is-mobile" v-if="!isCandidateLoading && candidates.length > 0">
          <div class="column is-6" >
            <span class="is-size-5-desktop is-size-6-mobile has-text-grey" v-if="pageType !== 'bookmarks'"> Search Results </span>
            <span class="is-size-5-desktop is-size-6-mobile has-text-grey" v-else> Bookmarks</span></div>
          <div class="column is-5 has-text-right "><span class="has-text-grey-light is-size-6"> {{candidates.length}} candidate(s) </span> </div>
          <div class="column is-1 has-text-left">
              <b-tooltip type="is-light" label="switch panel view" position="is-top" :active="!isMobile">
              <i @click="onClickUpdateSettings" class="fas  fa-lg" :class="[settings.panelType === 'card' ? 'fa-th-list' : 'fa-th']"></i>
            </b-tooltip>
          </div>
        </div>
        <!-- Candidate List -->
        <transition name="list" mode="out-in" >
          <div class="columns is-multiline is-mobile" v-if="!isCandidateLoading && displayedCandidates.length > 0" :key="pageType">
            <div  class="column"
              :class="[settings.panelType === 'card' ? 'is-3-widescreen is-3-desktop is-4-tablet' : 'is-4-widescreen  is-4-desktop is-6-tablet is-12-mobile']"
              v-for="candidate in displayedCandidates"
              :key="candidate.candidateId">
              <!-- Card Panel  -->
              <div class="card"
                v-if="settings.panelType === 'card'" >
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img
                      :src="candidate.pictureThumbnail"
                      :alt="candidate.name">
                  </figure>
                </div>
                <div class="card-content">
                  <div class="media">
                    <div class="media-content overflow-content">
                      <div class="title is-size-6-widescreen is-size-6-desktop candidate-name" >
                        <a v-if="candidate.candidateId" @click="onClickCandidateUsername(candidate.username)">
                          {{candidate.username}}
                        </a>
                      </div>
                      <div class="subtitle is-6">
                        {{candidate.name}}<br>
                        <span class="has-text-grey-light">{{candidate.professionalHeadline}}</span>
                        <hr style="margin-top:10px; margin-bottom:10px;" />
                        <small class="has-text-grey-light">{{candidate.location}}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <footer class="card-footer">
                    <span class="eye card-footer-item">
                      <b-tooltip type="is-light" :label="'Click to view details'" position="is-top" :active="!isMobile">
                        <i @click="onClickCandidateUsername(candidate.username)" class="fas fa-lg fa-eye"></i>
                      </b-tooltip>
                    </span>
                    <span class="heart card-footer-item">
                      <b-tooltip type="is-light" :label="isInBookmark(candidate.username) ? 'click to unbookmarked' : 'click to bookmark'" position="is-top" :active="!isMobile">
                        <i @click="clickBookmarkCandidate(candidate)" class="fas fa-lg bookmarkIcon" :class="[{'favorite': isInBookmark(candidate.username)}, settings.bookmarkIcon]"></i>
                      </b-tooltip>
                    </span>
                  </footer>
              </div>
              <!-- Media Panel-->
              <article class="media media-wrap" v-if="settings.panelType === 'media'">
                <figure class="media-left">
                  <p class="image ">
                    <img :src="candidate.pictureThumbnail" :alt="candidate.name">
                  </p>
                </figure>
                <div class="media-content">
                  <div class="content overflow-content">
                    <div>
                      <strong><a v-if="candidate.candidateId" @click="onClickCandidateUsername(candidate.username)">{{candidate.username}}</a></strong> <br>
                      {{candidate.name}}
                      <br />
                      <span class="has-text-grey-light">{{candidate.professionalHeadline}}</span>
                      <hr style="margin-top:10px; margin-bottom:10px;" />
                      <small class="has-text-grey-light">({{candidate.location}})</small>
                    </div>
                  </div>
                  <div class="level is-mobile">
                    <div class="level-left">
                      <span class="eye card-footer-item">
                        <b-tooltip type="is-light" :label="'Click to view details'" position="is-top" :active="!isMobile">
                          <i @click="onClickCandidateUsername(candidate.username)" class="fas fa-eye"></i>
                        </b-tooltip>
                      </span>
                      <a class="level-item">
                        <b-tooltip type="is-light" :label="isInBookmark(candidate.username) ? 'click to unbookmarked' : 'click to bookmark'" position="is-top" :active="!isMobile">
                          <i @click="clickBookmarkCandidate(candidate)" class="fas bookmarkIcon" :class="[{'favorite': isInBookmark(candidate.username)}, settings.bookmarkIcon]"></i>
                        </b-tooltip>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </transition>
        <!-- Loading animation -->
        <div class="columns is-mobile" v-if="isCandidateLoading">
          <div class="column loading">
              <b-loading :is-full-page="false" :active.sync="isCandidateLoading" :can-cancel="false"></b-loading>
          </div>
        </div>
        <!-- Pagination -->
        <div class="columns is-multiline is-mobile" v-if="!isCandidateLoading && candidates.length > 0">
          <div class="column is-12" v-if="candidates.length > 0">
            <hr>
            <b-pagination
                :total="candidates.length"
                :current.sync="current"
                :order="order"
                :size="size"
                :simple="isSimple"
                :rounded="isRounded"
                :per-page="settings.perPage">
            </b-pagination>
          </div>
        </div>
        <!-- No Bookmark message-->
        <template v-if="pageType === 'bookmarks' && candidates.length === 0">
          <div class="columns is-multiline is-mobile">
            <div class="column">
              <h3 class="title is-4 has-text-centered">You have no saved bookmarks.</h3>
            </div>
          </div>
        </template>
        <!-- Search results message -->
        <template v-if="searchFailed && !isCandidateLoading">
        <div class="columns is-multiline is-mobile">
          <div class="column">
            <h3 class="title is-4 has-text-centered">Nothing found. </h3>
            <h3 class="title is-4 has-text-centered"> Please Search Again!</h3>
          </div>
        </div>
        </template>
      </div>
    </section>
</template>

<script>
export default {
  name: 'CandidateList',
  data () {
    return {
      current: 1,
      order: 'is-centered',
      size: '',
      isSimple: false,
      isRounded: false
    }
  },
  props: {
    candidates: {
      type: Array,
      required: true
    },
    pageType: {
      type: String,
      required: true
    },
    isCandidateLoading: {
      type: Boolean,
      required: true
    },
    searchFailed: {
      type: Boolean,
      required: true
    },
    bookmarkCandidates: {
      type: Array,
      required: true
    },
    settings: {
      type: Object,
      required: true
    },
    isMobile: {
      type: Boolean,
      required: true
    },
    clickBookmarkCandidate: {
      type: Function,
      required: true
    },
    isInBookmark: {
      type: Function,
      required: true
    }
  },
  computed: {
    displayedCandidates () {
      return this.paginate(this.candidates)
    }
  },
  watch: {
    candidates (val, oldVal) {
      if (val !== oldVal) {
        this.current = 1
      }
    }
  },
  methods: {
    paginate (candidates) {
      let current = this.current
      let perPage = this.settings.perPage
      let from = (current * perPage) - perPage
      let to = (current * perPage)
      return candidates.slice(from, to)
    },
    onClickUpdateSettings () {
      const settingValue = this.settings.panelType === 'card' ? 'media' : 'card'
      this.$emit('clickUpdateSettings', 'panelType', settingValue)
    },
    onClickCandidateUsername (username) {
      this.$emit('clickCandidateUsername', username)
    }
  }
}
</script>
