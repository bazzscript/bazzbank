import Sequelize from 'sequelize';
import sequelize from '../configs/database.config';
import Withdrawal from './withdrawal.model';
import Deposit from './deposit.model';
import Transfer from './transfer.model';

const Transaction = sequelize.define('transaction', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    amount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    type: {
        type: Sequelize.ENUM('transfer', 'withdrawal', 'deposit'),
        allowNull: false
    },

    trsf: {
        type: Sequelize.STRING,
        allowNull: false
    },

    status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        allowNull: false
    },

    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
}, {});


// Relationships
// Transaction Has One Withdrawal
Transaction.hasOne(Withdrawal);
// Transaction Has One Deposit
Transaction.hasOne(Deposit);
// Transaction Has One Transfer
Transaction.hasOne(Transfer);

// Export Model
export default Transaction;