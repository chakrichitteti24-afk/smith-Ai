const dns = require('dns');

async function testFetch() {
  console.log('Testing default order...');
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/');
    console.log('Default Fetch Success, Status:', res.status);
  } catch (err) {
    console.error('Default Fetch Failed:', err.message);
  }

  console.log('Setting IPv4 first...');
  dns.setDefaultResultOrder('ipv4first');

  try {
    const res = await fetch('https://generativelanguage.googleapis.com/');
    console.log('IPv4 First Fetch Success, Status:', res.status);
  } catch (err) {
    console.error('IPv4 First Fetch Failed:', err.message);
  }
}

testFetch();
