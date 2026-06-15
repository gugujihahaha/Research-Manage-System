/** API 请求封装 */
const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    timeout: 15000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
    res => res.data,
    err => {
        if (err.response?.status === 401) {
            sessionStorage.removeItem('user');
            window.location.reload();
        }
        const msg = err.response?.data?.message || err.message || '网络错误';
        ElMessage.error(msg);
        return Promise.reject(err);
    }
);

/** 文件上传 */
const uploadFile = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await axios.post('http://127.0.0.1:5000/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
    });
    return res.data;
};
