/** 项目申报 — 5 步向导 */
const DeclarePage = {
    data() {
        return {
            step: 0,
            // Step 1: 通知
            noticeForm: { title: '', content: '' },
            noticeRules: { title: [{ required: true, message: '请输入标题', trigger: 'blur' }], content: [{ required: true, message: '请输入内容', trigger: 'blur' }] },
            // Step 2: 申报
            applyForm: { project_id: '', name: '', type: '纵向', level: '省部级', leader_id: '', start_date: '', end_date: '', budget_total: 0, budgets: [] },
            applyRules: {
                project_id: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
                name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
                leader_id: [{ required: true, message: '请输入负责人工号', trigger: 'blur' }],
                start_date: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
                end_date: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
            },
            // Step 3: 审查
            reviewPid: '', reviewResult: '通过',
            // Step 4: 专家
            expertPid: '', expertIds: '',
            reviewForm: { project_id: '', result: '通过', score: 80, comment: '' },
            // Step 5: 立项
            approvePid: '',
            // 通用
            submitting: false,
            $refs: {}
        };
    },
    methods: {
        async doPublishNotice(formEl) {
            if (!formEl) return;
            try { await formEl.validate(); } catch { return; }
            this.submitting = true;
            try {
                await api.post('/notices', this.noticeForm);
                ElMessage.success('通知发布成功');
                this.noticeForm = { title: '', content: '' };
                formEl.resetFields();
            } finally { this.submitting = false; }
        },
        addBudgetItem() { this.applyForm.budgets.push({ category: '', amount: 0 }); },
        removeBudgetItem(i) { this.applyForm.budgets.splice(i, 1); },
        async doApply(formEl) {
            if (!formEl) return;
            try { await formEl.validate(); } catch { return; }
            this.submitting = true;
            try {
                const data = { ...this.applyForm, budgets: this.applyForm.budgets.filter(b => b.category) };
                await api.post('/projects', data);
                ElMessage.success('项目申报成功');
            } finally { this.submitting = false; }
        },
        async doFormReview() {
            if (!this.reviewPid) { ElMessage.warning('请输入项目编号'); return; }
            this.submitting = true;
            try { await api.put(`/projects/${this.reviewPid}/form_review`, { result: this.reviewResult }); ElMessage.success('审查完成'); }
            finally { this.submitting = false; }
        },
        async doAssign() {
            if (!this.expertPid || !this.expertIds) { ElMessage.warning('请输入项目编号和专家工号'); return; }
            const ids = this.expertIds.split(/[,，]/).map(s => s.trim()).filter(Boolean);
            if (!ids.length) { ElMessage.warning('专家工号格式错误'); return; }
            this.submitting = true;
            try { await api.post(`/projects/${this.expertPid}/assign_experts`, { expert_ids: ids }); ElMessage.success('专家已分配'); }
            finally { this.submitting = false; }
        },
        async doSubmitReview() {
            if (!this.reviewForm.project_id) { ElMessage.warning('请输入项目编号'); return; }
            this.submitting = true;
            try { await api.post('/reviews', { ...this.reviewForm, expert_id: 'R1001' }); ElMessage.success('评审提交成功'); }
            finally { this.submitting = false; }
        },
        async doApprove() {
            if (!this.approvePid) { ElMessage.warning('请输入项目编号'); return; }
            try {
                await ElMessageBox.confirm(`确认立项项目 ${this.approvePid}？`, '确认操作', { type: 'warning', confirmButtonText: '确认立项' });
            } catch { return; }
            this.submitting = true;
            try { await api.put(`/projects/${this.approvePid}/approve`); ElMessage.success('立项成功'); }
            finally { this.submitting = false; }
        }
    },
    template: `
    <div>
      <div class="page-header"><h4>📝 项目申报管理</h4><p>发布通知 → 在线申报 → 形式审查 → 专家评审 → 立项审批</p></div>

      <el-steps :active="step" finish-status="success" align-center class="mb-3">
        <el-step title="发布通知" description="发布申报通知"></el-step>
        <el-step title="在线申报" description="填报项目申报书"></el-step>
        <el-step title="形式审查" description="材料完整性审查"></el-step>
        <el-step title="专家评审" description="分配专家 + 评审"></el-step>
        <el-step title="立项审批" description="通过并立项"></el-step>
      </el-steps>

      <el-card>
        <!-- Step 0: 发布通知 -->
        <div v-show="step === 0" class="step-content">
          <el-form :model="noticeForm" :rules="noticeRules" ref="noticeRef" label-width="80px" style="max-width:500px">
            <el-form-item label="通知标题" prop="title"><el-input v-model="noticeForm.title" placeholder="如：2025年度国家自然科学基金申报通知"></el-input></el-form-item>
            <el-form-item label="通知内容" prop="content"><el-input v-model="noticeForm.content" type="textarea" :rows="4" placeholder="填写通知正文..."></el-input></el-form-item>
          </el-form>
          <div class="step-actions">
            <el-button @click="step=1">下一步 →</el-button>
            <el-button type="primary" :loading="submitting" @click="doPublishNotice($refs.noticeRef)">发布通知</el-button>
          </div>
        </div>

        <!-- Step 1: 在线申报 -->
        <div v-show="step === 1" class="step-content">
          <el-form :model="applyForm" :rules="applyRules" ref="applyRef" label-width="110px">
            <el-row :gutter="20">
              <el-col :span="8"><el-form-item label="项目编号" prop="project_id"><el-input v-model="applyForm.project_id" placeholder="如 P2026001"></el-input></el-form-item></el-col>
              <el-col :span="16"><el-form-item label="项目名称" prop="name"><el-input v-model="applyForm.name" placeholder="项目名称"></el-input></el-form-item></el-col>
              <el-col :span="8">
                <el-form-item label="项目类型"><el-select v-model="applyForm.type"><el-option label="纵向" value="纵向"></el-option><el-option label="横向" value="横向"></el-option></el-select></el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="级别"><el-select v-model="applyForm.level"><el-option label="国家级" value="国家级"></el-option><el-option label="省部级" value="省部级"></el-option><el-option label="市厅级" value="市厅级"></el-option><el-option label="横向" value="横向"></el-option></el-select></el-form-item>
              </el-col>
              <el-col :span="8"><el-form-item label="负责人工号" prop="leader_id"><el-input v-model="applyForm.leader_id" placeholder="如 R0001"></el-input></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="开始日期" prop="start_date"><el-date-picker v-model="applyForm.start_date" type="date" placeholder="选择日期" style="width:100%" value-format="YYYY-MM-DD"></el-date-picker></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="结束日期" prop="end_date"><el-date-picker v-model="applyForm.end_date" type="date" placeholder="选择日期" style="width:100%" value-format="YYYY-MM-DD"></el-date-picker></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="总预算(万元)"><el-input-number v-model="applyForm.budget_total" :min="0" :precision="2" style="width:100%"></el-input-number></el-form-item></el-col>
            </el-row>
            <el-divider>预算科目</el-divider>
            <div v-for="(b, i) in applyForm.budgets" :key="i" class="d-flex gap-2 mb-2 align-center">
              <el-input v-model="b.category" placeholder="科目名称" size="small" style="width:150px"></el-input>
              <el-input-number v-model="b.amount" placeholder="金额" :min="0" :precision="2" size="small" style="width:120px"></el-input-number>
              <span class="text-muted">万元</span>
              <el-button size="small" type="danger" :icon="null" circle @click="removeBudgetItem(i)">✕</el-button>
            </div>
            <el-button size="small" @click="addBudgetItem">+ 添加预算科目</el-button>
          </el-form>
          <div class="step-actions">
            <el-button @click="step=0">← 上一步</el-button>
            <el-button type="success" :loading="submitting" @click="doApply($refs.applyRef)">提交申报</el-button>
            <el-button @click="step=2">下一步 →</el-button>
          </div>
        </div>

        <!-- Step 2: 形式审查 -->
        <div v-show="step === 2" class="step-content">
          <el-form label-width="100px" style="max-width:500px">
            <el-form-item label="项目编号"><el-input v-model="reviewPid" placeholder="如 P2026001"></el-input></el-form-item>
            <el-form-item label="审查结果">
              <el-radio-group v-model="reviewResult"><el-radio value="通过">通过 → 进入专家评审</el-radio><el-radio value="不通过">不通过 → 退回申报中</el-radio></el-radio-group>
            </el-form-item>
          </el-form>
          <div class="step-actions">
            <el-button @click="step=1">← 上一步</el-button>
            <el-button type="primary" :loading="submitting" @click="doFormReview">{{ reviewResult === '通过' ? '审查通过' : '退回修改' }}</el-button>
            <el-button @click="step=3">下一步 →</el-button>
          </div>
        </div>

        <!-- Step 3: 专家评审 -->
        <div v-show="step === 3" class="step-content">
          <el-tabs type="border-card">
            <el-tab-pane label="分配专家">
              <el-form label-width="140px" style="max-width:500px">
                <el-form-item label="项目编号"><el-input v-model="expertPid" placeholder="请输入项目编号"></el-input></el-form-item>
                <el-form-item label="专家工号"><el-input v-model="expertIds" placeholder="多个用逗号分隔，如 R1001,R1002"></el-input></el-form-item>
              </el-form>
              <el-button type="primary" :loading="submitting" @click="doAssign">确认分配</el-button>
            </el-tab-pane>
            <el-tab-pane label="提交评审意见">
              <el-form :model="reviewForm" label-width="100px" style="max-width:500px">
                <el-form-item label="项目编号"><el-input v-model="reviewForm.project_id"></el-input></el-form-item>
                <el-form-item label="评审结果"><el-select v-model="reviewForm.result"><el-option label="通过" value="通过"></el-option><el-option label="不通过" value="不通过"></el-option></el-select></el-form-item>
                <el-form-item label="打分"><el-rate v-model="reviewForm.score" :max="100" show-score allow-half style="display:inline-flex"></el-rate></el-form-item>
                <el-form-item label="评审意见"><el-input v-model="reviewForm.comment" type="textarea" :rows="3"></el-input></el-form-item>
              </el-form>
              <el-button type="info" :loading="submitting" @click="doSubmitReview">提交评审</el-button>
            </el-tab-pane>
          </el-tabs>
          <div class="step-actions">
            <el-button @click="step=2">← 上一步</el-button>
            <el-button @click="step=4">下一步 →</el-button>
          </div>
        </div>

        <!-- Step 4: 立项审批 -->
        <div v-show="step === 4" class="step-content">
          <el-result icon="success" title="专家评审完成后进入立项阶段" sub-title="确认项目信息无误后，执行立项操作">
            <template #extra>
              <el-form label-width="100px" style="max-width:400px;margin:0 auto">
                <el-form-item label="项目编号"><el-input v-model="approvePid" placeholder="请输入待立项的项目编号"></el-input></el-form-item>
              </el-form>
              <el-button @click="step=3">← 上一步</el-button>
              <el-button type="success" :loading="submitting" @click="doApprove" size="large">✅ 通过并立项</el-button>
            </template>
          </el-result>
        </div>
      </el-card>
    </div>`,
    mounted() { this.$nextTick(() => { this.$refs.noticeRef = this.$refs.noticeRef; }); }
};
