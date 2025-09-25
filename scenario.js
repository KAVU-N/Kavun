import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1000,            // Aynı anda 100 sanal kullanıcı
  duration: '2m',      // 5 dakika boyunca test
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95. persentil 800 ms altında olsun
    http_req_failed: ['rate<0.01'],   // Hata oranı %1'in altında olsun
  },
};

const pages = ['/', '/ilanlar', '/kaynaklar', '/projeler'];

export default function () {
  const path = pages[Math.floor(Math.random() * pages.length)];
  http.get(`https://kavunla.com${path}`);
  sleep(Math.random() * 3 + 1); // 5-8 sn arası bekleme
}