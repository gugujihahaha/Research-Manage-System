/** 管理后台 */
const AdminPage = {
    data() {
        return {
            projects: [], filtered: [], loading: false,
            search: '', statusFilter: '', currentPage: 1, pageSize: 12,
            detailVisible: false, detail: null
        };
    },
    mounted() { this.load(); },
    computed: {
        paged() {
            const start = (this.currentPage - 1) * this.pageSize;
            return this.filtered.slice(start, start + this.pageSize);
        }
    },
    watch: {
        search() { this.doFilter(); },
        statusFilter() { this.doFilter(); }
    },
    methods: {
        async load() {
            this.loading = true;
            try { const r = await api.get('/projects'); if (r.code === 200) { this.projects = r.data; this.doFilter(); } }
            finally { this.loading = false; }
        },
        doFilter() {
            let list = this.projects;
            if (this.search) { const kw = this.search.toLowerCase(); list = list.filter(p => p.project_id.toLowerCase().includes(kw) || p.name.toLowerCase().includes(kw) || (p.leader_id || '').toLowerCase().includes(kw)); }
            if (this.statusFilter) list = list.filter(p => p.status === this.statusFilter);
            this.filtered = list;
            this.currentPage = 1;
        },
        showDetail(p) { this.detail = p; this.detailVisible = true; },
        statusType(s) { const m = { '申报中': 'info', '形式审查': '', '专家评审': 'warning', '立项公示': 'warning', '已立项': 'success', '执行中': '', '验收申请': 'warning', '验收评审': 'warning', '验收通过': 'success', '终止': 'danger' }; return m[s] || 'info'; },
        statuses() { return ['申报中', '形式审查', '专家评审', '立项公示', '已立项', '执行中', '验收申请', '验收评审', '验收通过', '终止']; }
    },
    template: `
    <div v-loading="loading">
      <div class="page-header d-flex justify-between align-center">
        <div><h4>📋 管理后台</h4><p>所有项目列表，支持搜索与筛选</p></div>
        <el-button type="primary" @click="load" :loading="loading">刷新数据</el-button>
      </div>
      <el-card>
        <div class="d-flex gap-2 mb-3">
          <el-input v-model="search" placeholder="搜索项目编号 / 名称 / 负责人" style="width:300px" clearable></el-input>
          <el-select v-model="statusFilter" placeholder="按状态筛选" clearable style="width:150px">
            <el-option v-for="s in statuses()" :key="s" :label="s" :value="s"></el-option>
          </el-select>
          <span class="text-muted d-flex align-center">共 {{ filtered.length }} 条记录</span>
        </div>
        <el-table :data="paged" stripe size="small">
          <el-table-column prop="project_id" label="项目编号" width="120"></el-table-column>
          <el-table-column label="项目名称" show-overflow-tooltip>
            <template #default="s"><el-button text type="primary" @click="showDetail(s.row)" style="font-size:13px">{{ s.row.name }}</el-button></template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="70"></el-table-column>
          <el-table-column prop="level" label="级别" width="80"></el-table-column>
          <el-table-column prop="leader_id" label="负责人" width="100"></el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="s"><el-tag :type="statusType(s.row.status)" size="small">{{ s.row.status }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="budget_total" label="预算(万)" width="90"></el-table-column>
          <el-table-column prop="acceptance_date" label="验收日期" width="110"></el-table-column>
        </el-table>
        <el-pagination class="mt-3" v-model:current-page="currentPage" :page-size="pageSize" :total="filtered.length" layout="total, prev, pager, next" small background></el-pagination>
      </el-card>

      <el-dialog v-model="detailVisible" :title="detail?.name" width="560px" v-if="detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="项目编号">{{ detail.project_id }}</el-descriptions-item>
          <el-descriptions-item label="状态"><el-tag :type="statusType(detail.status)" size="small">{{ detail.status }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="类型">{{ detail.type }}</el-descriptions-item>
          <el-descriptions-item label="级别">{{ detail.level }}</el-descriptions-item>
          <el-descriptions-item label="负责人工号">{{ detail.leader_id }}</el-descriptions-item>
          <el-descriptions-item label="总预算">{{ detail.budget_total }} 万元</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ detail.apply_date }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ detail.start_date }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ detail.end_date }}</el-descriptions-item>
          <el-descriptions-item label="验收日期">{{ detail.acceptance_date || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </div>`
};
