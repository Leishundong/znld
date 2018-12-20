<template>
  <div class="home-map-wrap">
    <!-- <el-select v-model="projectId" placeholder="project" @change="handleProjectChange">
      <el-option
        v-for="item in projectList()"
        :key="item.id"
        :label="item.name"
        :value="item.id">
      </el-option>
    </el-select> -->
    <el-amap
      :center="center"
      :zoom="zoom"
      :plugin="plugin"
      :events="events">
      <el-amap-marker
        v-for="marker in markers"
        :key="marker.id"
        :position="marker.position"
        :title="marker.title"
        :events="marker.events">
      </el-amap-marker>
    </el-amap>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'

  export default {
    data () {
      const self = this;
      return {
        center: [105, 34],
        zoom: 4,
        // { position, event }
        markers: [],
        // { project, entity }
        markerRefs: [],
        events: {
          init (o) {
            self.map = o;
            setTimeout(() => {
              const markerRefs = self.markerRefs.map(item => item.entity);
              self.addCluster(markerRefs)
            }, 1000)
          }
        },
        // 点聚合实例
        cluster: null,
        // 地图实例
        map: null,
        // 选中项目
        projectId: '',
        plugin: [{
          // pName为必填字段
          pName: 'MapType',
          defaultType: 0
        }]
      }
    },

    computed: {
      ...mapGetters([
        'deviceAll',
        'projectList'
      ]),
      projectCelected: {
        get () {
          return sessionStorage.getItem('projectId')
        },
        set () {
          let projectId = this.projectCelected;
          const markerRefs = this.markerRefs.filter(item => item.project === projectId).map(item => item.entity);
          this.addCluster(markerRefs)
        }
      }
    },
    methods: {
      ...mapActions([
        'getDeviceAll',
        'getDeviceList',
        'getStrategyList',
        'getGroupList',
        'getStatisticCount',
        'getUserList',
        'getWarningList',
        'getProject'
      ]),
      addCluster (markerRefs) {
        // console.log('设备数', markerRefs.length)
        if (this.cluster) {
          this.cluster.setMap(null)
        }
        this.cluster = new AMap.MarkerClusterer(this.map, markerRefs, { gridSize: 80 })
      },
      handleProjectChange (projectId) {
        const markerRefs = this.markerRefs.filter(item => item.project === projectId).map(item => item.entity)
        this.addCluster(markerRefs)
      },
      async init (projectId) {
        const promises = [
          this.getDeviceList({ projectId }),
          this.getProject({ projectId }),
          this.getStrategyList({ projectId }),
          this.getGroupList({ projectId }),
          this.getStatisticCount({ projectId }),
          this.getUserList({ projectId })
        ]
        let loading = null
        try {
          loading = this.$loading({
            lock: true
          })
          await Promise.all(promises)
          this.$router.push(`/${projectId}/app/device/map`)
        } finally {
          sessionStorage.setItem('projectId', projectId)
          if (loading) loading.close()
        }
      }
    },

    async created () {
      const self = this
      try {
        await this.getDeviceAll()
        const markers = []
        this.deviceAll().forEach(item => {
          const { lng, lat, project, projectName } = item
          markers.push({
            position: [lng, lat],
            title: projectName,
            events: {
              init (o) {
                self.markerRefs.push({
                  project,
                  entity: o
                })
              },
              // 双击进入项目
              dblclick: () => {
                this.init(project)
              }
            }
          })
        })
        this.markers = markers
      } catch (e) {
        console.log(e)
      }
    }
  }
</script>
<style scoped>
.home-map-wrap {
  position: absolute;
  z-index: 1;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 20px;
  /* padding-top: 1px; */
}
</style>





// WEBPACK FOOTER //
// src/views/home/home.vue
