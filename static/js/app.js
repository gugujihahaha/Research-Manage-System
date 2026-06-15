/** Vue 3 主应用 — 登录 + 角色路由 */
const { createApp, ref, computed } = Vue;

const App = {
    setup() {
        const user = ref(JSON.parse(sessionStorage.getItem('user') || 'null'));
        const currentTab = ref('');
        const loginForm = ref({ researcher_id: '', password: '' });
        const loginRules = {
            researcher_id: [{ required: true, message: '请输入工号', trigger: 'blur' }],
            password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
        };
        const registerForm = ref({ researcher_id: '', name: '', password: '', password2: '', college_id: '', title: '讲师', role: '科研人员', phone: '', email: '' });
        const validatePass2 = (rule, value, callback) => {
            if (value !== registerForm.value.password) callback(new Error('两次密码不一致'));
            else callback();
        };
        const registerRules = {
            researcher_id: [{ required: true, message: '请输入工号' }, { min: 3, message: '至少3位', trigger: 'blur' }],
            name: [{ required: true, message: '请输入姓名' }],
            password: [{ required: true, message: '请输入密码' }, { min: 4, message: '至少4位', trigger: 'blur' }],
            password2: [{ required: true, message: '请确认密码' }, { validator: validatePass2, trigger: 'blur' }],
            college_id: [{ required: true, message: '请选择学院' }]
        };
        const loginFormRef = ref(null);
        const registerFormRef = ref(null);
        const loggingIn = ref(false);
        const isRegister = ref(false);
        const colleges = ref([]);
        const loginMsg = ref('');
        const regMsg = ref('');

        // 角色对应的导航标签
        const roleNavMap = {
            '科研人员': [
                { key: 'dashboard', label: '工作台' },
                { key: 'todo', label: '待办' },
                { key: 'my-declare', label: '项目申报' },
                { key: 'my-projects', label: '我的项目' },
                { key: 'my-acceptance', label: '项目验收' },
                { key: 'my-achievement', label: '成果管理' },
                { key: 'my-funding', label: '经费管理' }
            ],
            '科研处': [
                { key: 'dashboard', label: '工作台' },
                { key: 'todo', label: '待办' },
                { key: 'notices-manage', label: '通知管理' },
                { key: 'review-manage', label: '项目审核' },
                { key: 'acceptance-manage', label: '验收管理' },
                { key: 'stats', label: '统计报表' },
                { key: 'admin', label: '全部项目' }
            ],
            '专家': [
                { key: 'dashboard', label: '工作台' },
                { key: 'todo', label: '待办' },
                { key: 'expert-review', label: '项目评审' },
                { key: 'admin', label: '全部项目' }
            ],
            '财务处': [
                { key: 'dashboard', label: '工作台' },
                { key: 'todo', label: '待办' },
                { key: 'funding-manage', label: '经费管理' },
                { key: 'stats', label: '统计报表' }
            ]
        };

        const navTabs = computed(() => roleNavMap[user.value?.role] || []);

        // 登录
        async function doLogin() {
            loginMsg.value = '';
            const fm = loginForm.value;
            if (!fm.researcher_id || !fm.password) { loginMsg.value = '请输入工号和密码'; return; }
            loggingIn.value = true;
            try {
                const res = await api.post('/login', loginForm.value);
                if (res.code === 200) {
                    user.value = res.data;
                    sessionStorage.setItem('user', JSON.stringify(res.data));
                    currentTab.value = (roleNavMap[res.data.role] || [])[0]?.key || '';
                } else {
                    loginMsg.value = res.message || '登录失败';
                }
            } catch (e) {
                loginMsg.value = e?.response?.data?.message || '登录失败';
            }
            loggingIn.value = false;
        }

        const doRegister = async () => {
            regMsg.value = '';
            const fm = registerForm.value;
            if (!fm.researcher_id || !fm.name || !fm.password || !fm.college_id) {
                regMsg.value = '请填写工号、姓名、密码和学院';
                return;
            }
            if (fm.password !== fm.password2) {
                regMsg.value = '两次密码不一致';
                return;
            }
            if (fm.password.length < 4) {
                regMsg.value = '密码至少4位';
                return;
            }
            loggingIn.value = true;
            try {
                const { password2, ...data } = fm;
                const res = await api.post('/register', data);
                if (res && res.code === 200) {
                    regMsg.value = '注册成功，即将切换到登录页...';
                    registerForm.value = { researcher_id: '', name: '', password: '', password2: '', college_id: '', title: '讲师', role: '科研人员', phone: '', email: '' };
                    setTimeout(() => {
                        isRegister.value = false;
                        loginForm.value = { researcher_id: fm.researcher_id, password: '' };
                        regMsg.value = '';
                    }, 1000);
                } else {
                    regMsg.value = res?.message || '注册失败';
                }
            } catch (e) {
                regMsg.value = e?.response?.data?.message || '网络错误';
            }
            loggingIn.value = false;
        };

        async function loadColleges() {
            try { const r = await api.get('/colleges'); if (r.code === 200 && r.data) colleges.value = r.data; } catch {}
        }

        // 退出
        async function doLogout() {
            await api.post('/logout');
            user.value = null;
            currentTab.value = '';
            sessionStorage.removeItem('user');
        }

        function switchTab(key) { currentTab.value = key; }

        const todoCounts = ref({});
        const todoTotal = computed(() => todoCounts.value?.total || 0);

        async function refreshTodo() {
            if (!user.value) return;
            try { const r = await api.get('/todo'); if (r && r.code === 200) todoCounts.value = r.data; } catch {}
        }
        if (user.value) { refreshTodo(); setInterval(refreshTodo, 30000); }

        // 初始化：登录后默认第一个 tab
        if (user.value) {
            currentTab.value = navTabs.value[0]?.key || '';
        }

        // 页面组件映射
        const pageMap = {
            'todo': 'TodoPage',
            'dashboard': 'DashboardPage',
            'my-declare': 'ResearcherDeclarePage',
            'my-projects': 'MyProjectsPage',
            'my-acceptance': 'MyAcceptancePage',
            'my-achievement': 'AchievementPage',
            'my-funding': 'ResearcherFundingPage',
            'notices-manage': 'NoticesManagePage',
            'review-manage': 'ReviewManagePage',
            'acceptance-manage': 'AcceptanceManagePage',
            'stats': 'StatsPage',
            'admin': 'AdminPage',
            'expert-review': 'ExpertReviewPage',
            'funding-manage': 'FundingManagePage'
        };
        const currentComponent = computed(() => pageMap[currentTab.value] || 'DashboardPage');

        return { user, loginForm, loginRules, loginFormRef, registerForm, registerRules, registerFormRef, loggingIn, isRegister, colleges, loginMsg, regMsg, doLogin, doRegister, loadColleges, doLogout, switchTab, navTabs, currentTab, currentComponent, todoCounts, todoTotal, refreshTodo };
    }
};

const app = createApp(App);
app.use(ElementPlus);
// 注册所有组件
const components = { TodoPage, DashboardPage, ResearcherDeclarePage, MyProjectsPage, MyAcceptancePage, AchievementPage, ResearcherFundingPage, NoticesManagePage, ReviewManagePage, AcceptanceManagePage, StatsPage, AdminPage, ExpertReviewPage, FundingManagePage };
Object.entries(components).forEach(([k, v]) => { if (v) app.component(k, v); });
app.mount('#app');
