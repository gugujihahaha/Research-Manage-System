/** 专家 — 项目评审 */
const ExpertReviewPage = {
    props: ['user'],
    data() {
        return {
            tasks: [], loading: false, msg: '',
            reviewForm: { project_id: '', result: '通过', score: 80, comment: '', expert_id: this.user?.researcher_id || '' },
            submitting: false
        };
    },
    mounted() { this.loadTasks(); },
    methods: {
        async loadTasks() {
            this.loading = true;
            try { const r = await api.get('/expert/tasks'); if (r.code === 200) this.tasks = r.data; }
            finally { this.loading = false; }
        },
        selectTask(t) {
            this.reviewForm.project_id = t.project_id;
            this.msg = '';
        },
        async doSubmit() {
            if (!this.reviewForm.project_id) return;
            if (!this.reviewForm.comment) { this.msg = '请填写评审意见'; return; }
            this.submitting = true; this.msg = '';
            const formData = { ...this.reviewForm };
            try {
                const res = await api.post('/reviews', formData);
                this.msg = res?.message || '评审已提交';
                setTimeout(() => { this.msg = ''; }, 3000);
                this.reviewForm = { project_id: '', result: '通过', score: 80, comment: '', expert_id: this.user?.researcher_id || '' };
                this.loadTasks();
            } catch (e) {
                this.msg = e?.response?.data?.message || '提交失败，请重试';
            }
            finally { this.submitting = false; }
        },
        async doWithdraw(pid) {
            this.submitting = true; this.msg = '';
            try {
                const res = await api.delete(`/reviews/${pid}/${this.user.researcher_id}`);
                this.msg = res?.message || '评审已撤回';
                setTimeout(() => { this.msg = ''; }, 3000);
                this.loadTasks();
            } catch (e) {
                this.msg = e?.response?.data?.message || '撤回失败';
            }
            finally { this.submitting = false; }
        }
    },
    template: `
    <div>
      <div class="page-head d-flex justify-between align-center">
        <div><h2>项目评审</h2><p class="desc">对分配给我的项目进行评审打分</p></div>
        <el-badge :value="tasks.length" :hidden="!tasks.length" style="font-size:13px">
          <el-tag type="warning" effect="plain" round>待评审</el-tag>
        </el-badge>
      </div>
      <div v-if="msg" :style="'padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;' + (msg.includes('失败') ? 'color:#dc2626;background:#fef2f2' : 'color:#16a34a;background:#f0fdf4')">{{ msg }}</div>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-card>
            <template #header>待评审项目<span v-if="tasks.length" style="color:#f97316;margin-left:8px;font-size:12px">({{ tasks.length }})</span></template>
            <div v-if="tasks.length" v-loading="loading">
              <div v-for="t in tasks" :key="t.review_id" @click="selectTask(t)"
                :style="'padding:14px;margin-bottom:8px;border-radius:8px;cursor:pointer;border:1px solid ' + (reviewForm.project_id === t.project_id ? '#4f6ef7' : '#e5e7eb') + ';background:' + (reviewForm.project_id === t.project_id ? '#f8fafc' : '#fff')">
                <div style="font-weight:500;font-size:14px;margin-bottom:4px">{{ t.project_name }}</div>
                <div class="text-muted">{{ t.project_id }} · {{ t.type }} · {{ t.level }}</div>
                <div class="text-muted">分配日期：{{ t.review_date }}</div>
              </div>
            </div>
            <el-empty v-else description="暂无待评审项目" :image-size="60"/>
          </el-card>
        </el-col>
        <el-col :span="14">
          <el-card>
            <template #header>{{ reviewForm.project_id ? '评审：' + reviewForm.project_id : '请从左侧选择项目' }}</template>
            <el-form :model="reviewForm" label-width="100px" v-if="reviewForm.project_id">
              <el-form-item label="项目编号"><el-input v-model="reviewForm.project_id" disabled/></el-form-item>
              <el-form-item label="评审结果" required>
                <el-radio-group v-model="reviewForm.result"><el-radio-button value="通过">通过</el-radio-button><el-radio-button value="不通过">不通过</el-radio-button></el-radio-group>
              </el-form-item>
              <el-form-item label="评分">
                <div class="d-flex align-center gap-3">
                  <el-slider v-model="reviewForm.score" :min="0" :max="100" show-input style="flex:1"/>
                </div>
              </el-form-item>
              <el-form-item label="评审意见" required>
                <el-input v-model="reviewForm.comment" type="textarea" :rows="5" placeholder="请详细填写评审意见，包括创新性、可行性、预算合理性等..."/>
              </el-form-item>
              <el-button type="primary" :loading="submitting" @click="doSubmit" size="large">提交评审意见</el-button>
            </el-form>
            <el-empty v-else description="点击左侧项目开始评审" :image-size="60"/>
          </el-card>
        </el-col>
      </el-row>
    </div>`
};
