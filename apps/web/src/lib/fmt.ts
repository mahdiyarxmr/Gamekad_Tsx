export const toman = (n: number) => (n || 0).toLocaleString('fa-IR') + ' تومان';
export const faDate = (d: string | Date) =>
  new Date(d).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Tehran' });
export const faDay = (d: string | Date) =>
  new Date(d).toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Tehran' });
export const audienceFa = (a: string) => (a === 'boys' ? 'پسران' : a === 'girls' ? 'دختران' : 'مختلط');
export const statusFa = (s: string) =>
  ({ open: 'باز', full: 'تکمیل', cancelled: 'لغو', completed: 'تمام', draft: 'پیش‌نویس', ongoing: 'در جریان' }[s] || s);
