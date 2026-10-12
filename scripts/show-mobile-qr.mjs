import QRCode from 'qrcode';

const url = 'http://192.168.8.14:3000';

console.log('========================================================');
console.log('🔗 رابط الدخول من الهاتف (على نفس شبكة الـ Wi-Fi):');
console.log(`👉 ${url}`);
console.log('========================================================\n');

QRCode.toString(url, { type: 'terminal', small: true }, (err, qr) => {
  if (!err) {
    console.log(qr);
  }
});
