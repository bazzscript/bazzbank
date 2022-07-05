import Sequelize from 'sequelize';
import sequelize from '../configs/database.config';
import Transaction from './transaction.model';
import User from './user.model';

const Wallet = sequelize.define('wallet', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    withdrawable_balance: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        // allowNull: false
    },
}, {});

// Relationships
// A wallet belongs to a user
// Wallet.belongsTo(User);
// A Wallet Has Multiple Transactions
Wallet.hasMany(Transaction);






// Export Model
export default Wallet;