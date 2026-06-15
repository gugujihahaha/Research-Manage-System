/** 待办汇总 — 所有角色共用 */
const TodoPage = {
    props: ['user'],
    data() { return { loading: false, data: {} }; },
    mounted() { this.load(); },
    computed: {
        role() { return this.user?.role || ''; },
        total() { return Object.values(this.data).reduce((a, b) => a + (b?.length || 0), 0); }
    },
    methods: {
        async load() {
            this.loading = true;
            try {
                const rid = this.user?.researcher_id;
                const fs = [];
                if (this.role === '科研人员') {
                    fs.push(api.get('/projects').then(r => { if (r.code === 200) this.data.myPending = r.data.filter(p => p.leader_id === rid && ['申报中','形式审查','专家评审'].includes(p.status)); }));
                    fs.push(api.get('/projects').then(r => { if (r.code === 200) this.data.canAccept = r.data.filter(p => p.leader_id === rid && ['已立项','执行中'].includes(p.status)); }));
                }
                if (this.role === '科研处') {
                    fs.push(api.get('/projects').then(r => { if (r.code === 200) { const ps = r.data; this.data.formReview = ps.filter(p => p.status === '申报中'); this.data.expertAssign = ps.filter(p => p.status === '专家评审'); this.data.toApprove = ps.filter(p => p.status === '立项公示'); this.data.acceptance = ps.filter(p => ['验收申请','验收评审'].includes(p.status)); }}));
                    fs.push(api.get('/pending-reports').then(r => { if (r?.code === 200) this.data.reports = r.data; }));
                    fs.push(api.get('/pending-changes').then(r => { if (r?.code === 200) this.data.changes = r.data; }));
                }
                if (this.role === '专家') {
                    fs.push(api.get('/expert/tasks').then(r => { if (r.code === 200) this.data.reviews = r.data; }));
                }
                if (this.role === '财务处') {
                    fs.push(api.get('/funding/pending').then(r => { if (r.code === 200) this.data.funding = r.data; }));
                }
                await Promise.all(fs);
            } finally { this.loading = false; }
        },
        go(tab) { this.$emit('nav', tab); },
        statusType(s) { const m = { '申报中': 'info', '形式审查': '', '专家评审': 'warning', '立项公示': 'warning', '已立项': 'success', '执行中': '', '验收申请': 'warning', '验收评审': 'warning', '验收通过': 'success', '终止': 'danger' }; return m[s] || 'info'; }
    },
    template: `
    <div v-loading="loading">
      <div class="page-head"><h2>待办事项</h2><p class="desc">{{ total }} 项待处理</p></div>

      <!-- 科研人员 -->
      <template v-if="role === '科研人员'">
        <el-card v-if="data.myPending?.length"><template #header>审核中的项目 ({{ data.myPending.length }})</template>
          <el-table :data="data.myPending" stripe size="small"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="name" label="项目名称" show-overflow-tooltip/><el-table-column label="状态" width="100"><template #default="s"><el-tag :type="statusType(s.row.status)" size="small">{{ s.row.status }}</el-tag></template></el-table-column><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" @click="go('my-projects')">查看</el-button></template></el-table-column></el-table>
        </el-card>
        <el-card v-if="data.canAccept?.length" class="mt-3"><template #header>可申请验收 ({{ data.canAccept.length }})</template>
          <el-table :data="data.canAccept" stripe size="small"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="name" label="项目名称" show-overflow-tooltip/><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" type="primary" @click="go('my-acceptance')">申请验收</el-button></template></el-table-column></el-table>
        </el-card>
        <el-empty v-if="!data.myPending?.length && !data.canAccept?.length" description="暂无待办" :image-size="80"/>
      </template>

      <!-- 科研处 -->
      <template v-if="role === '科研处'">
        <el-card v-if="data.formReview?.length"><template #header>待形式审查 ({{ data.formReview.length }})</template>
          <el-table :data="data.formReview" stripe size="small"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="name" label="项目名称" show-overflow-tooltip/><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" type="primary" @click="go('review-manage')">去审查</el-button></template></el-table-column></el-table>
        </el-card>
        <el-card v-if="data.expertAssign?.length" class="mt-3"><template #header>待分配专家 ({{ data.expertAssign.length }})</template>
          <el-table :data="data.expertAssign" stripe size="small"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="name" label="项目名称" show-overflow-tooltip/><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" type="primary" @click="go('review-manage')">去分配</el-button></template></el-table-column></el-table>
        </el-card>
        <el-card v-if="data.toApprove?.length" class="mt-3"><template #header>待立项审批 ({{ data.toApprove.length }})</template>
          <el-table :data="data.toApprove" stripe size="small"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="name" label="项目名称" show-overflow-tooltip/><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" type="success" @click="go('review-manage')">去审批</el-button></template></el-table-column></el-table>
        </el-card>
        <el-card v-if="data.acceptance?.length" class="mt-3"><template #header>待验收评审 ({{ data.acceptance.length }})</template>
          <el-table :data="data.acceptance" stripe size="small"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="name" label="项目名称" show-overflow-tooltip/><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" type="primary" @click="go('acceptance-manage')">去验收</el-button></template></el-table-column></el-table>
        </el-card>
        <el-card v-if="data.reports?.length" class="mt-3"><template #header>待审核报告 ({{ data.reports.length }})</template>
          <el-table :data="data.reports" stripe size="small"><el-table-column prop="_projectName" label="项目" show-overflow-tooltip/><el-table-column prop="report_year" label="年度" width="80"/><el-table-column prop="content" label="内容" show-overflow-tooltip/><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" type="primary" @click="go('review-manage')">去审核</el-button></template></el-table-column></el-table>
        </el-card>
        <el-card v-if="data.changes?.length" class="mt-3"><template #header>待审批变更 ({{ data.changes.length }})</template>
          <el-table :data="data.changes" stripe size="small"><el-table-column prop="_projectName" label="项目" show-overflow-tooltip/><el-table-column prop="request_type" label="类型" width="90"/><el-table-column prop="reason" label="理由" show-overflow-tooltip/><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" type="primary" @click="go('review-manage')">去审批</el-button></template></el-table-column></el-table>
        </el-card>
        <el-empty v-if="total === 0" description="暂无待办" :image-size="80"/>
      </template>

      <!-- 专家 -->
      <template v-if="role === '专家'">
        <el-card v-if="data.reviews?.length"><template #header>待评审项目 ({{ data.reviews.length }})</template>
          <el-table :data="data.reviews" stripe size="small"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="project_name" label="项目名称" show-overflow-tooltip/><el-table-column prop="review_date" label="分配日期" width="110"/><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" type="primary" @click="go('expert-review')">去评审</el-button></template></el-table-column></el-table>
        </el-card>
        <el-empty v-else description="暂无待办" :image-size="80"/>
      </template>

      <!-- 财务处 -->
      <template v-if="role === '财务处'">
        <el-card v-if="data.funding?.length"><template #header>待审批经费 ({{ data.funding.length }})</template>
          <el-table :data="data.funding" stripe size="small"><el-table-column prop="project_id" label="编号" width="110"/><el-table-column prop="project_name" label="项目名称" show-overflow-tooltip/><el-table-column label="类型" width="70"><template #default="s"><el-tag :type="s.row.type === '到账' ? 'success' : ''" size="small">{{ s.row.type }}</el-tag></template></el-table-column><el-table-column prop="amount" label="金额(万)" width="90"/><el-table-column label="操作" width="120"><template #default="s"><el-button size="small" type="primary" @click="go('funding-manage')">去审批</el-button></template></el-table-column></el-table>
        </el-card>
        <el-empty v-else description="暂无待办" :image-size="80"/>
      </template>
    </div>`,
    emits: ['nav']
};
