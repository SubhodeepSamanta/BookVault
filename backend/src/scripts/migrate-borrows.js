const { sequelize } = require('../config/db')

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected for migration.');

    const tableDescription = await sequelize.getQueryInterface().describeTable('borrows');
    const existingColumns = Object.keys(tableDescription);

    const columnsToAdd = [
      { name: 'pickup_date', query: 'ALTER TABLE borrows ADD COLUMN pickup_date DATE NULL;' },
      { name: 'pickup_time_slot', query: 'ALTER TABLE borrows ADD COLUMN pickup_time_slot VARCHAR(30) NULL;' },
      { name: 'return_date', query: 'ALTER TABLE borrows ADD COLUMN return_date DATE NULL;' },
      { name: 'return_time_slot', query: 'ALTER TABLE borrows ADD COLUMN return_time_slot VARCHAR(30) NULL;' },
      { name: 'branch_id', query: 'ALTER TABLE borrows ADD COLUMN branch_id INT NULL;' }
    ];

    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        console.log(`Adding column: ${col.name}`);
        await sequelize.query(col.query);
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate()
