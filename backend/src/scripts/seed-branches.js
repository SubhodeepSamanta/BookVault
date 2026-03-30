const { Branch } = require('../models')

async function seedBranches() {
  const branchData = [
    {
      name: 'Main Campus Library',
      address: 'Block A, University Road',
      open_time: '08:00:00', close_time: '21:00:00'
    },
    {
      name: 'North Wing Reading Centre',
      address: 'Block C, North Campus',
      open_time: '09:00:00', close_time: '19:00:00'
    },
    {
      name: 'South Block Library',
      address: 'Block F, South Campus',
      open_time: '10:00:00', close_time: '18:00:00'
    },
  ]
  
  try {
    for (const b of branchData) {
      await Branch.findOrCreate({ where: { name: b.name }, defaults: b });
    }
    console.log('Branches seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed branches:', err);
    process.exit(1);
  }
}

seedBranches()
