/** 统计报表 */
const StatsPage = {
    data() {
        return { loading: false, year: 2023, collegeData: [], achievementData: [], workloadData: [] };
    },
    mounted() { this.loadAll(); },
    methods: {
        async loadAll() {
            this.loading = true;
            try { await Promise.all([this.loadCollege(), this.loadAchievement(), this.loadWorkload()]); }
            finally { this.loading = false; this.$nextTick(() => { this.renderCharts(); }); }
        },
        async loadCollege() { const r = await api.get(`/stats/college/${this.year}`); if (r.code === 200) this.collegeData = r.data; },
        async loadAchievement() { const r = await api.get('/stats/achievements'); if (r.code === 200) this.achievementData = r.data; },
        async loadWorkload() { const r = await api.get(`/stats/workload/${this.year}`); if (r.code === 200) this.workloadData = r.data; },
        renderCharts() {
            const bar = echarts.init(document.getElementById('chartBar'));
            if (bar && this.collegeData.length) {
                bar.setOption({
                    tooltip: { trigger: 'axis' }, legend: { data: ['申报数', '立项数', '到账总额(万元)'] },
                    xAxis: { type: 'category', data: this.collegeData.map(c => c.college_name) }, yAxis: { type: 'value' },
                    series: [
                        { name: '申报数', type: 'bar', data: this.collegeData.map(c => c.apply_count), itemStyle: { color: '#409EFF' }, barGap: '10%' },
                        { name: '立项数', type: 'bar', data: this.collegeData.map(c => c.approve_count), itemStyle: { color: '#67C23A' } },
                        { name: '到账总额(万元)', type: 'bar', data: this.collegeData.map(c => c.total_fund), itemStyle: { color: '#E6A23C' } }
                    ], grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
                });
            }
            const pie = echarts.init(document.getElementById('chartPie'));
            if (pie && this.achievementData.length) {
                pie.setOption({
                    tooltip: { trigger: 'item' }, legend: { orient: 'vertical', right: 10, top: 'center' },
                    series: [{ type: 'pie', radius: ['50%', '75%'], center: ['35%', '50%'], label: { show: false },
                        data: this.achievementData.map(a => ({ name: a.type, value: a.count })) }]
                });
            }
        }
    },
    template: `
    <div v-loading="loading">
      <div class="page-header d-flex justify-between align-center">
        <div><h4>📊 统计报表</h4><p>学院统计、成果分布、工作量考核</p></div>
        <el-radio-group v-model="year" @change="loadAll" size="small">
          <el-radio-button :value="2022">2022</el-radio-button>
          <el-radio-button :value="2023">2023</el-radio-button>
          <el-radio-button :value="2024">2024</el-radio-button>
          <el-radio-button :value="2025">2025</el-radio-button>
        </el-radio-group>
      </div>
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card><template #header>📊 各学院科研项目统计 ({{ year }}年)</template><div id="chartBar" style="height:340px"></div></el-card>
        </el-col>
        <el-col :span="8">
          <el-card><template #header>🏆 成果类型分布</template><div id="chartPie" style="height:340px"></div></el-card>
        </el-col>
      </el-row>
      <el-card class="mt-3">
        <template #header>👩‍💻 科研人员工作量考核 ({{ year }}年)</template>
        <el-table :data="workloadData" stripe size="small">
          <el-table-column prop="name" label="姓名" width="100"></el-table-column>
          <el-table-column prop="project_count" label="项目总数" width="100"></el-table-column>
          <el-table-column prop="active_project_count" label="在研项目" width="100"></el-table-column>
          <el-table-column prop="achievement_count" label="成果数" width="100"></el-table-column>
          <el-table-column label="工作量评估">
            <template #default="s"><el-progress :percentage="Math.min(s.row.project_count * 20 + s.row.achievement_count * 10, 100)" :stroke-width="12" :color="s.row.project_count >= 3 ? '#67C23A' : '#E6A23C'"></el-progress></template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>`
};
