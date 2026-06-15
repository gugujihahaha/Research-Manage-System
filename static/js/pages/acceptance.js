/** 项目验收管理 */
const AcceptancePage = {
    data() {
        return {
            submitting: false,
            apply: { project_id: '', material_url: '' },
            review: { project_id: '', result: '通过', comment: '' },
            cert: { project_id: '', certificate_url: '' }
        };
    },
    methods: {
        async applyAcceptance() {
            if (!this.apply.project_id) { ElMessage.warning('请输入项目编号'); return; }
            this.submitting = true;
            try { await api.post('/acceptance/apply', this.apply); ElMessage.success('验收申请已提交'); }
            finally { this.submitting = false; }
        },
        async doReview() {
            if (!this.review.project_id) { ElMessage.warning('请输入项目编号'); return; }
            try { await ElMessageBox.confirm(`确认验收评审结果为「${this.review.result}」？`, '确认', { type: 'warning' }); } catch { return; }
            this.submitting = true;
            try { await api.put('/acceptance/review', this.review); ElMessage.success('验收评审完成'); }
            finally { this.submitting = false; }
        },
        async issueCert() {
            if (!this.cert.project_id) { ElMessage.warning('请输入项目编号'); return; }
            this.submitting = true;
            try { await api.post('/acceptance/certificate', this.cert); ElMessage.success('结题证书已发放'); }
            finally { this.submitting = false; }
        }
    },
    template: `
    <div>
      <div class="page-header"><h4>✅ 项目验收管理</h4><p>提交验收申请 → 评审 → 发放结题证书</p></div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card><template #header>📋 第一步：验收申请</template>
            <el-form :model="apply" label-width="110px" size="small">
              <el-form-item label="项目编号" required><el-input v-model="apply.project_id"></el-input></el-form-item>
              <el-form-item label="结题材料路径"><el-input v-model="apply.material_url" placeholder="上传文件后填入路径"></el-input></el-form-item>
              <el-button type="primary" :loading="submitting" @click="applyAcceptance">提交申请</el-button>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card><template #header>🔍 第二步：验收评审</template>
            <el-form :model="review" label-width="80px" size="small">
              <el-form-item label="项目编号" required><el-input v-model="review.project_id"></el-input></el-form-item>
              <el-form-item label="评审结果"><el-radio-group v-model="review.result"><el-radio value="通过">通过</el-radio><el-radio value="不通过">不通过</el-radio></el-radio-group></el-form-item>
              <el-form-item label="评语"><el-input v-model="review.comment" type="textarea" :rows="2"></el-input></el-form-item>
              <el-button type="warning" :loading="submitting" @click="doReview">提交评审</el-button>
            </el-form>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card><template #header>📜 第三步：发放证书</template>
            <el-form :model="cert" label-width="80px" size="small">
              <el-form-item label="项目编号" required><el-input v-model="cert.project_id"></el-input></el-form-item>
              <el-form-item label="证书链接"><el-input v-model="cert.certificate_url"></el-input></el-form-item>
              <el-button type="success" :loading="submitting" @click="issueCert">发放证书</el-button>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>`
};
