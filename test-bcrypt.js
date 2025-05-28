const bcrypt = require('bcrypt');

async function createHash() {
  try {
    const plainPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    console.log('New hash for admin123:', hashedPassword);
    
    // Test the new hash
    const compareResult = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Verification test:', compareResult);
  } catch (err) {
    console.error('Error:', err);
  }
}

createHash(); 