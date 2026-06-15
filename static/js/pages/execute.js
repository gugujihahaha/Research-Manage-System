/** 项目执行管理 */
const ExecutePage = {
    data() {
        return {
            activeTab: 'contract',
            submitting: false,
            // 合同
            contract: { project_id: '', file_url: '', sign_date: '', content: '' },
            // 预算
            budgetPid: '', budgetData: [], budgetSummary: null, budgetLoading: false,
            // 进展报告
            report: { project_id: '', year: new Date().getFullYear().toString(), content: '' },
            // 变更
            change: { project_id: '', type: '预算调整', old_value: '', new_value: '', reason: '' }
        };
    },
    methods: {
        async uploadContract() {
            if (!this.contract.project_id) { ElMessage.warning('请输入项目编号'); return; }
            this.submitting = true;
            try { await api.post('/contracts', this.contract); ElMessage.success('合同上传成功'); }
            finally { this.submitting = false; }
        },
        async showBudgetExec() {
            if (!this.budgetPid) { ElMessage.warning('请输入项目编号'); return; }
            this.budgetLoading = true;
            try {
                const res = await api.get(`/funding/status/${this.budgetPid}`);
                if (res.code === 200) { this.budgetSummary = res.data.summary; this.budgetData = res.data.details; }
            } finally { this.budgetLoading = false; }
        },
        async submitProgress() {
            if (!this.report.project_id || !this.report.content) { ElMessage.warning('请填写必填项'); return; }
            this.submitting = true;
            try { await api.post('/progress_reports', this.report); ElMessage.success('进展报告已提交'); }
            finally { this.submitting = false; }
        },
        async submitChange() {
            if (!this.change.project_id || !this.change.reason) { ElMessage.warning('请填写必填项'); return; }
            try { await ElMessageBox.confirm('确认提交此变更申请？', '确认', { type: 'warning' }); } catch { return; }
            this.submitting = true;
            try { await api.post('/change_requests', this.change); ElMessage.success('变更申请已提交'); }
            finally { this.submitting = false; }
        }
    },
    template: `
    <div>
      <div class="page-header"><h4>📋 项目执行管理</h4><p>合同上传、预算监控、进展报告、变更申请</p></div>
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 合同 -->
        <el-tab-pane label="📄 合同/任务书" name="contract">
          <el-form :model="contract" label-width="100px" style="max-width:600px">
            <el-form-item label="项目编号" required><el-input v-model="contract.project_id" placeholder="请输入项目编号"></el-input></el-form-item>
            <el-form-item label="文件路径"><el-input v-model="contract.file_url" placeholder="上传后的文件路径"></el-input></el-form-item>
            <el-form-item label="签署日期"><el-date-picker v-model="contract.sign_date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%"></el-date-picker></el-form-item>
            <el-form-item label="合同内容"><el-input v-model="contract.content" type="textarea" :rows="4" placeholder="合同主要内容描述"></el-input></el-form-item>
            <el-button type="primary" :loading="submitting" @click="uploadContract">上传合同</el-button>
          </el-form>
        </el-tab-pane>
        <!-- 预算 -->
        <el-tab-pane label="💰 预算执行" name="budget">
          <el-form inline>
            <el-form-item label="项目编号"><el-input v-model="budgetPid" placeholder="项目编号"></el-input></el-form-item>
            <el-form-item><el-button type="primary" @click="showBudgetExec" :loading="budgetLoading">查看执行情况</el-button></el-form-item>
          </el-form>
          <div v-if="budgetSummary" v-loading="budgetLoading" class="mt-3">
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="总预算">{{ budgetSummary.total_budget }} 万元</el-descriptions-item>
              <el-descriptions-item label="已支出">{{ budgetSummary.total_spent }} 万元</el-descriptions-item>
              <el-descriptions-item label="执行率">
                <el-progress :percentage="budgetSummary.execute_rate" :color="budgetSummary.execute_rate >= 85 ? (budgetSummary.execute_rate >= 100 ? '#F56C6C' : '#E6A23C') : '#67C23A'" style="width:200px"></el-progress>
              </el-descriptions-item>
            </el-descriptions>
            <el-table :data="budgetData" stripe size="small" class="mt-3">
              <el-table-column prop="category" label="科目"></el-table-column>
              <el-table-column prop="budget" label="预算(万元)"></el-table-column>
              <el-table-column prop="expended" label="已支出(万元)"></el-table-column>
              <el-table-column label="执行率"><template #default="s"><el-progress :percentage="s.row.execute_rate" :stroke-width="8" :show-text="false" style="width:120px"></el-progress> {{ s.row.execute_rate }}%</template></el-table-column>
              <el-table-column label="预警"><template #default="s"><el-tag :type="s.row.execute_rate >= 100 ? 'danger' : (s.row.execute_rate >= 85 ? 'warning' : 'success')" size="small">{{ s.row.execute_rate >= 100 ? '超支' : (s.row.execute_rate >= 85 ? '预警' : '正常') }}</el-tag></template></el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        <!-- 进展报告 -->
        <el-tab-pane label="📅 进展报告" name="report">
          <el-form :model="report" label-width="100px" style="max-width:600px">
            <el-form-item label="项目编号" required><el-input v-model="report.project_id"></el-input></el-form-item>
            <el-form-item label="报告年度" required><el-input v-model="report.year"></el-input></el-form-item>
            <el-form-item label="报告内容" required><el-input v-model="report.content" type="textarea" :rows="5" placeholder="填写年度进展报告内容..."></el-input></el-form-item>
            <el-button type="success" :loading="submitting" @click="submitProgress">提交报告</el-button>
          </el-form>
        </el-tab-pane>
        <!-- 变更申请 -->
        <el-tab-pane label="✏️ 变更申请" name="change">
          <el-form :model="change" label-width="100px" style="max-width:600px">
            <el-form-item label="项目编号" required><el-input v-model="change.project_id"></el-input></el-form-item>
            <el-form-item label="变更类型" required><el-select v-model="change.type"><el-option label="预算调整" value="预算调整"></el-option><el-option label="延期" value="延期"></el-option><el-option label="成员变更" value="成员变更"></el-option></el-select></el-form-item>
            <el-form-item label="原值"><el-input v-model="change.old_value"></el-input></el-form-item>
            <el-form-item label="新值"><el-input v-model="change.new_value"></el-input></el-form-item>
            <el-form-item label="变更理由" required><el-input v-model="change.reason" type="textarea" :rows="3"></el-input></el-form-item>
            <el-button type="warning" :loading="submitting" @click="submitChange">提交申请</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>`
};
