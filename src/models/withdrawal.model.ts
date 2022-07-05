import Sequelize from 'sequelize';
import sequelize from '../configs/database.config';


const Withdrawal = sequelize.define('withdrawal', {
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
    type: {
        type: Sequelize.ENUM('atm_withdrawal', 'bank_withdrawal'),
        allowNull: false
    },

}, {});

// Relationships

// Export Model
export default Withdrawal;