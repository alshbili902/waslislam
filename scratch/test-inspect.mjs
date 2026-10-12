import fs from 'fs';

async function test() {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  const fixed = html.match(/class="[^"]*fixed[^"]*"/g);
  const sticky = html.match(/class="[^"]*sticky[^"]*"/g);
  console.log('Fixed count:', fixed?.length, fixed);
  console.log('Sticky count:', sticky?.length, sticky);
}

test().catch(console.error);
