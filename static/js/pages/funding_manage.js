/** 财务处 — 经费管理 */
const FundingManagePage = {
    data() {
        return {
            loading: false, submitting: false, msg: '',
            activeTab: 'pending',
            pendingList: [],
            income: { project_id: '', amount: 0, exp_date: '', operator_id: 'R2002' },
            monitorPid: '', monitorResult: null, projectOptions: [],
            surplus: { project_id: '', action: '转入下一年' },
            confirmAction: null
        };
    },
    mounted() { this.loadPending(); },
    methods: {
        async loadPending() {
            this.loading = true;
            try { const r = await api.get('/funding/pending'); if (r.code === 200) this.pendingList = r.data; }
            finally { this.loading = false; }
        },
        async registerIncome() {
            if (!this.income.project_id || !this.income.amount) { this.msg = '请填写项目编号和金额'; return; }
            this.submitting = true; this.msg = '';
            try { const res = await api.post('/funding/income', this.income); this.msg = res?.message || '登记成功'; this.income = { project_id: '', amount: 0, exp_date: '', operator_id: 'R2002' }; this.loadPending(); setTimeout(() => this.msg = '', 3000); }
            catch (e) { this.msg = e?.response?.data?.message || '登记失败'; }
            finally { this.submitting = false; }
        },
        async doApprove(expId, result) {
            this.submitting = true; this.msg = '';
            try { const res = await api.put('/funding/approve', { exp_id: expId, result }); this.msg = res?.message || '审批完成'; this.loadPending(); setTimeout(() => this.msg = '', 3000); }
            catch (e) { this.msg = e?.response?.data?.message || '操作失败'; }
            finally { this.submitting = false; }
        },
        async loadProjects() { try { const r = await api.get('/projects'); if (r.code === 200) this.projectOptions = r.data; } catch {} },
        async showMonitor() { if (!this.monitorPid) return; const r = await api.get(`/funding/status/${this.monitorPid}`); if (r.code === 200) this.monitorResult = r.data; },
        confirm(type) { this.confirmAction = type; },
        cancel() { this.confirmAction = null; },
        async exec() {
            this.confirmAction = null; this.submitting = true; this.msg = '';
            try { const res = await api.post('/funding/surplus', this.surplus); this.msg = res?.message || '处理完成'; setTimeout(() => this.msg = '', 3000); }
            catch (e) { this.msg = e?.response?.data?.message || '操作失败'; }
            finally { this.submitting = false; }
        }
    },
    template: `
    <div v-loading="loading">
      <div class="page-head d-flex justify-between align-center">
        <div><h2>经费管理</h2><p class="desc">到账登记、报销审批、执行监控、结余处理</p></div>
        <el-button size="small" @click="loadPending">刷新</el-button>
      </div>
      <div v-if="msg" :style="'padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;' + (msg.includes('失败') ? 'color:#dc2626;background:#fef2f2' : 'color:#16a34a;background:#f0fdf4')">{{ msg }}</div>
      <div v-if="confirmAction" :style="'background:#fff7ed;border:1px solid #fed7aa;padding:12px 16px;border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between'">
        <span>确认结余经费「{{ surplus.action }}」？</span>
        <div class="d-flex gap-2"><el-button size="small" @click="cancel">取消</el-button><el-button size="small" type="warning" :loading="submitting" @click="exec">确认</el-button></div>
      </div>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane name="pending">
          <template #label>待审批 ({{ pendingList.length }})</template>
          <el-table :data="pendingList" stripe size="small" v-if="pendingList.length">
            <el-table-column prop="project_id" label="项目编号" width="110"/>
            <el-table-column prop="project_name" label="项目名称" show-overflow-tooltip/>
            <el-table-column label="类型" width="70"><template #default="s"><el-tag :type="s.row.type === '到账' ? 'success' : 'warning'" size="small">{{ s.row.type }}</el-tag></template></el-table-column>
            <el-table-column label="金额(万)" width="100"><template #default="s">{{ s.row.amount }}</template></el-table-column>
            <el-table-column prop="budget_category" label="预算科目" width="100"/>
            <el-table-column prop="purpose" label="用途" show-overflow-tooltip/>
            <el-table-column prop="exp_date" label="日期" width="110"/>
            <el-table-column label="操作" width="180">
              <template #default="s"><el-button size="small" type="success" @click="doApprove(s.row.exp_id, '通过')">通过</el-button><el-button size="small" type="danger" @click="doApprove(s.row.exp_id, '驳回')">驳回</el-button></template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无待审批记录" :image-size="80"/>
        </el-tab-pane>
        <el-tab-pane label="到账登记" name="income">
          <el-card><template #header>经费到账登记</template>
            <el-form :model="income" label-width="100px" size="small" style="max-width:500px">
              <el-form-item label="项目编号"><el-select v-model="income.project_id" placeholder="选择项目" style="width:100%" filterable @focus="loadProjects"><el-option v-for="p in projectOptions" :key="p.project_id" :label="p.project_id + ' ' + p.name" :value="p.project_id"/></el-select></el-form-item>
              <el-form-item label="金额(万元)"><el-input-number v-model="income.amount" :min="0" :precision="2" style="width:100%"/></el-form-item>
              <el-form-item label="到账日期"><el-date-picker v-model="income.exp_date" type="date" value-format="YYYY-MM-DD" style="width:100%"/></el-form-item>
              <el-button type="primary" :loading="submitting" @click="registerIncome">登记到账</el-button>
            </el-form>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="预算监控" name="monitor">
          <el-card><template #header>预算执行监控</template>
            <div class="d-flex gap-2 mb-2"><el-select v-model="monitorPid" placeholder="选择项目" size="small" style="width:260px" @focus="loadProjects" filterable><el-option v-for="p in projectOptions" :key="p.project_id" :label="p.project_id + ' ' + p.name" :value="p.project_id"/></el-select><el-button size="small" @click="showMonitor">查看</el-button></div>
            <div v-if="monitorResult"><el-descriptions :column="3" border size="small"><el-descriptions-item label="总预算">{{ monitorResult.summary.total_budget }} 万</el-descriptions-item><el-descriptions-item label="已支出">{{ monitorResult.summary.total_spent }} 万</el-descriptions-item><el-descriptions-item label="执行率"><el-progress :percentage="monitorResult.summary.execute_rate" :stroke-width="14" style="width:140px"/></el-descriptions-item></el-descriptions></div>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="结余处理" name="surplus">
          <el-card><template #header>结余经费处理</template>
            <el-form :model="surplus" size="small" label-width="80px" style="max-width:500px">
              <el-form-item label="项目编号"><el-select v-model="surplus.project_id" placeholder="选择项目" style="width:100%" filterable @focus="loadProjects"><el-option v-for="p in projectOptions" :key="p.project_id" :label="p.project_id + ' ' + p.name" :value="p.project_id"/></el-select></el-form-item>
              <el-form-item label="处理方式"><el-select v-model="surplus.action"><el-option label="转入下一年" value="转入下一年"/><el-option label="上缴学校" value="上缴学校"/></el-select></el-form-item>
              <el-button type="info" @click="confirm('surplus')">确认处理</el-button>
            </el-form>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>`
};
