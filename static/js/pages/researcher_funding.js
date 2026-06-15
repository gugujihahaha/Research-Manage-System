/** 科研人员 — 经费报销 */
const ResearcherFundingPage = {
    props: ['user'],
    data() {
        return {
            submitting: false, msg: '', budgets: [], projectOptions: [],
            expense: { project_id: '', budget_id: '', amount: 0, exp_date: '', purpose: '', operator_id: this.user?.researcher_id || '' }
        };
    },
    mounted() { this.loadProjects(); },
    methods: {
        async loadProjects() { try { const r = await api.get('/projects'); if (r.code === 200) this.projectOptions = r.data; } catch {} },
        async loadBudgets() {
            if (!this.expense.project_id) return;
            try { const r = await api.get(`/budgets/${this.expense.project_id}`); if (r.code === 200) this.budgets = r.data; } catch { this.budgets = []; }
        },
        async submitExpense() {
            if (!this.expense.project_id || !this.expense.amount) { this.msg = '请填写项目编号和金额'; return; }
            this.submitting = true; this.msg = '';
            try { const res = await api.post('/funding/expenditure', this.expense); this.msg = res?.message || '报销已提交'; setTimeout(() => this.msg = '', 3000); }
            catch (e) { this.msg = e?.response?.data?.message || '提交失败'; }
            finally { this.submitting = false; }
        }
    },
    template: `
    <div>
      <div class="page-head"><h2>经费管理</h2><p class="desc">提交支出报销申请</p></div>
      <div v-if="msg" :style="'padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;' + (msg.includes('失败') ? 'color:#dc2626;background:#fef2f2' : 'color:#16a34a;background:#f0fdf4')">{{ msg }}</div>
      <el-card style="max-width:560px"><template #header>支出报销申请</template>
        <el-form :model="expense" label-width="100px">
          <el-form-item label="项目编号"><el-select v-model="expense.project_id" placeholder="选择项目" style="width:100%" filterable @change="loadBudgets"><el-option v-for="p in projectOptions" :key="p.project_id" :label="p.project_id + ' ' + p.name" :value="p.project_id"/></el-select></el-form-item>
          <el-form-item label="预算科目">
            <el-select v-model="expense.budget_id" placeholder="选择预算科目" style="width:100%" @focus="loadBudgets">
              <el-option v-for="b in budgets" :key="b.budget_id" :label="b.category + ' (剩余: ' + (b.amount - b.spent) + '万)'" :value="b.budget_id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="金额(万元)"><el-input-number v-model="expense.amount" :min="0" :precision="2" style="width:100%"/></el-form-item>
          <el-form-item label="日期"><el-date-picker v-model="expense.exp_date" type="date" value-format="YYYY-MM-DD" style="width:100%"/></el-form-item>
          <el-form-item label="用途"><el-input v-model="expense.purpose" type="textarea" :rows="3"/></el-form-item>
          <el-button type="warning" :loading="submitting" @click="submitExpense">提交报销</el-button>
        </el-form>
      </el-card>
    </div>`
};
