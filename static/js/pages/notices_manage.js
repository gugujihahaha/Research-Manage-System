/** 科研处 — 通知管理 + 形式审查 */
const NoticesManagePage = {
    data() { return { submitting: false, msg: '', noticeForm: { title: '', content: '' }, notices: [], reviewPid: '' }; },
    mounted() { this.load(); },
    methods: {
        async load() { const r = await api.get('/notices'); if (r.code === 200) this.notices = r.data; },
        async publish() {
            if (!this.noticeForm.title) { this.msg = '请输入标题'; return; }
            this.submitting = true; this.msg = '';
            try {
                await api.post('/notices', this.noticeForm);
                this.msg = '通知已发布'; this.noticeForm = { title: '', content: '' }; this.load();
                setTimeout(() => { this.msg = ''; }, 3000);
            } catch (e) { this.msg = e?.response?.data?.message || '发布失败'; }
            finally { this.submitting = false; }
        },
        async doReview(result) {
            if (!this.reviewPid) { this.msg = '请输入项目编号'; return; }
            this.submitting = true; this.msg = '';
            try {
                const res = await api.put(`/projects/${this.reviewPid}/form_review`, { result });
                this.msg = res?.message || '审查完成';
                setTimeout(() => { this.msg = ''; }, 3000);
            } catch (e) { this.msg = e?.response?.data?.message || '操作失败'; }
            finally { this.submitting = false; }
        }
    },
    template: `
    <div>
      <div class="page-head"><h2>通知与审查</h2><p class="desc">发布申报通知，对项目进行形式审查</p></div>
      <div v-if="msg" :style="'padding:10px 16px;border-radius:8px;margin-bottom:12px;font-size:13px;' + (msg.includes('失败') ? 'color:#dc2626;background:#fef2f2' : 'color:#16a34a;background:#f0fdf4')">{{ msg }}</div>
      <el-row :gutter="20">
        <el-col :span="14"><el-card><template #header>发布通知</template><el-form :model="noticeForm" label-width="60px" size="small"><el-form-item label="标题"><el-input v-model="noticeForm.title"/></el-form-item><el-form-item label="内容"><el-input v-model="noticeForm.content" type="textarea" :rows="4"/></el-form-item><el-button type="primary" :loading="submitting" @click="publish">发布</el-button></el-form></el-card>
          <el-card class="mt-3"><template #header>已发布通知</template><el-timeline v-if="notices.length"><el-timeline-item v-for="n in notices" :key="n.notice_id" :timestamp="n.publish_date" color="#4f6ef7"><strong>{{ n.title }}</strong><p class="text-muted mb-0">{{ n.content }}</p></el-timeline-item></el-timeline><el-empty v-else description="暂无通知" :image-size="60"/></el-card>
        </el-col>
        <el-col :span="10"><el-card><template #header>形式审查</template><el-form label-width="80px" size="small"><el-form-item label="项目编号"><el-input v-model="reviewPid" placeholder="待审查的项目编号"/></el-form-item><div class="d-flex gap-2"><el-button type="primary" :loading="submitting" @click="doReview('通过')">审查通过</el-button><el-button type="danger" :loading="submitting" @click="doReview('不通过')">退回修改</el-button></div></el-form></el-card></el-col>
      </el-row>
    </div>`
};
