/** 工作台 */
const DashboardPage = {
    props: ['user'],
    data() { return { notices: [], expiring: [], myProjects: [], allProjects: [], expertTasks: [], loading: false }; },
    mounted() { this.load(); },
    computed: {
        role() { return this.user?.role || ''; },
        stats() {
            const mp = this.myProjects, ap = this.allProjects;
            if (this.role === '科研人员') return [
                { num: mp.length, label: '我的项目', bar: 'blue' },
                { num: mp.filter(p => p.status === '执行中').length, label: '在研项目', bar: 'green' },
                { num: mp.filter(p => ['申报中','形式审查','专家评审','立项公示'].includes(p.status)).length, label: '审核中', bar: 'orange' },
                { num: mp.filter(p => p.status === '验收通过').length, label: '已验收', bar: 'purple' }
            ];
            if (this.role === '科研处') return [
                { num: ap.length, label: '全部项目', bar: 'blue' },
                { num: ap.filter(p => ['形式审查','专家评审','立项公示'].includes(p.status)).length, label: '待审核', bar: 'orange' },
                { num: ap.filter(p => ['已立项','执行中'].includes(p.status)).length, label: '在研项目', bar: 'green' },
                { num: ap.filter(p => p.status === '验收通过').length, label: '已验收', bar: 'purple' }
            ];
            const reviewed = this.allProjects.filter(p => p.status === '专家评审').length;
            if (this.role === '专家') return [
                { num: this.expertTasks.length, label: '待我评审', bar: 'orange' },
                { num: reviewed, label: '在审项目总数', bar: 'blue' }
            ];
            if (this.role === '财务处') return [
                { num: this.allProjects.filter(p => ['已立项','执行中'].includes(p.status)).length, label: '在研项目', bar: 'green' }
            ];
            return [{ num: ap.length, label: '全部项目', bar: 'blue' }];
        }
    },
    methods: {
        async load() { this.loading = true; try { const ps = [api.get('/notices'), api.get('/expiring_projects'), api.get('/projects')]; if (this.role === '专家') ps.push(api.get('/expert/tasks')); const rs = await Promise.all(ps); this.notices = rs[0].data || []; this.expiring = rs[1].data || []; this.allProjects = rs[2].data || []; this.myProjects = this.allProjects.filter(x => x.leader_id === this.user?.researcher_id); if (rs[3]) this.expertTasks = rs[3].data || []; } finally { this.loading = false; } },
        go(tab) { this.$emit('nav', tab); }
    },
    template: `
    <div v-loading="loading">
      <div class="page-head"><h2>工作台</h2><p class="desc">欢迎回来，{{ user.name }}</p></div>
      <div class="stat-grid">
        <div v-for="s in stats" :key="s.label" class="stat-cell">
          <div><div class="sc-num">{{ s.num }}</div><div class="sc-label">{{ s.label }}</div><div class="sc-bar" :class="s.bar"></div></div>
        </div>
      </div>
      <el-row :gutter="20">
        <el-col :span="14">
          <el-card><template #header>最新通知</template>
            <el-timeline v-if="notices.length"><el-timeline-item v-for="n in notices.slice(0,5)" :key="n.notice_id" :timestamp="n.publish_date" color="#4f6ef7"><strong>{{ n.title }}</strong><p class="text-muted mt-1 mb-0">{{ n.content }}</p></el-timeline-item></el-timeline>
            <el-empty v-else description="暂无通知" :image-size="60"></el-empty>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card><template #header>即将到期项目</template>
            <div v-if="expiring.length"><div v-for="p in expiring" :key="p.project_id" class="d-flex justify-between align-center mb-2" style="padding:10px 0;border-bottom:1px solid #f1f5f9"><div><div style="font-weight:500;font-size:13px">{{ p.name }}</div><div class="text-muted">{{ p.project_id }}</div></div><el-tag :type="p.days_left <= 7 ? 'danger' : 'warning'" effect="dark" round size="small">{{ p.days_left }} 天</el-tag></div></div>
            <el-empty v-else description="暂无即将到期项目" :image-size="60"></el-empty>
          </el-card>
          <el-card class="mt-3">
            <template #header>快捷操作</template>
            <el-space wrap>
              <template v-if="role === '科研人员'"><el-button type="primary" @click="go('my-declare')">项目申报</el-button><el-button type="success" @click="go('my-funding')">经费报销</el-button><el-button plain @click="go('my-achievement')">成果登记</el-button></template>
              <template v-if="role === '科研处'"><el-button type="primary" @click="go('notices-manage')">发布通知</el-button><el-button type="warning" @click="go('review-manage')">项目审核</el-button><el-button plain @click="go('stats')">查看统计</el-button></template>
              <template v-if="role === '财务处'"><el-button type="primary" @click="go('funding-manage')">经费管理</el-button><el-button plain @click="go('stats')">查看统计</el-button></template>
              <template v-if="role === '专家'"><el-button type="primary" @click="go('expert-review')">查看待审项目（{{ expertTasks.length }}）</el-button></template>
            </el-space>
          </el-card>
        </el-col>
      </el-row>
    </div>`,
    emits: ['nav']
};
