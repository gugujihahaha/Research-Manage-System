/** 经费管理 */
const FundingPage = {
    data() {
        return {
            submitting: false,
            income: { project_id: '', amount: '', exp_date: '', operator_id: 'R2002' },
            expense: { project_id: '', budget_id: '', amount: '', exp_date: '', purpose: '', operator_id: 'R0001' },
            approve: { exp_id: '', result: '通过' },
            monitorPid: '', monitorResult: null, monitorLoading: false,
            surplus: { project_id: '', action: '转入下一年' }
        };
    },
    methods: {
        async registerIncome() {
            if (!this.income.project_id || !this.income.amount) { ElMessage.warning('请填写项目编号和金额'); return; }
            this.submitting = true;
            try { await api.post('/funding/income', this.income); ElMessage.success('到账登记成功，等待财务审批'); }
            finally { this.submitting = false; }
        },
        async registerExpense() {
            if (!this.expense.project_id || !this.expense.amount) { ElMessage.warning('请填写项目编号和金额'); return; }
            this.submitting = true;
            try { await api.post('/funding/expenditure', this.expense); ElMessage.success('报销申请已提交'); }
            finally { this.submitting = false; }
        },
        async approveExpense() {
            if (!this.approve.exp_id) { ElMessage.warning('请输入支出ID'); return; }
            try { await ElMessageBox.confirm(`确认${this.approve.result === '通过' ? '通过' : '驳回'}此报销申请？`, '审批确认', { type: 'warning' }); } catch { return; }
            this.submitting = true;
            try { await api.put('/funding/approve', this.approve); ElMessage.success('审批完成'); }
            finally { this.submitting = false; }
        },
        async showMonitor() {
            if (!this.monitorPid) { ElMessage.warning('请输入项目编号'); return; }
            this.monitorLoading = true;
            try { const res = await api.get(`/funding/status/${this.monitorPid}`); if (res.code === 200) this.monitorResult = res.data; }
            finally { this.monitorLoading = false; }
        },
        async handleSurplus() {
            if (!this.surplus.project_id) { ElMessage.warning('请输入项目编号'); return; }
            try { await ElMessageBox.confirm(`确认将结余经费「${this.surplus.action}」？`, '确认', { type: 'warning' }); } catch { return; }
            this.submitting = true;
            try { await api.post('/funding/surplus', this.surplus); ElMessage.success(`结余经费已${this.surplus.action}`); }
            finally { this.submitting = false; }
        }
    },
    template: `
    <div>
      <div class="page-header"><h4>💰 经费管理</h4><p>到账登记、支出报销、财务审批、执行率监控、结余处理</p></div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card><template #header>💰 经费到账登记</template>
            <el-form :model="income" label-width="100px" size="small">
              <el-form-item label="项目编号" required><el-input v-model="income.project_id"></el-input></el-form-item>
              <el-form-item label="金额(万元)" required><el-input-number v-model="income.amount" :min="0" :precision="2" style="width:100%"></el-input-number></el-form-item>
              <el-form-item label="到账日期"><el-date-picker v-model="income.exp_date" type="date" value-format="YYYY-MM-DD" style="width:100%"></el-date-picker></el-form-item>
              <el-button type="primary" :loading="submitting" @click="registerIncome">登记到账</el-button>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card><template #header>🧾 支出报销申请</template>
            <el-form :model="expense" label-width="100px" size="small">
              <el-form-item label="项目编号" required><el-input v-model="expense.project_id"></el-input></el-form-item>
              <el-form-item label="预算科目ID"><el-input v-model="expense.budget_id" placeholder="关联预算科目"></el-input></el-form-item>
              <el-form-item label="金额" required><el-input-number v-model="expense.amount" :min="0" :precision="2" style="width:100%"></el-input-number></el-form-item>
              <el-form-item label="日期"><el-date-picker v-model="expense.exp_date" type="date" value-format="YYYY-MM-DD" style="width:100%"></el-date-picker></el-form-item>
              <el-form-item label="用途"><el-input v-model="expense.purpose" type="textarea" :rows="2"></el-input></el-form-item>
              <el-button type="warning" :loading="submitting" @click="registerExpense">提交报销</el-button>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="12" class="mt-3">
          <el-card><template #header>✅ 支出报销审批</template>
            <el-form :model="approve" label-width="100px" size="small">
              <el-form-item label="支出ID" required><el-input v-model="approve.exp_id"></el-input></el-form-item>
              <el-form-item label="审批结果"><el-radio-group v-model="approve.result"><el-radio value="通过">通过</el-radio><el-radio value="驳回">驳回</el-radio></el-radio-group></el-form-item>
              <el-button type="info" :loading="submitting" @click="approveExpense">提交审批</el-button>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="12" class="mt-3">
          <el-card><template #header>📊 预算执行率监控</template>
            <el-form inline size="small"><el-form-item><el-input v-model="monitorPid" placeholder="项目编号"></el-input></el-form-item><el-form-item><el-button @click="showMonitor" :loading="monitorLoading">查看</el-button></el-form-item></el-form>
            <div v-if="monitorResult" v-loading="monitorLoading" class="mt-2">
              <el-statistic title="总预算" :value="monitorResult.summary.total_budget" suffix="万元"></el-statistic>
              <el-statistic title="已支出" :value="monitorResult.summary.total_spent" suffix="万元"></el-statistic>
              <el-progress :percentage="monitorResult.summary.execute_rate" :stroke-width="16" class="mt-2" :color="monitorResult.summary.execute_rate >= 85 ? '#E6A23C' : '#67C23A'"></el-progress>
            </div>
          </el-card>
        </el-col>
        <el-col :span="24" class="mt-3">
          <el-card><template #header>💼 结余经费处理</template>
            <el-form :model="surplus" inline size="small">
              <el-form-item label="项目编号" required><el-input v-model="surplus.project_id"></el-input></el-form-item>
              <el-form-item label="处理方式"><el-select v-model="surplus.action"><el-option label="转入下一年" value="转入下一年"></el-option><el-option label="上缴学校" value="上缴学校"></el-option></el-select></el-form-item>
              <el-form-item><el-button type="info" :loading="submitting" @click="handleSurplus">确认处理</el-button></el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>`
};
