<template>
<div  class="modal-card" style="width: auto; max-width: 980px; height: auto; max-height: 700px"  >
    <header class="modal-card-head">
      <p class="modal-card-title" v-if="basicBio"><strong>{{basicBio.name}} ({{ basicBio.username}})</strong></p>
    </header>
    <section class="modal-card-body">
      <div class="columns is-multiline">
        <div v-if="basicBio" class="column is-12">
          <article class="media media-modal">
            <figure class="media-left">
              <p class="image">
                <img v-if="basicBio.candidateId" :src="basicBio.pictureThumbnail">
              </p>
            </figure>
            <div class="media-content">
              <div class="content" v-if="basicBio">
                  {{basicBio.professionalHeadline}} <br>
                  <span class="has-text-grey-light" v-if="basicBio.location">{{basicBio.location}}</span>
              </div>
              <div class="level is-mobile">
                <div class="level-left">
                  <a class="level-item">
                    <b-tooltip type="is-light" :label="isInBookmark(basicBio.username) ? 'click to unbookmarked' : 'click to bookmark'" position="is-top" :active="!isMobile">
                      <i @click="clickBookmarkCandidate(basicBio)" class="fas bookmarkIcon" :class="[{'favorite': isInBookmark(basicBio.username)}, settings.bookmarkIcon]"></i>
                    </b-tooltip>
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
        <div class="column is-12"  >
          <b-table :data="experiencesList"  >
            <template slot-scope="props">
              <b-table-column field="experience_title" label="Organizations" centered>
                  {{ props.row.organizations }}
              </b-table-column>
              <b-table-column field="experience_number" label="Name" centered>
                {{ props.row.name }}
              </b-table-column>
              <b-table-column field="experience_duration" label="Duration" centered>
                {{ props.row.duration }}
              </b-table-column>
            </template>
          </b-table>
        </div>
      </div>
    </section>
    <footer class="modal-card-foot">
      <button class="button" type="button" @click="$parent.close()">Close</button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'BioDetail',
  props: {
    bioDetails: {
      type: Object,
      required: true
    },
    replaceArtworkUrlSize: {
      type: Function,
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
  mounted () {
    this.showCandidateInfo()
    this.showExperiencesList()
    this.showJobsList()
    this.showStrengths()
    this.showInterests()
    this.showProfessionalCulture()
  },
  methods: {
    showCandidateInfo () {
      this.basicBio = this.bioDetails.basicBio
    },
    showExperiencesList () {
      this.experiencesList = this.bioDetails.experiences
    },
    showJobsList () {
      this.jobsList = this.bioDetails.jobs
    },
    showStrengths () {
      this.strengths = this.bioDetails.strengths
    },
    showInterests () {
      this.interests = this.bioDetails.interests
    },
    showProfessionalCulture () {
      this.professionalCulture = this.bioDetails.professionalCulture
    },
    onSort (field, order) {
      this.sortField = field
      this.sortOrder = order
      this.showExperiencesList()
    },
    millisToMinutesAndSeconds (millis) {
      const minutes = Math.floor(millis / 60000)
      const seconds = ((millis % 60000) / 1000).toFixed(0)
      return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
    }
  },
  data () {
    return {
      basicBio: {},
      experiencesList: [],
      jobsList: [],
      strengths: '',
      interests: '',
      professionalCulture: ''
    }
  }
}
</script>

<style>
.media-wrap .media-left {
  width:130px;
  height:130px;
}
.card-image, .media-left {
  background: url('./../../public/images/200w_s.gif') 50% no-repeat !important;
}
</style>
