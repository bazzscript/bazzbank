import Sequelize from 'sequelize';
import sequelize from '../configs/database.config';

const Transfer = sequelize.define('transfer', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },

fees:{
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: true
},

destination_account: {
    type: Sequelize.STRING,
    allowNull: false
},

destination_bank: {
    type: Sequelize.STRING,
    allowNull: false
},

source_account: {
    type: Sequelize.STRING,
    allowNull: false
},

source_bank: {
    type: Sequelize.STRING,
    allowNull: false
}

}, {});


// Relationships

// Export Model
export default Transfer;